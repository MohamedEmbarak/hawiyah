import { test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { checkNicChoices } from '../helpers/nic-choices';
const module='/@fs/'+fileURLToPath(new URL('../../packages/vanilla/src/index.ts',import.meta.url)).replaceAll('\\','/');
for(const direction of ['rtl','ltr']) test(`vanilla NIC choice states in ${direction}`, async({page})=>{
  await page.goto('/#inputs');
  await page.evaluate(async({direction,module})=>{
    document.body.innerHTML=`<main data-testid="nic-showcase" data-hw-theme="dga" dir="${direction}" style="padding:24px"><h1>Choices</h1><div class="hw-stack">
      <label class="hw-choice"><input class="hw-checkbox" type="checkbox" id="nic-check">Checkbox</label>
      <label class="hw-choice"><input class="hw-checkbox" type="checkbox" id="nic-mixed">Mixed</label>
      <label class="hw-choice"><input class="hw-checkbox" type="checkbox" id="nic-disabled" checked disabled>Disabled</label>
      <label class="hw-choice"><input class="hw-checkbox" type="checkbox" id="nic-readonly" checked readonly>Read only</label>
      <label class="hw-choice"><input class="hw-radio" type="radio" name="nic-radio" id="nic-radio-a" checked>First radio</label>
      <label class="hw-choice"><input class="hw-radio" type="radio" name="nic-radio" id="nic-radio-b">Second radio</label>
      <label class="hw-choice"><input class="hw-radio" type="radio" name="nic-radio" id="nic-radio-readonly" readonly>Read only radio</label></div></main>`;
    (document.querySelector('#nic-mixed') as HTMLInputElement).indeterminate=true;
    const {enhance}=await import(/* @vite-ignore */ module); enhance(document.body);
  },{direction,module});
  await checkNicChoices(page);
});
