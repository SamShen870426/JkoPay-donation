import type { Prisma, PrismaClient } from '@prisma/client';
import type { DonationCategory } from '@jkopay/contracts';

export class DonationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByCategoryKeyset(input: {
    category: DonationCategory;
    q: string;
    cursorId: number | null;
    take: number;
  }) {
    const q = input.q.trim();
    const where: Prisma.DonationItemWhereInput = {
      category: input.category,
      ...(input.cursorId != null ? { id: { gt: input.cursorId } } : {}),
      ...(q.length > 0
        ? {
            OR: [
              { titleZh: { contains: q } },
              { summaryZh: { contains: q } },
            ],
          }
        : {}),
    };

    return this.db.donationItem.findMany({
      where,
      orderBy: { id: 'asc' },
      take: input.take,
    });
  }
}
