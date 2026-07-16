/**
 * Hook pour ajouter au panier et synchroniser avec le backend
 */
import { useState } from "react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { apiClient } from '@/lib/apiClient';

export function useCartSync() {
  const [adding, setAdding] = useState(null); // produit_id en cours
  const [cartCount, setCartCount] = useState(() => {
    try { return parseInt(localStorage.getItem("bb_cart_count") || "0", 10); } catch { return 0; }
  });

  const addToCart = async (product) => {
    if (adding) return;
    setAdding(product.id);
    try {
      const res = await apiClient.callFunction("updatePanier", {
        action: "add",
        item: {
          produit_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.img || product.image_url || "",
          quantity: 1,
        },
      });
      const count = res?.data?.panier?.items?.length || 0;
      setCartCount(count);
      localStorage.setItem("bb_cart_count", String(count));
    } catch {
      // Utilisateur non connecté : stocker localement
      try {
        const local = JSON.parse(localStorage.getItem("bb_local_cart") || "[]");
        const existing = local.find(i => i.produit_id === product.id);
        if (existing) existing.quantity = (existing.quantity || 1) + 1;
        else local.push({ produit_id: product.id, name: product.name, price: product.price, image_url: product.img || product.image_url || "", quantity: 1 });
        localStorage.setItem("bb_local_cart", JSON.stringify(local));
        setCartCount(local.length);
        localStorage.setItem("bb_cart_count", String(local.length));
      } catch {}
    }
    setAdding(null);
  };

  return { addToCart, adding, cartCount };
}