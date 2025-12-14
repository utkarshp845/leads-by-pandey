/**
 * Script to create a test user in Supabase database
 * 
 * Usage:
 * 1. Set up Supabase and add env vars to .env
 * 2. Run: npx tsx scripts/create-test-user.ts
 * 
 * Or run directly with Node:
 * node -r ts-node/register scripts/create-test-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user credentials
const TEST_USER = {
  email: 'test@leadsbypandey.com',
  name: 'Test User',
  password: 'Test123!@#', // Change this if you want
};

async function createTestUser() {
  console.log('Creating test user in Supabase...\n');

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', TEST_USER.email)
      .single();

    if (existingUser && !checkError) {
      console.log('Test user already exists!');
      console.log(`   Email: ${TEST_USER.email}`);
      console.log(`   ID: ${existingUser.id}\n`);
      console.log('To create a new test user, delete the existing one first or use a different email.');
      return;
    }

    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
    console.log('Password hashed\n');

    // Create user
    const userId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const createdAt = new Date().toISOString();

    console.log('Inserting user into database...');
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: TEST_USER.email,
        name: TEST_USER.name,
        password_hash: passwordHash,
        created_at: createdAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      console.error('   Details:', error.message);
      process.exit(1);
    }

    console.log('Test user created successfully!\n');
    console.log('Test User Credentials:');
    console.log('   Email:', TEST_USER.email);
    console.log('   Password:', TEST_USER.password);
    console.log('   Name:', TEST_USER.name);
    console.log('   User ID:', userId);
    console.log('\nYou can now use these credentials to log in to your application!');
    console.log('   URL: https://leads.pandeylabs.com/login\n');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
createTestUser();

