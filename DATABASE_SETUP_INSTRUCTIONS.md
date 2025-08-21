# Database Setup Instructions for Orders & Analytics

## Problem
You encountered an error: `ERROR: 42P07: relation "inventory_history" already exists`

This means the `inventory_history` table already exists in your database, but the other order-related tables don't exist yet.

## Solution: Step-by-Step Database Setup

### Method 1: Using Supabase SQL Editor (Recommended)

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Navigate to your project
   - Go to SQL Editor

2. **Execute Step 1: Create Tables**
   - Copy and paste the contents of `src/db/step1_create_tables.sql`
   - Click "Run" to execute
   - This will create all the necessary tables safely

3. **Execute Step 2: Create Indexes**
   - Copy and paste the contents of `src/db/step2_create_indexes.sql`
   - Click "Run" to execute
   - This will create database indexes for better performance

4. **Execute Step 3: Insert Sample Data**
   - Copy and paste the contents of `src/db/step3_insert_sample_data.sql`
   - Click "Run" to execute
   - This will add sample customers and orders

5. **Execute Step 4: Create Views**
   - Copy and paste the contents of `src/db/step4_create_views.sql`
   - Click "Run" to execute
   - This will create the dashboard views

### Method 2: Using JavaScript (Alternative)

Run the safe schema application script:

```bash
cd "d:\ITWala Projects\nirchal"
node apply-safe-schema.js
```

## What This Will Create

### Tables Created:
- ✅ `customers` - Customer information
- ✅ `customer_addresses` - Customer shipping/billing addresses  
- ✅ `orders` - Complete order management
- ✅ `order_items` - Individual items within orders
- ✅ `order_status_history` - Order status tracking
- ✅ `product_analytics` - Product performance metrics
- ✅ `daily_analytics` - Daily aggregated statistics

### Views Created:
- ✅ `recent_orders_view` - Optimized for dashboard recent orders
- ✅ `top_products_view` - Optimized for dashboard top products

### Sample Data Added:
- 6 sample customers
- 6 sample orders with realistic data
- Order items linked to existing products

## Verification

After completing the setup, test that everything works:

1. **Test the Admin Dashboard**
   - Go to http://localhost:5176/admin
   - The dashboard should now show real data instead of mock data
   - Check that orders and products display correctly

2. **Check Database Tables**
   - Run the table checker: `node check-tables.js`
   - Should show all new tables exist

3. **Verify Views**
   - In Supabase SQL Editor, run:
   ```sql
   SELECT * FROM recent_orders_view LIMIT 5;
   SELECT * FROM top_products_view LIMIT 3;
   ```

## Expected Results

✅ **Before**: Admin dashboard shows mock/hardcoded data  
✅ **After**: Admin dashboard shows real database data with:
- Real customer orders from the database
- Actual product sales data
- Live analytics and statistics
- Proper order status and timestamps

## Troubleshooting

### If you get table already exists errors:
- The scripts use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times
- If you still get errors, some tables might have been partially created

### If dashboard still shows mock data:
- Refresh the dashboard page
- Check browser console for any errors
- Verify the views were created successfully

### If order items don't show:
- Make sure you have existing products in your products table
- The order items will be linked to your actual product IDs

## Files Created

1. `src/db/step1_create_tables.sql` - Core table creation
2. `src/db/step2_create_indexes.sql` - Performance indexes  
3. `src/db/step3_insert_sample_data.sql` - Sample data insertion
4. `src/db/step4_create_views.sql` - Dashboard views
5. `src/db/safe_orders_schema.sql` - Complete safe schema (all-in-one)

Choose the method that works best for you. The step-by-step approach via Supabase SQL Editor is most reliable.
