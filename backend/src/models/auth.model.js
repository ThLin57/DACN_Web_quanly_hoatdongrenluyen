const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

class AuthModel {
  static includeForUser() {
    return {
      vaiTro: true,
      lop: {
        include: {
          khoa: true,
          nienkhoa: true
        }
      },
      ThongTinLienHe: {
        where: { loailh: 'email' },
        select: { giatri: true }
      }
    };
  }

  static toUserDTO(user) {
    if (!user) return null;
    const email = user.ThongTinLienHe?.[0]?.giatri || null;
    return {
      id: user.id,
      name: user.hoten,
      maso: user.maso,
      email,
      role: user.vaiTro?.tenvt || 'student',
      lop: user.lop?.tenlop,
      khoa: user.lop?.khoa?.tenkhoa,
      nienkhoa: user.lop?.nienkhoa?.tennk,
      trangthai: user.trangthai,
      createdAt: user.ngaytao,
      updatedAt: user.ngaycapnhat
    };
  }

  // Tìm người dùng theo mã số
  static findUserByMaso(maso) {
    return prisma.nguoiDung.findUnique({
      where: { maso },
      include: this.includeForUser()
    });
  }

  // Tìm người dùng theo email (từ bảng ThongTinLienHe)
  static async findUserByEmail(email) {
    const info = await prisma.thongTinLienHe.findFirst({
      where: { giatri: email, loailh: 'email' },
      select: { nguoidungid: true }
    });
    if (!info) return null;
    return prisma.nguoiDung.findUnique({
      where: { id: info.nguoidungid },
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
        lancuoidn: new Date(),
        solandn: { increment: 1 },
        diachiipcuoi: ip
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

  // Tìm lớp học mặc định
  static findDefaultClass() {
    return prisma.lop.findFirst({ where: { tenlop: 'Lớp mặc định' } });
  }

  // Tạo người dùng sinh viên mặc định
  static async createStudent({ name, maso, hashedPassword, lopId }) {
    return prisma.nguoiDung.create({
      data: {
        maso,
        hoten: name,
        matkhau: hashedPassword,
        trangthai: 'hot',
        lopid: lopId,
        vaitroid: null
      },
      include: this.includeForUser()
    });
  }

  // Tạo thông tin liên hệ email cho người dùng
  static createEmailContact(userId, email) {
    return prisma.thongTinLienHe.create({
      data: {
        nguoidungid: userId,
        loailh: 'email',
        giatri: email,
        uutien: 1
      }
    });
  }

  // Cập nhật mật khẩu theo ID người dùng
  static async updatePasswordById(userId, hashedPassword) {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: { matkhau: hashedPassword, ngaycapnhat: new Date() }
    });
    return true;
  }
}

module.exports = AuthModel;
