import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, BarChart2, ShieldCheck, Award, TrendingUp, Infinity, Headphones, Star, Users, Mic, Percent, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

const PREMIUM_PRICE_ID = "price_1Td7eOLaNWrAdvdeq3Tf30i5";
const GOLD_PRICE_ID = "price_1Td7eOLaNWrAdvdepth9zQuk";

const FALLBACK_PLANS = [
  {
    id: "basique",
    name: "Basique",
    price: 0,
    priceId: null,
    current: true,
    popular: false,
    btnLabel: "PLAN ACTUEL",
    btnStyle: "bg-gray-200 text-gray-600",
    features: [
      { icon: CheckCircle, label: "Profil standard" },
      { icon: CheckCircle, label: "Accès à l'annuaire" },
      { icon: CheckCircle, label: "Réservations limitées" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19,
    priceId: PREMIUM_PRICE_ID,
    current: false,
    popular: true,
    btnLabel: "CHOISIR CE PLAN",
    btnStyle: "bg-primary text-white shadow-lg shadow-primary/40",
    features: [
      { icon: Award, label: "Badge certifié", highlight: true },
      { icon: TrendingUp, label: "Statistiques avancées" },
      { icon: Infinity, label: "Réservations illimitées" },
      { icon: Headphones, label: "Support prioritaire" },
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 49,
    priceId: GOLD_PRICE_ID,
    current: false,
    popular: false,
    btnLabel: "CHOISIR CE PLAN",
    btnStyle: "bg-[#1a2035] text-white",
    features: [
      { icon: Star, label: "Tout le Premium", highlight: true },
      { icon: Eye, label: 'Mise en avant "Salon du Mois"' },
      { icon: Users, label: "Gestion d'équipe complète" },
      { icon: Mic, label: "Assistant Vocal AI inclus" },
      { icon: Percent, label: "Commission réduite" },
    ],
  },
];

const FEATURE_ICONS = {
  "Profil basique": CheckCircle, "Profil standard": CheckCircle,
  "Accès à l'annuaire": CheckCircle, "Services illimités": CheckCircle,
  "Réservations limitées": CheckCircle, "Réservations illimitées": Infinity,
  "Statistiques de base": BarChart2, "Statistiques avancées": TrendingUp,
  "Notifications clients": Eye, "Badge Pro": Award, "Badge certifié": Award,
  "Calendrier avancé": Eye, "Support prioritaire": Headphones,
  "Support dédié 24/7": Headphones,
  "Publication styles": Star, "Live streaming": Mic, "Visite 3D": Eye,
  "Commission réduite": Percent, "Tout Pro inclus": Star,
  "Mise en avant \"Salon du Mois\"": Eye, 'Mise en avant "Salon du Mois"': Eye,
  "Gestion d'équipe complète": Users, "Assistant Vocal AI inclus": Mic,
};

const WHY_PREMIUM = [
  { icon: Eye, title: "Visibilité accrue", desc: "Apparaissez en tête des résultats de recherche locaux." },
  { icon: BarChart2, title: "Décisions basées sur les données", desc: "Comprenez le comportement de vos clients grâce à nos rapports." },
  { icon: ShieldCheck, title: "Confiance instantanée", desc: "Les badges de confiance augmentent votre taux de conversion de 30%." },
];

export default function Abonnements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const [plans, setPlans] = useState(FALLBACK_PLANS);

  useEffect(() => {
    entities.AppConfig.filter({ key: "payment_settings" }, "-created_at", 1)
      .then(res => {
        const results = res?.results || res || [];
        const row = Array.isArray(results) ? results[0] : results;
        const cfg = row?.value;
        if (cfg?.abonnement_pro) {
          const ap = cfg.abonnement_pro;
          const planIds = ["free", "pro", "premium"];
          const btnStyles = {
            free: "bg-gray-200 text-gray-600",
            pro: "bg-primary text-white shadow-lg shadow-primary/40",
            premium: "bg-[#1a2035] text-white",
          };
          const priceIds = { free: null, pro: PREMIUM_PRICE_ID, premium: GOLD_PRICE_ID };
          const labels = { free: "PLAN ACTUEL", pro: "CHOISIR CE PLAN", premium: "CHOISIR CE PLAN" };
          const populars = { free: false, pro: true, premium: false };
          const dynamicPlans = [];
          for (const key of planIds) {
            const planData = ap[key];
            if (!planData) continue;
            dynamicPlans.push({
              id: key,
              name: planData.label || key,
              price: planData.price || 0,
              priceId: priceIds[key],
              current: key === "free",
              popular: populars[key],
              btnLabel: labels[key],
              btnStyle: btnStyles[key],
              features: (planData.features || []).map(f => ({
                icon: FEATURE_ICONS[f] || CheckCircle,
                label: f,
                highlight: key !== "free",
              })),
            });
          }
          if (dynamicPlans.length > 0) setPlans(dynamicPlans);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (plan) => {
    if (!plan.priceId) return;

    if (window.self !== window.top) {
      alert("Le paiement est disponible uniquement depuis l'application publiée.");
      return;
    }

    setLoadingId(plan.id);
    try {
      const res = await apiClient.callFunction("createSubscriptionCheckout", {
        priceId: plan.priceId,
        successUrl: window.location.origin + "/profil-pro?subscribed=1",
        cancelUrl: window.location.origin + "/pro/abonnements",
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
        <h1 className="text-[17px] font-black text-gray-900">Abonnements Pro</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
          <span className="text-[14px] font-black text-primary">{(user?.full_name || "P")[0].toUpperCase()}</span>
        </div>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-4">
        {/* Hero */}
        <div className="px-1 pb-1">
          <span className="inline-block bg-orange-100 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            Propulsez votre salon
          </span>
          <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-2">
            Élevez votre{" "}
            <span className="text-primary">Expérience Client</span>
          </h2>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
            Le plan idéal pour l'ambition de votre établissement.
          </p>
        </div>

        {/* Plan cards */}
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md shadow-primary/30">
                  Le plus populaire
                </span>
              </div>
            )}
            <div className={`bg-white rounded-3xl p-5 shadow-sm ${plan.popular ? "border-2 border-primary/20 pt-6" : ""}`}>
              <p className="text-[18px] font-black text-gray-900 mb-0.5">{plan.name}</p>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-[44px] font-black text-gray-900 leading-none">{plan.price}€</span>
                <span className="text-[15px] font-bold text-gray-400 mb-2">/mois</span>
              </div>
              <div className="space-y-3 mb-5">
                {plan.features.map(({ icon: Icon, label, highlight }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${highlight ? "text-primary" : "text-primary/60"}`} />
                    <span className={`text-[14px] ${highlight ? "font-black text-gray-900" : "font-medium text-gray-700"}`}>{label}</span>
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

        {/* Why Premium */}
        <div className="bg-[#f5f5f5] rounded-3xl p-6 mt-2">
          <h3 className="text-[22px] font-black text-gray-900 text-center leading-tight mb-6">Pourquoi passer au Premium ?</h3>
          <div className="space-y-8">
            {WHY_PREMIUM.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-1">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-[16px] font-black text-gray-900">{title}</p>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[260px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}