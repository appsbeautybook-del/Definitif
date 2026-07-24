import { useState, useEffect } from "react";
import {
  X, ChevronRight, ChevronLeft, CheckCircle2, Play, Camera,
  Ruler, Layers, Sparkles, ArrowRight, RotateCcw, Eye,
  Smartphone, Image, Zap, AlertTriangle, Check, Star,
  CircleDot, Move, Focus, Aperture
} from "lucide-react";

const STEPS = [
  {
    id: "capture",
    icon: Camera,
    accentIcon: Smartphone,
    title: "Capturer vos photos 360°",
    subtitle: "La base d'une visite virtuelle réussie",
    description: "Utilisez l'appareil photo de votre smartphone en mode Panorama ou une caméra 360° dédiée pour capturer chaque pièce.",
    tips: [
      { icon: Move, text: "Placez-vous au centre de chaque pièce" },
      { icon: RotateCcw, text: "Tournez sur vous-même en gardant le téléphone bien droit" },
      { icon: Eye, text: "Évitez les contre-jours et les zones trop sombres" },
    ],
    color: "from-violet-500 to-purple-600",
    lightColor: "from-violet-50 to-purple-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    accentBg: "bg-violet-500",
  },
  {
    id: "ratio",
    icon: Ruler,
    accentIcon: Focus,
    title: "Le ratio idéal : 2 pour 1",
    subtitle: "La règle d'or des photos 360°",
    description: "Une photo 360° équirectangulaire doit être exactement 2 fois plus large que haute pour un rendu parfait.",
    tips: [
      { icon: Check, text: "Ratio 2:1 — par exemple 4096 × 2048 pixels" },
      { icon: Check, text: "La largeur = 2 × la hauteur" },
      { icon: AlertTriangle, text: "Sans ce ratio, la visite 3D sera déformée" },
    ],
    visual: true,
    color: "from-amber-500 to-orange-600",
    lightColor: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accentBg: "bg-amber-500",
  },
  {
    id: "scenes",
    icon: Layers,
    accentIcon: Aperture,
    title: "3 photos minimum",
    subtitle: "Construisez une immersion complète",
    description: "Créez au moins 3 scènes pour une visite immersive qui guide le visiteur à travers votre espace.",
    tips: [
      { icon: Star, text: "Scène 1 : L'entrée / réception" },
      { icon: Star, text: "Scène 2 : La salle principale" },
      { icon: Star, text: "Scène 3 : Une salle de soin ou un espace clé" },
      { icon: Zap, text: "Plus vous ajoutez de scènes, plus la visite est riche !" },
    ],
    color: "from-emerald-500 to-teal-600",
    lightColor: "from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accentBg: "bg-emerald-500",
  },
  {
    id: "tips",
    icon: Sparkles,
    accentIcon: CheckCircle2,
    title: "Conseils de pro",
    subtitle: "Les secrets d'un rendu professionnel",
    description: "Pour un rendu professionnel qui impressionnera vos clients et valorisera votre établissement.",
    tips: [
      { icon: Check, text: "Désencombrez et rangez chaque pièce" },
      { icon: Check, text: "Allumez toutes les lumières pour un rendu chaleureux" },
      { icon: Check, text: "Préférez une hauteur d'yeux (environ 1,60 m)" },
      { icon: Check, text: "Ajoutez des points de navigation entre les pièces" },
    ],
    color: "from-pink-500 to-rose-600",
    lightColor: "from-pink-50 to-rose-50",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    accentBg: "bg-pink-500",
  },
];

