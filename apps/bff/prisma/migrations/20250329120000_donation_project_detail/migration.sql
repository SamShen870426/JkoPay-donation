-- AlterTable
ALTER TABLE `donation_items`
    ADD COLUMN `fundraising_license_zh` VARCHAR(64) NULL,
    ADD COLUMN `project_detail_zh` TEXT NULL,
    ADD COLUMN `project_disclaimer_zh` TEXT NULL;

-- CreateTable
CREATE TABLE `donation_project_hero_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donation_item_id` INTEGER NOT NULL,
    `image_key` VARCHAR(512) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `donation_project_hero_images_donation_item_id_sort_order_idx`(`donation_item_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_item_project_payment_options` (
    `donation_item_id` INTEGER NOT NULL,
    `kind` ENUM('recurring_monthly', 'one_time') NOT NULL,

    PRIMARY KEY (`donation_item_id`, `kind`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_item_billing_days` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donation_item_id` INTEGER NOT NULL,
    `day_of_month` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `donation_item_billing_days_donation_item_id_sort_order_idx`(`donation_item_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_item_amount_presets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donation_item_id` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(8) NOT NULL DEFAULT 'TWD',
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `donation_item_amount_presets_donation_item_id_sort_order_idx`(`donation_item_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `donation_project_hero_images` ADD CONSTRAINT `donation_project_hero_images_donation_item_id_fkey` FOREIGN KEY (`donation_item_id`) REFERENCES `donation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_item_project_payment_options` ADD CONSTRAINT `donation_item_project_payment_options_donation_item_id_fkey` FOREIGN KEY (`donation_item_id`) REFERENCES `donation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_item_billing_days` ADD CONSTRAINT `donation_item_billing_days_donation_item_id_fkey` FOREIGN KEY (`donation_item_id`) REFERENCES `donation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_item_amount_presets` ADD CONSTRAINT `donation_item_amount_presets_donation_item_id_fkey` FOREIGN KEY (`donation_item_id`) REFERENCES `donation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
