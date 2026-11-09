import { test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { checkNicInputGroup } from '../helpers/nic-inputs';
const vanillaModule='/@fs/'+fileURLToPath(new URL('../../packages/vanilla/src/index.ts',import.meta.url)).replaceAll('\\','/');
for(const direction of ['rtl','ltr']) test(`vanilla NIC grouped input in ${direction}`, async({page})=>{
  await page.goto('/#inputs');
  await page.evaluate(async({direction,module})=>{
    document.body.innerHTML=`<main data-testid="nic-showcase" data-hw-theme="dga" dir="${direction}" style="padding:24px"><h1>Input group</h1><div class="hw-field"><label class="hw-label" for="group-email">Email</label><div class="hw-input-group" data-testid="group-field"><span class="hw-input-addon">@</span><input id="group-email" class="hw-input" type="email" required value="ready@example.test"></div></div><button type="button">Next</button></main>`;
    const {enhance}=await import(/* @vite-ignore */module);enhance(document.body);
  },{direction,module:vanillaModule});
  await checkNicInputGroup(page);
});
