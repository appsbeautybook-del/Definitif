-- Ajouter les colonnes manquantes a Notification
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS body TEXT DEFAULT '';
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS action_url TEXT DEFAULT '';
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Desactiver RLS sur Notification aussi
ALTER TABLE public."Notification" DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'Notification' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."Notification"';
  END LOOP;
END $$;
