import { Prisma } from '@prisma/client';
import type { DonationListQuery, DonationListResponse } from '@jkopay/contracts';
import { AppError } from '../../errors/app-error.js';
import { nextCursorFromPage, trimExtraForCursor } from '../../lib/pagination.js';
import type { DonationRepository } from './donation.repository.js';
import { toDonationListItem } from './donation.transformer.js';

function parseCursorId(raw: string | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

export class DonationService {
  constructor(private readonly repo: DonationRepository) {}

  async list(query: DonationListQuery): Promise<DonationListResponse> {
    const limit = query.limit;
    const cursorId = parseCursorId(query.cursor);

    let rows;
    try {
      rows = await this.repo.findByCategoryKeyset({
        category: query.category,
        theme: query.theme,
        q: query.q,
        cursorId,
        take: limit + 1,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('DATABASE_ERROR', 'Database request failed', 500);
      }
      throw e;
    }

    const { page, hasMore } = trimExtraForCursor(rows, limit);
    const items = page.map(toDonationListItem);

    return {
      items,
      pageInfo: {
        nextCursor: hasMore ? nextCursorFromPage(page) : null,
        hasMore,
      },
    };
  }
}
