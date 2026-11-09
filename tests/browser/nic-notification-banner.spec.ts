import { expect, test, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.configure({timeout: 180000});

async function exerciseBanner(example: Locator) {
  const region = example.locator('.hw-toast-region');
  const count = example.locator('[data-toast-count]');
  const restore = example.locator('[data-toast-restore]');
  const notice = (id: string) => region.locator(`[data-hw-toast="${id}"]`);
  const dismiss = (id: string) => notice(id).getByRole('button');
  await expect(region).toHaveAttribute('data-variant', 'banner');
  await expect(region).toHaveAttribute('data-position', 'inline');
  await expect(region).toHaveCSS('position', 'static');
  await expect(region.locator('[data-hw-live="polite"][role="status"] .hw-toast')).toHaveCount(4);
  await expect(region.locator('[data-hw-live="assertive"][role="alert"] .hw-toast')).toHaveCount(1);
  await expect(region.locator('.hw-toast-icon[aria-hidden="true"]')).toHaveCount(5);
  for (const tone of ['neutral', 'info', 'success', 'warning', 'danger']) {
    await expect(region.locator(`[data-tone="${tone}"]`)).toBeVisible();
  }
  await expect(notice('maintenance').getByRole('button')).toHaveCount(0);
  await expect(count).toHaveText('5');

  // An app-issued click on a notice that did not own focus should preserve the user's place.
  await restore.focus();
  await dismiss('review').evaluate(button => (button as HTMLButtonElement).click());
  await expect(count).toHaveText('4');
  await expect(restore).toBeFocused();
  await restore.click();
  await expect(count).toHaveText('5');

  for (const [id, next, remaining] of [
    ['documents', 'saved', 4], ['saved', 'review', 3], ['review', 'failed', 2], ['failed', '', 1],
  ] as const) {
    await dismiss(id).press('Enter');
    await expect(count).toHaveText(String(remaining));
    await expect(notice(id)).toBeHidden();
    if (next) await expect(dismiss(next)).toBeFocused(); else await expect(region).toBeFocused();
  }
  await expect(notice('maintenance')).toBeVisible();
  await restore.click();
  await expect(count).toHaveText('5');
  await expect(region.locator('[data-hw-toast]:visible')).toHaveCount(5);
}

async function fixedFrame(page: Page, example: Locator, width: number, direction: 'ltr' | 'rtl') {
  await example.evaluate((el, {width, direction}) => {
    document.querySelector('[data-test-toast-frame]')?.remove();
    const frame = document.createElement('iframe');
    frame.title = 'Isolated notification position'; frame.dataset.testToastFrame = '';
    frame.style.cssText = `position:fixed;inset:0 auto auto 0;width:${width}px;max-width:none;height:700px;border:0;z-index:10000`;
    document.body.append(frame);
    const doc = frame.contentDocument!;
    doc.documentElement.dir = direction;
    doc.documentElement.lang = document.documentElement.lang;
    doc.documentElement.dataset.hwTheme = 'dga';
    doc.documentElement.dataset.hwMode = 'light';
    for (const node of document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style,link[rel="stylesheet"]')) {
      const style = node.cloneNode(true) as HTMLStyleElement | HTMLLinkElement;
      if (node instanceof HTMLLinkElement) (style as HTMLLinkElement).href = node.href;
      doc.head.append(style);
    }
    const region = el.querySelector('.hw-toast-region')!.cloneNode(true) as HTMLElement;
    region.removeAttribute('data-position');
    // Measure the single-banner presentation used by the source fixture.
    region.querySelectorAll('[data-hw-toast]').forEach(notice => {
      if ((notice as HTMLElement).dataset.hwToast !== 'saved') notice.remove();
    });
    doc.body.append(region);
  }, {width, direction});
  const frame = page.frameLocator('iframe[data-test-toast-frame]');
  const region = frame.locator('.hw-toast-region');
  const notice = frame.locator('.hw-toast');
  await expect(region).toHaveCSS('position', 'fixed');
  await notice.evaluate(async element => {
    await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
  });
  const geometry = await notice.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return {left: rect.left, right: rect.right, top: rect.top, width: rect.width, viewport: element.ownerDocument.defaultView!.innerWidth};
  });
  const narrow = width <= 576;
  expect(geometry.viewport).toBe(width);
  expect(geometry.top).toBeCloseTo(narrow ? 70 : 80, 0);
  expect(geometry.width).toBeCloseTo(narrow ? width - 20 : 450, 0);
  expect(direction === 'rtl' ? geometry.left : width - geometry.right).toBeCloseTo(narrow ? 10 : 20, 0);
  await expect(notice).toHaveCSS('border-radius', '0px');
  await expect(notice).toHaveCSS('border-bottom-width', '2px');
  await expect(notice).toHaveCSS('padding-inline-start', '24px');
  await expect(notice).toHaveCSS('padding-block-start', '16px');
  await expect(notice.locator('.hw-toast-icon')).toHaveCSS('width', '20px');
  return {frame, notice};
}

for (const locale of ['ar', 'en'] as const) {
  test(`five localized notification banners dismiss, restore and fit the viewport in ${locale}`, async ({page}) => {
    await page.addInitScript(language => {
      if (window === window.top) { localStorage.setItem('hawiyah-locale', language); localStorage.setItem('hawiyah-mode', 'light'); }
    }, locale);
    await page.setViewportSize({width: 1440, height: 1000});
    await page.goto('/#component/toast-region');
    const example = page.locator('#component-examples [data-toast-demo]');
    await expect(example).toBeVisible({timeout: 45000});
    await exerciseBanner(example);
    const region = example.locator('.hw-toast-region');
    await expect(region).toHaveAccessibleName(locale === 'ar' ? 'إشعارات الخدمة' : 'Service notices');
    const masks = await region.locator('.hw-toast-icon').evaluateAll(icons => icons.map(icon => getComputedStyle(icon).maskImage));
    expect(masks).not.toContain('none');
    expect(new Set(masks).size).toBe(5);
    await expect(region.locator('.hw-toast').first()).toHaveCSS('animation-duration', '0.3s');
    for (const mode of ['light', 'dark']) {
      await example.evaluate((node, mode) => { node.setAttribute('data-hw-mode', mode); (node as HTMLElement).style.background = 'var(--hw-color-surface)'; }, mode);
      expect((await new AxeBuilder({page}).include('#component-examples [data-toast-demo]').analyze()).violations).toEqual([]);
      const close = region.locator('.hw-toast-dismiss').first();
      const art = await close.evaluate(async button => {
        await Promise.all(button.getAnimations().map(animation => animation.finished.catch(() => {})));
        const probe = button.ownerDocument.createElement('span');
        probe.hidden = true; probe.style.color = 'var(--hw-color-text)'; button.append(probe);
        const neutral = getComputedStyle(probe).color;
        probe.remove();
        const glyph = getComputedStyle(button, '::before');
        return {width: glyph.width, height: glyph.height, mask: glyph.maskImage, color: glyph.backgroundColor, neutral};
      });
      expect([art.width, art.height]).toEqual(['20px', '20px']);
      expect(art.mask).not.toBe('none');
      expect(art.color).toBe(art.neutral);
    }
    // Exercise both directions even when language and direction differ.
    for (const width of [1180, 390, 320]) for (const direction of ['ltr', 'rtl'] as const) {
      await fixedFrame(page, example, width, direction);
    }
    const override = page.frameLocator('iframe[data-test-toast-frame]').locator('.hw-toast-region');
    await override.evaluate(el => (el as HTMLElement).style.setProperty('--hw-toast-header-offset', '96px'));
    await expect(override).toHaveCSS('top', '96px');
    await override.evaluate(el => el.setAttribute('data-position', 'bottom-start'));
    await expect(override).toHaveCSS('bottom', '10px');
    await expect(override).toHaveCSS('right', '10px');
    await page.emulateMedia({reducedMotion: 'reduce', forcedColors: 'active'});
    const {notice} = await fixedFrame(page, example, 390, 'rtl');
    await expect(notice).toHaveCSS('animation-name', 'none');
    await notice.getByRole('button').focus();
    await expect(notice.getByRole('button')).toBeFocused();
    await expect(page).toHaveURL(/#component\/toast-region$/);
  });
}

for (const [framework, languages] of Object.entries({
  vanilla: ['javascript', 'typescript'], react: ['javascript', 'typescript'], vue: ['javascript', 'typescript'], angular: ['typescript'],
})) for (const language of languages) {
  test(`${framework} ${language} notification project uses its native dismissal and restore path`, async ({page}) => {
    await page.setViewportSize({width: 1600, height: 1000});
    await page.goto('/#component/toast-region');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 90000});
    const example = page.frameLocator('.hw-ide-frame').locator('[data-toast-demo]');
    await exerciseBanner(example);
    await page.setViewportSize({width: 390, height: 844});
    // The editor frame reflows after the page resize; check the settled layout.
    await expect.poll(() => example.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await expect(page).toHaveURL(/#component\/toast-region$/);
  });
}
