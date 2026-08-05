-- FIX_RLS_PROFILPRO.sql
-- Permet aux utilisateurs de modifier leur propre profil Pro par email

-- 1. Supprimer les anciennes policies UPDATE restrictives
DROP POLICY IF EXISTS "ProfilPro: modif propriétaire" ON public."ProfilPro";
DROP POLICY IF EXISTS "pp_update_auth" ON public."ProfilPro";

-- 2. Créer une policy UPDATE qui permet à l'utilisateur de modifier son propre profil
CREATE POLICY "profilpro_update_own"
  ON public."ProfilPro"
  FOR UPDATE
  USING (
    auth.uid() = created_by_id
    OR user_email = auth.email()
    OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. S'assurer que RLS est activé
ALTER TABLE public."ProfilPro" ENABLE ROW LEVEL SECURITY;
