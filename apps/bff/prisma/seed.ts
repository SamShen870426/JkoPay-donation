import {
  PrismaClient,
  DonationCategory,
  CharityTheme,
} from '@prisma/client';
import { CHARITY_THEME_VALUES } from '@jkopay/contracts';

const prisma = new PrismaClient();

const DEMO_LOGO_KEY = '/donation-demo-logo.png';

type ThemeLink = { theme: CharityTheme; sortOrder: number };

async function createItem(data: {
  category: DonationCategory;
  titleZh: string;
  summaryZh: string;
  logoKey: string;
  organizationNameZh?: string | null;
  heroImageKey?: string | null;
  themes: ThemeLink[];
}) {
  await prisma.donationItem.create({
    data: {
      category: data.category,
      titleZh: data.titleZh,
      summaryZh: data.summaryZh,
      logoKey: data.logoKey,
      organizationNameZh: data.organizationNameZh ?? undefined,
      heroImageKey: data.heroImageKey ?? undefined,
      itemThemes: {
        create: data.themes.map((t) => ({
          theme: t.theme,
          sortOrder: t.sortOrder,
        })),
      },
    },
  });
}

type ProductImageSeed = { imageKey: string; sortOrder: number; isPrimary: boolean };
type ProductOptionSeed = {
  labelZh: string;
  unitPriceAmount: number;
  stockQuantity: number;
  sortOrder: number;
};

async function createProductItem(data: {
  titleZh: string;
  summaryZh: string;
  logoKey: string;
  themes: ThemeLink[];
  organizationNameZh: string;
  descriptionZh: string;
  currency?: string;
  shippingFeeAmount?: number;
  images: ProductImageSeed[];
  options: ProductOptionSeed[];
}) {
  await prisma.donationItem.create({
    data: {
      category: 'products',
      titleZh: data.titleZh,
      summaryZh: data.summaryZh,
      logoKey: data.logoKey,
      itemThemes: {
        create: data.themes.map((t) => ({
          theme: t.theme,
          sortOrder: t.sortOrder,
        })),
      },
      charityProduct: {
        create: {
          organizationNameZh: data.organizationNameZh,
          descriptionZh: data.descriptionZh,
          currency: data.currency ?? 'TWD',
          shippingFeeAmount: data.shippingFeeAmount ?? 0,
          images: { create: data.images },
          options: { create: data.options },
        },
      },
    },
  });
}

const groupRows: Array<{
  category: DonationCategory;
  theme: CharityTheme;
  titleZh: string;
  summaryZh: string;
  logoKey: string;
}> = [
  {
    category: 'groups',
    theme: 'animal_protection',
    titleZh: '財團法人流浪動物基金會',
    summaryZh: '致力於流浪動物醫療、收容與教育推廣。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'groups',
    theme: 'child_youth_care',
    titleZh: '兒童福利聯盟',
    summaryZh: '關注兒少權益，提供急難救助與心理支持。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'groups',
    theme: 'environmental_protection',
    titleZh: '環境保護協會',
    summaryZh: '推動淨灘、減塑與社區環境教育。',
    logoKey: DEMO_LOGO_KEY,
  },
];

