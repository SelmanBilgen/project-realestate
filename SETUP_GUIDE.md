# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase_schema.sql`
3. Go to Authentication and create users:
   - Admin: `admin@rigelhomes.com` (role: admin)
   - Premium: `premium@rigelhomes.com` (role: premium)

### 4. Start Development
```bash
npm run dev
```

Visit: `http://localhost:5173`

## 📋 Demo Accounts

**Admin Access:**
- Email: `admin@rigelhomes.com`
- Password: `admin123`

**Premium Member:**
- Email: `premium@rigelhomes.com`
- Password: `premium123`

## 🎯 Key Features to Test

1. **Property Filtering**: Try different filters on the main page
2. **Premium Access**: Notice how only first 3 properties are visible without login
3. **Admin Panel**: Add, edit, and delete properties
4. **ROI Calculations**: Check financial analysis on property details
5. **Golden Visa Info**: Look for Golden Visa eligible properties

## 🔧 Customization

### Add New Property Fields
1. Update database schema in Supabase
2. Modify form in `Admin.jsx`
3. Update `PropertyCard.jsx` to display new fields

### Change Styling
1. Edit `tailwind.config.js` for colors
2. Modify `src/index.css` for global styles
3. Update component classes as needed

### Deploy to Production
```bash
npm run build
```

Then deploy the `dist` folder to your hosting provider.

## 📞 Need Help?

- Check `README.md` for detailed documentation
- Review `supabase_schema.sql` for database setup
- Open an issue for bugs or feature requests