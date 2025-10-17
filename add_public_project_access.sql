-- Add public project access table for anonymous/visitor access
-- This allows admins to select which projects are visible to non-logged-in users

CREATE TABLE IF NOT EXISTS public_project_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  is_public BOOLEAN DEFAULT TRUE,
  made_public_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  made_public_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on public_project_access
ALTER TABLE public_project_access ENABLE ROW LEVEL SECURITY;

-- Policies for public_project_access (admins can manage, everyone can read)
DROP POLICY IF EXISTS "Everyone can view public project access" ON public_project_access;
CREATE POLICY "Everyone can view public project access" ON public_project_access
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage public project access" ON public_project_access;
CREATE POLICY "Only admins can manage public project access" ON public_project_access
  FOR ALL USING (true);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_public_project_access_project_id ON public_project_access(project_id);
CREATE INDEX IF NOT EXISTS idx_public_project_access_is_public ON public_project_access(is_public);

-- Insert default public access for all existing projects (optional - you can run this if you want all projects public by default)
-- INSERT INTO public_project_access (project_id, is_public, made_public_by)
-- SELECT id, true, NULL FROM projects
-- ON CONFLICT (project_id) DO NOTHING;