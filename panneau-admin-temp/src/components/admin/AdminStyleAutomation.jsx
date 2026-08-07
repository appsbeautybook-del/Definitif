import { useState, useEffect } from "react";
import { Loader2, Play, Pause, Clock, RefreshCw, BarChart3, Search, Database, CheckCircle, AlertCircle, History, Zap, Globe } from "lucide-react";

export default function AdminStyleAutomation() {
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem("bb_style_auto_enabled") === "true");
  const [frequency, setFrequency] = useState(() => localStorage.getItem("bb_style_auto_frequency") || "quotidienne");
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("bb_style_auto_stats");
    return saved ? JSON.parse(saved) : { categories: 0, subcategories: 0, styles: 0, lastSearch: null };
  });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("bb_style_auto_log");
    return saved ? JSON.parse(saved) : [];
  });

  const sources = [
    { name: "Google Trends", icon: Globe, status: "active", color: "bg-green-500" },
    { name: "Pinterest Trends", icon: Globe, status: "active", color: "bg-green-500" },
    { name: "Instagram Hashtags", icon: Globe, status: "active", color: "bg-green-500" },
    { name: "Beauty Blogs", icon: Globe, status: "active", color: "bg-green-500" },
    { name: "Industry Reports", icon: Globe, status: "warning", color: "bg-amber-500" },
  ];

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

  const simulateSearch = async () => {
    setIsSearching(true);
    setProgress(0);

    const actions = [
      "Recherche en cours...",
      "Analyse des sources...",
      "Création des catégories...",
      "Importation des styles..."
    ];

    let actionIndex = 0;
    setCurrentAction(actions[0]);

    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);

      const newIndex = Math.floor((i / 100) * actions.length);
      if (newIndex !== actionIndex && newIndex < actions.length) {
        actionIndex = newIndex;
        setCurrentAction(actions[actionIndex]);
      }
    }

    const newCategories = Math.floor(Math.random() * 5) + 1;
    const newSubcategories = Math.floor(Math.random() * 15) + 3;
    const newStyles = Math.floor(Math.random() * 50) + 10;

    const newStats = {
      categories: stats.categories + newCategories,
      subcategories: stats.subcategories + newSubcategories,
      styles: stats.styles + newStyles,
      lastSearch: new Date().toISOString()
    };
    setStats(newStats);

    const newLog = {
      id: Date.now(),
      date: new Date().toISOString(),
      status: "success",
      summary: `Recherche automatique - ${newCategories} catégories, ${newSubcategories} sous-catégories, ${newStyles} styles`
    };
    setLogs([newLog, ...logs].slice(0, 50));

    setIsSearching(false);
    setProgress(0);
    setCurrentAction("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Jamais";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Controls Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-gray-900 text-[15px] font-black">Automatisation intelligente</h3>
            <p className="text-gray-500 text-[13px] font-medium">Recherche automatique de tendances et styles beauté</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-700 text-[13px] font-medium">Activer l'automatisation</span>
            </div>
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
            <span className="text-gray-700 text-[13px] font-medium">Fréquence :</span>
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

          <div className="flex gap-3">
            <button
              onClick={simulateSearch}
              disabled={isSearching}
              className="flex-1 bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 min-w-[120px] active:scale-95 transition-all"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Recherche...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Lancer une recherche
                </>
              )}
            </button>
            <button
              onClick={simulateSearch}
              disabled={isSearching}
              className="bg-gray-100 text-gray-600 py-3 px-4 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSearching ? "animate-spin" : ""}`} />
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Progress Card */}
      {isSearching && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
            <div>
              <h3 className="text-gray-900 text-[15px] font-black">Progression</h3>
              <p className="text-gray-500 text-[13px] font-medium">{currentAction}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 text-[11px] font-medium">Progression</span>
              <span className="text-gray-800 text-[11px] font-black">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-blue-600 text-[18px] font-black">{Math.floor(progress * 0.1)}</p>
              <p className="text-blue-500 text-[11px] font-medium">Catégories</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-purple-600 text-[18px] font-black">{Math.floor(progress * 0.3)}</p>
              <p className="text-purple-500 text-[11px] font-medium">Sous-catégories</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-green-600 text-[18px] font-black">{Math.floor(progress * 1)}</p>
              <p className="text-green-500 text-[11px] font-medium">Styles</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Statistics Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">Statistiques</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Catégories ajoutées</p>
            <p className="text-gray-900 text-[20px] font-black">{stats.categories}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Sous-catégories ajoutées</p>
            <p className="text-gray-900 text-[20px] font-black">{stats.subcategories}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Styles importés</p>
            <p className="text-gray-900 text-[20px] font-black">{stats.styles}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Dernière recherche</p>
            <p className="text-gray-900 text-[13px] font-black">{formatDate(stats.lastSearch)}</p>
          </div>
        </div>
      </div>

      {/* Section 4: Journal Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <History className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">Journal des recherches</h3>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400 text-[13px] text-center py-4">Aucune recherche effectuée</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
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
                  <p className="text-gray-800 text-[13px] font-medium">{log.summary}</p>
                  <p className="text-gray-500 text-[11px]">{formatDate(log.date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 5: Sources Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Database className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">Sources de données</h3>
        </div>

        <div className="space-y-3">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <source.icon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800 text-[13px] font-medium">{source.name}</span>
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