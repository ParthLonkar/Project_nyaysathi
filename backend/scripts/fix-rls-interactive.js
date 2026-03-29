#!/usr/bin/env node

/**
 * Interactive RLS & Schema Fix for complaint_documents
 * Opens Supabase dashboard and prompts user to run comprehensive fix SQL
 */

import open from 'open';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SUPABASE_URL = process.env.SUPABASE_URL;

function extractProjectId(url) {
  // Extract from https://PROJECT_ID.supabase.co
  const match = url?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
  return match?.[1];
}

function loadSqlFix() {
  try {
    const sqlPath = path.join(__dirname, '../supabase/fix_complaint_documents_rls_complete.sql');
    return fs.readFileSync(sqlPath, 'utf-8');
  } catch (error) {
    console.error('❌ Could not load SQL fix file:', error.message);
    process.exit(1);
  }
}

async function showInstructions() {
  const projectId = extractProjectId(SUPABASE_URL);
  const sqlFix = loadSqlFix();
  
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║    FILE UPLOAD FIX: RLS & Schema Issues on complaint_documents      ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 COMPLETE FIX (2 minutes):\n');
  console.log('This will fix:');
  console.log('  ✅ Missing staff_id column in complaint_documents table');
  console.log('  ✅ Restrictive RLS policies preventing file uploads');
  console.log('  ✅ Staff member access control for documents\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('STEPS:\n');
  console.log('1️⃣  Go to Supabase Dashboard:');
  if (projectId) {
    console.log(`   https://app.supabase.com/project/${projectId}/sql/new\n`);
  } else {
    console.log('   https://app.supabase.com/dashboard/projects\n');
  }
  
  console.log('2️⃣  Click "SQL Editor" → "New Query" (top right)');
  console.log('3️⃣  Paste the SQL fix (will be copied to clipboard)');
  console.log('4️⃣  Click "Run" button');
  console.log('5️⃣  Wait for: "Query succeeded" (5-10 seconds)');
  console.log('6️⃣  Return here and press ENTER\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return new Promise((resolve) => {
    rl.question('Copy SQL fix to clipboard and open dashboard? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' && projectId) {
        console.log('\n📋 SQL fix copied! Opening Supabase dashboard...\n');
        
        // Copy SQL to clipboard (macOS)
        if (process.platform === 'darwin') {
          const proc = require('child_process').spawn('pbcopy');
          proc.stdin.write(sqlFix);
          proc.stdin.end();
        }
        
        await open(`https://app.supabase.com/project/${projectId}/sql/new`);
        
        rl.question('\n✅ After running the SQL in Supabase, press ENTER here: ', () => {
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('\n📌 NEXT STEPS:\n');
          console.log('1️⃣  Restart the backend server:');
          console.log('   cd /Users/kshitijdeshmukh/nyaysathi-ai/backend');
          console.log('   npm run dev\n');
          
          console.log('2️⃣  Test the fix:');
          console.log('   • Log in to http://localhost:5173 as a staff member');
          console.log('   • Go to a case details page');
          console.log('   • Try uploading evidence - should work! ✅\n');
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          rl.close();
          resolve();
        });
      } else if (answer.toLowerCase() === 'n') {
        console.log('\n⚠️  Manual fix required. See FILE_UPLOAD_COMPLETE_FIX.md for instructions.\n');
        rl.close();
        resolve();
      } else {
        console.log('\n❌ Invalid input. Please try again.\n');
        rl.close();
        resolve();
      }
    });
  });
}

showInstructions().catch(console.error);
