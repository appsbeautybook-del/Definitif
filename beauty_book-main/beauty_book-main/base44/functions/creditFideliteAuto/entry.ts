import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Automation déclenchée quand une réservation passe en status "termine"
// Crédite le client (+50 pts) et le pro (+30 pts)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, old_data, event } = await req.json();

    // Vérifier que c'est bien un passage en "termine"
    if (!data || data.status !== "termine") {
      return Response.json({ ok: true, skipped: "not termine" });
    }
    if (old_data?.status === "termine") {
      return Response.json({ ok: true, skipped: "already was termine" });
    }

    const clientEmail = data.client_email;
    const proEmail = data.pro_email;
    const serviceName = data.service_name || "Service beauté";
    const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

    // ── Créditer le CLIENT (+50 pts) ─────────────────────────────────────────
    if (clientEmail) {
      const existing = await base44.asServiceRole.entities.PointsFidelite.filter({ user_email: clientEmail }, null, 1).catch(() => []);
      if (existing.length > 0) {
        const rec = existing[0];
        const newTotal = (rec.points_total || 0) + 50;
        const newNiveau = newTotal >= 2500 ? "Platinum" : newTotal >= 1000 ? "Gold" : "Silver";
        const entry = { label: `Réservation : ${serviceName}`, pts: 50, date: dateStr, type: "credit" };
        await base44.asServiceRole.entities.PointsFidelite.update(rec.id, {
          points_total: newTotal,
          niveau: newNiveau,
          historique: [entry, ...(rec.historique || [])].slice(0, 50),
        }).catch(() => {});
      }
    }

    // ── Créditer le PRO (+30 pts) ─────────────────────────────────────────────
    if (proEmail) {
      const existing = await base44.asServiceRole.entities.PointsFidelitePro.filter({ pro_email: proEmail }, null, 1).catch(() => []);
      if (existing.length > 0) {
        const rec = existing[0];
        const newTotal = (rec.points_total || 0) + 30;
        const newNiveau = newTotal >= 5000 ? "Elite" : newTotal >= 2000 ? "Gold" : newTotal >= 500 ? "Silver" : "Bronze";
        const entry = { label: `Réservation terminée : ${serviceName}`, pts: 30, date: dateStr, type: "credit" };
        await base44.asServiceRole.entities.PointsFidelitePro.update(rec.id, {
          points_total: newTotal,
          niveau: newNiveau,
          reservations_count: (rec.reservations_count || 0) + 1,
          historique: [entry, ...(rec.historique || [])].slice(0, 50),
        }).catch(() => {});
      }
    }

    return Response.json({ ok: true, credited_client: 50, credited_pro: 30 });

  } catch (error) {
    console.error("creditFideliteAuto error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});