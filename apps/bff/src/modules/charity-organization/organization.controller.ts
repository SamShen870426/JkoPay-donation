import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  charityOrganizationIdParamSchema,
  charityOrganizationProfileResponseSchema,
  charityOrganizationProjectsQuerySchema,
  donationListResponseSchema,
} from '@jkopay/contracts';
import { AppError } from '../../errors/app-error.js';
import type { OrganizationService } from './organization.service.js';

type OrgParams = { Params: { id: string } };
type OrgProjectsQuery = OrgParams & { Querystring: Record<string, string | string[] | undefined> };

export type OrganizationController = {
  getProfile: (request: FastifyRequest<OrgParams>, reply: FastifyReply) => Promise<void>;
  listProjects: (request: FastifyRequest<OrgProjectsQuery>, reply: FastifyReply) => Promise<void>;
};

export function createOrganizationController(
  service: OrganizationService,
): OrganizationController {
  return {
    async getProfile(request, reply) {
      const idParsed = charityOrganizationIdParamSchema.safeParse(request.params.id);
      if (!idParsed.success) {
        throw new AppError('VALIDATION_ERROR', 'Invalid id', 400, idParsed.error.flatten());
      }

      let body;
      try {
        body = await service.getProfile(idParsed.data);
      } catch (e) {
        if (e instanceof AppError) throw e;
        request.log.error(e);
        throw new AppError(
          'CHARITY_ORG_PROFILE_FAILED',
          'Failed to load charity organization',
          500,
        );
      }

      const out = charityOrganizationProfileResponseSchema.safeParse(body);
      if (!out.success) {
        request.log.error(out.error, 'Response contract mismatch');
        throw new AppError('RESPONSE_CONTRACT_MISMATCH', 'Response validation failed', 500);
      }

      return reply.send(out.data);
    },

    async listProjects(request, reply) {
      const idParsed = charityOrganizationIdParamSchema.safeParse(request.params.id);
      if (!idParsed.success) {
        throw new AppError('VALIDATION_ERROR', 'Invalid id', 400, idParsed.error.flatten());
      }

      const qParsed = charityOrganizationProjectsQuerySchema.safeParse(request.query);
      if (!qParsed.success) {
        throw new AppError('VALIDATION_ERROR', 'Invalid query', 400, qParsed.error.flatten());
      }

      let body;
      try {
        body = await service.getProjectsPage(idParsed.data, qParsed.data);
      } catch (e) {
        if (e instanceof AppError) throw e;
        request.log.error(e);
        throw new AppError(
          'CHARITY_ORG_PROJECTS_FAILED',
          'Failed to load organization projects',
          500,
        );
      }

      const out = donationListResponseSchema.safeParse(body);
      if (!out.success) {
        request.log.error(out.error, 'Response contract mismatch');
        throw new AppError('RESPONSE_CONTRACT_MISMATCH', 'Response validation failed', 500);
      }

      return reply.send(out.data);
    },
  };
}
