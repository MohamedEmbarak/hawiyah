import type { Locale } from './data';
import type { ProjectExample } from './project-examples';
import type { ProjectFramework, ProjectLanguage } from './project-compiler';

function toastCopy(locale: Locale) {
  const ar = locale === 'ar';
  return {
    label: ar ? 'إشعارات الخدمة' : 'Service notices',
    dismiss: ar ? 'إغلاق الإشعار' : 'Dismiss notice',
    restore: ar ? 'استعادة الإشعارات' : 'Restore notices',
    count: ar ? 'الإشعارات الظاهرة' : 'Visible notices',
    title: ar ? 'أشرطة الإشعارات لجميع الحالات' : 'Notification banners in all five tones',
    hint: ar ? 'يبقى إشعار الصيانة ظاهرًا. يمكنك إغلاق الإشعارات الأخرى أو استعادتها.' : 'The maintenance notice stays visible. You can dismiss and restore the other notices.',
    messages: [
      {id: 'maintenance', tone: 'neutral', title: ar ? 'صيانة مجدولة' : 'Scheduled maintenance', message: ar ? 'تبدأ الصيانة الساعة 18:00.' : 'Maintenance begins at 18:00.', dismissible: false},
      {id: 'documents', tone: 'info', title: ar ? 'قبل البدء' : 'Before you begin', message: ar ? 'جهّز المستندات الداعمة للطلب.' : 'Prepare the supporting documents for your request.'},
      {id: 'saved', tone: 'success', title: ar ? 'تم حفظ المسودة' : 'Draft saved', message: ar ? 'يمكنك العودة إلى طلبك لاحقًا.' : 'You can return to your request later.'},
      {id: 'review', tone: 'warning', title: ar ? 'يلزم التحقق' : 'Review required', message: ar ? 'تحقق من التفاصيل قبل الإرسال.' : 'Review the details before submitting.'},
      {id: 'failed', tone: 'danger', title: ar ? 'تعذّر إرسال الطلب' : 'Submission failed', message: ar ? 'أعد المحاولة قبل مغادرة الصفحة.' : 'Try again before leaving this page.', urgent: true},
    ],
  };
}

export function toastDemoMarkup(locale: Locale): string {
  const copy = toastCopy(locale);
  function bucket(urgent: boolean) {
    const live = urgent ? 'assertive' : 'polite';
    const notices = copy.messages.filter(message => Boolean(message.urgent) === urgent).map(message => `    <article class="hw-toast" data-hw-toast="${message.id}" data-tone="${message.tone}"${message.dismissible === false ? ' data-hw-dismissible="false"' : ''}>
      <span class="hw-toast-icon" aria-hidden="true"></span>
      <div class="hw-toast-content"><strong>${message.title}</strong><p>${message.message}</p></div>${message.dismissible === false ? '' : `
      <button type="button" class="hw-button hw-toast-dismiss" data-variant="ghost" data-hw-dismiss aria-label="${copy.dismiss}: ${message.title}"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>`}
    </article>`);
    return `  <div data-hw-live="${live}" role="${urgent ? 'alert' : 'status'}" aria-live="${live}" aria-relevant="additions text">\n${notices.join('\n')}\n  </div>`;
  }
  return `<div class="hw-stack" data-toast-demo>
  <p class="hw-hint">${copy.hint}</p>
  <section class="hw-toast-region" data-hw="toast-region" data-variant="banner" data-position="inline" aria-label="${copy.label}" tabindex="-1">
${bucket(false)}
${bucket(true)}
  </section>
  <div class="hw-inline">
    <button type="button" class="hw-button" data-variant="secondary" data-toast-restore>${copy.restore}</button>
    <span class="hw-hint">${copy.count} <output aria-live="off" data-toast-count>5</output></span>
  </div>
</div>`;
}

