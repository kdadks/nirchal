#!/usr/bin/env node

/**
 * Load Google Product Taxonomy into Database
 * Downloads taxonomy from Google and inserts into Supabase
 */

import https from 'https';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

const TAXONOMY_URL = 'https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Use service role key for bypassing RLS during data loading
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.error('Please ensure your .env file contains:');
  console.error('  VITE_SUPABASE_URL=your_supabase_url');
  console.error('  VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for data loading)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Download taxonomy file from Google
 */
function downloadTaxonomy() {
  return new Promise((resolve, reject) => {
    console.log('📥 Downloading Google Product Taxonomy...');
    
    https.get(TAXONOMY_URL, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log('✅ Downloaded taxonomy file');
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Parse taxonomy text into structured data
 */
function parseTaxonomy(content) {
  const lines = content.split('\n');
  const entries = [];
  const categoryMap = new Map();

  console.log('🔍 Parsing taxonomy data...');

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      continue;
    }

    // Parse line format: "ID - Full > Category > Path"
    const match = line.match(/^(\d+)\s*-\s*(.+)$/);
    if (!match) {
      continue;
    }

    const id = parseInt(match[1], 10);
    const fullPath = match[2].trim();
    
    // Split path into parts
    const parts = fullPath.split('>').map(p => p.trim());
    const level = parts.length;
    const categoryName = parts[parts.length - 1];

    // Determine parent ID
    let parentId = null;
    if (level > 1) {
      const parentPath = parts.slice(0, -1).join(' > ');
      parentId = categoryMap.get(parentPath) || null;
    }

    // Store this entry
    categoryMap.set(fullPath, id);
    entries.push({
      id,
      category_name: categoryName,
      full_path: fullPath,
      level,
      parent_id: parentId
    });
  }

  console.log(`✅ Parsed ${entries.length} categories`);
  return entries;
}

/**
 * Delete existing sample data
 */
async function clearExistingData() {
  console.log('🗑️  Clearing existing sample data...');
  
  const { error } = await supabase
    .from('google_product_categories')
    .delete()
    .neq('id', 0); // Delete all records

  if (error) {
    console.error('❌ Error clearing data:', error.message);
    return false;
  }
  
  console.log('✅ Sample data cleared');
  return true;
}

/**
 * Insert categories into database in batches
 */
async function insertCategories(categories) {
  console.log('💾 Inserting categories into database...');
  
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('google_product_categories')
      .insert(batch);

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      process.stdout.write(`\r✅ Inserted ${inserted}/${categories.length} categories`);
    }
  }

  console.log('\n');
  return { inserted, errors };
}

/**
 * Verify data integrity
 */
async function verifyData() {
  console.log('🔍 Verifying data...');

  // Count total categories
  const { count: totalCount, error: countError } = await supabase
    .from('google_product_categories')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting categories:', countError.message);
    return false;
  }

  console.log(`✅ Total categories in database: ${totalCount}`);

  // Count by level
  for (let level = 1; level <= 5; level++) {
    const { count, error } = await supabase
      .from('google_product_categories')
      .select('*', { count: 'exact', head: true })
      .eq('level', level);

    if (!error) {
      console.log(`   Level ${level}: ${count} categories`);
    }
  }

  // Test search function
  console.log('\n🔍 Testing search function...');
  const { data: searchResults, error: searchError } = await supabase
    .rpc('search_google_categories', { search_term: 'shoes' });

  if (searchError) {
    console.log('⚠️  Search function not available yet. Run the functions migration:');
    console.log('   supabase/migrations/20241106_google_product_taxonomy_functions.sql');
    // Don't fail on missing function - data is loaded successfully
    return true;
  }

  console.log(`✅ Search function works (found ${searchResults?.length || 0} results for "shoes")`);
  if (searchResults && searchResults.length > 0) {
    console.log(`   Example: ${searchResults[0].full_path}`);
  }

  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Google Product Taxonomy Loader\n');

  try {
    // Download taxonomy
    const content = await downloadTaxonomy();

    // Parse taxonomy
    const categories = parseTaxonomy(content);

    // Clear existing sample data
    const cleared = await clearExistingData();
    if (!cleared) {
      console.log('⚠️  Warning: Could not clear existing data, continuing anyway...');
    }

    // Insert into database
    const { inserted, errors } = await insertCategories(categories);

    if (errors > 0) {
      console.log(`⚠️  Completed with ${errors} errors`);
    } else {
      console.log('✅ All categories inserted successfully');
    }

    // Verify
    const verified = await verifyData();

    if (verified && errors === 0) {
      console.log('\n✅ Google Product Taxonomy loaded successfully!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Taxonomy loaded with some issues\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
main();

export { downloadTaxonomy, parseTaxonomy, clearExistingData, insertCategories };
