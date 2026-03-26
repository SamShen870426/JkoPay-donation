import type { FastifyInstance } from 'fastify';
import type { AppDependencies } from '../di/dependencies.js';
import { DevDataToolsService } from '../modules/dev-data-tools/dev-data-tools.service.js';

/** 僅在設定 `DEV_DATA_TOOLS_SECRET` 時註冊，否則不暴露路由。 */
export async function registerDevDataToolsRoutes(
  app: FastifyInstance,
  deps: AppDependencies,
): Promise<void> {
  if (DevDataToolsService.getConfiguredSecret() == null) return;

  const service = new DevDataToolsService(deps.prisma);
  app.post('/api/v1/internal/data-tools', async (request, reply) => {
    await service.handle(request, reply);
  });
}
