/**
 * Seed realistic complaint data for the last 3 days
 * Ensures about 50 complaints per department with realistic distribution
 * across statuses and priorities for demo purposes
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

// Realistic distribution percentages
const statusDistribution = {
  'new': 0.20,           // 20% - newly received complaints
  'assigned': 0.15,      // 15% - assigned to staff
  'in_progress': 0.35,   // 35% - actively being worked on
  'resolved': 0.20,      // 20% - resolved
  'closed': 0.10,        // 10% - closed
};

const priorityDistribution = {
  'low': 0.30,           // 30% - low priority
  'medium': 0.50,        // 50% - medium priority
  'high': 0.20,          // 20% - high priority
};

const categoryDistribution = {
  'Police Harassment': 0.25,
  'Government Discrimination': 0.20,
  'Legal Documentation': 0.15,
  'Property Rights': 0.15,
  'Wrongful Arrest': 0.10,
  'Administrative Injustice': 0.10,
  'Other': 0.05,
};

const complaintTitles = {
  'Police Harassment': [
    'Excessive force during routine check',
    'Unlawful detention without warrant',
    'Verbal abuse by officer',
    'Illegal search of property',
    'Harassment during traffic stop',
  ],
  'Government Discrimination': [
    'Denial of government benefits',
    'Discriminatory treatment by officials',
    'Unfair denial of license',
    'Biased administrative decision',
    'Corruption in government office',
  ],
  'Legal Documentation': [
    'Delay in document issuance',
    'Incorrect legal certificate',
    'Birth certificate amendment issue',
    'Land deed discrepancy',
    'Marriage certificate error',
  ],
  'Property Rights': [
    'Boundary dispute with neighbor',
    'Illegal occupation of property',
    'Forced eviction',
    'Land acquisition injustice',
    'Property title fraud',
  ],
  'Wrongful Arrest': [
    'Arrest without proper charges',
    'Bail denial without reason',
    'Criminal case fabrication',
    'False accusation',
    'Custodial torture claim',
  ],
  'Administrative Injustice': [
    'Unfair pension denial',
    'Employment dispute',
    'Educational institution issue',
    'Tax assessment problem',
    'License suspension without notice',
  ],
};

const descriptions = [
  'The complainant alleges unjust treatment and seeks immediate resolution of this matter.',
  'This case requires urgent investigation and appropriate corrective measures.',
  'The incident occurred on the date mentioned and has caused significant distress.',
  'Multiple attempts to resolve this matter with the concerned authority have failed.',
  'The complainant is seeking proper compensation and preventive measures.',
  'This is a serious matter requiring high-level intervention and oversight.',
  'Documentation and evidence are attached for verification purposes.',
  'The complainant requests immediate action and status update on their case.',
];

async function getRandomStaffId(departmentId) {
  try {
    const { data } = await supabase
      .from('department_staff')
      .select('id')
      .eq('department_id', departmentId)
      .eq('is_active', true)
      .limit(1);
    
    if (data && data.length > 0) {
      return data[Math.floor(Math.random() * data.length)].id;
    }
  } catch (err) {
    console.error('Error fetching staff:', err.message);
  }
  return null;
}

function getRandomStatus() {
  const rand = Math.random();
  let cumulative = 0;
  for (const [status, percentage] of Object.entries(statusDistribution)) {
    cumulative += percentage;
    if (rand < cumulative) return status;
  }
  return 'new';
}

function getRandomPriority() {
  const rand = Math.random();
  let cumulative = 0;
  for (const [priority, percentage] of Object.entries(priorityDistribution)) {
    cumulative += percentage;
    if (rand < cumulative) return priority;
  }
  return 'medium';
}

function getRandomCategory() {
  const rand = Math.random();
  let cumulative = 0;
  for (const [category, percentage] of Object.entries(categoryDistribution)) {
    cumulative += percentage;
    if (rand < cumulative) return category;
  }
  return 'Other';
}

function getRandomTitle(category) {
  const titles = complaintTitles[category] || ['Unlawful treatment', 'Denial of rights', 'Government negligence', 'Procedural violation', 'Authority misconduct'];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getRandomDescription() {
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getRandomDateInLastThreeDays() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const randomTime = threeDaysAgo.getTime() + Math.random() * (now.getTime() - threeDaysAgo.getTime());
  return new Date(randomTime).toISOString();
}

function generateReferenceId() {
  const prefix = 'C';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

async function seedComplaintsForDepartment(departmentId, departmentName, complaintCount = 50) {
  console.log(`\n📝 Seeding ${complaintCount} complaints for department: ${departmentName}`);
  
  const complaints = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  for (let i = 0; i < complaintCount; i++) {
    const category = getRandomCategory();
    const status = getRandomStatus();
    const priority = getRandomPriority();
    const createdAt = getRandomDateInLastThreeDays();
    const staffId = await getRandomStaffId(departmentId);

    // Set resolved_at if status is resolved or closed
    let resolvedAt = null;
    if ((status === 'resolved' || status === 'closed') && Math.random() > 0.3) {
      const createdDate = new Date(createdAt);
      const resolutionTime = 1 + Math.random() * 5; // 1-5 days later
      resolvedAt = new Date(createdDate.getTime() + resolutionTime * 24 * 60 * 60 * 1000).toISOString();
    }

    complaints.push({
      reference_id: generateReferenceId(),
      department_id: departmentId,
      title: getRandomTitle(category),
      description: getRandomDescription(),
      category,
      status,
      priority,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
      resolved_at: resolvedAt,
      assigned_staff_id: staffId,
      user_id: `user-${departmentId}-${i}`,
      ai_analysis: {
        priority_score: Math.floor(Math.random() * 100),
        summary: `AI-generated summary for complaint: ${category}`,
        recommended_actions: ['Review documentation', 'Contact complainant', 'Investigate claim'],
        escalation_needed: priority === 'high',
        legal_analysis: `Legal analysis pending for ${category} case`,
      },
    });
  }

  try {
    // Insert complaints in batches
    const batchSize = 10;
    for (let i = 0; i < complaints.length; i += batchSize) {
      const batch = complaints.slice(i, i + batchSize);
      const { error } = await supabase
        .from('complaints')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} complaints)`);
      }
    }

    console.log(`✅ Successfully seeded ${complaints.length} complaints for ${departmentName}`);
    return { success: true, count: complaints.length };
  } catch (err) {
    console.error(`❌ Error seeding complaints for ${departmentName}:`, err.message);
    return { success: false, count: 0, error: err.message };
  }
}

async function main() {
  try {
    console.log('🚀 Starting complaint data seeding for 3-day report demo...\n');

    // Get all departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .limit(100);

    if (deptError) {
      console.error('❌ Error fetching departments:', deptError.message);
      return;
    }

    if (!departments || departments.length === 0) {
      console.error('❌ No departments found');
      return;
    }

    console.log(`Found ${departments.length} department(s)\n`);

    let totalComplaints = 0;
    const results = [];

    for (const dept of departments) {
      const result = await seedComplaintsForDepartment(dept.id, dept.name, 50);
      if (result.success) {
        totalComplaints += result.count;
        results.push({ department: dept.name, count: result.count, status: '✅' });
      } else {
        results.push({ department: dept.name, count: 0, status: '❌', error: result.error });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    results.forEach(r => {
      console.log(`${r.status} ${r.department}: ${r.count} complaints${r.error ? ` (${r.error})` : ''}`);
    });
    console.log(`\n📈 Total complaints seeded: ${totalComplaints}`);
    console.log('\n✅ Seeding complete! Your data is ready for the 3-day report demo.');
    console.log('\n💡 Next steps:');
    console.log('   1. Go to Admin Dashboard');
    console.log('   2. Navigate to "Daily Report" tab');
    console.log('   3. The report will show data from the last 3 days');
    console.log('   4. You can download the report as PDF\n');

  } catch (err) {
    console.error('❌ Fatal error:', err);
  }
}

main();
