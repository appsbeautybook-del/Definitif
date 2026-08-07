-- Verifier si conversation_id existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'MessageChat' AND column_name = 'conversation_id';

-- Si rien ne s'affiche, ajouter la colonne
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS conversation_id TEXT DEFAULT '';
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_name TEXT DEFAULT '';
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_avatar TEXT DEFAULT '';
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS sender_avatar TEXT DEFAULT '';

-- Desactiver RLS completement
ALTER TABLE public."MessageChat" DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'MessageChat' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."MessageChat"';
  END LOOP;
END $$;

-- call_signals
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
ALTER TABLE public.call_signals DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'call_signals' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.call_signals';
  END LOOP;
END $$;
