#!/usr/bin/env node

/**
 * Update Existing Product Reviews with Random Past Dates
 * 
 * This script updates the created_at timestamps of existing reviews
 * to random dates within the last 6 months to make them look more authentic.
 * 
 * Usage: node scripts/update-review-dates.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { getSupabaseServiceKey } from './_utils/supabase-key.mjs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = getSupabaseServiceKey();

if (!supabaseUrl) {
  console.error('❌ Missing Supabase URL. Please check your .env file.');
  console.error('   Required: VITE_SUPABASE_URL');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase Service Role Key.');
  console.error('   This script requires the Service Role Key to bypass RLS policies.');
  console.error('   ');
  console.error('   To use this script:');
  console.error('   1. Get your Service Role Key from Supabase Dashboard:');
  console.error('      Project Settings > API > Project API keys > service_role key');
  console.error('   ');
  console.error('   2. Run the script with the key as an environment variable:');
   console.error('      $env:SUPABASE_SECRET_KEYS='{"default":"your_service_role_key"}'; node scripts/update-review-dates.mjs');
  console.error('   ');
  console.error('   ⚠️  IMPORTANT: Never commit the service role key to git!');
  process.exit(1);
}

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fixed customer ID for fake reviews
const CUSTOMER_ID = 'b241040c-b73e-445c-ad04-75d2f4ce8152';

// Helper function to generate random date within last 6 months
function getRandomDate() {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const randomTime = sixMonthsAgo.getTime() + 
    Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  
  return new Date(randomTime).toISOString();
}

// Main function to update review dates
async function updateReviewDates() {
  console.log('📅 Starting review date update process...\n');
  
  try {
    // Step 1: Get all reviews for the specific customer
    console.log('📦 Fetching reviews...');
    
    const { data: reviews, error: fetchError } = await supabase
      .from('product_reviews')
      .select('id, created_at, user_name')
      .eq('customer_id', CUSTOMER_ID);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!reviews || reviews.length === 0) {
      console.log('⚠️  No reviews found for customer ID:', CUSTOMER_ID);
      return;
    }
    
    console.log(`✅ Found ${reviews.length} reviews to update\n`);
    
    // Step 2: Update each review with a random date
    console.log('🔄 Updating review dates...\n');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const review of reviews) {
      const randomDate = getRandomDate();
      
      const { error: updateError } = await supabase
        .from('product_reviews')
        .update({ created_at: randomDate })
        .eq('id', review.id);
      
      if (updateError) {
        errorCount++;
        if (errorCount <= 3) {
          console.error(`❌ Error updating review ${review.id}:`, updateError.message);
        }
        continue;
      }
      
      updatedCount++;
      
      // Show progress every 10 reviews
      if (updatedCount % 10 === 0 || updatedCount === reviews.length) {
        console.log(`   ✓ Updated ${updatedCount} / ${reviews.length} reviews...`);
      }
    }
    
    if (errorCount > 3) {
      console.log(`   (... and ${errorCount - 3} more errors)`);
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} review dates!`);
    
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} reviews failed to update`);
    }
    
    // Step 3: Verify the updates
    console.log(`\n🔍 Verifying updated dates...`);
    
    const { data: updatedReviews, error: verifyError } = await supabase
      .from('product_reviews')
      .select('id, created_at, user_name')
      .eq('customer_id', CUSTOMER_ID)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else if (updatedReviews && updatedReviews.length > 0) {
      console.log(`\n📊 Sample of updated reviews (most recent 5):`);
      updatedReviews.forEach((review, index) => {
        const date = new Date(review.created_at);
        console.log(`   ${index + 1}. ${review.user_name} - ${date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}`);
      });
    }
    
    console.log('\n🎉 Review date update complete!');
    
  } catch (error) {
    console.error('\n❌ Error updating review dates:', error);
    process.exit(1);
  }
}

// Run the script
updateReviewDates();
