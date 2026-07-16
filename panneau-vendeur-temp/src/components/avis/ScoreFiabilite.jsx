import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

export default function ScoreFiabilite({ userEmail }) {
  const [score, setScore] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userEmail) return;
    entities.Avis.filter({ type: "pro_to_client", cible_email: userEmail }, "-created_at", 100)
      .then((avis) => {
        if (avis.length === 0) return;
        const avg = avis.reduce((s, a) => s + a.note, 0) / avis.length;
        setScore(avg);
        setCount(avis.length);
      })
      .catch(() => {});
  }, [userEmail]);

  if (score === null) return null;

  const pct = Math.round((score / 5) * 100);
  const getConfig = () => {
    if (score >= 4.5) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100", ring: "bg-green-500", Icon: ShieldCheck };
    if (score >= 3.5) return { label: "Fiable", color: "text-blue-600", bg: "bg-blue-100", ring: "bg-blue-500", Icon: ShieldCheck };
    if (score >= 2.5) return { label: "Moyen", color: "text-amber-600", bg: "bg-amber-100", ring: "bg-amber-500", Icon: Shield };
    return { label: "Peu fiable", color: "text-red-600", bg: "bg-red-100", ring: "bg-red-500", Icon: ShieldAlert };
  };

  const { label, color, bg, ring, Icon } = getConfig();

  return (
    <div className={`flex items-center gap-3 ${bg} rounded-2xl px-4 py-3`}>
      <div className="relative w-11 h-11 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15" fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 94.2} 94.2`}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {score >= 4.5 ? <ShieldCheck className={`w-4 h-4 ${color}`} /> : score >= 2.5 ? <Shield className={`w-4 h-4 ${color}`} /> : <ShieldAlert className={`w-4 h-4 ${color}`} />}
        </div>
      </div>
      <div>
        <p className={`text-[13px] font-black ${color}`}>{label}</p>
        <p className="text-[11px] text-gray-500 font-medium">Score fiabilité · {count} avis pro</p>
      </div>
      <div className="ml-auto text-right">
        <p className={`text-[20px] font-black ${color} leading-none`}>{score.toFixed(1)}</p>
        <p className="text-[10px] text-gray-400 font-medium">/ 5</p>
      </div>
    </div>
  );
}