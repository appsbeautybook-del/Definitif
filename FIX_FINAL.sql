--_etape 1: tout supprimer
DROP POLICY IF EXISTS "allow_all_messages" ON "MessageChat";
DROP POLICY IF EXISTS "allow_all_signals" ON call_signals;
DROP POLICY IF EXISTS "msg_all" ON "MessageChat";
DROP POLICY IF EXISTS "sig_all" ON call_signals;
DROP POLICY IF EXISTS "MessageChat_insert" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_select" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_update" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_delete" ON "MessageChat";
DROP POLICY IF EXISTS "call_signals_select" ON call_signals;
DROP POLICY IF EXISTS "call_signals_insert" ON call_signals;
DROP POLICY IF EXISTS "call_signals_delete" ON call_signals;

--_etape 2: desactiver RLS
ALTER TABLE "MessageChat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals DISABLE ROW LEVEL SECURITY;

--etape 3: creer call_signals si inexistant
CREATE TABLE IF NOT EXISTS call_signals (
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

--etape 4: reactiver RLS permissif
ALTER TABLE "MessageChat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p1" ON "MessageChat" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "p2" ON call_signals FOR ALL USING (true) WITH CHECK (true);
