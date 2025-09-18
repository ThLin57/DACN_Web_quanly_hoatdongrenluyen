const http = require('http');

// Test login first
const loginData = JSON.stringify({
  ten_dn: 'admin',
  mat_khau: 'admin123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('🔐 Testing login...');

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Login response:', response.success ? 'Success' : 'Failed');
      
      if (response.success && response.data && response.data.token) {
        const token = response.data.token;
        console.log('🎫 Token received, testing notifications API...');
        
        // Test notifications API
        const notifOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/notifications?limit=5',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        const notifReq = http.request(notifOptions, (notifRes) => {
          let notifData = '';
          
          notifRes.on('data', (chunk) => {
            notifData += chunk;
          });
          
          notifRes.on('end', () => {
            try {
              const notifResponse = JSON.parse(notifData);
              console.log('📬 Notifications API response:');
              console.log('Status:', notifResponse.success ? 'Success' : 'Failed');
              
              if (notifResponse.success && notifResponse.data) {
                console.log('📊 Results:');
                console.log(`- Total notifications: ${notifResponse.data.notifications?.length || 0}`);
                console.log(`- Unread count: ${notifResponse.data.unread_count || 0}`);
                
                if (notifResponse.data.notifications && notifResponse.data.notifications.length > 0) {
                  console.log('📝 Sample notification:');
                  const sample = notifResponse.data.notifications[0];
                  console.log(`  Title: ${sample.title}`);
                  console.log(`  Type: ${sample.type}`);
                  console.log(`  Unread: ${sample.unread}`);
                }
              } else {
                console.log('❌ API Error:', notifResponse.message || 'Unknown error');
              }
            } catch (error) {
              console.log('❌ JSON Parse Error:', error.message);
              console.log('Raw response:', notifData);
            }
          });
        });
        
        notifReq.on('error', (error) => {
          console.log('❌ Notifications request error:', error.message);
        });
        
        notifReq.end();
        
      } else {
        console.log('❌ Login failed:', response.message || 'No token received');
      }
    } catch (error) {
      console.log('❌ Login JSON Parse Error:', error.message);
      console.log('Raw response:', data);
    }
  });
});

loginReq.on('error', (error) => {
  console.log('❌ Login request error:', error.message);
});

loginReq.write(loginData);
loginReq.end();