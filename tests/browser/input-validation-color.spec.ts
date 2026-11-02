import { expect, test, type Locator } from '@playwright/test';

async function expectLine(field: Locator, token: string) {
  const color = await field.evaluate((node, token) => {
    const probe = document.createElement('span'); probe.style.color = `var(${token})`;
    node.parentElement!.append(probe); const color = getComputedStyle(probe).color; probe.remove(); return color;
  }, token);
  await expect(field).toHaveCSS('background-image', `linear-gradient(${color}, ${color})`);
}

for (const mode of ['light', 'dark']) for (const variant of ['outlined', 'filled']) {
  test(`validation underline is neutral before interaction and follows validity: ${mode} ${variant}`, async ({ page }) => {
    await page.goto('/#inputs');
    await page.locator('#main').evaluate((main, { mode, variant }) => main.insertAdjacentHTML('beforeend',
      `<form id="validation-colors" data-nq-mode="${mode}" data-nq-theme="dga"><input id="optional-query" class="nq-input" data-variant="${variant}" aria-label="Optional query"><input id="required-email" class="nq-input" data-variant="${variant}" type="email" required aria-label="Email"><textarea id="required-note" class="nq-textarea" data-variant="${variant}" required aria-label="Note"></textarea><select id="required-choice" class="nq-select" data-variant="${variant}" required aria-label="Choice"><option value="">Choose</option><option value="a">A</option></select><button type="reset">Reset</button><button type="submit">Submit</button></form>`), { mode, variant });
    const form = page.locator('#validation-colors'); const email = form.locator('#required-email');
    for (const id of ['optional-query', 'required-email', 'required-note', 'required-choice']) {
      const field = form.locator(`#${id}`); await field.focus();
      await expectLine(field, '--nq-color-border-strong');
      await expect(field).toHaveCSS('background-size', '100% 2px'); await expect(field).toHaveCSS('outline-style', 'none');
    }
    await email.fill('invalid'); await page.keyboard.press('Tab');
    await expectLine(email, '--nq-color-danger');
    await email.focus(); await expect(email).toHaveCSS('background-size', '100% 2px');
    await email.fill('user@example.test'); await page.keyboard.press('Tab');
    await expectLine(email, '--nq-color-primary-text');
    await email.evaluate(node => node.setAttribute('aria-invalid', 'true'));
    await expectLine(email, '--nq-color-danger'); // Explicit server error overrides native validity.
    await email.evaluate(node => node.removeAttribute('aria-invalid'));
    const note = form.locator('#required-note'); await note.fill('Details'); await page.keyboard.press('Tab');
    await expectLine(note, '--nq-color-primary-text');
    const choice = form.locator('#required-choice'); await choice.focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Tab');
    await expectLine(choice, '--nq-color-primary-text');
    await form.getByRole('button', { name: 'Reset', exact: true }).click();
    for (const id of ['optional-query', 'required-email', 'required-note', 'required-choice']) await expectLine(form.locator(`#${id}`), '--nq-color-border-strong');
    await form.getByRole('button', { name: 'Submit', exact: true }).click();
    await expectLine(email, '--nq-color-danger');
    await page.emulateMedia({ reducedMotion: 'reduce' }); await email.focus();
    expect(await email.evaluate(node => getComputedStyle(node).transitionDuration.split(',').every(value => parseFloat(value) <= 0.00001))).toBe(true);
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(email).toHaveCSS('background-image', 'none'); await expect(email).toHaveCSS('outline-style', 'solid');
  });
}
