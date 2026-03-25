import {
  charityThemeSchema,
  donationCategorySchema,
  type CharityTheme,
  type DonationCategory,
} from '@jkopay/contracts';
import { DEFAULT_DONATION_CATEGORY } from '../constants/tabs.js';

const STORAGE_KEY = 'charity-donation:list-ui';
/** 舊版僅存 category，讀取時併入新結構 */
const LEGACY_CATEGORY_KEY = 'charity-donation:list-category';

export type DonationListUiState = {
  category: DonationCategory;
  theme: CharityTheme | null;
  searchExpanded: boolean;
  searchInput: string;
};

function baseDefaults(): DonationListUiState {
  return {
    category: DEFAULT_DONATION_CATEGORY,
    theme: null,
    searchExpanded: false,
    searchInput: '',
  };
}

function parseStoredJson(raw: unknown): DonationListUiState | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const cat = donationCategorySchema.safeParse(o.category);
  if (!cat.success) return null;
  let theme: CharityTheme | null = null;
  if (o.theme != null && o.theme !== '') {
    const t = charityThemeSchema.safeParse(o.theme);
    if (t.success) theme = t.data;
  }
  const searchExpanded = typeof o.searchExpanded === 'boolean' ? o.searchExpanded : false;
  const searchInput =
    typeof o.searchInput === 'string' ? o.searchInput.slice(0, 200) : '';
  return {
    category: cat.data,
    theme,
    searchExpanded,
    searchInput,
  };
}

/** 讀取上次列表 UI（分頁、主題篩選、搜尋展開、搜尋字串） */
export function readDonationListUiState(): DonationListUiState {
  if (typeof sessionStorage === 'undefined') return baseDefaults();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw != null) {
      const parsed = parseStoredJson(JSON.parse(raw) as unknown);
      if (parsed != null) return parsed;
    }
  } catch {
    /* ignore */
  }
  try {
    const legacy = sessionStorage.getItem(LEGACY_CATEGORY_KEY);
    if (legacy != null) {
      const c = donationCategorySchema.safeParse(legacy);
      if (c.success) {
        return { ...baseDefaults(), category: c.data };
      }
    }
  } catch {
    /* ignore */
  }
  return baseDefaults();
}

export function writeDonationListUiState(state: DonationListUiState): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        category: state.category,
        theme: state.theme,
        searchExpanded: state.searchExpanded,
        searchInput: state.searchInput,
      }),
    );
    sessionStorage.removeItem(LEGACY_CATEGORY_KEY);
  } catch {
    /* quota / 無痕 */
  }
}

/** 與現有狀態合併後寫回（例如詳情頁只改 category） */
export function patchDonationListUi(partial: Partial<DonationListUiState>): void {
  const cur = readDonationListUiState();
  writeDonationListUiState({ ...cur, ...partial });
}
