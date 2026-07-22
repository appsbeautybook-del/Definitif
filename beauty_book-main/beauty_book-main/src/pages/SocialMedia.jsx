import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Instagram, Facebook, MessageCircle, Video, Send,
  Bot, CheckCircle2, Lock, Eye, EyeOff, Copy, ExternalLink,
  Shield, Zap, Clock, Users, TrendingUp, BarChart3, Activity,
  ChevronRight, AlertCircle, Key
} from "lucide-react";

const PLATFORMS = [
  {
    id: "instagram", name: "Instagram", icon: Instagram, color: "#E1306C",
    bg: "bg-gradient-to-br from-pink-500 to-purple-500", lightBg: "bg-pink-50",
    desc: "Gérez vos DMs et commentaires avec Maria AI",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAA...", type: "password", link: "https://developers.facebook.com/tools/explorer/" },
      { key: "businessId", label: "Business Account ID", placeholder: "17841400...", type: "text", link: "https://business.facebook.com/settings/" },
    ],
    features: ["Réponses auto DM", "Réponses commentaires", "Story replies", "Gestion des mentions"]
  },
  {
    id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2",
    bg: "bg-gradient-to-br from-blue-600 to-blue-500", lightBg: "bg-blue-50",
    desc: "Automatisez vos messages Messenger et commentaires",
    fields: [
      { key: "pageAccessToken", label: "Page Access Token", placeholder: "EAA...", type: "password", link: "https://developers.facebook.com/tools/explorer/" },
      { key: "pageId", label: "Page ID", placeholder: "123456789...", type: "text", link: "https://www.facebook.com/settings/pages/" },
      { key: "verifyToken", label: "Verify Token", placeholder: "mon_token_secret", type: "password" },
    ],
    features: ["Messenger auto-reply", "Comment auto-reply", "Broadcast", "Lead generation"]
  },
  {
    id: "tiktok", name: "TikTok", icon: Video, color: "#000000",
    bg: "bg-gradient-to-br from-gray-900 to-gray-700", lightBg: "bg-gray-100",
    desc: "Répondez aux commentaires et DMs TikTok",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "TikTok access token...", type: "password", link: "https://developers.tiktok.com/" },
      { key: "openId", label: "Open ID", placeholder: "open_id...", type: "text", link: "https://business.tiktok.com/" },
    ],
    features: ["Réponses commentaires", "DM automation", "Analytics"]
  },
  {
    id: "whatsapp", name: "WhatsApp Business", icon: Send, color: "#25D366",
    bg: "bg-gradient-to-br from-green-500 to-emerald-500", lightBg: "bg-green-50",
    desc: "Convertissez les prospects via WhatsApp",
    fields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "123456789...", type: "text", link: "https://developers.facebook.com/apps/" },
      { key: "accessToken", label: "Permanent Token", placeholder: "EAA...", type: "password", link: "https://business.facebook.com/wa/manage/" },
      { key: "businessAccountId", label: "WhatsApp Business Account ID", placeholder: "WABA ID...", type: "text", link: "https://business.facebook.com/wa/manage/" },
    ],
    features: ["Messages texte/image", "Templates WhatsApp", "Catalogue produits", "Paiements intégrés"]
  },
  {
    id: "messenger", name: "Messenger", icon: MessageCircle, color: "#00B2FF",
    bg: "bg-gradient-to-br from-sky-500 to-blue-500", lightBg: "bg-blue-50",
    desc: "Messagerie instantanée avec IA",
    fields: [
      { key: "pageAccessToken", label: "Page Access Token", placeholder: "EAA...", type: "password", link: "https://developers.facebook.com/tools/explorer/" },
      { key: "pageId", label: "Page ID", placeholder: "123456789...", type: "text", link: "https://www.facebook.com/settings/pages/" },
    ],
    features: ["Réponses auto", "Handover protocol", "Persistent menu", "Bienvenue"]
  },
];

