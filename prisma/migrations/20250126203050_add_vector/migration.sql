/*
  Warnings:

  - You are about to drop the column `volume` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "volume",
ADD COLUMN     "vectorSummary" TEXT;
