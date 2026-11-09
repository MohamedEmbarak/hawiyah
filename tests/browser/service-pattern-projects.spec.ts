import {expect, test} from '@playwright/test';

const ids = ['service-card','service-details','cookie-consent','notification-list'] as const;
const formats = [
  ['vanilla','javascript','ar'], ['vanilla','typescript','en'],
  ['react','javascript','en'], ['react','typescript','ar'],
  ['vue','javascript','ar'], ['vue','typescript','en'], ['angular','typescript','ar'],
] as const;

for (const [framework,language,locale] of formats) {
  test(`${framework} ${language} service projects keep actions and consent local in ${locale}`, async ({page}) => {
    test.setTimeout(420000);
    await page.addInitScript(locale => {
      if (window === window.top) localStorage.setItem('hawiyah-locale', locale);
    },locale);
    const ar = locale === 'ar';
    for (const id of ids) await test.step(id, async () => {
      await page.goto(`/#component/${id}`);
      await page.locator('[data-guide-tab="playground"]').click();
      await page.locator('[data-project-framework]').selectOption(framework);
      if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
      await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:90000});
      const root = page.frameLocator('.hw-ide-frame').locator(`[data-service-project="${id}"]`);
      const status = root.locator('[data-service-status]');
      await expect(status).toHaveText('—');
      await expect(root).toHaveAttribute('dir',ar?'rtl':'ltr');
      if (id === 'service-card') {
        await expect(root.getByRole('heading',{name:ar?'تجديد تصريح':'Renew a permit'})).toBeVisible();
        await expect(root).toContainText(ar?'48 ساعة':'48 hours');
        const action = root.getByRole('link',{name:ar?/عرض الخدمة/:/View service/});
        await expect(action).toHaveAttribute('href','/services/renew-permit');
        await action.click();
        await expect(status).toHaveText(ar?'تم اختيار الخدمة محليًا.':'Service selected locally.');
      }
      if (id === 'service-details') {
        await expect(root.getByRole('heading',{name:ar?'المستندات المطلوبة':'Required documents'})).toBeVisible();
        await expect(root.getByRole('listitem').filter({hasText:ar?'التصريح الحالي':'Current permit'})).toHaveCount(1);
        await root.getByRole('button',{name:ar?'بدء الطلب':'Start request'}).click();
        await expect(status).toHaveText(ar?'تم بدء المسودة محليًا.':'Draft started locally.');
      }
      if (id === 'cookie-consent') {
        const banner = root.locator('.hw-cookie-consent');
        const net:string[] = [];
        const onRequest = (request: import('@playwright/test').Request) => {
          if (['document','fetch','xhr','ping'].includes(request.resourceType())) net.push(request.url());
        };
        const cookies = await page.context().cookies();
        page.on('request',onRequest);
        try {
          await banner.getByRole('button',{name:ar?'قبول ملفات الارتباط الاختيارية':'Accept optional cookies'}).click();
          await expect(banner).toBeHidden();
          await expect(status).toHaveText(ar?'تم قبول ملفات الارتباط الاختيارية.':'Optional cookies accepted.');
          await root.locator('[data-review-choice]').click();
          await expect(banner).toBeVisible();
          await banner.getByRole('button',{name:ar?'رفض ملفات الارتباط الاختيارية':'Decline optional cookies'}).click();
          await expect(banner).toBeHidden();
          await expect(status).toHaveText(ar?'تم رفض ملفات الارتباط الاختيارية.':'Optional cookies declined.');
          expect(await page.context().cookies()).toEqual(cookies);
          expect(net).toEqual([]);
        } finally {page.off('request',onRequest);}
      }
      if (id === 'notification-list') {
        const list = root.locator('.hw-notification-list');
        await expect(list.getByRole('listitem')).toHaveCount(2);
        const unread = list.locator('[data-state="unread"], [data-unread="true"], [data-read="false"]');
        await expect(unread).toHaveCount(1);
        if (framework !== 'angular') {
          await unread.getByRole('button',{name:ar?/تحديد كمقروء/:/Mark as read/}).click();
          await expect(unread).toHaveCount(0);
        }
        await root.locator('[data-mark-all]').click();
        await expect(unread).toHaveCount(0);
        await expect(status).toHaveText(ar?'تم التحديد كمقروء.':'Marked as read.');
        if (framework === 'vue' || framework === 'angular') {
          await list.getByRole('button',{name:ar?/إزالة/:/Dismiss/}).first().click();
          await expect(list.getByRole('listitem')).toHaveCount(1);
        }
        await root.locator('[data-clear-list]').click();
        await expect(list).toContainText(ar?'لا توجد إشعارات.':'You have no notifications.');
        await expect(status).toHaveText(ar?'تم مسح القائمة.':'List cleared.');
      }
      expect(new URL(page.url()).hash).toBe(`#component/${id}`);
    });
  });
}
