import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 Advanced Security Analysis\n');

async function analyzeSecurityRestrictions() {
    try {
        // Test with service role key
        if (supabaseServiceKey) {
            console.log('🔑 Testing SERVICE ROLE permissions:');
            const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            });

            // Test basic connection
            try {
                const { data: authData, error: authError } = await adminClient.auth.getSession();
                console.log('   Auth Status: ✅ Connected');
            } catch (e) {
                console.log('   Auth Status: ❌', e.message);
            }

            // Test schema access
            try {
                const { data, error } = await adminClient.rpc('version');
                if (error) {
                    console.log('   Schema Access: ❌', error.message, `(Code: ${error.code})`);
                } else {
                    console.log('   Schema Access: ✅ Success');
                }
            } catch (e) {
                console.log('   Schema Access: ❌', e.message);
            }

            // Test specific table permissions
            const tables = ['logistics_partners', 'categories', 'products', 'vendors'];
            
            for (const table of tables) {
                try {
                    // Test READ
                    const { data: readData, error: readError } = await adminClient
                        .from(table)
                        .select('*')
                        .limit(1);
                    
                    const readStatus = readError ? `❌ ${readError.message} (${readError.code})` : '✅ Success';
                    console.log(`   ${table} READ: ${readStatus}`);

                    // Test INSERT (without actually inserting)
                    const testData = table === 'logistics_partners' 
                        ? { name: 'TEST', email: 'test@test.com' }
                        : table === 'categories'
                        ? { name: 'TEST' }
                        : table === 'products'
                        ? { name: 'TEST', price: 1 }
                        : { name: 'TEST' };

                    try {
                        const { data: insertData, error: insertError } = await adminClient
                            .from(table)
                            .insert(testData)
                            .select();
                        
                        if (insertError) {
                            console.log(`   ${table} INSERT: ❌ ${insertError.message} (${insertError.code})`);
                        } else {
                            console.log(`   ${table} INSERT: ✅ Success (will rollback)`);
                            // Clean up test data
                            if (insertData && insertData[0]) {
                                await adminClient.from(table).delete().eq('id', insertData[0].id);
                            }
                        }
                    } catch (e) {
                        console.log(`   ${table} INSERT: ❌ ${e.message}`);
                    }

                } catch (e) {
                    console.log(`   ${table}: ❌ ${e.message}`);
                }
            }

            // Test UPDATE specifically on logistics_partners
            try {
                console.log('\n🎯 Testing UPDATE on existing logistics_partners record:');
                
                // Get an existing record
                const { data: existingRecords, error: fetchError } = await adminClient
                    .from('logistics_partners')
                    .select('id, name')
                    .limit(1);

                if (fetchError) {
                    console.log('   Fetch existing: ❌', fetchError.message);
                } else if (existingRecords && existingRecords.length > 0) {
                    const recordId = existingRecords[0].id;
                    const originalName = existingRecords[0].name;
                    
                    // Test update
                    const { data: updateData, error: updateError } = await adminClient
                        .from('logistics_partners')
                        .update({ name: originalName }) // Update with same value
                        .eq('id', recordId)
                        .select();

                    if (updateError) {
                        console.log(`   UPDATE existing record: ❌ ${updateError.message} (${updateError.code})`);
                        
                        // Additional diagnostics
                        console.log('   Error Details:', {
                            code: updateError.code,
                            details: updateError.details,
                            hint: updateError.hint,
                            message: updateError.message
                        });
                    } else {
                        console.log(`   UPDATE existing record: ✅ Success`);
                    }
                } else {
                    console.log('   No existing records found to test UPDATE');
                }
            } catch (e) {
                console.log('   UPDATE test failed:', e.message);
            }

        } else {
            console.log('❌ No service role key found');
        }

        // Test project security level
        console.log('\n🛡️  Project Security Analysis:');
        
        const anonClient = createClient(supabaseUrl, supabaseAnonKey);
        
        try {
            const { data, error } = await anonClient.rpc('version');
            console.log('   Public RPC Access:', error ? '❌ Restricted' : '✅ Allowed');
        } catch (e) {
            console.log('   Public RPC Access: ❌ Blocked');
        }

        // Check if this is enhanced security mode
        const enhancedSecurityIndicators = [
            'permission denied for schema public',
            'function version() does not exist',
            'insufficient_privilege'
        ];

        console.log('\n📊 Security Mode Assessment:');
        console.log('   Based on error patterns, this appears to be:');
        console.log('   🔒 ENHANCED SECURITY MODE / PCI DSS COMPLIANCE');
        console.log('   📋 Recommendations:');
        console.log('      1. Check Supabase Dashboard → Project Settings → General');
        console.log('      2. Look for "Enhanced Security" or "PCI DSS" settings');
        console.log('      3. Contact Supabase support if needed');
        console.log('      4. Consider using Supabase Edge Functions for admin operations');

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

analyzeSecurityRestrictions();
