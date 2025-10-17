-- Add premium access column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Add project access table for managing specific project access for premium users
CREATE TABLE IF NOT EXISTS user_project_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, project_id)
);

-- Enable RLS on user_project_access
ALTER TABLE user_project_access ENABLE ROW LEVEL SECURITY;

-- Simple policies for user_project_access
DROP POLICY IF EXISTS "Only admins can view project access" ON user_project_access;
CREATE POLICY "Only admins can view project access" ON user_project_access
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert project access" ON user_project_access;
CREATE POLICY "Only admins can insert project access" ON user_project_access
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can delete project access" ON user_project_access;
CREATE POLICY "Only admins can delete project access" ON user_project_access
  FOR DELETE USING (true);

-- Drop the previous function
DROP FUNCTION IF EXISTS get_all_users_for_admin();

-- Create a simpler function to get all users for admins
CREATE OR REPLACE FUNCTION get_all_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  is_admin BOOLEAN,
  is_premium BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT p.is_admin INTO current_user_is_admin
  FROM profiles p
  WHERE p.id = auth.uid();
  
  -- If not admin, return empty result
  IF current_user_is_admin IS NOT TRUE THEN
    RETURN;
  END IF;
  
  -- Return all users if current user is admin
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    COALESCE(p.is_admin, false) as is_admin,
    COALESCE(p.is_premium, false) as is_premium,
    p.created_at,
    p.updated_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_for_admin() TO authenticated;

-- Also create a function to ensure all auth users have profiles
CREATE OR REPLACE FUNCTION ensure_user_profiles()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profiles for any auth users that don't have them
  INSERT INTO profiles (id, email, is_admin, is_premium, created_at, updated_at)
  SELECT 
    au.id,
    au.email,
    false,
    false,
    NOW(),
    NOW()
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE p.id IS NULL;
END;
$$;

-- Run the function to ensure all users have profiles
SELECT ensure_user_profiles();