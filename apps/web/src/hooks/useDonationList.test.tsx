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
});
