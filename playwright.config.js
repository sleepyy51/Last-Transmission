import { defineConfig } from '@playwright/test'

const port = 4174

// Uses the locally installed Google Chrome so no browser download is needed.
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `http://127.0.0.1:${port}/Last-Transmission/`,
    channel: 'chrome',
  },
  projects: [
    { name: 'desktop' },
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 667 } },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/Last-Transmission/`,
    reuseExistingServer: !process.env.CI,
  },
})
