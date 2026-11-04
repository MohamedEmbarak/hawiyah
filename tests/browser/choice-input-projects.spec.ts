import {expect, test, type Locator} from '@playwright/test';

const projects = [
  ['vanilla','javascript','ar'], ['vanilla','typescript','en'],
  ['react','javascript','en'], ['react','typescript','ar'],
  ['vue','javascript','ar'], ['vue','typescript','en'], ['angular','typescript','ar'],
] as const;

async function submitted(form: Locator, name: string) {
  return form.evaluate((element, key) => new FormData(element as HTMLFormElement).getAll(key), name);
}

for (const [framework, language, locale] of projects) {
  test(`${framework} ${language} supports keyboard editing, form submission and reset in four structured inputs`, async ({page}) => {
    test.setTimeout(300000);
    await page.addInitScript(locale => { if (window === window.top) localStorage.setItem('nasaq-locale', locale); }, locale);
    const ar = locale === 'ar';
    for (const id of ['combobox', 'pin-input', 'tag-input', 'multi-select'] as const) await test.step(id, async () => {
      await page.goto(`/#component/${id}`);
      await page.locator('[data-guide-tab="playground"]').click();
      await page.locator('[data-project-framework]').selectOption(framework);
      if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
      await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state', 'ready', {timeout:45000});
      const form = page.frameLocator('.nq-ide-frame').locator(`form[data-choice-input-project="${id}"]`);
      const model = form.locator('[data-model]'), result = form.locator('[data-submitted]');
      const city = ar ? 'جدة' : 'Jeddah', topic = ar ? 'التقارير' : 'Reports';
      const name = {combobox:'city', 'pin-input':'code', 'tag-input':'tags', 'multi-select':'offices'}[id];
      const initial = id === 'pin-input' ? ['0123'] : id === 'tag-input' ? [topic] : ['riyadh'];
      await expect(form).toBeVisible();
      expect(await submitted(form, name)).toEqual(initial);
      const edit = id === 'combobox' ? form.getByRole('combobox') : id === 'multi-select' ? form.getByRole('searchbox') : form.getByRole('textbox');
      let values: string[];
      if (id === 'combobox') {
        await edit.fill(city);
        await expect(edit).toHaveAttribute('aria-expanded','true');
        expect(await submitted(form, name)).toEqual(['']);
        await edit.press('ArrowDown'); await edit.press('Enter');
        await expect(edit).toHaveValue(city);
        await expect(edit).toHaveAttribute('aria-expanded','false');
        values = ['jeddah'];
      } else if (id === 'pin-input') {
        await expect(edit).toHaveAttribute('autocomplete','one-time-code');
        await edit.fill('٠٤٥٦'); await expect(edit).toHaveValue('0456');
        values = ['0456'];
      } else if (id === 'tag-input') {
        await edit.fill('Local'); await edit.press('Enter');
        await edit.fill('Temporary'); await edit.press(',');
        await edit.press('Backspace');
        values = [topic, 'Local'];
      } else {
        await expect(form.getByRole('checkbox', {name: ar ? 'الدمام' : 'Dammam'})).toBeDisabled();
        await form.getByRole('checkbox', {name: city}).press('Space');
        await edit.fill(city);
        await expect(form.getByRole('checkbox', {name: ar ? 'الرياض' : 'Riyadh'})).toHaveCount(0);
        values = ['riyadh','jeddah'];
      }
      expect(await submitted(form, name)).toEqual(values);
      await expect(model).toHaveText(JSON.stringify(id === 'multi-select' || id === 'tag-input' ? values : values[0]));
      await form.locator('button[type="submit"]').click();
      await expect(result).toHaveText(JSON.stringify(values));
      await form.locator('[data-disable]').check();
      await expect(edit).toBeDisabled();
      await form.locator('button[type="submit"]').click();
      await expect(result).toHaveText('[]');
      await form.locator('button[type="reset"]').click();
      await expect(edit).toBeEnabled();
      await expect(result).toHaveText('—');
      await expect.poll(() => submitted(form, name)).toEqual(initial);
      await expect(page).toHaveURL(new RegExp(`#component/${id}$`));
    });
  });
}
