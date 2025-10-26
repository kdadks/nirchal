import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSectionPriority() {
  console.log('Updating featured sections priority and max_products...\n');

  // Update New Arrivals
  const { error: error1 } = await supabase
    .from('featured_sections')
    .update({ 
      display_order: 0,
      max_products: 5
    })
    .eq('slug', 'new-arrivals');

  if (error1) {
    console.error('Error updating New Arrivals:', error1);
  } else {
    console.log('✅ New Arrivals updated (priority: 1, max_products: 5)');
  }

  // Update Trending Now
  const { error: error2 } = await supabase
    .from('featured_sections')
    .update({ 
      display_order: 1,
      max_products: 5
    })
    .eq('slug', 'trending-now');

  if (error2) {
    console.error('Error updating Trending Now:', error2);
  } else {
    console.log('✅ Trending Now updated (priority: 2, max_products: 5)');
  }

  // Update Featured Products
  const { error: error3 } = await supabase
    .from('featured_sections')
    .update({ 
      display_order: 2,
      max_products: 5
    })
    .eq('slug', 'featured-products');

  if (error3) {
    console.error('Error updating Featured Products:', error3);
  } else {
    console.log('✅ Featured Products updated (priority: 3, max_products: 5)');
  }

  // Verify the update
  console.log('\nVerifying sections order...\n');
  const { data, error } = await supabase
    .from('featured_sections')
    .select('title, slug, display_order, max_products, is_active')
    .order('display_order');

  if (error) {
    console.error('Error fetching sections:', error);
  } else {
    console.table(data);
  }

  console.log('\n✨ Update complete!');
  console.log('\nDisplay order is now:');
  console.log('1. New Arrivals (5 products)');
  console.log('2. Trending Now (5 products)');
  console.log('3. Featured Products (5 products)');
}

updateSectionPriority().catch(console.error);