/** The guide already enhances each region. This binder owns only example count and restore controls. */
export function bindToastDemos(root: HTMLElement, signal: AbortSignal) {
  function update(example: HTMLElement) {
    const output = example.querySelector<HTMLOutputElement>('[data-toast-count]');
    if (output) output.value = String(example.querySelectorAll('[data-hw-toast]:not([hidden])').length);
  }
  root.addEventListener('hw:change', event => {
    const example = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-toast-demo]') : null;
    if (example && root.contains(example)) update(example);
  }, {signal});
  root.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-toast-restore]') : null;
    const example = button?.closest<HTMLElement>('[data-toast-demo]');
    if (!example || !root.contains(example)) return;
    for (const notice of example.querySelectorAll<HTMLElement>('[data-hw-toast][hidden]')) notice.hidden = false;
    update(example);
  }, {signal});
}

function vanillaScript(typed: boolean) {
  return `import { createToastRegion } from '@hawiyah/vanilla';
import './style.css';

const example = document.querySelector('[data-toast-demo]');
const region = example?.querySelector('.hw-toast-region');
const restore = example?.querySelector('[data-toast-restore]');
const count = example?.querySelector('[data-toast-count]');
if (!(region instanceof HTMLElement) || !(restore instanceof HTMLButtonElement) || !(count instanceof HTMLOutputElement)) {
  throw new Error('Missing notification example markup');
}
function updateCount() {
  if (region && count instanceof HTMLOutputElement) {
    count.value = String(region.querySelectorAll('[data-hw-toast]:not([hidden])').length);
  }
}
const controller = createToastRegion(region, { onDismiss: updateCount });
const events = new AbortController();
restore.addEventListener('click', () => {
  for (const notice of region.querySelectorAll${typed ? '<HTMLElement>' : ''}('[data-hw-toast][hidden]')) notice.hidden = false;
  updateCount();
}, { signal: events.signal });
window.addEventListener('pagehide', () => { events.abort(); controller.destroy(); }, { once: true });
`;
}

