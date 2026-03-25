import type { Prisma, ProjectDonationPaymentKind } from '@prisma/client';
import type {
  CharityProductDetail,
  CharityTheme,
  DonationCategory,
  DonationListItem,
  DonationProjectDetail,
} from '@jkopay/contracts';

/**
 * 缺圖、空 key 時 BFF 一律退回此前端靜態檔（與 `apps/web/public/donation-demo-logo.png` 對應）。
 * 可設 `DONATION_FALLBACK_IMAGE_URL` 覆寫（須為絕對 URL 或同源 `/path`）。
 */
export const DONATION_FALLBACK_IMAGE_URL =
  process.env.DONATION_FALLBACK_IMAGE_URL?.trim() || '/donation-demo-logo.png';

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

export const donationItemProjectDetailInclude = {
  itemThemes: { orderBy: { sortOrder: 'asc' as const } },
  organization: true,
  projectHeroImages: { orderBy: { sortOrder: 'asc' as const } },
  projectPaymentOptions: true,
  billingDays: { orderBy: { sortOrder: 'asc' as const } },
  amountPresets: { orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.DonationItemInclude;

export type DonationItemProjectDetailRow = Prisma.DonationItemGetPayload<{
  include: typeof donationItemProjectDetailInclude;
}>;

export function resolveImageUrl(logoKey: string): string {
  const k = logoKey.trim();
  if (k.length === 0) return DONATION_FALLBACK_IMAGE_URL;
  if (k.startsWith('http://') || k.startsWith('https://')) {
    return k;
  }
  /** 與前端同源靜態檔（如 `apps/web/public/donation-demo-logo.png` → `/donation-demo-logo.png`） */
  if (k.startsWith('/')) {
    return k;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(k)}/112/112`;
}

/** 專案卡主圖（較寬比例） */
export function resolveHeroImageUrl(heroKey: string): string {
  const k = heroKey.trim();
  if (k.length === 0) return DONATION_FALLBACK_IMAGE_URL;
  if (k.startsWith('http://') || k.startsWith('https://')) {
    return k;
  }
  if (k.startsWith('/')) {
    return k;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(k)}/800/480`;
}

/** 義賣列表首圖（正方形） */
function resolveProductCoverUrl(imageKey: string): string {
  const k = imageKey.trim();
  if (k.length === 0) return DONATION_FALLBACK_IMAGE_URL;
  if (k.startsWith('http://') || k.startsWith('https://')) {
    return k;
  }
  if (k.startsWith('/')) {
    return k;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(k)}/400/400`;
}

/** 詳情輪播大圖（正方形） */
function resolveProductGalleryImageUrl(imageKey: string): string {
  const k = imageKey.trim();
  if (k.length === 0) return DONATION_FALLBACK_IMAGE_URL;
  if (k.startsWith('http://') || k.startsWith('https://')) {
    return k;
  }
  if (k.startsWith('/')) {
    return k;
  }
  const base = process.env.ASSET_CDN_BASE?.replace(/\/$/, '') ?? 'https://picsum.photos/seed';
  return `${base}/${encodeURIComponent(k)}/800/800`;
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
  const heroKey = row.heroImageKey?.trim() ?? '';
  const heroImageUrl =
    row.category === 'projects'
      ? resolveHeroImageUrl(heroKey)
      : heroKey.length > 0
        ? resolveHeroImageUrl(heroKey)
        : undefined;

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
  if (bounds == null || cp.organization == null) {
    return base;
  }

  const org = cp.organization.nameZh.trim();
  const currency = cp.currency.trim() || 'TWD';
  const coverUrl =
    coverKey != null && coverKey.trim() !== ''
      ? resolveProductCoverUrl(coverKey)
      : DONATION_FALLBACK_IMAGE_URL;

  return {
    ...base,
    productOrganizationName: org,
    productCoverImageUrl: coverUrl,
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
  const imageUrls =
    sortedImages.length > 0
      ? sortedImages.map((im) => resolveProductGalleryImageUrl(im.imageKey?.trim() ?? ''))
      : [DONATION_FALLBACK_IMAGE_URL];
  const primaryIdx =
    sortedImages.length > 0 ? sortedImages.findIndex((im) => im.isPrimary) : 0;
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

const DEFAULT_PROJECT_PAYMENT_KINDS: ProjectDonationPaymentKind[] = [
  'recurring_monthly',
  'one_time',
];

export function toDonationProjectDetail(row: DonationItemProjectDetailRow): DonationProjectDetail | null {
  if (row.category !== 'projects') return null;

  const sortedHero = [...row.projectHeroImages].sort((a, b) => a.sortOrder - b.sortOrder);
  let heroImageUrls: string[];
  let primaryHeroImageIndex: number;
  if (sortedHero.length > 0) {
    heroImageUrls = sortedHero.map((im) => resolveHeroImageUrl(im.imageKey?.trim() ?? ''));
    const p = sortedHero.findIndex((im) => im.isPrimary);
    primaryHeroImageIndex = p >= 0 ? p : 0;
  } else {
    const key = row.heroImageKey?.trim() ?? '';
    heroImageUrls = [resolveHeroImageUrl(key)];
    primaryHeroImageIndex = 0;
  }

  const org = row.organization;
  const organizationName =
    org?.nameZh?.trim() || row.organizationNameZh?.trim() || '公益團體';
  const organizationLogoUrl =
    org != null ? resolveImageUrl(org.logoKey) : resolveImageUrl(row.logoKey);
  const organizationId = row.organizationId != null ? String(row.organizationId) : null;

  const themes: CharityTheme[] = row.itemThemes.map((it) => it.theme as CharityTheme);

  const kindsFromDb = row.projectPaymentOptions.map((o) => o.kind);
  const paymentKinds =
    kindsFromDb.length > 0 ? kindsFromDb : [...DEFAULT_PROJECT_PAYMENT_KINDS];

  const billingSorted = [...row.billingDays].sort((a, b) => a.sortOrder - b.sortOrder);
  const billingDays =
    billingSorted.length > 0 ? billingSorted.map((d) => d.dayOfMonth) : [6, 16, 26];

  const presetsSorted = [...row.amountPresets].sort((a, b) => a.sortOrder - b.sortOrder);
  const amountPresets =
    presetsSorted.length > 0
      ? presetsSorted.map((p) => ({
          amount: p.amount,
          currency: p.currency.trim() || 'TWD',
        }))
      : [
          { amount: 100, currency: 'TWD' },
          { amount: 500, currency: 'TWD' },
          { amount: 1000, currency: 'TWD' },
        ];

  return {
    donationItemId: String(row.id),
    title: row.titleZh,
    subtitle: row.summaryZh,
    fundraisingLicense: row.fundraisingLicenseZh?.trim() || null,
    heroImageUrls,
    primaryHeroImageIndex,
    organizationId,
    organizationName,
    organizationLogoUrl,
    themes,
    projectDetail: row.projectDetailZh?.trim() || row.summaryZh,
    disclaimer: row.projectDisclaimerZh?.trim() || null,
    checkout: {
      paymentKinds,
      billingDays,
      amountPresets,
      allowCustomAmount: true,
    },
  };
}
