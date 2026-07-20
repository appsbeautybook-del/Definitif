import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Trash2, Eye, EyeOff, Search, Video, Image } from "lucide-react";

const TABS = ["Tous", "Réels", "Conseils", "Tutos"];

export default function AdminReels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tous");
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.listReels().then(setReels).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = reels.filter(r => {
    const matchTab = activeTab === "Tous" || r.category === activeTab;
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.author_name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleStatus = async (reel) => {
    try {
      const updated = await adminApi.toggleReelStatus(reel.id);
      setReels(prev => prev.map(r => r.id === reel.id ? { ...r, status: updated.status } : r));
    } catch {}
  };

  const deleteReel = async (id) => {
    if (!confirm("Supprimer ce reel ?")) return;
    try { await adminApi.deleteReel(id); } catch {}
    setReels(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 flex-1 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="flex-1 bg-transparent text-gray-700 text-[13px] outline-none placeholder:text-gray-400" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-2 rounded-xl text-[12px] font-black whitespace-nowrap transition-all ${activeTab === t ? "bg-primary text-white" : "bg-white text-gray-500 border border-gray-200"}`}>{t}</button>
          ))}
        </div>
      </div>

      <p className="text-gray-500 text-[12px]">{filtered.length} publication(s)</p>
      <div className="space-y-3">
        {filtered.map(reel => (
          <div key={reel.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
              {(reel.thumbnail_url || (reel.images && reel.images[0])) ? (
                <img src={reel.thumbnail_url || reel.images[0]} alt={reel.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {reel.video_url ? <Video className="w-5 h-5 text-gray-400" /> : <Image className="w-5 h-5 text-gray-400" />}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-[13px] font-black truncate">{reel.title}</p>
              <p className="text-gray-500 text-[11px]">{reel.author_name} · {reel.category}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-400 text-[10px]">❤️ {reel.likes || 0}</span>
                <span className="text-gray-400 text-[10px]">💬 {reel.comments || 0}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${reel.status === "publie" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                  {reel.status === "publie" ? "Publié" : "Masqué"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleStatus(reel)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center active:scale-95 transition-all">
                {reel.status === "publie" ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-green-500" />}
              </button>
              <button onClick={() => deleteReel(reel.id)} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center active:scale-95 transition-all">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucune publication trouvée.</p>}
      </div>
    </div>
  );
}