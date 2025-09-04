/*
  Warnings:

  - A unique constraint covering the columns `[nguoidungid,loailh]` on the table `ThongTinLienHe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ThongTinLienHe_nguoidungid_loailh_key" ON "public"."ThongTinLienHe"("nguoidungid", "loailh");
