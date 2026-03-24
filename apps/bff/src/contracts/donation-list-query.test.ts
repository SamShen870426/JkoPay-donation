import { donationListQuerySchema } from '@jkopay/contracts';
import { describe, expect, it } from 'vitest';

/**
 * 契約測試放在 BFF workspace，與執行時依賴的 `@jkopay/contracts` 建置結果一致。
 */
describe('donationListQuerySchema', () => {
  it('必填 category，其餘有預設或可選', () => {
    const out = donationListQuerySchema.parse({ category: 'groups' });
    expect(out).toEqual({
      category: 'groups',
      q: '',
      limit: 20,
    });
  });

  it('字串 limit 會 coerce 為數字並套用上下界', () => {
    expect(donationListQuerySchema.parse({ category: 'groups', limit: '5' }).limit).toBe(5);
    expect(() =>
      donationListQuerySchema.parse({ category: 'groups', limit: '0' }),
    ).toThrow();
    expect(() =>
      donationListQuerySchema.parse({ category: 'groups', limit: '99' }),
    ).toThrow();
  });

  it('非法 theme 拒絕', () => {
    expect(() =>
      donationListQuerySchema.parse({ category: 'groups', theme: 'not_a_theme' }),
    ).toThrow();
  });

  it('合法 theme 保留', () => {
    const out = donationListQuerySchema.parse({
      category: 'products',
      theme: 'international_relief',
    });
    expect(out.theme).toBe('international_relief');
  });
});
