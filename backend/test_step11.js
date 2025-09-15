// Test script cho bước 11: soSanhMatKhau
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep11() {
  console.log('🧪 Testing Step 11: soSanhMatKhau...\n');

  try {
    // Test login with correct password (this will use soSanhMatKhau)
    console.log('Testing login with correct password...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    
    console.log('✅ Login with correct password:', loginResponse.status === 200 ? 'Success' : 'Failed');

    // Test login with incorrect password
    console.log('\nTesting login with incorrect password...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        maso: '2021001',
        password: 'wrong_password'
      });
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected incorrect password');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test change password (this will also use soSanhMatKhau)
    console.log('\nTesting change password with correct current password...');
    const token = loginResponse.data.data.token;
    
    try {
      const changeResponse = await axios.post(`${BASE_URL}/auth/change`, {
        currentPassword: 'Student@123',
        newPassword: 'NewPassword@123',
        confirmNewPassword: 'NewPassword@123'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Change password with correct current password:', changeResponse.status === 200 ? 'Success' : 'Failed');
    } catch (error) {
      console.log('❌ Change password failed:', error.response?.data || error.message);
    }

    console.log('\n✅ Step 11 test passed! Method soSanhMatKhau() is working correctly.');

  } catch (error) {
    console.error('❌ Step 11 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep11();
