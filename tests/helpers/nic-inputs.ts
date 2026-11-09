import { expect, type Page } from '@playwright/test';
export async function checkNicInputGroup(page: Page) {
  const field=page.locator('#group-email');
  const group=page.locator('[data-testid="group-field"].hw-input-group, [data-testid="group-field"] > .hw-input-group');
  const scope=page.getByTestId('nic-showcase');
  const lineSize=()=>group.evaluate(node=>getComputedStyle(node,'::after').backgroundSize);
  const lineColor=async(token:string)=>{
    const result=await group.evaluate((node,token)=>{
      const probe=document.createElement('span');node.append(probe);probe.style.color=`var(${token})`;
      const color=getComputedStyle(probe).color;probe.remove();return {color,line:getComputedStyle(node,'::after').backgroundImage};
    },token);
    expect(result.line).toContain(result.color);
  };
  await expect(page.locator('label[for="group-email"]')).toHaveCSS('font-size','16px');
  await expect(field).toHaveCSS('padding-inline-start','16px');
  await expect(field).toHaveCSS('padding-inline-end','16px');
  await expect(field).toHaveCSS('transition-property','background-size');
  await expect(field).toHaveCSS('transition-duration','0.5s');
  await expect(field).toHaveCSS('transition-timing-function','ease');
  const before=await group.boundingBox();
  expect(before!.height).toBe(40);
  await field.focus();await expect.poll(lineSize).toBe('100% 2px');await lineColor('--hw-color-primary-text');
  await expect(field).toHaveCSS('background-size','0% 2px');await expect(field).toHaveCSS('box-shadow','none');
  await expect(field).toHaveCSS('outline-style','none');
  await field.hover();await page.mouse.down();await expect.poll(lineSize).toBe('50% 2px');await page.mouse.up();
  await expect.poll(lineSize).toBe('100% 2px');
  const after=await group.boundingBox();expect(after!.height).toBe(before!.height);expect(after!.width).toBe(before!.width);
  await page.keyboard.press('Tab');await expect.poll(lineSize).toBe('0% 2px');
  await field.evaluate(node=>(node as HTMLInputElement).required=false);
  await field.fill('');await field.focus();await lineColor('--hw-color-field-active');
  await field.fill('invalid');await page.keyboard.press('Tab');await field.focus();await lineColor('--hw-color-danger');
  await field.fill('ready@example.test');await lineColor('--hw-color-primary-text');
  await field.evaluate(node=>node.setAttribute('aria-invalid','true'));await lineColor('--hw-color-danger');
  await field.evaluate(node=>{node.removeAttribute('aria-invalid');(node as HTMLInputElement).readOnly=true;});
  await page.keyboard.press('Tab');await field.focus();await expect.poll(lineSize).toBe('0% 2px');
  await expect(field).toHaveCSS('outline-width','2px');
  await field.evaluate(node=>(node as HTMLInputElement).readOnly=false);
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(parseFloat(await field.evaluate(node=>getComputedStyle(node).transitionDuration))).toBeLessThanOrEqual(0.00001);
  expect(parseFloat(await group.evaluate(node=>getComputedStyle(node,'::after').transitionDuration))).toBeLessThanOrEqual(0.00001);
  await page.emulateMedia({forcedColors:'active'});await field.focus();await expect(field).toHaveCSS('outline-width','2px');
  expect(await group.evaluate(node=>getComputedStyle(node,'::after').display)).toBe('none');
  await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
  await scope.evaluate(node=>node.setAttribute('data-hw-theme','hawiyah'));
  expect(await group.evaluate(node=>getComputedStyle(node,'::after').display)).toBe('none');
  expect((await field.evaluate(node=>getComputedStyle(node).transitionDuration)).split(',').every(value=>value.trim()==='0.12s')).toBe(true);
  await scope.evaluate(node=>{node.setAttribute('data-hw-theme','custom');node.style.setProperty('--hw-duration-input','75ms');});
  await expect(field).toHaveCSS('transition-duration','0.075s');
}
