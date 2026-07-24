-- Add produits_utilises column to Style table (JSONB array)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vimusrczrjvefsbljtmf/sql

ALTER TABLE "Style" ADD COLUMN IF NOT EXISTS produits_utilises jsonb DEFAULT '[]'::jsonb;
