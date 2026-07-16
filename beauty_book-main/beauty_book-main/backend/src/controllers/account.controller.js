import { supabaseAdmin } from '../config/supabase.js';

export const deleteAccount = async (req, res) => {
  try {
    const email = req.user.email;
    const userId = req.user.id;

    console.log(`Suppression du compte pour: ${email} (${userId})`);

    // Helper functions to simplify deletion calls
    const deleteByFilter = async (table, filterCol, filterVal) => {
      const { data: items } = await supabaseAdmin.from(table).select('id').eq(filterCol, filterVal).limit(500);
      if (items && items.length > 0) {
        await Promise.all(items.map(i => supabaseAdmin.from(table).delete().eq('id', i.id)));
      }
    };

    // Run deletions in parallel where possible
    const deletions = await Promise.allSettled([
      deleteByFilter('Reservation', 'client_email', email),
      deleteByFilter('Reservation', 'pro_email', email),
      deleteByFilter('ProfilPro', 'user_email', email),
      deleteByFilter('Service', 'pro_email', email),
      deleteByFilter('Style', 'pro_email', email),
      deleteByFilter('Reel', 'author_email', email),
      deleteByFilter('Avis', 'auteur_email', email),
      deleteByFilter('MessageChat', 'sender_email', email),
      deleteByFilter('Notification', 'user_email', email),
      deleteByFilter('Panier', 'user_email', email),
      deleteByFilter('Commande', 'client_email', email),
      deleteByFilter('DemandeProV2', 'user_email', email),
      deleteByFilter('MariaConversation', 'user_email', email),
      deleteByFilter('CommentaireStyle', 'user_email', email),
      deleteByFilter('Repub', 'user_email', email),
      deleteByFilter('PointsFidelite', 'user_email', email),
      deleteByFilter('LiveSession', 'host_email', email),
      deleteByFilter('LiveMessage', 'sender_email', email),
      deleteByFilter('Avis', 'cible_email', email)
    ]);

    // Log non-blocking deletion errors
    deletions.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`Erreur suppression groupe ${i}:`, result.reason);
      }
    });

    // Delete user from auth schema
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      console.error('Failed to delete user from auth schema:', deleteUserError);
      throw deleteUserError;
    }

    // Since deleting auth.users doesn't necessarily delete the profiles record if there's no cascade trigger:
    // Try manually deleting profile to be safe
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    console.log(`Compte supprimé avec succès: ${email}`);

    return res.json({ success: true });
  } catch (error) {
    console.error('deleteAccount error:', error);
    return res.status(500).json({ error: error.message });
  }
};

const POINTS_CLIENT = {
  reservation: 50,
  avis: 30,
  commande_10: 10, // par tranche de 10€
  parrainage: 200,
  rdv_honore: 20,
};

const POINTS_PRO = {
  pro_reservation: 30,
  pro_avis_recu: 40,
  pro_service_cree: 20,
  pro_parrainage_pro: 500,
  pro_abonnement: 100,
};

