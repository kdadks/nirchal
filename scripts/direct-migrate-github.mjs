#!/usr/bin/env node

/**
 * Direct Migration Script - Force migrate remaining GitHub URLs
 * This bypasses the detection issue and directly queries for GitHub URLs
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// Configuration
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2BucketName: process.env.R2_BUCKET_NAME || 'product-images',
  r2PublicUrl: process.env.R2_PUBLIC_URL,
  batchSize: parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '50'),
  dryRun: process.argv.includes('--dry-run'),
};

// Initialize clients
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2AccessKeyId,
    secretAccessKey: config.r2SecretAccessKey,
  },
});

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
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
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

async function migrateImage(imageData, folder) {
  const fileName = extractFileName(imageData.image_url);
  if (!fileName) {
    return { success: false, error: 'Could not extract filename' };
  }
  
  console.log(`   [${imageData.id.substring(0, 8)}] Processing ${fileName}...`);
  
  if (config.dryRun) {
    console.log(`   [${imageData.id.substring(0, 8)}] [DRY RUN] Would migrate ${fileName}`);
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
  const { error: updateError } = await supabase
    .from('product_images')
    .update({ image_url: uploadResult.url })
    .eq('id', imageData.id);
  
  if (updateError) {
    return { success: false, error: `Database update failed: ${updateError.message}` };
  }
  
  console.log(`   [${imageData.id.substring(0, 8)}] ✅ Successfully migrated`);
  return { success: true, newUrl: uploadResult.url };
}

async function main() {
  console.log('\n🔧 Direct Migration of Remaining GitHub URLs\n');
  console.log('='.repeat(70));
  
  if (config.dryRun) {
    console.log('🧪 DRY RUN MODE - No actual changes will be made\n');
  }
  
  // Direct query for GitHub URLs using ilike operator (case-insensitive)
  console.log('📦 Fetching remaining GitHub URLs from database...');
  console.log(`   Using Supabase URL: ${config.supabaseUrl}`);
  console.log(`   Service key present: ${!!config.supabaseServiceKey}\n`);
  
  let data, error;
  
  try {
    const result = await supabase
      .from('product_images')
      .select('id, product_id, image_url')
      .ilike('image_url', '%github%')
      .order('id');
    
    data = result.data;
    error = result.error;
  } catch (err) {
    console.error('❌ Caught error during fetch:', err);
    console.error('   Error details:', err.message);
    console.error('\n⚠️  This might be a network issue. Retrying in 5 seconds...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Retry once
    try {
      const result = await supabase
        .from('product_images')
        .select('id, product_id, image_url')
        .ilike('image_url', '%github%')
        .order('id');
      
      data = result.data;
      error = result.error;
    } catch (retryErr) {
      console.error('❌ Retry also failed:', retryErr.message);
      console.error('\n💡 Try checking your internet connection or DNS settings.');
      process.exit(1);
    }
  }
  
  if (error) {
    console.error('❌ Error fetching images:', error.message);
    process.exit(1);
  }
  
  console.log(`   Found ${data.length} GitHub URLs to migrate\n`);
  
  if (data.length === 0) {
    console.log('✅ No GitHub URLs found - migration complete!\n');
    return;
  }
  
  const startTime = Date.now();
  let successful = 0;
  let failed = 0;
  const errors = [];
  
  // Process in batches
  for (let i = 0; i < data.length; i += config.batchSize) {
    const batch = data.slice(i, i + config.batchSize);
    const batchNum = Math.floor(i / config.batchSize) + 1;
    const totalBatches = Math.ceil(data.length / config.batchSize);
    
    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} images)...`);
    
    const batchResults = await Promise.allSettled(
      batch.map(img => migrateImage(img, 'products'))
    );
    
    // Process results
    batchResults.forEach((result, index) => {
      const imageData = batch[index];
      
      if (result.status === 'fulfilled' && result.value.success) {
        successful++;
      } else {
        failed++;
        const error = result.status === 'rejected' 
          ? result.reason?.message || 'Unknown error'
          : result.value.error;
        
        errors.push({
          imageId: imageData.id,
          url: imageData.image_url,
          error: error
        });
        
        console.log(`   [${imageData.id.substring(0, 8)}] ❌ Failed: ${error}`);
      }
    });
    
    console.log(`   Batch ${batchNum} complete: ${batch.length - (failed % config.batchSize)} successful`);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 DIRECT MIGRATION SUMMARY\n');
  console.log(`⏱️  Duration: ${duration} seconds`);
  console.log(`📸 Images processed: ${data.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n📈 Success rate: ${((successful / data.length) * 100).toFixed(1)}%`);
  
  if (errors.length > 0 && !config.dryRun) {
    console.log(`\n📋 Saving error report...`);
    const fs = await import('fs');
    await fs.promises.writeFile(
      'direct-migration-errors.json',
      JSON.stringify(errors, null, 2)
    );
    console.log(`   Error details saved to: direct-migration-errors.json`);
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (failed > 0) {
    console.log('\n⚠️  Some images failed to migrate. Check the error report for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All GitHub URLs successfully migrated to R2!\n');
  }
}

main().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});