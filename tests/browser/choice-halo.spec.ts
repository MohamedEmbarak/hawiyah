import { expect, test } from '@playwright/test';
for(const dir of ['ltr','rtl'])test(`choice halo stays centered with plain and wrapped labels in ${dir}`,async({page})=>{
  await page.goto('/#components');
  await page.evaluate(dir=>{
    document.body.innerHTML=`<main data-nq-theme="dga" dir="${dir}" style="padding:40px;display:grid;gap:30px">
      <label><input class="nq-checkbox" type="checkbox">Plain inline label</label>
      <label class="nq-choice"><input class="nq-checkbox" type="checkbox">Flex label</label>
      <label class="nq-choice" style="width:160px"><input class="nq-radio" type="radio">A wrapping label with enough content to occupy several lines</label>
      <label><input class="nq-radio" type="radio" checked>Selected inline radio</label></main>`;
  },dir);
  for(const input of await page.locator('input').all()) {
    await input.hover();
    await expect.poll(()=>input.evaluate(n=>getComputedStyle(n,'::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    const geometry=await input.evaluate(n=>{
      const box=n.getBoundingClientRect(),control=getComputedStyle(n),halo=getComputedStyle(n,'::after');
      return {dx:parseFloat(halo.left)+parseFloat(halo.width)/2+parseFloat(control.borderLeftWidth)-box.width/2,dy:parseFloat(halo.top)+parseFloat(halo.height)/2+parseFloat(control.borderTopWidth)-box.height/2,z:halo.zIndex,isolation:getComputedStyle(n.parentElement!).isolation};
    });
    expect(geometry.dx).toBe(0);expect(geometry.dy).toBe(0);
    expect(geometry.z).toBe('-1');expect(geometry.isolation).toBe('isolate');
  }
});
