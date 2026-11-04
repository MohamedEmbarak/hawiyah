import {expect, test, type Locator} from '@playwright/test';

const ids = ['field', 'input-group', 'password-field', 'number-field', 'slider', 'range-slider'] as const;
const projects = [
  ['vanilla', 'javascript', 'ar'], ['vanilla', 'typescript', 'en'],
  ['react', 'javascript', 'en'], ['react', 'typescript', 'ar'],
  ['vue', 'javascript', 'ar'], ['vue', 'typescript', 'en'], ['angular', 'typescript', 'ar'],
] as const;

async function submitted(form: Locator, name: string) {
  return form.evaluate((element, field) => new FormData(element as HTMLFormElement).get(field), name);
}

async function descriptions(input: Locator) {
  return input.evaluate(element => (element.getAttribute('aria-describedby') ?? '').trim().split(/\s+/).filter(Boolean).map(id => {
    const description = element.ownerDocument.getElementById(id);
    return description && !description.hidden ? description.textContent : null;
  }));
}

for (const [framework, language, locale] of projects) {
  test(`six ${framework} ${language} basic input projects preserve form values in ${locale}`, async ({page}) => {
    test.setTimeout(360000);
    await page.addInitScript(locale => {if (window === window.top) localStorage.setItem('nasaq-locale', locale);}, locale);
    const ar = locale === 'ar';
    for (const id of ids) await test.step(id, async () => {
      await page.goto(`/#component/${id}`);
      await page.locator('[data-guide-tab="playground"]').click();
      await page.locator('[data-project-framework]').selectOption(framework);
      if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
      await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 45000});
      const form = page.frameLocator('.nq-ide-frame').locator(`form[data-basic-input-project="${id}"]`);
      const output = form.locator('[data-basic-value]'), reset = form.locator('button[type="reset"]');
      await expect(form).toBeVisible();
      if (framework !== 'vanilla') await expect(page.locator('[data-ide-editor="html"] .cm-content')).toContainText(`@nasaq/${framework}`);
      switch (id) {
        case 'field': {
          const input = form.getByRole('textbox', {name: ar ? 'اسم الخدمة' : 'Service name'});
          await expect(input).toHaveAttribute('required', '');
          await input.fill('AB');
          await expect(input).not.toHaveAttribute('aria-invalid', 'true');
          await input.press('Tab');
          await expect(input).toHaveAttribute('aria-invalid', 'true');
          expect((await descriptions(input)).filter(Boolean)).toHaveLength(2);
          await input.fill('Permit');
          await expect(output).toHaveText('Permit');
          await expect(input).not.toHaveAttribute('aria-invalid', 'true');
          expect((await descriptions(input)).filter(Boolean)).toHaveLength(1);
          expect(await submitted(form, 'serviceName')).toBe('Permit');
          await reset.click();
          await expect(input).toHaveValue('');
          await expect(output).toHaveText('—');
          await expect(input).not.toHaveAttribute('aria-invalid', 'true');
          break;
        }
        case 'input-group': {
          const input = form.getByRole('spinbutton', {name: ar ? 'المبلغ بالريال السعودي' : 'Amount in Saudi riyals'});
          const symbol = form.locator('.nq-input-addon .nq-riyal');
          await expect(symbol).toHaveText('⃁');
          await expect(symbol).toHaveAttribute('aria-hidden', 'true');
          expect(await symbol.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(24);
          await input.fill('35.50');
          expect(Number(await submitted(form, 'fee'))).toBe(35.5);
          expect(Number(await output.textContent())).toBe(35.5);
          expect(await input.evaluate(element => (element as HTMLInputElement).validity.valid)).toBe(true);
          await reset.click();
          await expect.poll(async () => Number(await input.inputValue())).toBe(25);
          expect(Number(await output.textContent())).toBe(25);
          break;
        }
        case 'password-field': {
          const input = form.locator('input[name="password"]');
          const toggle = form.locator('.nq-password-toggle');
          await expect(input).toHaveAccessibleName(ar ? 'كلمة مرور تجريبية' : 'Demo password');
          await expect(input).toHaveAttribute('type', 'password');
          await expect(input).toHaveAttribute('autocomplete', 'new-password');
          await expect(toggle.locator('.nq-password-icon')).toHaveCount(1);
          await expect(toggle).toHaveAttribute('aria-controls', await input.getAttribute('id') as string);
          await input.fill('demo-example-24');
          await expect(output).toHaveText(ar ? 'تم الإدخال' : 'Entered');
          await toggle.press('Enter');
          await expect(input).toHaveAttribute('type', 'text');
          await expect(toggle).toHaveAttribute('aria-pressed', 'true');
          await expect(toggle).toHaveAccessibleName(ar ? 'إخفاء كلمة المرور' : 'Hide password');
          await reset.click();
          await expect(input).toHaveValue('');
          await expect(input).toHaveAttribute('type', 'password');
          await expect(toggle).toHaveAttribute('aria-pressed', 'false');
          await expect(output).toHaveText(ar ? 'فارغ' : 'Empty');
          break;
        }
        case 'number-field': {
          const input = form.getByRole('spinbutton', {name: ar ? 'المقاعد المطلوبة' : 'Requested seats'});
          await expect(input).toHaveValue('2');
          expect(await submitted(form, 'capacity')).toBe('12');
          expect(await submitted(form, 'waitlist')).toBeNull();
          await input.fill('');
          await expect(output).toHaveText('—');
          expect(await input.evaluate(element => (element as HTMLInputElement).validity.valueMissing)).toBe(true);
          await input.fill('21');
          expect(await input.evaluate(element => (element as HTMLInputElement).validity.rangeOverflow)).toBe(true);
          await input.fill('7');
          await expect(output).toHaveText('7');
          expect(await submitted(form, 'seats')).toBe('7');
          await reset.click();
          await expect(input).toHaveValue('2');
          await expect(output).toHaveText('2');
          expect(await submitted(form, 'capacity')).toBe('12');
          break;
        }
        case 'slider': {
          const input = form.getByRole('slider', {name: ar ? 'نسبة الإنجاز المطلوبة (%)' : 'Completion threshold (%)'});
          await input.press('Home'); await input.press('ArrowUp');
          await expect(input).toHaveValue('5');
          await expect(output).toHaveText('5%');
          expect(await submitted(form, 'completion')).toBe('5');
          await reset.click();
          await expect(input).toHaveValue('50');
          await expect(output).toHaveText('50%');
          break;
        }
        case 'range-slider': {
          const lower = form.getByRole('slider', {name: ar ? 'الحد الأدنى للأيام' : 'Minimum days'});
          const upper = form.getByRole('slider', {name: ar ? 'الحد الأعلى للأيام' : 'Maximum days'});
          await expect(lower).toHaveAttribute('max', '80');
          await expect(upper).toHaveAttribute('min', '20');
          await upper.press('Home'); await lower.press('Home'); await upper.press('Home');
          await expect(output).toHaveText('0 – 0');
          expect(await submitted(form, 'minDays')).toBe('0');
          expect(await submitted(form, 'maxDays')).toBe('0');
          await reset.click();
          await expect(output).toHaveText('20 – 80');
          await expect(lower).toHaveValue('20'); await expect(upper).toHaveValue('80');
          await expect(lower).toHaveAttribute('max', '80'); await expect(upper).toHaveAttribute('min', '20');
          break;
        }
      }
      await expect(page).toHaveURL(new RegExp(`#component/${id}$`));
      await expect(page.locator('.nq-ide-console')).not.toContainText(/Failed to resolve component|\[error\]/);
    });
  });
}
