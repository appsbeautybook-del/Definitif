-- Clean up duplicate ProfilPro records
-- Keep the one with status='actif' if exists, otherwise keep the one with most data

-- Step 1: Find duplicates
SELECT user_email, COUNT(*) as cnt
FROM "ProfilPro"
GROUP BY user_email
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicates, keeping the one with status='actif' or most data
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY user_email
      ORDER BY
        CASE WHEN status = 'actif' THEN 0 ELSE 1 END,
        CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 0 ELSE 1 END,
        CASE WHEN cover_url IS NOT NULL AND cover_url != '' THEN 0 ELSE 1 END,
        created_at DESC
    ) as rn
  FROM "ProfilPro"
)
DELETE FROM "ProfilPro"
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 3: Verify no more duplicates
SELECT user_email, COUNT(*) as cnt
FROM "ProfilPro"
GROUP BY user_email
HAVING COUNT(*) > 1;
