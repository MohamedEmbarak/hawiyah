import { expect, test, type Page } from '@playwright/test';

async function preferences(page: Page, locale: 'ar' | 'en', mode: 'light' | 'dark' = 'light') {
  await page.addInitScript(({ locale, mode }) => {
    localStorage.setItem('nasaq-locale', locale);
    localStorage.setItem('nasaq-mode', mode);
    localStorage.setItem('nasaq-theme', 'dga');
  }, { locale, mode });
}

test('Arabic service application validates, preserves the draft, supports review edits and confirms locally', async ({ page }) => {
  await preferences(page, 'ar');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#templates/service');
  const template = page.locator('[data-dga-template]');
  await expect(template.getByRole('heading', { name: 'رخصة بناء', exact: true })).toBeVisible();
  await template.getByRole('tab', { name: 'المتطلبات', exact: true }).click();
  await expect(template.getByRole('heading', { name: 'ما تحتاج إلى تجهيزه' })).toBeVisible();
  await template.getByRole('link', { name: 'بدء الطلب', exact: true }).click();
  const application = page.locator('[data-dga-application]');
  await application.getByRole('button', { name: 'مراجعة الطلب', exact: true }).click();
  await expect(application).toHaveAttribute('data-stage', '0');
  await expect(page.locator('#nq-template-applicant')).toBeFocused();
  await page.locator('#nq-template-applicant').fill('مقدم طلب تجريبي');
  await page.locator('#nq-template-email').fill('demo@example.com');
  await page.locator('#nq-template-city').selectOption('riyadh');
  await page.locator('#nq-template-address').fill('موقع تجريبي');
  await page.locator('#nq-template-area').fill('180');
  await page.locator('#nq-template-description').fill('وصف تجريبي لا يتضمن بيانات شخصية.');
  await page.locator('.topbar [data-action="mode"]').click();
  await expect(page.locator('#nq-template-applicant')).toHaveValue('مقدم طلب تجريبي');
  await expect(page.locator('#nq-template-city')).toHaveValue('riyadh');
  await application.getByRole('button', { name: 'مراجعة الطلب', exact: true }).click();
  await expect(application).toHaveAttribute('data-stage', '1');
  await expect(application.locator('[data-dga-review]')).toContainText('مقدم طلب تجريبي');
  await expect(application.locator('[data-dga-stage="1"] h2')).toBeFocused();
  await page.locator('.topbar [data-action="locale"]').click();
  await expect(application).toHaveAttribute('data-stage', '1');
  await expect(application.getByRole('heading', { name: 'Review your application' })).toBeVisible();
  await page.locator('.topbar [data-action="locale"]').click();
  await application.getByRole('button', { name: 'تعديل البيانات', exact: true }).click();
  await expect(page.locator('#nq-template-area')).toHaveValue('180');
  await page.locator('#nq-template-area').fill('220');
  await application.getByRole('button', { name: 'مراجعة الطلب', exact: true }).click();
  await expect(application.locator('[data-dga-review]')).toContainText('220');
  await application.getByRole('button', { name: 'تأكيد الطلب', exact: true }).click();
  await expect(application).toHaveAttribute('data-stage', '1');
  await application.getByRole('checkbox', { name: 'أؤكد أنني راجعت هذه البيانات التجريبية.' }).check();
  await application.getByRole('button', { name: 'تأكيد الطلب', exact: true }).click();
  await expect(application).toHaveAttribute('data-stage', '2');
  await expect(application.getByRole('heading', { name: 'اكتمل طلبك التجريبي' })).toBeFocused();
  await expect(application.locator('.nq-template-reference')).toHaveText('NQ-DEMO-2026-104');
  await application.getByRole('button', { name: 'بدء طلب جديد', exact: true }).click();
  await expect(application).toHaveAttribute('data-stage', '0');
  await expect(page.locator('#nq-template-applicant')).toHaveValue('');
  await expect(page.locator('#nq-template-city')).toHaveValue('');
  expect(errors).toEqual([]);
});

