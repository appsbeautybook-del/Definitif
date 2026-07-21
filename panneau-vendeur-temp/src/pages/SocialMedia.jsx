import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Instagram, Facebook, MessageCircle, Video, Send, Link2, Settings, BarChart3, Bot } from "lucide-react";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "#E1306C", bg: "bg-pink-50", connected: false },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2", bg: "bg-blue-50", connected: false },
  { id: "tiktok", name: "TikTok", icon: Video, color: "#000000", bg: "bg-gray-100", connected: false },
  { id: "messenger", name: "Messenger", icon: MessageCircle, color: "#00B2FF", bg: "bg-blue-50", connected: false },
  { id: "whatsapp", name: "WhatsApp Business", icon: Send, color: "#25D366", bg: "bg-green-50", connected: false },
];

const FEATURES = [
  { icon: "💬", title: "Réponses automatiques", desc: "Répond aux messages entrants avec empathie et professionnalisme" },
  { icon: "🎯", title: "Conversion commerciale", desc: "Qualifie les prospects et transforme les conversations en ventes" },
  { icon: "📅", title: "Réservation automatique", desc: "Réserve les créneaux dans l'agenda professionnel" },
  { icon: "📊", title: "Suivi des prospects", desc: "Relance automatique des prospects qui n'ont pas encore réservé" },
];

export default function SocialMedia() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState(PLATFORMS);

  const toggleConnect = (id) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connected: !p.connected } : p));
  };

  return (
    <div className="font-display min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-[22px] font-black">Réseaux Sociaux</h1>
            <p className="text-[12px] text-gray-400">Maria AI · Gestion & Conversion</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-32 space-y-4 pt-4">
        {/* Description */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4">
          <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
            Connectez vos réseaux sociaux pour que Maria AI puisse gérer vos messages entrants,
            qualifier les prospects et transformer les conversations en clients.
          </p>
        </div>

        {/* Plateformes */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Plateformes connectées</p>
          <div className="space-y-2">
            {platforms.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className={`w-12 h-12 ${p.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" style={{ color: p.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-black text-gray-900">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.connected ? "Connecté" : "Non connecté"}</p>
                  </div>
                  <button onClick={() => toggleConnect(p.id)}
                    className={`px-4 py-2 rounded-xl text-[12px] font-black transition-all ${p.connected ? "bg-green-100 text-green-600" : "bg-primary text-white"}`}>
                    {p.connected ? "✓" : "Connecter"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fonctionnalités */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Fonctionnalités Maria AI</p>
          <div className="space-y-2">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <span className="text-[24px] shrink-0">{f.icon}</span>
                <div>
                  <p className="text-[14px] font-black text-gray-900">{f.title}</p>
                  <p className="text-[12px] text-gray-400 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paramètres */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <button className="w-full flex items-center gap-3 p-4">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="flex-1 text-left text-[14px] font-black text-gray-900">Paramètres Maria AI</span>
            <span className="text-gray-300">›</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 border-t border-gray-50">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <span className="flex-1 text-left text-[14px] font-black text-gray-900">Statistiques</span>
            <span className="text-gray-300">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
