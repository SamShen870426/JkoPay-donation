import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 載入 `apps/bff/.env`，供整合測試讀取 `DATABASE_URL`（Vitest `setupFiles` 會先於測試檔執行） */
const bffRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: path.join(bffRoot, '.env') });
