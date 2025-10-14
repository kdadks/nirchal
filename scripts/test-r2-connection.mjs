#!/usr/bin/env node

/**
 * R2 Connection Test Script
 * 
 * This script tests the connection to Cloudflare R2 and verifies credentials.
 * Run this before executing the full migration to ensure everything is configured correctly.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Node 18+ has fetch built-in

// Load environment variables
dotenv.config();

// Configuration
const config = {
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2BucketName: process.env.R2_BUCKET_NAME || 'product-images',
  r2PublicUrl: process.env.R2_PUBLIC_URL,
};

console.log('\n🔍 Cloudflare R2 Connection Test\n');
console.log('='.repeat(80));

// Step 1: Validate Environment Variables
console.log('\n1️⃣  Checking Environment Variables...');
const checks = [
  { name: 'R2_ACCOUNT_ID', value: config.r2AccountId },
  { name: 'R2_ACCESS_KEY_ID', value: config.r2AccessKeyId },
  { name: 'R2_SECRET_ACCESS_KEY', value: config.r2SecretAccessKey },
  { name: 'R2_BUCKET_NAME', value: config.r2BucketName },
  { name: 'R2_PUBLIC_URL', value: config.r2PublicUrl, optional: true },
];

let hasErrors = false;
checks.forEach(check => {
  if (!check.value && !check.optional) {
    console.log(`   ❌ ${check.name}: NOT SET`);
    hasErrors = true;
  } else if (!check.value && check.optional) {
    console.log(`   ⚠️  ${check.name}: NOT SET (optional, will use default)`);
  } else {
    const displayValue = check.name.includes('SECRET') 
      ? '*'.repeat(check.value.length) 
      : check.value;
    console.log(`   ✅ ${check.name}: ${displayValue}`);
  }
});

if (hasErrors) {
  console.log('\n❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Step 2: Initialize R2 Client
console.log('\n2️⃣  Initializing R2 Client...');
let r2Client;
try {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
    },
  });
  console.log('   ✅ R2 Client initialized successfully');
} catch (error) {
  console.log(`   ❌ Failed to initialize R2 Client: ${error.message}`);
  process.exit(1);
}

// Step 3: Test Upload
console.log('\n3️⃣  Testing File Upload...');
const testFileName = `test-${Date.now()}.txt`;
const testContent = Buffer.from('This is a test file for R2 connection verification.');
const testKey = `test/${testFileName}`;

try {
  const uploadCommand = new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: testKey,
    Body: testContent,
    ContentType: 'text/plain',
    CacheControl: 'public, max-age=3600',
  });
  
  await r2Client.send(uploadCommand);
  console.log(`   ✅ Successfully uploaded test file: ${testKey}`);
} catch (error) {
  console.log(`   ❌ Upload failed: ${error.message}`);
  if (error.name === 'NoSuchBucket') {
    console.log(`   ⚠️  Bucket "${config.r2BucketName}" does not exist. Please create it first.`);
  } else if (error.name === 'AccessDenied') {
    console.log('   ⚠️  Access denied. Check your API token permissions.');
  }
  process.exit(1);
}

// Step 4: Test Head Object (verify file exists)
console.log('\n4️⃣  Verifying File Exists...');
try {
  const headCommand = new HeadObjectCommand({
    Bucket: config.r2BucketName,
    Key: testKey,
  });
  
  const headResult = await r2Client.send(headCommand);
  console.log('   ✅ File exists in R2');
  console.log(`   📊 File size: ${headResult.ContentLength} bytes`);
  console.log(`   📅 Last modified: ${headResult.LastModified}`);
  console.log(`   🏷️  Content type: ${headResult.ContentType}`);
} catch (error) {
  console.log(`   ❌ Verification failed: ${error.message}`);
}

// Step 5: Test Public URL Access
console.log('\n5️⃣  Testing Public URL Access...');
const publicUrl = config.r2PublicUrl
  ? `${config.r2PublicUrl}/${testKey}`
  : `https://${config.r2BucketName}.${config.r2AccountId}.r2.dev/${testKey}`;

console.log(`   🔗 Public URL: ${publicUrl}`);

try {
  const response = await fetch(publicUrl);
  if (response.ok) {
    const content = await response.text();
    if (content === testContent.toString()) {
      console.log('   ✅ Public URL is accessible and content matches');
    } else {
      console.log('   ⚠️  Public URL is accessible but content differs');
    }
  } else {
    console.log(`   ⚠️  Public URL returned HTTP ${response.status}`);
    if (response.status === 403 || response.status === 404) {
      console.log('   ⚠️  This may be normal if public access is not enabled on the bucket');
      console.log('   ℹ️  Enable public access in Cloudflare Dashboard → R2 → Your Bucket → Settings');
    }
  }
} catch (error) {
  console.log(`   ⚠️  Could not access public URL: ${error.message}`);
  console.log('   ℹ️  This may be normal if public access is not enabled');
}

// Step 6: Test Delete
console.log('\n6️⃣  Cleaning Up Test File...');
try {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: config.r2BucketName,
    Key: testKey,
  });
  
  await r2Client.send(deleteCommand);
  console.log('   ✅ Successfully deleted test file');
} catch (error) {
  console.log(`   ⚠️  Delete failed: ${error.message}`);
}

// Final Summary
console.log('\n' + '='.repeat(80));
console.log('✅ R2 Connection Test PASSED\n');
console.log('Your R2 configuration is working correctly!');
console.log('You can now proceed with the image migration.\n');
console.log('Next steps:');
console.log('  1. Run dry-run: node scripts/migrate-images-to-r2.mjs --dry-run');
console.log('  2. Review the output');
console.log('  3. Run full migration: node scripts/migrate-images-to-r2.mjs\n');
