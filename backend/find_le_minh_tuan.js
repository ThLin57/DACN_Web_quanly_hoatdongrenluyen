const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findLeMinhTuan() {
  try {
    const user = await prisma.nguoiDung.findFirst({
      where: {
        ho_ten: {
          contains: 'Lê Minh Tuấn',
          mode: 'insensitive'
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
    
    if (user) {
      console.log('✅ Tìm thấy user Lê Minh Tuấn:');
      console.log('ID:', user.id);
      console.log('Username:', user.ten_dn);
      console.log('Email:', user.email);
      console.log('Vai trò:', user.vai_tro?.ten_vt);
      console.log('MSSV:', user.sinh_vien?.mssv || 'Chưa có');
      console.log('Lớp:', user.sinh_vien?.lop?.ten_lop || 'Chưa có');
      
      return user;
    } else {
      console.log('❌ Không tìm thấy user Lê Minh Tuấn');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findLeMinhTuan();