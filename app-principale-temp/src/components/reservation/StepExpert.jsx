import { ArrowLeft } from "lucide-react";

const PROFILE_IMG = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=80";
const EXPERTS = [
  {
    id: null,
    name: "Sans préférence",
    subtitle: "Nous choisirons le premier expert disponible pour vous.",
    avatar: null,
    isAny: true,
  },
  {
    id: 1,
    name: "Sophie Martin",
    subtitle: "Spécialiste soins visage · 5 ans d'expérience",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 2,
    name: "Camille Dubois",
    subtitle: "Expert massage & bien-être · 7 ans d'expérience",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=80",
    rating: 4.8,
    reviews: 95,
  },
  {
    id: 3,
    name: "Léa Fontaine",
    subtitle: "Coloriste & styliste · 4 ans d'expérience",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80",
    rating: 5.0,
    reviews: 67,
  },
];

export default function StepExpert({ selected, onSelect, onNext, onBack, proProfile }) {
  const current = selected ?? EXPERTS[0];

  const handleSelect = (expert) => {
    onSelect(expert);
    onNext();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div className="flex items-center gap-2">
          {(proProfile?.avatar_url || PROFILE_IMG) && (
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-primary shrink-0">
              <img src={proProfile?.avatar_url || PROFILE_IMG} alt={proProfile?.salon_name || ""} className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
            {proProfile?.salon_name || "Réservation"}
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Title */}
      <div className="px-5 pb-8">
        <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-2">Étape 02 · Réservation</p>
        <h1 className="text-[42px] font-black text-gray-900 leading-tight">Choix de<br />l'Expert</h1>
        <p className="text-[13px] text-gray-400 font-medium mt-2 leading-relaxed max-w-[300px]">
          Sélectionnez le talent qui saura sublimer votre beauté naturelle. Nos experts sont formés aux rituels Aura Luxe les plus prestigieux.
        </p>
      </div>

      {/* Expert list */}
      <div className="flex-1 px-5 space-y-3">
        {EXPERTS.map(expert => {
          const isSelected = current?.id === expert.id;
          return (
            <button
              key={expert.id ?? "any"}
              onClick={() => handleSelect(expert)}
              className="w-full flex items-center gap-4 bg-white border-2 rounded-3xl px-4 py-5 active:scale-[0.99] transition-all text-left"
              style={{ borderColor: isSelected ? "#E8732A" : "#f0f0f0" }}
            >
              {/* Avatar */}
              {expert.isAny ? (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#E8732A" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2" style={{ borderColor: isSelected ? "#E8732A" : "transparent" }}>
                  <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-black text-gray-900">{expert.name}</p>
                <p className="text-[12px] text-gray-400 font-medium leading-snug mt-0.5">{expert.subtitle}</p>
                {expert.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] font-black text-primary">★ {expert.rating}</span>
                    <span className="text-[11px] text-gray-400 font-medium">({expert.reviews} avis)</span>
                  </div>
                )}
              </div>

              {/* Radio */}
              <div
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{ borderColor: isSelected ? "#E8732A" : "#d1d5db" }}
              >
                {isSelected && <div className="w-3 h-3 rounded-full" style={{ background: "#E8732A" }} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="h-20" />
    </div>
  );
}