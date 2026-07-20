import { useState, useEffect } from "react";
import { adminApi } from '@/lib/adminApiClient';
import {
  Users, Award, TrendingUp, Star, Gift, Settings,
  Search, RefreshCw, ChevronDown, ChevronUp, Loader2,
  Plus, Minus, Save, Trash2, Edit3, X, Check
} from "lucide-react";

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary";

// ── Config niveaux & points (modifiables via AppConfig) ──────────────────────
const DEFAULT_CONFIG = {
  client: {
    levels: [
      { name: "Silver", pts: 0, emoji: "🥈", perks: ["Accès aux récompenses de base"] },
      { name: "Gold", pts: 1000, emoji: "🥇", perks: ["–5% sur tous les services", "Support prioritaire"] },
      { name: "Platinum", pts: 2500, emoji: "💎", perks: ["–10% sur tous les services", "Accès VIP", "Cadeau anniversaire"] },
    ],
    earn_rules: [
      { action: "reservation", label: "Réservation service", pts: 50 },
      { action: "avis", label: "Laisser un avis", pts: 30 },
      { action: "commande_10", label: "Achat boutique (par 10€)", pts: 10 },
      { action: "parrainage", label: "Parrainer un(e) ami(e)", pts: 200 },
      { action: "rdv_honore", label: "RDV honoré sans annulation", pts: 20 },
    ],
  },
  pro: {
    levels: [
      { name: "Bronze", pts: 0, emoji: "🥉", perks: ["Visibilité standard"] },
      { name: "Silver", pts: 500, emoji: "🥈", perks: ["Badge Silver", "-5% commission"] },
      { name: "Gold", pts: 2000, emoji: "🥇", perks: ["Badge Gold + mise en avant", "-10% commission", "Stats avancées"] },
      { name: "Elite", pts: 5000, emoji: "💎", perks: ["Badge Elite", "0% commission", "Manager dédié"] },
    ],
    earn_rules: [
      { action: "pro_reservation", label: "Réservation confirmée", pts: 30 },
      { action: "pro_avis_recu", label: "Avis 5 étoiles reçu", pts: 40 },
      { action: "pro_service_cree", label: "Nouveau service publié", pts: 20 },
      { action: "pro_parrainage_pro", label: "Parrainer un autre pro", pts: 500 },
      { action: "pro_abonnement", label: "Renouvellement abonnement", pts: 100 },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Stats Card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-[22px] font-black text-gray-900">{value}</p>
        <p className="text-[11px] font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Membres tableau
// ─────────────────────────────────────────────────────────────────────────────
function MembresTable({ records, type, onAdjustPoints }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("pts_desc");
  const [adjusting, setAdjusting] = useState(null); // id en cours
  const [delta, setDelta] = useState("");
  const [deltaLabel, setDeltaLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const emailField = type === "client" ? "user_email" : "pro_email";

  const filtered = records
    .filter(r => (r[emailField] || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const ptA = (a.points_total || 0) - (a.points_depenses || 0);
      const ptB = (b.points_total || 0) - (b.points_depenses || 0);
      if (sortBy === "pts_desc") return ptB - ptA;
      if (sortBy === "pts_asc") return ptA - ptB;
      return 0;
    });

  const handleSave = async (record) => {
    const d = parseInt(delta);
    if (!d || isNaN(d)) return;
    setSaving(true);
    await onAdjustPoints(record, d, deltaLabel || (d > 0 ? "Ajustement admin +" + d : "Ajustement admin " + d), type);
    setAdjusting(null);
    setDelta("");
    setDeltaLabel("");
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par email..." className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none" />
          {search && <button onClick={() => setSearch("")}><X className="w-3 h-3 text-gray-400" /></button>}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-100 border-0 rounded-xl px-3 py-2.5 text-[12px] text-gray-700 outline-none">
          <option value="pts_desc">Points ↓</option>
          <option value="pts_asc">Points ↑</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 text-[13px] py-8">Aucun membre trouvé</p>
      )}

      <div className="space-y-2">
        {filtered.slice(0, 50).map(record => {
          const pts = (record.points_total || 0) - (record.points_depenses || 0);
          const isAdj = adjusting === record.id;
          return (
            <div key={record.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-gray-900 truncate">{record[emailField]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-black text-primary">{pts.toLocaleString()} pts</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{record.niveau}</span>
                    {record.reservations_count > 0 && (
                      <span className="text-[10px] text-gray-400">{record.reservations_count} RDV</span>
                    )}
                  </div>
                </div>
                <button onClick={() => { setAdjusting(isAdj ? null : record.id); setDelta(""); setDeltaLabel(""); }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isAdj ? "bg-gray-200 text-gray-600" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {isAdj && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Ajustement manuel des points</p>
                  <div className="flex gap-2">
                    <input type="number" value={delta} onChange={e => setDelta(e.target.value)}
                      placeholder="+50 ou -100" className={inputCls + " flex-1"} />
                    <input value={deltaLabel} onChange={e => setDeltaLabel(e.target.value)}
                      placeholder="Motif (optionnel)" className={inputCls + " flex-1"} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(record)} disabled={saving || !delta}
                      className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-[12px] font-black disabled:opacity-50 active:scale-95">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Appliquer
                    </button>
                    <button onClick={() => setAdjusting(null)} className="px-4 py-2 bg-gray-100 rounded-xl text-[12px] font-bold text-gray-600 active:scale-95">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length > 50 && <p className="text-center text-[11px] text-gray-400">Affichage des 50 premiers résultats</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Config niveaux & règles
// ─────────────────────────────────────────────────────────────────────────────
function ConfigPanel({ config, type, onSave }) {
  const [levels, setLevels] = useState(config.levels || []);
  const [rules, setRules] = useState(config.earn_rules || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateLevel = (i, field, val) => setLevels(l => l.map((lv, idx) => idx === i ? { ...lv, [field]: field === "pts" ? parseInt(val) || 0 : val } : lv));
  const updateRule = (i, field, val) => setRules(r => r.map((ru, idx) => idx === i ? { ...ru, [field]: field === "pts" ? parseInt(val) || 0 : val } : ru));

  const save = async () => {
    setSaving(true);
    await onSave(type, { levels, earn_rules: rules });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Niveaux */}
      <div>
        <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-3">Niveaux & seuils de points</p>
        <div className="space-y-2">
          {levels.map((lv, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[20px]">{lv.emoji}</span>
                <input value={lv.name} onChange={e => updateLevel(i, "name", e.target.value)} placeholder="Nom du niveau" className={inputCls + " flex-1"} />
                <input type="number" value={lv.pts} onChange={e => updateLevel(i, "pts", e.target.value)} placeholder="Pts requis" className={inputCls + " w-28"} />
              </div>
              <input value={lv.emoji} onChange={e => updateLevel(i, "emoji", e.target.value)} placeholder="Emoji" className={inputCls} />
              <input value={(lv.perks || []).join(" | ")} onChange={e => updateLevel(i, "perks", e.target.value.split(" | "))}
                placeholder="Avantages séparés par ' | '" className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      {/* Règles de points */}
      <div>
        <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-3">Règles de gain de points</p>
        <div className="space-y-2">
          {rules.map((ru, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
              <input value={ru.label} onChange={e => updateRule(i, "label", e.target.value)} placeholder="Libellé" className={inputCls + " flex-1"} />
              <div className="flex items-center gap-1.5 shrink-0">
                <input type="number" value={ru.pts} onChange={e => updateRule(i, "pts", e.target.value)}
                  className="w-20 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-3 text-[13px] outline-none focus:border-primary text-center font-black" />
                <span className="text-[11px] text-gray-500 font-bold">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-[13px] font-black disabled:opacity-60 shadow-md shadow-primary/20 active:scale-95 transition-all">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</> : saved ? <><Check className="w-4 h-4" /> Sauvegardé !</> : <><Save className="w-4 h-4" /> Sauvegarder la configuration</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Onglet "Récompenses" — gestion manuelle de la liste
// ─────────────────────────────────────────────────────────────────────────────
function RecompensesPanel({ rewards, type, onSaveRewards }) {
  const [list, setList] = useState(rewards || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const CATS_CLIENT = ["Beauté", "Restaurant", "Loisirs", "Séjours", "Boutique"];
  const CATS_PRO = ["Visibilité", "Profil", "Analytics", "Clients", "Formation", "Abonnement"];
  const cats = type === "client" ? CATS_CLIENT : CATS_PRO;

  const add = () => setList(l => [...l, { id: `${type}_${Date.now()}`, icon: "🎁", label: "", desc: "", pts: 100, cat: cats[0] }]);
  const remove = (i) => setList(l => l.filter((_, idx) => idx !== i));
  const update = (i, field, val) => setList(l => l.map((r, idx) => idx === i ? { ...r, [field]: field === "pts" ? parseInt(val) || 0 : val } : r));

  const save = async () => {
    setSaving(true);
    await onSaveRewards(type, list);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Récompenses disponibles ({list.length})</p>
        <button onClick={add} className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-3 py-2 text-[12px] font-black hover:bg-primary/20 active:scale-95 transition-all">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>

      {list.map((r, i) => (
        <div key={r.id || i} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <input value={r.icon} onChange={e => update(i, "icon", e.target.value)} placeholder="🎁" className="w-14 bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-[18px] text-center outline-none" />
            <input value={r.label} onChange={e => update(i, "label", e.target.value)} placeholder="Titre de la récompense" className={inputCls + " flex-1"} />
            <button onClick={() => remove(i)} className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center shrink-0 hover:bg-red-100">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
          <input value={r.desc} onChange={e => update(i, "desc", e.target.value)} placeholder="Description" className={inputCls} />
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <input type="number" value={r.pts} onChange={e => update(i, "pts", e.target.value)}
                className={inputCls} placeholder="Points requis" />
              <span className="text-[11px] text-gray-500 shrink-0 font-bold">pts</span>
            </div>
            <select value={r.cat} onChange={e => update(i, "cat", e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 text-[12px] outline-none">
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      ))}

      {list.length === 0 && <p className="text-center text-gray-400 text-[13px] py-6">Aucune récompense configurée</p>}

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-[13px] font-black disabled:opacity-60 shadow-md shadow-primary/20 active:scale-95 transition-all">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</> : saved ? <><Check className="w-4 h-4" /> Sauvegardé !</> : <><Save className="w-4 h-4" /> Sauvegarder les récompenses</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminFidelite() {
  const [tab, setTab] = useState("overview"); // overview | clients | pros | config_client | config_pro | rewards_client | rewards_pro
  const [clientRecords, setClientRecords] = useState([]);
  const [proRecords, setProRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fideliteConfig, setFideliteConfig] = useState(DEFAULT_CONFIG);
  const [rewardsConfig, setRewardsConfig] = useState({ client: null, pro: null });

  const load = async () => {
    setLoading(true);
    const [cli, pro, cfg] = await Promise.allSettled([
      adminApi.listPointsFidelite(),
      adminApi.listPointsFidelitePro(),
      adminApi.getConfig("fidelite_config"),
    ]);
    if (cli.status === "fulfilled") {
      const res = cli.value;
      setClientRecords(Array.isArray(res) ? res : res?.data?.results || []);
    }
    if (pro.status === "fulfilled") {
      const res = pro.value;
      setProRecords(Array.isArray(res) ? res : res?.data?.results || []);
    }
    if (cfg.status === "fulfilled") {
      const res = cfg.value;
      const results = Array.isArray(res) ? res : res?.data?.results || [];
      if (results[0]?.value) {
        const v = results[0].value;
        if (v.client) setFideliteConfig(prev => ({ ...prev, client: v.client }));
        if (v.pro) setFideliteConfig(prev => ({ ...prev, pro: v.pro }));
        if (v.rewards_client) setRewardsConfig(prev => ({ ...prev, client: v.rewards_client }));
        if (v.rewards_pro) setRewardsConfig(prev => ({ ...prev, pro: v.rewards_pro }));
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Calculs stats
  const totalClientPts = clientRecords.reduce((s, r) => s + ((r.points_total || 0) - (r.points_depenses || 0)), 0);
  const totalProPts = proRecords.reduce((s, r) => s + ((r.points_total || 0) - (r.points_depenses || 0)), 0);
  const platinumClients = clientRecords.filter(r => r.niveau === "Platinum").length;
  const elitePros = proRecords.filter(r => r.niveau === "Elite").length;

  // Sauvegarder la config dans AppConfig
  const saveConfig = async (type, data) => {
    const cfgRes = await adminApi.getConfig("fidelite_config").catch(() => []);
    const cfgData = Array.isArray(cfgRes) ? cfgRes : cfgRes?.data || cfgRes;
    const rows = cfgData?.results || cfgData || [];
    const current = rows[0]?.value || {};
    const updated = { ...current, [type]: data };
    if (rows[0]?.id) await adminApi.updateConfig(rows[0].id, { value: updated });
    else await adminApi.createConfig({ key: "fidelite_config", value: updated });
    setFideliteConfig(prev => ({ ...prev, [type]: data }));
  };

  const saveRewards = async (type, data) => {
    const cfgRes = await adminApi.getConfig("fidelite_config").catch(() => []);
    const cfgData = Array.isArray(cfgRes) ? cfgRes : cfgRes?.data || cfgRes;
    const rows = cfgData?.results || cfgData || [];
    const current = rows[0]?.value || {};
    const key = `rewards_${type}`;
    const updated = { ...current, [key]: data };
    if (rows[0]?.id) await adminApi.updateConfig(rows[0].id, { value: updated });
    else await adminApi.createConfig({ key: "fidelite_config", value: updated });
    setRewardsConfig(prev => ({ ...prev, [type]: data }));
  };

  // Ajustement manuel de points
  const handleAdjustPoints = async (record, delta, label, type) => {
    const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    const entry = { label: `[Admin] ${label}`, pts: delta, date: dateStr, type: delta > 0 ? "credit" : "debit" };

    if (type === "client") {
      const newTotal = (record.points_total || 0) + (delta > 0 ? delta : 0);
      const newDepenses = (record.points_depenses || 0) + (delta < 0 ? Math.abs(delta) : 0);
      const userPts = newTotal - newDepenses;
      const newNiveau = userPts >= 2500 ? "Platinum" : userPts >= 1000 ? "Gold" : "Silver";
      await adminApi.updatePointsFidelite(record.id, {
        points_total: newTotal,
        points_depenses: newDepenses,
        niveau: newNiveau,
        historique: [entry, ...(record.historique || [])].slice(0, 50),
      });
      setClientRecords(prev => prev.map(r => r.id === record.id ? { ...r, points_total: newTotal, points_depenses: newDepenses, niveau: newNiveau, historique: [entry, ...(r.historique || [])] } : r));
    } else {
      const newTotal = (record.points_total || 0) + (delta > 0 ? delta : 0);
      const newDepenses = (record.points_depenses || 0) + (delta < 0 ? Math.abs(delta) : 0);
      const userPts = newTotal - newDepenses;
      const newNiveau = userPts >= 5000 ? "Elite" : userPts >= 2000 ? "Gold" : userPts >= 500 ? "Silver" : "Bronze";
      await adminApi.updatePointsFidelitePro(record.id, {
        points_total: newTotal,
        points_depenses: newDepenses,
        niveau: newNiveau,
        historique: [entry, ...(record.historique || [])].slice(0, 50),
      });
      setProRecords(prev => prev.map(r => r.id === record.id ? { ...r, points_total: newTotal, points_depenses: newDepenses, niveau: newNiveau, historique: [entry, ...(r.historique || [])] } : r));
    }
  };

  const TABS = [
    { id: "overview", label: "Vue d'ensemble", icon: TrendingUp },
    { id: "clients", label: "Membres Clients", icon: Users },
    { id: "pros", label: "Membres Pros", icon: Award },
    { id: "rewards_client", label: "Récompenses Client", icon: Gift },
    { id: "rewards_pro", label: "Récompenses Pro", icon: Star },
    { id: "config_client", label: "Config Client", icon: Settings },
    { id: "config_pro", label: "Config Pro", icon: Settings },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="bg-gradient-to-r from-primary/10 to-orange-50 border border-primary/20 rounded-2xl px-4 py-3 flex-1">
          <p className="text-primary text-[13px] font-black">💎 Gestion Programme Fidélité — Client & Professionnel</p>
          <p className="text-gray-500 text-[11px] mt-0.5">Gérez les membres, ajustez les points et configurez les règles de fidélisation.</p>
        </div>
        <button onClick={load} className="ml-3 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Membres clients" value={clientRecords.length} icon={Users} color="bg-blue-500" />
        <StatCard label="Membres pros" value={proRecords.length} icon={Award} color="bg-purple-500" />
        <StatCard label="Clients Platinum" value={platinumClients} icon={Star} color="bg-amber-500" />
        <StatCard label="Pros Elite" value={elitePros} icon={TrendingUp} color="bg-emerald-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-black transition-all ${tab === t.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white border border-gray-200 text-gray-600 hover:border-primary/30"}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div>
        {/* Vue d'ensemble */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribution clients */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-[13px] font-black text-gray-900 mb-4">Répartition niveaux clients</p>
              {["Silver", "Gold", "Platinum"].map(niv => {
                const count = clientRecords.filter(r => r.niveau === niv).length;
                const pct = clientRecords.length ? Math.round((count / clientRecords.length) * 100) : 0;
                return (
                  <div key={niv} className="mb-3">
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-bold text-gray-700">{niv}</span>
                      <span className="font-black text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Total points distribués (clients)</p>
                <p className="text-[22px] font-black text-primary">{totalClientPts.toLocaleString()} pts</p>
              </div>
            </div>

            {/* Distribution pros */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-[13px] font-black text-gray-900 mb-4">Répartition niveaux pros</p>
              {["Bronze", "Silver", "Gold", "Elite"].map(niv => {
                const count = proRecords.filter(r => r.niveau === niv).length;
                const pct = proRecords.length ? Math.round((count / proRecords.length) * 100) : 0;
                return (
                  <div key={niv} className="mb-3">
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-bold text-gray-700">{niv}</span>
                      <span className="font-black text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Total points distribués (pros)</p>
                <p className="text-[22px] font-black text-purple-600">{totalProPts.toLocaleString()} pts</p>
              </div>
            </div>

            {/* Top clients */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-[13px] font-black text-gray-900 mb-4">🏆 Top 5 clients</p>
              {clientRecords.slice(0, 5).map((r, i) => {
                const pts = (r.points_total || 0) - (r.points_depenses || 0);
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="w-6 text-[13px] font-black text-gray-400">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-gray-900 truncate">{r.user_email}</p>
                    </div>
                    <span className="text-[12px] font-black text-primary">{pts.toLocaleString()} pts</span>
                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">{r.niveau}</span>
                  </div>
                );
              })}
              {clientRecords.length === 0 && <p className="text-gray-400 text-[12px] text-center py-4">Aucun membre</p>}
            </div>

            {/* Top pros */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-[13px] font-black text-gray-900 mb-4">🏆 Top 5 pros</p>
              {proRecords.slice(0, 5).map((r, i) => {
                const pts = (r.points_total || 0) - (r.points_depenses || 0);
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="w-6 text-[13px] font-black text-gray-400">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-gray-900 truncate">{r.pro_email}</p>
                    </div>
                    <span className="text-[12px] font-black text-purple-600">{pts.toLocaleString()} pts</span>
                    <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold">{r.niveau}</span>
                  </div>
                );
              })}
              {proRecords.length === 0 && <p className="text-gray-400 text-[12px] text-center py-4">Aucun membre</p>}
            </div>
          </div>
        )}

        {/* Membres clients */}
        {tab === "clients" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[13px] font-black text-gray-900 mb-4">Membres clients ({clientRecords.length})</p>
            <MembresTable records={clientRecords} type="client" onAdjustPoints={handleAdjustPoints} />
          </div>
        )}

        {/* Membres pros */}
        {tab === "pros" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[13px] font-black text-gray-900 mb-4">Membres professionnels ({proRecords.length})</p>
            <MembresTable records={proRecords} type="pro" onAdjustPoints={handleAdjustPoints} />
          </div>
        )}

        {/* Récompenses client */}
        {tab === "rewards_client" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[13px] font-black text-gray-900 mb-1">Récompenses — Programme Client</p>
            <p className="text-[11px] text-gray-400 mb-4">Ces récompenses s'affichent dans la page Programme Fidélité des clients.</p>
            <RecompensesPanel
              rewards={rewardsConfig.client || [
                { id: "r1", icon: "💆‍♀️", label: "Soin Visage Gratuit", desc: "Manucure ou Hydrafacial offert", pts: 800, cat: "Beauté" },
                { id: "r2", icon: "✂️", label: "Coupe Offerte", desc: "Coupe + brushing dans un salon partenaire", pts: 1200, cat: "Beauté" },
                { id: "r3", icon: "🎁", label: "Coupon –10€", desc: "Valable sur tous les services BeautyBook", pts: 400, cat: "Beauté" },
                { id: "r4", icon: "🍽️", label: "–20% Restaurant", desc: "Réduction sur votre addition", pts: 500, cat: "Restaurant" },
                { id: "r5", icon: "🏋️", label: "Séance Sport Offerte", desc: "1 séance gratuite en salle partenaire", pts: 600, cat: "Loisirs" },
                { id: "r6", icon: "📦", label: "Livraison Offerte", desc: "Frais de port offerts sur la boutique", pts: 150, cat: "Boutique" },
              ]}
              type="client"
              onSaveRewards={saveRewards}
            />
          </div>
        )}

        {/* Récompenses pro */}
        {tab === "rewards_pro" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[13px] font-black text-gray-900 mb-1">Récompenses — Programme Pro</p>
            <p className="text-[11px] text-gray-400 mb-4">Ces récompenses s'affichent dans la section Pro du Programme Fidélité.</p>
            <RecompensesPanel
              rewards={rewardsConfig.pro || [
                { id: "p1", icon: "📣", label: "Boost Visibilité 7 jours", desc: "Profil en tête des résultats pendant 7 jours", pts: 300, cat: "Visibilité" },
                { id: "p2", icon: "🎨", label: "Bannière Premium", desc: "Template de bannière profil personnalisé", pts: 200, cat: "Profil" },
                { id: "p3", icon: "✅", label: "Badge Vérifié+", desc: "Badge de confiance avancé sur votre profil", pts: 500, cat: "Profil" },
                { id: "p4", icon: "📱", label: "Story Sponsorisée", desc: "Story diffusée à 5000 utilisateurs", pts: 600, cat: "Visibilité" },
                { id: "p5", icon: "💆", label: "1 Mois Premium Offert", desc: "1 mois d'abonnement Premium offert", pts: 1500, cat: "Abonnement" },
              ]}
              type="pro"
              onSaveRewards={saveRewards}
            />
          </div>
        )}

        {/* Config client */}
        {tab === "config_client" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[13px] font-black text-gray-900 mb-1">Configuration — Programme Client</p>
            <p className="text-[11px] text-gray-400 mb-4">Modifiez les niveaux, seuils et règles de gain de points pour les clients.</p>
            <ConfigPanel config={fideliteConfig.client} type="client" onSave={saveConfig} />
          </div>
        )}

        {/* Config pro */}
        {tab === "config_pro" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[13px] font-black text-gray-900 mb-1">Configuration — Programme Pro</p>
            <p className="text-[11px] text-gray-400 mb-4">Modifiez les niveaux, seuils et règles de gain de points pour les professionnels.</p>
            <ConfigPanel config={fideliteConfig.pro} type="pro" onSave={saveConfig} />
          </div>
        )}
      </div>
    </div>
  );
}