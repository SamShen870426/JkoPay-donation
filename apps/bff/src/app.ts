import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { AppDependencies } from './di/dependencies.js';
import { registerGlobalErrorHandler } from './plugins/error-handler.js';
import { registerCharityOrganizationRoutes } from './routes/charity-organization.routes.js';
import { registerDonationRoutes } from './routes/donation.routes.js';

export type CreateAppOptions = {
  /** 測試時關閉避免污染 stdout */
  logger?: boolean;
};

export async function createApp(
  deps: AppDependencies,
  options: CreateAppOptions = {},
): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? true });
  registerGlobalErrorHandler(app);

  await app.register(cors, { origin: true });
  await registerDonationRoutes(app, deps);
  await registerCharityOrganizationRoutes(app, deps);

  return app;
}
