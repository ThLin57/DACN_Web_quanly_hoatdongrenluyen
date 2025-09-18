const http = require('http');

// Test if basic dashboard route works
function testBasicEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/summary',
    method: 'GET',
    headers: {}
  };

  const req = http.request(options, (res) => {
    console.log('=== Basic Dashboard Test ===');
    console.log('Status:', res.statusCode);
    console.log('URL:', '/api/dashboard/summary');
    
    if (res.statusCode === 401) {
      console.log('✅ Dashboard route mounted - requires auth (401)');
    } else if (res.statusCode === 404) {
      console.log('❌ Dashboard route NOT MOUNTED (404)');
    } else {
      console.log('Status:', res.statusCode);
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response length:', data.length);
    });
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
  });

  req.end();
}

testBasicEndpoint();