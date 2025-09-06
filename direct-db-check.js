// Direct database query script to check RLS policies and table permissions
// Run this with: node direct-db-check.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service key bypasses RLS

if (!supabaseServiceKey) {
  console.log('⚠️  Note: SUPABASE_SERVICE_ROLE_KEY not found. Using anon key (limited access)');
}

const supabase = createClient(
  supabaseUrl, 
  supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDatabaseDirectly() {
  console.log('🗄️  Direct Database Check...\n');

  try {
    // 1. Check if RLS is enabled on logistics_partners
    console.log('1. Checking RLS status:');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'logistics_partners' });

    if (rlsError) {
      console.log('❌ Could not check RLS status:', rlsError.message);
      // Alternative method using direct SQL
      const { data: altRLS, error: altError } = await supabase
        .from('pg_tables')
        .select('schemaname, tablename, rowsecurity')
        .eq('tablename', 'logistics_partners');
      
      if (!altError && altRLS) {
        console.log('✅ RLS Status (alternative check):', altRLS[0]?.rowsecurity ? 'ENABLED' : 'DISABLED');
      }
    } else {
      console.log('✅ RLS Status:', rlsStatus);
    }
    console.log('');

    // 2. List all policies on logistics_partners
    console.log('2. Current policies on logistics_partners:');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'logistics_partners' });

    if (policyError) {
      console.log('❌ Could not fetch policies:', policyError.message);
    } else if (!policies || policies.length === 0) {
      console.log('⚠️  No policies found');
    } else {
      policies.forEach((policy, index) => {
        console.log(`   ${index + 1}. ${policy.policyname}`);
        console.log(`      Command: ${policy.cmd}`);
        console.log(`      Using: ${policy.qual || 'No condition'}`);
        console.log(`      Check: ${policy.with_check || 'No check'}`);
        console.log('');
      });
    }

    // 3. Compare with vendors table
    console.log('3. Comparing with vendors table:');
    const { data: vendorPolicies, error: vendorError } = await supabase
      .rpc('get_policies', { table_name: 'vendors' });

    if (vendorError) {
      console.log('❌ Could not fetch vendor policies:', vendorError.message);
    } else if (!vendorPolicies || vendorPolicies.length === 0) {
      console.log('✅ Vendors table has NO RLS policies (explains why it works)');
      
      // Check if RLS is even enabled on vendors
      const { data: vendorRLS, error: vendorRLSError } = await supabase
        .from('pg_tables')
        .select('rowsecurity')
        .eq('tablename', 'vendors');
        
      if (!vendorRLSError && vendorRLS) {
        console.log('   Vendors RLS status:', vendorRLS[0]?.rowsecurity ? 'ENABLED' : 'DISABLED');
      }
    } else {
      console.log(`✅ Vendors table has ${vendorPolicies.length} policies`);
    }
    console.log('');

    // 4. Test direct access with service key
    console.log('4. Testing direct access with service key:');
    const { data: directData, error: directError } = await supabase
      .from('logistics_partners')
      .select('count')
      .limit(1);

    if (directError) {
      console.log('❌ Direct access failed:', directError.message);
    } else {
      console.log('✅ Direct access successful');
    }
    console.log('');

    // 5. Generate fix SQL
    console.log('5. Recommended fix:');
    console.log('   Run this SQL in your Supabase dashboard:');
    console.log('   ');
    console.log('   ALTER TABLE logistics_partners DISABLE ROW LEVEL SECURITY;');
    console.log('   ');
    console.log('   This will make logistics_partners behave like vendors table.');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Create helper functions
async function createHelperFunctions() {
  const createFunctions = `
    -- Function to check RLS status
    CREATE OR REPLACE FUNCTION check_rls_status(table_name text)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT rowsecurity FROM pg_tables WHERE tablename = $1;
    $$;

    -- Function to get policies
    CREATE OR REPLACE FUNCTION get_policies(table_name text)
    RETURNS TABLE(
      policyname text,
      cmd text,
      qual text,
      with_check text
    )
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT 
        policyname::text,
        cmd::text,
        qual::text,
        with_check::text
      FROM pg_policies 
      WHERE tablename = $1;
    $$;
  `;

  try {
    // Note: This might fail if we don't have sufficient permissions
    await supabase.rpc('exec_sql', { sql: createFunctions });
  } catch (error) {
    // Ignore errors - we'll use alternative methods
  }
}

async function main() {
  await createHelperFunctions();
  await checkDatabaseDirectly();
}

main().catch(console.error);
