/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `NguoiDung` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."NguoiDung" ADD COLUMN     "email" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "public"."NguoiDung"("email");
