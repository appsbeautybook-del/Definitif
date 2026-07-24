-- ============================================================
-- FIX: Allow public/anonymous read access to all BeautyBook tables
-- The admin panel works because it's authenticated via Supabase Auth.
-- The main app reads without auth, so RLS must allow public SELECT.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vimusrczrjvefsbljtmf/sql
-- ============================================================

-- 1. Disable RLS on all tables (simplest fix for a public-facing app)
ALTER TABLE "AppConfig" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Reel" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Style" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Produit" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Commande" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Reservation" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "LiveSession" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ProfilPro" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ImmobilierListing" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "DemandeProV2" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "MessageChat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "CommentaireStyle" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Avis" DISABLE ROW LEVEL SECURITY;

-- 2. If you prefer to keep RLS enabled but allow public reads,
-- uncomment the following and comment out the DISABLE lines above:

-- CREATE POLICY "Public read AppConfig" ON "AppConfig" FOR SELECT USING (true);
-- CREATE POLICY "Public read Reel" ON "Reel" FOR SELECT USING (true);
-- CREATE POLICY "Public read Style" ON "Style" FOR SELECT USING (true);
-- CREATE POLICY "Public read Service" ON "Service" FOR SELECT USING (true);
-- CREATE POLICY "Public read Produit" ON "Produit" FOR SELECT USING (true);
-- CREATE POLICY "Public read Commande" ON "Commande" FOR SELECT USING (true);
-- CREATE POLICY "Public read Reservation" ON "Reservation" FOR SELECT USING (true);
-- CREATE POLICY "Public read LiveSession" ON "LiveSession" FOR SELECT USING (true);
-- CREATE POLICY "Public read ProfilPro" ON "ProfilPro" FOR SELECT USING (true);
-- CREATE POLICY "Public read Client" ON "Client" FOR SELECT USING (true);
-- CREATE POLICY "Public read ImmobilierListing" ON "ImmobilierListing" FOR SELECT USING (true);
-- CREATE POLICY "Public read DemandeProV2" ON "DemandeProV2" FOR SELECT USING (true);
-- CREATE POLICY "Public read Notification" ON "Notification" FOR SELECT USING (true);
-- CREATE POLICY "Public read MessageChat" ON "MessageChat" FOR SELECT USING (true);
-- CREATE POLICY "Public read CommentaireStyle" ON "CommentaireStyle" FOR SELECT USING (true);
-- CREATE POLICY "Public read Avis" ON "Avis" FOR SELECT USING (true);
-- CREATE POLICY "Public read profiles" ON "profiles" FOR SELECT USING (true);

-- 3. Also drop any existing restrictive policies that block reads
-- (Only needed if you previously created policies)

-- DROP POLICY IF EXISTS "Users can view own profile" ON "profiles";
-- DROP POLICY IF EXISTS "Enable read access for all users" ON "AppConfig";
