#!/usr/bin/env node

/**
 * Seed Database with Dummy Complaints and Documents
 * Creates 10-12 complaints per department with RTI forms and documents in PDF format
 * With varying severity levels (High, Medium, Low)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const COMPLAINT_TITLES = {
  high: [
    'Severe water contamination in residential area',
    'Illegal construction threatening public safety',
    'Environmental pollution from factory',
    'Unauthorized commercial activity',
    'Safety hazard in public facility'
  ],
  medium: [
    'Pothole damage on main road',
    'Streetlight malfunction affecting safety',
    'Garbage collection not scheduled',
    'Traffic signal not working properly',
    'Maintenance issue in park'
  ],
  low: [
    'Minor documentation update needed',
    'Information request about services',
    'General inquiry about process',
    'Feedback on service quality',
    'Request for administrative clarification'
  ]
};

const COMPLAINT_DESCRIPTIONS = {
  high: [
    'Significant water quality issues detected. Multiple households affected. Health risk identified. Immediate action required.',
    'Illegal structure being erected in restricted zone. Safety violations observed. Immediate demolition needed.',
    'Factory emissions causing air pollution. Residents complaining of respiratory issues. Environmental standards violated.',
    'Commercial activities being conducted in residential area without permits. Violates zoning laws. Police notification needed.',
    'Critical safety hazard in public facility. Multiple incidents reported. Structural integrity compromised.'
  ],
  medium: [
    'Large pothole on central road causing vehicle damage. Traffic flow affected. Repair contractor needed.',
    'Street lights not functioning for past 2 weeks. Safety concerns at night. Maintenance request filed.',
    'Garbage collection missed twice this month. Unhygienic conditions. Sanitation department notified.',
    'Traffic signal at main intersection malfunctioning. Causing traffic congestion during peak hours.',
    'Park maintenance inadequate. Broken equipment not repaired. Safety concerns for children.'
  ],
  low: [
    'Need to update name in citizen record. Documents submitted and verified. Processing needed.',
    'Inquiry about available services in the area. Want information about government schemes.',
    'Question about complaint filing procedure. Need guidance on next steps for another matter.',
    'Positive feedback about quick resolution of previous complaint. Appreciated staff cooperation.',
    'Need clarification on document requirements for future complaint filing.'
  ]
};

const COMPLAINT_CATEGORIES = [
  'Infrastructure', 'Environment', 'Safety', 'Services', 'Administration',
  'Traffic', 'Public Health', 'Utilities', 'Governance', 'Civic'
];

// Generate RTI PDF
function generateRTIPdf(complaintTitle, department, referenceId, citizenName, phone, address) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('RTI APPLICATION', { align: 'center' });
    doc.moveDown(0.5);

    // Date and Reference
    doc.fontSize(10).font('Helvetica').text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.text(`Reference ID: ${referenceId}`, { align: 'right' });
    doc.moveDown(1);

    // From section
    doc.fontSize(11).font('Helvetica-Bold').text('From');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Applicant's name: ${citizenName}`);
    doc.text(`Address: ${address}`);
    doc.text(`Mobile: ${phone}`);
    doc.moveDown(1);

    // To section
    doc.fontSize(11).font('Helvetica-Bold').text('To');
    doc.fontSize(10).font('Helvetica');
    doc.text('The Public Information Officer');
    doc.text(department);
    doc.text('Government Office');
    doc.moveDown(1);

    // Subject
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Sub: Requesting to furnish information about ${complaintTitle}`, { width: 450, align: 'left' });
    doc.moveDown(1);

    // Main content
    doc.fontSize(10).font('Helvetica');
    doc.text('Kindly supply the certified copies in the format convenient to you from the date of complaint filed:', { align: 'left' });
    doc.moveDown(0.5);

    doc.fontSize(9);
    doc.list([
      'Action Taken Report (ATR) on the complaint described',
      'Name and designation of the officer(s) responsible for handling this complaint',
      'Expected timeline for resolution and final status',
      'Details of all communications sent/received regarding this complaint',
      'Reason(s) for any delay in addressing this complaint, if applicable',
      'Cost estimate for obtaining the certified copies'
    ]);

    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Bold').text('Complaint Context:');
    doc.fontSize(9).font('Helvetica');
    doc.text(complaintTitle, { width: 450, align: 'left' });

    doc.moveDown(2);
    doc.text('If the above asked information is not available in your office, kindly forward my application to the concerned public authority, as per Section 6(3) of RTI Act 2005', { fontSize: 9, width: 450 });

    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold').text('Applicant Name: ' + citizenName);
    doc.fontSize(10).font('Helvetica').text('Signature: _______________________');
    doc.text('Date: _______________________');

    doc.moveDown(1);
    doc.fontSize(8).font('Helvetica-Oblique').text('This RTI form is auto-generated by NyaySathi and may be printed and submitted to the Public Information Officer. Please retain a copy for your records.', { align: 'center', width: 450 });

    doc.end();
  });
}

// Generate Complaint Form PDF
function generateComplaintFormPdf(referenceId, citizenName, phone, address, complaintTitle, category, description, department) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('FORMAL COMPLAINT DRAFT', { align: 'center' });
    doc.moveDown(0.5);

    // Complaint ID and Date
    doc.fontSize(10).font('Helvetica');
    doc.text(`Complaint ID: ${referenceId}`);
    doc.text(`Date Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    // Applicant Details
    doc.fontSize(11).font('Helvetica-Bold').text('Applicant Details:');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${citizenName}`);
    doc.text(`Email: complaint@nyaysathi.com`);
    doc.text(`Phone: ${phone}`);
    doc.text(`Location: ${address}`);
    doc.moveDown(1);

    // Department
    doc.fontSize(11).font('Helvetica-Bold').text('Department:');
    doc.fontSize(10).font('Helvetica').text(department);
    doc.moveDown(1);

    // Formal Complaint
    doc.fontSize(11).font('Helvetica-Bold').text('Formal Complaint:');
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica-Bold').text(`Category: ${category}`);
    doc.fontSize(10).font('Helvetica').text(`Priority: HIGH`);
    doc.moveDown(1);

    // Subject
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Subject: ${complaintTitle}`, { width: 450, align: 'left' });
    doc.moveDown(0.5);

    // Description
    doc.fontSize(10).font('Helvetica');
    doc.text('Complaint Details:', { underline: true });
    doc.text(description, { width: 450, align: 'left' });
    doc.moveDown(1);

    // Action Requested
    doc.fontSize(10).font('Helvetica-Bold').text('Requested Action:');
    doc.fontSize(10).font('Helvetica').text('Please investigate this issue, take corrective action at the earliest, and provide a written status update.', { width: 450 });

    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold').text('Applicant Name: ' + citizenName);
    doc.fontSize(10).font('Helvetica').text('Signature: _______________________');
    doc.text('Date: _______________________');

    doc.moveDown(1);
    doc.fontSize(8).font('Helvetica-Oblique').text('This document is auto-generated by NyaySathi. Please review and make any necessary edits before submission.', { align: 'center', width: 450 });

    doc.end();
  });
}

function getRandomSeverity() {
  const severities = ['high', 'medium', 'low'];
  return severities[Math.floor(Math.random() * severities.length)];
}

async function seedComplaints() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Step 1: Get all departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('is_active', true);

    if (deptError) {
      console.error('❌ Error fetching departments:', deptError);
      return;
    }

    if (!departments || departments.length === 0) {
      console.error('❌ No active departments found. Please create departments first.');
      return;
    }

    console.log(`📋 Found ${departments.length} active departments\n`);

    // Step 2: Get a sample citizen user (first user)
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users?.users?.length) {
      console.error('❌ No users found. Please create users first.');
      return;
    }

    const citizenUser = users.users[0];
    console.log(`👤 Using citizen user: ${citizenUser.email}\n`);

    let totalComplaintsCreated = 0;

    // Step 3: For each department, create 10-12 complaints
    for (const dept of departments) {
      const complaintCount = Math.floor(Math.random() * 3) + 10; // 10-12 complaints
      console.log(`\n📝 Creating ${complaintCount} complaints for department: ${dept.name}`);

      for (let i = 0; i < complaintCount; i++) {
        const severity = getRandomSeverity();
        const titleIndex = Math.floor(Math.random() * COMPLAINT_TITLES[severity].length);
        const descIndex = Math.floor(Math.random() * COMPLAINT_DESCRIPTIONS[severity].length);

        const title = COMPLAINT_TITLES[severity][titleIndex];
        const description = COMPLAINT_DESCRIPTIONS[severity][descIndex];
        const category = COMPLAINT_CATEGORIES[Math.floor(Math.random() * COMPLAINT_CATEGORIES.length)];

        // Create complaint
        const { data: complaint, error: complaintError } = await supabase
          .from('complaints')
          .insert({
            user_id: citizenUser.id,
            department_id: dept.id,
            title,
            description,
            category,
            priority: severity,
            status: ['new', 'pending', 'in_progress', 'resolved'][Math.floor(Math.random() * 4)],
            citizen_name: `Citizen ${i + 1}`,
            citizen_phone: `98${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`,
            location: `${dept.name} Area`,
            summary: description.substring(0, 100),
            progress_percentage: Math.floor(Math.random() * 100),
            sla_days: 30,
            submitted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (complaintError) {
          console.error(`   ❌ Error creating complaint: ${complaintError.message}`);
          continue;
        }

        // Generate reference ID
        const referenceId = `Ref-${new Date().getFullYear()}-${String(complaint.id).substring(0, 6).toUpperCase().replace(/-/g, '')}`;

        // Update complaint with reference ID
        await supabase
          .from('complaints')
          .update({ reference_id: referenceId })
          .eq('id', complaint.id);

        // Create RTI PDF and upload to storage
        const rtiPdfBuffer = await generateRTIPdf(title, dept.name, referenceId, `Citizen ${i + 1}`, `98${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`, `${dept.name} Area`);
        const rtiPdfPath = `complaints/${complaint.id}/rti/${referenceId}-rti.pdf`;
        
        const { error: rtiUploadError } = await supabase.storage
          .from('complaint-documents')
          .upload(rtiPdfPath, rtiPdfBuffer, {
            contentType: 'application/pdf',
            upsert: false
          });

        let rtiPublicUrl = null;
        if (!rtiUploadError) {
          const { data: rtiUrlData } = supabase.storage
            .from('complaint-documents')
            .getPublicUrl(rtiPdfPath);
          rtiPublicUrl = rtiUrlData?.publicUrl;
          
          await supabase
            .from('complaint_documents')
            .insert({
              complaint_id: complaint.id,
              document_type: 'rti_pdf',
              file_name: `RTI_${referenceId}.pdf`,
              storage_path: rtiPdfPath,
              public_url: rtiPublicUrl,
              staff_id: null
            });
        }

        // Create Complaint Form PDF and upload to storage
        const complaintFormBuffer = await generateComplaintFormPdf(referenceId, `Citizen ${i + 1}`, `98${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`, `${dept.name} Area`, title, category, description, dept.name);
        const complaintFormPath = `complaints/${complaint.id}/forms/${referenceId}-form.pdf`;
        
        const { error: formUploadError } = await supabase.storage
          .from('complaint-documents')
          .upload(complaintFormPath, complaintFormBuffer, {
            contentType: 'application/pdf',
            upsert: false
          });

        let formPublicUrl = null;
        if (!formUploadError) {
          const { data: formUrlData } = supabase.storage
            .from('complaint-documents')
            .getPublicUrl(complaintFormPath);
          formPublicUrl = formUrlData?.publicUrl;
          
          await supabase
            .from('complaint_documents')
            .insert({
              complaint_id: complaint.id,
              document_type: 'complaint_form',
              file_name: `Complaint_Form_${referenceId}.pdf`,
              storage_path: complaintFormPath,
              public_url: formPublicUrl,
              staff_id: null
            });
        }

        console.log(`   ✅ Created complaint #${i + 1}: ${title.substring(0, 40)}... [${severity.toUpperCase()}]`);
        totalComplaintsCreated++;
      }
    }

    console.log(`\n\n✅ SEEDING COMPLETE!`);
    console.log(`📊 Total complaints created: ${totalComplaintsCreated}`);
    console.log(`📄 With RTI drafts and complaint forms for each`);
    console.log(`\n🎯 Next steps:`);
    console.log(`   1. Go to http://localhost:5173/admin/dashboard`);
    console.log(`   2. View "Daily Reports" to see all complaints`);
    console.log(`   3. Click on any case to view documents and forms\n`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the seeding
seedComplaints();
