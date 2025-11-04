import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMissingInventory() {
  console.log('🔧 Fixing products with missing inventory...\n');

  const productsToFix = [
    { slug: 'banarasi-tissue-soft-silk-saree', quantity: 10 },
    { slug: 'premium-quality-embroidered-georgette-lehenga-choli', quantity: 10 }
  ];

  for (const productInfo of productsToFix) {
    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, slug')
      .eq('slug', productInfo.slug)
      .single();

    if (productError || !product) {
      console.log(`❌ Could not find product: ${productInfo.slug}`);
      continue;
    }

    console.log(`📦 Processing: ${product.name}`);

    // Check if inventory already exists
    const { data: existingInv } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product.id)
      .is('variant_id', null);

    if (existingInv && existingInv.length > 0) {
      console.log(`   ⚠️  Inventory already exists, skipping...`);
      continue;
    }

    // Create product-level inventory (variant_id = NULL)
    const { error: insertError } = await supabase
      .from('inventory')
      .insert({
        product_id: product.id,
        variant_id: null,
        quantity: productInfo.quantity,
        low_stock_threshold: 2
      });

    if (insertError) {
      console.log(`   ❌ Error creating inventory:`, insertError.message);
    } else {
      console.log(`   ✅ Created inventory: ${productInfo.quantity} units\n`);
    }
  }

  console.log('✅ Fix complete!');
}

fixMissingInventory().catch(console.error);
