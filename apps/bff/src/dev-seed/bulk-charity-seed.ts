import type { PrismaClient } from '@prisma/client';
import { CHARITY_THEME_VALUES } from '@jkopay/contracts';

const DEMO_LOGO_KEY = '/donation-demo-logo.png';

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
 * 每個團體：1 主檔 + 1 筆 groups 列 + 2 捐款專案 + 5 義賣商品（關聯與 checkout／圖片欄位齊全）。
 */
export async function bulkSeedCharityDemo(
  prisma: PrismaClient,
  organizationCount: number,
): Promise<BulkSeedResult> {
  const themes = CHARITY_THEME_VALUES;
  let donationItemsCreated = 0;

  for (let i = 1; i <= organizationCount; i += 1) {
    const t0 = themes[(i - 1) % themes.length]!;
    const t1 = themes[i % themes.length]!;
    const orgName = `面試示範團體 ${String(i).padStart(3, '0')}`;

    const org = await prisma.charityOrganization.create({
      data: {
        nameZh: orgName,
        logoKey: DEMO_LOGO_KEY,
        descriptionZh: `【面試／Demo 自動產生】${orgName}。可透過隱藏工具頁清空或重種。`,
        themes: {
          create: [{ theme: t0, sortOrder: 0 }],
        },
      },
    });

    await prisma.donationItem.create({
      data: {
        category: 'groups',
        titleZh: orgName,
        summaryZh: `【面試示範】${orgName} 公益團體。`,
        logoKey: DEMO_LOGO_KEY,
        organizationId: org.id,
        itemThemes: { create: [{ theme: t0, sortOrder: 0 }] },
      },
    });
    donationItemsCreated += 1;

    for (let p = 1; p <= 2; p += 1) {
      const hero = projectHeroPlaceholderUrl(`demo-p-${i}-${p}`);
      await prisma.donationItem.create({
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
      donationItemsCreated += 1;
    }

    for (let prod = 1; prod <= 5; prod += 1) {
      const price = 100 + ((i * prod) % 20) * 50;
      await prisma.donationItem.create({
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
      donationItemsCreated += 1;
    }
  }

  return {
    organizationsCreated: organizationCount,
    donationItemsCreated,
  };
}
