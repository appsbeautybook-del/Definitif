import { fetchShopifyProducts } from "@/api/shopifyClient";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import {
  ArrowLeft, Share2, Heart, ShoppingCart, Star, ChevronRight,
  Truck, Shield, RotateCcw, ChevronDown, ChevronUp, Check, ZoomIn, CreditCard, Lock, X, Wand2
} from "lucide-react";
import { useCartSync } from "@/hooks/useCartSync";
import { useLikedProducts } from "@/hooks/useLikedProducts";


// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images, focusIdx = 0 }) {
  const [activeIdx, setActiveIdx] = useState(focusIdx);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(null);

  // Synchroniser avec la variante sélectionnée depuis l'extérieur
  useEffect(() => {
    setActiveIdx(focusIdx);
  }, [focusIdx]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50 && activeIdx < images.length - 1) setActiveIdx(i => i + 1);
    if (diff < -50 && activeIdx > 0) setActiveIdx(i => i - 1);
    touchStartX.current = null;
  };

  return (
    <div className="relative bg-gray-50">
      <div className="relative aspect-[3/4] overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={() => setZoomed(true)}>
        <img src={images[activeIdx]?.url || images[activeIdx] || "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600"} alt="" className="w-full h-full object-cover transition-opacity duration-200" />
        <button className="absolute bottom-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow">
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
        <div className="absolute bottom-3 left-3 bg-black/50 rounded-full px-2.5 py-1">
          <span className="text-white text-[11px] font-bold">{activeIdx + 1}/{images.length}</span>
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto hide-scrollbar">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeIdx ? "border-primary" : "border-transparent"}`}>
              <img src={img.url || img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {zoomed && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => setZoomed(false)}>
          <img src={images[activeIdx]?.url || images[activeIdx]} alt="" className="w-full h-full object-contain" />
          <button className="absolute top-5 right-5 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

function ExpandableSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4">
        <span className="text-[14px] font-black text-gray-900 uppercase tracking-wide">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="pb-4 text-[13px] text-gray-600 leading-relaxed">{children}</div>}
    </div>
  );
}

