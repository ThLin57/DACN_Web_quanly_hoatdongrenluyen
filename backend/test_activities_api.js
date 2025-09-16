// Test script để kiểm tra API activities mới
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testActivitiesAPI() {
  console.log('🧪 Testing Activities API...\n');

  try {
    // Test 1: Login để lấy token
    console.log('1. Logging in as student...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful');
    console.log('User info:', {
      id: user.id,
      name: user.name,
      mssv: user.maso,
      role: user.role
    });

    // Test 2: Get all activities
    console.log('\n2. Getting all activities...');
    const activitiesResponse = await axios.get(`${BASE_URL}/auth/my-activities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const activitiesData = activitiesResponse.data.data;
    console.log('✅ Activities API working!');
    console.log('Activities data:', {
      total: activitiesData.total,
      activitiesCount: activitiesData.activities?.length || 0,
      byStatus: activitiesData.byStatus,
      studentInfo: activitiesData.studentInfo
    });

    if (activitiesData.activities && activitiesData.activities.length > 0) {
      console.log('\nFirst activity:', {
        name: activitiesData.activities[0].name,
        type: activitiesData.activities[0].type,
        status: activitiesData.activities[0].status,
        points: activitiesData.activities[0].points,
        semester: activitiesData.activities[0].semester,
        year: activitiesData.activities[0].year
      });
    }

    // Test 3: Get activities with filters
    console.log('\n3. Testing filters...');
    
    // Test semester filter
    const semesterResponse = await axios.get(`${BASE_URL}/auth/my-activities?semester=hoc_ky_1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Semester filter working:', semesterResponse.data.data.total, 'activities');

    // Test status filter
    const statusResponse = await axios.get(`${BASE_URL}/auth/my-activities?status=da_tham_gia`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Status filter working:', statusResponse.data.data.total, 'activities');

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testActivitiesAPI();
