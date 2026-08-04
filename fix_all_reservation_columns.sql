-- ============================================================
-- FIX COMPLET: Ajouter TOUTES les colonnes manquantes à Reservation
-- Exécuter dans Supabase SQL Editor → Nouvelle requête → Run
-- ============================================================

-- client_name (si pas encore ajoutée)
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "client_name" text DEFAULT '';
-- client_phone
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "client_phone" text DEFAULT '';
-- pro_name
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "pro_name" text DEFAULT '';
-- service_id
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "service_id" text DEFAULT '';
-- service_price
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "service_price" numeric DEFAULT 0;
-- end_time_slot
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "end_time_slot" text DEFAULT '';
-- duration_min
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "duration_min" integer DEFAULT 60;
-- persons
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "persons" integer DEFAULT 1;
-- addons
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "addons" jsonb DEFAULT '[]'::jsonb;
-- total_price
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "total_price" numeric DEFAULT 0;
-- acompte_amount
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "acompte_amount" numeric DEFAULT 0;
-- payment_type
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "payment_type" text DEFAULT 'surplace';
-- crg_code
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "crg_code" text DEFAULT '';
-- payment_status
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "payment_status" text DEFAULT 'non_paye';
-- salon_name
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "salon_name" text DEFAULT '';
-- salon_address
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "salon_address" text DEFAULT '';
-- seats_total
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "seats_total" integer DEFAULT 0;
-- reminder_scheduled
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "reminder_scheduled" boolean DEFAULT false;
-- reminder_sent
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "reminder_sent" boolean DEFAULT false;
-- completed_at
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "completed_at" text DEFAULT '';
-- review_requested
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "review_requested" boolean DEFAULT false;
-- created_by_id
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "created_by_id" uuid DEFAULT NULL;

-- Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';
