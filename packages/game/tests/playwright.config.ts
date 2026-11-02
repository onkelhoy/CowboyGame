import { defineConfig, devices } from '@playwright/test';
import path from "node:path";
import { fileURLToPath } from 'node:url';

// Resolve the directory name and base path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: __dirname,

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // reporter, with output path for HTML reports.
  reporter: [
    process.env.CI ? ['github', {
      open: 'never',
      outputFolder: path.join(__dirname, 'test-reports'),
    }] : ['html', {
      open: 'never',
      outputFolder: path.join(__dirname, 'test-reports'),
    }],
  ],

  outputDir: path.join(__dirname, "test-results"),

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://localhost:3500/',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },


  // Pure logic needs no browser, the page gets a Chromium smoke test.
  projects: [
    {
      name: 'logic',
      testMatch: /logic\/.*\.test\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /ui\/.*\.test\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npx @papit/build && npx @papit/server --port=3500',
    url: 'http://localhost:3500/views/game/',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
