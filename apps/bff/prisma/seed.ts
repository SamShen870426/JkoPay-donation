import {
  PrismaClient,
  DonationCategory,
  CharityTheme,
} from '@prisma/client';
import { CHARITY_THEME_VALUES } from '@jkopay/contracts';

const prisma = new PrismaClient();

const DEMO_LOGO_KEY = '/donation-demo-logo.png';

const rows: Array<{
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
  {
    category: 'projects',
    theme: 'education_advocacy',
    titleZh: '偏鄉閱讀計畫',
    summaryZh: '為偏鄉學校建置圖書角與說故事志工。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'projects',
    theme: 'animal_protection',
    titleZh: '流浪動物醫療專案',
    summaryZh: '募集結紮與疫苗經費，降低流浪動物數量。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'products',
    theme: 'child_youth_care',
    titleZh: '愛心義賣帆布袋',
    summaryZh: '義賣所得全數捐贈兒童福利團體。',
    logoKey: DEMO_LOGO_KEY,
  },
];

function extraRows(): typeof rows {
  const out: typeof rows = [];
  const categories: DonationCategory[] = ['groups', 'projects', 'products'];
  const themes = CHARITY_THEME_VALUES;
  for (let i = 1; i <= 40; i += 1) {
    const category = categories[i % 3]!;
    const theme = themes[i % themes.length]!;
    out.push({
      category,
      theme,
      titleZh: `示範${category === 'groups' ? '團體' : category === 'projects' ? '專案' : '商品'} ${i}`,
      summaryZh: `自動產生測試資料 #${i}，方便驗證無限滾動與分類過濾。`,
      logoKey: DEMO_LOGO_KEY,
    });
  }
  return out;
}

async function main() {
  await prisma.donationItem.deleteMany();
  const all = [...rows, ...extraRows()];
  for (const r of all) {
    await prisma.donationItem.create({ data: r });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
