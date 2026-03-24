import type { FastifyReply, FastifyRequest } from 'fastify';
import { donationListQuerySchema, donationListResponseSchema } from '@jkopay/contracts';
import { AppError } from '../../errors/app-error.js';
import type { DonationService } from './donation.service.js';

export type DonationController = {
  list: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
};

export function createDonationController(service: DonationService): DonationController {
  return {
    async list(request, reply) {
      const parsed = donationListQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        throw new AppError('VALIDATION_ERROR', 'Invalid query', 400, parsed.error.flatten());
      }

      let body;
      try {
        body = await service.list(parsed.data);
      } catch (e) {
        if (e instanceof AppError) throw e;
        request.log.error(e);
        throw new AppError('DONATION_LIST_FAILED', 'Failed to load donation items', 500);
      }

      const out = donationListResponseSchema.safeParse(body);
      if (!out.success) {
        request.log.error(out.error, 'Response contract mismatch');
        throw new AppError(
          'RESPONSE_CONTRACT_MISMATCH',
          'Response validation failed',
          500,
        );
      }

      return reply.send(out.data);
    },
  };
}
