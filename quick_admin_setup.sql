-- Quick setup for admin access
-- First create the table
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

-- Create a policy that allows users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Now insert the admin profile
INSERT INTO profiles (id, email, is_admin)
SELECT id, email, true
FROM auth.users 
WHERE email = 'admin@rigelhomes.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- Verify it worked
SELECT 'Admin user profile:' as info;
SELECT u.id, u.email, p.is_admin 
FROM auth.users u 
JOIN profiles p ON u.id = p.id 
WHERE u.email = 'admin@rigelhomes.com';