-- AlterTable
ALTER TABLE `donation_items` ADD COLUMN `theme` ENUM(
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
) NOT NULL DEFAULT 'child_youth_care';

-- CreateIndex
CREATE INDEX `donation_items_category_theme_id_idx` ON `donation_items`(`category`, `theme`, `id`);
