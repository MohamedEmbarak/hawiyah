import {expect,test} from '@playwright/test';

test('fresh guide defaults to DGA and nested custom resets legacy palette and geometry',async({page})=>{
  await page.goto('/#foundations');
  await expect(page.locator('html')).toHaveAttribute('data-nq-theme','dga');
  await page.locator('#main').evaluate(main=>main.insertAdjacentHTML('beforeend',`<div id="theme-scope" data-nq-theme="nasaq"><button class="nq-button" id="legacy-theme-button">Legacy</button><div data-nq-theme="custom"><button class="nq-button" id="custom-theme-button">Custom</button><input class="nq-input" id="nested-input" aria-label="Nested input"></div></div>`));
  await expect(page.locator('#legacy-theme-button')).toHaveCSS('background-color','rgb(0, 106, 100)');
  await expect(page.locator('#custom-theme-button')).toHaveCSS('background-color','rgb(27, 131, 84)');
  await expect(page.locator('#nested-input')).toHaveCSS('border-radius','4px');
  await page.locator('#theme-scope').evaluate(node=>node.setAttribute('data-nq-mode','dark'));
  await expect(page.locator('#custom-theme-button')).toHaveCSS('background-color','rgb(27, 131, 84)');
  await expect(page.locator('#nested-input')).toHaveCSS('background-color','rgb(31, 42, 55)');
});

test('explicit Nasaq preference survives visits and DGA input focus does not shift layout',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('nasaq-theme','nasaq'));
  await page.goto('/#foundations');
  await expect(page.locator('html')).toHaveAttribute('data-nq-theme','nasaq');
  await page.locator('#theme-select').selectOption('dga');
  const input=page.locator('#main input.nq-input').first();
  const before=await input.boundingBox();
  await input.focus();
  await expect(input).toBeFocused();
  const after=await input.boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  await page.emulateMedia({reducedMotion:'reduce'});
  const duration=await input.evaluate(node=>getComputedStyle(node).transitionDuration);
  expect(duration.split(',').every(value=>parseFloat(value)<=0.00001)).toBe(true);
});

for (const mode of ['light', 'dark']) {
  test(`filled readonly fields retain a single keyboard focus cue in ${mode} mode`, async ({page}) => {
    await page.goto('/#foundations');
    await page.locator('#main').evaluate((main, mode) => main.insertAdjacentHTML('beforeend', `<section id="readonly-regression" data-nq-theme="dga" data-nq-mode="${mode}"><button id="before-readonly">Before fields</button><input id="readonly-input" class="nq-input" data-variant="filled" readonly value="نسق" aria-label="Read-only name"><textarea id="readonly-textarea" class="nq-textarea" data-variant="filled" readonly aria-invalid="true" aria-label="Read-only details">Details</textarea><button id="after-readonly">After fields</button></section>`), mode);
    await page.locator('#before-readonly').focus();
    for (const id of ['readonly-input', 'readonly-textarea']) {
      await page.keyboard.press('Tab');
      const field = page.locator(`#${id}`);
      await expect(field).toBeFocused();
      await expect(field).toHaveCSS('background-size', '0% 2px');
      await expect(field).toHaveCSS('box-shadow', 'none');
      await expect(field).toHaveCSS('outline-width', '2px');
      await expect(field).toHaveCSS('outline-style', 'solid');
      await expect(field).toHaveCSS('outline-offset', '-2px');
    }
    await page.keyboard.press('Tab'); await expect(page.locator('#after-readonly')).toBeFocused();
    await page.emulateMedia({forcedColors: 'active'});
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#readonly-textarea')).toBeFocused();
    await expect(page.locator('#readonly-textarea')).toHaveCSS('outline-width', '2px');
    await expect(page.locator('#readonly-textarea')).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('#readonly-textarea')).toHaveCSS('background-image', 'none');
  });
}

test('unvalidated filled fields stay neutral and explicit errors red without an outer focus ring', async ({page}) => {
  await page.goto('/#foundations');
  await page.locator('#main').evaluate(main => main.insertAdjacentHTML('beforeend', '<section data-nq-theme="dga"><input id="editable-filled" class="nq-input" data-variant="filled" aria-label="Editable name"><input id="invalid-filled" class="nq-input" data-variant="filled" aria-invalid="true" aria-label="Invalid name"></section>'));
  for (const id of ['editable-filled', 'invalid-filled']) {
    const field = page.locator(`#${id}`); await field.focus();
    await expect(field).toHaveCSS('background-size', '100% 2px');
    await expect(field).toHaveCSS('outline-style', 'none');
    const result = await field.evaluate(node => {
      const style = getComputedStyle(node);
      const probe = document.createElement('span');
      probe.style.color = node.getAttribute('aria-invalid') === 'true' ? 'var(--nq-color-danger)' : 'var(--nq-color-border-strong)';
      node.parentElement!.append(probe);
      const color = getComputedStyle(probe).color; probe.remove();
      return {background: style.backgroundImage, color};
    });
    expect(result.background).toContain(result.color);
  }
});

test('readonly range sliders allow Tab and Shift+Tab in both directions', async ({page}) => {
  await page.goto('/#components');
  const range = page.locator('[data-nq="range-slider"]').first();
  await range.evaluate(root => {
    root.setAttribute('data-nq-readonly', 'true');
    root.insertAdjacentHTML('beforebegin', '<button id="before-range">Before range</button>');
    root.insertAdjacentHTML('afterend', '<button id="after-range">After range</button>');
  });
  const lower = range.locator('[data-nq-lower]'); const upper = range.locator('[data-nq-upper]');
  const initial = await lower.inputValue();
  for (const direction of ['rtl', 'ltr']) {
    await range.evaluate((root, direction) => root.setAttribute('dir', direction), direction);
    await page.locator('#before-range').focus();
    await page.keyboard.press('Tab'); await expect(lower).toBeFocused();
    await page.keyboard.press('ArrowRight'); await expect(lower).toHaveValue(initial);
    await page.keyboard.press('Tab'); await expect(upper).toBeFocused();
    await page.keyboard.press('Shift+Tab'); await expect(lower).toBeFocused();
    await page.keyboard.press('Shift+Tab'); await expect(page.locator('#before-range')).toBeFocused();
    await upper.focus(); await page.keyboard.press('Tab'); await expect(page.locator('#after-range')).toBeFocused();
  }
});
