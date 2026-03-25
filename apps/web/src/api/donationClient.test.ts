import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCharityOrganizationProfileUrl,
  buildCharityOrganizationProjectsUrl,
  buildCharityProductDetailUrl,
  buildDonationItemsListUrl,
  buildDonationProjectDetailUrl,
  fetchCharityOrganizationProfile,
  fetchCharityProductDetail,
  fetchDonationPage,
  fetchDonationProjectDetail,
} from './donationClient.js';

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

describe('buildDonationProjectDetailUrl', () => {
  it('合法 id 組出路徑', () => {
    expect(buildDonationProjectDetailUrl('9', 'http://bff.test')).toBe(
      'http://bff.test/api/v1/donation-items/9/project',
    );
  });

  it('非法 id 時 Zod 丟錯', () => {
    expect(() => buildDonationProjectDetailUrl('x', '')).toThrow();
  });
});

describe('buildCharityProductDetailUrl', () => {
  it('合法 id 組出路徑', () => {
    expect(buildCharityProductDetailUrl('42', 'http://bff.test')).toBe(
      'http://bff.test/api/v1/donation-items/42/charity-product',
    );
  });

  it('非法 id 時 Zod 丟錯', () => {
    expect(() => buildCharityProductDetailUrl('abc', '')).toThrow();
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

describe('buildCharityOrganizationProfileUrl', () => {
  it('合法 id 組出路徑', () => {
    expect(buildCharityOrganizationProfileUrl('7', 'http://bff.test')).toBe(
      'http://bff.test/api/v1/charity-organizations/7',
    );
  });

  it('非法 id 時 Zod 丟錯', () => {
    expect(() => buildCharityOrganizationProfileUrl('x', '')).toThrow();
  });
});

describe('buildCharityOrganizationProjectsUrl', () => {
  it('帶 cursor、limit', () => {
    expect(
      buildCharityOrganizationProjectsUrl('3', { cursor: '9', limit: 5 }, 'http://bff.test'),
    ).toBe('http://bff.test/api/v1/charity-organizations/3/projects?cursor=9&limit=5');
  });
});

describe('fetchCharityOrganizationProfile', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('200 時 parse 成功', async () => {
    const body = {
      organization: {
        id: '1',
        name: '團體',
        logoUrl: 'https://x/l.png',
        bannerUrl: 'https://x/b.png',
        phone: null,
        email: null,
        websiteUrl: null,
        registrationNumber: null,
        description: '介紹',
        themes: ['animal_protection'],
      },
      products: [],
      projects: { items: [], pageInfo: { nextCursor: null, hasMore: false } },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(body),
      }),
    );

    const out = await fetchCharityOrganizationProfile({ organizationId: '1' });
    expect(out).toEqual(body);
    expect(fetch).toHaveBeenCalledWith('http://bff.test/api/v1/charity-organizations/1', {
      signal: undefined,
    });
  });
});

describe('fetchDonationProjectDetail', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('200 時 parse 成功', async () => {
    const body = {
      donationItemId: '3',
      title: 'T',
      subtitle: 'S',
      fundraisingLicense: '114',
      heroImageUrls: ['https://x/h.png'],
      primaryHeroImageIndex: 0,
      organizationId: '1',
      organizationName: 'O',
      organizationLogoUrl: 'https://x/l.png',
      themes: ['animal_protection'],
      projectDetail: '內文',
      disclaimer: '聲明',
      checkout: {
        paymentKinds: ['recurring_monthly', 'one_time'],
        billingDays: [6, 16, 26],
        amountPresets: [{ amount: 100, currency: 'TWD' }],
        allowCustomAmount: true,
      },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(body),
      }),
    );

    const out = await fetchDonationProjectDetail({ id: '3' });
    expect(out).toEqual(body);
    expect(fetch).toHaveBeenCalledWith('http://bff.test/api/v1/donation-items/3/project', {
      signal: undefined,
    });
  });
});

describe('fetchCharityProductDetail', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('200 時 parse 成功', async () => {
    const detail = {
      donationItemId: '1',
      title: 'T',
      subtitle: 'S',
      organizationName: 'O',
      organizationId: '1',
      organizationLogoUrl: 'https://x/l.png',
      currency: 'TWD',
      priceMin: 100,
      priceMax: 100,
      shippingFeeAmount: 0,
      imageUrls: ['https://x/a.png'],
      primaryImageIndex: 0,
      themes: ['animal_protection'],
      description: 'D',
      options: [
        { id: '1', label: 'L', unitPrice: 100, stockQuantity: 1, sortOrder: 0 },
      ],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(detail),
      }),
    );

    const out = await fetchCharityProductDetail({ id: '1' });
    expect(out).toEqual(detail);
    expect(fetch).toHaveBeenCalledWith(
      'http://bff.test/api/v1/donation-items/1/charity-product',
      { signal: undefined },
    );
  });
});
