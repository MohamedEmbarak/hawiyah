import {escape, type Locale} from './data';

export function portalFooterExampleData(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return {
    description:t('Find services, track requests and get support in one place.','تعرّف على الخدمات، وتابع طلباتك، واحصل على الدعم من مكان واحد.'),
    groups:[
      {title:t('Explore the platform','استكشف المنصة'),links:[
        {label:t('About the platform','عن المنصة'),href:'/about'},
        {label:t('Digital services','الخدمات الرقمية'),href:'/services'},
        {label:t('News and updates','الأخبار والمستجدات'),href:'/news'},
        {label:t('Open data','البيانات المفتوحة'),href:'/open-data'},
      ]},
      {title:t('Useful links','روابط مفيدة'),links:[
        {label:t('Service guide','دليل الخدمات'),href:'/guide'},
        {label:t('Frequently asked questions','الأسئلة الشائعة'),href:'/faq'},
        {label:t('Participation and feedback','المشاركة والملاحظات'),href:'/participate'},
      ]},
    ],
    legalLinks:[
      {label:t('Privacy policy','سياسة الخصوصية'),href:'/privacy'},
      {label:t('Terms of use','شروط الاستخدام'),href:'/terms'},
      {label:t('Accessibility','إمكانية الوصول'),href:'/accessibility'},
    ],
    legal:t('Example platform · 2026','منصة توضيحية · 2026'),
    legalLinksLabel:t('Policies and accessibility','السياسات وإمكانية الوصول'),
    supportLabel:t('Help and contact','المساعدة والتواصل'),
    supportDescription:t('Choose a support channel that works for you.','اختر قناة الدعم المناسبة لك.'),
    helpLabel:t('Help centre','مركز المساعدة'),contactLabel:t('Contact us','تواصل معنا'),
    partnerLabel:t('Your organisation and licensed partner identities belong here.','توضع هنا هوية الجهة والشركاء المصرّح باستخدامها.'),
  };
}

export function portalFooterMarkup(locale: Locale, prefix='footer-demo') {
  const data=portalFooterExampleData(locale);
  const links=(items:readonly {label:string;href:string}[])=>`<ul class="hw-portal-footer-links">${items.map(link=>`<li><a class="hw-link" href="${escape(link.href)}">${escape(link.label)}</a></li>`).join('')}</ul>`;
  return `<footer class="hw-portal-footer"><div class="hw-portal-footer-main"><div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks"><span class="hw-portal-footer-wordmark" role="img" aria-label="هوية"></span></div><p>${escape(data.description)}</p></div>${data.groups.map((group,index)=>`<nav class="hw-portal-footer-group" aria-labelledby="${escape(prefix)}-group-${index}"><h2 id="${escape(prefix)}-group-${index}">${escape(group.title)}</h2>${links(group.links)}</nav>`).join('')}<section class="hw-portal-footer-support" aria-labelledby="${escape(prefix)}-support"><h2 id="${escape(prefix)}-support">${escape(data.supportLabel)}</h2><div class="hw-portal-footer-support-content"><p>${escape(data.supportDescription)}</p><div class="hw-portal-footer-actions"><a class="hw-button" data-variant="outline-white" href="/help">${escape(data.helpLabel)}</a><a class="hw-button" data-variant="outline-white" href="/contact">${escape(data.contactLabel)}</a></div></div></section></div><div class="hw-portal-footer-bottom"><small>${escape(data.legal)}</small><nav class="hw-portal-footer-legal" aria-label="${escape(data.legalLinksLabel)}">${links(data.legalLinks)}</nav></div></footer>`;
}
