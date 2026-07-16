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

    const { orderNumber, email } = await req.json();

    if (!orderNumber) {
      return Response.json({ error: "Numéro de commande requis" }, { status: 400 });
    }

    // Normalize: remove # if present
    const cleanOrderNumber = orderNumber.replace(/^#/, "");

    // Search order via Storefront API (customer order lookup)
    // We use the Admin API proxy via storefront for order status
    const query = `{
      orders(query: "name:#${cleanOrderNumber}${email ? ` AND email:${email}` : ""}") {
        edges {
          node {
            id
            name
            orderNumber: orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPriceSet { shopMoney { amount } }
                  variant {
                    image { url }
                  }
                }
              }
            }
            fulfillments(first: 1) {
              trackingInfo(first: 1) {
                number
                url
              }
            }
          }
        }
      }
    }`;

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log("[DEBUG] Shopify response status:", response.status);

    const edges = data?.data?.orders?.edges || [];

    if (edges.length === 0) {
      return Response.json({ order: null });
    }

    const node = edges[0].node;
    const tracking = node.fulfillments?.[0]?.trackingInfo?.[0];

    const order = {
      id: node.id,
      order_number: node.name,
      created_at: node.processedAt,
      financial_status: node.financialStatus?.toLowerCase() || "pending",
      fulfillment_status: node.fulfillmentStatus?.toLowerCase() || null,
      total_price: node.totalPriceSet?.shopMoney?.amount || "0",
      tracking_number: tracking?.number || null,
      tracking_url: tracking?.url || null,
      line_items: (node.lineItems?.edges || []).map(e => ({
        name: e.node.title,
        quantity: e.node.quantity,
        price: e.node.originalUnitPriceSet?.shopMoney?.amount || "0",
        image: e.node.variant?.image?.url || null,
      })),
    };

    return Response.json({ order });
  } catch (error) {
    console.error("[ERROR]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});