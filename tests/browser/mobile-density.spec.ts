import {expect, test} from '@playwright/test';

for (const direction of ['rtl', 'ltr']) {
  test(`mobile sizing retains states, theme scopes and multiline content in ${direction}`, async ({page}) => {
    await page.setViewportSize({width:320, height:800});
    await page.goto('/#foundations');
    await page.locator('#main').evaluate((main, direction) => {
      main.innerHTML = `<section id="mobile-sizing" dir="${direction}" data-hw-density="mobile" style="inline-size:100%;min-inline-size:0">
        <input class="hw-input" aria-label="Default" value="هوية Hawiyah">
        <input class="hw-input" data-size="sm" data-variant="filled" aria-label="Filled" value="هوية">
        <input class="hw-input" data-size="lg" readonly aria-label="Read only" value="Hawiyah">
        <input class="hw-input" disabled aria-label="Disabled">
        <input class="hw-input" aria-invalid="true" aria-label="Invalid">
        <select class="hw-select" data-size="sm" aria-label="Select"><option>هوية Hawiyah</option></select>
        <button class="hw-button" data-size="sm">حفظ</button><button class="hw-button">Save</button><button class="hw-button" data-size="lg">حفظ</button>
        <textarea class="hw-textarea" aria-label="Multiline">First line\nسطر ثان</textarea>
        <div data-hw-density="compact"><input id="compact-field" class="hw-input" aria-label="Compact"></div>
        <div data-hw-density="comfortable"><input id="comfortable-field" class="hw-input" aria-label="Comfortable"></div>
        <input id="custom-field" class="hw-input" style="--hw-control-height:3.5rem" aria-label="Custom">
      </section>`;
    }, direction);
    const scope=page.locator('#mobile-sizing');
    for (const theme of ['dga','hawiyah','custom']) {
      for (const mode of ['light','dark']) {
        await scope.evaluate((node, values) => {node.setAttribute('data-hw-theme', values.theme); node.setAttribute('data-hw-mode', values.mode);}, {theme,mode});
        for (const field of await scope.locator(':scope > .hw-input:not(#custom-field), :scope > .hw-select').all()) {
          expect((await field.boundingBox())!.height).toBe(44);
          expect(await field.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
        }
        const heights=await scope.locator(':scope > .hw-button').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
        expect(heights).toEqual([32,40,44]);
        expect((await scope.locator('textarea').boundingBox())!.height).toBeGreaterThanOrEqual(96);
        expect((await page.locator('#compact-field').boundingBox())!.height).toBe(32);
        expect((await page.locator('#comfortable-field').boundingBox())!.height).toBe(40);
        expect((await page.locator('#custom-field').boundingBox())!.height).toBe(56);
      }
    }
    const readonly=scope.locator('[readonly]'); await readonly.focus();
    await expect(readonly).toHaveCSS('outline-style','solid');
    await scope.locator('input').first().evaluate(node => (node as HTMLElement).style.fontSize='40px');
    expect((await scope.locator('input').first().boundingBox())!.height).toBeGreaterThan(44);
  });
}
