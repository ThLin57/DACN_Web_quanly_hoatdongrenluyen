const { prisma } = require('./src/config/database');

async function checkActivitiesStatus() {
  try {
    console.log('=== KIỂM TRA TRẠNG THÁI HOẠT ĐỘNG ===\n');
    
    const activities = await prisma.hoatDong.findMany({
      select: { id: true, ten_hd: true, trang_thai: true, nguoi_tao_id: true }
    });
    
    console.log('Tất cả hoạt động và trạng thái:');
    activities.forEach((hd, index) => {
      console.log(`${index + 1}. ${hd.ten_hd}`);
      console.log(`   Trạng thái: ${hd.trang_thai}`);
      console.log(`   Người tạo: ${hd.nguoi_tao_id}`);
      console.log('');
    });
    
    const approvedActivities = activities.filter(hd => hd.trang_thai === 'da_duyet');
    console.log(`Số hoạt động đã duyệt: ${approvedActivities.length}/${activities.length}`);
    
    if (approvedActivities.length === 0) {
      console.log('\nCẦN CẬP NHẬT: Không có hoạt động nào đã duyệt. Sẽ cập nhật tất cả về trạng thái "da_duyet"...');
      
      await prisma.hoatDong.updateMany({
        data: { trang_thai: 'da_duyet' }
      });
      
      console.log('✅ Đã cập nhật tất cả hoạt động về trạng thái "da_duyet"');
    }
    
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivitiesStatus();