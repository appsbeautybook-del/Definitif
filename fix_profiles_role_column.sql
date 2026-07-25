-- Vérifier et ajouter la colonne role à la table profiles
-- Exécuter dans l'éditeur SQL Supabase

-- 1. Vérifier si la colonne role existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    RAISE NOTICE 'Colonne role ajoutée à la table profiles';
  ELSE
    RAISE NOTICE 'Colonne role existe déjà';
  END IF;
END $$;

-- 2. Mettre à jour les profils existants qui n'ont pas de role
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- 3. Vérification : afficher les profils avec leur role
SELECT id, email, full_name, role FROM profiles ORDER BY created_at DESC LIMIT 20;
