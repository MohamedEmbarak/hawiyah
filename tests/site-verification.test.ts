import {createElement as h} from 'react';
import {renderToString} from 'react-dom/server';
import {createSSRApp,h as v} from 'vue';
import {renderToString as renderVue} from 'vue/server-renderer';
import {expect,it} from 'vitest';
import {SiteVerification as ReactVerification} from '../packages/react/src/site-verification';
import {SiteVerification as VueVerification} from '../packages/vue/src/site-verification';

for(const framework of ['react','vue'])it(`${framework} verification has no invented claim or certificate and supports server-rendered customization`,async()=>{
  const render=async(props:Record<string,unknown>)=>framework==='react'?renderToString(h(ReactVerification,props)):renderVue(createSSRApp({render:()=>v(VueVerification,props)}));
  const root=document.createElement('div');root.innerHTML=await render({});
  expect(root.querySelector('summary')?.textContent).toContain('معلومات الموقع');
  expect(root.querySelector('details')?.open).toBe(false);
  expect(root.querySelector('a')).toBeNull();expect(root.querySelectorAll('.nq-verification-checks section')).toHaveLength(1);
  expect(root.textContent).not.toContain('موقع حكومي');
  root.innerHTML=await render({locale:'en',label:'Organization website',domain:'example.test',registrationHref:'https://example.test/registration',registrationNumber:'012345',defaultOpen:true});
  expect(root.querySelector('details')?.open).toBe(true);
  expect(root.querySelectorAll('.nq-verification-checks section')).toHaveLength(2);
  expect(root.querySelector('a')?.getAttribute('href')).toBe('https://example.test/registration');
  expect(root.querySelector('a')?.getAttribute('target')).toBe('_blank');
  expect(root.querySelector('a')?.getAttribute('rel')).toBe('noopener noreferrer');
  expect(root.querySelector('a')?.textContent).toContain('opens in a new window');
  expect(root.querySelector('a bdi')?.textContent).toBe('012345');
  expect(root.querySelector('summary')?.getAttribute('role')).toBeNull();
  root.innerHTML=await render({registrationHref:'/registration',registrationExternal:false});
  expect(root.querySelector('a')?.getAttribute('target')).toBeNull();
});
