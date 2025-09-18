// Force test dashboard reload để debug
const axios = require('axios');

async function testDashboardReload() {
    console.log('🔄 Testing Dashboard Reload Behavior\n');
    
    try {
        // Login as student
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            maso: '2021003',
            password: 'Student@123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test exact frontend call
        console.log('\n📊 Testing exact frontend dashboard call...');
        const dashboardResponse = await axios.get('http://localhost:3000/api/dashboard/student', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Response status:', dashboardResponse.status);
        console.log('Response success:', dashboardResponse.data.success);
        
        if (dashboardResponse.data?.success) {
            const data = dashboardResponse.data.data;
            console.log('\n✅ API Success - Frontend should show:');
            console.log('   totalPoints:', data.tong_quan?.tong_diem || 0);
            console.log('   progress:', data.tong_quan?.ti_le_hoan_thanh || 0);
            console.log('   activitiesJoined:', data.tong_quan?.tong_hoat_dong || 0);
            
            if ((data.tong_quan?.tong_diem || 0) === 0) {
                console.log('\n⚠️  WARNING: API returns 0 points - this might cause frontend to fallback');
            } else {
                console.log('\n🎯 API returns valid points - frontend should display correctly');
            }
        } else {
            console.log('❌ API returned success=false, frontend will fallback to mock data');
        }
        
    } catch (error) {
        console.log('\n❌ API Error - Frontend will use fallback data:');
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message || error.message);
        console.log('This explains why Dashboard shows 72 points!');
    }
}

testDashboardReload();