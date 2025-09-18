const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAllUsers2021003() {
  try {
    console.log('🔍 Tìm tất cả users có maso hoặc mssv = 2021003...\n');
    
    // Tìm trong bảng NguoiDung
    const users = await prisma.nguoiDung.findMany({
      where: {
        ten_dn: '2021003'
      },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
    
    console.log(`📊 Tìm thấy ${users.length} user(s) với ten_dn = 2021003:`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log('- ID:', user.id);
      console.log('- Username:', user.ten_dn);
      console.log('- Họ tên:', user.ho_ten);
      console.log('- Email:', user.email);
      console.log('- Vai trò:', user.vai_tro?.ten_vt);
      console.log('- Trạng thái:', user.trang_thai);
      console.log('- Created:', user.ngay_tao);
      
      if (user.sinh_vien) {
        console.log('- SinhVien ID:', user.sinh_vien.id);
        console.log('- MSSV:', user.sinh_vien.mssv);
        console.log('- Họ tên SV:', user.sinh_vien.ho_ten);
        console.log('- Lớp:', user.sinh_vien.lop?.ten_lop);
      } else {
        console.log('- Không có SinhVien record');
      }
    });
    
    // Tìm trong bảng SinhVien riêng biệt
    console.log('\n🔍 Tìm trong bảng SinhVien...');
    const sinhViens = await prisma.sinhVien.findMany({
      where: {
        mssv: '2021003'
      },
      include: {
        nguoi_dung: true,
        lop: true
      }
    });
    
    console.log(`📊 Tìm thấy ${sinhViens.length} SinhVien(s) với MSSV = 2021003:`);
    
    sinhViens.forEach((sv, index) => {
      console.log(`\n🎓 SinhVien ${index + 1}:`);
      console.log('- ID:', sv.id);
      console.log('- MSSV:', sv.mssv);
      console.log('- Họ tên:', sv.ho_ten);
      console.log('- User ID:', sv.nguoi_dung_id);
      console.log('- User name:', sv.nguoi_dung?.ho_ten);
      console.log('- Lớp:', sv.lop?.ten_lop);
      console.log('- Ngày sinh:', sv.ngay_sinh);
      console.log('- SĐT:', sv.sdt);
      console.log('- Email phụ:', sv.email_phu);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findAllUsers2021003();