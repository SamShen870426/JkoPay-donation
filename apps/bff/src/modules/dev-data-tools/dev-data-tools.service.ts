import { createHash, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import {
  internalDataToolsRequestSchema,
  internalDataToolsResponseSchema,
} from '@jkopay/contracts';
import {
  bulkSeedCharityDemo,
  seedOrganizationRange,
  wipeAllCharityData,
} from '../../dev-seed/bulk-charity-seed.js';

export class DevDataToolsService {
  constructor(private readonly prisma: PrismaClient) {}

  static getConfiguredSecret(): string | undefined {
    const s = process.env.DEV_DATA_TOOLS_SECRET?.trim();
    return s != null && s.length > 0 ? s : undefined;
  }

  private static secretMatches(expected: string, received: string): boolean {
    const he = createHash('sha256').update(expected, 'utf8').digest();
    const hr = createHash('sha256').update(received, 'utf8').digest();
    return he.length === hr.length && timingSafeEqual(he, hr);
  }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const configured = DevDataToolsService.getConfiguredSecret();
    if (configured == null) {
      reply.code(404).send();
      return;
    }

    const parsed = internalDataToolsRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({ error: 'VALIDATION_ERROR', message: 'Invalid body' });
      return;
    }

    const body = parsed.data;
    if (!DevDataToolsService.secretMatches(configured, body.secret)) {
      reply.code(403).send({ error: 'FORBIDDEN', message: '密鑰錯誤' });
      return;
    }

    if (body.mode === 'wipe') {
      await wipeAllCharityData(this.prisma);
      const payload = {
        ok: true as const,
        mode: 'wipe' as const,
        wiped: true,
        bulkSeeded: false,
      };
      const out = internalDataToolsResponseSchema.safeParse(payload);
      if (!out.success) {
        reply.code(500).send({ error: 'INTERNAL', message: 'Response contract mismatch' });
        return;
      }
      reply.code(200).send(out.data);
      return;
    }

    if (body.mode === 'wipe_and_bulk_seed') {
      await wipeAllCharityData(this.prisma);
      const r = await bulkSeedCharityDemo(this.prisma, body.organizationCount);
      const payload = {
        ok: true as const,
        mode: 'wipe_and_bulk_seed' as const,
        wiped: true,
        bulkSeeded: true,
        organizationCount: body.organizationCount,
        organizationsCreated: r.organizationsCreated,
        donationItemsCreated: r.donationItemsCreated,
      };
      const out = internalDataToolsResponseSchema.safeParse(payload);
      if (!out.success) {
        reply.code(500).send({ error: 'INTERNAL', message: 'Response contract mismatch' });
        return;
      }
      reply.code(200).send(out.data);
      return;
    }

    // bulk_seed_batch
    const totalOrganizationCount = body.totalOrganizationCount!;
    const batchIndex = body.batchIndex!;
    const batchSize = body.batchSize;
    const rangeStart = batchIndex * batchSize + 1;
    const rangeEnd = Math.min((batchIndex + 1) * batchSize, totalOrganizationCount);

    let wiped = false;
    if (body.wipeFirst && batchIndex === 0) {
      await wipeAllCharityData(this.prisma);
      wiped = true;
    }

    if (rangeStart > rangeEnd || rangeStart > totalOrganizationCount) {
      const payload = {
        ok: true as const,
        mode: 'bulk_seed_batch' as const,
        wiped,
        bulkSeeded: false,
        totalOrganizationCount,
        batchIndex,
        batchSize,
        rangeStart,
        rangeEnd,
        batchDone: true,
        organizationsCreated: 0,
        donationItemsCreated: 0,
      };
      const out = internalDataToolsResponseSchema.safeParse(payload);
      if (!out.success) {
        reply.code(500).send({ error: 'INTERNAL', message: 'Response contract mismatch' });
        return;
      }
      reply.code(200).send(out.data);
      return;
    }

    const r = await seedOrganizationRange(this.prisma, rangeStart, rangeEnd);
    const batchDone = rangeEnd >= totalOrganizationCount;
    const payload = {
      ok: true as const,
      mode: 'bulk_seed_batch' as const,
      wiped,
      bulkSeeded: true,
      totalOrganizationCount,
      batchIndex,
      batchSize,
      rangeStart,
      rangeEnd,
      batchDone,
      ...(batchDone ? {} : { nextBatchIndex: batchIndex + 1 }),
      organizationsCreated: r.organizationsCreated,
      donationItemsCreated: r.donationItemsCreated,
    };
    const out = internalDataToolsResponseSchema.safeParse(payload);
    if (!out.success) {
      reply.code(500).send({ error: 'INTERNAL', message: 'Response contract mismatch' });
      return;
    }
    reply.code(200).send(out.data);
  }
}
