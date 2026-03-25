-- 移除獨立標籤表，改為捐款項目 ↔ CharityTheme 多對多（與篩選類別一致）

ALTER TABLE `donation_item_tags` DROP FOREIGN KEY `donation_item_tags_donation_item_id_fkey`;
ALTER TABLE `donation_item_tags` DROP FOREIGN KEY `donation_item_tags_tag_id_fkey`;

DROP TABLE `donation_item_tags`;
DROP TABLE `donation_tags`;

CREATE TABLE `donation_item_themes` (
    `donation_item_id` INTEGER NOT NULL,
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

    INDEX `donation_item_themes_theme_donation_item_id_idx`(`theme`, `donation_item_id`),
    PRIMARY KEY (`donation_item_id`, `theme`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `donation_item_themes` (`donation_item_id`, `theme`, `sort_order`)
SELECT `id`, `theme`, 0 FROM `donation_items`;

ALTER TABLE `donation_item_themes` ADD CONSTRAINT `donation_item_themes_donation_item_id_fkey` FOREIGN KEY (`donation_item_id`) REFERENCES `donation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX `donation_items_category_theme_id_idx` ON `donation_items`;

ALTER TABLE `donation_items` DROP COLUMN `theme`;
