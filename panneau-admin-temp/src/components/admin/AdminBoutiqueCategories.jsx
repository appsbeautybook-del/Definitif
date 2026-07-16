import { useState, useEffect } from "react";
import { adminApi } from '@/lib/adminApiClient';
import { Plus, X, Check, ChevronDown, ChevronUp, Pencil, Loader2, Settings } from "lucide-react";

export const CONFIG_KEY = "boutique_categories";

export const DEFAULT_BOUTIQUE_CATS = [
  { id: "tout",      label: "Tout",      subs: ["Vêtements", "Chaussures", "Accessoires", "Sport", "Livraison Express"] },
  { id: "homme",     label: "Homme",     subs: ["Vêtements", "Chaussures", "Accessoires", "Sacs", "Sport"] },
  { id: "femme",     label: "Femme",     subs: ["Vêtements", "Chaussures", "Sacs", "Bijoux", "Lingerie"] },
  { id: "enfant",    label: "Enfant",    subs: ["Fille", "Garçon", "Chaussures", "Jouets"] },
  { id: "beaute",    label: "Beauté",    subs: ["Maquillage", "Soins Visage", "Cheveux", "Parfums", "Outils"] },
  { id: "bebe",      label: "Bébé",      subs: ["Vêtements", "Éveil", "Sommeil", "Repas", "Hygiène"] },
  { id: "grossiste", label: "Grossiste", subs: ["Beauté", "Vêtements", "Accessoires", "Hygiène", "Alimentaire", "Divers"] },
];

export default function AdminBoutiqueCategories({ onSaved }) {
  const [cats, setCats] = useState(DEFAULT_BOUTIQUE_CATS);
  const [configId, setConfigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatLabel, setEditingCatLabel] = useState("");
  const [newSubInputs, setNewSubInputs] = useState({});

  useEffect(() => {
    adminApi.getConfig(CONFIG_KEY)
      .then(({ data }) => {
        const rows = data.results || [];
        if (rows[0]?.value?.categories?.length > 0) {
          setCats(rows[0].value.categories);
          setConfigId(rows[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (newCats) => {
    setSaving(true);
    if (configId) {
      await adminApi.updateConfig(configId, { value: { categories: newCats }, description: "Catégories boutique" });
    } else {
      const { data } = await adminApi.createConfig({ key: CONFIG_KEY, value: { categories: newCats }, description: "Catégories boutique" });
      setConfigId(data.result.id);
    }
    setSaving(false);
    setDirty(false);
    onSaved?.();
  };

  const update = (newCats) => { setCats(newCats); setDirty(true); };

  const addCat = () => {
    if (!newCatLabel.trim()) return;
    const id = newCatLabel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_");
    if (cats.find(c => c.id === id)) return;
    update([...cats, { id, label: newCatLabel.trim(), subs: [] }]);
    setNewCatLabel("");
  };

  const deleteCat = (id) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    update(cats.filter(c => c.id !== id));
  };

  const renameCat = (id) => {
    if (!editingCatLabel.trim()) return;
    update(cats.map(c => c.id === id ? { ...c, label: editingCatLabel.trim() } : c));
    setEditingCatId(null);
  };

  const addSub = (catId) => {
    const val = (newSubInputs[catId] || "").trim();
    if (!val) return;
    update(cats.map(c => c.id === catId ? { ...c, subs: [...c.subs, val] } : c));
    setNewSubInputs(prev => ({ ...prev, [catId]: "" }));
  };

  const deleteSub = (catId, sub) => {
    update(cats.map(c => c.id === catId ? { ...c, subs: c.subs.filter(s => s !== sub) } : c));
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-black text-gray-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" /> Catégories &amp; sous-catégories boutique
        </h3>
        {dirty && (
          <button onClick={() => persist(cats)} disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-[13px] font-black shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Sauvegarder
          </button>
        )}
      </div>

      {/* Ajouter une catégorie */}
      <div className="flex gap-2">
        <input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addCat()}
          placeholder="Nouvelle catégorie (ex: Sport, Maison…)"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-primary" />
        <button onClick={addCat} disabled={!newCatLabel.trim()}
          className="bg-primary text-white px-4 rounded-xl flex items-center gap-1.5 text-[13px] font-black active:scale-95 disabled:opacity-40">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Liste des catégories */}
      <div className="space-y-2">
        {cats.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header catégorie */}
            <div className="flex items-center gap-3 px-4 py-3">
              {editingCatId === cat.id ? (
                <div className="flex-1 flex gap-2">
                  <input value={editingCatLabel} onChange={e => setEditingCatLabel(e.target.value)}
                    autoFocus onKeyDown={e => e.key === "Enter" && renameCat(cat.id)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-primary" />
                  <button onClick={() => renameCat(cat.id)} className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingCatId(null)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <span className="flex-1 text-[14px] font-black text-gray-900">{cat.label}</span>
              )}
              <span className="text-[11px] text-gray-400 font-medium shrink-0">{cat.subs.length} sous-cat.</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => { setEditingCatId(cat.id); setEditingCatLabel(cat.label); }}
                  className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-all">
                  <Pencil className="w-3 h-3 text-blue-500" />
                </button>
                <button onClick={() => deleteCat(cat.id)}
                  className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all">
                  <X className="w-3 h-3 text-red-500" />
                </button>
                <button onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                  className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all">
                  {expandedId === cat.id ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
                </button>
              </div>
            </div>

            {/* Sous-catégories */}
            {expandedId === cat.id && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {cat.subs.length === 0 && <p className="text-[12px] text-gray-400 italic">Aucune sous-catégorie</p>}
                  {cat.subs.map(sub => (
                    <span key={sub} className="flex items-center gap-1 bg-white border border-gray-200 text-[12px] font-bold text-gray-700 px-2.5 py-1 rounded-full shadow-sm">
                      {sub}
                      <button onClick={() => deleteSub(cat.id, sub)} className="text-gray-300 hover:text-red-400 ml-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newSubInputs[cat.id] || ""} onChange={e => setNewSubInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addSub(cat.id)}
                    placeholder="Nouvelle sous-catégorie…"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-primary" />
                  <button onClick={() => addSub(cat.id)} disabled={!newSubInputs[cat.id]?.trim()}
                    className="bg-gray-800 text-white px-3 rounded-lg text-[12px] font-black active:scale-95 disabled:opacity-40 flex items-center">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}