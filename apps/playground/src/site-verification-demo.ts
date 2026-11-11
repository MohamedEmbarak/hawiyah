import {escape} from './guide-html.ts';
import type {Locale} from './data';

/** The application's own verification texts; the packages hold no wording. */
export function siteVerificationDemoLabels(locale:Locale) {
  return locale==='ar' ? {
    label:'شريط التحقق — مثال توضيحي', detailsLabel:'كيف تتحقق؟',
    domainLabel:'تحقق من نطاق الموقع',
    domainDescription:'تأكد من تطابق العنوان مع النطاق الرسمي للجهة.',
    httpsLabel:'تحقق من الاتصال الآمن HTTPS',
    httpsDescription:'تأكد من أن العنوان يبدأ بـ HTTPS قبل مشاركة بياناتك.',
    registrationLabel:'مثال على رابط تسجيل المنصة', externalLabel:'يفتح في نافذة جديدة',
  } : {
    label:'Verification banner — demonstration', detailsLabel:'How to verify',
    domainLabel:'Check the website domain',
    domainDescription:'Check that the address matches the organization’s official domain.',
    httpsLabel:'Check the secure connection HTTPS',
    httpsDescription:'Check that the address starts with HTTPS before sharing your information.',
    registrationLabel:'Example platform-registration link', externalLabel:'opens in a new window',
  };
}
type Syntax='react'|'vue'|'angular';
/** The same texts as framework attributes, so every variant passes identical wording. */
export function siteVerificationTextAttributes(locale:Locale,syntax:Syntax) {
  const c=siteVerificationDemoLabels(locale);
  const kebab=(name:string)=>syntax==='vue'?name.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase()):name;
  return (Object.keys(c) as (keyof typeof c)[]).map(name=>`${kebab(name)}="${escape(c[name])}"`).join(' ');
}
export function siteVerificationMarkup(locale:Locale,open=false) {
  const c=siteVerificationDemoLabels(locale);
  return `<aside class="hw-site-verification" aria-label="${escape(c.label)}"><details${open?' open':''}><summary><span>${escape(c.label)}</span><span class="hw-verification-toggle">${escape(c.detailsLabel)}<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary><div class="hw-verification-content"><div class="hw-verification-checks"><section><span class="hw-icon" data-icon="link-04" aria-hidden="true"></span><div><h2>${escape(c.domainLabel)} <bdi>example.test</bdi></h2><p>${escape(c.domainDescription)}</p></div></section><section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>${escape(c.httpsLabel)}</h2><p>${escape(c.httpsDescription)}</p></div></section></div><p class="hw-verification-registration"><a href="#example-registration" target="_blank" rel="noopener noreferrer">${escape(c.registrationLabel)}<span class="hw-sr-only"> · ${escape(c.externalLabel)}</span></a></p></div></details></aside>`;
}
