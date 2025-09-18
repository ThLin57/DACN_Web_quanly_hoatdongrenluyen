// So sánh 2 logic tính điểm
const axios = require('axios');

async function compareAPIs() {
    console.log('🔍 COMPARING DASHBOARD vs SCORES APIs\n');
    
    try {
        // Login as student
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            maso: '2021003',
            password: 'Student@123'
        });
        
        const token = loginResponse.data.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Test Dashboard API
        console.log('1. 📊 Testing Dashboard API (/dashboard/student)');
        const dashboardResponse = await axios.get('http://localhost:3000/api/dashboard/student', { headers });
        const dashboardData = dashboardResponse.data.data;
        
        console.log('✅ Dashboard API Results:');
        console.log('   Total Points:', dashboardData.tong_quan.tong_diem);
        console.log('   Total Activities:', dashboardData.tong_quan.tong_hoat_dong);
        console.log('   Recent Activities Count:', dashboardData.hoat_dong_gan_day?.length || 0);
        
        // Test Scores API 
        console.log('\n2. 📋 Testing Scores API (/dashboard/scores/detailed)');
        const scoresResponse = await axios.get('http://localhost:3000/api/dashboard/scores/detailed', { headers });
        const scoresData = scoresResponse.data.data;
        
        console.log('✅ Scores API Results:');
        console.log('   Total Score:', scoresData.summary.total_score);
        console.log('   Total Activities:', scoresData.summary.total_activities);
        console.log('   Activities Count:', scoresData.activities?.length || 0);
        
        console.log('\n🔍 DETAILED COMPARISON:');
        
        // Compare activities
        console.log('\n📋 Dashboard Activities:');
        dashboardData.hoat_dong_gan_day?.forEach((activity, index) => {
            console.log(`   ${index + 1}. ${activity.ten_hd} - ${activity.diem_rl} điểm (${activity.trang_thai})`);
        });
        
        console.log('\n📋 Scores Activities:');
        scoresData.activities?.forEach((activity, index) => {
            console.log(`   ${index + 1}. ${activity.ten_hd} - ${activity.diem_rl} điểm (${activity.loai})`);
        });
        
        console.log('\n🎯 DISCREPANCY ANALYSIS:');
        console.log(`   Dashboard shows: ${dashboardData.tong_quan.tong_diem} points`);
        console.log(`   Scores shows: ${scoresData.summary.total_score} points`);
        console.log(`   Difference: ${dashboardData.tong_quan.tong_diem - scoresData.summary.total_score} points`);
        
        if (dashboardData.tong_quan.tong_diem !== scoresData.summary.total_score) {
            console.log('\n❌ INCONSISTENCY DETECTED!');
            console.log('   Dashboard logic: trang_thai_dk = "da_tham_gia" AND hoat_dong.trang_thai = "ket_thuc"');
            console.log('   Scores logic: trang_thai_dk in ["da_tham_gia", "da_duyet"]');
        } else {
            console.log('\n✅ Both APIs show consistent data');
        }
        
    } catch (error) {
        console.log('❌ Error comparing APIs:');
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message || error.message);
    }
}

compareAPIs();