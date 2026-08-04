-- Ajouter la colonne client_name à la table Reservation
-- Exécuter ce fichier dans Supabase SQL Editor

ALTER TABLE "Reservation"
ADD COLUMN IF NOT EXISTS "client_name" text DEFAULT '';

-- Mettre à jour les lignes existantes avec client_email comme fallback
UPDATE "Reservation"
SET "client_name" = "client_email"
WHERE "client_name" IS NULL OR "client_name" = '';

-- Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';
