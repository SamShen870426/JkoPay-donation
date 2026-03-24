/**
 * Keyset 分頁：多取 1 筆判斷 hasMore，利於無限滾動與單元測試。
 */
export function trimExtraForCursor<T extends { id: number }>(
  rows: T[],
  limit: number,
): { page: T[]; hasMore: boolean } {
  if (rows.length > limit) {
    return { page: rows.slice(0, limit), hasMore: true };
  }
  return { page: rows, hasMore: false };
}

export function nextCursorFromPage(page: { id: number }[]): string | null {
  if (page.length === 0) return null;
  return String(page[page.length - 1]!.id);
}
