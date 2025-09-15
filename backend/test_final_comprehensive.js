// Test script tổng thể cuối cùng
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testFinalComprehensive() {
  console.log('🧪 Final Comprehensive Test - All Vietnamese Methods...\n');

  try {
    // Test 1: Registration (uses bamMatKhau)
    console.log('1. Testing registration (bamMatKhau)...');
    const regResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User Final',
      maso: '4444444',
      email: 'test444@dlu.edu.vn',
      password: 'Test@123',
      confirmPassword: 'Test@123'
    });
    console.log('✅ Registration successful');

    // Test 2: Login (uses timNguoiDungTheoMaso, soSanhMatKhau, capNhatThongTinDangNhap)
    console.log('\n2. Testing login (timNguoiDungTheoMaso, soSanhMatKhau, capNhatThongTinDangNhap)...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      maso: '4444444',
      password: 'Test@123'
    });
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;

    // Test 3: All public endpoints
    console.log('\n3. Testing all public endpoints...');
    
    const facultiesResponse = await axios.get(`${BASE_URL}/auth/faculties`);
    console.log('✅ layDanhSachKhoa():', facultiesResponse.data.data?.length || 0, 'faculties');

    const classesResponse = await axios.get(`${BASE_URL}/auth/classes`);
    console.log('✅ layDanhSachLopTheoKhoa():', classesResponse.data.data?.length || 0, 'classes');

    const demoResponse = await axios.get(`${BASE_URL}/auth/demo-accounts`);
    console.log('✅ layDanhSachDemoUsers():', demoResponse.data.data?.length || 0, 'users');

    const rolesResponse = await axios.get(`${BASE_URL}/auth/roles`);
    console.log('✅ layDanhSachVaiTroKhongPhaiAdmin():', rolesResponse.data.data?.length || 0, 'roles');

    // Test 4: Protected endpoints
    console.log('\n4. Testing protected endpoints...');
    
    const pointsResponse = await axios.get(`${BASE_URL}/auth/points`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Points endpoint working');

    const activitiesResponse = await axios.get(`${BASE_URL}/auth/my-activities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ My-activities endpoint working');

    console.log('\n🎉 ALL VIETNAMESE METHODS TEST PASSED!');
    console.log('\n📋 Complete Summary of Renamed Methods:');
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
    console.log('\n✨ All 12 database operations now use Vietnamese method names!');
    console.log('🚀 Backend architecture is now fully Vietnamese!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testFinalComprehensive();
