// Script to ensure all Razorpay settings are properly configured in the database
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceKey } from './_utils/supabase-key.mjs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = getSupabaseServiceKey();

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SECRET_KEYS is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// All Razorpay settings that should exist
const razorpaySettings = [
  // Basic credentials
  { key: 'razorpay_key_id', value: '', description: 'Razorpay Key ID for production environment', dataType: 'string', isEncrypted: true, isRequired: true },
  { key: 'razorpay_key_secret', value: '', description: 'Razorpay Key Secret for production environment', dataType: 'string', isEncrypted: true, isRequired: true },
  
  // Test credentials
  { key: 'razorpay_test_key_id', value: '', description: 'Razorpay Test Key ID for development/testing', dataType: 'string', isEncrypted: true, isRequired: false },
  { key: 'razorpay_test_key_secret', value: '', description: 'Razorpay Test Key Secret for development/testing', dataType: 'string', isEncrypted: true, isRequired: false },
  
  // Environment and configuration
  { key: 'razorpay_environment', value: 'test', description: 'Razorpay environment mode (test/live)', dataType: 'string', isEncrypted: false, isRequired: true },
  { key: 'razorpay_enabled', value: 'false', description: 'Enable/disable Razorpay payment gateway', dataType: 'boolean', isEncrypted: false, isRequired: true },
  
  // Webhook settings
  { key: 'razorpay_webhook_secret', value: '', description: 'Razorpay webhook secret for payment verification', dataType: 'string', isEncrypted: true, isRequired: false },
  { key: 'razorpay_webhook_url', value: '', description: 'Razorpay webhook endpoint URL', dataType: 'string', isEncrypted: false, isRequired: false },
  
  // Company details
  { key: 'razorpay_company_name', value: 'Nirchal', description: 'Company name displayed in Razorpay checkout', dataType: 'string', isEncrypted: false, isRequired: true },
  { key: 'razorpay_company_logo', value: '', description: 'Company logo URL for Razorpay checkout', dataType: 'string', isEncrypted: false, isRequired: false },
  { key: 'razorpay_theme_color', value: '#f59e0b', description: 'Theme color for Razorpay checkout (hex code)', dataType: 'string', isEncrypted: false, isRequired: false },
  
  // Order settings
  { key: 'razorpay_currency', value: 'INR', description: 'Default currency for Razorpay transactions', dataType: 'string', isEncrypted: false, isRequired: true },
  { key: 'razorpay_auto_capture', value: 'true', description: 'Auto-capture payments (true) or manual capture (false)', dataType: 'boolean', isEncrypted: false, isRequired: true },
  
  // Additional configuration
  { key: 'razorpay_description', value: 'Payment for Nirchal order', description: 'Default description for Razorpay payments', dataType: 'string', isEncrypted: false, isRequired: false },
  { key: 'razorpay_timeout', value: '900', description: 'Payment timeout in seconds (default: 15 minutes)', dataType: 'number', isEncrypted: false, isRequired: false }
];

async function ensureRazorpaySettings() {
  console.log('🔧 Checking Razorpay settings...\n');

  try {
    // Get existing settings
    const { data: existingSettings, error } = await supabase
      .from('settings')
      .select('key')
      .eq('category', 'payment')
      .like('key', 'razorpay_%');

    if (error) {
      console.error('❌ Error fetching existing settings:', error);
      return;
    }

    const existingKeys = new Set(existingSettings?.map(s => s.key) || []);
    const missingSettings = razorpaySettings.filter(setting => !existingKeys.has(setting.key));

    if (missingSettings.length === 0) {
      console.log('✅ All Razorpay settings already exist');
      
      // Show current settings
      console.log('\n📋 Current Razorpay Settings:');
      const { data: currentSettings } = await supabase
        .from('settings')
        .select('key, value, description')
        .eq('category', 'payment')
        .like('key', 'razorpay_%')
        .order('key');

      currentSettings?.forEach(setting => {
        const displayValue = setting.key.includes('secret') ? '[HIDDEN]' : setting.value || '[NOT SET]';
        console.log(`  ${setting.key}: ${displayValue}`);
      });
      
      return;
    }

    console.log(`➕ Adding ${missingSettings.length} missing settings...\n`);

    // Insert missing settings
    const insertData = missingSettings.map(setting => ({
      category: 'payment',
      key: setting.key,
      value: setting.value,
      data_type: setting.dataType,
      description: setting.description,
      is_encrypted: setting.isEncrypted,
      is_required: setting.isRequired
    }));

    const { error: insertError } = await supabase
      .from('settings')
      .insert(insertData);

    if (insertError) {
      console.error('❌ Error inserting settings:', insertError);
      return;
    }

    console.log('✅ Successfully added missing Razorpay settings:');
    missingSettings.forEach(setting => {
      console.log(`  + ${setting.key}`);
    });

    console.log('\n🎉 Razorpay settings are now complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to your admin panel: Settings → Payment Gateway');
    console.log('2. Configure your Razorpay credentials');
    console.log('3. Set up webhook URL and secret');
    console.log('4. Enable Razorpay payments');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
ensureRazorpaySettings();
