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
  /**
   * 義賣商品列表（category=products）：後端有 `CharityProduct` 時一併輸出。
   * 價格區間由所有選項單價的 min／max 推導；相等時前端顯示單一價格。
   */
  productOrganizationName: z.string().optional(),
  productCoverImageUrl: z.string().optional(),
  /** 整數金額（TWD 為元） */
  productPriceMin: z.number().int().nonnegative().optional(),
  productPriceMax: z.number().int().nonnegative().optional(),
  productCurrency: z.string().optional(),
  /** 公益團體列（category=groups）：有綁定主檔時供前端導向個人頁 */
  organizationId: z.string().optional(),
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

/** 路徑參數：捐款項目 id（數字字串） */
export const donationItemIdParamSchema = z.string().regex(/^\d+$/).max(20);
export type DonationItemIdParam = z.infer<typeof donationItemIdParamSchema>;

export const charityProductOptionDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  unitPrice: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative(),
  sortOrder: z.number().int(),
});

export type CharityProductOptionDto = z.infer<typeof charityProductOptionDtoSchema>;

/** 義賣商品詳情（GET …/donation-items/:id/charity-product） */
export const charityProductDetailSchema = z.object({
  donationItemId: z.string(),
  title: z.string(),
  /** 輪播上方灰字副標（對應列表摘要 summary） */
  subtitle: z.string(),
  organizationName: z.string(),
  /** 對應 charity_organizations.id，供「查看團體」導向個人頁 */
  organizationId: z.string(),
  /** 團體列左側圓形 logo（來自捐款項目 logo） */
  organizationLogoUrl: z.string(),
  currency: z.string(),
  priceMin: z.number().int().nonnegative(),
  priceMax: z.number().int().nonnegative(),
  shippingFeeAmount: z.number().int().nonnegative(),
  /** 依 sortOrder 排序後的完整圖片 URL */
  imageUrls: z.array(z.string()).min(1),
  /** 對應 imageUrls 的初始頁（isPrimary 優先） */
  primaryImageIndex: z.number().int().nonnegative(),
  themes: z.array(charityThemeSchema),
  /** 商品說明全文（詳情區塊） */
  description: z.string(),
  options: z.array(charityProductOptionDtoSchema),
});

export type CharityProductDetail = z.infer<typeof charityProductDetailSchema>;