/** 與稿相近：多圖、多選項（價格區間／單價）、運費供後續結帳用 */
const showcaseProducts: Array<{
  titleZh: string;
  summaryZh: string;
  organizationNameZh: string;
  descriptionZh: string;
  themes: ThemeLink[];
  shippingFeeAmount: number;
  images: ProductImageSeed[];
  options: ProductOptionSeed[];
}> = [
  {
    titleZh: '/貓貓花色全包！/ 貓貓定律 驚喜摺疊萬用卡',
    summaryZh: '貓貓定律 驚喜摺疊萬用卡',
    organizationNameZh: '社團法人貓咪也瘋狂公益協會',
    descriptionZh:
      '-------\n因協會人力有限，預計將於購買後7-14天內寄達。請務必留下正確地址、姓名、聯絡電話，以利寄送喔！',
    themes: [{ theme: 'animal_protection', sortOrder: 0 }],
    shippingFeeAmount: 100,
    images: [
      { imageKey: 'product-cat-cards-1', sortOrder: 0, isPrimary: true },
      { imageKey: 'product-cat-cards-2', sortOrder: 1, isPrimary: false },
    ],
    options: [
      { labelZh: '1張', unitPriceAmount: 250, stockQuantity: 100, sortOrder: 0 },
      { labelZh: '2張', unitPriceAmount: 450, stockQuantity: 80, sortOrder: 1 },
    ],
  },
  {
    titleZh: '【貓頭鷹系列】手拿隨身小風扇',
    summaryZh: '夏日外出涼感小物，義賣所得支持公益。',
    organizationNameZh: '財團法人台灣省私立台灣兒童暨家庭扶助基金會',
    descriptionZh: '輕巧隨身風扇，內建電池款。售完為止。',
    themes: [{ theme: 'child_youth_care', sortOrder: 0 }],
    shippingFeeAmount: 60,
    images: [{ imageKey: 'product-owl-fan', sortOrder: 0, isPrimary: true }],
    options: [{ labelZh: '單入', unitPriceAmount: 100, stockQuantity: 200, sortOrder: 0 }],
  },
  {
    titleZh: '/新登場，少量現貨/ BOXKITTY 山水貓抓板',
    summaryZh: '居家貓抓板，少量現貨。',
    organizationNameZh: '社團法人貓咪也瘋狂公益協會',
    descriptionZh: '大型紙製貓抓板，組裝簡單。依訂單順序出貨。',
    themes: [{ theme: 'animal_protection', sortOrder: 0 }],
    shippingFeeAmount: 120,
    images: [{ imageKey: 'product-boxkitty', sortOrder: 0, isPrimary: true }],
    options: [{ labelZh: '單組', unitPriceAmount: 1050, stockQuantity: 15, sortOrder: 0 }],
  },
  {
    titleZh: '寬燭 | 馬利祿達摩擴香石-白',
    summaryZh: '手工擴香石，室內香氛小物。',
    organizationNameZh: '財團法人台灣紅絲帶基金會',
    descriptionZh: '附精油使用說明。圖片僅供參考，以實物為準。',
    themes: [{ theme: 'special_medical', sortOrder: 0 }],
    shippingFeeAmount: 80,
    images: [
      { imageKey: 'product-diffuser-1', sortOrder: 0, isPrimary: false },
      { imageKey: 'product-diffuser-2', sortOrder: 1, isPrimary: true },
    ],
    options: [{ labelZh: '單入', unitPriceAmount: 1600, stockQuantity: 40, sortOrder: 0 }],
  },
  {
    titleZh: '木杯墊+木湯匙 公益組合',
    summaryZh: '手工木作小物，兩種組合可選。',
    organizationNameZh: '示範林業永續協會',
    descriptionZh: '天然木材，每組附簡易保養說明。',
    themes: [{ theme: 'environmental_protection', sortOrder: 0 }],
    shippingFeeAmount: 100,
    images: [{ imageKey: 'product-wood-set', sortOrder: 0, isPrimary: true }],
    options: [
      { labelZh: '木杯墊+木湯匙 各一', unitPriceAmount: 450, stockQuantity: 20, sortOrder: 0 },
      { labelZh: '木杯墊+木湯匙 各二對組', unitPriceAmount: 850, stockQuantity: 1, sortOrder: 1 },
    ],
  },
];

/** 與設計稿一致：專案卡 + 多個公益主題（與篩選類別相同） */
const showcaseProjects: Array<{
  titleZh: string;
  summaryZh: string;
  organizationNameZh: string;
  heroImageKey: string;
  themes: ThemeLink[];
}> = [
  {
    titleZh: '社區冰箱-讓愛傳遞計畫',
    summaryZh:
      '串連社區共享物資，減少食物浪費並支援經濟弱勢家庭取得營養餐食。',
    organizationNameZh: '社團法人高雄市合德慈善會',
    heroImageKey: 'project-hero-community-fridge',
    themes: [
      { theme: 'public_issues', sortOrder: 0 },
      { theme: 'community_development', sortOrder: 1 },
      { theme: 'poverty_relief', sortOrder: 2 },
    ],
  },
  {
    titleZh: '升降椅像翅膀，讓人生重新起飛',
    summaryZh: '協助脊髓損傷者居家無障礙改造，募款安裝升降椅與輔具。',
    organizationNameZh: '脊髓損傷基金會',
    heroImageKey: 'project-hero-lift-chair',
    themes: [
      { theme: 'disability_services', sortOrder: 0 },
      { theme: 'poverty_relief', sortOrder: 1 },
    ],
  },
];