function ProgressBar({ current, total, color }) {
  return (
    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500 ease-out`}
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
  );
}

function StepIndicator({ steps, current, onSelect }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`relative flex items-center justify-center transition-all duration-300 ${
            i === current
              ? `w-8 h-8 ${s.accentBg} text-white rounded-full shadow-lg scale-110`
              : i < current
              ? `w-6 h-6 ${s.accentBg}/80 text-white rounded-full`
              : "w-6 h-6 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-full"
          }`}
        >
          {i < current ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <span className="text-[10px] font-bold">{i + 1}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function RatioVisual({ isLight }) {
  return (
    <div className={`rounded-2xl p-4 ${isLight ? 'bg-gray-50' : 'bg-[#111]'} border ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="w-4 h-4 text-amber-500" />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
          Visualisation du ratio
        </span>
      </div>

      <div className="relative w-full" style={{ aspectRatio: "2/1" }}>
        <div className="absolute inset-0 border-2 border-dashed border-amber-400/60 rounded-xl" />
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r border-amber-400/30 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-black text-amber-500/30">1</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-black text-amber-500/30">1</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
            Largeur = 2 × Hauteur
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <div className={`rounded-xl p-3 border ${isLight ? 'bg-white border-green-200' : 'bg-[#1a1a1a] border-green-900/50'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-green-600" />
            </div>
            <span className="text-[10px] font-bold text-green-600">Correct</span>
          </div>
          <p className={`text-[11px] font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>4096 × 2048 px</p>
          <p className={`text-[11px] font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>2048 × 1024 px</p>
        </div>
        <div className={`rounded-xl p-3 border ${isLight ? 'bg-white border-red-200' : 'bg-[#1a1a1a] border-red-900/50'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-red-600" />
            </div>
            <span className="text-[10px] font-bold text-red-600">Incorrect</span>
          </div>
          <p className={`text-[11px] font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>1920 × 1080 px</p>
          <p className={`text-[11px] font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>1024 × 1024 px</p>
        </div>
      </div>
    </div>
  );
}

export default function PhotoGuide({ theme = "dark", onClose }) {
  const isLight = theme === "light";
  const [step, setStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const current = step >= 0 ? STEPS[step] : null;

  const navigate = (newStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isLight ? "bg-black/30 backdrop-blur-sm" : "bg-black/70 backdrop-blur-md"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full max-w-lg ${
          isLight ? "bg-white" : "bg-[#0a0a0a]"
        } rounded-t-3xl sm:rounded-3xl z-10 max-h-[92vh] overflow-hidden flex flex-col transition-all duration-300 ${
          isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Handle */}
        <div className={`w-10 h-1 ${isLight ? 'bg-gray-300' : 'bg-gray-700'} rounded-full mx-auto mt-3 shrink-0`} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Welcome Screen */}
          {step === -1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className="flex items-center justify-between pt-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20`}>
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-[18px] font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      Guide photo 360°
                    </h2>
                    <p className={`text-[11px] font-medium ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                      4 étapes pour une visite parfaite
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <X className={`w-4 h-4 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Hero Card */}
              <div className={`mt-4 rounded-3xl overflow-hidden border ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
                <div className={`bg-gradient-to-br ${isLight ? 'from-orange-50 to-amber-50' : 'from-orange-950/30 to-amber-950/30'} p-6`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/80 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                      <Camera className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                      <h3 className={`text-[17px] font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        Prêt à créer votre visite ?
                      </h3>
                      <p className={`text-[12px] font-medium mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        Ce guide vous montre comment prendre des photos 360° parfaites pour impressionner vos clients.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Steps Preview */}
                <div className={`p-4 ${isLight ? 'bg-white' : 'bg-[#111]'}`}>
                  <div className="grid grid-cols-2 gap-2">
                    {STEPS.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => navigate(i)}
                          className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                            isLight
                              ? 'bg-gray-50 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                              : 'bg-[#1a1a1a] border-gray-800 hover:border-orange-900/50 hover:bg-[#1f1f1f]'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-5 h-5 ${s.iconColor}`} />
                          </div>
                          <div className="text-left min-w-0">
                            <p className={`text-[11px] font-bold truncate ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                              {s.title}
                            </p>
                            <p className={`text-[10px] font-medium ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                              {i + 1} sur {STEPS.length}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={onClose}
                  className={`flex-1 text-[13px] font-bold uppercase tracking-wider py-4 rounded-2xl border transition-all active:scale-[0.98] ${
                    isLight
                      ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  Passer
                </button>
                <button
                  onClick={() => navigate(0)}
                  className="flex-[2] bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[13px] font-bold uppercase tracking-wider py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Suivre les étapes
                </button>
              </div>
            </div>
          )}

          {/* Step View */}
          {step >= 0 && current && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className="flex items-center justify-between pt-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-lg`}>
                    <current.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-[18px] font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      Guide photo 360°
                    </h2>
                    <p className={`text-[11px] font-medium ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                      Étape {step + 1} sur {STEPS.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <X className={`w-4 h-4 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-2">
                <ProgressBar current={step} total={STEPS.length} color={current.color} />
              </div>

              {/* Step Indicator */}
              <StepIndicator steps={STEPS} current={step} onSelect={navigate} />

              {/* Step Content Card */}
              <div className={`rounded-3xl border overflow-hidden ${
                isLight ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#111]'
              }`}>
                {/* Step Header with Gradient */}
                <div className={`bg-gradient-to-br ${current.color} p-5`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <current.accentIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                        Étape {step + 1}
                      </p>
                      <h3 className="text-[16px] font-black text-white">
                        {current.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[12px] font-medium text-white/80 mt-2">
                    {current.subtitle}
                  </p>
                </div>

                {/* Description */}
                <div className="p-5">
                  <p className={`text-[13px] font-medium leading-relaxed mb-5 ${
                    isLight ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {current.description}
                  </p>

                  {/* Visual for Ratio step */}
                  {current.visual && (
                    <div className="mb-5">
                      <RatioVisual isLight={isLight} />
                    </div>
                  )}

                  {/* Tips */}
                  <div className="space-y-2.5">
                    {current.tips.map((tip, i) => {
                      const TipIcon = tip.icon;
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-xl ${
                            isLight ? 'bg-gray-50' : 'bg-[#1a1a1a]'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg ${current.iconBg} flex items-center justify-center shrink-0`}>
                            <TipIcon className={`w-3.5 h-3.5 ${current.iconColor}`} />
                          </div>
                          <p className={`text-[12px] font-medium leading-relaxed pt-1 ${
                            isLight ? 'text-gray-700' : 'text-gray-300'
                          }`}>
                            {tip.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-5 pb-2">
                <button
                  onClick={() => navigate(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all disabled:opacity-30 active:scale-95 ${
                    isLight
                      ? 'bg-white border-gray-200 hover:bg-gray-50'
                      : 'bg-[#1a1a1a] border-gray-800 hover:bg-[#222]'
                  }`}
                >
                  <ChevronLeft className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-white'}`} />
                </button>

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => navigate(step + 1)}
                    className={`flex-1 bg-gradient-to-r ${current.color} text-white font-bold text-[13px] uppercase tracking-wider py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg`}
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-[13px] uppercase tracking-wider py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    J'ai compris !
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
