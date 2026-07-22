import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Load .env (if present) so local runs pick up DATABASE_URL without extra tooling.
// In CI, DATABASE_URL is provided by the workflow and no .env exists.
function loadDotEnv(): Record<string, string> {
  try {
    const raw = readFileSync(new URL('./.env', import.meta.url), 'utf8');
    const out: Record<string, string> = {};
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return out;
  } catch {
    return {};
  }
}

const dotenv = loadDotEnv();
for (const [k, v] of Object.entries(dotenv)) {
  if (process.env[k] === undefined) process.env[k] = v;
}

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@config': fileURLToPath(new URL('./config', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    globalSetup: ['tests/integration/globalSetup.ts'],
    // A single shared database — run test files serially for deterministic isolation checks.
    fileParallelism: false,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
    },
  },
});
