// Quick schema inspection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tazrvokohjfzicdzzxia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenJ2b2tvaGpmemljZHp6eGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDQ3MzcsImV4cCI6MjA2NDE4MDczN30.veEaE0AicfPqYFug_1EXlpnsICUsXf-T0VW7dD0ijUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('Inspecting database schema...');
  
  try {
    // Get a sample product to see the actual structure
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('Products query error:', productsError);
    } else if (products && products.length > 0) {
      console.log('\nSample product structure:');
      console.log(JSON.stringify(products[0], null, 2));
    }
    
    // Check product_images structure
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .limit(1);
    
    if (imagesError) {
      console.error('Product images query error:', imagesError);
    } else if (images && images.length > 0) {
      console.log('\nSample product_images structure:');
      console.log(JSON.stringify(images[0], null, 2));
    }
    
    // Check if is_active column exists
    const { data: activeCheck, error: activeError } = await supabase
      .from('products')
      .select('id, is_active')
      .limit(1);
    
    if (activeError) {
      console.error('is_active column might not exist:', activeError);
    } else {
      console.log('\nis_active column exists:', activeCheck);
    }
    
  } catch (error) {
    console.error('Inspection failed:', error);
  }
}

inspectSchema();
