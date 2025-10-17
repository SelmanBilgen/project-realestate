-- Complete setup script - run this if the table doesn't exist
BEGIN;

-- Create the profiles table
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

-- Create policies
DO $$
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    
    -- Create new policies
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN OTHERS THEN
        -- Policies might not exist, continue
        NULL;
END$$;

COMMIT;

-- Now check if users exist and show their IDs
SELECT 'Users in auth.users:' as info;
SELECT id, email, created_at FROM auth.users WHERE email LIKE '%rigelhomes.com%';

-- Show current profiles
SELECT 'Current profiles:' as info;
SELECT * FROM profiles;