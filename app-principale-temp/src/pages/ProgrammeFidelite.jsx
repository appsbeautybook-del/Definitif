import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import ProgrammeProCard from "@/components/fidelite/ProgrammeProCard";

const LEVELS = [
  { name: "Silver", pts: 0, emoji: "🥈", color: "from-gray-400 to-gray-500" },
  { name: "Gold", pts: 1000, emoji: "🥇", color: "from-yellow-400 to-amber-500" },
  { name: "Platinum", pts: 2500, emoji: "💎", color: "from-cyan-400 to-blue-500" },
];

const REWARDS = [
  { id: "r1", icon: "💆‍♀️", label: "Soin Visage Gratuit", desc: "Manucure ou Hydrafacial offert", pts: 800, cat: "Beauté" },
  { id: "r2", icon: "✂️", label: "Coupe Offerte", desc: "Coupe + brushing dans un salon partenaire", pts: 1200, cat: "Beauté" },
  { id: "r3", icon: "🎁", label: "Coupon –10€", desc: "Valable sur tous les services BeautyBook", pts: 400, cat: "Beauté" },
  { id: "r4", icon: "🍽️", label: "–20% Restaurant", desc: "Réduction sur votre addition dans 200+ restos partenaires", pts: 500, cat: "Restaurant" },
  { id: "r5", icon: "🥂", label: "Apéritif Offert", desc: "Boisson offerte dès 2 couverts dans les restos partenaires", pts: 300, cat: "Restaurant" },
  { id: "r6", icon: "🏋️", label: "Séance Sport Offerte", desc: "1 séance gratuite dans une salle de sport partenaire", pts: 600, cat: "Loisirs" },
  { id: "r7", icon: "🎢", label: "–30% Parc Loisirs", desc: "Réduction sur l'entrée d'un parc d'attractions partenaire", pts: 700, cat: "Loisirs" },
  { id: "r8", icon: "🎬", label: "2 Places Cinéma", desc: "2 places offertes dans les cinémas partenaires", pts: 550, cat: "Loisirs" },
  { id: "r9", icon: "🏨", label: "Nuit d'Hôtel –25%", desc: "Réduction dans les hôtels & spas partenaires BeautyBook", pts: 1500, cat: "Séjours" },
  { id: "r10", icon: "🏠", label: "Location Weekend", desc: "–15% sur une location Airbnb partenaire (min. 2 nuits)", pts: 1800, cat: "Séjours" },
  { id: "r11", icon: "🚗", label: "Location Voiture", desc: "1 journée de location offerte chez nos partenaires", pts: 1000, cat: "Séjours" },
  { id: "r12", icon: "📦", label: "Livraison Offerte", desc: "Frais de port offerts sur toute la boutique", pts: 150, cat: "Boutique" },
  { id: "r13", icon: "🛍️", label: "–15% Boutique", desc: "Réduction sur une commande boutique BeautyBook", pts: 350, cat: "Boutique" },
];

const CATS = ["Tout", "Beauté", "Restaurant", "Loisirs", "Séjours", "Boutique"];

function getNiveau(pts) {
  return [...LEVELS].reverse().find(l => l.pts <= pts) || LEVELS[0];
}
function getNextNiveau(pts) {
  return LEVELS.find(l => l.pts > pts) || LEVELS[LEVELS.length - 1];
}

