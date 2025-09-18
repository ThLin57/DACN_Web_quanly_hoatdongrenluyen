const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExistingMSSV() {
  try {
    const students = await prisma.sinhVien.findMany({
      include: {
        nguoi_dung: {
          select: {
            ten_dn: true,
            ho_ten: true
          }
        }
      }
    });
    
    console.log('🔍 Existing students with MSSV:', students.length);
    students.forEach(student => {
      console.log(`  - MSSV: ${student.mssv} | User: ${student.nguoi_dung.ten_dn} (${student.nguoi_dung.ho_ten})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingMSSV();