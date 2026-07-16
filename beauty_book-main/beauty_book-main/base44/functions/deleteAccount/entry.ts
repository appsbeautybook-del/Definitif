import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const email = user.email;
    const userId = user.id;

    console.log(`Suppression du compte pour: ${email} (${userId})`);

    // Supprimer toutes les données liées à l'utilisateur en parallèle
    const deletions = await Promise.allSettled([
      // Réservations (client ou pro)
      base44.asServiceRole.entities.Reservation.filter({ client_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Reservation.delete(i.id)))),
      base44.asServiceRole.entities.Reservation.filter({ pro_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Reservation.delete(i.id)))),

      // Profil Pro
      base44.asServiceRole.entities.ProfilPro.filter({ user_email: email }, '-created_date', 10)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.ProfilPro.delete(i.id)))),

      // Services
      base44.asServiceRole.entities.Service.filter({ pro_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Service.delete(i.id)))),

      // Styles
      base44.asServiceRole.entities.Style.filter({ pro_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Style.delete(i.id)))),

      // Reels / Publications
      base44.asServiceRole.entities.Reel.filter({ author_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Reel.delete(i.id)))),

      // Avis (auteur ou cible)
      base44.asServiceRole.entities.Avis.filter({ auteur_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Avis.delete(i.id)))),

      // Messages
      base44.asServiceRole.entities.MessageChat.filter({ sender_email: email }, '-created_date', 500)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.MessageChat.delete(i.id)))),

      // Notifications
      base44.asServiceRole.entities.Notification.filter({ user_email: email }, '-created_date', 500)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Notification.delete(i.id)))),

      // Panier
      base44.asServiceRole.entities.Panier.filter({ user_email: email }, '-created_date', 10)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Panier.delete(i.id)))),

      // Commandes
      base44.asServiceRole.entities.Commande.filter({ client_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Commande.delete(i.id)))),

      // Demandes Pro
      base44.asServiceRole.entities.DemandeProV2.filter({ user_email: email }, '-created_date', 10)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.DemandeProV2.delete(i.id)))),

      // Conversations Maria
      base44.asServiceRole.entities.MariaConversation.filter({ user_email: email }, '-created_date', 50)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.MariaConversation.delete(i.id)))),

      // Commentaires styles
      base44.asServiceRole.entities.CommentaireStyle.filter({ user_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.CommentaireStyle.delete(i.id)))),

      // Repubs
      base44.asServiceRole.entities.Repub.filter({ user_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Repub.delete(i.id)))),

      // Points fidélité
      base44.asServiceRole.entities.PointsFidelite.filter({ user_email: email }, '-created_date', 10)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.PointsFidelite.delete(i.id)))),

      // Live sessions & messages
      base44.asServiceRole.entities.LiveSession.filter({ host_email: email }, '-created_date', 50)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.LiveSession.delete(i.id)))),
      base44.asServiceRole.entities.LiveMessage.filter({ sender_email: email }, '-created_date', 500)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.LiveMessage.delete(i.id)))),

      // Avis (cible aussi)
      base44.asServiceRole.entities.Avis.filter({ cible_email: email }, '-created_date', 200)
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Avis.delete(i.id)))),
    ]);

    // Logger les éventuelles erreurs de suppression (non bloquantes)
    deletions.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`Erreur suppression groupe ${i}:`, result.reason);
      }
    });

    // Supprimer le compte utilisateur lui-même
    await base44.asServiceRole.entities.User.delete(userId);
    console.log(`Compte supprimé avec succès: ${email}`);

    return Response.json({ success: true });

  } catch (error) {
    console.error('deleteAccount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});