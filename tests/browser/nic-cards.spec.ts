import { expect, test } from '@playwright/test';

for (const direction of ['rtl', 'ltr']) test(`vanilla NIC card composition has source geometry and native focus in ${direction}`, async ({ page }) => {
  await page.goto('/#component/card');
  await page.evaluate(direction => {
    document.body.innerHTML = `<main data-nq-theme="dga" dir="${direction}" id="nic-cards" style="padding:24px">
      <h1>Card reference</h1>
      <a class="nq-card nq-card-action" href="#details">
        <header class="nq-card-header"><h2 class="nq-card-title">تفاصيل الخدمة Service details</h2></header>
        <div class="nq-card-body"><p class="nq-card-description">محتوى واضح. Clear content.</p></div>
        <footer class="nq-card-footer">More information</footer>
      </a>
      <article class="nq-card" data-variant="outlined"><h2 class="nq-card-title">Bordered</h2></article>
      <h2 id="details" tabindex="-1">Details</h2>
    </main>`;
  }, direction);
  const card = page.locator('.nq-card-action');
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(card).toHaveCSS('gap', width < 768 ? '16px' : '24px');
    await expect(card).toHaveCSS('padding', '16px');
    await expect(card).toHaveCSS('border-radius', '16px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await card.hover(); await expect(card).toHaveCSS('background-color', 'rgb(249, 250, 251)');
  await card.focus(); await expect(card).toHaveCSS('outline-color', 'rgb(0, 0, 0)');
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.keyboard.press('Enter'); await expect(page.locator('#details')).toBeFocused();
  await expect(page.locator('[data-variant="outlined"]')).toHaveCSS('box-shadow', 'none');
  await page.locator('#nic-cards').evaluate(node => node.setAttribute('data-nq-mode', 'dark'));
  await card.focus(); await expect(card).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
  await expect(card).toHaveCSS('background-color', 'rgb(31, 42, 55)');
});
