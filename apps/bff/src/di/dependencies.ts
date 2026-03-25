import { PrismaClient } from '@prisma/client';
import { OrganizationRepository } from '../modules/charity-organization/organization.repository.js';
import { OrganizationService } from '../modules/charity-organization/organization.service.js';
import { DonationRepository } from '../modules/donation/donation.repository.js';
import { DonationService } from '../modules/donation/donation.service.js';

export type AppDependencies = {
  prisma: PrismaClient;
  donationRepository: DonationRepository;
  donationService: DonationService;
  organizationRepository: OrganizationRepository;
  organizationService: OrganizationService;
};

export type DependencyOverrides = Partial<{
  prisma: PrismaClient;
  donationRepository: DonationRepository;
  donationService: DonationService;
  organizationRepository: OrganizationRepository;
  organizationService: OrganizationService;
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
  const organizationRepository =
    overrides.organizationRepository ?? new OrganizationRepository(prisma);
  const organizationService =
    overrides.organizationService ?? new OrganizationService(organizationRepository);

  return {
    prisma,
    donationRepository,
    donationService,
    organizationRepository,
    organizationService,
  };
}
