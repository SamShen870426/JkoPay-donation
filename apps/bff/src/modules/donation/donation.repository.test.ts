import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { DonationRepository } from './donation.repository.js';

function createDbMock() {
  const findMany = vi.fn().mockResolvedValue([]);
  const db = {
    donationItem: { findMany },
  } as unknown as PrismaClient;
  return { db, findMany };
}

describe('DonationRepository.findByCategoryKeyset', () => {
  it('組出 category、id 游標、theme 與關鍵字 OR', async () => {
    const { db, findMany } = createDbMock();
    const repo = new DonationRepository(db);

    await repo.findByCategoryKeyset({
      category: 'groups',
      theme: 'elderly_care',
      q: '  基金會 ',
      cursorId: 100,
      take: 21,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        category: 'groups',
        theme: 'elderly_care',
        id: { gt: 100 },
        OR: [{ titleZh: { contains: '基金會' } }, { summaryZh: { contains: '基金會' } }],
      },
      orderBy: { id: 'asc' },
      take: 21,
    });
  });

  it('未指定 theme 時 where 不含 theme', async () => {
    const { db, findMany } = createDbMock();
    const repo = new DonationRepository(db);

    await repo.findByCategoryKeyset({
      category: 'projects',
      q: '',
      cursorId: null,
      take: 20,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({ theme: expect.anything() }),
      }),
    );
    const where = findMany.mock.calls[0]![0].where as Record<string, unknown>;
    expect(where).not.toHaveProperty('theme');
  });

  it('游標為 null 時不加 id 條件', async () => {
    const { db, findMany } = createDbMock();
    const repo = new DonationRepository(db);

    await repo.findByCategoryKeyset({
      category: 'products',
      q: '',
      cursorId: null,
      take: 20,
    });

    const where = findMany.mock.calls[0]![0].where as Record<string, unknown>;
    expect(where).not.toHaveProperty('id');
  });

  it('僅空白關鍵字不組 OR', async () => {
    const { db, findMany } = createDbMock();
    const repo = new DonationRepository(db);

    await repo.findByCategoryKeyset({
      category: 'groups',
      q: '   \t  ',
      cursorId: null,
      take: 20,
    });

    const where = findMany.mock.calls[0]![0].where as Record<string, unknown>;
    expect(where).not.toHaveProperty('OR');
  });
});
