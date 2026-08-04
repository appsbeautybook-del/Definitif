-- ============================================================
-- FIX RLS RESERVATION — Copier/coller dans Supabase SQL Editor → Run
-- Problème: le SELECT policy exige un lookup dans profiles
-- qui peut échouer si le profil n'existe pas.
-- Solution: ajouter auth.email() comme alternative.
-- ============================================================

-- Supprimer l'ancien policy SELECT
DROP POLICY IF EXISTS "Reservation: select" ON public."Reservation";

-- Recréer avec auth.email() en alternative au lookup profiles
CREATE POLICY "Reservation: select" ON public."Reservation" FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    client_email = auth.email() OR
    client_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    pro_email = auth.email() OR
    pro_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- Supprimer l'ancien policy UPDATE
DROP POLICY IF EXISTS "Reservation: update" ON public."Reservation";

-- Recréer UPDATE avec auth.email()
CREATE POLICY "Reservation: update" ON public."Reservation" FOR UPDATE USING (
  client_email = auth.email() OR
  client_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
  pro_email = auth.email() OR
  pro_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Supprimer l'ancien policy DELETE
DROP POLICY IF EXISTS "Reservation: delete" ON public."Reservation";

-- Recréer DELETE avec auth.email()
CREATE POLICY "Reservation: delete" ON public."Reservation" FOR DELETE USING (
  client_email = auth.email() OR
  client_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
  pro_email = auth.email() OR
  pro_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';
