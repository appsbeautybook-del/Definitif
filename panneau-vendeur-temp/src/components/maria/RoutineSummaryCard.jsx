import { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

export default function RoutineSummaryCard({ data, onCreated, onDismiss }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    const user = await supabase.auth.getUser().then(({ data }) => data?.user).catch(() => null);
    if (!user) { setSaving(false); return; }

    const weeks = 8;
    const daysPerWeek = data.frequency === "quotidien" ? 7 : (data.days_of_week?.length || 5);
    const sessions_total = weeks * daysPerWeek;

    const tasks = (data.tasks || []).map((t, i) => ({
      id: String(Date.now() + i),
      label: typeof t === "string" ? t : t.label,
      done: false,
    }));

    const routine = await entities.RoutineBeaute.create({
      user_email: user.email,
      name: data.name,
      emoji: data.emoji || "✨",
      color: data.color || "bg-blue-100",
      description: data.description || "",
      frequency: data.frequency || "quotidien",
      days_of_week: data.days_of_week || [1, 2, 3, 4, 5],
      time: data.time || "08:00",
      duration_min: data.duration_min || 20,
      tasks,
      objectif: data.objectif || "",
      objectif_duree_semaines: 8,
      objectif_debut: new Date().toISOString().slice(0, 10),
      reminder_active: true,
      sessions_total,
      sessions_faites: 0,
      streak: 0,
      status: "active",
    });
    setDone(true);
    setSaving(false);
    onCreated?.(routine);
  };

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-2 flex items-center gap-3">
        <Check className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-[13px] font-black text-green-700">Routine <strong>{data.name}</strong> créée ! ✨</p>
      </div>
    );
  }

  return (
    <div className={`${data.color || "bg-blue-100"} rounded-2xl p-4 mt-2`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-black text-primary uppercase tracking-widest">Nouvelle routine</span>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="w-6 h-6 bg-white/60 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-[28px]">{data.emoji || "✨"}</span>
        <div>
          <p className="text-[16px] font-black text-gray-900">{data.name}</p>
          <p className="text-[11px] text-gray-600 font-medium">{data.time} · {data.duration_min} min · {data.frequency}</p>
        </div>
      </div>

      {data.description && (
        <p className="text-[12px] text-gray-600 font-medium mb-3 leading-relaxed">{data.description}</p>
      )}

      {data.tasks?.length > 0 && (
        <div className="space-y-1 mb-3">
          {data.tasks.slice(0, 4).map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white/60 flex items-center justify-center shrink-0">
                <span className="text-[8px] font-black text-primary">{i + 1}</span>
              </div>
              <p className="text-[12px] font-medium text-gray-700">{typeof t === "string" ? t : t.label}</p>
            </div>
          ))}
          {data.tasks.length > 4 && (
            <p className="text-[10px] text-gray-500 font-medium ml-6">+{data.tasks.length - 4} autres étapes</p>
          )}
        </div>
      )}

      {data.objectif && (
        <p className="text-[11px] font-black text-primary mb-3">🎯 {data.objectif}</p>
      )}

      <button
        onClick={handleCreate}
        disabled={saving}
        className="w-full bg-white text-primary py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {saving ? "Création..." : "Créer cette routine ✨"}
      </button>
    </div>
  );
}