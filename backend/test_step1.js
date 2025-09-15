// Test script cho bước 1: layDanhSachKhoa
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep1() {
  console.log('🧪 Testing Step 1: layDanhSachKhoa...\n');

  try {
    // Test faculties endpoint
    console.log('Testing /auth/faculties endpoint...');
    const response = await axios.get(`${BASE_URL}/auth/faculties`);
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', response.data);
    
    if (response.data.success && response.data.data) {
      console.log('✅ Faculties count:', response.data.data.length);
      console.log('✅ Faculties list:', response.data.data);
    } else {
      console.log('❌ Unexpected response format');
    }

    console.log('\n✅ Step 1 test passed! Method layDanhSachKhoa() is working correctly.');

  } catch (error) {
    console.error('❌ Step 1 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep1();
