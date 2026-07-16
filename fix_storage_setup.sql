-- ============================================================
-- BeautyBook — Configuration du bucket Storage "uploads"
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Créer le bucket s'il n'existe pas et le rendre public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  104857600, -- 100MB
  ARRAY['image/*', 'video/*', 'application/octet-stream']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/*', 'video/*', 'application/octet-stream']::text[];

-- 2. Supprimer les anciennes politiques pour les recréer proprement
DROP POLICY IF EXISTS "uploads_public_read" ON storage.objects;
DROP POLICY IF EXISTS "uploads_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "uploads_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;

-- 3. Politique : lecture publique (tout le monde peut voir les fichiers)
CREATE POLICY "uploads_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- 4. Politique : upload pour les utilisateurs authentifiés
CREATE POLICY "uploads_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- 5. Politique : upload anonyme (si besoin)
CREATE POLICY "uploads_anon_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- 6. Politique : mise à jour par le propriétaire
CREATE POLICY "uploads_auth_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads' AND auth.uid() = owner);

-- 7. Vérification
SELECT
  b.name,
  b.public,
  b.file_size_limit,
  b.allowed_mime_types
FROM storage.buckets b
WHERE b.id = 'uploads';
