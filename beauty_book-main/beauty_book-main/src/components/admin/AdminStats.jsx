import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApiClient";
import {
  Video, Users, Scissors, ShoppingBag, CalendarCheck, Radio,
  Palette, TrendingUp, Heart, Star, Building2, Package, Crown, Flame
} from "lucide-react";

function StatCard({ icon: Icon, label, value, subtitle, color = "primary" }) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    teal: "bg-teal-100 text-teal-600",
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-gray-500 text-[12px] font-medium">{label}</p>
        <p className="text-gray-900 text-[22px] font-black leading-tight">{value ?? "–"}</p>
        {subtitle && <p className="text-gray-400 text-[11px]">{subtitle}</p>}
      </div>
    </div>
  );
}

function TopItem({ rank, name, value, label, img }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-[18px] w-6 text-center shrink-0">{medals[rank] || `${rank + 1}.`}</span>
      {img && <img src={img} alt={name} className="w-9 h-9 rounded-xl object-cover shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-gray-900 truncate">{name}</p>
      </div>
      <span className="text-[12px] font-black text-primary shrink-0">{value} {label}</span>
    </div>
  );
}

function RankingCard({ title, icon: Icon, color, items, valueKey, label }) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    amber: "text-amber-600 bg-amber-100",
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-[14px] font-black text-gray-900">{title}</h3>
      </div>
      {items.length === 0
        ? <p className="text-gray-400 text-[12px] text-center py-4">Pas encore de données</p>
        : items.slice(0, 5).map((item, i) => (
          <TopItem
            key={item.id || i}
            rank={i}
            name={item.title || item.name || item.salon_name || "–"}
            value={item[valueKey] || 0}
            label={label}
            img={item.image_url || item.img || null}
          />
        ))
      }
    </div>
  );
}

export default function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [topStyles, setTopStyles] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [topSalons, setTopSalons] = useState([]);
  const [topProduits, setTopProduits] = useState([]);
  const [liveCount, setLiveCount] = useState(0);
  const [commandesStats, setCommandesStats] = useState({ total: 0, pending: 0, ca: 0 });
  const [reservationsStats, setReservationsStats] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, reelsRes, stylesRes, servicesRes, produitsRes, commandesRes, reservationsRes, livesRes, salonsRes] = await Promise.all([
          adminApi.listUsers().catch(() => []),
          adminApi.listReels().catch(() => []),
          adminApi.listStyles().catch(() => []),
          adminApi.listServices().catch(() => []),
          adminApi.listProduits().catch(() => []),
          adminApi.listCommandes().catch(() => []),
          adminApi.listReservations().catch(() => []),
          adminApi.listLives().catch(() => []),
          adminApi.listProfilsPro().catch(() => []),
        ]);

        const users = usersRes || [];
        const reels = reelsRes || [];
        const styles = stylesRes || [];
        const services = servicesRes || [];
        const produits = produitsRes || [];
        const commandes = commandesRes || [];
        const reservations = reservationsRes || [];
        const lives = livesRes || [];
        const salons = salonsRes || [];

        setCounts({
          users: users.length,
          reels: reels.length,
          styles: styles.length,
          services: services.length,
          produits: produits.length,
        });

        setTopStyles(styles.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5));
        setTopServices(services.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5));
        setTopSalons(salons.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5));
        setTopProduits(produits.sort((a, b) => (b.stock !== undefined ? (b.stock === 0 ? 1 : 0) : 0) - 0).slice(0, 5));
        setLiveCount(lives.length);

        const pendingCmds = commandes.filter(c => c.status === "en_attente");
        const ca = commandes.filter(c => c.status !== "annule" && c.status !== "rembourse")
          .reduce((s, c) => s + (c.total || 0), 0);
        setCommandesStats({ total: commandes.length, pending: pendingCmds.length, ca: Math.round(ca) });

        const pendingRdv = reservations.filter(r => r.status === "en_attente");
        setReservationsStats({ total: reservations.length, pending: pendingRdv.length });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div>
        <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3">Vue Globale</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Utilisateurs" value={counts.users} color="blue" />
          <StatCard icon={Video} label="Publications" value={counts.reels} color="primary" />
          <StatCard icon={Palette} label="Styles publiés" value={counts.styles} color="purple" />
          <StatCard icon={Radio} label="Lives en cours" value={liveCount} color="red" />
        </div>
      </div>

      <div>
        <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3">Business</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag} label="Commandes" value={commandesStats.total} subtitle={`${commandesStats.pending} en attente`} color="amber" />
          <StatCard icon={TrendingUp} label="CA estimé" value={`${commandesStats.ca}€`} color="green" />
          <StatCard icon={CalendarCheck} label="Réservations" value={reservationsStats.total} subtitle={`${reservationsStats.pending} en attente`} color="teal" />
          <StatCard icon={Scissors} label="Services actifs" value={counts.services} color="green" />
        </div>
      </div>

      {/* Tops */}
      <div>
        <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3">Classements & Tendances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RankingCard title="Styles les plus likés" icon={Heart} color="primary" items={topStyles} valueKey="likes" label="❤️" />
          <RankingCard title="Salons les mieux notés" icon={Star} color="amber" items={topSalons} valueKey="rating" label="★" />
          <RankingCard title="Services populaires" icon={Scissors} color="green" items={topServices} valueKey="views" label="vues" />
          <RankingCard title="Produits en boutique" icon={Package} color="blue" items={topProduits} valueKey="price" label="€" />
        </div>
      </div>

      <p className="text-gray-400 text-[11px] text-center pt-2">Données en temps réel depuis la base BeautyBook</p>
    </div>
  );
}