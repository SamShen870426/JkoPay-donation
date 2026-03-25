-- 公益團體主檔：個人頁基本資料、主題標籤；捐款項目／義賣商品以 organization_id 關聯
CREATE TABLE `charity_organizations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_zh` VARCHAR(255) NOT NULL,
    `logo_key` VARCHAR(512) NOT NULL,
    `profile_banner_key` VARCHAR(512) NULL,
    `phone` VARCHAR(64) NULL,
    `email` VARCHAR(255) NULL,
    `website_url` VARCHAR(512) NULL,
    `registration_number_zh` VARCHAR(255) NULL,
    `description_zh` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `charity_organization_themes` (
    `organization_id` INTEGER NOT NULL,
    `theme` ENUM(
        'child_youth_care',
        'animal_protection',
        'special_medical',
        'elderly_care',
        'disability_services',
        'women_care',
        'sports_development',
        'education_advocacy',
        'environmental_protection',
        'multicultural',
        'media_communication',
        'public_issues',
        'culture_arts',
        'community_development',
        'poverty_relief',
        'international_relief'
    ) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `charity_organization_themes_theme_organization_id_idx`(`theme`, `organization_id`),
    PRIMARY KEY (`organization_id`, `theme`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `charity_organization_themes` ADD CONSTRAINT `charity_organization_themes_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `charity_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 舊義賣列改綁主檔：先移除商品列（請重新執行 seed）
DELETE FROM `donation_items` WHERE `category` = 'products';

ALTER TABLE `donation_items`
    ADD COLUMN `organization_id` INTEGER NULL,
    ADD INDEX `donation_items_organization_id_category_id_idx`(`organization_id`, `category`, `id`),
    ADD CONSTRAINT `donation_items_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `charity_organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `charity_products` DROP COLUMN `organization_name_zh`,
    ADD COLUMN `organization_id` INTEGER NOT NULL,
    ADD INDEX `charity_products_organization_id_idx`(`organization_id`),
    ADD CONSTRAINT `charity_products_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `charity_organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
