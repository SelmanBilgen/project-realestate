-- Create profiles table and insert admin user based on the console logs
-- User ID from logs: bf3c0f31-8a23-4a08-ad1b-23e62a469b5f

-- First, create the profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Insert the admin profile using the exact user ID from the logs
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
VALUES (
  'bf3c0f31-8a23-4a08-ad1b-23e62a469b5f'::uuid,
  'admin@rigelhomes.com',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  updated_at = NOW();

-- Verify the admin profile exists
SELECT id, email, is_admin FROM profiles WHERE id = 'bf3c0f31-8a23-4a08-ad1b-23e62a469b5f';