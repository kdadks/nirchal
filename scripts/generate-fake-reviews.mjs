#!/usr/bin/env node

/**
 * Generate Fake Product Reviews for Featured Section Products
 * 
 * This script generates realistic product reviews for products in featured sections
 * to help attract more customers to the site.
 * 
 * Usage: node scripts/generate-fake-reviews.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

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
  console.error('      $env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"; node scripts/generate-fake-reviews.mjs');
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

// Fixed customer ID for all reviews
const CUSTOMER_ID = 'b241040c-b73e-445c-ad04-75d2f4ce8152';

// Random Indian names for reviewers
const INDIAN_NAMES = [
  'Priya Sharma', 'Anjali Patel', 'Neha Gupta', 'Kavita Singh', 'Divya Reddy',
  'Pooja Iyer', 'Shruti Joshi', 'Sneha Desai', 'Riya Verma', 'Meera Nair',
  'Sakshi Agarwal', 'Ananya Kapoor', 'Ishita Mehta', 'Tanvi Kumar', 'Aditi Rao',
  'Simran Kaur', 'Nikita Shah', 'Pallavi Bansal', 'Swati Malhotra', 'Manisha Chopra',
  'Aarti Mishra', 'Deepika Shetty', 'Rupal Bhatia', 'Sonal Thakur', 'Kritika Saxena',
  'Vandana Pillai', 'Gayatri Kulkarni', 'Nisha Pandey', 'Radhika Menon', 'Varsha Bhatt'
];

// Review templates based on product categories and attributes
const REVIEW_TEMPLATES = {
  saree: [
    'Absolutely stunning saree! The {fabric} fabric is of excellent quality and the {color} color is exactly as shown in pictures. Perfect for festive occasions.',
    'Beautiful saree with intricate work. The fabric quality is top-notch and drapes beautifully. Received many compliments when I wore it to a wedding.',
    'Gorgeous saree! The {color} shade is vibrant and the {fabric} material feels premium. Great value for money. Highly recommended!',
    'Lovely saree with elegant design. The fabric is comfortable to wear for long hours. Perfect addition to my wardrobe.',
    'Amazing quality! The saree came well-packaged and the colors are rich. Very happy with my purchase.',
    'Excellent saree! The {fabric} material is smooth and the finish is impeccable. Will definitely order more.',
    'Beautiful piece! Wore it for a function and got so many compliments. The quality exceeded my expectations.',
    'Very satisfied with this purchase. The saree is exactly as described and the {color} color is gorgeous.',
  ],
  kurti: [
    'Love this kurti! The {fabric} fabric is soft and breathable. The {color} color is vibrant and perfect for daily wear.',
    'Comfortable and stylish kurti. The fitting is perfect and the fabric quality is really good. Worth every penny!',
    'Beautiful kurti with great stitching quality. The design is trendy and I love the {color} shade. Highly recommend!',
    'Perfect kurti for office wear. The {fabric} material is comfortable and the color doesn\'t fade after washing.',
    'Excellent purchase! The kurti is well-made with attention to detail. Fits perfectly and looks elegant.',
    'Really happy with this kurti. The fabric is of good quality and the design is exactly as shown.',
    'Lovely kurti! Comfortable to wear all day and the color is beautiful. Great value for money.',
    'Amazing quality kurti! The stitching is neat and the fabric feels premium. Will buy more designs.',
  ],
  lehanga: [
    'Breathtaking lehanga! The embroidery work is stunning and the {fabric} fabric is of superior quality. Perfect for my wedding function.',
    'Gorgeous lehanga choli! The {color} color is royal and the fitting is perfect. Received countless compliments.',
    'Absolutely love this lehanga! The detailing is exquisite and the fabric quality is premium. Worth the investment.',
    'Beautiful lehanga with intricate work. The dupatta complements it perfectly. Feels like a princess wearing it!',
    'Stunning piece! The embroidery and stone work is beautiful. Great quality and elegant design.',
    'Perfect lehanga for special occasions. The fabric is heavy and rich, and the craftsmanship is excellent.',
    'Amazing lehanga! The color combination is beautiful and the fit is perfect. Very happy with this purchase.',
    'Excellent quality lehanga with beautiful detailing. The {fabric} material drapes well and looks luxurious.',
  ],
  dress: [
    'Love this dress! The {fabric} fabric is comfortable and the {color} color is exactly what I wanted. Perfect fit!',
    'Beautiful dress with elegant design. The quality is great and it fits perfectly. Very satisfied!',
    'Stylish and comfortable dress. The fabric is good quality and the stitching is neat. Highly recommend!',
    'Perfect dress for casual outings. The {color} shade is lovely and the material is breathable.',
    'Great purchase! The dress is well-made and the fabric feels premium. Looks exactly like the picture.',
    'Lovely dress! Comfortable to wear and the design is trendy. Worth the price.',
    'Excellent quality dress. The fit is perfect and the fabric doesn\'t wrinkle easily. Very happy!',
    'Beautiful dress with good finishing. The color is vibrant and the material is of good quality.',
  ],
  default: [
    'Excellent quality product! Very satisfied with my purchase. The {color} color is beautiful and the {fabric} fabric is premium.',
    'Beautiful product with great craftsmanship. Highly recommend! The quality exceeded my expectations.',
    'Amazing quality and fast delivery! The product is exactly as described and looks even better in person.',
    'Love this product! Great value for money and the quality is outstanding. Will definitely shop again.',
    'Very happy with this purchase. The fabric quality is excellent and the design is elegant.',
    'Superb quality! The attention to detail is impressive. Highly satisfied with this product.',
    'Excellent product! The craftsmanship is top-notch and it looks beautiful. Great buy!',
    'Beautiful product with premium quality. The colors are vibrant and the material feels luxurious.',
  ]
};

// Helper function to get random element from array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to generate random date within last 6 months
function getRandomDate() {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const randomTime = sixMonthsAgo.getTime() + 
    Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  
  return new Date(randomTime).toISOString();
}

// Helper function to get random rating (weighted towards positive reviews)
function getRandomRating() {
  const rand = Math.random();
  if (rand < 0.50) return 5; // 50% chance of 5 stars
  if (rand < 0.80) return 4; // 30% chance of 4 stars
  if (rand < 0.95) return 3; // 15% chance of 3 stars
  return 4; // 5% chance of 4 stars (avoiding too many low ratings)
}

// Helper function to generate review text based on product
function generateReview(product) {
  const productName = product.name.toLowerCase();
  let category = 'default';
  
  // Determine category from product name or subcategory
  if (productName.includes('saree') || productName.includes('sari')) {
    category = 'saree';
  } else if (productName.includes('kurti') || productName.includes('kurta')) {
    category = 'kurti';
  } else if (productName.includes('lehanga') || productName.includes('lehenga')) {
    category = 'lehanga';
  } else if (productName.includes('dress') || productName.includes('gown')) {
    category = 'dress';
  }
  
  const templates = REVIEW_TEMPLATES[category];
  let reviewText = getRandomElement(templates);
  
  // Replace placeholders with actual product attributes
  reviewText = reviewText.replace(/\{fabric\}/g, product.fabric || 'cotton');
  reviewText = reviewText.replace(/\{color\}/g, product.color || 'beautiful');
  
  return reviewText;
}

// Main function to generate reviews
async function generateFakeReviews() {
  console.log('🎭 Starting fake review generation...\n');
  
  try {
    // Step 1: Get all products from featured sections
    console.log('📦 Fetching featured section products...');
    
    const { data: featuredProducts, error: featuredError } = await supabase
      .from('featured_section_products')
      .select(`
        product_id,
        products (
          id,
          name,
          fabric,
          color,
          subcategory
        )
      `);
    
    if (featuredError) {
      throw featuredError;
    }
    
    if (!featuredProducts || featuredProducts.length === 0) {
      console.log('⚠️  No featured products found. Please add products to featured sections first.');
      return;
    }
    
    // Extract unique products (in case same product is in multiple sections)
    const uniqueProducts = {};
    featuredProducts.forEach(fp => {
      if (fp.products && fp.products.id) {
        uniqueProducts[fp.products.id] = fp.products;
      }
    });
    
    const products = Object.values(uniqueProducts);
    console.log(`✅ Found ${products.length} unique featured products\n`);
    
    // Step 2: Check existing reviews for these products
    console.log('🔍 Checking for existing reviews...');
    
    const productIds = products.map(p => p.id);
    const { data: existingReviews, error: reviewsError } = await supabase
      .from('product_reviews')
      .select('product_id')
      .in('product_id', productIds);
    
    if (reviewsError) {
      throw reviewsError;
    }
    
    const productsWithReviews = new Set(existingReviews?.map(r => r.product_id) || []);
    console.log(`✅ Found ${productsWithReviews.size} products with existing reviews\n`);
    
    // Step 3: Generate reviews for each product
    console.log('✍️  Generating reviews...\n');
    
    let totalReviewsGenerated = 0;
    const reviewsToInsert = [];
    
    for (const product of products) {
      // Generate 3-7 reviews per product (random)
      const numReviews = Math.floor(Math.random() * 5) + 3; // 3 to 7 reviews
      
      console.log(`  📝 Product: ${product.name}`);
      console.log(`     Generating ${numReviews} reviews...`);
      
      for (let i = 0; i < numReviews; i++) {
        const review = {
          product_id: product.id,
          customer_id: CUSTOMER_ID,
          user_name: getRandomElement(INDIAN_NAMES),
          rating: getRandomRating(),
          comment: generateReview(product),
          helpful: Math.floor(Math.random() * 20), // 0-19 helpful votes
          images: [], // Empty images array
          created_at: getRandomDate() // Random date within last 6 months
          // Note: id will be auto-generated by database
        };
        
        reviewsToInsert.push(review);
        totalReviewsGenerated++;
      }
      
      console.log(`     ✅ Generated ${numReviews} reviews\n`);
    }
    
    // Step 4: Insert reviews into database
    console.log(`📥 Inserting ${totalReviewsGenerated} reviews into database...`);
    
    let insertedCount = 0;
    let errorCount = 0;
    
    // Insert reviews one by one (sequence should work after migration)
    for (let i = 0; i < reviewsToInsert.length; i++) {
      const review = reviewsToInsert[i];
      
      const { error: insertError } = await supabase
        .from('product_reviews')
        .insert([review]);
      
      if (insertError) {
        errorCount++;
        if (errorCount <= 3) { // Only show first 3 errors to avoid spam
          console.error(`❌ Error inserting review ${i + 1}:`, insertError.message);
        }
        continue;
      }
      
      insertedCount++;
      
      // Show progress every 10 reviews
      if ((i + 1) % 10 === 0 || (i + 1) === reviewsToInsert.length) {
        console.log(`   ✓ Inserted ${insertedCount} / ${reviewsToInsert.length} reviews...`);
      }
    }
    
    if (errorCount > 3) {
      console.log(`   (... and ${errorCount - 3} more errors)`);
    }
    
    console.log(`\n✅ Successfully inserted ${insertedCount} reviews!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Products processed: ${products.length}`);
    console.log(`   - Reviews generated: ${totalReviewsGenerated}`);
    console.log(`   - Reviews inserted: ${insertedCount}`);
    console.log(`   - Customer ID used: ${CUSTOMER_ID}`);
    
    // Step 5: Verify insertion
    console.log(`\n🔍 Verifying reviews in database...`);
    
    const { count, error: countError } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .in('product_id', productIds);
    
    if (countError) {
      console.error('❌ Error verifying reviews:', countError);
    } else {
      console.log(`✅ Total reviews in database for featured products: ${count}`);
    }
    
    console.log('\n🎉 Review generation complete!');
    
  } catch (error) {
    console.error('\n❌ Error generating reviews:', error);
    process.exit(1);
  }
}

// Run the script
generateFakeReviews();
