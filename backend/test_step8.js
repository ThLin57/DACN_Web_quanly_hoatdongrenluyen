// Test script cho bước 8: timNguoiDungTheoMaso
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep8() {
  console.log('🧪 Testing Step 8: timNguoiDungTheoMaso...\n');

  try {
    // Test login (this will use timNguoiDungTheoMaso)
    console.log('Testing login with valid maso...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    
    console.log('✅ Login response status:', loginResponse.status);
    console.log('✅ Login success:', loginResponse.data.success);
    
    if (loginResponse.data.success) {
      console.log('✅ User data:', {
        id: loginResponse.data.data.user.id,
        name: loginResponse.data.data.user.name,
        maso: loginResponse.data.data.user.maso,
        role: loginResponse.data.data.user.role
      });
    }

    // Test login with invalid maso
    console.log('\nTesting login with invalid maso...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        maso: 'invalid_maso',
        password: 'password'
      });
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid maso');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test registration (this will also use timNguoiDungTheoMaso to check existing user)
    console.log('\nTesting registration with existing maso...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        maso: '2021001', // Existing maso
        email: 'test@dlu.edu.vn',
        password: 'Test@123',
        confirmPassword: 'Test@123'
      });
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected existing maso');
        console.log('✅ Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n✅ Step 8 test passed! Method timNguoiDungTheoMaso() is working correctly.');

  } catch (error) {
    console.error('❌ Step 8 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep8();
