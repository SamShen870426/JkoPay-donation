import { z } from 'zod';

/**
 * BFF 全域錯誤回應（與 Fastify errorHandler 一致）
 * 格式：{ error: ERROR_CODE, message, details? }
 */
export const apiErrorBodySchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
