-- Desactiver RLS completement (pas ENABLE, mais DISABLE)
ALTER TABLE public."MessageChat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."MessageChat" FORCE ROW LEVEL SECURITY;

-- Supprimer TOUTES les policies
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'MessageChat' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."MessageChat"';
  END LOOP;
END $$;

-- call_signals
ALTER TABLE public.call_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals FORCE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'call_signals' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.call_signals';
  END LOOP;
END $$;
