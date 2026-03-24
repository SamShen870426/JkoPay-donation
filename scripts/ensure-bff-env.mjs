import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, 'apps', 'bff', '.env');
const examplePath = path.join(root, 'apps', 'bff', '.env.example');

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(examplePath, envPath);
  console.log('[ensure-bff-env] 已建立 apps/bff/.env（由 .env.example 複製）');
}
