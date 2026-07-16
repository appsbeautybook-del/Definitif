import { supabaseAdmin } from '../config/supabase.js';

function buildGoogleCalendarLink({ title, description, location, dateStr, timeSlot, durationMin }) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [startH, startM] = timeSlot.split(':').map(Number);
  const endMin = startH * 60 + startM + (durationMin || 60);
  const endH = Math.floor(endMin / 60) % 24;
  const endMm = endMin % 60;
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (y, mo, d, h, m) => `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`;
  const start = fmt(year, month, day, startH, startM);
  const end = fmt(year, month, day, endH, endMm);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${start}/${end}`, details: description || '', location: location || '' });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function send24hReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  console.log(`🔔 [24h] Recherche des réservations pour le ${tomorrowStr}...`);

  const { data: reservations } = await supabaseAdmin.from('Reservation')
    .select('*').eq('date', tomorrowStr).limit(500);

  const active = (reservations || []).filter(r =>
    ['en_attente', 'confirme'].includes(r.status) && r.reminder_sent !== true
  );

  console.log(`📨 [24h] ${active.length} réservation(s) à rappeler`);
  let sent = 0;

  for (const r of active) {
    const gcalLink = buildGoogleCalendarLink({
      title: `💆 ${r.service_name} – BeautyBook`,
      description: `Prestataire: ${r.salon_name || r.pro_name}\nCode: ${r.crg_code || '—'}`,
      location: r.salon_address || r.salon_name || '',
      dateStr: r.date, timeSlot: r.time_slot, durationMin: r.duration_min || 60,
    });

    await supabaseAdmin.from('Notification').insert({
      user_email: r.client_email, type: 'reservation',
      title: '⏰ Rappel – Votre RDV demain !',
      body: `N'oubliez pas ! Demain à ${r.time_slot} : "${r.service_name}" chez ${r.salon_name || r.pro_name}.`,
      link: '/rendez-vous', read: false,
      data: { reservation_id: r.id, gcal_link: gcalLink },
    });

    await supabaseAdmin.from('Notification').insert({
      user_email: r.pro_email, type: 'reservation',
      title: '📅 Rappel – RDV demain',
      body: `Rappel : ${r.client_name} a RDV demain à ${r.time_slot} pour "${r.service_name}"`,
      link: '/pro/gestion-agenda', read: false,
    });

    await supabaseAdmin.from('Reservation').update({ reminder_sent: true }).eq('id', r.id);
    sent++;
  }
  return { type: '24h', sent, date: tomorrowStr };
}

async function send2hReminders() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const targetMin = now.getHours() * 60 + now.getMinutes() + 120;
  const windowMin = 30;

  const { data: reservations } = await supabaseAdmin.from('Reservation')
    .select('*').eq('date', todayStr).limit(500);

  const toRemind = (reservations || []).filter(r => {
    if (!['confirme', 'en_attente'].includes(r.status)) return false;
    if (r.reminder_2h_sent === true) return false;
    const [h, m] = (r.time_slot || '00:00').split(':').map(Number);
    const slotMin = h * 60 + m;
    return slotMin >= targetMin - windowMin && slotMin <= targetMin + windowMin;
  });

  let sent = 0;
  for (const r of toRemind) {
    const gcalLink = buildGoogleCalendarLink({
      title: `💆 ${r.service_name} – BeautyBook`,
      description: `Prestataire: ${r.salon_name || r.pro_name}\nCode: ${r.crg_code || '—'}`,
      location: r.salon_address || r.salon_name || '',
      dateStr: r.date, timeSlot: r.time_slot, durationMin: r.duration_min || 60,
    });

    await supabaseAdmin.from('Notification').insert({
      user_email: r.client_email, type: 'reservation',
      title: '🔔 Votre RDV dans 2 heures !',
      body: `À ${r.time_slot} : "${r.service_name}" chez ${r.salon_name || r.pro_name}. ${r.crg_code ? `🔑 Code : ${r.crg_code}` : ''}`,
      link: '/rendez-vous', read: false,
      data: { reservation_id: r.id, gcal_link: gcalLink },
    });

    await supabaseAdmin.from('Notification').insert({
      user_email: r.pro_email, type: 'reservation',
      title: '⏳ RDV dans 2h',
      body: `Dans 2h : ${r.client_name} à ${r.time_slot} pour "${r.service_name}"`,
      link: '/pro/gestion-agenda', read: false,
    });

    await supabaseAdmin.from('Reservation').update({ reminder_2h_sent: true }).eq('id', r.id);
    sent++;
  }
  return { type: '2h', sent, date: todayStr };
}

export const sendReservationReminders = async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'] || req.body._adminToken || '';
    const expectedToken = process.env.ADMIN_SECRET_TOKEN;

    if (!adminToken || !expectedToken || adminToken !== expectedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const type = req.body.type || '24h';
    const result = type === '2h' ? await send2hReminders() : await send24hReminders();
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('sendReservationReminders error:', error);
    return res.status(500).json({ error: error.message });
  }
};
