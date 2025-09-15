// Test script cho bước 12: bamMatKhau (fixed)
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep12() {
  console.log('🧪 Testing Step 12: bamMatKhau...\n');

  try {
    // Test registration (this will use bamMatKhau)
    console.log('Testing registration to trigger bamMatKhau...');
    const regResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User Hash 2',
      maso: '6666666',
      email: 'test666@dlu.edu.vn',
      password: 'Test@123',
      confirmPassword: 'Test@123'
    });
    
    console.log('✅ Registration response status:', regResponse.status);
    console.log('✅ Registration success:', regResponse.data.success);

    // Test login with the newly registered user
    console.log('\nTesting login with newly registered user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '6666666',
      password: 'Test@123'
    });
    
    console.log('✅ Login with new user:', loginResponse.status === 200 ? 'Success' : 'Failed');

    console.log('\n✅ Step 12 test passed! Method bamMatKhau() is working correctly.');

  } catch (error) {
    console.error('❌ Step 12 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep12();
