-- Fonction pour supprimer un utilisateur auth et toutes ses données
-- Exécuter dans l'éditeur SQL Supabase

-- 1. Créer la fonction SQL qui supprime l'utilisateur
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  uemail TEXT;
BEGIN
  -- Récupérer l'ID et l'email de l'utilisateur connecté
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non connecté';
  END IF;
  
  uemail := (SELECT email FROM auth.users WHERE id = uid);
  
  -- Supprimer toutes les données utilisateur
  DELETE FROM "Reel" WHERE author_email = uemail;
  DELETE FROM "Style" WHERE author_email = uemail;
  DELETE FROM "Publication" WHERE author_email = uemail;
  DELETE FROM "Repub" WHERE user_email = uemail;
  DELETE FROM "reel_comment" WHERE user_email = uemail;
  DELETE FROM "user_like" WHERE user_email = uemail;
  DELETE FROM "user_favorite" WHERE user_email = uemail;
  DELETE FROM "user_follow" WHERE follower_email = uemail OR followed_email = uemail;
  DELETE FROM "Service" WHERE pro_email = uemail;
  DELETE FROM "VisiteVirtuelle" WHERE pro_email = uemail;
  DELETE FROM "CatalogueOption" WHERE pro_email = uemail;
  DELETE FROM "ProfilPro" WHERE user_email = uemail;
  DELETE FROM "MembreEquipe" WHERE pro_email = uemail OR membre_email = uemail;
  DELETE FROM "Client" WHERE pro_email = uemail OR email = uemail;
  DELETE FROM "Annonce" WHERE pro_email = uemail;
  DELETE FROM "Reservation" WHERE client_email = uemail;
  DELETE FROM "Commande" WHERE client_email = uemail;
  DELETE FROM "PointsFidelite" WHERE user_email = uemail;
  DELETE FROM "SoldeBeautyPay" WHERE user_email = uemail;
  DELETE FROM "Notification" WHERE user_email = uemail;
  DELETE FROM "MessageChat" WHERE sender_email = uemail OR receiver_email = uemail;
  DELETE FROM "LiveSession" WHERE host_email = uemail;
  DELETE FROM "LiveMessage" WHERE user_email = uemail;
  DELETE FROM "CallSignal" WHERE caller_email = uemail OR callee_email = uemail;
  DELETE FROM "DemandeProV2" WHERE user_email = uemail;
  DELETE FROM "DemandefFranchise" WHERE user_email = uemail;
  DELETE FROM "RoutineBeaute" WHERE user_email = uemail;
  DELETE FROM "MariaConversation" WHERE user_email = uemail;
  DELETE FROM "profiles" WHERE id = uid;
  
  -- Supprimer l'utilisateur auth (nécessite service_role)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

-- 2. Donner les permissions nécessaires
-- La fonction est SECURITY DEFINER, donc elle s'exécute avec les droits du propriétaire
-- Il faut juste que les utilisateurs authentifiés puissent l'appeler
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- 3. Test : appeler la fonction (décommenter pour tester)
-- SELECT delete_user();
