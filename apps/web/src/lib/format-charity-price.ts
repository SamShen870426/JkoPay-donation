/** 義賣價格列：單價或區間（TWD 與千分位） */
export function formatCharityPriceLine(currency: string, min: number, max: number): string {
  const cur = currency.trim() || 'TWD';
  const fmt = (n: number) => n.toLocaleString('zh-TW');
  if (min === max) return `${cur} ${fmt(min)}`;
  return `${cur} ${fmt(min)} - ${fmt(max)}`;
}
