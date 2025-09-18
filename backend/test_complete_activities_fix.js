const http = require('http');

// Test với login trước
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

async function testActivitiesAPI() {
  try {
    console.log('=== TEST ACTIVITIES API AFTER FIX ===\n');
    
    // 1. Đăng nhập để lấy token
    console.log('1. Đăng nhập...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      maso: '2021003',
      password: 'Student@123'
    });
    
    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ Đăng nhập thất bại:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Đăng nhập thành công');
    
    // 2. Test API activities
    console.log('\n2. Test /api/activities...');
    const activitiesResponse = await makeRequest('/api/activities', 'GET', null, token);
    
    console.log('Status:', activitiesResponse.status);
    console.log('Success:', activitiesResponse.data.success);
    console.log('Message:', activitiesResponse.data.message);
    
    if (activitiesResponse.data.success && activitiesResponse.data.data) {
      const { total, items } = activitiesResponse.data.data;
      console.log(`Total: ${total} hoạt động`);
      console.log(`Items: ${items.length} hoạt động`);
      
      console.log('\nDanh sách hoạt động:');
      items.forEach((activity, index) => {
        console.log(`  ${index + 1}. ${activity.ten_hd}`);
        console.log(`     Trạng thái: ${activity.trang_thai}`);
        console.log(`     Đã đăng ký: ${activity.is_registered ? 'Có' : 'Không'}`);
        console.log('');
      });
      
      if (total >= 3) {
        console.log('✅ SUCCESS: API hiện trả về >= 3 hoạt động (đã duyệt)');
      } else {
        console.log('⚠️  WARNING: Chỉ có', total, 'hoạt động được trả về');
      }
    } else {
      console.log('❌ API response:', activitiesResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testActivitiesAPI();