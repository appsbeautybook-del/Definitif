-- ============================================================
-- BeautyBook — Création des comptes admin + vendeur
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Compte admin (email déjà confirmé)
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@beautybook.fr';
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated', 'authenticated',
      'admin@beautybook.fr',
      crypt('admin123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin","role":"admin"}'
    );
  END IF;
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (admin_id, 'admin@beautybook.fr', 'Admin', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;

-- 2. Compte vendeur (email déjà confirmé)
DO $$
DECLARE
  vendeur_id uuid;
BEGIN
  SELECT id INTO vendeur_id FROM auth.users WHERE email = 'vendeur@beautybook.fr';
  IF vendeur_id IS NULL THEN
    vendeur_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      vendeur_id,
      'authenticated', 'authenticated',
      'vendeur@beautybook.fr',
      crypt('vendeur123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Vendeur Test","role":"vendeur"}'
    );
  END IF;
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (vendeur_id, 'vendeur@beautybook.fr', 'Vendeur Test', 'vendeur')
  ON CONFLICT (id) DO UPDATE SET role = 'vendeur';
END $$;

-- 3. Vérification
SELECT email, role FROM public.profiles WHERE email IN ('admin@beautybook.fr', 'vendeur@beautybook.fr');
