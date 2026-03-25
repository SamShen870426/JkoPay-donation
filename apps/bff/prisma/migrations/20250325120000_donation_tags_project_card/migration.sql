-- 自訂標籤（後台可維護；此處先 seed 假資料）
CREATE TABLE `donation_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(64) NOT NULL,
    `label_zh` VARCHAR(64) NOT NULL,

    UNIQUE INDEX `donation_tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 捐款項目 ↔ 標籤（多對多，sort_order 供後台排序）
CREATE TABLE `donation_item_tags` (
    `donation_item_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`donation_item_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 專案卡：主視覺圖、所屬團體（紅字列）
ALTER TABLE `donation_items`
    ADD COLUMN `organization_name_zh` VARCHAR(255) NULL,
    ADD COLUMN `hero_image_key` VARCHAR(512) NULL;

ALTER TABLE `donation_item_tags` ADD CONSTRAINT `donation_item_tags_donation_item_id_fkey` FOREIGN KEY (`donation_item_id`) REFERENCES `donation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `donation_item_tags` ADD CONSTRAINT `donation_item_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `donation_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
