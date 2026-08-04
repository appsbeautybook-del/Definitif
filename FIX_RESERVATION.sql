-- ============================================================
-- FIX COMPLET RESERVATION — Copier/coller dans Supabase SQL Editor → Run
-- ============================================================

-- 1. Ajouter toutes les colonnes manquantes
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "time" text DEFAULT '00:00';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "time_slot" text DEFAULT '00:00';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "notes" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "client_name" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "client_phone" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "pro_name" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "service_id" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "service_price" numeric DEFAULT 0;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "end_time_slot" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "duration_min" integer DEFAULT 60;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "persons" integer DEFAULT 1;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "total_price" numeric DEFAULT 0;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "acompte_amount" numeric DEFAULT 0;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "payment_type" text DEFAULT 'surplace';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "payment_status" text DEFAULT 'non_paye';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "crg_code" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "salon_name" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "salon_address" text DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "seats_total" integer DEFAULT 0;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "created_by_id" uuid DEFAULT NULL;

-- 2. Supprimer les anciennes contraintes CHECK défaillantes
ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_payment_status_check";
ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_payment_type_check";
ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_status_check";

-- 3. Recréer les contraintes CHECK avec les bonnes valeurs
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_payment_status_check"
  CHECK (payment_status IN ('non_paye','acompte_paye','paye','rembourse'));
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_payment_type_check"
  CHECK (payment_type IN ('full','acompte','surplace'));
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_status_check"
  CHECK (status IN ('en_attente','confirme','annule','termine','no_show'));

-- 4. S'assurer que les colonnes critiques ont des DEFAULT
ALTER TABLE "Reservation" ALTER COLUMN "time" SET DEFAULT '00:00';
ALTER TABLE "Reservation" ALTER COLUMN "payment_status" SET DEFAULT 'non_paye';
ALTER TABLE "Reservation" ALTER COLUMN "payment_type" SET DEFAULT 'surplace';
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'en_attente';

-- 5. Forcer NOT NULL sur les colonnes essentielles
ALTER TABLE "Reservation" ALTER COLUMN "time" SET NOT NULL;
ALTER TABLE "Reservation" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "Reservation" ALTER COLUMN "pro_email" SET NOT NULL;
ALTER TABLE "Reservation" ALTER COLUMN "service_name" SET NOT NULL;
ALTER TABLE "Reservation" ALTER COLUMN "client_email" SET NOT NULL;

-- 6. Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';
