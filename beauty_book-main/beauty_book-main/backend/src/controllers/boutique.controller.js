import { supabaseAdmin } from '../config/supabase.js';
import { submitFalModel } from '../services/fal.js';

/**
 * POST /api/v8/boutique/try-on
 * Essayage virtuel via fal.ai — cascade de modèles :
 * 1. Kolors Virtual Try-On (meilleur résultat)
 * 2. IDM-VTON (fallback)
 * 3. Flux-pro (dernier recours)
 */
export const shAiTryOn = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { user_photo, garment_photo, garment_name, mode, outfit_pieces } = req.body;

    if (!user_photo || !garment_photo) {
      return res.status(400).json({ error: 'user_photo et garment_photo requis' });
    }

    const garmentDesc = garment_name || 'vêtement';
    console.log('[ShAI] Virtual try-on:', garmentDesc, '| mode:', mode || 'article');

    // 1️⃣ Kolors Virtual Try-On (meilleur pour l'essayage)
    try {
      const result = await submitFalModel('fal-ai/kolors-virtual-try-on', {
        person_image: user_photo,
        garment_image: garment_photo,
      });
      const resultUrl = result?.image?.url || result?.images?.[0]?.url || result?.output?.url;
      if (resultUrl) {
        console.log('[ShAI] ✅ Kolors try-on success');
        return res.json({ result_url: resultUrl, demo_mode: false });
      }
    } catch (e) {
      console.warn('[ShAI] ⚠️ Kolors failed:', e.message);
    }

    // 2️⃣ IDM-VTON (fallback)
    try {
      const result = await submitFalModel('fal-ai/idm-vton', {
        person_image: user_photo,
        garment_image: garment_photo,
      });
      const resultUrl = result?.image?.url || result?.images?.[0]?.url || result?.output?.url;
      if (resultUrl) {
        console.log('[ShAI] ✅ IDM-VTON try-on success');
        return res.json({ result_url: resultUrl, demo_mode: false });
      }
    } catch (e) {
      console.warn('[ShAI] ⚠️ IDM-VTON failed:', e.message);
    }

    // 3️⃣ Flux-pro (dernier recours)
    try {
      const prompt = mode === 'outfit'
        ? `A person wearing a complete outfit. Realistic fashion photo, well-lit, natural pose.`
        : `A person wearing ${garmentDesc}. Realistic fashion try-on photo, well-lit, natural pose.`;
      const result = await submitFalModel('fal-ai/flux-pro/v1.1', {
        prompt,
        image_url: user_photo,
        strength: 0.75,
      });
      const resultUrl = result?.image?.url || result?.images?.[0]?.url;
      if (resultUrl) {
        console.log('[ShAI] ✅ Flux-pro fallback success');
        return res.json({ result_url: resultUrl, demo_mode: true });
      }
    } catch (e) {
      console.warn('[ShAI] ⚠️ Flux-pro also failed:', e.message);
    }

    // Fallback total : retourner la photo du vêtement
    return res.json({
      result_url: garment_photo,
      demo_mode: true,
      message: 'Essayage en mode démonstration (génération IA indisponible)',
    });
  } catch (error) {
    console.error('[ShAI] shAiTryOn error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Shopify Checkout
export const createShopifyCheckout = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
    const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      return res.status(500).json({ error: 'Configuration Shopify manquante' });
    }

    const { variantId, quantity = 1, firstName, lastName, email, address1, address2 = '', city, zip, country = 'FR', phone } = req.body;
    if (!variantId) return res.status(400).json({ error: 'variantId requis' });

    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
            lines(first: 10) {
              edges {
                node {
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id title
                      price { amount }
                      image { url }
                    }
                  }
                }
              }
            }
          }
          userErrors { field message }
        }
      }
    `;

    const buyerIdentity = {};
    if (email) buyerIdentity.email = email;
    if (phone) buyerIdentity.phone = phone;

    const attributes = [];
    if (firstName) attributes.push({ key: 'Prénom', value: firstName });
    if (lastName) attributes.push({ key: 'Nom', value: lastName });
    if (address1) attributes.push({ key: 'Adresse', value: address1 });
    if (address2) attributes.push({ key: 'Complément', value: address2 });
    if (city) attributes.push({ key: 'Ville', value: city });
    if (zip) attributes.push({ key: 'Code postal', value: zip });
    if (country) attributes.push({ key: 'Pays', value: country });

    const input = {
      lines: [{ merchandiseId: variantId, quantity: parseInt(quantity) }],
      buyerIdentity: Object.keys(buyerIdentity).length > 0 ? buyerIdentity : undefined,
      attributes: attributes.length > 0 ? attributes : undefined,
    };

    const shopifyDomain = SHOPIFY_DOMAIN.includes('.') ? SHOPIFY_DOMAIN : `${SHOPIFY_DOMAIN}.myshopify.com`;
    const response = await fetch(`https://${shopifyDomain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query: mutation, variables: { input } }),
    });

    const data = await response.json();

    if (data.errors) return res.status(400).json({ error: data.errors[0].message });

    const result = data.data?.cartCreate;
    if (result?.userErrors?.length > 0) return res.status(400).json({ error: result.userErrors[0].message });

    const cart = result?.cart;
    if (!cart) return res.status(500).json({ error: 'Impossible de créer le panier' });

    return res.json({
      checkoutId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      total: cart.cost?.totalAmount?.amount,
      subtotal: cart.cost?.subtotalAmount?.amount,
      currency: cart.cost?.totalAmount?.currencyCode,
      lineItems: cart.lines.edges.map(e => ({
        title: e.node.merchandise?.title,
        quantity: e.node.quantity,
        price: e.node.merchandise?.price?.amount,
        image: e.node.merchandise?.image?.url,
      })),
    });
  } catch (error) {
    console.error('createShopifyCheckout error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Track Shopify Order
export const trackOrder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
    const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      return res.status(500).json({ error: 'Configuration Shopify manquante' });
    }

    const { orderNumber, email } = req.body;
    if (!orderNumber) return res.status(400).json({ error: 'Numéro de commande requis' });

    const cleanOrderNumber = orderNumber.replace(/^#/, '');
    const query = `{
      orders(query: "name:#${cleanOrderNumber}${email ? ` AND email:${email}` : ''}") {
        edges {
          node {
            id name
            processedAt financialStatus fulfillmentStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            lineItems(first: 10) {
              edges {
                node {
                  title quantity
                  originalUnitPriceSet { shopMoney { amount } }
                  variant { image { url } }
                }
              }
            }
            fulfillments(first: 1) {
              trackingInfo(first: 1) { number url }
            }
          }
        }
      }
    }`;

    const shopifyDomain = SHOPIFY_DOMAIN.includes('.') ? SHOPIFY_DOMAIN : `${SHOPIFY_DOMAIN}.myshopify.com`;
    const response = await fetch(`https://${shopifyDomain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const edges = data?.data?.orders?.edges || [];

    if (edges.length === 0) return res.json({ order: null });

    const node = edges[0].node;
    const tracking = node.fulfillments?.[0]?.trackingInfo?.[0];

    return res.json({
      order: {
        id: node.id,
        order_number: node.name,
        created_at: node.processedAt,
        financial_status: node.financialStatus?.toLowerCase() || 'pending',
        fulfillment_status: node.fulfillmentStatus?.toLowerCase() || null,
        total_price: node.totalPriceSet?.shopMoney?.amount || '0',
        tracking_number: tracking?.number || null,
        tracking_url: tracking?.url || null,
        line_items: (node.lineItems?.edges || []).map(e => ({
          name: e.node.title,
          quantity: e.node.quantity,
          price: e.node.originalUnitPriceSet?.shopMoney?.amount || '0',
          image: e.node.variant?.image?.url || null,
        })),
      }
    });
  } catch (error) {
    console.error('trackOrder error:', error);
    return res.status(500).json({ error: error.message });
  }
};
