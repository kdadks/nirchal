import { supabase } from '../config/supabase';

// Test function to check variants
export async function testVariantsAccess() {
  console.log('🔄 Testing variants access...');
  
  try {
    // Test 1: Direct product_variants query
    console.log('1️⃣ Testing direct product_variants query...');
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(5);
      
    if (variantsError) {
      console.error('❌ Variants error:', variantsError);
    } else {
      console.log('✅ Variants result:', variants);
      console.log('📊 Total variants found:', variants?.length || 0);
    }

    // Test 2: Check specific product ID 25
    console.log('2️⃣ Testing product ID 25 variants...');
    const { data: product25Variants, error: p25Error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', 25);
      
    if (p25Error) {
      console.error('❌ Product 25 variants error:', p25Error);
    } else {
      console.log('✅ Product 25 variants:', product25Variants);
    }

    // Test 3: Join query like in usePublicProducts
    console.log('3️⃣ Testing join query like usePublicProducts...');
    const { data: products, error: joinError } = await supabase
      .from('products')
      .select('id, name, slug, product_variants(*)')
      .eq('id', 25)
      .single();
      
    if (joinError) {
      console.error('❌ Join query error:', joinError);
    } else {
      console.log('✅ Join query result:', products);
      console.log('🎨 Variants in join result:', products?.product_variants);
    }

    return { variants, product25Variants, products };
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Auto-run the test
testVariantsAccess();
