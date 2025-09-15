// Script để sửa dữ liệu sinh viên
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
    
    // 3. Lấy lớp mặc định
    const defaultClass = await prisma.lop.findFirst({
      where: { ten_lop: 'Lớp mặc định' }
    });
    
    if (!defaultClass) {
      console.log('❌ No default class found');
      return;
    }
    
    console.log('Default class found:', defaultClass.ten_lop);
    
    // 4. Tạo bản ghi sinh viên
    const newStudent = await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: userId,
        mssv: user.ten_dn, // Sử dụng ten_dn làm mssv
        ngay_sinh: new Date('2000-01-01'), // Ngày sinh mặc định
        lop_id: defaultClass.id
      }
    });
    
    console.log('✅ Student record created:', newStudent);
    
    // 5. Kiểm tra lại
    const updatedUser = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: { sinh_vien: true }
    });
    
    console.log('Updated user with student:', !!updatedUser.sinh_vien);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStudentData();
