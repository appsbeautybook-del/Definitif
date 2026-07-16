import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, Loader2, X } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

export default function SmartNameInput({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchingAI, setSearchingAI] = useState(false);
  const [dbNames, setDbNames] = useState([]);
  const ref = useRef(null);
  const debounceRef = useRef(null);

  // Charger les noms de services et de styles existants
  useEffect(() => {
    Promise.all([
      entities.Service.filter({ status: "actif" }, "-created_at", 100).catch(() => []),
      entities.Style.filter({ status: "publie" }, "-created_at", 100).catch(() => []),
    ]).then(([services, styles]) => {
      const names = new Set([
        ...services.map(s => s.title),
        ...styles.map(s => s.title),
      ].filter(Boolean));
      setDbNames([...names]);
    });
  }, []);

  // Fermeture au clic extérieur
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Synchroniser la valeur externe
  useEffect(() => {
    if (value !== query) setQuery(value || "");
  }, [value]);

  // Filtrage local + recherche IA avec debounce
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      setAiSuggestions([]);
      return;
    }
    // Suggestions locales
    const local = dbNames.filter(n => n.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
    setSuggestions(local);

    // Recherche IA (debounce 800ms)
    debounceRef.current = setTimeout(async () => {
      setSearchingAI(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Tu es un expert en coiffure et beauté. Un professionnel tape "${query}" comme nom de prestation beauté/coiffure. Suggère 5 noms de prestations réels et tendance qui correspondent à cette recherche. Les noms doivent être en français et professionnels. Réponds UNIQUEMENT en JSON.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: { type: "array", items: { type: "string" } }
            }
          }
        });
        const ai = (res?.suggestions || []).filter(s => s && s.length > 2).slice(0, 5);
        setAiSuggestions(ai);
      } catch { setAiSuggestions([]); }
      setSearchingAI(false);
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [query, dbNames]);

  const select = (name) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const hasAny = suggestions.length > 0 || aiSuggestions.length > 0;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Ex: Coupe & Brushing Signature"
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-12 py-4 text-[14px] text-gray-700 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
        />
        {searchingAI ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        ) : query.length >= 2 && (
          <button onClick={() => { onChange(""); setQuery(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>

      {open && hasAny && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {/* Suggestions locales (services/styles existants) */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggestions existantes</span>
              </div>
              {suggestions.map(s => (
                <button key={s} onClick={() => select(s)}
                  className={`w-full text-left px-4 py-3 text-[14px] font-medium transition-colors flex items-center justify-between ${value === s ? "bg-orange-50 text-primary font-black" : "text-gray-700 hover:bg-gray-50"}`}>
                  <span>{s}</span>
                  {value === s && <span className="text-primary text-[12px] font-black">✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions IA */}
          {aiSuggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Suggestions IA</span>
              </div>
              {aiSuggestions.filter(s => !suggestions.includes(s)).map(s => (
                <button key={s} onClick={() => select(s)}
                  className={`w-full text-left px-4 py-3 text-[14px] font-medium transition-colors flex items-center justify-between ${value === s ? "bg-orange-50 text-primary font-black" : "text-gray-700 hover:bg-purple-50"}`}>
                  <span>{s}</span>
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </button>
              ))}
            </div>
          )}

          {/* Recherche IA en cours mais rien trouvé encore */}
          {searchingAI && suggestions.length === 0 && aiSuggestions.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[12px] font-medium">Recherche IA en cours...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}