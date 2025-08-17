import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer:{
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000, // 120秒待つ
  },
  retries:process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: 'html', 

  projects: [
    {name: 'chromium', use: { ...devices['Desktop Chrome'] }},
  ],
});
