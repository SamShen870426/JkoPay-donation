import type { FastifyInstance } from 'fastify';
import type { AppDependencies } from '../di/dependencies.js';
import { createOrganizationController } from '../modules/charity-organization/organization.controller.js';

export async function registerCharityOrganizationRoutes(
  app: FastifyInstance,
  deps: Pick<AppDependencies, 'organizationService'>,
) {
  const c = createOrganizationController(deps.organizationService);
  app.get('/api/v1/charity-organizations/:id', c.getProfile);
  app.get('/api/v1/charity-organizations/:id/projects', c.listProjects);
}
