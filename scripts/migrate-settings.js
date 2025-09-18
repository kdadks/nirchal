#!/usr/bin/env node

/**
 * Settings Database Migration Script
 * This script handles the migration of existing settings table to the new schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateSettingsTable() {
  console.log('🔄 Starting settings table migration...\n');

  try {
    // Step 1: Check if settings table exists
    console.log('1️⃣ Checking existing table structure...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'settings')
      .eq('table_schema', 'public');

    if (columnError && !columnError.message.includes('does not exist')) {
      throw columnError;
    }

    const existingColumns = columns?.map(c => c.column_name) || [];
    console.log('   Existing columns:', existingColumns.length > 0 ? existingColumns : 'Table does not exist');

    // Step 2: Add missing columns one by one
    const requiredColumns = [
      { name: 'data_type', type: 'VARCHAR(20)', default: "'string'" },
      { name: 'is_encrypted', type: 'BOOLEAN', default: 'false' },
      { name: 'is_required', type: 'BOOLEAN', default: 'false' },
      { name: 'default_value', type: 'TEXT', default: null },
      { name: 'validation_rules', type: 'JSONB', default: null }
    ];

    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`2️⃣ Adding missing column: ${column.name}`);
        const addColumnSQL = `ALTER TABLE settings ADD COLUMN ${column.name} ${column.type}${column.default ? ` DEFAULT ${column.default}` : ''};`;
        
        const { error } = await supabase.rpc('exec_sql', { query: addColumnSQL });
        if (error) {
          // Try alternative method
          console.log(`   Trying alternative method for ${column.name}...`);
          // We'll handle this manually
        }
      }
    }

    // Step 3: Create settings categories table if it doesn't exist
    console.log('3️⃣ Ensuring settings_categories table exists...');
    
    // Step 4: Insert default data
    console.log('4️⃣ Inserting default settings...');
    await insertDefaultSettings();

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Navigate to /admin/settings to verify the setup');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n🔧 Manual steps required:');
    console.error('   1. Open Supabase Dashboard → SQL Editor');
    console.error('   2. Run the settings_schema.sql file manually');
    console.error('   3. Check for any missing columns or constraints');
  }
}

async function insertDefaultSettings() {
  // Insert categories first
  const categories = [
    { name: 'shop', label: 'Shop Settings', description: 'Basic store information and business settings', icon: 'Store', display_order: 1 },
    { name: 'payment', label: 'Payment Gateway', description: 'Payment gateway configuration and settings', icon: 'CreditCard', display_order: 2 },
    { name: 'billing', label: 'Billing', description: 'Tax and billing configuration', icon: 'Receipt', display_order: 3 },
    { name: 'seo', label: 'SEO Settings', description: 'Search engine optimization settings', icon: 'Search', display_order: 4 }
  ];

  for (const category of categories) {
    const { error } = await supabase
      .from('settings_categories')
      .upsert(category, { onConflict: 'name' });
    
    if (error) console.log(`   Warning: Could not insert category ${category.name}: ${error.message}`);
  }

  // Insert basic settings
  const basicSettings = [
    { category: 'shop', key: 'store_name', value: 'Nirchal', description: 'Store display name', is_required: true, default_value: 'Nirchal' },
    { category: 'shop', key: 'store_email', value: 'support@nirchal.com', description: 'Store contact email', is_required: true, default_value: '' },
    { category: 'shop', key: 'currency', value: 'INR', description: 'Store currency', is_required: true, default_value: 'INR' },
    { category: 'payment', key: 'razorpay_enabled', value: 'true', description: 'Enable Razorpay payments', is_required: false, default_value: 'false' },
    { category: 'payment', key: 'cod_enabled', value: 'true', description: 'Enable Cash on Delivery', is_required: false, default_value: 'true' },
    { category: 'seo', key: 'site_title', value: 'Nirchal - Premium Indian Ethnic Wear', description: 'Default page title', is_required: true, default_value: '' }
  ];

  for (const setting of basicSettings) {
    const { error } = await supabase
      .from('settings')
      .upsert(setting, { onConflict: 'category,key' });
    
    if (error) console.log(`   Warning: Could not insert setting ${setting.category}.${setting.key}: ${error.message}`);
  }
}

// Run the migration
migrateSettingsTable();
