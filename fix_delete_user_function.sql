-- Fonction pour supprimer un utilisateur et TOUTES ses données
-- SECURITY DEFINER = bypass RLS, exécute avec les droits du propriétaire
-- Exécuter dans l'éditeur SQL Supabase

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  uemail TEXT;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non connecté';
  END IF;

  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF uemail IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;

  -- ══════════════════════════════════════════════
  -- SOCIAL / PUBLICATIONS
  -- ══════════════════════════════════════════════
  DELETE FROM "Repub" WHERE user_email = uemail;
  DELETE FROM "reel_comment" WHERE user_email = uemail;
  DELETE FROM "user_like" WHERE user_email = uemail;
  DELETE FROM "user_favorite" WHERE user_email = uemail;
  DELETE FROM "user_follow" WHERE follower_email = uemail OR followed_email = uemail;
  DELETE FROM "Reel" WHERE author_email = uemail;
  DELETE FROM "Style" WHERE author_email = uemail;
  DELETE FROM "Publication" WHERE author_email = uemail;

  -- ══════════════════════════════════════════════
  -- SERVICES / PRO
  -- ══════════════════════════════════════════════
  DELETE FROM "CatalogueOption" WHERE pro_email = uemail;
  DELETE FROM "MembreEquipe" WHERE pro_email = uemail OR membre_email = uemail;
  DELETE FROM "Client" WHERE pro_email = uemail OR email = uemail;
  DELETE FROM "Annonce" WHERE pro_email = uemail;
  DELETE FROM "VisiteVirtuelle" WHERE pro_email = uemail;
  DELETE FROM "Service" WHERE pro_email = uemail;
  DELETE FROM "ProfilPro" WHERE user_email = uemail;

  -- ══════════════════════════════════════════════
  -- RÉSERVATIONS / COMMANDES
  -- ══════════════════════════════════════════════
  DELETE FROM "Reservation" WHERE client_email = uemail;
  DELETE FROM "Commande" WHERE client_email = uemail;

  -- ══════════════════════════════════════════════
  -- FINANCE
  -- ══════════════════════════════════════════════
  DELETE FROM "PointsFidelite" WHERE user_email = uemail;
  DELETE FROM "SoldeBeautyPay" WHERE user_email = uemail;

  -- ══════════════════════════════════════════════
  -- COMMUNICATION
  -- ══════════════════════════════════════════════
  DELETE FROM "Notification" WHERE user_email = uemail;
  DELETE FROM "MessageChat" WHERE sender_email = uemail OR receiver_email = uemail;
  DELETE FROM "LiveMessage" WHERE user_email = uemail;
  DELETE FROM "LiveSession" WHERE host_email = uemail;

  -- ══════════════════════════════════════════════
  -- APPELS
  -- ══════════════════════════════════════════════
  DELETE FROM "CallSignal" WHERE caller_email = uemail OR callee_email = uemail;

  -- ══════════════════════════════════════════════
  -- DEMANDES / FORMULAIRES
  -- ══════════════════════════════════════════════
  DELETE FROM "DemandeProV2" WHERE user_email = uemail;
  DELETE FROM "DemandefFranchise" WHERE user_email = uemail;

  -- ══════════════════════════════════════════════
  -- ROUTINES / MARIA
  -- ══════════════════════════════════════════════
  DELETE FROM "RoutineBeaute" WHERE user_email = uemail;
  DELETE FROM "MariaConversation" WHERE user_email = uemail;

  -- ══════════════════════════════════════════════
  -- PROFIL
  -- ══════════════════════════════════════════════
  DELETE FROM "profiles" WHERE id = uid;

  -- ══════════════════════════════════════════════
  -- UTILISATEUR AUTH (dernier)
  -- ══════════════════════════════════════════════
  DELETE FROM auth.users WHERE id = uid;

END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
