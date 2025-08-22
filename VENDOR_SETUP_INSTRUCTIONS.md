# Database Setup for Vendor Feature

You need to run one of these SQL scripts to add vendor functionality to your database:

## Option 1: For New Database Setup
If you're setting up a fresh database, use the updated `admin_schema.sql` which now includes the vendors table.

## Option 2: For Existing Database (Recommended)
If you already have a database with products, run the migration script:

```sql
-- Copy and run this file in your Supabase SQL editor:
src/db/migrate_add_vendors.sql
```

This script will:
- ✅ Create the `vendors` table with all necessary columns
- ✅ Add `vendor_id` column to existing `products` table  
- ✅ Create proper indexes for performance
- ✅ Set up Row Level Security (RLS) policies
- ✅ Add sample vendor data for testing
- ✅ Handle cases where vendors table already exists

## Option 3: Manual Setup
If you prefer to run the commands step by step:

```sql
-- Copy and run this file in your Supabase SQL editor:
src/db/add_vendors_table.sql
```

## After Running the Migration

1. **Verify the tables exist:**
   ```sql
   SELECT * FROM vendors;
   SELECT vendor_id FROM products LIMIT 1;
   ```

2. **Test the admin interface:**
   - Go to your admin panel
   - Navigate to Products → Add/Edit Product
   - You should see a "Vendor" dropdown field
   - The filters in the Products list should include vendor filtering

3. **Manage vendors:**
   - Access the Vendors page in your admin panel
   - Add, edit, and delete vendors as needed

## Sample Vendors Included

The migration script includes these sample vendors:
- Acme Corporation
- Global Supplies Inc.
- Local Vendor Co.
- Premium Products Ltd.
- Budget Supplies (inactive)

## Database Schema Changes

### New Table: `vendors`
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Table: `products`
```sql
-- Added column:
vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL
```

## Troubleshooting

If you encounter any issues:

1. **Permission errors:** Make sure you're running the script as a database admin
2. **Table already exists:** The migration script handles this gracefully
3. **Foreign key constraint errors:** Ensure the vendors table is created before updating products
4. **RLS policy errors:** The script recreates policies if they exist

## Frontend Features Now Available

After running the migration:
- ✅ Vendor dropdown in product forms
- ✅ Vendor filtering in product lists  
- ✅ Complete vendor management interface
- ✅ Vendor assignment to products (optional)
- ✅ Working product filters (status, category, vendor)
