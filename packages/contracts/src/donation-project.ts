import { z } from 'zod';
import { charityThemeSchema } from './donation.js';

/** 與 Prisma `ProjectDonationPaymentKind` 一致 */
export const projectDonationPaymentKindSchema = z.enum(['recurring_monthly', 'one_time']);
export type ProjectDonationPaymentKind = z.infer<typeof projectDonationPaymentKindSchema>;

export const donationProjectCheckoutSchema = z.object({
  paymentKinds: z.array(projectDonationPaymentKindSchema),
  /** 定期捐款可選扣款日（每月幾號） */
  billingDays: z.array(z.number().int().min(1).max(28)),
  amountPresets: z.array(
    z.object({
      amount: z.number().int().positive(),
      currency: z.string(),
    }),
  ),
  allowCustomAmount: z.boolean(),
});

export type DonationProjectCheckout = z.infer<typeof donationProjectCheckoutSchema>;

/** GET …/donation-items/:id/project */
export const donationProjectDetailSchema = z.object({
  donationItemId: z.string(),
  title: z.string(),
  /** 列表摘要／副標 */
  subtitle: z.string(),
  /** 勸募立案核准字號（可空則前端不顯示灰字列） */
  fundraisingLicense: z.string().nullable(),
  heroImageUrls: z.array(z.string()).min(1),
  primaryHeroImageIndex: z.number().int().nonnegative(),
  organizationId: z.string().nullable(),
  organizationName: z.string(),
  organizationLogoUrl: z.string(),
  themes: z.array(charityThemeSchema),
  /** 專案內容長文 */
  projectDetail: z.string(),
  disclaimer: z.string().nullable(),
  checkout: donationProjectCheckoutSchema,
});

export type DonationProjectDetail = z.infer<typeof donationProjectDetailSchema>;
