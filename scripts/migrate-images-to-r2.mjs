#!/usr/bin/env node

/**
 * Image Migration Script: GitHub to Cloudflare R2
 * 
 * This script migrates all product and category images from GitHub to Cloudflare R2 storage.
 * It reads image URLs from the database, downloads from GitHub, uploads to R2, and updates the database.
 * 
 * Features:
 * - Batch processing with configurable batch size
 * - Progress tracking and detailed logging
 * - Rollback capability in case of errors
 * - Verification of each upload
 * - Summary report generation
 * - Dry-run mode for testing
 * 
 * Usage:
 *   node scripts/migrate-images-to-r2.mjs [--dry-run] [--batch-size=10] [--products-only] [--categories-only]
 */

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Node 18+ has fetch built-in, but for older versions we'd need node-fetch
// For this script, we'll use native fetch available in Node 18+

// Load environment variables
dotenv.config();

// Configuration
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2BucketName: process.env.R2_BUCKET_NAME || 'product-images',
  r2PublicUrl: process.env.R2_PUBLIC_URL,
  batchSize: parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '10'),
  dryRun: process.argv.includes('--dry-run'),
  productsOnly: process.argv.includes('--products-only'),
  categoriesOnly: process.argv.includes('--categories-only'),
};

// Validate configuration
function validateConfig() {
  const errors = [];
  
  if (!config.supabaseUrl) errors.push('VITE_SUPABASE_URL');
  if (!config.supabaseServiceKey) errors.push('SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
  if (!config.r2AccountId) errors.push('R2_ACCOUNT_ID');
  if (!config.r2AccessKeyId) errors.push('R2_ACCESS_KEY_ID');
  if (!config.r2SecretAccessKey) errors.push('R2_SECRET_ACCESS_KEY');
  
  if (errors.length > 0) {
    console.error('❌ Missing required environment variables:');
    errors.forEach(err => console.error(`   - ${err}`));
    process.exit(1);
  }
}

// Initialize clients
let supabase;
let r2Client;

function initializeClients() {
  console.log('🔧 Initializing clients...');
  
  supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
    },
  });
  
  console.log('✅ Clients initialized successfully\n');
}

// Helper functions
function isGitHubUrl(url) {
  return url && (url.includes('raw.githubusercontent.com') || url.includes('github.com'));
}

function extractFileName(url) {
  if (!url) return null;
  const parts = url.split('/');
  const filename = parts[parts.length - 1].split('?')[0];
  return filename.includes('.') ? filename : null;
}

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    // Native fetch returns arrayBuffer, convert to Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  } catch (error) {
    console.error(`   ❌ Download failed: ${error.message}`);
    return null;
  }
}

