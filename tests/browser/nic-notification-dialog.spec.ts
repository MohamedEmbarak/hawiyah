import {expect, test} from '@playwright/test';

const formats = [
  ['vanilla','javascript','ar'], ['vanilla','typescript','en'],
  ['react','javascript','en'], ['react','typescript','ar'],
  ['vue','javascript','ar'], ['vue','typescript','en'], ['angular','typescript','ar'],
] as const;

for (const [framework,language,locale] of formats) {
  test(`${framework} ${language} notification dialog actions, Escape and focus in ${locale}`, async ({page}) => {
    test.setTimeout(300000);
    await page.addInitScript(locale => {
      if (window === window.top) localStorage.setItem('hawiyah-locale', locale);
    }, locale);
    await page.goto('/#component/dialog');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:60000});
    const region = page.frameLocator('.hw-ide-frame').locator('[data-notice-project]');
    const outcome = region.locator('[data-notice-outcome]');
    for (const [tone, variants] of [
      ['success',['primary']], ['info',[]], ['warning',['primary','secondary']],
      ['danger',['primary','secondary']], ['neutral',['secondary']],
    ] as const) await test.step(tone, async () => {
      const opener = region.locator(`[data-notice-open="${tone}"]`);
      const dialog = region.locator('dialog[open]');
      const open = async () => {
        await opener.click();
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAccessibleName(await opener.innerText());
        expect(await dialog.evaluate(element => element.matches(':modal'))).toBe(true);
        const message = dialog.locator('.hw-dialog-body p');
        await expect(message).not.toBeEmpty();
        await expect(dialog).toHaveAccessibleDescription(await message.innerText());
      };
      await open();
      await expect(dialog.locator('[data-notice-action]')).toHaveCount(variants.length);
      const glyph = await dialog.locator('.hw-dialog-header').evaluate(header => {
        const badge = getComputedStyle(header,'::before');
        return [badge.width,badge.height];
      });
      expect(glyph).toEqual(['48px','48px']);
      const lastOutcome = await outcome.textContent();
      await dialog.locator('.hw-dialog-header button').press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
      await expect(outcome).toHaveText(lastOutcome || '');
      for (const [index,variant] of variants.entries()) {
        await open();
        const action = dialog.locator('[data-notice-action]').nth(index);
        expect(await action.getAttribute('data-variant')).toBe(variant);
        const label = await action.innerText();
        await action.click();
        await expect(dialog).toHaveCount(0);
        await expect(outcome).toHaveText(label);
        await expect(opener).toBeFocused();
      }
      await open();
      await dialog.getByRole('button',{name:locale === 'ar' ? 'إغلاق الإشعار' : 'Close notification'}).click();
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
    });
    expect(new URL(page.url()).hash).toBe('#component/dialog');
  });
}

for (const locale of ['ar','en'] as const) test(`notification ready examples at desktop and 320px in ${locale}`, async ({page}) => {
  test.setTimeout(120000);
  await page.addInitScript(locale => {
    if (window === window.top) localStorage.setItem('hawiyah-locale', locale);
  }, locale);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#component/dialog');
  const group = page.locator('#component-examples [data-notice-project]');
  await expect(group.locator('[data-notice-open]')).toHaveCount(5);
  const opener = group.locator('[data-notice-open="warning"]');
  for (const width of [1440,320]) {
    await page.setViewportSize({width,height:900});
    await opener.click();
    const dialog = group.getByRole('dialog');
    await expect(dialog).toHaveCSS('animation-name','none');
    await expect(dialog).toHaveCSS('border-inline-start-width','4px');
    const bounds = await dialog.boundingBox();
    expect(bounds?.width).toBe(width === 320 ? 260 : 500);
    const footer = dialog.locator('footer');
    await expect(footer).toHaveCSS('gap','12px');
    await expect(footer).toHaveCSS('flex-direction', width === 320 ? 'column' : 'row');
    if (width === 320) {
      const actions = await footer.locator('button').all();
      const [first,second] = await Promise.all(actions.map(button => button.boundingBox()));
      expect(first && second && first.x === second.x && first.y < second.y).toBe(true);
    }
    await footer.locator('button').last().click();
    await expect(opener).toBeFocused();
  }
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await opener.click();
  const dialog = group.getByRole('dialog');
  await expect(dialog).toHaveCSS('border-inline-start-width','4px');
  const visibleIcon = await dialog.locator('.hw-dialog-header').evaluate(header => {
    const icon = getComputedStyle(header,'::after');
    return icon.maskImage !== 'none' && icon.backgroundColor !== 'rgba(0, 0, 0, 0)';
  });
  expect(visibleIcon).toBe(true);
  await dialog.locator('.hw-dialog-header button').press('Escape');
  await expect(opener).toBeFocused();
});

test('calendar and search dialogs keep their own headers', async ({page}) => {
  await page.goto('/#component/date-picker');
  const picker = page.locator('[data-hw="date-picker"]').first();
  await picker.locator('[data-hw-date-trigger]').click();
  const calendar = picker.locator('dialog');
  await expect(calendar).toBeVisible();
  expect(await calendar.locator('.hw-dialog-header').evaluate(header => getComputedStyle(header,'::before').width)).not.toBe('48px');
  await calendar.locator('.hw-dialog-header button').press('Escape');
  await expect(calendar).toBeHidden();
  await page.goto('/#component/search-field');
  const modal = page.locator('[data-search-demo="modal"]').first();
  await modal.locator('[data-search-demo-open]').click();
  const search = modal.locator('dialog');
  await expect(search).toBeVisible();
  expect(await search.evaluate(element => element.matches('[data-variant="notification"], hw-dialog[data-variant="notification"] > dialog'))).toBe(false);
  await search.locator('input[type="search"]').press('Escape');
  await expect(search).toBeHidden();
  await expect(modal.locator('[data-search-demo-open]')).toBeFocused();
});
