import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Trash2, Radio, Users } from "lucide-react";

export default function AdminLives() {
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listLives().then(setLives).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (live) => {
    try {
      const updated = await adminApi.toggleLiveStatus(live.id);
      setLives(prev => prev.map(l => l.id === live.id ? { ...l, status: updated.status } : l));
    } catch {}
  };

  const deleteLive = async (id) => {
    if (!confirm("Supprimer ce live ?")) return;
    try { await adminApi.deleteLive(id); } catch {}
    setLives(prev => prev.filter(l => l.id !== id));
  };

  const actifs = lives.filter(l => l.status === "live").length;

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {actifs > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <p className="text-red-700 text-[13px] font-semibold">{actifs} live(s) en cours</p>
        </div>
      )}

      <div className="space-y-3">
        {lives.map(live => (
          <div key={live.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
              {live.thumbnail_url ? (
                <img src={live.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Radio className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-[13px] font-black truncate">{live.title}</p>
              <p className="text-gray-500 text-[11px]">{live.host_name} · {live.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${live.status === "live" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                  {live.status === "live" ? "🔴 En direct" : "Terminé"}
                </span>
                <span className="text-gray-400 text-[10px] flex items-center gap-0.5"><Users className="w-3 h-3" /> {live.viewers || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleStatus(live)} className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95 ${live.status === "live" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}>
                {live.status === "live" ? "Terminer" : "Relancer"}
              </button>
              <button onClick={() => deleteLive(live.id)} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center active:scale-95">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {lives.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucun live.</p>}
      </div>
    </div>
  );
}