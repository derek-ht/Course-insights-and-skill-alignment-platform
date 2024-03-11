/*
  Warnings:

  - You are about to drop the `_sharedProfiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_sharedProfiles" DROP CONSTRAINT "_sharedProfiles_A_fkey";

-- DropForeignKey
ALTER TABLE "_sharedProfiles" DROP CONSTRAINT "_sharedProfiles_B_fkey";

-- DropTable
DROP TABLE "_sharedProfiles";

-- CreateTable
CREATE TABLE "sharedProfile" (
    "profileOwnerId" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,

    CONSTRAINT "sharedProfile_pkey" PRIMARY KEY ("profileOwnerId","sharedWithId")
);

-- AddForeignKey
ALTER TABLE "sharedProfile" ADD CONSTRAINT "sharedProfile_profileOwnerId_fkey" FOREIGN KEY ("profileOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharedProfile" ADD CONSTRAINT "sharedProfile_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
