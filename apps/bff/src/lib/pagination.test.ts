import { describe, expect, it } from 'vitest';
import { nextCursorFromPage, trimExtraForCursor } from './pagination.js';

describe('trimExtraForCursor', () => {
  it('當筆數超過 limit 時截斷並標記 hasMore', () => {
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const { page, hasMore } = trimExtraForCursor(rows, 2);
    expect(page).toEqual([{ id: 1 }, { id: 2 }]);
    expect(hasMore).toBe(true);
  });

  it('當筆數未超過 limit 時原樣回傳', () => {
    const rows = [{ id: 1 }];
    const { page, hasMore } = trimExtraForCursor(rows, 2);
    expect(page).toEqual([{ id: 1 }]);
    expect(hasMore).toBe(false);
  });
});

describe('nextCursorFromPage', () => {
  it('空頁回 null', () => {
    expect(nextCursorFromPage([])).toBeNull();
  });

  it('回傳最後一筆 id 字串', () => {
    expect(nextCursorFromPage([{ id: 5 }, { id: 9 }])).toBe('9');
  });
});
