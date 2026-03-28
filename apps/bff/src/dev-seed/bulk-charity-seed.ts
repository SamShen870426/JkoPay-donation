import type { Prisma, PrismaClient } from '@prisma/client';
import { CHARITY_THEME_VALUES } from '@jkopay/contracts';

const DEMO_LOGO_KEY = '/donation-demo-logo.png';

/** 同時種幾個團體（各團體仍為獨立 transaction，降低互相鎖表風險） */
const SEED_ORG_CONCURRENCY = 3;

function projectHeroPlaceholderUrl(seed: string): string {
  const q = encodeURIComponent(seed).replace(/%20/g, '+');
  return `https://placehold.co/800x480/f1f5f9/475569/png?text=${q}`;
}

export async function wipeAllCharityData(prisma: PrismaClient): Promise<void> {
  await prisma.donationItem.deleteMany();
  await prisma.charityOrganization.deleteMany();
}

export type BulkSeedResult = {
  organizationsCreated: number;
  donationItemsCreated: number;
};

/**
 * 單一團體寫入包在同一個 transaction：減少 MySQL commit 往返（比逐筆 await 快很多）。
 * @returns 本團體新增的 donation_items 列數（8）
 */
async function seedSingleOrganization(tx: Prisma.TransactionClient, i: number): Promise<number> {
  const themes = CHARITY_THEME_VALUES;
  const t0 = themes[(i - 1) % themes.length]!;
  const t1 = themes[i % themes.length]!;
  const orgName = `面試示範團體 ${String(i).padStart(3, '0')}`;

  const org = await tx.charityOrganization.create({
    data: {
      nameZh: orgName,
      logoKey: DEMO_LOGO_KEY,
      descriptionZh: `【面試／Demo 自動產生】${orgName}。可透過隱藏工具頁清空或重種。`,
      themes: {
        create: [{ theme: t0, sortOrder: 0 }],
      },
    },
  });

  await tx.donationItem.create({
    data: {
      category: 'groups',
      titleZh: orgName,
      summaryZh: `【面試示範】${orgName} 公益團體。`,
      logoKey: DEMO_LOGO_KEY,
      organizationId: org.id,
      itemThemes: { create: [{ theme: t0, sortOrder: 0 }] },
    },
  });

  for (let p = 1; p <= 2; p += 1) {
    const hero = projectHeroPlaceholderUrl(`demo-p-${i}-${p}`);
    await tx.donationItem.create({
      data: {
        category: 'projects',
        titleZh: `${orgName} 捐款專案 ${p}`,
        summaryZh: `示範專案摘要 #${i}-${p}`,
        logoKey: DEMO_LOGO_KEY,
        organizationId: org.id,
        organizationNameZh: orgName,
        heroImageKey: hero,
        fundraisingLicenseZh: String(1_000_000 + i * 10 + p),
        projectDetailZh: `此為自動產生之專案內文（團體 ${i} 專案 ${p}）。\n\n僅供 UI／搜尋／分頁測試。`,
        projectDisclaimerZh: `以上內容由「${orgName}」提供（Demo）。`,
        itemThemes: {
          create: [
            { theme: t0, sortOrder: 0 },
            { theme: t1, sortOrder: 1 },
          ],
        },
        projectHeroImages: {
          create: [
            { imageKey: hero, sortOrder: 0, isPrimary: true },
            {
              imageKey: projectHeroPlaceholderUrl(`demo-p-${i}-${p}-b`),
              sortOrder: 1,
              isPrimary: false,
            },
          ],
        },
        projectPaymentOptions: {
          create: [{ kind: 'recurring_monthly' }, { kind: 'one_time' }],
        },
        billingDays: {
          create: [
            { dayOfMonth: 6, sortOrder: 0 },
            { dayOfMonth: 16, sortOrder: 1 },
            { dayOfMonth: 26, sortOrder: 2 },
          ],
        },
        amountPresets: {
          create: [
            { amount: 100, sortOrder: 0, currency: 'TWD' },
            { amount: 500, sortOrder: 1, currency: 'TWD' },
            { amount: 1000, sortOrder: 2, currency: 'TWD' },
          ],
        },
      },
    });
  }

  for (let prod = 1; prod <= 5; prod += 1) {
    const price = 100 + ((i * prod) % 20) * 50;
    await tx.donationItem.create({
      data: {
        category: 'products',
        titleZh: `${orgName} 義賣商品 ${prod}`,
        summaryZh: `示範商品副標 #${i}-${prod}`,
        logoKey: DEMO_LOGO_KEY,
        organizationId: org.id,
        itemThemes: { create: [{ theme: t1, sortOrder: 0 }] },
        charityProduct: {
          create: {
            organizationId: org.id,
            descriptionZh: `【Demo】${orgName} 商品 ${prod} 說明。\n-------\n自動產生於 bulk seed。`,
            currency: 'TWD',
            shippingFeeAmount: 60 + (prod % 3) * 20,
            images: {
              create: [
                {
                  imageKey: DEMO_LOGO_KEY,
                  sortOrder: 0,
                  isPrimary: true,
                },
              ],
            },
            options: {
              create: [
                {
                  labelZh: '標準規格',
                  unitPriceAmount: price,
                  stockQuantity: 50 + prod,
                  sortOrder: 0,
                },
              ],
            },
          },
        },
      },
    });
  }

  return 8;
}

/**
 * 依團體編號區間種資料（含邊界）。並行度 SEED_ORG_CONCURRENCY。
 */
export async function seedOrganizationRange(
  prisma: PrismaClient,
  rangeStart: number,
  rangeEnd: number,
): Promise<BulkSeedResult> {
  if (rangeStart > rangeEnd) {
    return { organizationsCreated: 0, donationItemsCreated: 0 };
  }

  const indices: number[] = [];
  for (let i = rangeStart; i <= rangeEnd; i += 1) indices.push(i);

  let donationItemsCreated = 0;
  for (let p = 0; p < indices.length; p += SEED_ORG_CONCURRENCY) {
    const chunk = indices.slice(p, p + SEED_ORG_CONCURRENCY);
    const counts = await Promise.all(
      chunk.map((i) => prisma.$transaction((tx) => seedSingleOrganization(tx, i))),
    );
    donationItemsCreated += counts.reduce((a, b) => a + b, 0);
  }

  return {
    organizationsCreated: rangeEnd - rangeStart + 1,
    donationItemsCreated,
  };
}

/**
 * 每個團體：1 主檔 + 1 筆 groups 列 + 2 捐款專案 + 5 義賣商品（關聯與 checkout／圖片欄位齊全）。
 * 單次 HTTP 仍可能逾時；大量請改用 API `bulk_seed_batch`。
 */
export async function bulkSeedCharityDemo(
  prisma: PrismaClient,
  organizationCount: number,
): Promise<BulkSeedResult> {
  return seedOrganizationRange(prisma, 1, organizationCount);
}
