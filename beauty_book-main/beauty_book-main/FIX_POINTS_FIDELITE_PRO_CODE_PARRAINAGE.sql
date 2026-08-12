-- Add missing 'code_parrainage' column to PointsFidelitePro table
ALTER TABLE "PointsFidelitePro" ADD COLUMN IF NOT EXISTS code_parrainage TEXT;

-- Also ensure all expected columns exist for PointsFidelitePro
ALTER TABLE "PointsFidelitePro" ADD COLUMN IF NOT EXISTS points_total INTEGER DEFAULT 0;
ALTER TABLE "PointsFidelitePro" ADD COLUMN IF NOT EXISTS points_depenses INTEGER DEFAULT 0;
ALTER TABLE "PointsFidelitePro" ADD COLUMN IF NOT EXISTS niveau TEXT DEFAULT 'Bronze';
ALTER TABLE "PointsFidelitePro" ADD COLUMN IF NOT EXISTS historique JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "PointsFidelitePro" ADD COLUMN IF NOT EXISTS pro_email TEXT;

-- Add missing 'code_parrainage' column to PointsFidelite table (client loyalty)
ALTER TABLE "PointsFidelite" ADD COLUMN IF NOT EXISTS code_parrainage TEXT;
