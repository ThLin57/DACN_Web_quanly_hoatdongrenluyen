const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

class AuthModel {
  static includeForUser() {
    return {
      vai_tro: true,
      sinh_vien: { include: { lop: true } }
    };
  }

  static toUserDTO(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.ho_ten,
      maso: user.ten_dn,
      email: user.email,
      role: user.vai_tro?.ten_vt || 'student',
      lop: user.sinh_vien?.lop?.ten_lop || null,
      khoa: user.sinh_vien?.lop?.khoa || null,
      nienkhoa: user.sinh_vien?.lop?.nien_khoa || null,
      trangthai: user.trang_thai,
      ngaysinh: user.sinh_vien?.ngay_sinh || null,
      gt: user.sinh_vien?.gt || null,
      sdt: user.sinh_vien?.sdt || null,
      // Thông tin liên hệ gia đình
      email_phu: user.sinh_vien?.email_phu || null,
      sdt_cha: user.sinh_vien?.sdt_cha || null,
      sdt_me: user.sinh_vien?.sdt_me || null,
      dia_chi_gia_dinh: user.sinh_vien?.dia_chi_gia_dinh || null,
      sdt_khan_cap: user.sinh_vien?.sdt_khan_cap || null,
      ten_cha: user.sinh_vien?.ten_cha || null,
      ten_me: user.sinh_vien?.ten_me || null,
      createdAt: user.ngay_tao,
      updatedAt: user.ngay_cap_nhat
    };
  }

  // Tìm người dùng theo tên đăng nhập (trước đây dùng 'maso')
  static timNguoiDungTheoMaso(maso) {
    return prisma.nguoiDung.findUnique({
      where: { ten_dn: maso },
      include: this.includeForUser()
    });
  }

  // Tìm người dùng theo email
  static async timNguoiDungTheoEmail(email) {
    return prisma.nguoiDung.findUnique({
      where: { email },
      include: this.includeForUser()
    });
  }

  static async findByEmailOrMaso(identifier) {
    // Nếu định danh là email
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier)) {
      return this.timNguoiDungTheoEmail(identifier);
    }
    // Ngược lại, coi như là mã số
    return this.timNguoiDungTheoMaso(identifier);
  }

  // Cập nhật thông tin đăng nhập của người dùng
  static async capNhatThongTinDangNhap(userId, ip) {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: {
        lan_cuoi_dn: new Date(),
        ngay_cap_nhat: new Date(),
      }
    });
  }

  // So sánh mật khẩu
  static soSanhMatKhau(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }

  // Băm mật khẩu
  static bamMatKhau(plain) {
    return bcrypt.hash(plain, 10);
  }

  // Tìm (hoặc tạo) lớp học mặc định để gán khi đăng ký
  static async findDefaultClass() {
    const existing = await prisma.lop.findFirst({ where: { ten_lop: 'Lớp mặc định' } });
    if (existing) return existing;
    // Tìm người có thể làm chủ nhiệm: ưu tiên 'gv001' -> 'admin' -> người đầu tiên
    const gv = await prisma.nguoiDung.findUnique({ where: { ten_dn: 'gv001' }, select: { id: true } }).catch(() => null);
    const ad = gv ? null : await prisma.nguoiDung.findUnique({ where: { ten_dn: 'admin' }, select: { id: true } }).catch(() => null);
    const anyUser = gv || ad || await prisma.nguoiDung.findFirst({ select: { id: true } });
    if (!anyUser) return null;
    return prisma.lop.create({
      data: {
        ten_lop: 'Lớp mặc định',
        khoa: 'Công nghệ thông tin',
        nien_khoa: '2021-2025',
        nam_nhap_hoc: new Date(),
        chu_nhiem: anyUser.id,
      }
    });
  }

  // Tìm hoặc tạo lớp cho khoa cụ thể
  static async findOrCreateClassForFaculty(khoa) {
    // Tìm lớp mặc định cho khoa này
    const existing = await prisma.lop.findFirst({ 
      where: { 
        khoa: khoa,
        ten_lop: { contains: 'mặc định' }
      } 
    });
    if (existing) return existing;

    // Tìm người có thể làm chủ nhiệm: ưu tiên 'gv001' -> 'admin' -> người đầu tiên
    const gv = await prisma.nguoiDung.findUnique({ where: { ten_dn: 'gv001' }, select: { id: true } }).catch(() => null);
    const ad = gv ? null : await prisma.nguoiDung.findUnique({ where: { ten_dn: 'admin' }, select: { id: true } }).catch(() => null);
    const anyUser = gv || ad || await prisma.nguoiDung.findFirst({ select: { id: true } });
    if (!anyUser) return null;

    // Tạo lớp mặc định cho khoa
    return prisma.lop.create({
      data: {
        ten_lop: `Lớp mặc định - ${khoa}`,
        khoa: khoa,
        nien_khoa: '2021-2025',
        nam_nhap_hoc: new Date(),
        chu_nhiem: anyUser.id,
      }
    });
  }

  // Tạo người dùng sinh viên mặc định
  static async createStudent({ name, maso, email, hashedPassword, lopId }) {
    // Lấy vai trò SINH_VIEN
    const role = await prisma.vaiTro.findUnique({ where: { ten_vt: 'SINH_VIEN' } });
    const user = await prisma.nguoiDung.create({
      data: {
        ten_dn: maso,
        ho_ten: name,
        mat_khau: hashedPassword,
        email,
        trang_thai: 'hoat_dong',
        vai_tro_id: role?.id,
      },
      include: this.includeForUser()
    });
    await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: user.id,
        mssv: maso,
        ngay_sinh: new Date('2000-01-01'),
        lop_id: lopId,
      }
    });
    return prisma.nguoiDung.findUnique({ where: { id: user.id }, include: this.includeForUser() });
  }

  // Không còn bảng thông tin liên hệ riêng; cập nhật email trực tiếp trên người dùng
  static async createEmailContact(userId, email) {
    await prisma.nguoiDung.update({ where: { id: userId }, data: { email } });
    return true;
  }

  // Contacts helpers for non-email
  static deleteNonEmailContacts(userId) {
    return Promise.resolve();
  }

  static createNonEmailContacts(userId, contacts) {
    return Promise.resolve();
  }

  // Cập nhật mật khẩu theo ID người dùng
  static async updatePasswordById(userId, hashedPassword) {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: { mat_khau: hashedPassword, ngay_cap_nhat: new Date() }
    });
    return true;
  }

  // Tính điểm rèn luyện của sinh viên
  static async calculateStudentPoints(userId, filters = {}) {
    const { semester, year } = filters;
    
    // Bước 1: Lấy thông tin sinh viên từ người dùng đang đăng nhập
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: true
      }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User ID:', userId);
    console.log('User data:', user ? {
      id: user.id,
      ten_dn: user.ten_dn,
      ho_ten: user.ho_ten,
      has_sinh_vien: !!user.sinh_vien
    } : 'No user data');

    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    if (!user.sinh_vien) {
      console.log('User is not a student, returning zero points');
      // Trả về điểm 0 nếu không phải sinh viên
      return {
        total: 0,
        currentSemester: 0,
        currentYear: 0,
        byType: {},
        activitiesCount: 0,
        currentSemesterInfo: {
          semester: 'hoc_ky_1',
          year: '2024-2025'
        },
        breakdown: {
          totalActivities: 0,
          completedActivities: 0,
          currentSemesterActivities: 0,
          currentYearActivities: 0
        },
        studentInfo: {
          id: userId,
          name: user.ho_ten || user.ten_dn,
          mssv: null
        },
        activityDetails: []
      };
    }

    const svId = user.sinh_vien.id;
    console.log(`Tính điểm rèn luyện cho sinh viên ID: ${svId}`);

    // Bước 2: Lấy tất cả đăng ký hoạt động của sinh viên
    const allRegistrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      }
    });

    console.log(`Sinh viên đã đăng ký ${allRegistrations.length} hoạt động`);

    // Bước 3: Lọc các hoạt động đã tham gia (trạng thái da_tham_gia)
    const completedRegistrations = allRegistrations.filter(reg => {
      const status = reg.trang_thai_dk;
      console.log(`Hoạt động ${reg.hoat_dong.ten_hd} - Trạng thái: ${status}`);
      return status === 'da_tham_gia';
    });

    console.log(`Số hoạt động đã tham gia: ${completedRegistrations.length}`);

    // Bước 4: Lọc theo học kỳ và năm học nếu có
    let filteredRegistrations = completedRegistrations;
    if (semester || year) {
      filteredRegistrations = completedRegistrations.filter(reg => {
        const activity = reg.hoat_dong;
        if (semester && activity.hoc_ky !== semester) return false;
        if (year && activity.nam_hoc !== year) return false;
        return true;
      });
    }

    // Bước 5: Tính tổng điểm từ các hoạt động đã tham gia
    let totalPoints = 0;
    const pointsByType = {};
    const activityDetails = [];

    filteredRegistrations.forEach(reg => {
      const activity = reg.hoat_dong;
      const points = Number(activity.diem_rl || 0);
      
      // Cộng điểm vào tổng
      totalPoints += points;
      
      // Phân loại theo loại hoạt động
      const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
      if (!pointsByType[activityType]) {
        pointsByType[activityType] = 0;
      }
      pointsByType[activityType] += points;

      // Lưu chi tiết hoạt động
      activityDetails.push({
        id: activity.id,
        name: activity.ten_hd,
        type: activityType,
        points: points,
        status: reg.trang_thai_dk,
        semester: activity.hoc_ky,
        year: activity.nam_hoc
      });
    });

    console.log(`Tổng điểm rèn luyện: ${totalPoints}`);

    // Bước 6: Tính điểm theo học kỳ/năm học hiện tại
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentSemester = currentDate.getMonth() < 6 ? 'hoc_ky_2' : 'hoc_ky_1';

    // Điểm học kỳ hiện tại
    const currentSemesterRegistrations = completedRegistrations.filter(reg => {
      const activity = reg.hoat_dong;
      return activity.hoc_ky === currentSemester && 
             activity.nam_hoc === `${currentYear}-${currentYear + 1}`;
    });

    const currentSemesterPoints = currentSemesterRegistrations.reduce((sum, reg) => {
      return sum + Number(reg.hoat_dong.diem_rl || 0);
    }, 0);

    // Điểm năm học hiện tại
    const currentYearRegistrations = completedRegistrations.filter(reg => {
      const activity = reg.hoat_dong;
      return activity.nam_hoc === `${currentYear}-${currentYear + 1}`;
    });

    const currentYearPoints = currentYearRegistrations.reduce((sum, reg) => {
      return sum + Number(reg.hoat_dong.diem_rl || 0);
    }, 0);

    // Bước 7: Trả về kết quả
    const result = {
      total: totalPoints,
      currentSemester: currentSemesterPoints,
      currentYear: currentYearPoints,
      byType: pointsByType,
      activitiesCount: filteredRegistrations.length,
      currentSemesterInfo: {
        semester: currentSemester,
        year: `${currentYear}-${currentYear + 1}`
      },
      breakdown: {
        totalActivities: allRegistrations.length,
        completedActivities: completedRegistrations.length,
        currentSemesterActivities: currentSemesterRegistrations.length,
        currentYearActivities: currentYearRegistrations.length
      },
      studentInfo: {
        id: svId,
        name: user.ho_ten,
        mssv: user.sinh_vien.mssv
      },
      activityDetails: activityDetails
    };

    console.log('Kết quả tính điểm:', JSON.stringify(result, null, 2));
    return result;
  }

  // Lấy danh sách hoạt động đã đăng ký của sinh viên
  static async getStudentActivities(userId, filters = {}) {
    const { semester, year, status } = filters;
    
    // Bước 1: Lấy thông tin sinh viên từ người dùng đang đăng nhập
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: true
      }
    });

    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    if (!user.sinh_vien) {
      console.log('User is not a student, returning empty activities');
      return {
        activities: [],
        total: 0,
        byStatus: {},
        studentInfo: {
          id: userId,
          name: user.ho_ten || user.ten_dn,
          mssv: null
        }
      };
    }

    const svId = user.sinh_vien.id;
    console.log(`Lấy danh sách hoạt động cho sinh viên ID: ${svId}`);

    // Bước 2: Lấy tất cả đăng ký hoạt động của sinh viên
    const allRegistrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      },
      orderBy: {
        ngay_dang_ky: 'desc'
      }
    });

    console.log(`Sinh viên đã đăng ký ${allRegistrations.length} hoạt động`);

    // Bước 3: Lọc theo học kỳ, năm học và trạng thái
    let filteredRegistrations = allRegistrations;
    
    if (semester || year || status) {
      filteredRegistrations = allRegistrations.filter(reg => {
        const activity = reg.hoat_dong;
        if (semester && activity.hoc_ky !== semester) return false;
        if (year && activity.nam_hoc !== year) return false;
        if (status && reg.trang_thai_dk !== status) return false;
        return true;
      });
    }

    // Bước 4: Chuyển đổi dữ liệu
    const activities = filteredRegistrations.map(reg => {
      const activity = reg.hoat_dong;
      return {
        id: activity.id,
        name: activity.ten_hd,
        description: activity.mo_ta,
        type: activity.loai_hd?.ten_loai_hd || 'Khác',
        points: Number(activity.diem_rl || 0),
        location: activity.dia_diem,
        startDate: activity.ngay_bd,
        endDate: activity.ngay_kt,
        deadline: activity.han_dk,
        semester: activity.hoc_ky,
        year: activity.nam_hoc,
        status: reg.trang_thai_dk,
        registrationDate: reg.ngay_dang_ky,
        approvalDate: reg.ngay_duyet,
        rejectionReason: reg.ly_do_tu_choi,
        notes: reg.ghi_chu
      };
    });

    // Bước 5: Thống kê theo trạng thái
    const byStatus = {};
    allRegistrations.forEach(reg => {
      const status = reg.trang_thai_dk;
      if (!byStatus[status]) {
        byStatus[status] = 0;
      }
      byStatus[status]++;
    });

    const result = {
      activities: activities,
      total: activities.length,
      byStatus: byStatus,
      studentInfo: {
        id: svId,
        name: user.ho_ten || user.ten_dn,
        mssv: user.sinh_vien.mssv
      }
    };

    console.log('Kết quả danh sách hoạt động:', JSON.stringify(result, null, 2));
    return result;
  }

  // Lấy danh sách sinh viên cùng lớp với người dùng hiện tại
  static async getClassmatesForUser(userId) {
    // Tìm lớp của user
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: { sinh_vien: true }
    });
    if (!user || !user.sinh_vien) {
      return [];
    }
    const lopId = user.sinh_vien.lop_id;
    // Lấy tất cả sinh viên trong lớp đó và join người dùng
    const svs = await prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      include: { nguoi_dung: true }
    });
    return svs.map(sv => ({
      userId: sv.nguoi_dung_id,
      name: sv.nguoi_dung?.ho_ten || sv.nguoi_dung?.ten_dn,
      mssv: sv.mssv
    }));
  }

  // Lấy danh sách khoa
  static async layDanhSachKhoa() {
    try {
      const facs = await prisma.lop.findMany({
        distinct: ['khoa'],
        select: { khoa: true },
        orderBy: { khoa: 'asc' }
      });
      return facs.map(f => f.khoa).filter(Boolean);
    } catch (error) {
      console.error('Error getting faculties:', error);
      throw error;
    }
  }

  // Lấy danh sách lớp theo khoa
  static async layDanhSachLopTheoKhoa(faculty) {
    try {
      const lops = await prisma.lop.findMany({
        where: faculty ? { khoa: faculty } : {},
        select: { id: true, ten_lop: true, khoa: true, nien_khoa: true },
        orderBy: [{ khoa: 'asc' }, { ten_lop: 'asc' }]
      });
      return lops;
    } catch (error) {
      console.error('Error getting classes:', error);
      throw error;
    }
  }

  // Lấy thông tin lớp theo ID
  static async layThongTinLopTheoId(lopId) {
    try {
      return await prisma.lop.findUnique({ where: { id: lopId } });
    } catch (error) {
      console.error('Error getting class by ID:', error);
      throw error;
    }
  }

  // Lấy danh sách tất cả người dùng (admin only)
  static async layDanhSachTatCaNguoiDung() {
    try {
      const users = await prisma.nguoiDung.findMany({
        select: {
          id: true,
          ten_dn: true,
          email: true,
          ho_ten: true,
          trang_thai: true,
          ngay_tao: true,
          vai_tro: {
            select: { ten_vt: true }
          }
        },
        orderBy: { ngay_tao: 'desc' }
      });
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Lấy danh sách vai trò
  static async layDanhSachTatCaVaiTro() {
    try {
      const roles = await prisma.vaiTro.findMany({
        select: { id: true, ten_vt: true, mo_ta: true },
        orderBy: { ten_vt: 'asc' }
      });
      return roles;
    } catch (error) {
      console.error('Error getting all roles:', error);
      throw error;
    }
  }

  // Lấy danh sách demo users
  static async layDanhSachDemoUsers(usernames) {
    try {
      const users = await prisma.nguoiDung.findMany({
        where: { ten_dn: { in: usernames } },
        select: { ten_dn: true, email: true, ho_ten: true }
      });
      return users;
    } catch (error) {
      console.error('Error getting demo users:', error);
      throw error;
    }
  }

  // Lấy danh sách vai trò không phải admin
  static async layDanhSachVaiTroKhongPhaiAdmin() {
    try {
      const roles = await prisma.vaiTro.findMany({
        where: { ten_vt: { not: 'ADMIN' } },
        orderBy: { ten_vt: 'asc' },
        select: { id: true, ten_vt: true, mo_ta: true }
      });
      return roles;
    } catch (error) {
      console.error('Error getting non-admin roles:', error);
      throw error;
    }
  }
}

module.exports = AuthModel;
