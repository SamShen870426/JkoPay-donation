import {
  PrismaClient,
  DonationCategory,
  CharityTheme,
  ProjectDonationPaymentKind,
} from '@prisma/client';
import { CHARITY_THEME_VALUES } from '@jkopay/contracts';

const prisma = new PrismaClient();

const DEMO_LOGO_KEY = '/donation-demo-logo.png';

type ThemeLink = { theme: CharityTheme; sortOrder: number };

type OrgSeed = {
  key: string;
  nameZh: string;
  logoKey: string;
  profileBannerKey?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  registrationNumberZh?: string | null;
  descriptionZh: string;
  themes: ThemeLink[];
};

const organizationSeeds: OrgSeed[] = [
  {
    key: 'stray_animals',
    nameZh: '財團法人流浪動物基金會',
    logoKey: DEMO_LOGO_KEY,
    phone: '02-2300-0001',
    email: 'info@stray-animals.example.org',
    websiteUrl: 'https://example.org/stray-animals',
    registrationNumberZh: '台內團字第1060000001號',
    descriptionZh:
      '致力於流浪動物醫療、收容與教育推廣，結合志工與社區力量，提升動物福利與責任飼養觀念。基金會設有醫療支援專案，協助經濟困難飼主與救援單位負擔必要診療費用，並提供中途之家讓受傷或幼小的動物有安全恢復的空間。\n\n' +
      '我們也深入校園與社區，透過講座、營隊與文宣，推廣「領養代替購買」「結紮減量」等觀念，並與縣市政府合作推動動保政策倡議。邀請您透過捐款、志工服務或物資捐贈加入我們，一起讓台灣的浪浪與人類社會更友善共存。',
    themes: [{ theme: 'animal_protection', sortOrder: 0 }],
  },
  {
    key: 'child_league',
    nameZh: '兒童福利聯盟',
    logoKey: DEMO_LOGO_KEY,
    phone: '02-2300-0002',
    email: 'service@child-league.example.org',
    websiteUrl: 'https://example.org/child-league',
    registrationNumberZh: '台內團字第1060000002號',
    descriptionZh:
      '關注兒少權益，提供急難救助、心理支持與政策倡議，讓每個孩子都能在安全環境中成長。',
    themes: [{ theme: 'child_youth_care', sortOrder: 0 }],
  },
  {
    key: 'env_assoc',
    nameZh: '環境保護協會',
    logoKey: DEMO_LOGO_KEY,
    phone: '02-2300-0003',
    email: 'contact@env.example.org',
    websiteUrl: 'https://example.org/env',
    registrationNumberZh: '台內團字第1060000003號',
    descriptionZh: '推動淨灘、減塑與社區環境教育，串連企業與學校共同守護土地與海洋。',
    themes: [{ theme: 'environmental_protection', sortOrder: 0 }],
  },
  {
    key: 'cat_crazy',
    nameZh: '社團法人貓咪也瘋狂公益協會',
    logoKey: DEMO_LOGO_KEY,
    phone: '02-2700-8888',
    email: 'hello@cat-crazy.example.org',
    websiteUrl: 'https://example.org/cat-crazy',
    registrationNumberZh: '台內團字第1070034819號',
    descriptionZh:
      '本會長期投入街貓救援、醫療、絕育與送養，並透過教育推廣生命關懷。我們相信每一隻貓都值得被善待，也邀請您一起支持協會的各項計畫與義賣活動，讓愛延續到社區每個角落。\n\n' +
      '協會成立以來，與在地獸醫、愛心民眾及企業合作，建立中途照護與醫療基金，並定期舉辦認養會與生命教育講座，協助民眾理解責任養寵與街貓友善共處。您的每一份捐款與義賣支持，都能轉化為實際的醫藥費、飼料與場地維護，讓我們能持續陪伴更多需要幫助的貓咪。\n\n' +
      '未來我們也將擴大社區巡迴、TNVR（捕捉、絕育、疫苗、回置）宣導，並與學校合作推廣動物保護觀念。若您願意成為志工、捐贈物資或分享我們的故事，都歡迎透過本頁聯絡方式與我們聯繫。謝謝您與我們一起，讓街角的生命被看見、被照顧。',
    themes: [
      { theme: 'animal_protection', sortOrder: 0 },
      { theme: 'public_issues', sortOrder: 1 },
    ],
  },
  {
    key: 'twcf',
    nameZh: '財團法人台灣省私立台灣兒童暨家庭扶助基金會',
    logoKey: DEMO_LOGO_KEY,
    phone: '049-2300-0000',
    email: 'info@twcf.example.org',
    websiteUrl: 'https://example.org/twcf',
    registrationNumberZh: '台內團字第1060000010號',
    descriptionZh: '扶助經濟弱勢兒童與家庭，提供生活與就學協助，並陪伴家庭度過難關。',
    themes: [{ theme: 'child_youth_care', sortOrder: 0 }],
  },
  {
    key: 'red_ribbon',
    nameZh: '財團法人台灣紅絲帶基金會',
    logoKey: DEMO_LOGO_KEY,
    phone: '02-2300-0099',
    email: 'contact@redribbon.example.org',
    websiteUrl: 'https://example.org/redribbon',
    registrationNumberZh: '台內團字第1060000020號',
    descriptionZh: '推動疾病防治與健康衛教，關懷受影響家庭並提供支持性服務。',
    themes: [{ theme: 'special_medical', sortOrder: 0 }],
  },
  {
    key: 'forestry_demo',
    nameZh: '示範林業永續協會',
    logoKey: DEMO_LOGO_KEY,
    phone: '037-000-0000',
    email: 'wood@forestry.example.org',
    websiteUrl: 'https://example.org/forestry',
    registrationNumberZh: '台內團字第1060000030號',
    descriptionZh: '推廣永續林業與環境教育，義賣木作小物所得支持生態保育計畫。',
    themes: [{ theme: 'environmental_protection', sortOrder: 0 }],
  },
  {
    key: 'kaohsiung_hede',
    nameZh: '社團法人高雄市合德慈善會',
    logoKey: DEMO_LOGO_KEY,
    phone: '07-000-0000',
    email: 'hede@example.org',
    websiteUrl: 'https://example.org/hede',
    registrationNumberZh: '高市社團字第0001號',
    descriptionZh:
      '串連社區共享物資，減少食物浪費並支援經濟弱勢家庭取得營養餐食，推動「社區冰箱」等創新模式。本會與超市、餐飲業者與農民合作，將即期但仍安全的食材整理分裝，透過據點與志工配送，讓有需要的朋友能定時取得蔬果與主食。\n\n' +
      '除食物分享外，我們也辦理營養衛教、理財小講座與親子活動，強化社區互助網絡。若您認同「惜食與分享」的理念，歡迎捐款支持據點營運，或加入志工行列，與我們一起讓溫暖在巷弄間流動。',
    themes: [
      { theme: 'public_issues', sortOrder: 0 },
      { theme: 'community_development', sortOrder: 1 },
      { theme: 'poverty_relief', sortOrder: 2 },
    ],
  },
  {
    key: 'spinal_fund',
    nameZh: '脊髓損傷基金會',
    logoKey: DEMO_LOGO_KEY,
    phone: '02-2500-0000',
    email: 'info@spinal.example.org',
    websiteUrl: 'https://example.org/spinal',
    registrationNumberZh: '台內團字第1060000040號',
    descriptionZh:
      '協助脊髓損傷者居家無障礙改造、輔具與復健資源媒合，並倡議無障礙環境與平等權益。',
    themes: [
      { theme: 'disability_services', sortOrder: 0 },
      { theme: 'poverty_relief', sortOrder: 1 },
    ],
  },
  {
    key: 'extra_project_host',
    nameZh: '示範主辦單位',
    logoKey: DEMO_LOGO_KEY,
    descriptionZh: '供大量測試專案列使用的示範主辦單位。',
    themes: [{ theme: 'public_issues', sortOrder: 0 }],
  },
  {
    key: 'extra_product_org',
    nameZh: '示範關聯公益團體',
    logoKey: DEMO_LOGO_KEY,
    descriptionZh: '供大量測試義賣列使用的示範團體。',
    themes: [{ theme: 'special_medical', sortOrder: 0 }],
  },
];

