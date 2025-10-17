import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use service role for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Convert text to sentence case (capitalize first letter, rest lowercase)
 */
function toSentenceCase(text) {
  if (!text) return '';
  const cleaned = text.trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

/**
 * Strip HTML tags from description
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#039;/g, "'") // Replace &#039; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Generate SEO-friendly meta title (max 60 characters)
 * Format: "Product name - Nirchal"
 */
function generateMetaTitle(productName) {
  if (!productName) return '';
  
  const brandSuffix = ' - Nirchal';
  const maxLength = 60;
  const availableLength = maxLength - brandSuffix.length;
  
  let title = productName.trim();
  
  // If product name is too long, truncate intelligently
  if (title.length > availableLength) {
    // Try to truncate at last word boundary
    title = title.substring(0, availableLength);
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > availableLength * 0.7) { // Only use word boundary if it's not too far back
      title = title.substring(0, lastSpace);
    }
    title = title.trim();
    // Remove trailing punctuation
    title = title.replace(/[,\-–—:;.!?]+$/, '');
  }
  
  return toSentenceCase(title) + brandSuffix;
}

/**
 * Generate SEO-friendly meta description (max 160 characters)
 * Uses product description or falls back to product name
 */
function generateMetaDescription(productName, description) {
  const maxLength = 160;
  
  // Strip HTML and get plain text
  let plainText = stripHtml(description);
  
  // If no description, create one from product name
  if (!plainText || plainText.length < 20) {
    plainText = `Shop ${productName} at Nirchal. High quality ethnic wear with fast shipping across India.`;
  }
  
  // Ensure it ends with proper punctuation
  if (plainText.length <= maxLength) {
    if (!/[.!?]$/.test(plainText)) {
      if (plainText.length < maxLength - 1) {
        plainText += '.';
      }
    }
    return toSentenceCase(plainText);
  }
  
  // Truncate intelligently - leave room for punctuation
  let truncated = plainText.substring(0, maxLength - 3); // Reserve 3 chars for "..."
  
  // Try to end at a sentence
  const lastPeriod = truncated.lastIndexOf('. ');
  if (lastPeriod > (maxLength - 3) * 0.6) {
    truncated = truncated.substring(0, lastPeriod + 1);
    // Ensure within limit
    if (truncated.length > maxLength) {
      truncated = truncated.substring(0, maxLength);
    }
    return toSentenceCase(truncated);
  }
  
  // Try to end at a word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > (maxLength - 3) * 0.85) {
    truncated = truncated.substring(0, lastSpace);
  }
  
  // Remove trailing punctuation except period
  truncated = truncated.replace(/[,\-–—:;!?]+$/, '').trim();
  
  // Add ellipsis or period
  if (!/[.!?]$/.test(truncated)) {
    // Only add ellipsis if we have room
    if (truncated.length <= maxLength - 3) {
      truncated += '...';
    } else if (truncated.length <= maxLength - 1) {
      truncated += '.';
    }
  }
  
  // Final safety check
  if (truncated.length > maxLength) {
    truncated = truncated.substring(0, maxLength - 1) + '.';
  }
  
  return toSentenceCase(truncated);
}

/**
 * Main function to update SEO metadata for all products
 */
async function updateProductSeoMetadata(options = {}) {
  const {
    dryRun = false,
    onlyEmpty = false,
    batchSize = 50,
    productId = null
  } = options;

  try {
    console.log('🔍 Fetching products from database...\n');

    // Build query
    let query = supabase
      .from('products')
      .select('id, name, description, meta_title, meta_description')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Filter by product ID if specified
    if (productId) {
      query = query.eq('id', productId);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found.');
      return;
    }

    console.log(`📦 Found ${products.length} products\n`);

    // Filter products that need updates
    let productsToUpdate = products;
    if (onlyEmpty) {
      productsToUpdate = products.filter(p => !p.meta_title || !p.meta_description);
      console.log(`📋 ${productsToUpdate.length} products need SEO metadata\n`);
    }

    if (productsToUpdate.length === 0) {
      console.log('✅ All products already have SEO metadata!');
      return;
    }

    // Generate and update metadata
    const updates = [];
    const preview = [];

    for (const product of productsToUpdate) {
      const newMetaTitle = generateMetaTitle(product.name);
      const newMetaDescription = generateMetaDescription(product.name, product.description);

      const update = {
        id: product.id,
        meta_title: newMetaTitle,
        meta_description: newMetaDescription
      };

      updates.push(update);
      preview.push({
        name: product.name,
        old_title: product.meta_title,
        new_title: newMetaTitle,
        title_length: newMetaTitle.length,
        old_description: product.meta_description,
        new_description: newMetaDescription,
        description_length: newMetaDescription.length
      });
    }

    // Show preview
    console.log('📋 SEO Metadata Preview (first 5):\n');
    for (const item of preview.slice(0, 5)) {
      console.log(`📦 Product: ${item.name.substring(0, 60)}${item.name.length > 60 ? '...' : ''}`);
      console.log(`   Meta Title (${item.title_length}/60):`);
      console.log(`   OLD: ${item.old_title || '(empty)'}`);
      console.log(`   NEW: ${item.new_title}`);
      console.log(`   Meta Description (${item.description_length}/160):`);
      console.log(`   OLD: ${item.old_description || '(empty)'}`);
      console.log(`   NEW: ${item.new_description}`);
      console.log('');
    }

    if (preview.length > 5) {
      console.log(`... and ${preview.length - 5} more products\n`);
    }

    // Check for any length violations
    const violations = preview.filter(p => 
      p.title_length > 60 || p.description_length > 160
    );

    if (violations.length > 0) {
      console.log(`⚠️  WARNING: ${violations.length} products exceed character limits:`);
      for (const v of violations) {
        console.log(`   - ${v.name.substring(0, 40)}: Title=${v.title_length}, Desc=${v.description_length}`);
      }
      console.log('');
    }

    if (dryRun) {
      console.log('🔍 DRY RUN - No changes made to database');
      console.log(`   Would update ${updates.length} products`);
      return { preview, updates };
    }

    // Update in batches
    console.log('💾 Updating products in database...\n');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}...`);

      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            meta_title: update.meta_title,
            meta_description: update.meta_description
          })
          .eq('id', update.id);

        if (updateError) {
          console.error(`   ❌ Error updating product ${update.id}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

    console.log('\n✅ Update complete!');
    console.log(`   ✓ Successfully updated: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ✗ Failed: ${errorCount}`);
    }

    return { successCount, errorCount, preview };

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  onlyEmpty: args.includes('--only-empty'),
  batchSize: 50,
  productId: null
};

// Check for product ID argument
const productIdArg = args.find(arg => arg.startsWith('--product-id='));
if (productIdArg) {
  options.productId = productIdArg.split('=')[1];
}

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 SEO Metadata Generator for Products

Usage: node generate-seo-metadata.js [options]

Options:
  --dry-run              Preview changes without updating database
  --only-empty           Only update products with empty meta_title or meta_description
  --product-id=<id>      Update only a specific product by ID
  --help, -h             Show this help message

Examples:
  node generate-seo-metadata.js --dry-run
  node generate-seo-metadata.js --only-empty
  node generate-seo-metadata.js --product-id=abc-123-def

SEO Guidelines:
  - Meta Title: Max 60 characters (includes " - Nirchal" suffix)
  - Meta Description: Max 160 characters
  - Plain text in sentence case
  - Search engine friendly formatting
  `);
  process.exit(0);
}

// Run the update
console.log('🚀 Starting SEO Metadata Generator\n');
if (options.dryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made\n');
}
if (options.onlyEmpty) {
  console.log('📋 ONLY EMPTY MODE - Only updating products with missing metadata\n');
}

updateProductSeoMetadata(options);
