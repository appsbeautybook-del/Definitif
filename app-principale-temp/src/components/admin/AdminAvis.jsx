import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Trash2, Search } from "lucide-react";

export default function AdminAvis() {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.listAvis().then(setAvis).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = avis.filter(a =>
    !search || a.content?.toLowerCase().includes(search.toLowerCase()) || a.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteAvis = async (id) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try { await adminApi.deleteAvis(id); } catch {}
    setAvis(prev => prev.filter(a => a.id !== id));
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un avis..." className="flex-1 bg-transparent text-gray-700 text-[13px] outline-none placeholder:text-gray-400" />
      </div>

      <p className="text-gray-500 text-[12px]">{filtered.length} avis</p>
      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-start gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {a.user_avatar ? (
                <img src={a.user_avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="text-primary font-black text-[12px]">{a.user_name?.[0]?.toUpperCase() || "?"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-[12px] font-black">{a.user_name || a.user_email}</p>
              <p className="text-gray-600 text-[12px] mt-0.5 leading-relaxed">{a.content}</p>
              <p className="text-gray-400 text-[10px] mt-1">❤️ {a.likes || 0} · Style: {a.style_id?.slice(0, 8)}...</p>
            </div>
            <button onClick={() => deleteAvis(a.id)} className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center active:scale-95 shrink-0">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucun avis trouvé.</p>}
      </div>
    </div>
  );
}