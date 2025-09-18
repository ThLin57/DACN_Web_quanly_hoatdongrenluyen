const { PrismaClient } = require('@prisma/client');

async function checkStatus() {
  const prisma = new PrismaClient();
  
  try {
    // Count by status
    const statusCount = await prisma.hoatDong.groupBy({
      by: ['trang_thai'],
      _count: { id: true }
    });
    
    console.log('Activities by status:');
    statusCount.forEach(r => {
      console.log(`- ${r.trang_thai}: ${r._count.id} activities`);
    });
    
    // Total count
    const total = await prisma.hoatDong.count();
    console.log(`\nTotal activities: ${total}`);
    
    // Count approved only
    const approved = await prisma.hoatDong.count({
      where: { trang_thai: 'da_duyet' }
    });
    console.log(`Approved activities: ${approved}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
