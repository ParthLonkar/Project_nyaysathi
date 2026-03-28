import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from backend .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { authService } from '../src/services/auth.service.js';

async function testLogin() {
  try {
    console.log('🧪 Testing admin login with admin_mc / test123...\n');

    const result = await authService.loginAdmin('admin_mc', 'test123');

    if (result.success) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('Admin:', result.admin);
      console.log('Token:', result.token.substring(0, 50) + '...');
    } else {
      console.log('❌ LOGIN FAILED');
      console.log('Error:', result.error);
      console.log('Status:', result.statusCode);
    }
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testLogin();
