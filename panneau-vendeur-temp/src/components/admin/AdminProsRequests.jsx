import { useState, useEffect } from "react";
import { supabase } from '@/api/supabaseClient';
import { apiClient } from "@/lib/apiClient";
import { Search, CheckCircle, XCircle, FileText, ChevronRight, X, ExternalLink, AlertTriangle } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

const FILTERS = ["Tous", "En attente", "Approuvés", "Refusés"];

const DOCS = [
  { key: "doc_identite_recto", label: "Identité Recto" },
  { key: "doc_identite_verso", label: "Identité Verso" },
  { key: "doc_siret", label: "SIRET / Kbis" },
  { key: "doc_assurance", label: "Assurance pro" },
];

const STATUS_CONFIG = {
  en_attente: { label: "En attente", cls: "bg-amber-100 text-amber-600" },
  approuvee: { label: "Approuvé ✓", cls: "bg-green-100 text-green-600" },
  refusee: { label: "Refusé", cls: "bg-red-100 text-red-500" },
};

function DocLink({ url, label }) {
  if (!url) return <span className="text-gray-300 text-[11px]">—</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1 text-primary text-[11px] font-black underline">
      <ExternalLink className="w-3 h-3" /> {label}
    </a>
  );
}

function ProDetailPanel({ demande, onClose, onApprouver, onRefuser, onPiecesManquantes, loading }) {
  const [note, setNote] = useState("");
  const [showRefuseForm, setShowRefuseForm] = useState(false);
  const [showPiecesForm, setShowPiecesForm] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [piecesNote, setPiecesNote] = useState("");

  const toggleDoc = (key) => setSelectedDocs(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-t-3xl lg:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {demande.salon_photo ? (
              <img src={demande.salon_photo} alt={demande.salon_name} className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-primary font-black text-[16px]">{demande.salon_name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div>
              <p className="text-gray-900 text-[15px] font-black">{demande.salon_name}</p>
              <p className="text-gray-400 text-[11px]">{demande.user_email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Statut */}
          <span className={`inline-block text-[11px] font-black px-3 py-1.5 rounded-full ${STATUS_CONFIG[demande.statut]?.cls}`}>
            {STATUS_CONFIG[demande.statut]?.label}
          </span>

          {/* Infos générales */}
          <section className="space-y-2">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Informations</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-black text-gray-800">{demande.type_activite || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expérience</span><span className="font-black text-gray-800">{demande.years_experience || 0} ans</span></div>
              <div className="flex justify-between"><span className="text-gray-500">SIRET</span><span className="font-black text-gray-800">{demande.siret || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-black text-gray-800">{demande.phone || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email pro</span><span className="font-black text-gray-800">{demande.email_pro || "—"}</span></div>
            </div>
          </section>

          {/* Bio */}
          {demande.bio && (
            <section className="space-y-2">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Bio</p>
              <p className="text-[13px] text-gray-700 bg-gray-50 rounded-2xl p-4 leading-relaxed">{demande.bio}</p>
            </section>
          )}

          {/* Services & Catégories */}
          {(demande.services?.length > 0 || demande.categories?.length > 0) && (
            <section className="space-y-2">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Services proposés</p>
              <div className="flex flex-wrap gap-1.5">
                {[...(demande.services || []), ...(demande.categories || [])].map(s => (
                  <span key={s} className="bg-primary/10 text-primary text-[11px] font-black px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio */}
          {demande.portfolio?.length > 0 && (
            <section className="space-y-2">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Portfolio ({demande.portfolio.length} photos)</p>
              <div className="grid grid-cols-3 gap-2">
                {demande.portfolio.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Photo ${i+1}`} className="aspect-square rounded-xl object-cover w-full" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Documents */}
          <section className="space-y-2">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Documents fournis</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-[12px] font-semibold flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Identité Recto</span>
                <DocLink url={demande.doc_identite_recto} label="Voir" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-[12px] font-semibold flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Identité Verso</span>
                <DocLink url={demande.doc_identite_verso} label="Voir" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-[12px] font-semibold flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> SIRET / Kbis</span>
                <DocLink url={demande.doc_siret} label="Voir" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-[12px] font-semibold flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Assurance pro</span>
                <DocLink url={demande.doc_assurance} label="Voir" />
              </div>
            </div>
          </section>

          {/* Note admin */}
          {demande.statut === "en_attente" && (
            <section className="space-y-2">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Note interne (optionnel)</p>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                placeholder="Commentaire interne visible uniquement par les admins..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 outline-none resize-none focus:border-primary" />
            </section>
          )}

          {/* Note existante */}
          {demande.admin_notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-blue-600 text-[11px] font-black mb-1">NOTE ADMIN</p>
              <p className="text-blue-700 text-[12px]">{demande.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {demande.statut === "en_attente" && (
          <div className="px-5 pb-6 pt-2 border-t border-gray-100 space-y-2 sticky bottom-0 bg-white">
            {!showRefuseForm && !showPiecesForm && (
              <>
                <div className="flex gap-2">
                  <button onClick={() => onApprouver(demande.id, note)} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-2xl text-[13px] font-black active:scale-95 transition-all disabled:opacity-60">
                    <CheckCircle className="w-4 h-4" /> Approuver
                  </button>
                  <button onClick={() => setShowRefuseForm(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 py-4 rounded-2xl text-[13px] font-black active:scale-95 transition-all">
                    <XCircle className="w-4 h-4" /> Refuser
                  </button>
                </div>
                <button onClick={() => setShowPiecesForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 py-3.5 rounded-2xl text-[13px] font-black active:scale-95 transition-all">
                  <AlertTriangle className="w-4 h-4" /> Pièces manquantes / non conformes
                </button>
              </>
            )}

            {showRefuseForm && (
              <div className="space-y-2">
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} autoFocus
                  placeholder="Motif du refus (obligatoire)..."
                  className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 outline-none resize-none focus:border-red-400" />
                <div className="flex gap-2">
                  <button onClick={() => setShowRefuseForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl text-[13px] font-black active:scale-95">Annuler</button>
                  <button onClick={() => onRefuser(demande.id, note)} disabled={!note.trim() || loading}
                    className="flex-1 bg-red-500 text-white py-3 rounded-2xl text-[13px] font-black active:scale-95 disabled:opacity-60">
                    Confirmer le refus
                  </button>
                </div>
              </div>
            )}

            {showPiecesForm && (
              <div className="space-y-3">
                <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Sélectionner les documents non conformes</p>
                <div className="space-y-2">
                  {DOCS.map(doc => (
                    <button key={doc.key} onClick={() => toggleDoc(doc.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${selectedDocs.includes(doc.key) ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"}`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selectedDocs.includes(doc.key) ? "border-amber-500 bg-amber-500" : "border-gray-300"}`}>
                        {selectedDocs.includes(doc.key) && <span className="text-white text-[11px] font-black">✓</span>}
                      </div>
                      <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className={`text-[13px] font-semibold ${selectedDocs.includes(doc.key) ? "text-amber-700" : "text-gray-700"}`}>{doc.label}</span>
                      {demande[doc.key] ? <span className="ml-auto text-[10px] text-green-500 font-black">FOURNI</span> : <span className="ml-auto text-[10px] text-red-400 font-black">ABSENT</span>}
                    </button>
                  ))}
                </div>
                <textarea value={piecesNote} onChange={e => setPiecesNote(e.target.value)} rows={2}
                  placeholder="Message additionnel pour l'utilisateur (optionnel)..."
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 outline-none resize-none focus:border-amber-400" />
                <div className="flex gap-2">
                  <button onClick={() => { setShowPiecesForm(false); setSelectedDocs([]); setPiecesNote(""); }}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl text-[13px] font-black active:scale-95">Annuler</button>
                  <button
                    onClick={() => onPiecesManquantes(demande.id, demande.user_email, demande.salon_name, selectedDocs, piecesNote)}
                    disabled={selectedDocs.length === 0 || loading}
                    className="flex-1 bg-amber-500 text-white py-3 rounded-2xl text-[13px] font-black active:scale-95 disabled:opacity-60">
                    Envoyer la demande
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProsRequests() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const fetchDemandes = async () => {
    try {
      const res = await apiClient.post('/admin/api', { action: 'list_demandes' });
      setDemandes(res.data || []);
    } catch {
      // fallback: try entities via apiClient
      try {
        const res = await apiClient.callFunction("manageEntity", { entity: "DemandeProV2", action: "list", orderBy: "-created_at", limit: 100 });
        setDemandes(res || []);
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDemandes(); }, []);

  const filtered = demandes.filter(d => {
    const matchSearch = !search || d.salon_name?.toLowerCase().includes(search.toLowerCase()) || d.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Tous"
      || (filter === "En attente" && d.statut === "en_attente")
      || (filter === "Approuvés" && d.statut === "approuvee")
      || (filter === "Refusés" && d.statut === "refusee");
    return matchSearch && matchFilter;
  });

  const handleApprouver = async (id, note) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/admin/approve-pro', { action: "approuver", demande_id: id, note });
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: "approuvee", admin_notes: note } : d));
      setSelected(prev => prev?.id === id ? { ...prev, statut: "approuvee" } : prev);
    } catch (err) {
      console.error("Approuver error:", err);
      setError(`Erreur approbation: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuser = async (id, note) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/admin/approve-pro', { action: "refuser", demande_id: id, note });
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: "refusee", admin_notes: note } : d));
      setSelected(prev => prev?.id === id ? { ...prev, statut: "refusee" } : prev);
    } catch (err) {
      console.error("Refuser error:", err);
      setError(`Erreur refus: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePiecesManquantes = async (id, userEmail, salonName, docKeys, noteExtra) => {
    setActionLoading(true);
    setError(null);
    try {
      const docLabels = docKeys.map(k => DOCS.find(d => d.key === k)?.label).filter(Boolean);
      const message = `📋 Votre demande Pro "${salonName}" nécessite des corrections.\n\nDocument(s) non conforme(s) ou manquant(s) :\n${docLabels.map(l => `• ${l}`).join("\n")}${noteExtra ? `\n\n${noteExtra}` : ""}\n\nMerci de soumettre à nouveau les documents concernés afin que nous puissions traiter votre dossier.`;

      await apiClient.post('/admin/approve-pro', {
        action: "pieces_manquantes",
        demande_id: id,
        note: `[Pièces manquantes] ${docLabels.join(", ")}${noteExtra ? " — " + noteExtra : ""}`,
        notification: { user_email: userEmail, type: "system", title: "Pièces manquantes – Dossier Pro", body: message, icon: "⚠️" },
      });

      setDemandes(prev => prev.map(d => d.id === id ? { ...d, admin_notes: `[Pièces manquantes] ${docLabels.join(", ")}` } : d));
      setSelected(null);
    } catch (err) {
      console.error("Pieces manquantes error:", err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const pending = demandes.filter(d => d.statut === "en_attente").length;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-red-600 text-[13px] font-semibold flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-amber-600 font-black text-[14px]">{pending}</span>
          </div>
          <p className="text-amber-700 text-[13px] font-semibold">{pending} demande(s) en attente de vérification</p>
        </div>
      )}
      {pending === 0 && demandes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-green-500 text-[18px]">✓</span>
          <p className="text-green-700 text-[13px] font-semibold">Toutes les demandes ont été traitées.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 flex-1 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="flex-1 bg-transparent text-gray-700 text-[13px] outline-none placeholder:text-gray-400" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-[12px] font-black whitespace-nowrap transition-all ${filter === f ? "bg-primary text-white" : "bg-white text-gray-500 border border-gray-200"}`}>{f}</button>
          ))}
        </div>
      </div>

      <p className="text-gray-500 text-[12px]">{filtered.length} demande(s)</p>
      <div className="space-y-3">
        {filtered.map(d => (
          <div key={d.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm cursor-pointer active:scale-[0.99] transition-all"
            onClick={() => setSelected(d)}>
            <div className="flex items-center gap-3">
              {d.salon_photo ? (
                <img src={d.salon_photo} alt={d.salon_name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-primary font-black text-[16px]">{d.salon_name?.[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-[13px] font-black">{d.salon_name}</p>
                <p className="text-gray-500 text-[11px]">{d.user_email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_CONFIG[d.statut]?.cls}`}>
                    {STATUS_CONFIG[d.statut]?.label}
                  </span>
                  <span className="text-gray-300 text-[10px]">{d.type_activite}</span>
                  {d.doc_identite_recto && <span className="text-green-500 text-[10px] font-black">📎 Docs</span>}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-10 text-[13px]">Aucune demande trouvée.</p>}
      </div>

      {selected && (
        <ProDetailPanel
          demande={selected}
          onClose={() => setSelected(null)}
          onApprouver={handleApprouver}
          onRefuser={handleRefuser}
          onPiecesManquantes={handlePiecesManquantes}
          loading={actionLoading}
        />
      )}
    </div>
  );
}