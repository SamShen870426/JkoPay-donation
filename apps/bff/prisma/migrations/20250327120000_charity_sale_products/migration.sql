-- CreateTable
CREATE TABLE `charity_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donation_item_id` INTEGER NOT NULL,
    `organization_name_zh` VARCHAR(255) NOT NULL,
    `description_zh` TEXT NOT NULL,
    `currency` VARCHAR(8) NOT NULL DEFAULT 'TWD',
    `shipping_fee_amount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `charity_products_donation_item_id_key`(`donation_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charity_product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `image_key` VARCHAR(512) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `charity_product_images_product_id_sort_order_idx`(`product_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charity_product_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `label_zh` VARCHAR(255) NOT NULL,
    `unit_price_amount` INTEGER NOT NULL,
    `stock_quantity` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `charity_product_options_product_id_sort_order_idx`(`product_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `charity_products` ADD CONSTRAINT `charity_products_donation_item_id_fkey` FOREIGN KEY (`donation_item_id`) REFERENCES `donation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `charity_product_images` ADD CONSTRAINT `charity_product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `charity_products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `charity_product_options` ADD CONSTRAINT `charity_product_options_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `charity_products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
