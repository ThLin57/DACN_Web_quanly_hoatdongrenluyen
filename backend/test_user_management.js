const http = require('http');
const axios = require('axios');

// Configuration
const API_BASE = 'http://localhost:3001';
const TEST_USER = {
  ten_dn: 'test_user_profile',
  mat_khau: 'testpassword123',
  ho_ten: 'Nguyen Van Test',
  email: 'test@example.com',
  vai_tro: 'SINH_VIEN'
};

const ADMIN_USER = {
  ten_dn: 'admin',
  mat_khau: 'admin123'
};

let adminToken = '';
let userToken = '';
let createdUserId = '';

async function makeRequest(method, endpoint, data = null, token = '') {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

async function testAuth() {
  console.log('\n=== Testing Authentication ===');
  
  // 1. Test admin login
  console.log('1. Testing admin login...');
  const adminLogin = await makeRequest('POST', '/auth/login', ADMIN_USER);
  
  if (adminLogin.success) {
    adminToken = adminLogin.data.data?.token || adminLogin.data.token;
    console.log('✓ Admin login successful');
  } else {
    console.log('✗ Admin login failed:', adminLogin.error);
    return false;
  }

  return true;
}

async function testUserManagement() {
  console.log('\n=== Testing User Management ===');
  
  // 1. Test user creation
  console.log('1. Testing user creation...');
  const createUser = await makeRequest('POST', '/users', TEST_USER, adminToken);
  
  if (createUser.success) {
    createdUserId = createUser.data.data?.id || createUser.data.id;
    console.log('✓ User creation successful, ID:', createdUserId);
  } else {
    console.log('✗ User creation failed:', createUser.error);
    return false;
  }

  // 2. Test user list
  console.log('2. Testing user list...');
  const userList = await makeRequest('GET', '/users', null, adminToken);
  
  if (userList.success) {
    console.log('✓ User list retrieved successfully');
    console.log('  Total users:', userList.data.data?.length || 0);
  } else {
    console.log('✗ User list failed:', userList.error);
  }

  // 3. Test user by ID
  console.log('3. Testing get user by ID...');
  const getUserById = await makeRequest('GET', `/users/${createdUserId}`, null, adminToken);
  
  if (getUserById.success) {
    console.log('✓ Get user by ID successful');
    console.log('  User name:', getUserById.data.data?.ho_ten);
  } else {
    console.log('✗ Get user by ID failed:', getUserById.error);
  }

  return true;
}

async function testUserProfile() {
  console.log('\n=== Testing User Profile ===');
  
  // 1. Test user login
  console.log('1. Testing user login...');
  const userLogin = await makeRequest('POST', '/auth/login', {
    ten_dn: TEST_USER.ten_dn,
    mat_khau: TEST_USER.mat_khau
  });
  
  if (userLogin.success) {
    userToken = userLogin.data.data?.token || userLogin.data.token;
    console.log('✓ User login successful');
  } else {
    console.log('✗ User login failed:', userLogin.error);
    return false;
  }

  // 2. Test get profile
  console.log('2. Testing get profile...');
  const getProfile = await makeRequest('GET', '/users/profile', null, userToken);
  
  if (getProfile.success) {
    console.log('✓ Get profile successful');
    console.log('  Profile name:', getProfile.data.data?.ho_ten);
  } else {
    console.log('✗ Get profile failed:', getProfile.error);
  }

  // 3. Test update profile
  console.log('3. Testing update profile...');
  const updateData = {
    ho_ten: 'Nguyen Van Test Updated',
    email: 'test_updated@example.com'
  };
  
  const updateProfile = await makeRequest('PUT', '/users/profile', updateData, userToken);
  
  if (updateProfile.success) {
    console.log('✓ Update profile successful');
  } else {
    console.log('✗ Update profile failed:', updateProfile.error);
  }

  // 4. Test change password
  console.log('4. Testing change password...');
  const changePassword = await makeRequest('PUT', '/users/change-password', {
    old_password: TEST_USER.mat_khau,
    new_password: 'newpassword123',
    confirm_password: 'newpassword123'
  }, userToken);
  
  if (changePassword.success) {
    console.log('✓ Change password successful');
  } else {
    console.log('✗ Change password failed:', changePassword.error);
  }

  return true;
}

async function testStudentPoints() {
  console.log('\n=== Testing Student Points ===');
  
  // 1. Test points summary
  console.log('1. Testing points summary...');
  const pointsSummary = await makeRequest('GET', '/student-points/summary', null, userToken);
  
  if (pointsSummary.success) {
    console.log('✓ Points summary successful');
    console.log('  Total points:', pointsSummary.data.data?.tong_diem || 0);
  } else {
    console.log('✗ Points summary failed:', pointsSummary.error);
  }

  // 2. Test points detail
  console.log('2. Testing points detail...');
  const pointsDetail = await makeRequest('GET', '/student-points/detail', null, userToken);
  
  if (pointsDetail.success) {
    console.log('✓ Points detail successful');
    console.log('  Activities count:', pointsDetail.data.data?.length || 0);
  } else {
    console.log('✗ Points detail failed:', pointsDetail.error);
  }

  // 3. Test attendance history
  console.log('3. Testing attendance history...');
  const attendanceHistory = await makeRequest('GET', '/student-points/attendance', null, userToken);
  
  if (attendanceHistory.success) {
    console.log('✓ Attendance history successful');
    console.log('  Attendance records:', attendanceHistory.data.data?.length || 0);
  } else {
    console.log('✗ Attendance history failed:', attendanceHistory.error);
  }

  return true;
}

async function cleanup() {
  console.log('\n=== Cleanup ===');
  
  if (createdUserId && adminToken) {
    console.log('Deleting test user...');
    const deleteUser = await makeRequest('DELETE', `/users/${createdUserId}`, null, adminToken);
    
    if (deleteUser.success) {
      console.log('✓ Test user deleted successfully');
    } else {
      console.log('✗ Failed to delete test user:', deleteUser.error);
    }
  }
}

async function runTests() {
  console.log('Starting User Management System Tests...');
  console.log('API Base URL:', API_BASE);
  
  try {
    // Wait for server to be ready
    console.log('Checking server availability...');
    const healthCheck = await makeRequest('GET', '/health');
    
    if (!healthCheck.success) {
      console.log('✗ Server is not available. Please start the backend server first.');
      return;
    }
    
    console.log('✓ Server is available');
    
    // Run test suite
    const authOk = await testAuth();
    if (!authOk) {
      console.log('\n❌ Authentication tests failed. Stopping test suite.');
      return;
    }

    const userMgmtOk = await testUserManagement();
    if (!userMgmtOk) {
      console.log('\n❌ User management tests failed.');
    }

    const profileOk = await testUserProfile();
    if (!profileOk) {
      console.log('\n❌ User profile tests failed.');
    }

    const pointsOk = await testStudentPoints();
    if (!pointsOk) {
      console.log('\n❌ Student points tests failed.');
    }

    await cleanup();
    
    console.log('\n=== Test Summary ===');
    console.log('Authentication:', authOk ? '✓ PASS' : '✗ FAIL');
    console.log('User Management:', userMgmtOk ? '✓ PASS' : '✗ FAIL');
    console.log('User Profile:', profileOk ? '✓ PASS' : '✗ FAIL');
    console.log('Student Points:', pointsOk ? '✓ PASS' : '✗ FAIL');
    
    const allPassed = authOk && userMgmtOk && profileOk && pointsOk;
    console.log('\nOverall Result:', allPassed ? '🎉 ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

// Run tests
runTests();