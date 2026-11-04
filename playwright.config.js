import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 5000 },
  use: { baseURL: 'http://127.0.0.1:5184', reducedMotion: 'reduce', trace: 'retain-on-failure', actionTimeout: 10_000, navigationTimeout: 15_000 },
  webServer: [
    { command: 'npm run build && npm run preview -- --port 5184 --strictPort', url: 'http://127.0.0.1:5184', reuseExistingServer: false },
    { command: 'npm run dev -- --port 5185 --strictPort', url: 'http://127.0.0.1:5185', reuseExistingServer: false },
  ],
});
