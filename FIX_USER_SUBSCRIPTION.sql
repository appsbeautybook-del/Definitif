-- ============================================================
-- FIX_USER_SUBSCRIPTION.sql
-- Crée la table UserSubscription pour tracker les abonnements
-- et ajoute les colonnes manquantes à profiles pour les clients
-- ============================================================

-- 1. Table UserSubscription
CREATE TABLE IF NOT EXISTS "UserSubscription" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price NUMERIC DEFAULT 0,
  plan_type TEXT NOT NULL DEFAULT 'client',
  status TEXT NOT NULL DEFAULT 'active',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'paye',
  billing_name TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  billing_address TEXT,
  billing_city TEXT,
  billing_postal_code TEXT,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_usersubscription_email ON "UserSubscription"(user_email);
CREATE INDEX IF NOT EXISTS idx_usersubscription_status ON "UserSubscription"(status);
CREATE INDEX IF NOT EXISTS idx_usersubscription_plan ON "UserSubscription"(plan_id);

-- RLS
ALTER TABLE "UserSubscription" ENABLE ROW LEVEL SECURITY;

-- Politique: l'utilisateur voit ses propres abonnements
DROP POLICY IF EXISTS "users_select_own_subscriptions" ON "UserSubscription";
CREATE POLICY "users_select_own_subscriptions" ON "UserSubscription"
  FOR SELECT USING (auth.email() = user_email);

-- Politique: l'utilisateur peut créer ses propres abonnements
DROP POLICY IF EXISTS "users_insert_own_subscriptions" ON "UserSubscription";
CREATE POLICY "users_insert_own_subscriptions" ON "UserSubscription"
  FOR INSERT WITH CHECK (auth.email() = user_email);

-- Politique: l'utilisateur peut mettre à jour ses propres abonnements
DROP POLICY IF EXISTS "users_update_own_subscriptions" ON "UserSubscription";
CREATE POLICY "users_update_own_subscriptions" ON "UserSubscription"
  FOR UPDATE USING (auth.email() = user_email);

-- 2. Ajouter les colonnes abonnement à profiles si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'abonnement') THEN
    ALTER TABLE profiles ADD COLUMN abonnement TEXT DEFAULT 'gratuit';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'abonnement_expires_at') THEN
    ALTER TABLE profiles ADD COLUMN abonnement_expires_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;

-- 3. Vérification
SELECT
  (SELECT COUNT(*) FROM "UserSubscription") AS total_subscriptions,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('abonnement', 'abonnement_expires_at', 'stripe_customer_id')) AS profile_columns_count;
