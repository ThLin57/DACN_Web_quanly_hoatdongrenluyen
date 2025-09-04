const { prisma } = require('../config/database');

class UserModel {
  static selectEmailFromContacts = {
    where: { loailh: 'email' },
    select: { giatri: true }
  };

  static includeBasic() {
    return {
      vaiTro: true,
      lop: {
        include: {
          khoa: true,
          nienkhoa: true
        }
      },
      ThongTinLienHe: this.selectEmailFromContacts
    };
  }

  static toDTO(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.hoten,
      email: user.ThongTinLienHe?.[0]?.giatri || user.maso,
      role: user.vaiTro?.tenvt || 'student',
      maso: user.maso,
      lop: user.lop?.tenlop,
      khoa: user.lop?.khoa?.tenkhoa,
      nienkhoa: user.lop?.nienkhoa?.tennk,
      trangthai: user.trangthai,
      createdAt: user.ngaytao,
      updatedAt: user.ngaycapnhat
    };
  }

  static async findAll() {
    const users = await prisma.nguoiDung.findMany({
      include: this.includeBasic(),
      orderBy: { ngaytao: 'desc' }
    });
    return users.map(this.toDTO);
  }

  static async findById(id) {
    const user = await prisma.nguoiDung.findUnique({
      where: { id },
      include: this.includeBasic()
    });
    return this.toDTO(user);
  }

  static async updateBasic(id, { name }) {
    const updated = await prisma.nguoiDung.update({
      where: { id },
      data: { hoten: name, ngaycapnhat: new Date() },
      include: this.includeBasic()
    });
    return this.toDTO(updated);
  }

  static async deleteById(id) {
    await prisma.nguoiDung.delete({ where: { id } });
    return true;
  }
}

module.exports = UserModel;
