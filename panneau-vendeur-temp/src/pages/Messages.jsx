import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, Search, MessageSquare, Trash2, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Scissors, Clock, ChevronRight, PhoneCall, Sparkles, Zap } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from "@/lib/AuthContext";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { useCall } from "@/components/call/CallManager";

// ── Maria AI Toggle ───────────────────────────────────────────────────────────
const MARIA_AI_KEY = "bb_maria_ai_active";

function MariaAIToggle({ active, onChange }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all active:scale-95 ${
        active
          ? "bg-violet-600 border-violet-600 shadow-lg shadow-violet-500/30"
          : "bg-white border-gray-200"
      }`}
    >
      <Sparkles className={`w-3.5 h-3.5 ${active ? "text-white" : "text-gray-400"}`} />
      <span className={`text-[11px] font-black ${active ? "text-white" : "text-gray-500"}`}>
        Maria AI
      </span>
      <div className={`w-7 h-4 rounded-full transition-all flex items-center px-0.5 ${active ? "bg-white/30" : "bg-gray-200"}`}>
        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-all ${active ? "translate-x-3" : "translate-x-0"}`} />
      </div>
    </button>
  );
}

// ── ConversationList ──────────────────────────────────────────────────────────
function ConversationList({ conversations, loading, onSelect, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  if (loading) {
    return (
      <div className="space-y-3 px-4 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
              <div className="h-3 bg-gray-100 rounded-full w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <MessageSquare className="w-12 h-12 text-gray-200" />
        <p className="text-[14px] font-bold text-gray-400">Aucun message</p>
        <p className="text-[12px] text-gray-300 font-medium text-center px-8">Commencez une conversation avec un professionnel</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {conversations.map((conv) => {
        const initials = (conv.other_name || conv.other_email || "?")[0].toUpperCase();
        const isConfirming = confirmId === conv.conversation_id;
        return (
          <div key={conv.conversation_id} className="relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 flex items-center">
              {isConfirming ? (
                <div className="flex h-full">
                  <button onClick={() => setConfirmId(null)} className="bg-gray-200 text-gray-700 text-[11px] font-black px-4 h-full">Annuler</button>
                  <button onClick={() => { onDelete(conv.conversation_id); setConfirmId(null); }} className="bg-red-500 text-white text-[11px] font-black px-4 h-full flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmId(conv.conversation_id)} className="bg-red-50 text-red-400 w-12 h-full flex items-center justify-center border-l border-gray-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => { setConfirmId(null); onSelect(conv); }}
              className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-all text-left ${isConfirming ? "pr-44" : "pr-14"}`}
            >
              <div className="relative shrink-0 w-12 h-12">
                {conv.other_avatar ? (
                  <img src={conv.other_avatar} alt={conv.other_name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-[16px] font-black text-primary">{initials}</span>
                  </div>
                )}
                {conv.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[9px] font-black">{conv.unread}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-[14px] font-black truncate ${conv.unread > 0 ? "text-gray-900" : "text-gray-700"}`}>
                    {conv.other_name || conv.other_email}
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium shrink-0 ml-2">
                    {conv.last_date ? timeAgo(conv.last_date) : ""}
                  </span>
                </div>
                <p className={`text-[12px] truncate mt-0.5 ${conv.unread > 0 ? "font-bold text-gray-700" : "font-medium text-gray-400"}`}>
                  {conv.last_message}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── ServiceCard dans le chat ──────────────────────────────────────────────────
function ServiceCard({ service, navigate }) {
  return (
    <button
      onClick={() => navigate(`/service/${service.id}`)}
      className="w-full text-left rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm active:scale-[0.98] transition-all"
    >
      {service.image_url ? (
        <div className="h-32 w-full overflow-hidden">
          <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-32 w-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
          <Scissors className="w-10 h-10 text-primary/40" />
        </div>
      )}
      <div className="p-3">
        <p className="text-[13px] font-black text-gray-900">{service.title}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span className="text-[11px] font-medium">{service.duration} min</span>
          </div>
          <span className="text-[15px] font-black text-primary">{service.price}€</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-primary">
          <span className="text-[11px] font-black">Voir le service</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </button>
  );
}

// ── Nettoyage markdown pour affichage naturel ────────────────────────────────
function cleanMarkdown(text) {
  if (!text) return text;
  return text
    .replace(/#{1,6}\s+/g, '')       // titres # ## ###
    .replace(/\*\*(.*?)\*\*/g, '$1') // **gras**
    .replace(/\*(.*?)\*/g, '$1')     // *italique*
    .replace(/__(.*?)__/g, '$1')     // __gras__
    .replace(/_(.*?)_/g, '$1')       // _italique_
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // `code`
    .replace(/^\s*[-*+]\s+/gm, '• ') // listes → bullet simple
    .replace(/^\s*\d+\.\s+/gm, '')   // listes numérotées
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [lien](url) → texte
    .replace(/^>\s+/gm, '')          // blockquotes
    .replace(/\n{3,}/g, '\n\n')      // trop de sauts de ligne
    .trim();
}

// ── Utilitaire temps relatif ──────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return "hier";
  return `il y a ${Math.floor(diff / 86400)} jours`;
}

// ── ChatView ──────────────────────────────────────────────────────────────────
function ChatView({ conversation, currentUser, onBack, onStartCall }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [serviceCardSent, setServiceCardSent] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const myTypingRef = useRef(null);

  const convId = conversation.conversation_id;

  // Charger les messages — on charge uniquement les messages où l'utilisateur est sender ou receiver
  const loadMessages = useCallback(async () => {
    const [sent, received] = await Promise.all([
      entities.MessageChat.filter({ conversation_id: convId, sender_email: currentUser.email }, "created_at", 200),
      entities.MessageChat.filter({ conversation_id: convId, receiver_email: currentUser.email }, "created_at", 200),
    ]);
    // Fusionner et dédoublonner
    const allById = {};
    for (const m of [...(sent || []), ...(received || [])]) allById[m.id] = m;
    const res = Object.values(allById)
      .filter(m => m.type !== "typing")
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    setMessages(res);
    // Marquer comme lus
    for (const m of res) {
      if (!m.read && m.receiver_email === currentUser.email) {
        entities.MessageChat.update(m.id, { read: true }).catch(() => {});
      }
    }
    setLoading(false);
  }, [convId, currentUser.email]);

  useEffect(() => {
    loadMessages().then(() => {
      // Envoyer la carte service automatiquement si on vient d'un service et pas encore envoyée
      if (conversation.service && !serviceCardSent) {
        setServiceCardSent(true);
        const serviceJson = JSON.stringify({
          type: "service_card",
          id: conversation.service.id,
          title: conversation.service.title,
          price: conversation.service.price,
          image_url: conversation.service.image_url,
          duration: conversation.service.duration,
        });
        /* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))("sendMessage", {
          receiver_email: conversation.other_email,
          content: serviceJson,
          conversation_id: convId,
          type: "text",
        }).catch(() => {});
      }
    });
  }, []);

  // Temps réel via subscription — vérifier que l'utilisateur appartient à la conversation
  useEffect(() => {
    const unsub = entities.MessageChat.subscribe((event) => {
      if (event.data?.conversation_id !== convId) return;
      const m = event.data;
      if (m.sender_email !== currentUser.email && m.receiver_email !== currentUser.email) return;

      // Typing indicator
      if (m.type === "typing" && m.sender_email !== currentUser.email) {
        setOtherTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
        // Supprimer le signal typing côté BDD silencieusement
        entities.MessageChat.delete(event.id).catch(() => {});
        return;
      }

      if (event.type === "create" && m.type !== "typing") {
        setMessages(prev => {
          if (prev.find(msg => msg.id === event.id)) return prev;
          return [...prev, m];
        });
        if (m.receiver_email === currentUser.email) {
          entities.MessageChat.update(event.id, { read: true }).catch(() => {});
        }
        setOtherTyping(false);
      }

      // Mise à jour du statut "lu" sur mes propres messages
      if (event.type === "update" && m.sender_email === currentUser.email) {
        setMessages(prev => prev.map(msg => msg.id === event.id ? { ...msg, read: m.read } : msg));
      }
    });
    return () => { unsub(); clearTimeout(typingTimeoutRef.current); };
  }, [convId, currentUser.email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Envoyer signal "typing" à l'autre utilisateur
  const sendTypingSignal = () => {
    clearTimeout(myTypingRef.current);
    entities.MessageChat.create({
      conversation_id: convId,
      sender_email: currentUser.email,
      receiver_email: conversation.other_email,
      content: "",
      type: "typing",
      read: false,
    }).catch(() => {});
    // Stopper le signal après 2.5s si l'utilisateur arrête d'écrire
    myTypingRef.current = setTimeout(() => {}, 2500);
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    clearTimeout(myTypingRef.current);
    setSending(true);
    const content = input.trim();
    setInput("");

    // Optimistic
    const optimistic = {
      id: `tmp_${Date.now()}`,
      sender_email: currentUser.email,
      receiver_email: conversation.other_email,
      content,
      created_date: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, optimistic]);

    await /* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))("sendMessage", {
      receiver_email: conversation.other_email,
      content,
      conversation_id: convId,
    });
    setSending(false);
    // Recharger pour remplacer le message optimiste par le vrai
    loadMessages();
  };

  const isReadonly = conversation.readonly;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        {conversation.other_avatar ? (
          <img src={conversation.other_avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-[13px] font-black text-primary">{(conversation.other_name || "?")[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-black text-gray-900 truncate">{conversation.other_name || conversation.other_email}</p>
          {otherTyping ? (
            <p className="text-[10px] text-primary font-bold flex items-center gap-1">
              <span>en train d'écrire</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </p>
          ) : (
            <p className="text-[10px] text-green-500 font-bold">● En ligne</p>
          )}
        </div>
        {onStartCall && !isReadonly && (
          <button
            onClick={() => onStartCall({ targetEmail: conversation.other_email, targetName: conversation.other_name || conversation.other_email, targetAvatar: conversation.other_avatar })}
            className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center active:scale-95 transition-all border border-orange-100"
          >
            <PhoneCall className="w-4 h-4 text-primary" />
          </button>
        )}
        {isReadonly && (
          <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Admin</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 hide-scrollbar">
        {loading ? (
          <div className="flex justify-center pt-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.map((m) => {
          const isMe = m.sender_email === currentUser.email;
          // Détecter une carte service
          let serviceData = null;
          try {
            const parsed = JSON.parse(m.content);
            if (parsed?.type === "service_card") serviceData = parsed;
          } catch {}

          return (
            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {serviceData ? (
                <div className="max-w-[80%]">
                  <p className={`text-[11px] font-medium mb-1.5 ${isMe ? "text-right text-gray-400" : "text-gray-400"}`}>
                    {isMe ? "Vous avez partagé un service" : "Service partagé"}
                  </p>
                  <ServiceCard service={serviceData} navigate={navigate} />
                </div>
              ) : (
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-snug ${
                  isMe ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
                }`}>
                  {cleanMarkdown(m.content)}
                </div>
              )}
              {/* Heure + statut de lecture */}
              <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <span className="text-[9px] text-gray-400 font-medium">{timeAgo(m.created_date)}</span>
                {isMe && (
                  <span className={`text-[11px] font-black ${m.read ? "text-primary" : "text-gray-300"}`}>
                    {m.read ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {/* Indicateur "en train d'écrire" style Snapchat */}
        {otherTyping && (
          <div className="flex items-start gap-2">
            <div className="flex items-center gap-1 bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — masqué en mode readonly (admin) */}
      {isReadonly ? (
        <div className="px-4 pb-5 pt-3 border-t border-gray-100 bg-gray-50">
          <p className="text-center text-[12px] text-gray-400 font-medium py-2">
            🔒 Vous ne pouvez pas répondre à ce message administrateur
          </p>
        </div>
      ) : (
        <div className="px-4 pb-5 pt-3 border-t border-gray-100 flex items-center gap-2 bg-white">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-3">
            <input
              value={input}
              onChange={e => { setInput(e.target.value); if (e.target.value) sendTypingSignal(); }}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Écrire un message..."
              className="flex-1 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── CallHistory ───────────────────────────────────────────────────────────────
function CallHistory({ user }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { startCall } = useCall() || {};

  useEffect(() => {
    if (!user) return;
    Promise.all([
      entities.CallLog.filter({ caller_email: user.email }, "-created_at", 50).catch(() => []),
      entities.CallLog.filter({ callee_email: user.email }, "-created_at", 50).catch(() => []),
    ]).then(([asCaller, asCallee]) => {
      // Dédoublonner par call_id
      const byId = {};
      for (const c of [...asCaller, ...asCallee]) byId[c.call_id] = c;
      const all = Object.values(byId).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setCalls(all);
      setLoading(false);
    });
  }, [user]);

  const statusConfig = {
    outgoing:  { label: "Appel émis",   color: "text-blue-500",  Icon: PhoneOutgoing },
    received:  { label: "Appel reçu",   color: "text-green-500", Icon: PhoneIncoming },
    missed:    { label: "Appel manqué", color: "text-red-500",   Icon: PhoneMissed   },
    rejected:  { label: "Appel refusé", color: "text-orange-400",Icon: PhoneMissed   },
  };

  const formatDuration = (sec) => {
    if (!sec || sec <= 0) return "";
    const m = Math.floor(sec / 60), s = sec % 60;
    return m > 0 ? `${m}m${s > 0 ? s + "s" : ""}` : `${s}s`;
  };

  if (loading) {
    return (
      <div className="space-y-3 px-4 pt-4">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
              <div className="h-3 bg-gray-100 rounded-full w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Phone className="w-12 h-12 text-gray-200" />
        <p className="text-[14px] font-bold text-gray-400">Aucun appel</p>
        <p className="text-[12px] text-gray-300 font-medium text-center px-8">Votre historique d'appels apparaîtra ici</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {calls.map((call) => {
        const isCaller = call.caller_email === user.email;
        const otherEmail = isCaller ? call.callee_email : call.caller_email;
        const otherName  = isCaller ? (call.callee_name || call.callee_email) : (call.caller_name || call.caller_email);
        const otherAvatar = isCaller ? call.callee_avatar : call.caller_avatar;

        // Status du point de vue de l'utilisateur courant
        let displayStatus = call.status;
        if (call.status === "missed" && isCaller) displayStatus = "outgoing"; // il a appelé mais pas répondu

        const cfg = statusConfig[displayStatus] || statusConfig.missed;
        const { label, color, Icon } = cfg;
        const dur = formatDuration(call.duration_sec);

        return (
          <div key={call.id} className="flex items-center gap-3 px-4 py-4">
            <div className="relative shrink-0">
              {otherAvatar ? (
                <img src={otherAvatar} alt={otherName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-[16px] font-black text-primary">{(otherName || "?")[0].toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-gray-800 truncate">{otherName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className={`text-[11px] font-bold ${color}`}>{label}</span>
                {dur && <span className="text-[10px] text-gray-400 font-medium">· {dur}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium">
                {call.started_at
                  ? new Date(call.started_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  : call.created_date ? new Date(call.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
              {startCall && (
                <button
                  onClick={() => startCall({ targetEmail: otherEmail, targetName: otherName, targetAvatar: otherAvatar })}
                  className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { startCall } = useCall() || {};
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("messages");
  const [mariaAIActive, setMariaAIActive] = useState(() => localStorage.getItem(MARIA_AI_KEY) === "1");
  const [isPro, setIsPro] = useState(false);
  const mariaAIRef = useRef(mariaAIActive);
  const processedMsgIds = useRef(new Set());
  const deletedConvIds = useRef(new Set());

  const handleRefresh = useCallback(() => loadConversations(), []);
  const { containerRef, pulling, pullDistance } = usePullToRefresh(handleRefresh);

  // Vérifier si l'utilisateur est un professionnel
  useEffect(() => {
    if (!user) return;
    entities.ProfilPro.filter({ user_email: user.email }, '-created_at', 1)
      .then(res => setIsPro(res.length > 0))
      .catch(() => setIsPro(false));
  }, [user]);

  // Sync mariaAIRef avec l'état
  useEffect(() => {
    mariaAIRef.current = mariaAIActive;
    localStorage.setItem(MARIA_AI_KEY, mariaAIActive ? "1" : "0");
  }, [mariaAIActive]);

  // Écouter les nouveaux messages entrants pour Maria AI
  useEffect(() => {
    if (!user) return;
    const unsub = entities.MessageChat.subscribe(async (event) => {
      if (event.type !== "create") return;
      const m = event.data;
      // Seulement les messages reçus par le pro (user courant), pas les siens
      if (m.receiver_email !== user.email) return;
      if (m.type === "typing") return;
      if (processedMsgIds.current.has(event.id)) return;
      if (!mariaAIRef.current) return;
      if (deletedConvIds.current.has(m.conversation_id)) return;

      processedMsgIds.current.add(event.id);

      // Délai naturel (~2s) avant que Maria réponde
      setTimeout(async () => {
        try {
          await /* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))("mariaAutoReply", {
            conversation_id: m.conversation_id,
            client_email: m.sender_email,
            client_name: m.sender_name || m.sender_email,
            pro_email: user.email,
            client_message: m.content,
          });
        } catch (e) {
          console.error("Maria AI reply error:", e);
        }
      }, 1800 + Math.random() * 1200);
    });
    return () => unsub();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const sent = await entities.MessageChat.filter({ sender_email: user.email }, "-created_at", 200);
      const received = await entities.MessageChat.filter({ receiver_email: user.email }, "-created_at", 200);
      const allMessages = [...sent, ...received];

      const convMap = {};
      for (const m of allMessages) {
        const cid = m.conversation_id;
        if (!convMap[cid] || new Date(m.created_date) > new Date(convMap[cid].created_date)) {
          convMap[cid] = m;
        }
      }

      const convs = Object.values(convMap).map(m => {
        const isMe = m.sender_email === user.email;
        const otherEmail = isMe ? m.receiver_email : m.sender_email;
        const otherName = isMe ? (m.receiver_name || m.receiver_email) : (m.sender_name || m.sender_email);
        const otherAvatar = isMe ? (m.receiver_avatar || null) : (m.sender_avatar || null);
        const unread = allMessages.filter(msg =>
          msg.conversation_id === m.conversation_id &&
          !msg.read &&
          msg.receiver_email === user.email
        ).length;
        // Si le dernier message est une carte service, afficher un résumé lisible
        let lastMessage = m.content;
        try {
          const parsed = JSON.parse(m.content);
          if (parsed?.type === "service_card") lastMessage = `✂️ ${parsed.title} — ${parsed.price}€`;
        } catch {}
        return {
          conversation_id: m.conversation_id,
          other_email: otherEmail,
          other_name: otherName,
          other_avatar: otherAvatar,
          last_message: lastMessage,
          last_date: m.created_date,
          unread,
        };
      });

      convs.sort((a, b) => new Date(b.last_date) - new Date(a.last_date));
      setConversations(convs);
    } catch (e) {
      console.error("loadConversations error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  // Temps réel sur la liste des conversations
  useEffect(() => {
    if (!user) return;
    const unsub = entities.MessageChat.subscribe((event) => {
      if (event.type === "create") {
        const m = event.data;
        if (m.sender_email !== user.email && m.receiver_email !== user.email) return;
        // Rafraîchir la liste
        loadConversations();
      }
    });
    return unsub;
  }, [user]);

  // Ouvrir directement une conv si ?to= dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toEmail = params.get("to");
    const toName = params.get("name");
    const serviceId = params.get("service_id");
    const serviceTitle = params.get("service");
    const servicePrice = params.get("service_price");
    const serviceImg = params.get("service_img");
    const serviceDuration = params.get("service_duration");
    const readonly = params.get("readonly") === "1";
    if (toEmail && user) {
      const convId = [user.email, toEmail].sort().join("_");
      setActiveConv({
        conversation_id: convId,
        other_email: toEmail,
        other_name: toName ? decodeURIComponent(toName) : toEmail,
        other_avatar: null,
        readonly,
        service: serviceId ? {
          id: serviceId,
          title: serviceTitle ? decodeURIComponent(serviceTitle) : "",
          price: servicePrice ? Number(servicePrice) : 0,
          image_url: serviceImg ? decodeURIComponent(serviceImg) : "",
          duration: serviceDuration ? Number(serviceDuration) : 60,
        } : null,
      });
    }
  }, [location.search, user]);

  const deleteConversation = async (conversationId) => {
    // Ne supprimer que les messages où l'utilisateur est sender ou receiver
    const [sent, received] = await Promise.all([
      entities.MessageChat.filter({ conversation_id: conversationId, sender_email: user.email }, null, 200).catch(() => []),
      entities.MessageChat.filter({ conversation_id: conversationId, receiver_email: user.email }, null, 200).catch(() => []),
    ]);
    const allById = {};
    for (const m of [...sent, ...received]) allById[m.id] = m;
    await Promise.all(Object.values(allById).map(m => entities.MessageChat.delete(m.id).catch(() => {})));
    deletedConvIds.current.add(conversationId);
    setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
  };

  const filtered = conversations.filter(c =>
    (c.other_name || c.other_email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (activeConv) {
    return <ChatView conversation={activeConv} currentUser={user} onBack={() => { setActiveConv(null); loadConversations(); }} onStartCall={startCall} />;
  }

  return (
    <div ref={containerRef} className="font-display bg-white min-h-full flex flex-col">
      {pullDistance > 10 && (
        <div className="flex items-center justify-center overflow-hidden transition-all" style={{ height: pullDistance * 0.5 }}>
          <div className={`w-6 h-6 border-2 border-primary border-t-transparent rounded-full ${pulling ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullDistance * 2}deg)` }} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <h1 className="text-[20px] font-black text-gray-900 flex-1">Messagerie</h1>
        <div className="flex items-center gap-2">
          {tab === "messages" && conversations.some(c => c.unread > 0) && (
            <span className="bg-primary text-white text-[11px] font-black px-2.5 py-1 rounded-full">
              {conversations.reduce((s, c) => s + (c.unread || 0), 0)} non lus
            </span>
          )}
          {isPro && <MariaAIToggle active={mariaAIActive} onChange={setMariaAIActive} />}
        </div>
      </div>

      {/* Bandeau Maria AI actif */}
      {isPro && mariaAIActive && (
        <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border-b border-violet-100">
          <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <p className="text-[11px] font-bold text-violet-700">
            Maria AI répond automatiquement à vos clients et les aide à réserver
          </p>
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse ml-auto shrink-0" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        <button onClick={() => setTab("messages")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-black border-b-2 transition-all ${tab === "messages" ? "border-primary text-primary" : "border-transparent text-gray-400"}`}>
          <MessageSquare className="w-4 h-4" /> Messages
        </button>
        <button onClick={() => setTab("calls")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-black border-b-2 transition-all ${tab === "calls" ? "border-primary text-primary" : "border-transparent text-gray-400"}`}>
          <Phone className="w-4 h-4" /> Appels
        </button>
      </div>

      {tab === "messages" && (
        <>
          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          <ConversationList
            conversations={filtered}
            loading={loading}
            onSelect={setActiveConv}
            onDelete={deleteConversation}
          />
        </>
      )}

      {tab === "calls" && <CallHistory user={user} />}
    </div>
  );
}