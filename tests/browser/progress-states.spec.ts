import { expect, test } from '@playwright/test';
import { contrast, openFixture, pixels } from './style-fixture';
const body=`<div id="surface" style="padding:16px;background:var(--hw-color-surface)">
  <progress class="hw-progress" id="zero" value="0" max="100" aria-label="Zero" style="inline-size:200px"></progress><br>
  <progress class="hw-progress" id="part" value="65" max="100" aria-label="Part" style="inline-size:200px"></progress><br>
  <progress class="hw-progress" id="busy" max="100" aria-label="Busy" style="inline-size:200px"></progress><br>
  <div class="hw-skeleton" id="skeleton" style="inline-size:200px;block-size:20px"></div><br>
  <div class="hw-meter" style="inline-size:200px"><meter id="meter" value="0.3" aria-label="Storage"></meter></div>
</div>`;
const shot=(page:import('@playwright/test').Page,id:string)=>page.locator(`#${id}`).screenshot({animations:'allow'});
for(const lang of ['en','ar'] as const)
  test(`indeterminate progress moves along the inline axis and differs from 0% (${lang})`,async({page})=>{
    await openFixture(page,body,{lang});
    const busy=page.locator('#busy');
    expect(await busy.evaluate(node=>node.matches(':indeterminate'))).toBe(true);
    await expect(busy).toHaveCSS('animation-name','hw-progress-indeterminate');
    await expect(busy).toHaveCSS('animation-direction',lang==='ar'?'reverse':'normal');
    const zero=await shot(page,'zero');
    const first=await shot(page,'busy');await page.waitForTimeout(350);const second=await shot(page,'busy');
    expect(first.equals(zero)&&second.equals(zero)).toBe(false);
    expect(first.equals(second)).toBe(false);
  });
test('reduced motion shows static stripes that still differ from 0%',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await openFixture(page,body);
  await expect(page.locator('#busy')).toHaveCSS('animation-name','none');
  const first=await shot(page,'busy');await page.waitForTimeout(350);const second=await shot(page,'busy');
  expect(first.equals(second)).toBe(true);
  expect(first.equals(await shot(page,'zero'))).toBe(false);
});
for(const theme of [undefined,'hawiyah'])
  test(`dark tracks and skeletons stay visible on the surface (${theme??'dga'} theme)`,async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await openFixture(page,body,{mode:'dark',theme});
    const png=await page.locator('#surface').screenshot();
    const box=(await page.locator('#surface').boundingBox())!;
    const at=async(id:string,fraction:number)=>{const b=(await page.locator(`#${id}`).boundingBox())!;return [b.x-box.x+b.width*fraction,b.y-box.y+b.height/2] as [number,number];};
    const [surface,track,skeleton,meter]=await pixels(page,png,[[4,4],await at('zero',0.5),await at('skeleton',0.5),await at('meter',0.9)]);
    for(const sample of [track,skeleton,meter]) {
      expect(sample).not.toBe(surface);
      expect(contrast(`rgb(${sample})`,`rgb(${surface})`)).toBeGreaterThan(1.5);
    }
  });
test('light tracks keep surface-muted',async({page})=>{
  await openFixture(page,body);
  const muted=await page.evaluate(()=>{const probe=document.createElement('i');probe.style.color='var(--hw-color-surface-muted)';document.body.append(probe);return getComputedStyle(probe).color;});
  await expect(page.locator('#zero')).toHaveCSS('background-color',muted);
  await expect(page.locator('#skeleton')).toHaveCSS('background-color',muted);
});
test('forced colours keep the progress value visible',async({page})=>{
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await openFixture(page,body);
  const png=await shot(page,'part');const box=(await page.locator('#part').boundingBox())!;
  const [value,rest]=await pixels(page,png,[[box.width*0.3,box.height/2],[box.width*0.9,box.height/2]]);
  expect(value).not.toBe(rest);
  expect(png.equals(await shot(page,'zero'))).toBe(false);
  expect((await shot(page,'busy')).equals(await shot(page,'zero'))).toBe(false);
});