export const addFidelitePoints = async (req, res) => {
  try {
    const user = req.user;
    const { action, label, amount } = req.body;

    if (!action) return res.status(400).json({ error: 'action requis' });

    const isPro = action.startsWith('pro_');

    if (isPro) {
      const { data: records } = await supabaseAdmin
        .from('PointsFidelitePro')
        .select('*')
        .eq('pro_email', user.email)
        .limit(1);
        
      let record = records && records.length > 0 ? records[0] : null;

      if (!record) {
        const code = (user.email.split('@')[0].toUpperCase().replace(/[^A-Z]/g, "") || "PRO") + "PRO" + Math.floor(1000 + Math.random() * 9000);
        const { data: inserted } = await supabaseAdmin.from('PointsFidelitePro').insert({
          pro_email: user.email,
          points_total: 0,
          points_depenses: 0,
          niveau: "Bronze",
          historique: [],
          code_parrainage: code,
        }).select().single();
        record = inserted;
      }

      let pts = POINTS_PRO[action];
      if (!pts && action === 'pro_commande') {
        pts = Math.floor((amount || 0) / 10) * 10;
      }
      if (!pts || pts <= 0) return res.status(400).json({ error: 'Action inconnue ou montant invalide' });

      const newTotal = (record.points_total || 0) + pts;
      const newNiveau = newTotal >= 5000 ? 'Elite' : newTotal >= 2000 ? 'Gold' : newTotal >= 500 ? 'Silver' : 'Bronze';

      const entry = {
        label: label || action,
        pts,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: 'credit',
      };

      await supabaseAdmin.from('PointsFidelitePro').update({
        points_total: newTotal,
        niveau: newNiveau,
        historique: [entry, ...(record.historique || [])].slice(0, 50),
        reservations_count: action === 'pro_reservation' ? (record.reservations_count || 0) + 1 : record.reservations_count,
      }).eq('id', record.id);

      return res.json({ ok: true, pts_added: pts, new_total: newTotal, niveau: newNiveau });

    } else {
      const { data: records } = await supabaseAdmin
        .from('PointsFidelite')
        .select('*')
        .eq('user_email', user.email)
        .limit(1);
        
      let record = records && records.length > 0 ? records[0] : null;

      if (!record) {
        const code = (user.email.split('@')[0].toUpperCase().replace(/[^A-Z]/g, "") || "USER") + Math.floor(1000 + Math.random() * 9000);
        const { data: inserted } = await supabaseAdmin.from('PointsFidelite').insert({
          user_email: user.email,
          points_total: 0,
          points_depenses: 0,
          niveau: 'Silver',
          historique: [],
          code_parrainage: code,
        }).select().single();
        record = inserted;
      }

      let pts = POINTS_CLIENT[action];
      if (!pts && action === 'commande') {
        pts = Math.floor((amount || 0) / 10) * POINTS_CLIENT.commande_10;
      }
      if (!pts || pts <= 0) return res.status(400).json({ error: 'Action inconnue' });

      const newTotal = (record.points_total || 0) + pts;
      const newNiveau = newTotal >= 2500 ? 'Platinum' : newTotal >= 1000 ? 'Gold' : 'Silver';

      const entry = {
        label: label || action,
        pts,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: 'credit',
      };

      await supabaseAdmin.from('PointsFidelite').update({
        points_total: newTotal,
        niveau: newNiveau,
        historique: [entry, ...(record.historique || [])].slice(0, 50),
      }).eq('id', record.id);

      return res.json({ ok: true, pts_added: pts, new_total: newTotal, niveau: newNiveau });
    }
  } catch (error) {
    console.error('addFidelitePoints error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const creditFideliteAuto = async (req, res) => {
  try {
    const { data, old_data } = req.body;

    if (!data || data.status !== "termine") {
      return res.json({ ok: true, skipped: "not termine" });
    }
    if (old_data?.status === "termine") {
      return res.json({ ok: true, skipped: "already was termine" });
    }

    const clientEmail = data.client_email;
    const proEmail = data.pro_email;
    const serviceName = data.service_name || "Service beauté";
    const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

    if (clientEmail) {
      const { data: existingClient } = await supabaseAdmin.from('PointsFidelite').select('*').eq('user_email', clientEmail).limit(1);
      if (existingClient && existingClient.length > 0) {
        const rec = existingClient[0];
        const newTotal = (rec.points_total || 0) + 50;
        const newNiveau = newTotal >= 2500 ? "Platinum" : newTotal >= 1000 ? "Gold" : "Silver";
        const entry = { label: `Réservation : ${serviceName}`, pts: 50, date: dateStr, type: "credit" };
        await supabaseAdmin.from('PointsFidelite').update({
          points_total: newTotal,
          niveau: newNiveau,
          historique: [entry, ...(rec.historique || [])].slice(0, 50),
        }).eq('id', rec.id);
      }
    }

    if (proEmail) {
      const { data: existingPro } = await supabaseAdmin.from('PointsFidelitePro').select('*').eq('pro_email', proEmail).limit(1);
      if (existingPro && existingPro.length > 0) {
        const rec = existingPro[0];
        const newTotal = (rec.points_total || 0) + 30;
        const newNiveau = newTotal >= 5000 ? "Elite" : newTotal >= 2000 ? "Gold" : newTotal >= 500 ? "Silver" : "Bronze";
        const entry = { label: `Réservation terminée : ${serviceName}`, pts: 30, date: dateStr, type: "credit" };
        await supabaseAdmin.from('PointsFidelitePro').update({
          points_total: newTotal,
          niveau: newNiveau,
          reservations_count: (rec.reservations_count || 0) + 1,
          historique: [entry, ...(rec.historique || [])].slice(0, 50),
        }).eq('id', rec.id);
      }
    }

    return res.json({ ok: true, credited_client: 50, credited_pro: 30 });
  } catch (error) {
    console.error("creditFideliteAuto error:", error);
    return res.status(500).json({ error: error.message });
  }
};
