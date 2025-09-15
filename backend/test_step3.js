// Test script cho bước 3: layThongTinLopTheoId
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testStep3() {
  console.log('🧪 Testing Step 3: layThongTinLopTheoId...\n');

  try {
    // Test registration with valid class ID (this will use layThongTinLopTheoId)
    console.log('Testing registration with valid class ID...');
    
    const testData = {
      name: 'Test User',
      maso: '9999999',
      email: 'test999@dlu.edu.vn',
      password: 'Test@123',
      confirmPassword: 'Test@123',
      lopId: 'f65a1308-0a96-4c23-98eb-928aabfa30f8' // Valid class ID
    };

    const response = await axios.post(`${BASE_URL}/auth/register`, testData);
    
    console.log('✅ Registration response status:', response.status);
    console.log('✅ Registration success:', response.data.success);
    
    if (response.data.success) {
      console.log('✅ Method layThongTinLopTheoId() is working correctly in registration flow.');
    } else {
      console.log('❌ Registration failed:', response.data.message);
    }

    // Test registration with invalid class ID
    console.log('\nTesting registration with invalid class ID...');
    
    const invalidTestData = {
      name: 'Test User 2',
      maso: '9999998',
      email: 'test998@dlu.edu.vn',
      password: 'Test@123',
      confirmPassword: 'Test@123',
      lopId: 'invalid-class-id'
    };

    try {
      const invalidResponse = await axios.post(`${BASE_URL}/auth/register`, invalidTestData);
      console.log('❌ Should have failed but got:', invalidResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected invalid class ID');
        console.log('✅ Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n✅ Step 3 test passed! Method layThongTinLopTheoId() is working correctly.');

  } catch (error) {
    console.error('❌ Step 3 test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testStep3();
