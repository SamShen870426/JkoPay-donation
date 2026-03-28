import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { CharityTheme, DonationCategory, DonationListItem } from '@jkopay/contracts';
import { DonationApiError } from '../api/donation-api-error.js';
import { fetchDonationPage } from '../api/donationClient.js';

export type UseDonationListOptions = {
  /** 未 debounce 的輸入，用於顯示「搜尋處理中」等 UX */
  rawSearchQuery?: string;
  /** 公益主題篩選；省略表示「全部」 */
  theme?: CharityTheme;
};

type Status = {
  items: DonationListItem[];
  /** 第一頁（含換 Tab／debounced 搜尋重查）載入中 */
  isLoading: boolean;
  /** 無限滾動載入下一頁（對應常見命名 isFetchingNextPage） */
  isFetchingNextPage: boolean;
  /** 與 isFetchingNextPage 相同，保留向後相容 */
  loadingMore: boolean;
  error: string | null;
  errorCode: string | null;
  hasMore: boolean;
  /** 使用者已輸入關鍵字但 debounce 尚未套用 */
  isAwaitingDebouncedSearch: boolean;
};

/**
 * 無限滾動 + 分類／關鍵字重置：category 或 debouncedQ 變更時重拉第一頁。
 */
export function useDonationList(
  category: DonationCategory,
  debouncedQ: string,
  options: UseDonationListOptions = {},
): Status & { loadMore: () => Promise<void> } {
  const raw = options.rawSearchQuery ?? debouncedQ;
  const theme = options.theme;
  const isAwaitingDebouncedSearch =
    raw.trim() !== debouncedQ.trim() && raw.trim().length > 0;

  const [items, setItems] = useState<DonationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const requestEpoch = useRef(0);
  const listIdentityEpoch = useRef(0);

  const setErr = (e: unknown) => {
    if (e instanceof DonationApiError) {
      setErrorCode(e.errorCode);
      setError(e.message);
      return;
    }
    setErrorCode(null);
    setError(e instanceof Error ? e.message : '載入失敗');
  };

  /**
   * 用 useLayoutEffect：在瀏覽器繪製前就先清空列表並設 loading，
   * 避免 debouncedQ／分類變更後仍閃一幀舊資料（useEffect 會晚於 paint）。
   */
  useLayoutEffect(() => {
    listIdentityEpoch.current += 1;
    const epoch = ++requestEpoch.current;
    const ac = new AbortController();
    setIsLoading(true);
    setIsFetchingNextPage(false);
    setError(null);
    setErrorCode(null);
    setItems([]);
    cursorRef.current = null;
    setHasMore(true);

    fetchDonationPage({
      category,
      q: debouncedQ,
      signal: ac.signal,
      ...(theme != null ? { theme } : {}),
    })
      .then((res) => {
        if (epoch !== requestEpoch.current) return;
        setItems(res.items);
        cursorRef.current = res.pageInfo.nextCursor;
        setHasMore(res.pageInfo.hasMore);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (epoch !== requestEpoch.current) return;
        setErr(e);
      })
      .finally(() => {
        if (epoch !== requestEpoch.current) return;
        setIsLoading(false);
      });

    return () => ac.abort();
  }, [category, debouncedQ, theme]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isFetchingNextPage) return;
    const cursor = cursorRef.current;
    if (cursor == null) return;

    const identity = listIdentityEpoch.current;
    setIsFetchingNextPage(true);
    setError(null);
    setErrorCode(null);
    try {
      const res = await fetchDonationPage({
        category,
        q: debouncedQ,
        cursor,
        ...(theme != null ? { theme } : {}),
      });
      if (identity !== listIdentityEpoch.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        const merged = [...prev];
        for (const it of res.items) {
          if (!seen.has(it.id)) {
            seen.add(it.id);
            merged.push(it);
          }
        }
        return merged;
      });
      cursorRef.current = res.pageInfo.nextCursor;
      setHasMore(res.pageInfo.hasMore);
    } catch (e: unknown) {
      if (identity === listIdentityEpoch.current) {
        setErr(e);
      }
    } finally {
      // 一律結束「載入下一頁」狀態；若與 identity 綁定，在關鍵字／分類快速切換時會漏跑 finally，
      // 導致 isFetchingNextPage 永遠 true → 無限捲動與取消搜尋後全部卡住。
      setIsFetchingNextPage(false);
    }
  }, [category, debouncedQ, theme, hasMore, isLoading, isFetchingNextPage]);

  return {
    items,
    isLoading,
    isFetchingNextPage,
    loadingMore: isFetchingNextPage,
    error,
    errorCode,
    hasMore,
    isAwaitingDebouncedSearch,
    loadMore,
  };
}
