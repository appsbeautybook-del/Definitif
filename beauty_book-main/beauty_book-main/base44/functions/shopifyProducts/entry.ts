Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = body.productId || null;

    const token = Deno.env.get("SHOPIFY_STOREFRONT_TOKEN");
    const rawDomain = Deno.env.get("SHOPIFY_DOMAIN") || "";
    // Normaliser le domaine : ajouter .myshopify.com si manquant
    const domain = rawDomain.includes(".") ? rawDomain : `${rawDomain}.myshopify.com`;



    if (!token || !domain) {
      return Response.json({ error: "SHOPIFY_STOREFRONT_TOKEN ou SHOPIFY_DOMAIN non configuré" }, { status: 500 });
    }

    const query = productId ? `
      {
        product(id: "${productId}") {
          id
          title
          vendor
          descriptionHtml
          description
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount }
          }
          images(first: 10) {
            edges { node { url altText } }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                compareAtPrice { amount }
                availableForSale
                selectedOptions { name value }
                image { url }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    ` : `
      {
        products(first: 250) {
          edges {
            node {
              id
              title
              vendor
              tags
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              compareAtPriceRange {
                minVariantPrice { amount }
              }
              images(first: 3) {
                edges { node { url } }
              }
            }
          }
        }
      }
    `;

    const url = `https://${domain}/api/2024-10/graphql.json`;


    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query }),
    });

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return Response.json({ error: "Réponse JSON invalide", status: response.status, body: rawText.slice(0, 500) }, { status: 400 });
    }

    if (data.errors) {
      return Response.json({ error: data.errors[0].message, errors: data.errors }, { status: 400 });
    }

    if (!data.data) {
      return Response.json({ error: "Aucune donnée dans la réponse", raw: rawText.slice(0, 500) }, { status: 400 });
    }

    // Single product response
    if (productId) {
      const node = data.data.product;
      if (!node) return Response.json({ error: "Produit introuvable" }, { status: 404 });

      const price = parseFloat(node.priceRange.minVariantPrice.amount);
      const oldPrice = parseFloat(node.compareAtPriceRange?.minVariantPrice?.amount || 0);
      const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;
      const currency = node.priceRange.minVariantPrice.currencyCode;

      const product = {
        id: node.id,
        title: node.title,
        vendor: node.vendor,
        description: node.description,
        descriptionHtml: node.descriptionHtml,
        tags: node.tags,
        price: Math.round(price),
        oldPrice: oldPrice > price ? Math.round(oldPrice) : null,
        discount: discount ? `-${discount}%` : null,
        currency,
        images: node.images.edges.map(e => ({ url: e.node.url, alt: e.node.altText })),
        variants: node.variants.edges.map(e => ({
          id: e.node.id,
          title: e.node.title,
          price: Math.round(parseFloat(e.node.price.amount)),
          compareAtPrice: e.node.compareAtPrice ? Math.round(parseFloat(e.node.compareAtPrice.amount)) : null,
          availableForSale: e.node.availableForSale,
          options: e.node.selectedOptions,
          image: e.node.image ? { url: e.node.image.url } : null,
        })),
        options: node.options,
      };

      return Response.json({ product });
    }

    // Product list response — normalized with source: "shopify"
    const products = data.data.products.edges.map(({ node }) => {
      const price = parseFloat(node.priceRange.minVariantPrice.amount);
      const oldPrice = parseFloat(node.compareAtPriceRange?.minVariantPrice?.amount || 0);
      const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;
      const images = node.images.edges.map(e => e.node.url);
      const tags = node.tags || [];

      // Déduire la catégorie depuis les tags ou le type de produit
      let category = node.productType || "";
      if (!category) {
        const tagLower = tags.map(t => t.toLowerCase());
        if (tagLower.some(t => t.includes("homme") || t.includes("man") || t.includes("men"))) category = "Vêtement Homme";
        else if (tagLower.some(t => t.includes("femme") || t.includes("woman") || t.includes("women"))) category = "Vêtement Femme";
        else if (tagLower.some(t => t.includes("enfant") || t.includes("kid") || t.includes("bebe") || t.includes("bébé"))) category = "Enfant";
        else if (tagLower.some(t => t.includes("beaute") || t.includes("beauté") || t.includes("soin") || t.includes("cosmet"))) category = "Beauté";
        else if (tagLower.some(t => t.includes("chaussure") || t.includes("shoe"))) category = "Chaussures";
        else if (tagLower.some(t => t.includes("accessoire"))) category = "Accessoires";
        else if (tagLower.some(t => t.includes("appareil") || t.includes("device") || t.includes("outil"))) category = "Appareils";
        else if (node.vendor) category = node.vendor;
      }

      return {
        id: node.id,
        img: images[0] || "",
        images,
        brand: node.vendor || category || "",
        name: node.title,
        price: Math.round(price),
        oldPrice: oldPrice > price ? Math.round(oldPrice) : null,
        badge: discount ? `-${discount}%` : null,
        tags,
        category,
        source: "shopify",
        external_url: null,
      };
    });

    console.log(`[INFO] Returned ${products.length} Shopify products`);
    return Response.json({ products });
  } catch (error) {
    console.error("[ERROR] shopifyProducts:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});