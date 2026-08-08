-- ============================================================================
-- FIX COMPLET: Notifications + Messages + Abonnements
-- Exécuter dans l'éditeur SQL Supabase
-- ============================================================================

-- ============================================================================
-- 1. FIX NOTIFICATIONS
-- ============================================================================

-- S'assurer que la table Notification existe avec toutes les colonnes
CREATE TABLE IF NOT EXISTS public."Notification" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT DEFAULT '',
  message TEXT DEFAULT '',
  body TEXT DEFAULT '',
  type TEXT DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  icon TEXT DEFAULT '',
  action_url TEXT DEFAULT '',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT DEFAULT ''
);

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS body TEXT DEFAULT '';
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS action_url TEXT DEFAULT '';
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Désactiver RLS sur Notification (pour le dev, à sécuriser en prod)
ALTER TABLE public."Notification" DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'Notification' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."Notification"';
  END LOOP;
END $$;

-- Créer des policies permissives pour Notification
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les notifications (filtré par user_email côté client)
CREATE POLICY "notification_select_all" ON public."Notification" 
  FOR SELECT USING (true);

-- Policy: Tout le monde peut insérer des notifications
CREATE POLICY "notification_insert_all" ON public."Notification" 
  FOR INSERT WITH CHECK (true);

-- Policy: Tout le monde peut mettre à jour les notifications
CREATE POLICY "notification_update_all" ON public."Notification" 
  FOR UPDATE USING (true);

-- Policy: Tout le monde peut supprimer les notifications
CREATE POLICY "notification_delete_all" ON public."Notification" 
  FOR DELETE USING (true);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_notification_user_email ON public."Notification"(user_email);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON public."Notification"(created_at DESC);

-- ============================================================================
-- 2. FIX MESSAGES (MessageChat)
-- ============================================================================

-- S'assurer que la table MessageChat existe
CREATE TABLE IF NOT EXISTS public."MessageChat" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT DEFAULT '',
  sender_email TEXT NOT NULL,
  sender_name TEXT DEFAULT '',
  sender_avatar TEXT DEFAULT '',
  receiver_email TEXT NOT NULL,
  receiver_name TEXT DEFAULT '',
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'text',
  file_url TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  reservation_id TEXT DEFAULT '',
  is_maria BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT DEFAULT ''
);

-- Ajouter les colonnes manquantes
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS conversation_id TEXT DEFAULT '';
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS sender_name TEXT DEFAULT '';
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS sender_avatar TEXT DEFAULT '';
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_name TEXT DEFAULT '';
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS is_maria BOOLEAN DEFAULT false;

-- Désactiver RLS puis réactiver avec policies permissives
ALTER TABLE public."MessageChat" DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'MessageChat' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."MessageChat"';
  END LOOP;
END $$;

-- Réactiver RLS avec policies
ALTER TABLE public."MessageChat" ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture si sender ou receiver
CREATE POLICY "messagechat_select" ON public."MessageChat" 
  FOR SELECT USING (true);

-- Policy: Insertion si sender
CREATE POLICY "messagechat_insert" ON public."MessageChat" 
  FOR INSERT WITH CHECK (true);

-- Policy: Update si sender ou receiver
CREATE POLICY "messagechat_update" ON public."MessageChat" 
  FOR UPDATE USING (true);

-- Policy: Delete si sender ou receiver
CREATE POLICY "messagechat_delete" ON public."MessageChat" 
  FOR DELETE USING (true);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_messagechat_sender ON public."MessageChat"(sender_email);
CREATE INDEX IF NOT EXISTS idx_messagechat_receiver ON public."MessageChat"(receiver_email);
CREATE INDEX IF NOT EXISTS idx_messagechat_conversation ON public."MessageChat"(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messagechat_created_at ON public."MessageChat"(created_at DESC);

-- ============================================================================
-- 3. FIX USER_FOLLOW (Abonnements)
-- ============================================================================

-- S'assurer que la table user_follow existe
CREATE TABLE IF NOT EXISTS public.user_follow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_email TEXT NOT NULL,
  follower_name TEXT DEFAULT '',
  follower_avatar TEXT DEFAULT '',
  followed_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes manquantes
ALTER TABLE public.user_follow ADD COLUMN IF NOT EXISTS follower_name TEXT DEFAULT '';
ALTER TABLE public.user_follow ADD COLUMN IF NOT EXISTS follower_avatar TEXT DEFAULT '';

-- Désactiver RLS puis réactiver avec policies permissives
ALTER TABLE public.user_follow DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_follow' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_follow"';
  END LOOP;
END $$;

-- Réactiver RLS avec policies
ALTER TABLE public.user_follow ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les abonnements
CREATE POLICY "user_follow_select" ON public.user_follow 
  FOR SELECT USING (true);

-- Policy: Tout le monde peut créer des abonnements
CREATE POLICY "user_follow_insert" ON public.user_follow 
  FOR INSERT WITH CHECK (true);

-- Policy: Tout le monde peut supprimer des abonnements
CREATE POLICY "user_follow_delete" ON public.user_follow 
  FOR DELETE USING (true);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_follow_follower ON public.user_follow(follower_email);
CREATE INDEX IF NOT EXISTS idx_user_follow_followed ON public.user_follow(followed_email);

-- ============================================================================
-- 4. FIX PROFILES (pour récupérer les infos des abonnés)
-- ============================================================================

-- S'assurer que la table profiles existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  role TEXT DEFAULT 'client',
  gender TEXT DEFAULT '',
  beauty_interests TEXT DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Désactiver RLS pour profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. VÉRIFICATION
-- ============================================================================

-- Compter les notifications
SELECT 'Notifications' as table_name, COUNT(*) as count FROM public."Notification"
UNION ALL
-- Compter les messages
SELECT 'Messages', COUNT(*) FROM public."MessageChat"
UNION ALL
-- Compter les abonnements
SELECT 'Follows', COUNT(*) FROM public.user_follow
UNION ALL
-- Compter les profils
SELECT 'Profiles', COUNT(*) FROM public.profiles;
