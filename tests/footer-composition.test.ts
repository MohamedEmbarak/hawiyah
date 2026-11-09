import {createElement as r} from 'react';
import {renderToString as renderReact} from 'react-dom/server';
import {createSSRApp, h} from 'vue';
import {renderToString as renderVue} from 'vue/server-renderer';
import {expect,it} from 'vitest';
import {PortalFooter as ReactFooter} from '../packages/react/src/expanded-content';
import {PortalFooter as VueFooter} from '../packages/vue/src/patterns';
import {portalFooterMarkup} from '../apps/playground/src/portal-footer-demo';

const groups=[{title:'Explore',links:[{label:'Services',href:'/services'},{label:'Partner',href:'https://example.test',external:true}]},{title:'Empty',links:[]}];
const legacy=[{label:'Contact',href:'/contact'}];
const legal=[{label:'Privacy',href:'/privacy'}];
function inspect(html:string) {
  const root=document.createElement('div');root.innerHTML=html;
  expect(root.querySelectorAll('footer')).toHaveLength(1);
  expect(root.querySelectorAll('nav')).toHaveLength(3);
  expect(root.querySelector('nav[aria-label="Explore"] h2')?.textContent).toBe('Explore');
  expect(root.querySelector('nav[aria-label="Empty"]')).toBeNull();
  expect(root.querySelector('a[href="/contact"]')?.textContent).toBe('Contact');
  expect(root.querySelector('.hw-portal-footer-bottom a')?.getAttribute('href')).toBe('/privacy');
  const external=root.querySelector('a[target="_blank"]')!;
  expect(external.getAttribute('rel')).toContain('noopener');
  expect(external.getAttribute('rel')).toContain('noreferrer');
  expect(external.textContent).toContain('New window');
  expect(external.querySelector('[aria-hidden="true"]')).not.toBeNull();
  expect(root.querySelector('.hw-portal-footer-support-content button')?.textContent).toBe('Help');
  expect(root.querySelector('.hw-portal-footer-extra')?.textContent).toBe('Legacy content');
  expect(root.querySelector('.hw-portal-footer-partners img')?.getAttribute('alt')).toBe('Example partner');
  expect(root.querySelectorAll('[id]')).toHaveLength(0);
}
it('React footer preserves legacy content while server-rendering named groups, support and legal links',()=>{
  inspect(renderReact(r(ReactFooter,{brand:r('span',null,'هوية'),description:'Example',links:legacy,groups,legalLinks:legal,legal:'2026',externalLabel:'New window',support:r('button',{type:'button'},'Help'),partners:r('img',{src:'/example.svg',alt:'Example partner'})},'Legacy content')));
});
it('Vue footer preserves legacy content and slots with the same grouped navigation semantics',async()=>{
  inspect(await renderVue(createSSRApp({render:()=>h(VueFooter,{brand:'هوية',description:'Example',links:legacy,groups,legalLinks:legal,copyright:'2026',externalLabel:'New window'}, {default:()=> 'Legacy content',support:()=>h('button',{type:'button'},'Help'),partners:()=>h('img',{src:'/example.svg',alt:'Example partner'})})})));
});
it.each(['ar','en'] as const)('vanilla %s footer has complete groups, actions and policies with unique instance labels',locale=>{
  const root=document.createElement('div');root.innerHTML=portalFooterMarkup(locale,'one')+portalFooterMarkup(locale,'two');
  const ids=Array.from(root.querySelectorAll('[id]'),node=>node.id);
  expect(new Set(ids).size).toBe(ids.length);
  for(const group of root.querySelectorAll('[aria-labelledby]'))expect(root.querySelector(`[id="${group.getAttribute('aria-labelledby')}"]`)).not.toBeNull();
  for(const footer of root.querySelectorAll('footer')) {
    expect(footer.querySelectorAll('.hw-portal-footer-group')).toHaveLength(2);
    expect(footer.querySelectorAll('.hw-portal-footer-actions a')).toHaveLength(2);
    expect(footer.querySelectorAll('.hw-portal-footer-legal a')).toHaveLength(3);
    expect(footer.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('هوية');
  }
});
