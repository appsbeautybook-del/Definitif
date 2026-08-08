-- Fonctions SQL SECURITY DEFINER pour gérer les abonnements
-- Ces fonctions bypassent le RLS car elles s'exécutent en tant que propriétaire de la DB

-- 1. Table user_follow (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.user_follow (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_email text NOT NULL,
  follower_name text DEFAULT '',
  follower_avatar text DEFAULT '',
  followed_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_email, followed_email)
);

ALTER TABLE public.user_follow ENABLE ROW LEVEL SECURITY;

-- Politique: chacun peut voir ses propres follows
CREATE POLICY IF NOT EXISTS "follows_select_own" ON public.user_follow
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "follows_insert_own" ON public.user_follow
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "follows_delete_own" ON public.user_follow
  FOR DELETE USING (true);

-- 2. Incrémenter les abonnés (bypass RLS)
CREATE OR REPLACE FUNCTION public.increment_followers(target_email text)
RETURNS void AS $$
BEGIN
  UPDATE public."ProfilPro"
  SET followers = COALESCE(followers, 0) + 1
  WHERE user_email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Décrémenter les abonnés (bypass RLS)
CREATE OR REPLACE FUNCTION public.decrement_followers(target_email text)
RETURNS void AS $$
BEGIN
  UPDATE public."ProfilPro"
  SET followers = GREATEST(COALESCE(followers, 0) - 1, 0)
  WHERE user_email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Compter les abonnés (bypass RLS)
CREATE OR REPLACE FUNCTION public.count_followers(target_email text)
RETURNS integer AS $$
  SELECT COUNT(*)::integer FROM public.user_follow WHERE followed_email = target_email;
$$ LANGUAGE sql SECURITY DEFINER;

-- 5. Vérifier si abonné
CREATE OR REPLACE FUNCTION public.is_following(follower text, followed text)
RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_follow WHERE follower_email = follower AND followed_email = followed);
$$ LANGUAGE sql SECURITY DEFINER;
