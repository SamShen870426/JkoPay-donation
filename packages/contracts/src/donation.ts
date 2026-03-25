import { z } from 'zod';

/** URL query：與 BFF / 前端 Tab 一致 */
export const donationCategorySchema = z.enum(['groups', 'projects', 'products']);
export type DonationCategory = z.infer<typeof donationCategorySchema>;

/** 與 Prisma `CharityTheme` 一致，順序供 seed / UI 網格使用 */
export const CHARITY_THEME_VALUES = [
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
  'international_relief',
] as const;

export const charityThemeSchema = z.enum(CHARITY_THEME_VALUES);
export type CharityTheme = z.infer<typeof charityThemeSchema>;

export const donationListQuerySchema = z.object({
  category: donationCategorySchema,
  q: z.string().max(200).optional().default(''),
  cursor: z.string().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  theme: charityThemeSchema.optional(),
});

export type DonationListQuery = z.infer<typeof donationListQuerySchema>;

export const donationListItemSchema = z.object({
  id: z.string(),
  category: donationCategorySchema,
  title: z.string(),
  description: z.string(),
  /** 列表左側小圖／專案卡可另用 heroImageUrl */
  imageUrl: z.string(),
  /** 捐款專案：所屬團體（紅字） */
  organizationName: z.string().optional(),
  /** 捐款專案：頂部大圖 */
  heroImageUrl: z.string().optional(),
  /**
   * 捐款專案底部「類別」列：與篩選 sheet 同一套 CharityTheme，可多個。
   * 團體／商品列不帶此欄。
   */
  themes: z.array(charityThemeSchema).optional(),
});

export type DonationListItem = z.infer<typeof donationListItemSchema>;

export const donationListResponseSchema = z.object({
  items: z.array(donationListItemSchema),
  pageInfo: z.object({
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  }),
});

export type DonationListResponse = z.infer<typeof donationListResponseSchema>;
