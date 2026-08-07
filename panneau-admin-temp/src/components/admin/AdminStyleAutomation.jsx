import { useState, useEffect, useCallback } from "react";
import { entities } from "@/api/entities";
import {
  Loader2, Clock, RefreshCw, BarChart3, Search, Database,
  CheckCircle, AlertCircle, History, Zap, Globe, Plus, X,
  ChevronDown, ChevronUp, Image as ImageIcon,
} from "lucide-react";

const AUTO_SEARCH_QUERIES = [
  "box braids", "smokey eyes", "manucure gel french", "massage relaxant",
  "barbe royal", "cornrows creatifs", "lash lift", "balayage cheveux",
  "nail art floral", "soin hydratant visage", "rasage traditionnel",
  "twist africains", "baby boomer ongles", "hammam detox", "airbrush makeup",
  "faux locs boheme", "epilation cire chaude", "anti-age visage",
  "gommage corps", "maquillage mariage",
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://definitif-beta.vercel.app";

export default function AdminStyleAutomation() {
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem("bb_style_auto_enabled") === "true");
  const [frequency, setFrequency] = useState(() => localStorage.getItem("bb_style_auto_frequency") || "quotidienne");
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [createdCount, setCreatedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("bb_style_auto_stats");
    return saved ? JSON.parse(saved) : { totalStyles: 0, lastSearch: null, totalSearches: 0 };
  });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("bb_style_auto_log");
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isManualSearching, setIsManualSearching] = useState(false);
  const [isCreatingStyle, setIsCreatingStyle] = useState(false);
  const [createdStyles, setCreatedStyles] = useState(() => {
    const saved = localStorage.getItem("bb_style_auto_recent");
    return saved ? JSON.parse(saved) : [];
  });
  const [showJournal, setShowJournal] = useState(false);

  useEffect(() => { localStorage.setItem("bb_style_auto_enabled", isEnabled.toString()); }, [isEnabled]);
  useEffect(() => { localStorage.setItem("bb_style_auto_frequency", frequency); }, [frequency]);
  useEffect(() => { localStorage.setItem("bb_style_auto_stats", JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem("bb_style_auto_log", JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem("bb_style_auto_recent", JSON.stringify(createdStyles)); }, [createdStyles]);

  const fetchExistingStyles = useCallback(async () => {
    try { return await entities.Style.list("-created_at", 500) || []; }
    catch { return []; }
  }, []);

  const searchStyleAPI = async (query, limit = 8) => {
    const res = await fetch(`${BACKEND_URL}/api/ai/search-styles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erreur API: ${res.status}`);
    return data;
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsManualSearching(true);
    setError(null);
    setSearchResults(null);
    try {
      const data = await searchStyleAPI(searchQuery.trim(), 8);
      setSearchResults(data);
    } catch (err) {
      setError(err.message || "Erreur lors de la recherche");
    } finally {
      setIsManualSearching(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleManualSearch(); };

  const handleConfirmAdd = async () => {
    if (!searchResults) return;
    setIsCreatingStyle(true);
    setError(null);
    try {
      const { style, images } = searchResults;
      await entities.Style.create({
        title: style.title, category: style.category, subcategory: style.subcategory,
        description: style.description, images: images.map((i) => i.url),
        image_url: images[0]?.url || null, temps_moyen: style.temps_moyen || "",
        niveau_difficulte: style.niveau_difficulte || "Intermediaire",
        type_cheveux: style.type_cheveux || "", type_peau: style.type_peau || "",
        outils_utilises: style.outils_utilises || [], tags: style.tags || [],
        status: "publie", pro_email: "admin@beautybook.fr",
        likes: 0, views: 0, featured: false,
      });
      setCreatedStyles((prev) => [{
        id: Date.now(), title: style.title, category: style.category,
        thumbnail: images[0]?.thumb || images[0]?.url || null,
        date: new Date().toISOString(),
      }, ...prev].slice(0, 50));
      setStats((prev) => ({ ...prev, totalStyles: prev.totalStyles + 1, lastSearch: new Date().toISOString() }));
      setLogs((prev) => [{ id: Date.now(), date: new Date().toISOString(), status: "success",
        summary: `Style cree: ${style.title} (${style.category})` }, ...prev].slice(0, 50));
      setSearchResults(null);
      setSearchQuery("");
    } catch (err) {
      setError(err.message || "Erreur lors de la creation");
    } finally {
      setIsCreatingStyle(false);
    }
  };

  const simulateAutoSearch = useCallback(async () => {
    setIsSearching(true);
    setProgress(0);
    setCreatedCount(0);
    setSkippedCount(0);
    setError(null);

    try {
      setCurrentAction("Chargement des styles existants...");
      setProgress(5);
      const existingStyles = await fetchExistingStyles();
      const existingTitles = new Set(existingStyles.map((s) => s.title?.toLowerCase()));

      setProgress(10);
      setCurrentAction("Selection des requetes...");
      await new Promise((r) => setTimeout(r, 300));

      const queries = searchQuery.trim()
        ? [searchQuery.trim(), ...AUTO_SEARCH_QUERIES.filter(q => q !== searchQuery.trim()).sort(() => Math.random() - 0.5).slice(0, 7)]
        : [...AUTO_SEARCH_QUERIES].sort(() => Math.random() - 0.5).slice(0, 8);

      setCurrentAction(`Recherche de ${queries.length} styles...`);
      const results = [];
      for (let i = 0; i < queries.length; i++) {
        const pct = 10 + Math.round(((i + 1) / queries.length) * 30);
        setProgress(pct);
        setCurrentAction(`Recherche: "${queries[i]}" (${i + 1}/${queries.length})`);
        try {
          const data = await searchStyleAPI(queries[i], 4);
          if (data?.style) results.push(data);
        } catch (err) { console.error(`Erreur "${queries[i]}":`, err); }
        await new Promise((r) => setTimeout(r, 400));
      }

      setProgress(40);
      setCurrentAction("Filtrage des doublons...");
      await new Promise((r) => setTimeout(r, 300));

      const toCreate = results.filter((r) => !existingTitles.has(r.style.title.toLowerCase()));
      if (toCreate.length === 0) {
        setCurrentAction("Tous les styles sont deja presents.");
        setProgress(100);
        setLogs((prev) => [{ id: Date.now(), date: new Date().toISOString(), status: "warning",
          summary: `Recherche auto - Aucun nouveau style (${existingStyles.length} existants)` }, ...prev].slice(0, 50));
        setIsSearching(false);
        return;
      }

      setCurrentAction(`Creation de ${toCreate.length} style(s)...`);
      let created = 0, skipped = 0;
      for (let i = 0; i < toCreate.length; i++) {
        const { style, images } = toCreate[i];
        const pct = 40 + Math.round(((i + 1) / toCreate.length) * 55);
        setProgress(pct);
        setCurrentAction(`Creation: ${style.title} (${i + 1}/${toCreate.length})`);
        try {
          await entities.Style.create({
            title: style.title, category: style.category, subcategory: style.subcategory,
            description: style.description, images: images.map((img) => img.url),
            image_url: images[0]?.url || null, temps_moyen: style.temps_moyen || "",
            niveau_difficulte: style.niveau_difficulte || "Intermediaire",
            type_cheveux: style.type_cheveux || "", type_peau: style.type_peau || "",
            outils_utilises: style.outils_utilises || [], tags: style.tags || [],
            status: "publie", pro_email: "admin@beautybook.fr",
            likes: 0, views: 0, featured: false,
          });
          created++;
          setCreatedStyles((prev) => [{
            id: Date.now() + i, title: style.title, category: style.category,
            thumbnail: images[0]?.thumb || images[0]?.url || null,
            date: new Date().toISOString(),
          }, ...prev].slice(0, 50));
        } catch (err) { console.error(`Erreur "${style.title}":`, err); skipped++; }
        await new Promise((r) => setTimeout(r, 300));
      }

      setProgress(100);
      setCurrentAction("Finalisation...");
      await new Promise((r) => setTimeout(r, 400));

      setStats((prev) => ({ totalStyles: prev.totalStyles + created, lastSearch: new Date().toISOString(), totalSearches: prev.totalSearches + 1 }));
      setCreatedCount(created);
      setSkippedCount(skipped);
      setLogs((prev) => [{ id: Date.now(), date: new Date().toISOString(),
        status: created > 0 ? "success" : "warning",
        summary: `Recherche auto: ${created} cree(s), ${skipped} echec(s)` }, ...prev].slice(0, 50));
    } catch (err) {
      setError(err.message || "Erreur inconnue");
      setLogs((prev) => [{ id: Date.now(), date: new Date().toISOString(), status: "error",
        summary: `Erreur: ${err.message}` }, ...prev].slice(0, 50));
    } finally {
      setIsSearching(false);
      setCurrentAction("");
    }
  }, [fetchExistingStyles, stats, searchQuery]);

  const formatDate = (d) => {
    if (!d) return "Jamais";
    return new Date(d).toLocaleDateString("fr-FR") + " " + new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: SEARCH + AUTO SEARCH (merged) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-gray-900 text-[15px] font-black">Recherche & Automatisation</h3>
            <p className="text-gray-500 text-[13px] font-medium">Recherchez un style ou lancez la recherche automatique</p>
          </div>
        </div>

        {/* Search bar + Auto button on SAME LINE */}
        <div className="flex gap-3 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-1">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher un style... (ex: coiffure afro, box braids, nail art)"
              className="flex-1 bg-transparent text-gray-700 text-[13px] outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleManualSearch}
            disabled={isManualSearching || isSearching || !searchQuery.trim()}
            className="bg-primary text-white px-5 py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {isManualSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isManualSearching ? "..." : "Rechercher"}
          </button>
          <button
            onClick={simulateAutoSearch}
            disabled={isSearching || isManualSearching}
            className="bg-gray-800 text-white px-5 py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isSearching ? currentAction ? currentAction.substring(0, 20) + "..." : "..." : "Auto"}
          </button>
        </div>

        {/* Toggle + Frequency */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-[12px] font-medium">Activer l'auto</span>
            <button onClick={() => setIsEnabled(!isEnabled)}
              className={`relative w-10 h-5 rounded-full transition-all ${isEnabled ? "bg-primary" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? "left-5.5" : "left-0.5"}`}
                style={{ left: isEnabled ? "22px" : "2px" }} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2 py-1.5 text-[12px] outline-none">
              <option value="quotidienne">Quotidienne</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuelle">Mensuelle</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-red-600 text-[12px] font-medium">{error}</p>
              <p className="text-red-400 text-[11px] mt-1">URL: {BACKEND_URL}/api/ai/search-styles</p>
            </div>
          </div>
        )}

        {/* Search Results Preview */}
        {searchResults && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="text-gray-800 text-[13px] font-black">{searchResults.style?.title}</span>
                <span className="text-gray-500 text-[11px] bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  {searchResults.style?.category}{searchResults.style?.subcategory ? ` > ${searchResults.style.subcategory}` : ""}
                </span>
              </div>
              <button onClick={() => setSearchResults(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {/* Real images grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {searchResults.images?.slice(0, 8).map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={img.thumb || img.url} alt={img.alt || ""} className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' fill='%23ddd'%3E%3Crect width='40' height='40' rx='8'/%3E%3Ctext x='20' y='24' text-anchor='middle' fill='%23999' font-size='12'%3E IMG %3C/text%3E%3C/svg%3E"; }} />
                  </div>
                ))}
              </div>
              {searchResults.style?.description && (
                <p className="text-gray-600 text-[13px] mb-3 leading-relaxed">{searchResults.style.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {searchResults.style?.temps_moyen && (
                  <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">
                    <Clock className="w-3 h-3 inline mr-1" />{searchResults.style.temps_moyen}
                  </span>
                )}
                {searchResults.style?.niveau_difficulte && (
                  <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-medium">
                    {searchResults.style.niveau_difficulte}
                  </span>
                )}
                {searchResults.style?.tags?.slice(0, 4).map((tag, i) => (
                  <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">#{tag}</span>
                ))}
              </div>
              <button onClick={handleConfirmAdd} disabled={isCreatingStyle}
                className="w-full bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                {isCreatingStyle ? <><Loader2 className="w-4 h-4 animate-spin" /> Creation en cours...</> : <><Plus className="w-4 h-4" /> Ajouter ce style a la base</>}
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        {isSearching && (
          <div className="mt-4 border border-blue-100 bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-blue-700 text-[13px] font-bold">{currentAction}</span>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-4 text-[12px]">
              <span className="text-green-600 font-bold">{createdCount} cree(s)</span>
              <span className="text-amber-600 font-bold">{skippedCount} echec(s)</span>
              <span className="text-blue-600 font-bold">{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: RECENTLY CREATED STYLES */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">Styles recemment crees ({createdStyles.length})</h3>
        </div>
        {createdStyles.length === 0 ? (
          <p className="text-gray-400 text-[13px] text-center py-6">Aucun style cree. Utilisez la recherche ci-dessus.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {createdStyles.map((style) => (
              <div key={style.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                <div className="aspect-square bg-gray-100">
                  {style.thumbnail ? (
                    <img src={style.thumbnail} alt={style.title} className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-gray-800 text-[11px] font-bold truncate">{style.title}</p>
                  <p className="text-gray-500 text-[10px]">{style.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: STATISTICS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">Statistiques</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Styles total en base</p>
            <p className="text-gray-900 text-[20px] font-black">{stats.totalStyles}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Recherches effectuees</p>
            <p className="text-gray-900 text-[20px] font-black">{stats.totalSearches}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Requetes auto</p>
            <p className="text-gray-900 text-[20px] font-black">{AUTO_SEARCH_QUERIES.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Derniere recherche</p>
            <p className="text-gray-900 text-[13px] font-black">{formatDate(stats.lastSearch)}</p>
          </div>
        </div>
      </div>

      {/* SECTION 4: JOURNAL */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <button onClick={() => setShowJournal(!showJournal)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <History className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-gray-900 text-[15px] font-black">Journal des recherches</h3>
          </div>
          {showJournal ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {showJournal && (
          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-4">Aucune recherche</p>
            ) : logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="shrink-0 mt-0.5">
                  {log.status === "success" ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : log.status === "warning" ? <AlertCircle className="w-5 h-5 text-amber-500" />
                    : <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-[13px] font-medium">{log.summary}</p>
                  <p className="text-gray-500 text-[11px]">{formatDate(log.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: SOURCES */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Database className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">Sources de donnees</h3>
        </div>
        <div className="space-y-3">
          {[
            { name: "Pexels API", status: "Reelles", color: "bg-green-500" },
            { name: "Unsplash API (fallback)", status: "Reelles", color: "bg-green-500" },
            { name: "AI OpenRouter", status: "Actif", color: "bg-green-500" },
            { name: "Supabase", status: "Actif", color: "bg-green-500" },
          ].map((source, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800 text-[13px] font-medium">{source.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${source.color}`} />
                <span className="text-gray-500 text-[11px]">{source.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
