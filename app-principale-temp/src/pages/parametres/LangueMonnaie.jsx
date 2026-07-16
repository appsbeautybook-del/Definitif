import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Check, DollarSign } from "lucide-react";
import { LANGUAGES, CURRENCIES } from "@/hooks/useLocale";
import { useThemeBg } from "@/hooks/useTheme";
import { useAppLocale } from "@/lib/LocaleContext.jsx";

export default function LangueMonnaie() {
  const navigate = useNavigate();
  const { lang, currency, setLang, setCurrency } = useAppLocale();
  const themeBg = useThemeBg();
  const [savedLang, setSavedLang] = useState(null);
  const [savedCurrency, setSavedCurrency] = useState(null);

  const handleLang = (code) => {
    setLang(code);
    setSavedLang(code);
    setTimeout(() => setSavedLang(null), 2000);
  };

  const handleCurrency = (code) => {
    setCurrency(code);
    setSavedCurrency(code);
    setTimeout(() => setSavedCurrency(null), 2000);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang);
  const currentCurrency = CURRENCIES.find(c => c.code === currency);

  return (
    <div className="font-display min-h-screen" style={{ background: themeBg }}>
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <h1 className="text-[20px] font-black text-gray-900">Langue & Monnaie</h1>
      </div>

      <div className="px-4 pb-16 pt-5 space-y-6">

        {/* Sélection actuelle */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-[28px]">{currentLang?.flag}</div>
          <div className="flex-1">
            <p className="text-[12px] font-black text-primary uppercase tracking-widest">Sélection actuelle</p>
            <p className="text-[14px] font-black text-gray-900">{currentLang?.label} · {currentCurrency?.symbol} {currentCurrency?.label}</p>
          </div>
        </div>

        {/* Section Langue */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Langue d'interface</p>
            </div>
            {savedLang && (
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3" /> Appliqué !
              </span>
            )}
          </div>
          <div className="space-y-2">
            {LANGUAGES.map(l => {
              const isSelected = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => handleLang(l.code)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-4 transition-all active:scale-[0.99] shadow-sm"
                  style={{ border: isSelected ? "2px solid #E8732A" : "2px solid #f3f4f6" }}
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[22px] shrink-0">
                    {l.flag}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[15px] font-black text-gray-900">{l.label}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{l.sub}</p>
                  </div>
                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-primary">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Monnaie */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Monnaie d'affichage</p>
            </div>
            {savedCurrency && (
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3" /> Appliqué !
              </span>
            )}
          </div>
          <div className="space-y-2">
            {CURRENCIES.map(c => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => handleCurrency(c.code)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-4 transition-all active:scale-[0.99] shadow-sm"
                  style={{ border: isSelected ? "2px solid #E8732A" : "2px solid #f3f4f6" }}
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[22px] shrink-0">
                    {c.flag}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[15px] font-black text-gray-900">{c.label}</p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {c.sub} · <span className="font-black text-gray-700">{c.symbol}</span>
                    </p>
                  </div>
                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-primary">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 font-medium pb-4">
          Les préférences sont sauvegardées automatiquement sur cet appareil.
        </p>
      </div>
    </div>
  );
}