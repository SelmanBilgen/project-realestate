# 🔧 Visitor Access Setup Instructions

## The Error You're Seeing
**"Failed to load project public status"** - This happens because the database table for public project access hasn't been created yet.

## ✅ Quick Fix - Run This SQL Script

**Step 1: Open Supabase SQL Editor**
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

**Step 2: Copy & Paste This SQL**
```sql
-- Create public project access table
CREATE TABLE IF NOT EXISTS public_project_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  is_public BOOLEAN DEFAULT TRUE,
  made_public_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  made_public_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public_project_access ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read public access info
DROP POLICY IF EXISTS "Everyone can view public project access" ON public_project_access;
CREATE POLICY "Everyone can view public project access" ON public_project_access
  FOR SELECT USING (true);

-- Allow admins to manage public access
DROP POLICY IF EXISTS "Only admins can manage public project access" ON public_project_access;
CREATE POLICY "Only admins can manage public project access" ON public_project_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_project_access_project_id ON public_project_access(project_id);
CREATE INDEX IF NOT EXISTS idx_public_project_access_is_public ON public_project_access(is_public);
```

**Step 3: Run the Query**
- Click the **RUN** button
- You should see "Success. No rows returned"

## 🎉 After Running the SQL

1. **Refresh your admin page**
2. **Click on "Visitor Access" tab**
3. **You should now see all your projects** with toggle switches
4. **Toggle projects to make them visible to anonymous visitors**

## 📋 What This Does

- **Creates a new table** to track which projects are public
- **Allows admins** to control visitor access
- **Visitors (not logged in)** will only see admin-selected projects
- **Separate from premium access** - no login required for public projects

## ⚠️ Important Notes

- Only **admins** can manage visitor access
- **Existing users** keep their current access levels
- **Anonymous visitors** see only admin-selected public projects
- **Projects are private by default** until you make them public

## 🆘 Still Having Issues?

If you see other errors:
1. Make sure you're logged in as an admin
2. Check that the `profiles` table has an `is_admin` column
3. Verify your admin user has `is_admin = true`

---
*Once you complete this setup, the Visitor Access feature will work perfectly!*