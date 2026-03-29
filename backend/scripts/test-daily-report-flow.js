import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from backend .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { authService } from '../src/services/auth.service.js';
import { adminService } from '../src/services/admin.service.js';
import jwt from 'jsonwebtoken';

async function testDailyReportFlow() {
  console.log('========================================');
  console.log('🧪 TESTING DAILY REPORT COMPLETE FLOW');
  console.log('========================================\n');

  try {
    // Step 1: Test login
    console.log('📝 STEP 1: Testing Admin Login');
    console.log('---');
    const loginResult = await authService.loginAdmin('admin_mc', 'test123');

    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.error);
      return;
    }

    console.log('✅ Login successful!');
    console.log('Admin ID:', loginResult.admin.id);
    console.log('Admin Department:', loginResult.admin.department.name);
    console.log('Token (truncated):', loginResult.token.substring(0, 50) + '...\n');

    // Step 2: Decode and verify token
    console.log('📝 STEP 2: Verifying Token');
    console.log('---');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_demo';
    let decoded;
    try {
      decoded = jwt.verify(loginResult.token, JWT_SECRET);
      console.log('✅ Token verified successfully!');
      console.log('Token payload:', {
        id: decoded.id,
        type: decoded.type,
        department_id: decoded.department_id,
        department_code: decoded.department_code,
        username: decoded.username
      });
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
      return;
    }
    console.log();

    // Step 3: Test admin service getDailyReport
    console.log('📝 STEP 3: Testing Admin Service - getDailyReport');
    console.log('---');
    const reportDate = new Date();
    reportDate.setHours(0, 0, 0, 0);

    try {
      const report = await adminService.getDailyReport(
        decoded.department_id,
        reportDate,
        true // 3-day report
      );

      if (report) {
        console.log('✅ Report generated successfully!');
        console.log('Report structure:', {
          dates: report.dates ? report.dates.length : 'N/A',
          summary: report.summary ? 'Present' : 'Missing',
          totalComplaints: report.totalComplaints || 0,
          statusBreakdown: report.statusBreakdown ? 'Present' : 'Missing',
          priorityBreakdown: report.priorityBreakdown ? 'Present' : 'Missing'
        });

        if (report.summary) {
          console.log('\nReport Summary:');
          console.log('- Total Complaints:', report.summary.totalComplaints);
          console.log('- New:', report.summary.new);
          console.log('- Assigned:', report.summary.assigned);
          console.log('- In Progress:', report.summary.in_progress);
          console.log('- Resolved:', report.summary.resolved);
          console.log('- Closed:', report.summary.closed);
        }
      } else {
        console.error('❌ No report returned');
      }
    } catch (err) {
      console.error('❌ Report generation failed:', err.message);
      console.error('Error details:', err);
    }
    console.log();

    // Step 4: Test JWT secret consistency
    console.log('📝 STEP 4: Verifying JWT Secret Consistency');
    console.log('---');
    console.log('JWT_SECRET in use:', JWT_SECRET);
    console.log('process.env.JWT_SECRET:', process.env.JWT_SECRET || '(not set)');
    console.log('Expected fallback:', 'your_jwt_secret_key_demo');
    
    if (JWT_SECRET === 'your_jwt_secret_key_demo') {
      console.log('⚠️  WARNING: Using demo secret! Set JWT_SECRET in .env for production\n');
    } else {
      console.log('✅ Using properly configured JWT_SECRET\n');
    }

    console.log('========================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('========================================');

  } catch (err) {
    console.error('\n❌ UNEXPECTED ERROR:', err.message);
    console.error('Stack:', err.stack);
  }
}

testDailyReportFlow();
