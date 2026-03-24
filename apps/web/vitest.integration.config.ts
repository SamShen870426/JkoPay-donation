import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify('http://bff.test'),
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.integration.test.{ts,tsx}'],
    setupFiles: ['src/test/integration-msw-setup.ts'],
    restoreMocks: true,
  },
});
