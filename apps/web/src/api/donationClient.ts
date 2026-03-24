import {
  donationListQuerySchema,
  donationListResponseSchema,
  type CharityTheme,
  type DonationCategory,
  type DonationListItem,
  type DonationListResponse,
} from '@jkopay/contracts';
import { throwDonationErrorFromBody } from './donation-api-error.js';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function buildUrl(params: {
  category: DonationCategory;
  q: string;
  cursor?: string;
  limit?: number;
  theme?: CharityTheme;
}): string {
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
  return `${API_BASE}/api/v1/donation-items?${sp.toString()}`;
}

export async function fetchDonationPage(input: {
  category: DonationCategory;
  q: string;
  cursor?: string;
  theme?: CharityTheme;
  signal?: AbortSignal;
}): Promise<DonationListResponse> {
  const url = buildUrl(input);
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

export type { DonationListItem };
