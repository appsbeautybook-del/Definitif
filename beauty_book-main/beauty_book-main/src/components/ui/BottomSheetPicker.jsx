import { useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * BottomSheetPicker — remplace les <select> natifs sur mobile
 * Props: label, value, onChange, options (string[] ou {value, label}[]), placeholder
 */
export default function BottomSheetPicker({ label, value, onChange, options, placeholder = "Sélectionner...", open, onOpen, onClose }) {
  const normalized = options.map(o => typeof o === "string" ? { value: o, label: o } : o);
  const selected = normalized.find(o => o.value === value);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={onOpen}
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-[14px] text-left flex items-center justify-between outline-none active:scale-[0.99] transition-all"
      >
        <span className={selected ? "text-gray-700" : "text-gray-300"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {/* Sheet */}
      {open && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end" onClick={onClose}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className="relative bg-white rounded-t-3xl z-10 max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            {/* Title */}
            {label && (
              <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest px-5 pb-3 border-b border-gray-100 shrink-0">
                {label}
              </p>
            )}
            {/* Options */}
            <div className="overflow-y-auto">
              {normalized.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); onClose(); }}
                  className="w-full flex items-center justify-between px-5 py-4 text-[15px] font-black text-gray-800 active:bg-gray-50 transition-all border-b border-gray-50 last:border-0"
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
            {/* Safe area */}
            <div style={{ height: "env(safe-area-inset-bottom, 16px)" }} className="shrink-0" />
          </div>
        </div>
      )}
    </>
  );
}