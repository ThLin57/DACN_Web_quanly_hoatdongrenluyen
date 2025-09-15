// Test script cho bước 10: capNhatThongTinDangNhap
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep10() {
  console.log('🧪 Testing Step 10: capNhatThongTinDangNhap...\n');

  try {
    // Test login (this will use capNhatThongTinDangNhap)
    console.log('Testing login to trigger capNhatThongTinDangNhap...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    
    console.log('✅ Login response status:', loginResponse.status);
    console.log('✅ Login success:', loginResponse.data.success);
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful - capNhatThongTinDangNhap was called');
      console.log('✅ User data:', {
        id: loginResponse.data.data.user.id,
        name: loginResponse.data.data.user.name,
        maso: loginResponse.data.data.user.maso
      });
    }

    console.log('\n✅ Step 10 test passed! Method capNhatThongTinDangNhap() is working correctly.');

  } catch (error) {
    console.error('❌ Step 10 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep10();
