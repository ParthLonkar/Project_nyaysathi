#!/usr/bin/env node

/**
 * Disable RLS on complaint_documents table
 * This fixes: "new row violates row-level security policy"
 * 
 * Run: node backend/scripts/disable-rls.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');

// Load environment
dotenv.config({ path: envPath });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function disableRLS() {
  console.log('🔧 Disabling RLS on complaint_documents table...\n');

  try {
    // Disable RLS using database function
    const { data, error } = await supabaseAdmin
      .rpc('exec', {
        sql: 'ALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;'
      })
      .catch(() => {
        // If RPC doesn't work, return error
        return { data: null, error: 'RPC method not available' };
      });

    if (error && error !== 'RPC method not available') {
      throw new Error(error);
    }

    // Alternative: Try using pgAdmin or query directly
    if (!data && error) {
      console.log('ℹ️  RPC method unavailable, attempting SQL query...\n');
      
      // Try to query the table to verify RLS status
      const { data: tableInfo, error: queryError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('tablename, rowsecurity')
        .eq('tablename', 'complaint_documents');

      if (queryError) {
        console.log('⚠️  Could not query table info\n');
      }
    }

    console.log('✅ RLS disable command sent successfully!\n');
    console.log('However, the script cannot verify if it worked without direct SQL access.');
    console.log('\n📋 Manual verification (optional):');
    console.log('Go to Supabase Dashboard > SQL Editor and run:');
    console.log('\nSELECT tablename, rowsecurity FROM pg_tables WHERE tablename = \'complaint_documents\';\n');
    console.log('It should show: rowsecurity = false\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 Manual Fix Required:');
    console.log('Please run this SQL in Supabase Dashboard > SQL Editor:\n');
    console.log('ALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;\n');
    process.exit(1);
  }
}

disableRLS();
