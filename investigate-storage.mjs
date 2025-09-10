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

async function investigateStorage() {
  console.log('🔍 Investigating Supabase Storage...\n');

  try {
    // 1. List all buckets
    console.log('1. Listing all storage buckets:');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => `${b.id} (${b.public ? 'public' : 'private'})`));
    console.log('');

    // 2. Check product-images bucket
    if (buckets.find(b => b.id === 'product-images')) {
      console.log('2. Investigating product-images bucket:');
      const { data: productFiles, error: productError } = await supabase.storage
        .from('product-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      
      if (productError) {
        console.error('Error listing product images:', productError);
      } else {
        console.log(`Found ${productFiles.length} files in product-images bucket:`);
        productFiles.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.name} (${(file.metadata?.size / 1024).toFixed(2)} KB)`);
        });
      }
      console.log('');
    }

    // 3. Check category-images bucket
    if (buckets.find(b => b.id === 'category-images')) {
      console.log('3. Investigating category-images bucket:');
      const { data: categoryFiles, error: categoryError } = await supabase.storage
        .from('category-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      
      if (categoryError) {
        console.error('Error listing category images:', categoryError);
      } else {
        console.log(`Found ${categoryFiles.length} files in category-images bucket:`);
        categoryFiles.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.name} (${(file.metadata?.size / 1024).toFixed(2)} KB)`);
        });
      }
      console.log('');
    }

    // 4. Check what's in the database vs storage
    console.log('4. Checking database vs storage consistency:');
    
    // Get all product images from database
    const { data: dbProductImages, error: dbError } = await supabase
      .from('product_images')
      .select('image_url');
    
    if (dbError) {
      console.error('Error fetching product images from database:', dbError);
    } else {
      console.log(`Found ${dbProductImages.length} product image records in database`);
      
      // Extract filenames from URLs
      const dbFilenames = dbProductImages.map(img => {
        const url = img.image_url;
        if (url.includes('/product-images/')) {
          return url.split('/product-images/')[1];
        }
        return url;
      }).filter(filename => filename && filename.length > 0);
      
      console.log(`Database image filenames (first 10):`);
      dbFilenames.slice(0, 10).forEach((filename, index) => {
        console.log(`  ${index + 1}. ${filename}`);
      });
      
      // Compare with storage
      if (buckets.find(b => b.id === 'product-images')) {
        const { data: storageFiles } = await supabase.storage
          .from('product-images')
          .list('', { limit: 1000 });
        
        const storageFilenames = storageFiles?.map(f => f.name) || [];
        
        console.log(`\nStorage vs Database comparison:`);
        console.log(`- Database references: ${dbFilenames.length} files`);
        console.log(`- Storage contains: ${storageFilenames.length} files`);
        
        // Find orphaned files (in storage but not in database)
        const orphanedFiles = storageFilenames.filter(storageFile => 
          !dbFilenames.includes(storageFile)
        );
        
        if (orphanedFiles.length > 0) {
          console.log(`\n❌ Found ${orphanedFiles.length} orphaned files in storage:`);
          orphanedFiles.slice(0, 20).forEach((file, index) => {
            console.log(`  ${index + 1}. ${file}`);
          });
          if (orphanedFiles.length > 20) {
            console.log(`  ... and ${orphanedFiles.length - 20} more`);
          }
        } else {
          console.log(`\n✅ No orphaned files found - storage is clean!`);
        }
        
        // Find missing files (in database but not in storage)
        const missingFiles = dbFilenames.filter(dbFile => 
          !storageFilenames.includes(dbFile)
        );
        
        if (missingFiles.length > 0) {
          console.log(`\n⚠️ Found ${missingFiles.length} missing files (in DB but not storage):`);
          missingFiles.slice(0, 10).forEach((file, index) => {
            console.log(`  ${index + 1}. ${file}`);
          });
        }
      }
    }

    // 5. Check categories
    console.log('\n5. Checking category images:');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, image_url');
    
    if (catError) {
      console.error('Error fetching categories:', catError);
    } else {
      console.log(`Found ${categories.length} categories in database`);
      const categoryImageUrls = categories
        .filter(cat => cat.image_url)
        .map(cat => cat.image_url);
      
      console.log(`Categories with images: ${categoryImageUrls.length}`);
      
      // Extract category filenames
      const catFilenames = categoryImageUrls.map(url => {
        if (url.includes('/category-images/')) {
          return url.split('/category-images/')[1];
        }
        return url;
      }).filter(filename => filename && filename.length > 0);
      
      console.log(`Category image filenames: ${catFilenames.length}`);
    }

  } catch (error) {
    console.error('Investigation failed:', error);
  }
}

investigateStorage();
