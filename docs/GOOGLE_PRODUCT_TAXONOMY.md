# Google Product Taxonomy Integration

## Overview

This integration adds Google's Product Taxonomy to the Nirchal e-commerce platform to improve SEO and product discoverability in Google Search and Google Merchant Center.

## What is Google Product Taxonomy?

Google Product Taxonomy is a standardized hierarchical classification system for products used by Google Shopping and Google Merchant Center. Using the correct Google product category helps:

- **Improve SEO rankings** in Google Search
- **Better product matching** in Google Shopping
- **Enhanced product discovery** for relevant searches
- **Compliance** with Google Merchant Center requirements

## Database Schema

### Table: `google_product_categories`

```sql
CREATE TABLE google_product_categories (
    id INTEGER PRIMARY KEY,              -- Google's category ID
    category_name TEXT NOT NULL,         -- Category name (last part of path)
    full_path TEXT NOT NULL,             -- Full hierarchical path
    level INTEGER NOT NULL,              -- Depth level (1 = top-level)
    parent_id INTEGER,                   -- Reference to parent category
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Products Table Update

```sql
ALTER TABLE products 
ADD COLUMN google_category_id INTEGER REFERENCES google_product_categories(id);
```

## Features

### 1. Searchable Category Selection

The `GoogleCategorySelector` component provides:
- **Real-time search** with debouncing
- **Hierarchical breadcrumb display** showing the full category path
- **Smart relevance sorting**
- **Visual feedback** for selected categories
- **Easy clearing and changing** of selections

### 2. Database Functions

#### `search_google_categories(search_term TEXT)`
Searches categories by name or full path with intelligent ranking:
- Exact prefix matches ranked highest
- Partial matches in category name
- Matches in full path
- Limited to 100 results for performance

#### `get_category_breadcrumb(category_id INTEGER)`
Returns the full hierarchical path for a category.

### 3. TypeScript Service

The `GoogleTaxonomyService` provides methods for:
- Searching categories
- Getting specific categories by ID
- Fetching top-level categories
- Getting child categories
- Retrieving category breadcrumbs

## Installation & Setup

### Step 1: Run Database Migrations

```bash
# Run the main schema migration
psql -h <host> -U <user> -d <database> -f supabase/migrations/20241106_google_product_taxonomy.sql

# Load sample data (or use the full data loader)
psql -h <host> -U <user> -d <database> -f supabase/migrations/20241106_google_product_taxonomy_sample_data.sql
```

### Step 2: Load Full Taxonomy Data

The complete Google Product Taxonomy contains over 5,000 categories. You have two options:

#### Option A: Using the Parser Script
```bash
# Download taxonomy and generate SQL
npm run parse-taxonomy

# Then run the generated SQL file
psql -h <host> -U <user> -d <database> -f supabase/migrations/20241106_google_product_taxonomy_data.sql
```

#### Option B: Manual Import
1. Download taxonomy from: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
2. Use the provided parser script to generate SQL inserts
3. Run the generated SQL against your database

### Step 3: Update Product Admin Form

Add the GoogleCategorySelector to your product form:

```tsx
import { GoogleCategorySelector } from './components/admin/GoogleCategorySelector';

// In your product form component:
const [googleCategoryId, setGoogleCategoryId] = useState<number | null>(null);

<GoogleCategorySelector
  value={googleCategoryId}
  onChange={(categoryId, category) => {
    setGoogleCategoryId(categoryId);
    // Update your product form state
  }}
  placeholder="Search Google Product Category..."
  error={formErrors.googleCategory}
/>
```

## Usage Examples

### Searching for Categories

```typescript
import { GoogleTaxonomyService } from './services/googleTaxonomyService';

// Search for categories
const results = await GoogleTaxonomyService.searchCategories('shoes');
// Returns categories matching "shoes" like:
// - Apparel & Accessories > Shoes
// - Sporting Goods > Athletics > Soccer > Soccer Shoes
```

### Getting Category Details

```typescript
// Get specific category
const category = await GoogleTaxonomyService.getCategoryById(187);
// Returns:
// {
//   id: 187,
//   category_name: "Shoes",
//   full_path: "Apparel & Accessories > Shoes",
//   level: 2,
//   parent_id: 166
// }
```

### Hierarchical Navigation

```typescript
// Get top-level categories
const topCategories = await GoogleTaxonomyService.getTopLevelCategories();

// Get children of a category
const children = await GoogleTaxonomyService.getChildCategories(166);
```

## Google Merchant Center Integration

When exporting products for Google Merchant Center, include the `google_product_category` field:

```typescript
// In your Google Merchant Center feed generator
const productFeed = products.map(product => ({
  id: product.id,
  title: product.name,
  description: product.description,
  google_product_category: product.google_category_id,
  // ... other fields
}));
```

## SEO Benefits

### Structured Data Markup

Include Google category in your product schema:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Product Name",
  "category": "Apparel & Accessories > Shoes > Athletic Shoes",
  "google_product_category": 187
}
</script>
```

### Meta Tags

Add category information to meta tags:

```html
<meta property="product:category" content="Apparel & Accessories > Shoes" />
```

## Maintenance

### Updating Taxonomy

Google updates their taxonomy periodically. To update:

1. Download the latest taxonomy file
2. Run the parser script to generate new SQL
3. Execute the SQL (existing categories will be updated, new ones added)

### Monitoring Usage

Query to see which categories are most used:

```sql
SELECT 
  gc.full_path,
  COUNT(p.id) as product_count
FROM google_product_categories gc
LEFT JOIN products p ON p.google_category_id = gc.id
GROUP BY gc.id, gc.full_path
ORDER BY product_count DESC
LIMIT 20;
```

## Troubleshooting

### Search Not Working

1. Verify the `search_google_categories` function exists:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'search_google_categories';
```

2. Check if data is loaded:
```sql
SELECT COUNT(*) FROM google_product_categories;
```

### Component Not Displaying

1. Check browser console for errors
2. Verify Supabase client is configured correctly
3. Ensure the table has proper RLS policies if enabled

## References

- [Google Product Taxonomy Official](https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt)
- [Google Merchant Center Help](https://support.google.com/merchants/answer/6324436)
- [Product Category Guidelines](https://support.google.com/merchants/answer/6324436)

## Version History

- **2024-11-06**: Initial implementation
- **Taxonomy Version**: 2021-09-21 (5000+ categories)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Verify database migrations ran successfully
4. Ensure all required files are in place
