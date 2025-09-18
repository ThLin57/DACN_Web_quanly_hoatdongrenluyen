const http = require('http');

async function testDirectAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      maso: '2021003',
      matkhau: '123456'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const loginReq = http.request(loginOptions, (loginRes) => {
      let loginData = '';
      loginRes.on('data', (chunk) => {
        loginData += chunk;
      });
      
      loginRes.on('end', () => {
        try {
          const loginResult = JSON.parse(loginData);
          const token = loginResult.token;
          
          const apiOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/dashboard/activities/me',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };

          const apiReq = http.request(apiOptions, (apiRes) => {
            let apiData = '';
            apiRes.on('data', (chunk) => {
              apiData += chunk;
            });
            
            apiRes.on('end', () => {
              console.log('=== API Response ===');
              console.log('Status:', apiRes.statusCode);
              console.log('Headers:', JSON.stringify(apiRes.headers, null, 2));
              console.log('Body length:', apiData.length);
              try {
                const result = JSON.parse(apiData);
                console.log('=== Parsed JSON ===');
                console.log('Success:', result.success);
                console.log('Data array length:', result.data ? result.data.length : 'undefined');
                console.log('Sample item:', result.data && result.data[0] ? JSON.stringify(result.data[0], null, 2) : 'none');
                console.log('Full response:', JSON.stringify(result, null, 2));
              } catch (e) {
                console.log('Parse Error:', e.message);
                console.log('Raw Data:', apiData);
              }
              resolve();
            });
          });

          apiReq.on('error', reject);
          apiReq.end();
          
        } catch (e) {
          reject(e);
        }
      });
    });

    loginReq.on('error', reject);
    loginReq.write(postData);
    loginReq.end();
  });
}

testDirectAPI().catch(console.error);