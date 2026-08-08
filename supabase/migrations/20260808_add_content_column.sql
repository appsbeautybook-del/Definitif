-- Ajouter la colonne 'content' à MessageChat si elle n'existe pas
DO $$ BEGIN
  ALTER TABLE public."MessageChat" ADD COLUMN content TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
