-- ============================================================
-- BeautyBook — Fix Vendeur Role
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. S'assurer que la table profiles existe avec RLS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vendeur')),
  maria_name TEXT,
  maria_memory JSONB DEFAULT '{}'::jsonb,
  gender TEXT,
  beauty_interests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. RLS : permettre la lecture publique et la modification par soi-même
DROP POLICY IF EXISTS "profiles: lecture publique" ON public.profiles;
CREATE POLICY "profiles: lecture publique" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles: modif soi-même" ON public.profiles;
CREATE POLICY "profiles: modif soi-même" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: insertion auto" ON public.profiles;
CREATE POLICY "profiles: insertion auto" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Trigger : auto-création profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Promouvoir l'utilisateur existant en vendeur
-- Remplacez 'greatwarrior2040@gmail.com' par votre email si différent
UPDATE public.profiles
SET role = 'vendeur', updated_at = now()
WHERE email = 'greatwarrior2040@gmail.com';

-- 5. Si la ligne n'existe pas, la créer
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'vendeur'
FROM auth.users
WHERE email = 'greatwarrior2040@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'greatwarrior2040@gmail.com');

-- 6. Mettre à jour aussi user_metadata pour l'auto-fix
UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"role": "vendeur"}'::jsonb
    ELSE raw_user_meta_data || '{"role": "vendeur"}'::jsonb
  END
WHERE email = 'greatwarrior2040@gmail.com';
