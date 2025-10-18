# 🔧 Fix User Management Issues

## The Problem
The user management buttons (Grant Premium, Remove Premium, Make Admin) are not working properly because:
1. Database columns might be missing
2. RLS (Row Level Security) policies might be incorrect
3. RPC function might not exist

## ✅ Quick Fix - Run This SQL

**Step 1: Open Supabase SQL Editor**
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

**Step 2: Copy & Paste SQL from `complete_user_setup.sql`**
This script will:
- ✅ Add missing columns (`is_premium`, `is_admin`) if they don't exist
- ✅ Create proper RLS policies for admin access
- ✅ Create RPC function for efficient user fetching
- ✅ Set up proper indexes for performance

**Step 3: Make Yourself Admin**
After running the main script, run this to make yourself admin:
```sql
-- Replace with your actual email
UPDATE profiles 
SET is_admin = true, is_premium = true 
WHERE email = 'your-email@example.com';
```

**Step 4: Test the System**
1. Refresh your admin page
2. Go to "User Management" tab
3. Try toggling premium/admin status
4. Check browser console for debugging info

## 🐛 Debugging Information

The system now includes detailed console logging. Open browser DevTools (F12) → Console tab to see:
- `togglePremium called: userId=..., isPremium=...`
- `Database update error:` (if any)
- `Fetched users via RPC:` (user data)
- `Users refreshed` (after updates)

## 🔧 Common Issues & Solutions

### Issue: "relation 'profiles' does not exist"
**Solution**: Run the complete schema setup from earlier steps

### Issue: "RPC function does not exist" 
**Solution**: The SQL script creates the function, make sure to run it

### Issue: "Access denied: Admin privileges required"
**Solution**: Make sure you set yourself as admin using the UPDATE query

### Issue: Buttons don't change state
**Solution**: Check console for errors, ensure database updates are successful

### Issue: User count doesn't update
**Solution**: After successful toggle operations, the counts should update automatically

## 📞 Still Having Issues?

If problems persist:
1. Check the browser console for detailed error messages
2. Verify your user has `is_admin = true` in the database
3. Ensure all SQL scripts ran without errors
4. Try refreshing the page after making database changes

---
*The debugging logs will help identify exactly where the issue is occurring.*