function extraRows(): Array<{
  category: DonationCategory;
  theme: CharityTheme;
  titleZh: string;
  summaryZh: string;
  logoKey: string;
  organizationNameZh?: string;
  heroImageKey?: string;
  extraThemes?: ThemeLink[];
  extraRowIndex: number;
}> {
  const out: ReturnType<typeof extraRows> = [];
  const categories: DonationCategory[] = ['groups', 'projects', 'products'];
  const themes = CHARITY_THEME_VALUES;
  for (let i = 1; i <= 40; i += 1) {
    const category = categories[i % 3]!;
    const theme = themes[i % themes.length]!;
    const base = {
      category,
      theme,
      titleZh: `示範${category === 'groups' ? '團體' : category === 'projects' ? '專案' : '商品'} ${i}`,
      summaryZh: `自動產生測試資料 #${i}，方便驗證無限滾動與分類過濾。`,
      logoKey: DEMO_LOGO_KEY,
      extraRowIndex: i,
    };
    if (category === 'projects') {
      const t0 = themes[i % themes.length]!;
      const t1 = themes[(i + 1) % themes.length]!;
      out.push({
        ...base,
        organizationNameZh: `示範主辦單位 ${i}`,
        heroImageKey: `demo-project-hero-${i}`,
        extraThemes: [
          { theme: t0, sortOrder: 0 },
          { theme: t1, sortOrder: 1 },
        ],
      });
    } else {
      out.push(base);
    }
  }
  return out;
}

async function main() {
  await prisma.donationItem.deleteMany();

  for (const r of groupRows) {
    await createItem({
      category: r.category,
      titleZh: r.titleZh,
      summaryZh: r.summaryZh,
      logoKey: r.logoKey,
      themes: [{ theme: r.theme, sortOrder: 0 }],
    });
  }

  for (const p of showcaseProducts) {
    await createProductItem({
      titleZh: p.titleZh,
      summaryZh: p.summaryZh,
      logoKey: DEMO_LOGO_KEY,
      themes: p.themes,
      organizationNameZh: p.organizationNameZh,
      descriptionZh: p.descriptionZh,
      shippingFeeAmount: p.shippingFeeAmount,
      images: p.images,
      options: p.options,
    });
  }

  for (const p of showcaseProjects) {
    await createItem({
      category: 'projects',
      titleZh: p.titleZh,
      summaryZh: p.summaryZh,
      logoKey: DEMO_LOGO_KEY,
      organizationNameZh: p.organizationNameZh,
      heroImageKey: p.heroImageKey,
      themes: p.themes,
    });
  }

  for (const r of extraRows()) {
    if (r.category === 'projects' && r.extraThemes != null) {
      await createItem({
        category: r.category,
        titleZh: r.titleZh,
        summaryZh: r.summaryZh,
        logoKey: r.logoKey,
        organizationNameZh: r.organizationNameZh,
        heroImageKey: r.heroImageKey,
        themes: r.extraThemes,
      });
    } else if (r.category === 'products') {
      const price = 100 + (r.extraRowIndex % 15) * 50;
      await createProductItem({
        titleZh: r.titleZh,
        summaryZh: r.summaryZh,
        logoKey: r.logoKey,
        themes: [{ theme: r.theme, sortOrder: 0 }],
        organizationNameZh: `示範關聯公益團體（#${r.extraRowIndex}）`,
        descriptionZh: `${r.summaryZh}\n-------\n此為大量測試資料自動產生之商品說明。`,
        images: [
          {
            imageKey: `auto-product-cover-${r.extraRowIndex}`,
            sortOrder: 0,
            isPrimary: true,
          },
        ],
        options: [
          {
            labelZh: '標準',
            unitPriceAmount: price,
            stockQuantity: 50,
            sortOrder: 0,
          },
        ],
      });
    } else {
      await createItem({
        category: r.category,
        titleZh: r.titleZh,
        summaryZh: r.summaryZh,
        logoKey: r.logoKey,
        themes: [{ theme: r.theme, sortOrder: 0 }],
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
