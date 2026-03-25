import type { Prisma, PrismaClient } from '@prisma/client';
import type { CharityTheme, DonationCategory } from '@jkopay/contracts';
import { donationItemListInclude } from './donation.transformer.js';

export class DonationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByCategoryKeyset(input: {
    category: DonationCategory;
    theme?: CharityTheme;
    q: string;
    cursorId: number | null;
    take: number;
  }) {
    const q = input.q.trim();
    const where: Prisma.DonationItemWhereInput = {
      category: input.category,
      ...(input.theme != null
        ? { itemThemes: { some: { theme: input.theme } } }
        : {}),
      ...(input.cursorId != null ? { id: { gt: input.cursorId } } : {}),
      ...(q.length > 0
        ? {
            OR: [
              { titleZh: { contains: q } },
              { summaryZh: { contains: q } },
              { organizationNameZh: { contains: q } },
              {
                charityProduct: {
                  is: {
                    OR: [
                      { organizationNameZh: { contains: q } },
                      { descriptionZh: { contains: q } },
                      { options: { some: { labelZh: { contains: q } } } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    return this.db.donationItem.findMany({
      where,
      orderBy: { id: 'asc' },
      take: input.take,
      include: donationItemListInclude,
    });
  }
}
