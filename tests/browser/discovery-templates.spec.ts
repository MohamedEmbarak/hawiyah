import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['ar','en'] as const) {
  test(`Home and Search work in ${locale} on narrow screens`,async({page},testInfo)=>{
    test.setTimeout(90_000);
    await page.addInitScript(locale=>{localStorage.setItem('nasaq-locale',locale);localStorage.setItem('nasaq-mode','dark');},locale);
    await page.setViewportSize({width:390,height:844});
    await page.goto('/#templates/home');
    const scope=page.locator('[data-dga-template]');
    await expect(scope.locator('h1')).toHaveText(locale==='ar'?'خدماتك بخطوات واضحة':'Your services, with clear next steps');
    await page.screenshot({path:testInfo.outputPath('home-mobile.png'),fullPage:true});
    await scope.getByRole('link',{name:locale==='ar'?'استكشف الخدمات':'Explore services',exact:true}).click();
    const search=page.locator('[data-discovery-search]');
    await expect(search.locator('[data-search-status]')).toContainText(/[7٧]/);
    await search.locator('[data-search-page="2"]').click();
    await expect(search.locator('[data-search-page="2"]')).toHaveAttribute('aria-current','page');
    await search.locator('[name=category]').selectOption('guidance');
    await expect(search.locator('[data-search-status]')).toContainText(/[3٣]/);
    await search.locator('[data-search-remove]').click();
    await expect(search.locator('[name=category]')).toBeFocused();
    await search.locator('[name=query]').fill('unmatched-query');
    await search.locator('[name=query]').press('Enter');
    await expect(search.locator('[data-search-results]')).toContainText(locale==='ar'?'لا توجد نتائج مطابقة':'No matching results');
    await page.locator('.topbar [data-action="mode"]').click();
    await expect(search.locator('[name=query]')).toHaveValue('unmatched-query');
    await search.locator('[data-search-clear]').click();
    await search.locator('[name=sort]').selectOption('name');
    await expect(search.locator('[data-search-status]')).toContainText(/[7٧]/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).include('[data-dga-template]').analyze()).violations).toEqual([]);
    await page.screenshot({path:testInfo.outputPath('search-mobile.png'),fullPage:true});
  });
}
