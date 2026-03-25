import type { PrismaClient } from '@prisma/client';
import { donationItemListInclude } from '../donation/donation.transformer.js';

export class OrganizationRepository {
  constructor(private readonly db: PrismaClient) {}

  findByIdWithThemes(id: number) {
    return this.db.charityOrganization.findUnique({
      where: { id },
      include: {
        themes: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  findProductDonationRowsByOrganizationId(input: {
    organizationId: number;
    cursorId: number | null;
    take: number;
  }) {
    return this.db.donationItem.findMany({
      where: {
        category: 'products',
        charityProduct: { organizationId: input.organizationId },
        ...(input.cursorId != null ? { id: { gt: input.cursorId } } : {}),
      },
      orderBy: { id: 'asc' },
      take: input.take,
      include: donationItemListInclude,
    });
  }

  findProjectDonationRowsByOrganizationId(input: {
    organizationId: number;
    cursorId: number | null;
    take: number;
  }) {
    return this.db.donationItem.findMany({
      where: {
        category: 'projects',
        organizationId: input.organizationId,
        ...(input.cursorId != null ? { id: { gt: input.cursorId } } : {}),
      },
      orderBy: { id: 'asc' },
      take: input.take,
      include: donationItemListInclude,
    });
  }
}
