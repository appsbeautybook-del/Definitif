import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { apiClient } from '@/lib/apiClient';
import { useState, useEffect, useRef } from "react";
import {
  Plus, X, Search, ChevronRight, Lightbulb, Rocket,
  Scissors, Users, Clock, Megaphone, TrendingUp, UserPlus,
  MoreVertical, Calendar, CheckCircle, ArrowLeft, Phone,
  Mail, Download, ChevronLeft, ChevronDown, Star, MapPin,
  AlertCircle, Loader2, KeyRound
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildWeek(baseDate) {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// ── RDV Detail Modal ──────────────────────────────────────────────────────────
function RdvDetailModal({ rdv, onClose, onUpdateStatus, proEmail }) {
  const [loading, setLoading] = useState(false);
  const [codeInput, setCodeInput] = useState(["", "", "", ""]);
  const [codeError, setCodeError] = useState(false);
  const codeRefs = [useRef(), useRef(), useRef(), useRef()];

  const statusColors = {
    en_attente: "bg-orange-100 text-orange-600",
    confirme: "bg-green-100 text-green-600",
    annule: "bg-red-100 text-red-500",
    termine: "bg-gray-100 text-gray-500",
    no_show: "bg-red-50 text-red-400",
  };
  const statusLabels = {
    en_attente: "En attente",
    confirme: "Confirmé",
    annule: "Annulé",
    termine: "Terminé",
    no_show: "No Show",
  };

  const handleStatus = async (status) => {
    setLoading(true);
    if (status === "termine") {
      await apiClient.callFunction("completeReservation", { reservation_id: rdv.id }).catch(async () => {
        await entities.Reservation.update(rdv.id, { status });
      });
    } else {
      await entities.Reservation.update(rdv.id, { status });
    }
    onUpdateStatus(rdv.id, status);
    setLoading(false);
    onClose();
  };

  const handleCodeDigit = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...codeInput];
    next[idx] = val;
    setCodeInput(next);
    setCodeError(false);
    if (val && idx < 3) codeRefs[idx + 1].current?.focus();
  };

  const handleCodeKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !codeInput[idx] && idx > 0) {
      codeRefs[idx - 1].current?.focus();
    }
  };

  const handleValidateCode = async () => {
    const entered = codeInput.join("");
    const expected = rdv.crg_code;
    if (!expected || entered !== expected) {
      setCodeError(true);
      setCodeInput(["", "", "", ""]);
      codeRefs[0].current?.focus();
      return;
    }
    await handleStatus("termine");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full rounded-t-3xl px-5 pt-4 pb-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-black text-gray-900">Détail du RDV</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Status badge */}
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-4 ${statusColors[rdv.status] || "bg-gray-100 text-gray-500"}`}>
          {statusLabels[rdv.status] || rdv.status}
        </div>

        {/* Client */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-3">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Client</p>
          <p className="text-[18px] font-black text-gray-900">{rdv.client_name}</p>
          <p className="text-[12px] text-gray-400 font-medium">{rdv.client_email}</p>
        </div>

        {/* Prestation */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-3">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Prestation</p>
          <p className="text-[16px] font-black text-gray-900">{rdv.service_name}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[13px] text-primary font-black">{rdv.total_price || rdv.service_price}€</span>
            <span className="text-[12px] text-gray-400 font-medium">{rdv.duration_min} min</span>
          </div>
        </div>

        {/* Date & Heure */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
            <p className="text-[15px] font-black text-gray-900">{rdv.date}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Heure</p>
            <p className="text-[15px] font-black text-gray-900">{rdv.time_slot}</p>
          </div>
        </div>

        {rdv.notes && (
          <div className="bg-orange-50 rounded-2xl p-4 mb-3 border border-orange-100">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Notes client</p>
            <p className="text-[13px] text-gray-700 font-medium">{rdv.notes}</p>
          </div>
        )}

        {/* Actions selon statut */}
        {rdv.status === "en_attente" && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleStatus("annule")}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-[12px] font-black text-gray-500 uppercase tracking-widest active:scale-95 transition-all"
            >
              Refuser
            </button>
            <button
              onClick={() => handleStatus("confirme")}
              disabled={loading}
              className="flex-1 bg-primary text-white py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accepter"}
            </button>
          </div>
        )}
        {rdv.status === "confirme" && (
          <div className="mt-4 space-y-3">
            {/* Section validation code client */}
            <div className="bg-gray-900 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-primary" />
                <p className="text-[11px] font-black text-white uppercase tracking-widest">Code client</p>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mb-4">
                Demandez au client son code à 4 chiffres pour valider la prestation et débloquer les fonds.
              </p>
              <div className="flex items-center justify-center gap-3 mb-4">
                {codeInput.map((digit, i) => (
                  <input
                    key={i}
                    ref={codeRefs[i]}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeDigit(e.target.value, i)}
                    onKeyDown={e => handleCodeKeyDown(e, i)}
                    className={`w-14 h-16 text-center text-[32px] font-black rounded-2xl outline-none transition-all ${
                      codeError
                        ? "bg-red-500/20 border-2 border-red-500 text-red-400"
                        : "bg-white/10 border-2 border-white/20 text-white focus:border-primary"
                    }`}
                  />
                ))}
              </div>
              {codeError && (
                <p className="text-center text-[12px] font-black text-red-400 mb-3">Code incorrect — réessayez</p>
              )}
              <button
                onClick={handleValidateCode}
                disabled={loading || codeInput.some(d => !d)}
                className="w-full bg-primary text-white py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "✓ Valider & Débloquer les fonds"}
              </button>
            </div>
            {/* No Show */}
            <button
              onClick={() => handleStatus("no_show")}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl border border-red-100 text-[12px] font-black text-red-400 uppercase tracking-widest active:scale-95 transition-all"
            >
              No Show
            </button>
          </div>
        )}
        {/* Info acompte */}
        {rdv.acompte_amount > 0 && (
          <div className="mt-3 bg-orange-50 rounded-2xl px-4 py-3 border border-orange-100">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Paiement</p>
            <p className="text-[13px] font-black text-gray-900">
              Acompte payé : {rdv.acompte_amount}€
              <span className="text-[11px] font-medium text-gray-400 ml-2">
                (reste {((rdv.total_price || 0) - rdv.acompte_amount).toFixed(2)}€ sur place)
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Nouveau RDV Modal ─────────────────────────────────────────────────────────
function NouveauRdvModal({ onClose, proEmail, onCreated }) {
  const [step, setStep] = useState(1); // 1=client, 2=service, 3=datetime
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [searchClient, setSearchClient] = useState("");
  const [searchService, setSearchService] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client: null,
    service: null,
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    notes: "",
  });

  useEffect(() => {
    // Charger clients depuis reservations précédentes
    entities.Reservation.filter({ pro_email: proEmail }, "-created_at", 100)
      .then(reservations => {
        const seen = {};
        reservations.forEach(r => {
          if (!seen[r.client_email]) {
            seen[r.client_email] = { email: r.client_email, name: r.client_name };
          }
        });
        setClients(Object.values(seen));
      }).catch(() => {});
    // Charger services du pro
    entities.Service.filter({ pro_email: proEmail, status: "actif" }, "title", 50)
      .then(setServices).catch(() => {});
  }, [proEmail]);

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchClient.toLowerCase())
  );
  const filteredServices = services.filter(s =>
    s.title?.toLowerCase().includes(searchService.toLowerCase())
  );

  const handleConfirm = async () => {
    if (!form.client || !form.service || !form.date || !form.time) return;
    setSaving(true);
    const rdv = await entities.Reservation.create({
      pro_email: proEmail,
      pro_name: form.service.pro_email,
      client_email: form.client.email,
      client_name: form.client.name,
      service_id: form.service.id,
      service_name: form.service.title,
      service_price: form.service.price,
      total_price: form.service.price,
      duration_min: form.service.duration_min || 60,
      date: form.date,
      time_slot: form.time,
      notes: form.notes,
      status: "confirme",
      payment_status: "non_paye",
    });
    setSaving(false);
    onCreated(rdv);
    onClose();
  };

  const inputClass = "w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full rounded-t-3xl px-5 pt-4 pb-8 z-10 max-h-[82vh] overflow-y-auto" style={{ marginBottom: '64px' }}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-black text-gray-900">Nouveau Rendez-vous</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${step >= s ? "bg-primary" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* Step 1 : Client */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Choisir un client</p>
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3 mb-3">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  value={searchClient}
                  onChange={e => setSearchClient(e.target.value)}
                  placeholder="Nom ou email du client…"
                  className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none"
                />
              </div>
              {/* Nouveau client manuel */}
              {searchClient && !filteredClients.find(c => c.email === searchClient) && (
                <button
                  onClick={() => { setForm(f => ({ ...f, client: { name: searchClient, email: searchClient } })); setStep(2); }}
                  className="w-full flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3.5 mb-2 active:scale-[0.98] transition-all"
                >
                  <UserPlus className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-[13px] font-black text-primary">Ajouter "{searchClient}" comme nouveau client</span>
                </button>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredClients.length === 0 && !searchClient && (
                  <p className="text-center text-[12px] text-gray-400 py-6">Aucun client trouvé. Saisissez un nom pour créer un nouveau client.</p>
                )}
                {filteredClients.map(c => (
                  <button
                    key={c.email}
                    onClick={() => { setForm(f => ({ ...f, client: c })); setStep(2); }}
                    className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-all shadow-sm"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-[16px] font-black text-primary">{(c.name || "?")[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-black text-gray-900">{c.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{c.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 : Service */}
        {step === 2 && (
          <div className="space-y-4">
            {form.client && (
              <div className="flex items-center gap-2 bg-green-50 rounded-2xl px-4 py-3 border border-green-100">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-[13px] font-black text-green-700">{form.client.name}</span>
              </div>
            )}
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Choisir une prestation</p>
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={searchService}
                onChange={e => setSearchService(e.target.value)}
                placeholder="Rechercher une prestation…"
                className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none"
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredServices.length === 0 && (
                <p className="text-center text-[12px] text-gray-400 py-6">Aucun service actif. Créez-en un dans Catalogue Services.</p>
              )}
              {filteredServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setForm(f => ({ ...f, service: s })); setStep(3); }}
                  className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <Scissors className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-black text-gray-900">{s.title}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{s.duration_min} min • {s.category}</p>
                  </div>
                  <span className="text-[15px] font-black text-primary">{s.price}€</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-[12px] font-black text-gray-400 uppercase tracking-widest">← Retour</button>
          </div>
        )}

        {/* Step 3 : Date & heure */}
        {step === 3 && (
          <div className="space-y-4">
            {form.service && (
              <div className="flex items-center gap-2 bg-green-50 rounded-2xl px-4 py-3 border border-green-100">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-[13px] font-black text-green-700">{form.service.title} – {form.service.price}€</span>
              </div>
            )}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</p>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Heure</p>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Notes (optionnel)</p>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Instructions, précisions..."
                rows={3}
                className={inputClass + " resize-none"}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(2)} className="text-[12px] font-black text-gray-400 uppercase tracking-widest">← Retour</button>
              <button
                onClick={handleConfirm}
                disabled={saving || !form.date || !form.time}
                className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer le RDV"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Planning Tab ──────────────────────────────────────────────────────────────
function PlanningTab({ proEmail, reservations, onSelectRdv }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekBase, setWeekBase] = useState(new Date());
  const week = buildWeek(weekBase);

  const dayRdvs = reservations.filter(r => {
    try { return isSameDay(parseISO(r.date), selectedDate); } catch { return false; }
  }).sort((a, b) => (a.time_slot || "").localeCompare(b.time_slot || ""));

  const statusColor = {
    en_attente: "bg-orange-100 border-l-4 border-orange-400",
    confirme: "bg-green-50 border-l-4 border-green-400",
    annule: "bg-red-50 border-l-4 border-red-300",
    termine: "bg-gray-50 border-l-4 border-gray-300",
    no_show: "bg-red-50 border-l-4 border-red-200",
  };

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekBase(d => addDays(d, -7))} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest">
          {format(week[0], "d MMM", { locale: fr })} – {format(week[6], "d MMM yyyy", { locale: fr })}
        </p>
        <button onClick={() => setWeekBase(d => addDays(d, 7))} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day selector */}
      <div className="grid grid-cols-7 gap-1">
        {week.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const hasRdv = reservations.some(r => { try { return isSameDay(parseISO(r.date), day); } catch { return false; } });
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center py-2 rounded-2xl transition-all active:scale-95 ${isSelected ? "bg-primary text-white shadow-md shadow-primary/30" : isToday ? "bg-orange-50 text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              <span className="text-[8px] font-black uppercase tracking-widest">{format(day, "EEE", { locale: fr })}</span>
              <span className="text-[18px] font-black leading-tight">{format(day, "d")}</span>
              {hasRdv && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-primary"}`} />}
            </button>
          );
        })}
      </div>

      {/* Date header */}
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
        {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} — {dayRdvs.length} rdv
      </p>

      {/* RDV list */}
      {dayRdvs.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Calendar className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-[13px] font-bold text-gray-400">Aucun rendez-vous ce jour</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dayRdvs.map(rdv => (
            <button
              key={rdv.id}
              onClick={() => onSelectRdv(rdv)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left active:scale-[0.99] transition-all shadow-sm ${statusColor[rdv.status] || "bg-white border border-gray-100"}`}
            >
              <div className="w-12 text-center shrink-0">
                <p className="text-[13px] font-black text-gray-700">{rdv.time_slot}</p>
                <p className="text-[9px] text-gray-400 font-medium">{rdv.duration_min}min</p>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-black text-gray-900">{rdv.service_name}</p>
                <p className="text-[12px] font-medium text-gray-500">{rdv.client_name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-black text-primary">{rdv.total_price || rdv.service_price}€</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Demandes Tab ──────────────────────────────────────────────────────────────
function DemandesTab({ proEmail, reservations, setReservations }) {
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  const demandes = reservations.filter(r => r.status === "en_attente");
  const filtered = demandes.filter(r =>
    r.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.service_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (id, status) => {
    setUpdating(id);
    await entities.Reservation.update(id, { status });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrer les demandes…"
          className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none font-medium placeholder:text-gray-400"
        />
      </div>

      {filtered.length > 0 && (
        <div className="bg-orange-50 rounded-2xl px-4 py-3 border border-orange-100 text-center">
          <p className="text-[11px] font-black text-primary uppercase tracking-widest">
            {filtered.length} demande{filtered.length > 1 ? "s" : ""} en attente
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2">
          <CheckCircle className="w-10 h-10 text-green-400" />
          <p className="text-[13px] font-bold text-gray-400">Aucune demande en attente</p>
        </div>
      ) : (
        filtered.map(r => (
          <div key={r.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative">
            <span className="absolute top-4 right-4 bg-orange-100 text-primary text-[10px] font-black uppercase px-3 py-1 rounded-full">Nouveau</span>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-[18px] font-black text-primary">{(r.client_name || "?")[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-[16px] font-black text-gray-900">{r.client_name}</p>
                <p className="text-[12px] font-medium text-gray-500">{r.service_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Date & Heure</p>
                <p className="text-[14px] font-black text-gray-900">{r.date} • {r.time_slot}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Durée & Prix</p>
                <p className="text-[14px] font-black text-gray-900">{r.duration_min}min • {r.total_price || r.service_price}€</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction(r.id, "annule")}
                disabled={updating === r.id}
                className="flex-1 py-3 rounded-2xl text-[12px] font-black text-gray-500 uppercase tracking-widest border border-gray-200 active:scale-95 transition-all"
              >
                Refuser
              </button>
              <button
                onClick={() => handleAction(r.id, "confirme")}
                disabled={updating === r.id}
                className="flex-1 bg-[#1a2035] text-white py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {updating === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accepter"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── CRM Tab ───────────────────────────────────────────────────────────────────
function CrmTab({ reservations, proEmail }) {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });

  // Construire la base clients depuis les réservations
  const clientMap = {};
  reservations.forEach(r => {
    if (!r.client_email) return;
    if (!clientMap[r.client_email]) {
      clientMap[r.client_email] = {
        email: r.client_email,
        name: r.client_name || r.client_email,
        rdvs: [],
        totalSpent: 0,
        lastDate: null,
      };
    }
    clientMap[r.client_email].rdvs.push(r);
    clientMap[r.client_email].totalSpent += (r.total_price || r.service_price || 0);
    if (!clientMap[r.client_email].lastDate || r.date > clientMap[r.client_email].lastDate) {
      clientMap[r.client_email].lastDate = r.date;
    }
  });
  const allClients = Object.values(clientMap);

  const filtered = allClients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [["Nom", "Email", "Nb RDV", "Total €", "Dernier RDV"]];
    allClients.forEach(c => rows.push([c.name, c.email, c.rdvs.length, c.totalSpent, c.lastDate || ""]));
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "clients.csv"; a.click();
  };

  if (selectedClient) {
    const rdvs = selectedClient.rdvs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-[12px] font-black text-gray-500 uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Tous les clients
        </button>
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-[24px] font-black text-primary">{(selectedClient.name || "?")[0].toUpperCase()}</span>
            </div>
            <div>
              <h3 className="text-[20px] font-black text-gray-900">{selectedClient.name}</h3>
              <p className="text-[12px] text-gray-400 font-medium">{selectedClient.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-[20px] font-black text-gray-900">{selectedClient.rdvs.length}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">RDV</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-[20px] font-black text-primary">{selectedClient.totalSpent}€</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-[14px] font-black text-gray-900">{selectedClient.lastDate || "—"}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dernier</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historique des RDV</p>
        {rdvs.map(r => (
          <div key={r.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100">
            <div className="flex-1">
              <p className="text-[14px] font-black text-gray-900">{r.service_name}</p>
              <p className="text-[11px] text-gray-400 font-medium">{r.date} • {r.time_slot}</p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-black text-primary">{r.total_price || r.service_price}€</p>
              <p className={`text-[9px] font-black uppercase ${r.status === "confirme" ? "text-green-500" : r.status === "annule" ? "text-red-400" : "text-gray-400"}`}>{r.status}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[20px] font-black text-gray-900">Clients</h3>
          <p className="text-[12px] font-medium text-gray-400">{allClients.length} clients enregistrés</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center active:scale-95 transition-all">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 bg-[#1a2035] rounded-2xl flex items-center justify-center active:scale-95 transition-all">
            <UserPlus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un client…"
          className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none font-medium placeholder:text-gray-400"
        />
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-2">
          <Users className="w-10 h-10 text-gray-200" />
          <p className="text-[13px] font-bold text-gray-400">Aucun client pour l'instant</p>
          <p className="text-[11px] text-gray-300 text-center">Les clients apparaissent automatiquement après leurs réservations</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(c => (
          <button
            key={c.email}
            onClick={() => setSelectedClient(c)}
            className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.99] transition-all"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-[18px] font-black text-primary">{(c.name || "?")[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[15px] font-black text-gray-900">{c.name}</p>
              <p className="text-[12px] font-medium text-gray-400">{c.rdvs.length} rdv • {c.totalSpent}€ total</p>
            </div>
            <div className="flex items-center gap-2">
              {c.lastDate && <span className="text-[10px] font-black text-gray-400">{c.lastDate}</span>}
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </button>
        ))}
      </div>

      {/* Stats card */}
      {allClients.length > 0 && (
        <div className="bg-[#1a2035] rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statistiques</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[36px] font-black text-white leading-none">{allClients.length}</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">Clients total</p>
            </div>
            <div>
              <p className="text-[36px] font-black text-primary leading-none">
                {allClients.reduce((s, c) => s + c.totalSpent, 0)}€
              </p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">CA cumulé</p>
            </div>
          </div>
          <button onClick={exportCSV} className="w-full mt-4 bg-white/10 text-white text-[12px] font-black uppercase tracking-widest py-3 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Exporter Excel / CSV
          </button>
        </div>
      )}

      {/* Modal ajout client */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl px-5 pt-4 pb-8 z-10 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-[18px] font-black text-gray-900 mb-5">Nouveau client</h3>
            <div className="space-y-3">
              <input value={newClient.name} onChange={e => setNewClient(c => ({ ...c, name: e.target.value }))} placeholder="Nom complet" className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-gray-900 outline-none" />
              <input value={newClient.email} onChange={e => setNewClient(c => ({ ...c, email: e.target.value }))} placeholder="Email" type="email" className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-gray-900 outline-none" />
              <input value={newClient.phone} onChange={e => setNewClient(c => ({ ...c, phone: e.target.value }))} placeholder="Téléphone" type="tel" className="w-full bg-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-gray-900 outline-none" />
              <button
                onClick={() => setShowAdd(false)}
                className="w-full bg-primary text-white font-black text-[13px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all mt-2"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Gestion Tab ───────────────────────────────────────────────────────────────
function GestionTab({ onNavigate, travailNuit = false, onToggleNuit }) {
  const horaires = travailNuit ? "21h – 07h" : "09h – 19h";
  const gestionItems = [
    { icon: Scissors, label: "Services & Tarifs", sub: "Gérer les prestations", color: "text-primary", bg: "bg-orange-50", route: "/pro/catalogue-services" },
    { icon: Users, label: "Équipe & Staff", sub: "Membres de l'équipe", color: "text-primary", bg: "bg-orange-50", route: "/pro/equipe" },
    { icon: Clock, label: "Horaires & Congés", sub: horaires, color: "text-blue-500", bg: "bg-blue-50", route: "/pro/horaires-conges" },
    { icon: Megaphone, label: "Marketing & Promo", sub: "Promotions actives", color: "text-purple-500", bg: "bg-purple-50", route: "/pro/promo-service/:id" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[22px] font-black text-gray-900">Gestion</h3>
        <p className="text-[13px] font-medium text-gray-400">Configurez votre établissement</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {gestionItems.map(({ icon: Icon, label, sub, color, bg, route }) => (
          <button
            key={label}
            onClick={() => route && onNavigate(route)}
            className="bg-white rounded-3xl p-5 flex flex-col gap-3 shadow-sm border border-gray-100 text-left active:scale-[0.97] transition-all"
          >
            <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-[15px] font-black text-gray-900 leading-tight">{label}</p>
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>
      {/* Mode Nuit toggle synchronisé */}
      <div className={`rounded-3xl p-4 flex items-center gap-4 border ${travailNuit ? "bg-indigo-950 border-indigo-800" : "bg-indigo-50 border-indigo-100"}`}>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${travailNuit ? "bg-indigo-800" : "bg-indigo-100"}`}>
          <Clock className={`w-5 h-5 ${travailNuit ? "text-indigo-300" : "text-indigo-500"}`} />
        </div>
        <div className="flex-1">
          <p className={`text-[14px] font-black ${travailNuit ? "text-indigo-200" : "text-indigo-700"}`}>
            Mode Nuit
          </p>
          <p className={`text-[11px] font-medium mt-0.5 ${travailNuit ? "text-indigo-400" : "text-indigo-400"}`}>
            Horaires : {travailNuit ? "21h – 07h ✓ Actif" : "09h – 19h — Désactivé"}
          </p>
        </div>
        <button
          onClick={() => onToggleNuit && onToggleNuit(!travailNuit)}
          className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${travailNuit ? "bg-indigo-500" : "bg-gray-200"}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${travailNuit ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>

      <div className="bg-[#1a2035] rounded-3xl p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[22px] font-black text-white leading-tight">Boostez votre<br /><span className="text-primary">Visibilité</span></p>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
        </div>
        <p className="text-[13px] font-medium text-gray-400 leading-relaxed mb-4">
          Apparaissez en tête des résultats et automatisez vos relances clients.
        </p>
        <button onClick={() => onNavigate("/pro/abonnements")} className="w-full bg-primary text-white font-black text-[13px] uppercase tracking-widest py-3.5 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">
          Découvrir Pro+
        </button>
      </div>
      <button onClick={() => onNavigate("/profil-pro")} className="w-full text-center text-[12px] font-black text-primary uppercase tracking-widest py-3 active:scale-95 transition-all">
        Quitter le mode professionnel
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GestionAgenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("planning");
  const [showModal, setShowModal] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [travailNuit, setTravailNuit] = useState(false);
  const [profilId, setProfilId] = useState(null);

  const proEmail = user?.email;

  // Heures d'ouverture selon mode nuit
  const heureOuverture = travailNuit ? "21:00" : "09:00";
  const heureFermeture = travailNuit ? "07:00" : "19:00";
  const horairesLabel = travailNuit ? "21h – 07h (Mode Nuit)" : "09h – 19h";

  const loadReservations = async () => {
    if (!proEmail) return;
    const [data, profils] = await Promise.all([
      entities.Reservation.filter({ pro_email: proEmail }, "-date", 200).catch(() => []),
      entities.ProfilPro.filter({ user_email: proEmail }, "-created_at", 1).catch(() => []),
    ]);
    setReservations(data);
    if (profils.length > 0) {
      setTravailNuit(profils[0].travail_nuit || false);
      setProfilId(profils[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReservations();
    // Subscribe aux changements en temps réel
    const unsub = entities.Reservation.subscribe((event) => {
      if (event.type === "create" && event.data?.pro_email === proEmail) {
        setReservations(prev => [event.data, ...prev]);
      } else if (event.type === "update") {
        setReservations(prev => prev.map(r => r.id === event.id ? { ...r, ...event.data } : r));
      } else if (event.type === "delete") {
        setReservations(prev => prev.filter(r => r.id !== event.id));
      }
    });
    // Subscribe aux changements du profil pro (mode nuit)
    const unsubProfil = entities.ProfilPro.subscribe((event) => {
      if (event.data?.user_email === proEmail) {
        setTravailNuit(event.data.travail_nuit || false);
      }
    });
    return () => { unsub(); unsubProfil(); };
  }, [proEmail]);

  const demandesCount = reservations.filter(r => r.status === "en_attente").length;

  const TABS = [
    { id: "planning", label: "PLANNING" },
    { id: "demandes", label: "DEMANDES", badge: demandesCount > 0 ? demandesCount : null },
    { id: "crm", label: "CRM" },
    { id: "gestion", label: "GESTION" },
  ];

  return (
    <div className="font-display min-h-full bg-[#f5f5f5]">
      {showModal && (
        <NouveauRdvModal
          onClose={() => setShowModal(false)}
          proEmail={proEmail}
          onCreated={(rdv) => setReservations(prev => [rdv, ...prev])}
        />
      )}
      {selectedRdv && (
        <RdvDetailModal
          rdv={selectedRdv}
          onClose={() => setSelectedRdv(null)}
          proEmail={proEmail}
          onUpdateStatus={(id, status) => {
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
          }}
        />
      )}

      <div className="bg-white px-5 pt-5 pb-4 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate("/profil-pro")}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-[20px] font-black text-gray-900 leading-tight">Gestion Agenda</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">
              {loading ? "Chargement…" : `${reservations.length} rdv • ${horairesLabel}`}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
            >
              {tab.label}
              {tab.badge ? (
                <span className="w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeTab === "planning" && (
              <PlanningTab proEmail={proEmail} reservations={reservations} onSelectRdv={setSelectedRdv} />
            )}
            {activeTab === "demandes" && (
              <DemandesTab proEmail={proEmail} reservations={reservations} setReservations={setReservations} />
            )}
            {activeTab === "crm" && (
              <CrmTab reservations={reservations} proEmail={proEmail} />
            )}
            {activeTab === "gestion" && (
              <GestionTab onNavigate={navigate} travailNuit={travailNuit} profilId={profilId} onToggleNuit={async (val) => {
                setTravailNuit(val);
                if (profilId) await entities.ProfilPro.update(profilId, { travail_nuit: val }).catch(() => {});
              }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}