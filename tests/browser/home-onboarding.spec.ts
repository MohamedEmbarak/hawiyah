import {expect, test} from '@playwright/test';

for (const locale of ['ar', 'en']) test(`homepage source onboarding and JavaScript branding in ${locale}`, async ({page}, testInfo) => {
  await page.addInitScript(locale => {
    localStorage.setItem('hawiyah-locale', locale);
    localStorage.setItem('hawiyah-mode', 'light');
  }, locale);
  await page.goto('/#overview');
  await expect(page.locator('.home-experience')).toBeVisible();
  await expect(page.locator('[name="home-accent"], [data-home-compact], [data-home-round]')).toHaveCount(0);
  await expect(page.locator('[data-home-stage]')).toHaveAttribute('data-hw-theme', 'dga');
  expect(await page.locator('[data-home-stage]').evaluate(node => (node as HTMLElement).style.getPropertyValue('--hw-radius-md'))).toBe('');
  await page.locator('[data-home-continue]').click();
  await expect(page.locator('[data-home-progress]')).toContainText('2');
  const npmPanel = page.locator('#home-install-npm');
  const sourcePanel = page.locator('#home-install-source');
  await expect(npmPanel).toBeVisible();
  await expect(sourcePanel).toBeHidden();
  await expect(page.locator('#home-install-tab-npm')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#home-framework-vanilla')).toHaveText('JavaScript');
  await expect(page.locator('#home-framework-vanilla [data-framework-icon="javascript"]')).toHaveCount(1);
  for (const framework of ['react', 'vue', 'angular', 'vanilla']) {
    await page.locator(`#home-framework-${framework}`).click();
    const install = npmPanel.locator('.home-terminal code').first();
    await expect(install).toHaveText(`npm install @hawiyah/styles @hawiyah/${framework}`);
    expect(await npmPanel.locator('.home-terminal button').first().getAttribute('data-copy')).toBe(await install.textContent());
  }
  await page.locator('#home-install-tab-source').click();
  await expect(sourcePanel).toBeVisible();
  await expect(npmPanel).toBeHidden();
  const sourceCommands = sourcePanel.locator('.home-terminal code');
  await expect(sourceCommands).toContainText('git clone https://github.com/MohamedEmbarak/hawiyah.git');
  await expect(sourceCommands).toContainText('corepack enable');
  await expect(sourceCommands).toContainText('pnpm install --frozen-lockfile');
  await expect(sourceCommands).toContainText('pnpm build:packages');
  await expect(sourceCommands).toContainText('pnpm dev');
  await page.locator('#home-framework-react').click();
  await expect(page.locator('#home-install-tab-source')).toHaveAttribute('aria-selected', 'true');
  await expect(sourcePanel.locator('.home-terminal code')).toContainText('pnpm --filter @hawiyah/example-react dev');
  await page.locator('#home-framework-vanilla').click();
  await page.screenshot({path: testInfo.outputPath(`homepage-${locale}.png`), fullPage: true});
  await page.setViewportSize({width: 390, height: 844});
  const quickstart = page.locator('.home-quickstart');
  await expect(quickstart).toBeVisible();
  expect(await quickstart.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  await quickstart.screenshot({path: testInfo.outputPath(`homepage-quickstart-mobile-${locale}.png`)});
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/#docs/vanilla');
  await expect(page.locator('main h1')).toContainText('JavaScript');
  await expect(page.locator('main h1 [data-framework-icon="javascript"]')).toHaveCount(1);
  await expect(page.locator('.sidebar a[href="#docs/vanilla"]')).toContainText('JavaScript');
  await expect(page.locator('.sidebar a[href="#docs/vanilla"] [data-framework-icon="javascript"]')).toHaveCount(1);
});
