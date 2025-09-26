const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function fixDatabaseConsistency() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Sửa lại tính nhất quán dữ liệu...\n');
    
    // 1. Kiểm tra dữ liệu hiện tại
    console.log('📊 Kiểm tra dữ liệu hiện tại...');
    
    const lopTruongUsers = await prisma.nguoiDung.findMany({
      where: {
        vai_tro: {
          ten_vt: 'LOP_TRUONG'
        }
      },
      include: {
        sinh_vien: true
      }
    });
    
    const classes = await prisma.lop.findMany({
      include: {
        lop_truong_rel: {
          include: { nguoi_dung: true }
        }
      }
    });
    
    console.log(`   - Người dùng LOP_TRUONG: ${lopTruongUsers.length}`);
    console.log(`   - Lớp: ${classes.length}`);
    
    // 2. Xóa dữ liệu không nhất quán
    console.log('\n🗑️ Xóa dữ liệu không nhất quán...');
    
    // Xóa tất cả dữ liệu để bắt đầu lại
    await prisma.dangKyHoatDong.deleteMany();
    await prisma.hoatDong.deleteMany();
    await prisma.sinhVien.deleteMany();
    await prisma.lop.deleteMany();
    await prisma.nguoiDung.deleteMany();
    await prisma.vaiTro.deleteMany();
    
    console.log('✅ Đã xóa dữ liệu cũ');
    
    // 3. Tạo dữ liệu mẫu nhất quán
    console.log('\n🏗️ Tạo dữ liệu mẫu nhất quán...');
    
    // Tạo vai trò
    const vaiTroSinhVien = await prisma.vaiTro.create({
      data: {
        ten_vt: 'SINH_VIEN',
        mo_ta: 'Sinh viên'
      }
    });
    
    const vaiTroLopTruong = await prisma.vaiTro.create({
      data: {
        ten_vt: 'LOP_TRUONG',
        mo_ta: 'Lớp trưởng'
      }
    });
    
    const vaiTroGiangVien = await prisma.vaiTro.create({
      data: {
        ten_vt: 'GIANG_VIEN',
        mo_ta: 'Giảng viên'
      }
    });
    
    const vaiTroAdmin = await prisma.vaiTro.create({
      data: {
        ten_vt: 'ADMIN',
        mo_ta: 'Quản trị viên'
      }
    });
    
    // Tạo giảng viên
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const giangVien = await prisma.nguoiDung.create({
      data: {
        ten_dn: 'giangvien',
        mat_khau: hashedPassword,
        email: 'giangvien@example.com',
        ho_ten: 'Nguyễn Văn Giảng Viên',
        vai_tro_id: vaiTroGiangVien.id,
        trang_thai: 'hoat_dong'
      }
    });
    
    // Tạo admin
    const admin = await prisma.nguoiDung.create({
      data: {
        ten_dn: 'admin',
        mat_khau: hashedPassword,
        email: 'admin@example.com',
        ho_ten: 'Nguyễn Văn Admin',
        vai_tro_id: vaiTroAdmin.id,
        trang_thai: 'hoat_dong'
      }
    });
    
    // Tạo lớp
    const lop1 = await prisma.lop.create({
      data: {
        ten_lop: 'CNTT01-K66',
        khoa: 'CNTT',
        nien_khoa: '2021-2025',
        nam_nhap_hoc: new Date('2021-09-01'),
        chu_nhiem: giangVien.id
      }
    });
    
    const lop2 = await prisma.lop.create({
      data: {
        ten_lop: 'CNTT02-K66',
        khoa: 'CNTT',
        nien_khoa: '2021-2025',
        nam_nhap_hoc: new Date('2021-09-01'),
        chu_nhiem: giangVien.id
      }
    });
    
    // Tạo sinh viên thường
    const sinhVien1 = await prisma.nguoiDung.create({
      data: {
        ten_dn: 'sinhvien1',
        mat_khau: hashedPassword,
        email: 'sinhvien1@example.com',
        ho_ten: 'Nguyễn Văn Sinh Viên 1',
        vai_tro_id: vaiTroSinhVien.id,
        trang_thai: 'hoat_dong'
      }
    });
    
    const sinhVien2 = await prisma.nguoiDung.create({
      data: {
        ten_dn: 'sinhvien2',
        mat_khau: hashedPassword,
        email: 'sinhvien2@example.com',
        ho_ten: 'Nguyễn Văn Sinh Viên 2',
        vai_tro_id: vaiTroSinhVien.id,
        trang_thai: 'hoat_dong'
      }
    });
    
    // Tạo lớp trưởng
    const lopTruong1 = await prisma.nguoiDung.create({
      data: {
        ten_dn: 'loptruong1',
        mat_khau: hashedPassword,
        email: 'loptruong1@example.com',
        ho_ten: 'Nguyễn Văn Lớp Trưởng 1',
        vai_tro_id: vaiTroLopTruong.id,
        trang_thai: 'hoat_dong'
      }
    });
    
    const lopTruong2 = await prisma.nguoiDung.create({
      data: {
        ten_dn: 'loptruong2',
        mat_khau: hashedPassword,
        email: 'loptruong2@example.com',
        ho_ten: 'Nguyễn Văn Lớp Trưởng 2',
        vai_tro_id: vaiTroLopTruong.id,
        trang_thai: 'hoat_dong'
      }
    });
    
    // Tạo record sinh viên
    const sv1 = await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: sinhVien1.id,
        mssv: 'SV001',
        ngay_sinh: new Date('2000-01-01'),
        gt: 'nam',
        lop_id: lop1.id,
        dia_chi: 'Hà Nội',
        sdt: '0123456789'
      }
    });
    
    const sv2 = await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: sinhVien2.id,
        mssv: 'SV002',
        ngay_sinh: new Date('2000-02-01'),
        gt: 'nu',
        lop_id: lop1.id,
        dia_chi: 'TP.HCM',
        sdt: '0123456788'
      }
    });
    
    // Tạo record sinh viên cho lớp trưởng
    const lt1 = await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: lopTruong1.id,
        mssv: 'LT001',
        ngay_sinh: new Date('1999-12-01'),
        gt: 'nam',
        lop_id: lop1.id,
        dia_chi: 'Hà Nội',
        sdt: '0123456787'
      }
    });
    
    const lt2 = await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: lopTruong2.id,
        mssv: 'LT002',
        ngay_sinh: new Date('1999-11-01'),
        gt: 'nu',
        lop_id: lop2.id,
        dia_chi: 'Đà Nẵng',
        sdt: '0123456786'
      }
    });
    
    // Cập nhật lớp để gán lớp trưởng
    await prisma.lop.update({
      where: { id: lop1.id },
      data: { lop_truong: lt1.id }
    });
    
    await prisma.lop.update({
      where: { id: lop2.id },
      data: { lop_truong: lt2.id }
    });
    
    console.log('✅ Đã tạo dữ liệu mẫu nhất quán');
    
    // 4. Kiểm tra kết quả
    console.log('\n📊 Kiểm tra kết quả:');
    
    const finalClasses = await prisma.lop.findMany({
      include: {
        lop_truong_rel: {
          include: { nguoi_dung: true }
        },
        sinh_viens: true
      }
    });
    
    finalClasses.forEach((lop, index) => {
      console.log(`   ${index + 1}. ${lop.ten_lop} (${lop.khoa})`);
      console.log(`      - Lớp trưởng: ${lop.lop_truong_rel ? lop.lop_truong_rel.nguoi_dung.ho_ten : 'Chưa có'}`);
      console.log(`      - MSSV: ${lop.lop_truong_rel?.mssv || 'N/A'}`);
      console.log(`      - Số sinh viên: ${lop.sinh_viens.length}`);
    });
    
    // 5. Kiểm tra tính nhất quán
    console.log('\n🔍 Kiểm tra tính nhất quán:');
    let consistent = true;
    
    for (const lop of finalClasses) {
      if (lop.lop_truong_rel) {
        const user = await prisma.nguoiDung.findUnique({
          where: { id: lop.lop_truong_rel.nguoi_dung_id }
        });
        
        if (user && user.vai_tro_id === vaiTroLopTruong.id) {
          console.log(`   ✅ ${lop.ten_lop}: Lớp trưởng đúng vai trò`);
        } else {
          console.log(`   ❌ ${lop.ten_lop}: Lớp trưởng sai vai trò`);
          consistent = false;
        }
      }
    }
    
    if (consistent) {
      console.log('\n🎉 Dữ liệu đã nhất quán!');
    } else {
      console.log('\n❌ Vẫn còn vấn đề về tính nhất quán');
    }
    
    console.log('\n📝 Tài khoản demo:');
    console.log('   - Admin: admin / password123');
    console.log('   - Giảng viên: giangvien / password123');
    console.log('   - Lớp trưởng 1: loptruong1 / password123');
    console.log('   - Lớp trưởng 2: loptruong2 / password123');
    console.log('   - Sinh viên 1: sinhvien1 / password123');
    console.log('   - Sinh viên 2: sinhvien2 / password123');
    
  } catch (error) {
    console.error('❌ Lỗi sửa dữ liệu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseConsistency();