async function seedOrganizations(): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  for (const o of organizationSeeds) {
    const created = await prisma.charityOrganization.create({
      data: {
        nameZh: o.nameZh,
        logoKey: o.logoKey,
        profileBannerKey: o.profileBannerKey ?? null,
        phone: o.phone ?? null,
        email: o.email ?? null,
        websiteUrl: o.websiteUrl ?? null,
        registrationNumberZh: o.registrationNumberZh ?? null,
        descriptionZh: o.descriptionZh,
        themes: {
          create: o.themes.map((t) => ({
            theme: t.theme,
            sortOrder: t.sortOrder,
          })),
        },
      },
    });
    map[o.key] = created.id;
  }
  return map;
}

async function createItem(data: {
  category: DonationCategory;
  titleZh: string;
  summaryZh: string;
  logoKey: string;
  organizationId?: number | null;
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
      organizationId: data.organizationId ?? undefined,
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

const DEFAULT_PROJECT_PAYMENT_KINDS: ProjectDonationPaymentKind[] = [
  'recurring_monthly',
  'one_time',
];
const DEFAULT_BILLING_DAYS = [6, 16, 26];
const DEFAULT_AMOUNT_PRESETS = [
  { amount: 100, sortOrder: 0 },
  { amount: 500, sortOrder: 1 },
  { amount: 1000, sortOrder: 2 },
];

function defaultProjectDisclaimer(orgName: string): string {
  return `以上內容由「${orgName}」提供。若本專案跨年持續，定期捐款授權將延續至您主動終止為止。勸募立案核准字號如有變更，以主管機關最新核定與本頁公告為準。`;
}

async function createDonationProject(data: {
  titleZh: string;
  summaryZh: string;
  logoKey: string;
  organizationId: number | null;
  organizationNameZh?: string | null;
  heroImageKey: string | null;
  fundraisingLicenseZh?: string | null;
  projectDetailZh?: string | null;
  projectDisclaimerZh?: string | null;
  themes: ThemeLink[];
  heroGallery?: Array<{ imageKey: string; sortOrder: number; isPrimary: boolean }>;
  paymentKinds?: ProjectDonationPaymentKind[];
  billingDays?: number[];
  amountPresets?: Array<{ amount: number; sortOrder: number }>;
}) {
  const paymentKinds = data.paymentKinds ?? DEFAULT_PROJECT_PAYMENT_KINDS;
  const billingDays = data.billingDays ?? DEFAULT_BILLING_DAYS;
  const amountPresets = data.amountPresets ?? DEFAULT_AMOUNT_PRESETS;

  const heroGallery =
    data.heroGallery ??
    (data.heroImageKey != null && data.heroImageKey.length > 0
      ? [{ imageKey: data.heroImageKey, sortOrder: 0, isPrimary: true }]
      : []);

  await prisma.donationItem.create({
    data: {
      category: 'projects',
      titleZh: data.titleZh,
      summaryZh: data.summaryZh,
      logoKey: data.logoKey,
      organizationId: data.organizationId ?? undefined,
      organizationNameZh: data.organizationNameZh ?? undefined,
      heroImageKey: data.heroImageKey ?? undefined,
      fundraisingLicenseZh: data.fundraisingLicenseZh ?? undefined,
      projectDetailZh: data.projectDetailZh ?? undefined,
      projectDisclaimerZh: data.projectDisclaimerZh ?? undefined,
      itemThemes: {
        create: data.themes.map((t) => ({
          theme: t.theme,
          sortOrder: t.sortOrder,
        })),
      },
      projectHeroImages: { create: heroGallery },
      projectPaymentOptions: {
        create: paymentKinds.map((kind) => ({ kind })),
      },
      billingDays: {
        create: billingDays.map((day, i) => ({
          dayOfMonth: day,
          sortOrder: i,
        })),
      },
      amountPresets: {
        create: amountPresets.map((p, i) => ({
          amount: p.amount,
          sortOrder: p.sortOrder ?? i,
          currency: 'TWD',
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
  organizationId: number;
  themes: ThemeLink[];
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
      /** 與 charity_products.organization_id 一致，列表／搜尋可單一關聯主檔 */
      organizationId: data.organizationId,
      itemThemes: {
        create: data.themes.map((t) => ({
          theme: t.theme,
          sortOrder: t.sortOrder,
        })),
      },
      charityProduct: {
        create: {
          organizationId: data.organizationId,
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

/**
 * 公益團體分頁一筆一主檔：列表／搜尋只查 donation_items category=groups。
 * 若某團體仅有義賣或專案而沒有 groups 列，使用者搜尋團名（如「貓咪」）會查無資料。
 */
function groupListSummaryZh(org: OrgSeed): string {
  const oneLine = org.descriptionZh.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= 200) return oneLine;
  return `${oneLine.slice(0, 197)}…`;
}

const showcaseProducts: Array<{
  titleZh: string;
  summaryZh: string;
  orgKey: string;
  descriptionZh: string;
  themes: ThemeLink[];
  shippingFeeAmount: number;
  images: ProductImageSeed[];
  options: ProductOptionSeed[];
}> = [
  {
    titleZh: '/貓貓花色全包！/ 貓貓定律 驚喜摺疊萬用卡',
    summaryZh: '貓貓定律 驚喜摺疊萬用卡',
    orgKey: 'cat_crazy',
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
    orgKey: 'twcf',
    descriptionZh: '輕巧隨身風扇，內建電池款。售完為止。',
    themes: [{ theme: 'child_youth_care', sortOrder: 0 }],
    shippingFeeAmount: 60,
    images: [{ imageKey: 'product-owl-fan', sortOrder: 0, isPrimary: true }],
    options: [{ labelZh: '單入', unitPriceAmount: 100, stockQuantity: 200, sortOrder: 0 }],
  },
  {
    titleZh: '/新登場，少量現貨/ BOXKITTY 山水貓抓板',
    summaryZh: '居家貓抓板，少量現貨。',
    orgKey: 'cat_crazy',
    descriptionZh: '大型紙製貓抓板，組裝簡單。依訂單順序出貨。',
    themes: [{ theme: 'animal_protection', sortOrder: 0 }],
    shippingFeeAmount: 120,
    images: [{ imageKey: 'product-boxkitty', sortOrder: 0, isPrimary: true }],
    options: [{ labelZh: '單組', unitPriceAmount: 1050, stockQuantity: 15, sortOrder: 0 }],
  },
  {
    titleZh: '寬燭 | 馬利祿達摩擴香石-白',
    summaryZh: '手工擴香石，室內香氛小物。',
    orgKey: 'red_ribbon',
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
    orgKey: 'forestry_demo',
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

const showcaseProjects: Array<{
  titleZh: string;
  summaryZh: string;
  orgKey: string;
  heroImageKey: string;
  heroGallery?: Array<{ imageKey: string; sortOrder: number; isPrimary: boolean }>;
  fundraisingLicenseZh: string;
  projectDetailZh: string;
  themes: ThemeLink[];
}> = [
  {
    titleZh: '社區冰箱-讓愛傳遞計畫',
    summaryZh:
      '串連社區共享物資，減少食物浪費並支援經濟弱勢家庭取得營養餐食。',
    orgKey: 'kaohsiung_hede',
    heroImageKey: 'project-hero-community-fridge',
    heroGallery: [
      { imageKey: 'project-hero-community-fridge', sortOrder: 0, isPrimary: true },
      { imageKey: 'project-hero-community-fridge-2', sortOrder: 1, isPrimary: false },
    ],
    fundraisingLicenseZh: '1141365173',
    projectDetailZh:
      '🍗 🍚 🥕 🥬 🍎 🍞\n\n「吃飽」是最基本的需求，卻仍有弱勢家庭與獨居長者為下一餐煩惱。根據調查，台灣每年每人約有 170 公斤的食物在生產、流通與消費端被浪費，同時卻有人吃不飽。\n\n' +
      '本專案透過社區冰箱與共享物資站，媒合剩食與需要的人，並培力志工協助配送與衛教。您的捐款將用於據點維護、保冷設備、清潔消毒與志工培訓，讓惜食與互助在巷弄發生。\n\n' +
      '我們也與學校、企業合作舉辦惜食講座，讓下一代從小理解食物得來不易。誠摯邀請您以定期或單次捐款支持，讓社區多一點溫度。',
    themes: [
      { theme: 'public_issues', sortOrder: 0 },
      { theme: 'community_development', sortOrder: 1 },
      { theme: 'poverty_relief', sortOrder: 2 },
    ],
  },
  {
    titleZh: '升降椅像翅膀，讓人生重新起飛',
    summaryZh: '協助脊髓損傷者居家無障礙改造，募款安裝升降椅與輔具。',
    orgKey: 'spinal_fund',
    heroImageKey: 'project-hero-lift-chair',
    fundraisingLicenseZh: '1130855120',
    projectDetailZh:
      '許多脊髓損傷朋友返家後，面臨門檻、浴室與臥房動線障礙，連「回到自己房間」都成奢望。本專案募款用於補助升降椅、無障礙坡道與抓桿等設施，並媒合職能治療建議與施工廠商。\n\n' +
      '每筆捐款都會進入專款專戶，由社工與復健團隊評估個案後核銷。我們也提供家屬諮詢與同儕支持活動，陪伴家庭度過改造期的不安。\n\n' +
      '邀請您支持無障礙不是奢侈品，而是每個人應有的尊嚴。',
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
    /** 略過示範團體列：主檔團體已由 organizationSeeds 各建一筆 groups，避免無 organizationId 無法進個人頁 */
    if (category === 'groups') {
      continue;
    }
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
  await prisma.charityOrganization.deleteMany();

  const orgIds = await seedOrganizations();

  for (const o of organizationSeeds) {
    await createItem({
      category: 'groups',
      titleZh: o.nameZh,
      summaryZh: groupListSummaryZh(o),
      logoKey: o.logoKey,
      organizationId: orgIds[o.key]!,
      themes: o.themes,
    });
  }

  for (const p of showcaseProducts) {
    await createProductItem({
      titleZh: p.titleZh,
      summaryZh: p.summaryZh,
      logoKey: DEMO_LOGO_KEY,
      organizationId: orgIds[p.orgKey]!,
      themes: p.themes,
      descriptionZh: p.descriptionZh,
      shippingFeeAmount: p.shippingFeeAmount,
      images: p.images,
      options: p.options,
    });
  }

  for (const p of showcaseProjects) {
    const orgName = organizationSeeds.find((o) => o.key === p.orgKey)?.nameZh ?? '主辦單位';
    await createDonationProject({
      titleZh: p.titleZh,
      summaryZh: p.summaryZh,
      logoKey: DEMO_LOGO_KEY,
      organizationId: orgIds[p.orgKey]!,
      organizationNameZh: organizationSeeds.find((o) => o.key === p.orgKey)?.nameZh,
      heroImageKey: p.heroImageKey,
      heroGallery: p.heroGallery,
      fundraisingLicenseZh: p.fundraisingLicenseZh,
      projectDetailZh: p.projectDetailZh,
      projectDisclaimerZh: defaultProjectDisclaimer(orgName),
      themes: p.themes,
    });
  }

  for (const r of extraRows()) {
    if (r.category === 'projects' && r.extraThemes != null) {
      await createDonationProject({
        titleZh: r.titleZh,
        summaryZh: r.summaryZh,
        logoKey: r.logoKey,
        organizationId: orgIds.extra_project_host!,
        organizationNameZh: r.organizationNameZh,
        heroImageKey: r.heroImageKey ?? null,
        fundraisingLicenseZh: `示範勸募字第${String(r.extraRowIndex).padStart(4, '0')}號`,
        projectDetailZh: `${r.summaryZh}\n\n此為自動產生之專案內文，供驗證捐款專案詳情頁、輪播與捐款設定表單。實際上線時請替換為法遵核准之完整說明與風險揭露。\n\n若您願意支持示範主辦單位，可選擇定期或單次捐款；扣款日與金額選項由本專案後台設定。`,
        projectDisclaimerZh: defaultProjectDisclaimer('示範主辦單位'),
        themes: r.extraThemes,
      });
    } else if (r.category === 'products') {
      const price = 100 + (r.extraRowIndex % 15) * 50;
      await createProductItem({
        titleZh: r.titleZh,
        summaryZh: r.summaryZh,
        logoKey: r.logoKey,
        organizationId: orgIds.extra_product_org!,
        themes: [{ theme: r.theme, sortOrder: 0 }],
        descriptionZh: `${r.summaryZh}\n-------\n此為大量測試資料自動產生之商品說明。`,
        images: [
          {
            imageKey: DEMO_LOGO_KEY,
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
