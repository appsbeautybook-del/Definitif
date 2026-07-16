import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, CheckCircle, Crown, Car, MapPin, Calendar, Zap, Loader2 } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from '@/lib/apiClient';

const BEAUTY_PLUS_PRICE_ID = "price_1Td7eOLaNWrAdvdeA59wSI0m";

const PLANS = [
  {
    id: "gratuit",
    name: "Gratuit",
    price: 0,
    priceId: null,
    current: true,
    popular: false,
    btnLabel: "PLAN ACTUEL",
    btnStyle: "bg-gray-200 text-gray-600 cursor-default",
    badge: null,
    color: "border-gray-200",
    features: [
      { icon: CheckCircle, label: "Accès à l'annuaire beauté" },
      { icon: CheckCircle, label: "Réservations standards" },
      { icon: CheckCircle, label: "Avis et notes" },
      { icon: CheckCircle, label: "Boutique produits" },
    ],
  },
  {
    id: "beautyplus",
    name: "Beauty Plus",
    price: 9.99,
    priceId: BEAUTY_PLUS_PRICE_ID,
    current: false,
    popular: true,
    btnLabel: "DEVENIR VIP",
    btnStyle: "bg-primary text-white shadow-lg shadow-primary/40",
    badge: "⭐ VIP",
    color: "border-primary/30",
    features: [
      { icon: Star, label: "Priorité sur toutes les réservations", highlight: true },
      { icon: Crown, label: "Statut client VIP visible par les pros", highlight: true },
      { icon: Car, label: "Accès au Beauty Car (prestations à domicile en voiture)", highlight: true },
      { icon: MapPin, label: "Accès au Congo Beauty (réseau partenaire)" },
      { icon: Zap, label: "Suggestions personnalisées par IA" },
      { icon: Calendar, label: "Rappels & agenda beauté intelligent" },
    ],
  },
];

export default function AbonnementsClient() {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  const handleSubscribe = async (plan) => {
    if (!plan.priceId) return;

    // Vérifier si dans un iframe
    if (window.self !== window.top) {
      alert("Le paiement est disponible uniquement depuis l'application publiée.");
      return;
    }

    setLoadingId(plan.id);
    try {
      const res = await apiClient.callFunction("createSubscriptionCheckout", {
        priceId: plan.priceId,
        successUrl: window.location.origin + "/profil?subscribed=1",
        cancelUrl: window.location.origin + "/abonnements",
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      alert("Erreur lors de la redirection vers le paiement. Réessayez.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="font-display min-h-full bg-[#f0f0f0]">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-[17px] font-black text-gray-900">Abonnements</h1>
        <div className="w-9" />
      </div>

      <div className="px-4 pt-5 pb-10 space-y-5">
        {/* Hero */}
        <div className="px-1 pb-1">
          <span className="inline-block bg-orange-100 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            Pour les clients BeautyBook
          </span>
          <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-2">
            Profitez de la{" "}
            <span className="text-primary">beauté à son meilleur</span>
          </h2>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
            Passez VIP et accédez à des privilèges exclusifs que les autres clients n'ont pas.
          </p>
        </div>

        {/* Plan cards */}
        {PLANS.map((plan) => (
          <div key={plan.id} className="relative">
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md shadow-primary/30">
                  Le plus populaire
                </span>
              </div>
            )}
            <div className={`bg-white rounded-3xl p-5 shadow-sm border-2 ${plan.color} ${plan.popular ? "pt-6" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[18px] font-black text-gray-900">{plan.name}</p>
                {plan.badge && (
                  <span className="bg-primary/10 text-primary text-[11px] font-black px-3 py-1 rounded-full">{plan.badge}</span>
                )}
              </div>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-[44px] font-black text-gray-900 leading-none">{plan.price}€</span>
                <span className="text-[15px] font-bold text-gray-400 mb-2">/mois</span>
              </div>
              <div className="space-y-3 mb-5">
                {plan.features.map(({ icon: Icon, label, highlight }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${highlight ? "bg-primary/10" : "bg-gray-100"}`}>
                      <Icon className={`w-3 h-3 ${highlight ? "text-primary" : "text-gray-400"}`} />
                    </div>
                    <span className={`text-[13px] leading-snug ${highlight ? "font-black text-gray-900" : "font-medium text-gray-600"}`}>{label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={!plan.priceId || loadingId === plan.id}
                className={`w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${plan.btnStyle}`}
              >
                {loadingId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : plan.btnLabel}
              </button>
            </div>
          </div>
        ))}

        {/* Beauty Car highlight */}
        <div className="bg-gradient-to-br from-[#1a2035] to-[#2d3555] rounded-3xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[16px] font-black">Beauty Car 🚗</p>
              <p className="text-[11px] text-white/60 font-medium">Exclusif membres Beauty Plus</p>
            </div>
          </div>
          <p className="text-[13px] text-white/70 font-medium leading-relaxed">
            Des professionnels de beauté se déplacent directement chez vous dans un véhicule équipé. Coiffure, maquillage, manucure… tout à domicile.
          </p>
        </div>
      </div>
    </div>
  );
}