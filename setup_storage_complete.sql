-- ============================================================
-- BeautyBook — Setup complet Storage + RLS
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Créer le bucket uploads (public, 100MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads', 'uploads', true,
  104857600,
  ARRAY['image/*', 'video/*', 'application/octet-stream']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/*', 'video/*', 'application/octet-stream']::text[];

-- 2. Activer RLS sur storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer TOUTES les anciennes politiques storage
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- 4. Créer les politiques propres
-- Lecture publique
CREATE POLICY "storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Insert pour tous (anon + auth)
CREATE POLICY "storage_insert_public"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads');

-- Update pour auth
CREATE POLICY "storage_update_auth"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'uploads')
  WITH CHECK (bucket_id = 'uploads');

-- Delete pour auth
CREATE POLICY "storage_delete_auth"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads');

-- 5. Vérification
SELECT b.id, b.name, b.public, b.file_size_limit
FROM storage.buckets b WHERE b.id = 'uploads';

SELECT count(*) as nb_policies FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
