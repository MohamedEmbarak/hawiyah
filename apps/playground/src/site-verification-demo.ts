import {getSiteVerificationLabels} from '@nasaq/core';
import {escape,type Locale} from './data';

export function siteVerificationDemoLabels(locale:Locale) {
  const ar=locale==='ar';
  return {...getSiteVerificationLabels(locale),label:ar?'شريط التحقق — مثال توضيحي':'Verification banner — demonstration',registrationLabel:ar?'مثال على رابط تسجيل المنصة':'Example platform-registration link'};
}
export function siteVerificationMarkup(locale:Locale,open=false) {
  const c=siteVerificationDemoLabels(locale);
  return `<aside class="nq-site-verification" aria-label="${escape(c.label)}"><details${open?' open':''}><summary><span>${escape(c.label)}</span><span class="nq-verification-toggle">${escape(c.detailsLabel)}<span class="nq-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary><div class="nq-verification-content"><div class="nq-verification-checks"><section><span class="nq-icon" data-icon="link-04" aria-hidden="true"></span><div><h2>${escape(c.domainLabel)} <bdi>example.test</bdi></h2><p>${escape(c.domainDescription)}</p></div></section><section><span class="nq-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>${escape(c.httpsLabel)} <bdi>HTTPS</bdi></h2><p>${escape(c.httpsDescription)}</p></div></section></div><p class="nq-verification-registration"><a href="#example-registration" target="_blank" rel="noopener noreferrer">${escape(c.registrationLabel)}<span class="nq-sr-only"> · ${escape(c.externalLabel)}</span></a></p></div></details></aside>`;
}
