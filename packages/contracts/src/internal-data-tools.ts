import { z } from 'zod';

/** POST /api/v1/internal/data-tools（僅 BFF 設定密鑰時啟用） */
export const internalDataToolsRequestSchema = z.object({
  secret: z.string().min(1).max(512),
  mode: z.enum(['wipe', 'wipe_and_bulk_seed']),
  /** 每團體產生 1 筆團體列 + 2 專案 + 5 商品（共 8 筆 donation_items + 1 主檔） */
  organizationCount: z.number().int().min(1).max(5000).optional().default(30),
});

export type InternalDataToolsRequest = z.infer<typeof internalDataToolsRequestSchema>;

export const internalDataToolsResponseSchema = z.object({
  ok: z.literal(true),
  mode: z.enum(['wipe', 'wipe_and_bulk_seed']),
  wiped: z.boolean(),
  bulkSeeded: z.boolean(),
  organizationCount: z.number().int().optional(),
  organizationsCreated: z.number().int().optional(),
  donationItemsCreated: z.number().int().optional(),
});

export type InternalDataToolsResponse = z.infer<typeof internalDataToolsResponseSchema>;
