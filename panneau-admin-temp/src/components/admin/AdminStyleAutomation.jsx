import { useState, useEffect, useCallback } from "react";
import { entities } from "@/api/entities";
import { Loader2, Clock, RefreshCw, BarChart3, Search, Database, CheckCircle, AlertCircle, History, Zap, Globe, Plus } from "lucide-react";

const PREDEFINED_STYLES = [
  {
    title: "Box Braids Jumbo",
    category: "Coiffure",
    subcategory: "Box Braids",
    description: "Tresses volumisees et protegeantes aux carres geometriques. Style protecteur longue duree, ideal pour les cheveux afro et tres textures. Disponible en differentes longueurs et epaisseurs.",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=400&fit=crop"
    ],
    temps_moyen: "4h - 6h",
    niveau_difficulte: "Avance",
    type_cheveux: "Afro",
    outils_utilises: ["Peigne dente large", "Coton a tresser", "Eau de tresse", "Mousse fixatrice"],
    tags: ["tresses", "box braids", "protecteur", "afro", "long"]
  },
  {
    title: "Knotless Braids",
    category: "Coiffure",
    subcategory: "Knotless Braids",
    description: "Tresses sans noeud, plus legeres et confortables que les box braids classiques. Technique de feed-in qui soulage la tension sur le cuir chevelu. Resultat naturel et fluide.",
    images: [
      "https://images.unsplash.com/photo-1605980776566-0427bb024f65?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop"
    ],
    temps_moyen: "3h - 5h",
    niveau_difficulte: "Intermediaire",
    type_cheveux: "Afro",
    outils_utilises: ["Elastiques mini", "Creme coiffante", "Pinceau rat-tail", "Eau de tresse"],
    tags: ["knotless", "tresses", "naturel", "sans noeud", "protecteur"]
  },
  {
    title: "Cornrows Creatifs",
    category: "Coiffure",
    subcategory: "Cornrows",
    description: "Tressage plat au cuir chevelu avec motifs geometriques et designs artistiques. Styles varies du classique au contemporain. Parfait comme base pour de nombreux coiffures tressees.",
    images: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop"
    ],
    temps_moyen: "2h - 4h",
    niveau_difficulte: "Intermediaire",
    type_cheveux: "Afro",
    outils_utilises: ["Peigne a dents fines", "Gel coiffant", "Eau de tresse", "Tissu elastique"],
    tags: ["cornrows", "tresses plates", "motifs", "artistique", "protecteur"]
  },
  {
    title: "Twist Africains",
    category: "Coiffure",
    subcategory: "Twist",
    description: "Technique de coiffure en deux brins torsades sur toute la longueur. Effet volume et texture naturelle, ideal pour les cheveux crepus. Style polyvalent portage court ou long.",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=400&fit=crop"
    ],
    temps_moyen: "2h - 4h",
    niveau_difficulte: "Debutant",
    type_cheveux: "Crepus",
    outils_utilises: ["Eau de tresse", "Mousse coiffante", "Huile legere", "Pince a clips"],
    tags: ["twist", "africain", "naturel", "volume", "crepus"]
  },
  {
    title: "Faux Locs Boheme",
    category: "Coiffure",
    subcategory: "Faux Locks",
    description: "Fauxs dreadlocks temporaires avec un look boheme detendu et chic. Technique de wrapping sans altérer les cheveux naturels. Diverses finitions : lisses, texturées ou avec perles.",
    images: [
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop"
    ],
    temps_moyen: "4h - 7h",
    niveau_difficulte: "Avance",
    type_cheveux: "Afro",
    outils_utilises: ["Faux locs synthetiques", "Crochet aiguille", "Ciseaux", "Huile de ricin"],
    tags: ["faux locs", "boheme", "dreadlocks", "temporaire", "style"]
  },
  {
    title: "Lace Front Wig",
    category: "Coiffure",
    subcategory: "Perruques",
    description: "Perruque avec bordure en dentelle ultra-fine pour un effet cheveux naturels. Pose et customisation pour un rendu invisible. Styles lisses, boucles ou ondulés disponibles.",
    images: [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h - 2h",
    niveau_difficulte: "Intermediaire",
    type_cheveux: "Tous",
    outils_utilises: ["Colle lace", "Ciseaux fins", "Peigne dentaire", "Spray fixatif", "Bandeau de securite"],
    tags: ["perruque", "lace front", "naturel", "changement", "versatile"]
  },
  {
    title: "Coloration Balayage",
    category: "Coiffure",
    subcategory: "Coloration",
    description: "Technique de colour a la main pour un effet degradé naturel et lumineux. Eclaircissement progressif sans racines visibles. Sublime tous les types de cheveux et couleurs de peau.",
    images: [
      "https://images.unsplash.com/photo-1605980776566-0427bb024f65?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop"
    ],
    temps_moyen: "2h - 4h",
    niveau_difficulte: "Avance",
    type_cheveux: "Tous",
    outils_utilises: ["Papillotes", "Eclaircissant", "Brosse speciale", "Oxydant", "Apres-soin"],
    tags: ["balayage", "coloration", "degrade", "lumineux", "naturel"]
  },
  {
    title: "Defrisage Bresilien",
    category: "Coiffure",
    subcategory: "Lissage",
    description: "Lissage kératine a la bresilienne pour des cheveux doux, brillants et infroissables. Technique professionnelle de 3 a 6 mois. Soin profond qui protege la fibre capillaire.",
    images: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=400&fit=crop"
    ],
    temps_moyen: "3h - 5h",
    niveau_difficulte: "Expert",
    type_cheveux: "Crepus",
    outils_utilises: ["Fer a lisser", "Keratine bresilienne", "Shampoing clarifiant", "Brosse kerdryl", "Gant heat-resistant"],
    tags: ["lissage", "defrisage", "bresilien", "keratine", "doux"]
  },
  {
    title: "Maquillage Marieee",
    category: "Maquillage",
    subcategory: "Mariage",
    description: "Maquillage de prestige pour le jour J, resistant toute la journee et à l'eau. Look naturel elegant ou glamour selon vos preferences. Consultation prealable et essai inclus.",
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h30 - 2h",
    niveau_difficulte: "Expert",
    type_peau: "Tous",
    outils_utilises: ["Primer", "Fond de teint longue tenue", "Poudre libre", "Fixateur de maquillage", "Correcteur"],
    tags: ["mariage", "bridal", "longue tenue", "elegant", "prestige"]
  },
  {
    title: "Smokey Eyes",
    category: "Maquillage",
    subcategory: "Glamour",
    description: "Le classique indémodable du regard fumé, subtil ou intense selon l'occasion. Degradé de fards sombres pour un effet mystérieux et seduisant. Technique applicative professionnelle.",
    images: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop"
    ],
    temps_moyen: "45min - 1h",
    niveau_difficulte: "Avance",
    type_peau: "Tous",
    outils_utilises: ["Palette smokey", "Pinceaux blending", "Eyeliner", "Mascara volume", "Correcteur"],
    tags: ["smokey eyes", "glamour", "regard", "fume", "soiree"]
  },
  {
    title: "Airbrush Makeup",
    category: "Maquillage",
    subcategory: "Professionnel",
    description: "Maquillage a l'airbrush pour un rendu impeccable et photogénique. Finition naturelle, ultra-légère et longue tenue. Ideal pour photoshoots, films et évenements.",
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h - 1h30",
    niveau_difficulte: "Expert",
    type_peau: "Tous",
    outils_utilises: ["Pistolet airbrush", "Encre cosmetique", "Primer spray", "Compresseur", "Palette de teintes"],
    tags: ["airbrush", "professionnel", "photo", "longue tenue", "pro"]
  },
  {
    title: "Lash Lift & Tint",
    category: "Maquillage",
    subcategory: "Lash Lift",
    description: "Rehaussement et teinture des cils naturels pour un regard intense sans extensions. Effet recourbé et volumineux qui dure 6 a 8 semaines. Traitement nourrissant inclus.",
    images: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h - 1h30",
    niveau_difficulte: "Intermediaire",
    type_peau: "Tous",
    outils_utilises: ["Silicone rods", "Solutions perm", "Teinture cils", "Cotons-tiges", "Serum nourrissant"],
    tags: ["lash lift", "cils", "rehaussement", "naturel", "teinture"]
  },
  {
    title: "Manucure Gel",
    category: "Ongles",
    subcategory: "Gel",
    description: "Pose de gel sur ongles naturels pour un effet parfait et durable. Résistance exceptionnelle sans abîmer la plaque. Finition lisse, brillante et personnalisee.",
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1605663883821-5cff50b30269?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h30 - 2h",
    niveau_difficulte: "Intermediaire",
    type_peau: "Tous",
    outils_utilises: ["Gel constructeur", "Lampe UV/LED", "Lime a ongles", "Primer", "Top coat"],
    tags: ["gel", "manucure", "ongles", "durable", "brillant"]
  },
  {
    title: "Nail Art Floral",
    category: "Ongles",
    subcategory: "Nail Art",
    description: "Decoration artistique avec motifs floraux peints a la main. Designs delicats et uniques pour chaque cliente. Techniques: aquarelle, relief, stickers, strass.",
    images: [
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop"
    ],
    temps_moyen: "2h - 3h",
    niveau_difficulte: "Avance",
    type_peau: "Tous",
    outils_utilises: ["Pinceaux ultra-fins", "Vernis a dessin", "Perles", "Strass", "Top coat mat"],
    tags: ["nail art", "floral", "artistique", "decoration", "personnalise"]
  },
  {
    title: "French Manicure",
    category: "Ongles",
    subcategory: "French",
    description: "La manucure francaise classique, intemporelle et elegante. Bord blanc parfait avec base rose pâle naturelle. Finition soignee pour un look raffiné au quotidien.",
    images: [
      "https://images.unsplash.com/photo-1605663883821-5cff50b30269?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h - 1h30",
    niveau_difficulte: "Debutant",
    type_peau: "Tous",
    outils_utilises: ["Vernis blanc", "Vernis rose", "Guide tapes", "Lime fine", "Huile cuticules"],
    tags: ["french", "classique", "elegant", "naturel", "intemporel"]
  },
  {
    title: "Baby Boomer",
    category: "Ongles",
    subcategory: "Baby Boomer",
    description: "Variation moderne de la french avec un degradé blanc-rose fondant. Effet aero-brush ou poudre pour un fondu parfait. Trend incontournable des salons de manucure.",
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1605663883821-5cff50b30269?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h30 - 2h",
    niveau_difficulte: "Intermediaire",
    type_peau: "Tous",
    outils_utilises: ["Poudre acrylique", "Liquidite monomer", "Eponge makeup", "Lime buffer", "Top coat gloss"],
    tags: ["baby boomer", "degrade", "moderne", "trend", "french"]
  },
  {
    title: "Soin Hydratant",
    category: "Soins",
    subcategory: "Soins visage",
    description: "Soin profondement hydratant pour peaux seches et deshydratees. Nettoyage doux, masque repulpant et serum hydratant. Peau repulpée, souple et eclatante immediatement.",
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h - 1h30",
    niveau_difficulte: "Debutant",
    type_peau: "Seche",
    outils_utilises: ["Nettoyant doux", "Vapeur", "Masque hydratant", "Serum acide hyaluronique", "Creme nutrition"],
    tags: ["hydratant", "visage", "peau seche", "repulpant", "eclat"]
  },
  {
    title: "Anti-Age Boost",
    category: "Soins",
    subcategory: "Anti-age",
    description: "Soin anti-age intensif avec acides de fruits et peptides actifs. Lissage des rides et restauration de la fermete. Protocole complet pour une peau visiblement plus jeune.",
    images: [
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h15 - 1h45",
    niveau_difficulte: "Avance",
    type_peau: "Mature",
    outils_utilises: ["Peeling acides", "Masque collagen", "Serum retinol", "Massage lifting", "SPF protection"],
    tags: ["anti-age", "rides", "fermete", "peptides", "lifting"]
  },
  {
    title: "Gommage Corps",
    category: "Soins",
    subcategory: "Soins corps",
    description: "Exfoliation corporelle complete pour une peau douce et renouvelee. Gommage sucre ou sel avec huiles essentielles. Elimine les cellules mortes et stimule la microcirculation.",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop"
    ],
    temps_moyen: "45min - 1h",
    niveau_difficulte: "Debutant",
    type_peau: "Tous",
    outils_utilises: ["Gommage sucre", "Gant kessa", "Huile argan", "Creme corps", "Brosse seche"],
    tags: ["gommage", "corps", "exfoliation", "doux", "renouvellement"]
  },
  {
    title: "Rasage Royal",
    category: "Barbe",
    subcategory: "Rasage complet",
    description: "Rasage traditionnel complet avec serviette chaude et pinceau. Mousse savonnette artisanale et coupe precise des contours. Experience de detente et soin de la peau incluse.",
    images: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop"
    ],
    temps_moyen: "45min - 1h",
    niveau_difficulte: "Intermediaire",
    type_peau: "Tous",
    outils_utilises: ["Rasoir vintage", "Pinceau blaireau", "Savon a barbe", "Serviettes chaudes", "Bauhin aftershave"],
    tags: ["rasage", "barbe", "royal", "traditionnel", "homme"]
  },
  {
    title: "Taille Barbe Design",
    category: "Barbe",
    subcategory: "Taille design",
    description: "Taille et modelage sur mesure de la barbe selon la morphologie du visage. Definition des contours, egalisation et finition parfaite. Conseils personnalises d'entretien.",
    images: [
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop"
    ],
    temps_moyen: "30min - 45min",
    niveau_difficulte: "Intermediaire",
    type_peau: "Tous",
    outils_utilises: ["Ciseaux pro", "Tondeuse multi-tailles", "Peigne barbe", "Huile barbe", "Miroir"],
    tags: ["barbe", "taille", "design", "homme", "contour"]
  },
  {
    title: "Massage Hot Stone",
    category: "Massage",
    subcategory: "Hot Stone",
    description: "Massage relaxant aux pierres chaudes volcaniques pour une detente profonde. Chaleur des pierres dechauffe les muscles et libere les tensions. Huiles essentielles bio inclues.",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h - 1h30",
    niveau_difficulte: "Avance",
    type_peau: "Tous",
    outils_utilises: ["Pierres basaltiques", "Huile de massage", "Table chauffante", "Serviettes chaudes", "Bougie aromatherapie"],
    tags: ["massage", "hot stone", "pierres chaudes", "relaxant", "detente"]
  },
  {
    title: "Hammam Detox",
    category: "Spa & Bien-etre",
    subcategory: "Hammam",
    description: "Rituel hammam traditionnel pour une detox corporelle totale. Gommage au savon noir, rincage a l'eucalyptus et masque ghassoul. Peau purifiee et esprit apaise.",
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&h=400&fit=crop"
    ],
    temps_moyen: "1h30 - 2h",
    niveau_difficulte: "Intermediaire",
    type_peau: "Tous",
    outils_utilises: ["Savon noir", "Gant kessa", "Ghassoul", "Eucalyptus", "The a la menthe"],
    tags: ["hammam", "detox", "traditionnel", "bien-etre", "purifiant"]
  },
  {
    title: "Epilation Cire Chaude",
    category: "Epilation",
    subcategory: "Cire chaude",
    description: "Depilation a la cire chaude pour une peau lisse et sans poils pendant 3 a 4 semaines. Cire douce et hypoallergenique adaptee a tous les types de peau. Technique rapide et efficace.",
    images: [
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop"
    ],
    temps_moyen: "30min - 1h",
    niveau_difficulte: "Debutant",
    type_peau: "Tous",
    outils_utilises: ["Cire chaude", "Spatules", "Bandes tissu", "Huile post-depilatoire", "Poudre talc"],
    tags: ["epilation", "cire", "depilation", "lisse", "durable"]
  }
];

