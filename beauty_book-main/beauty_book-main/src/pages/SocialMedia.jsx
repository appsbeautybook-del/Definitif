import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { ArrowLeft, Sparkles, BarChart3, Settings, Zap, MessageSquare, Calendar, TrendingUp, ExternalLink, Check, Loader2 } from "lucide-react";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@votre_salon",
    color: "#E1306C",
    gradient: "from-pink-500 via-purple-500 to-orange-400",
    bgLight: "bg-gradient-to-br from-pink-50 to-purple-50",
    borderColor: "border-pink-200",
    oauthUrl: "https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT&scope=instagram_basic,instagram_manage_messages,instagram_manage_comments",
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "Page Votre Salon",
    color: "#1877F2",
    gradient: "from-blue-600 to-blue-500",
    bgLight: "bg-gradient-to-br from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    oauthUrl: "https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT&pages_manage_metadata,pages_messaging",
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@votre_salon",
    color: "#000000",
    gradient: "from-gray-900 to-gray-700",
    bgLight: "bg-gradient-to-br from-gray-50 to-slate-50",
    borderColor: "border-gray-200",
    oauthUrl: "https://www.tiktok.com/auth/authorize/?client_key=YOUR_KEY&response_type=code&scope=user.info.basic,video.list",
  },
  {
    id: "messenger",
    name: "Messenger",
    handle: "Page Votre Salon",
    color: "#00B2FF",
    gradient: "from-cyan-400 to-blue-500",
    bgLight: "bg-gradient-to-br from-cyan-50 to-blue-50",
    borderColor: "border-cyan-200",
    oauthUrl: "https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT&pages_messaging",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    handle: "+33 6 00 00 00 00",
    color: "#25D366",
    gradient: "from-green-500 to-emerald-500",
    bgLight: "bg-gradient-to-br from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    oauthUrl: "https://business.facebook.com/whatsapp/business/management/",
  },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Réponses automatiques",
    desc: "Maria répond aux messages entrants avec empathie et professionnalisme, 24h/24",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: TrendingUp,
    title: "Conversion commerciale",
    desc: "Qualifie les prospects et transforme les conversations en ventes concrètes",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Calendar,
    title: "Réservation automatique",
    desc: "Réserve directement les créneaux dans ton agenda professionnel",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Zap,
    title: "Relance intelligente",
    desc: "Relance automatique des prospects qui n'ont pas encore réservé",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

// SVG Icons modernes pour chaque plateforme
function PlatformIcon({ id, size = 24 }) {
  const icons = {
    instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-gradient)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="5" stroke="url(#ig-gradient)" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-gradient)"/>
        <defs>
          <linearGradient id="ig-gradient" x1="2" y1="22" x2="22" y2="2">
            <stop stopColor="#FEDA75"/>
            <stop offset="0.2" stopColor="#FA7E1E"/>
            <stop offset="0.4" stopColor="#D62976"/>
            <stop offset="0.6" stopColor="#962FBF"/>
            <stop offset="1" stopColor="#4F5BD5"/>
          </linearGradient>
        </defs>
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
        <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.434 5.507 3.676 7.212V22l3.397-1.863A11.42 11.42 0 0 0 12 20.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z" fill="url(#messenger-gradient)"/>
        <path d="M8 13l2.5-3 2 1.5 2.5-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="messenger-gradient" x1="2" y1="22" x2="22" y2="2">
            <stop stopColor="#00B2FF"/>
            <stop offset="1" stopColor="#9B59B6"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    whatsapp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.67 0-3.22-.506-4.507-1.37l-.323-.194-2.873.853.853-2.873-.194-.323A7.963 7.963 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" fill="#25D366"/>
      </svg>
    ),
  };
  return icons[id] || null;
}

export default function SocialMedia() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState(PLATFORMS.map(p => ({ ...p, connected: false, loading: false })));
  const [stats, setStats] = useState({ totalMessages: 0, conversions: 0, reservations: 0 });

  useEffect(() => {
    // Charger l'état des connexions depuis Supabase
    if (!user?.email) return;
    supabase.from('SocialConnections')
      .select('*')
      .eq('user_email', user.email)
      .then(({ data }) => {
        if (data) {
          setPlatforms(prev => prev.map(p => {
            const conn = data.find(d => d.platform === p.id);
            return conn ? { ...p, connected: true, handle: conn.handle || p.handle } : p;
          }));
        }
      }).catch(() => {});

    // Charger les stats Maria
    supabase.from('MariaStats')
      .select('*')
      .eq('user_email', user.email)
      .single()
      .then(({ data }) => {
        if (data) setStats({ totalMessages: data.total_messages || 0, conversions: data.conversions || 0, reservations: data.reservations || 0 });
      }).catch(() => {});
  }, [user?.email]);

  const handleConnect = async (platform) => {
    setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, loading: true } : p));

    // Simuler la connexion OAuth (en prod, rediriger vers le vrai OAuth)
    // Pour la démo, on simule un délai puis on connecte
    setTimeout(async () => {
      setPlatforms(prev => prev.map(p =>
        p.id === platform.id ? { ...p, connected: true, loading: false } : p
      ));

      // Sauvegarder en base
      if (user?.email) {
        await supabase.from('SocialConnections').upsert({
          user_email: user.email,
          platform: platform.id,
          handle: platform.handle,
          connected_at: new Date().toISOString(),
        }).catch(() => {});
      }
    }, 1500);
  };

  const handleDisconnect = async (platform) => {
    setPlatforms(prev => prev.map(p =>
      p.id === platform.id ? { ...p, connected: false } : p
    ));
    if (user?.email) {
      await supabase.from('SocialConnections')
        .delete()
        .eq('user_email', user.email)
        .eq('platform', platform.id)
        .catch(() => {});
    }
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="font-display min-h-screen bg-gray-50">
      {/* Header moderne avec gradient */}
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
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[22px] font-black text-white">{connectedCount}</p>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Connectées</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[22px] font-black text-white">{stats.totalMessages}</p>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Messages</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[22px] font-black text-orange-400">{stats.reservations}</p>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Réservations</p>
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
              Connectez vos réseaux sociaux pour que Maria AI puisse gérer vos messages entrants,
              qualifier les prospects et transformer les conversations en clients.
            </p>
          </div>
        </div>

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
                      {p.connected && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Connecté
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-400 truncate">{p.handle}</p>
                  </div>
                  {p.connected ? (
                    <button
                      onClick={() => handleDisconnect(p)}
                      className="px-4 py-2.5 rounded-xl text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Déconnecter
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(p)}
                      disabled={p.loading}
                      className="px-5 py-2.5 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: p.color === '#000000' ? '#1a1a1a' : p.color }}
                    >
                      {p.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" />
                          Connecter
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonctionnalités Maria AI */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Fonctionnalités Maria AI</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <p className="text-[13px] font-black text-gray-900 mb-1">{f.title}</p>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paramètres */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
            <span className="flex-1 text-left text-[14px] font-bold text-gray-700">Paramètres Maria AI</span>
            <span className="text-gray-300 text-lg">›</span>
          </button>
          <div className="h-px bg-gray-100 mx-4" />
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <span className="flex-1 text-left text-[14px] font-bold text-gray-700">Statistiques</span>
            <span className="text-gray-300 text-lg">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
