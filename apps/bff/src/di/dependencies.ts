import { PrismaClient } from '@prisma/client';
import { DonationRepository } from '../modules/donation/donation.repository.js';
import { DonationService } from '../modules/donation/donation.service.js';

export type AppDependencies = {
  prisma: PrismaClient;
  donationRepository: DonationRepository;
  donationService: DonationService;
};

export type DependencyOverrides = Partial<{
  prisma: PrismaClient;
  donationRepository: DonationRepository;
  donationService: DonationService;
}>;

/**
 * 集中組裝依賴，便於整合測試注入 mock Repository／Service。
 */
export function buildDependencies(overrides: DependencyOverrides = {}): AppDependencies {
  const prisma = overrides.prisma ?? new PrismaClient();
  const donationRepository =
    overrides.donationRepository ?? new DonationRepository(prisma);
  const donationService =
    overrides.donationService ?? new DonationService(donationRepository);

  return { prisma, donationRepository, donationService };
}
