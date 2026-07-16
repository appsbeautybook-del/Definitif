import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApiClient";
import { Search, Shield, User } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.listUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await adminApi.updateUserRole(user.id, newRole);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..." className="flex-1 bg-transparent text-gray-700 text-[13px] outline-none placeholder:text-gray-400" />
      </div>

      <p className="text-gray-500 text-[12px]">{filtered.length} utilisateur(s)</p>
      <div className="space-y-3">
        {filtered.map(u => (
          <div key={u.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {u.full_name ? (
                <span className="text-primary font-black text-[14px]">{u.full_name[0]?.toUpperCase()}</span>
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-[13px] font-black truncate">{u.full_name || "Sans nom"}</p>
              <p className="text-gray-500 text-[11px] truncate">{u.email}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"}`}>
                {u.role === "admin" ? "Admin" : "Utilisateur"}
              </span>
            </div>
            <button
              onClick={() => toggleRole(u)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black transition-all active:scale-95 ${
                u.role === "admin" ? "bg-gray-100 text-gray-600" : "bg-purple-100 text-purple-600"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {u.role === "admin" ? "Rétrograder" : "Promouvoir"}
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucun utilisateur trouvé.</p>}
      </div>
    </div>
  );
}