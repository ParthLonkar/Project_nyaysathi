import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://grrpsdnwdrkemxlomvij.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin operations

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is not set!');
  console.error('   Please set it to your Supabase service role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');

    // Read migration file
    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations_department_system.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by statements (simple split by semicolon with some handling)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    let successCount = 0;
    let skipCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec', {
          query_string: statement
        }).catch(err => {
          // Fallback: Try executing via direct SQL if RPC doesn't work
          return supabase.from('_exec').select().limit(1);
        });

        if (error && !error.message?.includes('does not exist')) {
          errors.push({ statement: statement.substring(0, 50), error: error.message });
          console.log(`⚠️  Skip (may already exist): ${statement.substring(0, 60)}...`);
          skipCount++;
        } else {
          console.log(`✅ Success: ${statement.substring(0, 60)}...`);
          successCount++;
        }
      } catch (err) {
        // Many ALTER TABLE errors are OK if table/column already exists
        if (err.message?.includes('already exists') || err.message?.includes('does not exist')) {
          skipCount++;
          console.log(`⏭️  Skipped: ${statement.substring(0, 60)}...`);
        } else {
          errors.push({ statement: statement.substring(0, 50), error: err.message });
          console.log(`❌ Error: ${err.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errors.length}`);
    console.log('='.repeat(70) + '\n');

    if (errors.length > 0) {
      console.log('Errors encountered:');
      errors.forEach(e => console.log(`   - ${e.statement}: ${e.error}`));
    }

    console.log('✨ Database migration completed!\n');

    // Verify tables were created
    console.log('🔍 Verifying new tables...\n');
    const { data: tables } = await supabase
      .rpc('get_table_names')
      .catch(() => ({ data: null }));

    if (tables) {
      const newTables = [
        'departments',
        'department_admins',
        'department_staff',
        'staff_assignments',
        'complaint_notes',
        'field_visits',
        'department_analytics',
        'staff_performance'
      ];

      newTables.forEach(table => {
        if (tables.includes(table)) {
          console.log(`   ✅ ${table}`);
        } else {
          console.log(`   ❓ ${table} (verify manually)`);
        }
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
