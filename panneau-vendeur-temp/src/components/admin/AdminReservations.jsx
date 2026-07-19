import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Search } from "lucide-react";

const STATUS_COLORS = {
  en_attente: "bg-yellow-100 text-yellow-600",
  confirme: "bg-green-100 text-green-600",
  annule: "bg-red-100 text-red-500",
  termine: "bg-gray-100 text-gray-500",
  no_show: "bg-orange-100 text-orange-600",
};

const STATUS_LABELS = {
  en_attente: "En attente", confirme: "Confirmé", annule: "Annulé",
  termine: "Terminé", no_show: "No-show"
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.listReservations().then(setReservations).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = reservations.filter(r =>
    !search || r.client_email?.toLowerCase().includes(search.toLowerCase()) || r.service_name?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      await adminApi.updateReservationStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une réservation..." className="flex-1 bg-transparent text-gray-700 text-[13px] outline-none placeholder:text-gray-400" />
      </div>

      <p className="text-gray-500 text-[12px]">{filtered.length} réservation(s)</p>
      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-gray-900 text-[13px] font-black">{r.client_name || r.client_email}</p>
                <p className="text-gray-500 text-[11px]">{r.service_name} · {r.date} {r.time_slot}</p>
                <p className="text-primary text-[13px] font-black">{r.total_price ? `${r.total_price}€` : ""}</p>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-500"}`}>
                {STATUS_LABELS[r.status] || r.status}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["confirme", "termine", "annule", "no_show"].map(s => (
                <button key={s} onClick={() => updateStatus(r.id, s)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all active:scale-95 ${r.status === s ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucune réservation.</p>}
      </div>
    </div>
  );
}