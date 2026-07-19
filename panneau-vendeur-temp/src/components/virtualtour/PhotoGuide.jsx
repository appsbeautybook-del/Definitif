import { useState } from "react";
import { X, Smartphone, Info, CheckCircle2, ChevronRight, ChevronLeft, Image, Play } from "lucide-react";

const STEPS = [
  {
    icon: Smartphone,
    title: "Prendre vos photos 360°",
    description: "Utilisez l'appareil photo de votre smartphone en mode Panorama ou une caméra 360° dédiée.",
    tips: [
      "Placez-vous au centre de chaque pièce",
      "Tournez sur vous-même en gardant le téléphone bien droit",
      "Évitez les contre-jours et les zones trop sombres",
    ],
    emoji: "📱",
  },
  {
    icon: Image,
    title: "Le ratio idéal : 2 pour 1",
    description: "Une photo 360° équirectangulaire doit être exactement 2 fois plus large que haute.",
    tips: [
      "Ratio 2:1 — par exemple 4096 × 2048 pixels",
      "La largeur = 2 × la hauteur",
      "Si votre photo n'a pas ce ratio, la visite 3D sera déformée",
    ],
    visual: true,
    emoji: "📐",
  },
  {
    icon: Image,
    title: "3 photos minimum",
    description: "Créez au moins 3 scènes pour une visite immersive complète.",
    tips: [
      "Scène 1 : L'entrée / réception",
      "Scène 2 : La salle principale",
      "Scène 3 : Une salle de soin ou un espace clé",
      "Plus vous ajoutez de scènes, plus la visite est riche !",
    ],
    emoji: "🏠",
  },
  {
    icon: CheckCircle2,
    title: "Conseils de pro",
    description: "Pour un rendu professionnel qui impressionnera vos clients.",
    tips: [
      "Désencombrez et rangez chaque pièce avant de photographier",
      "Allumez toutes les lumières pour un rendu chaleureux",
      "Préférez une hauteur d'yeux (environ 1,60 m du sol)",
      "Ajoutez des points de navigation entre les pièces",
    ],
    emoji: "✨",
  },
];

