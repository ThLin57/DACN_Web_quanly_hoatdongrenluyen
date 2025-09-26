const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActivities() {
  try {
    console.log('🔍 Kiểm tra tất cả hoạt động trong database...');
    
    // 1. Đếm tổng số hoạt động
    const totalCount = await prisma.hoatDong.count();
    console.log('📊 Tổng số hoạt động:', totalCount);
    
    // 2. Lấy tất cả hoạt động với thông tin chi tiết
    const allActivities = await prisma.hoatDong.findMany({
      include: {
        loai_hd: true,
        nguoi_tao: {
          include: {
            sinh_vien: {
              include: {
                lop: true
              }
            }
          }
        }
      },
      orderBy: { ngay_tao: 'desc' }
    });
    
    console.log('\n📋 Chi tiết từng hoạt động:');
    allActivities.forEach((hd, index) => {
      console.log(`${index + 1}. ID: ${hd.id}`);
      console.log(`   Tên: ${hd.ten_hd}`);
      console.log(`   Trạng thái: ${hd.trang_thai}`);
      console.log(`   Người tạo: ${hd.nguoi_tao?.ho_ten || hd.nguoi_tao?.ten_dn}`);
      console.log(`   Vai trò người tạo: ${hd.nguoi_tao?.vai_tro?.ten_vt || 'N/A'}`);
      console.log(`   Lớp người tạo: ${hd.nguoi_tao?.sinh_vien?.lop?.ten_lop || 'N/A'}`);
      console.log(`   Ngày tạo: ${hd.ngay_tao}`);
      console.log('');
    });
    
    // 3. Phân tích theo trạng thái
    console.log('📈 Phân tích theo trạng thái:');
    const statusCount = {};
    allActivities.forEach(hd => {
      statusCount[hd.trang_thai] = (statusCount[hd.trang_thai] || 0) + 1;
    });
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} hoạt động`);
    });
    
    // 4. Kiểm tra filter cho sinh viên
    console.log('\n🎯 Mô phỏng filter cho sinh viên:');
    const studentFilter = {
      trang_thai: { in: ['da_duyet', 'ket_thuc'] }
    };
    
    const filteredActivities = await prisma.hoatDong.findMany({
      where: studentFilter,
      include: {
        loai_hd: true,
        nguoi_tao: {
          include: {
            sinh_vien: {
              include: {
                lop: true
              }
            }
          }
        }
      }
    });
    
    console.log(`📊 Hoạt động sau khi filter (da_duyet, ket_thuc): ${filteredActivities.length}`);
    filteredActivities.forEach((hd, index) => {
      console.log(`${index + 1}. ${hd.ten_hd} - ${hd.trang_thai}`);
    });
    
    // 5. Kiểm tra các trạng thái khác
    console.log('\n🔍 Kiểm tra các trạng thái khác:');
    const otherStatuses = ['cho_duyet', 'tu_choi', 'da_huy'];
    for (const status of otherStatuses) {
      const count = await prisma.hoatDong.count({
        where: { trang_thai: status }
      });
      if (count > 0) {
        console.log(`   ${status}: ${count} hoạt động`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivities();
