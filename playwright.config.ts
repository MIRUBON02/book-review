import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer:{
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  retries:process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: 'html', 

  projects: [
    {name: 'chromium', use: { ...devices['Desktop Chrome'] }},
  ],
});
