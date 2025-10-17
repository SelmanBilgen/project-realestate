-- Debug queries to check ortakgr@gmail.com access
-- Run these in Supabase SQL editor to debug the issue

-- 1. Check user profile
SELECT 
  id, 
  email, 
  is_admin, 
  is_premium, 
  created_at
FROM auth.users 
WHERE email = 'ortakgr@gmail.com';

-- 2. Check user profile in profiles table
SELECT 
  id, 
  email, 
  is_admin, 
  is_premium, 
  created_at
FROM profiles 
WHERE email = 'ortakgr@gmail.com';

-- 3. Check user project access
SELECT 
  upa.id,
  upa.user_id,
  upa.project_id,
  upa.granted_at,
  p.title as project_title,
  p.area
FROM user_project_access upa
JOIN projects p ON upa.project_id = p.id
JOIN profiles pr ON upa.user_id = pr.id
WHERE pr.email = 'ortakgr@gmail.com';

-- 4. Check all projects (to see what should be filtered out)
SELECT id, title, area, status FROM projects;

-- 5. Cross-check: Find user ID and check access directly
WITH user_info AS (
  SELECT id, email FROM profiles WHERE email = 'ortakgr@gmail.com'
)
SELECT 
  ui.email,
  upa.project_id,
  p.title
FROM user_info ui
LEFT JOIN user_project_access upa ON ui.id = upa.user_id
LEFT JOIN projects p ON upa.project_id = p.id;