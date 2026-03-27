import type { NavigateFunction } from 'react-router-dom';

/**
 * React Router 會在 `history.state.idx` 記錄 SPA 內堆疊位置；`idx === 0` 表示沒有上一筆應用內路由。
 * 此時不呼叫 `navigate(-1)`，避免離開站台或出現空白頁。
 */
export function canPopInAppHistory(): boolean {
  if (typeof window === 'undefined') return false;
  const idx = (window.history.state as { idx?: number | null } | null)?.idx;
  return typeof idx === 'number' && idx > 0;
}

export function tryNavigateBack(navigate: NavigateFunction): void {
  if (canPopInAppHistory()) {
    navigate(-1);
  }
}
