import { useState, useEffect, useCallback } from "react";
import { entities } from "@/api/entities";
import {
  Loader2,
  Clock,
  RefreshCw,
  BarChart3,
  Search,
  Database,
  CheckCircle,
  AlertCircle,
  History,
  Zap,
  Globe,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

const AUTO_SEARCH_QUERIES = [
  "box braids",
  "smokey eyes",
  "manucure gel french",
  "massage relaxant",
  "barbe royal",
  "cornrows creatifs",
  "lash lift",
  "balayage cheveux",
  "nail art floral",
  "soin hydratant visage",
  "rasage traditionnel",
  "twist africains",
  "baby boomer ongles",
  "hammam detox",
  "airbrush makeup",
  "faux locs boheme",
  "epilation cire chaude",
  "anti-age visage",
  "gommage corps",
  "maquillage mariage",
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function AdminStyleAutomation() {
  const [isEnabled, setIsEnabled] = useState(
    () => localStorage.getItem("bb_style_auto_enabled") === "true"
  );
  const [frequency, setFrequency] = useState(
    () => localStorage.getItem("bb_style_auto_frequency") || "quotidienne"
  );
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [createdCount, setCreatedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("bb_style_auto_stats");
    return saved
      ? JSON.parse(saved)
      : { totalStyles: 0, lastSearch: null, totalSearches: 0 };
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

  useEffect(() => {
    localStorage.setItem("bb_style_auto_enabled", isEnabled.toString());
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem("bb_style_auto_frequency", frequency);
  }, [frequency]);

  useEffect(() => {
    localStorage.setItem("bb_style_auto_stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("bb_style_auto_log", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("bb_style_auto_recent", JSON.stringify(createdStyles));
  }, [createdStyles]);

  const fetchExistingStyles = useCallback(async () => {
    try {
      const existing = await entities.Style.list("-created_at", 500);
      return existing || [];
    } catch (err) {
      console.error("Erreur lors de la recuperation des styles existants:", err);
      return [];
    }
  }, []);

  const searchStyleAPI = async (query, limit = 8) => {
    const res = await fetch(`${BACKEND_URL}/api/ai/search-styles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleManualSearch();
  };

  const handleConfirmAdd = async () => {
    if (!searchResults) return;
    setIsCreatingStyle(true);
    setError(null);
    try {
      const { style, images } = searchResults;
      const created = await entities.Style.create({
        title: style.title,
        category: style.category,
        subcategory: style.subcategory,
        description: style.description,
        images: images.map((i) => i.url),
        image_url: images[0]?.url || null,
        temps_moyen: style.temps_moyen || "",
        niveau_difficulte: style.niveau_difficulte || "Intermediaire",
        type_cheveux: style.type_cheveux || "",
        type_peau: style.type_peau || "",
        outils_utilises: style.outils_utilises || [],
        tags: style.tags || [],
        status: "publie",
        pro_email: "admin@beautybook.fr",
        likes: 0,
        views: 0,
        featured: false,
      });

      const entry = {
        id: Date.now(),
        title: style.title,
        category: style.category,
        thumbnail: images[0]?.thumb || images[0]?.url || null,
        date: new Date().toISOString(),
      };
      setCreatedStyles((prev) => [entry, ...prev].slice(0, 50));

      setStats((prev) => ({
        ...prev,
        totalStyles: prev.totalStyles + 1,
        lastSearch: new Date().toISOString(),
      }));

      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        status: "success",
        summary: `Style cree: ${style.title} (${style.category})`,
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 50));

      setSearchResults(null);
      setSearchQuery("");
    } catch (err) {
      setError(err.message || "Erreur lors de la creation du style");
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
      const existingTitles = new Set(
        existingStyles.map((s) => s.title?.toLowerCase())
      );

      setProgress(10);
      setCurrentAction("Selection des requetes a rechercher...");
      await new Promise((r) => setTimeout(r, 300));

      const shuffled = [...AUTO_SEARCH_QUERIES].sort(
        () => Math.random() - 0.5
      );
      const queries = shuffled.slice(0, 8);

      setCurrentAction(`Recherche de ${queries.length} styles via l'API...`);

      const results = [];
      for (let i = 0; i < queries.length; i++) {
        const pct = 10 + Math.round(((i + 1) / queries.length) * 30);
        setProgress(pct);
        setCurrentAction(`Recherche: "${queries[i]}" (${i + 1}/${queries.length})`);
        try {
          const data = await searchStyleAPI(queries[i], 4);
          if (data?.style) {
            results.push(data);
          }
        } catch (err) {
          console.error(`Erreur recherche "${queries[i]}":`, err);
        }
        await new Promise((r) => setTimeout(r, 400));
      }

      setProgress(40);
      setCurrentAction("Filtrage des doublons...");
      await new Promise((r) => setTimeout(r, 300));

      const toCreate = results.filter(
        (r) => !existingTitles.has(r.style.title.toLowerCase())
      );

      if (toCreate.length === 0) {
        setCurrentAction("Tous les styles sont deja presents en base.");
        setProgress(100);
        const newLog = {
          id: Date.now(),
          date: new Date().toISOString(),
          status: "warning",
          summary: `Recherche auto terminee - Aucun nouveau style (${existingStyles.length} existants)`,
        };
        setLogs((prev) => [newLog, ...prev].slice(0, 50));
        setIsSearching(false);
        return;
      }

      setCurrentAction(`Creation de ${toCreate.length} style(s)...`);
      let created = 0;
      let skipped = 0;

      for (let i = 0; i < toCreate.length; i++) {
        const { style, images } = toCreate[i];
        const pct = 40 + Math.round(((i + 1) / toCreate.length) * 55);
        setProgress(pct);
        setCurrentAction(
          `Creation: ${style.title} (${i + 1}/${toCreate.length})`
        );

        try {
          await entities.Style.create({
            title: style.title,
            category: style.category,
            subcategory: style.subcategory,
            description: style.description,
            images: images.map((img) => img.url),
            image_url: images[0]?.url || null,
            temps_moyen: style.temps_moyen || "",
            niveau_difficulte: style.niveau_difficulte || "Intermediaire",
            type_cheveux: style.type_cheveux || "",
            type_peau: style.type_peau || "",
            outils_utilises: style.outils_utilises || [],
            tags: style.tags || [],
            status: "publie",
            pro_email: "admin@beautybook.fr",
            likes: 0,
            views: 0,
            featured: false,
          });
          created++;

          const entry = {
            id: Date.now() + i,
            title: style.title,
            category: style.category,
            thumbnail: images[0]?.thumb || images[0]?.url || null,
            date: new Date().toISOString(),
          };
          setCreatedStyles((prev) => [entry, ...prev].slice(0, 50));
        } catch (err) {
          console.error(`Erreur creation "${style.title}":`, err);
          skipped++;
        }

        await new Promise((r) => setTimeout(r, 300));
      }

      setProgress(100);
      setCurrentAction("Finalisation...");
      await new Promise((r) => setTimeout(r, 400));

      const newStats = {
        totalStyles: stats.totalStyles + created,
        lastSearch: new Date().toISOString(),
        totalSearches: stats.totalSearches + 1,
      };
      setStats(newStats);
      setCreatedCount(created);
      setSkippedCount(skipped);

      const status = created > 0 ? "success" : "warning";
      const summary =
        created > 0
          ? `Recherche auto: ${created} style(s) cree(s), ${skipped} echec(s)`
          : `Recherche auto: Aucun nouveau style, ${skipped} echec(s)`;

      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        status,
        summary,
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    } catch (err) {
      console.error("Erreur globale de recherche:", err);
      setError(err.message || "Erreur inconnue");
      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        status: "error",
        summary: `Erreur: ${err.message || "Echec de la recherche"}`,
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    } finally {
      setIsSearching(false);
      setCurrentAction("");
    }
  }, [fetchExistingStyles, stats]);

  const formatDate = (dateString) => {
    if (!dateString) return "Jamais";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("fr-FR") +
      " " +
      date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-gray-900 text-[15px] font-black">
              Recherche de style
            </h3>
            <p className="text-gray-500 text-[13px] font-medium">
              Recherchez un style sur internet et ajoutez-le a la base
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un style beaute... (ex: box braids, smokey eyes, manucure gel french)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-primary transition-colors placeholder:text-gray-400"
          />
          <button
            onClick={handleManualSearch}
            disabled={isManualSearching || !searchQuery.trim()}
            className="bg-primary text-white px-6 py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 min-w-[120px] active:scale-95 transition-all"
          >
            {isManualSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Recherche...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Rechercher
              </>
            )}
          </button>
        </div>

        {/* Search Results Preview */}
        {searchResults && (
          <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="text-gray-800 text-[13px] font-black">
                  {searchResults.style?.title}
                </span>
                <span className="text-gray-500 text-[11px] bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  {searchResults.style?.category}
                  {searchResults.style?.subcategory
                    ? ` > ${searchResults.style.subcategory}`
                    : ""}
                </span>
              </div>
              <button
                onClick={() => setSearchResults(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {searchResults.images?.slice(0, 8).map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <img
                      src={img.thumb || img.url}
                      alt={img.alt || searchResults.style?.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' fill='%23ccc'%3E%3Crect width='40' height='40'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ))}
              </div>

              {searchResults.style?.description && (
                <p className="text-gray-600 text-[13px] mb-3 leading-relaxed">
                  {searchResults.style.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {searchResults.style?.temps_moyen && (
                  <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {searchResults.style.temps_moyen}
                  </span>
                )}
                {searchResults.style?.niveau_difficulte && (
                  <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-medium">
                    {searchResults.style.niveau_difficulte}
                  </span>
                )}
                {searchResults.style?.tags?.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={handleConfirmAdd}
                disabled={isCreatingStyle}
                className="w-full bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {isCreatingStyle ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creation en
                    cours...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Ajouter ce style a la base
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-600 text-[12px] font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* SECTION 2: AUTO SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-gray-900 text-[15px] font-black">
              Recherche automatique
            </h3>
            <p className="text-gray-500 text-[13px] font-medium">
              Cree automatiquement des styles a partir de recherches predefinies
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-[13px] font-medium">
              Activer la recherche auto
            </span>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                isEnabled ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                  isEnabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 text-[13px] font-medium">
              Frequence :
            </span>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-primary"
            >
              <option value="quotidienne">Quotidienne</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuelle">Mensuelle</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-blue-700 text-[12px] font-medium">
              <span className="font-black">{AUTO_SEARCH_QUERIES.length}</span>{" "}
              requetes predefinies - Jusqu'a 8 styles non-dupliques crees par
              recherche
            </p>
          </div>

          <button
            onClick={simulateAutoSearch}
            disabled={isSearching}
            className="w-full bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 min-w-[120px] active:scale-95 transition-all"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Recherche en
                cours...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Lancer une recherche automatique
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 3: PROGRESS */}
      {isSearching && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
            <div>
              <h3 className="text-gray-900 text-[15px] font-black">
                Progression
              </h3>
              <p className="text-gray-500 text-[13px] font-medium">
                {currentAction}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 text-[11px] font-medium">
                Progression
              </span>
              <span className="text-gray-800 text-[11px] font-black">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-green-600 text-[18px] font-black">
                {createdCount}
              </p>
              <p className="text-green-500 text-[11px] font-medium">Crees</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-amber-600 text-[18px] font-black">
                {skippedCount}
              </p>
              <p className="text-amber-500 text-[11px] font-medium">Echecs</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-blue-600 text-[18px] font-black">
                {progress}%
              </p>
              <p className="text-blue-500 text-[11px] font-medium">
                Avancement
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: RECENTLY CREATED STYLES */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">
            Styles recemment crees ({createdStyles.length})
          </h3>
        </div>

        {createdStyles.length === 0 ? (
          <p className="text-gray-400 text-[13px] text-center py-6">
            Aucun style cree pour le moment. Utilisez la recherche ou la
            recherche automatique.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {createdStyles.map((style) => (
              <div
                key={style.id}
                className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
              >
                <div className="aspect-square bg-gray-100">
                  {style.thumbnail ? (
                    <img
                      src={style.thumbnail}
                      alt={style.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-gray-800 text-[11px] font-bold truncate">
                    {style.title}
                  </p>
                  <p className="text-gray-500 text-[10px]">{style.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: STATISTICS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">
            Statistiques
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">
              Styles total en base
            </p>
            <p className="text-gray-900 text-[20px] font-black">
              {stats.totalStyles}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">
              Recherches effectuees
            </p>
            <p className="text-gray-900 text-[20px] font-black">
              {stats.totalSearches}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">
              Requetes auto
            </p>
            <p className="text-gray-900 text-[20px] font-black">
              {AUTO_SEARCH_QUERIES.length}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">
              Derniere recherche
            </p>
            <p className="text-gray-900 text-[13px] font-black">
              {formatDate(stats.lastSearch)}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 6: JOURNAL */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <button
          onClick={() => setShowJournal(!showJournal)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <History className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-gray-900 text-[15px] font-black">
              Journal des recherches
            </h3>
          </div>
          {showJournal ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showJournal && (
          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-4">
                Aucune recherche effectuee
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="shrink-0 mt-0.5">
                    {log.status === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : log.status === "warning" ? (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-[13px] font-medium">
                      {log.summary}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      {formatDate(log.date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* SECTION 7: DATA SOURCES */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Database className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">
            Sources de donnees
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { name: "Pexels API", icon: Globe, status: "active", color: "bg-green-500" },
            { name: "Unsplash API (fallback)", icon: Globe, status: "active", color: "bg-green-500" },
            { name: "AI OpenRouter (style info)", icon: Globe, status: "active", color: "bg-green-500" },
            { name: "Supabase (stockage)", icon: Database, status: "active", color: "bg-green-500" },
          ].map((source, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <source.icon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800 text-[13px] font-medium">
                  {source.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${source.color}`} />
                <span className="text-gray-500 text-[11px] capitalize">
                  {source.status === "active" ? "Actif" : "Attention"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
