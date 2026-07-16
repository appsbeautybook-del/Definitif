import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Appelé manuellement depuis le frontend pour créditer des points
// action: "reservation" | "avis" | "commande" | "parrainage"
// Pour les pros: action: "pro_reservation" | "pro_avis" | "pro_parrainage_pro"

const POINTS_CLIENT = {
  reservation: 50,
  avis: 30,
  commande_10: 10, // par tranche de 10€
  parrainage: 200,
  rdv_honore: 20,
};

const POINTS_PRO = {
  pro_reservation: 30,      // par réservation confirmée
  pro_avis_recu: 40,        // par avis 5 étoiles reçu
  pro_service_cree: 20,     // par nouveau service publié
  pro_parrainage_pro: 500,  // parrainer un autre pro
  pro_abonnement: 100,      // renouvellement abonnement
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, label, amount } = await req.json();

    if (!action) return Response.json({ error: 'action requis' }, { status: 400 });

    const isPro = action.startsWith('pro_');

    if (isPro) {
      // Programme fidélité PRO
      const records = await base44.entities.PointsFidelitePro.filter({ pro_email: user.email }, null, 1);
      let record = records[0];

      if (!record) {
        const code = (user.full_name || "PRO").split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "") + "PRO" + Math.floor(1000 + Math.random() * 9000);
        record = await base44.entities.PointsFidelitePro.create({
          pro_email: user.email,
          points_total: 0,
          points_depenses: 0,
          niveau: "Bronze",
          historique: [],
          code_parrainage: code,
        });
      }

      let pts = POINTS_PRO[action];
      if (!pts && action === 'pro_commande') {
        pts = Math.floor((amount || 0) / 10) * 10;
      }
      if (!pts || pts <= 0) return Response.json({ error: 'Action inconnue ou montant invalide' }, { status: 400 });

      const newTotal = (record.points_total || 0) + pts;
      const newNiveau = newTotal >= 5000 ? 'Elite' : newTotal >= 2000 ? 'Gold' : newTotal >= 500 ? 'Silver' : 'Bronze';

      const entry = {
        label: label || action,
        pts,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: 'credit',
      };

      await base44.entities.PointsFidelitePro.update(record.id, {
        points_total: newTotal,
        niveau: newNiveau,
        historique: [entry, ...(record.historique || [])].slice(0, 50),
        reservations_count: action === 'pro_reservation' ? (record.reservations_count || 0) + 1 : record.reservations_count,
      });

      return Response.json({ ok: true, pts_added: pts, new_total: newTotal, niveau: newNiveau });

    } else {
      // Programme fidélité CLIENT
      const records = await base44.entities.PointsFidelite.filter({ user_email: user.email }, null, 1);
      let record = records[0];

      if (!record) {
        const code = (user.full_name || "USER").split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "") + Math.floor(1000 + Math.random() * 9000);
        record = await base44.entities.PointsFidelite.create({
          user_email: user.email,
          points_total: 0,
          points_depenses: 0,
          niveau: 'Silver',
          historique: [],
          code_parrainage: code,
        });
      }

      let pts = POINTS_CLIENT[action];
      if (!pts && action === 'commande') {
        pts = Math.floor((amount || 0) / 10) * POINTS_CLIENT.commande_10;
      }
      if (!pts || pts <= 0) return Response.json({ error: 'Action inconnue' }, { status: 400 });

      const newTotal = (record.points_total || 0) + pts;
      const newNiveau = newTotal >= 2500 ? 'Platinum' : newTotal >= 1000 ? 'Gold' : 'Silver';

      const entry = {
        label: label || action,
        pts,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: 'credit',
      };

      await base44.entities.PointsFidelite.update(record.id, {
        points_total: newTotal,
        niveau: newNiveau,
        historique: [entry, ...(record.historique || [])].slice(0, 50),
      });

      return Response.json({ ok: true, pts_added: pts, new_total: newTotal, niveau: newNiveau });
    }

  } catch (error) {
    console.error('addFidelitePoints error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});