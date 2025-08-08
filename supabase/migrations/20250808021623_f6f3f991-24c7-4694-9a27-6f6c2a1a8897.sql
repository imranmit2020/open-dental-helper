-- Ensure one role per corporation per user
-- 1) Remove duplicates, keep the most recent assignment per (corporation_id, user_id)
WITH ranked AS (
  SELECT id, corporation_id, user_id,
         row_number() OVER (PARTITION BY corporation_id, user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.corporate_users
)
DELETE FROM public.corporate_users cu
USING ranked r
WHERE cu.id = r.id AND r.rn > 1;

-- 2) Add a unique index to enforce single role per corporation per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_corporate_users_unique_corp_user
  ON public.corporate_users (corporation_id, user_id);
