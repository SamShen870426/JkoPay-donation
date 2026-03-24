import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { buildDependencies } from '../../di/dependencies.js';

const run = process.env.RUN_INTEGRATION === '1';

/** 與 `donationListQuerySchema` 的 `limit` 上限一致（超過會 400，非 DB 問題） */
const PAGE_LIMIT = 50;

async function injectTotalItemCount(
  app: FastifyInstance,
  fixedQuery: Record<string, string>,
): Promise<number> {
  let total = 0;
  let cursor: string | undefined;
  for (;;) {
    const sp = new URLSearchParams(fixedQuery);
    sp.set('limit', String(PAGE_LIMIT));
    if (cursor) sp.set('cursor', cursor);
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/donation-items?${sp.toString()}`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      items: unknown[];
      pageInfo: { nextCursor: string | null; hasMore: boolean };
    };
    total += body.items.length;
    if (!body.pageInfo.hasMore) break;
    const next = body.pageInfo.nextCursor;
    expect(next).toBeTruthy();
    cursor = next as string;
  }
  return total;
}

/**
 * 真實 MySQL + Prisma + Fastify inject（不 mock Service／Repository）。
 * 需：`RUN_INTEGRATION=1`、已 migrate + seed（見根目錄 `prisma:setup`）。
 */
describe.skipIf(!run)('Donation API — DB integration', () => {
  let prisma: PrismaClient;
  let app: FastifyInstance;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    const deps = buildDependencies({ prisma });
    app = await createApp(deps, { logger: false });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('GET 列表：筆數與 Prisma count（groups）一致', async () => {
    const expected = await prisma.donationItem.count({ where: { category: 'groups' } });
    expect(expected).toBeGreaterThan(0);

    const total = await injectTotalItemCount(app, { category: 'groups' });
    expect(total).toBe(expected);
  });

  it('GET 列表：theme=animal_protection 與 DB 篩選筆數一致', async () => {
    const expected = await prisma.donationItem.count({
      where: { category: 'groups', theme: 'animal_protection' },
    });
    expect(expected).toBeGreaterThan(0);

    const total = await injectTotalItemCount(app, {
      category: 'groups',
      theme: 'animal_protection',
    });
    expect(total).toBe(expected);
  });

  it('GET 搜尋：關鍵字命中 seed 標題', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/donation-items?category=groups&q=${encodeURIComponent('兒童福利')}`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { items: Array<{ title: string }> };
    expect(body.items.some((i) => i.title.includes('兒童福利'))).toBe(true);
  });

  it('keyset 分頁：第二頁 cursor 不接續重複 id', async () => {
    const total = await prisma.donationItem.count({ where: { category: 'groups' } });
    expect(total).toBeGreaterThanOrEqual(3);

    const first = await app.inject({
      method: 'GET',
      url: `/api/v1/donation-items?category=groups&limit=2`,
    });
    expect(first.statusCode).toBe(200);
    const b1 = first.json() as {
      items: Array<{ id: string }>;
      pageInfo: { nextCursor: string | null; hasMore: boolean };
    };
    expect(b1.pageInfo.hasMore).toBe(true);
    expect(b1.pageInfo.nextCursor).toBeTruthy();

    const second = await app.inject({
      method: 'GET',
      url: `/api/v1/donation-items?category=groups&limit=2&cursor=${b1.pageInfo.nextCursor}`,
    });
    expect(second.statusCode).toBe(200);
    const b2 = second.json() as { items: Array<{ id: string }> };
    const firstIds = new Set(b1.items.map((i) => i.id));
    for (const it of b2.items) {
      expect(firstIds.has(it.id)).toBe(false);
    }
  });

  it('缺少 category 仍回 400 契約錯誤', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/donation-items' });
    expect(res.statusCode).toBe(400);
    const body = res.json() as { error: string };
    expect(body.error).toBe('VALIDATION_ERROR');
  });
});
