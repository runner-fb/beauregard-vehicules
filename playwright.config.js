const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  webServer: process.env.LOCAL_TEST_SERVER ? { command:'python3 -m http.server 8765 --directory frontend', url:'http://127.0.0.1:8765/', reuseExistingServer:true } : undefined,
  timeout: 180000,
  expect: { timeout: 10000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/results.xml' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://runner-fb.github.io/beauregard-vehicules/',
    trace: 'retain-on-failure', screenshot: 'only-on-failure', video: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? 'off' : 'retain-on-failure'
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}}:{}) } },
    { name: 'android-mobile', use: { ...devices['Pixel 7'], ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}}:{}) } },
    { name: 'iphone-mobile', use: { ...devices['iPhone 13'] } }
  ]
});
