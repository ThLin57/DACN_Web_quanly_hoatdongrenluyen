/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('nam', 'nu', 'khac');

-- CreateEnum
CREATE TYPE "public"."TrangThaiNguoiDung" AS ENUM ('hot', 'kho', 'trung_thi');

-- CreateEnum
CREATE TYPE "public"."TrangThaiDotDanhGia" AS ENUM ('cho_mo', 'dang_mo', 'dong', 'hoan_thanh');

-- CreateEnum
CREATE TYPE "public"."TrangThaiHoatDong" AS ENUM ('cho_duyet', 'duyet', 'tu_choi', 'hoan_thanh');

-- CreateEnum
CREATE TYPE "public"."PhuongThucDiemDanh" AS ENUM ('QR');

-- CreateEnum
CREATE TYPE "public"."TrangThaiDiemRenLuyen" AS ENUM ('cho_xac_nhan', 'da_xac_nhan', 'co_khieu_nai');

-- CreateEnum
CREATE TYPE "public"."TrangThaiBangDiem" AS ENUM ('tam_tinh', 'chinh_thuc', 'co_khieu_nai');

-- CreateEnum
CREATE TYPE "public"."XepLoai" AS ENUM ('xuat_sac', 'gioi', 'kha', 'trung_binh', 'yeu', 'kem');

-- CreateEnum
CREATE TYPE "public"."MucDoUuTien" AS ENUM ('thap', 'trung_binh', 'cao', 'khan_cap');

