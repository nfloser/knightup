import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  use: {
    launchOptions: process.env.CI
      ? {}
      : { executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] },
    baseURL: "http://127.0.0.1:4173/knightup/",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173/knightup/",
    reuseExistingServer: !process.env.CI,
  },
});
