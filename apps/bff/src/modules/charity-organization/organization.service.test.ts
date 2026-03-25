import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../errors/app-error.js';
import type { OrganizationRepository } from './organization.repository.js';
import { OrganizationService } from './organization.service.js';
import type { DonationItemListRow } from '../donation/donation.transformer.js';

function mockRepo(
  impl: Partial<
    Pick<
      OrganizationRepository,
      | 'findByIdWithThemes'
      | 'findProductDonationRowsByOrganizationId'
      | 'findProjectDonationRowsByOrganizationId'
    >
  > = {},
): OrganizationRepository {
  return {
    findByIdWithThemes: vi.fn(),
    findProductDonationRowsByOrganizationId: vi.fn(),
    findProjectDonationRowsByOrganizationId: vi.fn(),
    ...impl,
  } as unknown as OrganizationRepository;
}

const mockOrg = {
  id: 1,
  nameZh: '測試團體',
  logoKey: '/logo.png',
  profileBannerKey: null,
  phone: '02-1234',
  email: null,
  websiteUrl: null,
  registrationNumberZh: null,
  descriptionZh: '介紹全文',
  createdAt: new Date(),
  themes: [{ organizationId: 1, theme: 'animal_protection' as const, sortOrder: 0 }],
};

const prismaRow = (id: number): DonationItemListRow => ({
  id,
  category: 'projects',
  titleZh: `專案${id}`,
  summaryZh: '摘要',
  logoKey: '/donation-demo-logo.png',
  createdAt: new Date(),
  organizationId: 1,
  organization: mockOrg,
  organizationNameZh: '測試團體',
  heroImageKey: '/hero.png',
  fundraisingLicenseZh: null,
  projectDetailZh: null,
  projectDisclaimerZh: null,
  itemThemes: [{ donationItemId: id, theme: 'animal_protection', sortOrder: 0 }],
  charityProduct: null,
});

describe('OrganizationService.getProfile', () => {
  it('查無團體為 NOT_FOUND', async () => {
    const findByIdWithThemes = vi.fn().mockResolvedValue(null);
    const service = new OrganizationService(
      mockRepo({
        findByIdWithThemes,
        findProductDonationRowsByOrganizationId: vi.fn().mockResolvedValue([]),
        findProjectDonationRowsByOrganizationId: vi.fn().mockResolvedValue([]),
      }),
    );

    await expect(service.getProfile('1')).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === 'NOT_FOUND',
    );
  });

  it('回傳 organization、products、projects 第一頁（多取一筆切 hasMore）', async () => {
    const findByIdWithThemes = vi.fn().mockResolvedValue(mockOrg);
    const findProductDonationRowsByOrganizationId = vi.fn().mockResolvedValue([]);
    const projectRows = Array.from({ length: 11 }, (_, i) => prismaRow(i + 1));
    const findProjectDonationRowsByOrganizationId = vi.fn().mockResolvedValue(projectRows);

    const service = new OrganizationService(
      mockRepo({
        findByIdWithThemes,
        findProductDonationRowsByOrganizationId,
        findProjectDonationRowsByOrganizationId,
      }),
    );

    const out = await service.getProfile('1');

    expect(out.organization.id).toBe('1');
    expect(out.organization.name).toBe('測試團體');
    expect(out.products).toEqual([]);
    expect(out.projects.items).toHaveLength(10);
    expect(out.projects.pageInfo.hasMore).toBe(true);
    expect(out.projects.pageInfo.nextCursor).toBe('10');

    expect(findProductDonationRowsByOrganizationId).toHaveBeenCalledWith({
      organizationId: 1,
      cursorId: null,
      take: 50,
    });
    expect(findProjectDonationRowsByOrganizationId).toHaveBeenCalledWith({
      organizationId: 1,
      cursorId: null,
      take: 11,
    });
  });

  it('PrismaClientKnownRequestError 轉 DATABASE_ERROR', async () => {
    const prismaErr = new Prisma.PrismaClientKnownRequestError('db', {
      code: 'P1001',
      clientVersion: 'test',
    });
    const service = new OrganizationService(
      mockRepo({ findByIdWithThemes: vi.fn().mockRejectedValue(prismaErr) }),
    );

    await expect(service.getProfile('1')).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === 'DATABASE_ERROR',
    );
  });
});

describe('OrganizationService.getProjectsPage', () => {
  it('無效 id 拋 VALIDATION_ERROR', async () => {
    const service = new OrganizationService(mockRepo());

    await expect(service.getProjectsPage('0', { limit: 10 })).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === 'VALIDATION_ERROR',
    );
  });

  it('帶 cursor 向 repository 查專案', async () => {
    const findByIdWithThemes = vi.fn().mockResolvedValue(mockOrg);
    const findProjectDonationRowsByOrganizationId = vi.fn().mockResolvedValue([prismaRow(10)]);

    const service = new OrganizationService(
      mockRepo({ findByIdWithThemes, findProjectDonationRowsByOrganizationId }),
    );

    await service.getProjectsPage('1', { limit: 5, cursor: '9' });

    expect(findProjectDonationRowsByOrganizationId).toHaveBeenCalledWith({
      organizationId: 1,
      cursorId: 9,
      take: 6,
    });
  });
});
