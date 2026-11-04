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
  const details = `<dl class="nq-description-list"><div><dt>${term}</dt><dd>${duration}</dd></div></dl>`;
  const list = `<h3>${requirements}</h3><ul><li>${document}</li></ul>`;
  if (id === 'service-card') return {
    vanilla: `<article class="nq-card nq-service-card"><span class="nq-badge">${category}</span><h3>${title}</h3><p>${description}</p>${details}<a class="nq-link" href="${href}">${action}</a></article>`,
    vanillaState: `root.querySelector('a')?.addEventListener('click', event => {
  event.preventDefault();
  output.textContent = '${message}';
}, events);`,
    react: `<div onClick={event => { if (event.target instanceof Element && event.target.closest('a[href]')) {event.preventDefault(); setStatus('${message}');} }}>
    <ServiceCard title="${title}" description="${description}" category="${category}" metadata={${meta}} href="${href}" actionLabel="${action}" />
  </div>`,
    vue: `<div @click="openService"><ServiceCard title="${title}" description="${description}" badge="${category}" :metadata="['${term} — ${duration}']" href="${href}" action-label="${action}" /></div>`,
    vueState: `function openService(event${typed ? ': Event' : ''}) {
  if (event.target instanceof Element && event.target.closest('a[href]')) {
    event.preventDefault();
    status.value = '${message}';
  }
}`,
    angular: `<nq-service-card title="${title}" description="${description}" category="${category}" duration="${term} — ${duration}" href="${href}" actionLabel="${action}" (click)="openService($event)" />`,
    angularState: `openService(event: Event) {
    if (event.target instanceof Element && event.target.closest('a[href]')) {
      event.preventDefault();
      this.status = '${message}';
    }
  }`,
  };
  return {
    vanilla: `<article class="nq-service-details"><header><h2>${title}</h2><p>${description}</p></header>${details}${list}<button class="nq-button" type="button">${start}</button></article>`,
    vanillaState: `root.querySelector('button')?.addEventListener('click', () => {output.textContent = '${message}';}, events);`,
    react: `<ServiceDetails title="${title}" description="${description}" metadata={${meta}} requirements={['${document}']} requirementsLabel="${requirements}" action={<Button onClick={() => setStatus('${message}')}>${start}</Button>} />`,
    vue: `<ServiceDetails title="${title}" description="${description}" :items='${meta}'>
    <section>${list}</section>
    <template #action><Button @click="status = '${message}'">${start}</Button></template>
  </ServiceDetails>`,
    angular: `<nq-service-details title="${title}" description="${description}" [details]="details" [requirements]="['${document}']" requirementsLabel="${requirements}">
    <button nqButton type="button" (click)="status = '${message}'">${start}</button>
  </nq-service-details>`,
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
    vanilla: `<section class="nq-cookie-consent" data-nq="cookie-consent" aria-label="${title}"><h2>${title}</h2><p>${description}</p><div class="nq-inline">
    <button type="button" class="nq-button" data-nq-consent="accepted">${accept}</button>
    <button type="button" class="nq-button" data-variant="secondary" data-nq-consent="rejected">${reject}</button>
  </div></section>
  <button type="button" class="nq-button" data-variant="secondary" data-review-choice>${reopen}</button>`,
    vanillaState: `const banner = root.querySelector('[data-nq="cookie-consent"]');
if (!(banner instanceof HTMLElement)) throw new Error('Missing consent region');
const connect = () => createCookieConsent(banner, {onValueChange: choice => {
  output.textContent = choice === 'accepted' ? '${accepted}' : '${rejected}';
}});
let consent = connect();
root.querySelector('[data-review-choice]')?.addEventListener('click', () => {
  consent.destroy();
  consent = connect();
  output.textContent = '—';
}, events);
scope.signal.addEventListener('abort', () => consent.destroy(), {once:true});`,
    reactState: `const [choice, setChoice] = useState${typed ? "<'accepted'|'rejected'|null>" : ''}(null);`,
    react: `<CookieConsent title="${title}" ${attrs} acceptLabel="${accept}" rejectLabel="${reject}" value={choice} onValueChange={next => {
    setChoice(next);
    setStatus(next === 'accepted' ? '${accepted}' : '${rejected}');
  }} />
  <Button variant="secondary" data-review-choice onClick={() => {setChoice(null); setStatus('—');}}>${reopen}</Button>`,
    vueState:'const open = ref(true);',
    vue: `<CookieConsent label="${title}" ${attrs} accept-label="${accept}" reject-label="${reject}" preferences-label="${prefs}" v-model:open="open"
    @accept="status = '${accepted}'" @reject="status = '${rejected}'" @preferences="status = '${description}'" />
  <Button variant="secondary" data-review-choice @click="open = true; status = '—'">${reopen}</Button>`,
    angularState:'open = true;',
    angular: `<nq-cookie-consent title="${title}" ${attrs} acceptLabel="${accept}" rejectLabel="${reject}" preferencesLabel="${prefs}" [(visible)]="open"
    (consent)="status = $event === 'accepted' ? '${accepted}' : '${rejected}'" (preferences)="status = '${description}'" />
  <button nqButton type="button" variant="secondary" data-review-choice (click)="open = true; status = '—'">${reopen}</button>`,
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
    vanilla: `<section class="nq-notification-list" aria-label="${label}"><h2>${label}</h2><ul>${items.map(item=>`<li data-state="${item.read ? 'read':'unread'}"><h3>${item.title}</h3>${item.read ? '' : `<span class="nq-badge">${unread}</span><button class="nq-button" type="button" data-mark-read>${mark}</button>`}</li>`).join('')}</ul><p hidden data-empty>${empty}</p></section>
  <div class="nq-inline"><button class="nq-button" type="button" data-mark-all>${all}</button><button class="nq-button" type="button" data-clear-list>${clear}</button></div>`,
    vanillaState: `root.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest('[data-mark-all], [data-mark-read]')) {
    const rows = event.target.closest('[data-mark-all]') ? root.querySelectorAll('li') : [event.target.closest('li')];
    for (const row of rows) {
      if (!row) continue;
      row.dataset.state = 'read';
      row.querySelector('.nq-badge')?.remove();
      row.querySelector('[data-mark-read]')?.remove();
    }
    output.textContent = '${marked}';
  }
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
  }`,
    react: `<NotificationList label="${label}" items={items} emptyMessage="${empty}" unreadLabel="${unread}" onMarkRead={markRead} getMarkReadLabel={item => '${mark} — ' + item.title} />
  <div className="nq-inline"><Button data-mark-all onClick={() => markRead()}>${all}</Button><Button variant="secondary" data-clear-list onClick={() => {setItems([]); setStatus('${cleared}');}}>${clear}</Button></div>`,
    vueState:`const items = ref(${initial});
function markRead(id${typed ? '?: string' : ''}) {
  items.value = items.value.map(item => !id || item.id === id ? {...item, read:true} : item);
  status.value = '${marked}';
}
function dismiss(id${typed ? ': string' : ''}) { items.value = items.value.filter(item => item.id !== id); }`,
    vue:`<NotificationList label="${label}" :items="items" empty-message="${empty}" :read-label="item => '${mark} — ' + item.title" :dismiss-label="item => '${dismiss} — ' + item.title" @read="markRead" @dismiss="dismiss" />
  <div class="nq-inline"><Button data-mark-all @click="markRead()">${all}</Button><Button variant="secondary" data-clear-list @click="items = []; status = '${cleared}'">${clear}</Button></div>`,
    angularState: `items = ${JSON.stringify(items.map(({read,...item})=>({...item,unread:!read})))};
  markRead() { this.items = this.items.map(item => ({...item, unread:false})); this.status = '${marked}'; }
  dismiss(id: string) { this.items = this.items.filter(item => item.id !== id); }`,
    angular:`<nq-notification-list label="${label}" [items]="items" emptyMessage="${empty}" unreadLabel="${unread}" dismissLabel="${dismiss}" (dismissed)="dismiss($event)" />
  <div class="nq-inline"><button nqButton type="button" data-mark-all (click)="markRead()">${all}</button><button nqButton type="button" variant="secondary" data-clear-list (click)="items = []; status = '${cleared}'">${clear}</button></div>`,
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
  const css = "@import '@nasaq/styles/styles.css';\n\n.demo { display: grid; gap: 1rem; min-inline-size: 0; }\n";
  const project = (file: string, html: string, js: string, host: string): ProjectExample => ({
    files:{html,css,js}, names:{html:file,css:'style.css',js:entry},entry,host,
  });
  if (framework === 'vanilla') return project('index.html',`<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${output}</title></head><body>
<main class="demo" ${main}>
  ${r.vanilla}
  <p>${output} <output data-service-status>—</output></p>
</main><script type="module" src="./${entry}"></script></body></html>`,`import { ${id === 'cookie-consent' ? 'createCookieConsent':'enhance'} } from '@nasaq/vanilla';
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
import { ${name}${useButton?', Button':''} } from '@nasaq/react';

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
import { ${name}${useButton?', Button':''} } from '@nasaq/vue';
const status = ref('—');
${r.vueState || ''}
</script>
<template><main class="demo" ${main}>
  ${r.vue}
  <p>${output} <output data-service-status>{{ status }}</output></p>
</main></template>
`,"import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\ncreateApp(App).mount('#app');\n",'<div id="app"></div>');
  const imports = `Nq${name}Component${useButton?', NqButtonDirective':''}`;
  return project('app.component.ts',`import { Component } from '@angular/core';
import { ${imports} } from '@nasaq/angular';
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
