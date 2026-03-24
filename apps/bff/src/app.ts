import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { AppDependencies } from './di/dependencies.js';
import { registerGlobalErrorHandler } from './plugins/error-handler.js';
import { registerDonationRoutes } from './routes/donation.routes.js';

export async function createApp(deps: AppDependencies): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  registerGlobalErrorHandler(app);

  await app.register(cors, { origin: true });
  await registerDonationRoutes(app, deps);

  return app;
}
