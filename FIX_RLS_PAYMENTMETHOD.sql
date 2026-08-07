-- Create ProPaymentMethod table for storing saved credit cards
CREATE TABLE IF NOT EXISTS public."ProPaymentMethod" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  card_last4 TEXT NOT NULL,
  card_brand TEXT NOT NULL DEFAULT 'visa',
  card_holder TEXT NOT NULL,
  card_expiry TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE public."ProPaymentMethod" ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own payment methods
CREATE POLICY "Users can view own payment methods"
  ON public."ProPaymentMethod"
  FOR SELECT
  USING (user_email = auth.email());

-- Allow users to insert their own payment methods
CREATE POLICY "Users can insert own payment methods"
  ON public."ProPaymentMethod"
  FOR INSERT
  WITH CHECK (user_email = auth.email());

-- Allow users to update their own payment methods
CREATE POLICY "Users can update own payment methods"
  ON public."ProPaymentMethod"
  FOR UPDATE
  USING (user_email = auth.email());

-- Allow users to delete their own payment methods
CREATE POLICY "Users can delete own payment methods"
  ON public."ProPaymentMethod"
  FOR DELETE
  USING (user_email = auth.email());

-- Also allow via profiles table lookup (same pattern as other tables)
CREATE POLICY "Users can view via profiles"
  ON public."ProPaymentMethod"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."ProfilPro"
      WHERE "ProfilPro".user_email = auth.email()
      AND "ProfilPro".user_email = "ProPaymentMethod".user_email
    )
  );

CREATE POLICY "Users can insert via profiles"
  ON public."ProPaymentMethod"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."ProfilPro"
      WHERE "ProfilPro".user_email = auth.email()
      AND "ProfilPro".user_email = "ProPaymentMethod".user_email
    )
  );

CREATE POLICY "Users can update via profiles"
  ON public."ProPaymentMethod"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."ProfilPro"
      WHERE "ProfilPro".user_email = auth.email()
      AND "ProfilPro".user_email = "ProPaymentMethod".user_email
    )
  );

CREATE POLICY "Users can delete via profiles"
  ON public."ProPaymentMethod"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."ProfilPro"
      WHERE "ProfilPro".user_email = auth.email()
      AND "ProfilPro".user_email = "ProPaymentMethod".user_email
    )
  );
