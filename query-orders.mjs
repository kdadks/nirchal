/**
 * Query Orders Database - Check Current State
 * 
 * This script queries the orders table to see the actual data.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load from .env.local first, then .env
config({ path: '.env.local' });
config({ path: '.env' });

const supabaseUrl = 'https://tazrvokohjfzicdzzxia.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function queryOrders() {
  console.log('🔍 Querying orders table...\n');

  // Get all recent orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, razorpay_order_id, razorpay_payment_id, payment_status, payment_method, total_amount, created_at, payment_details')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error querying orders:', error);
    return;
  }

  if (!orders || orders.length === 0) {
    console.log('⚠️ No orders found in database');
    return;
  }

  console.log(`📋 Found ${orders.length} recent order(s):\n`);

  orders.forEach((order, index) => {
    console.log(`${index + 1}. Order: ${order.order_number}`);
    console.log(`   ID: ${order.id}`);
    console.log(`   Razorpay Order ID: ${order.razorpay_order_id || 'NULL'}`);
    console.log(`   Razorpay Payment ID: ${order.razorpay_payment_id || 'NULL'}`);
    console.log(`   Payment Status: ${order.payment_status}`);
    console.log(`   Payment Method: ${order.payment_method}`);
    console.log(`   Total: ₹${order.total_amount}`);
    console.log(`   Has Payment Details: ${order.payment_details ? 'YES ✅' : 'NO ❌'}`);
    if (order.payment_details) {
      console.log(`   Payment Method (from details): ${order.payment_details.method || 'N/A'}`);
      console.log(`   Payment Amount (from details): ₹${order.payment_details.amount ? order.payment_details.amount / 100 : 'N/A'}`);
    }
    console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
    console.log('');
  });

  // Check for orders with specific payment IDs mentioned by user
  console.log('🔍 Checking for specific orders mentioned...\n');
  
  const specificOrders = [
    'ORD-20250919-971796',
    'ORD-20251015-491050',
    'pay_RTj7bi8UDwHcsi',
    'order_RTlGNwDpokoEBO'
  ];

  for (const search of specificOrders) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`order_number.eq.${search},razorpay_payment_id.eq.${search},razorpay_order_id.eq.${search}`)
      .single();

    if (data) {
      console.log(`✅ Found match for: ${search}`);
      console.log(`   Order: ${data.order_number}`);
      console.log(`   Payment Status: ${data.payment_status}`);
      console.log(`   Has Payment Details: ${data.payment_details ? 'YES' : 'NO'}`);
    }
  }
}

queryOrders().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
