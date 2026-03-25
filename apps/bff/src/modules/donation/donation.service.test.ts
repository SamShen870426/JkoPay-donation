import { Prisma } from '@prisma/client';
import type { DonationListQuery } from '@jkopay/contracts';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../errors/app-error.js';
import type { DonationRepository } from './donation.repository.js';
import { DonationService } from './donation.service.js';
import type { DonationItemListRow } from './donation.transformer.js';

function mockRepo(
  impl: Partial<
    Pick<
      DonationRepository,
      'findByCategoryKeyset' | 'findByIdWithListInclude' | 'findByIdForProjectDetail'
    >
  > = {},
): DonationRepository {
  return {
    findByCategoryKeyset: vi.fn(),
    findByIdWithListInclude: vi.fn(),
    findByIdForProjectDetail: vi.fn(),
    ...impl,
  } as unknown as DonationRepository;
}

const prismaRow = (id: number): DonationItemListRow => ({
  id,
  category: 'groups',
  titleZh: `標題${id}`,
  summaryZh: '摘要',
  logoKey: '/donation-demo-logo.png',
  createdAt: new Date(),
  organizationId: null,
  organization: null,
  organizationNameZh: null,
  heroImageKey: null,
  fundraisingLicenseZh: null,
  projectDetailZh: null,
  projectDisclaimerZh: null,
  itemThemes: [{ donationItemId: id, theme: 'animal_protection', sortOrder: 0 }],
  charityProduct: null,
});

describe('DonationService.list', () => {
  it('以 limit+1 向 repository 取資料並帶入 category、theme、q、cursor', async () => {
    const findByCategoryKeyset = vi.fn().mockResolvedValue([prismaRow(1)]);
    const service = new DonationService(mockRepo({ findByCategoryKeyset }));

    const query: DonationListQuery = {
      category: 'groups',
      q: '  兒童  ',
      cursor: '5',
      limit: 10,
      theme: 'child_youth_care',
    };

    await service.list(query);

    expect(findByCategoryKeyset).toHaveBeenCalledWith({
      category: 'groups',
      theme: 'child_youth_care',
      q: '  兒童  ',
      cursorId: 5,
      take: 11,
    });
  });

  it('無效或非正整數 cursor 視為第一頁（cursorId null）', async () => {
    const findByCategoryKeyset = vi.fn().mockResolvedValue([]);
    const service = new DonationService(mockRepo({ findByCategoryKeyset }));

    await service.list({
      category: 'projects',
      q: '',
      limit: 20,
      cursor: '0',
    });
    expect(findByCategoryKeyset).toHaveBeenCalledWith(
      expect.objectContaining({ cursorId: null }),
    );

    findByCategoryKeyset.mockClear();
    await service.list({
      category: 'projects',
      q: '',
      limit: 20,
      cursor: 'not-a-number',
    });
    expect(findByCategoryKeyset).toHaveBeenCalledWith(
      expect.objectContaining({ cursorId: null }),
    );
  });

  it('多取一筆時 hasMore 為 true 且 nextCursor 為最末筆 id', async () => {
    const findByCategoryKeyset = vi
      .fn()
      .mockResolvedValue([prismaRow(1), prismaRow(2), prismaRow(3)]);
    const service = new DonationService(mockRepo({ findByCategoryKeyset }));

    const out = await service.list({
      category: 'groups',
      q: '',
      limit: 2,
    });

    expect(out.items).toHaveLength(2);
    expect(out.pageInfo.hasMore).toBe(true);
    expect(out.pageInfo.nextCursor).toBe('2');
  });

  it('筆數未超過 limit 時 hasMore 為 false、nextCursor 為 null', async () => {
    const findByCategoryKeyset = vi.fn().mockResolvedValue([prismaRow(10)]);
    const service = new DonationService(mockRepo({ findByCategoryKeyset }));

    const out = await service.list({
      category: 'products',
      q: '',
      limit: 20,
    });

    expect(out.pageInfo.hasMore).toBe(false);
    expect(out.pageInfo.nextCursor).toBeNull();
  });

  it('getCharityProductDetail：無效 id 拋 VALIDATION_ERROR', async () => {
    const findByIdWithListInclude = vi.fn();
    const service = new DonationService(mockRepo({ findByIdWithListInclude }));

    await expect(service.getCharityProductDetail('x')).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === 'VALIDATION_ERROR' && e.statusCode === 400,
    );
    expect(findByIdWithListInclude).not.toHaveBeenCalled();
  });

  it('getCharityProductDetail：查無列為 NOT_FOUND', async () => {
    const findByIdWithListInclude = vi.fn().mockResolvedValue(null);
    const service = new DonationService(mockRepo({ findByIdWithListInclude }));

    await expect(service.getCharityProductDetail('99')).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === 'NOT_FOUND' && e.statusCode === 404,
    );
  });

  it('getCharityProductDetail：非義賣列為 NOT_FOUND', async () => {
    const findByIdWithListInclude = vi.fn().mockResolvedValue(prismaRow(1));
    const service = new DonationService(mockRepo({ findByIdWithListInclude }));

    await expect(service.getCharityProductDetail('1')).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === 'NOT_FOUND',
    );
  });

  it('getDonationProjectDetail：非專案列為 NOT_FOUND', async () => {
    const findByIdForProjectDetail = vi.fn().mockResolvedValue(prismaRow(1));
    const service = new DonationService(mockRepo({ findByIdForProjectDetail }));

    await expect(service.getDonationProjectDetail('1')).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === 'NOT_FOUND',
    );
  });

  it('PrismaClientKnownRequestError 轉為 DATABASE_ERROR', async () => {
    const prismaErr = new Prisma.PrismaClientKnownRequestError('db down', {
      code: 'P1001',
      clientVersion: 'test',
    });
    const findByCategoryKeyset = vi.fn().mockRejectedValue(prismaErr);
    const service = new DonationService(mockRepo({ findByCategoryKeyset }));

    await expect(
      service.list({ category: 'groups', q: '', limit: 20 }),
    ).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === 'DATABASE_ERROR' && e.statusCode === 500,
    );
  });
});
