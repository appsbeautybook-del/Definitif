-- ============================================================
-- FIX: Add missing columns to Reel table in Supabase
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vimusrczrjvefsbljtmf/sql
-- ============================================================

-- Add columns that the app expects but don't exist yet
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS pub_type text DEFAULT 'reel';
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false;
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS music_title text;
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS music_artist text;
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS music_url text;
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS product_id text;
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS product_img text;
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS service_id text;
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS service_name text;

-- Also add missing columns to Style table
ALTER TABLE "Style" ADD COLUMN IF NOT EXISTS produits_utilises jsonb DEFAULT '[]'::jsonb;
