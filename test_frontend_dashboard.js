// Test xem frontend có gọi API đúng không
const axios = require('axios');

async function testFrontendDashboard() {
    console.log('🔍 Testing frontend dashboard behavior...\n');
    
    try {
        // Simulate exactly what frontend does
        console.log('1. Login as student...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            maso: '2021003',
            password: 'Student@123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test through frontend proxy (same as frontend does)
        console.log('2. Testing dashboard API through frontend proxy...');
        const dashboardResponse = await axios.get('http://localhost:3000/api/dashboard/student', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Dashboard API Success through frontend!');
        console.log('Response structure check:');
        const data = dashboardResponse.data;
        
        if (data.success && data.data) {
            console.log('✅ Has success and data fields');
            console.log('✅ Total points:', data.data.tong_quan?.tong_diem);
            console.log('✅ Progress:', data.data.tong_quan?.ti_le_hoan_thanh);
            console.log('✅ Activities:', data.data.tong_quan?.tong_hoat_dong);
            
            console.log('\n🔧 Frontend will set summary to:');
            console.log('   totalPoints:', data.data.tong_quan?.tong_diem || 0);
            console.log('   progress:', data.data.tong_quan?.ti_le_hoan_thanh || 0);
            console.log('   activitiesJoined:', data.data.tong_quan?.tong_hoat_dong || 0);
        } else {
            console.log('❌ Invalid response structure - frontend will fallback to mock data');
        }
        
    } catch (error) {
        console.log('❌ Error that would cause frontend fallback:');
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message || error.message);
        console.log('This is why frontend shows 72 points instead of real data!');
    }
}

testFrontendDashboard();