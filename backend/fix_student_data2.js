// Script để sửa dữ liệu sinh viên - version 2
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStudentData() {
  const userId = 'a6cc9c7d-9a59-4c5c-83d5-0f90f2e29f0c';
  
  console.log('🔧 Fixing student data...\n');
  
  try {
    // 1. Lấy thông tin user
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('User found:', user.ten_dn, user.ho_ten);
    
    // 2. Kiểm tra xem đã có sinh viên chưa
    const existingStudent = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId }
    });
    
    if (existingStudent) {
      console.log('✅ Student record already exists');
      return;
    }
    
    // 3. Kiểm tra MSSV có bị trùng không
    const existingMSSV = await prisma.sinhVien.findUnique({
      where: { mssv: user.ten_dn }
    });
    
    if (existingMSSV) {
      console.log('❌ MSSV already exists:', user.ten_dn);
      console.log('Existing student:', existingMSSV);
      
      // Cập nhật existing student để trỏ đến user này
      const updatedStudent = await prisma.sinhVien.update({
        where: { mssv: user.ten_dn },
        data: { nguoi_dung_id: userId }
      });
      
      console.log('✅ Updated existing student record:', updatedStudent);
      return;
    }
    
    // 4. Lấy lớp mặc định
    const defaultClass = await prisma.lop.findFirst({
      where: { ten_lop: 'Lớp mặc định' }
    });
    
    if (!defaultClass) {
      console.log('❌ No default class found');
      return;
    }
    
    console.log('Default class found:', defaultClass.ten_lop);
    
    // 5. Tạo bản ghi sinh viên với MSSV khác
    const newMSSV = user.ten_dn + '_new';
    const newStudent = await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: userId,
        mssv: newMSSV,
        ngay_sinh: new Date('2000-01-01'),
        lop_id: defaultClass.id
      }
    });
    
    console.log('✅ Student record created with new MSSV:', newStudent);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStudentData();
