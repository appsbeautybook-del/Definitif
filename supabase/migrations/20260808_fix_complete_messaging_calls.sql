-- ══════════════════════════════════════════════════════════════════════════════
-- FIX COMPLET: Messages + Appels (Corrige tous les problèmes)
-- Exécuter dans le SQL Editor de Supabase
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Table "MessageChat" ──────────────────────────────────────────────────
-- Assurer que la table existe avec toutes les colonnes nécessaires
CREATE TABLE IF NOT EXISTS public."MessageChat" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT,
  sender_email TEXT,
  sender_name TEXT,
  sender_avatar TEXT,
  receiver_email TEXT,
  receiver_name TEXT,
  receiver_avatar TEXT,
  content TEXT,
  type TEXT DEFAULT 'text',
  file_url TEXT,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  reservation_id TEXT,
  is_maria BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID
);

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS conversation_id TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS sender_email TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS sender_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS sender_avatar TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_email TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS receiver_avatar TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS content TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS file_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS attachment_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS reservation_id TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS is_maria BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_messagechat_conversation ON public."MessageChat"(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messagechat_sender ON public."MessageChat"(sender_email, created_at);
CREATE INDEX IF NOT EXISTS idx_messagechat_receiver ON public."MessageChat"(receiver_email, created_at);

-- ── 2. Table "CallSignal" (PascalCase - le vrai nom utilisé par le code) ─────
CREATE TABLE IF NOT EXISTS public."CallSignal" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id TEXT,
  caller_email TEXT,
  caller_name TEXT,
  caller_avatar TEXT,
  callee_email TEXT,
  signal_type TEXT,
  type TEXT,
  signal_data JSONB,
  payload TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_callsignal_call_id ON public."CallSignal"(call_id, created_at);
CREATE INDEX IF NOT EXISTS idx_callsignal_callee ON public."CallSignal"(callee_email, type, status, created_at);

-- ── 3. Table "CallLog" ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."CallLog" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id TEXT,
  caller_email TEXT,
  callee_email TEXT,
  caller_name TEXT,
  callee_name TEXT,
  caller_avatar TEXT,
  callee_avatar TEXT,
  status TEXT DEFAULT 'initiated',
  duration_sec INTEGER,
  started_at TEXT,
  ended_at TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID
);

-- Ajouter les colonnes manquantes
DO $$ BEGIN ALTER TABLE public."CallLog" ADD COLUMN IF NOT EXISTS caller_avatar TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."CallLog" ADD COLUMN IF NOT EXISTS callee_avatar TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."CallLog" ADD COLUMN IF NOT EXISTS call_id TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_calllog_caller ON public."CallLog"(caller_email, created_at);
CREATE INDEX IF NOT EXISTS idx_calllog_callee ON public."CallLog"(callee_email, created_at);

-- ── 4. Table "Notification" ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."Notification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  title TEXT,
  message TEXT,
  body TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  icon TEXT,
  action_url TEXT,
  link TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID
);

-- Ajouter les colonnes manquantes
DO $$ BEGIN ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS body TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS link TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES (permissives pour le fonctionnement)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── MessageChat RLS ─────────────────────────────────────────────────────────
ALTER TABLE public."MessageChat" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "msg_select" ON public."MessageChat"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_insert" ON public."MessageChat"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_update" ON public."MessageChat"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_delete" ON public."MessageChat"; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "msg_select" ON public."MessageChat" FOR SELECT USING (true);
CREATE POLICY "msg_insert" ON public."MessageChat" FOR INSERT WITH CHECK (true);
CREATE POLICY "msg_update" ON public."MessageChat" FOR UPDATE USING (true);
CREATE POLICY "msg_delete" ON public."MessageChat" FOR DELETE USING (true);

-- ── CallSignal RLS ──────────────────────────────────────────────────────────
ALTER TABLE public."CallSignal" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "call_signal_select" ON public."CallSignal"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "call_signal_insert" ON public."CallSignal"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "call_signal_update" ON public."CallSignal"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "call_signal_delete" ON public."CallSignal"; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "call_signal_select" ON public."CallSignal" FOR SELECT USING (true);
CREATE POLICY "call_signal_insert" ON public."CallSignal" FOR INSERT WITH CHECK (true);
CREATE POLICY "call_signal_update" ON public."CallSignal" FOR UPDATE USING (true);
CREATE POLICY "call_signal_delete" ON public."CallSignal" FOR DELETE USING (true);

-- ── CallLog RLS ─────────────────────────────────────────────────────────────
ALTER TABLE public."CallLog" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "call_log_select" ON public."CallLog"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "call_log_insert" ON public."CallLog"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "call_log_update" ON public."CallLog"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "call_log_delete" ON public."CallLog"; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "call_log_select" ON public."CallLog" FOR SELECT USING (true);
CREATE POLICY "call_log_insert" ON public."CallLog" FOR INSERT WITH CHECK (true);
CREATE POLICY "call_log_update" ON public."CallLog" FOR UPDATE USING (true);
CREATE POLICY "call_log_delete" ON public."CallLog" FOR DELETE USING (true);

-- ── Notification RLS ───────────────────────────────────────────────────────
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "notif_select" ON public."Notification"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "notif_insert" ON public."Notification"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "notif_update" ON public."Notification"; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "notif_delete" ON public."Notification"; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "notif_select" ON public."Notification" FOR SELECT USING (true);
CREATE POLICY "notif_insert" ON public."Notification" FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_update" ON public."Notification" FOR UPDATE USING (true);
CREATE POLICY "notif_delete" ON public."Notification" FOR DELETE USING (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- SUPPRIMER l'ancienne table call_signals (lowercase) si elle existe
-- Le code utilise "CallSignal" (PascalCase), pas call_signals
-- ══════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS public.call_signals CASCADE;

-- ══════════════════════════════════════════════════════════════════════════════
-- ACTIVER REALTIME sur les tables critiques
-- ══════════════════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public."MessageChat";
ALTER PUBLICATION supabase_realtime ADD TABLE public."CallSignal";
ALTER PUBLICATION supabase_realtime ADD TABLE public."CallLog";
ALTER PUBLICATION supabase_realtime ADD TABLE public."Notification";
