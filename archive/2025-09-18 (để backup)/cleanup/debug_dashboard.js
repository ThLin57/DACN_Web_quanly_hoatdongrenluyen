// Test dashboard API trực tiếp để debug
const axios = require('axios');

async function debugDashboardAPI() {
    console.log('🔧 DEBUGGING Dashboard API\n');
    
    try {
        // Login as student  
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            maso: '2021003',
            password: 'Student@123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
        
        // Test direct backend dashboard API
        console.log('\n🔍 Testing direct backend dashboard API...');
        const response = await axios.get('http://localhost:3001/api/dashboard/student', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Dashboard API Success!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Dashboard API Error:');
        console.log('Status:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
        console.log('Full Error:', error.message);
    }
}

debugDashboardAPI();