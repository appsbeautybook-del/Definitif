import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Instagram, Facebook, MessageCircle, Video, Send,
  BarChart3, Bot, CheckCircle2, Clock, Users, TrendingUp,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Zap, Settings
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "#E1306C", bg: "bg-pink-50", username: "", autoReply: true, conversion: true, booking: true },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2", bg: "bg-blue-50", username: "", autoReply: true, conversion: true, booking: true },
  { id: "tiktok", name: "TikTok", icon: Video, color: "#000000", bg: "bg-gray-100", username: "", autoReply: true, conversion: false, booking: false },
  { id: "messenger", name: "Messenger", icon: MessageCircle, color: "#00B2FF", bg: "bg-blue-50", username: "", autoReply: true, conversion: true, booking: true },
  { id: "whatsapp", name: "WhatsApp Business", icon: Send, color: "#25D366", bg: "bg-green-50", username: "", autoReply: true, conversion: true, booking: true },
];

const STATS = [
  { label: "Messages reçus", value: 247, icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50", trend: "+18%" },
  { label: "Réponses auto", value: 189, icon: Bot, color: "text-purple-500", bg: "bg-purple-50", trend: "+24%" },
  { label: "Prospects qualifiés", value: 52, icon: Users, color: "text-orange-500", bg: "bg-orange-50", trend: "+12%" },
  { label: "Conversions", value: 18, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50", trend: "+8%" },
];

const ACTIVITY = [
  { time: "Il y a 5 min", platform: "Instagram", type: "message", text: "Nouveau message de @sarah_beauty" },
  { time: "Il y a 12 min", platform: "Facebook", type: "reply", text: "Réponse auto envoyée à Marie D." },
  { time: "Il y a 25 min", platform: "WhatsApp", type: "booking", text: "Réservation confirmée pour Jean P." },
  { time: "Il y a 1h", platform: "Instagram", type: "conversion", text: "Prospect converti : @lisa_nails" },
  { time: "Il y a 2h", platform: "Messenger", type: "message", text: "Nouveau message de Paul K." },
];

export default function SocialMedia() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("platforms");

  const toggleConnect = (id) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connected: !p.connected } : p));
  };

  const toggleSetting = (id, key) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [key]: !p[key] } : p));
  };

  const updateUsername = (id, value) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, username: value } : p));
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="font-display min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-[22px] font-black">Réseaux Sociaux</h1>
            <p className="text-[12px] text-gray-400">Maria AI · Gestion & Conversion</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "platforms", label: "Plateformes", count: connectedCount },
            { id: "stats", label: "Statistiques" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-black transition-all ${activeTab === tab.id ? "bg-white text-gray-900" : "bg-white/10 text-white"}`}>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-gray-200 text-gray-600" : "bg-white/20 text-white"}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-32 pt-4 space-y-4">
        {activeTab === "platforms" && (
          <>
            {/* Description */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[14px] font-black text-gray-900 mb-1">Maria AI gère vos réseaux</p>
                  <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                    Connectez vos comptes pour activer les réponses automatiques, la qualification des prospects et la réservation en ligne.
                  </p>
                </div>
              </div>
            </div>

            {/* Plateformes */}
            <div className="space-y-3">
              {platforms.map(p => {
                const Icon = p.icon;
                const isExpanded = expandedId === p.id;
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Platform header */}
                    <div className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 ${p.bg} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon className="w-6 h-6" style={{ color: p.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-black text-gray-900">{p.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {p.connected ? (p.username || "Connecté") : "Non connecté"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleConnect(p.id)}
                          className={`px-4 py-2 rounded-xl text-[12px] font-black transition-all ${p.connected ? "bg-green-100 text-green-600" : "bg-primary text-white"}`}>
                          {p.connected ? "✓" : "Connecter"}
                        </button>
                        {p.connected && (
                          <button onClick={() => setExpandedId(isExpanded ? null : p.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded config */}
                    {isExpanded && p.connected && (
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                        <div className="pt-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom d'utilisateur</p>
                          <input value={p.username} onChange={e => updateUsername(p.id, e.target.value)}
                            placeholder={`Votre nom ${p.name}`}
                            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 outline-none placeholder:text-gray-400" />
                        </div>

                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Automatisations Maria AI</p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Bot className="w-4 h-4 text-purple-500" />
                              <div>
                                <p className="text-[13px] font-black text-gray-800">Réponses automatiques</p>
                                <p className="text-[11px] text-gray-400">Répond aux messages avec empathie</p>
                              </div>
                            </div>
                            <button onClick={() => toggleSetting(p.id, "autoReply")}>
                              {p.autoReply ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Zap className="w-4 h-4 text-orange-500" />
                              <div>
                                <p className="text-[13px] font-black text-gray-800">Conversion commerciale</p>
                                <p className="text-[11px] text-gray-400">Transforme les conversations en ventes</p>
                              </div>
                            </div>
                            <button onClick={() => toggleSetting(p.id, "conversion")}>
                              {p.conversion ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <div>
                                <p className="text-[13px] font-black text-gray-800">Réservation auto</p>
                                <p className="text-[11px] text-gray-400">Réserve les créneaux automatiquement</p>
                              </div>
                            </div>
                            <button onClick={() => toggleSetting(p.id, "booking")}>
                              {p.booking ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Résumé */}
            {connectedCount > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-[13px] font-medium text-green-700">
                  Maria AI est active sur {connectedCount} réseau{connectedCount > 1 ? "x" : ""}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "stats" && (
          <>
            {/* Stats globales */}
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <span className="text-[11px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{s.trend}</span>
                    </div>
                    <p className="text-[22px] font-black text-gray-900">{s.value}</p>
                    <p className="text-[11px] font-medium text-gray-400">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Taux de réponse */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Taux de réponse automatique</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: "76%" }}></div>
                  </div>
                </div>
                <span className="text-[18px] font-black text-gray-900">76%</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-2">189 réponses auto / 247 messages reçus</p>
            </div>

            {/* Taux de conversion */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Taux de conversion</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: "35%" }}></div>
                  </div>
                </div>
                <span className="text-[18px] font-black text-gray-900">35%</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-2">18 conversions / 52 prospects qualifiés</p>
            </div>

            {/* Par plateforme */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance par plateforme</p>
              </div>
              {[
                { name: "Instagram", messages: 98, replies: 82, color: "#E1306C" },
                { name: "Facebook", messages: 67, replies: 54, color: "#1877F2" },
                { name: "WhatsApp", messages: 52, replies: 38, color: "#25D366" },
                { name: "Messenger", messages: 30, replies: 15, color: "#00B2FF" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <div className="flex-1">
                    <p className="text-[13px] font-black text-gray-800">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.messages} msgs · {p.replies} réponses auto</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-black text-gray-900">{Math.round(p.replies / p.messages * 100)}%</p>
                    <p className="text-[10px] text-gray-400">réponse</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Activité récente */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activité récente</p>
              </div>
              <div className="divide-y divide-gray-50">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.type === "message" ? "bg-blue-50" : a.type === "reply" ? "bg-purple-50" : a.type === "booking" ? "bg-green-50" : "bg-orange-50"}`}>
                      {a.type === "message" && <MessageCircle className="w-4 h-4 text-blue-500" />}
                      {a.type === "reply" && <Bot className="w-4 h-4 text-purple-500" />}
                      {a.type === "booking" && <Clock className="w-4 h-4 text-green-500" />}
                      {a.type === "conversion" && <TrendingUp className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-800 truncate">{a.text}</p>
                      <p className="text-[11px] text-gray-400">{a.platform} · {a.time}</p>
                    </div>
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
