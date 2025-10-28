# Special Occasion Categories Feature

## Overview
This feature allows you to create special categories for occasions like Navratri, Diwali, Christmas, etc. that:
- **Don't appear in regular navigation** or category listings
- Can be **linked to hero sections** on the homepage
- Have **time-based display** (start and end dates)
- Include **custom banner styling** for hero sections

## Database Changes

### New Fields Added to `categories` Table:
- `is_special_occasion` (boolean) - Marks category as special occasion
- `occasion_slug` (varchar) - URL-friendly identifier (e.g., "navratri-2024")
- `occasion_start_date` (timestamp) - When to start showing this occasion
- `occasion_end_date` (timestamp) - When to stop showing this occasion
- `occasion_banner_image` (text) - Banner image URL for hero display
- `occasion_banner_color` (varchar) - Background color for hero banner
- `occasion_text_color` (varchar) - Text color for hero banner

### Migration File:
`supabase/migrations/20251026000004_add_special_occasion_to_categories.sql`

## How to Apply Migration

### Option 1: Run the migration script
```bash
node scripts/add-special-occasion-categories.js
```

### Option 2: Apply SQL directly in Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the content from `supabase/migrations/20251026000004_add_special_occasion_to_categories.sql`
3. Click "Run"

## How to Use

### Creating a Special Occasion Category:

1. Go to **Admin Panel → Categories**
2. Click **"New Category"**
3. Fill in basic details (name, slug, description)
4. Check **"Special Occasion Category"** checkbox
5. Fill in the special occasion settings:
   - **Occasion Slug**: e.g., `navratri-2024`, `diwali-2024`
   - **Start Date**: When to start displaying
   - **End Date**: When to stop displaying
   - **Banner Image URL**: Hero section image
   - **Banner Colors**: Background and text colors for styling
6. Click **"Create Category"**
7. Add products to this category as usual

### Features:

✅ **Hidden from Navigation**: Special occasion categories won't appear in:
   - Main category navigation
   - Category listings
   - Shop by Category sections
   
✅ **Time-Based Display**: Automatically show/hide based on start/end dates

✅ **Hero Section Integration**: Can be linked to homepage hero banners with custom styling

✅ **Full Product Management**: Add/remove products just like regular categories

## Code Changes

### Frontend Filters Updated:
- `src/hooks/usePublicCategories.ts` - Excludes special occasion categories
- `src/utils/categoryCache.ts` - Excludes special occasion categories
- `src/components/admin/FeaturedSectionsPanel.tsx` - Won't load special categories in product selection

### Type Definitions Updated:
- `src/types/index.ts` - Added special occasion fields to Category interface
- `src/types/admin.ts` - Added special occasion fields to admin Category interface

### Admin UI Updated:
- `src/pages/admin/CategoriesPage.tsx` - Added special occasion form fields with conditional display

## Example Use Cases

### Navratri Collection:
```
Name: Navratri Special 2024
Slug: navratri
Is Special Occasion: ✓
Occasion Slug: navratri-2024
Start Date: 2024-10-03 00:00
End Date: 2024-10-12 23:59
Banner Image: /images/banners/navratri-2024.jpg
Banner Color: #FF6B35
Text Color: #FFFFFF
```

### Diwali Festival:
```
Name: Diwali Gifts & Decor
Slug: diwali
Is Special Occasion: ✓
Occasion Slug: diwali-2024
Start Date: 2024-10-20 00:00
End Date: 2024-11-05 23:59
Banner Image: /images/banners/diwali-2024.jpg
Banner Color: #FFD700
Text Color: #8B0000
```

## Integration with Hero Section

To link a special occasion category to the hero section, you can:
1. Use the `occasion_slug` to fetch products
2. Apply the `occasion_banner_image`, `occasion_banner_color`, and `occasion_text_color` for styling
3. Check `occasion_start_date` and `occasion_end_date` to show/hide automatically

## Benefits

1. **Clean Navigation**: Regular categories stay clean and organized
2. **Seasonal Marketing**: Easy to create time-limited collections
3. **Reusable**: Same category can be used year after year (just update dates)
4. **Flexible**: Full control over products, styling, and timing
5. **Professional**: Custom banners and colors for each occasion

## Next Steps

After applying the migration, you can:
1. Create your first special occasion category
2. Add products to it
3. Integrate with hero section component (if needed)
4. Test the time-based display functionality
