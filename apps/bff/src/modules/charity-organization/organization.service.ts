import { Prisma } from '@prisma/client';
import type {
  CharityOrganizationProfileResponse,
  CharityOrganizationProjectsQuery,
  DonationListResponse,
} from '@jkopay/contracts';
import { AppError } from '../../errors/app-error.js';
import { nextCursorFromPage, trimExtraForCursor } from '../../lib/pagination.js';
import { toDonationListItem } from '../donation/donation.transformer.js';
import type { OrganizationRepository } from './organization.repository.js';
import { toCharityOrganizationProfile } from './organization.transformer.js';

const PROFILE_PRODUCTS_MAX = 50;
const PROFILE_PROJECTS_LIMIT = 10;

function parseCursorId(raw: string | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

function parseOrgId(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    throw new AppError('VALIDATION_ERROR', 'Invalid organization id', 400);
  }
  return n;
}

export class OrganizationService {
  constructor(private readonly repo: OrganizationRepository) {}

  async getProfile(rawOrgId: string): Promise<CharityOrganizationProfileResponse> {
    const orgId = parseOrgId(rawOrgId);

    let org;
    let productRows;
    let projectRows;
    try {
      org = await this.repo.findByIdWithThemes(orgId);
      productRows = await this.repo.findProductDonationRowsByOrganizationId({
        organizationId: orgId,
        cursorId: null,
        take: PROFILE_PRODUCTS_MAX,
      });
      projectRows = await this.repo.findProjectDonationRowsByOrganizationId({
        organizationId: orgId,
        cursorId: null,
        take: PROFILE_PROJECTS_LIMIT + 1,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('DATABASE_ERROR', 'Database request failed', 500);
      }
      throw e;
    }

    if (org == null) {
      throw new AppError('NOT_FOUND', 'Charity organization not found', 404);
    }

    const { page: projectPage, hasMore: projectsHasMore } = trimExtraForCursor(
      projectRows,
      PROFILE_PROJECTS_LIMIT,
    );
    const projects: DonationListResponse = {
      items: projectPage.map(toDonationListItem),
      pageInfo: {
        nextCursor: projectsHasMore ? nextCursorFromPage(projectPage) : null,
        hasMore: projectsHasMore,
      },
    };

    return {
      organization: toCharityOrganizationProfile(org),
      products: productRows.map(toDonationListItem),
      projects,
    };
  }

  async getProjectsPage(
    rawOrgId: string,
    query: CharityOrganizationProjectsQuery,
  ): Promise<DonationListResponse> {
    const orgId = parseOrgId(rawOrgId);
    const limit = query.limit;
    const cursorId = parseCursorId(query.cursor);

    let org;
    let rows;
    try {
      org = await this.repo.findByIdWithThemes(orgId);
      rows = await this.repo.findProjectDonationRowsByOrganizationId({
        organizationId: orgId,
        cursorId,
        take: limit + 1,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('DATABASE_ERROR', 'Database request failed', 500);
      }
      throw e;
    }

    if (org == null) {
      throw new AppError('NOT_FOUND', 'Charity organization not found', 404);
    }

    const { page, hasMore } = trimExtraForCursor(rows, limit);
    return {
      items: page.map(toDonationListItem),
      pageInfo: {
        nextCursor: hasMore ? nextCursorFromPage(page) : null,
        hasMore,
      },
    };
  }
}
