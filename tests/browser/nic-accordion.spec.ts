import {test,expect} from '@playwright/test';
import {checkNicAccordion} from '../nic-accordion-browser';

for(const dir of ['rtl','ltr'])test(`NIC accordion source styles and native fallback in ${dir}`,async({page})=>{
  await page.goto('/#component/accordion');
  await page.evaluate(dir=>{
    document.body.innerHTML=`<main style="padding:24px" dir="${dir}"><h1>Accordion</h1><div class="nq-accordion" data-nq-theme="dga"><details class="nq-accordion-item"><summary class="nq-accordion-trigger">Requirements</summary><div class="nq-accordion-content">Required documents</div></details><details class="nq-accordion-item"><summary class="nq-accordion-trigger">Processing time</summary><div class="nq-accordion-content">3 days</div></details></div></main>`;
  },dir);
  const accordion=page.locator('.nq-accordion');
  await expect(accordion.locator('details').first()).not.toHaveAttribute('data-nq-expanded');
  await checkNicAccordion(page,accordion);
});
