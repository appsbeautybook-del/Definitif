-- Vérifier et ajouter les colonnes manquantes à la table profiles
-- Exécuter dans l'éditeur SQL Supabase

-- 1. Ajouter avatar_url si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Colonne avatar_url ajoutée';
  ELSE
    RAISE NOTICE 'Colonne avatar_url existe déjà';
  END IF;
END $$;

-- 2. Ajouter cover_url si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cover_url TEXT;
    RAISE NOTICE 'Colonne cover_url ajoutée';
  ELSE
    RAISE NOTICE 'Colonne cover_url existe déjà';
  END IF;
END $$;

-- 3. Ajouter phone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- 4. Ajouter instagram
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'instagram'
  ) THEN
    ALTER TABLE profiles ADD COLUMN instagram TEXT;
  END IF;
END $$;

-- 5. Ajouter facebook
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'facebook'
  ) THEN
    ALTER TABLE profiles ADD COLUMN facebook TEXT;
  END IF;
END $$;

-- 6. Ajouter website
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
END $$;

-- 7. Ajouter bio
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- 8. Ajouter username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
  END IF;
END $$;

-- 9. Vérification : afficher la structure de la table profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
