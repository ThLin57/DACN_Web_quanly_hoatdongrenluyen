const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Lấy vai trò sinh viên
    const sinhVienRole = await prisma.vaiTro.findFirst({
      where: { ten_vt: 'SINH_VIEN' }
    });
    
    if (!sinhVienRole) {
      console.log('❌ Không tìm thấy vai trò SINH_VIEN');
      return;
    }
    
    // Lấy lớp đầu tiên
    const firstClass = await prisma.lop.findFirst();
    if (!firstClass) {
      console.log('❌ Không tìm thấy lớp nào');
      return;
    }
    
    // Tạo user test
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.nguoiDung.create({
      data: {
        ten_dn: 'test',
        mat_khau: hashedPassword,
        email: 'test@dlu.edu.vn',
        ho_ten: 'Nguyễn Văn Test',
        vai_tro_id: sinhVienRole.id,
        trang_thai: 'hoat_dong'
      }
    });
    
    // Tạo sinh viên
    const sinhVien = await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: user.id,
        mssv: '2021999',
        ngay_sinh: new Date('2003-01-15'),
        gt: 'nam',
        lop_id: firstClass.id,
        dia_chi: '123 Test Street, Test City',
        sdt: '0999999999',
        // Thông tin bổ sung
        avatar_url: null,
        sdt_khan_cap: '0888888888',
        email_phu: 'test.personal@gmail.com',
        so_thich: 'Lập trình, đọc sách công nghệ, chơi game',
        ky_nang: 'JavaScript, React, Node.js, TypeScript, Python',
        muc_tieu: 'Trở thành Full-Stack Developer chuyên nghiệp, học tập và phát triển kỹ năng lập trình web',
        // Thông tin gia đình
        ten_cha: 'Nguyễn Văn Cha',
        sdt_cha: '0911111111',
        ten_me: 'Trần Thị Mẹ',
        sdt_me: '0922222222',
        dia_chi_gia_dinh: '456 Family Street, Family City',
        // Thông tin học vấn
        truong_thpt: 'THPT Test High School',
        nam_tot_nghiep_thpt: 2021,
        diem_thpt: 8.75,
        // Cài đặt
        ngon_ngu: 'vi',
        mui_gio: 'Asia/Ho_Chi_Minh',
        thong_bao_email: true,
        thong_bao_sdt: false
      }
    });
    
    console.log('✅ Tạo user test thành công!');
    console.log('📋 Thông tin đăng nhập:');
    console.log('   Username: test');
    console.log('   Password: 123456');
    console.log('   MSSV:', sinhVien.mssv);
    console.log('   Lớp:', firstClass.ten_lop);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();