-- ═══════════════════════════════════════════════════════════════════════════
-- Tables pour la fonctionnalité Réseaux Sociaux de Maria AI
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Connexions aux plateformes (Instagram, Facebook, WhatsApp, TikTok)
CREATE TABLE IF NOT EXISTS social_connection (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  platform TEXT NOT NULL,                 -- 'instagram' | 'facebook' | 'whatsapp' | 'tiktok'
  credentials JSONB DEFAULT '{}'::jsonb,  -- tokens & IDs (accessToken, businessId, ...)
  account_info JSONB DEFAULT '{}'::jsonb, -- username, name, followers_count, ...
  status TEXT DEFAULT 'active',           -- 'active' | 'error' | 'disabled'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_email, platform)
);

-- Index pour le webhook (retrouver le propriétaire d'un compte Meta)
CREATE INDEX IF NOT EXISTS idx_social_connection_user ON social_connection (user_email);
CREATE INDEX IF NOT EXISTS idx_social_connection_platform ON social_connection (platform);

-- 2. Interactions traitées par Maria (commentaires, DM) — anti-doublon + stats
CREATE TABLE IF NOT EXISTS social_interaction (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  external_id TEXT,                       -- ID du commentaire/message Meta (dédup)
  user_email TEXT NOT NULL,               -- propriétaire du compte connecté
  author_name TEXT,                       -- pseudo de la personne
  author_id TEXT,
  content TEXT,                           -- message reçu
  reply TEXT,                             -- réponse envoyée par Maria
  type TEXT DEFAULT 'comment',            -- 'comment' | 'dm'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (platform, external_id)
);

CREATE INDEX IF NOT EXISTS idx_social_interaction_user ON social_interaction (user_email);

-- Cohérent avec le reste du projet (RLS désactivée — accès via anon key)
ALTER TABLE social_connection DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_interaction DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 'social_connection' AS table_name, count(*) FROM social_connection
UNION ALL
SELECT 'social_interaction', count(*) FROM social_interaction;
