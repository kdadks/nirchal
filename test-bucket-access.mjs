import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read environment variables from .env file if it exists
let SUPABASE_URL = process.env.VITE_SUPABASE_URL;
let SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    SUPABASE_URL = envVars.VITE_SUPABASE_URL;
    SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;
  } catch (error) {
    console.error('Could not read .env file');
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBucketAccess() {
  console.log('🧪 Testing direct bucket access...\n');

  try {
    // Test 1: Try to list files in product-images bucket directly
    console.log('1. Testing product-images bucket access:');
    const { data: productFiles, error: productError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 10 });
    
    if (productError) {
      console.error('❌ Error accessing product-images bucket:', productError);
    } else {
      console.log(`✅ Successfully accessed product-images bucket`);
      console.log(`   Found ${productFiles.length} files`);
      if (productFiles.length > 0) {
        console.log('   First few files:');
        productFiles.slice(0, 5).forEach((file, index) => {
          console.log(`     ${index + 1}. ${file.name}`);
        });
      }
    }

    // Test 2: Try to list files in category-images bucket directly
    console.log('\n2. Testing category-images bucket access:');
    const { data: categoryFiles, error: categoryError } = await supabase.storage
      .from('category-images')
      .list('', { limit: 10 });
    
    if (categoryError) {
      console.error('❌ Error accessing category-images bucket:', categoryError);
    } else {
      console.log(`✅ Successfully accessed category-images bucket`);
      console.log(`   Found ${categoryFiles.length} files`);
      if (categoryFiles.length > 0) {
        console.log('   First few files:');
        categoryFiles.slice(0, 5).forEach((file, index) => {
          console.log(`     ${index + 1}. ${file.name}`);
        });
      }
    }

    // Test 3: Try to test deletion functionality
    console.log('\n3. Testing deletion permissions:');
    const testFileName = 'test-deletion-' + Date.now() + '.txt';
    
    // Try to upload a test file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testFileName, new Blob(['test content'], { type: 'text/plain' }));
    
    if (uploadError) {
      console.error('❌ Cannot upload test file:', uploadError);
    } else {
      console.log('✅ Successfully uploaded test file');
      
      // Try to delete the test file
      const { data: deleteData, error: deleteError } = await supabase.storage
        .from('product-images')
        .remove([testFileName]);
      
      if (deleteError) {
        console.error('❌ Cannot delete test file:', deleteError);
      } else {
        console.log('✅ Successfully deleted test file');
        console.log('   Storage deletion permissions are working!');
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBucketAccess();
