import {expect, test} from '@playwright/test';
import {frameWidth} from './support/preview-frame';

const combinations = [
  ['vanilla', 'javascript', 'ar'], ['vanilla', 'typescript', 'en'],
  ['react', 'javascript', 'ar'], ['react', 'typescript', 'en'],
  ['vue', 'javascript', 'en'], ['vue', 'typescript', 'ar'],
  ['angular', 'typescript', 'ar'],
] as const;

for (const [framework, language, locale] of combinations) {
  test(`grouped PortalHeader works at desktop and mobile widths in ${framework} ${language} ${locale}`, async ({page}) => {
    test.setTimeout(150000);
    await page.setViewportSize({width: 1500, height: 960});
    await page.addInitScript(lang => {if (window === window.top) localStorage.setItem('nasaq-locale', lang);}, locale);
    await page.goto('/#component/portal-header');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
    await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 45000});
    const frame = page.frameLocator('.nq-ide-frame');
    const header = frame.locator('.nq-portal-header').first();
    await expect(header).toBeVisible();
    const toggle = header.locator('.nq-portal-menu-toggle');
    const nav = header.locator('nav:has(.nq-portal-branch)');
    const branches = nav.locator('details[data-nq-portal-branch]');
    const first = branches.first(), second = branches.nth(1);
    const summary = first.locator(':scope > summary'), secondSummary = second.locator(':scope > summary');
    const panel = first.locator('.nq-portal-branch-panel');
    const overview = panel.locator(':scope > .nq-portal-branch-overview');
    const direct = nav.locator(':scope > ul > li > a').first();

    await frameWidth(page, header, 1100);
    expect(await header.evaluate(node => getComputedStyle(node).direction)).toBe(locale === 'ar' ? 'rtl' : 'ltr');
    await expect(toggle).toBeHidden();
    await expect(branches).toHaveCount(2);
    await expect(direct).toBeVisible();
    await expect(first).toHaveAttribute('data-current', 'true');
    await expect(summary).not.toHaveAttribute('aria-current', 'page');
    await summary.press('Enter');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS('position', 'absolute');
    await expect(overview).toHaveAttribute('href', /.+/);
    await expect(panel.locator('.nq-portal-branch-group a[aria-current="page"]')).toHaveCount(1);
    const size = await panel.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return {left: rect.left, right: rect.right, viewport: element.ownerDocument.documentElement.clientWidth};
    });
    expect(size.left).toBeGreaterThanOrEqual(-1); expect(size.right).toBeLessThanOrEqual(size.viewport + 1);
    await secondSummary.press('Space');
    await expect(panel).toBeHidden();
    await expect(second.locator('.nq-portal-branch-panel')).toBeVisible();
    await second.locator('a').first().press('Escape');
    await expect(secondSummary).toBeFocused();
    await expect(second.locator('.nq-portal-branch-panel')).toBeHidden();

    await frameWidth(page, header, 390);
    await expect(toggle).toBeVisible();
    await expect(nav).toBeHidden();
    await toggle.press('Enter');
    await expect(nav).toBeVisible();
    await summary.press('Enter');
    await expect(panel).toHaveCSS('position', 'static');
    await expect(overview).toBeVisible();
    await overview.press('Escape');
    await expect(summary).toBeFocused();
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await summary.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(nav).toBeHidden();

    await toggle.press('Space');
    await summary.press('Space');
    const docUrl = await header.evaluate(node => node.ownerDocument.URL);
    await overview.press('Enter');
    await expect(nav).toBeHidden();
    expect(await header.evaluate(node => node.ownerDocument.URL)).toBe(docUrl);
    await page.emulateMedia({reducedMotion: 'reduce', forcedColors: 'active'});
    await toggle.press('Enter');
    await summary.focus();
    expect(await summary.evaluate(node => getComputedStyle(node, '::after').transitionDuration)).toBe('0s');
    expect(await summary.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe('none');
    await expect(page).toHaveURL(/#component\/portal-header$/);
    await expect(page.locator('.nq-ide-console')).not.toContainText(/Failed to resolve component|\[error\]/);
  });
}

test('catalog header keeps its open panel and links reachable in a narrow card', async ({page}, info) => {
  test.setTimeout(120000);
  await page.setViewportSize({width: 1400, height: 920});
  await page.goto('/#components', {waitUntil: 'domcontentloaded'});
  const card = page.locator('.component-card').filter({has: page.locator('.component-card-title a[href="#component/portal-header"]')});
  const first = card.locator('details[data-nq-portal-branch]').first();
  const summary = first.locator('summary'), panel = first.locator('.nq-portal-branch-panel');
  await summary.scrollIntoViewIfNeeded();
  await summary.press('Enter');
  await expect(panel).toBeVisible();
  const fit = await panel.evaluate(node => {
    const card = node.closest('.component-card')!.getBoundingClientRect(), bounds = node.getBoundingClientRect();
    return {cardWidth: card.width, left: bounds.left - card.left, right: card.right - bounds.right};
  });
  expect(fit.cardWidth).toBeLessThan(600);
  expect(fit.left).toBeGreaterThanOrEqual(-1);
  expect(fit.right).toBeGreaterThanOrEqual(-1);
  const link = panel.locator('a').last();
  await link.scrollIntoViewIfNeeded();
  expect(await link.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const hit = node.ownerDocument.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return node.contains(hit);
  })).toBe(true);
  await info.attach('open header in catalog', {body: await card.screenshot(), contentType: 'image/png'});
  await link.press('Escape');
  await expect(summary).toBeFocused();
  await expect(page).toHaveURL(/#components$/);
});
