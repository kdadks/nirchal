import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required environment variables:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrdersSchema() {
  console.log('🔍 Checking orders table schema...\n');

  try {
    // Get a sample order to see the structure
    console.log('Fetching sample order data...\n');
      
    const { data: sampleOrder, error: sampleError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
      .single();

    if (sampleError && sampleError.code !== 'PGRST116') {
      throw sampleError;
    }

    if (sampleOrder) {
      console.log('📋 Orders table columns (from sample data):\n');
      const columns = Object.keys(sampleOrder).sort();
      columns.forEach((key, index) => {
        const value = sampleOrder[key];
        const displayValue = value !== null ? (typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : value) : 'null';
        console.log(`${index + 1}. ${key}: ${typeof value} = ${displayValue}`);
      });

      // Check if shipping_method or express_delivery_fee exists
      console.log('\n🔎 Checking for shipping-related columns...\n');
      const shippingRelated = columns.filter(key => 
        key.includes('shipping') || key.includes('delivery') || key.includes('express')
      );
      
      if (shippingRelated.length > 0) {
        console.log('✅ Found shipping-related columns:');
        shippingRelated.forEach(col => console.log(`  - ${col}`));
        
        const hasShippingMethod = columns.includes('shipping_method');
        const hasExpressFee = columns.includes('express_delivery_fee');
        
        console.log('\n📊 Required Column Status:');
        console.log(`  shipping_method: ${hasShippingMethod ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        console.log(`  express_delivery_fee: ${hasExpressFee ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        
        if (!hasShippingMethod || !hasExpressFee) {
          console.log('\n✅ Migration needed to add missing shipping method columns');
        } else {
          console.log('\n⚠️ All shipping method columns already exist!');
        }
      } else {
        console.log('❌ No shipping-related columns found');
        console.log('✅ Migration is needed to add these columns:');
        console.log('   - shipping_method');
        console.log('   - express_delivery_fee');
      }
    } else {
      console.log('⚠️ No orders found in the table');
      console.log('Cannot determine current schema without data');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    console.error('Full error:', error);
  }
}

checkOrdersSchema();
