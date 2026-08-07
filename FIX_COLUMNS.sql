-- Ajouter la colonne conversation_id si elle n'existe pas
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_avatar TEXT;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Creer call_signals
CREATE TABLE IF NOT EXISTS public.call_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT NOT NULL,
  caller_email TEXT NOT NULL,
  caller_name TEXT DEFAULT '',
  callee_email TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  payload TEXT DEFAULT '',
  status TEXT DEFAULT 'ringing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desactiver RLS
ALTER TABLE public."MessageChat" DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'MessageChat' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."MessageChat"';
  END LOOP;
END $$;
ALTER TABLE public."MessageChat" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "full_access" ON public."MessageChat" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.call_signals DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'call_signals' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.call_signals';
  END LOOP;
END $$;
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "full_access" ON public.call_signals FOR ALL USING (true) WITH CHECK (true);
