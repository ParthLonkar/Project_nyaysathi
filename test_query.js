import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvqnupltfpzgqzsdvrrr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cW51cGx0ZnB6Z3F6c2R2cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NDA0MDAsImV4cCI6MTkyNTI0MDQwMH0.t7CZvvdL5M72QSGJA0JwC0NQ9Q6sxPXaVgH6BfxC2CA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Checking staff_assignments...');
  const { data, error } = await supabase
    .from('staff_assignments')
    .select('complaint_id, staff_id, status')
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Staff assignments found:', data?.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

test();
