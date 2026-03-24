import type { DonationItem as PrismaDonationItem } from '@prisma/client';
import { afterEach, describe, expect, it } from 'vitest';
import { toDonationListItem } from './donation.transformer.js';

const base: PrismaDonationItem = {
  id: 1,
  category: 'groups',
  theme: 'animal_protection',
  titleZh: '標題',
  summaryZh: '摘要文字',
  logoKey: '/static/logo.png',
  createdAt: new Date('2025-01-01'),
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

  it('輸出欄位符合列表 DTO（字串 id、對應 title/description）', () => {
    const dto = toDonationListItem(base);
    expect(dto).toEqual({
      id: '1',
      category: 'groups',
      title: '標題',
      description: '摘要文字',
      imageUrl: '/static/logo.png',
    });
  });
});
