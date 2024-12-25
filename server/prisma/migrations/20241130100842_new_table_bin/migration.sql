/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `RequestQRCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `RequestQRCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `RequestQRCode` DROP FOREIGN KEY `RequestQRCode_studentId_fkey`;

-- AlterTable
ALTER TABLE `RequestQRCode` ADD COLUMN `binId` INTEGER NULL,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    MODIFY `studentId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Bin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `no` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `RequestQRCode_code_key` ON `RequestQRCode`(`code`);

-- AddForeignKey
ALTER TABLE `RequestQRCode` ADD CONSTRAINT `RequestQRCode_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestQRCode` ADD CONSTRAINT `RequestQRCode_binId_fkey` FOREIGN KEY (`binId`) REFERENCES `Bin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
