const { prisma } = require('../config/database');

class UserModel {
  static includeBasic() {
    return {
      vai_tro: true,
      sinh_vien: { include: { lop: true } }
    };
  }

  static toDTO(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.ho_ten,
      email: user.email,
      role: user.vai_tro?.ten_vt || 'student',
      maso: user.ten_dn,
      lop: user.sinh_vien?.lop?.ten_lop || null,
      khoa: user.sinh_vien?.lop?.khoa || null,
      nienkhoa: user.sinh_vien?.lop?.nien_khoa || null,
      trangthai: user.trang_thai,
      ngaysinh: user.sinh_vien?.ngay_sinh || null,
      gt: user.sinh_vien?.gt || null,
      sdt: user.sinh_vien?.sdt || null,
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

  static async findAll() {
    const users = await prisma.nguoiDung.findMany({
      include: this.includeBasic(),
      orderBy: { ngay_tao: 'desc' }
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

  static async updateBasic(id, { maso, name, trangthai, ngaysinh, gt, sdt, email, email_phu, sdt_cha, sdt_me, dia_chi_gia_dinh, sdt_khan_cap, ten_cha, ten_me }) {
    const dataUser = { ngay_cap_nhat: new Date() };
    if (typeof maso !== 'undefined') dataUser.ten_dn = maso;
    if (typeof name !== 'undefined') dataUser.ho_ten = name;
    if (typeof trangthai !== 'undefined') dataUser.trang_thai = trangthai;
    if (typeof email !== 'undefined') dataUser.email = email;

    const ops = [];
    ops.push(prisma.nguoiDung.update({ where: { id }, data: dataUser }));

    const updateSV = (typeof ngaysinh !== 'undefined') || (typeof gt !== 'undefined') || (typeof sdt !== 'undefined') || 
                     (typeof email_phu !== 'undefined') || (typeof sdt_cha !== 'undefined') || (typeof sdt_me !== 'undefined') ||
                     (typeof dia_chi_gia_dinh !== 'undefined') || (typeof sdt_khan_cap !== 'undefined') || 
                     (typeof ten_cha !== 'undefined') || (typeof ten_me !== 'undefined');
    
    if (updateSV) {
      const dataSv = {};
      if (typeof ngaysinh !== 'undefined') dataSv.ngay_sinh = ngaysinh ? new Date(ngaysinh) : null;
      if (typeof gt !== 'undefined') dataSv.gt = gt || null;
      if (typeof sdt !== 'undefined') dataSv.sdt = sdt || null;
      if (typeof email_phu !== 'undefined') dataSv.email_phu = email_phu || null;
      if (typeof sdt_cha !== 'undefined') dataSv.sdt_cha = sdt_cha || null;
      if (typeof sdt_me !== 'undefined') dataSv.sdt_me = sdt_me || null;
      if (typeof dia_chi_gia_dinh !== 'undefined') dataSv.dia_chi_gia_dinh = dia_chi_gia_dinh || null;
      if (typeof sdt_khan_cap !== 'undefined') dataSv.sdt_khan_cap = sdt_khan_cap || null;
      if (typeof ten_cha !== 'undefined') dataSv.ten_cha = ten_cha || null;
      if (typeof ten_me !== 'undefined') dataSv.ten_me = ten_me || null;
      ops.push(prisma.sinhVien.updateMany({ where: { nguoi_dung_id: id }, data: dataSv }));
    }

    await prisma.$transaction(ops);
    const user = await prisma.nguoiDung.findUnique({ where: { id }, include: this.includeBasic() });
    return this.toDTO(user);
  }

  static async deleteById(id) {
    await prisma.nguoiDung.delete({ where: { id } });
    return true;
  }
}

module.exports = UserModel;
