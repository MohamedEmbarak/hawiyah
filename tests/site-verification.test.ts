import {createElement as h} from 'react';
import {renderToString} from 'react-dom/server';
import {createSSRApp,h as v} from 'vue';
import {renderToString as renderVue} from 'vue/server-renderer';
import {expect,it,vi} from 'vitest';
import {resetTextWarnings} from '../packages/core/dist/index.js';
import {SiteVerification as ReactVerification} from '../packages/react/src/site-verification';
import {SiteVerification as VueVerification} from '../packages/vue/src/site-verification';

// The application's copy: the strings the packages used to supply.
const copy={
  ar:{label:'معلومات الموقع',detailsLabel:'كيف تتحقق؟',domainLabel:'تحقق من نطاق الموقع',domainDescription:'تأكد من تطابق العنوان مع النطاق الرسمي للجهة.',httpsLabel:'تحقق من الاتصال الآمن',httpsDescription:'تأكد من أن العنوان يبدأ بـ HTTPS قبل مشاركة بياناتك.',registrationLabel:'التحقق من تسجيل المنصة',externalLabel:'يفتح في نافذة جديدة'},
  en:{label:'Website information',detailsLabel:'How to verify',domainLabel:'Check the website domain',domainDescription:'Check that the address matches the organization’s official domain.',httpsLabel:'Check the secure connection',httpsDescription:'Check that the address starts with HTTPS before sharing your information.',registrationLabel:'Verify platform registration',externalLabel:'opens in a new window'},
};

for(const framework of ['react','vue'])it(`${framework} verification has no invented claim or certificate and supports server-rendered customization`,async()=>{
  const render=async(props:Record<string,unknown>)=>framework==='react'?renderToString(h(ReactVerification,props)):renderVue(createSSRApp({render:()=>v(VueVerification,props)}));
  const root=document.createElement('div');root.innerHTML=await render({...copy.ar});
  expect(root.querySelector('summary')?.textContent).toContain('معلومات الموقع');
  expect(root.querySelector('details')?.open).toBe(false);
  expect(root.querySelector('a')).toBeNull();expect(root.querySelectorAll('.hw-verification-checks section')).toHaveLength(1);
  expect(root.textContent).not.toContain('موقع حكومي');
  root.innerHTML=await render({...copy.en,label:'Organization website',domain:'example.test',registrationHref:'https://example.test/registration',registrationNumber:'012345',defaultOpen:true});
  expect(root.querySelector('details')?.open).toBe(true);
  expect(root.querySelectorAll('.hw-verification-checks section')).toHaveLength(2);
  expect(root.querySelector('a')?.getAttribute('href')).toBe('https://example.test/registration');
  expect(root.querySelector('a')?.getAttribute('target')).toBe('_blank');
  expect(root.querySelector('a')?.getAttribute('rel')).toBe('noopener noreferrer');
  expect(root.querySelector('a')?.textContent).toContain('opens in a new window');
  expect(root.querySelector('a bdi')?.textContent).toBe('012345');
  expect(root.querySelector('summary')?.textContent).toContain('Organization website');
  expect(root.querySelector('summary')?.getAttribute('role')).toBeNull();
  root.innerHTML=await render({...copy.ar,registrationHref:'/registration',registrationExternal:false});
  expect(root.querySelector('a')?.getAttribute('target')).toBeNull();
  expect(root.querySelector('a')?.textContent).toBe('التحقق من تسجيل المنصة');
  resetTextWarnings();
  const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
  try{
    root.innerHTML=await render({});
    expect(root.querySelector('aside')?.hasAttribute('aria-label')).toBe(false);
    expect(root.querySelector('summary')?.textContent).toBe('');
    expect(root.querySelector('.hw-verification-checks h2')?.textContent).toBe('');
    expect(warn.mock.calls.some(call=>String(call[0]).startsWith('Hawiyah: SiteVerification requires "label"'))).toBe(true);
  }finally{warn.mockRestore();}
});
