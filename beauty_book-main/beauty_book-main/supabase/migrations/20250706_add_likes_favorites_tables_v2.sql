-- ============================================================
-- Migration: Likes / Favoris / Commentaires (v2 — nom sûr)
-- Date: 2025-07-06
-- ============================================================

-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS "Like" CASCADE;
DROP TABLE IF EXISTS "Favori" CASCADE;
DROP TABLE IF EXISTS "CommentaireReel" CASCADE;

-- ── Table user_like (remplace "Like" — mot réservé SQL) ──────
CREATE TABLE IF NOT EXISTS user_like (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_name TEXT DEFAULT '',
  user_avatar TEXT DEFAULT '',
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('reel', 'style', 'publication', 'service', 'produit')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_like_unique ON user_like (user_email, target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_user_like_target ON user_like (target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_user_like_user ON user_like (user_email);

ALTER TABLE user_like ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_like public read" ON user_like FOR SELECT USING (true);
CREATE POLICY "user_like insert" ON user_like FOR INSERT WITH CHECK (true);
CREATE POLICY "user_like delete" ON user_like FOR DELETE USING (true);
CREATE POLICY "user_like update" ON user_like FOR UPDATE USING (true);

-- ── Table user_favorite ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_favorite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('reel', 'style', 'publication', 'service', 'produit', 'pro')),
  target_title TEXT DEFAULT '',
  target_image TEXT DEFAULT '',
  target_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorite_unique ON user_favorite (user_email, target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_user_favorite_user ON user_favorite (user_email);

ALTER TABLE user_favorite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_favorite public read" ON user_favorite FOR SELECT USING (true);
CREATE POLICY "user_favorite insert" ON user_favorite FOR INSERT WITH CHECK (true);
CREATE POLICY "user_favorite delete" ON user_favorite FOR DELETE USING (true);

-- ── Table reel_comment ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS reel_comment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT DEFAULT '',
  user_avatar TEXT DEFAULT '',
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reel_comment_reel ON reel_comment (reel_id, created_at DESC);

ALTER TABLE reel_comment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reel_comment public read" ON reel_comment FOR SELECT USING (true);
CREATE POLICY "reel_comment insert" ON reel_comment FOR INSERT WITH CHECK (true);
CREATE POLICY "reel_comment update" ON reel_comment FOR UPDATE USING (true);
CREATE POLICY "reel_comment delete" ON reel_comment FOR DELETE USING (true);

-- ── Enable Realtime ──
ALTER PUBLICATION supabase_realtime ADD TABLE user_like;
ALTER PUBLICATION supabase_realtime ADD TABLE reel_comment;
