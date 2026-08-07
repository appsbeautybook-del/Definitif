-- FIX COMPLET POUR MESSAGERIE ET APPELS
-- Exécuter ce SQL dans Supabase SQL Editor

-- 1. Désactiver RLS complètement
ALTER TABLE "MessageChat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les policies existantes
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'MessageChat') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON "MessageChat"';
  END LOOP;
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'call_signals') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON call_signals';
  END LOOP;
END $$;

-- 3. Créer la table call_signals si elle n'existe pas
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

CREATE INDEX IF NOT EXISTS idx_call_signals_callee ON call_signals(callee_email, signal_type, status, created_at);

-- 4. Réactiver RLS avec policies TOUT PERMIS
ALTER TABLE "MessageChat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_messages" ON "MessageChat" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_signals" ON call_signals FOR ALL USING (true) WITH CHECK (true);

-- 5. Vérifier que les tables existent
SELECT 'MessageChat' as table_name, count(*) as rows FROM "MessageChat"
UNION ALL
SELECT 'call_signals', count(*) FROM call_signals;
