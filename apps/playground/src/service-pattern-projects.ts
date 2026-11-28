import type {Locale} from './data';
import type {ProjectExample} from './project-examples';
import type {ProjectFramework, ProjectLanguage} from './project-compiler';

const components = {'service-card':'ServiceCard','service-details':'ServiceDetails','cookie-consent':'CookieConsent','notification-list':'NotificationList'} as const;
export type ServicePatternId = keyof typeof components;
export const servicePatternIds = Object.keys(components) as ServicePatternId[];
export function isServicePatternId(id: string): id is ServicePatternId { return Object.hasOwn(components,id); }

type Recipe = {
  vanilla: string; vanillaState: string; react: string; reactState?: string;
  vue: string; vueState?: string; angular: string; angularState?: string;
};
type Translate = (english: string, arabic: string) => string;

function service(id: 'service-card'|'service-details', t: Translate, typed: boolean): Recipe {
  const title = t('Renew a permit','تجديد تصريح');
  const description = t('Apply to renew an existing permit.','قدّم طلبًا لتجديد تصريح قائم.');
  const category = t('Permits','التصاريح'), term = t('Duration','المدة'), duration = t('48 hours','48 ساعة');
  const action = t('View service','عرض الخدمة'), start = t('Start request','بدء الطلب');
  const requirements = t('Required documents','المستندات المطلوبة'), document = t('Current permit','التصريح الحالي');
  const href = '/services/renew-permit';
  const message = id === 'service-card' ? t('Service selected locally.','تم اختيار الخدمة محليًا.') : t('Draft started locally.','تم بدء المسودة محليًا.');
  const meta = JSON.stringify([{term,description:duration}]);
  const details = `<dl class="hw-description-list"><div><dt>${term}</dt><dd>${duration}</dd></div></dl>`;
  const list = `<section><h3>${requirements}</h3><ul><li>${document}</li></ul></section>`;
  if (id === 'service-card') return {
    vanilla: `<article class="hw-card hw-service-card"><span class="hw-badge">${category}</span><h3>${title}</h3><p>${description}</p>${details}<a class="hw-link" href="${href}">${action}</a></article>`,
    vanillaState: `root.querySelector('a')?.addEventListener('click', event => {
  event.preventDefault();
  output.textContent = '${message}';
}, events);`,
    react: `<div onClick={event => { if (event.target instanceof Element && event.target.closest('a[href]')) {event.preventDefault(); setStatus('${message}');} }}>
    <ServiceCard title="${title}" description="${description}" category="${category}" metadata={${meta}} href="${href}" actionLabel="${action}" />
  </div>`,
    vue: `<div @click="openService"><ServiceCard title="${title}" description="${description}" category="${category}" :metadata='${meta}' href="${href}" action-label="${action}" /></div>`,
    vueState: `function openService(event${typed ? ': Event' : ''}) {
  if (event.target instanceof Element && event.target.closest('a[href]')) {
    event.preventDefault();
    status.value = '${message}';
  }
}`,
    angular: `<hw-service-card title="${title}" description="${description}" category="${category}" [metadata]="details" href="${href}" actionLabel="${action}" (click)="openService($event)" />`,
    angularState: `openService(event: Event) {
    if (event.target instanceof Element && event.target.closest('a[href]')) {
      event.preventDefault();
      this.status = '${message}';
    }
  }
  readonly details = ${meta};`,
  };
  return {
    vanilla: `<article class="hw-service-details"><header><h2>${title}</h2><p>${description}</p></header>${details}${list}<footer><button class="hw-button" type="button">${start}</button></footer></article>`,
    vanillaState: `root.querySelector('button')?.addEventListener('click', () => {output.textContent = '${message}';}, events);`,
    react: `<ServiceDetails title="${title}" description="${description}" metadata={${meta}} requirements={['${document}']} requirementsLabel="${requirements}" action={<Button onClick={() => setStatus('${message}')}>${start}</Button>} />`,
    vue: `<ServiceDetails title="${title}" description="${description}" :metadata='${meta}' :requirements="['${document}']" requirements-label="${requirements}">
    <template #action><Button @click="status = '${message}'">${start}</Button></template>
  </ServiceDetails>`,
    angular: `<hw-service-details title="${title}" description="${description}" [metadata]="details" [requirements]="['${document}']" requirementsLabel="${requirements}">
    <button hwButton hwServiceAction type="button" (click)="status = '${message}'">${start}</button>
  </hw-service-details>`,
    angularState:`readonly details = ${meta};`,
  };
}

function consent(t: Translate, typed: boolean): Recipe {
  const title = t('Optional cookies','ملفات الارتباط الاختيارية');
  const description = t('This example keeps your choice in memory for this preview.','يحتفظ هذا المثال بخيارك في ذاكرة المعاينة الحالية.');
  const accept = t('Accept optional cookies','قبول ملفات الارتباط الاختيارية'), reject = t('Decline optional cookies','رفض ملفات الارتباط الاختيارية');
  const accepted = t('Optional cookies accepted.','تم قبول ملفات الارتباط الاختيارية.'), rejected = t('Optional cookies declined.','تم رفض ملفات الارتباط الاختيارية.');
  const reopen = t('Review choice','مراجعة الخيار'), prefs = t('About these choices','حول هذه الخيارات');
  const attrs = `description="${description}"`;
  return {
    vanilla: `<section class="hw-cookie-consent" data-hw="cookie-consent" aria-label="${title}"><h2>${title}</h2><p>${description}</p><div class="hw-button-group">
    <button type="button" class="hw-button" data-hw-consent="accepted">${accept}</button>
    <button type="button" class="hw-button" data-variant="secondary" data-hw-consent="rejected">${reject}</button>
    <button type="button" class="hw-button" data-variant="ghost" data-preferences>${prefs}</button>
  </div></section>
  <button type="button" class="hw-button" data-variant="secondary" data-review-choice>${reopen}</button>`,
    vanillaState: `const banner = root.querySelector('[data-hw="cookie-consent"]');
if (!(banner instanceof HTMLElement)) throw new Error('Missing consent region');
const consent = createCookieConsent(banner, {onConsent: choice => {
  output.textContent = choice === 'accepted' ? '${accepted}' : '${rejected}';
}});
banner.querySelector('[data-preferences]')?.addEventListener('click', () => {output.textContent = '${description}';}, events);
root.querySelector('[data-review-choice]')?.addEventListener('click', () => {
  consent.setOpen(true);
  output.textContent = '—';
}, events);
scope.signal.addEventListener('abort', () => consent.destroy(), {once:true});`,
    reactState: 'const [open, setOpen] = useState(true);',
    react: `<CookieConsent title="${title}" ${attrs} acceptLabel="${accept}" rejectLabel="${reject}" preferencesLabel="${prefs}" open={open} onOpenChange={setOpen}
    onConsent={choice => setStatus(choice === 'accepted' ? '${accepted}' : '${rejected}')} onPreferences={() => setStatus('${description}')} />
  <Button variant="secondary" data-review-choice onClick={() => {setOpen(true); setStatus('—');}}>${reopen}</Button>`,
    vueState:'const open = ref(true);',
    vue: `<CookieConsent title="${title}" ${attrs} accept-label="${accept}" reject-label="${reject}" preferences-label="${prefs}" v-model:open="open"
    @consent="choice => status = choice === 'accepted' ? '${accepted}' : '${rejected}'" @preferences="status = '${description}'" />
  <Button variant="secondary" data-review-choice @click="open = true; status = '—'">${reopen}</Button>`,
    angularState:'open = true;',
    angular: `<hw-cookie-consent title="${title}" ${attrs} acceptLabel="${accept}" rejectLabel="${reject}" preferencesLabel="${prefs}" [(open)]="open"
    (consent)="status = $event === 'accepted' ? '${accepted}' : '${rejected}'" (preferences)="status = '${description}'" />
  <button hwButton type="button" variant="secondary" data-review-choice (click)="open = true; status = '—'">${reopen}</button>`,
  };
}

function notifications(t: Translate, typed: boolean): Recipe {
  const label = t('Request updates','تحديثات الطلب'), unread = t('Unread','غير مقروء');
  const mark = t('Mark as read','تحديد كمقروء'), all = t('Mark all as read','تحديد الكل كمقروء');
  const dismiss = t('Dismiss','إزالة'), clear = t('Clear list','مسح القائمة'), empty = t('You have no notifications.','لا توجد إشعارات.');
  const marked = t('Marked as read.','تم التحديد كمقروء.'), cleared = t('List cleared.','تم مسح القائمة.');
  const items = [{id:'review',title:t('Review complete','اكتملت المراجعة'),read:false},{id:'received',title:t('Request received','تم استلام الطلب'),read:true}];
  const initial = JSON.stringify(items);
  return {
    vanilla: `<section class="hw-notification-list" aria-label="${label}"><h2>${label}</h2><ul>${items.map(item=>`<li data-state="${item.read ? 'read':'unread'}"><h3>${item.title}</h3>${item.read ? '' : `<span class="hw-badge">${unread}</span><button class="hw-button" type="button" data-mark-read>${mark}</button>`}<button class="hw-button" data-variant="ghost" type="button" data-dismiss>${dismiss}</button></li>`).join('')}</ul><p hidden data-empty>${empty}</p></section>
  <div class="hw-inline"><button class="hw-button" type="button" data-mark-all>${all}</button><button class="hw-button" type="button" data-clear-list>${clear}</button></div>`,
    vanillaState: `root.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest('[data-mark-all], [data-mark-read]')) {
    const rows = event.target.closest('[data-mark-all]') ? root.querySelectorAll('li') : [event.target.closest('li')];
    for (const row of rows) {
      if (!row) continue;
      row.dataset.state = 'read';
      row.querySelector('.hw-badge')?.remove();
      row.querySelector('[data-mark-read]')?.remove();
    }
    output.textContent = '${marked}';
  }
  if (event.target.closest('[data-dismiss]')) event.target.closest('li')?.remove();
  if (event.target.closest('[data-clear-list]')) {
    root.querySelector('ul')?.replaceChildren();
    root.querySelector('[data-empty]')?.removeAttribute('hidden');
    output.textContent = '${cleared}';
  }
}, events);`,
    reactState: `const [items, setItems] = useState(${initial});
  function markRead(id${typed ? '?: string' : ''}) {
    setItems(current => current.map(item => !id || item.id === id ? {...item, read:true} : item));
    setStatus('${marked}');
  }
  function dismiss(id${typed ? ': string' : ''}) { setItems(current => current.filter(item => item.id !== id)); }`,
    react: `<NotificationList label="${label}" items={items} emptyMessage="${empty}" unreadLabel="${unread}" onRead={markRead} getMarkReadLabel={item => '${mark} — ' + item.title} onDismiss={dismiss} getDismissLabel={item => '${dismiss} — ' + item.title} />
  <div className="hw-inline"><Button data-mark-all onClick={() => markRead()}>${all}</Button><Button variant="secondary" data-clear-list onClick={() => {setItems([]); setStatus('${cleared}');}}>${clear}</Button></div>`,
    vueState:`const items = ref(${initial});
function markRead(id${typed ? '?: string' : ''}) {
  items.value = items.value.map(item => !id || item.id === id ? {...item, read:true} : item);
  status.value = '${marked}';
}
function dismiss(id${typed ? ': string' : ''}) { items.value = items.value.filter(item => item.id !== id); }`,
    vue:`<NotificationList label="${label}" :items="items" empty-message="${empty}" unread-label="${unread}" :get-mark-read-label="item => '${mark} — ' + item.title" :get-dismiss-label="item => '${dismiss} — ' + item.title" @read="markRead" @dismiss="dismiss" />
  <div class="hw-inline"><Button data-mark-all @click="markRead()">${all}</Button><Button variant="secondary" data-clear-list @click="items = []; status = '${cleared}'">${clear}</Button></div>`,
    angularState: `items = ${initial};
  markRead(id?: string) { this.items = this.items.map(item => !id || item.id === id ? {...item, read:true} : item); this.status = '${marked}'; }
  markReadLabel = (item: {title: string}) => '${mark} — ' + item.title;
  dismissLabel = (item: {title: string}) => '${dismiss} — ' + item.title;
  dismiss(id: string) { this.items = this.items.filter(item => item.id !== id); }`,
    angular:`<hw-notification-list label="${label}" [items]="items" emptyMessage="${empty}" unreadLabel="${unread}" [getMarkReadLabel]="markReadLabel" (read)="markRead($event)" [getDismissLabel]="dismissLabel" (dismissed)="dismiss($event)" />
  <div class="hw-inline"><button hwButton type="button" data-mark-all (click)="markRead()">${all}</button><button hwButton type="button" variant="secondary" data-clear-list (click)="items = []; status = '${cleared}'">${clear}</button></div>`,
  };
}

export function servicePatternProject(id: ServicePatternId, framework: ProjectFramework, language: ProjectLanguage, locale: Locale): ProjectExample {
  const t: Translate = (en,ar) => locale === 'ar' ? ar : en;
  const typed = language === 'typescript', dir = locale === 'ar' ? 'rtl':'ltr';
  const r = id === 'cookie-consent' ? consent(t,typed) : id === 'notification-list' ? notifications(t,typed) : service(id,t,typed);
  const name = components[id], useButton = id !== 'service-card';
  const main = `data-service-project="${id}" lang="${locale}" dir="${dir}"`;
  const output = t('Local result','النتيجة المحلية');
  const entry = framework === 'angular' ? 'main.ts' : `main.${typed ? 'ts':'js'}${framework === 'react' ? 'x':''}`;
  const css = "@import '@hawiyah/styles/styles.css';\n\n.demo { display: grid; gap: 1rem; min-inline-size: 0; }\n";
  const project = (file: string, html: string, js: string, host: string): ProjectExample => ({
    files:{html,css,js}, names:{html:file,css:'style.css',js:entry},entry,host,
  });
  if (framework === 'vanilla') return project('index.html',`<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${output}</title></head><body>
<main class="demo" ${main}>
  ${r.vanilla}
  <p>${output} <output data-service-status>—</output></p>
</main><script type="module" src="./${entry}"></script></body></html>`,`import { ${id === 'cookie-consent' ? 'createCookieConsent':'enhance'} } from '@hawiyah/vanilla';
import './style.css';

const root = document.querySelector('[data-service-project]');
const output = root?.querySelector('output');
if (!(root instanceof HTMLElement) || !output) throw new Error('Missing project');
const scope = new AbortController();
const events = {signal:scope.signal};
${id === 'cookie-consent' ? '' : "const release = enhance(root);\nscope.signal.addEventListener('abort', release, {once:true});\n"}${r.vanillaState}
window.addEventListener('pagehide', () => scope.abort(), {once:true});
`,'');
  if (framework === 'react') return project(typed?'App.tsx':'App.jsx',`import { useState } from 'react';
import { ${name}${useButton?', Button':''} } from '@hawiyah/react';

export default function App() {
  const [status, setStatus] = useState('—');
  ${r.reactState || ''}
  return <main className="demo" ${main}>
    ${r.react}
    <p>${output} <output data-service-status>{status}</output></p>
  </main>;
}
`,"import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\nconst root = document.getElementById('app');\nif (root) createRoot(root).render(<App />);\n",'<div id="app"></div>');
  if (framework === 'vue') return project('App.vue',`<script setup${typed?' lang="ts"':''}>
import { ref } from 'vue';
import { ${name}${useButton?', Button':''} } from '@hawiyah/vue';
const status = ref('—');
${r.vueState || ''}
</script>
<template><main class="demo" ${main}>
  ${r.vue}
  <p>${output} <output data-service-status>{{ status }}</output></p>
</main></template>
`,"import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\ncreateApp(App).mount('#app');\n",'<div id="app"></div>');
  const imports = `Hw${name}Component${useButton?', HwButtonDirective':''}`;
  return project('app.component.ts',`import { Component } from '@angular/core';
import { ${imports} } from '@hawiyah/angular';
@Component({
  selector:'app-root', standalone:true, imports:[${imports}],
  template:\`<main class="demo" ${main}>
    ${r.angular}
    <p>${output} <output data-service-status>{{ status }}</output></p>
  </main>\`,
})
export class AppComponent {
  status = '—';
  ${r.angularState || ''}
}
`,"import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\nbootstrapApplication(AppComponent).catch(console.error);\n",'<app-root></app-root>');
}
