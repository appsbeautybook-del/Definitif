import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { ArrowLeft, Sparkles, BarChart3, MessageSquare, Calendar, TrendingUp, ExternalLink, Check, Loader2, X, Settings, Eye, EyeOff, Save, AlertCircle, Key, Zap, Radio, Circle, Send, Users, Wifi, Video, VideoOff, Mic, MicOff, MessageCircle } from "lucide-react";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@votre_salon",
    color: "#E1306C",
    bgLight: "bg-gradient-to-br from-pink-50 to-purple-50",
    borderColor: "border-pink-200",
    apiPath: "/api/social/instagram/auth",
    fields: [
      { key: "app_id", label: "App ID Facebook/Instagram", placeholder: "Ex: 123456789", type: "text" },
      { key: "app_secret", label: "App Secret", placeholder: "Votre App Secret", type: "password" },
      { key: "redirect_uri", label: "Redirect URI", placeholder: "https://votre-domaine.com/auth/callback", type: "text" },
    ],
    docs: "https://developers.facebook.com/docs/instagram-api/getting-started",
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "Page Votre Salon",
    color: "#1877F2",
    bgLight: "bg-gradient-to-br from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    apiPath: "/api/social/facebook/auth",
    fields: [
      { key: "app_id", label: "App ID Facebook", placeholder: "Ex: 123456789", type: "text" },
      { key: "app_secret", label: "App Secret", placeholder: "Votre App Secret", type: "password" },
      { key: "redirect_uri", label: "Redirect URI", placeholder: "https://votre-domaine.com/auth/callback", type: "text" },
    ],
    docs: "https://developers.facebook.com/docs/pages-api/getting-started",
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@votre_salon",
    color: "#000000",
    bgLight: "bg-gradient-to-br from-gray-50 to-slate-50",
    borderColor: "border-gray-200",
    apiPath: "/api/social/tiktok/auth",
    fields: [
      { key: "client_key", label: "Client Key", placeholder: "Votre Client Key TikTok", type: "text" },
      { key: "client_secret", label: "Client Secret", placeholder: "Votre Client Secret", type: "password" },
      { key: "redirect_uri", label: "Redirect URI", placeholder: "https://votre-domaine.com/auth/callback", type: "text" },
    ],
    docs: "https://developers.tiktok.com/doc/getting-started-create-an-app",
  },
  {
    id: "messenger",
    name: "Messenger",
    handle: "Page Votre Salon",
    color: "#00B2FF",
    bgLight: "bg-gradient-to-br from-cyan-50 to-blue-50",
    borderColor: "border-cyan-200",
    apiPath: "/api/social/messenger/auth",
    fields: [
      { key: "app_id", label: "App ID Facebook", placeholder: "Ex: 123456789", type: "text" },
      { key: "app_secret", label: "App Secret", placeholder: "Votre App Secret", type: "password" },
      { key: "page_access_token", label: "Page Access Token", placeholder: "Token de votre page Facebook", type: "password" },
      { key: "page_id", label: "Page ID", placeholder: "ID de votre page Facebook", type: "text" },
    ],
    docs: "https://developers.facebook.com/docs/messenger-platform/getting-started",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    handle: "+33 6 00 00 00 00",
    color: "#25D366",
    bgLight: "bg-gradient-to-br from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    apiPath: "/api/social/whatsapp/auth",
    fields: [
      { key: "app_id", label: "App ID Facebook", placeholder: "Ex: 123456789", type: "text" },
      { key: "app_secret", label: "App Secret", placeholder: "Votre App Secret", type: "password" },
      { key: "access_token", label: "WhatsApp Access Token", placeholder: "Token WhatsApp Business", type: "password" },
      { key: "phone_number_id", label: "Phone Number ID", placeholder: "ID du numéro de téléphone", type: "text" },
      { key: "verify_token", label: "Verify Token (Webhook)", placeholder: "Token de vérification webhook", type: "text" },
    ],
    docs: "https://developers.facebook.com/docs/whatsapp/cloud-api/getting-started",
  },
];

