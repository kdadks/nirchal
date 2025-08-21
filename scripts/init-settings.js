#!/usr/bin/env node

/**
 * Settings Migration Script
 * This script initializes the database settings tables and populates them with default data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY:', supabaseServiceKey ? '✓' : '✗');
  console.error('\nPlease check your .env file and try again.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql, description) {
  console.log(`🔄 ${description}...`);
  try {
    // Split SQL by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      // Use raw SQL execution
      const { error } = await supabase.rpc('exec', { sql: trimmed });
      if (error) {
        console.error(`Error executing: ${trimmed.substring(0, 100)}...`);
        throw error;
      }
    }
    
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    // If RPC doesn't exist, try direct table operations for basic setup
    if (description.includes('Creating settings categories')) {
      return await insertCategoriesDirectly();
    } else if (description.includes('Inserting default settings')) {
      return await insertSettingsDirectly();
    }
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function insertCategoriesDirectly() {
  console.log('🔄 Creating settings categories (direct method)...');
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
    
    if (error) throw error;
  }
  console.log('✅ Settings categories created successfully');
}

async function insertSettingsDirectly() {
  console.log('🔄 Inserting default settings (direct method)...');
  const settings = [
    // Shop Settings
    { category: 'shop', key: 'store_name', value: 'Nirchal', data_type: 'string', description: 'Name of your store', is_required: true, default_value: 'Nirchal' },
    { category: 'shop', key: 'store_email', value: 'contact@nirchal.com', data_type: 'string', description: 'Store contact email address', is_required: true, default_value: 'contact@nirchal.com' },
    { category: 'shop', key: 'store_phone', value: '+91 98765 43210', data_type: 'string', description: 'Store contact phone number', is_required: true, default_value: '' },
    { category: 'shop', key: 'store_address', value: 'Mumbai, Maharashtra, India', data_type: 'string', description: 'Store physical address', is_required: true, default_value: '' },
    { category: 'shop', key: 'store_description', value: 'Premium Indian ethnic wear for the modern woman', data_type: 'string', description: 'Brief description of your store', is_required: false, default_value: '' },
    { category: 'shop', key: 'currency', value: 'INR', data_type: 'string', description: 'Default currency for the store', is_required: true, default_value: 'INR' },
    { category: 'shop', key: 'timezone', value: 'Asia/Kolkata', data_type: 'string', description: 'Store timezone', is_required: true, default_value: 'UTC' },
    { category: 'shop', key: 'allow_guest_checkout', value: 'true', data_type: 'boolean', description: 'Allow customers to checkout without creating an account', is_required: false, default_value: 'true' },
    { category: 'shop', key: 'auto_approve_reviews', value: 'false', data_type: 'boolean', description: 'Automatically approve customer reviews', is_required: false, default_value: 'false' },
    { category: 'shop', key: 'low_stock_threshold', value: '10', data_type: 'number', description: 'Alert threshold for low stock items', is_required: false, default_value: '10' },
    { category: 'shop', key: 'order_prefix', value: 'ORD', data_type: 'string', description: 'Prefix for order numbers', is_required: false, default_value: 'ORD' },
    { category: 'shop', key: 'enable_inventory_tracking', value: 'true', data_type: 'boolean', description: 'Track product stock levels automatically', is_required: false, default_value: 'true' },

    // Payment Gateway Settings  
    { category: 'payment', key: 'razorpay_enabled', value: 'true', data_type: 'boolean', description: 'Enable Razorpay payment gateway', is_required: false, default_value: 'false' },
    { category: 'payment', key: 'razorpay_key_id', value: '', data_type: 'string', description: 'Razorpay Key ID for payments', is_required: false, default_value: '' },
    { category: 'payment', key: 'razorpay_key_secret', value: '', data_type: 'string', description: 'Razorpay Key Secret (encrypted)', is_required: false, default_value: '' },
    { category: 'payment', key: 'stripe_enabled', value: 'false', data_type: 'boolean', description: 'Enable Stripe payment gateway', is_required: false, default_value: 'false' },
    { category: 'payment', key: 'stripe_publishable_key', value: '', data_type: 'string', description: 'Stripe Publishable Key', is_required: false, default_value: '' },
    { category: 'payment', key: 'stripe_secret_key', value: '', data_type: 'string', description: 'Stripe Secret Key (encrypted)', is_required: false, default_value: '' },
    { category: 'payment', key: 'cod_enabled', value: 'true', data_type: 'boolean', description: 'Enable Cash on Delivery', is_required: false, default_value: 'false' },

    // Billing Settings
    { category: 'billing', key: 'gst_number', value: '', data_type: 'string', description: 'GST registration number', is_required: false, default_value: '' },
    { category: 'billing', key: 'pan_number', value: '', data_type: 'string', description: 'PAN card number', is_required: false, default_value: '' },
    { category: 'billing', key: 'company_name', value: 'Nirchal Fashion Pvt Ltd', data_type: 'string', description: 'Registered company name', is_required: true, default_value: '' },
    { category: 'billing', key: 'billing_address', value: 'Mumbai, Maharashtra, India', data_type: 'string', description: 'Company billing address', is_required: true, default_value: '' },
    { category: 'billing', key: 'invoice_prefix', value: 'INV', data_type: 'string', description: 'Prefix for invoice numbers', is_required: false, default_value: 'INV' },
    { category: 'billing', key: 'tax_rate', value: '18', data_type: 'number', description: 'Default tax rate percentage', is_required: false, default_value: '0' },
    { category: 'billing', key: 'enable_gst', value: 'true', data_type: 'boolean', description: 'Apply GST to invoices and receipts', is_required: false, default_value: 'false' },

    // SEO Settings
    { category: 'seo', key: 'site_title', value: 'Nirchal - Premium Indian Ethnic Wear', data_type: 'string', description: 'Site title for search engines', is_required: true, default_value: 'My Store' },
    { category: 'seo', key: 'meta_description', value: 'Discover exquisite Indian ethnic wear at Nirchal. Premium sarees, lehengas, and traditional outfits for the modern woman.', data_type: 'string', description: 'Meta description for search engines', is_required: false, default_value: '' },
    { category: 'seo', key: 'meta_keywords', value: 'indian ethnic wear, sarees, lehengas, traditional clothing, ethnic fashion', data_type: 'string', description: 'Meta keywords for search engines', is_required: false, default_value: '' },
    { category: 'seo', key: 'canonical_url', value: 'https://nirchal.com', data_type: 'string', description: 'Canonical URL for SEO', is_required: false, default_value: '' },
    { category: 'seo', key: 'robots_index', value: 'true', data_type: 'boolean', description: 'Allow search engine indexing', is_required: false, default_value: 'true' },
    { category: 'seo', key: 'robots_follow', value: 'true', data_type: 'boolean', description: 'Allow search engines to follow links', is_required: false, default_value: 'true' },
    { category: 'seo', key: 'enable_sitemap', value: 'true', data_type: 'boolean', description: 'Automatically generate XML sitemap', is_required: false, default_value: 'true' },
    { category: 'seo', key: 'google_analytics_id', value: '', data_type: 'string', description: 'Google Analytics tracking ID', is_required: false, default_value: '' },
    { category: 'seo', key: 'facebook_pixel_id', value: '', data_type: 'string', description: 'Facebook Pixel tracking ID', is_required: false, default_value: '' }
  ];

  for (const setting of settings) {
    const { error } = await supabase
      .from('settings')
      .upsert(setting, { onConflict: 'category,key' });
    
    if (error) throw error;
  }
  console.log('✅ Default settings inserted successfully');
}

async function initializeSettings() {
  console.log('🚀 Starting settings database initialization...\n');

  try {
    // First, try to create the tables using the SQL schema
    const settingsSchemaPath = path.join(__dirname, '..', 'src', 'db', 'settings_schema.sql');
    
    if (fs.existsSync(settingsSchemaPath)) {
      console.log('📄 Found settings schema file, attempting to execute...');
      const settingsSchema = fs.readFileSync(settingsSchemaPath, 'utf8');
      await executeSQL(settingsSchema, 'Creating settings tables and functions');
    } else {
      console.log('⚠️  Settings schema file not found, will create tables manually');
      await createTablesManually();
    }

    // Insert categories and settings
    await insertCategoriesDirectly();
    await insertSettingsDirectly();

    // Verify setup
    console.log('\n📊 Verifying settings setup...');
    const { data: categories, error: catError } = await supabase
      .from('settings_categories')
      .select('name, label')
      .eq('is_active', true)
      .order('display_order');

    if (catError) throw catError;

    const { data: settingsCount, error: settingsError } = await supabase
      .from('settings')
      .select('category, key')
      .order('category, key');

    if (settingsError) throw settingsError;

    if (categories && categories.length > 0) {
      console.log('\n✅ Settings initialized successfully!');
      console.log('\n📋 Summary:');
      
      const categoryCounts = {};
      settingsCount?.forEach(s => {
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      });
      
      categories.forEach(cat => {
        console.log(`   ${cat.label}: ${categoryCounts[cat.name] || 0} settings`);
      });
    }

    console.log('\n🎉 Settings database initialization completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Navigate to /admin/settings in your application');
    console.log('   3. Configure your store settings through the admin panel');

  } catch (error) {
    console.error('\n❌ Settings initialization failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure your Supabase credentials are correct');
    console.error('   2. Check that you have admin access to the database');
    console.error('   3. Try running the settings schema SQL manually in Supabase dashboard');
    process.exit(1);
  }
}

async function createTablesManually() {
  console.log('🔄 Creating settings tables manually...');
  
  // This is a fallback method if SQL execution fails
  console.log('⚠️  Manual table creation not implemented yet.');
  console.log('   Please run the settings_schema.sql file manually in your Supabase dashboard.');
  console.log('   You can find it at: src/db/settings_schema.sql');
}

// Run the initialization
initializeSettings();
