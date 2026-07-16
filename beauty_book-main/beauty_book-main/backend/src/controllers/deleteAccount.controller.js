import { supabaseAdmin } from '../config/supabase.js';

// Delete user account and all associated data
export const deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Non authentifié' });

    const email = user.email;
    const userId = user.id;

    console.log(`Suppression du compte pour: ${email} (${userId})`);

    // Delete all user data in parallel
    const tables = [
      { table: 'Reservation', column: 'client_email', value: email },
      { table: 'Reservation', column: 'pro_email', value: email },
      { table: 'ProfilPro', column: 'user_email', value: email },
      { table: 'Service', column: 'pro_email', value: email },
      { table: 'Style', column: 'pro_email', value: email },
      { table: 'Reel', column: 'author_email', value: email },
      { table: 'Avis', column: 'auteur_email', value: email },
      { table: 'Avis', column: 'cible_email', value: email },
      { table: 'MessageChat', column: 'sender_email', value: email },
      { table: 'Notification', column: 'user_email', value: email },
      { table: 'Panier', column: 'user_email', value: email },
      { table: 'Commande', column: 'client_email', value: email },
      { table: 'DemandeProV2', column: 'user_email', value: email },
      { table: 'MariaConversation', column: 'user_email', value: email },
      { table: 'CommentaireStyle', column: 'user_email', value: email },
      { table: 'Repub', column: 'user_email', value: email },
      { table: 'PointsFidelite', column: 'user_email', value: email },
      { table: 'LiveSession', column: 'host_email', value: email },
      { table: 'LiveMessage', column: 'sender_email', value: email },
    ];

    const deletions = await Promise.allSettled(
      tables.map(({ table, column, value }) =>
        supabaseAdmin.from(table).delete().eq(column, value)
      )
    );

    deletions.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`Erreur suppression groupe ${i} (${tables[i].table}):`, result.reason);
      }
    });

    // Delete from auth.users via supabase admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      throw deleteError;
    }

    console.log(`Compte supprimé avec succès: ${email}`);
    return res.json({ success: true });
  } catch (error) {
    console.error('deleteAccount error:', error);
    return res.status(500).json({ error: error.message });
  }
};
