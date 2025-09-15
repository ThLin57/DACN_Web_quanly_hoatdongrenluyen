// Test script đơn giản để kiểm tra API
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testSimple() {
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health endpoint working:', healthResponse.data);

    console.log('\nTesting login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    console.log('\nTesting points endpoint...');
    const pointsResponse = await axios.get(`${BASE_URL}/auth/points`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Points endpoint working:', pointsResponse.data.success);

    console.log('\nTesting my-activities endpoint...');
    const activitiesResponse = await axios.get(`${BASE_URL}/auth/my-activities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ My-activities endpoint working:', activitiesResponse.data.success);

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testSimple();
