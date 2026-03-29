import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : supabase;

async function seedStaffAssignments() {
  console.log('========================================');
  console.log('🌱 Seeding Staff Assignments');
  console.log('========================================\n');

  try {
    // Step 1: Get staff
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('department_staff')
      .select('id, username, admin_id, department_id')
      .eq('username', 'staff')
      .single();

    if (staffError || !staff) {
      console.error('❌ Staff not found:', staffError?.message);
      return;
    }

    console.log('✅ Found staff:', staff.username, 'ID:', staff.id);

    // Step 2: Get complaints
    const { data: complaints, error: complaintsError } = await supabaseAdmin
      .from('complaints')
      .select('id, reference_id, title')
      .limit(5);

    if (complaintsError || !complaints || complaints.length === 0) {
      console.error('❌ No complaints found:', complaintsError?.message);
      console.log('💡 Note: Create complaints in admin panel first');
      return;
    }

    console.log(`✅ Found ${complaints.length} complaints`);

    // Step 3: Assign complaints to staff
    console.log('\n📝 Creating staff assignments...');
    const assignments = complaints.map(complaint => ({
      complaint_id: complaint.id,
      staff_id: staff.id,
      admin_id: staff.admin_id, // Use the staff's assigned admin
      department_id: staff.department_id, // Use the staff's department
      status: 'active',
      assignment_notes: `Assigned for processing - ${new Date().toLocaleDateString()}`,
      assigned_at: new Date().toISOString()
    }));

    const { data: created, error: insertError } = await supabaseAdmin
      .from('staff_assignments')
      .insert(assignments)
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.error('Details:', insertError);
      return;
    }

    console.log(`✅ Created ${created.length} assignments:\n`);
    created.forEach((assignment, i) => {
      const complaint = complaints[i];
      console.log(`  ${i + 1}. Assignment ID: ${assignment.id}`);
      console.log(`     Staff: ${staff.username}`);
      console.log(`     Complaint: ${complaint.reference_id} - ${complaint.title}`);
      console.log(`     Status: ${assignment.status}\n`);
    });

    // Step 4: Verify assignments
    console.log('📋 Verifying assignments...');
    const { data: verified, error: verifyError } = await supabaseAdmin
      .from('staff_assignments')
      .select(`
        id,
        staff_id,
        complaint_id,
        status,
        complaints (id, reference_id, title)
      `)
      .eq('staff_id', staff.id);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return;
    }

    console.log(`✅ Verified: Staff has ${verified.length} assignments\n`);

    console.log('========================================');
    console.log('✅ STAFF ASSIGNMENTS SEEDED SUCCESSFULLY');
    console.log('========================================\n');
    console.log('📌 Next steps:');
    console.log('1. Go to http://localhost:5173/staff/login');
    console.log('2. Login with: staff / test123');
    console.log('3. You should now see complaints in dashboard');
    console.log('4. Click on a complaint to view details\n');

  } catch (err) {
    console.error('\n❌ UNEXPECTED ERROR:', err.message);
    console.error('Stack:', err.stack);
  }
}

seedStaffAssignments();
