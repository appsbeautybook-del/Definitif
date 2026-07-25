import { supabase } from '@/api/supabaseClient';

/**
 * Supprime toutes les données utilisateur de toutes les tables Supabase.
 * La suppression de l'utilisateur auth doit être faite séparément (via Edge Function ou dashboard).
 *
 * @param {string} userEmail - Email de l'utilisateur
 * @param {string} userId - ID de l'utilisateur (UUID auth)
 * @returns {Promise<{success: boolean, deleted: string[], errors: string[]}>}
 */
export async function deleteAccountData(userEmail, userId) {
  const deleted = [];
  const errors = [];

  // Helper: delete rows matching a filter
  async function safeDelete(table, filters, label) {
    try {
      let query = supabase.from(table).delete();
      for (const [col, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null) {
          query = query.eq(col, val);
        }
      }
      const { error } = await query;
      if (error) {
        console.warn(`[deleteAccount] ${table} delete error:`, error.message);
        errors.push(`${label}: ${error.message}`);
      } else {
        deleted.push(label);
      }
    } catch (e) {
      console.warn(`[deleteAccount] ${table} exception:`, e.message);
      errors.push(`${label}: ${e.message}`);
    }
  }

  // ── Social / Publications ──
  await safeDelete('Reel', { author_email: userEmail }, 'Reels');
  await safeDelete('Style', { author_email: userEmail }, 'Styles');
  await safeDelete('Publication', { author_email: userEmail }, 'Publications');
  await safeDelete('Repub', { user_email: userEmail }, 'Repubs');
  await safeDelete('reel_comment', { user_email: userEmail }, 'Commentaires reels');
  await safeDelete('user_like', { user_email: userEmail }, 'Likes');
  await safeDelete('user_favorite', { user_email: userEmail }, 'Favoris');
  await safeDelete('user_follow', { follower_email: userEmail }, 'Abonnements sortants');
  await safeDelete('user_follow', { followed_email: userEmail }, 'Abonnés');

  // ── Services / Pro ──
  await safeDelete('Service', { pro_email: userEmail }, 'Services');
  await safeDelete('VisiteVirtuelle', { pro_email: userEmail }, 'Visites virtuelles');
  await safeDelete('CatalogueOption', { pro_email: userEmail }, 'Options catalogue');
  await safeDelete('ProfilPro', { user_email: userEmail }, 'Profil pro');
  await safeDelete('MembreEquipe', { pro_email: userEmail }, 'Équipe (pro)');
  await safeDelete('MembreEquipe', { membre_email: userEmail }, 'Équipe (membre)');
  await safeDelete('Client', { pro_email: userEmail }, 'Clients (pro)');
  await safeDelete('Client', { email: userEmail }, 'Client (profil)');
  await safeDelete('Annonce', { pro_email: userEmail }, 'Annonces');

  // ── Réservations / Commandes ──
  await safeDelete('Reservation', { client_email: userEmail }, 'Réservations');
  await safeDelete('Commande', { client_email: userEmail }, 'Commandes');

  // ── Finance ──
  await safeDelete('PointsFidelite', { user_email: userEmail }, 'Points fidélité');
  await safeDelete('SoldeBeautyPay', { user_email: userEmail }, 'Solde BeautyPay');

  // ── Communication ──
  await safeDelete('Notification', { user_email: userEmail }, 'Notifications');
  await safeDelete('MessageChat', { sender_email: userEmail }, 'Messages envoyés');
  await safeDelete('MessageChat', { receiver_email: userEmail }, 'Messages reçus');
  await safeDelete('LiveSession', { host_email: userEmail }, 'Sessions live');
  await safeDelete('LiveMessage', { user_email: userEmail }, 'Messages live');

  // ── Appels ──
  await safeDelete('CallSignal', { caller_email: userEmail }, 'Appels sortants');
  await safeDelete('CallSignal', { callee_email: userEmail }, 'Appels entrants');

  // ── Demandes / Formulaires ──
  await safeDelete('DemandeProV2', { user_email: userEmail }, 'Demandes pro');
  await safeDelete('DemandefFranchise', { user_email: userEmail }, 'Demandes franchise');

  // ── Routines ──
  await safeDelete('RoutineBeaute', { user_email: userEmail }, 'Routines beauté');

  // ── Maria conversations ──
  await safeDelete('MariaConversation', { user_email: userEmail }, 'Conversations Maria');

  // ── Profil (profiles) ──
  if (userId) {
    await safeDelete('profiles', { id: userId }, 'Profil');
  }

  return { success: errors.length === 0, deleted, errors };
}

/**
 * Supprime le compte auth utilisateur (nécessite service_role ou Edge Function).
 * Côté client, on ne peut PAS supprimer l'utilisateur auth directement.
 * Solution: on appelle la fonction SQL `delete_user()` via RPC, ou on nettoie les données
 * et on déconnecte l'utilisateur (la suppression auth se fera côté admin/Edge Function).
 */
export async function deleteAuthUser(userId) {
  // Essayer d'appeler une fonction SQL qui supprime l'utilisateur
  try {
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      console.warn('[deleteAccount] RPC delete_user failed:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[deleteAccount] RPC delete_user exception:', e.message);
    return false;
  }
}
