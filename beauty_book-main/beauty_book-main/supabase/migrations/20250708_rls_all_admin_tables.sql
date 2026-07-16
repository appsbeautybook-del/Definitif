-- Allow public read access on all admin tables
-- This ensures the main app can read data without authentication

-- Style
ALTER TABLE "Style" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "style_select_public" ON "Style";
CREATE POLICY "style_select_public" ON "Style" FOR SELECT USING (true);
DROP POLICY IF EXISTS "style_insert_auth" ON "Style";
CREATE POLICY "style_insert_auth" ON "Style" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "style_update_auth" ON "Style";
CREATE POLICY "style_update_auth" ON "Style" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "style_delete_auth" ON "Style";
CREATE POLICY "style_delete_auth" ON "Style" FOR DELETE USING (auth.role() = 'authenticated');

-- Service
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_select_public" ON "Service";
CREATE POLICY "service_select_public" ON "Service" FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_insert_auth" ON "Service";
CREATE POLICY "service_insert_auth" ON "Service" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "service_update_auth" ON "Service";
CREATE POLICY "service_update_auth" ON "Service" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "service_delete_auth" ON "Service";
CREATE POLICY "service_delete_auth" ON "Service" FOR DELETE USING (auth.role() = 'authenticated');

-- ProfilPro
ALTER TABLE "ProfilPro" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pp_select_public" ON "ProfilPro";
CREATE POLICY "pp_select_public" ON "ProfilPro" FOR SELECT USING (true);
DROP POLICY IF EXISTS "pp_insert_auth" ON "ProfilPro";
CREATE POLICY "pp_insert_auth" ON "ProfilPro" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "pp_update_auth" ON "ProfilPro";
CREATE POLICY "pp_update_auth" ON "ProfilPro" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "pp_delete_auth" ON "ProfilPro";
CREATE POLICY "pp_delete_auth" ON "ProfilPro" FOR DELETE USING (auth.role() = 'authenticated');

-- Annonce
ALTER TABLE "Annonce" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "annonce_select_public" ON "Annonce";
CREATE POLICY "annonce_select_public" ON "Annonce" FOR SELECT USING (true);
DROP POLICY IF EXISTS "annonce_insert_auth" ON "Annonce";
CREATE POLICY "annonce_insert_auth" ON "Annonce" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "annonce_update_auth" ON "Annonce";
CREATE POLICY "annonce_update_auth" ON "Annonce" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "annonce_delete_auth" ON "Annonce";
CREATE POLICY "annonce_delete_auth" ON "Annonce" FOR DELETE USING (auth.role() = 'authenticated');

-- AppConfig
ALTER TABLE "AppConfig" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ac_select_public" ON "AppConfig";
CREATE POLICY "ac_select_public" ON "AppConfig" FOR SELECT USING (true);
DROP POLICY IF EXISTS "ac_insert_auth" ON "AppConfig";
CREATE POLICY "ac_insert_auth" ON "AppConfig" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "ac_update_auth" ON "AppConfig";
CREATE POLICY "ac_update_auth" ON "AppConfig" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "ac_delete_auth" ON "AppConfig";
CREATE POLICY "ac_delete_auth" ON "AppConfig" FOR DELETE USING (auth.role() = 'authenticated');

-- Reel
ALTER TABLE "Reel" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reel_select_public" ON "Reel";
CREATE POLICY "reel_select_public" ON "Reel" FOR SELECT USING (true);
DROP POLICY IF EXISTS "reel_insert_auth" ON "Reel";
CREATE POLICY "reel_insert_auth" ON "Reel" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "reel_update_auth" ON "Reel";
CREATE POLICY "reel_update_auth" ON "Reel" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "reel_delete_auth" ON "Reel";
CREATE POLICY "reel_delete_auth" ON "Reel" FOR DELETE USING (auth.role() = 'authenticated');

