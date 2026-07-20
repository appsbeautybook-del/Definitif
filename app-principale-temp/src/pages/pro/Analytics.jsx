import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { RefreshCw, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const periods = ["7J", "30J", "90J"];

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30J");
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    entities.Reservation.filter({ pro_email: user.email }, "-date", 1000)
      .then(data => setReservations(data || []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, [user]);

  const periodDays = period === "7J" ? 7 : period === "30J" ? 30 : 90;
  const since = startOfDay(subDays(new Date(), periodDays));
  const sincePrev = startOfDay(subDays(new Date(), periodDays * 2));

  const inPeriod = reservations.filter(r => r.date && new Date(r.date) >= since);
  const inPrevPeriod = reservations.filter(r => r.date && new Date(r.date) >= sincePrev && new Date(r.date) < since);

  const revenue = inPeriod.filter(r => r.status === "termine").reduce((s, r) => s + (r.total_price || r.service_price || 0), 0);
  const revenuePrev = inPrevPeriod.filter(r => r.status === "termine").reduce((s, r) => s + (r.total_price || r.service_price || 0), 0);
  const revenuePct = revenuePrev > 0 ? Math.round(((revenue - revenuePrev) / revenuePrev) * 100) : revenue > 0 ? 100 : 0;

  // Clients actifs (uniques) dans la période
  const clientsActive = new Set(inPeriod.filter(r => r.status !== "annule").map(r => r.client_email)).size;

  // Meilleur service
  const serviceCount = {};
  const serviceRevenue = {};
  inPeriod.filter(r => r.status === "termine").forEach(r => {
    if (!r.service_name) return;
    serviceCount[r.service_name] = (serviceCount[r.service_name] || 0) + 1;
    serviceRevenue[r.service_name] = (serviceRevenue[r.service_name] || 0) + (r.total_price || r.service_price || 0);
  });
  const bestService = Object.keys(serviceCount).sort((a, b) => serviceCount[b] - serviceCount[a])[0] || null;
  const bestServicePct = bestService && revenue > 0 ? Math.round((serviceRevenue[bestService] / revenue) * 100) : 0;

  // Taux de rétention (clients qui ont eu des RDV avant ET dans la période)
  const clientsInPeriod = new Set(inPeriod.filter(r => r.status !== "annule").map(r => r.client_email));
  const clientsBefore = new Set(reservations.filter(r => r.date && new Date(r.date) < since && r.status !== "annule").map(r => r.client_email));
  const retained = [...clientsInPeriod].filter(e => clientsBefore.has(e)).length;
  const retentionRate = clientsInPeriod.size > 0 ? Math.round((retained / clientsInPeriod.size) * 100) : 0;

  // Graphique sur les 7 derniers jours
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, "yyyy-MM-dd");
    const dayLabel = format(day, "EEE").toUpperCase().slice(0, 3);
    const revenu = reservations
      .filter(r => r.date === dayStr && r.status === "termine")
      .reduce((s, r) => s + (r.total_price || r.service_price || 0), 0);
    return { day: dayLabel, revenu };
  });

  // Services populaires
  const popularServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count, revenue: serviceRevenue[name] || 0 }));

  if (loading) {
    return (
      <div className="font-display min-h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="font-display min-h-full bg-white">
      <PageHeader title="Analytics" subtitle="Données & Analyses" backTo="/profil-pro" />

      <div className="px-5 pt-5 pb-10 space-y-5">
        <div>
          <h1 className="text-[30px] font-black text-gray-900 leading-tight">Données<br />& Analyses</h1>
          <p className="text-[13px] text-gray-400 font-medium mt-1">Suivez votre croissance professionnelle.</p>
        </div>

        {/* Period + Export */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-2xl border-2 border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-widest">
            Exporter
          </button>
          <div className="flex items-center bg-gray-100 rounded-2xl p-1">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[12px] font-black uppercase transition-all ${
                  period === p ? "bg-primary text-white shadow-sm" : "text-gray-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Revenu {period}</p>
          <p className="text-[44px] font-black text-gray-900 leading-none">{revenue} €</p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-[12px] ${revenuePct >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {revenuePct >= 0 ? "↗" : "↘"}
            </span>
            <span className={`text-[12px] font-bold ${revenuePct >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {revenuePct >= 0 ? "+" : ""}{revenuePct}% vs période précédente
            </span>
          </div>
        </div>

        {/* Clients Actifs + Meilleure Perf */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Clients Actifs</p>
            <p className="text-[40px] font-black text-gray-900 leading-none mb-2">{clientsActive}</p>
            <p className="text-[11px] text-gray-400 font-medium">{period}</p>
          </div>
          <div className="bg-[#1a2035] rounded-3xl p-4 shadow-sm">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Meilleure Performance</p>
            <p className="text-[18px] font-black text-white leading-none mb-1 truncate">{bestService || "N/A"}</p>
            <p className="text-[11px] text-gray-400 font-medium mb-2">{bestServicePct}% du volume total</p>
            <div className="h-1 bg-white/10 rounded-full">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${bestServicePct}%` }} />
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <h3 className="text-[16px] font-black text-gray-900 mb-1">Tendances (7 derniers jours)</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revenu</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 11 }} formatter={(v) => [`${v} €`, "Revenu"]} />
              <Line type="monotone" dataKey="revenu" stroke="hsl(28,90%,55%)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Services Populaires */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <h3 className="text-[16px] font-black text-gray-900 mb-3">Services Populaires</h3>
          {popularServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <span className="text-gray-200 text-4xl">📊</span>
              <p className="text-[12px] text-gray-400 font-medium">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
              {popularServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-black text-gray-900 truncate">{s.name}</p>
                    <div className="h-1 bg-gray-100 rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${revenue > 0 ? Math.round((s.revenue / revenue) * 100) : 0}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black text-primary">{s.revenue}€</p>
                    <p className="text-[9px] text-gray-400">{s.count} rdv</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rétention */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[14px] font-black text-gray-900">Indice de Rétention</h4>
            <button onClick={() => { setLoading(true); entities.Reservation.filter({ pro_email: user?.email }, "-date", 1000).then(d => setReservations(d || [])).finally(() => setLoading(false)); }} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mb-2">Clients qui reviennent</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[36px] font-black text-gray-900 leading-none">{retentionRate}%</span>
            <span className="text-[14px] font-black text-gray-400">{retained} clients</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mt-3">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${retentionRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}