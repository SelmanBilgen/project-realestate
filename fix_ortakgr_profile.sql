-- Fix ortakgr@gmail.com profile and premium access
-- Run this in Supabase SQL editor

-- First, let's see the current state
SELECT 'Current auth users:' as section;
SELECT id, email, created_at FROM auth.users WHERE email = 'ortakgr@gmail.com';

SELECT 'Current profiles:' as section;
SELECT id, email, is_admin, is_premium, created_at FROM profiles WHERE email = 'ortakgr@gmail.com';

-- Ensure the user has a profile (this will create one if missing, update if exists)
INSERT INTO profiles (id, email, is_admin, is_premium, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    false as is_admin,
    true as is_premium,  -- Grant premium access
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.email = 'ortakgr@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
    is_premium = true,
    updated_at = NOW();

-- Verify the fix
SELECT 'After fix - profiles:' as section;
SELECT id, email, is_admin, is_premium, created_at FROM profiles WHERE email = 'ortakgr@gmail.com';

-- Also check project access
SELECT 'Project access for ortakgr:' as section;
SELECT 
    upa.id,
    upa.user_id,
    upa.project_id,
    p.title as project_title,
    upa.granted_at
FROM user_project_access upa
JOIN profiles pr ON upa.user_id = pr.id
JOIN projects p ON upa.project_id = p.id
WHERE pr.email = 'ortakgr@gmail.com';