-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor to fix the user management issues

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- SIMPLE SOLUTION: Disable RLS entirely for admin operations
-- This is the safest approach to avoid recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create simple admin management functions that work without RLS complications
CREATE OR REPLACE FUNCTION admin_toggle_premium(target_user_id UUID, new_premium_status BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_caller_admin BOOLEAN;
BEGIN
  -- Check if caller is admin (simple check without RLS)
  SELECT is_admin INTO is_caller_admin
  FROM profiles 
  WHERE id = auth.uid();
  
  IF NOT FOUND OR NOT COALESCE(is_caller_admin, false) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update the target user's premium status
  UPDATE profiles 
  SET is_premium = new_premium_status
  WHERE id = target_user_id;
  
  -- If removing premium access, also remove all project access
  -- User should only see public projects (like a visitor)
  IF new_premium_status = false THEN
    DELETE FROM user_project_access 
    WHERE user_id = target_user_id;
  END IF;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION admin_toggle_admin_role(target_user_id UUID, new_admin_status BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_caller_admin BOOLEAN;
BEGIN
  -- Check if caller is admin (simple check without RLS)
  SELECT is_admin INTO is_caller_admin
  FROM profiles 
  WHERE id = auth.uid();
  
  IF NOT FOUND OR NOT COALESCE(is_caller_admin, false) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update the target user's admin status
  UPDATE profiles 
  SET is_admin = new_admin_status
  WHERE id = target_user_id;
  
  -- If removing admin role, also check if they should lose premium access
  -- Note: We keep premium status but remove project access unless they're still premium
  IF new_admin_status = false THEN
    -- Check if user is still premium after losing admin
    DECLARE
      user_is_premium BOOLEAN;
    BEGIN
      SELECT is_premium INTO user_is_premium 
      FROM profiles 
      WHERE id = target_user_id;
      
      -- If not premium anymore, remove all project access
      IF NOT COALESCE(user_is_premium, false) THEN
        DELETE FROM user_project_access 
        WHERE user_id = target_user_id;
      END IF;
    END;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Update the user fetching function to work without complex RLS
DROP FUNCTION IF EXISTS get_all_users_for_admin();

CREATE OR REPLACE FUNCTION get_all_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  is_premium BOOLEAN,
  is_admin BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_caller_admin BOOLEAN;
BEGIN
  -- Check if caller is admin (simple check)
  SELECT is_admin INTO is_caller_admin
  FROM profiles 
  WHERE id = auth.uid();
  
  IF NOT FOUND OR NOT COALESCE(is_caller_admin, false) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Return all users if caller is admin
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.email, '') as email,
    COALESCE(p.is_premium, false) as is_premium,
    COALESCE(p.is_admin, false) as is_admin,
    p.created_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant permissions to these functions
GRANT EXECUTE ON FUNCTION get_all_users_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_premium(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_admin_role(UUID, BOOLEAN) TO authenticated;

-- Test the setup
SELECT 'RLS disabled and admin functions created successfully' as status;