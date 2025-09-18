const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCompleteSinhVienData() {
  try {
    console.log('🔧 Cập nhật đầy đủ thông tin SinhVien cho user 2021003...\n');
    
    const sinhVienId = '6d844fb7-0606-43d8-a63d-aa4a028f9096';
    
    // Cập nhật thông tin SinhVien với tất cả các trường
    const updatedSinhVien = await prisma.sinhVien.update({
      where: {
        id: sinhVienId
      },
      data: {
        // Thông tin cơ bản (chỉ cập nhật những trường có trong schema)
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
    
    console.log('✅ Cập nhật thành công SinhVien record!');
    console.log('\n📋 Thông tin đã cập nhật:');
    console.log('- MSSV:', updatedSinhVien.mssv);
    console.log('- Giới tính:', updatedSinhVien.gt);
    console.log('- SĐT:', updatedSinhVien.sdt);
    console.log('- Email phụ:', updatedSinhVien.email_phu);
    console.log('- Địa chỉ:', updatedSinhVien.dia_chi);
    console.log('- Lớp:', updatedSinhVien.lop?.ten_lop);
    console.log('- Trường THPT:', updatedSinhVien.truong_thpt);
    console.log('- Điểm THPT:', updatedSinhVien.diem_thpt);
    console.log('- Tên cha:', updatedSinhVien.ten_cha);
    console.log('- SĐT cha:', updatedSinhVien.sdt_cha);
    console.log('- Tên mẹ:', updatedSinhVien.ten_me);
    console.log('- SĐT mẹ:', updatedSinhVien.sdt_me);
    console.log('- Kỹ năng:', updatedSinhVien.ky_nang?.substring(0, 100) + '...');
    console.log('- Mục tiêu:', updatedSinhVien.muc_tieu?.substring(0, 100) + '...');
    console.log('- Sở thích:', updatedSinhVien.so_thich?.substring(0, 100) + '...');
    
    console.log('\n🎉 Hoàn thành! Bây giờ có thể test với thông tin đăng nhập:');
    console.log('- Mã số: 2021003');
    console.log('- Password: Student@123');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCompleteSinhVienData();