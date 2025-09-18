const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCorrectUser() {
  try {
    console.log('🔧 Tìm và cập nhật user đang được sử dụng...\n');
    
    // Tìm user có ID từ token response
    const correctUserId = '22ca6dde-0d47-43cb-9dc1-ab666d1b6dd5';
    
    const user = await prisma.nguoiDung.findUnique({
      where: { id: correctUserId },
      include: {
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ Không tìm thấy user với ID này');
      return;
    }
    
    console.log('✅ User found:');
    console.log('- ID:', user.id);
    console.log('- Username:', user.ten_dn);
    console.log('- Email:', user.email);
    console.log('- SinhVien ID:', user.sinh_vien?.id);
    
    if (!user.sinh_vien) {
      console.log('❌ User này không có SinhVien record');
      return;
    }
    
    // Cập nhật SinhVien record
    const sinhVienId = user.sinh_vien.id;
    
    const updatedSinhVien = await prisma.sinhVien.update({
      where: {
        id: sinhVienId
      },
      data: {
        // Thông tin cơ bản
        gt: 'nam',
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
        
        // Kỹ năng và sở thích
        so_thich: 'Lập trình web, chơi game online (MOBA, FPS), đọc sách công nghệ, nghe nhạc pop/rock, xem phim Marvel/DC, chơi guitar, đá bóng cuối tuần với bạn bè, du lịch khám phá những địa điểm mới',
        ky_nang: 'Kỹ năng mềm: Làm việc nhóm, Giao tiếp hiệu quả, Giải quyết vấn đề, Tư duy phản biện, Quản lý thời gian, Thuyết trình, Lãnh đạo nhóm nhỏ. Kỹ năng kỹ thuật: Java, Python, JavaScript, React.js, Node.js, Express.js, MySQL, PostgreSQL, MongoDB, Git/GitHub, HTML/CSS, Bootstrap, Tailwind CSS',
        
        // Mục tiêu nghề nghiệp
        muc_tieu: 'Trở thành Full-stack Developer chuyên nghiệp, có kinh nghiệm làm việc với các công nghệ web hiện đại. Mục tiêu trong 3 năm tới là làm việc tại một công ty công nghệ lớn và phát triển các ứng dụng web quy mô enterprise.',
        
        // Cài đặt
        ngon_ngu: 'vi',
        thong_bao_email: true,
        thong_bao_sdt: true,
        
        // URL avatar (có thể để null)
        avatar_url: null,
        
        // Cập nhật timestamp
        ngay_cap_nhat: new Date()
      },
      include: {
        nguoi_dung: true,
        lop: true
      }
    });
    
    console.log('\n✅ Cập nhật thành công cho user đúng!');
    console.log('- MSSV:', updatedSinhVien.mssv);
    console.log('- Giới tính:', updatedSinhVien.gt);
    console.log('- SĐT:', updatedSinhVien.sdt);
    console.log('- Email phụ:', updatedSinhVien.email_phu);
    console.log('- Trường THPT:', updatedSinhVien.truong_thpt);
    console.log('- Điểm THPT:', updatedSinhVien.diem_thpt);
    console.log('- Gia đình: Cha -', updatedSinhVien.ten_cha, ', Mẹ -', updatedSinhVien.ten_me);
    
    console.log('\n🎉 Hoàn thành! Bây giờ đăng nhập và test profile page!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCorrectUser();