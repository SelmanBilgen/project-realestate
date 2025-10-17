-- Create profiles table if it doesn't exist
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insert or update admin user profile
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
SELECT id, email, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'admin@rigelhomes.com'
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  updated_at = NOW();

-- Insert or update premium user profile  
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
SELECT id, email, false, NOW(), NOW()
FROM auth.users 
WHERE email = 'premium@rigelhomes.com'
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = false,
  updated_at = NOW();

-- Verify the data
SELECT u.id, u.email, p.is_admin 
FROM auth.users u 
JOIN profiles p ON u.id = p.id 
WHERE u.email IN ('admin@rigelhomes.com', 'premium@rigelhomes.com');