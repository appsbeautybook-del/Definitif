-- Ajouter followers si manquant
ALTER TABLE public."ProfilPro" ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;

-- Verifier
SELECT column_name FROM information_schema.columns WHERE table_name = 'ProfilPro' AND column_name = 'followers';
