// Script để debug thông tin user
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUser() {
  const userId = 'a6cc9c7d-9a59-4c5c-83d5-0f90f2e29f0c';
  
  console.log('🔍 Debugging user information...\n');
  
  try {
    // 1. Kiểm tra user có tồn tại không
    console.log('1. Checking if user exists...');
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: true,
        vai_tro: true
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('  - ID:', user.id);
      console.log('  - Username:', user.ten_dn);
      console.log('  - Name:', user.ho_ten);
      console.log('  - Email:', user.email);
      console.log('  - Role:', user.vai_tro?.ten_vt);
      console.log('  - Has sinh_vien:', !!user.sinh_vien);
      
      if (user.sinh_vien) {
        console.log('  - Student ID:', user.sinh_vien.id);
        console.log('  - MSSV:', user.sinh_vien.mssv);
        console.log('  - Class ID:', user.sinh_vien.lop_id);
      }
    } else {
      console.log('❌ User not found');
    }
    
    // 2. Kiểm tra tất cả users
    console.log('\n2. Checking all users...');
    const allUsers = await prisma.nguoiDung.findMany({
      select: {
        id: true,
        ten_dn: true,
        ho_ten: true,
        email: true,
        sinh_vien: {
          select: {
            id: true,
            mssv: true
          }
        }
      }
    });
    
    console.log('All users:');
    allUsers.forEach(u => {
      console.log(`  - ${u.ten_dn} (${u.ho_ten}) - Student: ${u.sinh_vien ? u.sinh_vien.mssv : 'No'}`);
    });
    
    // 3. Kiểm tra sinh viên
    console.log('\n3. Checking all students...');
    const allStudents = await prisma.sinhVien.findMany({
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ten_dn: true,
            ho_ten: true
          }
        }
      }
    });
    
    console.log('All students:');
    allStudents.forEach(s => {
      console.log(`  - ${s.mssv} (${s.nguoi_dung.ho_ten}) - User ID: ${s.nguoi_dung.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUser();
