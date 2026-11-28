import { expect, test } from '@playwright/test';
import { box, keyboardFocus, openCase, section } from './support';

// TOOLTIP-04: the Angular tooltip is positioned against the hw-tooltip host for
// the placement / alignment combinations (top, bottom, start, end with start,
// center, end), in LTR and RTL.
test.use({ viewport: { width: 1400, height: 1100 } });

for (const lang of ['en', 'ar'] as const) {
  test(`TOOLTIP-04 angular: the tooltip is placed and aligned against the hw-tooltip host (${lang === 'ar' ? 'RTL' : 'LTR'})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openCase(page, 'TOOLTIP-04', { lang, adapters: ['angular'] });
    const rtl = lang === 'ar';
    for (const placement of ['top', 'bottom', 'start', 'end']) {
      for (const align of ['start', 'center', 'end']) {
        const host = section(page, 'angular').locator(`hw-tooltip[data-fixture-tooltip="${placement}-${align}"]`);
        const trigger = host.getByRole('button');
        const tooltip = host.locator('.hw-tooltip');
        await keyboardFocus(page, trigger);
        await expect(tooltip).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id') as string);
        const a = await box(host);
        const b = await box(tooltip);
        const label = `${placement}-${align}`;
        if (placement === 'top') expect(b.bottom, label).toBeLessThan(a.top);
        if (placement === 'bottom') expect(b.top, label).toBeGreaterThan(a.bottom);
        if ((placement === 'start' && !rtl) || (placement === 'end' && rtl)) expect(b.right, label).toBeLessThan(a.left);
        if ((placement === 'end' && !rtl) || (placement === 'start' && rtl)) expect(b.left, label).toBeGreaterThan(a.right);
        const horizontal = placement === 'top' || placement === 'bottom';
        const anchorStart = horizontal ? a.left : a.top;
        const tooltipStart = horizontal ? b.left : b.top;
        const anchorSize = horizontal ? a.width : a.height;
        const tooltipSize = horizontal ? b.width : b.height;
        const endAligned = horizontal && rtl ? align === 'start' : align === 'end';
        const offset = align === 'center' ? (anchorSize - tooltipSize) / 2 : endAligned ? anchorSize - tooltipSize : 0;
        expect(tooltipStart, label).toBeCloseTo(anchorStart + offset, 0);
        await page.keyboard.press('Escape');
        await expect(tooltip).toBeHidden();
      }
    }
  });
}
