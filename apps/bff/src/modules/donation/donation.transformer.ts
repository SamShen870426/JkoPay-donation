import type { Prisma } from '@prisma/client';
import type {
  CharityProductDetail,
  CharityTheme,
  DonationCategory,
  DonationListItem,
} from '@jkopay/contracts';

export const donationItemListInclude = {
  itemThemes: {
    orderBy: { sortOrder: 'asc' as const },
  },
  organization: true,
  charityProduct: {
    include: {
      organization: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
      options: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
} satisfies Prisma.DonationItemInclude;

export type DonationItemListRow = Prisma.DonationItemGetPayload<{
  include: typeof donationItemListInclude;
}>;

export function resolveImageUrl(logoKey: string): string {
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
export function resolveHeroImageUrl(heroKey: string): string {
  if (heroKey.startsWith('http://') || heroKey.startsWith('https://')) {
    return heroKey;
  }
  if (heroKey.startsWith('/')) {
    return heroKey;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(heroKey)}/800/480`;
}

/** 義賣列表首圖（正方形） */
function resolveProductCoverUrl(imageKey: string): string {
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }
  if (imageKey.startsWith('/')) {
    return imageKey;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(imageKey)}/400/400`;
}

/** 詳情輪播大圖（正方形） */
function resolveProductGalleryImageUrl(imageKey: string): string {
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }
  if (imageKey.startsWith('/')) {
    return imageKey;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(imageKey)}/800/800`;
}

function pickPrimaryImageKey(
  images: { imageKey: string; isPrimary: boolean; sortOrder: number }[],
): string | null {
  if (images.length === 0) return null;
  const primary = images.find((im) => im.isPrimary);
  if (primary != null) return primary.imageKey;
  return images[0]!.imageKey;
}

function optionPriceBounds(options: { unitPriceAmount: number }[]): { min: number; max: number } | null {
  if (options.length === 0) return null;
  let min = options[0]!.unitPriceAmount;
  let max = min;
  for (const o of options) {
    if (o.unitPriceAmount < min) min = o.unitPriceAmount;
    if (o.unitPriceAmount > max) max = o.unitPriceAmount;
  }
  return { min, max };
}

export function toDonationListItem(row: DonationItemListRow): DonationListItem {
  const organizationName =
    row.organization?.nameZh?.trim() || row.organizationNameZh?.trim() || undefined;
  const heroKey = row.heroImageKey?.trim();
  const heroImageUrl =
    heroKey != null && heroKey.length > 0 ? resolveHeroImageUrl(heroKey) : undefined;

  const themes: CharityTheme[] | undefined =
    row.category === 'projects' && row.itemThemes.length > 0
      ? row.itemThemes.map((it) => it.theme as CharityTheme)
      : undefined;

  const base: DonationListItem = {
    id: String(row.id),
    category: row.category as DonationCategory,
    title: row.titleZh,
    description: row.summaryZh,
    imageUrl: resolveImageUrl(row.logoKey),
    ...(organizationName != null ? { organizationName } : {}),
    ...(heroImageUrl != null ? { heroImageUrl } : {}),
    ...(themes != null && themes.length > 0 ? { themes } : {}),
    ...(row.category === 'groups' && row.organizationId != null
      ? { organizationId: String(row.organizationId) }
      : {}),
  };

  const cp = row.charityProduct;
  if (row.category !== 'products' || cp == null) {
    return base;
  }

  const bounds = optionPriceBounds(cp.options);
  const coverKey = pickPrimaryImageKey(cp.images);
  if (bounds == null || coverKey == null || cp.organization == null) {
    return base;
  }

  const org = cp.organization.nameZh.trim();
  const currency = cp.currency.trim() || 'TWD';

  return {
    ...base,
    productOrganizationName: org,
    productCoverImageUrl: resolveProductCoverUrl(coverKey),
    productPriceMin: bounds.min,
    productPriceMax: bounds.max,
    productCurrency: currency,
  };
}

export function toCharityProductDetail(row: DonationItemListRow): CharityProductDetail | null {
  if (row.category !== 'products') return null;
  const cp = row.charityProduct;
  if (cp == null || cp.organization == null) return null;

  const sortedImages = [...cp.images].sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedImages.length === 0) return null;

  const imageUrls = sortedImages.map((im) => resolveProductGalleryImageUrl(im.imageKey));
  const primaryIdx = sortedImages.findIndex((im) => im.isPrimary);
  const primaryImageIndex = primaryIdx >= 0 ? primaryIdx : 0;

  const bounds = optionPriceBounds(cp.options);
  if (bounds == null) return null;

  const sortedOptions = [...cp.options].sort((a, b) => a.sortOrder - b.sortOrder);
  const options = sortedOptions.map((o) => ({
    id: String(o.id),
    label: o.labelZh,
    unitPrice: o.unitPriceAmount,
    stockQuantity: o.stockQuantity,
    sortOrder: o.sortOrder,
  }));

  const themes: CharityTheme[] = row.itemThemes.map((it) => it.theme as CharityTheme);
  const currency = cp.currency.trim() || 'TWD';

  return {
    donationItemId: String(row.id),
    title: row.titleZh,
    subtitle: row.summaryZh,
    organizationName: cp.organization.nameZh.trim(),
    organizationId: String(cp.organization.id),
    organizationLogoUrl: resolveImageUrl(cp.organization.logoKey),
    currency,
    priceMin: bounds.min,
    priceMax: bounds.max,
    shippingFeeAmount: cp.shippingFeeAmount,
    imageUrls,
    primaryImageIndex,
    themes,
    description: cp.descriptionZh,
    options,
  };
}
