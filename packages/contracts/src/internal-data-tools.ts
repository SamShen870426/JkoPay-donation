import { z } from 'zod';

/** POST /api/v1/internal/data-tools（僅 BFF 設定密鑰時啟用） */
export const internalDataToolsRequestSchema = z
  .object({
    secret: z.string().min(1).max(512),
    mode: z.enum(['wipe', 'wipe_and_bulk_seed', 'bulk_seed_batch']),
    /** wipe_and_bulk_seed：團體總數（單次請求，易逾時） */
    organizationCount: z.number().int().min(1).max(5000).optional().default(30),
    /** bulk_seed_batch：目標團體總數 */
    totalOrganizationCount: z.number().int().min(1).max(5000).optional(),
    /** bulk_seed_batch：第幾批（0 起算） */
    batchIndex: z.number().int().min(0).optional(),
    /** bulk_seed_batch：每批團體數（預設 50，上限 200 避免單次請求過久） */
    batchSize: z.number().int().min(1).max(200).optional().default(50),
    /** bulk_seed_batch：僅 batchIndex===0 時允許；先清空再種本批 */
    wipeFirst: z.boolean().optional().default(false),
  })
  .superRefine((val, ctx) => {
    if (val.mode === 'bulk_seed_batch') {
      if (val.totalOrganizationCount == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'bulk_seed_batch 需要 totalOrganizationCount',
          path: ['totalOrganizationCount'],
        });
      }
      if (val.batchIndex == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'bulk_seed_batch 需要 batchIndex',
          path: ['batchIndex'],
        });
      }
      if (val.wipeFirst && val.batchIndex !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'wipeFirst 僅能在 batchIndex 0 使用',
          path: ['wipeFirst'],
        });
      }
    }
  });

export type InternalDataToolsRequest = z.infer<typeof internalDataToolsRequestSchema>;

export const internalDataToolsResponseSchema = z.object({
  ok: z.literal(true),
  mode: z.enum(['wipe', 'wipe_and_bulk_seed', 'bulk_seed_batch']),
  wiped: z.boolean(),
  bulkSeeded: z.boolean(),
  organizationCount: z.number().int().optional(),
  organizationsCreated: z.number().int().optional(),
  donationItemsCreated: z.number().int().optional(),
  /** bulk_seed_batch */
  totalOrganizationCount: z.number().int().optional(),
  batchIndex: z.number().int().optional(),
  batchSize: z.number().int().optional(),
  rangeStart: z.number().int().optional(),
  rangeEnd: z.number().int().optional(),
  batchDone: z.boolean().optional(),
  nextBatchIndex: z.number().int().optional(),
});

export type InternalDataToolsResponse = z.infer<typeof internalDataToolsResponseSchema>;
