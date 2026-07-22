import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import {
  ArrowLeft, Instagram, Facebook, MessageCircle, Video, Send,
  Bot, CheckCircle2, Lock, Eye, EyeOff, Shield, Zap, Clock,
  Users, TrendingUp, BarChart3, ChevronRight, ExternalLink, Key
} from "lucide-react";

const PLATFORMS = [
  {
    id: "instagram", name: "Instagram", icon: Instagram, color: "#E1306C",
    gradient: "from-pink-500 to-purple-500", desc: "Gérez vos DMs et commentaires avec Maria AI",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAA...", type: "password", link: "https://developers.facebook.com/tools/explorer/" },
      { key: "businessId", label: "Business Account ID", placeholder: "17841400...", type: "text", link: "https://business.facebook.com/settings/" },
    ],
    features: ["Réponses auto DM", "Réponses commentaires", "Story replies", "Gestion des mentions"]
  },
  {
    id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2",
    gradient: "from-blue-600 to-blue-500", desc: "Automatisez vos messages Messenger et commentaires",
    fields: [
      { key: "pageAccessToken", label: "Page Access Token", placeholder: "EAA...", type: "password", link: "https://developers.facebook.com/tools/explorer/" },
      { key: "pageId", label: "Page ID", placeholder: "123456789...", type: "text", link: "https://www.facebook.com/settings/pages/" },
      { key: "verifyToken", label: "Verify Token", placeholder: "mon_token_secret", type: "password" },
    ],
    features: ["Messenger auto-reply", "Comment auto-reply", "Broadcast", "Lead generation"]
  },
  {
    id: "tiktok", name: "TikTok", icon: Video, color: "#000000",
    gradient: "from-gray-900 to-gray-700", desc: "Répondez aux commentaires et DMs TikTok",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "TikTok access token...", type: "password", link: "https://developers.tiktok.com/" },
      { key: "openId", label: "Open ID", placeholder: "open_id...", type: "text", link: "https://business.tiktok.com/" },
    ],
    features: ["Réponses commentaires", "DM automation", "Analytics"]
  },
  {
    id: "whatsapp", name: "WhatsApp Business", icon: Send, color: "#25D366",
    gradient: "from-green-500 to-emerald-500", desc: "Convertissez les prospects via WhatsApp",
    fields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "123456789...", type: "text", link: "https://developers.facebook.com/apps/" },
      { key: "accessToken", label: "Permanent Token", placeholder: "EAA...", type: "password", link: "https://business.facebook.com/wa/manage/" },
      { key: "businessAccountId", label: "WhatsApp Business Account ID", placeholder: "WABA ID...", type: "text", link: "https://business.facebook.com/wa/manage/" },
    ],
    features: ["Messages texte/image", "Templates WhatsApp", "Catalogue produits", "Paiements intégrés"]
  },
  {
    id: "messenger", name: "Messenger", icon: MessageCircle, color: "#00B2FF",
    gradient: "from-sky-500 to-blue-500", desc: "Messagerie instantanée avec IA",
    fields: [
      { key: "pageAccessToken", label: "Page Access Token", placeholder: "EAA...", type: "password", link: "https://developers.facebook.com/tools/explorer/" },
      { key: "pageId", label: "Page ID", placeholder: "123456789...", type: "text", link: "https://www.facebook.com/settings/pages/" },
    ],
    features: ["Réponses auto", "Handover protocol", "Persistent menu", "Bienvenue"]
  },
];

