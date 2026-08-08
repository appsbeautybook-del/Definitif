-- ══════════════════════════════════════════════════════════════════════════════
-- FIX RLS pour user_follow (Abonnements/Abonnés)
-- Exécuter dans le SQL Editor de Supabase
-- ══════════════════════════════════════════════════════════════════════════════

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS public.user_follow (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_email text NOT NULL,
  follower_name text DEFAULT '',
  follower_avatar text DEFAULT '',
  followed_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_email, followed_email)
);

-- Activer RLS
ALTER TABLE public.user_follow ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "follows_select_own" ON public.user_follow;
DROP POLICY IF EXISTS "follows_insert_own" ON public.user_follow;
DROP POLICY IF EXISTS "follows_delete_own" ON public.user_follow;
DROP POLICY IF EXISTS "follow_select" ON public.user_follow;
DROP POLICY IF EXISTS "follow_insert" ON public.user_follow;
DROP POLICY IF EXISTS "follow_delete" ON public.user_follow;

-- Créer des policies permissives
CREATE POLICY "follow_select" ON public.user_follow FOR SELECT USING (true);
CREATE POLICY "follow_insert" ON public.user_follow FOR INSERT WITH CHECK (true);
CREATE POLICY "follow_delete" ON public.user_follow FOR DELETE USING (true);
CREATE POLICY "follow_update" ON public.user_follow FOR UPDATE USING (true);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_follow_follower ON public.user_follow(follower_email, created_at);
CREATE INDEX IF NOT EXISTS idx_user_follow_followed ON public.user_follow(followed_email, created_at);

-- Activer Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follow;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
