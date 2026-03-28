import dotenv from 'dotenv';

// Load environment variables FIRST before importing other modules
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createTestData() {
  try {
    console.log('🌱 Creating test data...\n');

    // 1. Get first department
    const { data: depts, error: deptsError } = await supabase
      .from('departments')
      .select('*')
      .limit(1);

    if (!depts || depts.length === 0) {
      console.log('❌ No departments found in database');
      console.log('Please ensure migrations are run in Supabase dashboard first.\n');
      process.exit(1);
    }

    const dept = depts[0];
    console.log(`✅ Using department: ${dept.name} (${dept.code})\n`);

    // 2. Hash test password
    const passwordHash = await bcrypt.hash('test123', 10);

    // 3. Create test admin
    console.log('📝 Creating test admin account...');
    const { data: admin, error: adminError } = await supabase
      .from('department_admins')
      .insert({
        admin_name: 'Test Admin',
        email: 'admin@test.local',
        phone: '9999999999',
        username: 'admin_mc',
        password_hash: passwordHash,
        department_id: dept.id,
        is_active: true
      })
      .select()
      .single();

    if (adminError) {
      console.log(`⚠️  Admin creation failed: ${adminError.message}`);
      if (adminError.code === '23505') {
        console.log('   (Username already exists)');
      }
    } else {
      console.log('✅ Created test admin');
      console.log('   Username: admin_mc');
      console.log('   Password: test123\n');
    }

    // 4. Create test staff
    console.log('📝 Creating test staff account...');
    const { data: staff, error: staffError } = await supabase
      .from('department_staff')
      .insert({
        staff_name: 'Test Field Officer',
        email: 'staff@test.local',
        phone: '8888888888',
        username: 'staff_mc_001',
        password_hash: passwordHash,
        department_id: dept.id,
        role: 'field_officer',
        is_active: true,
        assigned_area: 'Zone 1'
      })
      .select()
      .single();

    if (staffError) {
      console.log(`⚠️  Staff creation failed: ${staffError.message}`);
      if (staffError.code === '23505') {
        console.log('   (Username already exists)');
      }
    } else {
      console.log('✅ Created test staff');
      console.log('   Username: staff_mc_001');
      console.log('   Password: test123\n');
    }

    console.log('🎉 Setup complete!\n');
    console.log('You can now login with:');
    console.log('  🔑 Admin: admin_mc / test123');
    console.log('  🔑 Staff: staff_mc_001 / test123');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestData();
