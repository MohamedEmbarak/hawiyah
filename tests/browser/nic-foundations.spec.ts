import {expect, test} from '@playwright/test';
import {frameWidth} from './support/preview-frame';

// Computed font-size and line-height from the pinned NIC global.css, lines 427–606.
const scale: Record<string, [number, number]> = {
  'display-2xl':[72,90], 'display-xl':[60,72], 'display-lg':[48,60], 'display-md':[36,44],
  'display-sm':[30,38], 'display-xs':[24,32], 'heading-lg':[20,30], 'heading-md':[18,28],
  'heading-sm':[16,24], 'body-xl':[20,30], 'body-lg':[18,28], 'body-md':[16,24], 'body-sm':[14,20], 'body-xs':[12,14],
};

for (const width of [390,1280]) {
  test('foundations guide exposes the type scale and complete excerpt at ' + width + 'px', async ({page}) => {
    test.setTimeout(120000);
    await page.setViewportSize({width, height:900});
    await page.goto('/#foundations');
    const html = page.locator('html');
    const section = page.locator('.foundation-recipes');
    for (const locale of ['ar','en'] as const) {
      if (locale === 'en') {
        await page.locator('.topbar [data-action="locale"]').click();
        await page.locator('.topbar [data-action="mode"]').click();
      }
      await expect(html).toHaveAttribute('lang',locale);
      await expect(html).toHaveAttribute('dir',locale === 'ar' ? 'rtl' : 'ltr');
      await expect(html).toHaveAttribute('data-nq-mode',locale === 'ar' ? 'light' : 'dark');
      const disclosure = section.locator(':scope > details > summary');
      await disclosure.press('Enter');
      const styles = await section.locator('.foundation-scale-list .nq-type').evaluateAll(nodes =>
        Object.fromEntries(nodes.map(node => {
          const style = getComputedStyle(node);
          return [node.getAttribute('data-scale'),[parseFloat(style.fontSize),parseFloat(style.lineHeight)]];
        })));
      expect(Object.keys(styles)).toEqual(Object.keys(scale));
      for (const [name,[size, leading]] of Object.entries(scale)) {
        expect(styles[name][0],name + ' size').toBeCloseTo(size,2);
        expect(styles[name][1],name + ' line height').toBeCloseTo(leading,2);
      }
      const excerpt = section.locator('.foundation-excerpt');
      const clamp = excerpt.locator('.nq-line-clamp'), full = excerpt.locator('details p');
      const text = (await full.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(50);
      await expect(clamp).toHaveText(text);
      expect(await clamp.ariaSnapshot()).toContain(text);
      const clipped = await clamp.evaluate(node => ({
        lines:getComputedStyle(node).webkitLineClamp,
        height:node.clientHeight, full:node.scrollHeight, line:parseFloat(getComputedStyle(node).lineHeight),
      }));
      expect(clipped.lines).toBe('2');
      expect(clipped.height).toBeCloseTo(2 * clipped.line,0);
      expect(clipped.full).toBeGreaterThan(clipped.height);
      await excerpt.locator('summary').press('Enter');
      await expect(full).toBeVisible();
      await expect(full).toHaveText(text);
      const shadows = await section.locator('.foundation-elevations > div').evaluateAll(nodes =>
        nodes.map(node => getComputedStyle(node).boxShadow));
      expect(shadows).toHaveLength(7);
      expect(new Set(shadows).size).toBe(7);
      expect(shadows).not.toContain('none');
      const geometry = await section.evaluate(node => {
        const style = getComputedStyle(node);
        const root = node.ownerDocument.documentElement;
        return [root.scrollWidth - root.clientWidth, ...['--nq-space-0-5','--nq-space-1-5','--nq-width-xxs','--nq-width-paragraph','--nq-radius-none'].map(token => {
          const value = style.getPropertyValue(token).trim();
          return value.endsWith('rem') ? parseFloat(value) : NaN;
        })];
      });
      expect(geometry).toEqual([0,0.125,0.375,20,45,0]);
    }
    for (const theme of ['nasaq','custom','dga']) {
      await page.locator('#theme-select').selectOption(theme);
      await expect(html).toHaveAttribute('data-nq-theme',theme);
      await expect(section).toBeVisible();
      expect(await html.evaluate(node => node.scrollWidth - node.clientWidth)).toBe(0);
    }
    await page.locator('#direction-select').selectOption('rtl');
    await expect(html).toHaveAttribute('lang','en');
    await expect(html).toHaveAttribute('dir','rtl');
    expect(await section.evaluate(node => getComputedStyle(node).direction)).toBe('rtl');
  });
}

const light: Record<string,string> = {neutral:'rgb(210, 214, 219)',primary:'rgb(27, 131, 84)',gold:'rgb(245, 189, 2)',tertiary:'rgb(128, 81, 159)'};
for (const framework of ['vanilla','react','vue','angular'] as const) {
  test(framework + ' Divider renders four tones and a visible logical vertical rule', async ({page}) => {
    test.setTimeout(150000);
    await page.setViewportSize({width:1450,height:920});
    await page.goto('/#component/divider');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if (framework !== 'angular') await page.locator('[data-project-language]').selectOption('typescript');
    await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
    const project = page.frameLocator('.nq-ide-frame').locator('[data-divider-examples]');
    await expect(project).toBeVisible();
    const rules = project.getByRole('separator');
    await expect(rules).toHaveCount(5);
    for (const width of [390,1280]) {
      await frameWidth(page,project,width);
      for (const dir of ['rtl','ltr']) {
        await project.evaluate((node, direction) => { (node as HTMLElement).dir=direction; },dir);
        const rendered = await rules.evaluateAll(nodes => nodes.map(node => {
          const style = getComputedStyle(node), box = node.getBoundingClientRect();
          return {tone:node.getAttribute('data-tone')!, orientation:node.getAttribute('aria-orientation'),
            width:box.width,height:box.height,stroke:style.borderBlockStartWidth,edge:style.borderInlineStartWidth,
            color:style.borderBlockStartColor,edgeColor:style.borderInlineStartColor};
        }));
        for (const rule of rendered.slice(0,4)) {
          expect(rule.width).toBeGreaterThan(100); expect(rule.height).toBe(1);
          expect(rule.stroke).toBe('1px'); expect(rule.color).toBe(light[rule.tone]);
        }
        const vertical = rendered[4];
        expect(vertical.orientation).toBe('vertical');
        expect(vertical.width).toBe(1); expect(vertical.height).toBeGreaterThanOrEqual(16);
        expect(vertical.edge).toBe('1px'); expect(vertical.edgeColor).toBe(light.primary);
        expect(await project.evaluate(node => node.ownerDocument.documentElement.scrollWidth - node.ownerDocument.documentElement.clientWidth)).toBe(0);
      }
    }
    // The guide rebuilds the preview with both its requested mode and CSS color-scheme.
    await page.locator('.topbar [data-action="mode"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-nq-mode','dark');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if (framework !== 'angular') await page.locator('[data-project-language]').selectOption('typescript');
    await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
    await expect(rules.nth(2)).toHaveCSS('border-block-start-color','rgb(248, 211, 108)');
    await expect(rules.nth(3)).toHaveCSS('border-block-start-color','rgb(208, 182, 228)');
    await page.emulateMedia({forcedColors:'active'});
    const canvasText = await project.evaluate(node => {
      const probe=node.ownerDocument.createElement('span'); probe.style.color='CanvasText';
      node.append(probe); const color=getComputedStyle(probe).color; probe.remove(); return color;
    });
    await expect(rules.nth(2)).toHaveCSS('border-block-start-color',canvasText);
    await expect(rules.nth(4)).toHaveCSS('border-inline-start-color',canvasText);
    await expect(page).toHaveURL(/#component\/divider$/);
  });
}
