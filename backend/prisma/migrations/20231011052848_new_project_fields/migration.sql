/*
  Warnings:

  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "outcomes" TEXT[],
ADD COLUMN     "requiredSkills" TEXT[],
ADD COLUMN     "scope" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "topics" TEXT[];
