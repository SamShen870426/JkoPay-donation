-- CreateTable
CREATE TABLE `donation_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('groups', 'projects', 'products') NOT NULL,
    `title_zh` VARCHAR(255) NOT NULL,
    `summary_zh` VARCHAR(512) NOT NULL,
    `logo_key` VARCHAR(512) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `donation_items_category_id_idx`(`category`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
