import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Your production domain
const DOMAIN = process.env.VITE_BASE_URL || 'https://nirchal.com';

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Strip HTML tags from description
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Get product availability status
 */
function getAvailability(product) {
  // Check if product has inventory data
  if (product.inventory && Array.isArray(product.inventory)) {
    const totalQuantity = product.inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    if (totalQuantity > 0) return 'in stock';
    if (totalQuantity === 0) return 'out of stock';
  }
  
  // Fallback to stockStatus
  if (product.stockStatus === 'In Stock') return 'in stock';
  if (product.stockStatus === 'Out of Stock') return 'out of stock';
  if (product.stockStatus === 'Low Stock') return 'in stock';
  if (product.stockStatus === 'Pre-Order') return 'preorder';
  
  return 'in stock'; // Default
}

/**
 * Get product condition
 */
function getCondition() {
  return 'new'; // All products are new
}

/**
 * Get Google Product Category
 */
function getGoogleCategory(category) {
  const categoryMap = {
    'Kurtas': 'Apparel & Accessories > Clothing > Dresses',
    'Sarees': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing',
    'Lehengas': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing',
    'Salwar Suits': 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing',
    'Dupattas': 'Apparel & Accessories > Clothing Accessories > Scarves',
    'Bottoms': 'Apparel & Accessories > Clothing > Pants',
    'Blouses': 'Apparel & Accessories > Clothing > Shirts & Tops',
    'Accessories': 'Apparel & Accessories > Clothing Accessories',
  };
  
  return categoryMap[category] || 'Apparel & Accessories > Clothing';
}

/**
 * Generate product feed for Facebook/Instagram Catalog
 */
async function generateProductFeed() {
  try {
    console.log('🛍️  Generating Facebook/Instagram product feed...');

    // Fetch all active products with their images and variants
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_images(*),
        product_variants(*),
        inventory(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      process.exit(1);
    }

    if (!products || products.length === 0) {
      console.warn('⚠️  No active products found');
      process.exit(0);
    }

    console.log(`✅ Found ${products.length} active products`);

    // Start building XML feed
    let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
    xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>Nirchal - Indian Ethnic Wear</title>\n';
    xml += `    <link>${DOMAIN}</link>\n`;
    xml += '    <description>Authentic Indian ethnic wear collection - Kurtas, Sarees, Lehengas, and more</description>\n';

    // Add each product as an item
    for (const product of products) {
      // Get first image URL
      const imageUrl = product.product_images?.[0]?.image_url || 
                      (product.images?.[0] || '').replace(/^\//, '');
      const fullImageUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${DOMAIN}/${imageUrl}`;

      // Get additional images
      const additionalImages = (product.product_images || [])
        .slice(1, 10) // Facebook allows up to 10 additional images
        .map(img => {
          const url = img.image_url || '';
          return url.startsWith('http') ? url : `${DOMAIN}/${url}`;
        });

      // Product URL
      const productUrl = `${DOMAIN}/products/${product.slug}`;

      // Clean description
      const description = stripHtml(product.description || product.name);
      const shortDescription = description.length > 5000 
        ? description.substring(0, 4997) + '...' 
        : description;

      // Get price (use discounted price if available)
      const price = product.price || 0;
      const originalPrice = product.originalPrice || product.price;

      // Check if product is on sale
      const isOnSale = originalPrice && originalPrice > price;

      xml += '    <item>\n';
      xml += `      <g:id>${escapeXml(product.id)}</g:id>\n`;
      xml += `      <g:title>${escapeXml(product.name)}</g:title>\n`;
      xml += `      <g:description>${escapeXml(shortDescription)}</g:description>\n`;
      xml += `      <g:link>${escapeXml(productUrl)}</g:link>\n`;
      xml += `      <g:image_link>${escapeXml(fullImageUrl)}</g:image_link>\n`;
      
      // Additional images
      additionalImages.forEach(imgUrl => {
        xml += `      <g:additional_image_link>${escapeXml(imgUrl)}</g:additional_image_link>\n`;
      });

      xml += `      <g:condition>${getCondition()}</g:condition>\n`;
      xml += `      <g:availability>${getAvailability(product)}</g:availability>\n`;
      xml += `      <g:price>${price.toFixed(2)} INR</g:price>\n`;
      
      // Sale price if applicable
      if (isOnSale) {
        xml += `      <g:sale_price>${price.toFixed(2)} INR</g:sale_price>\n`;
      }

      xml += `      <g:brand>Nirchal</g:brand>\n`;
      
      // Category
      if (product.category) {
        xml += `      <g:product_type>${escapeXml(product.category)}</g:product_type>\n`;
        xml += `      <g:google_product_category>${escapeXml(getGoogleCategory(product.category))}</g:google_product_category>\n`;
      }

      // Gender (assume women's clothing)
      xml += `      <g:gender>female</g:gender>\n`;
      xml += `      <g:age_group>adult</g:age_group>\n`;

      // Material/Fabric
      if (product.fabric) {
        xml += `      <g:material>${escapeXml(product.fabric)}</g:material>\n`;
      }

      // Color
      if (product.color) {
        xml += `      <g:color>${escapeXml(product.color)}</g:color>\n`;
      }

      // Sizes (from variants)
      if (product.product_variants && product.product_variants.length > 0) {
        const sizes = product.product_variants
          .map(v => v.size)
          .filter(s => s)
          .join('/');
        if (sizes) {
          xml += `      <g:size>${escapeXml(sizes)}</g:size>\n`;
        }
      }

      // Item group ID (for variants)
      if (product.product_variants && product.product_variants.length > 1) {
        xml += `      <g:item_group_id>${escapeXml(product.id)}</g:item_group_id>\n`;
      }

      // Shipping
      xml += `      <g:shipping>\n`;
      xml += `        <g:country>IN</g:country>\n`;
      xml += `        <g:service>Standard</g:service>\n`;
      xml += `        <g:price>0.00 INR</g:price>\n`; // Free shipping
      xml += `      </g:shipping>\n`;

      xml += '    </item>\n';
    }

    xml += '  </channel>\n';
    xml += '</rss>';

    // Write feed to public directory
    const feedPath = join(process.cwd(), 'public', 'product-feed.xml');
    writeFileSync(feedPath, xml, 'utf-8');

    console.log(`\n✅ Product feed generated successfully!`);
    console.log(`📍 Location: ${feedPath}`);
    console.log(`📊 Total products: ${products.length}`);
    console.log(`\n🌐 Feed URL: ${DOMAIN}/product-feed.xml`);
    console.log(`\n📘 Next steps:`);
    console.log(`1. Deploy this file to production`);
    console.log(`2. Go to Facebook Commerce Manager`);
    console.log(`3. Add Data Source → Data Feed`);
    console.log(`4. Enter feed URL: ${DOMAIN}/product-feed.xml`);
    console.log(`5. Set schedule: Daily at 12:00 AM`);
    console.log(`6. Products will auto-sync to Facebook & Instagram!`);
    
  } catch (error) {
    console.error('❌ Error generating product feed:', error);
    process.exit(1);
  }
}

// Run the generator
generateProductFeed();
