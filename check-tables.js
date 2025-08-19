// Check existing tables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tazrvokohjfzicdzzxia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenJ2b2tvaGpmemljZHp6eGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDQ3MzcsImV4cCI6MjA2NDE4MDczN30.veEaE0AicfPqYFug_1EXlpnsICUsXf-T0VW7dD0ijUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('Checking for orders table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.log('Orders table does not exist:', ordersError.message);
    } else {
      console.log('Orders table exists with sample data:', orders);
    }
    
    console.log('\nChecking for customers table...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
    
    if (customersError) {
      console.log('Customers table does not exist:', customersError.message);
    } else {
      console.log('Customers table exists with sample data:', customers);
    }
    
    console.log('\nChecking existing tables...');
    // Try to get schema information through information_schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('Cannot get table names:', tablesError.message);
      
      // Try alternative approach - just test known tables
      const knownTables = ['products', 'categories', 'product_images', 'product_variants', 'inventory'];
      for (const table of knownTables) {
        try {
          const { error } = await supabase.from(table).select('id').limit(1);
          if (!error) {
            console.log(`✓ Table exists: ${table}`);
          }
        } catch (e) {
          console.log(`✗ Table missing: ${table}`);
        }
      }
    } else {
      console.log('Available tables:', tables);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkTables();
