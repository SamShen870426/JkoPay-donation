import type { PrismaClient } from '@prisma/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildDependencies } from '../di/dependencies.js';
import { createApp } from '../app.js';

describe('POST /api/v1/internal/data-tools', () => {
  const prevSecret = process.env.DEV_DATA_TOOLS_SECRET;

  afterEach(() => {
    if (prevSecret === undefined) delete process.env.DEV_DATA_TOOLS_SECRET;
    else process.env.DEV_DATA_TOOLS_SECRET = prevSecret;
  });

  it('未設定 DEV_DATA_TOOLS_SECRET 時不註冊路由（404）', async () => {
    delete process.env.DEV_DATA_TOOLS_SECRET;
    const deleteMany = vi.fn();
    const prisma = {
      donationItem: { deleteMany },
      charityOrganization: { deleteMany },
    } as unknown as PrismaClient;
    const app = await createApp(buildDependencies({ prisma }), { logger: false });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/internal/data-tools',
      payload: { secret: 'x', mode: 'wipe' },
    });
    expect(res.statusCode).toBe(404);
    expect(deleteMany).not.toHaveBeenCalled();
    await app.close();
  });

  it('密鑰錯誤時 403', async () => {
    process.env.DEV_DATA_TOOLS_SECRET = 'unit-test-secret';
    const deleteMany = vi.fn();
    const prisma = {
      donationItem: { deleteMany },
      charityOrganization: { deleteMany },
    } as unknown as PrismaClient;
    const app = await createApp(buildDependencies({ prisma }), { logger: false });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/internal/data-tools',
      payload: { secret: 'wrong', mode: 'wipe' },
    });
    expect(res.statusCode).toBe(403);
    expect(deleteMany).not.toHaveBeenCalled();
    await app.close();
  });

  it('wipe 時清空 donation_items 與 charity_organizations', async () => {
    process.env.DEV_DATA_TOOLS_SECRET = 'unit-test-secret';
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      donationItem: { deleteMany },
      charityOrganization: { deleteMany },
    } as unknown as PrismaClient;
    const app = await createApp(buildDependencies({ prisma }), { logger: false });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/internal/data-tools',
      payload: { secret: 'unit-test-secret', mode: 'wipe' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { ok: boolean; wiped: boolean; bulkSeeded: boolean };
    expect(body.ok).toBe(true);
    expect(body.wiped).toBe(true);
    expect(body.bulkSeeded).toBe(false);
    expect(deleteMany).toHaveBeenCalledTimes(2);
    await app.close();
  });
});
