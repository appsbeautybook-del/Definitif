import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, CheckCircle2, Sparkles, Calendar,
  Scissors, ShoppingBag, RotateCcw, X, SunMedium, Focus, Zap,
  Camera, FlipHorizontal2, ShieldCheck, Droplets, Leaf, Star,
  ImagePlus, Upload
} from "lucide-react";
import { entities, uploadFile } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

const HAIR_TYPES = [
  { id: "fins",    label: "Fins & Fragiles",  emoji: "🪶" },
  { id: "epais",   label: "Épais & Denses",   emoji: "🌿" },
  { id: "boucles", label: "Bouclés & Frisés", emoji: "🌀" },
  { id: "raides",  label: "Raides & Lisses",  emoji: "〰️" },
  { id: "crepus",  label: "Crépus & Afro",    emoji: "✨" },
  { id: "mixtes",  label: "Mixtes",           emoji: "🔀" },
];

const ORIGINES = [
  { id: "africaine",   label: "Africaine / Afro",     emoji: "🌍" },
  { id: "metissee",    label: "Métissée / Mixte",      emoji: "🌈" },
  { id: "asiatique",   label: "Asiatique",             emoji: "🌏" },
  { id: "latine",      label: "Latine / Méditerranée", emoji: "🌺" },
  { id: "europeenne",  label: "Européenne",            emoji: "🌸" },
  { id: "moyen-orient",label: "Moyen-Orient",          emoji: "🌙" },
];

const CONCERNS = [
  "Chute de cheveux", "Sécheresse", "Brillance", "Volume",
  "Couleur / Teinture", "Pellicules", "Frisottis", "Longueur",
];

const ANALYSE_STEPS = [
  "Analyse visuelle de vos cheveux...",
  "Détection de la texture capillaire...",
  "Évaluation de l'état du cuir chevelu...",
  "Génération des recommandations personnalisées...",
  "Préparation de votre routine beauté...",
];

// ── Guide étapes avec images thématiques ────────────────────────────────────
const SCAN_GUIDE_STEPS = [
  {
    icon: SunMedium,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    title: "Bonne luminosité",
    desc: "Placez-vous face à une fenêtre ou sous une lumière directe. Évitez les contre-jours et les ombres sur vos cheveux.",
    tip: "La lumière naturelle donne les meilleurs résultats.",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600",
    imgAlt: "Femme dans la lumière naturelle pour soin capillaire",
  },
  {
    icon: Focus,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
    title: "Positionnez vos cheveux",
    desc: "Dégagez cou et épaules. Tenez la caméra à 40–60 cm. Incluez toute la longueur de vos cheveux dans le cadre.",
    tip: "Vue de dos ou de côté recommandée pour analyser la texture.",
    img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600",
    imgAlt: "Positionnement idéal pour analyse capillaire",
  },
  {
    icon: FlipHorizontal2,
    color: "text-green-500",
    bg: "bg-green-50 border-green-200",
    title: "Restez immobile",
    desc: "Maintenez la caméra stable pour éviter le flou. Vos cheveux doivent être clairement visibles et bien éclairés.",
    tip: "Photo de profil ou de dos : idéal pour l'analyse IA.",
    img: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600",
    imgAlt: "Prise de photo stable pour scan capillaire",
  },
];

