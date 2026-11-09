import {test,expect} from '@playwright/test';
import {checkNicAccordion} from '../nic-accordion-browser';

for(const dir of ['rtl','ltr'])test(`NIC accordion source styles and native fallback in ${dir}`,async({page})=>{
  await page.goto('/#component/accordion');
  await page.evaluate(dir=>{
    document.body.innerHTML=`<main style="padding:24px" dir="${dir}"><h1>Accordion</h1><div class="hw-accordion" data-hw-theme="dga"><details class="hw-accordion-item"><summary class="hw-accordion-trigger">Requirements</summary><div class="hw-accordion-content">Required documents</div></details><details class="hw-accordion-item"><summary class="hw-accordion-trigger">Processing time</summary><div class="hw-accordion-content">3 days</div></details></div></main>`;
  },dir);
  const accordion=page.locator('.hw-accordion');
  await expect(accordion.locator('details').first()).not.toHaveAttribute('data-hw-expanded');
  await checkNicAccordion(page,accordion);
});
