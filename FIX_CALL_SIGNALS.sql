-- Table call_signals pour la signalisation d'appels
CREATE TABLE IF NOT EXISTS call_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT NOT NULL,
  caller_email TEXT NOT NULL,
  callee_email TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- offer, answer, ice-candidate, reject, end
  payload TEXT DEFAULT '',
  status TEXT DEFAULT 'ringing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour le polling rapide
CREATE INDEX IF NOT EXISTS idx_call_signals_callee ON call_signals(callee_email, signal_type, status, created_at);
CREATE INDEX IF NOT EXISTS idx_call_signals_call_id ON call_signals(call_id, created_at);

-- RLS policies
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les signaux
CREATE POLICY "call_signals_select" ON call_signals FOR SELECT USING (true);

-- Tout le monde peut insérer des signaux
CREATE POLICY "call_signals_insert" ON call_signals FOR INSERT WITH CHECK (true);

-- Nettoyage automatique après 1 minute
SELECT cron.schedule('cleanup_call_signals', '1 minute', $$DELETE FROM call_signals WHERE created_at < NOW() - INTERVAL '1 minute'$$);
