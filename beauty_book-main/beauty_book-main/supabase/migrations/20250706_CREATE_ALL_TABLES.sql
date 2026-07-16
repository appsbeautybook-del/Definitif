-- ============================================================
-- EXÉCUTER UNIQUEMENT DANS SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/grlinrqxctmiegaluupi/sql/new
-- ============================================================
-- Si une erreur "already exists" apparaît, c'est normal, les tables existent déjà.
-- Si une erreur "does not exist" apparaît sur DROP, c'est normal aussi.

-- ── 1. TABLE: user_like ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_like (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL DEFAULT '',
  user_avatar TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  target_type TEXT NOT NULL DEFAULT 'reel',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ul_target ON user_like(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_ul_user ON user_like(user_email);
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_ul_unique ON user_like(user_email, target_id, target_type);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE user_like ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ul_all" ON user_like;
CREATE POLICY "ul_all" ON user_like FOR ALL USING (true) WITH CHECK (true);

-- ── 2. TABLE: reel_comment ──────────────────────────────────
CREATE TABLE IF NOT EXISTS reel_comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id TEXT NOT NULL DEFAULT '',
  user_email TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL DEFAULT '',
  user_avatar TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  likes INTEGER DEFAULT 0,
  reactions JSONB DEFAULT NULL,
  parent_id UUID DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Ajouter reactions si la table existe déjà sans cette colonne
DO $$ BEGIN
  ALTER TABLE reel_comment ADD COLUMN reactions JSONB DEFAULT NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_rc_reel ON reel_comment(reel_id);
CREATE INDEX IF NOT EXISTS idx_rc_parent ON reel_comment(parent_id);
ALTER TABLE reel_comment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rc_all" ON reel_comment;
CREATE POLICY "rc_all" ON reel_comment FOR ALL USING (true) WITH CHECK (true);

-- ── 2b. TABLE: reel_comment_report ─────────────────────────
CREATE TABLE IF NOT EXISTS reel_comment_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL,
  reporter_email TEXT NOT NULL DEFAULT '',
  reel_id TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rcr_comment ON reel_comment_report(comment_id);
ALTER TABLE reel_comment_report ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rcr_all" ON reel_comment_report;
CREATE POLICY "rcr_all" ON reel_comment_report FOR ALL USING (true) WITH CHECK (true);

-- ── 3. TABLE: user_follow ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_follow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_email TEXT NOT NULL DEFAULT '',
  follower_name TEXT NOT NULL DEFAULT '',
  follower_avatar TEXT NOT NULL DEFAULT '',
  followed_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uf_followed ON user_follow(followed_email);
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_uf_unique ON user_follow(follower_email, followed_email);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE user_follow ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "uf_all" ON user_follow;
CREATE POLICY "uf_all" ON user_follow FOR ALL USING (true) WITH CHECK (true);

-- ── 4. TABLE: user_favorite ─────────────────────────────────
CREATE TABLE IF NOT EXISTS user_favorite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  target_type TEXT NOT NULL DEFAULT 'reel',
  target_title TEXT NOT NULL DEFAULT '',
  target_image TEXT NOT NULL DEFAULT '',
  target_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ufav_user ON user_favorite(user_email);
ALTER TABLE user_favorite ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ufav_all" ON user_favorite;
CREATE POLICY "ufav_all" ON user_favorite FOR ALL USING (true) WITH CHECK (true);

-- ── 6. VÉIFICATION ──────────────────────────────────────────
-- Exécuter cette requête après pour vérifier que tout est OK :
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('user_like', 'reel_comment', 'reel_comment_report', 'user_follow', 'user_favorite');
