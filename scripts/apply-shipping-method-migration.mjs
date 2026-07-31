import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getSupabaseServiceKey } from './_utils/supabase-key.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = getSupabaseServiceKey();

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Applying shipping method migration...\n');

  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251104000000_add_shipping_method.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log(migrationSQL);
    console.log('\n🔄 Executing migration...\n');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement:`, error);
          console.error('Statement was:', statement);
        } else {
          console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Verifying migration...\n');

    // Verify the columns were added
    const { data: sampleOrder } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
      .single();

    if (sampleOrder) {
      const hasShippingMethod = 'shipping_method' in sampleOrder;
      const hasExpressFee = 'express_delivery_fee' in sampleOrder;

      console.log(`shipping_method column: ${hasShippingMethod ? '✅ EXISTS' : '❌ NOT FOUND'}`);
      console.log(`express_delivery_fee column: ${hasExpressFee ? '✅ EXISTS' : '❌ NOT FOUND'}`);

      if (hasShippingMethod && hasExpressFee) {
        console.log('\n🎉 Migration verified successfully!');
      } else {
        console.log('\n⚠️  Migration may not have been applied correctly');
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

applyMigration();
