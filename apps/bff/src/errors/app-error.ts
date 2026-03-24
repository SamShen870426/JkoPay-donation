/**
 * 可預期的 BFF 業務／驗證錯誤，由全域 errorHandler 轉成標準 JSON。
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
