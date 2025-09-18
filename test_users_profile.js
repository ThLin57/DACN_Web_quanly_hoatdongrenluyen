const axios = require('axios');

async function testUsersProfile() {
  try {
    console.log('🧪 Testing login để lấy token...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      maso: '2021003',
      password: 'Student@123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful! Token:', token.substring(0, 50) + '...');
    
    // Test endpoint /users/profile (mà frontend đang gọi)
    console.log('\n🔍 Testing /users/profile endpoint...');
    
    try {
      const usersProfileResponse = await axios.get('http://localhost:3001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ /users/profile successful!');
      console.log('Users profile data:');
      console.log(JSON.stringify(usersProfileResponse.data, null, 2));
      
    } catch (usersError) {
      console.log('❌ /users/profile failed:', usersError.response?.data || usersError.message);
      
      // Nếu /users/profile lỗi, thử /auth/profile
      console.log('\n🔄 Fallback to /auth/profile...');
      const authProfileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ /auth/profile successful!');
      console.log('Auth profile data:');
      console.log(JSON.stringify(authProfileResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUsersProfile();