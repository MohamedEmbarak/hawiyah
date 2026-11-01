import {expect, test} from '@playwright/test';

for (const direction of ['rtl', 'ltr']) {
  test(`mobile sizing retains states, theme scopes and multiline content in ${direction}`, async ({page}) => {
    await page.setViewportSize({width:320, height:800});
    await page.goto('/#foundations');
    await page.locator('#main').evaluate((main, direction) => {
      main.innerHTML = `<section id="mobile-sizing" dir="${direction}" data-nq-density="mobile" style="inline-size:100%;min-inline-size:0">
        <input class="nq-input" aria-label="Default" value="نسق Nasaq">
        <input class="nq-input" data-size="sm" data-variant="filled" aria-label="Filled" value="نسق">
        <input class="nq-input" data-size="lg" readonly aria-label="Read only" value="Nasaq">
        <input class="nq-input" disabled aria-label="Disabled">
        <input class="nq-input" aria-invalid="true" aria-label="Invalid">
        <select class="nq-select" data-size="sm" aria-label="Select"><option>نسق Nasaq</option></select>
        <button class="nq-button" data-size="sm">حفظ</button><button class="nq-button">Save</button><button class="nq-button" data-size="lg">حفظ</button>
        <textarea class="nq-textarea" aria-label="Multiline">First line\nسطر ثان</textarea>
        <div data-nq-density="compact"><input id="compact-field" class="nq-input" aria-label="Compact"></div>
        <div data-nq-density="comfortable"><input id="comfortable-field" class="nq-input" aria-label="Comfortable"></div>
        <input id="custom-field" class="nq-input" style="--nq-control-height:3.5rem" aria-label="Custom">
      </section>`;
    }, direction);
    const scope=page.locator('#mobile-sizing');
    for (const theme of ['dga','nasaq','custom']) {
      for (const mode of ['light','dark']) {
        await scope.evaluate((node, values) => {node.setAttribute('data-nq-theme', values.theme); node.setAttribute('data-nq-mode', values.mode);}, {theme,mode});
        for (const field of await scope.locator(':scope > .nq-input:not(#custom-field), :scope > .nq-select').all()) {
          expect((await field.boundingBox())!.height).toBe(44);
          expect(await field.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
        }
        const heights=await scope.locator(':scope > .nq-button').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
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
