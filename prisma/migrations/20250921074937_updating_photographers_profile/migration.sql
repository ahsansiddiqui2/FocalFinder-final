/*
  Warnings:

  - You are about to drop the column `userId` on the `PortfolioItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `PortfolioItem` DROP FOREIGN KEY `PortfolioItem_userId_fkey`;

-- DropIndex
DROP INDEX `PortfolioItem_userId_fkey` ON `PortfolioItem`;

-- AlterTable
ALTER TABLE `PhotographerProfile` ADD COLUMN `equipment` VARCHAR(191) NULL,
    ADD COLUMN `specialty` VARCHAR(191) NULL,
    ADD COLUMN `travelDistance` VARCHAR(191) NULL,
    ADD COLUMN `yearsExperience` INTEGER NULL;

-- AlterTable
ALTER TABLE `PortfolioItem` DROP COLUMN `userId`,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false;
