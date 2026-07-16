import { supabaseAdmin } from '../config/supabase.js';

// POST /api/reservations/complete
export const completeReservation = async (req, res) => {
  try {
    const user = req.user;
    const { reservation_id } = req.body;
    if (!reservation_id) return res.status(400).json({ error: 'reservation_id requis' });

    const { data: r, error: fetchErr } = await supabaseAdmin
      .from('Reservation').select('*').eq('id', reservation_id).single();
    if (fetchErr || !r) return res.status(404).json({ error: 'Réservation introuvable' });

    // Fetch the user profile to check email
    const { data: userProfile } = await supabaseAdmin
      .from('profiles').select('email').eq('id', user.id).single();

    if (r.pro_email !== userProfile?.email) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await supabaseAdmin.from('Reservation').update({
      status: 'termine', completed_at: new Date().toISOString(),
    }).eq('id', reservation_id);

    // Loyalty points: 1 point per euro
    const pts = Math.floor(r.total_price || r.service_price || 0);

    const { data: existingPoints } = await supabaseAdmin
      .from('PointsFidelite').select('*').eq('user_email', r.client_email).limit(1);

    if (existingPoints?.[0]) {
      const current = existingPoints[0];
      const newTotal = (current.points_total || 0) + pts;
      const niveau = newTotal >= 500 ? 'Platinum' : newTotal >= 150 ? 'Gold' : 'Silver';
      const historique = [
        ...(current.historique || []),
        { label: `Prestation : ${r.service_name}`, pts, date: new Date().toISOString().slice(0, 10), type: 'credit' }
      ];
      await supabaseAdmin.from('PointsFidelite').update({ points_total: newTotal, niveau, historique }).eq('id', current.id);
    } else {
      await supabaseAdmin.from('PointsFidelite').insert({
        user_email: r.client_email, points_total: pts, points_depenses: 0,
        niveau: pts >= 500 ? 'Platinum' : pts >= 150 ? 'Gold' : 'Silver',
        historique: [{ label: `Prestation : ${r.service_name}`, pts, date: new Date().toISOString().slice(0, 10), type: 'credit' }],
      });
    }

    // Notifications
    await supabaseAdmin.from('Notification').insert([
      {
        user_email: r.client_email, type: 'promo',
        title: `🌟 +${pts} points fidélité gagnés !`,
        body: `Bravo ! Vous avez gagné ${pts} points suite à votre prestation "${r.service_name}" chez ${r.salon_name || r.pro_name}.`,
        link: '/programme-fidelite', read: false, data: { pts_earned: pts, reservation_id },
      },
      {
        user_email: r.client_email, type: 'avis',
        title: '⭐ Donnez votre avis !',
        body: `Comment s'est passée votre séance "${r.service_name}" chez ${r.salon_name || r.pro_name} ? Votre avis aide la communauté 💬`,
        link: `/service/${r.service_id}?avis=1&reservation_id=${reservation_id}`, read: false,
        data: { reservation_id, pro_email: r.pro_email, service_id: r.service_id, service_name: r.service_name, can_review: true },
      }
    ]);

    return res.json({ success: true, pts_earned: pts, reservation_id });
  } catch (error) {
    console.error('❌ completeReservation error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/reservations/:id
export const updateReservation = async (req, res) => {
  try {
    const user = req.user;
    const reservationId = req.params.id;
    const { status, payment_status } = req.body;

    if (!reservationId) return res.status(400).json({ error: 'reservationId requis' });

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('Reservation').select('*').eq('id', reservationId).single();
    if (fetchErr || !existing) return res.status(404).json({ error: 'Réservation introuvable' });

    const { data: userProfile } = await supabaseAdmin
      .from('profiles').select('email').eq('id', user.id).single();

    if (existing.pro_email !== userProfile?.email && existing.client_email !== userProfile?.email) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;

    const { data: reservation, error: updateErr } = await supabaseAdmin
      .from('Reservation').update(updates).eq('id', reservationId).select().single();
    if (updateErr) return res.status(500).json({ error: updateErr.message });

    // Notify client if pro updates status
    if (existing.pro_email === userProfile?.email && status) {
      const statusLabels = { confirme: 'confirmée ✅', annule: 'annulée ❌', termine: 'terminée' };
      await supabaseAdmin.from('Notification').insert({
        user_email: existing.client_email, type: 'reservation',
        title: 'Mise à jour de votre réservation',
        body: `Votre réservation "${existing.service_name}" a été ${statusLabels[status] || status}`,
        link: '/rendez-vous', read: false,
      });
    }

    return res.json({ reservation, success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/reservations/list
export const getReservations = async (req, res) => {
  try {
    const user = req.user;
    const { role = 'client', status } = req.body || {};

    const { data: userProfile } = await supabaseAdmin
      .from('profiles').select('email').eq('id', user.id).single();

    let query = supabaseAdmin.from('Reservation').select('*').order('date', { ascending: false }).limit(50);
    if (role === 'pro') {
      query = query.eq('pro_email', userProfile?.email);
    } else {
      query = query.eq('client_email', userProfile?.email);
    }
    if (status) query = query.eq('status', status);

    const { data: reservations, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.json({ reservations: reservations || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
