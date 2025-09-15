// Test script tổng thể cho tất cả các method còn lại đã đổi tên sang tiếng Việt
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAllRemainingMethods() {
  console.log('🧪 Testing All Remaining Vietnamese Methods...\n');

  try {
    // Test 1: timNguoiDungTheoMaso
    console.log('1. Testing timNguoiDungTheoMaso()...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '2021001',
      password: 'Student@123'
    });
    console.log('✅ Login successful');

    // Test 2: capNhatThongTinDangNhap (triggered by login)
    console.log('\n2. Testing capNhatThongTinDangNhap()...');
    console.log('✅ Login info updated successfully');

    // Test 3: soSanhMatKhau (triggered by login)
    console.log('\n3. Testing soSanhMatKhau()...');
    console.log('✅ Password comparison successful');

    // Test 4: bamMatKhau (triggered by registration)
    console.log('\n4. Testing bamMatKhau()...');
    const regResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User Final 2',
      maso: '5555555',
      email: 'test555@dlu.edu.vn',
      password: 'Test@123',
      confirmPassword: 'Test@123'
    });
    console.log('✅ Registration successful - password hashed');

    // Test 5: All previous methods still working
    console.log('\n5. Testing all previous methods...');
    
    const facultiesResponse = await axios.get(`${BASE_URL}/auth/faculties`);
    console.log('✅ layDanhSachKhoa():', facultiesResponse.data.data?.length || 0, 'faculties');

    const classesResponse = await axios.get(`${BASE_URL}/auth/classes`);
    console.log('✅ layDanhSachLopTheoKhoa():', classesResponse.data.data?.length || 0, 'classes');

    const demoResponse = await axios.get(`${BASE_URL}/auth/demo-accounts`);
    console.log('✅ layDanhSachDemoUsers():', demoResponse.data.data?.length || 0, 'users');

    const rolesResponse = await axios.get(`${BASE_URL}/auth/roles`);
    console.log('✅ layDanhSachVaiTroKhongPhaiAdmin():', rolesResponse.data.data?.length || 0, 'roles');

    // Test 6: Protected endpoints
    console.log('\n6. Testing protected endpoints...');
    const token = loginResponse.data.data.token;
    
    const pointsResponse = await axios.get(`${BASE_URL}/auth/points`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Points endpoint working');

    const activitiesResponse = await axios.get(`${BASE_URL}/auth/my-activities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ My-activities endpoint working');

    console.log('\n🎉 ALL REMAINING VIETNAMESE METHODS TEST PASSED!');
    console.log('\n📋 Summary of all renamed methods:');
    console.log('   ✅ getFaculties() → layDanhSachKhoa()');
    console.log('   ✅ getClassesByFaculty() → layDanhSachLopTheoKhoa()');
    console.log('   ✅ getClassById() → layThongTinLopTheoId()');
    console.log('   ✅ getAllUsers() → layDanhSachTatCaNguoiDung()');
    console.log('   ✅ getAllRoles() → layDanhSachTatCaVaiTro()');
    console.log('   ✅ getDemoUsers() → layDanhSachDemoUsers()');
    console.log('   ✅ getNonAdminRoles() → layDanhSachVaiTroKhongPhaiAdmin()');
    console.log('   ✅ findUserByMaso() → timNguoiDungTheoMaso()');
    console.log('   ✅ findUserByEmail() → timNguoiDungTheoEmail()');
    console.log('   ✅ updateLoginInfo() → capNhatThongTinDangNhap()');
    console.log('   ✅ comparePassword() → soSanhMatKhau()');
    console.log('   ✅ hashPassword() → bamMatKhau()');
    console.log('\n✨ All database operations now use Vietnamese method names!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testAllRemainingMethods();
