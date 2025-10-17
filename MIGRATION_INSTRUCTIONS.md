# Database Migration Instructions

## Step 1: Add the images_data column to your Supabase database

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the following SQL commands:

```sql
-- Add the new images_data column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS images_data TEXT;

-- Migrate existing image_url data to the new images_data format
UPDATE projects 
SET images_data = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN '[{"url":"' || image_url || '","tag":"","isMain":true}]'
  ELSE '[]'
END
WHERE images_data IS NULL;
```

## Step 2: Verify the migration

After running the SQL, you can verify it worked by checking a few records:

```sql
SELECT title, image_url, images_data FROM projects LIMIT 5;
```

You should see:
- Existing projects with image_url values now also have images_data as a JSON array
- The images_data column contains properly formatted JSON like: `[{"url":"your-image-url","tag":"","isMain":true}]`

## What this does:

1. **Adds images_data column**: This will store multiple images as a JSON array
2. **Migrates existing data**: Converts single image_url values to the new array format
3. **Maintains backward compatibility**: The old image_url field is still there and used as fallback

## New Image Upload Features:

After the migration, you'll be able to:
- ✅ Upload multiple images when creating projects
- ✅ Edit and reorder uploaded images
- ✅ Add custom tags to images
- ✅ Set a main image for each project
- ✅ Drag and drop image files
- ✅ See file sizes and image previews
- ✅ View existing projects with their uploaded images

The system will automatically handle both old projects (using image_url) and new projects (using images_data array) seamlessly.