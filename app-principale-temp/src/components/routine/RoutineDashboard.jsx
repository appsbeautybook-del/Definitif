import { useState, useEffect } from "react";
import { X, Check, Flame, Target, ChevronRight, Trash2, Loader2, Play, Pause, Calendar } from "lucide-react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

function ProgressBar({ value, max, color = "bg-primary" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function RoutineCard({ routine, onComplete, onToggleStatus, onDelete }) {
  const [completing, setCompleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState(routine.tasks || []);

  const pct = routine.sessions_total > 0
    ? Math.min(100, Math.round((routine.sessions_faites / routine.sessions_total) * 100))
    : 0;

  const today = new Date().toISOString().slice(0, 10);
  const alreadyDoneToday = routine.last_done_date === today;

  const handleComplete = async () => {
    if (alreadyDoneToday || completing) return;
    setCompleting(true);
    const newFaites = (routine.sessions_faites || 0) + 1;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const newStreak = routine.last_done_date === yesterdayStr ? (routine.streak || 0) + 1 : 1;

    await entities.RoutineBeaute.update(routine.id, {
      sessions_faites: newFaites,
      last_done_date: today,
      streak: newStreak,
    });
    onComplete(routine.id, { sessions_faites: newFaites, last_done_date: today, streak: newStreak });
    setCompleting(false);
  };

  const toggleTask = async (taskId) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    setTasks(updated);
    await entities.RoutineBeaute.update(routine.id, { tasks: updated });
  };

  const colorMap = {
    "bg-blue-100": "text-blue-700",
    "bg-pink-100": "text-pink-700",
    "bg-purple-100": "text-purple-700",
    "bg-green-100": "text-green-700",
    "bg-orange-100": "text-orange-700",
    "bg-yellow-100": "text-yellow-700",
  };
  const textColor = colorMap[routine.color] || "text-gray-700";

  const downloadRoutineICS = () => {
    const startDate = routine.objectif_debut ? new Date(routine.objectif_debut) : new Date();
    const weeks = routine.objectif_duree_semaines || 8;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + weeks * 7);

    let targetDays = [];
    if (routine.frequency === "quotidien") targetDays = [0,1,2,3,4,5,6];
    else if (routine.days_of_week?.length > 0) targetDays = routine.days_of_week;
    else targetDays = [1];

    const timeParts = (routine.time || "09:00").split(":");
    const hours = parseInt(timeParts[0]) || 9;
    const minutes = parseInt(timeParts[1]) || 0;
    const duration = routine.duration_min || 20;

    let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//BeautyBook//Routine//FR\r\nCALSCALE:GREGORIAN\r\n";

    const cur = new Date(startDate);
    while (cur <= endDate) {
      if (targetDays.includes(cur.getDay())) {
        const dt = new Date(cur);
        dt.setHours(hours, minutes, 0, 0);
        const dtEnd = new Date(dt);
        dtEnd.setMinutes(dtEnd.getMinutes() + duration);

        const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        const uid = `routine-${routine.id}-${dt.toISOString().slice(0,10)}@beautybook`;

        ics += "BEGIN:VEVENT\r\n";
        ics += `UID:${uid}\r\n`;
        ics += `DTSTART:${fmt(dt)}\r\n`;
        ics += `DTEND:${fmt(dtEnd)}\r\n`;
        ics += `SUMMARY:${routine.emoji || "✨"} ${routine.name}\r\n`;
        ics += `DESCRIPTION:${routine.description || routine.objectif || ""}\r\n`;
        ics += "RRULE:FREQ=WEEKLY;COUNT=" + (weeks * targetDays.length) + "\r\n";
        ics += "END:VEVENT\r\n";
      }
      cur.setDate(cur.getDate() + 1);
    }

    ics += "END:VCALENDAR\r\n";

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `routine-${routine.name.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${routine.color || "bg-blue-100"} rounded-3xl overflow-hidden`}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[28px]">{routine.emoji || "✨"}</span>
            <div>
              <p className="text-[16px] font-black text-gray-900 leading-tight">{routine.name}</p>
              <p className="text-[11px] text-gray-500 font-medium">{routine.time} · {routine.duration_min} min</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {routine.streak > 1 && (
              <div className="flex items-center gap-1 bg-white/70 rounded-full px-2.5 py-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[11px] font-black text-gray-700">{routine.streak}</span>
              </div>
            )}
            <button onClick={() => onToggleStatus(routine)}
              className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center active:scale-95">
              {routine.status === "active" ? <Pause className="w-3.5 h-3.5 text-gray-500" /> : <Play className="w-3.5 h-3.5 text-green-500" />}
            </button>
            <button onClick={() => onDelete(routine.id)}
              className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center active:scale-95">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Progression objectif */}
        {routine.objectif && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-gray-500" />
                <p className="text-[11px] font-black text-gray-600 truncate max-w-[200px]">{routine.objectif}</p>
              </div>
              <span className={`text-[11px] font-black ${textColor}`}>{pct}%</span>
            </div>
            <ProgressBar value={routine.sessions_faites || 0} max={routine.sessions_total || 1} />
            <p className="text-[10px] text-gray-500 font-medium mt-1">
              {routine.sessions_faites || 0}/{routine.sessions_total || 0} séances · {Math.ceil(((routine.sessions_total || 0) - (routine.sessions_faites || 0)) / 7)} sem. restantes
            </p>
          </div>
        )}
      </div>

      {/* Tâches expandable */}
      {tasks.length > 0 && (
        <div className="px-4 pb-2">
          <button onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 text-[11px] font-black text-gray-500 uppercase tracking-widest">
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
            {tasks.filter(t => t.done).length}/{tasks.length} tâches
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5">
              {tasks.map(t => (
                <button key={t.id} onClick={() => toggleTask(t.id)}
                  className={`w-full flex items-center gap-2.5 bg-white/60 rounded-xl px-3 py-2 text-left active:scale-[0.99] transition-all`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${t.done ? "bg-primary border-primary" : "border-gray-300"}`}>
                    {t.done && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-[13px] font-medium ${t.done ? "text-gray-400 line-through" : "text-gray-800"}`}>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bouton Valider */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={handleComplete}
          disabled={alreadyDoneToday || completing || routine.status !== "active"}
          className={`w-full py-3 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
            alreadyDoneToday
              ? "bg-green-500 text-white cursor-default"
              : routine.status !== "active"
              ? "bg-white/50 text-gray-400 cursor-not-allowed"
              : "bg-white text-primary shadow-sm active:shadow-none"
          }`}
        >
          {completing ? <Loader2 className="w-4 h-4 animate-spin" />
            : alreadyDoneToday ? <><Check className="w-4 h-4" /> Fait aujourd'hui ✓</>
            : "✓ Valider cette séance"}
        </button>
        <button
          onClick={downloadRoutineICS}
          className="w-full mt-2 py-2.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 bg-white/40 text-gray-600 active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
          Ajouter au calendrier
        </button>
      </div>
    </div>
  );
}

export default function RoutineDashboard({ onClose }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => data?.user).then(user => {
      if (!user) { setLoading(false); return; }
      entities.RoutineBeaute.filter({ user_email: user.email }, "-created_at", 50)
        .then(setRoutines).catch(() => {}).finally(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  const handleComplete = (id, updates) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleToggleStatus = async (routine) => {
    const newStatus = routine.status === "active" ? "pause" : "active";
    await entities.RoutineBeaute.update(routine.id, { status: newStatus });
    setRoutines(prev => prev.map(r => r.id === routine.id ? { ...r, status: newStatus } : r));
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette routine ?")) return;
    await entities.RoutineBeaute.delete(id);
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const active = routines.filter(r => r.status === "active");
  const paused = routines.filter(r => r.status === "pause");

  // Stats globales
  const totalStreak = active.reduce((s, r) => Math.max(s, r.streak || 0), 0);
  const totalDone = routines.reduce((s, r) => s + (r.sessions_faites || 0), 0);
  const avgPct = routines.length > 0
    ? Math.round(routines.reduce((s, r) => s + (r.sessions_total > 0 ? (r.sessions_faites / r.sessions_total) * 100 : 0), 0) / routines.length)
    : 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#f5f5f5] w-full rounded-t-3xl z-10 max-h-[92vh] flex flex-col">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#f5f5f5] shrink-0">
          <div>
            <h2 className="text-[20px] font-black text-gray-900">Mes Routines</h2>
            <p className="text-[11px] font-medium text-gray-500">{active.length} active{active.length > 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Mini stats */}
        {routines.length > 0 && (
          <div className="flex gap-3 px-5 pb-3 shrink-0">
            <div className="flex-1 bg-white rounded-2xl px-3 py-3 text-center shadow-sm border border-gray-100">
              <p className="text-[22px] font-black text-primary leading-none">{totalStreak}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Streak 🔥</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl px-3 py-3 text-center shadow-sm border border-gray-100">
              <p className="text-[22px] font-black text-gray-900 leading-none">{totalDone}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Séances ✅</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl px-3 py-3 text-center shadow-sm border border-gray-100">
              <p className="text-[22px] font-black text-green-600 leading-none">{avgPct}%</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Progression</p>
            </div>
          </div>
        )}

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : routines.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <span className="text-[48px]">🌸</span>
              <p className="text-[16px] font-black text-gray-700">Aucune routine créée</p>
              <p className="text-[13px] text-gray-400 font-medium">Appuyez sur <strong>+</strong> pour créer votre première routine beauté.</p>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div className="space-y-3">
                  {active.map(r => (
                    <RoutineCard key={r.id} routine={r}
                      onComplete={handleComplete}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete} />
                  ))}
                </div>
              )}
              {paused.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">En pause</p>
                  <div className="space-y-3 opacity-60">
                    {paused.map(r => (
                      <RoutineCard key={r.id} routine={r}
                        onComplete={handleComplete}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}