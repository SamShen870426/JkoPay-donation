import type { NavigateFunction } from 'react-router-dom';
import type { CharityTheme, DonationCategory } from '@jkopay/contracts';
import { patchDonationListUi } from './donation-list-ui-storage.js';

/**
 * 回到首頁列表並套用分類 Tab + 主題篩選（與篩選 sheet「全部」chip 同一套狀態）。
 */
export function navigateToDonationListWithThemeFilter(
  navigate: NavigateFunction,
  category: DonationCategory,
  theme: CharityTheme,
): void {
  patchDonationListUi({
    category,
    theme,
    searchExpanded: false,
    searchInput: '',
  });
  navigate('/');
}
