import type { FastifyInstance } from 'fastify';
import { apiErrorBodySchema } from '@jkopay/contracts';
import { AppError } from '../errors/app-error.js';

/**
 * 必須註冊在根 app（勿用 encapsulate 子 context），以攔截所有路由錯誤。
 */
export function registerGlobalErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      const body = {
        error: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      };
      const parsed = apiErrorBodySchema.safeParse(body);
      if (!parsed.success) {
        request.log.error(parsed.error, 'AppError body contract mismatch');
      }
      return reply.status(error.statusCode).send(body);
    }

    request.log.error(error);

    const body = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return reply.status(500).send(body);
  });
}
