-- Fix RLS pour MessageChat
ALTER TABLE "MessageChat" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "MessageChat_insert" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_select" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_update" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_delete" ON "MessageChat";

CREATE POLICY "MessageChat_select" ON "MessageChat" FOR SELECT USING (sender_email = auth.email() OR receiver_email = auth.email());
CREATE POLICY "MessageChat_insert" ON "MessageChat" FOR INSERT WITH CHECK (sender_email = auth.email());
CREATE POLICY "MessageChat_update" ON "MessageChat" FOR UPDATE USING (sender_email = auth.email() OR receiver_email = auth.email());
CREATE POLICY "MessageChat_delete" ON "MessageChat" FOR DELETE USING (sender_email = auth.email() OR receiver_email = auth.email());

-- Table call_signals
CREATE TABLE IF NOT EXISTS call_signals (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, call_id TEXT NOT NULL, caller_email TEXT NOT NULL, callee_email TEXT NOT NULL, signal_type TEXT NOT NULL, payload TEXT DEFAULT '', status TEXT DEFAULT 'ringing', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_call_signals_callee ON call_signals(callee_email, signal_type, status, created_at);
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "call_signals_select" ON call_signals;
DROP POLICY IF EXISTS "call_signals_insert" ON call_signals;
DROP POLICY IF EXISTS "call_signals_delete" ON call_signals;
CREATE POLICY "call_signals_select" ON call_signals FOR SELECT USING (true);
CREATE POLICY "call_signals_insert" ON call_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "call_signals_delete" ON call_signals FOR DELETE USING (true);
