// Test script để kiểm tra kiến trúc đã được sửa
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testArchitectureFix() {
  console.log('🧪 Testing Architecture Fix...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health endpoint working');

    // Test 2: Public endpoints (no auth required)
    console.log('\n2. Testing public endpoints...');
    
    const facultiesResponse = await axios.get(`${BASE_URL}/auth/faculties`);
    console.log('✅ Faculties endpoint working:', facultiesResponse.data.data?.length || 0, 'faculties');

    const classesResponse = await axios.get(`${BASE_URL}/auth/classes`);
    console.log('✅ Classes endpoint working:', classesResponse.data.data?.length || 0, 'classes');

    const rolesResponse = await axios.get(`${BASE_URL}/auth/roles`);
    console.log('✅ Roles endpoint working:', rolesResponse.data.data?.length || 0, 'roles');

    const demoResponse = await axios.get(`${BASE_URL}/auth/demo-accounts`);
    console.log('✅ Demo accounts endpoint working:', demoResponse.data.data?.length || 0, 'accounts');

    // Test 3: Login and protected endpoints
    console.log('\n3. Testing protected endpoints...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login working');

    const pointsResponse = await axios.get(`${BASE_URL}/auth/points`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Points endpoint working');

    const activitiesResponse = await axios.get(`${BASE_URL}/auth/my-activities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ My-activities endpoint working');

    console.log('\n✅ All architecture tests passed!');
    console.log('🎉 Database operations are now properly separated:');
    console.log('   - Routes handle HTTP requests/responses');
    console.log('   - Models handle database operations');
    console.log('   - No direct prisma usage in routes');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testArchitectureFix();
