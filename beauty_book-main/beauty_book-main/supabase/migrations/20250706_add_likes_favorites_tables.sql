-- ============================================================
-- Migration: Likes / Favoris / Commentaires améliorés
-- Date: 2025-07-06
-- ============================================================

-- ── Table Like ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Like" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_name TEXT DEFAULT '',
  user_avatar TEXT DEFAULT '',
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('reel', 'style', 'publication', 'service', 'produit')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unicité : un seul like par utilisateur par cible
CREATE UNIQUE INDEX IF NOT EXISTS idx_like_unique ON "Like" (user_email, target_id, target_type);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_like_target ON "Like" (target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_like_user ON "Like" (user_email);

-- RLS
ALTER TABLE "Like" ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les likes
CREATE POLICY "Like public read" ON "Like"
  FOR SELECT USING (true);

-- L'utilisateur insère son propre like
CREATE POLICY "Like insert own" ON "Like"
  FOR INSERT WITH CHECK (auth.email() = user_email OR user_email IS NOT NULL);

-- L'utilisateur supprime son propre like
CREATE POLICY "Like delete own" ON "Like"
  FOR DELETE USING (auth.email() = user_email OR user_email IS NOT NULL);

-- ── Table Favori ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Favori" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('reel', 'style', 'publication', 'service', 'produit', 'pro')),
  target_title TEXT DEFAULT '',
  target_image TEXT DEFAULT '',
  target_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favori_unique ON "Favori" (user_email, target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_favori_user ON "Favori" (user_email);

ALTER TABLE "Favori" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favori public read" ON "Favori"
  FOR SELECT USING (true);

CREATE POLICY "Favori insert own" ON "Favori"
  FOR INSERT WITH CHECK (auth.email() = user_email OR user_email IS NOT NULL);

CREATE POLICY "Favori delete own" ON "Favori"
  FOR DELETE USING (auth.email() = user_email OR user_email IS NOT NULL);

-- ── Table CommentaireReel (séparé de CommentaireStyle) ──────
CREATE TABLE IF NOT EXISTS "CommentaireReel" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT DEFAULT '',
  user_avatar TEXT DEFAULT '',
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  parent_id UUID DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commentaire_reel ON "CommentaireReel" (reel_id, created_at DESC);

ALTER TABLE "CommentaireReel" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CommentaireReel public read" ON "CommentaireReel"
  FOR SELECT USING (true);

CREATE POLICY "CommentaireReel insert" ON "CommentaireReel"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "CommentaireReel update own" ON "CommentaireReel"
  FOR UPDATE USING (auth.email() = user_email OR user_email IS NOT NULL);

CREATE POLICY "CommentaireReel delete own" ON "CommentaireReel"
  FOR DELETE USING (auth.email() = user_email OR user_email IS NOT NULL);

-- ── Fonction trigger : auto-incrémenter comments_count sur Reel ──
CREATE OR REPLACE FUNCTION update_reel_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE "Reel" SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.reel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "Reel" SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = OLD.reel_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_reel_comments_count ON "CommentaireReel";
CREATE TRIGGER trg_reel_comments_count
  AFTER INSERT OR DELETE ON "CommentaireReel"
  FOR EACH ROW EXECUTE FUNCTION update_reel_comments_count();

-- ── Fonction trigger : auto-incrémenter/décrémenter likes sur Reel ──
CREATE OR REPLACE FUNCTION update_reel_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'reel' THEN
    UPDATE "Reel" SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.target_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'reel' THEN
    UPDATE "Reel" SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = OLD.target_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_reel_likes_count ON "Like";
CREATE TRIGGER trg_reel_likes_count
  AFTER INSERT OR DELETE ON "Like"
  FOR EACH ROW EXECUTE FUNCTION update_reel_likes_count();

-- ── Fonction trigger : auto-incrémenter/décrémenter likes sur Style ──
CREATE OR REPLACE FUNCTION update_style_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'style' THEN
    UPDATE "Style" SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.target_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'style' THEN
    UPDATE "Style" SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = OLD.target_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_style_likes_count ON "Like";
CREATE TRIGGER trg_style_likes_count
  AFTER INSERT OR DELETE ON "Like"
  FOR EACH ROW EXECUTE FUNCTION update_style_likes_count();

-- ── Enable Realtime pour les nouvelles tables ──
ALTER PUBLICATION supabase_realtime ADD TABLE "Like";
ALTER PUBLICATION supabase_realtime ADD TABLE "CommentaireReel";
