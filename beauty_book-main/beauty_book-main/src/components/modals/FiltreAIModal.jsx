import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Shield, Download, Heart, Check, Search, Sparkles, ImageIcon, GalleryHorizontalEnd } from "lucide-react";
import { entities, uploadFile } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { apiClient } from '@/lib/apiClient';



const GUIDE_TIPS = [
  { icon: "😊", title: "Visage bien visible", desc: "Dégagez votre front et vos oreilles" },
  { icon: "📏", title: "Tête bien droite", desc: "Regardez l'objectif sans incliner la tête" },
  { icon: "☀️", title: "Bonne luminosité", desc: "Évitez les ombres fortes sur le visage" },
];

const PROGRESS_STEPS = [
  { pct: 8, msg: "Téléchargement de votre photo..." },
  { pct: 20, msg: "Préparation des images de référence..." },
  { pct: 35, msg: "Connexion à Nano Banana AI..." },
  { pct: 50, msg: "Génération de la coiffure en cours..." },
  { pct: 65, msg: "Application du style sur votre visage..." },
  { pct: 78, msg: "Ajustement des textures et couleurs..." },
  { pct: 88, msg: "Finalisation du rendu réaliste..." },
  { pct: 95, msg: "Presque prêt..." },
];

export default function FiltreAIModal({ styleTitle, onClose, onResultSaved, favoriteStyles = [] }) {
  const [step, setStep] = useState(1);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const [userPhotoUploadedUrl, setUserPhotoUploadedUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [liked, setLiked] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [styleSearch, setStyleSearch] = useState("");
  const [comparePos, setComparePos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [styles, setStyles] = useState([]);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const compareRef = useRef(null);
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);

  // Charger les styles depuis l'entité Style (BDD réelle) + Reels
  useEffect(() => {
    const loadStyles = async () => {
      try {
        // 1. Styles créés dans l'app (entité Style)
        const dbStyles = await entities.Style.filter({ status: "publie" }, "-created_at", 80).catch(() => []);
        const fromDb = dbStyles
          .filter(s => s.images?.length > 0 || s.thumbnail_url)
          .map(s => ({
            id: s.id,
            label: s.title || s.name || "Style",
            img: (s.images?.[0]) || s.thumbnail_url,
            allImages: s.images || [s.thumbnail_url].filter(Boolean),
            author: s.author_name || null,
            category: s.category,
            fromReel: false,
            fromDb: true,
          }));

        // 2. Reels publiés en complément
        const reels = await entities.Reel.filter({ status: "publie" }, "-created_at", 30).catch(() => []);
        const fromReels = reels
          .filter(r => r.images?.length > 0 || r.thumbnail_url)
          .map(r => ({
            id: r.id,
            label: r.title || "Style " + r.category,
            img: (r.images?.[0]) || r.thumbnail_url,
            allImages: r.images || [r.thumbnail_url].filter(Boolean),
            author: r.author_name,
            category: r.category,
            fromReel: true,
            fromDb: false,
          }));

        const realStyles = [...fromDb, ...fromReels];
        setStyles(realStyles);
      } catch (err) {
        console.error("Failed to load styles:", err);
      }
      setLoadingStyles(false);
    };
    loadStyles();
  }, []);

  const favIds = new Set(favoriteStyles.map(f => f.id));
  const favStylesList = styles.filter(r => favIds.has(r.id));
  const nonFavStylesList = styles.filter(r => !favIds.has(r.id));
  const filteredStyles = styleSearch.trim()
    ? styles.filter(r => r.label.toLowerCase().includes(styleSearch.toLowerCase()))
    : [...favStylesList, ...nonFavStylesList];

  // Pre-select style from parent
  useEffect(() => {
    if (styleTitle && styles.length > 0) {
      const match = styles.find(r =>
        styleTitle.toLowerCase().includes(r.id) ||
        r.label.toLowerCase().includes(styleTitle.toLowerCase().split(" ")[0])
      );
      setSelectedStyle(match || styles[0]);
    }
  }, [styleTitle, styles]);

  const handleCompareMove = (clientX) => {
    if (!compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setComparePos(Math.round((x / rect.width) * 100));
  };
  const onMouseMove = (e) => { if (isDragging) handleCompareMove(e.clientX); };
  const onTouchMove = (e) => { if (isDragging) handleCompareMove(e.touches[0].clientX); };

  const handlePhotoUpload = (file) => {
    if (!file) return;
    setUserPhoto(file);
    setUserPhotoUrl(URL.createObjectURL(file));
    setUserPhotoUploadedUrl(null); // reset upload cache
  };

  const startSimulation = async () => {
    if (!userPhoto || !selectedStyle) return;
    setStep(3);
    setProgress(0);
    setErrorMsg(null);

    // Animer la progress bar
    let stepIdx = 0;
    const animateProgress = () => {
      if (stepIdx < PROGRESS_STEPS.length) {
        const s = PROGRESS_STEPS[stepIdx];
        setProgress(s.pct);
        setProgressMsg(s.msg);
        stepIdx++;
        const delay = stepIdx <= 3 ? 800 : 3000 + Math.random() * 2000;
        progressRef.current = setTimeout(animateProgress, delay);
      }
    };
    animateProgress();

    try {
      // 1. Uploader la photo de l'utilisateur si pas encore fait
      let uploadedUrl = userPhotoUploadedUrl;
      if (!uploadedUrl) {
        setProgressMsg("Téléchargement de votre photo...");
        const { file_url } = await uploadFile({ file: userPhoto });
        uploadedUrl = file_url;
        setUserPhotoUploadedUrl(file_url);
      }

      // 2. Récupérer toutes les images de référence du style sélectionné
      const referenceImages = selectedStyle.allImages
        ? selectedStyle.allImages.filter(Boolean).slice(0, 3)
        : [selectedStyle.img].filter(Boolean);

      setProgressMsg("Connexion à Nano Banana AI...");

      // 3. Appeler la fonction backend
      const response = await apiClient.callFunction("simulateHairstyle", {
        userPhotoUrl: uploadedUrl,
        styleTitle: selectedStyle.label,
        referenceImages,
      });

      clearTimeout(progressRef.current);
      setProgress(100);
      setProgressMsg("Simulation terminée ✨");
      await new Promise(r => setTimeout(r, 600));

      const data = response.data;

      if (data?.error) {
        throw new Error(data.error);
      }

      const isFallback = data?.fallback === true;
      
      setResult({
        generatedImageUrl: data?.generatedImageUrl || null,
        styleLabel: selectedStyle.label,
        styleImg: selectedStyle.img,
        userPhotoUrl,
        fromReel: selectedStyle.fromReel,
        author: selectedStyle.author,
        fallback: isFallback,
        fallbackMessage: data?.message || null,
      });
      setStep(4);

    } catch (err) {
      clearTimeout(progressRef.current);
      console.error("Simulation error:", err.message);
      setErrorMsg(err.message);
      setProgress(100);
      setProgressMsg("Une erreur est survenue");
      await new Promise(r => setTimeout(r, 500));
      setResult({
        generatedImageUrl: null,
        error: err.message,
        styleLabel: selectedStyle?.label,
        styleImg: selectedStyle?.img,
        userPhotoUrl,
        fromReel: selectedStyle?.fromReel,
        author: selectedStyle?.author,
        fallback: false,
      });
      setStep(4);
    }
  };

  const handleDownload = async () => {
    const imgUrl = result?.generatedImageUrl || result?.styleImg;
    if (!imgUrl) return;
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hairstyle-${result.styleLabel?.replace(/\s/g, "-")}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      // fallback: ouvrir dans un onglet
      window.open(imgUrl, "_blank");
      setDownloaded(true);
    }
  };

  const handleSaveToMaria = () => {
    if (result && onResultSaved) {
      onResultSaved({
        styleLabel: result.styleLabel,
        styleImg: result.generatedImageUrl || result.styleImg,
        userPhotoUrl: result.userPhotoUrl,
        message: `Style "${result.styleLabel}" simulé avec Nano Banana AI${result.author ? ` — par ${result.author}` : ""}`,
        compatibilityScore: 92,
        faceShape: "Analysé par IA",
        recommendations: [
          "Montrez cette simulation à votre coiffeur",
          "Consultez les pros disponibles sur BeautyBook",
          "Réservez une consultation pour ce style",
        ],
        savedAt: new Date().toISOString(),
      });
    }
    setLiked(true);
  };

  const modal = (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-end">
      <div className="w-full bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <button
            onClick={() => step > 1 && step < 3 ? setStep(step - 1) : onClose()}
            className="w-8 h-8 flex items-center justify-center text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-[17px] font-black text-gray-900">
              {step === 1 && "Guide Photo"}
              {step === 2 && "Choisir un Style"}
              {step === 3 && "Nano Banana IA..."}
              {step === 4 && "Votre Simulation"}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1 rounded-full transition-all ${s === step ? "w-6 bg-primary" : s < step ? "w-3 bg-primary/40" : "w-3 bg-gray-200"}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 text-[18px]">✕</button>
        </div>

        <div className="flex-1 px-5 py-6">

          {/* ── STEP 1: Guide ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 text-center">
                <span className="text-[52px]">✨</span>
                <h3 className="text-[24px] font-black text-gray-900 mt-3">AI Hairstyle</h3>
                <p className="text-[22px] font-black text-primary">Changer</p>
                <p className="text-[13px] text-gray-600 mt-3 leading-relaxed">
                  Notre IA Nano Banana génère une <strong>vraie photo de vous</strong> avec la coiffure choisie en quelques secondes.
                </p>
                <div className="mt-3 flex items-center justify-center gap-1.5 bg-white/70 rounded-2xl px-3 py-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-black text-primary">Propulsé par Nano Banana AI</span>
                </div>
              </div>
              <div className="space-y-3">
                {GUIDE_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[28px] shrink-0">{tip.icon}</span>
                    <div>
                      <p className="text-[14px] font-black text-gray-900">{tip.title}</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 transition-all"
              >
                COMMENCER <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Photo + Style ── */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Photo upload */}
              <div>
                <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" strokeWidth={1.5} /> Votre photo</h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all ${userPhotoUrl ? "border-primary bg-orange-50/30" : "border-gray-200 bg-gray-50"}`}
                >
                  {userPhotoUrl ? (
                    <div className="relative">
                      <img src={userPhotoUrl} alt="Votre photo" className="w-32 h-32 object-cover rounded-2xl shadow-md" />
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mb-2 border border-orange-200">
                        <ImageIcon className="w-7 h-7 text-primary/60" strokeWidth={1.2} />
                      </div>
                      <p className="text-[14px] font-black text-gray-700">Importer votre photo</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG · Max 10 Mo</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handlePhotoUpload(e.target.files?.[0])} className="hidden" />
                {userPhotoUrl && (
                  <button onClick={() => fileInputRef.current?.click()} className="text-[11px] font-black text-primary mt-2 uppercase tracking-widest">
                    Changer de photo
                  </button>
                )}
              </div>

              {/* Style selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-black text-gray-900 flex items-center gap-2"><GalleryHorizontalEnd className="w-4 h-4 text-primary" strokeWidth={1.5} /> Choisir un style</h3>
                  {!loadingStyles && styles.some(s => s.fromReel) && (
                    <span className="text-[9px] font-black text-primary bg-orange-50 px-2 py-1 rounded-full uppercase tracking-widest border border-orange-100">
                      ✦ Publications réelles
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2.5 mb-3">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    value={styleSearch}
                    onChange={e => setStyleSearch(e.target.value)}
                    placeholder="Rechercher un style..."
                    className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400 font-medium"
                  />
                  {styleSearch && (
                    <button onClick={() => setStyleSearch("")} className="text-gray-400 text-[14px]">✕</button>
                  )}
                </div>

                {loadingStyles ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {!styleSearch && favStylesList.length > 0 && (
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">❤️ Mes favoris</p>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                      {filteredStyles.map(ref => (
                        <button
                          key={ref.id}
                          onClick={() => setSelectedStyle(ref)}
                          className="relative flex flex-col items-center gap-1 active:scale-95 transition-all"
                        >
                          <div className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedStyle?.id === ref.id ? "border-primary shadow-md shadow-primary/20 scale-105" : "border-transparent"}`}>
                            <img src={ref.img} alt={ref.label} className="w-full h-full object-cover" />
                          </div>
                          {ref.fromReel && (
                            <div className="absolute top-1 left-1 w-4 h-4 bg-primary/80 rounded-full flex items-center justify-center">
                              <Sparkles className="w-2 h-2 text-white" />
                            </div>
                          )}
                          {favIds.has(ref.id) && !styleSearch && (
                            <div className="absolute top-1 left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <Heart className="w-2 h-2 text-white fill-white" />
                            </div>
                          )}
                          {selectedStyle?.id === ref.id && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight text-center leading-tight">{ref.label}</span>
                        </button>
                      ))}
                      {filteredStyles.length === 0 && (
                        <div className="col-span-4 text-center py-6 text-[13px] text-gray-400">
                          {loadingStyles ? "" : styleSearch ? "Aucun style trouvé" : "Aucun style publié pour le moment"}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {selectedStyle && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-center gap-3">
                  <img src={selectedStyle.img} alt={selectedStyle.label} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-gray-900">Style sélectionné : {selectedStyle.label}</p>
                    {selectedStyle.fromReel && selectedStyle.author && (
                      <p className="text-[10px] text-primary font-bold">✦ Publié par {selectedStyle.author}</p>
                    )}
                    <p className="text-[11px] text-gray-500">Nano Banana IA va générer votre photo avec ce style</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-2xl p-3 flex items-start gap-2 border border-blue-100">
                <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  <strong>Vie privée garantie</strong> — Vos photos sont traitées de façon sécurisée par Nano Banana AI et ne sont pas stockées.
                </p>
              </div>

              <button
                onClick={startSimulation}
                disabled={!userPhoto || !selectedStyle}
                className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 transition-all ${
                  userPhoto && selectedStyle
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Sparkles className="w-4 h-4" strokeWidth={1.5} /> GÉNÉRER MA COIFFURE
              </button>
            </div>
          )}

          {/* ── STEP 3: Loading ── */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 gap-8">
              <div className="flex gap-4 w-full">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">VOUS</p>
                  {userPhotoUrl ? (
                    <div className="w-full aspect-square rounded-2xl overflow-hidden">
                      <img src={userPhotoUrl} alt="Vous" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">STYLE</p>
                  {selectedStyle && (
                    <div className="w-full aspect-square rounded-2xl overflow-hidden">
                      <img src={selectedStyle.img} alt={selectedStyle.label} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <p className="text-[13px] font-black text-gray-900">Nano Banana AI</p>
                  </div>
                  <p className="text-[14px] font-black text-primary">{progress}%</p>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[12px] text-gray-500 font-medium text-center">{progressMsg}</p>
              </div>

              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>

              <p className="text-[11px] text-gray-400 font-medium text-center leading-relaxed max-w-[260px]">
                Nano Banana AI génère une vraie photo de vous avec cette coiffure. Cela peut prendre 30 à 90 secondes…
              </p>
            </div>
          )}

          {/* ── STEP 4: Result ── */}
          {step === 4 && result && (
            <div className="space-y-5">

              {/* Badge génération */}
              <div className="flex items-center justify-center gap-2">
                <div className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 border ${result.fallback ? "bg-purple-50 border-purple-100" : "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-100"}`}>
                  <Sparkles className={`w-3.5 h-3.5 ${result.fallback ? "text-purple-500" : "text-primary"}`} />
                  <span className={`text-[11px] font-black ${result.fallback ? "text-purple-600" : "text-primary"}`}>
                    {result.fallback ? "Généré par IA (mode fallback)" : "Généré par Nano Banana AI"}
                  </span>
                </div>
              </div>
              {result.fallback && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-purple-700 font-medium">{result.fallbackMessage || "Image générée par IA — crédits fal.ai épuisés"}</p>
                </div>
              )}

              {result.error ? (
                // Erreur — afficher un message clair
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <p className="text-[14px] font-black text-red-600 mb-2">⚠️ Génération échouée</p>
                  <p className="text-[12px] text-gray-600">{result.error}</p>
                  <p className="text-[11px] text-gray-500 mt-2">Rechargez votre solde sur <a href="https://fal.ai/dashboard/billing" target="_blank" className="text-primary underline">fal.ai/dashboard/billing</a> ou réessayez plus tard.</p>
                </div>
              ) : result.fallback ? (
                /* Image générée (fallback) — affichage simple */
                <div>
                  <p className="text-[12px] font-black text-gray-700 uppercase tracking-widest mb-2">Résultat</p>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                    <img
                      src={result.generatedImageUrl}
                      alt={result.styleLabel}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-purple-500/90 rounded-full px-2 py-0.5">
                      <span className="text-white text-[9px] font-black uppercase">IA</span>
                    </div>
                  </div>
                  {result.userPhotoUrl && (
                    <div className="mt-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Votre photo</p>
                      <div className="w-24 h-24 rounded-xl overflow-hidden">
                        <img src={result.userPhotoUrl} alt="Vous" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Before/After Slider interactif */
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] font-black text-gray-700 uppercase tracking-widest">Avant / Après</p>
                    <span className="text-[10px] text-gray-400 font-medium">← Glisser →</span>
                  </div>
                  <div
                    ref={compareRef}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-col-resize select-none bg-gray-100"
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={onMouseMove}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    onTouchMove={onTouchMove}
                  >
                    {/* APRÈS — image générée par Nano Banana */}
                    <div className="absolute inset-0">
                      <img
                        src={result.generatedImageUrl}
                        alt="Après"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-primary/90 rounded-full px-2 py-0.5">
                        <span className="text-white text-[9px] font-black uppercase">APRÈS</span>
                      </div>
                    </div>

                    {/* AVANT — photo originale */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}
                    >
                      <img src={result.userPhotoUrl} alt="Avant" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-gray-900/80 rounded-full px-2 py-0.5">
                        <span className="text-white text-[9px] font-black uppercase">AVANT</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                      style={{ left: `${comparePos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-primary">
                        <div className="flex items-center gap-0.5">
                          <ArrowLeft className="w-3 h-3 text-primary" />
                          <ArrowRight className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-gray-400 mt-1.5 font-medium">Glissez pour comparer l'original et la simulation IA</p>
                </div>
              )}

              {/* Info style */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={result.styleImg} alt={result.styleLabel} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div>
                    <p className="text-[13px] font-black text-gray-900">{result.styleLabel}</p>
                    {result.fromReel && result.author && (
                      <p className="text-[11px] text-primary font-bold">✦ Style de {result.author}</p>
                    )}
                    <p className="text-[11px] text-gray-400 font-medium">Image générée par Nano Banana AI</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  disabled={!result.generatedImageUrl}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 ${downloaded ? "border-green-400 bg-green-50 text-green-600" : "border-gray-200 bg-white text-gray-700"}`}
                >
                  {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  {downloaded ? "Téléchargé" : "Télécharger"}
                </button>
                <button
                  onClick={handleSaveToMaria}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all ${liked ? "bg-red-50 border border-red-200 text-red-500" : "bg-gray-100 text-gray-700 border border-transparent"}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  {liked ? "Sauvegardé" : "Favoris"}
                </button>
              </div>

              <button
                className="w-full bg-primary text-white font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/30"
              >
                ✂️ Réserver cette Coiffure
              </button>

              <button
                onClick={() => { setStep(2); setResult(null); setProgress(0); setLiked(false); setErrorMsg(null); }}
                className="w-full bg-gray-100 text-gray-700 font-black py-3.5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all text-[12px]"
              >
                Recommencer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}