-- Commande
ALTER TABLE "Commande" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cmd_select_public" ON "Commande";
CREATE POLICY "cmd_select_public" ON "Commande" FOR SELECT USING (true);
DROP POLICY IF EXISTS "cmd_insert_auth" ON "Commande";
CREATE POLICY "cmd_insert_auth" ON "Commande" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "cmd_update_auth" ON "Commande";
CREATE POLICY "cmd_update_auth" ON "Commande" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "cmd_delete_auth" ON "Commande";
CREATE POLICY "cmd_delete_auth" ON "Commande" FOR DELETE USING (auth.role() = 'authenticated');

-- Reservation
ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "res_select_public" ON "Reservation";
CREATE POLICY "res_select_public" ON "Reservation" FOR SELECT USING (true);
DROP POLICY IF EXISTS "res_insert_auth" ON "Reservation";
CREATE POLICY "res_insert_auth" ON "Reservation" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "res_update_auth" ON "Reservation";
CREATE POLICY "res_update_auth" ON "Reservation" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "res_delete_auth" ON "Reservation";
CREATE POLICY "res_delete_auth" ON "Reservation" FOR DELETE USING (auth.role() = 'authenticated');

-- LiveSession
ALTER TABLE "LiveSession" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ls_select_public" ON "LiveSession";
CREATE POLICY "ls_select_public" ON "LiveSession" FOR SELECT USING (true);
DROP POLICY IF EXISTS "ls_insert_auth" ON "LiveSession";
CREATE POLICY "ls_insert_auth" ON "LiveSession" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "ls_update_auth" ON "LiveSession";
CREATE POLICY "ls_update_auth" ON "LiveSession" FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "ls_delete_auth" ON "LiveSession";
CREATE POLICY "ls_delete_auth" ON "LiveSession" FOR DELETE USING (auth.role() = 'authenticated');

-- Notification
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select_public" ON "Notification";
CREATE POLICY "notif_select_public" ON "Notification" FOR SELECT USING (true);
DROP POLICY IF EXISTS "notif_insert_auth" ON "Notification";
CREATE POLICY "notif_insert_auth" ON "Notification" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CommentaireStyle
ALTER TABLE "CommentaireStyle" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cs_select_public" ON "CommentaireStyle";
CREATE POLICY "cs_select_public" ON "CommentaireStyle" FOR SELECT USING (true);
DROP POLICY IF EXISTS "cs_insert_auth" ON "CommentaireStyle";
CREATE POLICY "cs_insert_auth" ON "CommentaireStyle" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- PointsFidelite
ALTER TABLE "PointsFidelite" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pf_select_public" ON "PointsFidelite";
CREATE POLICY "pf_select_public" ON "PointsFidelite" FOR SELECT USING (true);
DROP POLICY IF EXISTS "pf_insert_auth" ON "PointsFidelite";
CREATE POLICY "pf_insert_auth" ON "PointsFidelite" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "pf_update_auth" ON "PointsFidelite";
CREATE POLICY "pf_update_auth" ON "PointsFidelite" FOR UPDATE USING (auth.role() = 'authenticated');

-- PointsFidelitePro
ALTER TABLE "PointsFidelitePro" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pfp_select_public" ON "PointsFidelitePro";
CREATE POLICY "pfp_select_public" ON "PointsFidelitePro" FOR SELECT USING (true);
DROP POLICY IF EXISTS "pfp_insert_auth" ON "PointsFidelitePro";
CREATE POLICY "pfp_insert_auth" ON "PointsFidelitePro" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- DemandeProV2
ALTER TABLE "DemandeProV2" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dpv_select_public" ON "DemandeProV2";
CREATE POLICY "dpv_select_public" ON "DemandeProV2" FOR SELECT USING (true);
DROP POLICY IF EXISTS "dpv_insert_auth" ON "DemandeProV2";
CREATE POLICY "dpv_insert_auth" ON "DemandeProV2" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "dpv_update_auth" ON "DemandeProV2";
CREATE POLICY "dpv_update_auth" ON "DemandeProV2" FOR UPDATE USING (auth.role() = 'authenticated');
