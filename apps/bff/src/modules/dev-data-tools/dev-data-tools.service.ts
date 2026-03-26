import { createHash, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import {
  internalDataToolsRequestSchema,
  internalDataToolsResponseSchema,
} from '@jkopay/contracts';
import { bulkSeedCharityDemo, wipeAllCharityData } from '../../dev-seed/bulk-charity-seed.js';

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

    const { secret, mode, organizationCount } = parsed.data;
    if (!DevDataToolsService.secretMatches(configured, secret)) {
      reply.code(403).send({ error: 'FORBIDDEN', message: '密鑰錯誤' });
      return;
    }

    await wipeAllCharityData(this.prisma);

    let bulkSeeded = false;
    let organizationsCreated: number | undefined;
    let donationItemsCreated: number | undefined;
    let orgCountOut: number | undefined;

    if (mode === 'wipe_and_bulk_seed') {
      const r = await bulkSeedCharityDemo(this.prisma, organizationCount);
      bulkSeeded = true;
      orgCountOut = organizationCount;
      organizationsCreated = r.organizationsCreated;
      donationItemsCreated = r.donationItemsCreated;
    }

    const payload = {
      ok: true as const,
      mode,
      wiped: true,
      bulkSeeded,
      ...(orgCountOut != null ? { organizationCount: orgCountOut } : {}),
      ...(organizationsCreated != null ? { organizationsCreated } : {}),
      ...(donationItemsCreated != null ? { donationItemsCreated } : {}),
    };

    const out = internalDataToolsResponseSchema.safeParse(payload);
    if (!out.success) {
      reply.code(500).send({ error: 'INTERNAL', message: 'Response contract mismatch' });
      return;
    }
    reply.code(200).send(out.data);
  }
}
