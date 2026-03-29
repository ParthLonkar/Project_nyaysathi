/**
 * Test script to diagnose file upload issues
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE_URL = 'http://localhost:3000/api';
const STAFF_TOKEN = 'your_staff_token_here'; // Replace with actual token
const COMPLAINT_ID = 'a1455a9a-611c-4b52-b350-9b2a73032a15';

async function testFileUpload() {
  try {
    console.log('🧪 Starting file upload test...\n');

    // 1. Check if backend is running
    console.log('1️⃣ Checking backend health...');
    try {
      const healthResponse = await fetch('http://localhost:3000/health');
      console.log('✅ Backend is running');
      console.log('   Response:', await healthResponse.json());
    } catch (err) {
      console.error('❌ Backend is NOT running at http://localhost:3000');
      console.error('   Error:', err.message);
      process.exit(1);
    }

    // 2. Create a test file
    console.log('\n2️⃣ Creating test file...');
    const testFilePath = path.join(__dirname, 'test-evidence.txt');
    fs.writeFileSync(testFilePath, 'This is test evidence for the complaint.');
    console.log('✅ Created test file:', testFilePath);

    // 3. Test the upload endpoint
    console.log('\n3️⃣ Testing file upload endpoint...');
    console.log(`   Endpoint: POST ${API_BASE_URL}/staff/complaints/${COMPLAINT_ID}/upload-evidence`);
    console.log(`   Staff Token: ${STAFF_TOKEN ? '****' + STAFF_TOKEN.slice(-8) : 'MISSING'}`);

    const fileStream = fs.createReadStream(testFilePath);
    const formData = new FormData();
    formData.append('file', fileStream, 'test-evidence.txt');
    formData.append('fileType', 'evidence');

    const uploadResponse = await fetch(
      `${API_BASE_URL}/staff/complaints/${COMPLAINT_ID}/upload-evidence`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STAFF_TOKEN}`,
          ...formData.getHeaders()
        },
        body: formData
      }
    );

    console.log(`   Response Status: ${uploadResponse.status} ${uploadResponse.statusText}`);
    const responseData = await uploadResponse.json();
    console.log('   Response Data:', JSON.stringify(responseData, null, 2));

    if (!uploadResponse.ok) {
      console.error('❌ Upload failed!');
      console.error('   Details:', responseData);
    } else {
      console.log('✅ Upload successful!');
    }

    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log('\n4️⃣ Cleaned up test file');

  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testFileUpload();
