-- ============================================================
-- TABLES COMPLÈTES : Likes, Commentaires, Abonnements
-- Exécuter ce fichier UNIQUEMENT dans Supabase SQL Editor
-- ============================================================

-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS "Like" CASCADE;
DROP TABLE IF EXISTS "Favori" CASCADE;
DROP TABLE IF EXISTS "CommentaireReel" CASCADE;
DROP TABLE IF EXISTS user_like CASCADE;
DROP TABLE IF EXISTS user_favorite CASCADE;
DROP TABLE IF EXISTS reel_comment CASCADE;
DROP TABLE IF EXISTS user_follow CASCADE;

-- ── TABLE: user_like ──────────────────────────────────────
CREATE TABLE user_like (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL DEFAULT '',
  user_avatar TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  target_type TEXT NOT NULL DEFAULT 'reel',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ul_target ON user_like(target_id, target_type);
CREATE INDEX idx_ul_user ON user_like(user_email);
CREATE UNIQUE INDEX idx_ul_unique ON user_like(user_email, target_id, target_type);
ALTER TABLE user_like ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ul_all" ON user_like FOR ALL USING (true) WITH CHECK (true);

-- ── TABLE: reel_comment ───────────────────────────────────
CREATE TABLE reel_comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id TEXT NOT NULL DEFAULT '',
  user_email TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL DEFAULT '',
  user_avatar TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  likes INTEGER DEFAULT 0,
  parent_id UUID DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rc_reel ON reel_comment(reel_id);
CREATE INDEX idx_rc_parent ON reel_comment(parent_id);
ALTER TABLE reel_comment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rc_all" ON reel_comment FOR ALL USING (true) WITH CHECK (true);

-- ── TABLE: user_follow ────────────────────────────────────
CREATE TABLE user_follow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_email TEXT NOT NULL DEFAULT '',
  follower_name TEXT NOT NULL DEFAULT '',
  follower_avatar TEXT NOT NULL DEFAULT '',
  followed_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_uf_followed ON user_follow(followed_email);
CREATE UNIQUE INDEX idx_uf_unique ON user_follow(follower_email, followed_email);
ALTER TABLE user_follow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uf_all" ON user_follow FOR ALL USING (true) WITH CHECK (true);

-- ── TABLE: user_favorite ──────────────────────────────────
CREATE TABLE user_favorite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  target_type TEXT NOT NULL DEFAULT 'reel',
  target_title TEXT NOT NULL DEFAULT '',
  target_image TEXT NOT NULL DEFAULT '',
  target_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ufav_user ON user_favorite(user_email);
ALTER TABLE user_favorite ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ufav_all" ON user_favorite FOR ALL USING (true) WITH CHECK (true);

-- ── RÉACTIVITÉ ────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE user_like;
ALTER PUBLICATION supabase_realtime ADD TABLE reel_comment;
ALTER PUBLICATION supabase_realtime ADD TABLE user_follow;
