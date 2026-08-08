-- Ajouter les colonnes manquantes
ALTER TABLE public."ProfilPro" ADD COLUMN IF NOT EXISTS seats_count INTEGER DEFAULT 1;
ALTER TABLE public."ProfilPro" ADD COLUMN IF NOT EXISTS commodites TEXT[] DEFAULT '{}';
ALTER TABLE public."ProfilPro" ADD COLUMN IF NOT EXISTS type_activite TEXT DEFAULT 'Salon';
ALTER TABLE public."ProfilPro" ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Desactiver RLS sur toutes les tables
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE public."' || r.tablename || '" DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;