export default function ProgrammeFidelite() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("Tout");
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState(null);
  const [toast, setToast] = useState(null);
  const [isPro, setIsPro] = useState(false);

  // Détecter si compte pro : role OU demande pro approuvée (RLS stricte sur user_email)
  const email = user?.email;
  const role = user?.role;
  useEffect(() => {
    if (!email) return;
    if (role === "vendeur" || role === "pro" || role === "admin") { setIsPro(true); return; }
    let cancelled = false;
    Promise.all([
      entities.DemandeProV2.filter({ user_email: email, statut: "approuvee" }, null, 1),
      entities.PointsFidelitePro.filter({ pro_email: email }, null, 1),
    ]).then(([demandes, pointsPro]) => {
      if (!cancelled && (demandes.length > 0 || pointsPro.length > 0)) setIsPro(true);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [email, role]);

  // Charger ou créer le record points client
  const fullName = user?.full_name;
  useEffect(() => {
    if (!email) { setLoading(false); return; }
    let cancelled = false;
    entities.PointsFidelite.filter({ user_email: email }, null, 1)
      .then(results => {
        if (cancelled) return;
        if (results.length > 0) {
          setRecord(results[0]);
        } else {
          const code = (fullName || "USER").split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "") + Math.floor(1000 + Math.random() * 9000);
          entities.PointsFidelite.create({
            user_email: email,
            points_total: 0,
            points_depenses: 0,
            niveau: "Silver",
            historique: [],
            code_parrainage: code,
          }).then(r => { if (!cancelled) setRecord(r); });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [email]);

  const userPts = (record?.points_total || 0) - (record?.points_depenses || 0);
  const currentLevel = getNiveau(userPts);
  const nextLevel = getNextNiveau(userPts);
  const progress = currentLevel.pts === nextLevel.pts ? 100 : Math.min(((userPts - currentLevel.pts) / (nextLevel.pts - currentLevel.pts)) * 100, 100);
  const ptsToNext = Math.max(nextLevel.pts - userPts, 0);
  const historique = record?.historique || [];
  const refCode = record?.code_parrainage || "---";
  const filteredRewards = activeCat === "Tout" ? REWARDS : REWARDS.filter(r => r.cat === activeCat);

  const handleCopy = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleRedeem = async (reward) => {
    if (!record) return;
    if (userPts < reward.pts) { showToast("Points insuffisants pour cette récompense 😕"); return; }
    setRedeeming(reward.id);
    const newHistorique = [
      { label: `Échange : ${reward.label}`, pts: -reward.pts, date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }), type: "debit" },
      ...historique,
    ];
    const updatedNiveau = getNiveau(userPts - reward.pts).name;
    await entities.PointsFidelite.update(record.id, {
      points_depenses: (record.points_depenses || 0) + reward.pts,
      niveau: updatedNiveau,
      historique: newHistorique,
    });
    setRecord(r => ({ ...r, points_depenses: (r.points_depenses || 0) + reward.pts, niveau: updatedNiveau, historique: newHistorique }));
    setRedeeming(null);
    showToast(`✅ ${reward.label} échangé avec succès !`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="font-display min-h-full bg-[#f5f5f5]">

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] bg-gray-900 text-white text-[13px] font-bold px-5 py-3 rounded-2xl shadow-xl max-w-[320px] text-center">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Programme Fidélité</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">{currentLevel.emoji} Niveau {currentLevel.name}</p>
        </div>
      </div>



      <div className="px-4 pb-24 pt-4 space-y-5">

        {isPro ? (
          <ProgrammeProCard user={user} />
        ) : (
          <>
            {/* Points card client */}
            <div className="bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-5 shadow-lg shadow-primary/30">
              <p className="text-white/80 text-[12px] font-black uppercase tracking-widest mb-0.5">{user?.full_name?.toUpperCase() || "MON COMPTE"}</p>
              <div className="flex items-end justify-between">
                <p className="text-white text-[48px] font-black leading-none">
                  {userPts.toLocaleString()} <span className="text-[24px]">pts</span>
                </p>
                <div className="bg-white/20 border border-white/30 rounded-2xl px-4 py-2.5 text-center">
                  <span className="text-[22px]">{currentLevel.emoji}</span>
                  <p className="text-white text-[12px] font-black">{currentLevel.name}</p>
                </div>
              </div>
              {currentLevel.name !== "Platinum" && (
                <>
                  <p className="text-white/70 text-[11px] font-medium mt-3">Vers {nextLevel.emoji} {nextLevel.name}</p>
                  <div className="mt-1.5 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-white/60 text-[11px] font-medium mt-1 text-right">encore {ptsToNext.toLocaleString()} pts</p>
                </>
              )}
              {currentLevel.name === "Platinum" && (
                <p className="text-white/80 text-[13px] font-bold mt-3">🏆 Niveau maximum atteint !</p>
              )}
            </div>

            {/* Progression niveaux */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <p className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-5">Progression</p>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-6 h-1 bg-gray-100 mx-8 z-0" />
                {LEVELS.map((lv) => {
                  const active = lv.name === currentLevel.name;
                  const done = lv.pts < userPts;
                  return (
                    <div key={lv.name} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                      <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-[20px] transition-all ${active ? "border-primary bg-orange-50 scale-110 shadow-md shadow-primary/20" : done ? "border-primary bg-white" : "border-gray-200 bg-white"}`}>
                        {lv.emoji}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${active ? "text-primary" : "text-gray-400"}`}>{lv.name}</span>
                      <span className="text-[9px] text-gray-300 font-medium">{lv.pts === 0 ? "Gratuit" : `${lv.pts.toLocaleString()} pts`}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Récompenses */}
            <div>
              <p className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-3 px-1">Récompenses</p>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 -mx-4 px-4">
                {CATS.map(cat => (
                  <button key={cat} onClick={() => setActiveCat(cat)}
                    className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-black border transition-all active:scale-95 ${activeCat === cat ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filteredRewards.map(r => {
                  const canAfford = userPts >= r.pts;
                  const isLoadingItem = redeeming === r.id;
                  return (
                    <div key={r.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[22px] shrink-0">{r.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-black text-gray-900 truncate">{r.label}</p>
                          <span className="shrink-0 text-[9px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wider">{r.cat}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">{r.desc}</p>
                        <p className={`text-[12px] font-black mt-1 ${canAfford ? "text-primary" : "text-gray-300"}`}>{r.pts.toLocaleString()} pts</p>
                      </div>
                      <button onClick={() => handleRedeem(r)} disabled={!canAfford || !!redeeming}
                        className={`text-[11px] font-black px-4 py-2.5 rounded-xl active:scale-95 transition-all shrink-0 ${canAfford ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-gray-100 text-gray-300"}`}>
                        {isLoadingItem ? "..." : canAfford ? "Échanger" : "Bientôt"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Historique */}
            {historique.length > 0 && (
              <div>
                <p className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-3 px-1">Historique</p>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
                  {historique.slice(0, 10).map((h, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-4">
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">{h.label}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{h.date}</p>
                      </div>
                      <span className={`text-[15px] font-black ${h.pts > 0 ? "text-green-500" : "text-red-400"}`}>
                        {h.pts > 0 ? "+" : ""}{h.pts} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {historique.length === 0 && (
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-2 shadow-sm">
                <span className="text-[40px]">🌟</span>
                <p className="text-[14px] font-black text-gray-700">Commencez à gagner des points !</p>
                <p className="text-[12px] text-gray-400 font-medium">Réservez un service, achetez en boutique ou parrainez des amies pour accumuler des points.</p>
              </div>
            )}

            {/* Parrainage client */}
            <div className="bg-[#1e2535] rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-[20px]">👥</div>
                <div>
                  <p className="text-white text-[15px] font-black">Parrainez vos amies</p>
                  <p className="text-white/60 text-[11px] font-medium">+200 pts pour vous · +100 pts pour elles</p>
                </div>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl flex items-center justify-between px-4 py-3">
                <span className="text-white text-[16px] font-black tracking-widest">{refCode}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-primary text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all">
                  {copied ? <><CheckCircle className="w-4 h-4" /> Copié !</> : "Copier"}
                </button>
              </div>
            </div>

            {/* Comment gagner */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <p className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-4">Comment gagner des points ?</p>
              <div className="space-y-3">
                {[
                  { emoji: "💇‍♀️", label: "Réservation service beauté", pts: "+50 pts" },
                  { emoji: "🛍️", label: "Achat en boutique (par 10€)", pts: "+10 pts" },
                  { emoji: "⭐", label: "Laisser un avis", pts: "+30 pts" },
                  { emoji: "👥", label: "Parrainer un(e) ami(e)", pts: "+200 pts" },
                  { emoji: "📅", label: "RDV honoré sans annulation", pts: "+20 pts" },
                ].map((g, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[18px]">{g.emoji}</span>
                      <span className="text-[13px] font-medium text-gray-700">{g.label}</span>
                    </div>
                    <span className="text-[13px] font-black text-green-500">{g.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}