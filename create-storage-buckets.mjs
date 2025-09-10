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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createStorageBuckets() {
  console.log('🔧 Creating necessary storage buckets...\n');

  try {
    // 1. Create product-images bucket
    console.log('Creating product-images bucket...');
    const { data: productBucket, error: productError } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 52428800 // 50MB
    });

    if (productError) {
      if (productError.message.includes('already exists')) {
        console.log('✅ product-images bucket already exists');
      } else {
        console.error('❌ Error creating product-images bucket:', productError);
      }
    } else {
      console.log('✅ Created product-images bucket successfully');
    }

    // 2. Create category-images bucket
    console.log('Creating category-images bucket...');
    const { data: categoryBucket, error: categoryError } = await supabase.storage.createBucket('category-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 52428800 // 50MB
    });

    if (categoryError) {
      if (categoryError.message.includes('already exists')) {
        console.log('✅ category-images bucket already exists');
      } else {
        console.error('❌ Error creating category-images bucket:', categoryError);
      }
    } else {
      console.log('✅ Created category-images bucket successfully');
    }

    // 3. Verify buckets were created
    console.log('\nVerifying buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
    } else {
      console.log('Available buckets:', buckets.map(b => `${b.id} (${b.public ? 'public' : 'private'})`));
    }

  } catch (error) {
    console.error('Failed to create storage buckets:', error);
  }
}

createStorageBuckets();