// ── Checkout Modal (produits BDD sans Shopify) ────────────────────────────────
function CheckoutModal({ product, onClose }) {
  const [step, setStep] = useState("form"); // "form" | "processing" | "success"
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", zip: "", card: "", expiry: "", cvv: "" });
  const [qty, setQty] = useState(1);
  const [paying, setPaying] = useState(false);

  const total = (product.price * qty).toFixed(2);

  const handlePay = async () => {
    if (!form.name || !form.email || !form.card) return;
    setPaying(true);
    setStep("processing");
    // Créer la session Stripe via backend
    const res = await /* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))("createCheckoutSession", {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: qty,
      customer_email: form.email,
      customer_name: form.name,
      shipping_address: `${form.address}, ${form.zip} ${form.city}`,
      vendor_email: product.created_by || "",
    }).catch(() => null);

    if (res?.data?.url) {
      // Vérifier si dans iframe
      if (window.self !== window.top) {
        setPaying(false);
        setStep("form");
        alert("Le paiement n'est disponible que depuis l'application publiée.");
        return;
      }
      window.location.href = res.data.url;
    } else {
      // Fallback : créer la commande directement
      await entities.Commande.create({
        client_email: form.email,
        client_name: form.name,
        items: [{ produit_id: product.id, name: product.name, price: product.price, quantity: qty, image_url: product.image_url }],
        subtotal: product.price * qty,
        shipping: 0,
        total: product.price * qty,
        shipping_address: `${form.address}, ${form.zip} ${form.city}`,
        payment_method: "stripe",
        status: "en_attente",
      }).catch(() => {});
      setStep("success");
    }
    setPaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center font-display">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-[17px] font-black text-gray-900">Paiement sécurisé</h2>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {step === "success" ? (
          <div className="flex flex-col items-center py-12 px-6 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-[20px] font-black text-gray-900 text-center">Commande confirmée !</h3>
            <p className="text-[13px] text-gray-500 text-center">Vous recevrez un email de confirmation à <strong>{form.email}</strong>.</p>
            <button onClick={onClose} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-[14px] mt-2">Fermer</button>
          </div>
        ) : step === "processing" ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] font-black text-gray-700">Traitement du paiement...</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5">
            {/* Résumé produit */}
            <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3 border border-orange-100">
              <img src={product.image_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1">
                <p className="text-[13px] font-black text-gray-900 line-clamp-2">{product.name}</p>
                <p className="text-[16px] font-black text-primary mt-0.5">{product.price}€ / unité</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-600 font-black">−</button>
                <span className="text-[14px] font-black text-gray-900 w-5 text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-black">+</button>
              </div>
            </div>

            {/* Infos client */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vos informations</p>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom complet *" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Adresse de livraison" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="Code postal" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Ville" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
              </div>
            </div>

            {/* Sécurité */}
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <Lock className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-[11px] font-bold text-green-700">Paiement sécurisé via Stripe · SSL 256-bit</p>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Total ({qty} article{qty > 1 ? "s" : ""})</p>
                <p className="text-[22px] font-black text-gray-900">{total}€</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-medium">Livraison</p>
                <p className="text-[13px] font-black text-green-600">Gratuite</p>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={paying || !form.name || !form.email}
              className="w-full bg-primary text-white font-black text-[15px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
            >
              <CreditCard className="w-5 h-5" /> Payer {total}€
            </button>
            <p className="text-center text-[10px] text-gray-400 font-medium">
              Le paiement transite par BeautyBook et sera reversé au vendeur
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Produits recommandés ──────────────────────────────────────────────────────
function RecommendedProducts({ currentProductId, currentCategory, title = "Recommandé pour vous" }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let dead = false;
    const cat = (currentCategory || "").toLowerCase();

    (async () => {
      const shopifyProds = [];
      const vendeurProds = [];

      // 1) Shopify Storefront API — fetch direct
      try {
        const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || 'hwqnwb-hi.myshopify.com';
        const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '46a6de1eb3a2686abcae91039944762d';
        const r = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN },
          body: JSON.stringify({
            query: `{
              products(first: 50, sortKey: BEST_SELLING) {
                edges { node {
                  id title handle vendor productType
                  images(first: 1) { edges { node { url } } }
                  variants(first: 1) { edges { node {
                    id price { amount } availableForSale
                    selectedOptions { name value }
                    image { url }
                  } } }
                } }
              }
            }`
          })
        });
        const json = await r.json();
        const edges = json.data?.products?.edges || [];
        for (const { node } of edges) {
          if (node.id === currentProductId) continue;
          const v = node.variants?.edges?.[0]?.node;
          const img = node.images?.edges?.[0]?.node;
          shopifyProds.push({
            id: node.id,
            img: img?.url || '',
            name: node.title,
            brand: node.vendor || '',
            price: parseFloat(v?.price?.amount || '0'),
            category: (node.productType || '').toLowerCase(),
            _shopify: true,
          });
        }
      } catch (e) { console.error("[Recos] Shopify fetch error:", e); }

      // 2) Produits vendeurs — direct Supabase
      try {
        const { data } = await supabase.from('Produit').select('*').eq('status', 'actif').order('created_at', { ascending: false }).limit(50);
        for (const p of (data || [])) {
          if (p.id === currentProductId) continue;
          vendeurProds.push({
            id: p.id,
            img: p.image_url || '',
            name: p.name || '',
            brand: p.brand || '',
            price: parseFloat(p.price || 0),
            category: (p.category || '').toLowerCase(),
            _shopify: false,
          });
        }
      } catch (e) { console.error("[Recos] DB fetch error:", e); }

      if (dead) return;

      // 3) Fusion : Shopify d'abord, puis vendeurs
      const all = [...shopifyProds, ...vendeurProds];

      // 4) Tri : même catégorie d'abord
      if (cat) {
        all.sort((a, b) => {
          const am = a.category.includes(cat) || cat.includes(a.category) ? 1 : 0;
          const bm = b.category.includes(cat) || cat.includes(b.category) ? 1 : 0;
          return bm - am;
        });
      }

      setProducts(all.slice(0, 8));
    })();

    return () => { dead = true; };
  }, [currentProductId, currentCategory]);

  if (products.length === 0) return null;

  return (
    <div className="px-4 py-5">
      <h2 className="text-[15px] font-black text-gray-900 uppercase tracking-tight mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map(p => (
          <div key={p.id} onClick={() => navigate(`/produit?id=${encodeURIComponent(p.id)}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-all">
            <div className="aspect-square overflow-hidden bg-gray-50">
              <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-[10px] font-black text-primary uppercase tracking-wider truncate">{p.brand}</p>
              <p className="text-[12px] font-bold text-gray-900 leading-tight line-clamp-2">{p.name}</p>
              <p className="text-[14px] font-black text-gray-900 mt-1">{p.price.toFixed(2)} €</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Color map ─────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blanc: "#fff", white: "#fff", beige: "#F5F0E8", crème: "#FFFDD0", creme: "#FFFDD0",
  noir: "#111", black: "#111", gris: "#888", grey: "#888", gray: "#888",
  rouge: "#E53E3E", red: "#E53E3E", rose: "#EC4899", pink: "#EC4899", fushia: "#D946EF",
  orange: "#F97316", jaune: "#FBBF24", yellow: "#FBBF24", gold: "#D4AF37", doré: "#D4AF37",
  dore: "#D4AF37", vert: "#22C55E", green: "#22C55E", kaki: "#6B7C45", olive: "#6B7C45",
  bleu: "#3B82F6", blue: "#3B82F6", marine: "#1E3A5F", navy: "#1E3A5F", turquoise: "#06B6D4",
  violet: "#8B5CF6", purple: "#8B5CF6", mauve: "#A78BFA", marron: "#92400E", brown: "#92400E",
  caramel: "#B45309", bordeaux: "#7F1D1D", argent: "#CBD5E1", silver: "#CBD5E1",
};

function getColorHex(name) {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  // Try partial match
  for (const [k, v] of Object.entries(COLOR_MAP)) {
    if (key.includes(k)) return v;
  }
  return null;
}

// ── Variant Selector ─────────────────────────────────────────────────────────
function VariantSelector({ options, variants, selectedOptions, onChange }) {
  if (!options || options.length === 0) return null;
  // Hide "Title" pseudo-option (Shopify default when no variants)
  const realOptions = options.filter(o => o.name !== "Title");
  if (realOptions.length === 0) return null;

  const isValueAvailable = (optionName, value) => {
    // Build hypothetical selected options with this value
    const testOptions = { ...selectedOptions, [optionName]: value };
    return variants.some(v =>
      v.availableForSale &&
      Object.entries(testOptions).every(([name, val]) =>
        v.options.some(o => o.name === name && o.value === val)
      )
    );
  };

  return (
    <div className="space-y-4 mb-4">
      {realOptions.map(option => {
        const isColor = option.name.toLowerCase().includes("couleur") || option.name.toLowerCase().includes("color");
        const selectedValue = selectedOptions[option.name];

        return (
          <div key={option.name}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[12px] font-black text-gray-900 uppercase tracking-wider">{option.name}</p>
              {selectedValue && (
                <p className="text-[12px] font-bold text-gray-500">— {selectedValue}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {option.values.map(value => {
                const available = isValueAvailable(option.name, value);
                const selected = selectedValue === value;
                const colorHex = isColor ? getColorHex(value) : null;

                if (isColor && colorHex) {
                  return (
                    <button
                      key={value}
                      disabled={!available}
                      onClick={() => onChange(option.name, value)}
                      title={value}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all active:scale-90 ${selected ? "border-primary shadow-md scale-110" : "border-gray-200"} ${!available ? "opacity-30" : ""}`}
                      style={{ backgroundColor: colorHex }}
                    >
                      {selected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className={`w-3.5 h-3.5 ${colorHex === '#fff' || colorHex === '#F5F0E8' || colorHex === '#FFFDD0' || colorHex === '#F5F5DC' ? 'text-gray-800' : 'text-white'}`} strokeWidth={3} />
                        </span>
                      )}
                      {!available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-gray-400 rotate-45 absolute" />
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={value}
                    disabled={!available}
                    onClick={() => onChange(option.name, value)}
                    className={`px-3.5 py-2 rounded-xl border-2 text-[12px] font-black transition-all active:scale-95 ${
                      selected ? "border-primary bg-primary text-white shadow-sm shadow-primary/30" :
                      available ? "border-gray-200 text-gray-700 bg-white" :
                      "border-gray-100 text-gray-300 bg-gray-50 line-through"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProduitDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [isDbProduct, setIsDbProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const { toggle: toggleLike, isLiked } = useLikedProducts();
  const [addedToCart, setAddedToCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { addToCart } = useCartSync();

  useEffect(() => {
    if (!productId) { setError("Produit introuvable"); setLoading(false); return; }

    // Reset state when product changes
    setProduct(null);
    setError(null);
    setLoading(true);
    setSelectedOptions({});
    setAddedToCart(false);
    setShowCheckout(false);

    // Shopify product IDs start with "gid://shopify/"
    const isShopifyId = productId.startsWith("gid://shopify/");

    const loadShopifyProduct = (pid) => {
      fetchShopifyProducts({ productId: pid })
        .then(res => {
          const p = res.data.product;
          if (!p) { setError("Produit introuvable"); setLoading(false); return; }
          setProduct(p);
          const firstVariant = p?.variants?.find(v => v.availableForSale) || p?.variants?.[0];
          if (firstVariant?.options) {
            const initOpts = {};
            firstVariant.options.forEach(o => { initOpts[o.name] = o.value; });
            setSelectedOptions(initOpts);
          }
          setIsDbProduct(false);
          setLoading(false);
        })
        .catch(err => { setError(err.message); setLoading(false); });
    };

    // Si ID Shopify → aller directement sur Shopify (pas de BDD)
    if (isShopifyId) {
      loadShopifyProduct(productId);
      return;
    }

    // Sinon → chercher dans la BDD direct Supabase
    supabase.from('Produit').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => (data || []).find(p => p.id === productId)).then(dbProduct => {
        if (dbProduct && !dbProduct.external_url) {
          const images = [dbProduct.image_url, ...(dbProduct.images || [])].filter(Boolean);
          setProduct({
            id: dbProduct.id,
            title: dbProduct.name,
            name: dbProduct.name,
            vendor: dbProduct.brand || "BeautyBook",
            price: dbProduct.price,
            oldPrice: dbProduct.old_price || null,
            description: dbProduct.description || "",
            images: images.map(url => ({ url })),
            image_url: dbProduct.image_url,
            tags: dbProduct.tags || [],
            stock: dbProduct.stock,
            category: dbProduct.category,
            created_by: dbProduct.created_by,
          });
          setIsDbProduct(true);
          setLoading(false);
        } else {
          loadShopifyProduct(productId);
        }
      })
      .catch(() => {
        loadShopifyProduct(productId);
      });
  }, [productId]);

  // Derive the selected variant from selectedOptions
  const selectedVariant = product && !isDbProduct
    ? product.variants?.find(v =>
        Object.entries(selectedOptions).every(([name, val]) =>
          v.options.some(o => o.name === name && o.value === val)
        )
      ) || product.variants?.[0]
    : null;

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleBuyNow = () => {
    if (isDbProduct) {
      setShowCheckout(true);
      return;
    }
    const variantId = selectedVariant?.id;
    if (!variantId) return;
    const params = new URLSearchParams({
      variantId, title: product.title,
      img: product.images?.[0]?.url || "",
      price: String(displayPrice),
      brand: product.vendor || "",
      variant: selectedVariant?.title || "",
    });
    navigate(`/checkout?${params.toString()}`);
  };

  const handleAddToCart = async () => {
    const img = variantImageUrl || galleryImages[0]?.url || product.image_url || "";
    await addToCart({
      id: selectedVariant?.id || product.id || productId,
      name: product.title || product.name,
      price: displayPrice,
      img,
      brand: product.vendor || "",
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse" />
          <div className="flex-1 h-5 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-100 rounded-full animate-pulse w-1/3" />
          <div className="h-6 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-6 bg-gray-100 rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-400 font-medium">Produit introuvable</p>
        <button onClick={() => navigate(-1)} className="text-primary font-black text-[14px]">← Retour</button>
      </div>
    );
  }

  const displayPrice = isDbProduct ? product.price : (selectedVariant?.price ?? product.price);
  const displayOldPrice = isDbProduct ? product.oldPrice : (selectedVariant?.compareAtPrice || product.oldPrice);
  const discount = displayOldPrice && displayOldPrice > displayPrice ? Math.round((1 - displayPrice / displayOldPrice) * 100) : null;
  const variantAvailable = isDbProduct ? (product.stock > 0) : (selectedVariant?.availableForSale !== false);

  // Galerie synchronisée avec la variante sélectionnée
  const galleryImages = product.images?.length > 0 ? product.images : [{ url: product.image_url || "" }];
  const variantImageUrl = selectedVariant?.image?.url || null;
  const variantImageIdx = variantImageUrl
    ? galleryImages.findIndex(img => (img.url || img) === variantImageUrl)
    : -1;
  // Si l'image de la variante n'est pas encore dans la galerie, on l'insère en tête dynamiquement
  const displayGallery = variantImageUrl && variantImageIdx === -1
    ? [{ url: variantImageUrl }, ...galleryImages]
    : galleryImages;
  const galleryFocusIdx = variantImageUrl
    ? (variantImageIdx >= 0 ? variantImageIdx : 0)
    : 0;

  // Image active pour le bouton Styliste IA
  const activeProductImg = variantImageUrl || galleryImages[0]?.url || product.image_url || "";

  return (
    <div className="font-display bg-white min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <span className="text-[14px] font-black text-gray-900 uppercase tracking-wide line-clamp-1 flex-1 text-center mx-3">
          {product.category || product.vendor || product.productType || "PRODUIT"}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={async () => {
            const url = window.location.href;
            const title = product?.title || product?.name || "Produit BeautyBook";
            if (navigator.share) {
              try { await navigator.share({ title, url }); } catch {}
            } else {
              try { await navigator.clipboard.writeText(url); alert("Lien copié !"); } catch { prompt("Copiez le lien :", url); }
            }
          }} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => {
            toggleLike({ id: product?.id, name: product?.title || product?.name, brand: product?.vendor || "", price: product?.price || 0, img: product?.img || product?.image_url || "", category: product?.category || product?.productType || "" });
          }} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
            <Heart className={`w-4 h-4 transition-all ${isLiked(product?.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
        </div>
      </div>

      {/* Gallery — se met à jour avec la variante sélectionnée */}
      <ImageGallery images={displayGallery} focusIdx={galleryFocusIdx} />

      {/* Info */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-1">{product.category || product.vendor || product.productType}</p>
        <h1 className="text-[18px] font-black text-gray-900 leading-snug mb-3">{product.title || product.name}</h1>

        {/* Badge stock */}
        {isDbProduct && product.stock !== undefined && (
          <div className={`inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full text-[11px] font-black ${product.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
            {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
          </div>
          <span className="text-[12px] text-gray-500 font-medium">4.0</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[26px] font-black text-gray-900">{parseFloat(displayPrice).toFixed(2)} €</span>
          {displayOldPrice && displayOldPrice > displayPrice && (
            <span className="text-[15px] text-gray-400 line-through font-medium">{parseFloat(displayOldPrice).toFixed(2)} €</span>
          )}
          {discount && <span className="bg-primary text-white text-[12px] font-black px-2.5 py-1 rounded-full">-{discount}%</span>}
        </div>

        {/* Variant selectors (Shopify options: couleur, taille, etc.) */}
        {!isDbProduct && product.options && (
          <VariantSelector
            options={product.options}
            variants={product.variants || []}
            selectedOptions={selectedOptions}
            onChange={handleOptionChange}
          />
        )}

        {/* Availability badge for Shopify products */}
        {!isDbProduct && selectedVariant && !selectedVariant.availableForSale && (
          <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full text-[11px] font-black bg-red-50 text-red-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Rupture de stock pour cette variante
          </div>
        )}
        {!isDbProduct && selectedVariant?.availableForSale && (
          <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full text-[11px] font-black bg-green-50 text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Disponible
          </div>
        )}

        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="bg-gray-100 text-gray-500 text-[11px] font-bold px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* Badge paiement BeautyBook pour produits BDD */}
        {isDbProduct && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 mb-2">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] font-bold text-primary">Vendu & expédié par un vendeur BeautyBook · Paiement sécurisé</p>
          </div>
        )}

        {/* Styliste IA — essayer ce produit */}
        <button
          onClick={() => {
            const img = activeProductImg;
            navigate("/sh-ai", {
              state: {
                preSelectedProduct: {
                  id: product.id || productId,
                  name: product.title || product.name,
                  price: displayPrice,
                  img,
                  brand: product.vendor || "",
                }
              }
            });
          }}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl px-4 py-3.5 active:scale-95 transition-all mb-1"
        >
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-md shadow-primary/30 shrink-0">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-black text-gray-900">Essayer avec Styliste IA</p>
            <p className="text-[11px] text-gray-500 font-medium">Simulez ce produit sur votre photo</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        </button>
      </div>

      <div className="h-2 bg-gray-50" />

      {/* Livraison */}
      <div className="px-4 py-4 space-y-3 border-b border-gray-100">
        {[
          { icon: Truck, color: "text-green-500", bg: "bg-green-50", label: "Livraison gratuite", sub: "Estimée dans 5-10 jours" },
          { icon: RotateCcw, color: "text-blue-500", bg: "bg-blue-50", label: "Retour gratuit 30 jours", sub: "Satisfait ou remboursé" },
          { icon: Shield, color: "text-primary", bg: "bg-orange-50", label: "Paiement 100% sécurisé", sub: "Cryptage SSL" },
        ].map(({ icon: Icon, color, bg, label, sub }, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900">{label}</p>
              <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="px-4">
        <ExpandableSection title="Description du produit" defaultOpen>
          <p className="text-[13px] text-gray-600 leading-relaxed">{product.description || "Aucune description disponible."}</p>
        </ExpandableSection>
        <ExpandableSection title="Avis clients">
          <p className="text-[13px] text-gray-400 italic">Aucun avis pour le moment.</p>
        </ExpandableSection>
      </div>

      <div className="h-2 bg-gray-50 mt-2" />
      <RecommendedProducts currentProductId={productId} currentCategory={product?.category || product?.productType || ""} title="Vous aimerez aussi" />

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 z-30" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <button onClick={handleAddToCart}
          className="flex-1 py-3.5 border-2 border-primary rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
          {addedToCart
            ? <><Check className="w-4 h-4 text-primary" /><span className="text-[13px] font-black text-primary">Ajouté !</span></>
            : <><ShoppingCart className="w-4 h-4 text-primary" /><span className="text-[13px] font-black text-primary">Panier</span></>}
        </button>
        <button onClick={handleBuyNow}
          disabled={!variantAvailable || (!isDbProduct && !selectedVariant)}
          className="flex-[2] py-3.5 bg-primary rounded-2xl text-white text-[14px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-40">
          {variantAvailable ? "Acheter maintenant" : "Rupture de stock"}
        </button>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          product={product}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}