import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    setupFiles: ['src/test/integration-setup.ts'],
    fileParallelism: false,
    /** 大量 groups（工具 bulk 種子）時，逐頁加總會超過 30s */
    hookTimeout: 180_000,
    testTimeout: 180_000,
  },
});