export default function SocialMedia() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark" || theme === "night";

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

  const c = {
    page: isDark ? "bg-[#0f0f1a]" : "bg-gray-50",
    header: isDark ? "bg-gray-900" : "bg-primary",
    card: isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100",
    cardActive: isDark ? "bg-white/10 border-white/15" : "bg-white border-primary/20 shadow-sm",
    text: isDark ? "text-white" : "text-gray-900",
    textSub: isDark ? "text-gray-400" : "text-gray-500",
    textMuted: isDark ? "text-gray-500" : "text-gray-400",
    badge: isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500",
    input: isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400",
    iconBg: isDark ? "bg-white/10" : "bg-gray-100",
    divider: isDark ? "border-white/10" : "border-gray-100",
    warning: isDark ? "bg-yellow-500/10 border-yellow-500/20" : "bg-amber-50 border-amber-200",
    success: isDark ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-green-50 border-green-200 text-green-600",
    statCard: isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-sm",
    progress: isDark ? "bg-white/5" : "bg-gray-100",
    tag: isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500",
  };

  return (
    <div className={`font-display min-h-screen ${c.page}`}>
      {/* Header */}
      <div className={`${c.header} px-5 pt-12 pb-6`}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className={`text-[24px] font-black ${isDark ? "text-white" : "text-white"}`}>Réseaux Sociaux</h1>
            <p className="text-[13px] text-white/60">Maria AI · Connectez vos plateformes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "platforms", label: "Plateformes" },
            { id: "stats", label: "Statistiques" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-2xl text-[14px] font-black transition-all ${activeTab === tab.id ? "bg-white text-gray-900" : "bg-white/10 text-white/70"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-32 space-y-4 pt-4">
        {activeTab === "platforms" && (
          <>
            {/* Status badge */}
            <div className={`flex items-center justify-between ${c.card} border rounded-2xl px-4 py-3`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${connectedCount > 0 ? "bg-green-400 animate-pulse" : isDark ? "bg-gray-600" : "bg-gray-300"}`}></div>
                <span className={`text-[13px] font-medium ${c.textSub}`}>
                  {connectedCount > 0 ? `${connectedCount} plateforme${connectedCount > 1 ? "s" : ""} active${connectedCount > 1 ? "s" : ""}` : "Aucune plateforme connectée"}
                </span>
              </div>
              {connectedCount > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>

            {/* Platform cards */}
            {platforms.map(p => {
              const Icon = p.icon;
              const isExpanded = expandedId === p.id;
              return (
                <div key={p.id} className={`rounded-3xl overflow-hidden transition-all border ${p.connected ? c.cardActive : c.card}`}>
                  {/* Header */}
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${p.gradient} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-[16px] font-black ${c.text}`}>{p.name}</p>
                        {p.connected && (
                          <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">ACTIF</span>
                        )}
                      </div>
                      <p className={`text-[12px] ${c.textSub} mt-0.5`}>{p.desc}</p>
                    </div>
                  </div>

                  {/* Features preview */}
                  {!isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.features.map((f, i) => (
                          <span key={i} className={`text-[10px] font-medium ${c.tag} px-2.5 py-1 rounded-full`}>{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded config */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* API Config */}
                      <div className={`${c.card} border rounded-2xl p-4 space-y-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-4 h-4 text-yellow-500" />
                          <p className={`text-[12px] font-black ${c.text} uppercase tracking-wider`}>Configuration API</p>
                        </div>
                        {p.fields.map(field => (
                          <div key={field.key}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className={`text-[12px] font-medium ${c.textSub}`}>{field.label}</p>
                              {field.link && (
                                <a href={field.link} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] text-blue-500 font-medium">
                                  Obtenir <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className={`flex items-center ${c.input} border rounded-xl overflow-hidden`}>
                              <input
                                type={p.showKeys[field.key] ? "text" : field.type}
                                value={p.keys[field.key] || ""}
                                onChange={e => setKey(p.id, field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className={`flex-1 bg-transparent text-[13px] px-4 py-3 outline-none font-mono ${c.text}`}
                              />
                              <button onClick={() => toggleShowKey(p.id, field.key)}
                                className={`px-3 ${c.textMuted}`}>
                                {p.showKeys[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Features */}
                      <div className={`${c.card} border rounded-2xl p-4`}>
                        <p className={`text-[12px] font-black ${c.text} uppercase tracking-wider mb-3`}>Fonctionnalités Maria AI</p>
                        <div className="space-y-2">
                          {p.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              </div>
                              <span className={`text-[13px] font-medium ${c.textSub}`}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Security */}
                      <div className={`flex items-start gap-3 ${c.warning} border rounded-2xl p-4`}>
                        <Shield className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[12px] font-black text-yellow-600 dark:text-yellow-400">Sécurité</p>
                          <p className={`text-[11px] ${c.textMuted} mt-0.5`}>Vos clés API sont chiffrées et stockées de manière sécurisée. Maria AI les utilise uniquement pour gérer vos messages.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="px-4 pb-4">
                    <div className="flex gap-2">
                      <button onClick={() => toggleConnect(p.id)}
                        className={`flex-1 py-3.5 rounded-2xl text-[14px] font-black transition-all active:scale-[0.98] ${p.connected ? "bg-red-50 text-red-500 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20" : isDark ? "bg-white text-gray-900" : "bg-primary text-white"}`}>
                        {p.connected ? "Déconnecter" : "Connecter"}
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className={`w-14 rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] ${isExpanded ? c.iconBg : c.badge}`}>
                        <ChevronRight className={`w-5 h-5 ${c.textSub} transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Help */}
            <div className="text-center py-4">
              <a href="https://docs.beautybook.app/api" target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-[13px] ${c.textMuted} font-medium`}>
                Besoin d'aide ? Consultez la documentation API
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </>
        )}

        {activeTab === "stats" && (
          <>
            {/* Performance header */}
            <div className={`${isDark ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/20" : "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"} border rounded-3xl p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${isDark ? "bg-purple-500/20" : "bg-purple-100"} rounded-xl flex items-center justify-center`}>
                  <BarChart3 className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                </div>
                <div>
                  <p className={`text-[16px] font-black ${c.text}`}>Performance globale</p>
                  <p className={`text-[12px] ${c.textSub}`}>Derniers 30 jours</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Messages", value: "247", icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+18%" },
                  { label: "Réponses auto", value: "189", icon: Bot, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+24%" },
                  { label: "Prospects", value: "52", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", trend: "+12%" },
                  { label: "Conversions", value: "18", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", trend: "+8%" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className={`${c.statCard} border rounded-2xl p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <span className="text-[10px] font-black text-green-500">{s.trend}</span>
                      </div>
                      <p className={`text-[20px] font-black ${c.text}`}>{s.value}</p>
                      <p className={`text-[11px] ${c.textMuted}`}>{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Response rate */}
            <div className={`${c.statCard} border rounded-3xl p-5`}>
              <p className={`text-[12px] font-black ${c.textMuted} uppercase tracking-wider mb-4`}>Taux de réponse</p>
              <div className="flex items-center gap-4 mb-3">
                <div className={`flex-1 h-4 ${c.progress} rounded-full overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: "76%" }}></div>
                </div>
                <span className={`text-[20px] font-black ${c.text}`}>76%</span>
              </div>
              <p className={`text-[12px] ${c.textSub}`}>189 réponses auto sur 247 messages reçus</p>
            </div>

            {/* Conversion */}
            <div className={`${c.statCard} border rounded-3xl p-5`}>
              <p className={`text-[12px] font-black ${c.textMuted} uppercase tracking-wider mb-4`}>Taux de conversion</p>
              <div className="flex items-center gap-4 mb-3">
                <div className={`flex-1 h-4 ${c.progress} rounded-full overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: "35%" }}></div>
                </div>
                <span className={`text-[20px] font-black ${c.text}`}>35%</span>
              </div>
              <p className={`text-[12px] ${c.textSub}`}>18 conversions sur 52 prospects qualifiés</p>
            </div>

            {/* Per platform */}
            <div className={`${c.statCard} border rounded-3xl overflow-hidden`}>
              <div className={`p-5 border-b ${c.divider}`}>
                <p className={`text-[12px] font-black ${c.textMuted} uppercase tracking-wider`}>Par plateforme</p>
              </div>
              {[
                { name: "Instagram", msgs: 98, replies: 82, color: "#E1306C" },
                { name: "Facebook", msgs: 67, replies: 54, color: "#1877F2" },
                { name: "WhatsApp", msgs: 52, replies: 38, color: "#25D366" },
                { name: "Messenger", msgs: 30, replies: 15, color: "#00B2FF" },
              ].map((p, i) => (
                <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b ${c.divider} last:border-0`}>
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <div className="flex-1">
                    <p className={`text-[14px] font-black ${c.text}`}>{p.name}</p>
                    <p className={`text-[12px] ${c.textSub}`}>{p.msgs} messages · {p.replies} réponses</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[16px] font-black ${c.text}`}>{Math.round(p.replies / p.msgs * 100)}%</p>
                    <p className={`text-[10px] ${c.textMuted}`}>réponse</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div className={`${c.statCard} border rounded-3xl overflow-hidden`}>
              <div className={`p-5 border-b ${c.divider}`}>
                <p className={`text-[12px] font-black ${c.textMuted} uppercase tracking-wider`}>Activité récente</p>
              </div>
              <div className={`divide-y ${c.divider}`}>
                {[
                  { time: "5 min", platform: "Instagram", type: "message", text: "Nouveau message de @sarah_beauty" },
                  { time: "12 min", platform: "Facebook", type: "reply", text: "Réponse auto envoyée à Marie D." },
                  { time: "25 min", platform: "WhatsApp", type: "booking", text: "Réservation confirmée pour Jean P." },
                  { time: "1h", platform: "Instagram", type: "conversion", text: "Prospect converti : @lisa_nails" },
                ].map((a, i) => (
                  <div key={i} className="px-5 py-4 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${a.type === "message" ? "bg-blue-500/10" : a.type === "reply" ? "bg-purple-500/10" : a.type === "booking" ? "bg-green-500/10" : "bg-orange-500/10"}`}>
                      {a.type === "message" && <MessageCircle className="w-4 h-4 text-blue-500" />}
                      {a.type === "reply" && <Bot className="w-4 h-4 text-purple-500" />}
                      {a.type === "booking" && <Clock className="w-4 h-4 text-green-500" />}
                      {a.type === "conversion" && <TrendingUp className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium ${c.text} truncate`}>{a.text}</p>
                      <p className={`text-[11px] ${c.textMuted}`}>{a.platform} · il y a {a.time}</p>
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
