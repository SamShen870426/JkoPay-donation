import { describe, expect, it } from 'vitest';
import { DonationApiError, throwDonationErrorFromBody } from './donation-api-error.js';

function res(status: number): Response {
  return { status } as Response;
}

describe('throwDonationErrorFromBody', () => {
  it('符合 apiErrorBody 時丟 DonationApiError 並帶 code／details', () => {
    const text = JSON.stringify({
      error: 'VALIDATION_ERROR',
      message: 'Invalid query',
      details: { fieldErrors: {} },
    });
    expect(() => throwDonationErrorFromBody(res(400), text)).toThrow(DonationApiError);
    try {
      throwDonationErrorFromBody(res(400), text);
    } catch (e) {
      expect(e).toBeInstanceOf(DonationApiError);
      const err = e as DonationApiError;
      expect(err.errorCode).toBe('VALIDATION_ERROR');
      expect(err.message).toBe('Invalid query');
      expect(err.httpStatus).toBe(400);
      expect(err.details).toEqual({ fieldErrors: {} });
    }
  });

  it('非契約 JSON 時降級為 HTTP_ERROR', () => {
    expect(() => throwDonationErrorFromBody(res(502), 'bad gateway')).toThrow(DonationApiError);
    try {
      throwDonationErrorFromBody(res(502), 'bad gateway');
    } catch (e) {
      expect(e).toBeInstanceOf(DonationApiError);
      const err = e as DonationApiError;
      expect(err.errorCode).toBe('HTTP_ERROR');
      expect(err.httpStatus).toBe(502);
    }
  });

  it('空 body 仍丟 HTTP_ERROR', () => {
    try {
      throwDonationErrorFromBody(res(500), '');
    } catch (e) {
      expect(e).toBeInstanceOf(DonationApiError);
      expect((e as DonationApiError).errorCode).toBe('HTTP_ERROR');
    }
  });
});
