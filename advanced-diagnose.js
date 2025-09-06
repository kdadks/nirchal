// Advanced diagnostics for PCI DSS / Enhanced Security scenarios
// Run this with: npm run advanced-diagnose

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔒 Advanced Security Diagnostics for logistics_partners\n');

async function advancedDiagnostics() {
  // Test with anon key (what the app uses)
  console.log('1. Testing with ANON key (application context):');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  await testClientAccess(anonClient, 'ANON');

  // Test with service key if available (bypasses most security)
  if (serviceKey) {
    console.log('\n2. Testing with SERVICE key (admin context):');
    const serviceClient = createClient(supabaseUrl, serviceKey);
    await testClientAccess(serviceClient, 'SERVICE');
  } else {
    console.log('\n2. SERVICE key not available - add SUPABASE_SERVICE_ROLE_KEY to .env');
  }

  // Check table permissions at PostgreSQL level
  console.log('\n3. Checking PostgreSQL table permissions:');
  await checkTablePermissions();

  // Check if there are any database-level security policies
  console.log('\n4. Checking for additional security constraints:');
  await checkSecurityConstraints();

  console.log('\n5. Possible PCI DSS / Enhanced Security Issues:');
  console.log('   - Database might have additional access controls');
  console.log('   - Supabase project might be in "restricted mode"');
  console.log('   - API keys might have limited permissions');
  console.log('   - Network-level restrictions might be active');
  
  console.log('\n6. Recommended next steps:');
  console.log('   a) Check Supabase project settings for security mode');
  console.log('   b) Verify API key permissions in dashboard');
  console.log('   c) Check if project has enhanced compliance settings');
  console.log('   d) Test with a simple table create/drop to isolate issue');
}

async function testClientAccess(client, keyType) {
  try {
    // Test read
    const { data: readData, error: readError } = await client
      .from('logistics_partners')
      .select('id')
      .limit(1);
    
    console.log(`   ${keyType} READ:`, readError ? `❌ ${readError.message}` : '✅ Success');

    // Test write  
    const { data: writeData, error: writeError } = await client
      .from('logistics_partners')
      .insert({
        name: `Test ${keyType} ${Date.now()}`,
        description: 'Test entry',
        is_active: true
      })
      .select();

    if (writeError) {
      console.log(`   ${keyType} WRITE: ❌ ${writeError.message}`);
      console.log(`   Error Code: ${writeError.code}`);
      console.log(`   Error Details: ${writeError.details || 'None'}`);
      console.log(`   Error Hint: ${writeError.hint || 'None'}`);
    } else {
      console.log(`   ${keyType} WRITE: ✅ Success`);
      // Clean up
      if (writeData && writeData[0]) {
        await client
          .from('logistics_partners')
          .delete()
          .eq('id', writeData[0].id);
      }
    }

    // Test if we can check RLS status
    const { data: rlsData, error: rlsError } = await client
      .rpc('check_table_rls_status', { table_name: 'logistics_partners' });
    
    if (!rlsError && rlsData !== null) {
      console.log(`   ${keyType} RLS Status: ${rlsData ? 'ENABLED' : 'DISABLED'}`);
    }

  } catch (error) {
    console.log(`   ${keyType} Error:`, error.message);
  }
}

async function checkTablePermissions() {
  const client = createClient(supabaseUrl, serviceKey || supabaseAnonKey);
  
  try {
    // Try to get table info using SQL
    const { data, error } = await client
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            schemaname,
            tablename,
            tableowner,
            rowsecurity,
            hasindexes,
            hasrules,
            hastriggers
          FROM pg_tables 
          WHERE tablename = 'logistics_partners';
        `
      });

    if (error) {
      console.log('   ❌ Cannot access table metadata:', error.message);
    } else {
      console.log('   ✅ Table metadata:', data);
    }
  } catch (error) {
    console.log('   ❌ Table permission check failed:', error.message);
  }
}

async function checkSecurityConstraints() {
  const client = createClient(supabaseUrl, serviceKey || supabaseAnonKey);
  
  // Check if there are any foreign key constraints that might block inserts
  try {
    const { data, error } = await client
      .rpc('exec_sql', {
        sql: `
          SELECT conname, contype, confrelid::regclass as referenced_table
          FROM pg_constraint 
          WHERE conrelid = 'logistics_partners'::regclass;
        `
      });

    if (!error && data) {
      console.log('   Table constraints:', data.length > 0 ? data : 'None');
    }
  } catch (error) {
    console.log('   ❌ Cannot check constraints:', error.message);
  }

  // Check current user and roles
  try {
    const { data, error } = await client
      .rpc('exec_sql', {
        sql: `SELECT current_user, current_role, session_user;`
      });

    if (!error && data) {
      console.log('   Current database user context:', data[0]);
    }
  } catch (error) {
    console.log('   ❌ Cannot check user context:', error.message);
  }
}

advancedDiagnostics().catch(console.error);