export function toastProject(framework: ProjectFramework, language: ProjectLanguage, locale: Locale): ProjectExample {
  const typed = language === 'typescript';
  const ext = typed ? 'ts' : 'js';
  const jsx = typed ? 'tsx' : 'jsx';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const copy = toastCopy(locale);
  const css = "@import '@hawiyah/styles/styles.css';\n\n.demo { display: grid; align-content: start; gap: 1rem; min-inline-size: 0; }\n";
  if (framework === 'vanilla') {
    const entry = `main.${ext}`;
    return {names: {html: 'index.html', css: 'style.css', js: entry}, host: '', entry, files: {
      css, js: vanillaScript(typed),
      html: `<!doctype html>\n<html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${copy.title}</title></head><body><main id="app" class="demo">\n${toastDemoMarkup(locale)}\n</main><script type="module" src="./${entry}"></script></body></html>\n`,
    }};
  }
  const entry = framework === 'react' ? `main.${jsx}` : framework === 'angular' ? 'main.ts' : `main.${ext}`;
  const source = JSON.stringify(copy.messages, null, 2);
  const titlePrefix = JSON.stringify(copy.dismiss + ': ');
  if (framework === 'react') return {
    names: {html: `App.${jsx}`, css: 'style.css', js: entry}, host: '<div id="app"></div>', entry,
    files: {css,
      html: `import { useState } from 'react';
import { Button, ToastRegion${typed ? ', type ToastMessage' : ''} } from '@hawiyah/react';

const initial${typed ? ': ToastMessage[]' : ''} = ${source};

export default function App() {
  const [messages, setMessages] = useState(initial);
  function dismiss(id${typed ? ': string' : ''}) {
    setMessages(current => current.filter(message => message.id !== id || message.dismissible === false));
  }
  return <main className="demo" data-toast-demo lang="${locale}" dir="${dir}">
    <p className="hw-hint">${copy.hint}</p>
    <ToastRegion label="${copy.label}" variant="banner" position="inline" messages={messages}
      getDismissLabel={message => ${titlePrefix} + (typeof message.title === 'string' ? message.title : message.id)}
      onDismiss={dismiss} />
    <div className="hw-inline">
      <Button type="button" variant="secondary" data-toast-restore onClick={() => setMessages(initial)}>${copy.restore}</Button>
      <span className="hw-hint">${copy.count} <output aria-live="off" data-toast-count>{messages.length}</output></span>
    </div>
  </main>;
}
`,
      js: `import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\nconst root = document.getElementById('app');\nif (!root) throw new Error('Missing app root');\ncreateRoot(root).render(<App />);\n`,
    },
  };
  if (framework === 'vue') return {
    names: {html: 'App.vue', css: 'style.css', js: entry}, host: '<div id="app"></div>', entry,
    files: {css,
      html: `<script setup${typed ? ' lang="ts"' : ''}>
import { ref } from 'vue';
import { Button, ToastRegion${typed ? ', type ToastMessage' : ''} } from '@hawiyah/vue';

const initial${typed ? ': ToastMessage[]' : ''} = ${source};
const messages = ref(initial);
function dismiss(id${typed ? ': string' : ''}) {
  messages.value = messages.value.filter(message => message.id !== id || message.dismissible === false);
}
function dismissLabel(message${typed ? ': ToastMessage' : ''}) {
  return ${titlePrefix} + (message.title || message.message);
}
</script>

<template>
  <main class="demo" data-toast-demo lang="${locale}" dir="${dir}">
    <p class="hw-hint">${copy.hint}</p>
    <ToastRegion label="${copy.label}" variant="banner" position="inline" :messages="messages" :get-dismiss-label="dismissLabel" @dismiss="dismiss" />
    <div class="hw-inline">
      <Button type="button" variant="secondary" data-toast-restore @click="messages = initial">${copy.restore}</Button>
      <span class="hw-hint">${copy.count} <output aria-live="off" data-toast-count>{{ messages.length }}</output></span>
    </div>
  </main>
</template>
`,
      js: `import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n`,
    },
  };
  return {
    names: {html: 'app.component.ts', css: 'style.css', js: entry}, host: '<app-root></app-root>', entry,
    files: {css,
      html: `import { Component } from '@angular/core';
import { HwButtonDirective, HwToastRegionComponent, type HwToast } from '@hawiyah/angular';

@Component({
  selector: 'app-root', standalone: true, imports: [HwToastRegionComponent, HwButtonDirective],
  template: \`<main class="demo" data-toast-demo lang="${locale}" dir="${dir}">
    <p class="hw-hint">${copy.hint}</p>
    <hw-toast-region label="${copy.label}" variant="banner" position="inline" [messages]="messages" [getDismissLabel]="dismissLabel" (dismissed)="dismiss($event)" />
    <div class="hw-inline">
      <button hwButton type="button" variant="secondary" data-toast-restore (click)="messages = initial">${copy.restore}</button>
      <span class="hw-hint">${copy.count} <output aria-live="off" data-toast-count>{{ messages.length }}</output></span>
    </div>
  </main>\`,
})
export class AppComponent {
  readonly initial: HwToast[] = ${source};
  messages = this.initial;
  dismissLabel = (message: HwToast) => ${titlePrefix} + (message.title ?? message.id);
  dismiss(id: string) {
    this.messages = this.messages.filter(message => message.id !== id || message.dismissible === false);
  }
}
`,
      js: `import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n`,
    },
  };
}

export function toastDemoRecipes(locale: Locale) {
  return [{
    title: toastCopy(locale).title, markup: toastDemoMarkup(locale),
    vanillaScript: vanillaScript(false).replace("import './style.css';", "import '@hawiyah/styles/styles.css';"),
    react: toastProject('react', 'typescript', locale).files.html,
    vue: toastProject('vue', 'typescript', locale).files.html,
    angular: toastProject('angular', 'typescript', locale).files.html,
  }];
}
