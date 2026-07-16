-- Add missing featured column to existing tables
ALTER TABLE IF EXISTS public."Style" ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public."Produit" ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
