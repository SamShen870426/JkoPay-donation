import 'dotenv/config';
import { buildDependencies } from './di/dependencies.js';
import { createApp } from './app.js';

const deps = buildDependencies();
const app = await createApp(deps);

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
