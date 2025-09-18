// Test từ browser để debug frontend
const axios = require('axios');

async function testFrontendFromBrowser() {
    console.log('🌐 Testing frontend scores loading simulation...\n');
    
    try {
        // Login first
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            maso: 'admin',
            password: 'Admin@123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful, token received');
        
        // Simulate frontend request with exact same parameters
        const viewBy = 'hoc_ky';
        const selected = '2025-2026_HK1';  // Current semester selection
        const [namHocPart, hocKyPart] = selected.split('_');
        const hocKy = hocKyPart ? hocKyPart.replace('HK', '') : '1';
        
        console.log('📝 Frontend Parameters:');
        console.log('  viewBy:', viewBy);
        console.log('  selected:', selected);
        console.log('  namHocPart:', namHocPart);
        console.log('  hocKy:', hocKy);
        
        const response = await axios.get('http://localhost:3000/api/dashboard/scores/detailed', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
                hoc_ky: hocKy,
                nam_hoc: namHocPart,
                view_by: viewBy 
            }
        });
        
        console.log('\n✅ API Response Status:', response.status);
        console.log('✅ Success:', response.data.success);
        console.log('✅ Message:', response.data.message);
        console.log('✅ Student Info:', response.data.data.student_info);
        console.log('✅ Summary Score:', response.data.data.summary.total_score);
        console.log('✅ Activities Count:', response.data.data.activities.length);
        
        // Check if frontend would accept this
        if (response.data && response.data.success && response.data.data) {
            console.log('\n🎯 Frontend should accept this response and not fallback to sample data');
        } else {
            console.log('\n❌ Frontend would reject this response format');
        }
        
    } catch (error) {
        console.log('\n❌ Error that would cause frontend fallback:');
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message || error.message);
        console.log('Error details:', error.response?.data);
    }
}

testFrontendFromBrowser();