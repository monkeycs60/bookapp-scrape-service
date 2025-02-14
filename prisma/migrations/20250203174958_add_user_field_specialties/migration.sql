/*
  Warnings:

  - You are about to drop the column `institution` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profession` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "institution",
DROP COLUMN "name",
DROP COLUMN "profession",
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "mainSpecialty" TEXT,
ADD COLUMN     "subSpecialties" TEXT[];
