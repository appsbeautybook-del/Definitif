import { ArrowLeft, MapPin, Clock, CheckCircle2, Loader, Users, Download, CreditCard, Banknote, Share2, Pencil, X, Check, Tag } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { apiClient } from '@/lib/apiClient';
import QRCode from "qrcode";

// ── Génère un code à 4 chiffres unique ───────────────────────────────────────
function generateCRG() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ── QR Code Canvas ────────────────────────────────────────────────────────────
function QRCodeDisplay({ value, size = 200 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: "#111111", light: "#ffffff" },
    });
  }, [value, size]);
  return <canvas ref={canvasRef} className="rounded-xl" />;
}

// ── Écran de confirmation avec QR Code ───────────────────────────────────────
function ConfirmationSuccess({ totalPrice, icsData, crgCode, paymentMode, acompteAmount }) {
  const downloadICS = () => {
    if (!icsData) return;
    const blob = new Blob([decodeURIComponent(escape(atob(icsData)))], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "beautybook-rdv.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({ title: "Ma réservation BeautyBook", text: `Mon code de réservation : ${crgCode}` });
    } else {
      navigator.clipboard.writeText(crgCode).catch(() => {});
    }
  };

  const resteAPayer = paymentMode === "acompte" ? (totalPrice - acompteAmount).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-5 pt-10 pb-16 gap-6">
      {/* Icône succès */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl" style={{ background: "#E8732A" }}>
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>

      <div className="text-center">
        <h2 className="text-[30px] font-black text-gray-900 leading-tight mb-1">Réservation<br />Confirmée !</h2>
        <p className="text-[13px] text-gray-400 font-medium">Rappels automatiques 24h et 2h avant votre RDV 🌟</p>
      </div>

      {/* Code à 4 chiffres */}
      <div className="w-full bg-gray-900 rounded-3xl p-6 flex flex-col items-center gap-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Votre code de validation</p>

        {/* Les 4 chiffres bien séparés */}
        <div className="flex items-center gap-3">
          {crgCode.split("").map((digit, i) => (
            <div key={i} className="w-16 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-[38px] font-black text-white">{digit}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400 font-medium text-center leading-relaxed">
          Communiquez ce code au professionnel à votre arrivée.<br />
          Il débloquera votre prestation et vos points fidélité.
        </p>

        <button
          onClick={shareCode}
          className="flex items-center gap-2 bg-white/10 text-white text-[12px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl active:scale-95 transition-all border border-white/20"
        >
          <Share2 className="w-4 h-4" />
          Partager le code
        </button>
      </div>

      {/* Récap paiement */}
      {paymentMode === "acompte" && (
        <div className="w-full bg-orange-50 border border-orange-100 rounded-2xl px-4 py-4 space-y-2">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Récap paiement</p>
          <div className="flex justify-between">
            <span className="text-[13px] text-gray-600 font-medium">Acompte payé (30%)</span>
            <span className="text-[13px] font-black text-green-600">✓ {acompteAmount}€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[13px] text-gray-600 font-medium">Reste à payer au salon</span>
            <span className="text-[13px] font-black text-gray-900">{resteAPayer}€</span>
          </div>
        </div>
      )}

      {paymentMode === "full" && (
        <div className="w-full bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-[13px] font-black text-green-700">Paiement complet effectué ✓</p>
        </div>
      )}

      {/* Points fidélité */}
      <div className="w-full bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-[22px]">🎁</span>
        <div>
          <p className="text-[12px] font-black text-primary">+{Math.floor(totalPrice)} points fidélité</p>
          <p className="text-[11px] text-gray-500 font-medium">Crédités après votre prestation</p>
        </div>
      </div>

      {/* Calendrier */}
      <div className="w-full space-y-2">
        {/* Google Calendar */}
        <a
          href={(() => {
            const pad = (n) => String(n).padStart(2, "0");
            const b = window.__bb_last_booking__;
            if (!b) return "#";
            const [y, mo, d] = (b.dateStr || "2000-01-01").split("-").map(Number);
            const [sh, sm] = (b.time || "00:00").split(":").map(Number);
            const endT = sh * 60 + sm + (b.totalDuration || 60);
            const eh = Math.floor(endT / 60) % 24, em = endT % 60;
            const fmt = (yy, mm, dd, hh, min) => `${yy}${pad(mm)}${pad(dd)}T${pad(hh)}${pad(min)}00`;
            const p = new URLSearchParams({
              action: "TEMPLATE",
              text: `💆 BeautyBook – ${b.serviceName || "RDV"}`,
              dates: `${fmt(y, mo, d, sh, sm)}/${fmt(y, mo, d, eh, em)}`,
              details: `Prestataire: ${b.salonName || ""}\nCode: ${b.crgCodeVal || ""}`,
              location: b.salonAddress || b.salonName || "",
            });
            return `https://calendar.google.com/calendar/render?${p.toString()}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4285F4] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest active:scale-95 transition-all w-full"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
          Ajouter à Google Calendar
        </a>
        {/* ICS / Apple Calendar */}
        {icsData && (
          <button
            onClick={downloadICS}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest active:scale-95 transition-all w-full"
          >
            <Download className="w-4 h-4" />
            Apple / Autre calendrier (.ics)
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function StepConfirmation({ booking, onConfirm, onBack }) {
  const [confirmed, setConfirmed] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMode, setPaymentMode] = useState("full"); // "full" | "acompte"
  const [icsData, setIcsData] = useState(null);
  const [crgCode] = useState(() => generateCRG());
  const [editingLieu, setEditingLieu] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const [customName, setCustomName] = useState("");
  const [savedLieu, setSavedLieu] = useState({ name: "", address: "" });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const addressDebounceRef = useRef(null);

  // Synchroniser le lieu avec le profil pro
  useEffect(() => {
    const proEmail = booking.services?.[0]?.pro_email || booking.salon?.pro_email;
    if (!proEmail) {
      const fallback = { name: booking.salon?.name || "", address: booking.salon?.address || "" };
      setSavedLieu(fallback);
      setCustomName(fallback.name);
      setCustomAddress(fallback.address);
      return;
    }
    entities.ProfilPro.filter({ user_email: proEmail }, "-created_at", 1)
      .then(profils => {
        const p = profils[0];
        const lieu = {
          name: p?.salon_name || booking.salon?.name || "",
          address: [p?.address, p?.city, p?.postal_code].filter(Boolean).join(", ") || booking.salon?.address || "",
        };
        setSavedLieu(lieu);
        setCustomName(lieu.name);
        setCustomAddress(lieu.address);
      })
      .catch(() => {});
  }, []);

  const handleAddressChange = (val) => {
    setCustomAddress(val);
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (val.length < 3) { setAddressSuggestions([]); return; }
    addressDebounceRef.current = setTimeout(async () => {
      setLoadingAddress(true);
      try {
        const res = await /* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))("placesAutocomplete", { input: val });
        setAddressSuggestions(res.data?.predictions || []);
      } catch { setAddressSuggestions([]); }
      finally { setLoadingAddress(false); }
    }, 400);
  };

  const selectSuggestion = (pred) => {
    setCustomAddress(pred.description);
    setAddressSuggestions([]);
  };

  const totalPersons = booking.services.reduce((s, svc) => s + (svc.persons || 1), 0);
  const totalPrice = booking.services.reduce((s, svc) => s + svc.price * (svc.persons || 1), 0);
  const totalDuration = booking.services.reduce((s, svc) => s + (svc.duration_min || parseInt(svc.duration) || 60), 0);
  const acompteAmount = Math.round(totalPrice * 0.3 * 100) / 100;
  const dateStr = booking.date ? format(booking.date, "yyyy-MM-dd") : null;

  const buildPayload = (pType) => ({
    pro_email: booking.services[0]?.pro_email || booking.salon?.pro_email || "",
    pro_name: savedLieu.name || "",
    service_id: booking.services[0]?.id || "",
    service_name: booking.services.map(s => s.title || s.name).join(" + "),
    service_price: totalPrice,
    date: dateStr,
    time_slot: booking.time,
    duration_min: totalDuration,
    persons: totalPersons,
    total_price: totalPrice,
    salon_name: savedLieu.name || "",
    salon_address: savedLieu.address || "",
    seat_number: booking.seat || null,
    payment_type: pType,
    crg_code: crgCode,
  });

  const handleConfirmAndBook = async () => {
    setSaving(true);
    setError(null);
    try {
      // ── Sauvegarder la réservation via l'API Backend ──────────────────────
      const payload = buildPayload(paymentMode);
      const res = await apiClient.callFunction('createReservation', payload);
      
      if (res.data?.ics_base64) {
        setIcsData(res.data.ics_base64);
      }

      // Stocker les données pour le lien Google Calendar sur l'écran de confirmation
      window.__bb_last_booking__ = {
        dateStr,
        time: booking.time,
        totalDuration,
        serviceName: booking.services.map(s => s.title || s.name).join(" + "),
        salonName: savedLieu.name,
        salonAddress: savedLieu.address,
        crgCodeVal: crgCode,
      };

      setConfirmed(true);
    } catch (err) {
      const msg = err?.message || "Erreur lors de la réservation. Veuillez réessayer.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (confirmed) {
    return (
      <ConfirmationSuccess
        totalPrice={totalPrice}
        icsData={icsData}
        crgCode={crgCode}
        paymentMode={paymentMode}
        acompteAmount={acompteAmount}
      />
    );
  }

  const amountToPay = paymentMode === "acompte" ? acompteAmount : totalPrice;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Étape 4 sur 4</p>
          <p className="text-[17px] font-black text-gray-900">Confirmation</p>
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 space-y-4">

        {/* ── Ticket récapitulatif ── */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
          {/* En-tête ticket */}
          <div className="px-5 pt-5 pb-4 border-b border-dashed border-gray-200" style={{ background: "linear-gradient(135deg,#fff7f0 0%,#fff 100%)" }}>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">🎟 Résumé de la réservation</p>
            {booking.services.map(svc => (
              <div key={svc.id} className="flex items-start justify-between gap-2 mb-2 last:mb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-black text-gray-900 leading-tight">{svc.title || svc.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 bg-orange-50 rounded-full px-2.5 py-1 border border-orange-100">
                      <Clock className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black text-primary">{svc.duration_min} min</span>
                    </span>
                    {(svc.persons || 1) > 1 && (
                      <span className="flex items-center gap-1 bg-blue-50 rounded-full px-2.5 py-1 border border-blue-100">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-600">{svc.persons} pers.</span>
                      </span>
                    )}
                    {svc.category && (
                      <span className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-500">{svc.category}</span>
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[18px] font-black text-gray-900 shrink-0">{svc.price * (svc.persons || 1)}€</span>
              </div>
            ))}
          </div>

          {/* Grille infos */}
          <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-100">
            {/* Date */}
            <div className="px-4 py-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">📅 Date</p>
              <p className="text-[13px] font-black text-gray-900 capitalize">
                {booking.date ? format(booking.date, "EEE d MMM", { locale: fr }) : "—"}
              </p>
            </div>
            {/* Heure */}
            <div className="px-4 py-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">⏰ Heure</p>
              <p className="text-[13px] font-black text-gray-900">{booking.time || "—"}</p>
              {booking.time && (
                <p className="text-[10px] text-gray-400 font-medium">→ {(() => {
                  const [h, m] = (booking.time || "00:00").split(":").map(Number);
                  const total = h * 60 + m + totalDuration;
                  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
                })()}</p>
              )}
            </div>
            {/* Durée */}
            <div className="px-4 py-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">⏱ Durée</p>
              <p className="text-[13px] font-black text-gray-900">{totalDuration} min</p>
            </div>
            {/* Siège */}
            <div className="px-4 py-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">💺 Siège</p>
              <p className="text-[13px] font-black text-gray-900">
                {booking.seat ? `Siège n°${booking.seat}` : "Attribué à l'arrivée"}
              </p>
            </div>
          </div>
        </div>

        {/* Lieu */}
        <div className="rounded-3xl p-5 text-white" style={{ background: "#111" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lieu</p>
            {!editingLieu && (
              <button
                onClick={() => { setEditingLieu(true); setCustomName(savedLieu.name); setCustomAddress(savedLieu.address); }}
                className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5 active:scale-95 transition-all border border-white/10"
              >
                <Pencil className="w-3 h-3 text-white/60" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Modifier</span>
              </button>
            )}
          </div>

          {editingLieu ? (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nom du lieu</p>
                <input
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Ex : Salon de Julie, Domicile..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-[14px] font-medium outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="relative">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Adresse</p>
                <div className="relative">
                  <input
                    value={customAddress}
                    onChange={e => handleAddressChange(e.target.value)}
                    placeholder="Ex : 12 rue de la Paix, Paris 75001"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white text-[14px] font-medium outline-none placeholder:text-gray-500"
                  />
                  {loadingAddress && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-gray-800 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                    {addressSuggestions.map((pred, i) => (
                      <button
                        key={i}
                        onClick={() => selectSuggestion(pred)}
                        className="w-full flex items-start gap-2 px-4 py-3 text-left hover:bg-white/10 active:bg-white/15 transition-all border-b border-white/5 last:border-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-[12px] text-white font-medium leading-snug">{pred.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setSavedLieu({ name: customName, address: customAddress });
                    setEditingLieu(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary rounded-xl py-3 font-black text-[13px] text-white uppercase tracking-widest active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" /> Valider
                </button>
                <button
                  onClick={() => setEditingLieu(false)}
                  className="w-12 flex items-center justify-center bg-white/10 rounded-xl border border-white/10 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[18px] font-black text-white leading-tight">{savedLieu.name}</p>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">{savedLieu.address || "Adresse non renseignée"}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Mode de paiement — 2 options uniquement ── */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Mode de paiement</p>
          <p className="text-[11px] text-gray-400 font-medium mb-4">Le paiement se fait exclusivement via l'application — aucun cash accepté.</p>
          <div className="space-y-3">
            {/* Payer en totalité */}
            <button
              onClick={() => setPaymentMode("full")}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${paymentMode === "full" ? "border-primary bg-orange-50" : "border-gray-100 bg-gray-50"}`}
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <CreditCard className={`w-5 h-5 ${paymentMode === "full" ? "text-primary" : "text-gray-400"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-[14px] font-black ${paymentMode === "full" ? "text-gray-900" : "text-gray-600"}`}>Payer en totalité</p>
                <p className="text-[11px] text-gray-400 font-medium">Tout régler maintenant via l'app</p>
              </div>
              <span className="text-[16px] font-black text-primary">{totalPrice}€</span>
            </button>

            {/* Acompte 30% */}
            <button
              onClick={() => setPaymentMode("acompte")}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${paymentMode === "acompte" ? "border-primary bg-orange-50" : "border-gray-100 bg-gray-50"}`}
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Banknote className={`w-5 h-5 ${paymentMode === "acompte" ? "text-primary" : "text-gray-400"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-[14px] font-black ${paymentMode === "acompte" ? "text-gray-900" : "text-gray-600"}`}>Acompte 30%</p>
                <p className="text-[11px] text-gray-400 font-medium">Reste {(totalPrice - acompteAmount).toFixed(2)}€ à régler au salon via l'app</p>
              </div>
              <span className="text-[16px] font-black text-primary">{acompteAmount}€</span>
            </button>
          </div>
        </div>

        {/* Info QR Code */}
        <div className="bg-gray-900 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-[22px]">📲</span>
          <div>
            <p className="text-[12px] font-black text-white">QR Code de validation</p>
            <p className="text-[11px] text-gray-400 font-medium">Généré automatiquement après confirmation. Présentez-le au salon.</p>
          </div>
        </div>

        {/* Points à gagner */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-[22px]">🎁</span>
          <div>
            <p className="text-[12px] font-black text-primary">+{Math.floor(totalPrice)} points fidélité</p>
            <p className="text-[11px] text-gray-500 font-medium">Crédités automatiquement après votre prestation</p>
          </div>
        </div>

        {/* Bouton télécharger ticket avant paiement */}
        <button
          onClick={() => {
            const lines = [
              `🎟 BEAUTYBOOK — TICKET DE RÉSERVATION`,
              ``,
              `Prestation : ${booking.services.map(s => s.title || s.name).join(" + ")}`,
              `Date       : ${booking.date ? format(booking.date, "EEEE d MMMM yyyy", { locale: fr }) : "—"}`,
              `Heure      : ${booking.time || "—"} → ${(() => { const [h, m] = (booking.time || "00:00").split(":").map(Number); const t = h * 60 + m + totalDuration; return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; })()}`,
              `Durée      : ${totalDuration} min`,
              `Siège      : ${booking.seat ? `N°${booking.seat}` : "Attribué à l'arrivée"}`,
              `Lieu       : ${savedLieu.name}`,
              `Adresse    : ${savedLieu.address || "Non renseignée"}`,
              ``,
              `Total      : ${totalPrice}€`,
              ``,
              `Code       : ${crgCode}`,
              ``,
              `Merci de votre confiance — BeautyBook`,
            ].join("\n");
            const blob = new Blob([lines], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `beautybook-ticket-${crgCode}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-700 font-black text-[13px] uppercase tracking-widest active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          Télécharger le ticket
        </button>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <p className="text-[13px] font-black text-red-500">⚠️ {error}</p>
          </div>
        )}
      </div>

      {/* Bottom fixe */}
      <div className="px-5 pb-8 pt-4 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {paymentMode === "acompte" ? "Acompte à payer" : "Total"}
            </p>
            <p className="text-[32px] font-black text-gray-900 leading-none">
              {amountToPay}€
              {totalPersons > 1 && <span className="text-[13px] text-gray-400 font-medium ml-2">{totalPersons} pers.</span>}
            </p>
          </div>
          <Clock className="w-5 h-5 text-gray-300" />
        </div>

        <button
          onClick={handleConfirmAndBook}
          disabled={saving}
          className="w-full py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
          style={{ background: "#E8732A" }}
        >
          {saving
            ? <><Loader className="w-4 h-4 animate-spin" /><span>Confirmation...</span></>
            : <><CheckCircle2 className="w-4 h-4" />{paymentMode === "acompte" ? `Confirmer & payer l'acompte ${acompteAmount}€` : `Confirmer & payer ${totalPrice}€`} →</>
          }
        </button>
      </div>
    </div>
  );
}