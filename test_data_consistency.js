const axios = require('axios');

async function checkDataConsistency() {
  try {
    console.log('=== Kiểm tra tính nhất quán dữ liệu ===');
    
    // Login
    const login = await axios.post('http://localhost:3001/api/auth/login', {
      maso: '2021003',
      password: 'Student@123'
    });
    const token = login.data.data.token;
    
    console.log('\nDữ liệu MyActivities:');
    const activities = await axios.get('http://localhost:3001/api/dashboard/activities/me', {
      headers: { Authorization: 'Bearer ' + token }
    });
    
    activities.data.data.forEach((act, i) => {
      console.log(`${i+1}. ${act.hoat_dong.ten_hd} - Status: ${act.trang_thai_dk} - Points: ${act.hoat_dong.diem_rl}`);
    });
    
    console.log('\nDữ liệu Scores:');
    const scores = await axios.get('http://localhost:3001/api/dashboard/scores/detailed', {
      headers: { Authorization: 'Bearer ' + token }
    });
    
    console.log('Tổng điểm từ Scores:', scores.data.data.summary.total_points);
    console.log('Tổng hoạt động từ Scores:', scores.data.data.summary.total_activities);
    console.log('Số hoạt động trong Scores:', scores.data.data.activities.length);
    
    console.log('\nPhân tích:');
    console.log('- MyActivities hiển thị tất cả đăng ký (5 hoạt động)');
    console.log('- Scores chỉ đếm hoạt động "da_tham_gia" (0 hoạt động)');
    console.log('- Cần điều chỉnh để hiển thị điểm từ hoạt động "da_duyet"');
    
  } catch (error) {
    console.error('Lỗi:', error.response?.data || error.message);
  }
}

checkDataConsistency();