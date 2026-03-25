import type { FastifyInstance } from 'fastify';
import type { AppDependencies } from '../di/dependencies.js';
import { createDonationController } from '../modules/donation/donation.controller.js';

export async function registerDonationRoutes(
  app: FastifyInstance,
  deps: Pick<AppDependencies, 'donationService'>,
) {
  const donationController = createDonationController(deps.donationService);
  app.get('/api/v1/donation-items', donationController.list);
  app.get(
    '/api/v1/donation-items/:id/charity-product',
    donationController.getCharityProduct,
  );
  app.get('/api/v1/donation-items/:id/project', donationController.getDonationProject);
}
