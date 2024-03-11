/*
  Warnings:

  - You are about to drop the `sharedProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sharedProfile" DROP CONSTRAINT "sharedProfile_profileOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "sharedProfile" DROP CONSTRAINT "sharedProfile_sharedWithId_fkey";

-- DropTable
DROP TABLE "sharedProfile";

-- CreateTable
CREATE TABLE "UnverifiedUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pwHash" TEXT NOT NULL,
    "pwSalt" TEXT NOT NULL,
    "iat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "type" "UserType" NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "UnverifiedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedProfile" (
    "profileOwnerId" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,

    CONSTRAINT "SharedProfile_pkey" PRIMARY KEY ("profileOwnerId","sharedWithId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_email_key" ON "UnverifiedUser"("email");

-- AddForeignKey
ALTER TABLE "SharedProfile" ADD CONSTRAINT "SharedProfile_profileOwnerId_fkey" FOREIGN KEY ("profileOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedProfile" ADD CONSTRAINT "SharedProfile_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
