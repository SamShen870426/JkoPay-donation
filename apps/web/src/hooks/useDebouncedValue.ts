import { useEffect, useState } from 'react';

/**
 * 搜尋關鍵字 debounce，降低 BFF 請求頻率（符合作業效能要求）。
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
