const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

console.log('🧪 Testing DACN Backend API (New Structure)');
console.log('==========================================\n');

// Test đăng nhập
async function testLogin() {
  try {
    console.log('🧪 Testing Login API...');
    
    // Test đăng nhập admin
    const adminResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      maso: 'AD001',
      password: 'Admin@123'
    });
    
    console.log('✅ Admin login successful:');
    console.log('Response format:', {
      success: adminResponse.data.success,
      message: adminResponse.data.message,
      hasToken: !!adminResponse.data.data?.token,
      hasUser: !!adminResponse.data.data?.user
    });
    
    if (adminResponse.data.data?.token) {
      console.log('Token:', adminResponse.data.data.token.substring(0, 50) + '...');
      console.log('User:', adminResponse.data.data.user);
    }
    
    // Test đăng nhập teacher
    const teacherResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      maso: 'GV001',
      password: 'Teacher@123'
    });
    
    console.log('\n✅ Teacher login successful:');
    console.log('User:', teacherResponse.data.data?.user);
    
    // Test đăng nhập student
    const studentResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      maso: 'SV210001',
      password: 'Student@123'
    });
    
    console.log('\n✅ Student login successful:');
    console.log('User:', studentResponse.data.data?.user);
    
    // Test lấy danh sách users
    console.log('\n🧪 Testing Users API...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`);
    console.log('✅ Users list successful:');
    console.log('Response format:', {
      success: usersResponse.data.success,
      message: usersResponse.data.message,
      totalUsers: usersResponse.data.data?.length || 0
    });
    
    // Test lấy profile với token
    console.log('\n🧪 Testing Profile API...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${adminResponse.data.data.token}`
      }
    });
    console.log('✅ Profile API successful:');
    console.log('Profile:', profileResponse.data.data);
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test đăng nhập sai
async function testInvalidLogin() {
  try {
    console.log('\n🧪 Testing Invalid Login...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      maso: 'INVALID',
      password: 'WRONG'
    });
    
    console.log('❌ This should have failed');
  } catch (error) {
    console.log('✅ Invalid login correctly rejected:');
    console.log('Error:', error.response.data.message);
  }
}

// Chạy tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testLogin();
  await testInvalidLogin();
  
  console.log('\n🏁 Tests completed!');
}

// Chạy nếu file được execute trực tiếp
if (require.main === module) {
  runTests();
}

module.exports = { testLogin, testInvalidLogin };
