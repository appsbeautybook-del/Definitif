-- Vérifier et ajouter les colonnes avatar_url et cover_url à la table profiles
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

-- 3. Ajouter les autres colonnes manquantes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'instagram') THEN
    ALTER TABLE profiles ADD COLUMN instagram TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'facebook') THEN
    ALTER TABLE profiles ADD COLUMN facebook TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
  END IF;
END $$;

-- 4. Vérification : afficher la structure de la table profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
