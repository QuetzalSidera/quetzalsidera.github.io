import { defineConfig } from '@playwright/test'

const port = 3101

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `NEXT_DIST_DIR=.next-playwright pnpm exec next dev --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/content-layout-fixture/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
