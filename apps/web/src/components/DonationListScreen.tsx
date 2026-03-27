import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CharityTheme, DonationCategory } from '@jkopay/contracts';
import {
  readDonationListUiState,
  writeDonationListUiState,
} from '../lib/donation-list-ui-storage.js';
import {
  CARD_LIST_MARGIN_X_PX,
  LAYOUT_LIST_INNER_PADDING_TOP_PX,
  SEARCH_EXPANDED_PANEL_MARGIN_BOTTOM_PX,
  SEARCH_EXPANDED_PANEL_PADDING_TOP_PX,
  SEARCH_EXPANDED_PANEL_PADDING_X_PX,
  SEARCH_EXPANDED_PANEL_STACK_GAP_PX,
  THEME_PAGE_BG,
  THEME_PRIMARY,
} from '../constants/theme.js';
import { tryNavigateBack } from '../lib/navigate-back-if-possible.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useDonationList } from '../hooks/useDonationList.js';
import { Button } from '../ui/button.js';
import { DonationCard } from './DonationCard.js';
import { DonationEmptyState } from './DonationEmptyState.js';
import { DonationListFooterCap } from './DonationListFooterCap.js';
import { CHARITY_THEME_LABELS } from '../constants/charity-themes.js';
import { CharityThemeFilterSheet } from './CharityThemeFilterSheet.js';
import { DonationListInitialLoading } from './DonationListInitialLoading.js';
import {
  DonationLoadMoreSkeleton,
  DonationProductLoadMoreSkeleton,
} from './DonationListSkeleton.js';
import { MobileStatusBar } from './MobileStatusBar.js';
import { SearchBar } from './SearchBar.js';
import { TabBar } from './TabBar.js';

const SEARCH_DEBOUNCE_MS = 350;

