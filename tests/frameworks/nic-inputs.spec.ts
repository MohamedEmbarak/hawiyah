import { test } from '@playwright/test';
import { checkNicInputGroup } from '../helpers/nic-inputs';
for(const locale of ['ar','en']) test(`NIC input motion, geometry and grouped focus in ${locale}`, async({page})=>{
  await page.goto('/?preview=nic');
  if(locale==='en')await page.getByRole('button',{name:'English',exact:true}).click();
  await checkNicInputGroup(page);
});
