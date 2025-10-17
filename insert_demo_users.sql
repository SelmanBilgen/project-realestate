-- Step 3: Insert demo user profiles
-- First, let's check what users exist
SELECT id, email FROM auth.users WHERE email IN ('admin@rigelhomes.com', 'premium@rigelhomes.com');

-- Insert admin profile (replace the UUID with the actual ID from above query)
-- You'll need to get the actual UUID from the users table
INSERT INTO profiles (id, email, is_admin)
SELECT id, email, true
FROM auth.users 
WHERE email = 'admin@rigelhomes.com';

-- Insert premium user profile
INSERT INTO profiles (id, email, is_admin)
SELECT id, email, false
FROM auth.users 
WHERE email = 'premium@rigelhomes.com';

-- Verify the profiles were created
SELECT p.id, p.email, p.is_admin, u.email as auth_email
FROM profiles p
JOIN auth.users u ON p.id = u.id;