const http = require('http');

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function debugScoresAPI() {
  try {
    console.log('=== DEBUG TRANG ĐIỂM RÈN LUYỆN KHÔNG CÓ DỮ LIỆU ===\n');
    
    // 1. Đăng nhập
    console.log('1. Đăng nhập...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      maso: '2021003',
      password: 'Student@123'
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Đăng nhập thất bại:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Đăng nhập thành công');
    
    // 2. Kiểm tra API scores - endpoint hiện tại của frontend
    console.log('\n2. Test API như frontend đang gọi...');
    const frontendParams = '?hoc_ky=1&nam_hoc=2025-2026&view_by=hoc_ky';
    const scoresResponse = await makeRequest(`/api/dashboard/scores/detailed${frontendParams}`, 'GET', null, token);
    
    console.log('Frontend API Response:');
    console.log('- Status:', scoresResponse.status);
    console.log('- Success:', scoresResponse.data.success);
    console.log('- Message:', scoresResponse.data.message);
    
    if (scoresResponse.data.success && scoresResponse.data.data) {
      const data = scoresResponse.data.data;
      console.log('- Total Points:', data.summary?.total_points || 0);
      console.log('- Activities Count:', data.activities?.length || 0);
      console.log('- Student Info:', data.student_info?.ho_ten || 'N/A');
      
      if (data.activities && data.activities.length > 0) {
        console.log('\nActivities found:');
        data.activities.forEach((act, i) => {
          console.log(`  ${i+1}. ${act.ten_hd} - ${act.diem_rl} điểm`);
        });
      } else {
        console.log('\n❌ KHÔNG CÓ HOẠT ĐỘNG NÀO!');
      }
    } else {
      console.log('❌ API Error:', scoresResponse.data);
    }
    
    // 3. Kiểm tra API MyActivities để so sánh
    console.log('\n3. So sánh với API MyActivities...');
    const myActivitiesResponse = await makeRequest('/api/dashboard/activities/me', 'GET', null, token);
    
    console.log('MyActivities API Response:');
    console.log('- Status:', myActivitiesResponse.status);
    console.log('- Success:', myActivitiesResponse.data.success);
    
    if (myActivitiesResponse.data.success && myActivitiesResponse.data.data) {
      const myData = myActivitiesResponse.data.data;
      console.log('- Total Registrations:', myData.length || 0);
      
      if (myData.length > 0) {
        console.log('\nRegistrations found:');
        myData.forEach((reg, i) => {
          console.log(`  ${i+1}. ${reg.hoat_dong.ten_hd} - Status: ${reg.trang_thai_dk} - Points: ${reg.hoat_dong.diem_rl}`);
        });
        
        // Phân tích vấn đề
        console.log('\n🔍 PHÂN TÍCH VẤN ĐỀ:');
        const daThemGia = myData.filter(r => r.trang_thai_dk === 'da_tham_gia');
        const daDuyet = myData.filter(r => r.trang_thai_dk === 'da_duyet');
        
        console.log(`- Hoạt động đã tham gia (da_tham_gia): ${daThemGia.length}`);
        console.log(`- Hoạt động đã duyệt (da_duyet): ${daDuyet.length}`);
        console.log('- Scores API chỉ tính hoạt động có status: da_tham_gia, da_duyet');
        
        if (daThemGia.length === 0 && daDuyet.length === 0) {
          console.log('\n💡 VẤN ĐỀ: Không có hoạt động nào ở trạng thái da_tham_gia hoặc da_duyet');
          console.log('   Cần cập nhật trạng thái hoạt động hoặc điểm danh để có điểm');
        }
        
      } else {
        console.log('\n❌ Không có đăng ký hoạt động nào!');
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

debugScoresAPI();