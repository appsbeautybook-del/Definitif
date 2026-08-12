-- Ajouter toutes les colonnes manquantes à MessageChat
ALTER TABLE "MessageChat" 
ADD COLUMN IF NOT EXISTS "sender_name" text DEFAULT '',
ADD COLUMN IF NOT EXISTS "sender_avatar" text DEFAULT '',
ADD COLUMN IF NOT EXISTS "receiver_name" text DEFAULT '',
ADD COLUMN IF NOT EXISTS "receiver_avatar" text DEFAULT '',
ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'text',
ADD COLUMN IF NOT EXISTS "attachment_url" text DEFAULT '',
ADD COLUMN IF NOT EXISTS "reservation_id" text DEFAULT '',
ADD COLUMN IF NOT EXISTS "is_maria" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();

-- Créer la table CallLog si elle n'existe pas
CREATE TABLE IF NOT EXISTS "CallLog" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id text,
  caller_email text,
  caller_name text DEFAULT '',
  caller_avatar text DEFAULT '',
  callee_email text,
  callee_name text DEFAULT '',
  callee_avatar text DEFAULT '',
  status text DEFAULT 'outgoing',
  duration_sec integer DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by_id text
);

-- Créer la table call_signals si elle n'existe pas
CREATE TABLE IF NOT EXISTS "call_signals" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id text,
  caller_email text,
  callee_email text,
  signal_type text,
  payload text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  created_by_id text
);

-- RLS: permettre lecture/ecriture aux utilisateurs authentifiés
ALTER TABLE "MessageChat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CallLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "call_signals" ENABLE ROW LEVEL SECURITY;

-- Policies MessageChat
DROP POLICY IF EXISTS "Users can read own messages" ON "MessageChat";
CREATE POLICY "Users can read own messages" ON "MessageChat"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert messages" ON "MessageChat";
CREATE POLICY "Users can insert messages" ON "MessageChat"
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update messages" ON "MessageChat";
CREATE POLICY "Users can update messages" ON "MessageChat"
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete messages" ON "MessageChat";
CREATE POLICY "Users can delete messages" ON "MessageChat"
  FOR DELETE USING (true);

-- Policies CallLog
DROP POLICY IF EXISTS "Users can read calls" ON "CallLog";
CREATE POLICY "Users can read calls" ON "CallLog"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert calls" ON "CallLog";
CREATE POLICY "Users can insert calls" ON "CallLog"
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update calls" ON "CallLog";
CREATE POLICY "Users can update calls" ON "CallLog"
  FOR UPDATE USING (true);

-- Policies call_signals
DROP POLICY IF EXISTS "Users can read signals" ON "call_signals";
CREATE POLICY "Users can read signals" ON "call_signals"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert signals" ON "call_signals";
CREATE POLICY "Users can insert signals" ON "call_signals"
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete signals" ON "call_signals";
CREATE POLICY "Users can delete signals" ON "call_signals"
  FOR DELETE USING (true);

-- RLS user_follow
ALTER TABLE "user_follow" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read follows" ON "user_follow";
CREATE POLICY "Users can read follows" ON "user_follow"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert follows" ON "user_follow";
CREATE POLICY "Users can insert follows" ON "user_follow"
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete follows" ON "user_follow";
CREATE POLICY "Users can delete follows" ON "user_follow"
  FOR DELETE USING (true);
