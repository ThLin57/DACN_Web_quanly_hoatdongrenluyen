/* Seed sample data for Student Activity Management System */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertVaiTro(ten_vt, mo_ta, quyen_han = null) {
  return prisma.vaiTro.upsert({
    where: { ten_vt },
    update: {},
    create: { ten_vt, mo_ta, quyen_han },
  });
}

async function createNguoiDung({ ten_dn, email, ho_ten, mat_khau, vai_tro_id }) {
  return prisma.nguoiDung.create({
    data: {
      ten_dn,
      email,
      ho_ten,
      mat_khau,
      vai_tro_id,
      trang_thai: 'hoat_dong',
    },
  });
}

async function main() {
  console.log('🌱 Starting seed process...');

  // 1) Vai trò với quyền hạn chi tiết
  console.log('📋 Creating roles...');
  const vtAdmin = await upsertVaiTro(
    'ADMIN',
    'Quản trị viên hệ thống',
    {
      permissions: ['manage_users', 'manage_activities', 'view_reports', 'manage_system']
    }
  );
  
  const vtGiangVien = await upsertVaiTro(
    'GIANG_VIEN',
    'Giảng viên, chủ nhiệm lớp',
    {
      permissions: ['manage_class', 'approve_activities', 'view_student_reports', 'create_notifications']
    }
  );
  
  const vtLopTruong = await upsertVaiTro(
    'LOP_TRUONG',
    'Lớp trưởng',
    {
      permissions: ['create_activities', 'manage_registrations', 'view_class_reports']
    }
  );
  
  const vtSinhVien = await upsertVaiTro(
    'SINH_VIEN',
    'Sinh viên',
    {
      permissions: ['register_activities', 'view_personal_score', 'attend_activities']
    }
  );

  // 2) Tạo nhiều người dùng đại diện cho các vai trò
  console.log('👥 Creating users...');
  const usersSpec = [
    { vt: vtAdmin, ten_dn: 'admin', email: 'admin@dlu.edu.vn', ho_ten: 'Quản Trị Viên', password: 'Admin@123' },
    { vt: vtGiangVien, ten_dn: 'gv001', email: 'nguyenvana@dlu.edu.vn', ho_ten: 'Nguyễn Văn A', password: 'Teacher@123' },
    { vt: vtGiangVien, ten_dn: 'gv002', email: 'lethib@dlu.edu.vn', ho_ten: 'Lê Thị B', password: 'Teacher@123' },
    { vt: vtLopTruong, ten_dn: 'lt001', email: 'tranvanc@dlu.edu.vn', ho_ten: 'Trần Văn C', password: 'Monitor@123' },
    { vt: vtLopTruong, ten_dn: 'lt002', email: 'phamthid@dlu.edu.vn', ho_ten: 'Phạm Thị D', password: 'Monitor@123' },
    { vt: vtSinhVien, ten_dn: '2021001', email: '2021001@dlu.edu.vn', ho_ten: 'Hoàng Văn Nam', password: 'Student@123' },
    { vt: vtSinhVien, ten_dn: '2021002', email: '2021002@dlu.edu.vn', ho_ten: 'Nguyễn Thị Mai', password: 'Student@123' },
    { vt: vtSinhVien, ten_dn: '2021003', email: '2021003@dlu.edu.vn', ho_ten: 'Lê Minh Tuấn', password: 'Student@123' },
    { vt: vtSinhVien, ten_dn: '2021004', email: '2021004@dlu.edu.vn', ho_ten: 'Trần Thị Lan', password: 'Student@123' },
    { vt: vtSinhVien, ten_dn: '2021005', email: '2021005@dlu.edu.vn', ho_ten: 'Phạm Văn Hùng', password: 'Student@123' },
  ];

  const users = [];
  for (const spec of usersSpec) {
    const hashed = await bcrypt.hash(spec.password, 10);
    const created = await createNguoiDung({
      ten_dn: spec.ten_dn,
      email: spec.email,
      ho_ten: spec.ho_ten,
      mat_khau: hashed,
      vai_tro_id: spec.vt.id,
    }).catch(async () => {
      return prisma.nguoiDung.findUnique({ where: { ten_dn: spec.ten_dn } });
    });
    users.push(created);
  }

  const adminUser = users.find((u) => u.ten_dn === 'admin');
  const giangVien1 = users.find((u) => u.ten_dn === 'gv001');
  const giangVien2 = users.find((u) => u.ten_dn === 'gv002');
  const lopTruong1 = users.find((u) => u.ten_dn === 'lt001');
  const lopTruong2 = users.find((u) => u.ten_dn === 'lt002');
  const sinhViens = users.filter(u => u.ten_dn.startsWith('2021'));

  // 3) Tạo nhiều lớp học
  console.log('🏫 Creating classes...');
  const lopCTK46A = await prisma.lop.upsert({
    where: { ten_lop: 'CTK46A' },
    update: {},
    create: {
      ten_lop: 'CTK46A',
      khoa: 'Công nghệ thông tin',
      nien_khoa: 'K46',
      nam_nhap_hoc: new Date('2021-09-01'),
      nam_tot_nghiep: new Date('2025-06-30'),
      chu_nhiem: giangVien1.id,
      lop_truong: null,
    },
  });

  const lopCTK46B = await prisma.lop.upsert({
    where: { ten_lop: 'CTK46B' },
    update: {},
    create: {
      ten_lop: 'CTK46B',
      khoa: 'Công nghệ thông tin',
      nien_khoa: 'K46',
      nam_nhap_hoc: new Date('2021-09-01'),
      nam_tot_nghiep: new Date('2025-06-30'),
      chu_nhiem: giangVien2.id,
      lop_truong: null,
    },
  });

  // 4) Tạo sinh viên và gán lớp trưởng
  console.log('🎓 Creating students...');
  const sinhVienData = [
    { user: lopTruong1, lop: lopCTK46A, mssv: '2021001', isLopTruong: true },
    { user: lopTruong2, lop: lopCTK46B, mssv: '2021002', isLopTruong: true },
    { user: sinhViens[2], lop: lopCTK46A, mssv: '2021003', isLopTruong: false },
    { user: sinhViens[3], lop: lopCTK46A, mssv: '2021004', isLopTruong: false },
    { user: sinhViens[4], lop: lopCTK46B, mssv: '2021005', isLopTruong: false },
  ];

  const createdSinhViens = [];
  for (const data of sinhVienData) {
    const sv = await prisma.sinhVien.upsert({
      where: { nguoi_dung_id: data.user.id },
      update: {},
      create: {
        nguoi_dung_id: data.user.id,
        mssv: data.mssv,
        ngay_sinh: new Date('2003-01-15'),
        gt: Math.random() > 0.5 ? 'nam' : 'nu',
        lop_id: data.lop.id,
        dia_chi: 'TP. Hồ Chí Minh',
        sdt: `091234567${Math.floor(Math.random() * 10)}`,
      },
    });
    createdSinhViens.push({ ...sv, isLopTruong: data.isLopTruong });
  }

  await prisma.lop.update({
    where: { id: lopCTK46A.id },
    data: { lop_truong: createdSinhViens.find(sv => sv.mssv === '2021001').id },
  });
  await prisma.lop.update({
    where: { id: lopCTK46B.id },
    data: { lop_truong: createdSinhViens.find(sv => sv.mssv === '2021002').id },
  });

  // 5) Loại hoạt động
  console.log('📚 Creating activity types...');
  const loaiHoatDongs = await Promise.all([
    prisma.loaiHoatDong.upsert({
      where: { ten_loai_hd: 'Tình nguyện' },
      update: {},
      create: {
        ten_loai_hd: 'Tình nguyện',
        mo_ta: 'Các hoạt động tình nguyện, thiện nguyện',
        diem_mac_dinh: 2.5,
        diem_toi_da: 10.0,
        mau_sac: '#22c55e',
        nguoi_tao_id: adminUser.id,
      },
    }),
    prisma.loaiHoatDong.upsert({
      where: { ten_loai_hd: 'Thể thao' },
      update: {},
      create: {
        ten_loai_hd: 'Thể thao',
        mo_ta: 'Các hoạt động thể thao, giải đấu',
        diem_mac_dinh: 3.0,
        diem_toi_da: 8.0,
        mau_sac: '#3b82f6',
        nguoi_tao_id: adminUser.id,
      },
    }),
    prisma.loaiHoatDong.upsert({
      where: { ten_loai_hd: 'Văn nghệ' },
      update: {},
      create: {
        ten_loai_hd: 'Văn nghệ',
        mo_ta: 'Các hoạt động văn hóa, nghệ thuật',
        diem_mac_dinh: 2.0,
        diem_toi_da: 7.0,
        mau_sac: '#f59e0b',
        nguoi_tao_id: adminUser.id,
      },
    }),
    prisma.loaiHoatDong.upsert({
      where: { ten_loai_hd: 'Học thuật' },
      update: {},
      create: {
        ten_loai_hd: 'Học thuật',
        mo_ta: 'Hội thảo, seminar, nghiên cứu khoa học',
        diem_mac_dinh: 4.0,
        diem_toi_da: 10.0,
        mau_sac: '#8b5cf6',
        nguoi_tao_id: adminUser.id,
      },
    }),
    prisma.loaiHoatDong.upsert({
      where: { ten_loai_hd: 'Đoàn - Hội' },
      update: {},
      create: {
        ten_loai_hd: 'Đoàn - Hội',
        mo_ta: 'Hoạt động của Đoàn thanh niên, Hội sinh viên',
        diem_mac_dinh: 3.5,
        diem_toi_da: 9.0,
        mau_sac: '#ef4444',
        nguoi_tao_id: adminUser.id,
      },
    }),
  ]);

  // 6) Tạo nhiều hoạt động với trạng thái khác nhau
  console.log('🎯 Creating activities...');
  const currentDate = new Date();
  const tomorrow = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.hoatDong.createMany({
    data: [
      {
        ma_hd: 'HD001',
        ten_hd: 'Chiến dịch Mùa hè xanh 2024',
        mo_ta: 'Tham gia các hoạt động tình nguyện tại vùng nông thôn, giúp đỡ bà con nông dân',
        loai_hd_id: loaiHoatDongs[0].id,
        diem_rl: 8.0,
        dia_diem: 'Tỉnh Đồng Nai',
        ngay_bd: nextWeek,
        ngay_kt: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
        han_dk: tomorrow,
        sl_toi_da: 100,
        don_vi_to_chuc: 'Đoàn Thanh niên trường',
        yeu_cau_tham_gia: 'Sức khỏe tốt, có tinh thần tình nguyện cao',
        trang_thai: 'da_duyet',
        co_chung_chi: true,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2024-2025',
        nguoi_tao_id: giangVien1.id,
        hinh_anh: [],
        tep_dinh_kem: [],
      },
      {
        ma_hd: 'HD002',
        ten_hd: 'Giải bóng đá sinh viên',
        mo_ta: 'Giải đấu bóng đá thường niên dành cho sinh viên toàn trường',
        loai_hd_id: loaiHoatDongs[1].id,
        diem_rl: 5.0,
        dia_diem: 'Sân vận động trường',
        ngay_bd: nextMonth,
        ngay_kt: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
        han_dk: nextWeek,
        sl_toi_da: 200,
        don_vi_to_chuc: 'CLB Thể thao',
        yeu_cau_tham_gia: 'Biết chơi bóng đá, có tinh thần đồng đội',
        trang_thai: 'da_duyet',
        co_chung_chi: false,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2024-2025',
        nguoi_tao_id: lopTruong1.id,
        hinh_anh: [],
        tep_dinh_kem: [],
      },
      {
        ma_hd: 'HD003',
        ten_hd: 'Đêm nhạc acoustic',
        mo_ta: 'Đêm nhạc dành cho sinh viên yêu thích âm nhạc',
        loai_hd_id: loaiHoatDongs[2].id,
        diem_rl: 3.0,
        dia_diem: 'Hội trường A',
        ngay_bd: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
        ngay_kt: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        han_dk: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        sl_toi_da: 150,
        don_vi_to_chuc: 'CLB Âm nhạc',
        yeu_cau_tham_gia: 'Yêu thích âm nhạc',
        trang_thai: 'cho_duyet',
        co_chung_chi: false,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2024-2025',
        nguoi_tao_id: lopTruong2.id,
        hinh_anh: [],
        tep_dinh_kem: [],
      },
      {
        ma_hd: 'HD004',
        ten_hd: 'Hội thảo AI trong giáo dục',
        mo_ta: 'Hội thảo về ứng dụng trí tuệ nhân tạo trong lĩnh vực giáo dục',
        loai_hd_id: loaiHoatDongs[3].id,
        diem_rl: 6.0,
        dia_diem: 'Phòng hội nghị B',
        ngay_bd: new Date(nextWeek.getTime() + 10 * 24 * 60 * 60 * 1000),
        ngay_kt: new Date(nextWeek.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        han_dk: new Date(nextWeek.getTime() + 8 * 24 * 60 * 60 * 1000),
        sl_toi_da: 80,
        don_vi_to_chuc: 'Khoa CNTT',
        yeu_cau_tham_gia: 'Sinh viên khoa CNTT, có hiểu biết cơ bản về AI',
        trang_thai: 'da_duyet',
        co_chung_chi: true,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2024-2025',
        nguoi_tao_id: giangVien2.id,
        hinh_anh: [],
        tep_dinh_kem: [],
      },
      {
        ma_hd: 'HD005',
        ten_hd: 'Ngày hội việc làm 2024',
        mo_ta: 'Sự kiện kết nối sinh viên với doanh nghiệp',
        loai_hd_id: loaiHoatDongs[4].id,
        diem_rl: 4.0,
        dia_diem: 'Trung tâm hội nghị',
        ngay_bd: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000),
        ngay_kt: new Date(currentDate.getTime() - 9 * 24 * 60 * 60 * 1000),
        han_dk: new Date(currentDate.getTime() - 12 * 24 * 60 * 60 * 1000),
        sl_toi_da: 300,
        don_vi_to_chuc: 'Phòng Đào tạo',
        yeu_cau_tham_gia: 'Sinh viên năm cuối',
        trang_thai: 'ket_thuc',
        co_chung_chi: true,
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2024-2025',
        nguoi_tao_id: adminUser.id,
        hinh_anh: [],
        tep_dinh_kem: [],
      },
    ],
    skipDuplicates: true,
  });

  const allHoatDongs = await prisma.hoatDong.findMany({
    where: { ma_hd: { in: ['HD001', 'HD002', 'HD003', 'HD004', 'HD005'] } },
  });

  // 7) Đăng ký
  console.log('📝 Creating activity registrations...');
  const dangKyData = [];
  const currentDate2 = new Date();
  for (const sv of createdSinhViens) {
    const hoatDongSubset = allHoatDongs.slice(0, Math.floor(Math.random() * 3) + 2);
    for (const hd of hoatDongSubset) {
      const trangThaiOptions = ['cho_duyet', 'da_duyet', 'tu_choi'];
      const trangThai = trangThaiOptions[Math.floor(Math.random() * trangThaiOptions.length)];
      dangKyData.push({
        sv_id: sv.id,
        hd_id: hd.id,
        ngay_dang_ky: new Date(currentDate2.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        trang_thai_dk: trangThai,
        ly_do_dk: 'Muốn tham gia để tích lũy kinh nghiệm và điểm rèn luyện',
        ly_do_tu_choi: trangThai === 'tu_choi' ? 'Không đủ điều kiện tham gia' : null,
        ngay_duyet: trangThai !== 'cho_duyet' ? new Date() : null,
        ghi_chu: null,
      });
    }
  }
  await prisma.dangKyHoatDong.createMany({ data: dangKyData, skipDuplicates: true });

  // 8) Điểm danh cho hoạt động đã kết thúc
  console.log('✅ Creating attendance records...');
  const hoatDongKetThuc = allHoatDongs.find(hd => hd.ma_hd === 'HD005');
  const dangKyDaDuyet = await prisma.dangKyHoatDong.findMany({
    where: { hd_id: hoatDongKetThuc.id, trang_thai_dk: 'da_duyet' },
  });
  const diemDanhData = dangKyDaDuyet.map(dk => ({
    nguoi_diem_danh_id: adminUser.id,
    sv_id: dk.sv_id,
    hd_id: dk.hd_id,
    tg_diem_danh: new Date(hoatDongKetThuc.ngay_bd.getTime() + 30 * 60 * 1000),
    phuong_thuc: 'qr',
    trang_thai_tham_gia: Math.random() > 0.1 ? 'co_mat' : 'vang_mat',
    xac_nhan_tham_gia: Math.random() > 0.1,
    ghi_chu: null,
  }));
  await prisma.diemDanh.createMany({ data: diemDanhData, skipDuplicates: true });

  // 9) Loại thông báo
  console.log('📢 Creating notification types...');
  const loaiThongBaos = await Promise.all([
    prisma.loaiThongBao.upsert({
      where: { ten_loai_tb: 'Thông báo chung' },
      update: {},
      create: { ten_loai_tb: 'Thông báo chung', mo_ta: 'Thông báo chung từ nhà trường' },
    }),
    prisma.loaiThongBao.upsert({
      where: { ten_loai_tb: 'Hoạt động' },
      update: {},
      create: { ten_loai_tb: 'Hoạt động', mo_ta: 'Thông báo về các hoạt động' },
    }),
    prisma.loaiThongBao.upsert({
      where: { ten_loai_tb: 'Điểm rèn luyện' },
      update: {},
      create: { ten_loai_tb: 'Điểm rèn luyện', mo_ta: 'Thông báo về điểm rèn luyện' },
    }),
  ]);

  // 10) Thông báo mẫu
  console.log('💌 Creating notifications...');
  const thongBaoData = [];
  for (const sv of createdSinhViens) {
    thongBaoData.push({
      tieu_de: 'Hoạt động mới: Chiến dịch Mùa hè xanh 2024',
      noi_dung: 'Đã có hoạt động tình nguyện mới được mở đăng ký. Hạn chót đăng ký là ngày mai. Mời bạn tham gia!',
      loai_tb_id: loaiThongBaos[1].id,
      nguoi_gui_id: giangVien1.id,
      nguoi_nhan_id: sv.nguoi_dung_id,
      da_doc: Math.random() > 0.5,
      muc_do_uu_tien: 'cao',
      phuong_thuc_gui: 'trong_he_thong',
    });
    thongBaoData.push({
      tieu_de: 'Cập nhật điểm rèn luyện',
      noi_dung: 'Điểm rèn luyện của bạn đã được cập nhật sau khi tham gia hoạt động "Ngày hội việc làm 2024".',
      loai_tb_id: loaiThongBaos[2].id,
      nguoi_gui_id: adminUser.id,
      nguoi_nhan_id: sv.nguoi_dung_id,
      da_doc: Math.random() > 0.7,
      muc_do_uu_tien: 'trung_binh',
      phuong_thuc_gui: 'email',
    });
  }
  await prisma.thongBao.createMany({ data: thongBaoData, skipDuplicates: true });

  // 11) QR Attendance Sessions cho các hoạt động đã duyệt
  console.log('📱 Creating QR attendance sessions...');
  const hoatDongDaDuyet = allHoatDongs.filter(hd => hd.trang_thai === 'da_duyet');
  const attendanceSessionsData = [];
  
  for (const hd of hoatDongDaDuyet) {
    // Tạo 2-3 buổi điểm danh cho mỗi hoạt động
    const sessionCount = Math.floor(Math.random() * 2) + 2; // 2-3 sessions
    for (let i = 0; i < sessionCount; i++) {
      const sessionStart = new Date(hd.ngay_bd.getTime() + i * 2 * 60 * 60 * 1000); // Mỗi 2 tiếng
      const sessionEnd = new Date(sessionStart.getTime() + 30 * 60 * 1000); // 30 phút
      
      attendanceSessionsData.push({
        hd_id: hd.id,
        ten_buoi: `Buổi ${i + 1} - ${hd.ten_hd}`,
        mo_ta: `Buổi điểm danh thứ ${i + 1} của hoạt động ${hd.ten_hd}`,
        tg_bat_dau: sessionStart,
        tg_ket_thuc: sessionEnd,
        qr_code: `QR_${hd.ma_hd}_SESSION_${i + 1}_${Date.now()}`,
        qr_signature: `SIG_${hd.ma_hd}_${i + 1}_${Math.random().toString(36).substring(7)}`,
        trang_thai: sessionEnd < currentDate ? 'expired' : 'active',
        ip_whitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        gps_location: '10.8411,106.8097', // Tọa độ TP.HCM
        gps_radius: 100,
      });
    }
  }
  
  await prisma.attendanceSession.createMany({ data: attendanceSessionsData, skipDuplicates: true });
  const createdSessions = await prisma.attendanceSession.findMany({
    include: { hoat_dong: true }
  });

  // 12) QR Attendance Records
  console.log('🎯 Creating QR attendance records...');
  const qrAttendanceData = [];
  
  for (const session of createdSessions) {
    // Lấy danh sách sinh viên đã đăng ký hoạt động này
    const registeredStudents = await prisma.dangKyHoatDong.findMany({
      where: { hd_id: session.hd_id, trang_thai_dk: 'da_duyet' },
      include: { sinh_vien: true }
    });
    
    // 70-90% sinh viên quét QR
    const attendanceRate = 0.7 + Math.random() * 0.2;
    const attendingStudents = registeredStudents.slice(0, Math.floor(registeredStudents.length * attendanceRate));
    
    for (const reg of attendingStudents) {
      const qrScanTime = new Date(session.tg_bat_dau.getTime() + Math.random() * 20 * 60 * 1000); // Trong 20 phút đầu
      const isVerified = Math.random() > 0.05; // 95% success rate
      
      qrAttendanceData.push({
        session_id: session.id,
        sv_id: reg.sv_id,
        hd_id: session.hd_id,
        tg_quet: qrScanTime,
        dia_chi_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        vi_tri_gps: `${10.8411 + (Math.random() - 0.5) * 0.001},${106.8097 + (Math.random() - 0.5) * 0.001}`,
        device_info: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          platform: 'iOS',
          language: 'vi-VN'
        },
        trang_thai: isVerified ? 'verified' : 'failed',
        error_message: isVerified ? null : 'GPS location outside allowed radius',
        verified_at: isVerified ? new Date(qrScanTime.getTime() + 5000) : null,
        points_awarded: isVerified ? session.hoat_dong.diem_rl : null,
        points_awarded_at: isVerified ? new Date(qrScanTime.getTime() + 10000) : null,
      });
    }
  }
  
  await prisma.qRAttendance.createMany({ data: qrAttendanceData, skipDuplicates: true });

  // 13) Auto Point Calculations
  console.log('🧮 Creating auto point calculations...');
  const autoPointData = [];
  
  for (const hd of hoatDongDaDuyet) {
    const totalAttendees = await prisma.qRAttendance.count({
      where: { hd_id: hd.id, trang_thai: 'verified' }
    });
    
    autoPointData.push({
      hd_id: hd.id,
      calculation_time: new Date(hd.ngay_kt.getTime() + 60 * 60 * 1000), // 1 giờ sau khi kết thúc
      total_attendees: totalAttendees,
      points_distributed: totalAttendees * hd.diem_rl,
      is_completed: true,
      error_log: null,
      retry_count: 0,
    });
  }
  
  await prisma.autoPointCalculation.createMany({ data: autoPointData, skipDuplicates: true });

  // 14) Notification Queue
  console.log('📮 Creating notification queue...');
  const notificationQueueData = [];
  
  // Thông báo tự động cho điểm danh
  for (const qr of qrAttendanceData.slice(0, 10)) { // Chỉ tạo 10 thông báo mẫu
    const student = await prisma.sinhVien.findUnique({
      where: { id: qr.sv_id },
      include: { nguoi_dung: true }
    });
    const activity = await prisma.hoatDong.findUnique({
      where: { id: qr.hd_id }
    });
    
    notificationQueueData.push({
      recipient_id: student.nguoi_dung_id,
      title: qr.trang_thai === 'verified' ? 'Điểm danh thành công' : 'Điểm danh không thành công',
      message: qr.trang_thai === 'verified' 
        ? `Bạn đã điểm danh thành công cho hoạt động "${activity.ten_hd}" và nhận được ${qr.points_awarded} điểm rèn luyện.`
        : `Điểm danh cho hoạt động "${activity.ten_hd}" không thành công. Lý do: ${qr.error_message}`,
      type: qr.trang_thai === 'verified' ? 'attendance_success' : 'attendance_failed',
      priority: 'trung_binh',
      scheduled_at: qr.verified_at || qr.tg_quet,
      sent_at: qr.trang_thai === 'verified' ? new Date(qr.verified_at.getTime() + 30000) : null,
      status: qr.trang_thai === 'verified' ? 'da_gui' : 'that_bai',
      method: 'trong_he_thong',
      metadata: {
        activity_id: qr.hd_id,
        session_id: qr.session_id,
        points_awarded: qr.points_awarded
      },
      retry_count: qr.trang_thai === 'verified' ? 0 : 1,
    });
  }
  
  // Thông báo nhắc nhở đăng ký
  for (const hd of allHoatDongs.filter(h => h.trang_thai === 'da_duyet' && new Date(h.han_dk) > currentDate)) {
    for (const sv of createdSinhViens.slice(0, 3)) { // Chỉ 3 sinh viên đầu
      notificationQueueData.push({
        recipient_id: sv.nguoi_dung_id,
        title: 'Nhắc nhở đăng ký hoạt động',
        message: `Hoạt động "${hd.ten_hd}" sắp hết hạn đăng ký. Hạn cuối: ${hd.han_dk.toLocaleDateString('vi-VN')}. Đăng ký ngay để không bỏ lỡ!`,
        type: 'registration_reminder',
        priority: 'cao',
        scheduled_at: new Date(hd.han_dk.getTime() - 24 * 60 * 60 * 1000), // 1 ngày trước hạn
        sent_at: null,
        status: 'cho_gui',
        method: 'email',
        metadata: {
          activity_id: hd.id,
          deadline: hd.han_dk
        },
        retry_count: 0,
      });
    }
  }
  
  await prisma.notificationQueue.createMany({ data: notificationQueueData, skipDuplicates: true });

  console.log('✨ Seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`- Created ${users.length} users with different roles`);
  console.log('- Created 2 classes with assigned teachers and monitors');
  console.log(`- Created ${createdSinhViens.length} students`);
  console.log(`- Created ${loaiHoatDongs.length} activity types`);
  console.log('- Created 5 activities with different statuses');
  console.log('- Created multiple registrations and attendance records');
  console.log(`- Created ${loaiThongBaos.length} notification types`);
  console.log('- Created sample notifications');
  console.log(`- Created ${attendanceSessionsData.length} QR attendance sessions`);
  console.log(`- Created ${qrAttendanceData.length} QR attendance records`);
  console.log(`- Created ${autoPointData.length} auto point calculations`);
  console.log(`- Created ${notificationQueueData.length} notification queue items`);
  
  console.log('\n🔑 Login credentials:');
  console.log('Admin: admin / Admin@123');
  console.log('Teacher: gv001 / Teacher@123');
  console.log('Teacher: gv002 / Teacher@123');
  console.log('Monitor: lt001 / Monitor@123');
  console.log('Monitor: lt002 / Monitor@123');
  console.log('Student: 2021003 / Student@123');
  console.log('Student: 2021004 / Student@123');
  console.log('Student: 2021005 / Student@123');
  
  console.log('\n📈 Test Data Summary:');
  console.log('- All users have interconnected relationships');
  console.log('- Students are assigned to classes with proper teachers');
  console.log('- Activities have registrations, attendance, and QR sessions');
  console.log('- Notifications and queues are populated with realistic data');
  console.log('- Point calculations are completed for finished activities');
  console.log('- QR attendance system has sample scan records');
  
  console.log('\n🎯 Ready for testing:');
  console.log('- User management system');
  console.log('- Activity registration and attendance');
  console.log('- QR code scanning functionality');
  console.log('- Student points tracking');
  console.log('- Notification system');
  console.log('- Admin dashboards and reports');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });


