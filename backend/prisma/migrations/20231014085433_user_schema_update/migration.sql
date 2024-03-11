-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'http://127.0.0.1:48143/imgurl/default.jpg',
ADD COLUMN     "degree" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "school" TEXT,
ADD COLUMN     "workExperience" TEXT[];
