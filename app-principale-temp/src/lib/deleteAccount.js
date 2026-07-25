import { supabase } from '@/api/supabaseClient';

/**
 * Supprime TOUTES les données utilisateur + le compte auth.
 * Utilise la fonction SQL delete_user() qui bypass RLS (SECURITY DEFINER).
 *
 * @param {string} userEmail - Email de l'utilisateur
 * @param {string} userId - ID de l'utilisateur (UUID auth)
 * @returns {Promise<{success: boolean, errors: string[]}>}
 */
export async function deleteAccountData(userEmail, userId) {
  const errors = [];

  // ── Méthode 1 : Fonction SQL delete_user() (bypass RLS) ──
  try {
    const { error } = await supabase.rpc('delete_user');
    if (!error) {
      console.log('[deleteAccount] SQL delete_user() executed successfully');
      return { success: true, errors: [] };
    }
    console.warn('[deleteAccount] SQL delete_user() failed:', error.message);
    errors.push(`SQL delete_user: ${error.message}`);
  } catch (e) {
    console.warn('[deleteAccount] SQL delete_user() exception:', e.message);
    errors.push(`SQL delete_user: ${e.message}`);
  }

  // ── Méthode 2 : Fallback — suppression client-side (nécessite RLS DELETE policies) ──
  console.log('[deleteAccount] Falling back to client-side deletion...');

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

  return { success: errors.length === 0, errors };
}
