import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Inventory data from your JSON file
const inventoryData = [
  {
    id: "3",
    quantity: 5,
    low_stock_threshold: 2,
    product_id: "707d596f-902f-4b04-9dac-1e0aa844572a",
    variant_id: "3f5f9801-9b9d-47d0-abcd-9d8988d95edb"
  },
  {
    id: "5", 
    quantity: 3,
    low_stock_threshold: 1,
    product_id: "f6d647fd-0bb6-40f5-910d-e6118f396aa7",
    variant_id: "3274b155-b4f2-4e02-b6de-197e052c7044"
  },
  {
    id: "7",
    quantity: 5,
    low_stock_threshold: 2,
    product_id: "f6d647fd-0bb6-40f5-910d-e6118f396aa7",
    variant_id: "e6320468-7d82-4ced-a67f-9249aa0db674"
  },
  {
    id: "8",
    quantity: 20,
    low_stock_threshold: 5,
    product_id: "ca359243-a606-4d74-841c-f7d771d2bf8c",
    variant_id: "db3ea59d-e79f-444e-9e80-85f0837d96c2"
  },
  {
    id: "9",
    quantity: 5,
    low_stock_threshold: 2,
    product_id: "b6466e55-0ebf-4df2-9dbe-c345c93149c3",
    variant_id: null
  }
];

async function insertInventory() {
  console.log('Starting inventory insertion...');
  
  try {
    // First check if data already exists
    const { count } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Current inventory count: ${count}`);
    
    if (count > 0) {
      console.log('Inventory data already exists. Skipping insertion.');
      return;
    }
    
    // Insert the inventory data
    const { data, error } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select();
    
    if (error) {
      console.error('Error inserting inventory:', error);
      return;
    }
    
    console.log(`Successfully inserted ${data.length} inventory records:`);
    data.forEach(record => {
      console.log(`- Product ${record.product_id}: ${record.quantity} in stock`);
    });
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

insertInventory();
