import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Appelé quand le pro marque une prestation comme "terminée"
// → attribue les points fidélité au client automatiquement
// → envoie une invitation à laisser un avis
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { reservation_id } = await req.json();
    if (!reservation_id) return Response.json({ error: 'reservation_id requis' }, { status: 400 });

    // Charger la réservation
    const reservations = await base44.asServiceRole.entities.Reservation.filter(
      { id: reservation_id }, "-created_date", 1
    );
    const r = reservations[0];
    if (!r) return Response.json({ error: 'Réservation introuvable' }, { status: 404 });

    // Vérifier que c'est bien le pro qui marque comme terminé
    if (r.pro_email !== user.email) {
      return Response.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Marquer la réservation comme terminée
    await base44.asServiceRole.entities.Reservation.update(reservation_id, {
      status: "termine",
      completed_at: new Date().toISOString(),
    });

    // ── Points fidélité : 1 point par euro dépensé ──
    const pts = Math.floor(r.total_price || r.service_price || 0);

    const existingPoints = await base44.asServiceRole.entities.PointsFidelite.filter(
      { user_email: r.client_email }, "-created_date", 1
    );

    if (existingPoints[0]) {
      const current = existingPoints[0];
      const newTotal = (current.points_total || 0) + pts;
      // Niveau selon points totaux
      const niveau = newTotal >= 500 ? "Platinum" : newTotal >= 150 ? "Gold" : "Silver";
      const historique = [
        ...(current.historique || []),
        {
          label: `Prestation : ${r.service_name}`,
          pts,
          date: new Date().toISOString().slice(0, 10),
          type: "credit",
        }
      ];
      await base44.asServiceRole.entities.PointsFidelite.update(current.id, {
        points_total: newTotal,
        niveau,
        historique,
      });
    } else {
      // Créer le compte fidélité
      await base44.asServiceRole.entities.PointsFidelite.create({
        user_email: r.client_email,
        points_total: pts,
        points_depenses: 0,
        niveau: pts >= 500 ? "Platinum" : pts >= 150 ? "Gold" : "Silver",
        historique: [{
          label: `Prestation : ${r.service_name}`,
          pts,
          date: new Date().toISOString().slice(0, 10),
          type: "credit",
        }],
      });
    }

    // ── Notification points au client ──
    await base44.asServiceRole.entities.Notification.create({
      user_email: r.client_email,
      type: "promo",
      title: `🌟 +${pts} points fidélité gagnés !`,
      body: `Bravo ! Vous avez gagné ${pts} points suite à votre prestation "${r.service_name}" chez ${r.salon_name || r.pro_name}. Consultez vos récompenses !`,
      link: "/programme-fidelite",
      read: false,
      data: { pts_earned: pts, reservation_id },
    });

    // ── Invitation à laisser un avis ──
    await base44.asServiceRole.entities.Notification.create({
      user_email: r.client_email,
      type: "avis",
      title: "⭐ Donnez votre avis !",
      body: `Comment s'est passée votre séance "${r.service_name}" chez ${r.salon_name || r.pro_name} ? Votre avis aide la communauté 💬`,
      link: `/service/${r.service_id}?avis=1&reservation_id=${reservation_id}`,
      read: false,
      data: {
        reservation_id,
        pro_email: r.pro_email,
        service_id: r.service_id,
        service_name: r.service_name,
        can_review: true,
      },
    });

    console.log(`✅ Prestation terminée: ${reservation_id} | +${pts} pts pour ${r.client_email}`);

    return Response.json({
      success: true,
      pts_earned: pts,
      reservation_id,
    });
  } catch (error) {
    console.error("❌ completeReservation error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});