const TABS = [
  { id: "platforms", label: "Plateformes" },
  { id: "stats", label: "Statistiques" },
];

export default function SocialMedia() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("platforms");
  const [expandedId, setExpandedId] = useState(null);
  const [platforms, setPlatforms] = useState(
    PLATFORMS.map(p => ({ ...p, connected: false, keys: {}, showKeys: {} }))
  );

  const toggleConnect = (id) => {
    setPlatforms(prev => prev.map(p => {
      if (p.id !== id) return p;
      const connected = !p.connected;
      return { ...p, connected, keys: connected ? p.keys : {} };
    }));
  };

  const setKey = (id, key, value) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, keys: { ...p.keys, [key]: value } } : p));
  };

  const toggleShowKey = (id, key) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, showKeys: { ...p.showKeys, [key]: !p.showKeys[key] } } : p));
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="font-display min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-[24px] font-black text-white">Réseaux Sociaux</h1>
            <p className="text-[13px] text-gray-400">Maria AI · Connectez vos plateformes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-2xl text-[14px] font-black transition-all ${activeTab === tab.id ? "bg-white text-gray-900" : "bg-white/5 text-gray-400"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-32 space-y-4">
        {activeTab === "platforms" && (
          <>
            {/* Status badge */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${connectedCount > 0 ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}></div>
                <span className="text-[13px] font-medium text-gray-300">
                  {connectedCount > 0 ? `${connectedCount} plateforme${connectedCount > 1 ? "s" : ""} active${connectedCount > 1 ? "s" : ""}` : "Aucune plateforme connectée"}
                </span>
              </div>
              {connectedCount > 0 && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            </div>

            {/* Platform cards */}
            {platforms.map(p => {
              const Icon = p.icon;
              const isExpanded = expandedId === p.id;
              return (
                <div key={p.id} className={`rounded-3xl overflow-hidden transition-all ${p.connected ? "bg-white/10 border border-white/15" : "bg-white/5 border border-white/10"}`}>
                  {/* Header */}
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 ${p.bg} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-black text-white">{p.name}</p>
                        {p.connected && (
                          <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">ACTIF</span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-400 mt-0.5">{p.desc}</p>
                    </div>
                  </div>

                  {/* Features preview (collapsed) */}
                  {!isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.features.map((f, i) => (
                          <span key={i} className="text-[10px] font-medium text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded config */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* API Config */}
                      <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-4 h-4 text-yellow-400" />
                          <p className="text-[12px] font-black text-white uppercase tracking-wider">Configuration API</p>
                        </div>
                        {p.fields.map(field => (
                          <div key={field.key}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[12px] font-medium text-gray-300">{field.label}</p>
                              {field.link && (
                                <a href={field.link} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                                  Obtenir <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                              <input
                                type={p.showKeys[field.key] ? "text" : field.type}
                                value={p.keys[field.key] || ""}
                                onChange={e => setKey(p.id, field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="flex-1 bg-transparent text-[13px] text-white px-4 py-3 outline-none placeholder:text-gray-600 font-mono"
                              />
                              <button onClick={() => toggleShowKey(p.id, field.key)}
                                className="px-3 text-gray-500 hover:text-white transition-colors">
                                {p.showKeys[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Features */}
                      <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-[12px] font-black text-white uppercase tracking-wider mb-3">Fonctionnalités Maria AI</p>
                        <div className="space-y-2">
                          {p.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-green-400/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                              </div>
                              <span className="text-[13px] text-gray-300 font-medium">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                        <Shield className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[12px] font-black text-yellow-400">Sécurité</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Vos clés API sont chiffrées et stockées de manière sécurisée. Maria AI les utilise uniquement pour gérer vos messages.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  <div className="px-4 pb-4">
                    <div className="flex gap-2">
                      <button onClick={() => toggleConnect(p.id)}
                        className={`flex-1 py-3.5 rounded-2xl text-[14px] font-black transition-all active:scale-[0.98] ${p.connected ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white text-gray-900"}`}>
                        {p.connected ? "Déconnecter" : "Connecter"}
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className={`w-14 rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] ${isExpanded ? "bg-white/10 text-white" : "bg-white/5 text-gray-400"}`}>
                        <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Help link */}
            <div className="text-center py-4">
              <a href="https://docs.beautybook.app/api" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                Besoin d'aide ? Consultez la documentation API
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </>
        )}

        {activeTab === "stats" && (
          <>
            {/* Stats header */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[16px] font-black text-white">Performance globale</p>
                  <p className="text-[12px] text-gray-400">Derniers 30 jours</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Messages", value: "247", icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10", trend: "+18%" },
                  { label: "Réponses auto", value: "189", icon: Bot, color: "text-purple-400", bg: "bg-purple-400/10", trend: "+24%" },
                  { label: "Prospects", value: "52", icon: Users, color: "text-orange-400", bg: "bg-orange-400/10", trend: "+12%" },
                  { label: "Conversions", value: "18", icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10", trend: "+8%" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="bg-white/5 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <span className="text-[10px] font-black text-green-400">{s.trend}</span>
                      </div>
                      <p className="text-[20px] font-black text-white">{s.value}</p>
                      <p className="text-[11px] text-gray-400">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Response rate */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <p className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-4">Taux de réponse</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: "76%" }}></div>
                </div>
                <span className="text-[20px] font-black text-white">76%</span>
              </div>
              <p className="text-[12px] text-gray-400">189 réponses auto sur 247 messages reçus</p>
            </div>

            {/* Conversion */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <p className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-4">Taux de conversion</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: "35%" }}></div>
                </div>
                <span className="text-[20px] font-black text-white">35%</span>
              </div>
              <p className="text-[12px] text-gray-400">18 conversions sur 52 prospects qualifiés</p>
            </div>

            {/* Per platform */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Par plateforme</p>
              </div>
              {[
                { name: "Instagram", msgs: 98, replies: 82, color: "#E1306C" },
                { name: "Facebook", msgs: 67, replies: 54, color: "#1877F2" },
                { name: "WhatsApp", msgs: 52, replies: 38, color: "#25D366" },
                { name: "Messenger", msgs: 30, replies: 15, color: "#00B2FF" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <div className="flex-1">
                    <p className="text-[14px] font-black text-white">{p.name}</p>
                    <p className="text-[12px] text-gray-400">{p.msgs} messages · {p.replies} réponses</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-black text-white">{Math.round(p.replies / p.msgs * 100)}%</p>
                    <p className="text-[10px] text-gray-400">réponse</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Activité récente</p>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { time: "5 min", platform: "Instagram", type: "message", text: "Nouveau message de @sarah_beauty" },
                  { time: "12 min", platform: "Facebook", type: "reply", text: "Réponse auto envoyée à Marie D." },
                  { time: "25 min", platform: "WhatsApp", type: "booking", text: "Réservation confirmée pour Jean P." },
                  { time: "1h", platform: "Instagram", type: "conversion", text: "Prospect converti : @lisa_nails" },
                ].map((a, i) => (
                  <div key={i} className="px-5 py-4 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${a.type === "message" ? "bg-blue-400/10" : a.type === "reply" ? "bg-purple-400/10" : a.type === "booking" ? "bg-green-400/10" : "bg-orange-400/10"}`}>
                      {a.type === "message" && <MessageCircle className="w-4 h-4 text-blue-400" />}
                      {a.type === "reply" && <Bot className="w-4 h-4 text-purple-400" />}
                      {a.type === "booking" && <Clock className="w-4 h-4 text-green-400" />}
                      {a.type === "conversion" && <TrendingUp className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{a.text}</p>
                      <p className="text-[11px] text-gray-400">{a.platform} · il y a {a.time}</p>
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
