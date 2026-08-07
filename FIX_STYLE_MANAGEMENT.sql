-- ============================================================
-- STYLE MANAGEMENT SYSTEM - Complete Migration
-- ============================================================

-- 1. CREATE StyleCategory TABLE
CREATE TABLE IF NOT EXISTS public."StyleCategory" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'Palette',
  color TEXT DEFAULT '#E8732A',
  is_active BOOLEAN DEFAULT true,
  styles_count INTEGER DEFAULT 0,
  subcategories_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CREATE StyleSubCategory TABLE
CREATE TABLE IF NOT EXISTS public."StyleSubCategory" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public."StyleCategory"(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  styles_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slug, category_id)
);

-- 3. ADD NEW COLUMNS TO Style TABLE
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS subcategory TEXT DEFAULT '';
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public."StyleSubCategory"(id) ON DELETE SET NULL;
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public."StyleCategory"(id) ON DELETE SET NULL;
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS produits_utilises JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS outils_utilises JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS type_cheveux TEXT DEFAULT '';
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS type_peau TEXT DEFAULT '';
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS type_prestation TEXT DEFAULT '';
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS temps_moyen TEXT DEFAULT '';
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS niveau_difficulte TEXT DEFAULT '';
ALTER TABLE public."Style" ADD COLUMN IF NOT EXISTS mots_cles JSONB DEFAULT '[]'::jsonb;

-- 4. RLS POLICIES FOR StyleCategory
ALTER TABLE public."StyleCategory" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active categories"
  ON public."StyleCategory" FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage categories"
  ON public."StyleCategory" FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. RLS POLICIES FOR StyleSubCategory
ALTER TABLE public."StyleSubCategory" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active subcategories"
  ON public."StyleSubCategory" FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage subcategories"
  ON public."StyleSubCategory" FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. UPDATE FUNCTIONS TO MAINTAIN COUNTS
