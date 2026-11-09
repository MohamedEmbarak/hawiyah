import {expect, test, type Locator} from '@playwright/test';

const formats = [
  ['vanilla', 'javascript', 'ar'], ['vanilla', 'typescript', 'en'],
  ['react', 'javascript', 'en'], ['react', 'typescript', 'ar'],
  ['vue', 'javascript', 'ar'], ['vue', 'typescript', 'en'], ['angular', 'typescript', 'ar'],
] as const;

async function drop(form: Locator, names: string[]) {
  await form.locator('.hw-file-dropzone').evaluate((zone, names) => {
    const transfer = new DataTransfer();
    for (const name of names) transfer.items.add(new File(['fixture'], name));
    zone.dispatchEvent(new DragEvent('drop', {dataTransfer: transfer, bubbles: true, cancelable: true}));
  }, names);
}

async function expectSelection(form: Locator, names: string[]) {
  await expect(form.locator('[data-file-count]')).toHaveText(String(names.length));
  await expect(form.locator('[data-file-names] .hw-upload-name')).toHaveText(names);
  expect(await form.locator('input[type="file"]').evaluate(element =>
    Array.from((element as HTMLInputElement).files || [], file => file.name))).toEqual(names);
}

async function expectSubmitted(form: Locator, names: string[]) {
  expect(await form.evaluate(element => new FormData(element as HTMLFormElement).getAll('documents')
    .flatMap(entry => entry instanceof File && entry.name ? [entry.name] : []))).toEqual(names);
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[data-file-submitted]')).toHaveText(names.join(', ') || '—');
}

for (const [framework, language, locale] of formats) {
  test(`${framework} ${language} file projects retain only the files displayed and submitted in ${locale}`, async ({page}) => {
    test.setTimeout(240000);
    await page.addInitScript(locale => {
      if (window === window.top) localStorage.setItem('hawiyah-locale', locale);
    }, locale);
    for (const id of ['upload', 'file-dropzone']) await test.step(id, async () => {
      await page.goto(`/#component/${id}`);
      await page.locator('[data-guide-tab="playground"]').click();
      await page.locator('[data-project-framework]').selectOption(framework);
      if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
      await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 60000});
      const form = page.frameLocator('.hw-ide-frame').locator(`form[data-file-project="${id}"]`);
      const transfers = page.frameLocator('.hw-ide-frame').locator('section.demo .hw-upload-list');
      await expect(transfers.locator('li')).toHaveCount(4);
      await expect(transfers.locator('progress')).toHaveAttribute('value', '45');
      await expect(transfers.locator('[data-status="error"]')).toContainText('retry.pdf');
      await transfers.locator('[data-status="error"] button').click();
      await expect(transfers.locator('li')).toHaveCount(3);
      await expect(transfers.locator('[data-status="error"]')).toHaveCount(0);
      const input = form.locator('input[type="file"]');
      const toggle = form.getByRole('checkbox');
      await expect(input).toHaveAccessibleName(locale === 'ar' ? 'أرفق المستندات' : 'Attach documents');
      await expect(input).toHaveAttribute('accept', '.pdf,.png');
      await expectSelection(form, []);
      const chosen = ['report.pdf', 'scan.png'];
      await input.setInputFiles(chosen.map(name => ({name, mimeType: name.endsWith('pdf') ? 'application/pdf' : 'image/png', buffer: Buffer.from('fixture')})));
      await expectSelection(form, chosen);
      await expectSubmitted(form, chosen);
      await form.locator('[data-file-names] button').first().click();
      await expectSelection(form, ['scan.png']);
      await expect(input).toBeFocused();
      await expectSubmitted(form, ['scan.png']);
      await input.setInputFiles(chosen.map(name => ({name, mimeType: name.endsWith('pdf') ? 'application/pdf' : 'image/png', buffer: Buffer.from('fixture')})));
      await expectSelection(form, chosen);
      await toggle.check();
      await expect(input).toBeDisabled();
      if (id === 'file-dropzone') await drop(form, ['ignored.pdf']);
      await expectSelection(form, chosen);
      await expectSubmitted(form, []);
      await toggle.uncheck();
      await expectSubmitted(form, chosen);

      if (id === 'file-dropzone') {
        const mixedPolicy = framework === 'angular'
          ? (locale === 'ar' ? 'ويُستبعد سواها' : 'excludes the other files')
          : (locale === 'ar' ? 'يُرفض الاختيار بالكامل' : 'the entire selection is cleared');
        await expect(form).toContainText(mixedPolicy);
        await drop(form, ['<new>.PDF', 'ignored.exe']);
        const mixed = framework === 'angular' ? ['<new>.PDF'] : [];
        await expectSelection(form, mixed);
        await expectSubmitted(form, mixed);
        const error = framework === 'angular' ? 'ignored.exe' : locale === 'ar' ? 'رُفضت ملفات' : 'did not match';
        await expect(form).toContainText(error);
        await drop(form, ['new.png']);
        await expectSelection(form, ['new.png']);
        await drop(form, ['only.exe']);
        await expectSelection(form, []);
        await expectSubmitted(form, []);
        await drop(form, ['reset-me.pdf']);
        await expectSelection(form, ['reset-me.pdf']);
      }
      await toggle.check();
      await form.locator('button[type="reset"]').click();
      await expect(input).toBeEnabled();
      await expect(toggle).not.toBeChecked();
      await expectSelection(form, []);
      await expectSubmitted(form, []);
      expect(new URL(page.url()).hash).toBe(`#component/${id}`);
    });
  });
}
