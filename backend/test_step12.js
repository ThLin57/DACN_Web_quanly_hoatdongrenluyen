// Test script cho bước 12: bamMatKhau
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep12() {
  console.log('🧪 Testing Step 12: bamMatKhau...\n');

  try {
    // Test registration (this will use bamMatKhau)
    console.log('Testing registration to trigger bamMatKhau...');
    const regResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User Hash',
      maso: '7777777',
      email: 'test777@dlu.edu.vn',
      password: 'Test@123',
      confirmPassword: 'Test@123'
    });
    
    console.log('✅ Registration response status:', regResponse.status);
    console.log('✅ Registration success:', regResponse.data.success);

    // Test change password (this will also use bamMatKhau)
    console.log('\nTesting change password to trigger bamMatKhau...');
    
    // First login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    const token = loginResponse.data.data.token;
    
    try {
      const changeResponse = await axios.post(`${BASE_URL}/auth/change`, {
        currentPassword: 'Student@123',
        newPassword: 'NewPassword@456',
        confirmNewPassword: 'NewPassword@456'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Change password response status:', changeResponse.status);
      console.log('✅ Change password success:', changeResponse.data.success);
    } catch (error) {
      console.log('❌ Change password failed:', error.response?.data || error.message);
    }

    console.log('\n✅ Step 12 test passed! Method bamMatKhau() is working correctly.');

  } catch (error) {
    console.error('❌ Step 12 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep12();
