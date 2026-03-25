import { afterEach, describe, expect, it } from 'vitest';
import type { DonationItemListRow } from './donation.transformer.js';
import { toCharityProductDetail, toDonationListItem } from './donation.transformer.js';

function mockOrg(partial: { id?: number; nameZh?: string; logoKey?: string } = {}) {
  return {
    id: partial.id ?? 1,
    nameZh: partial.nameZh ?? '協會',
    logoKey: partial.logoKey ?? '/static/logo.png',
    profileBannerKey: null,
    phone: null,
    email: null,
    websiteUrl: null,
    registrationNumberZh: null,
    descriptionZh: '',
    createdAt: new Date('2025-01-01'),
  };
}

const base: DonationItemListRow = {
  id: 1,
  category: 'groups',
  titleZh: '標題',
  summaryZh: '摘要文字',
  logoKey: '/static/logo.png',
  createdAt: new Date('2025-01-01'),
  organizationId: null,
  organization: null,
  organizationNameZh: null,
  heroImageKey: null,
  fundraisingLicenseZh: null,
  projectDetailZh: null,
  projectDisclaimerZh: null,
  itemThemes: [{ donationItemId: 1, theme: 'animal_protection', sortOrder: 0 }],
  charityProduct: null,
};

describe('toDonationListItem', () => {
  const prevCdn = process.env.ASSET_CDN_BASE;

  afterEach(() => {
    if (prevCdn === undefined) delete process.env.ASSET_CDN_BASE;
    else process.env.ASSET_CDN_BASE = prevCdn;
  });

  it('http(s) logoKey 直接作為 imageUrl', () => {
    const row = { ...base, logoKey: 'https://cdn.example.com/a.png' };
    expect(toDonationListItem(row).imageUrl).toBe('https://cdn.example.com/a.png');
  });

  it('以 / 開頭的 logoKey 視為同源路徑', () => {
    expect(toDonationListItem(base).imageUrl).toBe('/static/logo.png');
  });

  it('相對 logoKey 預設接 picsum seed path', () => {
    delete process.env.ASSET_CDN_BASE;
    const row = { ...base, logoKey: 'my-logo-key' };
    expect(toDonationListItem(row).imageUrl).toBe(
      'https://picsum.photos/seed/my-logo-key/112/112',
    );
  });

  it('ASSET_CDN_BASE 覆寫相對路徑前綴並去除尾端斜線', () => {
    process.env.ASSET_CDN_BASE = 'https://assets.example.com/';
    const row = { ...base, logoKey: 'key/with/slash' };
    expect(toDonationListItem(row).imageUrl).toBe(
      'https://assets.example.com/key%2Fwith%2Fslash/112/112',
    );
  });

  it('團體列不輸出 themes（即使 DB 有關聯，供篩選用）', () => {
    const dto = toDonationListItem(base);
    expect(dto).toEqual({
      id: '1',
      category: 'groups',
      title: '標題',
      description: '摘要文字',
      imageUrl: '/static/logo.png',
    });
    expect(dto.themes).toBeUndefined();
  });

  it('團體列有 organizationId 時輸出供個人頁連結', () => {
    const dto = toDonationListItem({
      ...base,
      organizationId: 42,
      organization: mockOrg({ id: 42, nameZh: '綁定團體' }),
    });
    expect(dto.organizationId).toBe('42');
  });

  it('專案列輸出 themes（slug 與篩選類別一致）', () => {
    const row: DonationItemListRow = {
      ...base,
      category: 'projects',
      organizationNameZh: '某某基金會',
      heroImageKey: 'hero-key',
      itemThemes: [
        { donationItemId: 1, theme: 'public_issues', sortOrder: 0 },
        { donationItemId: 1, theme: 'community_development', sortOrder: 1 },
      ],
    };
    delete process.env.ASSET_CDN_BASE;
    const dto = toDonationListItem(row);
    expect(dto.organizationName).toBe('某某基金會');
    expect(dto.heroImageUrl).toBe('https://picsum.photos/seed/hero-key/800/480');
    expect(dto.themes).toEqual(['public_issues', 'community_development']);
  });

  it('義賣商品列輸出 product* 欄位（首圖、團體、價格區間）', () => {
    delete process.env.ASSET_CDN_BASE;
    const row: DonationItemListRow = {
      ...base,
      category: 'products',
      titleZh: '貓貓萬用卡',
      itemThemes: [{ donationItemId: 1, theme: 'animal_protection', sortOrder: 0 }],
      charityProduct: {
        id: 1,
        donationItemId: 1,
        organizationId: 1,
        organization: mockOrg({ nameZh: '社團法人貓咪也瘋狂公益協會' }),
        descriptionZh: '說明',
        currency: 'TWD',
        shippingFeeAmount: 100,
        images: [
          { id: 1, productId: 1, imageKey: 'p-cover', sortOrder: 0, isPrimary: true },
          { id: 2, productId: 1, imageKey: 'p2', sortOrder: 1, isPrimary: false },
        ],
        options: [
          { id: 1, productId: 1, labelZh: '1張', unitPriceAmount: 250, stockQuantity: 50, sortOrder: 0 },
          { id: 2, productId: 1, labelZh: '2張', unitPriceAmount: 450, stockQuantity: 30, sortOrder: 1 },
        ],
      },
    };
    const dto = toDonationListItem(row);
    expect(dto.productOrganizationName).toBe('社團法人貓咪也瘋狂公益協會');
    expect(dto.productCoverImageUrl).toBe('https://picsum.photos/seed/p-cover/400/400');
    expect(dto.productPriceMin).toBe(250);
    expect(dto.productPriceMax).toBe(450);
    expect(dto.productCurrency).toBe('TWD');
  });

  it('義賣商品無選項時不輸出 product*（維持一般列表欄位）', () => {
    const row: DonationItemListRow = {
      ...base,
      category: 'products',
      itemThemes: [],
      charityProduct: {
        id: 1,
        donationItemId: 1,
        organizationId: 1,
        organization: mockOrg({ nameZh: '某團體' }),
        descriptionZh: '說明',
        currency: 'TWD',
        shippingFeeAmount: 0,
        images: [{ id: 1, productId: 1, imageKey: 'x', sortOrder: 0, isPrimary: true }],
        options: [],
      },
    };
    const dto = toDonationListItem(row);
    expect(dto.productCoverImageUrl).toBeUndefined();
    expect(dto.productPriceMin).toBeUndefined();
  });

  it('toCharityProductDetail 輸出詳情 DTO', () => {
    delete process.env.ASSET_CDN_BASE;
    const row: DonationItemListRow = {
      ...base,
      category: 'products',
      titleZh: '主標',
      summaryZh: '副標',
      itemThemes: [{ donationItemId: 1, theme: 'animal_protection', sortOrder: 0 }],
      charityProduct: {
        id: 9,
        donationItemId: 1,
        organizationId: 1,
        organization: mockOrg({ nameZh: '某某協會', logoKey: '/org-logo.png' }),
        descriptionZh: '說明\n-------\n內文',
        currency: 'TWD',
        shippingFeeAmount: 100,
        images: [
          { id: 1, productId: 9, imageKey: 'b', sortOrder: 1, isPrimary: true },
          { id: 2, productId: 9, imageKey: 'a', sortOrder: 0, isPrimary: false },
        ],
        options: [
          { id: 10, productId: 9, labelZh: 'B款', unitPriceAmount: 300, stockQuantity: 2, sortOrder: 1 },
          { id: 11, productId: 9, labelZh: 'A款', unitPriceAmount: 100, stockQuantity: 5, sortOrder: 0 },
        ],
      },
    };
    const d = toCharityProductDetail(row);
    expect(d).not.toBeNull();
    expect(d!.donationItemId).toBe('1');
    expect(d!.subtitle).toBe('副標');
    expect(d!.imageUrls).toHaveLength(2);
    expect(d!.imageUrls[0]).toContain('a');
    expect(d!.imageUrls[1]).toContain('b');
    expect(d!.primaryImageIndex).toBe(1);
    expect(d!.priceMin).toBe(100);
    expect(d!.priceMax).toBe(300);
    expect(d!.options.map((o) => o.label)).toEqual(['A款', 'B款']);
    expect(d!.options[0]!.id).toBe('11');
    expect(d!.themes).toEqual(['animal_protection']);
    expect(d!.shippingFeeAmount).toBe(100);
    expect(d!.organizationLogoUrl).toBe('/org-logo.png');
    expect(d!.organizationId).toBe('1');
  });
});
