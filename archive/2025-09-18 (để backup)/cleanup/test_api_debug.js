// Quick API test script
const http = require('http');

// Test function to check API endpoints
async function testAPI() {
  console.log('Testing API endpoints...');
  
  // Test login to get token
  const loginData = JSON.stringify({
    email: 'leminhtuan@student.hcmue.edu.vn',
    password: '123456'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    console.log('Login status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Login response:', data);
      
      try {
        const response = JSON.parse(data);
        if (response.success && response.data.token) {
          console.log('Login successful, testing protected endpoints...');
          testProtectedEndpoints(response.data.token);
        }
      } catch (e) {
        console.error('Error parsing login response:', e);
      }
    });
  });

  loginReq.on('error', (e) => {
    console.error('Login error:', e.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testProtectedEndpoints(token) {
  // Test MyActivities endpoint
  const activitiesOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dashboard/activities/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const activitiesReq = http.request(activitiesOptions, (res) => {
    console.log('MyActivities status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('MyActivities response:', data);
    });
  });

  activitiesReq.on('error', (e) => {
    console.error('MyActivities error:', e.message);
  });

  activitiesReq.end();

  // Test Scores endpoint
  const scoresOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dashboard/scores/detailed',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const scoresReq = http.request(scoresOptions, (res) => {
    console.log('Scores status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Scores response:', data);
    });
  });

  scoresReq.on('error', (e) => {
    console.error('Scores error:', e.message);
  });

  scoresReq.end();
}

// Run the test
testAPI();