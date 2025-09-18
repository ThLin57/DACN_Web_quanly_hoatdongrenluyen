const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserData() {
  try {
    console.log('🔍 Kiểm tra dữ liệu user Lê Minh Tuấn...\n');
    
    // Kiểm tra user
    const user = await prisma.nguoiDung.findUnique({
      where: { id: 'ff038c75-84b9-4f68-8cb5-512c610f77ac' },
      include: {
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ Không tìm thấy user');
      return;
    }
    
    console.log('✅ User found:');
    console.log('- ID:', user.id);
    console.log('- Username:', user.username);
    console.log('- Email:', user.email);
    console.log('- Vai trò:', user.vai_tro);
    
    if (user.sinh_vien) {
      console.log('\n✅ SinhVien record exists:');
      console.log('- ID:', user.sinh_vien.id);
      console.log('- MSSV:', user.sinh_vien.mssv);
      console.log('- Họ tên:', user.sinh_vien.ho_ten);
      console.log('- Ngày sinh:', user.sinh_vien.ngay_sinh);
      console.log('- Giới tính:', user.sinh_vien.gioi_tinh);
      console.log('- SĐT:', user.sinh_vien.sdt);
      console.log('- Email phụ:', user.sinh_vien.email_phu);
      console.log('- Địa chỉ:', user.sinh_vien.dia_chi);
      console.log('- Lớp:', user.sinh_vien.lop?.ten_lop);
      
      // Kiểm tra các trường mới
      console.log('\n📋 Thông tin bổ sung:');
      console.log('- Trường THPT:', user.sinh_vien.truong_thpt);
      console.log('- Điểm THPT:', user.sinh_vien.diem_thpt);
      console.log('- Tên cha:', user.sinh_vien.ten_cha);
      console.log('- SĐT cha:', user.sinh_vien.sdt_cha);
      console.log('- Tên mẹ:', user.sinh_vien.ten_me);
      console.log('- SĐT mẹ:', user.sinh_vien.sdt_me);
      console.log('- Sở thích:', user.sinh_vien.so_thich);
      console.log('- Kỹ năng mềm:', user.sinh_vien.ky_nang_mem);
      console.log('- Kỹ năng kỹ thuật:', user.sinh_vien.ky_nang_ky_thuat);
      console.log('- Mục tiêu nghề nghiệp:', user.sinh_vien.muc_tieu_nghe_nghiep);
      
    } else {
      console.log('\n❌ Không có SinhVien record');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserData();