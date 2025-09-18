const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudents() {
  try {
    const students = await prisma.nguoiDung.findMany({
      where: {
        vai_tro: {
          ten_vt: 'SINH_VIEN'
        }
      },
      include: {
        sinh_vien: {
          include: {
            lop: true
          }
        },
        vai_tro: true
      }
    });
    
    console.log('🔍 Total students in database:', students.length);
    
    if (students.length > 0) {
      console.log('\n📊 First student sample:');
      console.log(JSON.stringify(students[0], null, 2));
    } else {
      console.log('❌ No students found in database!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();