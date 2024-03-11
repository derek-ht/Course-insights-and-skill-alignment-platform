/*
  Warnings:

  - A unique constraint covering the columns `[code,year]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `year` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "year" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_year_key" ON "Course"("code", "year");