export default function PhotoGuide({ theme = "dark", onClose }) {
  const isLight = theme === "light";
  const [step, setStep] = useState(-1);
  const current = step >= 0 ? STEPS[step] : null;

  // Classes communes
  const overlayBg = isLight ? "bg-black/40 backdrop-blur-sm" : "bg-black/80 backdrop-blur-sm";
  const sheetBg = isLight ? "bg-white" : "bg-[#0d0d0d]";
  const sheetBorder = isLight ? "border-gray-200" : "border-gray-800";
  const handleColor = isLight ? "bg-gray-300" : "bg-gray-700";
  const headingColor = isLight ? "text-gray-900" : "text-white";
  const subColor = isLight ? "text-gray-400" : "text-gray-500";
  const closeBtnBg = isLight ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-800";
  const closeIconColor = isLight ? "text-gray-500" : "text-gray-400";
  const cardBg = isLight ? "bg-gray-50" : "bg-[#121212]";
  const cardBorder = isLight ? "border-gray-200" : "border-gray-800";
  const innerCardBg = isLight ? "bg-white" : "bg-[#1a1a1a]";
  const innerCardBorder = isLight ? "border-gray-200" : "border-gray-800";
  const innerCardText = isLight ? "text-gray-700" : "text-gray-300";
  const innerCardSub = isLight ? "text-gray-400" : "text-gray-500";
  const bodyText = isLight ? "text-gray-500" : "text-gray-400";
  const tipsText = isLight ? "text-gray-600" : "text-gray-300";
  const passBtnBg = isLight ? "bg-gray-100 text-gray-600 border-gray-200" : "bg-gray-800 text-gray-300 border-gray-700";
  const navBtnBg = isLight ? "bg-white border-gray-200" : "bg-[#1a1a1a] border-gray-800";
  const navArrowColor = isLight ? "text-gray-700" : "text-white";
  const inactiveDot = isLight ? "bg-gray-300" : "bg-gray-700";
  const emojiBg = isLight ? "bg-white" : "bg-[#1a1a1a]";
  const visualBg = isLight ? "bg-white" : "bg-[#0a0a0a]";
  const visualCardBg = isLight ? "bg-white" : "bg-[#1a1a1a]";
  const visualText = isLight ? "text-gray-500" : "text-gray-400";

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      <div className={`absolute inset-0 ${overlayBg}`} onClick={onClose} />
      <div className={`relative ${sheetBg} w-full rounded-t-3xl px-5 pt-4 pb-8 z-10 max-h-[90vh] overflow-y-auto border-t ${sheetBorder}`}>
        <div className={`w-10 h-1 ${handleColor} rounded-full mx-auto mb-5`} />

        {/* Welcome Screen */}
        {step === -1 && (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <h2 className={`text-[18px] font-black ${headingColor}`}>Guide photo 360°</h2>
              </div>
              <button onClick={onClose} className={`w-8 h-8 ${closeBtnBg} rounded-lg flex items-center justify-center`}>
                <X className={`w-4 h-4 ${closeIconColor}`} />
              </button>
            </div>

            <p className={`text-[11px] ${subColor} font-medium w-full text-left mb-6`}>
              Suivez ce guide pas à pas pour créer une visite virtuelle parfaite
            </p>

            {/* Intro card */}
            <div className={`${cardBg} rounded-3xl p-6 border ${cardBorder} w-full mb-6`}>
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-16 h-16 ${emojiBg} rounded-2xl flex items-center justify-center text-[36px] shrink-0`}>
                  📸
                </div>
                <div>
                  <h3 className={`text-[16px] font-black ${headingColor}`}>Prêt à créer votre visite ?</h3>
                  <p className={`text-[12px] ${bodyText} font-medium mt-1`}>
                    Ce guide vous montre comment prendre des photos 360° parfaites pour impressionner vos clients.
                  </p>
                </div>
              </div>

              {/* Quick summary */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {STEPS.map((s, i) => (
                  <div key={i} className={`${innerCardBg} rounded-xl p-3 flex items-center gap-3 border ${innerCardBorder}`}>
                    <div className={`w-8 h-8 ${isLight ? "bg-gray-100" : "bg-gray-800"} rounded-lg flex items-center justify-center shrink-0 text-[16px]`}>
                      {s.emoji}
                    </div>
                    <div>
                      <p className={`text-[10px] font-black ${innerCardText}`}>{s.title}</p>
                      <p className={`text-[9px] ${innerCardSub} font-medium`}>{i + 1} sur {STEPS.length}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onClose}
                className={`flex-1 text-[13px] font-black uppercase tracking-widest py-4 rounded-2xl border active:scale-[0.98] transition-all ${passBtnBg}`}
              >
                Passer
              </button>
              <button
                onClick={() => setStep(0)}
                className="flex-[2] bg-primary text-white text-[13px] font-black uppercase tracking-widest py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <Play className="w-4 h-4" /> Suivre les étapes
              </button>
            </div>
          </div>
        )}

        {/* Steps */}
        {step >= 0 && current && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <h2 className={`text-[18px] font-black ${headingColor}`}>Guide photo 360°</h2>
              </div>
              <button onClick={onClose} className={`w-8 h-8 ${closeBtnBg} rounded-lg flex items-center justify-center`}>
                <X className={`w-4 h-4 ${closeIconColor}`} />
              </button>
            </div>

            <p className={`text-[11px] ${subColor} font-medium mb-5`}>
              Apprenez à prendre des photos parfaites pour votre visite virtuelle
            </p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all ${
                    i === step ? "w-6 h-1.5 bg-primary" : i < step ? "w-1.5 h-1.5 bg-primary/60" : `w-1.5 h-1.5 ${inactiveDot}`
                  }`}
                />
              ))}
            </div>

            {/* Step card */}
            <div className={`${cardBg} rounded-3xl p-5 border ${cardBorder} mb-4`}>
              {/* Emoji + Title */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-14 h-14 ${emojiBg} rounded-2xl flex items-center justify-center text-[28px] shrink-0`}>
                  {current.emoji}
                </div>
                <div>
                  <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-1">
                    Étape {step + 1} sur {STEPS.length}
                  </p>
                  <h3 className={`text-[17px] font-black ${headingColor}`}>{current.title}</h3>
                  <p className={`text-[12px] ${bodyText} font-medium mt-1`}>{current.description}</p>
                </div>
              </div>

              {/* Visual ratio demo */}
              {current.visual && (
                <div className={`mb-5 ${visualBg} rounded-2xl p-4 border ${cardBorder}`}>
                  <p className={`text-[10px] font-black ${subColor} uppercase tracking-widest mb-3`}>Ratio 2:1 visuel</p>
                  <div className="relative w-full" style={{ aspectRatio: "2/1" }}>
                    <div className="absolute inset-0 border-2 border-primary/60 rounded-lg" />
                    <div className="absolute inset-0 flex">
                      <div className="flex-1 border-r border-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-black text-primary/40">1</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-[10px] font-black text-primary/40">1</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary/20 rounded-full px-3 py-1">
                      <span className="text-[10px] font-black text-primary">Largeur = 2 × Hauteur</span>
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-2">
                    <div className={`${visualCardBg} rounded-xl p-3 border border-green-500/20`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[10px] font-black text-green-400">Correct</span>
                      </div>
                      <p className={`text-[11px] ${visualText} font-medium`}>4096 × 2048 px</p>
                      <p className={`text-[11px] ${visualText} font-medium`}>2048 × 1024 px</p>
                    </div>
                    <div className={`${visualCardBg} rounded-xl p-3 border border-red-500/20`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <X className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] font-black text-red-400">Incorrect</span>
                      </div>
                      <p className={`text-[11px] ${visualText} font-medium`}>1920 × 1080 px</p>
                      <p className={`text-[11px] ${visualText} font-medium`}>1024 × 1024 px</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips list */}
              <div className="space-y-2">
                {current.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-black text-primary">{i + 1}</span>
                    </div>
                    <p className={`text-[12px] ${tipsText} font-medium leading-relaxed`}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className={`w-12 h-12 ${navBtnBg} rounded-2xl flex items-center justify-center border disabled:opacity-30 active:scale-95`}
              >
                <ChevronLeft className={`w-5 h-5 ${navArrowColor}`} />
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                  className="flex-1 bg-primary text-white font-black text-[13px] uppercase tracking-widest py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 bg-primary text-white font-black text-[13px] uppercase tracking-widest py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> J'ai compris !
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}