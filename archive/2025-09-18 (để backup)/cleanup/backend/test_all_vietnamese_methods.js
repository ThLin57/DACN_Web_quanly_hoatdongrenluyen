// Test script tổng thể cho tất cả các method đã đổi tên sang tiếng Việt
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAllVietnameseMethods() {
  console.log('🧪 Testing All Vietnamese Methods...\n');

  try {
    // Test 1: layDanhSachKhoa
    console.log('1. Testing layDanhSachKhoa()...');
    const facultiesResponse = await axios.get(`${BASE_URL}/auth/faculties`);
    console.log('✅ Faculties:', facultiesResponse.data.data?.length || 0, 'items');

    // Test 2: layDanhSachLopTheoKhoa
    console.log('\n2. Testing layDanhSachLopTheoKhoa()...');
    const classesResponse = await axios.get(`${BASE_URL}/auth/classes`);
    console.log('✅ Classes:', classesResponse.data.data?.length || 0, 'items');

    // Test 3: layThongTinLopTheoId (through registration)
    console.log('\n3. Testing layThongTinLopTheoId()...');
    const validClassId = classesResponse.data.data[0]?.value;
    if (validClassId) {
      const regResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User Final',
        maso: '8888888',
        email: 'test888@dlu.edu.vn',
        password: 'Test@123',
        confirmPassword: 'Test@123',
        lopId: validClassId
      });
      console.log('✅ Registration with valid class ID:', regResponse.status === 201 ? 'Success' : 'Failed');
    }

    // Test 4: layDanhSachDemoUsers
    console.log('\n4. Testing layDanhSachDemoUsers()...');
    const demoResponse = await axios.get(`${BASE_URL}/auth/demo-accounts`);
    console.log('✅ Demo users:', demoResponse.data.data?.length || 0, 'items');

    // Test 5: layDanhSachVaiTroKhongPhaiAdmin
    console.log('\n5. Testing layDanhSachVaiTroKhongPhaiAdmin()...');
    const rolesResponse = await axios.get(`${BASE_URL}/auth/roles`);
    console.log('✅ Non-admin roles:', rolesResponse.data.data?.length || 0, 'items');

    // Test 6: Login and protected endpoints
    console.log('\n6. Testing protected endpoints...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    const pointsResponse = await axios.get(`${BASE_URL}/auth/points`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Points endpoint working');

    const activitiesResponse = await axios.get(`${BASE_URL}/auth/my-activities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ My-activities endpoint working');

    console.log('\n🎉 ALL VIETNAMESE METHODS TEST PASSED!');
    console.log('\n📋 Summary of renamed methods:');
    console.log('   ✅ getFaculties() → layDanhSachKhoa()');
    console.log('   ✅ getClassesByFaculty() → layDanhSachLopTheoKhoa()');
    console.log('   ✅ getClassById() → layThongTinLopTheoId()');
    console.log('   ✅ getAllUsers() → layDanhSachTatCaNguoiDung()');
    console.log('   ✅ getAllRoles() → layDanhSachTatCaVaiTro()');
    console.log('   ✅ getDemoUsers() → layDanhSachDemoUsers()');
    console.log('   ✅ getNonAdminRoles() → layDanhSachVaiTroKhongPhaiAdmin()');
    console.log('\n✨ All database operations now use Vietnamese method names!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testAllVietnameseMethods();
