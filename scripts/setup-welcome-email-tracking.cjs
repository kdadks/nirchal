const { readFileSync } = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupWelcomeEmailTracking() {
  console.log('Setting up welcome email tracking...');
  
  try {
    // Apply welcome email tracking schema
    const sql = readFileSync('./src/db/add_welcome_email_tracking.sql', 'utf8');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error applying schema:', error);
      return false;
    }
    
    console.log('Welcome email tracking schema applied successfully!');
    
    // Test the create_checkout_customer function
    console.log('Testing create_checkout_customer function...');
    const testResult = await supabase.rpc('create_checkout_customer', {
      p_email: 'test-temp-password@example.com',
      p_first_name: 'Test',
      p_last_name: 'TempPassword',
      p_phone: '+1234567890'
    });
    
    console.log('Test result:', testResult);
    
    if (testResult.data) {
      console.log('✅ Function working correctly!');
      console.log('- Customer ID:', testResult.data.id);
      console.log('- Temp Password:', testResult.data.temp_password);
      console.log('- Existing Customer:', testResult.data.existing_customer);
      console.log('- Needs Welcome Email:', testResult.data.needs_welcome_email);
    }
    
    // Test marking welcome email as sent
    if (testResult.data?.id) {
      console.log('Testing mark_welcome_email_sent function...');
      const markResult = await supabase.rpc('mark_welcome_email_sent', {
        customer_id: testResult.data.id
      });
      console.log('Mark email sent result:', markResult);
    }
    
    return true;
  } catch (error) {
    console.error('Setup failed:', error);
    return false;
  }
}

setupWelcomeEmailTracking().catch(console.error);