-- CreateEnum
CREATE TYPE "public"."TrangThaiPhienDangNhap" AS ENUM ('hoat_dong', 'ket_thuc', 'het_han');

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Khoa" (
    "id" UUID NOT NULL,
    "tenkhoa" VARCHAR(50) NOT NULL,
    "webkhoa" VARCHAR(100),

    CONSTRAINT "Khoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NienKhoa" (
    "id" UUID NOT NULL,
    "tennk" VARCHAR(50) NOT NULL,
    "namnhaphoc" DATE,
    "namtotnghiep" DATE,

    CONSTRAINT "NienKhoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lop" (
    "id" UUID NOT NULL,
    "tenlop" VARCHAR(30) NOT NULL,
    "sosv" SMALLINT DEFAULT 0,
    "khoaid" UUID NOT NULL,
    "nienkhoaid" UUID NOT NULL,

    CONSTRAINT "Lop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VaiTro" (
    "id" UUID NOT NULL,
    "tenvt" VARCHAR(50) NOT NULL,
    "mota" TEXT,
    "quyenhan" JSONB,
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaiTro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NguoiDung" (
    "id" UUID NOT NULL,
    "maso" VARCHAR(15) NOT NULL,
    "hoten" VARCHAR(50) NOT NULL,
    "ngaysinh" DATE,
    "gt" "public"."Gender",
    "lopid" UUID NOT NULL,
    "matkhau" VARCHAR(255) NOT NULL,
    "vaitroid" UUID,
    "trangthai" "public"."TrangThaiNguoiDung",
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngaycapnhat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lancuoidn" TIMESTAMP(3),
    "solandn" INTEGER NOT NULL DEFAULT 0,
    "diachiipcuoi" INET,
    "tokenresetpassword" VARCHAR(255),
    "tghethantoken" TIMESTAMP(3),
    "anhdaidien" VARCHAR(255),
    "cccd" VARCHAR(12),

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ThongTinLienHe" (
    "id" UUID NOT NULL,
    "nguoidungid" UUID NOT NULL,
    "loilh" VARCHAR(20),
    "giatri" TEXT NOT NULL,
    "uutien" SMALLINT NOT NULL DEFAULT 1,
    "ngaytaolh" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThongTinLienHe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoaiHoatDong" (
    "id" UUID NOT NULL,
    "tenloai" VARCHAR(100) NOT NULL,
    "mota" TEXT,
    "diemmacdinh" DECIMAL(4,2) DEFAULT 0,
    "diemtdmoihd" DECIMAL(4,2) DEFAULT 0,
    "diemtddot" DECIMAL(4,2) DEFAULT 0,
    "mausac" VARCHAR(7),
    "nguoitaoid" UUID,
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoaiHoatDong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DotDanhGia" (
    "id" UUID NOT NULL,
    "tendot" VARCHAR(100),
    "namhoc" VARCHAR(20),
    "hocky" SMALLINT,
    "ngaybddot" DATE,
    "ngayktdot" DATE,
    "trangthai" "public"."TrangThaiDotDanhGia",
    "mota" TEXT,
    "nguoitaoid" UUID,
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DotDanhGia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HoatDong" (
    "id" UUID NOT NULL,
    "mahd" VARCHAR(50),
    "tenhd" VARCHAR(200) NOT NULL,
    "mota" TEXT,
    "loaihdid" UUID,
    "dotdgid" UUID,
    "diemrl" DOUBLE PRECISION DEFAULT 0,
    "diadiemtc" VARCHAR(200),
    "ngaybd" TIMESTAMP(3) NOT NULL,
    "ngaykt" TIMESTAMP(3) NOT NULL,
    "handangky" TIMESTAMP(3),
    "sltoida" INTEGER DEFAULT 0,
    "donvitc" VARCHAR(100),
    "yeucau" TEXT,
    "trangthaihd" "public"."TrangThaiHoatDong",
    "lydotuchoi" TEXT,
    "maqr" CHAR(32),
    "nguoitaoid" UUID,
    "nguoiduyetid" UUID,
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayduyet" TIMESTAMP(3),

    CONSTRAINT "HoatDong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DangKyHoatDong" (
    "id" UUID NOT NULL,
    "svid" UUID NOT NULL,
    "nguoiduyetid" UUID,
    "ngayduyet" TIMESTAMP(3),
    "hdid" UUID NOT NULL,
    "ngaydangky" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lydodk" TEXT,
    "lydotuchoi" TEXT,
    "ghichubtc" TEXT,

    CONSTRAINT "DangKyHoatDong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiemDanh" (
    "id" UUID NOT NULL,
    "nguoidiemdanhid" UUID,
    "svid" UUID NOT NULL,
    "hdid" UUID NOT NULL,
    "tgdiemdanh" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phuongthuc" "public"."PhuongThucDiemDanh",
    "trangthai" VARCHAR(20),
    "ghichu" TEXT,
    "diachiip" INET,
    "vitrigps" point NOT NULL,
    "xacnhanthamgia" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DiemDanh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiemRenLuyen" (
    "id" UUID NOT NULL,
    "svid" UUID NOT NULL,
    "nguoixnid" UUID,
    "dotdgid" UUID,
    "tongdiem" DECIMAL(4,2) DEFAULT 0,
    "sohdthamgia" INTEGER DEFAULT 0,
    "trangthai" "public"."TrangThaiDiemRenLuyen",
    "ngayxacnhan" TIMESTAMP(3),
    "ghichu" TEXT,
    "ngaycapnhat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiemRenLuyen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChiTietDiemRL" (
    "id" UUID NOT NULL,
    "diemrlid" UUID NOT NULL,
    "hdid" UUID NOT NULL,
    "diemdatduoc" DECIMAL(4,2) DEFAULT 0,
    "cochungchi" BOOLEAN NOT NULL DEFAULT false,
    "loaichungchi" VARCHAR(100),
    "ngaycd" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChiTietDiemRL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BangDiemTongHop" (
    "id" UUID NOT NULL,
    "svid" UUID NOT NULL,
    "nguoixacnhanid" UUID NOT NULL,
    "dotdgid" UUID NOT NULL,
    "diemdatduoc" DOUBLE PRECISION DEFAULT 0,
    "sohdthamgia" INTEGER DEFAULT 0,
    "trangthaibd" "public"."TrangThaiBangDiem",
    "ngayxacnhan" TIMESTAMP(3),
    "ghichu" TEXT,
    "xeploai" "public"."XepLoai",
    "ngaycapnhat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BangDiemTongHop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChiTietBangDiem" (
    "id" UUID NOT NULL,
    "bangdiemid" UUID NOT NULL,
    "loaihdid" UUID NOT NULL,
    "diemdatduoc" DOUBLE PRECISION,
    "sohdtg" INTEGER DEFAULT 0,

    CONSTRAINT "ChiTietBangDiem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoaiThongBao" (
    "id" UUID NOT NULL,
    "tenloaitb" VARCHAR(50) NOT NULL,

    CONSTRAINT "LoaiThongBao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ThongBao" (
    "id" UUID NOT NULL,
    "tieude" VARCHAR(200) NOT NULL,
    "noidung" TEXT NOT NULL,
    "loaitbid" UUID,
    "nguoiguiid" UUID,
    "nguoinhanid" UUID,
    "lienketid" TEXT,
    "loailienket" VARCHAR(50),
    "dadoc" BOOLEAN NOT NULL DEFAULT false,
    "mucdouutien" "public"."MucDoUuTien",
    "nguoithuchienid" UUID,
    "thoigian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThongBao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PhienDangNhap" (
    "id" UUID NOT NULL,
    "nguoidungid" UUID NOT NULL,
    "tgdangnhap" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tgdangxuat" TIMESTAMP(3),
    "diachiip" INET,
    "useragent" TEXT,
    "trangthai" "public"."TrangThaiPhienDangNhap",

    CONSTRAINT "PhienDangNhap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LichSuHoatDong" (
    "id" UUID NOT NULL,
    "banglienquan" VARCHAR(50) NOT NULL,
    "idbangghi" UUID NOT NULL,
    "hanhdong" VARCHAR(20) NOT NULL,
    "dulieucu" JSONB,
    "dulieumoi" JSONB,
    "nguoithuchienid" UUID,
    "thoigian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diachiip" INET,
    "useragent" TEXT,
    "motahanhdong" TEXT,

    CONSTRAINT "LichSuHoatDong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Khoa_tenkhoa_key" ON "public"."Khoa"("tenkhoa");

-- CreateIndex
CREATE UNIQUE INDEX "NienKhoa_tennk_key" ON "public"."NienKhoa"("tennk");

-- CreateIndex
CREATE UNIQUE INDEX "VaiTro_tenvt_key" ON "public"."VaiTro"("tenvt");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_maso_key" ON "public"."NguoiDung"("maso");

-- CreateIndex
CREATE UNIQUE INDEX "LoaiHoatDong_tenloai_key" ON "public"."LoaiHoatDong"("tenloai");

-- CreateIndex
CREATE UNIQUE INDEX "HoatDong_mahd_key" ON "public"."HoatDong"("mahd");

-- CreateIndex
CREATE UNIQUE INDEX "HoatDong_maqr_key" ON "public"."HoatDong"("maqr");

-- AddForeignKey
ALTER TABLE "public"."Lop" ADD CONSTRAINT "Lop_khoaid_fkey" FOREIGN KEY ("khoaid") REFERENCES "public"."Khoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lop" ADD CONSTRAINT "Lop_nienkhoaid_fkey" FOREIGN KEY ("nienkhoaid") REFERENCES "public"."NienKhoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NguoiDung" ADD CONSTRAINT "NguoiDung_lopid_fkey" FOREIGN KEY ("lopid") REFERENCES "public"."Lop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NguoiDung" ADD CONSTRAINT "NguoiDung_vaitroid_fkey" FOREIGN KEY ("vaitroid") REFERENCES "public"."VaiTro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThongTinLienHe" ADD CONSTRAINT "ThongTinLienHe_nguoidungid_fkey" FOREIGN KEY ("nguoidungid") REFERENCES "public"."NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoaiHoatDong" ADD CONSTRAINT "LoaiHoatDong_nguoitaoid_fkey" FOREIGN KEY ("nguoitaoid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DotDanhGia" ADD CONSTRAINT "DotDanhGia_nguoitaoid_fkey" FOREIGN KEY ("nguoitaoid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HoatDong" ADD CONSTRAINT "HoatDong_loaihdid_fkey" FOREIGN KEY ("loaihdid") REFERENCES "public"."LoaiHoatDong"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HoatDong" ADD CONSTRAINT "HoatDong_dotdgid_fkey" FOREIGN KEY ("dotdgid") REFERENCES "public"."DotDanhGia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HoatDong" ADD CONSTRAINT "HoatDong_nguoitaoid_fkey" FOREIGN KEY ("nguoitaoid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HoatDong" ADD CONSTRAINT "HoatDong_nguoiduyetid_fkey" FOREIGN KEY ("nguoiduyetid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DangKyHoatDong" ADD CONSTRAINT "DangKyHoatDong_svid_fkey" FOREIGN KEY ("svid") REFERENCES "public"."NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DangKyHoatDong" ADD CONSTRAINT "DangKyHoatDong_nguoiduyetid_fkey" FOREIGN KEY ("nguoiduyetid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DangKyHoatDong" ADD CONSTRAINT "DangKyHoatDong_hdid_fkey" FOREIGN KEY ("hdid") REFERENCES "public"."HoatDong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiemDanh" ADD CONSTRAINT "DiemDanh_nguoidiemdanhid_fkey" FOREIGN KEY ("nguoidiemdanhid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiemDanh" ADD CONSTRAINT "DiemDanh_svid_fkey" FOREIGN KEY ("svid") REFERENCES "public"."NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiemDanh" ADD CONSTRAINT "DiemDanh_hdid_fkey" FOREIGN KEY ("hdid") REFERENCES "public"."HoatDong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiemRenLuyen" ADD CONSTRAINT "DiemRenLuyen_svid_fkey" FOREIGN KEY ("svid") REFERENCES "public"."NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiemRenLuyen" ADD CONSTRAINT "DiemRenLuyen_nguoixnid_fkey" FOREIGN KEY ("nguoixnid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiemRenLuyen" ADD CONSTRAINT "DiemRenLuyen_dotdgid_fkey" FOREIGN KEY ("dotdgid") REFERENCES "public"."DotDanhGia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChiTietDiemRL" ADD CONSTRAINT "ChiTietDiemRL_diemrlid_fkey" FOREIGN KEY ("diemrlid") REFERENCES "public"."DiemRenLuyen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChiTietDiemRL" ADD CONSTRAINT "ChiTietDiemRL_hdid_fkey" FOREIGN KEY ("hdid") REFERENCES "public"."HoatDong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BangDiemTongHop" ADD CONSTRAINT "BangDiemTongHop_svid_fkey" FOREIGN KEY ("svid") REFERENCES "public"."NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BangDiemTongHop" ADD CONSTRAINT "BangDiemTongHop_nguoixacnhanid_fkey" FOREIGN KEY ("nguoixacnhanid") REFERENCES "public"."NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BangDiemTongHop" ADD CONSTRAINT "BangDiemTongHop_dotdgid_fkey" FOREIGN KEY ("dotdgid") REFERENCES "public"."DotDanhGia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChiTietBangDiem" ADD CONSTRAINT "ChiTietBangDiem_bangdiemid_fkey" FOREIGN KEY ("bangdiemid") REFERENCES "public"."BangDiemTongHop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChiTietBangDiem" ADD CONSTRAINT "ChiTietBangDiem_loaihdid_fkey" FOREIGN KEY ("loaihdid") REFERENCES "public"."LoaiHoatDong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThongBao" ADD CONSTRAINT "ThongBao_loaitbid_fkey" FOREIGN KEY ("loaitbid") REFERENCES "public"."LoaiThongBao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThongBao" ADD CONSTRAINT "ThongBao_nguoiguiid_fkey" FOREIGN KEY ("nguoiguiid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThongBao" ADD CONSTRAINT "ThongBao_nguoinhanid_fkey" FOREIGN KEY ("nguoinhanid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThongBao" ADD CONSTRAINT "ThongBao_nguoithuchienid_fkey" FOREIGN KEY ("nguoithuchienid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PhienDangNhap" ADD CONSTRAINT "PhienDangNhap_nguoidungid_fkey" FOREIGN KEY ("nguoidungid") REFERENCES "public"."NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LichSuHoatDong" ADD CONSTRAINT "LichSuHoatDong_nguoithuchienid_fkey" FOREIGN KEY ("nguoithuchienid") REFERENCES "public"."NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
