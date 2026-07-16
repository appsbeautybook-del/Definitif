import { useState, useEffect } from "react";
import { MapPin, RefreshCw, ExternalLink } from "lucide-react";

const VTC_PROVIDERS = [
  {
    id: "uber",
    name: "Uber",
    logo: null,
    logoBg: "bg-black",
    logoText: "Uber",
    logoTextColor: "text-white",
    basePrice: 11,
    baseDuration: 17,
    deepLink: "https://m.uber.com/",
    color: "#000000",
  },
  {
    id: "bolt",
    name: "Bolt",
    logo: null,
    logoBg: "bg-[#34D186]",
    logoText: "Bolt",
    logoTextColor: "text-white",
    basePrice: 10,
    baseDuration: 15,
    deepLink: "https://bolt.eu/",
    color: "#34D186",
  },
  {
    id: "freenow",
    name: "FREE NOW",
    logo: null,
    logoBg: "bg-[#E30613]",
    logoText: "F",
    logoTextColor: "text-white",
    basePrice: 11,
    baseDuration: 17,
    deepLink: "https://free-now.com/",
    color: "#E30613",
  },
  {
    id: "heetch",
    name: "Heetch",
    logo: null,
    logoBg: "bg-[#E91E8C]",
    logoText: "H",
    logoTextColor: "text-white",
    basePrice: 9,
    baseDuration: 18,
    deepLink: "https://www.heetch.com/",
    color: "#E91E8C",
  },
  {
    id: "lecab",
    name: "Le Cab",
    logo: null,
    logoBg: "bg-gray-900",
    logoText: "LC",
    logoTextColor: "text-white",
    basePrice: 14,
    baseDuration: 12,
    deepLink: "https://www.lecab.fr/",
    color: "#1a1a2e",
  },
  {
    id: "g7",
    name: "Taxi G7",
    logo: null,
    logoBg: "bg-[#FFD700]",
    logoText: "G7",
    logoTextColor: "text-gray-900",
    basePrice: 13,
    baseDuration: 20,
    deepLink: "https://www.g7.fr/",
    color: "#FFD700",
  },
];

// Simule une légère variation de prix (surge pricing réaliste)
function getEstimatedPrice(base) {
  const surge = Math.random() > 0.7 ? 1.3 : 1;
  return Math.round(base * surge);
}

function getEstimatedDuration(base) {
  const variation = Math.floor(Math.random() * 6) - 3;
  return Math.max(5, base + variation);
}

export default function VTCSection() {
  const [prices, setPrices] = useState(() =>
    VTC_PROVIDERS.map(p => ({
      id: p.id,
      price: p.basePrice,
      duration: p.baseDuration,
      surge: false,
    }))
  );
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setPrices(VTC_PROVIDERS.map(p => {
        const newPrice = getEstimatedPrice(p.basePrice);
        return {
          id: p.id,
          price: newPrice,
          duration: getEstimatedDuration(p.baseDuration),
          surge: newPrice > p.basePrice * 1.2,
        };
      }));
      setLastUpdate(new Date());
      setRefreshing(false);
    }, 800);
  };

  // Auto-refresh toutes les 60s
  useEffect(() => {
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-blue-500 rounded-full" />
          <span className="text-[16px] font-black text-gray-900">VTC & Taxis</span>
          <span className="bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">LIVE</span>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest active:scale-95 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-500" : ""}`} />
          {refreshing ? "..." : timeStr}
        </button>
      </div>

      {/* Location hint */}
      <div className="flex items-center gap-2 mb-3 bg-blue-50 rounded-2xl px-3 py-2">
        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <p className="text-[11px] font-medium text-blue-700">Estimations depuis votre position actuelle</p>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        {VTC_PROVIDERS.map((provider, i) => {
          const pData = prices.find(p => p.id === provider.id) || { price: provider.basePrice, duration: provider.baseDuration, surge: false };
          const isLast = i === VTC_PROVIDERS.length - 1;

          return (
            <a
              key={provider.id}
              href={provider.deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 px-4 py-4 active:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}
            >
              {/* Logo */}
              <div className={`w-12 h-12 ${provider.logoBg} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
                <span className={`${provider.logoTextColor} text-[12px] font-black`}>{provider.logoText}</span>
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className="text-[15px] font-black text-gray-900">{provider.name}</p>
                {pData.surge && (
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Forte demande</span>
                )}
              </div>

              {/* Price + Duration */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[15px] font-black ${pData.surge ? "text-orange-500" : "text-blue-500"}`}>
                  {pData.price}€+
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-[15px] font-black text-gray-700">~{pData.duration}</span>
                <span className="text-[12px] font-bold text-gray-400">min</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 ml-1" />
              </div>
            </a>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 font-medium mt-2 text-center">
        Tarifs estimatifs • Ouvrez l'app pour confirmer le prix exact
      </p>
    </div>
  );
}