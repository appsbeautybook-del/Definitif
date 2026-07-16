import { useState, useEffect, useRef } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Send, MessageSquare, RefreshCw, Sparkles } from "lucide-react";

const ADMIN_EMAIL = "admin@beautybook.fr";

const QUICK_REPLIES = [
  "Merci pour votre intérêt ! Nous vous contacterons très prochainement.",
  "Bonjour, pouvez-vous me préciser votre disponibilité pour une visite ?",
  "Cette offre est toujours disponible. Souhaitez-vous planifier une visite ?",
  "Votre demande a bien été reçue. Un conseiller vous rappellera sous 24h.",
  "Pour plus d'informations, n'hésitez pas à nous appeler au +33 1 00 00 00 00.",
];

function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Conversations</p>
      </div>
      {conversations.length === 0 && (
        <p className="text-gray-400 text-[12px] text-center py-8">Aucune conversation</p>
      )}
      {conversations.map(conv => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 text-left hover:bg-gray-50 transition-all ${activeId === conv.id ? "bg-orange-50 border-l-2 border-l-primary" : ""}`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-black">
            {(conv.sender_name || conv.sender_email || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-gray-900 truncate">{conv.sender_name || conv.sender_email}</p>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">{new Date(conv.lastDate).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          {conv.unread > 0 && (
            <span className="w-5 h-5 bg-primary rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0">{conv.unread}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function MessageThread({ messages, adminEmail, onSend }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (text) => {
    const content = text || input.trim();
    if (!content) return;
    setSending(true);
    setInput("");
    setShowQuick(false);
    await onSend(content);
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => {
          const isAdmin = msg.sender_email === adminEmail;
          return (
            <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                isAdmin ? "bg-primary text-white rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isAdmin ? "text-white/60" : "text-gray-400"}`}>
                  {new Date(msg.created_date || msg.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Réponses suggérées */}
      {showQuick && (
        <div className="px-3 py-2 bg-white border-t border-gray-100 space-y-1 max-h-40 overflow-y-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">✨ Réponses suggérées</p>
          {QUICK_REPLIES.map((r, i) => (
            <button key={i} onClick={() => handleSend(r)}
              className="w-full text-left text-[12px] text-gray-700 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 hover:bg-orange-100 transition-all active:scale-[0.98]">
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 bg-white border-t border-gray-200 flex items-end gap-2">
        <button
          onClick={() => setShowQuick(v => !v)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${showQuick ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}
          title="Réponses suggérées"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Répondre..."
          rows={1}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || sending}
          className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shrink-0"
        >
          {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  );
}

export default function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      // Récupérer tous les messages adressés à l'admin
      const { data } = await adminApi.filterMessages({ receiver_email: ADMIN_EMAIL }, "-created_at", 200).catch(() => ({ data: { results: [] } }));
      const msgs = data.results || [];

      // Grouper par conversation_id
      const convMap = {};
      for (const msg of msgs) {
        const cid = msg.conversation_id;
        if (!convMap[cid]) {
          convMap[cid] = {
            id: cid,
            sender_email: msg.sender_email,
            sender_name: msg.sender_name || msg.sender_email,
            lastMessage: msg.content,
            lastDate: msg.created_date,
            unread: 0,
          };
        }
        if (!msg.read) convMap[cid].unread = (convMap[cid].unread || 0) + 1;
        if (new Date(msg.created_date) > new Date(convMap[cid].lastDate)) {
          convMap[cid].lastMessage = msg.content;
          convMap[cid].lastDate = msg.created_date;
        }
      }

      // Inclure aussi les conversations où l'admin a répondu
      const { data: sentData } = await adminApi.filterMessages({ sender_email: ADMIN_EMAIL }, "-created_at", 100).catch(() => ({ data: { results: [] } }));
      const sentMsgs = sentData.results || [];

      for (const msg of sentMsgs) {
        const cid = msg.conversation_id;
        if (!convMap[cid]) {
          convMap[cid] = {
            id: cid,
            sender_email: msg.receiver_email,
            sender_name: msg.receiver_name || msg.receiver_email,
            lastMessage: msg.content,
            lastDate: msg.created_date,
            unread: 0,
          };
        }
      }

      const sorted = Object.values(convMap).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
      setConversations(sorted);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadConversation = async (conv) => {
    setActiveConv(conv);
    try {
      // Marquer les messages comme lus
      const { data: convData } = await adminApi.filterMessages({ conversation_id: conv.id }, "created_at", 100).catch(() => ({ data: { results: [] } }));
      const all = convData.results || [];
      setMessages(all);

      // Marquer comme lus
      for (const msg of all.filter(m => m.receiver_email === ADMIN_EMAIL && !m.read)) {
        await adminApi.updateMessage(msg.id, { read: true }).catch(() => {});
      }
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
    } catch (e) { console.error(e); }
  };

  const handleSend = async (content) => {
    if (!activeConv) return;
    const { data: msgData } = await adminApi.createMessage({
      conversation_id: activeConv.id,
      sender_email: ADMIN_EMAIL,
      sender_name: "BeautyBook Admin",
      receiver_email: activeConv.sender_email,
      receiver_name: activeConv.sender_name,
      content,
      type: "text",
      read: false,
    });
    setMessages(prev => [...prev, msgData.result]);
    setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, lastMessage: content, lastDate: new Date().toISOString() } : c));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    if (activeConv) await loadConversation(activeConv);
    setRefreshing(false);
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Sidebar conversations */}
      <div className="w-72 border-r border-gray-200 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-black text-gray-900">Messages</span>
            {conversations.some(c => c.unread > 0) && (
              <span className="w-5 h-5 bg-primary rounded-full text-white text-[10px] font-black flex items-center justify-center">
                {conversations.reduce((s, c) => s + (c.unread || 0), 0)}
              </span>
            )}
          </div>
          <button onClick={handleRefresh} className={`w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center active:scale-95 ${refreshing ? "animate-spin" : ""}`}>
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
        <ConversationList conversations={conversations} activeId={activeConv?.id} onSelect={loadConversation} />
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 bg-white shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center text-white text-[13px] font-black">
                {(activeConv.sender_name || "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-black text-gray-900">{activeConv.sender_name}</p>
                <p className="text-[11px] text-gray-400">{activeConv.sender_email}</p>
              </div>
            </div>
            <MessageThread messages={messages} adminEmail={ADMIN_EMAIL} onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <MessageSquare className="w-12 h-12 text-gray-200" />
            <p className="text-[13px] font-medium">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}