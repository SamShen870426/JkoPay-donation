import type { DonationItem as PrismaDonationItem } from '@prisma/client';
import type { DonationCategory, DonationListItem } from '@jkopay/contracts';

function resolveImageUrl(logoKey: string): string {
  if (logoKey.startsWith('http://') || logoKey.startsWith('https://')) {
    return logoKey;
  }
  /** 與前端同源靜態檔（如 `apps/web/public/donation-demo-logo.png` → `/donation-demo-logo.png`） */
  if (logoKey.startsWith('/')) {
    return logoKey;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(logoKey)}/112/112`;
}

export function toDonationListItem(row: PrismaDonationItem): DonationListItem {
  return {
    id: String(row.id),
    category: row.category as DonationCategory,
    title: row.titleZh,
    description: row.summaryZh,
    imageUrl: resolveImageUrl(row.logoKey),
  };
}
