-- Fix RLS policies for MessageChat
-- Permettre à tout le monde d'insérer des messages
ALTER TABLE "MessageChat" ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "MessageChat_insert" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_select" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_update" ON "MessageChat";
DROP POLICY IF EXISTS "MessageChat_delete" ON "MessageChat";

-- Politique SELECT : les utilisateurs voient les messages de leurs conversations
CREATE POLICY "MessageChat_select" ON "MessageChat"
  FOR SELECT USING (
    sender_email = auth.email() OR receiver_email = auth.email()
  );

-- Politique INSERT : les utilisateurs peuvent envoyer des messages
CREATE POLICY "MessageChat_insert" ON "MessageChat"
  FOR INSERT WITH CHECK (
    sender_email = auth.email()
  );

-- Politique UPDATE : les utilisateurs peuvent marquer leurs messages comme lus
CREATE POLICY "MessageChat_update" ON "MessageChat"
  FOR UPDATE USING (
    sender_email = auth.email() OR receiver_email = auth.email()
  );

-- Politique DELETE : les utilisateurs peuvent supprimer leurs messages
CREATE POLICY "MessageChat_delete" ON "MessageChat"
  FOR DELETE USING (
    sender_email = auth.email() OR receiver_email = auth.email()
  );

-- Table call_signals pour la signalisation d'appels
CREATE TABLE IF NOT EXISTS call_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT NOT NULL,
  caller_email TEXT NOT NULL,
  callee_email TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  payload TEXT DEFAULT '',
  status TEXT DEFAULT 'ringing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_signals_callee ON call_signals(callee_email, signal_type, status, created_at);
CREATE INDEX IF NOT EXISTS idx_call_signals_call_id ON call_signals(call_id, created_at);

ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_signals_select" ON call_signals FOR SELECT USING (true);
CREATE POLICY "call_signals_insert" ON call_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "call_signals_delete" ON call_signals FOR DELETE USING (true);
