import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * PageHeader unifié — design cohérent sur toutes les pages
 * Props:
 *   title       — titre principal (string)
 *   subtitle    — sous-titre optionnel (string)
 *   onBack      — callback ou null (si null: navigate(-1))
 *   backTo      — route string optionnelle (prioritaire sur navigate(-1))
 *   right       — node React optionnel (bouton action droit)
 *   dark        — bool (default true) → bg navy / false → bg blanc
 */
export default function PageHeader({ title, subtitle, onBack, backTo, right, dark = true }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    if (backTo) return navigate(backTo);
    navigate(-1);
  };

  if (dark) {
    return (
      <div className="bg-[#1a2035] px-5 pt-5 pb-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-black text-white leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    );
  }

  return (
    <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
      <button
        onClick={handleBack}
        className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-[20px] font-black text-gray-900 leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}