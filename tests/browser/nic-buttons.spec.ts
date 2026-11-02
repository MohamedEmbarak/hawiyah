import { test } from '@playwright/test';
import { checkNicButtons } from '../helpers/nic-buttons';
for (const direction of ['rtl', 'ltr']) test(`vanilla NIC button states in ${direction}`, async ({ page }) => {
  await page.goto('/#component/button');
  await page.evaluate(direction => {
    document.body.innerHTML = `<main data-testid="nic-showcase" data-nq-theme="dga" dir="${direction}" style="padding:24px"><h1>Buttons</h1>
      <section data-testid="button-showcase" aria-label="Buttons"><div class="nq-cluster">
      ${['primary','default','secondary','outline','outline-white','light','danger','ghost','soft','link'].map(v => `<span style="padding:4px;${['outline-white','light'].includes(v) ? 'background:#14573a' : ''}"><button type="button" class="nq-button" data-testid="button-${v}" data-variant="${v}">${v}</button></span>`).join('')}
      <button type="button" class="nq-button" data-testid="button-disabled" disabled>Disabled</button><button type="button" class="nq-button" data-testid="button-loading" disabled aria-busy="true">Saving</button>
      <button type="button" class="nq-button nq-icon-button" data-testid="button-icon" data-variant="default" aria-label="Add">+</button></div><output data-testid="button-count">0</output></section></main>`;
    let count = 0;
    document.querySelectorAll('button[data-testid^="button-"]').forEach(node => node.addEventListener('click', () => { document.querySelector('[data-testid="button-count"]')!.textContent = String(++count); }));
  }, direction);
  await checkNicButtons(page);
});
