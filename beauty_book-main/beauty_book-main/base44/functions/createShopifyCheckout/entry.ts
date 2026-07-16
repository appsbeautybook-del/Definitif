import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const SHOPIFY_DOMAIN = Deno.env.get("SHOPIFY_DOMAIN");
    const SHOPIFY_TOKEN = Deno.env.get("SHOPIFY_STOREFRONT_TOKEN");

    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      return Response.json({ error: "Configuration Shopify manquante" }, { status: 500 });
    }

    // Auth check
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { variantId, quantity = 1, firstName, lastName, email, address1, address2 = "", city, zip, country = "FR", phone } = body;

    if (!variantId) {
      return Response.json({ error: "variantId requis" }, { status: 400 });
    }

    // Create a cart via Storefront API (Cart API - modern replacement for checkoutCreate)
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
                      id
                      title
                      price { amount }
                      image { url }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Build input - use note/attributes to pass shipping info
    // buyerIdentity only supports email + phone in Storefront API
    const buyerIdentity = {};
    if (email) buyerIdentity.email = email;
    if (phone) buyerIdentity.phone = phone;

    // Pass address as cart attributes so it's visible on checkout page
    const attributes = [];
    if (firstName) attributes.push({ key: "Prénom", value: firstName });
    if (lastName) attributes.push({ key: "Nom", value: lastName });
    if (address1) attributes.push({ key: "Adresse", value: address1 });
    if (address2) attributes.push({ key: "Complément", value: address2 });
    if (city) attributes.push({ key: "Ville", value: city });
    if (zip) attributes.push({ key: "Code postal", value: zip });
    if (country) attributes.push({ key: "Pays", value: country });

    const input = {
      lines: [{ merchandiseId: variantId, quantity: parseInt(quantity) }],
      buyerIdentity: Object.keys(buyerIdentity).length > 0 ? buyerIdentity : undefined,
      attributes: attributes.length > 0 ? attributes : undefined,
    };

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query: mutation, variables: { input } }),
    });

    const data = await response.json();
    console.log("[DEBUG] Shopify cart response:", JSON.stringify(data).slice(0, 600));

    if (data.errors) {
      return Response.json({ error: data.errors[0].message }, { status: 400 });
    }

    const result = data.data?.cartCreate;
    if (result?.userErrors?.length > 0) {
      return Response.json({ error: result.userErrors[0].message }, { status: 400 });
    }

    const cart = result?.cart;
    if (!cart) {
      return Response.json({ error: "Impossible de créer le panier" }, { status: 500 });
    }

    return Response.json({
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
    console.error("[ERROR]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});