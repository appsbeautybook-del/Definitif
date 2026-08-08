-- ══════════════════════════════════════════════════════════════════════════════
-- RLS Policies pour les tables critiques (Messages, Appels, etc.)
-- Exécuter dans le SQL Editor de Supabase
-- ══════════════════════════════════════════════════════════════════════════════

-- ── MessageChat ──────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public."MessageChat" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "msg_select" ON public."MessageChat"
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "msg_insert" ON public."MessageChat"
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "msg_update" ON public."MessageChat"
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "msg_delete" ON public."MessageChat"
    FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── CallSignal ───────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public."CallSignal" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "call_signal_select" ON public."CallSignal"
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "call_signal_insert" ON public."CallSignal"
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "call_signal_update" ON public."CallSignal"
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "call_signal_delete" ON public."CallSignal"
    FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── CallLog ──────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public."CallLog" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "call_log_select" ON public."CallLog"
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "call_log_insert" ON public."CallLog"
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "call_log_update" ON public."CallLog"
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Notification ─────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public."Notification" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "notif_select" ON public."Notification"
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "notif_insert" ON public."Notification"
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "notif_update" ON public."Notification"
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