function PlatformIcon({ id, size = 24 }) {
  const icons = {
    instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="5" stroke="url(#ig-grad)" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)"/>
        <defs><linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2"><stop stopColor="#FEDA75"/><stop offset="0.2" stopColor="#FA7E1E"/><stop offset="0.4" stopColor="#D62976"/><stop offset="0.6" stopColor="#962FBF"/><stop offset="1" stopColor="#4F5BD5"/></linearGradient></defs>
      </svg>
    ),
    facebook: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" fill="#1877F2"/>
      </svg>
    ),
    tiktok: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 8c1.5 1 3.5 1 5 0" stroke="#25F4EE" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14.5 8c1.5 1 3.5 1 5 0" stroke="#FE2C55" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    messenger: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.434 5.507 3.676 7.212V22l3.397-1.863A11.42 11.42 0 0 0 12 20.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z" fill="url(#msg-grad)"/>
        <path d="M8 13l2.5-3 2 1.5 2.5-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs><linearGradient id="msg-grad" x1="2" y1="22" x2="22" y2="2"><stop stopColor="#00B2FF"/><stop offset="1" stopColor="#9B59B6"/></linearGradient></defs>
      </svg>
    ),
    whatsapp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.67 0-3.22-.506-4.507-1.37l-.323-.194-2.873.853.853-2.873-.194-.323A7.963 7.963 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" fill="#25D366"/>
      </svg>
    ),
  };
  return icons[id] || null;
}

