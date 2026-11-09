import {expect,test} from '@playwright/test';

for(const direction of ['rtl','ltr'])test(`editor framework badges stay centered and readable in ${direction}`,async({page},testInfo)=>{
  await page.goto('/#component/checkbox');await page.locator('[data-guide-tab="playground"]').click();
  for(const width of [1864,390]) {
    await page.setViewportSize({width,height:884});
    for(const framework of ['vanilla','react','vue','angular']) {
      await page.locator('[data-project-framework]').selectOption(framework);
      await page.locator('.hw-ide').evaluate((node,direction)=>node.setAttribute('dir',direction),direction);
      const badge=page.locator('.hw-ide-project-icon'), icon=badge.locator('svg');
      await expect(icon).toHaveAttribute('data-framework-icon',framework==='vanilla'?'javascript':framework);
      await expect(icon).toHaveAttribute('aria-hidden','true');
      const box=(await badge.boundingBox())!, mark=(await icon.boundingBox())!;
      expect(box.width).toBeCloseTo(36,1);expect(box.height).toBeCloseTo(36,1);
      expect(mark.width).toBeCloseTo(22,1);expect(mark.height).toBeCloseTo(22,1);
      expect(mark.x+mark.width/2).toBeCloseTo(box.x+box.width/2,1);
      expect(mark.y+mark.height/2).toBeCloseTo(box.y+box.height/2,1);
    }
  }
  await page.setViewportSize({width:1864,height:884});
  await page.locator('[data-project-framework]').selectOption('vanilla');
  await page.locator('.hw-ide-project').screenshot({path:testInfo.outputPath(`editor-js-badge-${direction}.png`)});
});
