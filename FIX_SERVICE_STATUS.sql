-- ============================================================================
-- FIX: Contrainte CHECK sur le status des Services
-- La valeur "inactif" n'est pas autorisée par la contrainte existante
-- ============================================================================

-- 1. Voir la contrainte actuelle
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public."Service"'::regclass 
AND contype = 'c';

-- 2. Supprimer l'ancienne contrainte
ALTER TABLE public."Service" DROP CONSTRAINT IF EXISTS "Service_status_check";

-- 3. Recréer avec toutes les valeurs autorisées
ALTER TABLE public."Service" ADD CONSTRAINT "Service_status_check" 
CHECK (status IN ('actif', 'brouillon', 'inactif', 'draft', 'active', 'inactive', 'pending', 'archived'));

-- 4. Vérifier que la contrainte est bien en place
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public."Service"'::regclass 
AND contype = 'c';
