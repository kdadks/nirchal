# Database Setup Instructions for Product Filters

## Problem Resolution Steps

The filtering issues are caused by missing database columns and schema mismatches. Follow these steps in order:

### Step 1: Add Basic Categories
Run this SQL first in your Supabase SQL editor:

```sql
-- Add basic categories that products will reference
INSERT INTO categories (name, slug, description) VALUES 
('Sarees', 'sarees', 'Traditional Indian sarees in various styles and fabrics'),
('Lehengas', 'lehengas', 'Designer lehengas for special occasions'), 
('Kurtis', 'kurtis', 'Contemporary and traditional kurtis'),
('Salwar Suits', 'salwar-suits', 'Traditional salwar suits')
ON CONFLICT (slug) DO NOTHING;
```

### Step 2: Add Missing Product Columns
Run the safe migration script (`safe_migration.sql`):

```sql
-- Add fabric, color, subcategory columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS fabric VARCHAR(100);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS color VARCHAR(100);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Handle occasion column (it may already exist as JSON type)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'occasion'
    ) THEN
        ALTER TABLE products ADD COLUMN occasion TEXT;
    END IF;
END $$;
```

### Step 3: Add Sample Products
Use the corrected `insert_sample_products.sql` (without the `featured` column):

```sql
-- Insert sample products with all required attributes
INSERT INTO products (
    name, slug, description, category_id, price, sale_price, 
    fabric, occasion, color, subcategory, is_active, is_featured
) VALUES 
(
    'Banarasi Silk Saree',
    'banarasi-silk-saree-red',
    'Handwoven Banarasi silk saree with traditional gold zari work',
    (SELECT id FROM categories WHERE slug = 'sarees'),
    8999.00, 6999.00,
    'Silk',
    '["wedding", "festival"]',
    'Red',
    'Traditional',
    true, true
);
-- ... (continue with other products)
```

### Step 4: Create Performance Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_products_fabric ON products(fabric);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
```

## Testing the Fix

After running these SQL commands:
1. Refresh your application at http://localhost:5176/products
2. Test each filter:
   - **Category Filter**: Should show products by category
   - **Fabric Filter**: Should filter by Silk, Cotton, Georgette, etc.
   - **Occasion Filter**: Should filter by wedding, party, casual, etc.
   - **Price Range**: Should continue working as before

## Troubleshooting

If you get errors:
1. **"column does not exist"**: The column wasn't created. Run Step 2 again.
2. **"invalid JSON syntax"**: The occasion column is expecting JSON format. Use `'["wedding", "party"]'` not `'wedding,party'`.
3. **"No products found"**: The sample data wasn't inserted. Run Step 3 again.

## Files to Use
- `add_categories.sql`: For Step 1
- `safe_migration.sql`: For Step 2  
- `insert_sample_products.sql`: For Step 3 (now fixed)
- `test_minimal.sql`: For testing with just one product first

The application code is already updated to handle all these scenarios gracefully!
