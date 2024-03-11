/*
  Warnings:

  - Added the required column `title` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "workExperience" SET DEFAULT ARRAY[]::TEXT[];
