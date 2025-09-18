const http = require('http');

async function testLoginAPI() {
  try {
    console.log('=== TEST LOGIN API ===\n');
    
    // Test các tài khoản
    const accounts = [
      { maso: 'admin', password: 'Admin@123', name: 'Admin' },
      { maso: '2021003', password: 'Student@123', name: 'Student' },
      { maso: 'gv001', password: 'Teacher@123', name: 'Teacher' },
      { maso: 'lt001', password: 'Monitor@123', name: 'Monitor' }
    ];
    
    for (const account of accounts) {
      console.log(`Testing ${account.name} (${account.maso})...`);
      
      const loginData = JSON.stringify({
        maso: account.maso,
        password: account.password
      });
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };
      
      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode,
                data: JSON.parse(data)
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                data: data
              });
            }
          });
        });
        
        req.on('error', reject);
        req.write(loginData);
        req.end();
      });
      
      console.log(`- Status: ${response.status}`);
      console.log(`- Success: ${response.data.success}`);
      console.log(`- Message: ${response.data.message}`);
      
      if (response.data.success && response.data.data) {
        console.log(`- User ID: ${response.data.data.user?.id}`);
        console.log(`- Role: ${response.data.data.user?.role}`);
        console.log(`- Token: ${response.data.data.token?.substring(0, 20)}...`);
      } else if (response.data.errors) {
        console.log(`- Errors: ${JSON.stringify(response.data.errors)}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLoginAPI();