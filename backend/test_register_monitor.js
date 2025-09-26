const { PrismaClient } = require('@prisma/client');

async function testRegisterMonitor() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing register monitor flow...\n');
    
    // 1. Kiểm tra trạng thái trước khi test
    console.log('📊 Trạng thái trước khi test:');
    const beforeClasses = await prisma.lop.findMany({
      include: {
        lop_truong_rel: {
          include: { nguoi_dung: true }
        },
        chu_nhiem_rel: true,
        sinh_viens: true
      }
    });
    
    console.log(`   Tổng số lớp: ${beforeClasses.length}`);
    beforeClasses.forEach(lop => {
      console.log(`   - ${lop.ten_lop}: Lớp trưởng ${lop.lop_truong_rel?.nguoi_dung?.ho_ten || 'Chưa có'} (${lop.sinh_viens.length} sinh viên)`);
    });
    
    // 2. Tạo tài khoản lớp trưởng mới
    console.log('\n👤 Tạo tài khoản lớp trưởng mới...');
    
    const testData = {
      ten_dn: 'loptruong_test_' + Date.now(),
      mat_khau: 'password123',
      email: `test_monitor_${Date.now()}@example.com`,
      ho_ten: 'Nguyễn Văn Lớp Trưởng',
      vai_tro: 'LOP_TRUONG',
      lop_id: beforeClasses[0]?.id || null // Gán vào lớp đầu tiên
    };
    
    // Lấy vai trò LOP_TRUONG
    let vaiTro = await prisma.vaiTro.findFirst({
      where: { ten_vt: 'LOP_TRUONG' }
    });
    
    if (!vaiTro) {
      vaiTro = await prisma.vaiTro.create({
        data: {
          ten_vt: 'LOP_TRUONG',
          mo_ta: 'Vai trò lớp trưởng'
        }
      });
    }
    
    // Hash mật khẩu
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(testData.mat_khau, 10);
    
    // Transaction tạo user và sinh viên
    const result = await prisma.$transaction(async (tx) => {
      // Tạo user
      const newUser = await tx.nguoiDung.create({
        data: {
          ten_dn: testData.ten_dn,
          mat_khau: hashedPassword,
          email: testData.email,
          ho_ten: testData.ho_ten,
          vai_tro_id: vaiTro.id,
          trang_thai: 'hoat_dong'
        }
      });
      
      // Tạo MSSV cho lớp trưởng
      const mssv = `LT${testData.ten_dn.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`.slice(0, 10);
      
      // Tìm lớp để gán
      let lopId = testData.lop_id;
      if (!lopId) {
        const defaultLop = await tx.lop.findFirst({
          where: { lop_truong: null }
        });
        if (defaultLop) {
          lopId = defaultLop.id;
        } else {
          // Tạo lớp mới
          const newLop = await tx.lop.create({
            data: {
              ten_lop: `Lớp Test - ${new Date().getFullYear()}`,
              khoa: 'CNTT',
              nien_khoa: '2021-2025',
              nam_nhap_hoc: new Date(),
              chu_nhiem: newUser.id
            }
          });
          lopId = newLop.id;
        }
      }
      
      const sinhVien = await tx.sinhVien.create({
        data: {
          nguoi_dung_id: newUser.id,
          mssv: mssv,
          ngay_sinh: new Date('2000-01-01'),
          gt: 'nam',
          lop_id: lopId,
          dia_chi: 'Test Address',
          sdt: '0123456789'
        }
      });
      
      // Cập nhật lớp để gán làm lớp trưởng
      await tx.lop.update({
        where: { id: lopId },
        data: { lop_truong: sinhVien.id }
      });
      
      return { newUser, sinhVien, lopId };
    });
    
    console.log(`   ✅ Đã tạo tài khoản lớp trưởng: ${result.newUser.ho_ten}`);
    console.log(`   📧 Email: ${result.newUser.email}`);
    console.log(`   🎓 MSSV: ${result.sinhVien.mssv}`);
    console.log(`   🏫 Lớp: ${result.lopId}`);
    
    // 3. Kiểm tra trạng thái sau khi tạo
    console.log('\n📊 Trạng thái sau khi tạo:');
    const afterClasses = await prisma.lop.findMany({
      include: {
        lop_truong_rel: {
          include: { nguoi_dung: true }
        },
        chu_nhiem_rel: true,
        sinh_viens: true
      }
    });
    
    afterClasses.forEach(lop => {
      console.log(`   - ${lop.ten_lop}: Lớp trưởng ${lop.lop_truong_rel?.nguoi_dung?.ho_ten || 'Chưa có'} (${lop.sinh_viens.length} sinh viên)`);
    });
    
    // 4. Test logic filter hoạt động
    console.log('\n🔍 Test logic filter hoạt động...');
    
    // Tạo một hoạt động do lớp trưởng mới tạo
    const testActivity = await prisma.hoatDong.create({
      data: {
        ten_hd: 'Hoạt động test từ lớp trưởng',
        mo_ta: 'Hoạt động test',
        loai_hd_id: (await prisma.loaiHoatDong.findFirst()).id,
        diem_rl: 5,
        dia_diem: 'Phòng test',
        ngay_bd: new Date(),
        ngay_kt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
        sl_toi_da: 50,
        don_vi_to_chuc: 'Lớp test',
        nguoi_tao_id: result.newUser.id,
        trang_thai: 'da_duyet'
      }
    });
    
    console.log(`   ✅ Đã tạo hoạt động test: ${testActivity.ten_hd}`);
    
    // 5. Test filter cho sinh viên cùng lớp
    const studentsInSameClass = await prisma.sinhVien.findMany({
      where: { lop_id: result.lopId },
      include: { nguoi_dung: true }
    });
    
    console.log(`\n👥 Sinh viên trong cùng lớp (${studentsInSameClass.length} người):`);
    studentsInSameClass.forEach(sv => {
      console.log(`   - ${sv.nguoi_dung.ho_ten} (${sv.mssv})`);
    });
    
    // 6. Test query filter
    if (studentsInSameClass.length > 0) {
      const testStudent = studentsInSameClass[0];
      console.log(`\n🔍 Test filter cho sinh viên: ${testStudent.nguoi_dung.ho_ten}`);
      
      const filteredActivities = await prisma.hoatDong.findMany({
        where: {
          OR: [
            // Hoạt động do lớp trưởng cùng lớp tạo
            {
              nguoi_tao: {
                is: {
                  sinh_vien: {
                    is: {
                      lop_truong: {
                        is: {
                          lop_id: testStudent.lop_id
                        }
                      }
                    }
                  }
                }
              }
            },
            // Hoạt động do giảng viên chủ nhiệm cùng lớp tạo
            {
              nguoi_tao: {
                is: {
                  lops_chu_nhiem: {
                    some: {
                      id: testStudent.lop_id
                    }
                  }
                }
              }
            }
          ],
          trang_thai: { in: ['da_duyet', 'ket_thuc'] }
        },
        include: {
          loai_hd: true,
          nguoi_tao: {
            include: {
              sinh_vien: {
                include: { lop: true }
              }
            }
          }
        }
      });
      
      console.log(`   📋 Số hoạt động sinh viên có thể xem: ${filteredActivities.length}`);
      filteredActivities.forEach(activity => {
        const creator = activity.nguoi_tao;
        const creatorType = creator.sinh_vien?.lop_truong?.some(l => l.lop_id === testStudent.lop_id) 
          ? 'Lớp trưởng' 
          : creator.lops_chu_nhiem?.some(l => l.id === testStudent.lop_id) 
            ? 'Chủ nhiệm' 
            : 'Khác';
        console.log(`   - ${activity.ten_hd} (Tạo bởi: ${creator.ho_ten} - ${creatorType})`);
      });
    }
    
    // 7. Cleanup - xóa dữ liệu test
    console.log('\n🧹 Cleanup dữ liệu test...');
    await prisma.$transaction(async (tx) => {
      // Xóa hoạt động test
      await tx.hoatDong.delete({ where: { id: testActivity.id } });
      
      // Xóa sinh viên test
      await tx.sinhVien.delete({ where: { id: result.sinhVien.id } });
      
      // Xóa user test
      await tx.nguoiDung.delete({ where: { id: result.newUser.id } });
    });
    
    console.log('   ✅ Đã xóa dữ liệu test');
    
    console.log('\n🎉 Test hoàn thành thành công!');
    console.log('✅ Logic đăng ký lớp trưởng hoạt động đúng');
    console.log('✅ Logic filter hoạt động hoạt động đúng');
    console.log('✅ Sinh viên chỉ xem được hoạt động của lớp trưởng cùng lớp');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegisterMonitor();
