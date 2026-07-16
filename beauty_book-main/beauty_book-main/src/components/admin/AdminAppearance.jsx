import { useState, useEffect } from "react";
import { Type, Palette, RotateCcw, Check, Monitor, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/adminApiClient";

const FONTS = [
  { id: "plus-jakarta", label: "Plus Jakarta Sans", import: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap", css: "'Plus Jakarta Sans', sans-serif" },
  { id: "inter", label: "Inter", import: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap", css: "'Inter', sans-serif" },
  { id: "poppins", label: "Poppins", import: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap", css: "'Poppins', sans-serif" },
  { id: "nunito", label: "Nunito", import: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap", css: "'Nunito', sans-serif" },
  { id: "dm-sans", label: "DM Sans", import: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap", css: "'DM Sans', sans-serif" },
  { id: "outfit", label: "Outfit", import: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap", css: "'Outfit', sans-serif" },
];

const FONT_SIZES = [
  { id: "sm", label: "Petite", scale: 0.9, desc: "Texte compact" },
  { id: "md", label: "Normale", scale: 1, desc: "Taille par défaut" },
  { id: "lg", label: "Grande", scale: 1.1, desc: "Plus lisible" },
  { id: "xl", label: "Très grande", scale: 1.2, desc: "Accessibilité maximale" },
];

const ICON_PACKS = [
  { id: "lucide", label: "Lucide (défaut)", desc: "Icônes fines et modernes" },
  { id: "rounded", label: "Rounded", desc: "Icônes arrondies et douces" },
  { id: "bold", label: "Bold", desc: "Icônes épaisses et lisibles" },
];

export default function AdminAppearance() {
  const [fontId, setFontId] = useState("plus-jakarta");
  const [sizeId, setSizeId] = useState("md");
  const [iconPackId, setIconPackId] = useState("lucide");
  const [saved_, setSaved_] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    adminApi.getConfig("appearance_config")
      .then(res => {
        const data = Array.isArray(res) ? res : res?.data || res;
        const rows = data?.results || data || [];
        if (rows[0]?.value) {
          const v = rows[0].value;
          if (v.fontId) setFontId(v.fontId);
          if (v.sizeId) setSizeId(v.sizeId);
          if (v.iconPackId) setIconPackId(v.iconPackId);
          setConfigId(rows[0].id);
        }
      }).catch(() => {}).finally(() => setLoadingConfig(false));
  }, []);

  const selectedFont = FONTS.find(f => f.id === fontId) || FONTS[0];
  const selectedSize = FONT_SIZES.find(s => s.id === sizeId) || FONT_SIZES[1];

  // Live preview: inject font link
  useEffect(() => {
    const existing = document.getElementById("admin-font-preview");
    if (existing) existing.remove();
    const link = document.createElement("link");
    link.id = "admin-font-preview";
    link.rel = "stylesheet";
    link.href = selectedFont.import;
    document.head.appendChild(link);
  }, [fontId]);

  const handleSave = async () => {
    const config = { fontId, sizeId, iconPackId };
    // Sauvegarder en BDD pour tous les utilisateurs
    if (configId) {
      const { data } = await adminApi.updateConfig(configId, { value: config });
      setConfigId(data?.result?.id || configId);
    } else {
      const { data } = await adminApi.createConfig({ key: "appearance_config", value: config });
      setConfigId(data?.result?.id);
    }

    // Apply globally dans le navigateur courant
    document.documentElement.style.setProperty("--font-display", selectedFont.css);
    document.documentElement.style.fontSize = `${selectedSize.scale * 16}px`;

    const existingApp = document.getElementById("app-font-override");
    if (existingApp) existingApp.remove();
    const link = document.createElement("link");
    link.id = "app-font-override";
    link.rel = "stylesheet";
    link.href = selectedFont.import;
    document.head.appendChild(link);

    setSaved_(true);
    setTimeout(() => setSaved_(false), 2000);
  };

  const handleReset = async () => {
    if (configId) {
      await adminApi.updateConfig(configId, { value: { fontId: "plus-jakarta", sizeId: "md", iconPackId: "lucide" } });
    }
    document.documentElement.style.removeProperty("--font-display");
    document.documentElement.style.fontSize = "";
    setFontId("plus-jakarta");
    setSizeId("md");
    setIconPackId("lucide");
  };

  return (
    <div className="max-w-3xl space-y-6">

      {/* Section Police */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <Type className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-[15px] font-black text-gray-900">Police de caractères</h2>
            <p className="text-[11px] text-gray-400">Choisissez la police de l'application</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FONTS.map(font => (
            <button
              key={font.id}
              onClick={() => setFontId(font.id)}
              className={`px-4 py-3 rounded-2xl border-2 text-left transition-all active:scale-[0.97] ${fontId === font.id ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"}`}
            >
              <p className="text-[14px] font-bold text-gray-900" style={{ fontFamily: font.css }}>{font.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: font.css }}>Aa Bb Cc 123</p>
              {fontId === font.id && (
                <div className="mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  <span className="text-[9px] text-primary font-black uppercase">Sélectionnée</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Section Taille */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Monitor className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-[15px] font-black text-gray-900">Taille de la police</h2>
            <p className="text-[11px] text-gray-400">Ajustez la lisibilité sur mobile</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FONT_SIZES.map(size => (
            <button
              key={size.id}
              onClick={() => setSizeId(size.id)}
              className={`px-4 py-4 rounded-2xl border-2 text-left transition-all active:scale-[0.97] ${sizeId === size.id ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"}`}
            >
              <p className="font-black text-gray-900 mb-1" style={{ fontSize: `${size.scale * 14}px` }}>Aa</p>
              <p className="text-[13px] font-black text-gray-800">{size.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{size.desc}</p>
              {sizeId === size.id && <Check className="w-3.5 h-3.5 text-primary mt-1.5" />}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="mx-5 mb-5 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Aperçu</p>
          <div style={{ fontFamily: selectedFont.css, fontSize: `${selectedSize.scale * 14}px` }}>
            <p className="font-black text-gray-900 mb-1" style={{ fontSize: `${selectedSize.scale * 18}px` }}>BeautyBook</p>
            <p className="font-bold text-gray-600" style={{ fontSize: `${selectedSize.scale * 13}px` }}>Services beauté • Réservation en ligne</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: `${selectedSize.scale * 12}px` }}>Découvrez les meilleurs salons près de chez vous</p>
          </div>
        </div>
      </div>

      {/* Section Icônes */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-[15px] font-black text-gray-900">Style des icônes</h2>
            <p className="text-[11px] text-gray-400">Choisissez le style visuel des icônes</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-3 gap-3">
          {ICON_PACKS.map(pack => (
            <button
              key={pack.id}
              onClick={() => setIconPackId(pack.id)}
              className={`px-4 py-4 rounded-2xl border-2 text-left transition-all active:scale-[0.97] ${iconPackId === pack.id ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex gap-1 mb-2">
                {pack.id === "lucide" && (
                  <>
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/></svg>
                  </>
                )}
                {pack.id === "rounded" && (
                  <>
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9M5 10v9a2 2 0 002 2h4v-5h4v5h4a2 2 0 002-2v-9"/></svg>
                  </>
                )}
                {pack.id === "bold" && (
                  <>
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9M5 10v9h6v-5h2v5h6v-9"/></svg>
                  </>
                )}
              </div>
              <p className="text-[13px] font-black text-gray-800">{pack.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{pack.desc}</p>
              {iconPackId === pack.id && <Check className="w-3.5 h-3.5 text-primary mt-1.5" />}
            </button>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-[11px] text-amber-700 font-medium">
            ℹ️ Le changement de style d'icônes s'appliquera au prochain rechargement de l'application.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Réinitialiser
        </button>
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-black text-[14px] rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all"
        >
          {saved_ ? <><Check className="w-5 h-5" /> Appliqué !</> : "Appliquer les changements"}
        </button>
      </div>
    </div>
  );
}