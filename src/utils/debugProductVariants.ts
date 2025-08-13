// Temporary debug to check product variants in database
import { supabase } from '../config/supabase';

const debugProductVariants = async () => {
  console.log('🎨 Checking product variants and colors...');
  
  try {
    // Check what's in product_variants table
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(10);
    
    if (variantsError) {
      console.error('❌ Error fetching variants:', variantsError);
    } else {
      console.log('🔍 Product variants found:', variants?.length || 0);
      if (variants && variants.length > 0) {
        console.log('📊 Sample variants:', variants.slice(0, 3));
        
        // Check what colors are available
        const colors = variants.map(v => v.color).filter(Boolean);
        const uniqueColors = [...new Set(colors)];
        console.log('🎨 Available colors:', uniqueColors);
      }
    }
    
    // Check specific product that should have colors
    const { data: productWithVariants, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        color,
        product_variants (
          id,
          color,
          size,
          price,
          stock_quantity
        )
      `)
      .limit(5);
    
    if (productError) {
      console.error('❌ Error fetching products with variants:', productError);
    } else {
      console.log('📦 Products with variants:');
      productWithVariants?.forEach(product => {
        console.log(`Product ${product.id} (${product.name}):`);
        console.log(`  - Main color: ${product.color}`);
        console.log(`  - Variants: ${product.product_variants?.length || 0}`);
        if (product.product_variants && product.product_variants.length > 0) {
          const variantColors = product.product_variants.map(v => v.color).filter(Boolean);
          console.log(`  - Variant colors: ${[...new Set(variantColors)].join(', ')}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

// Auto-run in development
if (typeof window !== 'undefined') {
  debugProductVariants();
}

export { debugProductVariants };
