const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRealActiveUser() {
  try {
    console.log('🔧 Cập nhật user thực sự đang active...\n');
    
    // ID từ API response
    const realUserId = '22ca6dde-0d47-43cb-9dc1-ab666d1b6dd5';
    
    // Tìm user
    const user = await prisma.nguoiDung.findUnique({
      where: { id: realUserId },
      include: {
        sinh_vien: true
      }
    });
    
    if (!user) {
      console.log('❌ Không tìm thấy real user');
      return;
    }
    
    console.log('✅ Real user found:');
    console.log('- ID:', user.id);
    console.log('- Username:', user.ten_dn);
    console.log('- SinhVien ID:', user.sinh_vien?.id);
    
    if (!user.sinh_vien) {
      console.log('❌ Real user không có SinhVien record');
      return;
    }
    
    // Cập nhật SinhVien record với TẤT CẢ thông tin mở rộng
    const updatedSinhVien = await prisma.sinhVien.update({
      where: {
        id: user.sinh_vien.id
      },
      data: {
        // Thông tin cơ bản
        gt: 'nam',  // Sửa từ 'nu' thành 'nam'
        sdt: '0901234567',
        email_phu: 'leminhtuanpersonal@gmail.com',
        dia_chi: '123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
        
        // Thông tin khẩn cấp
        sdt_khan_cap: '0987654321',
        
        // Thông tin gia đình
        ten_cha: 'Lê Văn Hùng',
        sdt_cha: '0987654321',
        ten_me: 'Nguyễn Thị Lan',
        sdt_me: '0976543210',
        dia_chi_gia_dinh: '456 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
        
        // Thông tin học vấn
        truong_thpt: 'THPT Chuyên Lê Hồng Phong TP.HCM',
        nam_tot_nghiep_thpt: 2021,
        diem_thpt: 9.25,
        
        // Kỹ năng và sở thích - ĐẦY ĐỦ
        so_thich: 'Lập trình web và ứng dụng di động, chơi game online (MOBA, FPS), đọc sách công nghệ và khoa học, nghe nhạc pop/rock, xem phim Marvel/DC, chơi guitar, đá bóng cuối tuần với bạn bè, du lịch khám phá những địa điểm mới, nhiếp ảnh phong cảnh',
        
        ky_nang: 'KỸ NĂNG MỀM: Làm việc nhóm hiệu quả, Giao tiếp và thuyết trình tự tin, Giải quyết vấn đề sáng tạo, Tư duy phản biện và phân tích, Quản lý thời gian và dự án, Lãnh đạo nhóm nhỏ, Thích ứng với thay đổi nhanh. KỸ NĂNG KỸ THUẬT: Ngôn ngữ lập trình (Java, Python, JavaScript, C++), Frontend (React.js, Vue.js, HTML5, CSS3, Bootstrap, Tailwind CSS), Backend (Node.js, Express.js, Spring Boot), Database (MySQL, PostgreSQL, MongoDB, Redis), DevOps (Git/GitHub, Docker, AWS basics), Tools (VS Code, IntelliJ IDEA, Postman, Figma)',
        
        // Mục tiêu nghề nghiệp - CHI TIẾT
        muc_tieu: 'MỤC TIÊU NGẮN HẠN (1-2 năm): Trở thành Full-stack Developer thành thạo, có kinh nghiệm thực tế với các dự án web quy mô vừa và lớn. Nắm vững các công nghệ hiện đại như React, Node.js, cloud services. MỤC TIÊU DÀI HẠN (3-5 năm): Phát triển thành Software Architect hoặc Tech Lead tại một công ty công nghệ hàng đầu, có khả năng thiết kế và quản lý các hệ thống phần mềm phức tạp, dẫn dắt đội ngũ kỹ thuật và đóng góp vào việc phát triển sản phẩm có tác động tích cực đến xã hội.',
        
        // Cài đặt
        ngon_ngu: 'vi',
        thong_bao_email: true,
        thong_bao_sdt: true,
        
        // URL avatar
        avatar_url: null
      }
    });
    
    console.log('\n✅ Cập nhật thành công real active user!');
    console.log('- MSSV:', updatedSinhVien.mssv);
    console.log('- Giới tính:', updatedSinhVien.gt);
    console.log('- SĐT:', updatedSinhVien.sdt);
    console.log('- Email phụ:', updatedSinhVien.email_phu);
    console.log('- Trường THPT:', updatedSinhVien.truong_thpt);
    console.log('- Điểm THPT:', updatedSinhVien.diem_thpt);
    console.log('- Gia đình: Cha -', updatedSinhVien.ten_cha, ', Mẹ -', updatedSinhVien.ten_me);
    console.log('- Địa chỉ:', updatedSinhVien.dia_chi);
    console.log('- Sở thích:', updatedSinhVien.so_thich?.substring(0, 80) + '...');
    console.log('- Kỹ năng:', updatedSinhVien.ky_nang?.substring(0, 80) + '...');
    console.log('- Mục tiêu:', updatedSinhVien.muc_tieu?.substring(0, 80) + '...');
    
    console.log('\n🎉 HOÀN THÀNH TẤT CẢ! Bây giờ hãy test:');
    console.log('1. Đăng nhập: 2021003 / Student@123');
    console.log('2. Truy cập: http://localhost:3000/profile/user');
    console.log('3. Kiểm tra TẤT CẢ 3 tab có đầy đủ thông tin chi tiết!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRealActiveUser();