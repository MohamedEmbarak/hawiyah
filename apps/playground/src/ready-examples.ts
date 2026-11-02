import { escape as e, icon, type ComponentId, type Locale } from './data';

export const statusExamples = [
  { tone: 'neutral', en: 'Scheduled maintenance', ar: 'صيانة مجدولة', bodyEn: 'Service hours are shown on this page.', bodyAr: 'مواعيد الخدمة موضّحة في هذه الصفحة.' },
  { tone: 'info', en: 'Before you begin', ar: 'قبل البدء', bodyEn: 'Prepare your supporting documents.', bodyAr: 'جهّز المستندات الداعمة قبل تقديم الطلب.' },
  { tone: 'success', en: 'Request saved', ar: 'تم حفظ الطلب', bodyEn: 'You can return to your draft later.', bodyAr: 'يمكنك العودة إلى المسودة لاحقًا.' },
  { tone: 'warning', en: 'Review required', ar: 'المراجعة مطلوبة', bodyEn: 'Check the entered details before sending.', bodyAr: 'تحقّق من البيانات المدخلة قبل الإرسال.' },
  { tone: 'danger', en: 'Unable to send', ar: 'تعذّر الإرسال', bodyEn: 'Try again or contact support.', bodyAr: 'حاول مجددًا أو تواصل مع الدعم.' },
] as const;

export function statusMarkup(id: 'alert' | 'badge' | 'chip' | 'toast-region', locale: Locale, variant = 'default', prefix = 'status') {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const items = statusExamples.map(item => {
    const label = t(item.en, item.ar), body = t(item.bodyEn, item.bodyAr);
    if (id === 'badge' || id === 'chip') return `<span class="nq-${id}" data-tone="${item.tone}" data-variant="${variant}">${label}</span>`;
    if (id === 'toast-region') return `<div class="nq-toast" id="${prefix}-${item.tone}" data-nq-toast data-tone="${item.tone}"><div class="nq-toast-content"><strong>${label}</strong><p>${body}</p></div><button class="nq-button" data-variant="ghost" type="button" data-nq-dismiss aria-label="${t('Dismiss', 'إغلاق')}: ${label}">${icon('close', 18)}</button></div>`;
    return `<div class="nq-alert" data-tone="${item.tone}" data-variant="${variant}"><div class="nq-alert-content"><strong>${label}</strong><p>${body}</p></div></div>`;
  }).join('\n');
  return id === 'toast-region'
    ? `<div class="nq-toast-region" data-nq="toast-region" data-variant="inline" role="group" aria-live="off" aria-label="${t('Notification examples', 'أمثلة الإشعارات')}">${items}</div>`
    : `<div class="${id === 'alert' ? 'nq-stack' : 'nq-cluster'}">${items}</div>`;
}

type Recipe = { title: string; markup: string; react?: string; vue?: string; angular?: string };

function recipes(id: ComponentId, locale: Locale, preview: (id: ComponentId) => string): Recipe[] {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  if (id === 'alert' || id === 'badge' || id === 'chip') {
    const component = id[0]!.toUpperCase() + id.slice(1);
    const variants = id === 'alert' ? ['default', 'outline', 'minimal'] : id === 'badge' ? ['soft', 'outline', 'dot'] : ['soft', 'outline'];
    return variants.map(variant => {
      const lines = statusExamples.map(item => ({ tone: item.tone, title: t(item.en, item.ar), body: t(item.bodyEn, item.bodyAr) }));
      return {
        title: `${t('All statuses', 'كل الحالات')} · ${variant}`,
        markup: statusMarkup(id, locale, variant, `ready-${id}-${variant}`),
        react: `import { ${component} } from '@nasaq/react';\n\n` + lines.map(s => id === 'alert' ? `<Alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></Alert>` : `<${component} tone="${s.tone}" data-variant="${variant}">${s.title}</${component}>`).join('\n'),
        vue: `<!-- import { ${component} } from '@nasaq/vue' -->\n` + lines.map(s => id === 'alert' ? `<Alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></Alert>` : `<${component} tone="${s.tone}" data-variant="${variant}">${s.title}</${component}>`).join('\n'),
        angular: `<!-- imports: [Nq${component}Component] from @nasaq/angular -->\n` + lines.map(s => id === 'alert' ? `<nq-alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></nq-alert>` : `<nq-${id} tone="${s.tone}" variant="${variant}">${s.title}</nq-${id}>`).join('\n'),
      };
    });
  }
  if (id === 'button') {
    const variants = ['primary', 'default', 'secondary', 'outline', 'outline-white', 'light', 'danger', 'ghost', 'soft', 'link'];
    return [{ title: t('Every appearance', 'جميع الأنماط'),
      markup: `<div class="nq-cluster">${variants.map(v => `<span style="padding:8px;${['outline-white', 'light'].includes(v) ? 'background:#14573a' : ''}"><button class="nq-button" type="button" data-variant="${v}">${v}</button></span>`).join('')}</div>`,
      react: `import { Button } from '@nasaq/react';\n\n${variants.map(v => `<Button variant="${v}">${v}</Button>`).join('\n')}`,
      vue: `<!-- import { Button } from '@nasaq/vue' -->\n${variants.map(v => `<Button variant="${v}">${v}</Button>`).join('\n')}`,
      angular: `<!-- imports: [NqButtonDirective] -->\n${variants.map(v => `<button nqButton variant="${v}" type="button">${v}</button>`).join('\n')}`,
    }, { title: t('Sizes, disabled and loading', 'الأحجام والتعطيل والتحميل'),
      markup: `<div class="nq-cluster">${['sm','md','lg'].map(size => `<button class="nq-button" type="button" data-size="${size}">${size}</button>`).join('')}<button class="nq-button" type="button" disabled>${t('Unavailable', 'غير متاح')}</button><button class="nq-button" type="button" disabled aria-busy="true">${t('Saving…', 'جارٍ الحفظ…')}</button></div>`,
      react: '<Button size="sm">sm</Button>\n<Button size="md">md</Button>\n<Button size="lg">lg</Button>\n<Button disabled>غير متاح</Button>\n<Button loading>جارٍ الحفظ</Button>',
      vue: '<Button size="sm">sm</Button>\n<Button size="md">md</Button>\n<Button size="lg">lg</Button>\n<Button disabled>غير متاح</Button>\n<Button loading>جارٍ الحفظ</Button>',
      angular: '<button nqButton size="sm" type="button">sm</button>\n<button nqButton size="md" type="button">md</button>\n<button nqButton size="lg" type="button">lg</button>\n<button nqButton type="button" disabled>غير متاح</button>\n<button nqButton type="button" disabled aria-busy="true">جارٍ الحفظ</button>',
    }];
  }
  if (id === 'toast-region') {
    const messages = statusExamples.map(s => ({ id: s.tone, tone: s.tone, title: t(s.en,s.ar), message: t(s.bodyEn,s.bodyAr) }));
    return [{ title: t('Every notification status', 'جميع حالات الإشعار'), markup: statusMarkup(id,locale,'default','ready-toast'),
      react: `import { useState } from 'react';\nimport { ToastRegion, type ToastMessage } from '@nasaq/react';\n\nconst initialMessages = ${JSON.stringify(messages.map(({message,...s})=>({...s,description:message})),null,2)} satisfies ToastMessage[];\n// Inside your component:\nconst [messages, setMessages] = useState(initialMessages);\n<ToastRegion messages={messages} onDismiss={id => setMessages(items => items.filter(item => item.id !== id))} />`,
      vue: `<!-- import { ref } from 'vue'; import { ToastRegion } from '@nasaq/vue' -->\n<!-- const messages = ref(${JSON.stringify(messages)}) -->\n<ToastRegion :messages="messages" @dismiss="id => messages = messages.filter(item => item.id !== id)" />`,
      angular: `<!-- imports: [NqToastRegionComponent]; messages: NqToast[] = ${JSON.stringify(messages)} -->\n<nq-toast-region variant="inline" [messages]="messages" (dismissed)="dismiss($event)" />\n<!-- dismiss(id: string) { this.messages = this.messages.filter(item => item.id !== id); } -->`,
    }];
  }
  if (id === 'portal-header') {
    const services = t('Services','الخدمات'), requests = t('My requests','طلباتي'), signIn = t('Sign in','تسجيل الدخول');
    const links = JSON.stringify([{label:services,href:'/services',current:true},{label:requests,href:'/requests'}]);
    const brand = `<img src="${import.meta.env.BASE_URL}brand/assets/nasaq-wordmark.svg" width="80" height="50" alt="نسق">`;
    return [{ title: t('Header with identity, navigation and actions', 'ترويسة بالهوية والتنقل والإجراءات'),
      markup: `<header class="nq-portal-header" data-nq="portal-header"><a class="nq-skip-link" href="#ready-header-main">${t('Skip to content','انتقل إلى المحتوى')}</a><a class="nq-portal-brand" href="/">${brand}</a><button class="nq-button nq-portal-menu-toggle" type="button" data-nq-portal-toggle>${t('Menu','القائمة')}</button><nav data-nq-portal-navigation aria-label="${t('Example navigation','تنقل المثال')}"><ul><li><a href="/services" aria-current="page">${services}</a></li><li><a href="/requests">${requests}</a></li></ul></nav><div class="nq-portal-header-actions"><a class="nq-button" href="/login">${signIn}</a></div></header><section id="ready-header-main" tabindex="-1"><h3>${services}</h3><p>${t('Your page content goes here.','يوضع محتوى صفحتك هنا.')}</p></section>`,
      react: `import { PortalHeader } from '@nasaq/react';\n\n<PortalHeader brand={<img src="/brand/nasaq-wordmark.svg" alt="نسق" width={80} height={50} />} brandHref="/" mainId="main-content" navigation={${links}} actions={<a className="nq-button" href="/login">${signIn}</a>} />\n<main id="main-content" tabIndex={-1}>...</main>`,
      vue: `<!-- import { PortalHeader } from '@nasaq/vue' -->\n<PortalHeader brand="نسق" home-href="/" main-id="main-content" :links='${links}'><template #logo><img src="/brand/nasaq-wordmark.svg" alt="نسق" width="80" height="50"></template><template #actions><a class="nq-button" href="/login">${signIn}</a></template></PortalHeader>\n<main id="main-content" tabindex="-1">...</main>`,
      angular: `<!-- imports: [NqPortalHeaderComponent]; links = ${links} -->\n<nq-portal-header brand="" homeHref="/" mainId="main-content" [links]="links"><img nqBrand src="/brand/nasaq-wordmark.svg" alt="نسق" width="80" height="50"><a class="nq-button" href="/login">${signIn}</a></nq-portal-header>\n<main id="main-content" tabindex="-1">...</main>`,
    }];
  }
  if (id === 'portal-footer') {
    const links = [{label:t('Privacy','الخصوصية'),href:'/privacy'},{label:t('Accessibility','إمكانية الوصول'),href:'/accessibility'},{label:t('Contact us','تواصل معنا'),href:'/contact'}];
    const description=t('A clear platform for your services.','منصة واضحة لخدماتك.'), legal=t('Example platform · 2026','منصة توضيحية · 2026');
    return [{ title:t('Complete footer','تذييل متكامل'),
      markup:`<footer class="nq-portal-footer"><div><img src="${import.meta.env.BASE_URL}brand/assets/nasaq-wordmark-white.svg" width="96" height="60" alt="نسق"><p>${description}</p></div><nav aria-label="${t('Example footer links','روابط تذييل المثال')}"><ul>${links.map(l=>`<li><a href="${l.href}">${l.label}</a></li>`).join('')}</ul></nav><small>${legal}</small></footer>`,
      react:`import { PortalFooter } from '@nasaq/react';\n\n<PortalFooter brand={<img src="/brand/nasaq-wordmark-white.svg" alt="نسق" width={96} height={60} />} description="${description}" links={${JSON.stringify(links)}} legal="${legal}" />`,
      vue:`<!-- import { PortalFooter } from '@nasaq/vue' -->\n<PortalFooter brand="نسق" :links='${JSON.stringify(links)}' copyright="${legal}"><p>${description}</p></PortalFooter>`,
      angular:`<!-- imports: [NqPortalFooterComponent]; links = ${JSON.stringify(links)} -->\n<nq-portal-footer brand="نسق" [links]="links" copyright="${legal}"><p>${description}</p></nq-portal-footer>`,
    }];
  }
  if (id === 'portal-layout') return [{ title:t('Header, page and footer together','الترويسة والصفحة والتذييل معًا'),markup:preview(id).replaceAll('reference-', 'ready-reference-') }];
  return [];
}

export function renderReadyExamples(id: ComponentId, locale: Locale, preview: (id: ComponentId) => string, code: (value: string) => string) {
  const examples=recipes(id,locale,preview); if (!examples.length) return '';
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return `<section id="component-examples" class="guide-content-section"><h2>${t('Ready-to-use examples','أمثلة جاهزة للاستخدام')}</h2><p>${t('Every status is visible below. Demo links stay inside the preview; use your real routes when copying a component. Static examples do not announce every message as a live alert.','تظهر جميع الحالات أدناه. تبقى روابط الأمثلة داخل المعاينة؛ استخدم مسارات تطبيقك عند نسخ المكوّن. لا تعلن الأمثلة الثابتة كل رسالة كتنبيه مباشر.')}</p><div class="ready-examples">${examples.map((r,i)=>`<article class="ready-example" data-ready-example="${id}-${i}"><h3>${e(r.title)}</h3><div class="component-preview" data-demo-preview>${r.markup}</div><details class="source-details"><summary>${t('Copy component code','انسخ شفرة المكوّن')}</summary>${Object.entries({Vanilla:r.markup,React:r.react,Vue:r.vue,Angular:r.angular}).filter(([,v])=>v).map(([name,value])=>`<h4 dir="ltr">${name}</h4>${code(value!)}`).join('')}</details></article>`).join('')}</div></section>`;
}
