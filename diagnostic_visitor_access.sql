-- Quick diagnostic query to check if visitor access is properly set up
-- Run this in Supabase SQL Editor to check the status

-- Check if the table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'public_project_access' 
            AND table_schema = 'public'
        ) 
        THEN '✅ Table exists'
        ELSE '❌ Table missing - run VISITOR_ACCESS_SETUP.md'
    END as table_status;

-- If table exists, check the data
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN is_public = true THEN 1 END) as public_projects,
    COUNT(CASE WHEN is_public = false THEN 1 END) as private_projects
FROM public_project_access;