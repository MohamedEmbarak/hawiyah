import { expect, test } from '@playwright/test';

for (const direction of ['rtl', 'ltr']) {
  test(`rating previews and fills cumulatively with native radio navigation (${direction})`, async ({ page }) => {
    await page.goto('/#components/rating');
    await page.locator('#main').evaluate((main, dir) => main.insertAdjacentHTML('beforeend', `<form id="rating-regression" dir="${dir}"><fieldset class="hw-rating"><legend>Rating regression</legend><div class="hw-inline">${[1,2,3,4,5].map(value => `<label><input type="radio" name="rating-regression" value="${value}" ${value === 3 ? 'checked' : ''} aria-label="${value} of 5"><span aria-hidden="true">★</span></label>`).join('')}</div></fieldset><button type="reset">Reset</button></form>`), direction);
    const form = page.locator('#rating-regression'); const labels = form.locator('label'); const inputs = form.locator('input');
    const colors = () => labels.locator('span').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).color));
    await page.mouse.move(0, 0);
    const initial = await colors(); const active = initial[2]; const inactive = initial[4];
    expect(active).not.toBe(inactive); expect(initial).toEqual([active, active, active, inactive, inactive]);
    await labels.nth(0).hover(); await expect.poll(colors).toEqual([active, inactive, inactive, inactive, inactive]);
    await expect(inputs.nth(2)).toBeChecked();
    await labels.nth(4).hover(); await expect.poll(colors).toEqual([active, active, active, active, active]);
    await labels.nth(3).click(); await page.mouse.move(0, 0);
    await expect.poll(colors).toEqual([active, active, active, active, inactive]);
    await inputs.nth(3).focus(); await page.keyboard.press('ArrowUp');
    await expect(inputs.nth(2)).toBeChecked(); await expect.poll(colors).toEqual([active, active, active, inactive, inactive]);
    await form.getByRole('button', { name: 'Reset' }).click();
    await expect(inputs.nth(2)).toBeChecked();
    await form.locator('fieldset').evaluate(node => node.setAttribute('disabled', ''));
    await labels.nth(4).hover({ force: true }); await expect.poll(colors).toEqual([active, active, active, inactive, inactive]);
    await form.locator('fieldset').evaluate(node => { node.removeAttribute('disabled'); node.setAttribute('data-hw-readonly', 'true'); });
    await labels.nth(4).hover(); await expect.poll(colors).toEqual([active, active, active, inactive, inactive]);
  });
}
