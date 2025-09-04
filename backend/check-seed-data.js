require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function maskDatabaseUrl(databaseUrl) {
  try {
    const u = new URL(databaseUrl);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return '(invalid DATABASE_URL)';
  }
}

async function checkConnection() {
  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const ms = Date.now() - start;
  console.log(`\n🔌 Database connection OK (${ms}ms)`);
}

async function checkSeededData() {
  try {
    const dbInfo = maskDatabaseUrl(process.env.DATABASE_URL || '');
    console.log('🔍 Checking database & seeded data...\n');
    console.log(`ENV: PORT=${process.env.PORT || 3000}, NODE_ENV=${process.env.NODE_ENV || 'development'}`);
    console.log(`DATABASE_URL: ${dbInfo}`);

    await checkConnection();
    
    // Kiểm tra Khoa
    const khoaCount = await prisma.khoa.count();
    const khoas = await prisma.khoa.findMany();
    console.log(`📚 Khoa: ${khoaCount} records`);
    khoas.forEach(k => console.log(`   - ${k.tenkhoa}`));
    
    // Kiểm tra Vai trò
    const vaiTroCount = await prisma.vaiTro.count();
    const vaiTros = await prisma.vaiTro.findMany();
    console.log(`\n👤 Vai trò: ${vaiTroCount} records`);
    vaiTros.forEach(v => console.log(`   - ${v.tenvt}: ${v.mota}`));
    
    // Kiểm tra Người dùng
    const nguoiDungCount = await prisma.nguoiDung.count();
    const nguoiDungs = await prisma.nguoiDung.findMany({
      include: {
        vaiTro: true,
        lop: {
          include: {
            khoa: true
          }
        }
      }
    });
    console.log(`\n🧑‍🎓 Người dùng: ${nguoiDungCount} records`);
    nguoiDungs.forEach(u => console.log(
      `   - ${u.maso}: ${u.hoten} (${u.vaiTro?.tenvt})`
    ));
    
    // Kiểm tra Hoạt động
    const hoatDongCount = await prisma.hoatDong.count();
    const hoatDongs = await prisma.hoatDong.findMany({
      include: {
        loaiHoatDong: true,
        dotDanhGia: true
      }
    });
    console.log(`\n🎯 Hoạt động: ${hoatDongCount} records`);
    hoatDongs.forEach(h => console.log(
      `   - ${h.tenhd} (${h.loaiHoatDong?.tenloai})`
    ));
    
    // Kiểm tra Đăng ký hoạt động
    const dangKyCount = await prisma.dangKyHoatDong.count();
    const dangKys = await prisma.dangKyHoatDong.findMany({
      include: {
        sinhVien: true,
        hoatDong: true
      }
    });
    console.log(`\n📝 Đăng ký hoạt động: ${dangKyCount} records`);
    dangKys.forEach(d => console.log(
      `   - ${d.sinhVien.hoten} đăng ký "${d.hoatDong.tenhd}"`
    ));
    
    console.log('\n✅ Seed data verification completed!');
    
    // Tổng kết
    console.log('\n📊 SUMMARY:');
    console.log(`   Khoa: ${khoaCount}`);
    console.log(`   Vai trò: ${vaiTroCount}`);
    console.log(`   Người dùng: ${nguoiDungCount}`);
    console.log(`   Hoạt động: ${hoatDongCount}`);
    console.log(`   Đăng ký: ${dangKyCount}`);

    // Cảnh báo nếu thiếu dữ liệu seed tối thiểu
    let hasIssues = false;
    if (khoaCount === 0) { console.warn('⚠️  Chưa có bản ghi Khoa.'); hasIssues = true; }
    if (vaiTroCount === 0) { console.warn('⚠️  Chưa có Vai trò.'); hasIssues = true; }
    if (nguoiDungCount === 0) { console.warn('⚠️  Chưa có Người dùng.'); hasIssues = true; }

    if (hasIssues) {
      console.warn('\n❗ Có thiếu dữ liệu seed tối thiểu. Vui lòng chạy script seed hoặc kiểm tra lại migration.');
      process.exitCode = 2;
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
    if (String(error.code) === 'P1000') {
      console.error('Hint: Sai thông tin đăng nhập DB. Kiểm tra POSTGRES_PASSWORD trong docker-compose và DATABASE_URL trong .env.');
    }
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkSeededData();
