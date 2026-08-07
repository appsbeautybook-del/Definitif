-- ETAPE 1: Supprimer TOUTES les policies de MessageChat
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'MessageChat' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."MessageChat"';
  END LOOP;
END $$;

-- ETAPE 2: Supprimer TOUTES les policies de call_signals
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'call_signals' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON call_signals';
  END LOOP;
END $$;

-- ETAPE 3: Desactiver RLS
ALTER TABLE public."MessageChat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."MessageChat" FORCE ROW LEVEL SECURITY;

-- ETAPE 4: Creer call_signals
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

-- ETAPE 5: Reactiver RLS permissif
ALTER TABLE public."MessageChat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MessageChat" FORCE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "full_access" ON public."MessageChat" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.call_signals FOR ALL USING (true) WITH CHECK (true);