test('FAQ filters, local feedback and cookie preferences provide usable results', async ({ page }) => {
  await preferences(page, 'en');
  await page.goto('/#templates/faq');
  const template = page.locator('[data-dga-template]');
  await template.getByRole('searchbox', { name: 'Search questions' }).fill('attachments');
  await expect(template.locator('[data-dga-question]:visible')).toHaveCount(1);
  await template.getByText('Are attachments uploaded?', { exact: true }).click();
  await expect(template.getByText('No. File selection is demonstrated locally. Your file is not uploaded to a server.')).toBeVisible();
  await template.getByRole('searchbox', { name: 'Search questions' }).fill('no matching phrase');
  await expect(template.getByRole('heading', { name: 'No matching questions' })).toBeVisible();
  await template.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(template.locator('[data-dga-question]:visible')).toHaveCount(6);
  await template.getByRole('combobox', { name: 'Topic', exact: true }).selectOption('privacy');
  await expect(template.locator('[data-dga-question]:visible')).toHaveCount(2);

  const feedback = template.locator('[data-dga-feedback]');
  await feedback.getByRole('button', { name: 'No', exact: true }).click();
  await feedback.getByRole('checkbox', { name: 'Some information is missing', exact: true }).check();
  await feedback.getByRole('textbox', { name: 'Additional feedback (optional)' }).fill('Please add another illustrative example.');
  await feedback.getByRole('button', { name: 'Send feedback', exact: true }).click();
  await expect(feedback.getByRole('status')).toContainText('recorded locally');
  await feedback.getByRole('button', { name: 'Change response', exact: true }).click();
  await expect(feedback.getByRole('checkbox', { name: 'Some information is missing', exact: true })).not.toBeChecked();

  await page.goto('/#templates/cookies');
  await template.getByRole('button', { name: 'Accept all', exact: true }).click();
  await expect(template.getByRole('switch', { name: 'Analytics', exact: true })).toBeChecked();
  await expect(template.locator('[data-dga-cookie-status]')).toBeVisible();
  await page.goto('/#templates/content');
  await template.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Review before confirming' }).click();
  await expect(page).toHaveURL(/#templates\/content$/);
  await expect(template.locator('#nq-content-review')).toBeFocused();
  await page.goto('/#templates/cookies');
  await expect(template.getByRole('switch', { name: 'Analytics', exact: true })).toBeChecked();
  await template.getByRole('button', { name: 'Reject optional', exact: true }).click();
  await expect(template.getByRole('switch', { name: 'Analytics', exact: true })).not.toBeChecked();
  await expect(template.getByRole('switch', { name: 'Always on', exact: true })).toBeChecked();
});

for (const locale of ['ar', 'en'] as const) {
  test(`narrow ${locale} service tabs reveal the complete keyboard-selected tab`, async ({ page }) => {
    await preferences(page, locale);
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/?preview=template#templates/service');
    await page.evaluate(() => document.fonts.ready);
    const tablist = page.locator('[data-dga-template] [role="tablist"]');
    const tabs = tablist.getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('End');
    await expect(tabs.last()).toBeFocused();
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
    await expect.poll(async () => {
      const list = await tablist.boundingBox();
      const selected = await tabs.last().boundingBox();
      return Boolean(list && selected && selected.x >= list.x - 1 && selected.x + selected.width <= list.x + list.width + 1);
    }).toBe(true);
  });

  for (const mode of ['light', 'dark'] as const) {
    test(`mobile reference form and portal navigation reflow in ${locale}/${mode}`, async ({ page }) => {
      await preferences(page, locale, mode);
      await page.setViewportSize({ width: 430, height: 900 });
      await page.goto('/#templates/form');
      const template = page.locator('[data-dga-template]');
      await expect(page.locator('html')).toHaveAttribute('data-nq-mode', mode);
      await expect(template.locator('.nq-stepper-mobile')).toBeVisible();
      await expect(template.locator('.nq-stepper-responsive > .nq-stepper')).not.toBeVisible();
      await expect(template.locator('.nq-stepper-ring')).toHaveCSS('inline-size', '64px');
      const menu = template.getByRole('button', { name: locale === 'ar' ? 'القائمة' : 'Menu', exact: true });
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await expect(template.locator('#nq-template-navigation')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await menu.click();
      await template.locator('#nq-template-navigation').getByRole('link', { name: locale === 'ar' ? 'الخدمات' : 'Services', exact: true }).click();
      await expect(template).toHaveAttribute('data-dga-template', 'service');
      for (const width of [430, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(template.locator('.nq-portal-brand')).toBeVisible();
      }
    });
  }
}
