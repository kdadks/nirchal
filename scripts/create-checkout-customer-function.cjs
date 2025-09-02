const { readFileSync } = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vhlvgjtpzjhhejdsqbzk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZobHZnanRwempoaGVqZHNxYnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4ODA1NTEsImV4cCI6MjA0NzQ1NjU1MX0.r65cJnmJ0MPJ_2ZXB_tIHPLKmKF-CpW8-Xd7DG8P2YI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createFunction() {
  console.log('Creating create_checkout_customer function...');
  const sql = readFileSync('./src/db/create_checkout_customer.sql', 'utf8');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Function created successfully!');
    
    // Test the function
    console.log('Testing function...');
    const testResult = await supabase.rpc('create_checkout_customer', {
      p_email: 'test-checkout@example.com',
      p_first_name: 'Test',
      p_last_name: 'Checkout',
      p_phone: '+1234567890'
    });
    
    console.log('Test result:', testResult);
  }
}

createFunction().catch(console.error);
