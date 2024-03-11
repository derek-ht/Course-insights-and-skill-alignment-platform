-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "_sharedProfiles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_sharedProfiles_AB_unique" ON "_sharedProfiles"("A", "B");

-- CreateIndex
CREATE INDEX "_sharedProfiles_B_index" ON "_sharedProfiles"("B");

-- AddForeignKey
ALTER TABLE "_sharedProfiles" ADD CONSTRAINT "_sharedProfiles_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedProfiles" ADD CONSTRAINT "_sharedProfiles_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
