-- ============================================================
-- Campus Lost & Found Portal — Admin Seed Script
-- ============================================================
-- This script promotes an existing user to admin by setting
-- the `role` claim in their app_metadata.
--
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Find the user you want to make admin, copy their UUID
-- 3. Replace 'YOUR_USER_UUID_HERE' below with the actual UUID
-- 4. Run in SQL Editor
-- ============================================================

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE id = '58360eac-f334-4070-bfc2-ec4139690a7f';

UPDATE public.users
SET role = 'admin', updated_at = NOW()
WHERE id = '58360eac-f334-4070-bfc2-ec4139690a7f';

-- Verify:
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE id = '58360eac-f334-4070-bfc2-ec4139690a7f';

SELECT id, email, role, updated_at
FROM public.users
WHERE id = '58360eac-f334-4070-bfc2-ec4139690a7f';

-- ── To REVOKE admin ──────────────────────────────────────────
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data - 'role'
-- WHERE id = '58360eac-f334-4070-bfc2-ec4139690a7f';