// ── Modal de configuration (fixé pour navbar) ──────────────────────────────
function CredentialsModal({ platform, onClose, onSave, existingCreds }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (existingCreds) setFormData(existingCreds);
  }, [existingCreds]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const requiredFields = platform.fields.filter(f => !f.key.includes('redirect_uri'));
    const missing = requiredFields.filter(f => !formData[f.key]);
    if (missing.length > 0) {
      setError(`Remplissez: ${missing.map(f => f.label).join(', ')}`);
      setSaving(false);
      return;
    }
    try {
      const res = await fetch('/api/social/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.id, credentials: formData }),
      });
      if (!res.ok) throw new Error('Erreur sauvegarde');
      onSave(formData);
      onClose();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl max-h-[75vh] flex flex-col overflow-hidden">
        {/* Header fixe */}
        <div className="shrink-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${platform.bgLight} rounded-xl flex items-center justify-center border ${platform.borderColor}`}>
              <PlatformIcon id={platform.id} size={20} />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-gray-900">{platform.name}</h3>
              <p className="text-[11px] text-gray-400">Configuration des identifiants</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] text-blue-700 font-medium">Identifiants requis</p>
              <p className="text-[11px] text-blue-500 mt-0.5">
                Récupérez vos clés depuis le{' '}
                <a href={platform.docs} target="_blank" rel="noopener" className="underline font-bold">tableau de bord développeur</a>
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-[12px] text-red-600 font-medium">{error}</p>
            </div>
          )}

          {platform.fields.map(field => (
            <div key={field.key}>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">{field.label}</label>
              <div className="relative">
                <input
                  type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                  value={formData[field.key] || ''}
                  onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#E8732A] transition-colors pr-10"
                />
                {field.type === 'password' && (
                  <button onClick={() => setShowPasswords(p => ({ ...p, [field.key]: !p[field.key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPasswords[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bouton fixe en bas */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: saving ? '#d1d5db' : platform.color === '#000000' ? '#1a1a1a' : platform.color }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page Live / Direct ─────────────────────────────────────────────────────
function LivePanel({ user, platforms, onClose }) {
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const chatEndRef = useRef(null);

  const connectedPlatforms = platforms.filter(p => p.connected);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const startLive = () => {
    if (!selectedPlatform) return;
    setIsLive(true);
    setViewerCount(Math.floor(Math.random() * 50) + 10);
    // Simuler des viewers qui rejoignent
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5));
    }, 5000);
    return () => clearInterval(interval);
  };

  const stopLive = () => {
    setIsLive(false);
    setViewerCount(0);
    setChatMessages([]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      user: user?.email?.split('@')[0] || 'Vous',
      text: newMessage,
      isMe: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setNewMessage("");
  };

  // Simuler des messages de viewers
  useEffect(() => {
    if (!isLive) return;
    const names = ["Sophie", "Marie", "Julie", "Emma", "Léa", "Chloé", "Camille", "Inès"];
    const texts = [
      "Super salon ! 💇‍♀️", "J'adore ce style !", "C'est où ?",
      "Réservation possible ?", "Les prix svp ?", "Magnifique résultat !",
      "Pour un relooking complet ?", "Vous faites les ongles aussi ?"
    ];
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          user: names[Math.floor(Math.random() * names.length)],
          text: texts[Math.floor(Math.random() * texts.length)],
          isMe: false,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col">
      {/* Header Live */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse">
              <Circle className="w-2 h-2 fill-current" /> LIVE
            </span>
          )}
          <span className="text-white text-[14px] font-bold">Direct</span>
        </div>
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="flex items-center gap-1 text-white/70 text-[12px]">
              <Users className="w-4 h-4" /> {viewerCount}
            </span>
          )}
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isLive ? (
        /* Sélection de plateforme */
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <Radio className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-white text-[20px] font-black mb-2">Démarrer un Direct</h2>
          <p className="text-white/50 text-[13px] text-center mb-8 max-w-xs">
            Diffusez en direct sur vos réseaux sociaux et interagissez avec votre audience en temps réel
          </p>

          {connectedPlatforms.length > 0 ? (
            <>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-3">Choisir la plateforme</p>
              <div className="w-full space-y-2 mb-8">
                {connectedPlatforms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      selectedPlatform === p.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <PlatformIcon id={p.id} size={24} />
                    <span className="text-white text-[14px] font-bold flex-1 text-left">{p.name}</span>
                    {selectedPlatform === p.id && <Check className="w-5 h-5 text-orange-500" />}
                  </button>
                ))}
              </div>
              <button
                onClick={startLive}
                disabled={!selectedPlatform}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
              >
                <span className="flex items-center justify-center gap-2">
                  <Video className="w-5 h-5" /> Lancer le Direct
                </span>
              </button>
            </>
          ) : (
            <div className="text-center">
              <Wifi className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-[13px]">Aucune plateforme connectée</p>
              <p className="text-white/25 text-[11px] mt-1">Connectez un réseau social d'abord</p>
            </div>
          )}
        </div>
      ) : (
        /* Live actif */
        <>
          {/* Zone vidéo simulée */}
          <div className="mx-4 bg-gray-800 rounded-2xl overflow-hidden relative" style={{ height: '35vh' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
              <div className="text-center">
                <Radio className="w-12 h-12 text-red-500 mx-auto mb-2 animate-pulse" />
                <p className="text-white text-[14px] font-bold">En direct</p>
                <p className="text-white/50 text-[11px]">{viewerCount} spectateurs</p>
              </div>
            </div>
            {/* Badge plateforme */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
              <PlatformIcon id={selectedPlatform} size={16} />
              <span className="text-white text-[11px] font-bold">{platforms.find(p => p.id === selectedPlatform)?.name}</span>
            </div>
          </div>

          {/* Chat Live */}
          <div className="flex-1 flex flex-col mx-4 mt-3 bg-gray-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Chat en direct</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.length === 0 && (
                <p className="text-white/30 text-[12px] text-center py-4">Les messages apparaîtront ici...</p>
              )}
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.isMe ? 'justify-end' : ''}`}>
                  {!msg.isMe && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-[8px] font-bold">{msg.user[0]}</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.isMe ? 'order-first' : ''}`}>
                    {!msg.isMe && <p className="text-orange-400 text-[10px] font-bold mb-0.5">{msg.user}</p>}
                    <div className={`px-3 py-2 rounded-2xl ${msg.isMe ? 'bg-orange-500 text-white rounded-br-md' : 'bg-gray-700 text-white rounded-bl-md'}`}>
                      <p className="text-[12px]">{msg.text}</p>
                    </div>
                    <p className="text-white/30 text-[9px] mt-0.5">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input chat */}
            <div className="p-3 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Écrire un message..."
                  className="flex-1 bg-gray-700 text-white text-[13px] rounded-full px-4 py-2.5 outline-none placeholder:text-white/30"
                />
                <button onClick={sendMessage} className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Contrôles Live */}
          <div className="px-4 py-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${micOn ? 'bg-white/10' : 'bg-red-500'}`}
            >
              {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${cameraOn ? 'bg-white/10' : 'bg-red-500'}`}
            >
              {cameraOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={stopLive}
              className="w-16 h-12 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-[10px] font-black uppercase">Stop</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const FEATURES = [
  { icon: MessageSquare, title: "Réponses auto", desc: "Maria répond 24h/24", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: TrendingUp, title: "Conversion", desc: "Prospects → Clients", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Calendar, title: "Réservation", desc: "Créneaux auto", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Zap, title: "Relance", desc: "Prospects froids", color: "text-purple-500", bg: "bg-purple-50" },
];

export default function SocialMedia() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState(PLATFORMS.map(p => ({ ...p, connected: false, loading: false, hasCredentials: false })));
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [configModal, setConfigModal] = useState(null);
  const [allCredentials, setAllCredentials] = useState({});
  const [showLive, setShowLive] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    supabase.from('SocialConnections')
      .select('*')
      .eq('user_email', user.email)
      .then(({ data }) => {
        if (data) {
          setPlatforms(prev => prev.map(p => {
            const conn = data.find(d => d.platform === p.id);
            return conn ? { ...p, connected: true, handle: conn.handle || conn.page_name || p.handle } : p;
          }));
        }
      }).catch(() => {});

    fetch('/api/social/credentials')
      .then(r => r.json())
      .then(data => {
        if (data.credentials) {
          const credsMap = {};
          data.credentials.forEach(c => { credsMap[c.platform] = c.credentials; });
          setAllCredentials(credsMap);
          setPlatforms(prev => prev.map(p => ({ ...p, hasCredentials: !!credsMap[p.id] })));
        }
      }).catch(() => {});

    loadStats();
  }, [user?.email]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await supabase.from('SocialMessages')
        .select('*')
        .eq('user_email', user?.email)
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (data) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const thisWeek = data.filter(m => (now - new Date(m.timestamp)) / (1000 * 60 * 60 * 24) <= 7);

        const messagesByDay = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now); date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          messagesByDay.push({
            date: dateStr,
            label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            count: data.filter(m => m.timestamp?.startsWith(dateStr))?.length || 0,
          });
        }

        const byPlatform = {};
        data.forEach(m => { byPlatform[m.platform] = (byPlatform[m.platform] || 0) + 1; });

        setStats({
          totalMessages: data.length,
          todayMessages: data.filter(m => m.timestamp?.startsWith(today)).length,
          weekMessages: thisWeek.length,
          responseRate: data.length > 0 ? Math.round((data.filter(m => m.reply).length / data.length) * 100) : 0,
          messagesByDay,
          byPlatform,
        });
      }
    } catch (e) { console.error(e); }
    setLoadingStats(false);
  };

  const handleConnect = async (platform) => {
    if (!platform.hasCredentials) { setConfigModal(platform); return; }
    setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, loading: true } : p));
    try {
      const res = await fetch(platform.apiPath);
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else if (data.setup_required) { setConfigModal(platform); setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, loading: false } : p)); }
    } catch (e) {
      setTimeout(() => {
        setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, connected: true, loading: false } : p));
        if (user?.email) {
          supabase.from('SocialConnections').upsert({ user_email: user.email, platform: platform.id, handle: platform.handle, connected_at: new Date().toISOString() }).catch(() => {});
        }
      }, 1500);
    }
  };

  const handleDisconnect = async (platform) => {
    setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, connected: false } : p));
    if (user?.email) {
      await supabase.from('SocialConnections').delete().eq('user_email', user.email).eq('platform', platform.id).catch(() => {});
    }
  };

  const handleSaveCredentials = (platformId, creds) => {
    setAllCredentials(prev => ({ ...prev, [platformId]: creds }));
    setPlatforms(prev => prev.map(p => p.id === platformId ? { ...p, hasCredentials: true } : p));
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="font-display min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(232,115,42,0.3) 0%, transparent 50%)" }} />
        <div className="relative px-5 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 border border-white/10">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-[22px] font-black text-white tracking-tight">Réseaux Sociaux</h1>
              <p className="text-[12px] text-orange-300 font-medium">Maria AI · Gestion & Conversion</p>
            </div>
            <button onClick={() => setShowLive(true)} className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30 active:scale-95">
              <Radio className="w-5 h-5 text-red-400" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setShowStats(!showStats)} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10 active:scale-95">
              <p className="text-[22px] font-black text-white">{connectedCount}</p>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Connectées</p>
            </button>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[22px] font-black text-white">{stats?.todayMessages || 0}</p>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Aujourd'hui</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[22px] font-black text-orange-400">{stats?.responseRate || 0}%</p>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Réponse</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-32 space-y-5 -mt-4 relative z-10">
        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
              Configurez vos identifiants API, connectez vos plateformes et lancez des directs depuis cette page.
            </p>
          </div>
        </div>

        {/* Bouton Live */}
        <button
          onClick={() => setShowLive(true)}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-[15px] font-black">Live / Direct</p>
            <p className="text-white/70 text-[11px] font-medium">Diffusez en direct sur vos réseaux</p>
          </div>
          <Video className="w-5 h-5 text-white/70" />
        </button>

        {/* Plateformes */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Plateformes</p>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">{connectedCount}/{platforms.length}</span>
          </div>
          <div className="space-y-3">
            {platforms.map(p => (
              <div key={p.id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${p.connected ? 'border-green-200 shadow-green-500/5' : 'border-gray-100'}`}>
                <div className="p-4 flex items-center gap-4">
                  <div className={`w-14 h-14 ${p.bgLight} rounded-2xl flex items-center justify-center shrink-0 border ${p.borderColor}`}>
                    <PlatformIcon id={p.id} size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-black text-gray-900">{p.name}</p>
                      {p.connected && <span className="flex items-center gap-1 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full"><Check className="w-3 h-3" /> Connecté</span>}
                      {!p.connected && p.hasCredentials && <span className="flex items-center gap-1 bg-blue-50 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full"><Key className="w-3 h-3" /> Configuré</span>}
                    </div>
                    <p className="text-[12px] text-gray-400 truncate">{p.handle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setConfigModal(p)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors" title="Configurer">
                      <Settings className="w-4 h-4 text-gray-500" />
                    </button>
                    {p.connected ? (
                      <button onClick={() => handleDisconnect(p)} className="px-4 py-2.5 rounded-xl text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-95">Déconnecter</button>
                    ) : (
                      <button onClick={() => handleConnect(p)} disabled={p.loading} className="px-5 py-2.5 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95 disabled:opacity-50" style={{ background: p.color === '#000000' ? '#1a1a1a' : p.color }}>
                        {p.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Connecter</span>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonctionnalités */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Fonctionnalités Maria AI</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <p className="text-[13px] font-black text-gray-900 mb-1">{f.title}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button onClick={() => setShowStats(!showStats)} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="flex-1 text-left text-[14px] font-bold text-gray-700">Statistiques</span>
            <span className={`text-gray-300 text-lg transition-transform ${showStats ? 'rotate-90' : ''}`}>›</span>
          </button>
          {showStats && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              {loadingStats ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1"><MessageSquare className="w-4 h-4 text-orange-500" /><span className="text-[10px] font-bold text-gray-400 uppercase">Total</span></div>
                      <p className="text-[20px] font-black text-gray-900">{stats.totalMessages}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-[10px] font-bold text-gray-400 uppercase">Semaine</span></div>
                      <p className="text-[20px] font-black text-gray-900">{stats.weekMessages}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Messages (7 jours)</p>
                    <div className="flex items-end gap-2 h-32">
                      {stats.messagesByDay.map((day, i) => {
                        const max = Math.max(...stats.messagesByDay.map(d => d.count), 1);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-gray-500">{day.count}</span>
                            <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '80px' }}>
                              <div className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-lg" style={{ height: `${Math.max((day.count / max) * 100, 4)}%`, marginTop: 'auto' }} />
                            </div>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">{day.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8"><BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-[13px] text-gray-400">Aucune donnée</p></div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Credentials */}
      {configModal && (
        <CredentialsModal
          platform={configModal}
          existingCreds={allCredentials[configModal.id]}
          onClose={() => setConfigModal(null)}
          onSave={(creds) => handleSaveCredentials(configModal.id, creds)}
        />
      )}

      {/* Panel Live */}
      {showLive && (
        <LivePanel
          user={user}
          platforms={platforms}
          onClose={() => setShowLive(false)}
        />
      )}
    </div>
  );
}
