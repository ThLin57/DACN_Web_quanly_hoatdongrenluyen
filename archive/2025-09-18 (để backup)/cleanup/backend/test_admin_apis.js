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

async function testAdminAPIs() {
  try {
    console.log('=== TEST ADMIN APIs ===\n');
    
    // Thử login với các tài khoản admin có thể có
    const adminAccounts = [
      { maso: 'admin', password: 'admin123' },
      { maso: 'admin', password: 'Admin@123' },
      { maso: 'admin123', password: 'admin123' },
      { maso: 'quantri', password: 'Admin@123' }
    ];
    
    let adminToken = null;
    
    for (const account of adminAccounts) {
      console.log(`Thử đăng nhập admin với: ${account.maso}`);
      const loginResponse = await makeRequest('/api/auth/login', 'POST', account);
      
      if (loginResponse.status === 200 && loginResponse.data.success) {
        console.log('✅ Đăng nhập admin thành công!');
        adminToken = loginResponse.data.data.token;
        break;
      } else {
        console.log('❌ Thất bại:', loginResponse.data.message);
      }
    }
    
    if (!adminToken) {
      console.log('\n🔍 Kiểm tra danh sách users để tìm admin...');
      
      // Login với student để lấy token, rồi thử gọi API users
      const studentLogin = await makeRequest('/api/auth/login', 'POST', {
        maso: '2021003',
        password: 'Student@123'
      });
      
      if (studentLogin.status === 200) {
        const studentToken = studentLogin.data.data.token;
        
        // Thử các endpoint có thể có
        const possibleAdminEndpoints = [
          '/api/admin/users',
          '/api/users',
          '/api/dashboard/users',
          '/api/admin/dashboard'
        ];
        
        for (const endpoint of possibleAdminEndpoints) {
          console.log(`\nTest endpoint: ${endpoint}`);
          const response = await makeRequest(endpoint, 'GET', null, studentToken);
          console.log(`- Status: ${response.status}`);
          
          if (response.status === 403) {
            console.log('- 403 Forbidden (có endpoint này nhưng cần quyền admin)');
          } else if (response.status === 404) {
            console.log('- 404 Not Found (endpoint không tồn tại)');
          } else if (response.status === 200) {
            console.log('- 200 OK (sinh viên có thể truy cập)');
          } else {
            console.log('- Response:', response.data);
          }
        }
      }
      return;
    }
    
    // Test các API admin
    console.log('\n=== TEST VỚI TOKEN ADMIN ===');
    
    const adminEndpoints = [
      '/api/admin/users',
      '/api/users', 
      '/api/admin/dashboard',
      '/api/dashboard/admin/users'
    ];
    
    for (const endpoint of adminEndpoints) {
      console.log(`\nTest: ${endpoint}`);
      const response = await makeRequest(endpoint, 'GET', null, adminToken);
      console.log(`- Status: ${response.status}`);
      console.log(`- Success: ${response.data.success}`);
      
      if (response.status === 200 && response.data.data) {
        if (Array.isArray(response.data.data)) {
          console.log(`- Count: ${response.data.data.length}`);
        } else {
          console.log('- Data:', typeof response.data.data);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminAPIs();