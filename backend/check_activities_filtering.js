const { prisma } = require('./src/config/database');

async function checkActivitiesFiltering() {
  try {
    console.log('=== KIỂM TRA LOGIC LỌC HOẠT ĐỘNG ===\n');
    
    // 1. Liệt kê tất cả user để tìm user phù hợp
    console.log('1. Tất cả người dùng:');
    const allUsers = await prisma.nguoiDung.findMany({
      select: { id: true, ho_ten: true, vai_tro: true, sinh_vien: { select: { mssv: true, lop_id: true } } }
    });
    
    allUsers.forEach(user => {
      console.log(`   ID: ${user.id} | Họ tên: ${user.ho_ten} | Vai trò: ${user.vai_tro} | MSSV: ${user.sinh_vien?.mssv || 'N/A'} | Lớp: ${user.sinh_vien?.lop_id || 'N/A'}`);
    });
    
    // 2. Tìm user có MSSV 2021003
    const user = allUsers.find(u => u.sinh_vien?.mssv === '2021003');
    console.log('\n2. User có MSSV 2021003:');
    if (user) {
      console.log('   ID:', user.id);
      console.log('   Họ tên:', user.ho_ten);
      console.log('   Vai trò:', user.vai_tro);
      console.log('   Lớp:', user.sinh_vien?.lop_id);
    } else {
      console.log('   Không tìm thấy user có MSSV 2021003');
      return;
    }
    
    // 3. Kiểm tra tất cả hoạt động và người tạo
    const activities = await prisma.hoatDong.findMany({
      include: { 
        nguoi_tao: { 
          select: { ho_ten: true, sinh_vien: { select: { mssv: true, lop_id: true } } }
        }
      }
    });
    
    console.log('\n3. Tất cả hoạt động trong DB:');
    activities.forEach((hd, index) => {
      console.log(`   ${index + 1}. ID: ${hd.id} | Tên: ${hd.ten_hd}`);
      console.log(`      Người tạo: ${hd.nguoi_tao_id}`);
      console.log(`      Tên người tạo: ${hd.nguoi_tao?.ho_ten || 'N/A'}`);
      console.log(`      MSSV người tạo: ${hd.nguoi_tao?.sinh_vien?.mssv || 'N/A'}`);
      console.log(`      Lớp người tạo: ${hd.nguoi_tao?.sinh_vien?.lop_id || 'N/A'}`);
      console.log('');
    });
    
    // 4. Kiểm tra hoạt động nào cùng lớp với sinh viên 2021003
    if (user?.sinh_vien?.lop_id) {
      console.log(`4. Hoạt động cùng lớp với sinh viên MSSV 2021003 (lop_id: ${user.sinh_vien.lop_id}):`);
      const sameClassActivities = activities.filter(hd => 
        hd.nguoi_tao?.sinh_vien?.lop_id === user.sinh_vien.lop_id
      );
      console.log(`   Số lượng: ${sameClassActivities.length}`);
      sameClassActivities.forEach((hd, index) => {
        console.log(`   ${index + 1}. ${hd.ten_hd}`);
      });
      console.log('');
    }
    
    // 5. Mô phỏng query trong activities route với điều kiện lọc
    console.log('5. Mô phỏng query với điều kiện lọc sinh viên:');
    if (user?.sinh_vien?.lop_id) {
      const filteredActivities = await prisma.hoatDong.findMany({
        where: {
          nguoi_tao: { 
            is: { 
              sinh_vien: { 
                is: { 
                  lop_id: user.sinh_vien.lop_id 
                } 
              } 
            } 
          }
        },
        include: { loai_hd: true }
      });
      
      console.log(`   Kết quả: ${filteredActivities.length} hoạt động`);
      filteredActivities.forEach((hd, index) => {
        console.log(`   ${index + 1}. ${hd.ten_hd}`);
      });
    }
    
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivitiesFiltering();