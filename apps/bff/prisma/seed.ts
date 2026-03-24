import { PrismaClient, DonationCategory } from '@prisma/client';

const prisma = new PrismaClient();

/** 示範資料共用圖：放在 `apps/web/public/`，API 回傳給前端的為絕對路徑（同源）。 */
const DEMO_LOGO_KEY = '/donation-demo-logo.png';

const rows: Array<{
  category: DonationCategory;
  titleZh: string;
  summaryZh: string;
  logoKey: string;
}> = [
  {
    category: 'groups',
    titleZh: '財團法人流浪動物基金會',
    summaryZh: '致力於流浪動物醫療、收容與教育推廣。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'groups',
    titleZh: '兒童福利聯盟',
    summaryZh: '關注兒少權益，提供急難救助與心理支持。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'groups',
    titleZh: '環境保護協會',
    summaryZh: '推動淨灘、減塑與社區環境教育。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'projects',
    titleZh: '偏鄉閱讀計畫',
    summaryZh: '為偏鄉學校建置圖書角與說故事志工。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'projects',
    titleZh: '流浪動物醫療專案',
    summaryZh: '募集結紮與疫苗經費，降低流浪動物數量。',
    logoKey: DEMO_LOGO_KEY,
  },
  {
    category: 'products',
    titleZh: '愛心義賣帆布袋',
    summaryZh: '義賣所得全數捐贈兒童福利團體。',
    logoKey: DEMO_LOGO_KEY,
  },
];

function extraRows(): typeof rows {
  const out: typeof rows = [];
  const categories: DonationCategory[] = ['groups', 'projects', 'products'];
  for (let i = 1; i <= 40; i += 1) {
    const category = categories[i % 3]!;
    out.push({
      category,
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
