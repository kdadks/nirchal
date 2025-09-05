// Script to show all Razorpay settings and help add missing ones
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Supabase client setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function showRazorpaySettings() {
  console.log('🔍 Current Razorpay Settings:\n');

  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value, data_type, description, is_required')
      .eq('category', 'payment')
      .like('key', 'razorpay_%')
      .order('key');

    if (error) {
      console.error('❌ Error fetching settings:', error.message);
      return;
    }

    if (!settings || settings.length === 0) {
      console.error('❌ No Razorpay settings found in database');
      return;
    }

    console.log('Found', settings.length, 'Razorpay settings:\n');
    
    settings.forEach((setting, index) => {
      const displayValue = setting.key.includes('secret') && setting.value 
        ? '[SET]' 
        : (setting.value || '[NOT SET]');
      
      const required = setting.is_required ? '(Required)' : '(Optional)';
      
      console.log(`${index + 1}. ${setting.key} ${required}`);
      console.log(`   Value: ${displayValue}`);
      console.log(`   Description: ${setting.description || 'No description'}`);
      console.log('');
    });

    // Check for missing required settings
    const missingRequired = settings.filter(s => s.is_required && !s.value);
    
    if (missingRequired.length > 0) {
      console.log('⚠️ Missing Required Settings:');
      missingRequired.forEach(setting => {
        console.log(`   - ${setting.key}`);
      });
      console.log('');
    }

    return settings;
  } catch (error) {
    console.error('❌ Failed to fetch settings:', error.message);
    return null;
  }
}

async function updateSetting(key, value) {
  try {
    const { error } = await supabase
      .from('settings')
      .update({ value: value.trim() })
      .eq('category', 'payment')
      .eq('key', key);

    if (error) {
      console.error(`❌ Failed to update ${key}:`, error.message);
      return false;
    }

    console.log(`✅ Successfully updated ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${key}:`, error.message);
    return false;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function interactiveUpdate() {
  const settings = await showRazorpaySettings();
  
  if (!settings) {
    rl.close();
    return;
  }

  console.log('🛠️ Interactive Update Mode\n');
  console.log('Enter the setting key you want to update (or "exit" to quit):');
  
  while (true) {
    const key = await askQuestion('\nSetting key: ');
    
    if (key.toLowerCase() === 'exit') {
      break;
    }
    
    const setting = settings.find(s => s.key === key);
    
    if (!setting) {
      console.log(`❌ Setting "${key}" not found. Available keys:`);
      settings.forEach(s => console.log(`   - ${s.key}`));
      continue;
    }
    
    console.log(`\nCurrent value: ${setting.key.includes('secret') && setting.value ? '[SET]' : (setting.value || '[NOT SET]')}`);
    console.log(`Description: ${setting.description || 'No description'}`);
    
    const newValue = await askQuestion('New value: ');
    
    if (newValue.trim()) {
      const success = await updateSetting(key, newValue);
      if (success) {
        setting.value = newValue; // Update local copy
      }
    } else {
      console.log('❌ Empty value, skipping update');
    }
  }
  
  rl.close();
}

async function quickSetup() {
  console.log('🚀 Quick Razorpay Test Setup\n');
  
  const testKeyId = await askQuestion('Enter your Razorpay Test Key ID (rzp_test_...): ');
  if (testKeyId.trim()) {
    await updateSetting('razorpay_test_key_id', testKeyId);
  }
  
  const testKeySecret = await askQuestion('Enter your Razorpay Test Key Secret: ');
  if (testKeySecret.trim()) {
    await updateSetting('razorpay_test_key_secret', testKeySecret);
  }
  
  // Ensure Razorpay is enabled and in test mode
  await updateSetting('razorpay_enabled', 'true');
  await updateSetting('razorpay_environment', 'test');
  
  console.log('\n✅ Quick setup completed!');
  rl.close();
}

// Main menu
async function main() {
  console.log('🔧 Razorpay Settings Manager\n');
  console.log('1. Show current settings');
  console.log('2. Interactive update');
  console.log('3. Quick test setup');
  console.log('4. Exit');
  
  const choice = await askQuestion('\nSelect an option (1-4): ');
  
  switch (choice) {
    case '1':
      await showRazorpaySettings();
      rl.close();
      break;
    case '2':
      await interactiveUpdate();
      break;
    case '3':
      await quickSetup();
      break;
    case '4':
    default:
      console.log('👋 Goodbye!');
      rl.close();
      break;
  }
}

main().catch(console.error);