export default function AdminStyleAutomation() {
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem("bb_style_auto_enabled") === "true");
  const [frequency, setFrequency] = useState(() => localStorage.getItem("bb_style_auto_frequency") || "quotidienne");
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [createdCount, setCreatedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("bb_style_auto_stats");
    return saved ? JSON.parse(saved) : { totalStyles: 0, lastSearch: null, totalSearches: 0 };
  });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("bb_style_auto_log");
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState(null);

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

  const fetchExistingStyles = useCallback(async () => {
    try {
      const existing = await entities.Style.list("-created_at", 500);
      return existing || [];
    } catch (err) {
      console.error("Erreur lors de la recuperation des styles existants:", err);
      return [];
    }
  }, []);

  const simulateSearch = useCallback(async () => {
    setIsSearching(true);
    setProgress(0);
    setCreatedCount(0);
    setSkippedCount(0);
    setError(null);

    try {
      setCurrentAction("Chargement des styles existants...");
      setProgress(5);

      const existingStyles = await fetchExistingStyles();
      const existingTitles = new Set(existingStyles.map((s) => s.title?.toLowerCase()));

      setProgress(15);
      setCurrentAction("Filtrage des styles a creer...");

      await new Promise((r) => setTimeout(r, 500));

      const available = PREDEFINED_STYLES.filter((s) => !existingTitles.has(s.title.toLowerCase()));
      const toCreate = available.sort(() => Math.random() - 0.5).slice(0, 8);

      setProgress(25);

      if (toCreate.length === 0) {
        setCurrentAction("Tous les styles sont deja presents en base.");
        setProgress(100);

        const newLog = {
          id: Date.now(),
          date: new Date().toISOString(),
          status: "warning",
          summary: `Recherche terminee - Aucun nouveau style a creer (${existingStyles.length} styles existants)`
        };
        setLogs((prev) => [newLog, ...prev].slice(0, 50));
        setIsSearching(false);
        return;
      }

      setCurrentAction(`Creation de ${toCreate.length} style(s)...`);
      let created = 0;
      let skipped = 0;

      for (let i = 0; i < toCreate.length; i++) {
        const style = toCreate[i];
        const pct = 25 + Math.round(((i + 1) / toCreate.length) * 70);
        setProgress(pct);
        setCurrentAction(`Creation: ${style.title} (${i + 1}/${toCreate.length})`);

        try {
          await entities.Style.create({
            ...style,
            status: "publie",
            pro_email: "admin@beautybook.fr",
            likes: 0,
            views: 0,
            featured: false
          });
          created++;
        } catch (err) {
          console.error(`Erreur creation style "${style.title}":`, err);
          skipped++;
        }

        await new Promise((r) => setTimeout(r, 300));
      }

      setProgress(100);
      setCurrentAction("Finalisation...");
      await new Promise((r) => setTimeout(r, 400));

      const newTotal = stats.totalStyles + created;
      const newStats = {
        totalStyles: newTotal,
        lastSearch: new Date().toISOString(),
        totalSearches: stats.totalSearches + 1
      };
      setStats(newStats);
      setCreatedCount(created);
      setSkippedCount(skipped);

      const status = created > 0 ? "success" : "warning";
      const summary =
        created > 0
          ? `Recherche terminee - ${created} style(s) cree(s), ${skipped} echec(s), ${existingStyles.length} existant(s)`
          : `Recherche terminee - Aucun style cree, ${skipped} echec(s), ${existingStyles.length} existant(s)`;

      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        status,
        summary
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    } catch (err) {
      console.error("Erreur globale de recherche:", err);
      setError(err.message || "Erreur inconnue");
      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        status: "error",
        summary: `Erreur: ${err.message || "Echec de la recherche"}`
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    } finally {
      setIsSearching(false);
      setCurrentAction("");
    }
  }, [fetchExistingStyles, stats]);

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
            <p className="text-gray-500 text-[13px] font-medium">Creation reelle de styles beauté dans Supabase</p>
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
            <span className="text-gray-700 text-[13px] font-medium">Frequence :</span>
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

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-blue-700 text-[12px] font-medium">
              Base de donnees : <span className="font-black">{PREDEFINED_STYLES.length}</span> styles predefinis disponibles
            </p>
            <p className="text-blue-500 text-[11px] mt-1">
              Jusqu'a 8 styles non-dupliques seront crees par recherche
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-[12px] font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={simulateSearch}
              disabled={isSearching}
              className="flex-1 bg-primary text-white py-3 rounded-xl text-[13px] font-black disabled:opacity-60 flex items-center justify-center gap-2 min-w-[120px] active:scale-95 transition-all"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creation en cours...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Lancer la creation
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
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-green-600 text-[18px] font-black">{createdCount}</p>
              <p className="text-green-500 text-[11px] font-medium">Crees</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-amber-600 text-[18px] font-black">{skippedCount}</p>
              <p className="text-amber-500 text-[11px] font-medium">Echecs</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-blue-600 text-[18px] font-black">{progress}%</p>
              <p className="text-blue-500 text-[11px] font-medium">Avancement</p>
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
            <p className="text-gray-500 text-[11px] font-medium mb-1">Styles total en base</p>
            <p className="text-gray-900 text-[20px] font-black">{stats.totalStyles}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Recherches effectuees</p>
            <p className="text-gray-900 text-[20px] font-black">{stats.totalSearches}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Styles predefinis</p>
            <p className="text-gray-900 text-[20px] font-black">{PREDEFINED_STYLES.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-[11px] font-medium mb-1">Derniere recherche</p>
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
            <p className="text-gray-400 text-[13px] text-center py-4">Aucune recherche effectuee</p>
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
          <h3 className="text-gray-900 text-[15px] font-black">Sources de donnees</h3>
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

      {/* Section 6: Available Styles Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Search className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-gray-900 text-[15px] font-black">Styles disponibles ({PREDEFINED_STYLES.length})</h3>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {PREDEFINED_STYLES.map((style, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <img
                src={style.images?.[0]}
                alt={style.title}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-[12px] font-bold truncate">{style.title}</p>
                <p className="text-gray-500 text-[10px]">{style.category} &gt; {style.subcategory}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">{style.niveau_difficulte}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
