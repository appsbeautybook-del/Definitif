import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Search } from "lucide-react";

const STATUS_COLORS = {
  en_attente: "bg-yellow-100 text-yellow-600",
  confirme: "bg-green-100 text-green-600",
  en_preparation: "bg-blue-100 text-blue-600",
  expedie: "bg-purple-100 text-purple-600",
  livre: "bg-green-100 text-green-700",
  annule: "bg-red-100 text-red-500",
};

const STATUS_LABELS = {
  en_attente: "En attente", confirme: "Confirmé", en_preparation: "En préparation",
  expedie: "Expédié", livre: "Livré", annule: "Annulé"
};

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.listCommandes().then(setCommandes).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = commandes.filter(c =>
    !search || c.client_email?.toLowerCase().includes(search.toLowerCase()) || c.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      await adminApi.updateCommandeStatus(id, status);
      setCommandes(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une commande..." className="flex-1 bg-transparent text-gray-700 text-[13px] outline-none placeholder:text-gray-400" />
      </div>

      <p className="text-gray-500 text-[12px]">{filtered.length} commande(s)</p>
      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-gray-900 text-[13px] font-black">{c.client_name || c.client_email}</p>
                <p className="text-gray-500 text-[11px]">{c.client_email}</p>
                <p className="text-primary text-[14px] font-black mt-1">{(c.total || 0).toFixed(2)}€</p>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>
                {STATUS_LABELS[c.status] || c.status}
              </span>
            </div>
            <div className="space-y-1 mb-3">
              {(c.items || []).slice(0, 3).map((item, i) => (
                <p key={i} className="text-gray-400 text-[11px]">• {item.name} x{item.quantity} — {item.price}€</p>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {["confirme", "en_preparation", "expedie", "livre", "annule"].map(s => (
                <button key={s} onClick={() => updateStatus(c.id, s)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all active:scale-95 ${c.status === s ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucune commande.</p>}
      </div>
    </div>
  );
}