CREATE OR REPLACE FUNCTION update_style_category_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public."StyleCategory"
  SET styles_count = (
    SELECT COUNT(*) FROM public."Style"
    WHERE category_id = NEW.category_id OR category_id = OLD.category_id
  ),
  subcategories_count = (
    SELECT COUNT(*) FROM public."StyleSubCategory"
    WHERE category_id = NEW.category_id
  ),
  updated_at = now()
  WHERE id = NEW.category_id OR id = OLD.category_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_subcategory_style_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public."StyleSubCategory"
  SET styles_count = (
    SELECT COUNT(*) FROM public."Style"
    WHERE subcategory_id = NEW.subcategory_id OR subcategory_id = OLD.subcategory_id
  ),
  updated_at = now()
  WHERE id = NEW.subcategory_id OR id = OLD.subcategory_id;

  -- Also update parent category
  UPDATE public."StyleCategory"
  SET styles_count = (
    SELECT COUNT(*) FROM public."Style"
    WHERE category_id = (
      SELECT category_id FROM public."StyleSubCategory"
      WHERE id = COALESCE(NEW.subcategory_id, OLD.subcategory_id)
    )
  ),
  updated_at = now()
  WHERE id = (
    SELECT category_id FROM public."StyleSubCategory"
    WHERE id = COALESCE(NEW.subcategory_id, OLD.subcategory_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. INSERT DEFAULT CATEGORIES
INSERT INTO public."StyleCategory" (name, slug, description, icon, color) VALUES
  ('Coiffure', 'coiffure', 'Coupe, coiffage, tresses et soins capillaires', 'Scissors', '#E8732A'),
  ('Maquillage', 'maquillage', 'Maquillage visage, yeux, lèvres et corps', 'Palette', '#9333EA'),
  ('Ongles', 'ongles', 'Manucure, pédicure, gel, acrylique et nail art', 'Fingerprint', '#EC4899'),
  ('Soins', 'soins', 'Soins visage, corps et bien-être', 'Heart', '#10B981'),
  ('Barbe', 'barbe', 'Taille de barbe, rasage et soins barbe', 'User', '#6366F1'),
  ('Massage', 'massage', 'Massage relaxant, sportif, thérapeutique', 'Hand', '#F59E0B'),
  ('Spa & Bien-être', 'spa-bien-etre', 'Services spa, hammam, détente', 'Flower2', '#14B8A6'),
  ('Épilation', 'epilation', 'Épilation visage et corps', 'Zap', '#F43F5E'),
  ('Tatouage', 'tatouage', 'Tatouage artistique et temporaires', 'PenTool', '#0EA5E9'),
  ('Piercing', 'piercing', 'Piercing corporel et auriculaire', 'Circle', '#8B5CF6'),
  ('Produits de beauté', 'produits-beaute', 'Produits cosmétiques et soins', 'ShoppingBag', '#D97706')
ON CONFLICT (slug) DO NOTHING;

-- 8. INSERT DEFAULT SUBCATEGORIES
DO $$
DECLARE
  cat_id UUID;
BEGIN
  -- Coiffure subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'coiffure';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Afro', 'afro', cat_id),
      ('Européenne', 'europeenne', cat_id),
      ('Asiatique', 'asiatique', cat_id),
      ('Locks', 'locks', cat_id),
      ('Sisterlocks', 'sisterlocks', cat_id),
      ('Faux Locks', 'faux-locks', cat_id),
      ('Braids', 'braids', cat_id),
      ('Knotless Braids', 'knotless-braids', cat_id),
      ('Box Braids', 'box-braids', cat_id),
      ('Cornrows', 'cornrows', cat_id),
      ('Twist', 'twist', cat_id),
      ('Vanilles', 'vanilles', cat_id),
      ('Perruques', 'perruques', cat_id),
      ('Lace Wig', 'lace-wig', cat_id),
      ('Chignons', 'chignons', cat_id),
      ('Coloration', 'coloration', cat_id),
      ('Décoloration', 'decoloration', cat_id),
      ('Lissage', 'lissage', cat_id),
      ('Permanente', 'permanente', cat_id),
      ('Coupes Homme', 'coupe-homme', cat_id),
      ('Coupes Femme', 'coupe-femme', cat_id),
      ('Coupes Enfant', 'coupe-enfant', cat_id),
      ('Coiffure de mariage', 'coiffure-mariage', cat_id),
      ('Coiffure événementielle', 'coiffure-evenementielle', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Maquillage subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'maquillage';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Naturel', 'naturel', cat_id),
      ('Mariage', 'mariage', cat_id),
      ('Glamour', 'glamour', cat_id),
      ('Professionnel', 'professionnel', cat_id),
      ('Artistique', 'artistique', cat_id),
      ('Permanent', 'permanent', cat_id),
      ('Microblading', 'microblading', cat_id),
      ('Lash Lift', 'lash-lift', cat_id),
      ('Brow Lift', 'brow-lift', cat_id),
      ('Faux cils', 'faux-cils', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Ongles subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'ongles';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Gel', 'gel', cat_id),
      ('Résine', 'resine', cat_id),
      ('Acrylique', 'acrylique', cat_id),
      ('Semi-permanent', 'semi-permanent', cat_id),
      ('Nail Art', 'nail-art', cat_id),
      ('French', 'french', cat_id),
      ('Baby Boomer', 'baby-boomer', cat_id),
      ('Capsules', 'capsules', cat_id),
      ('Décoration', 'decoration', cat_id),
      ('Chrome', 'chrome', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Soins subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'soins';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Soins visage', 'soins-visage', cat_id),
      ('Soins corps', 'soins-corps', cat_id),
      ('Hydratation', 'hydratation', cat_id),
      ('Anti-âge', 'anti-age', cat_id),
      ('Acné', 'acne', cat_id),
      ('Éclat', 'eclat', cat_id),
      ('Détox', 'detox', cat_id),
      ('Rafréchissement', 'rafraichissement', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Barbe subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'barbe';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Taille classique', 'taille-classique', cat_id),
      ('Taille design', 'taille-design', cat_id),
      ('Rasage complet', 'rasage-complet', cat_id),
      ('Soin barbe', 'soin-barbe', cat_id),
      ('Coloration barbe', 'coloration-barbe', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Massage subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'massage';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Relaxant', 'relaxant', cat_id),
      ('Sportif', 'sportif', cat_id),
      ('Thérapeutique', 'therapeutique', cat_id),
      ('Drainant', 'drainant', cat_id),
      ('Prenatal', 'prenatal', cat_id),
      ('Hot Stone', 'hot-stone', cat_id),
      ('Aromathérapie', 'aromatherapie', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Spa & Bien-être subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'spa-bien-etre';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Hammam', 'hammam', cat_id),
      ('Sauna', 'sauna', cat_id),
      ('Jacuzzi', 'jacuzzi', cat_id),
      ('Rituel corps', 'rituel-corps', cat_id),
      ('Rituel visage', 'rituel-visage', cat_id),
      ('Detox total', 'detox-total', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Épilation subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'epilation';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Cire chaude', 'cire-chaude', cat_id),
      ('Cire froide', 'cire-froide', cat_id),
      ('Épilation laser', 'epilation-laser', cat_id),
      ('Visage', 'visage', cat_id),
      ('Corps', 'corps', cat_id),
      ('Complète', 'complete', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Tatouage subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'tatouage';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Blackwork', 'blackwork', cat_id),
      ('Coloré', 'colore', cat_id),
      ('Aquarelle', 'aquarelle', cat_id),
      ('Japonais', 'japonais', cat_id),
      ('Geometric', 'geometric', cat_id),
      ('Temporaire', 'temporaire', cat_id),
      ('Cover-up', 'cover-up', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Piercing subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'piercing';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Lobe', 'lobe', cat_id),
      ('Cartilage', 'cartilage', cat_id),
      ('Nez', 'nez', cat_id),
      ('Sourcil', 'sourcil', cat_id),
      ('Lèvre', 'levre', cat_id),
      ('Nombril', 'nombril', cat_id),
      ('Corps', 'corps', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;

  -- Produits de beauté subcategories
  SELECT id INTO cat_id FROM public."StyleCategory" WHERE slug = 'produits-beaute';
  IF cat_id IS NOT NULL THEN
    INSERT INTO public."StyleSubCategory" (name, slug, category_id) VALUES
      ('Soins visage', 'soins-visage', cat_id),
      ('Soins corps', 'soins-corps', cat_id),
      ('Maquillage', 'maquillage', cat_id),
      ('Cheveux', 'cheveux', cat_id),
      ('Parfums', 'parfums', cat_id),
      ('Outils', 'outils', cat_id)
    ON CONFLICT (slug, category_id) DO NOTHING;
  END IF;
END $$;

-- 9. UPDATE COUNTS
UPDATE public."StyleCategory" SET
  styles_count = (SELECT COUNT(*) FROM public."Style" WHERE "Style".category_id = "StyleCategory".id),
  subcategories_count = (SELECT COUNT(*) FROM public."StyleSubCategory" WHERE category_id = "StyleCategory".id);

UPDATE public."StyleSubCategory" SET
  styles_count = (SELECT COUNT(*) FROM public."Style" WHERE subcategory_id = "StyleSubCategory".id);
