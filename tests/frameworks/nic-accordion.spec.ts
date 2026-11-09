import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {checkNicAccordion} from '../nic-accordion-browser';

for(const locale of ['ar','en'])test(`native NIC accordion source styles and accessible interaction in ${locale}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/?preview=portal');
  if(locale==='en')await page.getByRole('button',{name:'English',exact:true}).click();
  const scope=page.getByTestId('accordion-showcase'), accordion=scope.locator('.hw-accordion');
  await expect(accordion.locator('summary').first()).toHaveAttribute('aria-expanded','false');
  await checkNicAccordion(page,accordion);
  await page.emulateMedia({forcedColors:'none'});
  await accordion.evaluate(node=>{node.setAttribute('data-hw-theme','dga');(node as HTMLElement).style.removeProperty('--hw-color-accordion-focus');});
  expect((await new AxeBuilder({page}).include('[data-testid="accordion-showcase"]').analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});
