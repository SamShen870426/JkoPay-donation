import type { DonationCategory } from '@jkopay/contracts';

export type DonationTab = {
  category: DonationCategory;
  label: string;
};

/** Figma：公益團體 | 捐款專案 | 義賣商品 — 對應 BFF category */
export const DONATION_TABS: readonly DonationTab[] = [
  { category: 'groups', label: '公益團體' },
  { category: 'projects', label: '捐款專案' },
  { category: 'products', label: '義賣商品' },
] as const;

/** 進入頁面預設 Tab */
export const DEFAULT_DONATION_CATEGORY: DonationCategory = 'groups';
