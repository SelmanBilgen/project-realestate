-- Complete User Management Database Setup
-- Run this in Supabase SQL Editor to ensure all tables and policies are correctly set up

-- First, ensure the profiles table has all necessary columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

-- Create RPC function for admin user management (optional, for better performance)
-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS get_all_users_for_admin();

CREATE OR REPLACE FUNCTION get_all_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  is_premium BOOLEAN,
  is_admin BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.email,
    p.is_premium,
    p.is_admin,
    p.created_at
  FROM profiles p
  WHERE EXISTS (
    SELECT 1 FROM profiles admin_check 
    WHERE admin_check.id = auth.uid() 
    AND admin_check.is_admin = true
  )
  ORDER BY p.created_at DESC;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_all_users_for_admin() TO authenticated;

-- Test data: Make sure there's at least one admin user
-- Replace 'your-admin-email@example.com' with your actual admin email
-- UPDATE profiles 
-- SET is_admin = true, is_premium = true 
-- WHERE email = 'your-admin-email@example.com';

-- Verify the setup
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;