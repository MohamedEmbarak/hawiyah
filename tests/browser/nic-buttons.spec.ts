import { test } from '@playwright/test';
import { checkNicButtons } from '../helpers/nic-buttons';
import { previewStyles } from '../../apps/playground/src/generated/preview-runtime';
for (const direction of ['rtl', 'ltr']) test(`vanilla NIC button states in ${direction}`, async ({ page }) => {
  test.setTimeout(180000);
  await page.setContent('<!doctype html><html lang="en"><head><title>Button states</title></head><body></body></html>');
  await page.addStyleTag({content: previewStyles});
  await page.evaluate(direction => {
    document.body.innerHTML = `<main data-testid="nic-showcase" data-hw-theme="dga" dir="${direction}" style="padding:24px"><h1>Buttons</h1>
      <section data-testid="button-showcase" aria-label="Buttons"><div class="hw-cluster">
      ${['primary','default','secondary','outline','outline-white','light','danger','ghost','soft','link'].map(v => `<span style="padding:4px;${['outline-white','light'].includes(v) ? 'background:#14573a' : ''}"><button type="button" class="hw-button" data-testid="button-${v}" data-variant="${v}">${v}</button></span>`).join('')}
      <button type="button" class="hw-button" data-testid="button-disabled" disabled>Disabled</button><button type="button" class="hw-button" data-testid="button-loading" disabled aria-busy="true">Saving</button>
      <button type="button" class="hw-button hw-icon-button" data-testid="button-icon" data-variant="default" aria-label="Add">+</button></div><output data-testid="button-count">0</output></section></main>`;
    let count = 0;
    document.querySelectorAll('button[data-testid^="button-"]').forEach(node => node.addEventListener('click', () => { document.querySelector('[data-testid="button-count"]')!.textContent = String(++count); }));
  }, direction);
  await checkNicButtons(page);
});
