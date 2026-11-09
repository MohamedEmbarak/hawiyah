import {expect, test} from '@playwright/test';

for (const direction of ['ltr', 'rtl']) test(`tooltip logical placement and alignment in ${direction}`, async ({page}) => {
  await page.goto('/#component/tooltip');
  await page.locator('main').evaluate((main, direction) => {
    main.innerHTML = '<span id="tooltip-placement" class="hw-tooltip-anchor" style="margin:150px;width:160px;height:60px"><span class="hw-tooltip">Help</span></span>';
    main.setAttribute('dir', direction);
  }, direction);
  const anchor = page.locator('#tooltip-placement');
  const tooltip = anchor.locator('.hw-tooltip');
  for (const placement of ['top', 'bottom', 'start', 'end']) {
    for (const align of ['start', 'center', 'end']) {
      await tooltip.evaluate((node, values) => {
        node.setAttribute('data-placement', values.placement);
        node.setAttribute('data-align', values.align);
      }, {placement, align});
      const a = (await anchor.boundingBox())!;
      const b = (await tooltip.boundingBox())!;
      if (placement === 'top') expect(b.y + b.height).toBeLessThan(a.y);
      if (placement === 'bottom') expect(b.y).toBeGreaterThan(a.y + a.height);
      if ((placement === 'start' && direction === 'ltr') || (placement === 'end' && direction === 'rtl')) expect(b.x + b.width).toBeLessThan(a.x);
      if ((placement === 'end' && direction === 'ltr') || (placement === 'start' && direction === 'rtl')) expect(b.x).toBeGreaterThan(a.x + a.width);
      const horizontal = placement === 'top' || placement === 'bottom';
      const anchorStart = horizontal ? a.x : a.y;
      const tooltipStart = horizontal ? b.x : b.y;
      const anchorSize = horizontal ? a.width : a.height;
      const tooltipSize = horizontal ? b.width : b.height;
      const endAligned = horizontal && direction === 'rtl' ? align === 'start' : align === 'end';
      const offset = align === 'center' ? (anchorSize - tooltipSize) / 2 : endAligned ? anchorSize - tooltipSize : 0;
      expect(tooltipStart).toBeCloseTo(anchorStart + offset, 0);
    }
  }
});
