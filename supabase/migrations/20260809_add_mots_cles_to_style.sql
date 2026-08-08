-- Ajouter la colonne mots_cles à la table Style si elle n'existe pas
DO $$ BEGIN
  ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS mots_cles JSONB DEFAULT '[]'::jsonb;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
