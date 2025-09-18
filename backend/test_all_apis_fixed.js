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

async function testAllAPIs() {
  try {
    console.log('=== TEST TẤT CẢ API SAU KHI SỬA LỖI ===\n');
    
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
    
    // 2. Test API "Hoạt động của tôi" 
    console.log('\n2. Test API "Hoạt động của tôi"...');
    const myActivitiesResponse = await makeRequest('/api/dashboard/activities/me', 'GET', null, token);
    console.log('- Status:', myActivitiesResponse.status);
    console.log('- Success:', myActivitiesResponse.data.success);
    if (myActivitiesResponse.status === 200) {
      console.log('- Count:', myActivitiesResponse.data.data?.length || 0);
    }
    
    // 3. Test API "Danh sách hoạt động" - default
    console.log('\n3. Test API "Danh sách hoạt động" (default)...');
    const activitiesResponse = await makeRequest('/api/activities', 'GET', null, token);
    console.log('- Status:', activitiesResponse.status);
    console.log('- Success:', activitiesResponse.data.success);
    if (activitiesResponse.status === 200) {
      console.log('- Count:', activitiesResponse.data.data?.items?.length || 0);
      console.log('- Total:', activitiesResponse.data.data?.total || 0);
    }
    
    // 4. Test API "Danh sách hoạt động" - với filter
    console.log('\n4. Test API "Danh sách hoạt động" (với filter trangThai=cho_duyet)...');
    const activitiesFilterResponse = await makeRequest('/api/activities?trangThai=cho_duyet', 'GET', null, token);
    console.log('- Status:', activitiesFilterResponse.status);
    console.log('- Success:', activitiesFilterResponse.data.success);
    if (activitiesFilterResponse.status === 200) {
      console.log('- Count:', activitiesFilterResponse.data.data?.items?.length || 0);
      console.log('- Total:', activitiesFilterResponse.data.data?.total || 0);
    }
    
    // 5. Test API Điểm rèn luyện
    console.log('\n5. Test API "Điểm rèn luyện"...');
    const scoresResponse = await makeRequest('/api/dashboard/scores/detailed?hoc_ky=1&nam_hoc=2025-2026', 'GET', null, token);
    console.log('- Status:', scoresResponse.status);
    console.log('- Success:', scoresResponse.data.success);
    if (scoresResponse.status === 200) {
      console.log('- Total Points:', scoresResponse.data.data?.summary?.total_points || 0);
      console.log('- Activities:', scoresResponse.data.data?.activities?.length || 0);
    }
    
    console.log('\n=== KẾT QUẢ ===');
    const allOK = [myActivitiesResponse, activitiesResponse, activitiesFilterResponse, scoresResponse]
      .every(resp => resp.status === 200);
    
    if (allOK) {
      console.log('✅ TẤT CẢ API HOẠT ĐỘNG BÌNH THƯỜNG');
    } else {
      console.log('❌ VẪN CÒN LỖI - KIỂM TRA CÁC API BỊ LỖI Ở TRÊN');
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testAllAPIs();