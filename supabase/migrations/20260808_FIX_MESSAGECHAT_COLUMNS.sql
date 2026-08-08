-- COPIEZ-COLLEZ DANS LE SQL EDITOR DE SUPABASE, puis RUN

-- Ajouter les colonnes manquantes à MessageChat
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_avatar TEXT;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Désactiver RLS sur MessageChat
ALTER TABLE public."MessageChat" DISABLE ROW LEVEL SECURITY;
