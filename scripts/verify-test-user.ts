/**
 * Script to verify test user exists in Supabase and check password
 * 
 * Usage: npm run verify-test-user
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_EMAIL = 'test@leadsbypandey.com';
const TEST_PASSWORD = 'Test123!@#';

async function verifyTestUser() {
  console.log('Verifying test user in Supabase...\n');

  try {
    // Check if user exists
    console.log(`Looking for user: ${TEST_EMAIL}`);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', TEST_EMAIL)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.error('User not found in database!');
        console.error('   Please run: npm run create-test-user');
        process.exit(1);
      }
      console.error('Error querying database:', error);
      process.exit(1);
    }

    if (!user) {
      console.error('User not found!');
      process.exit(1);
    }

    console.log('User found in database!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Created: ${user.created_at}\n`);

    // Verify password hash
    console.log('Verifying password...');
    const isValid = await bcrypt.compare(TEST_PASSWORD, user.password_hash);
    
    if (isValid) {
      console.log('Password is correct!');
      console.log('\nTest User Credentials:');
      console.log(`   Email: ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
      console.log('\nYou should be able to log in now!');
    } else {
      console.error('Password hash does not match!');
      console.error('   The password in the database does not match "Test123!@#"');
      console.error('   You may need to recreate the user with: npm run create-test-user');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

verifyTestUser();

