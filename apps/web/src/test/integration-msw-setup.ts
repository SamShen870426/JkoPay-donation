import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { mswServer } from './msw-server.js';

class IoStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeAll(() => {
  globalThis.IntersectionObserver = IoStub as unknown as typeof IntersectionObserver;
  mswServer.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
