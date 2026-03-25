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

const productRows: Array<{
  category: DonationCategory;
  theme: CharityTheme;
  titleZh: string;
  summaryZh: string;
  logoKey: string;
}> = [
  {
    category: 'products',
    theme: 'child_youth_care',
    titleZh: '愛心義賣帆布袋',
    summaryZh: '義賣所得全數捐贈兒童福利團體。',
    logoKey: DEMO_LOGO_KEY,
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

  for (const r of productRows) {
    await createItem({
      category: r.category,
      titleZh: r.titleZh,
      summaryZh: r.summaryZh,
      logoKey: r.logoKey,
      themes: [{ theme: r.theme, sortOrder: 0 }],
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