export function DonationListScreen() {
  const navigate = useNavigate();
  const initialUi = readDonationListUiState();
  const [category, setCategory] = useState<DonationCategory>(initialUi.category);
  const [searchInput, setSearchInput] = useState(initialUi.searchInput);
  const [searchExpanded, setSearchExpanded] = useState(initialUi.searchExpanded);
  const [charityThemeFilter, setCharityThemeFilter] = useState<CharityTheme | null>(
    initialUi.theme,
  );
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const debouncedQ = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const {
    items,
    isLoading,
    isFetchingNextPage,
    error,
    errorCode,
    hasMore,
    isAwaitingDebouncedSearch,
    loadMore,
  } = useDonationList(category, debouncedQ, {
    rawSearchQuery: searchInput,
    ...(charityThemeFilter != null ? { theme: charityThemeFilter } : {}),
  });

  const filterChipLabel =
    charityThemeFilter != null ? CHARITY_THEME_LABELS[charityThemeFilter] : '全部';

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    writeDonationListUiState({
      category,
      theme: charityThemeFilter,
      searchExpanded,
      searchInput,
    });
  }, [category, charityThemeFilter, searchExpanded, searchInput]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void loadMore();
        }
      },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  /** debounce 尚未套用，或首屏／換條件重查且列表已清空 — 一律置中 spinner，不暫留舊列表 */
  const showCenteredListLoading =
    isAwaitingDebouncedSearch || (isLoading && items.length === 0);
  const hasActiveSearch = debouncedQ.trim().length > 0;
  const showEmptySearch =
    !isLoading &&
    !error &&
    items.length === 0 &&
    hasActiveSearch &&
    !isAwaitingDebouncedSearch;
  const showEmptyBrowse =
    !isLoading &&
    !error &&
    items.length === 0 &&
    !hasActiveSearch &&
    !isAwaitingDebouncedSearch;

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ backgroundColor: THEME_PAGE_BG }}
    >
      <header
        className="shrink-0 text-white"
        style={{ backgroundColor: THEME_PRIMARY, paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <MobileStatusBar />
        <div className="relative flex h-[44px] w-full shrink-0 items-center justify-center px-2">
          <Button
            variant="icon-ghost"
            size="iconLg"
            className="absolute left-2"
            aria-label="返回上一頁"
            type="button"
            onClick={() => tryNavigateBack(navigate)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 6 9 12l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <h1 className="text-[17px] font-semibold tracking-wide">所有捐款項目</h1>
        </div>
      </header>

      {searchExpanded ? (
        <div
          className="search-panel-reveal shrink-0 bg-white"
          style={{ marginBottom: SEARCH_EXPANDED_PANEL_MARGIN_BOTTOM_PX }}
        >
          <div
            className="flex flex-col"
            style={{ gap: SEARCH_EXPANDED_PANEL_STACK_GAP_PX }}
          >
            <div
              style={{
                paddingTop: SEARCH_EXPANDED_PANEL_PADDING_TOP_PX,
                paddingLeft: SEARCH_EXPANDED_PANEL_PADDING_X_PX,
                paddingRight: SEARCH_EXPANDED_PANEL_PADDING_X_PX,
              }}
            >
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="搜尋公益團體、專案、商品"
                expanded
                onExpandedChange={setSearchExpanded}
                filterChipLabel={filterChipLabel}
                onFilterClick={() => setThemeSheetOpen(true)}
              />
            </div>
            <TabBar active={category} onChange={setCategory} />
          </div>
        </div>
      ) : (
        <>
          <TabBar active={category} onChange={setCategory} />
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="搜尋公益團體、專案、商品"
            expanded={false}
            onExpandedChange={setSearchExpanded}
            filterChipLabel={filterChipLabel}
            onFilterClick={() => setThemeSheetOpen(true)}
          />
        </>
      )}

      <main className="relative min-h-0 flex-1 overflow-y-auto bg-[#F4F4F6]">
        {error ? (
          <div
            className="py-10 text-center text-sm text-red-600"
            style={{ paddingLeft: CARD_LIST_MARGIN_X_PX, paddingRight: CARD_LIST_MARGIN_X_PX }}
          >
            <p>{error}</p>
            {errorCode ? (
              <p className="mt-1 text-xs text-neutral-500">代碼：{errorCode}</p>
            ) : null}
          </div>
        ) : null}

        {showCenteredListLoading ? <DonationListInitialLoading /> : null}

        {showEmptySearch ? (
          <div
            style={{ paddingLeft: CARD_LIST_MARGIN_X_PX, paddingRight: CARD_LIST_MARGIN_X_PX }}
          >
            <DonationEmptyState variant="search" />
          </div>
        ) : null}

        {showEmptyBrowse ? (
          <div
            style={{ paddingLeft: CARD_LIST_MARGIN_X_PX, paddingRight: CARD_LIST_MARGIN_X_PX }}
          >
            <DonationEmptyState variant="browse" />
          </div>
        ) : null}

        {!error && !showCenteredListLoading && items.length > 0 ? (
          <>
            <div
              className={category === 'products' ? 'grid grid-cols-2 gap-2 pb-8' : 'flex flex-col gap-3 pb-8'}
              style={{
                paddingLeft: CARD_LIST_MARGIN_X_PX,
                paddingRight: CARD_LIST_MARGIN_X_PX,
                ...(LAYOUT_LIST_INNER_PADDING_TOP_PX > 0
                  ? { paddingTop: LAYOUT_LIST_INNER_PADDING_TOP_PX }
                  : {}),
              }}
            >
              {items.map((item) => (
                <DonationCard key={item.id} item={item} />
              ))}
              {hasMore && isFetchingNextPage ? (
                category === 'products' ? (
                  <>
                    <DonationProductLoadMoreSkeleton />
                    <DonationProductLoadMoreSkeleton />
                  </>
                ) : (
                  <DonationLoadMoreSkeleton />
                )
              ) : null}
              {!hasMore && !isFetchingNextPage ? (
                <div className={category === 'products' ? 'col-span-2' : undefined}>
                  <DonationListFooterCap />
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
      </main>

      <CharityThemeFilterSheet
        open={themeSheetOpen}
        onClose={() => setThemeSheetOpen(false)}
        selected={charityThemeFilter}
        onSelect={(t) => setCharityThemeFilter(t)}
      />
    </div>
  );
}
