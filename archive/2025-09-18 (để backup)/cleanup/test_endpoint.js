const http = require('http');

// Test if the endpoint is mounted
function testEndpointExists() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/activities/me',
    method: 'GET',
    headers: {}
  };

  const req = http.request(options, (res) => {
    console.log('=== Endpoint Test ===');
    console.log('Status:', res.statusCode);
    console.log('URL:', '/api/dashboard/activities/me');
    
    if (res.statusCode === 401) {
      console.log('✅ Endpoint exists - requires auth (401)');
    } else if (res.statusCode === 404) {
      console.log('❌ Endpoint NOT FOUND (404)');
    } else {
      console.log('Status:', res.statusCode);
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
  });

  req.end();
}

testEndpointExists();