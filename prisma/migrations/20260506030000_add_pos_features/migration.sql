-- AlterTable
ALTER TABLE `Product` ADD COLUMN `categoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `cashReceived` DECIMAL(65, 30) NULL,
    ADD COLUMN `changeAmount` DECIMAL(65, 30) NULL,
    ADD COLUMN `invoiceNumber` VARCHAR(191) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'CASH';

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockAdjustment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Populate invoice numbers for existing rows
UPDATE `Transaction`
SET `invoiceNumber` = CONCAT('LEGACY-', `id`)
WHERE `invoiceNumber` IS NULL;

ALTER TABLE `Transaction` MODIFY `invoiceNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_invoiceNumber_key` ON `Transaction`(`invoiceNumber`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAdjustment` ADD CONSTRAINT `StockAdjustment_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAdjustment` ADD CONSTRAINT `StockAdjustment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
