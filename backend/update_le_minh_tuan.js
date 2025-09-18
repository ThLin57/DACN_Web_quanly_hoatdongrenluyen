const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateLeMinhTuanProfile() {
  try {
    const userId = 'ff038c75-84b9-4f68-8cb5-512c610f77ac';
    
    // Cập nhật thông tin NguoiDung
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: {
        ho_ten: 'Lê Minh Tuấn',
        email: '2021003@dlu.edu.vn'
      }
    });
    
    console.log('✅ Cập nhật thông tin NguoiDung...');
    
    // Cập nhật đầy đủ thông tin SinhVien
    await prisma.sinhVien.update({
      where: { nguoi_dung_id: userId },
      data: {
        ngay_sinh: new Date('2003-05-15'),
        gt: 'nam',
        dia_chi: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        sdt: '0901234567',
        
        // Thông tin bổ sung cá nhân
        avatar_url: null,
        sdt_khan_cap: '0909876543',
        email_phu: 'leminhtuan.personal@gmail.com',
        so_thich: `Lập trình web, chơi game online (MOBA, FPS), đọc sách công nghệ, nghe nhạc pop/rock, xem phim Marvel/DC, chơi guitar, đá bóng cuối tuần với bạn bè, du lịch khám phá những địa điểm mới`,
        ky_nang: `Frontend: HTML5, CSS3, JavaScript ES6+, React.js, Vue.js, Tailwind CSS, Bootstrap
Backend: Node.js, Express.js, Python, Django, Java Spring Boot
Database: MySQL, PostgreSQL, MongoDB
Tools: Git/GitHub, VS Code, Figma, Postman, Docker
Soft skills: Teamwork, Problem solving, Communication, Time management`,
        muc_tieu: `Ngắn hạn (1-2 năm):
- Thành thạo React.js và Node.js để xây dựng ứng dụng fullstack
- Học thêm về DevOps và Cloud Computing (AWS/GCP)
- Tham gia internship tại các công ty công nghệ

Dài hạn (3-5 năm):
- Trở thành Senior Full-Stack Developer
- Chuyên sâu về kiến trúc hệ thống và microservices
- Có khả năng lead team và mentor junior developers
- Khởi nghiệp công ty công nghệ riêng trong lĩnh vực EdTech`,
        
        // Thông tin gia đình
        ten_cha: 'Lê Văn Minh',
        sdt_cha: '0912345678',
        ten_me: 'Nguyễn Thị Lan Anh',
        sdt_me: '0987654321',
        dia_chi_gia_dinh: '456 Đường Lê Lợi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
        
        // Thông tin học vấn
        truong_thpt: 'THPT Chuyên Lê Hồng Phong TP.HCM',
        nam_tot_nghiep_thpt: 2021,
        diem_thpt: 9.25,
        
        // Cài đặt cá nhân
        ngon_ngu: 'vi',
        mui_gio: 'Asia/Ho_Chi_Minh',
        thong_bao_email: true,
        thong_bao_sdt: true
      }
    });
    
    console.log('✅ Cập nhật thông tin SinhVien thành công!');
    
    // Kiểm tra kết quả
    const updatedUser = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
    
    console.log('\n📋 Thông tin đã cập nhật:');
    console.log('- Họ tên:', updatedUser.ho_ten);
    console.log('- MSSV:', updatedUser.sinh_vien.mssv);
    console.log('- Lớp:', updatedUser.sinh_vien.lop.ten_lop);
    console.log('- Ngày sinh:', updatedUser.sinh_vien.ngay_sinh.toLocaleDateString('vi-VN'));
    console.log('- SĐT:', updatedUser.sinh_vien.sdt);
    console.log('- Trường THPT:', updatedUser.sinh_vien.truong_thpt);
    console.log('- Điểm THPT:', updatedUser.sinh_vien.diem_thpt);
    console.log('- Sở thích:', updatedUser.sinh_vien.so_thich ? 'Đã cập nhật' : 'Chưa có');
    console.log('- Kỹ năng:', updatedUser.sinh_vien.ky_nang ? 'Đã cập nhật' : 'Chưa có');
    console.log('- Mục tiêu:', updatedUser.sinh_vien.muc_tieu ? 'Đã cập nhật' : 'Chưa có');
    
    console.log('\n🎉 Hoàn thành! Bạn có thể đăng nhập với:');
    console.log('Username: 2021003');
    console.log('Password: [mật khẩu hiện tại]');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLeMinhTuanProfile();