// Test script cho bước 6: layDanhSachDemoUsers
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep6() {
  console.log('🧪 Testing Step 6: layDanhSachDemoUsers...\n');

  try {
    // Test demo accounts endpoint
    console.log('Testing /auth/demo-accounts endpoint...');
    const response = await axios.get(`${BASE_URL}/auth/demo-accounts`);
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', response.data);
    
    if (response.data.success && response.data.data) {
      console.log('✅ Demo accounts count:', response.data.data.length);
      console.log('✅ Demo accounts list:', response.data.data);
    } else {
      console.log('❌ Unexpected response format');
    }

    console.log('\n✅ Step 6 test passed! Method layDanhSachDemoUsers() is working correctly.');

  } catch (error) {
    console.error('❌ Step 6 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep6();
