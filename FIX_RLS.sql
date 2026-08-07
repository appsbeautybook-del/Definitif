-- Désactiver RLS temporairement pour debug
ALTER TABLE "MessageChat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals DISABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes
DROP POLICY IF EXISTS "MessageChat_insert" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_select" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_update" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_delete" ON "MessageChat";
DROP POLICY IF EXISTS "call_signals_select" ON call_signals;
DROP POLICY IF EXISTS "call_signals_insert" ON call_signals;
DROP POLICY IF EXISTS "call_signals_delete" ON call_signals;

-- Réactiver avec des policies permissives
ALTER TABLE "MessageChat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;

-- MessageChat : tout le monde peut lire et écrire
CREATE POLICY "msg_all" ON "MessageChat" FOR ALL USING (true) WITH CHECK (true);

-- call_signals : tout le monde peut lire et écrire
CREATE POLICY "sig_all" ON call_signals FOR ALL USING (true) WITH CHECK (true);
