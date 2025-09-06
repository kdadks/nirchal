// Auth diagnostic script to check what authentication context we have
// Run this with: node auth-diagnostics.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthentication() {
  console.log('🔐 Testing Authentication Context...\n');

  try {
    // Try to sign in with a test user (you'll need to provide real credentials)
    console.log('1. Attempting to sign in...');
    
    // Replace with actual admin credentials
    const email = 'your-admin@email.com'; // YOU NEED TO CHANGE THIS
    const password = 'your-password'; // YOU NEED TO CHANGE THIS
    
    if (email === 'your-admin@email.com') {
      console.log('⚠️  Please update the email and password in auth-diagnostics.js');
      console.log('   Set your actual admin credentials to test authentication');
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.log('❌ Sign in failed:', authError.message);
      return;
    }

    console.log('✅ Sign in successful!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    console.log('   Role:', authData.user.role || 'No role in user object');
    console.log('');

    // Check JWT token
    console.log('2. JWT Token Analysis:');
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      const token = session.data.session.access_token;
      
      // Decode JWT (just the payload part)
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      
      console.log('✅ JWT Payload:');
      console.log('   sub (user_id):', payload.sub);
      console.log('   email:', payload.email);
      console.log('   role:', payload.role || 'No role in JWT');
      console.log('   aud:', payload.aud);
      console.log('   iss:', payload.iss);
      
      // Check for admin-related claims
      const adminClaims = Object.keys(payload).filter(key => 
        key.toLowerCase().includes('admin') || 
        key.toLowerCase().includes('role')
      );
      console.log('   Admin-related claims:', adminClaims.length > 0 ? adminClaims : 'None found');
      console.log('');
    }

    // Test the actual logistics partners operation
    console.log('3. Testing logistics partners update (authenticated):');
    
    // Get an existing logistics partner
    const { data: partners, error: fetchError } = await supabase
      .from('logistics_partners')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.log('❌ Could not fetch logistics partner:', fetchError.message);
      return;
    }

    if (!partners || partners.length === 0) {
      console.log('❌ No logistics partners found to test with');
      return;
    }

    const partner = partners[0];
    console.log('   Testing with partner:', partner.name, '(ID:', partner.id + ')');

    // Try to update it
    const { data: updateData, error: updateError } = await supabase
      .from('logistics_partners')
      .update({ 
        description: 'Updated by auth diagnostic - ' + new Date().toISOString() 
      })
      .eq('id', partner.id)
      .select();

    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
      console.log('   Code:', updateError.code);
      console.log('   Details:', updateError.details);
      console.log('   Hint:', updateError.hint);
    } else {
      console.log('✅ Update successful!');
      console.log('   Updated record:', updateData[0]?.id);
      
      // Revert the change
      await supabase
        .from('logistics_partners')
        .update({ description: partner.description })
        .eq('id', partner.id);
      console.log('   ✅ Reverted test change');
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('\n✅ Signed out successfully');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testAuthentication().catch(console.error);
