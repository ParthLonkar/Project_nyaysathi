import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...\n');

    // 1. Get any department (or create MC if needed)
    let dept = null;
    const { data: depts, error: deptsError } = await supabase
      .from('departments')
      .select('*')
      .limit(1);

    if (depts && depts.length > 0) {
      dept = depts[0];
      console.log(`✅ Found department: ${dept.name} (code: ${dept.code})\n`);
    } else {
      console.log('⚠️  No departments found. Creating MC department...\n');
      
      const { data: newDept, error: createDeptError } = await supabase
        .from('departments')
        .insert([
          {
            name: 'Municipal Corporation',
            code: 'MC',
            email: 'admin@mc.local',
            phone: '1234567890',
            sla_days: 7
          }
        ])
        .select()
        .single();

      if (createDeptError) {
        console.error('❌ Error creating MC department:', createDeptError);
        process.exit(1);
      }

      dept = newDept;
      console.log(`✅ Created MC department (ID: ${dept.id})\n`);
    }

    // 2. Hash test password
    const testPassword = 'test123';
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // 3. Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('department_admins')
      .select('*')
      .eq('username', 'admin_mc')
      .single();

    if (!existingAdmin) {
      // 4. Create test admin
      const { data: admin, error: adminError } = await supabase
        .from('department_admins')
        .insert([
          {
            admin_name: 'Test Admin',
            email: 'admin@mc.local',
            phone: '9999999999',
            username: 'admin_mc',
            password_hash: passwordHash,
            department_id: dept.id,
            is_active: true
          }
        ])
        .select()
        .single();

      if (adminError) {
        console.error('❌ Error creating test admin:', adminError);
        process.exit(1);
      }

      console.log(`✅ Created test admin`);
      console.log(`   Username: admin_mc`);
      console.log(`   Password: test123\n`);
    } else {
      console.log(`✅ Test admin already exists (admin_mc)\n`);
    }

    // 5. Check if staff already exists
    const { data: existingStaff } = await supabase
      .from('department_staff')
      .select('*')
      .eq('username', 'staff_mc_001')
      .single();

    if (!existingStaff) {
      // 6. Create test staff
      const { data: staff, error: staffError } = await supabase
        .from('department_staff')
        .insert([
          {
            staff_name: 'Test Field Officer',
            email: 'staff@mc.local',
            phone: '8888888888',
            username: 'staff_mc_001',
            password_hash: passwordHash,
            department_id: dept.id,
            role: 'field_officer',
            is_active: true,
            assigned_area: 'Zone 1'
          }
        ])
        .select()
        .single();

      if (staffError) {
        console.error('❌ Error creating test staff:', staffError);
        process.exit(1);
      }

      console.log(`✅ Created test staff`);
      console.log(`   Username: staff_mc_001`);
      console.log(`   Password: test123\n`);
    } else {
      console.log(`✅ Test staff already exists (staff_mc_001)\n`);
    }

    console.log('🎉 Test data seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seedTestData();
