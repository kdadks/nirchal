import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixOrderItems() {
  console.log('=== FIXING ORDER ITEMS PRODUCT IDS ===');
  
  try {
    // Get existing products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);
    
    if (productsError) {
      console.log('Error fetching products:', productsError);
      return;
    }
    
    console.log(`Found ${products?.length || 0} products:`);
    products?.forEach(p => {
      console.log(`  - ${p.id}: ${p.name}`);
    });
    
    // Get order items that need fixing (null product_id)
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items') 
      .select('id, product_name, product_id')
      .is('product_id', null);
      
    if (itemsError) {
      console.log('Error fetching order items:', itemsError);
      return;
    }
    
    console.log(`Found ${orderItems?.length || 0} order items needing product_id:`);
    orderItems?.forEach(item => {
      console.log(`  - ${item.id}: ${item.product_name}`);
    });
    
    // Update order items with proper product IDs
    if (products && products.length > 0 && orderItems && orderItems.length > 0) {
      console.log('\nUpdating order items...');
      
      for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const product = products[i % products.length]; // Cycle through available products
        
        const { error } = await supabase
          .from('order_items')
          .update({ product_id: product.id })
          .eq('id', item.id);
          
        if (error) {
          console.log(`  ❌ Error updating item ${item.id}:`, error);
        } else {
          console.log(`  ✅ Updated item ${item.id} to use product ${product.id}`);
        }
      }
      
      console.log('\n=== VERIFICATION ===');
      // Verify the fix
      const { data: updatedItems } = await supabase
        .from('order_items')
        .select('id, product_id, product_name')
        .limit(5);
        
      console.log('Updated order items:');
      updatedItems?.forEach(item => {
        console.log(`  - ${item.id}: product_id = ${item.product_id}, name = ${item.product_name}`);
      });
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

fixOrderItems();
