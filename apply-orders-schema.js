// Apply orders and analytics schema
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://tazrvokohjfzicdzzxia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenJ2b2tvaGpmemljZHp6eGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDQ3MzcsImV4cCI6MjA2NDE4MDczN30.veEaE0AicfPqYFug_1EXlpnsICUsXf-T0VW7dD0ijUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  try {
    console.log('Reading orders and analytics schema...');
    const schema = readFileSync('./src/db/orders_analytics_schema.sql', 'utf8');
    
    console.log('Applying schema to database...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('Schema application error:', error);
    } else {
      console.log('Schema applied successfully!');
      console.log('Result:', data);
    }
    
    // Test the new views
    console.log('\nTesting recent orders view...');
    const { data: orders, error: ordersError } = await supabase
      .from('recent_orders_view')
      .select('*')
      .limit(3);
    
    if (ordersError) {
      console.error('Recent orders error:', ordersError);
    } else {
      console.log('Recent orders:', orders);
    }
    
    console.log('\nTesting top products view...');
    const { data: products, error: productsError } = await supabase
      .from('top_products_view')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.error('Top products error:', productsError);
    } else {
      console.log('Top products:', products);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

applySchema();
