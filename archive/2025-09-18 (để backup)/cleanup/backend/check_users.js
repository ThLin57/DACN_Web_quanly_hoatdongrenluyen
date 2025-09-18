const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    // Check students
    const students = await prisma.nguoiDung.findMany({
      where: { 
        vai_tro: { 
          ten_vt: 'Sinh viên' 
        } 
      },
      include: { 
        sinh_vien: true,
        vai_tro: true
      },
      take: 5
    });
    
    console.log('Students count:', students.length);
    students.forEach(u => {
      console.log(`- ${u.ten_dn} (${u.sinh_vien?.mssv}) - ${u.email} - Role: ${u.vai_tro.ten_vt}`);
    });
    
    // Check all users
    const allUsers = await prisma.nguoiDung.findMany({
      include: { 
        vai_tro: true
      },
      take: 10
    });
    
    console.log('\nAll users count:', allUsers.length);
    allUsers.forEach(u => {
      console.log(`- ${u.ten_dn} - ${u.email} - Role: ${u.vai_tro.ten_vt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
