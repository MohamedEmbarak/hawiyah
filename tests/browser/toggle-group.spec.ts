import { expect, test } from '@playwright/test';
import { openFixture } from './style-fixture';

// Static fixture with the package stylesheet only: the single-choice ToggleGroup markup of
// React, Vue and vanilla (a bare fieldset) and of Angular (hw-toggle-group around the fieldset).
const fieldset=(id:string,variant:string)=>`<fieldset class="hw-toggle-group" data-variant="${variant}" id="${id}"><legend>City</legend><label><input type="radio" name="${id}" value="a" checked>Riyadh</label><label><input type="radio" name="${id}" value="b">Jeddah</label><label><input type="radio" name="${id}" value="c">Abha</label></fieldset>`;
const containers=[['stack','<div class="hw-stack" style="inline-size:360px">','</div>'],['inline','<div class="hw-inline" style="inline-size:360px">','</div>'],['flow','<div style="inline-size:360px">','</div>']] as const;
for(const variant of ['segmented','outline'] as const)
  for(const lang of ['en','ar'] as const)
    test(`[TOGGLE-GROUP-03] the Angular host does not change the size or position of a ${variant} group (${lang})`,async({page})=>{
      const body=containers.map(([name,open,close])=>`<section style="position:relative;block-size:120px">${open}${fieldset(`bare-${name}`,variant)}${close}</section><section style="position:relative;block-size:120px">${open}<hw-toggle-group id="host-${name}">${fieldset(`hosted-${name}`,variant)}</hw-toggle-group>${close}</section><section>${open}<hw-toggle-group hidden>${fieldset(`hidden-${name}`,variant)}</hw-toggle-group>${close}</section>`).join('');
      await openFixture(page,body,{lang});
      for(const [name] of containers){
        // Position inside the section, so the two fixtures of a container are compared like for like.
        const place=(id:string)=>page.locator(`#${id}`).evaluate(node=>{const box=node.getBoundingClientRect(),section=node.closest('section')!.getBoundingClientRect();return [Math.round(box.left-section.left),Math.round(box.top-section.top),Math.round(box.width),Math.round(box.height)];});
        expect(await place(`hosted-${name}`),name).toEqual(await place(`bare-${name}`));
        await expect(page.locator(`#host-${name}`)).toHaveCSS('display','contents');
        await expect(page.locator(`#hidden-${name}`)).toBeHidden();
      }
    });
