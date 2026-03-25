import { z } from 'zod';
import { charityThemeSchema } from './donation.js';
import { donationListItemSchema, donationListResponseSchema } from './donation.js';

/** 路徑參數：公益團體 id（數字字串） */
export const charityOrganizationIdParamSchema = z.string().regex(/^\d+$/).max(20);
export type CharityOrganizationIdParam = z.infer<typeof charityOrganizationIdParamSchema>;

/** 個人頁頂部團體區塊（聯絡方式可為 null） */
export const charityOrganizationProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string(),
  /** 無自訂背景圖時為預設圖 URL（與列表缺圖同一張，同源 `/donation-demo-logo.png`） */
  bannerUrl: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  registrationNumber: z.string().nullable(),
  description: z.string(),
  themes: z.array(charityThemeSchema),
});

export type CharityOrganizationProfile = z.infer<typeof charityOrganizationProfileSchema>;

export const charityOrganizationProjectsQuerySchema = z.object({
  cursor: z.string().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type CharityOrganizationProjectsQuery = z.infer<
  typeof charityOrganizationProjectsQuerySchema
>;

/** GET /charity-organizations/:id — 含首屏義賣（上限由 BFF 決定）與專案第一頁 */
export const charityOrganizationProfileResponseSchema = z.object({
  organization: charityOrganizationProfileSchema,
  products: z.array(donationListItemSchema),
  projects: donationListResponseSchema,
});

export type CharityOrganizationProfileResponse = z.infer<
  typeof charityOrganizationProfileResponseSchema
>;
