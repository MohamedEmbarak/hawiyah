import {getSiteVerificationLabels} from '@hawiyah/core';
import {escape} from './guide-html.ts';
import type {Locale} from './data';

export function siteVerificationDemoLabels(locale:Locale) {
  const ar=locale==='ar';
  return {...getSiteVerificationLabels(locale),label:ar?'شريط التحقق — مثال توضيحي':'Verification banner — demonstration',registrationLabel:ar?'مثال على رابط تسجيل المنصة':'Example platform-registration link'};
}
export function siteVerificationMarkup(locale:Locale,open=false) {
  const c=siteVerificationDemoLabels(locale);
  return `<aside class="hw-site-verification" aria-label="${escape(c.label)}"><details${open?' open':''}><summary><span>${escape(c.label)}</span><span class="hw-verification-toggle">${escape(c.detailsLabel)}<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary><div class="hw-verification-content"><div class="hw-verification-checks"><section><span class="hw-icon" data-icon="link-04" aria-hidden="true"></span><div><h2>${escape(c.domainLabel)} <bdi>example.test</bdi></h2><p>${escape(c.domainDescription)}</p></div></section><section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>${escape(c.httpsLabel)} <bdi>HTTPS</bdi></h2><p>${escape(c.httpsDescription)}</p></div></section></div><p class="hw-verification-registration"><a href="#example-registration" target="_blank" rel="noopener noreferrer">${escape(c.registrationLabel)}<span class="hw-sr-only"> · ${escape(c.externalLabel)}</span></a></p></div></details></aside>`;
}
