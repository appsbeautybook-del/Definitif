import { supabaseAdmin } from '../config/supabase.js';

// POST /api/commandes
export const createCommande = async (req, res) => {
  try {
    const user = req.user;
    const { items, shipping_address, payment_method, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide' });
    }

    const { data: userProfile } = await supabaseAdmin
      .from('profiles').select('*').eq('id', user.id).single();

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = Math.round((subtotal + shipping) * 100) / 100;

    const { data: commande, error: commandeErr } = await supabaseAdmin
      .from('Commande').insert({
        client_email: userProfile?.email || user.email,
        client_name: userProfile?.full_name || user.email,
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping,
        total,
        status: 'en_attente',
        shipping_address,
        payment_method,
        notes,
      }).select().single();

    if (commandeErr) return res.status(500).json({ error: commandeErr.message });

    // Clear panier
    const { data: paniers } = await supabaseAdmin
      .from('Panier').select('id').eq('user_email', userProfile?.email);
    for (const p of (paniers || [])) {
      await supabaseAdmin.from('Panier').update({ items: [], total: 0 }).eq('id', p.id);
    }

    // Notification
    await supabaseAdmin.from('Notification').insert({
      user_email: userProfile?.email,
      type: 'commande',
      title: 'Commande confirmée 🛍️',
      body: `Votre commande de ${total.toFixed(2)}€ a bien été reçue.`,
      link: '/mes-commandes',
      read: false,
    });

    return res.status(201).json({ commande, success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/commandes/list
export const getCommandes = async (req, res) => {
  try {
    const user = req.user;
    const { commandeId } = req.body || {};

    const { data: userProfile } = await supabaseAdmin
      .from('profiles').select('email').eq('id', user.id).single();

    if (commandeId) {
      const { data: commande } = await supabaseAdmin
        .from('Commande').select('*').eq('id', commandeId).single();
      return res.json({ commande });
    }

    const { data: commandes, error } = await supabaseAdmin
      .from('Commande').select('*')
      .eq('client_email', userProfile?.email)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ commandes: commandes || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/commandes/track
export const trackOrder = async (req, res) => {
  try {
    const { orderNumber, email } = req.body;
    if (!orderNumber) return res.status(400).json({ error: 'Numéro de commande requis' });

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
    const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      return res.status(500).json({ error: 'Configuration Shopify manquante' });
    }

    const cleanOrderNumber = orderNumber.replace(/^#/, '');

    const query = `{
      orders(query: "name:#${cleanOrderNumber}${email ? ` AND email:${email}` : ''}") {
        edges {
          node {
            id name orderNumber: orderNumber processedAt financialStatus fulfillmentStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            lineItems(first: 10) {
              edges { node { title quantity originalUnitPriceSet { shopMoney { amount } } variant { image { url } } } }
            }
            fulfillments(first: 1) { trackingInfo(first: 1) { number url } }
          }
        }
      }
    }`;

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const edges = data?.data?.orders?.edges || [];

    if (edges.length === 0) return res.json({ order: null });

    const node = edges[0].node;
    const tracking = node.fulfillments?.[0]?.trackingInfo?.[0];

    const order = {
      id: node.id,
      order_number: node.name,
      created_at: node.processedAt,
      financial_status: node.financialStatus?.toLowerCase() || 'pending',
      fulfillment_status: node.fulfillmentStatus?.toLowerCase() || null,
      total_price: node.totalPriceSet?.shopMoney?.amount || '0',
      tracking_number: tracking?.number || null,
      tracking_url: tracking?.url || null,
      line_items: (node.lineItems?.edges || []).map(e => ({
        name: e.node.title, quantity: e.node.quantity,
        price: e.node.originalUnitPriceSet?.shopMoney?.amount || '0',
        image: e.node.variant?.image?.url || null,
      })),
    };

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
