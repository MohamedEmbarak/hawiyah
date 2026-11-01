import { defineConfig } from '@playwright/test';
const frameworks=['react','vue','angular'];
export default defineConfig({
  testDir:'./tests/frameworks', outputDir:'./test-results/portals', workers:1,
  use:{screenshot:'only-on-failure',trace:'retain-on-failure',launchOptions:{executablePath:process.env.NASAQ_CHROMIUM}},
  projects:frameworks.map((name,index)=>({name,use:{baseURL:`http://127.0.0.1:${4181+index}`}})),
  webServer:frameworks.map((name,index)=>({command:`node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${4181+index} --strictPort --config examples/${name}/vite.config.ts`,url:`http://127.0.0.1:${4181+index}`,reuseExistingServer:!process.env.CI})),
});
