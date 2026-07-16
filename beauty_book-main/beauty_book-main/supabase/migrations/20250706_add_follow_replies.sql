-- ============================================================
-- Migration: Abonnements + Réponses commentaires
-- Date: 2025-07-06
-- ============================================================

-- ── Table user_follow (abonnements) ─────────────────────────
CREATE TABLE IF NOT EXISTS user_follow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_email TEXT NOT NULL,
  follower_name TEXT DEFAULT '',
  follower_avatar TEXT DEFAULT '',
  followed_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_follow_unique ON user_follow (follower_email, followed_email);
CREATE INDEX IF NOT EXISTS idx_user_follow_followed ON user_follow (followed_email);

ALTER TABLE user_follow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_follow public read" ON user_follow FOR SELECT USING (true);
CREATE POLICY "user_follow insert" ON user_follow FOR INSERT WITH CHECK (true);
CREATE POLICY "user_follow delete" ON user_follow FOR DELETE USING (true);

-- ── Ajouter parent_id à reel_comment pour les réponses ─────
ALTER TABLE reel_comment ADD COLUMN IF NOT EXISTS parent_id UUID DEFAULT NULL;
