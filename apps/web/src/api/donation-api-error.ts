import { apiErrorBodySchema } from '@jkopay/contracts';

export class DonationApiError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly httpStatus: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'DonationApiError';
  }
}

function parseJsonText(text: string): unknown | null {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** 已讀取過 body `text` 的失敗回應（fetch 的 Response 僅能讀 body 一次） */
export function throwDonationErrorFromBody(res: Response, text: string): never {
  const json = parseJsonText(text);
  const parsed = apiErrorBodySchema.safeParse(json);
  if (parsed.success) {
    throw new DonationApiError(
      parsed.data.error,
      parsed.data.message,
      res.status,
      parsed.data.details,
    );
  }
  throw new DonationApiError(
    'HTTP_ERROR',
    text.slice(0, 200) || `Request failed with ${res.status}`,
    res.status,
  );
}
