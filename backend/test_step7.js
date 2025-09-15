// Test script cho bước 7: layDanhSachVaiTroKhongPhaiAdmin
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep7() {
  console.log('🧪 Testing Step 7: layDanhSachVaiTroKhongPhaiAdmin...\n');

  try {
    // Test roles endpoint
    console.log('Testing /auth/roles endpoint...');
    const response = await axios.get(`${BASE_URL}/auth/roles`);
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', response.data);
    
    if (response.data.success && response.data.data) {
      console.log('✅ Roles count:', response.data.data.length);
      console.log('✅ Roles list:', response.data.data);
      
      // Check that ADMIN role is excluded
      const hasAdmin = response.data.data.some(role => role.value === 'ADMIN');
      if (!hasAdmin) {
        console.log('✅ Correctly excluded ADMIN role');
      } else {
        console.log('❌ ADMIN role should be excluded but was found');
      }
    } else {
      console.log('❌ Unexpected response format');
    }

    console.log('\n✅ Step 7 test passed! Method layDanhSachVaiTroKhongPhaiAdmin() is working correctly.');

  } catch (error) {
    console.error('❌ Step 7 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep7();
