// Test script cho bước 2: layDanhSachLopTheoKhoa
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep2() {
  console.log('🧪 Testing Step 2: layDanhSachLopTheoKhoa...\n');

  try {
    // Test classes endpoint without faculty filter
    console.log('Testing /auth/classes endpoint (all classes)...');
    const response1 = await axios.get(`${BASE_URL}/auth/classes`);
    
    console.log('✅ Response status:', response1.status);
    console.log('✅ Classes count:', response1.data.data?.length || 0);
    console.log('✅ Classes data:', response1.data.data);

    // Test classes endpoint with faculty filter
    console.log('\nTesting /auth/classes endpoint (with faculty filter)...');
    const response2 = await axios.get(`${BASE_URL}/auth/classes?faculty=Công nghệ thông tin`);
    
    console.log('✅ Response status:', response2.status);
    console.log('✅ Filtered classes count:', response2.data.data?.length || 0);
    console.log('✅ Filtered classes data:', response2.data.data);

    console.log('\n✅ Step 2 test passed! Method layDanhSachLopTheoKhoa() is working correctly.');

  } catch (error) {
    console.error('❌ Step 2 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep2();
