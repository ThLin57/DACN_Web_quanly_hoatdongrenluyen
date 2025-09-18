// Test đăng nhập qua frontend proxy
const axios = require('axios');

async function testFrontendLogin() {
    console.log('🔄 Testing login through frontend proxy...\n');
    
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            maso: 'admin',
            password: 'Admin@123'
        });
        
        console.log('✅ Frontend Login Success!');
        console.log('Status:', response.status);
        console.log('Full Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Frontend Login Failed');
        console.log('Status:', error.response?.status || 'No response');
        console.log('Error:', error.response?.data?.message || error.message);
    }
}

testFrontendLogin();