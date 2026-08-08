-- COPIEZ-COLLEZ CECI DANS LE SQL EDITOR DE SUPABASE, puis cliquez RUN

-- 1. Créer la table user_follow
CREATE TABLE IF NOT EXISTS public.user_follow (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_email text NOT NULL,
  follower_name text DEFAULT '',
  follower_avatar text DEFAULT '',
  followed_email text NOT NULL,
  followed_name text DEFAULT '',
  followed_avatar text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_email, followed_email)
);

-- 2. Désactiver RLS complètement
ALTER TABLE public.user_follow DISABLE ROW LEVEL SECURITY;

-- 3. Données de test (remplacez par de vrais emails)
-- Décommentez les lignes ci-dessous pour ajouter des test data
-- INSERT INTO public.user_follow (follower_email, follower_name, followed_email, followed_name)
-- VALUES
--   ('test1@example.com', 'Client Test', 'test2@example.com', 'SM Beauty'),
--   ('test2@example.com', 'SM Beauty', 'test1@example.com', 'Client Test');
