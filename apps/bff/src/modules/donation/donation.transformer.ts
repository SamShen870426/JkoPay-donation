import type { Prisma } from '@prisma/client';
import type { CharityTheme, DonationCategory, DonationListItem } from '@jkopay/contracts';

export const donationItemListInclude = {
  itemThemes: {
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.DonationItemInclude;

export type DonationItemListRow = Prisma.DonationItemGetPayload<{
  include: typeof donationItemListInclude;
}>;

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

/** 專案卡主圖（較寬比例） */
function resolveHeroImageUrl(heroKey: string): string {
  if (heroKey.startsWith('http://') || heroKey.startsWith('https://')) {
    return heroKey;
  }
  if (heroKey.startsWith('/')) {
    return heroKey;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(heroKey)}/800/480`;
}

export function toDonationListItem(row: DonationItemListRow): DonationListItem {
  const organizationName = row.organizationNameZh?.trim() || undefined;
  const heroKey = row.heroImageKey?.trim();
  const heroImageUrl =
    heroKey != null && heroKey.length > 0 ? resolveHeroImageUrl(heroKey) : undefined;

  const themes: CharityTheme[] | undefined =
    row.category === 'projects' && row.itemThemes.length > 0
      ? row.itemThemes.map((it) => it.theme as CharityTheme)
      : undefined;

  return {
    id: String(row.id),
    category: row.category as DonationCategory,
    title: row.titleZh,
    description: row.summaryZh,
    imageUrl: resolveImageUrl(row.logoKey),
    ...(organizationName != null ? { organizationName } : {}),
    ...(heroImageUrl != null ? { heroImageUrl } : {}),
    ...(themes != null && themes.length > 0 ? { themes } : {}),
  };
}
