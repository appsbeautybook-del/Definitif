-- ============================================================
-- BeautyBook — Migration: colonnes manquantes
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── profiles ───────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS beauty_interests JSONB DEFAULT '[]'::jsonb;

-- ─── ProfilPro ──────────────────────────────────────────────
ALTER TABLE public."ProfilPro" ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;
ALTER TABLE public."ProfilPro" ADD COLUMN IF NOT EXISTS ouverture JSONB DEFAULT '{}'::jsonb;

-- ─── Service ────────────────────────────────────────────────
ALTER TABLE public."Service" ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public."Service" ADD COLUMN IF NOT EXISTS style TEXT;

-- ─── MembreEquipe ──────────────────────────────────────────
ALTER TABLE public."MembreEquipe" ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public."MembreEquipe" ADD COLUMN IF NOT EXISTS days TEXT[] DEFAULT '{}';

-- ─── CatalogueOption ────────────────────────────────────────
ALTER TABLE public."CatalogueOption" ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public."CatalogueOption" ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- ─── Annonce ────────────────────────────────────────────────
ALTER TABLE public."Annonce" ADD COLUMN IF NOT EXISTS sponsor_name TEXT;

-- ─── LiveSession ────────────────────────────────────────────
ALTER TABLE public."LiveSession" ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public."LiveSession" ADD COLUMN IF NOT EXISTS viewers INTEGER DEFAULT 0;

-- ─── CallSignal ─────────────────────────────────────────────
ALTER TABLE public."CallSignal" ADD COLUMN IF NOT EXISTS caller_name TEXT;
ALTER TABLE public."CallSignal" ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public."CallSignal" ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public."CallSignal" ADD COLUMN IF NOT EXISTS payload TEXT;

-- ─── MessageChat ────────────────────────────────────────────
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE public."MessageChat" ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- ─── Notification ──────────────────────────────────────────
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public."Notification" ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- ─── Produit ────────────────────────────────────────────────
ALTER TABLE public."Produit" ADD COLUMN IF NOT EXISTS old_price NUMERIC;
ALTER TABLE public."Produit" ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE public."Produit" ADD COLUMN IF NOT EXISTS min_qty INTEGER;

-- ─── Commande ──────────────────────────────────────────────
ALTER TABLE public."Commande" ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
ALTER TABLE public."Commande" ADD COLUMN IF NOT EXISTS shipping NUMERIC;
ALTER TABLE public."Commande" ADD COLUMN IF NOT EXISTS total NUMERIC;
ALTER TABLE public."Commande" ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- ─── PointsFidelite ────────────────────────────────────────
ALTER TABLE public."PointsFidelite" ADD COLUMN IF NOT EXISTS points_total INTEGER DEFAULT 0;
ALTER TABLE public."PointsFidelite" ADD COLUMN IF NOT EXISTS points_depenses INTEGER DEFAULT 0;
ALTER TABLE public."PointsFidelite" ADD COLUMN IF NOT EXISTS niveau TEXT DEFAULT 'Silver';
ALTER TABLE public."PointsFidelite" ADD COLUMN IF NOT EXISTS historique JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."PointsFidelite" ADD COLUMN IF NOT EXISTS code_parrainage TEXT;

-- ─── SoldeBeautyPay ────────────────────────────────────────
ALTER TABLE public."SoldeBeautyPay" ADD COLUMN IF NOT EXISTS solde NUMERIC DEFAULT 0;

-- ─── DemandeProV2 ──────────────────────────────────────────
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS salon_name TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS type_activite TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS specialites_cheveux JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS salon_photo TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS email_pro TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS doc_identite_recto TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS doc_identite_verso TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS doc_siret TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS doc_assurance TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS days JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS time_slots JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS commodites JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS seats_count INTEGER DEFAULT 1;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS se_deplace BOOLEAN DEFAULT false;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS travail_nuit BOOLEAN DEFAULT false;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS visite_video_url TEXT;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS diplomes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."DemandeProV2" ADD COLUMN IF NOT EXISTS has_diplome BOOLEAN DEFAULT false;

-- ─── DemandefFranchise ─────────────────────────────────────
ALTER TABLE public."DemandefFranchise" ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public."DemandefFranchise" ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public."DemandefFranchise" ADD COLUMN IF NOT EXISTS phone TEXT;

-- ─── RoutineBeaute ─────────────────────────────────────────
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS emoji TEXT;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS days_of_week JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS duration_min INTEGER DEFAULT 30;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS objectif TEXT;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS objectif_duree_semaines INTEGER DEFAULT 8;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS objectif_debut TEXT;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS sessions_total INTEGER DEFAULT 0;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS sessions_faites INTEGER DEFAULT 0;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS last_done_date TEXT;
ALTER TABLE public."RoutineBeaute" ADD COLUMN IF NOT EXISTS reminder_active BOOLEAN DEFAULT false;

-- ─── LiveMessage (sender_* aliases) ─────────────────────────
ALTER TABLE public."LiveMessage" ADD COLUMN IF NOT EXISTS sender_email TEXT;
ALTER TABLE public."LiveMessage" ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public."LiveMessage" ADD COLUMN IF NOT EXISTS sender_avatar TEXT;

-- ─── MembreEquipe (name alias) ──────────────────────────────
ALTER TABLE public."MembreEquipe" ADD COLUMN IF NOT EXISTS name TEXT;
