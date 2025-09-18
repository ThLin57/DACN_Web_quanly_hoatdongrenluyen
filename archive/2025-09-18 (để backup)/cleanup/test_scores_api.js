// Test API điểm rèn luyện chi tiết  
const axios = require('axios');

async function testScoresAPI() {
    console.log('🔄 Testing Scores API for current logged user...\n');
    
    try {
        // Login với user hiện tại trên website (TailAdmin)
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            maso: 'admin',
            password: 'Admin@123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test scores API
        console.log('\n2. Testing scores/detailed API...');
        const scoresResponse = await axios.get('http://localhost:3000/api/dashboard/scores/detailed', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Scores API Response:');
        console.log(JSON.stringify(scoresResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error testing scores API:');
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message || error.message);
        console.log('Full Error:', JSON.stringify(error.response?.data, null, 2));
    }
}

async function testAsStudent() {
    console.log('\n🎓 Testing Scores API as Student...\n');
    
    try {
        // Login as student
        console.log('1. Logging in as student 2021003...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            maso: '2021003',
            password: 'Student@123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Student login successful');
        
        // Test scores API
        console.log('\n2. Testing scores/detailed API as student...');
        const scoresResponse = await axios.get('http://localhost:3000/api/dashboard/scores/detailed', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Student Scores API Response:');
        console.log(JSON.stringify(scoresResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error testing student scores API:');
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message || error.message);
        console.log('Full Error:', JSON.stringify(error.response?.data, null, 2));
    }
}

// Run both tests
testScoresAPI().then(() => {
    return testAsStudent();
});