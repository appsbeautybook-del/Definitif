import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { reservationId, status, payment_status } = body;

    if (!reservationId) return Response.json({ error: 'reservationId requis' }, { status: 400 });

    const existing = await base44.asServiceRole.entities.Reservation.get(reservationId);
    if (!existing) return Response.json({ error: 'Réservation introuvable' }, { status: 404 });

    // Only the pro or client can update
    if (existing.pro_email !== user.email && existing.client_email !== user.email) {
      return Response.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const updates = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;

    const reservation = await base44.asServiceRole.entities.Reservation.update(reservationId, updates);

    // Notify client if pro updates
    if (existing.pro_email === user.email && status) {
      const statusLabels = {
        confirme: "confirmée ✅",
        annule: "annulée ❌",
        termine: "terminée",
      };
      await base44.asServiceRole.entities.Notification.create({
        user_email: existing.client_email,
        type: "reservation",
        title: "Mise à jour de votre réservation",
        body: `Votre réservation "${existing.service_name}" a été ${statusLabels[status] || status}`,
        link: "/rendez-vous",
        read: false,
      });
    }

    return Response.json({ reservation, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});