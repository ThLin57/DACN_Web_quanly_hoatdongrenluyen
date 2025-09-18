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

async function testBothAPIs() {
  try {
    console.log('=== TEST LỖI 500 CHO 2 TRANG HOẠT ĐỘNG ===\n');
    
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
    console.log('\n2. Test API "Hoạt động của tôi" (/api/dashboard/activities/me)...');
    const myActivitiesResponse = await makeRequest('/api/dashboard/activities/me', 'GET', null, token);
    
    console.log('MyActivities Response:');
    console.log('- Status:', myActivitiesResponse.status);
    
    if (myActivitiesResponse.status === 500) {
      console.log('❌ LỖI 500 - MyActivities');
      console.log('- Error:', myActivitiesResponse.data);
    } else if (myActivitiesResponse.status === 200) {
      console.log('✅ MyActivities OK');
      console.log('- Success:', myActivitiesResponse.data.success);
      console.log('- Count:', myActivitiesResponse.data.data?.length || 0);
    } else {
      console.log('⚠️  Status:', myActivitiesResponse.status);
      console.log('- Response:', myActivitiesResponse.data);
    }
    
    // 3. Test API "Danh sách hoạt động"
    console.log('\n3. Test API "Danh sách hoạt động" (/api/activities)...');
    const activitiesResponse = await makeRequest('/api/activities', 'GET', null, token);
    
    console.log('Activities List Response:');
    console.log('- Status:', activitiesResponse.status);
    
    if (activitiesResponse.status === 500) {
      console.log('❌ LỖI 500 - Activities List');
      console.log('- Error:', activitiesResponse.data);
    } else if (activitiesResponse.status === 200) {
      console.log('✅ Activities List OK');
      console.log('- Success:', activitiesResponse.data.success);
      console.log('- Count:', activitiesResponse.data.data?.items?.length || 0);
      console.log('- Total:', activitiesResponse.data.data?.total || 0);
    } else {
      console.log('⚠️  Status:', activitiesResponse.status);
      console.log('- Response:', activitiesResponse.data);
    }
    
    // 4. Test với params khác nhau
    console.log('\n4. Test với params...');
    const activitiesWithParamsResponse = await makeRequest('/api/activities?page=1&limit=10', 'GET', null, token);
    console.log('Activities with params:');
    console.log('- Status:', activitiesWithParamsResponse.status);
    
    if (activitiesWithParamsResponse.status === 500) {
      console.log('❌ LỖI 500 với params');
      console.log('- Error:', activitiesWithParamsResponse.data);
    } else {
      console.log('✅ OK với params');
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testBothAPIs();