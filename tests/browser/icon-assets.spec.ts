import { expect, test } from '@playwright/test';

test('licensed icons load, inherit color and mirror only semantic horizontal arrows',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{
    const sample=document.createElement('section');sample.id='icon-proof';sample.dir='rtl';sample.style.color='rgb(10, 90, 40)';
    sample.innerHTML=`<span class="hw-icon" data-icon="search-01" aria-hidden="true"></span><span class="hw-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true"></span><span dir="ltr"><span class="hw-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true"></span></span>`;
    document.body.append(sample);
  });
  const icons=page.locator('#icon-proof .hw-icon');
  for(const icon of await icons.all()) {
    await expect(icon).toHaveCSS('width','24px');await expect(icon).toHaveCSS('height','24px');
    await expect(icon).toHaveCSS('background-color','rgb(10, 90, 40)');
    const mask=await icon.evaluate(element=>getComputedStyle(element).maskImage);
    expect(mask).not.toBe('none');
    expect(await icon.evaluate(async element=>{const image=new Image();image.src=getComputedStyle(element).maskImage.slice(5,-2);await image.decode();return image.naturalWidth;})).toBe(24);
  }
  await expect(icons.nth(0)).toHaveCSS('transform','none');
  await expect(icons.nth(1)).toHaveCSS('transform','matrix(-1, 0, 0, 1, 0, 0)');
  await expect(icons.nth(2)).toHaveCSS('transform','none');
  await page.emulateMedia({forcedColors:'active'});
  await expect(icons.nth(0)).toHaveCSS('forced-color-adjust','none');
});
