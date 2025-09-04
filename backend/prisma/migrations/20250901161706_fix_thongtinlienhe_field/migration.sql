/*
  Warnings:

  - You are about to drop the column `email` on the `NguoiDung` table. All the data in the column will be lost.
  - You are about to drop the column `loilh` on the `ThongTinLienHe` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."NguoiDung_email_key";

-- AlterTable
ALTER TABLE "public"."NguoiDung" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "public"."ThongTinLienHe" DROP COLUMN "loilh",
ADD COLUMN     "loailh" VARCHAR(20);