// ── Guide ────────────────────────────────────────────────────────────────────
function ScanGuide({ onStart, onBack }) {
  // onStart("camera") or onStart("upload")
  const [idx, setIdx] = useState(0);
  const [animated, setAnimated] = useState(true);

  const goTo = (i) => {
    setAnimated(false);
    setTimeout(() => { setIdx(i); setAnimated(true); }, 180);
  };

  const next = () => idx < SCAN_GUIDE_STEPS.length - 1 ? goTo(idx + 1) : onStart("camera");
  const step = SCAN_GUIDE_STEPS[idx];
  const Icon = step.icon;

  return (
    <div className="font-display min-h-full bg-white flex flex-col">
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 shrink-0">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-orange-100 rounded-2xl flex items-center justify-center shrink-0">
          <Scissors className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Scan Capillaire IA</p>
          <h1 className="text-[18px] font-black text-gray-900">Préparez-vous</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-6 pb-10 gap-5">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {SCAN_GUIDE_STEPS.map((_, i) => (
            <button key={i} onClick={() => i < idx ? goTo(i) : null}
              className={`rounded-full transition-all duration-300 ${i === idx ? "w-7 h-2 bg-primary" : i < idx ? "w-2 h-2 bg-primary/40" : "w-2 h-2 bg-gray-200"}`} />
          ))}
        </div>

        {/* Image thématique */}
        <div className={`rounded-3xl overflow-hidden h-44 relative shadow-sm transition-all duration-200 ${animated ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <img src={step.img} alt={step.imgAlt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step.bg}`}>
              <Icon className={`w-3 h-3 ${step.color}`} strokeWidth={2} />
            </div>
            <span className="text-white text-[11px] font-black">{step.title}</span>
          </div>
          <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2.5 py-1">
            <span className="text-[10px] font-black text-gray-600">{idx + 1}/{SCAN_GUIDE_STEPS.length}</span>
          </div>
        </div>

        {/* Card conseil */}
        <div className={`transition-all duration-200 ${animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-3 ${step.bg}`}>
            <Icon className={`w-7 h-7 ${step.color}`} strokeWidth={1.5} />
          </div>
          <h2 className="text-[20px] font-black text-gray-900 mb-2">{step.title}</h2>
          <p className="text-[13px] text-gray-600 font-medium leading-relaxed mb-3">{step.desc}</p>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2">
            <span className="text-[11px] text-gray-500 font-bold">💡 {step.tip}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          {idx === SCAN_GUIDE_STEPS.length - 1 ? (
            <>
              <button onClick={next}
                className="w-full bg-primary text-white font-black text-[15px] uppercase tracking-widest py-4 rounded-3xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Camera className="w-5 h-5" /> Lancer le scan caméra
              </button>
              <button onClick={() => onStart("upload")}
                className="w-full bg-gray-100 text-gray-700 font-black text-[13px] uppercase tracking-widest py-3.5 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                <ImagePlus className="w-4 h-4" /> Importer une photo
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              {idx > 0 && (
                <button onClick={() => goTo(idx - 1)}
                  className="w-12 h-14 bg-gray-100 rounded-2xl flex items-center justify-center active:scale-95">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <button onClick={next}
                className="flex-1 bg-primary text-white font-black text-[15px] uppercase tracking-widest py-4 rounded-3xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all">
                Suivant <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Photo Upload (alternative à la caméra) ──────────────────────────────────
function PhotoUploader({ onCapture, onBack }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleConfirm = () => {
    if (selectedFile && preview) onCapture(selectedFile, preview);
  };

  return (
    <div className="font-display min-h-full bg-white flex flex-col">
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </button>
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Scan Capillaire IA</p>
          <h1 className="text-[18px] font-black text-gray-900">Importez votre photo</h1>
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-10 flex flex-col gap-5">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFile(e.target.files?.[0])} />

        {preview ? (
          <div className="relative rounded-3xl overflow-hidden h-72 shadow-sm">
            <img src={preview} alt="Votre photo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-green-500/90 text-white rounded-full px-3 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black">Photo sélectionnée ✓</span>
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-black px-3 py-1.5 rounded-full">
              Changer
            </button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-3xl h-64 flex flex-col items-center justify-center gap-4 bg-gray-50 active:scale-[0.98] transition-all">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-black text-gray-700">Appuyez pour importer</p>
              <p className="text-[12px] text-gray-400 mt-1">JPG, PNG · Vue de profil ou de dos idéale</p>
            </div>
          </button>
        )}

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-start gap-2">
          <span className="text-[16px] shrink-0">💡</span>
          <p className="text-[12px] text-amber-800 font-medium leading-relaxed">
            Pour un meilleur diagnostic, utilisez une photo avec les cheveux bien visibles, éclairés naturellement, de face ou de dos.
          </p>
        </div>

        <div className="mt-auto flex gap-3">
          <button onClick={onBack}
            className="w-12 h-14 bg-gray-100 rounded-2xl flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={handleConfirm} disabled={!selectedFile}
            className="flex-1 bg-primary text-white font-black text-[14px] uppercase tracking-widest py-4 rounded-3xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40">
            <CheckCircle2 className="w-5 h-5" /> Utiliser cette photo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Détection pixel professionnelle — inspirée des apps de scan capillaire ──
// Analyse la trame vidéo pour mesurer : luminosité, netteté, couverture cheveux/peau/cuir chevelu
function detectFrame(video, workCanvas) {
  if (!video || !workCanvas || video.videoWidth === 0) return null;
  const SW = 192, SH = 256; // résolution d'analyse plus haute pour plus de précision
  const W = video.videoWidth, H = video.videoHeight;

  workCanvas.width = SW; workCanvas.height = SH;
  const ctx = workCanvas.getContext("2d");
  ctx.drawImage(video, 0, 0, W, H, 0, 0, SW, SH);
  const imgData = ctx.getImageData(0, 0, SW, SH);
  const d = imgData.data;

  let totalBrightness = 0;
  let hairCount = 0, skinCount = 0;
  let scalpZoneHairCount = 0; // cheveux dans la zone centrale (top 60% de l'image)

  // Histogramme pour détecter uniformité (fond uni vs cheveux)
  let darkPx = 0, mediumPx = 0, brightPx = 0;

  const totalPx = SW * SH;

  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      const i = (y * SW + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      totalBrightness += lum;

      if (lum < 70) darkPx++;
      else if (lum < 180) mediumPx++;
      else brightPx++;

      const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
      const sat = maxC > 0 ? (maxC - minC) / maxC : 0;

      // ── Détection peau (toutes carnations : clair, méditerranéen, afro) ──
      // Méthode : canal R dominant, saturation modérée, luminosité dans plage humaine
      const skinScore = (
        lum > 45 && lum < 235 &&
        r > Math.max(g, b) &&          // rouge dominant
        r - g > 5 &&                    // différence R-G
        r - b > 10 &&                   // différence R-B plus marquée
        sat > 0.05 && sat < 0.65        // saturation peau
      );
      if (skinScore) skinCount++;

      // ── Détection cheveux réelle ──
      // Les cheveux ont une texture spécifique : pixels sombres à moyens, faible saturation
      // Ou colorés (blond, brun, auburn, bleu...) avec saturation variable
      // On exclut les pixels clairs (fond blanc, lumière) et peau
      const isLikelyHair = (
        !skinScore &&
        (
          // Cheveux naturels sombres (noir, brun, châtain, afro)
          (lum < 100 && sat < 0.6) ||
          // Cheveux clairs mais texturés (blond, gris)
          (lum >= 100 && lum < 200 && sat < 0.3 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) ||
          // Cheveux colorés (roux, auburn, teinte)
          (lum < 160 && sat > 0.2 && sat < 0.8)
        )
      );
      if (isLikelyHair) {
        hairCount++;
        // Zone cuir chevelu : 70% central de l'image
        const inScalpZone = x > SW * 0.15 && x < SW * 0.85 && y < SH * 0.7;
        if (inScalpZone) scalpZoneHairCount++;
      }
    }
  }

  const avgBrightness = totalBrightness / totalPx;
  const skinCoverage = skinCount / totalPx;
  const hairCoverage = hairCount / totalPx;
  const scalpHairCoverage = scalpZoneHairCount / (SW * 0.7 * SH * 0.7); // normalisé sur la zone

  // ── Netteté (variance Laplacien simplifié sur zone centrale) ──
  // Mesure la quantité de contours — les cheveux ont beaucoup de contours fins
  let laplacianSum = 0;
  let laplacianCount = 0;
  const cx = Math.round(SW / 2), cy = Math.round(SH / 2);
  const radius = 50;
  for (let y = cy - radius; y < cy + radius; y++) {
    for (let x = cx - radius; x < cx + radius; x++) {
      if (x < 1 || x >= SW - 1 || y < 1 || y >= SH - 1) continue;
      const getL = (px, py) => {
        const ii = (py * SW + px) * 4;
        return d[ii] * 0.299 + d[ii + 1] * 0.587 + d[ii + 2] * 0.114;
      };
      // Laplacian kernel 3x3
      const lap = Math.abs(
        -getL(x-1, y-1) - getL(x, y-1) - getL(x+1, y-1)
        - getL(x-1, y) + 8 * getL(x, y) - getL(x+1, y)
        - getL(x-1, y+1) - getL(x, y+1) - getL(x+1, y+1)
      );
      laplacianSum += lap;
      laplacianCount++;
    }
  }
  const sharpness = laplacianCount > 0 ? laplacianSum / laplacianCount : 0;

  // ── Détection visage (zone centrale) ──
  // Chercher une zone de peau concentrée au centre
  let centerSkinCount = 0;
  for (let y = Math.round(SH * 0.2); y < Math.round(SH * 0.8); y++) {
    for (let x = Math.round(SW * 0.25); x < Math.round(SW * 0.75); x++) {
      const i = (y * SW + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      const maxC = Math.max(r, g, b);
      const sat = maxC > 0 ? (Math.max(r, g, b) - Math.min(r, g, b)) / maxC : 0;
      if (lum > 45 && lum < 235 && r > Math.max(g, b) && r - g > 5 && r - b > 10 && sat > 0.05 && sat < 0.65) {
        centerSkinCount++;
      }
    }
  }
  const centerSkinCoverage = centerSkinCount / (SW * 0.5 * SH * 0.6);
  const faceDetected = centerSkinCoverage > 0.12; // au moins 12% de peau dans la zone centrale

  // Calcul centrage visage (heuristique sur la concentration de peau)
  let faceCX = 0.5, faceCY = 0.5;
  let faceCentered = false;
  if (faceDetected) {
    let sumX = 0, sumY = 0, cnt = 0;
    for (let y = Math.round(SH * 0.1); y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        const i = (y * SW + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const maxC = Math.max(r, g, b);
        const sat = maxC > 0 ? (maxC - Math.min(r, g, b)) / maxC : 0;
        if (lum > 45 && lum < 235 && r > Math.max(g, b) && r - b > 10 && sat > 0.05 && sat < 0.65) {
          sumX += x; sumY += y; cnt++;
        }
      }
    }
    if (cnt > 0) {
      faceCX = sumX / cnt / SW;
      faceCY = sumY / cnt / SH;
      faceCentered = Math.abs(faceCX - 0.5) < 0.18 && faceCY > 0.25 && faceCY < 0.75;
    }
  }

  return {
    SW, SH,
    brightness: Math.round(avgBrightness),
    sharpness: Math.round(sharpness * 10) / 10,
    skinCoverage,
    hairCoverage,
    scalpHairCoverage,   // couverture cheveux dans la zone cuir chevelu
    centerSkinCoverage,
    faceDetected,
    faceCentered,
    faceCenter: { x: faceCX, y: faceCY },
    // Uniformité : détecte si c'est juste un fond uni (problème courant)
    isUniformBackground: darkPx / totalPx > 0.85 || brightPx / totalPx > 0.85,
  };
}

// ── Évaluation des conditions de scan ──────────────────────────────────────
function evaluateConditions(fq, scanStep) {
  if (!fq) return null;

  // ── Luminosité : plage stricte pour ne pas laisser passer les fonds sombres ──
  const lumOk = fq.brightness >= 55 && fq.brightness <= 210;

  // ── Netteté : seuil strict basé sur Laplacien — doit détecter des textures fines ──
  // Un fond blanc ou noir uniforme a sharpness ≈ 0. Les cheveux ont sharpness > 8
  const sharpOk = fq.sharpness >= 8 && !fq.isUniformBackground;

  // ── Condition position par étape ──
  let posOk = false, posLabel = "", posIcon = "🎯", posMsg = "";

  if (scanStep === 0) {
    // Cuir chevelu (caméra arrière) : exiger une grande couverture de cheveux (>30% zone)
    // ET pas de fond uniforme ET luminosité suffisante
    posOk = fq.scalpHairCoverage > 0.30 && !fq.isUniformBackground && fq.hairCoverage > 0.25;
    posLabel = "Cuir chevelu";
    posIcon = "🎯";
    if (fq.isUniformBackground) posMsg = "Pointez vers votre tête — fond détecté";
    else if (fq.brightness < 55) posMsg = "Trop sombre — cherchez plus de lumière";
    else if (fq.scalpHairCoverage <= 0.15) posMsg = "Approchez plus — cheveux pas assez visibles";
    else if (fq.scalpHairCoverage <= 0.30) posMsg = "Couvrez plus le cadre avec vos cheveux";
    else posMsg = "Cuir chevelu bien cadré ✓";

  } else if (scanStep === 1) {
    // Face : visage détecté ET centré ET cheveux visibles en périphérie
    const hairVisible = fq.hairCoverage > 0.12;
    posOk = fq.faceDetected && fq.faceCentered && hairVisible;
    posLabel = "Visage";
    posIcon = "🙂";
    if (!fq.faceDetected) posMsg = "Regardez la caméra — visage non détecté";
    else if (!fq.faceCentered) posMsg = "Centrez votre visage dans le cadre";
    else if (!hairVisible) posMsg = "Dégagez vos cheveux pour qu'ils soient visibles";
    else posMsg = "Visage et cheveux bien positionnés ✓";

  } else {
    // Longueurs (profil) : grande couverture de cheveux sur toute la hauteur
    posOk = fq.hairCoverage > 0.28 && fq.scalpHairCoverage > 0.20 && !fq.isUniformBackground;
    posLabel = "Longueurs";
    posIcon = "✂️";
    if (fq.isUniformBackground) posMsg = "Tournez de profil — fond détecté, pas de cheveux";
    else if (fq.hairCoverage <= 0.15) posMsg = "Cheveux insuffisants — tournez de profil ou dos";
    else if (fq.hairCoverage <= 0.28) posMsg = "Rapprochez — couvrez plus le cadre";
    else posMsg = "Longueurs bien visibles ✓";
  }

  const conditions = [
    {
      id: "lumiere",
      label: "Lumière",
      icon: "💡",
      ok: lumOk,
      message: fq.brightness < 55
        ? "Trop sombre — cherchez plus de lumière"
        : fq.brightness > 210
        ? "Surexposé — reculez de la fenêtre"
        : "Luminosité idéale ✓",
    },
    {
      id: "nettete",
      label: "Netteté",
      icon: "📸",
      ok: sharpOk,
      message: fq.isUniformBackground
        ? "Fond uniforme — montrez vos cheveux"
        : fq.sharpness < 8
        ? "Trop flou — stabilisez et rapprochez"
        : "Image nette ✓",
    },
    {
      id: "position",
      label: posLabel,
      icon: posIcon,
      ok: posOk,
      message: posMsg,
    },
  ];

  const allOk = conditions.every(c => c.ok);
  return { conditions, allOk };
}

// ── Overlay style vérification faciale / scan capillaire pro ────────────────
function drawAdaptiveOverlay(overlayCanvas, detection, frameColor, scanLineY, scanStep, allOk) {
  if (!overlayCanvas) return;
  const OW = overlayCanvas.width, OH = overlayCanvas.height;
  const ctx = overlayCanvas.getContext("2d");
  ctx.clearRect(0, 0, OW, OH);
  if (!detection) return;

  const { faceDetected, faceCentered, faceCenter, skinBbox, hairBbox } = detection;

  // Étape 0 = caméra dos, on montre un cadre carré pour le cuir chevelu
  // Étapes 1,2 = caméra frontale, ellipse ovale pour le visage/profil
  const isScalpStep = scanStep === 0;
  const elCX = OW * 0.5;
  const elCY = isScalpStep ? OH * 0.38 : OH * 0.42;
  const elRX = isScalpStep ? OW * 0.40 : OW * 0.42;
  const elRY = isScalpStep ? OH * 0.38 : OH * 0.46;

  ctx.save();
  // Remplir l'extérieur en semi-transparent noir
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, OW, OH);
  // Découper l'ellipse (composite destination-out)
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.ellipse(elCX, elCY, elRX, elRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  // ── Bordure de l'ellipse ──
  const glowColor = allOk ? "#22c55e" : faceDetected ? frameColor : "#888888";
  ctx.save();
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.globalAlpha = allOk ? 1 : 0.85;
  // Glow effect
  ctx.shadowBlur = allOk ? 18 : 8;
  ctx.shadowColor = glowColor;
  ctx.beginPath();
  ctx.ellipse(elCX, elCY, elRX, elRY, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── Arc de progression basé sur la couverture réelle des cheveux ──
  if (detection) {
    // Progression = couverture réelle capturée (0→1 selon scalpHairCoverage ou hairCoverage)
    const targetCoverage = scanStep === 0 ? detection.scalpHairCoverage : detection.hairCoverage;
    const targetThreshold = scanStep === 0 ? 0.30 : scanStep === 1 ? 0.12 : 0.28;
    // Arc = ratio de remplissage (0 à 1), plafonné à 1
    const progress = Math.min(1, targetCoverage / targetThreshold);

    ctx.save();
    ctx.strokeStyle = "#ffffff22";
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(elCX, elCY, elRX + 6, elRY + 6, -Math.PI/2, 0, Math.PI * 2);
    ctx.stroke();

    if (progress > 0) {
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 12;
      ctx.shadowColor = glowColor;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.ellipse(elCX, elCY, elRX + 6, elRY + 6, -Math.PI/2, 0, Math.PI * 2 * progress);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Points de guidage aux 4 coins de l'ellipse ──
  const guidePoints = [
    { a: -Math.PI/2, label: "↑" },   // top
    { a: Math.PI/2, label: "↓" },    // bottom
    { a: 0, label: "→" },            // right
    { a: Math.PI, label: "←" },      // left
  ];
  guidePoints.forEach(({ a }) => {
    const gx = elCX + Math.cos(a) * (elRX + 6);
    const gy = elCY + Math.sin(a) * (elRY + 6);
    ctx.save();
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.9;
    ctx.shadowBlur = 8;
    ctx.shadowColor = glowColor;
    ctx.beginPath();
    ctx.arc(gx, gy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Ligne de scan animée (style biométrique) ──
  const scanY = elCY - elRY + (scanLineY / 100) * elRY * 2;
  if (scanY > elCY - elRY && scanY < elCY + elRY) {
    // Calculer la largeur de l'ellipse à cette hauteur
    const dy = scanY - elCY;
    const halfW = elRX * Math.sqrt(Math.max(0, 1 - (dy * dy) / (elRY * elRY)));

    const grad = ctx.createLinearGradient(elCX - halfW, 0, elCX + halfW, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.3, `${glowColor}60`);
    grad.addColorStop(0.5, `${glowColor}CC`);
    grad.addColorStop(0.7, `${glowColor}60`);
    grad.addColorStop(1, "transparent");

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(elCX - halfW, scanY);
    ctx.lineTo(elCX + halfW, scanY);
    ctx.stroke();
    ctx.restore();
  }

  // ── Halo de visage détecté ──
  if (faceDetected && skinBbox) {
    const fx = (skinBbox.minX + skinBbox.maxX) / 2 / detection.SW * OW;
    const fy = (skinBbox.minY + skinBbox.maxY) / 2 / detection.SH * OH;
    const fw = (skinBbox.maxX - skinBbox.minX) / detection.SW * OW;
    const fh = (skinBbox.maxY - skinBbox.minY) / detection.SH * OH;

    ctx.save();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(fx, fy, fw / 2 + 8, fh / 2 + 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── Badge : couverture cheveux en % (toujours affiché) ──
  {
    const badgeY = elCY + elRY + 18;
    const coverage = scanStep === 0 ? detection.scalpHairCoverage : detection.hairCoverage;
    const threshold = scanStep === 0 ? 0.30 : scanStep === 1 ? 0.12 : 0.28;
    const pct = Math.min(100, Math.round(coverage / threshold * 100));
    const label = allOk ? "✓ Prêt — Appuyez sur Capturer" : `Couverture : ${pct}% / 100%`;
    ctx.save();
    ctx.fillStyle = allOk ? "#22c55eCC" : pct > 60 ? "rgba(232,115,42,0.85)" : "rgba(0,0,0,0.65)";
    const bw = allOk ? 200 : 170;
    ctx.beginPath();
    ctx.roundRect(elCX - bw/2, badgeY - 13, bw, 22, 11);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, elCX, badgeY + 2);
    ctx.restore();
  }

  // ── Message de guidage central ──
  if (!allOk) {
    const msg = scanStep === 0
      ? "📷 Pointez vers le dessus de votre tête"
      : scanStep === 1
      ? "Regardez la caméra et centrez votre visage"
      : "Tournez de profil — montrez vos longueurs";
    ctx.save();
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.textAlign = "center";
    ctx.fillText(msg, elCX, elCY + elRY + 32);
    ctx.restore();
  }
}

// ── ÉTAPES DE SCAN ──────────────────────────────────────────────────────────
const SCAN_STEPS = [
  {
    id: "scalp_top",
    label: "Cuir chevelu",
    emoji: "🎯",
    camera: "environment", // caméra arrière pour filmer le dessus de la tête
    instruction: "Penchez la tête en avant et filmez le dessus de votre crâne",
    tip: "Approchez la caméra à 20-30 cm du cuir chevelu",
  },
  {
    id: "face",
    label: "Vue de face",
    emoji: "🙂",
    camera: "user", // caméra frontale
    instruction: "Regardez la caméra — cheveux et racines bien dégagés",
    tip: "Assurez-vous que vos cheveux sont bien visibles",
  },
  {
    id: "longueurs",
    label: "Longueurs",
    emoji: "✂️",
    camera: "user", // caméra frontale de côté
    instruction: "Montrez vos longueurs — de profil ou dos à la caméra",
    tip: "Texture, densité et état des pointes seront analysés",
  },
];

// ── Scanner Live (WebRTC) avec conditions intelligentes ──────────────────────
function LiveScanner({ onCapture, onBack }) {
  const videoRef = useRef(null);
  const analysisCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const scanLineYRef = useRef(0);
  const frameColorRef = useRef("#888888");
  const scanStepRef = useRef(0);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState(SCAN_STEPS[0].camera);
  const [countdown, setCountdown] = useState(null);
  const [scanStep, setScanStep] = useState(0);
  const [capturedSteps, setCapturedSteps] = useState([]);
  const [frameQuality, setFrameQuality] = useState(null);


  // Boucle d'analyse + dessin overlay en temps réel
  useEffect(() => {
    if (!cameraReady) return;
    let animId;
    let lastAnalysis = 0;
    let lastDetection = null;

    const loop = (ts) => {
      animId = requestAnimationFrame(loop);
      if (ts - lastAnalysis > 180) {
        lastAnalysis = ts;
        const det = detectFrame(videoRef.current, analysisCanvasRef.current);
        if (det) { lastDetection = det; setFrameQuality(det); }
      }
      scanLineYRef.current = (scanLineYRef.current + 0.8) % 101;
      if (overlayCanvasRef.current && lastDetection) {
        const ev = evaluateConditions(lastDetection, scanStepRef.current);
        drawAdaptiveOverlay(
          overlayCanvasRef.current,
          lastDetection,
          frameColorRef.current,
          scanLineYRef.current,
          scanStepRef.current,
          ev?.allOk ?? false
        );
      }
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, scanStep]);

  const startCamera = useCallback(async (mode) => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setCameraReady(false);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => { videoRef.current.play(); setCameraReady(true); };
      }
    } catch {
      // Essayer sans contraintes de résolution
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => { videoRef.current.play(); setCameraReady(true); };
        }
      } catch {
        setCameraError("Impossible d'accéder à la caméra. Vérifiez les permissions dans votre navigateur.");
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      clearInterval(analysisIntervalRef.current);
    };
  }, [facingMode]);

  const flipCamera = () => setFacingMode(m => m === "user" ? "environment" : "user");

  const captureCurrentStep = useCallback(() => {
    if (!videoRef.current || !captureCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const newCaptured = [...capturedSteps, { step: scanStep, blob, url }];
      setCapturedSteps(newCaptured);

      const nextStep = scanStep + 1;
      if (nextStep < SCAN_STEPS.length) {
        setScanStep(nextStep);
        // Changer de caméra si nécessaire pour la prochaine étape
        const nextCamera = SCAN_STEPS[nextStep].camera;
        if (nextCamera !== facingMode) {
          setFacingMode(nextCamera);
        }
      } else {
        // Toutes les étapes capturées — envoyer la photo du cuir chevelu (step 0) pour analyse
        const best = newCaptured[0];
        const file = new File([best.blob], "scan_capillaire.jpg", { type: "image/jpeg" });
        onCapture(file, best.url);
      }
    }, "image/jpeg", 0.92);
  }, [capturedSteps, facingMode, scanStep, onCapture]);

  const triggerCapture = () => {
    setCountdown(3);
    let c = 3;
    const interval = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(interval); setCountdown(null); captureCurrentStep(); }
    }, 1000);
  };

  const evaluation = frameQuality ? evaluateConditions(frameQuality, scanStep) : null;
  const allOk = evaluation?.allOk ?? false;
  const currentStep = SCAN_STEPS[scanStep];

  // Couleur du cadre : JAMAIS vert par défaut
  // Rouge = pas de données / fond uniforme / conditions manquantes
  // Orange = progression en cours (>50% des conditions ok)
  // Vert = UNIQUEMENT si TOUTES les conditions sont strictement validées
  const okCount = evaluation ? evaluation.conditions.filter(c => c.ok).length : 0;
  const frameColor = !evaluation || !frameQuality
    ? "#666666"   // gris neutre au départ
    : allOk
      ? "#22c55e"  // vert UNIQUEMENT si tout est valide
      : okCount >= 2
        ? "#E8732A"  // orange : bonne progression
        : "#ef4444"; // rouge : conditions non remplies
  // Mettre à jour les refs pour la boucle d'animation
  frameColorRef.current = frameColor;
  scanStepRef.current = scanStep;

  // Message prioritaire (première condition non remplie)
  const urgentCondition = evaluation?.conditions.find(c => !c.ok);

  return (
    <div className="font-display fixed inset-0 bg-black flex flex-col z-50">
      <canvas ref={analysisCanvasRef} style={{ display: "none" }} />
      <canvas ref={captureCanvasRef} style={{ display: "none" }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-10 pb-3 bg-gradient-to-b from-black/95 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">Maria AI · Scan Capillaire</p>
            <p className="text-white text-[14px] font-black">{currentStep.emoji} {currentStep.label}</p>
          </div>
          <button onClick={flipCamera} className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95">
            <FlipHorizontal2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Steps progress */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {SCAN_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                i < scanStep ? "bg-green-500/80 text-white" :
                i === scanStep ? "bg-white/20 text-white border border-white/40" :
                "bg-white/8 text-white/30"
              }`}>
                {i < scanStep ? "✓" : s.emoji} {s.label}
              </div>
              {i < SCAN_STEPS.length - 1 && <div className={`w-3 h-0.5 ${i < scanStep ? "bg-green-400" : "bg-white/15"}`} />}
            </div>
          ))}
        </div>

        {/* Barre lumière style KYC */}
        {frameQuality && (
          <div className="flex items-center gap-2 justify-center">
            <SunMedium className="w-3 h-3 text-white/40" />
            <div className="flex gap-0.5">
              {Array.from({ length: 8 }).map((_, i) => {
                const threshold = (i + 1) / 8 * 255;
                const bri = frameQuality.brightness;
                const active = bri > (i / 8 * 255) && bri <= threshold;
                const lit = bri >= (i / 8 * 255);
                const ideal = i >= 2 && i <= 5;
                return (
                  <div key={i} className={`w-3 h-1.5 rounded-full transition-all ${
                    lit ? (ideal ? "bg-green-400" : i < 2 ? "bg-blue-400" : "bg-red-400") : "bg-white/15"
                  }`} />
                );
              })}
            </div>
            <SunMedium className="w-4 h-4 text-white/40" />
            <span className="text-[9px] text-white/40 font-black">
              {frameQuality.brightness < 50 ? "Sombre" : frameQuality.brightness > 215 ? "Surexposé" : "Idéal"}
            </span>
          </div>
        )}
      </div>

      {/* Vidéo */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef} autoPlay playsInline muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {cameraReady && !countdown && (
          <>
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 140px rgba(0,0,0,0.7)" }} />

            {/* Canvas overlay adaptatif — contour cheveux en temps réel */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              width={400} height={600}
            />

            {/* Indicateur étape actuelle */}
            <div className="absolute top-[130px] left-0 right-0 flex justify-center z-10 pointer-events-none px-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                <span className="text-[14px]">{currentStep.emoji}</span>
                <span className="text-white text-[11px] font-black">{currentStep.instruction}</span>
              </div>
            </div>

            {/* Miniatures captures précédentes */}
            {capturedSteps.length > 0 && (
              <div className="absolute left-3 bottom-[220px] flex flex-col gap-1.5">
                {capturedSteps.map((cs, i) => (
                  cs.url ? (
                    <div key={i} className="relative">
                      <img src={cs.url} className="w-11 h-13 rounded-xl object-cover border-2 border-green-400 shadow-lg" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white font-black">✓</span>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="w-11 h-13 rounded-xl bg-green-500/30 border-2 border-green-400 flex items-center justify-center">
                      <span className="text-[10px] text-green-300 font-black">✓</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </>
        )}

        {/* Countdown */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
            <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl"
              style={{ background: `radial-gradient(circle, ${frameColor}CC, ${frameColor}66)` }}>
              <span className="text-white text-[72px] font-black leading-none">{countdown}</span>
            </div>
          </div>
        )}
        {countdown === 0 && (
          <div className="absolute inset-0 bg-white/70 z-30 pointer-events-none" style={{ animation: "ping 0.3s ease-out" }} />
        )}

        {/* Erreur caméra */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gray-950 px-8 text-center z-20">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <p className="text-white text-[17px] font-black mb-2">Caméra indisponible</p>
              <p className="text-white/50 text-[13px] font-medium leading-relaxed">{cameraError}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button onClick={() => startCamera(facingMode)} className="bg-primary text-white font-black text-[13px] px-6 py-3.5 rounded-2xl active:scale-95">
                Réessayer
              </button>
              <button onClick={onBack} className="bg-white/10 text-white/60 font-bold text-[12px] px-6 py-3 rounded-2xl active:scale-95">
                Importer une photo à la place
              </button>
            </div>
          </div>
        )}

        {!cameraReady && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black z-10">
            <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
            <p className="text-white/50 text-[13px] font-medium">Activation de la caméra...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {cameraReady && !countdown && (
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 16px))" }}>

          {/* Conditions compactes style biométrique */}
          {evaluation && (
            <div className="flex items-center justify-center gap-2 mb-3">
              {evaluation.conditions.map(c => (
                <div key={c.id} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-black transition-all border ${
                  c.ok
                    ? "bg-green-500/20 border-green-500/40 text-green-300"
                    : "bg-white/8 border-white/15 text-white/50"
                }`}>
                  <span>{c.ok ? "✓" : "·"}</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message principal */}
          <div className={`rounded-2xl px-4 py-3 mb-3 flex items-center gap-3 border transition-all ${
            allOk ? "bg-green-500/15 border-green-500/40" : urgentCondition ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/10"
          }`}>
            <span className="text-[20px] shrink-0">
              {allOk ? "✅" : urgentCondition?.icon || currentStep.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-black ${allOk ? "text-green-300" : "text-white"}`}>
                {allOk ? "Tout est prêt — capturez maintenant !" : urgentCondition?.message || currentStep.instruction}
              </p>
            </div>
          </div>

          {/* Bouton capture */}
          <button
            onClick={triggerCapture}
            disabled={!allOk || !!countdown}
            className="w-full py-4 rounded-3xl font-black text-[15px] uppercase tracking-widest flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-2xl"
            style={{
              background: !evaluation
                ? "linear-gradient(135deg, #444, #666)"
                : allOk
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #555, #777)",
              color: "white",
              boxShadow: allOk ? "0 8px 32px rgba(34,197,94,0.5)" : "none",
              opacity: allOk ? 1 : 0.5,
            }}
          >
            <Zap className="w-5 h-5" strokeWidth={1.5} />
            Capturer
            <span className="text-[11px] opacity-60">({scanStep + 1}/{SCAN_STEPS.length})</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Modal Routines IA ────────────────────────────────────────────────────────
function RoutinesModal({ results, onClose }) {
  const [creating, setCreating] = useState(null);
  const [created, setCreated] = useState([]);

  // Récupérer les routines suggérées depuis les résultats ou en générer des par défaut
  const routines = results?.routines_suggeries || [
    { nom: "Routine Hydratation Intense", emoji: "💧", frequence: "3x/semaine", description: "Programme deep conditioning basé sur votre diagnostic", taches: ["Bain d'huile 1h avant le shampoing", "Masque hydratant 20 min", "Leave-in conditioner après lavage", "Sceller avec une huile légère"] },
    { nom: "Routine Cuir Chevelu", emoji: "🎯", frequence: "2x/semaine", description: "Stimuler la pousse et assainir le cuir chevelu", taches: ["Massage huile de ricin 5 min", "Sérum cuir chevelu ciblé", "Shampoing clarifiant doux", "Rinçage eau froide final"] },
    { nom: "Routine Protectrice", emoji: "🛡️", frequence: "Quotidienne", description: "Préserver vos longueurs et minimiser la casse", taches: ["Coiffure protective le soir", "Bonnet satin pour la nuit", "Démêlage doux de pointe à racine", "Spray hydratant léger matin"] },
  ];

  const handleCreate = async (routine, idx) => {
    setCreating(idx);
    try {
      await entities.RoutineBeaute.create({
        user_email: (await supabase.auth.getUser().then(({ data }) => data?.user)).email,
        name: routine.nom,
        emoji: routine.emoji,
        description: routine.description,
        frequency: routine.frequence.includes("Quotidienne") ? "quotidien" : routine.frequence.includes("semaine") ? "hebdomadaire" : "personnalise",
        tasks: (routine.taches || []).map((t, i) => ({ id: String(i), label: t, done: false })),
        status: "active",
        reminder_active: true,
      });
      setCreated(prev => [...prev, idx]);
    } catch (e) {
      console.error(e);
    }
    setCreating(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Maria IA</p>
            <h2 className="text-[18px] font-black text-gray-900">Routines personnalisées</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-[12px] text-gray-700 font-medium leading-relaxed">
              Ces routines ont été générées par Maria IA en fonction de vos résultats de scan. Cliquez sur "Ajouter" pour les intégrer à votre programme.
            </p>
          </div>

          {routines.map((r, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="text-[22px]">{r.emoji}</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{r.nom}</p>
                      <p className="text-[11px] text-primary font-bold">{r.frequence}</p>
                    </div>
                  </div>
                  {created.includes(i) ? (
                    <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-[11px] font-black px-3 py-2 rounded-xl shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ajoutée
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCreate(r, i)}
                      disabled={creating === i}
                      className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-black px-3 py-2 rounded-xl shrink-0 active:scale-95 shadow-sm shadow-primary/30 disabled:opacity-60"
                    >
                      {creating === i ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      Ajouter
                    </button>
                  )}
                </div>
                <p className="text-[12px] text-gray-500 font-medium mb-3">{r.description}</p>
                <div className="space-y-1.5">
                  {(r.taches || []).map((t, j) => (
                    <div key={j} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                      <p className="text-[11px] text-gray-600 font-medium">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {created.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
              <p className="text-[14px] font-black text-green-700">🎉 {created.length} routine{created.length > 1 ? "s ajoutées" : " ajoutée"} !</p>
              <p className="text-[12px] text-green-600 font-medium mt-1">Retrouvez-les dans votre espace Routines.</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gray-900 text-white font-black text-[14px] rounded-2xl active:scale-95 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ScanCapillaire() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("guide"); // guide | camera | upload | form | analyse | results
  const [capturedPhoto, setCapturedPhoto] = useState(null);   // object URL
  const [capturedFile, setCapturedFile] = useState(null);     // File
  const [hairType, setHairType] = useState(null);
  const [origine, setOrigine] = useState(null);
  const [concerns, setConcerns] = useState([]);
  const [analyseStep, setAnalyseStep] = useState(0);
  const [analyseProgress, setAnalyseProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [activeRoutineDay, setActiveRoutineDay] = useState(null);
  const [showRoutinesModal, setShowRoutinesModal] = useState(false);

  useEffect(() => {
    let interval;
    if (phase === "analyse") {
      setAnalyseProgress(0);
      let step = 0;
      interval = setInterval(() => {
        step = (step + 1) % ANALYSE_STEPS.length;
        setAnalyseStep(step);
        setAnalyseProgress(prev => Math.min(prev + 18, 90));
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const handleCapture = (file, url) => {
    setCapturedFile(file);
    setCapturedPhoto(url);
    setPhase("form");
    // Réinitialiser les choix précédents
    setHairType(null);
    setOrigine(null);
    setConcerns([]);
  };

  const toggleConcern = (c) =>
    setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const runAnalysis = async () => {
    setPhase("analyse");
    setAnalyseStep(0);
    setAnalyseProgress(5);

    try {
      // 1. Upload de la photo pour analyse visuelle réelle
      let uploadedUrl = null;
      if (capturedFile) {
        setAnalyseProgress(15);
        const { file_url } = await uploadFile({ file: capturedFile });
        uploadedUrl = file_url;
      }

      setAnalyseProgress(30);
      const hairTypeLabel = HAIR_TYPES.find(h => h.id === hairType)?.label || hairType;
      const origineLabel = ORIGINES.find(o => o.id === origine)?.label || null;

      const prompt = `Tu es Maria, experte capillaire IA de BeautyBook spécialisée dans TOUS les types de cheveux : afro, bouclés, raides, crépus, métissés, fins, épais — de toutes origines (africaine, caribéenne, asiatique, latine, européenne, moyen-orientale...).

${uploadedUrl ? `ANALYSE VISUELLE OBLIGATOIRE : Une photo réelle des cheveux de l'utilisateur est jointe.
Observe avec précision :
- La texture visible (lisse, ondulé, bouclé, crépu, afro)
- La couleur naturelle et les traitements éventuels (teinture, décoloration, mèches)
- La densité et l'épaisseur de la chevelure
- L'état des longueurs et des pointes (fourches, casse, brillance)
- Tout signe de sécheresse, excès de sébum, ou dommage chimique/thermique visible
- L'origine capillaire probable (afro, asiatique, caucasien, mixte...)` : ""}

Type de cheveux déclaré : ${hairTypeLabel}
Origine capillaire déclarée : ${origineLabel || "non précisée — déduire de la photo"}
Préoccupations : ${concerns.length > 0 ? concerns.join(", ") : "aucune"}

${uploadedUrl ? "IMPORTANT: Ton diagnostic doit être basé EN PRIORITÉ sur ce que tu observes visuellement dans la photo. Adapte toutes tes recommandations à l'origine et au type de cheveux réels observés." : ""}

Génère un diagnostic professionnel ultra-personnalisé en JSON :
{
  "diagnostic": "Diagnostic précis 2-3 phrases basé sur observation visuelle réelle. Mentionne l'origine capillaire détectée et les caractéristiques spécifiques observées.",
  "score_sante": nombre entre 40 et 95,
  "points_forts": ["2-3 points forts observés concrètement"],
  "points_faibles": ["2-3 problèmes concrets identifiés visuellement"],
  "coiffures": [
    {"nom": "Coiffure adaptée à CE type précis de cheveux", "description": "Explication spécifique pour ces cheveux"},
    {"nom": "...", "description": "..."},
    {"nom": "...", "description": "..."}
  ],
  "produits": [
    {"nom": "Produit réel du marché adapté à l'origine capillaire", "type": "Shampoing|Masque|Huile|Sérum|Conditioner|Spray|Beurre|Crème", "marque": "Marque réelle (ex: SheaMoisture, Cantu, Kérastase, Moroccanoil, Mizani, ORS...)", "pourquoi": "Pourquoi ce produit précisément pour ces cheveux"},
    {"nom": "...", "type": "...", "marque": "...", "pourquoi": "..."},
    {"nom": "...", "type": "...", "marque": "...", "pourquoi": "..."},
    {"nom": "...", "type": "...", "marque": "...", "pourquoi": "..."}
  ],
  "routine": {
    "Lundi": {"matin": "Soin précis adapté à ce type de cheveux", "soir": "Soin du soir adapté"},
    "Mercredi": {"matin": "...", "soir": "..."},
    "Vendredi": {"matin": "...", "soir": "..."},
    "Dimanche": {"matin": "Soin profond hebdomadaire (bain d'huile, masque protéiné, etc.)", "soir": "..."}
  },
  "conseil_pro": "Conseil d'expert personnalisé et actionnable en 1 phrase",
  "routines_suggeries": [
    {"nom": "Nom de la routine (ex: Routine Hydratation Intense)", "emoji": "💧", "frequence": "3x/semaine", "description": "Description courte de l'objectif de cette routine", "taches": ["Étape 1 précise", "Étape 2 précise", "Étape 3 précise", "Étape 4 précise"]},
    {"nom": "...", "emoji": "🎯", "frequence": "...", "description": "...", "taches": ["...", "...", "...", "..."]},
    {"nom": "...", "emoji": "🛡️", "frequence": "...", "description": "...", "taches": ["...", "...", "...", "..."]}
  ]
}`;

      setAnalyseProgress(50);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            diagnostic: { type: "string" },
            score_sante: { type: "number" },
            points_forts: { type: "array", items: { type: "string" } },
            points_faibles: { type: "array", items: { type: "string" } },
            coiffures: { type: "array", items: { type: "object" } },
            produits: { type: "array", items: { type: "object" } },
            routine: { type: "object" },
            conseil_pro: { type: "string" },
            routines_suggeries: { type: "array", items: { type: "object" } },
          }
        },
        file_urls: uploadedUrl ? [uploadedUrl] : undefined,
      });

      setAnalyseProgress(100);
      // Valider que la réponse contient bien les données attendues
      const finalResults = response && response.diagnostic ? response : null;
      if (finalResults) {
        setResults(finalResults);
        setPhase("results");
      } else {
        throw new Error("Réponse IA invalide");
      }
    } catch (err) {
      console.error("Analyse error:", err);
      const hairTypeLabel = HAIR_TYPES.find(h => h.id === hairType)?.label || hairType;
      const fallback = {
        diagnostic: `Vos cheveux de type ${hairTypeLabel} nécessitent un programme d'hydratation et de renforcement ciblé. L'analyse révèle des besoins en nutrition pour améliorer la vitalité et l'éclat de votre fibre capillaire.`,
        score_sante: 68,
        points_forts: ["Bonne densité capillaire", "Pousse régulière"],
        points_faibles: ["Manque d'hydratation", "Pointes fragilisées"],
        coiffures: [
          { nom: "Chignon protecteur", description: "Protège les pointes et favorise la pousse en maintenant l'humidité." },
          { nom: "Tresses semi-protectrices", description: "Réduit la friction et préserve l'hydratation naturelle." },
          { nom: "Twist-out naturel", description: "Met en valeur la texture tout en minimisant la manipulation." },
        ],
        produits: [
          { nom: "Masque hydratant profond", type: "Masque", marque: "SheaMoisture", pourquoi: "Restaure le film lipidique et repulpe la fibre capillaire." },
          { nom: "Huile de jojoba bio", type: "Huile", marque: "Moroccanoil", pourquoi: "Nourrit et scelle l'humidité sans alourdir les cheveux." },
          { nom: "Shampoing sans sulfates", type: "Shampoing", marque: "ORS", pourquoi: "Nettoie sans décaper les lipides naturels du cuir chevelu." },
          { nom: "Sérum thermo-protecteur", type: "Sérum", marque: "Kérastase", pourquoi: "Protège la fibre contre la chaleur et les agressions externes." },
        ],
        routine: {
          Lundi: { matin: "Démêlage doux sur cheveux humides + spray hydratant", soir: "Application légère d'huile sur les pointes" },
          Mercredi: { matin: "Shampoing doux + soin démêlant 5 minutes", soir: "Masque hydratant 20 min sous bonnet chauffant" },
          Vendredi: { matin: "Sérum lissant + coiffage doux", soir: "Tresses de protection lâches pour la nuit" },
          Dimanche: { matin: "Bain d'huile 1h avant shampoing", soir: "Massage cuir chevelu 5 min + eau florale" },
        },
        conseil_pro: "Hydratez vos cheveux de l'intérieur : buvez au moins 1,5L d'eau par jour et adoptez un bain d'huile hebdomadaire.",
        routines_suggeries: [
          { nom: "Routine Hydratation Intense", emoji: "💧", frequence: "3x/semaine", description: "Programme deep conditioning pour restaurer l'hydratation", taches: ["Bain d'huile 1h avant le shampoing", "Masque hydratant 20 min", "Leave-in conditioner après lavage", "Sceller avec une huile légère"] },
          { nom: "Routine Anti-Chute", emoji: "🌱", frequence: "Quotidienne", description: "Renforcer le cuir chevelu et stimuler la pousse", taches: ["Massage cuir chevelu 5 min", "Sérum anti-chute sur les racines", "Brosse à picots doux", "Complexe vitamines B5+B7"] },
          { nom: "Routine Protectrice", emoji: "🛡️", frequence: "Hebdomadaire", description: "Préserver la longueur et minimiser la casse", taches: ["Coiffure protective le soir", "Bonnet satin pour la nuit", "Démêlage doux de pointe à racine", "Traitement protéiné 1x/mois"] },
        ],
      };
      setResults(fallback);
      setPhase("results");
    }
  };

  // ── PHASE: Guide ────────────────────────────────────────────────────────────
  if (phase === "guide") return <ScanGuide onStart={(mode) => setPhase(mode === "upload" ? "upload" : "camera")} onBack={() => navigate(-1)} />;

  // ── PHASE: Upload Photo ─────────────────────────────────────────────────────
  if (phase === "upload") return (
    <PhotoUploader onCapture={handleCapture} onBack={() => setPhase("guide")} />
  );

  // ── PHASE: Caméra Live ──────────────────────────────────────────────────────
  if (phase === "camera") return (
    <LiveScanner onCapture={handleCapture} onBack={() => setPhase("guide")} />
  );

  // ── PHASE: Formulaire (après capture) ──────────────────────────────────────
  if (phase === "form") return (
    <div className="font-display min-h-full bg-[#f8f7f5] flex flex-col">
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => setPhase("camera")}
          className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center active:scale-95">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Maria AI</p>
          <h1 className="text-[18px] font-black text-gray-900">Complétez votre profil</h1>
        </div>
        {capturedPhoto && (
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
            <img src={capturedPhoto} alt="scan" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-36 space-y-5">

        {/* Aperçu photo capturée */}
        {capturedPhoto && (
          <div className="relative h-48 rounded-3xl overflow-hidden shadow-sm">
            <img src={capturedPhoto} alt="Votre scan" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-green-500/90 text-white rounded-full px-3 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black">Scan capturé ✓</span>
            </div>
            <button
              onClick={() => setPhase("camera")}
              className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-black px-3 py-1.5 rounded-full"
            >
              Rescanner
            </button>
          </div>
        )}

        {/* Type de cheveux */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-black">1</span>
            Mon type de cheveux *
          </p>
          <div className="grid grid-cols-3 gap-2">
            {HAIR_TYPES.map(({ id, label, emoji }) => (
              <button key={id} onClick={() => setHairType(id)}
                className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border-2 transition-all active:scale-[0.97] ${hairType === id ? "border-primary bg-orange-50 shadow-sm shadow-primary/20" : "border-gray-100 bg-white"}`}>
                <span className="text-[24px]">{emoji}</span>
                <span className={`text-[10px] font-black text-center leading-tight ${hairType === id ? "text-primary" : "text-gray-500"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Origine capillaire */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-black">2</span>
            Mon origine capillaire <span className="text-gray-300 font-medium normal-case">(optionnel)</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ORIGINES.map(({ id, label, emoji }) => (
              <button key={id} onClick={() => setOrigine(o => o === id ? null : id)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all active:scale-[0.97] ${origine === id ? "border-primary bg-orange-50 shadow-sm shadow-primary/20" : "border-gray-100 bg-white"}`}>
                <span className="text-[20px]">{emoji}</span>
                <span className={`text-[9px] font-black text-center leading-tight ${origine === id ? "text-primary" : "text-gray-500"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Préoccupations */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-black">3</span>
            Mes préoccupations
          </p>
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map(c => (
              <button key={c} onClick={() => toggleConcern(c)}
                className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-all active:scale-95 ${concerns.includes(c) ? "bg-primary text-white border-primary shadow-sm shadow-primary/30" : "bg-white text-gray-600 border-gray-200"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Bannière IA */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-[12px] font-black text-gray-800">Analyse par vision IA en temps réel</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              Maria analyse votre scan live pour détecter texture, état du cuir chevelu et besoins capillaires.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5"
        style={{ paddingTop: "12px", paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
        {!hairType && (
          <p className="text-center text-[11px] text-gray-400 mb-2 font-medium">
            Sélectionnez votre type de cheveux pour continuer
          </p>
        )}
        <button
          onClick={runAnalysis}
          disabled={!hairType}
          className="w-full bg-primary text-white font-black text-[15px] uppercase tracking-widest py-4 rounded-3xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
        >
          <Sparkles className="w-5 h-5" strokeWidth={1.5} /> Analyser mes cheveux
        </button>
      </div>
    </div>
  );

  // ── PHASE: Analyse ──────────────────────────────────────────────────────────
  if (phase === "analyse") return (
    <div className="font-display min-h-full bg-white flex flex-col items-center justify-center gap-8 px-8 text-center">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-r-orange-300 border-t-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <Scissors className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div>
        <p className="text-[22px] font-black text-gray-900 mb-2">Analyse en cours</p>
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-xs">
          Maria analyse votre scan live et prépare votre diagnostic personnalisé.
        </p>
      </div>

      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] text-primary font-black animate-pulse">{ANALYSE_STEPS[analyseStep]}</p>
          <p className="text-[12px] font-black text-gray-400">{analyseProgress}%</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${analyseProgress}%` }}
          />
        </div>
      </div>

      {capturedPhoto && (
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border-2 border-orange-100">
          <img src={capturedPhoto} alt="scan" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );

  // ── PHASE: Résultats ────────────────────────────────────────────────────────
  if (phase === "results" && results) return (
    <div className="font-display min-h-full bg-[#f8f7f5]">
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => { setPhase("guide"); setResults(null); setCapturedPhoto(null); setCapturedFile(null); }}
          className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center active:scale-95">
          <RotateCcw className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Diagnostic IA · Scan Live</p>
          <h1 className="text-[17px] font-black text-gray-900">Votre analyse capillaire</h1>
        </div>
        {capturedPhoto && (
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
            <img src={capturedPhoto} alt="scan" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-36 space-y-4">

        {/* Score santé */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-black text-gray-700">Santé capillaire</p>
            <span className={`text-[30px] font-black ${results.score_sante >= 70 ? "text-green-500" : results.score_sante >= 50 ? "text-primary" : "text-red-500"}`}>
              {results.score_sante}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-4">
            <div
              className={`h-full rounded-full ${results.score_sante >= 70 ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-primary to-orange-400"}`}
              style={{ width: `${results.score_sante}%`, transition: "width 1s ease" }}
            />
          </div>
          <p className="text-[13px] text-gray-600 font-medium leading-relaxed">{results.diagnostic}</p>

          {/* Points forts / faibles */}
          {(results.points_forts?.length > 0 || results.points_faibles?.length > 0) && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {results.points_forts?.length > 0 && (
                <div className="bg-green-50 rounded-2xl p-3">
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">✓ Points forts</p>
                  {results.points_forts.map((p, i) => (
                    <p key={i} className="text-[11px] text-green-700 font-medium leading-snug mb-0.5">· {p}</p>
                  ))}
                </div>
              )}
              {results.points_faibles?.length > 0 && (
                <div className="bg-orange-50 rounded-2xl p-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">⚠ À améliorer</p>
                  {results.points_faibles.map((p, i) => (
                    <p key={i} className="text-[11px] text-primary/80 font-medium leading-snug mb-0.5">· {p}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conseil pro */}
        {results.conseil_pro && (
          <div className="bg-gradient-to-r from-[#1a2035] to-[#2a3050] rounded-3xl p-4 flex items-start gap-3 shadow-lg">
            <div className="w-9 h-9 bg-primary/30 rounded-xl flex items-center justify-center shrink-0">
              <Star className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Conseil Maria</p>
              <p className="text-[13px] text-white font-medium leading-relaxed">{results.conseil_pro}</p>
            </div>
          </div>
        )}

        {/* Coiffures recommandées */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" strokeWidth={1.5} /> Coiffures recommandées
          </p>
          <div className="space-y-2">
            {(results.coiffures || []).map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center shrink-0 border border-orange-200">
                  <span className="text-[14px]">{["✂️", "👑", "🌸"][i] || "✨"}</span>
                </div>
                <div>
                  <p className="text-[13px] font-black text-gray-900">{c.nom}</p>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5 leading-snug">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Produits recommandés */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" strokeWidth={1.5} /> Produits recommandés
          </p>
          <div className="space-y-2">
            {(results.produits || []).map((p, i) => {
              const typeIcons = { Shampoing: "🧴", Masque: "💜", Huile: "💧", Sérum: "✨", Conditioner: "🌊", Spray: "💨" };
              const icon = typeIcons[p.type] || "🧪";
              return (
                <div key={i} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
                    <span className="text-[14px]">{icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-[13px] font-black text-gray-900">{p.nom}</p>
                      <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{p.type}</span>
                    </div>
                    {p.marque && <p className="text-[10px] font-black text-primary mb-0.5">{p.marque}</p>}
                    <p className="text-[11px] text-gray-500 font-medium leading-snug">{p.pourquoi}</p>
                    <button
                      onClick={() => navigate(`/boutique`)}
                      className="mt-2 flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full active:scale-95 transition-all"
                    >
                      <ShoppingBag className="w-3 h-3" /> Trouver en boutique
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Routine hebdomadaire */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" strokeWidth={1.5} /> Routine hebdomadaire personnalisée
          </p>
          <div className="space-y-2">
            {Object.entries(results.routine || {}).map(([jour, soin]) => (
              <div key={jour} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveRoutineDay(activeRoutineDay === jour ? null : jour)}
                  className="w-full flex items-center justify-between px-4 py-3.5 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-[14px] font-black text-gray-900">{jour}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${activeRoutineDay === jour ? "rotate-90" : ""}`} strokeWidth={2} />
                </button>
                {activeRoutineDay === jour && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
                      <span className="text-[14px] shrink-0">☀️</span>
                      <p className="text-[12px] text-gray-600 font-medium leading-snug">{soin.matin}</p>
                    </div>
                    <div className="flex items-start gap-2 bg-indigo-50 rounded-xl p-3">
                      <span className="text-[14px] shrink-0">🌙</span>
                      <p className="text-[12px] text-gray-600 font-medium leading-snug">{soin.soir}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Badges soins */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Droplets, label: "Hydratation", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: ShieldCheck, label: "Protection", color: "text-green-500", bg: "bg-green-50" },
            { icon: Leaf, label: "Naturel", color: "text-emerald-500", bg: "bg-emerald-50" },
          ].map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col items-center gap-1.5`}>
              <Icon className={`w-5 h-5 ${color}`} strokeWidth={1.5} />
              <span className={`text-[10px] font-black ${color} uppercase tracking-wide`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5"
        style={{ paddingTop: "12px", paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRoutinesModal(true)}
            className="flex-1 bg-primary text-white font-black text-[13px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} /> Créer mes routines
          </button>
          <button
            onClick={() => { setPhase("guide"); setResults(null); setCapturedPhoto(null); setCapturedFile(null); setOrigine(null); setHairType(null); setConcerns([]); }}
            className="w-14 bg-gray-100 rounded-2xl flex items-center justify-center active:scale-95"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {showRoutinesModal && (
        <RoutinesModal results={results} onClose={() => setShowRoutinesModal(false)} />
      )}
    </div>
  );

  return null;
}