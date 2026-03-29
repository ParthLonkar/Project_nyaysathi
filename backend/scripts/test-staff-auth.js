import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { authService } from '../src/services/auth.service.js';
import { staffService } from '../src/services/staff.service.js';
import jwt from 'jsonwebtoken';

async function testStaffAuthentication() {
  console.log('========================================');
  console.log('🧪 TESTING STAFF AUTHENTICATION FLOW');
  console.log('========================================\n');

  try {
    // Step 1: Test staff login
    console.log('📝 STEP 1: Testing Staff Login');
    console.log('---');
    const loginResult = await authService.loginStaff('staff', 'test123');

    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.error);
      console.log('Status Code:', loginResult.statusCode);
      return;
    }

    console.log('✅ Staff login successful!');
    console.log('Staff ID:', loginResult.staff.id);
    console.log('Staff Name:', loginResult.staff.name);
    console.log('Staff Department:', loginResult.staff.department.name);
    console.log('Token (truncated):', loginResult.token.substring(0, 50) + '...\n');

    // Step 2: Verify token
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
        username: decoded.username
      });
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
      return;
    }
    console.log();

    // Step 3: Test getting assigned complaints
    console.log('📝 STEP 3: Testing Get Assigned Complaints');
    console.log('---');
    try {
      const result = await staffService.getAssignedComplaints(decoded.id);

      if (result.success) {
        console.log('✅ Fetched complaints successfully!');
        console.log('Number of complaints:', result.complaints.length);
        if (result.complaints.length > 0) {
          console.log('First complaint:', {
            id: result.complaints[0].complaint_id,
            title: result.complaints[0].complaints?.title || 'N/A',
            status: result.complaints[0].complaints?.status || 'N/A'
          });
        } else {
          console.log('ℹ️  No complaints assigned yet');
        }
      } else {
        console.error('❌ Failed to fetch complaints:', result.error);
      }
    } catch (err) {
      console.error('❌ Exception:', err.message);
    }
    console.log();

    // Step 4: Test staff token in headers
    console.log('📝 STEP 4: Token Configuration');
    console.log('---');
    console.log('JWT_SECRET in use:', JWT_SECRET);
    console.log('process.env.JWT_SECRET:', process.env.JWT_SECRET || '(not set)');
    
    if (JWT_SECRET === 'your_jwt_secret_key_demo') {
      console.log('⚠️  WARNING: Using demo secret! Set JWT_SECRET in .env for production\n');
    } else {
      console.log('✅ Using properly configured JWT_SECRET\n');
    }

    console.log('========================================');
    console.log('✅ STAFF AUTHENTICATION TESTS COMPLETED');
    console.log('========================================');

  } catch (err) {
    console.error('\n❌ UNEXPECTED ERROR:', err.message);
    console.error('Stack:', err.stack);
  }
}

testStaffAuthentication();
