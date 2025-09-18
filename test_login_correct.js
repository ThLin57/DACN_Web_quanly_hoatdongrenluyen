const axios = require('axios');

async function testLoginWithCorrectPassword() {
  try {
    console.log('🧪 Testing login với password Student@123...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      maso: '2021003',
      password: 'Student@123'
    });
    
    console.log('✅ Login successful with Student@123!');
    const token = loginResponse.data.data.token;
    console.log('Token:', token);
    
    // Test get profile
    console.log('\n🔍 Testing get profile...');
    const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile API successful!');
    console.log('Profile data:');
    console.log(JSON.stringify(profileResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    // Nếu vẫn lỗi, thử password 123456
    if (error.response?.status === 401) {
      try {
        console.log('\n🔄 Thử lại với password 123456...');
        const response = await axios.post('http://localhost:3001/api/auth/login', {
          maso: '2021003',
          password: '123456'
        });
        console.log('✅ Login successful with 123456!');
        return response.data.token;
      } catch (err) {
        console.log('❌ Cả 2 password đều thất bại');
        console.error(err.response?.data || err.message);
      }
    }
  }
}

testLoginWithCorrectPassword();