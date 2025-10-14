#!/usr/bin/env node

/**
 * Rollback Script - Reset R2 URLs back to GitHub URLs
 * This is needed when the R2 public URL was incorrect during migration
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to check if URL is from R2
function isR2Url(url) {
  return url && (
    url.includes('.r2.dev') || 
    url.includes('nirchal.pages.dev')
  );
}

// Extract filename from R2 URL
function extractFileName(url) {
  const match = url.match(/\/([^\/]+)$/);
  return match ? match[1] : null;
}

// Convert R2 URL back to GitHub URL
function convertToGitHubUrl(r2Url) {
  const fileName = extractFileName(r2Url);
  if (!fileName) return null;
  
  return `https://raw.githubusercontent.com/kdadks/nirchal/main/public/images/products/${fileName}`;
}

async function rollbackProductImages() {
  console.log('📦 Fetching product images from database...');
  
  const { data, error } = await supabase
    .from('product_images')
    .select('id, image_url')
    .order('id');
  
  if (error) {
    console.error('❌ Error fetching product images:', error.message);
    return { total: 0, updated: 0, failed: 0 };
  }
  
  const r2Images = data.filter(img => isR2Url(img.image_url));
  console.log(`   Found ${data.length} total images, ${r2Images.length} from R2\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const image of r2Images) {
    const githubUrl = convertToGitHubUrl(image.image_url);
    if (!githubUrl) {
      console.log(`   ⚠️  Could not convert: ${image.image_url}`);
      failed++;
      continue;
    }
    
    const { error: updateError } = await supabase
      .from('product_images')
      .update({ image_url: githubUrl })
      .eq('id', image.id);
    
    if (updateError) {
      console.log(`   ❌ Failed to update ID ${image.id}: ${updateError.message}`);
      failed++;
    } else {
      updated++;
      if (updated % 100 === 0) {
        console.log(`   ✅ Updated ${updated}/${r2Images.length} images...`);
      }
    }
  }
  
  console.log(`\n✅ Product images: ${updated} updated, ${failed} failed\n`);
  return { total: r2Images.length, updated, failed };
}

async function rollbackCategoryImages() {
  console.log('📁 Fetching category images from database...');
  
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, image_url')
    .not('image_url', 'is', null)
    .order('id');
  
  if (error) {
    console.error('❌ Error fetching category images:', error.message);
    return { total: 0, updated: 0, failed: 0 };
  }
  
  const r2Images = data.filter(cat => isR2Url(cat.image_url));
  console.log(`   Found ${data.length} total images, ${r2Images.length} from R2\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const category of r2Images) {
    const fileName = extractFileName(category.image_url);
    if (!fileName) {
      console.log(`   ⚠️  Could not extract filename: ${category.image_url}`);
      failed++;
      continue;
    }
    
    const githubUrl = `https://raw.githubusercontent.com/kdadks/nirchal/main/public/images/categories/${fileName}`;
    
    const { error: updateError } = await supabase
      .from('categories')
      .update({ image_url: githubUrl })
      .eq('id', category.id);
    
    if (updateError) {
      console.log(`   ❌ Failed to update ${category.name}: ${updateError.message}`);
      failed++;
    } else {
      updated++;
      console.log(`   ✅ Updated ${category.name}`);
    }
  }
  
  console.log(`\n✅ Category images: ${updated} updated, ${failed} failed\n`);
  return { total: r2Images.length, updated, failed };
}

// Main execution
async function main() {
  console.log('\n🔄 Rollback: Resetting R2 URLs back to GitHub URLs\n');
  console.log('='.repeat(70));
  
  const startTime = Date.now();
  
  const productResults = await rollbackProductImages();
  const categoryResults = await rollbackCategoryImages();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('='.repeat(70));
  console.log('\n📊 ROLLBACK SUMMARY\n');
  console.log(`⏱️  Duration: ${duration} seconds`);
  console.log(`\n📦 Products: ${productResults.updated}/${productResults.total} rolled back`);
  console.log(`📁 Categories: ${categoryResults.updated}/${categoryResults.total} rolled back`);
  console.log(`\n❌ Total failed: ${productResults.failed + categoryResults.failed}`);
  console.log('\n='.repeat(70));
  
  if (productResults.failed + categoryResults.failed > 0) {
    console.log('\n⚠️  Some images failed to rollback. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n✅ Rollback completed successfully!');
    console.log('   You can now re-run the migration with the correct R2 URL.\n');
  }
}

main().catch(error => {
  console.error('\n❌ Rollback failed:', error);
  process.exit(1);
});
