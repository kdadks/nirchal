// Simple test to verify category-images bucket configuration
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
  });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCategoryImagesBucket() {
  console.log('Testing category-images bucket configuration...');
  
  try {
    // List all buckets
    const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
    
    if (bucketListError) {
      console.error('❌ Error listing buckets:', bucketListError);
      return;
    }
    
    console.log('📋 Available buckets:');
    buckets?.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    // Check if category-images bucket exists
    const categoryImagesBucket = buckets?.find(b => b.name === 'category-images');
    
    if (!categoryImagesBucket) {
      console.log('❌ category-images bucket does not exist');
      console.log('Creating category-images bucket...');
      
      const { data: createData, error: createError } = await supabase.storage.createBucket('category-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return;
      }
      
      console.log('✅ category-images bucket created successfully');
    } else {
      console.log('✅ category-images bucket exists and is', categoryImagesBucket.public ? 'public' : 'private');
    }
    
    // Test file upload capability
    console.log('🧪 Testing upload capability...');
    
    const testBlob = new Blob(['test content'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(testFileName, testBlob);
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      return;
    }
    
    console.log('✅ Upload test successful');
    
    // Test public URL generation
    const { data: { publicUrl } } = supabase.storage
      .from('category-images')
      .getPublicUrl(testFileName);
    
    console.log('📍 Test file public URL:', publicUrl);
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('category-images')
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️ Failed to clean up test file:', deleteError);
    } else {
      console.log('🧹 Test file cleaned up');
    }
    
    console.log('✅ Category-images bucket is properly configured!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testCategoryImagesBucket();
