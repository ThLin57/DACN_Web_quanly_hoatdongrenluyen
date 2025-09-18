const http = require('http');

// Tạo token mới cho test
const testUserId = '22ca6dde-0d47-43cb-9dc1-ab666d1b6dd5'; // User MSSV 2021003
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: testUserId, role: 'sinh_vien' },
  'your-secret-key-here', // Note: In production, use proper secret
  { expiresIn: '1h' }
);

console.log('Testing /api/activities endpoint after fix...\n');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/activities',
  method: 'GET',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Response:');
      console.log('- Success:', response.success);
      console.log('- Message:', response.message);
      
      if (response.data && response.data.items) {
        console.log('- Total activities:', response.data.total);
        console.log('- Items count:', response.data.items.length);
        console.log('\nActivities list:');
        response.data.items.forEach((activity, index) => {
          console.log(`  ${index + 1}. ${activity.ten_hd}`);
          console.log(`     Status: ${activity.trang_thai}`);
          console.log(`     Registration: ${activity.is_registered ? 'Yes' : 'No'}`);
        });
      } else {
        console.log('- Data:', response.data);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();