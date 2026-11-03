import {expect,test,type Locator} from '@playwright/test';

async function sameRow(choices:Locator) {
  const a=(await choices.nth(0).boundingBox())!,b=(await choices.nth(1).boundingBox())!;
  expect(Math.abs(a.y-b.y)).toBeLessThan(2);
  expect(Math.abs(a.x-b.x)).toBeGreaterThan(20);
}

for(const direction of ['rtl','ltr'])test(`catalog feedback and link composition in ${direction}`,async({page},info)=>{
  await page.goto('/#components');
  for(const width of [1864,390]) {
    await page.setViewportSize({width,height:884});
    await page.locator('main').evaluate((el,dir)=>el.setAttribute('dir',dir),direction);
    const feedback=page.locator('.component-preview .nq-feedback').first();
    await sameRow(feedback.getByRole('button'));
    await feedback.getByRole('button').first().click();
    await expect(feedback.locator('[data-nq-feedback-value]')).toHaveValue('yes');
    await feedback.getByRole('button').nth(1).click();
    await expect(feedback.locator('[data-nq-feedback-value]')).toHaveValue('no');
    const link=page.locator('.component-preview .nq-link').filter({has:page.locator('svg')}).first();
    await expect(link).toHaveCSS('display',/^(inline-)?flex$/);
    const arrow=(await link.locator('svg').boundingBox())!,box=(await link.boundingBox())!;
    expect(Math.abs(arrow.y+arrow.height/2-box.y-box.height/2)).toBeLessThan(2);
    await link.click();await expect(page).toHaveURL(/#components$/);
  }
  await page.locator('.component-preview .nq-feedback').first().screenshot({path:info.outputPath(`feedback-${direction}.png`)});
});

for(const framework of ['react','vue','angular'])test(`${framework} feedback variants and inline link`,async({page},info)=>{
  test.setTimeout(90000);
  await page.goto('/#component/feedback');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption(framework);
  if(framework!=='angular')await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const frame=page.frameLocator('.nq-ide-frame');
  for(const variant of ['text','icon-text','icon']) {
    const root=frame.locator(`.nq-feedback[data-choice-variant="${variant}"]`);
    const choices=root.locator(framework==='react'?'.nq-feedback-actions .nq-choice':'.nq-feedback-actions button');
    await sameRow(choices);
    const controls=root.getByRole(framework==='react'?'radio':'button',{name:'نعم',exact:true});
    await expect(controls).toHaveCount(1);
    await choices.first().click();await expect(frame.locator('output')).toHaveText('yes');
    if(framework==='react') { await controls.press('ArrowDown'); }
    else { await root.getByRole('button',{name:'لا',exact:true}).press('Space'); }
    await expect(frame.locator('output')).toHaveText('no');
    const icon=root.locator('.nq-feedback-icon').first();
    if(variant==='text')await expect(icon).toBeHidden();
    else {await expect(icon).toBeVisible();expect(await icon.evaluate(el=>getComputedStyle(el).maskImage)).toMatch(/thumbs-up\.svg|data:image\/svg\+xml/);}
  }
  await frame.locator('.nq-feedback[data-choice-variant="icon-text"]').screenshot({path:info.outputPath(`${framework}-feedback.png`)});
  await page.goto('/#component/link');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption(framework);
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const link=frame.locator('.nq-link');await expect(link).toHaveCSS('display',/^(inline-)?flex$/);
  const a=(await link.locator('.nq-icon').boundingBox())!,b=(await link.boundingBox())!;
  expect(Math.abs(a.y+a.height/2-b.y-b.height/2)).toBeLessThan(2);
  await link.click();await expect(page).toHaveURL(/#component\/link$/);
});
