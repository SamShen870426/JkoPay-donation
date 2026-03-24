import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildDonationItemsListUrl, fetchDonationPage } from './donationClient.js';

describe('buildDonationItemsListUrl', () => {
  it('含 category、limit，僅在有值時帶 q／cursor／theme', () => {
    expect(
      buildDonationItemsListUrl(
        { category: 'groups', q: '', limit: 20 },
        'http://bff.test',
      ),
    ).toBe('http://bff.test/api/v1/donation-items?category=groups&limit=20');

    expect(
      buildDonationItemsListUrl(
        {
          category: 'projects',
          q: 'keyword',
          cursor: '42',
          limit: 10,
          theme: 'animal_protection',
        },
        '',
      ),
    ).toBe(
      '/api/v1/donation-items?category=projects&q=keyword&cursor=42&limit=10&theme=animal_protection',
    );
  });

  it('非法 category 時 parse 丟錯（與 BFF 契約一致）', () => {
    expect(() =>
      // @ts-expect-error 刻意傳入非法 category 驗證 Zod
      buildDonationItemsListUrl({ category: 'oops', q: '' }, ''),
    ).toThrow();
  });
});

describe('fetchDonationPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('200 時 parse 成功回應', async () => {
    const body = {
      items: [
        {
          id: '1',
          category: 'groups',
          title: 'T',
          description: 'D',
          imageUrl: 'https://x',
        },
      ],
      pageInfo: { nextCursor: null, hasMore: false },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(body),
      }),
    );

    const out = await fetchDonationPage({ category: 'groups', q: '' });
    expect(out).toEqual(body);
    expect(fetch).toHaveBeenCalledWith(
      'http://bff.test/api/v1/donation-items?category=groups&limit=20',
      { signal: undefined },
    );
  });

  it('非 JSON body 丟錯', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'not-json',
      }),
    );

    await expect(fetchDonationPage({ category: 'groups', q: '' })).rejects.toThrow(
      'Invalid JSON from donation API',
    );
  });
});
