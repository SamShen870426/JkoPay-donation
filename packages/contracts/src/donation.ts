import { z } from 'zod';

/** URL query：與 BFF / 前端 Tab 一致 */
export const donationCategorySchema = z.enum(['groups', 'projects', 'products']);
export type DonationCategory = z.infer<typeof donationCategorySchema>;

export const donationListQuerySchema = z.object({
  category: donationCategorySchema,
  q: z.string().max(200).optional().default(''),
  cursor: z.string().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type DonationListQuery = z.infer<typeof donationListQuerySchema>;

export const donationListItemSchema = z.object({
  id: z.string(),
  category: donationCategorySchema,
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
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
