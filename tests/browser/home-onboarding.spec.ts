import {expect, test} from '@playwright/test';

for (const locale of ['ar', 'en']) test(`homepage source onboarding and JavaScript branding in ${locale}`, async ({page}, testInfo) => {
  await page.addInitScript(locale => {
    localStorage.setItem('nasaq-locale', locale);
    localStorage.setItem('nasaq-mode', 'light');
  }, locale);
  await page.goto('/#overview');
  await expect(page.locator('.home-experience')).toBeVisible();
  await expect(page.locator('[name="home-accent"], [data-home-compact], [data-home-round]')).toHaveCount(0);
  await expect(page.locator('[data-home-stage]')).toHaveAttribute('data-nq-theme', 'dga');
  expect(await page.locator('[data-home-stage]').evaluate(node => (node as HTMLElement).style.getPropertyValue('--nq-radius-md'))).toBe('');
  await page.locator('[data-home-continue]').click();
  await expect(page.locator('[data-home-progress]')).toContainText('2');
  const sourceCommands = page.locator('.home-install > .home-terminal code');
  await expect(sourceCommands).toContainText('git clone https://github.com/MohamedEmbarak/nasaq.git');
  await expect(sourceCommands).toContainText('corepack enable');
  await expect(sourceCommands).toContainText('pnpm install --frozen-lockfile');
  await expect(sourceCommands).toContainText('pnpm build:packages');
  expect(await page.locator('.home-install > .home-terminal button').getAttribute('data-copy')).toBe(await sourceCommands.textContent());
  await expect(page.locator('#home-framework-vanilla')).toHaveText('JavaScript');
  await expect(page.locator('#home-framework-vanilla [data-framework-icon="javascript"]')).toHaveCount(1);
  for (const framework of ['react', 'vue', 'angular', 'vanilla']) {
    await page.locator(`#home-framework-${framework}`).click();
    await expect(sourceCommands).toContainText(framework === 'vanilla' ? 'pnpm dev' : `pnpm --filter @nasaq/example-${framework} dev`);
    await page.locator('.home-consumer-setup summary').click();
    const install = page.locator('.home-consumer-setup code').first();
    for (const name of ['tokens', 'styles', 'core', framework]) await expect(install).toContainText(`../nasaq/.artifacts/package-check/nasaq-${name}-0.2.0.tgz`);
  }
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
