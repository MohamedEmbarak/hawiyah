import { test } from '@playwright/test';
import { checkNicChoices } from '../helpers/nic-choices';
for (const locale of ['ar','en']) test(`NIC choice states and read-only protection in ${locale}`, async ({page}) => {
  await page.goto('/?preview=nic');
  if(locale==='en') await page.getByRole('button',{name:'English',exact:true}).click();
  await checkNicChoices(page);
});
