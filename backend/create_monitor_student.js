const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const vt = await prisma.vaiTro.findFirst({
      where: { ten_vt: { in: ['lop_truong', 'Lop_truong', 'LOP_TRUONG'] } }
    });
    if (!vt) {
      console.error('Khong tim thay vai tro lop_truong');
      return;
    }

    const users = await prisma.nguoiDung.findMany({ where: { vai_tro_id: vt.id } });
    if (!users || users.length === 0) {
      console.error('Khong tim thay nguoi dung lop_truong');
      return;
    }

    const lop = await prisma.lop.findFirst();
    if (!lop) {
      console.error('Khong tim thay lop');
      return;
    }

    for (const user of users) {
      const existed = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: user.id } });
      const mssv = existed?.mssv || ('LT' + (user.ten_dn || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()).slice(0, 10) || ('LT' + user.id.replace(/-/g, '').slice(-8)).toUpperCase();

      const sv = await prisma.sinhVien.upsert({
        where: { nguoi_dung_id: user.id },
        update: { lop_id: existed?.lop_id || lop.id },
        create: {
          nguoi_dung_id: user.id,
          mssv,
          ngay_sinh: new Date('2003-01-01'),
          lop_id: lop.id
        }
      });

      console.log('SinhVien upserted:', { svId: sv.id, mssv: sv.mssv, user: user.ten_dn, lop: lop.ten_lop });
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();


