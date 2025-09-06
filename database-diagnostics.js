// Database diagnostic script to check logistics_partners table access
// Run this with: node database-diagnostics.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
  console.log('🔍 Starting database diagnostics...\n');

  try {
    // 1. Check authentication status
    console.log('1. Authentication Status:');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth Error:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
      console.log('   User ID:', user.id);
      console.log('   Role:', user.role || 'No role set');
    } else {
      console.log('❌ No user authenticated');
    }
    console.log('');

    // 2. Test reading logistics_partners (this should work)
    console.log('2. Testing READ access to logistics_partners:');
    const { data: readData, error: readError } = await supabase
      .from('logistics_partners')
      .select('*')
      .limit(1);

    if (readError) {
      console.log('❌ Read Error:', readError.message);
      console.log('   Code:', readError.code);
      console.log('   Details:', readError.details);
    } else {
      console.log('✅ Read successful, found', readData?.length || 0, 'records');
      if (readData && readData.length > 0) {
        console.log('   Sample record ID:', readData[0].id);
      }
    }
    console.log('');

    // 3. Test writing to logistics_partners (this is what fails)
    console.log('3. Testing WRITE access to logistics_partners:');
    const testData = {
      name: 'Test Partner ' + Date.now(),
      description: 'Test description',
      email: 'test@example.com',
      is_active: true
    };

    const { data: writeData, error: writeError } = await supabase
      .from('logistics_partners')
      .insert(testData)
      .select();

    if (writeError) {
      console.log('❌ Write Error:', writeError.message);
      console.log('   Code:', writeError.code);
      console.log('   Details:', writeError.details);
      console.log('   Hint:', writeError.hint);
    } else {
      console.log('✅ Write successful, created record:', writeData[0]?.id);
      
      // Clean up test record
      if (writeData && writeData[0]) {
        await supabase
          .from('logistics_partners')
          .delete()
          .eq('id', writeData[0].id);
        console.log('   ✅ Test record cleaned up');
      }
    }
    console.log('');

    // 4. Check database policies
    console.log('4. Checking database policies:');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'logistics_partners' })
      .select();

    if (policyError) {
      console.log('❌ Could not fetch policies:', policyError.message);
    } else {
      console.log('✅ Policies found:', policies?.length || 0);
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.permissive})`);
      });
    }
    console.log('');

    // 5. Test with vendors table for comparison
    console.log('5. Testing vendors table (for comparison):');
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .limit(1);

    if (vendorError) {
      console.log('❌ Vendors Read Error:', vendorError.message);
    } else {
      console.log('✅ Vendors read successful, found', vendorData?.length || 0, 'records');
    }

    console.log('\n📊 Diagnostic Complete!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Function to create the RPC for getting policies (if it doesn't exist)
async function createPolicyRPC() {
  const createRPCSQL = `
    CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
    RETURNS TABLE(
      schemaname text,
      tablename text,
      policyname text,
      permissive text,
      roles text[],
      cmd text,
      qual text
    )
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT 
        schemaname::text,
        tablename::text,
        policyname::text,
        CASE WHEN permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END as permissive,
        roles,
        cmd::text,
        qual::text
      FROM pg_policies 
      WHERE tablename = $1;
    $$;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: createRPCSQL });
  if (error) {
    console.log('Note: Could not create policy RPC function:', error.message);
  }
}

// Run diagnostics
async function main() {
  await createPolicyRPC();
  await runDiagnostics();
}

main().catch(console.error);
