const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

class AuthModel {
  static includeForUser() {
    return {
      vaiTro: true,
      sinhVien: { include: { lop: true } }
    };
  }

  static toUserDTO(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.ho_ten,
      maso: user.ten_dn,
      email: user.email,
      role: user.vaiTro?.ten_vt || 'student',
      lop: user.sinhVien?.lop?.ten_lop || null,
      khoa: user.sinhVien?.lop?.khoa || null,
      nienkhoa: user.sinhVien?.lop?.nien_khoa || null,
      trangthai: user.trang_thai,
      ngaysinh: user.sinhVien?.ngay_sinh || null,
      gt: user.sinhVien?.gt || null,
      createdAt: user.ngay_tao,
      updatedAt: user.ngay_cap_nhat
    };
  }

  // Tìm người dùng theo tên đăng nhập (trước đây dùng 'maso')
  static findUserByMaso(maso) {
    return prisma.nguoiDung.findUnique({
      where: { ten_dn: maso },
      include: this.includeForUser()
    });
  }

  // Tìm người dùng theo email
  static async findUserByEmail(email) {
    return prisma.nguoiDung.findUnique({
      where: { email },
      include: this.includeForUser()
    });
  }

  static async findByEmailOrMaso(identifier) {
    // Nếu định danh là email
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier)) {
      return this.findUserByEmail(identifier);
    }
    // Ngược lại, coi như là mã số
    return this.findUserByMaso(identifier);
  }

  // Cập nhật thông tin đăng nhập của người dùng
  static async updateLoginInfo(userId, ip) {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: {
        lan_cuoi_dn: new Date(),
        ngay_cap_nhat: new Date(),
      }
    });
  }

  // So sánh mật khẩu
  static comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }

  // Băm mật khẩu
  static hashPassword(plain) {
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

  // Tạo người dùng sinh viên mặc định
  static async createStudent({ name, maso, email, hashedPassword, lopId }) {
    const user = await prisma.nguoiDung.create({
      data: {
        ten_dn: maso,
        ho_ten: name,
        mat_khau: hashedPassword,
        email,
        trang_thai: 'hoat_dong',
      },
      include: this.includeForUser()
    });
    await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: user.id,
        mssv: maso,
        ngay_sinh: new Date('2000-01-01'),
        lop_id: lopId,
        email
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
}

module.exports = AuthModel;