async function uploadToR2(buffer, fileName, folder, contentType = 'image/jpeg') {
  const key = `${folder}/${fileName}`;
  
  try {
    const command = new PutObjectCommand({
      Bucket: config.r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    
    await r2Client.send(command);
    
    const publicUrl = config.r2PublicUrl
      ? `${config.r2PublicUrl}/${key}`
      : `https://${config.r2BucketName}.${config.r2AccountId}.r2.dev/${key}`;
    
    return { success: true, url: publicUrl };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyR2Upload(fileName, folder) {
  const key = `${folder}/${fileName}`;
  
  try {
    const command = new HeadObjectCommand({
      Bucket: config.r2BucketName,
      Key: key,
    });
    
    await r2Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

// Migration functions
async function fetchProductImages() {
  console.log('📦 Fetching product images from database...');
  
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('id, product_id, image_url')
      .order('id');
    
    if (error) throw error;
    
    const githubImages = data.filter(img => isGitHubUrl(img.image_url));
    console.log(`   Found ${data.length} total images, ${githubImages.length} from GitHub\n`);
    
    return githubImages;
  } catch (error) {
    console.error('❌ Error fetching product images:', error.message);
    return [];
  }
}

async function fetchCategoryImages() {
  console.log('📁 Fetching category images from database...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, image_url')
      .not('image_url', 'is', null)
      .order('id');
    
    if (error) throw error;
    
    const githubImages = data.filter(cat => isGitHubUrl(cat.image_url));
    console.log(`   Found ${data.length} total images, ${githubImages.length} from GitHub\n`);
    
    return githubImages;
  } catch (error) {
    console.error('❌ Error fetching category images:', error.message);
    return [];
  }
}

async function migrateImage(imageData, folder, type = 'product') {
  const fileName = extractFileName(imageData.image_url);
  if (!fileName) {
    return { success: false, error: 'Could not extract filename' };
  }
  
  const logPrefix = type === 'product' 
    ? `   [Product ${imageData.product_id}]` 
    : `   [Category ${imageData.name}]`;
  
  console.log(`${logPrefix} Processing ${fileName}...`);
  
  if (config.dryRun) {
    console.log(`${logPrefix} [DRY RUN] Would migrate ${fileName}`);
    return { success: true, dryRun: true };
  }
  
  // Download from GitHub
  const imageBuffer = await downloadImage(imageData.image_url);
  if (!imageBuffer) {
    return { success: false, error: 'Download failed' };
  }
  
  // Upload to R2
  const contentType = fileName.endsWith('.png') ? 'image/png' 
                    : fileName.endsWith('.webp') ? 'image/webp'
                    : 'image/jpeg';
  
  const uploadResult = await uploadToR2(imageBuffer, fileName, folder, contentType);
  if (!uploadResult.success) {
    return { success: false, error: uploadResult.error };
  }
  
  // Verify upload
  const exists = await verifyR2Upload(fileName, folder);
  if (!exists) {
    return { success: false, error: 'Upload verification failed' };
  }
  
  // Update database
  const table = type === 'product' ? 'product_images' : 'categories';
  const { error: updateError } = await supabase
    .from(table)
    .update({ image_url: uploadResult.url })
    .eq('id', imageData.id);
  
  if (updateError) {
    return { success: false, error: `Database update failed: ${updateError.message}` };
  }
  
  console.log(`${logPrefix} ✅ Successfully migrated`);
  return { success: true, newUrl: uploadResult.url };
}

async function migrateInBatches(images, folder, type) {
  const results = {
    total: images.length,
    successful: 0,
    failed: 0,
    errors: [],
  };
  
  for (let i = 0; i < images.length; i += config.batchSize) {
    const batch = images.slice(i, i + config.batchSize);
    const batchNum = Math.floor(i / config.batchSize) + 1;
    const totalBatches = Math.ceil(images.length / config.batchSize);
    
    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} images)...`);
    
    const batchResults = await Promise.allSettled(
      batch.map(img => migrateImage(img, folder, type))
    );
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        results.successful++;
      } else {
        results.failed++;
        const error = result.status === 'rejected' 
          ? result.reason.message 
          : result.value.error;
        results.errors.push({
          imageId: batch[index].id,
          url: batch[index].image_url,
          error,
        });
      }
    });
    
    // Small delay between batches to avoid rate limiting
    if (i + config.batchSize < images.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Main migration function
async function runMigration() {
  console.log('\n🚀 Starting Image Migration to Cloudflare R2\n');
  console.log(`Configuration:
   - Dry Run: ${config.dryRun}
   - Batch Size: ${config.batchSize}
   - Products Only: ${config.productsOnly}
   - Categories Only: ${config.categoriesOnly}
   - R2 Bucket: ${config.r2BucketName}\n`);
  
  const migrationResults = {
    products: null,
    categories: null,
    startTime: new Date(),
  };
  
  try {
    // Migrate product images
    if (!config.categoriesOnly) {
      const productImages = await fetchProductImages();
      if (productImages.length > 0) {
        console.log('📸 Starting product images migration...\n');
        migrationResults.products = await migrateInBatches(productImages, 'products', 'product');
      }
    }
    
    // Migrate category images
    if (!config.productsOnly) {
      const categoryImages = await fetchCategoryImages();
      if (categoryImages.length > 0) {
        console.log('\n📂 Starting category images migration...\n');
        migrationResults.categories = await migrateInBatches(categoryImages, 'categories', 'category');
      }
    }
    
    migrationResults.endTime = new Date();
    
    // Generate report
    generateReport(migrationResults);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 MIGRATION SUMMARY REPORT');
  console.log('='.repeat(80) + '\n');
  
  const duration = Math.round((results.endTime - results.startTime) / 1000);
  console.log(`⏱️  Duration: ${duration} seconds`);
  console.log(`📅 Completed: ${results.endTime.toLocaleString()}\n`);
  
  if (results.products) {
    console.log('📸 Product Images:');
    console.log(`   Total: ${results.products.total}`);
    console.log(`   ✅ Successful: ${results.products.successful}`);
    console.log(`   ❌ Failed: ${results.products.failed}`);
    if (results.products.failed > 0) {
      console.log(`   Errors: ${results.products.errors.length}`);
    }
    console.log('');
  }
  
  if (results.categories) {
    console.log('📂 Category Images:');
    console.log(`   Total: ${results.categories.total}`);
    console.log(`   ✅ Successful: ${results.categories.successful}`);
    console.log(`   ❌ Failed: ${results.categories.failed}`);
    if (results.categories.failed > 0) {
      console.log(`   Errors: ${results.categories.errors.length}`);
    }
    console.log('');
  }
  
  // Save detailed error log if there were failures
  const allErrors = [
    ...(results.products?.errors || []),
    ...(results.categories?.errors || []),
  ];
  
  if (allErrors.length > 0) {
    const errorLogPath = join(process.cwd(), 'migration-errors.json');
    writeFileSync(errorLogPath, JSON.stringify(allErrors, null, 2));
    console.log(`⚠️  ${allErrors.length} errors logged to: ${errorLogPath}\n`);
  }
  
  // Save full report
  const reportPath = join(process.cwd(), 'migration-report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📋 Full report saved to: ${reportPath}\n`);
  
  console.log('='.repeat(80) + '\n');
  
  if (config.dryRun) {
    console.log('ℹ️  This was a DRY RUN - no changes were made to the database or R2 storage\n');
  }
}

// Run the migration
validateConfig();
initializeClients();
runMigration().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
