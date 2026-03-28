import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDonationList } from './useDonationList.js';

const emptyList = {
  items: [] as const,
  pageInfo: { nextCursor: null as string | null, hasMore: false },
};

function mockFetchJson(json: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    text: async () => JSON.stringify(json),
  });
}

describe('useDonationList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetchJson(emptyList));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('第一頁請求 URL 含 theme（與無限滾動參數一致）', async () => {
    const { result } = renderHook(() =>
      useDonationList('groups', '', { theme: 'elderly_care' }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetch).toHaveBeenCalled();
    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain('theme=elderly_care');
    expect(url).toContain('category=groups');
  });

  it('API 錯誤時暴露 DonationApiError 訊息', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchJson({ error: 'VALIDATION_ERROR', message: 'Invalid query' }, false),
    );

    const { result } = renderHook(() => useDonationList('groups', ''));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toContain('Invalid query');
    expect(result.current.errorCode).toBe('VALIDATION_ERROR');
  });

  it('搜尋關鍵字變更時重置載入下一頁狀態，避免無限捲動／取消搜尋後卡住', async () => {
    let releaseLoadMore: () => void;
    const loadMoreBarrier = new Promise<void>((r) => {
      releaseLoadMore = r;
    });

    const listItem = {
      id: '1',
      category: 'groups' as const,
      title: '面試示範團體 495',
      description: 'd',
      imageUrl: 'https://example.com/i.png',
    };

    const page1 = {
      items: [listItem],
      pageInfo: { nextCursor: 'c1', hasMore: true },
    };

    const pageAfterClear = {
      items: [
        {
          ...listItem,
          id: '2',
          title: '瀏覽模式',
        },
      ],
      pageInfo: { nextCursor: null, hasMore: false },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(page1),
      })
      .mockImplementationOnce(() =>
        loadMoreBarrier.then(() => ({
          ok: true,
          text: async () =>
            JSON.stringify({
              items: [],
              pageInfo: { nextCursor: null, hasMore: false },
            }),
        })),
      )
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(pageAfterClear),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(({ q }: { q: string }) => useDonationList('groups', q), {
      initialProps: { q: '49' },
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasMore).toBe(true);

    void result.current.loadMore();
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(true));

    rerender({ q: '' });

    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));

    releaseLoadMore!();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items.some((i) => i.title === '瀏覽模式')).toBe(true);
  });
});
