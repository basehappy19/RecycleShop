/*
  Warnings:

  - You are about to drop the column `TotalBottle` on the `Bin` table. All the data in the column will be lost.
  - You are about to drop the column `no` on the `Bin` table. All the data in the column will be lost.
  - You are about to drop the column `orderByStudentId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderCodeKey` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `statusId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `ListOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ManageProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Status` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `studentId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classroom` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ListOrder` DROP FOREIGN KEY `ListOrder_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `ListOrder` DROP FOREIGN KEY `ListOrder_productId_fkey`;

-- DropForeignKey
ALTER TABLE `ManageProduct` DROP FOREIGN KEY `ManageProduct_productId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_orderByStudentId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_statusId_fkey`;

-- DropForeignKey
ALTER TABLE `Record` DROP FOREIGN KEY `Record_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `RequestQRCode` DROP FOREIGN KEY `RequestQRCode_binId_fkey`;

-- DropForeignKey
ALTER TABLE `RequestQRCode` DROP FOREIGN KEY `RequestQRCode_studentId_fkey`;

-- DropIndex
DROP INDEX `Order_orderByStudentId_fkey` ON `Order`;

-- DropIndex
DROP INDEX `Order_statusId_fkey` ON `Order`;

-- DropIndex
DROP INDEX `Record_studentId_fkey` ON `Record`;

-- DropIndex
DROP INDEX `RequestQRCode_binId_fkey` ON `RequestQRCode`;

-- DropIndex
DROP INDEX `RequestQRCode_studentId_fkey` ON `RequestQRCode`;

-- AlterTable
ALTER TABLE `Bin` DROP COLUMN `TotalBottle`,
    DROP COLUMN `no`,
    ADD COLUMN `totalBottle` INTEGER NOT NULL DEFAULT 0,
    MODIFY `key` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `orderByStudentId`,
    DROP COLUMN `orderCodeKey`,
    DROP COLUMN `roomId`,
    DROP COLUMN `statusId`,
    ADD COLUMN `status` ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Canceled', 'Refunded') NOT NULL DEFAULT 'Pending',
    ADD COLUMN `studentId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `classroom` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `ListOrder`;

-- DropTable
DROP TABLE `ManageProduct`;

-- DropTable
DROP TABLE `Status`;

-- CreateTable
CREATE TABLE `Detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `inStock` INTEGER NOT NULL DEFAULT 0,
    `sales` INTEGER NOT NULL DEFAULT 0,
    `openSale` BOOLEAN NOT NULL DEFAULT false,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `newProduct` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Detail_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Record` ADD CONSTRAINT `Record_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Detail` ADD CONSTRAINT `Detail_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestQRCode` ADD CONSTRAINT `RequestQRCode_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestQRCode` ADD CONSTRAINT `RequestQRCode_binId_fkey` FOREIGN KEY (`binId`) REFERENCES `Bin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
