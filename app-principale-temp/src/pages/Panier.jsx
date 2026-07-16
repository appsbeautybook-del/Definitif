import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, ChevronRight, Tag, Loader2 } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { apiClient } from '@/lib/apiClient';

export default function Panier() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [panier, setPanier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    loadPanier();
    if (searchParams.get("success") === "true") {
      alert("✅ Paiement reçu ! Votre commande sera traitée dans 24h.");
      apiClient.callFunction("updatePanier", { action: "clear" }).catch(() => {});
      navigate("/mes-commandes");
    }
  }, [searchParams]);

  // Fusionner panier local (utilisateurs non connectés) + panier backend
  const loadPanier = async () => {
    setLoading(true);
    try {
      const res = await apiClient.callFunction("getPanier", {});
      let backendPanier = res.data?.panier;

      // Fusionner avec le panier local si présent
      const localCart = JSON.parse(localStorage.getItem("bb_local_cart") || "[]");
      if (localCart.length > 0 && backendPanier) {
        for (const localItem of localCart) {
          const existing = backendPanier.items?.find(i => i.produit_id === localItem.produit_id);
          if (!existing) {
            await apiClient.callFunction("updatePanier", { action: "add", item: localItem }).catch(() => {});
          }
        }
        localStorage.removeItem("bb_local_cart");
        const res2 = await apiClient.callFunction("getPanier", {});
        backendPanier = res2.data?.panier;
      }

      if (backendPanier) {
        setPanier(backendPanier);
        // Mettre à jour le compteur global
        const count = backendPanier.items?.length || 0;
        localStorage.setItem("bb_cart_count", String(count));
      } else if (localCart.length > 0) {
        // Utilisateur non connecté : utiliser le panier local
        setPanier({ items: localCart });
      }
    } catch {
      // Utilisateur non connecté : utiliser le panier local
      const localCart = JSON.parse(localStorage.getItem("bb_local_cart") || "[]");
      setPanier({ items: localCart });
    }
    setLoading(false);
  };

  const updateItem = async (action, item) => {
    setUpdating(item.produit_id);
    try {
      const res = await apiClient.callFunction("updatePanier", { action, item });
      const updated = res.data?.panier;
      if (updated) {
        setPanier(updated);
        localStorage.setItem("bb_cart_count", String(updated.items?.length || 0));
      }
    } catch {
      // Utilisateur non connecté : mettre à jour localement
      const localCart = JSON.parse(localStorage.getItem("bb_local_cart") || "[]");
      let updated;
      if (action === "remove") {
        updated = localCart.filter(i => i.produit_id !== item.produit_id);
      } else if (action === "increment") {
        updated = localCart.map(i => i.produit_id === item.produit_id ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
      } else if (action === "decrement") {
        updated = localCart.map(i => i.produit_id === item.produit_id ? { ...i, quantity: Math.max(1, (i.quantity || 1) - 1) } : i)
          .filter(i => i.quantity > 0);
      }
      localStorage.setItem("bb_local_cart", JSON.stringify(updated));
      localStorage.setItem("bb_cart_count", String(updated.length));
      setPanier({ items: updated });
    }
    setUpdating(null);
  };

  const handleStripeCheckout = async () => {
    if (window.self !== window.top) {
      alert("⚠️ Le paiement fonctionne uniquement depuis l'app publiée. Ouvrez l'app en plein écran.");
      return;
    }
    setCheckingOut(true);
    try {
      const res = await apiClient.callFunction("createCheckoutSession", {
        items: items,
        type: "panier",
      });
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        alert("Erreur : impossible d'accéder au paiement.");
      }
    } catch (err) {
      alert("Erreur paiement : " + err.message);
    }
    setCheckingOut(false);
  };

  const items = panier?.items || [];
  const subtotal = items.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
  const shipping = subtotal >= 50 ? 0 : subtotal > 0 ? 4.99 : 0;
  const total = subtotal + shipping;
  const totalItems = items.reduce((s, i) => s + (i.quantity || 1), 0);

  if (loading) {
    return (
      <div className="font-display bg-[#f5f5f5] min-h-full">
        <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-6 bg-gray-100 rounded-full w-1/3 animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded-full" />
                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-[#f5f5f5] min-h-full pb-36">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <h1 className="text-[20px] font-black text-gray-900 flex-1">Mon Panier</h1>
        {totalItems > 0 && (
          <span className="bg-primary text-white text-[11px] font-black px-2.5 py-1 rounded-full">
            {totalItems} article{totalItems > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 px-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-9 h-9 text-gray-300" />
          </div>
          <p className="text-[16px] font-black text-gray-600">Votre panier est vide</p>
          <p className="text-[13px] text-gray-400 font-medium text-center leading-relaxed">
            Ajoutez des produits depuis la boutique pour les retrouver ici.
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {/* Items */}
          {items.map((item) => (
            <div key={item.produit_id} className="bg-white rounded-3xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {item.brand && <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-0.5">{item.brand}</p>}
                <p className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-tight">{item.name}</p>
                <p className="text-[15px] font-black text-gray-900 mt-1">
                  {(item.price * (item.quantity || 1)).toFixed(2)}€
                  {(item.quantity || 1) > 1 && (
                    <span className="text-[11px] text-gray-400 font-medium ml-1">({item.price.toFixed(2)}€/u)</span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => updateItem("remove", item)}
                  disabled={updating === item.produit_id}
                  className="w-7 h-7 flex items-center justify-center text-gray-300 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-1 py-1">
                  <button
                    onClick={() => updateItem("decrement", item)}
                    disabled={updating === item.produit_id}
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  <span className="text-[13px] font-black text-gray-900 w-4 text-center">
                    {updating === item.produit_id
                      ? <Loader2 className="w-3 h-3 animate-spin text-primary inline" />
                      : item.quantity || 1}
                  </span>
                  <button
                    onClick={() => updateItem("increment", item)}
                    disabled={updating === item.produit_id}
                    className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Promo code */}
          <div className="bg-white rounded-3xl p-4 flex items-center gap-3 shadow-sm">
            <Tag className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              placeholder="Code promo"
              className="flex-1 text-[13px] text-gray-700 outline-none bg-transparent font-medium placeholder:text-gray-300"
            />
            <button
              onClick={() => promoCode.trim() && alert("Code promo non reconnu.")}
              className="text-[12px] font-black text-primary"
            >
              APPLIQUER
            </button>
          </div>

          {/* Livraison */}
          {subtotal > 0 && subtotal < 50 && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
              <p className="text-[12px] font-bold text-orange-600 text-center">
                🚚 Plus que <span className="font-black">{(50 - subtotal).toFixed(2)}€</span> pour la livraison gratuite !
              </p>
              <div className="mt-2 w-full bg-orange-100 rounded-full h-1.5">
                <div className="bg-orange-400 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }} />
              </div>
            </div>
          )}
          {subtotal >= 50 && (
            <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
              <p className="text-[12px] font-bold text-green-600 text-center">✅ Livraison gratuite appliquée !</p>
            </div>
          )}

          {/* Récapitulatif */}
          <div className="bg-white rounded-3xl p-4 shadow-sm space-y-3">
            <h3 className="text-[14px] font-black text-gray-900 uppercase tracking-wider">Récapitulatif</h3>
            <div className="flex justify-between">
              <span className="text-[13px] font-medium text-gray-500">Sous-total ({totalItems} article{totalItems > 1 ? "s" : ""})</span>
              <span className="text-[13px] font-bold text-gray-900">{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] font-medium text-gray-500">Livraison</span>
              <span className={`text-[13px] font-bold ${shipping === 0 ? "text-green-500" : "text-gray-900"}`}>
                {shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)}€`}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
              <span className="text-[15px] font-black text-gray-900">Total</span>
              <span className="text-[22px] font-black text-primary">{total.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 z-30 space-y-2"
          style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 12px))" }}>
          <button
            onClick={handleStripeCheckout}
            disabled={checkingOut}
            className="w-full py-4 bg-primary rounded-2xl flex items-center justify-center gap-2 text-white font-black text-[14px] uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {checkingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <span>Payer • {total.toFixed(2)}€</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/boutique")}
            className="w-full py-3 border-2 border-gray-200 rounded-2xl text-gray-700 font-black text-[13px] uppercase tracking-widest active:scale-[0.98] transition-all"
          >
            Continuer mes achats
          </button>
        </div>
      )}
    </div>
  );
}