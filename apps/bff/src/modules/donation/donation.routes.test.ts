import type { FastifyInstance } from 'fastify';
import type { DonationListResponse } from '@jkopay/contracts';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildDependencies } from '../../di/dependencies.js';
import { createApp } from '../../app.js';
import type { DonationService } from './donation.service.js';

describe('GET /api/v1/donation-items', () => {
  const list = vi.fn();
  let app: FastifyInstance;

  beforeAll(async () => {
    const donationService = { list } as unknown as DonationService;
    app = await createApp(buildDependencies({ donationService }), { logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it('缺少 category 時 400 與契約錯誤形狀', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/donation-items' });
    expect(res.statusCode).toBe(400);
    const body = res.json() as { error: string; message: string };
    expect(body.error).toBe('VALIDATION_ERROR');
    expect(body.message).toBe('Invalid query');
  });

  it('合法 query 時呼叫 service 並回傳 JSON', async () => {
    const payload: DonationListResponse = {
      items: [
        {
          id: '1',
          category: 'groups',
          title: 'A',
          description: 'B',
          imageUrl: 'https://example.com/i.png',
        },
      ],
      pageInfo: { nextCursor: null, hasMore: false },
    };
    list.mockResolvedValueOnce(payload);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/donation-items?category=groups&theme=animal_protection&limit=10&q=test',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(payload);
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'groups',
        theme: 'animal_protection',
        limit: 10,
        q: 'test',
      }),
    );
  });

  it('service 回傳不符合契約時 500', async () => {
    list.mockResolvedValueOnce({ items: [], pageInfo: {} } as unknown as DonationListResponse);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/donation-items?category=groups',
    });

    expect(res.statusCode).toBe(500);
    expect((res.json() as { error: string }).error).toBe('RESPONSE_CONTRACT_MISMATCH');
  });
});
