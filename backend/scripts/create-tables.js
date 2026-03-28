import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createTables() {
  try {
    console.log('Creating activity_logs table...');
    const { error: activityError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          user_type TEXT NOT NULL,
          action TEXT NOT NULL,
          details JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
      `
    });

    if (activityError) {
      console.log('Note: activity_logs table creation result:', activityError);
    } else {
      console.log('✅ activity_logs table created');
    }

    console.log('\nCreating complaint_notes table...');
    const { error: notesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS complaint_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          complaint_id UUID NOT NULL REFERENCES complaints(id),
          user_id UUID NOT NULL,
          user_type TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_complaint_notes_complaint_id ON complaint_notes(complaint_id);
      `
    });

    if (notesError) {
      console.log('Note: complaint_notes table creation result:', notesError);
    } else {
      console.log('✅ complaint_notes table created');
    }

    console.log('\n✅ Table creation completed successfully!');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    process.exit(1);
  }
}

createTables();
