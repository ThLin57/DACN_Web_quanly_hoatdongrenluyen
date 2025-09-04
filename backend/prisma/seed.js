const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const teacherPassword = await bcrypt.hash('Teacher@123', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);
  // Khoa
  const cntt = await prisma.khoa.upsert({
    where: { tenkhoa: 'Công nghệ thông tin' },
    update: {},
    create: { tenkhoa: 'Công nghệ thông tin', webkhoa: 'https://it.example.edu.vn' },
  });

  // Niên khóa
  const nk2021 = await prisma.nienKhoa.upsert({
    where: { tennk: '2021-2025' },
    update: {},
    create: {
      tennk: '2021-2025',
      namnhaphoc: new Date('2021-09-01'),
      namtotnghiep: new Date('2025-06-30'),
    },
  });

  // Lớp
  const lopD21CNTT01 = await prisma.lop.create({
    data: {
      tenlop: 'D21-CNTT-01',
      sosv: 60,
      khoaid: cntt.id,
      nienkhoaid: nk2021.id,
    },
  });

  // Lớp mặc định cho đăng ký
  const lopMacDinh = await prisma.lop.create({
    data: {
      tenlop: 'Lớp mặc định',
      sosv: 0,
      khoaid: cntt.id,
      nienkhoaid: nk2021.id,
    },
  });

  // Vai trò
  const roleAdmin = await prisma.vaiTro.upsert({
    where: { tenvt: 'admin' },
    update: {},
    create: { tenvt: 'admin', mota: 'Quản trị hệ thống' },
  });
  const roleTeacher = await prisma.vaiTro.upsert({
    where: { tenvt: 'teacher' },
    update: {},
    create: { tenvt: 'teacher', mota: 'Giảng viên' },
  });
  const roleStudent = await prisma.vaiTro.upsert({
    where: { tenvt: 'student' },
    update: {},
    create: { tenvt: 'student', mota: 'Sinh viên' },
  });

  // Người dùng
  const admin = await prisma.nguoiDung.upsert({
    where: { maso: 'AD001' },
    update: {},
    create: {
      maso: 'AD001',
      hoten: 'Quản Trị Viên',
      matkhau: adminPassword,
      lopid: lopD21CNTT01.id,
      vaitroid: roleAdmin.id,
      trangthai: 'hot',
    },
  });

  const gv = await prisma.nguoiDung.upsert({
    where: { maso: 'GV001' },
    update: {},
    create: {
      maso: 'GV001',
      hoten: 'Giảng Viên A',
      matkhau: teacherPassword,
      lopid: lopD21CNTT01.id,
      vaitroid: roleTeacher.id,
      trangthai: 'hot',
    },
  });

  const sv1 = await prisma.nguoiDung.upsert({
    where: { maso: 'SV210001' },
    update: {},
    create: {
      maso: 'SV210001',
      hoten: 'Sinh Viên 1',
      matkhau: studentPassword,
      lopid: lopD21CNTT01.id,
      vaitroid: roleStudent.id,
      trangthai: 'hot',
    },
  });

  // Loại hoạt động
  const loaiTN = await prisma.loaiHoatDong.upsert({
    where: { tenloai: 'Tình nguyện' },
    update: {},
    create: { tenloai: 'Tình nguyện', mausac: '#22c55e', diemmacdinh: 2 },
  });

  // Đợt đánh giá
  const dotHK1 = await prisma.dotDanhGia.create({
    data: {
      tendot: 'HK1 2023-2024',
      namhoc: '2023-2024',
      hocky: 1,
      trangthai: 'dang_mo',
      nguoitaoid: admin.id,
    },
  });

  // Hoạt động
  const hd1 = await prisma.hoatDong.create({
    data: {
      tenhd: 'Hiến máu nhân đạo',
      loaihdid: loaiTN.id,
      dotdgid: dotHK1.id,
      ngaybd: new Date(),
      ngaykt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      trangthaihd: 'duyet',
      nguoitaoid: gv.id,
      diadiemtc: 'Hội trường A',
      sltoida: 200,
    },
  });

  // Đăng ký hoạt động
  await prisma.dangKyHoatDong.create({
    data: {
      svid: sv1.id,
      hdid: hd1.id,
      lydodk: 'Tham gia vì cộng đồng',
    },
  });

  console.log('Seed completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
