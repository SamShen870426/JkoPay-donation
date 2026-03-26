import {
  charityOrganizationIdParamSchema,
  charityOrganizationProfileResponseSchema,
  charityOrganizationProjectsQuerySchema,
  charityProductDetailSchema,
  donationItemIdParamSchema,
  donationListQuerySchema,
  donationListResponseSchema,
  donationProjectDetailSchema,
  internalDataToolsRequestSchema,
  internalDataToolsResponseSchema,
  type CharityOrganizationProfileResponse,
  type CharityProductDetail,
  type CharityTheme,
  type DonationCategory,
  type DonationListItem,
  type DonationListResponse,
  type DonationProjectDetail,
  type InternalDataToolsResponse,
} from '@jkopay/contracts';
import { throwDonationErrorFromBody } from './donation-api-error.js';

export type DonationItemsListUrlParams = {
  category: DonationCategory;
  q: string;
  cursor?: string;
  limit?: number;
  theme?: CharityTheme;
};

/**
 * 組列表 API URL（單元測試可傳入 `apiBase` 隔離 `import.meta.env`）。
 */
export function buildDonationItemsListUrl(
  params: DonationItemsListUrlParams,
  apiBase: string = import.meta.env.VITE_API_BASE ?? '',
): string {
  const q = donationListQuerySchema.parse({
    category: params.category,
    q: params.q,
    cursor: params.cursor,
    limit: params.limit ?? 20,
    ...(params.theme != null ? { theme: params.theme } : {}),
  });
  const sp = new URLSearchParams();
  sp.set('category', q.category);
  if (q.q) sp.set('q', q.q);
  if (q.cursor) sp.set('cursor', q.cursor);
  sp.set('limit', String(q.limit));
  if (q.theme) sp.set('theme', q.theme);
  return `${apiBase}/api/v1/donation-items?${sp.toString()}`;
}

export function buildCharityProductDetailUrl(
  donationItemId: string,
  apiBase: string = import.meta.env.VITE_API_BASE ?? '',
): string {
  const id = donationItemIdParamSchema.parse(donationItemId);
  return `${apiBase}/api/v1/donation-items/${encodeURIComponent(id)}/charity-product`;
}

export function buildDonationProjectDetailUrl(
  donationItemId: string,
  apiBase: string = import.meta.env.VITE_API_BASE ?? '',
): string {
  const id = donationItemIdParamSchema.parse(donationItemId);
  return `${apiBase}/api/v1/donation-items/${encodeURIComponent(id)}/project`;
}

export async function fetchCharityProductDetail(input: {
  id: string;
  signal?: AbortSignal;
}): Promise<CharityProductDetail> {
  const url = buildCharityProductDetailUrl(input.id);
  const res = await fetch(url, { signal: input.signal });
  const text = await res.text();
  if (!res.ok) {
    throwDonationErrorFromBody(res, text);
  }
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON from donation API');
  }
  return charityProductDetailSchema.parse(json);
}

export async function fetchDonationProjectDetail(input: {
  id: string;
  signal?: AbortSignal;
}): Promise<DonationProjectDetail> {
  const url = buildDonationProjectDetailUrl(input.id);
  const res = await fetch(url, { signal: input.signal });
  const text = await res.text();
  if (!res.ok) {
    throwDonationErrorFromBody(res, text);
  }
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON from donation API');
  }
  return donationProjectDetailSchema.parse(json);
}

export async function fetchDonationPage(input: {
  category: DonationCategory;
  q: string;
  cursor?: string;
  theme?: CharityTheme;
  signal?: AbortSignal;
}): Promise<DonationListResponse> {
  const url = buildDonationItemsListUrl(input);
  const res = await fetch(url, { signal: input.signal });
  const text = await res.text();
  if (!res.ok) {
    throwDonationErrorFromBody(res, text);
  }
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON from donation API');
  }
  return donationListResponseSchema.parse(json);
}

export function buildCharityOrganizationProfileUrl(
  organizationId: string,
  apiBase: string = import.meta.env.VITE_API_BASE ?? '',
): string {
  const id = charityOrganizationIdParamSchema.parse(organizationId);
  return `${apiBase}/api/v1/charity-organizations/${encodeURIComponent(id)}`;
}

export function buildCharityOrganizationProjectsUrl(
  organizationId: string,
  params: { cursor?: string; limit?: number },
  apiBase: string = import.meta.env.VITE_API_BASE ?? '',
): string {
  const id = charityOrganizationIdParamSchema.parse(organizationId);
  const q = charityOrganizationProjectsQuerySchema.parse({
    cursor: params.cursor,
    limit: params.limit ?? 10,
  });
  const sp = new URLSearchParams();
  if (q.cursor) sp.set('cursor', q.cursor);
  sp.set('limit', String(q.limit));
  return `${apiBase}/api/v1/charity-organizations/${encodeURIComponent(id)}/projects?${sp.toString()}`;
}

export async function fetchCharityOrganizationProfile(input: {
  organizationId: string;
  signal?: AbortSignal;
}): Promise<CharityOrganizationProfileResponse> {
  const url = buildCharityOrganizationProfileUrl(input.organizationId);
  const res = await fetch(url, { signal: input.signal });
  const text = await res.text();
  if (!res.ok) {
    throwDonationErrorFromBody(res, text);
  }
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON from donation API');
  }
  return charityOrganizationProfileResponseSchema.parse(json);
}

export async function fetchCharityOrganizationProjectsPage(input: {
  organizationId: string;
  cursor?: string;
  limit?: number;
  signal?: AbortSignal;
}): Promise<DonationListResponse> {
  const url = buildCharityOrganizationProjectsUrl(input.organizationId, {
    cursor: input.cursor,
    limit: input.limit,
  });
  const res = await fetch(url, { signal: input.signal });
  const text = await res.text();
  if (!res.ok) {
    throwDonationErrorFromBody(res, text);
  }
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON from donation API');
  }
  return donationListResponseSchema.parse(json);
}

export function buildInternalDataToolsUrl(apiBase: string = import.meta.env.VITE_API_BASE ?? ''): string {
  return `${apiBase}/api/v1/internal/data-tools`;
}

export async function postInternalDataTools(input: {
  secret: string;
  mode: 'wipe' | 'wipe_and_bulk_seed';
  organizationCount?: number;
  signal?: AbortSignal;
}): Promise<InternalDataToolsResponse> {
  const body = internalDataToolsRequestSchema.parse({
    secret: input.secret,
    mode: input.mode,
    ...(input.organizationCount != null ? { organizationCount: input.organizationCount } : {}),
  });
  const res = await fetch(buildInternalDataToolsUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: input.signal,
  });
  const text = await res.text();
  if (res.status === 404) {
    throw new Error('此環境未啟用資料工具（BFF 未設定 DEV_DATA_TOOLS_SECRET）');
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      if (typeof j.message === 'string' && j.message.length > 0) msg = j.message;
      else if (typeof j.error === 'string' && j.error.length > 0) msg = j.error;
      else msg = `${msg}: ${text.slice(0, 200)}`;
    } catch {
      msg = `${msg}: ${text.slice(0, 200)}`;
    }
    throw new Error(msg);
  }
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON from internal data-tools API');
  }
  return internalDataToolsResponseSchema.parse(json);
}

export type {
  CharityOrganizationProfileResponse,
  CharityProductDetail,
  DonationListItem,
  DonationProjectDetail,
};
