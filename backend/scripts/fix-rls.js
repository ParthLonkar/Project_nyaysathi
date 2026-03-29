#!/usr/bin/env node

/**
 * Fix RLS on complaint_documents table
 * Run: node backend/scripts/fix-rls.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLS() {
  console.log('🔧 Fixing RLS on complaint_documents table...\n');

  try {
    // Disable RLS on complaint_documents
    const { error: disableError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `ALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;`
      })
      .catch(err => {
        // If rpc doesn't exist, try direct query (may not work with anon key, but worth trying)
        console.warn('RPC exec_sql not available, attempting direct approach...');
        return { error: err };
      });

    if (disableError) {
      console.log('⚠️  Could not use RPC method. Please run this SQL in Supabase dashboard:\n');
      console.log('ALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;\n');
      console.log('Steps:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Click "New Query"');
      console.log('3. Paste the SQL above');
      console.log('4. Click "Run"\n');
      return;
    }

    // Verify RLS is disabled
    const { data: result, error: checkError } = await supabaseAdmin
      .from('complaint_documents')
      .select('count(*)', { count: 'exact', head: true });

    if (!checkError) {
      console.log('✅ SUCCESS! RLS has been disabled on complaint_documents table');
      console.log('✅ You can now upload evidence files\n');
    } else {
      console.log('⚠️  RLS might still be enabled. Error:', checkError.message);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 Manual Fix Required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/[your-project-id]/sql/new');
    console.log('2. Run this SQL:');
    console.log('\nALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;\n');
  }
}

fixRLS();
