import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Génère un lien "Ajouter à Google Calendar"
function buildGoogleCalendarLink({ title, description, location, dateStr, timeSlot, durationMin }) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [startH, startM] = timeSlot.split(":").map(Number);
  const endMin = startH * 60 + startM + (durationMin || 60);
  const endH = Math.floor(endMin / 60) % 24;
  const endMm = endMin % 60;

  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (y, mo, d, h, m) => `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`;

  const start = fmt(year, month, day, startH, startM);
  const end = fmt(year, month, day, endH, endMm);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: description || "",
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ── Rappels 24h avant ─────────────────────────────────────────────────────────
async function send24hReminders(base44) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  console.log(`🔔 [24h] Recherche des réservations pour le ${tomorrowStr}...`);

  const reservations = await base44.asServiceRole.entities.Reservation.filter(
    { date: tomorrowStr }, "-created_date", 500
  );

  const active = reservations.filter(r =>
    ["en_attente", "confirme"].includes(r.status) &&
    r.reminder_sent !== true
  );

  console.log(`📨 [24h] ${active.length} réservation(s) à rappeler`);

  let sent = 0;
  for (const r of active) {
    const gcalLink = buildGoogleCalendarLink({
      title: `💆 ${r.service_name} – BeautyBook`,
      description: `Prestataire: ${r.salon_name || r.pro_name}\nCode de validation: ${r.crg_code || "—"}`,
      location: r.salon_address || r.salon_name || "",
      dateStr: r.date,
      timeSlot: r.time_slot,
      durationMin: r.duration_min || 60,
    });

    // Rappel client 24h
    await base44.asServiceRole.entities.Notification.create({
      user_email: r.client_email,
      type: "reservation",
      title: "⏰ Rappel – Votre RDV demain !",
      body: `N'oubliez pas ! Demain à ${r.time_slot} : "${r.service_name}" chez ${r.salon_name || r.pro_name}. ${r.salon_address ? `📍 ${r.salon_address}` : ""} — Ajoutez-le à votre calendrier : ${gcalLink}`,
      link: "/rendez-vous",
      read: false,
      data: { reservation_id: r.id, gcal_link: gcalLink },
    });

    // Rappel pro 24h
    await base44.asServiceRole.entities.Notification.create({
      user_email: r.pro_email,
      type: "reservation",
      title: "📅 Rappel – RDV demain",
      body: `Rappel : ${r.client_name} a rendez-vous demain à ${r.time_slot} pour "${r.service_name}" (${r.persons || 1} pers.)`,
      link: "/pro/gestion-agenda",
      read: false,
    });

    await base44.asServiceRole.entities.Reservation.update(r.id, { reminder_sent: true });
    sent++;
  }

  return { type: "24h", sent, date: tomorrowStr };
}

// ── Rappels 2h avant ──────────────────────────────────────────────────────────
async function send2hReminders(base44) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Fenêtre cible : dans 2h ± 30min
  const targetMin = now.getHours() * 60 + now.getMinutes() + 120;
  const windowMin = 30; // tolérance de ±30 min pour ne pas rater un rappel

  console.log(`⏱️ [2h] Recherche des RDV aujourd'hui autour de ${Math.floor(targetMin / 60)}:${String(targetMin % 60).padStart(2, "0")}...`);

  const reservations = await base44.asServiceRole.entities.Reservation.filter(
    { date: todayStr }, "-created_date", 500
  );

  const toRemind = reservations.filter(r => {
    if (!["confirme", "en_attente"].includes(r.status)) return false;
    if (r.reminder_2h_sent === true) return false;
    const [h, m] = (r.time_slot || "00:00").split(":").map(Number);
    const slotMin = h * 60 + m;
    return slotMin >= targetMin - windowMin && slotMin <= targetMin + windowMin;
  });

  console.log(`📨 [2h] ${toRemind.length} réservation(s) à rappeler`);

  let sent = 0;
  for (const r of toRemind) {
    const gcalLink = buildGoogleCalendarLink({
      title: `💆 ${r.service_name} – BeautyBook`,
      description: `Prestataire: ${r.salon_name || r.pro_name}\nCode de validation: ${r.crg_code || "—"}`,
      location: r.salon_address || r.salon_name || "",
      dateStr: r.date,
      timeSlot: r.time_slot,
      durationMin: r.duration_min || 60,
    });

    // Rappel client 2h
    await base44.asServiceRole.entities.Notification.create({
      user_email: r.client_email,
      type: "reservation",
      title: "🔔 Votre RDV dans 2 heures !",
      body: `C'est bientôt ! À ${r.time_slot} : "${r.service_name}" chez ${r.salon_name || r.pro_name}. ${r.crg_code ? `🔑 Votre code : ${r.crg_code}` : ""} ${r.salon_address ? `📍 ${r.salon_address}` : ""}`,
      link: "/rendez-vous",
      read: false,
      data: { reservation_id: r.id, gcal_link: gcalLink },
    });

    // Rappel pro 2h
    await base44.asServiceRole.entities.Notification.create({
      user_email: r.pro_email,
      type: "reservation",
      title: "⏳ RDV dans 2h",
      body: `Dans 2h : ${r.client_name} à ${r.time_slot} pour "${r.service_name}"`,
      link: "/pro/gestion-agenda",
      read: false,
    });

    await base44.asServiceRole.entities.Reservation.update(r.id, { reminder_2h_sent: true });
    sent++;
  }

  return { type: "2h", sent, date: todayStr };
}

// ── Handler principal ─────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Vérifier le token admin secret pour cet endpoint (appelé par automation, pas par user)
    let body = {};
    try { body = await req.json(); } catch { body = {}; }

    const adminToken = req.headers.get("x-admin-token") || body._adminToken || "";
    const expectedToken = Deno.env.get("ADMIN_SECRET_TOKEN");
    if (!adminToken || !expectedToken || adminToken !== expectedToken) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const type = body.type || "24h";

    let result;
    if (type === "2h") {
      result = await send2hReminders(base44);
    } else {
      result = await send24hReminders(base44);
    }

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("❌ sendReservationReminders error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});