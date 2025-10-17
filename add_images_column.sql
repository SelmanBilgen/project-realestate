-- Migration to add images_data column for multiple image support
-- Run this in your Supabase SQL editor

ALTER TABLE projects ADD COLUMN IF NOT EXISTS images_data TEXT;

-- Update existing records to migrate single image_url to images_data format
UPDATE projects 
SET images_data = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN '[{"url":"' || image_url || '","tag":"","isMain":true}]'
  ELSE '[]'
END
WHERE images_data IS NULL;