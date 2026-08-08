-- Score de fiabilite pour les pros
ALTER TABLE public."ProfilPro" ADD COLUMN IF NOT EXISTS reliability_score NUMERIC DEFAULT 100;

-- Code de verification + pourboire pour les reservations
ALTER TABLE public."Reservation" ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE public."Reservation" ADD COLUMN IF NOT EXISTS tip_amount NUMERIC DEFAULT 0;
ALTER TABLE public."Reservation" ADD COLUMN IF NOT EXISTS tip_paid BOOLEAN DEFAULT false;

-- Desactiver RLS sur toutes les tables
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE public."' || r.tablename || '" DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;
