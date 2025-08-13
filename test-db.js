// Simple database connection test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tazrvokohjfzicdzzxia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenJ2b2tvaGpmemljZHp6eGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDQ3MzcsImV4cCI6MjA2NDE4MDczN30.veEaE0AicfPqYFug_1EXlpnsICUsXf-T0VW7dD0ijUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Simple products query (like the working hook)
    console.log('\n1. Testing simple products query...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('Products query error:', productsError);
    } else {
      console.log('✓ Products query successful:', products?.length, 'products found');
    }
    
    // Test 2: Check if categories table exists
    console.log('\n2. Testing categories query...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      console.error('Categories query error:', categoriesError);
    } else {
      console.log('✓ Categories query successful:', categories?.length, 'categories found');
    }
    
    // Test 3: Test the problematic join query
    console.log('\n3. Testing join query with categories...');
    const { data: joinData, error: joinError } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner(id, name)
      `)
      .limit(5);
    
    if (joinError) {
      console.error('Join query error:', joinError);
    } else {
      console.log('✓ Join query successful:', joinData?.length, 'products found');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testQueries();
