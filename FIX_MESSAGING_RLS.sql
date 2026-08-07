-- Supprimer les anciens objets s'ils existent
DROP POLICY IF EXISTS "call_signals_select" ON call_signals;
DROP POLICY IF EXISTS "call_signals_insert" ON call_signals;
DROP POLICY IF EXISTS "call_signals_delete" ON call_signals;
DROP TABLE IF EXISTS call_signals;

-- Recréer la table
CREATE TABLE call_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT NOT NULL,
  caller_email TEXT NOT NULL,
  callee_email TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  payload TEXT DEFAULT '',
  status TEXT DEFAULT 'ringing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_call_signals_callee ON call_signals(callee_email, signal_type, status, created_at);
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_signals_select" ON call_signals FOR SELECT USING (true);
CREATE POLICY "call_signals_insert" ON call_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "call_signals_delete" ON call_signals FOR DELETE USING (true);

-- Fix RLS MessageChat
DROP POLICY IF EXISTS "MessageChat_insert" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_select" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_update" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_delete" ON "MessageChat";
CREATE POLICY "MessageChat_select" ON "MessageChat" FOR SELECT USING (sender_email = auth.email() OR receiver_email = auth.email());
CREATE POLICY "MessageChat_insert" ON "MessageChat" FOR INSERT WITH CHECK (sender_email = auth.email());
CREATE POLICY "MessageChat_update" ON "MessageChat" FOR UPDATE USING (sender_email = auth.email() OR receiver_email = auth.email());
CREATE POLICY "MessageChat_delete" ON "MessageChat" FOR DELETE USING (sender_email = auth.email() OR receiver_email = auth.email());
