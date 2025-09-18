const { PrismaClient } = require('@prisma/client');

async function checkActivities() {
  const prisma = new PrismaClient();
  
  try {
    // Check approved activities
    const approved = await prisma.hoatDong.findMany({
      where: { trang_thai: 'da_duyet' },
      include: { loai_hd: true },
      take: 5
    });
    
    console.log('Approved activities count:', approved.length);
    approved.forEach(a => {
      console.log(`- ${a.ten_hd} (${a.loai_hd?.ten_loai_hd}) - ${a.trang_thai}`);
    });
    
    // Check all activities count
    const total = await prisma.hoatDong.count();
    console.log('Total activities:', total);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivities();
