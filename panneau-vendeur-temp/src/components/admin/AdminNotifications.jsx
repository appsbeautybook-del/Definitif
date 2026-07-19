import { useState } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Bell, Loader2, CheckCircle } from "lucide-react";

const TYPES = ["system", "promo", "reservation", "commande", "avis", "message"];

export default function AdminNotifications() {
  const [form, setForm] = useState({ target: "all", type: "system", title: "", body: "", link: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [history, setHistory] = useState([]);

  const send = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return;
    setSending(true);
    try {
      const result = await adminApi.sendNotification(form);
      setSent(result.sent);
      setHistory(prev => [{ ...form, sent: result.sent, at: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
      setForm(f => ({ ...f, title: "", body: "", link: "" }));
      setTimeout(() => setSent(null), 4000);
    } catch {}
    setSending(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <form onSubmit={send} className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4 shadow-sm">
        <h3 className="text-gray-900 text-[15px] font-black flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Envoyer une notification
        </h3>

        <div>
          <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest mb-1.5">Destinataire</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(f => ({ ...f, target: "all" }))}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${form.target === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
              Tous les utilisateurs
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, target: "" }))}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${form.target !== "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
              Utilisateur précis
            </button>
          </div>
          {form.target !== "all" && (
            <input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              placeholder="Email de l'utilisateur" required
              className="mt-2 w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />
          )}
        </div>

        <div>
          <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest mb-1.5">Type</p>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none">
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Titre de la notification *" required
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />

        <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          placeholder="Message *" required rows={3}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary resize-none" />

        <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
          placeholder="Lien (optionnel, ex: /boutique)"
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary" />

        <button type="submit" disabled={sending}
          className="w-full bg-primary text-white py-3.5 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2">
          {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : "Envoyer la notification →"}
        </button>

        {sent !== null && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-green-700 text-[13px] font-semibold">{sent} notification(s) envoyée(s) ✓</p>
          </div>
        )}
      </form>

      {history.length > 0 && (
        <div>
          <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest mb-3">Historique de session</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-900 text-[12px] font-black">{h.title}</p>
                    <p className="text-gray-500 text-[11px]">{h.target === "all" ? "Tous" : h.target} · {h.type}</p>
                  </div>
                  <span className="text-gray-400 text-[10px]">{h.sent} envoyée(s) · {h.at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}