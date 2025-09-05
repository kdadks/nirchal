// Script to add Razorpay webhook secret
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

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function addWebhookSecret() {
  console.log('🔗 Razorpay Webhook Configuration\n');
  
  try {
    // Check current webhook settings
    const { data: currentSettings, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'payment')
      .in('key', ['razorpay_webhook_secret', 'razorpay_webhook_url']);

    if (error) {
      console.error('❌ Error fetching current settings:', error.message);
      return;
    }

    console.log('📋 Current Webhook Settings:');
    currentSettings?.forEach(setting => {
      const displayValue = setting.key.includes('secret') && setting.value 
        ? '[SET]' 
        : (setting.value || '[NOT SET]');
      console.log(`   ${setting.key}: ${displayValue}`);
    });

    console.log('\n🔧 Webhook Setup Instructions:');
    console.log('1. Go to https://dashboard.razorpay.com/');
    console.log('2. Navigate to Settings → Webhooks');
    console.log('3. Create a new webhook with URL: https://nirchal.netlify.app/.netlify/functions/razorpay-webhook');
    console.log('4. Select events: payment.captured, payment.failed, order.paid');
    console.log('5. Copy the webhook secret from Razorpay dashboard');
    console.log('');

    const webhookSecret = await askQuestion('🔑 Enter your Razorpay webhook secret: ');
    
    if (!webhookSecret.trim()) {
      console.log('❌ No webhook secret provided. Exiting.');
      rl.close();
      return;
    }

    // Update webhook secret
    const { error: secretError } = await supabase
      .from('settings')
      .update({ value: webhookSecret.trim() })
      .eq('category', 'payment')
      .eq('key', 'razorpay_webhook_secret');

    if (secretError) {
      console.error('❌ Failed to update webhook secret:', secretError.message);
      rl.close();
      return;
    }

    // Update webhook URL
    const webhookUrl = 'https://nirchal.netlify.app/.netlify/functions/razorpay-webhook';
    const { error: urlError } = await supabase
      .from('settings')
      .update({ value: webhookUrl })
      .eq('category', 'payment')
      .eq('key', 'razorpay_webhook_url');

    if (urlError) {
      console.error('❌ Failed to update webhook URL:', urlError.message);
    }

    console.log('\n✅ Webhook configuration updated successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Webhook URL: ${webhookUrl}`);
    console.log('   Webhook Secret: [HIDDEN]');
    console.log('');
    console.log('🧪 To test webhook:');
    console.log('1. Deploy your changes to Netlify');
    console.log('2. Make a test payment');
    console.log('3. Check webhook logs in Razorpay dashboard');
    console.log('4. Verify order status updates in your admin panel');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  rl.close();
}

addWebhookSecret();
