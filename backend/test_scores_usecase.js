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

async function testScoresAPI() {
  try {
    console.log('=== TEST SCORES API - USECASE U6 ANALYSIS ===\n');
    
    // 1. Đăng nhập
    console.log('1. Đăng nhập sinh viên...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      maso: '2021003',
      password: 'Student@123'
    });
    
    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ Đăng nhập thất bại:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Đăng nhập thành công');
    
    // 2. Test API scores detailed
    console.log('\n2. Test /api/dashboard/scores/detailed...');
    const scoresResponse = await makeRequest('/api/dashboard/scores/detailed?hoc_ky=1&nam_hoc=2025-2026', 'GET', null, token);
    
    console.log('Status:', scoresResponse.status);
    console.log('Success:', scoresResponse.data.success);
    
    if (scoresResponse.data.success && scoresResponse.data.data) {
      const data = scoresResponse.data.data;
      
      console.log('\n=== PHÂN TÍCH DỮ LIỆU THEO USECASE U6 ===');
      
      // Thông tin sinh viên
      console.log('\n📋 THÔNG TIN SINH VIÊN:');
      console.log('- Họ tên:', data.student_info?.ho_ten);
      console.log('- MSSV:', data.student_info?.mssv);
      console.log('- Lớp:', data.student_info?.lop);
      console.log('- Khoa:', data.student_info?.khoa);
      
      // Tổng hợp điểm
      console.log('\n🎯 TỔNG HỢP ĐIỂM RÈN LUYỆN:');
      console.log('- Tổng điểm hiện tại:', data.summary?.total_points || 0);
      console.log('- Mục tiêu:', data.summary?.target_points || 100);
      console.log('- Tiến độ:', Math.round(data.summary?.progress_percentage || 0) + '%');
      console.log('- Số hoạt động tham gia:', data.summary?.total_activities || 0);
      console.log('- Điểm trung bình/hoạt động:', data.summary?.average_points || 0);
      
      // Phân tích theo tiêu chí
      console.log('\n📊 PHÂN TÍCH THEO TIÊU CHÍ:');
      if (data.criteria_breakdown && data.criteria_breakdown.length > 0) {
        data.criteria_breakdown.forEach(criteria => {
          console.log(`- ${criteria.name}: ${criteria.current}/${criteria.max} điểm (${Math.round(criteria.percentage)}%)`);
        });
      } else {
        console.log('- Chưa có dữ liệu phân tích theo tiêu chí');
      }
      
      // Lịch sử hoạt động
      console.log('\n📅 LỊCH SỬ HOẠT ĐỘNG:');
      if (data.activities && data.activities.length > 0) {
        console.log(`Tổng cộng: ${data.activities.length} hoạt động`);
        data.activities.forEach((activity, index) => {
          console.log(`${index + 1}. ${activity.ten_hd}`);
          console.log(`   - Loại: ${activity.loai}`);
          console.log(`   - Điểm: ${activity.diem_rl}`);
          console.log(`   - Ngày: ${new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}`);
        });
      } else {
        console.log('- Chưa có hoạt động nào');
      }
      
      // Đánh giá độ phù hợp với usecase U6
      console.log('\n✅ ĐÁNH GIÁ USECASE U6 - "Xem điểm rèn luyện cá nhân":');
      console.log('📌 Yêu cầu: Sinh viên xem thông tin điểm rèn luyện theo học kỳ/năm cùng các hoạt động đã đăng ký, tham gia');
      
      const hasStudentInfo = !!(data.student_info?.ho_ten && data.student_info?.mssv);
      const hasScoreSummary = !!(data.summary?.total_points !== undefined);
      const hasActivities = !!(data.activities && data.activities.length >= 0);
      const hasCriteriaBreakdown = !!(data.criteria_breakdown && data.criteria_breakdown.length > 0);
      
      console.log('✓ Thông tin sinh viên:', hasStudentInfo ? 'CÓ' : 'THIẾU');
      console.log('✓ Tổng hợp điểm theo học kỳ/năm:', hasScoreSummary ? 'CÓ' : 'THIẾU');
      console.log('✓ Danh sách hoạt động đã tham gia:', hasActivities ? 'CÓ' : 'THIẾU');
      console.log('✓ Phân tích theo tiêu chí rèn luyện:', hasCriteriaBreakdown ? 'CÓ' : 'THIẾU');
      
      const overallCompliance = hasStudentInfo && hasScoreSummary && hasActivities && hasCriteriaBreakdown;
      console.log('\n🏆 KẾT LUẬN:', overallCompliance ? 'ĐÁNG HỢP YÊU CẦU USECASE U6' : 'CÒN THIẾU SÓT');
      
    } else {
      console.log('❌ API response:', scoresResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testScoresAPI();