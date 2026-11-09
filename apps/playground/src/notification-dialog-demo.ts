import {createDialog} from '@hawiyah/vanilla';
import type {Locale} from './data';
import type {ProjectFramework, ProjectLanguage} from './project-compiler';
import type {ProjectExample} from './project-examples';

function notices(locale: Locale) {
  const ar = locale === 'ar';
  return [
    {tone:'success', title: ar ? 'تم استلام الطلب' : 'Request received', message: ar ? 'حُفظ طلبك وأصبح جاهزًا للمراجعة.' : 'Your request has been saved and is ready for review.', primary:ar ? 'حسنًا' : 'Acknowledge', secondary:''},
    {tone:'info', title: ar ? 'موعد مراجعة الطلب' : 'Review appointment', message: ar ? 'يمكنك اختيار موعد المراجعة بعد اكتمال التحقق من المستندات. سنعرض المواعيد المتاحة في صفحة الطلب.' : 'You can choose a review appointment after the documents have been verified. Available appointments will appear on the request page.', primary:'', secondary:''},
    {tone:'warning', title: ar ? 'مراجعة البيانات' : 'Review details', message: ar ? 'راجع عنوانك قبل متابعة الطلب.' : 'Check your address before continuing with the request.', primary: ar ? 'تأكيد العنوان' : 'Confirm address', secondary: ar ? 'العودة للمراجعة' : 'Return to review'},
    {tone:'danger', title: ar ? 'تعذّر إرسال الطلب' : 'Request could not be sent', message: ar ? 'ما زالت بياناتك محفوظة. يمكنك إعادة المحاولة.' : 'Your details are still saved. You can try again.', primary: ar ? 'إعادة المحاولة' : 'Try again', secondary: ar ? 'إلغاء' : 'Cancel'},
    {tone:'neutral', title: ar ? 'مسودة محلية' : 'Local draft', message: ar ? 'هذه المسودة متاحة في جلسة العمل الحالية.' : 'This draft is available in your current session.', primary: '', secondary:ar ? 'العودة' : 'Go back'},
  ];
}

const css = "@import '@hawiyah/styles/styles.css';\n\n.demo { display: grid; gap: 1rem; min-inline-size: 0; }\n";
const title = (locale: Locale) => locale === 'ar' ? 'حوارات الإشعارات' : 'Notification dialogs';
const closeLabel = (locale: Locale) => locale === 'ar' ? 'إغلاق الإشعار' : 'Close notification';

export function notificationDialogMarkup(locale: Locale, prefix = 'notice-project') {
  const content = notices(locale).map(notice => {
    const buttons = [notice.primary, notice.secondary].map((action, index) => action
      ? `<button class="hw-button" data-variant="${index ? 'secondary' : 'primary'}" data-notice-action type="button">${action}</button>` : '').join('\n');
    return `<div data-notice-case>
  <button type="button" class="hw-button" data-variant="secondary" data-notice-open="${notice.tone}" aria-haspopup="dialog">${notice.title}</button>
  <dialog class="hw-dialog" data-variant="notification" data-tone="${notice.tone}" aria-labelledby="${prefix}-${notice.tone}-title" aria-describedby="${prefix}-${notice.tone}-message">
    <header class="hw-dialog-header"><h2 id="${prefix}-${notice.tone}-title">${notice.title}</h2><button type="button" class="hw-button" data-variant="ghost" data-hw-dialog-close aria-label="${closeLabel(locale)}"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></header>
    <div class="hw-dialog-body"><p id="${prefix}-${notice.tone}-message">${notice.message}</p></div>${buttons ? `\n    <footer class="hw-dialog-footer">${buttons}</footer>` : ''}
  </dialog>
</div>`;
  }).join('\n');
  return `<section class="demo" data-notice-project lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">\n<h2>${title(locale)}</h2>\n${content}\n<output data-notice-outcome></output>\n</section>`;
}

export function bindNotificationDialogs(root: HTMLElement, signal: AbortSignal) {
  for (const region of root.querySelectorAll<HTMLElement>('[data-notice-project]')) {
    const outcome = region.querySelector('[data-notice-outcome]');
    for (const row of region.querySelectorAll<HTMLElement>('[data-notice-case]')) {
      const dialog = row.querySelector('dialog'), opener = row.querySelector<HTMLButtonElement>('[data-notice-open]');
      if (!dialog || !opener) continue;
      const controller = createDialog(dialog);
      signal.addEventListener('abort', () => controller.destroy(), {once:true});
      opener.addEventListener('click', () => controller.show(opener), {signal});
      for (const button of dialog.querySelectorAll<HTMLButtonElement>('[data-notice-action]')) {
        button.addEventListener('click', () => {
          if (outcome) outcome.textContent = button.textContent;
          controller.close();
        }, {signal});
      }
    }
  }
}

export function notificationDialogProject(framework: ProjectFramework, language: ProjectLanguage, locale: Locale): ProjectExample {
  const typed = language === 'typescript';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const source = JSON.stringify(notices(locale), null, 2);
  const entry = framework === 'angular' ? 'main.ts' : `main.${typed ? 'ts' : 'js'}${framework === 'react' ? 'x' : ''}`;
  const heading = title(locale), close = closeLabel(locale);
  const project = (file: string, html: string, js: string, host: string): ProjectExample => ({
    names:{html:file,css:'style.css',js:entry}, files:{html,css,js},entry,host,
  });
  if (framework === 'vanilla') return project('index.html', `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title></head><body>
${notificationDialogMarkup(locale)}
<script type="module" src="./${entry}"></script></body></html>
`, `import { createDialog } from '@hawiyah/vanilla';
import './style.css';

const region = document.querySelector('[data-notice-project]');
if (!region) throw new Error('Missing notification examples');
const outcome = region.querySelector('[data-notice-outcome]');
const scope = new AbortController();
for (const row of region.querySelectorAll('[data-notice-case]')) {
  const opener = row.querySelector('[data-notice-open]');
  const dialog = row.querySelector('dialog');
  if (!dialog || !(opener instanceof HTMLButtonElement)) continue;
  const controller = createDialog(dialog);
  scope.signal.addEventListener('abort', () => controller.destroy(), {once:true});
  opener.addEventListener('click', () => controller.show(opener), {signal:scope.signal});
  for (const action of dialog.querySelectorAll('[data-notice-action]')) {
    action.addEventListener('click', () => {
      if (outcome) outcome.textContent = action.textContent;
      controller.close();
    }, {signal:scope.signal});
  }
}
window.addEventListener('pagehide', () => scope.abort(), {once:true});
`, '');
  if (framework === 'react') return project(typed ? 'App.tsx' : 'App.jsx', `import { useState } from 'react';
import { Button, Dialog } from '@hawiyah/react';

const notices = ${source};
export default function App() {
  const [outcome, setOutcome] = useState('');
  return <main className="demo" data-notice-project lang="${locale}" dir="${dir}">
    <h2>${heading}</h2>
    {notices.map(notice => <Dialog key={notice.tone} data-variant="notification" data-tone={notice.tone} title={notice.title}
      description={notice.message} closeLabel="${close}"
      trigger={<Button data-notice-open={notice.tone} variant="secondary">{notice.title}</Button>}
      footer={notice.primary || notice.secondary ? ({close}) => <>
        {notice.primary && <Button data-notice-action onClick={() => {setOutcome(notice.primary); close();}}>{notice.primary}</Button>}
        {notice.secondary && <Button data-notice-action variant="secondary" onClick={() => {setOutcome(notice.secondary); close();}}>{notice.secondary}</Button>}
      </> : undefined} />)}
    <output data-notice-outcome>{outcome}</output>
  </main>;
}
`, `import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\nconst root = document.getElementById('app');\nif (root) createRoot(root).render(<App />);\n`, '<div id="app"></div>');
  if (framework === 'vue') return project('App.vue', `<script setup${typed ? ' lang="ts"' : ''}>
import { ref } from 'vue';
import { Button, Dialog } from '@hawiyah/vue';

const notices = ${source};
const outcome = ref('');
</script>

<template>
  <main class="demo" data-notice-project lang="${locale}" dir="${dir}">
    <h2>${heading}</h2>
    <Dialog v-for="notice in notices" :key="notice.tone" data-variant="notification" :data-tone="notice.tone"
      :title="notice.title" :description="notice.message" close-label="${close}">
      <template #trigger="{open}"><Button :data-notice-open="notice.tone" variant="secondary" aria-haspopup="dialog" @click="open">{{ notice.title }}</Button></template>
      <template v-if="notice.primary || notice.secondary" #footer="{close}">
        <Button v-if="notice.primary" data-notice-action @click="outcome = notice.primary; close()">{{ notice.primary }}</Button>
        <Button v-if="notice.secondary" data-notice-action variant="secondary" @click="outcome = notice.secondary; close()">{{ notice.secondary }}</Button>
      </template>
    </Dialog>
    <output data-notice-outcome>{{ outcome }}</output>
  </main>
</template>
`, "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n", '<div id="app"></div>');
  return project('app.component.ts', `import { Component } from '@angular/core';
import { HwButtonDirective, HwDialogComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-root', standalone: true, imports: [HwButtonDirective, HwDialogComponent],
  template: \`<main class="demo" data-notice-project lang="${locale}" dir="${dir}">
    <h2>${heading}</h2>
    @for (notice of notices; track notice.tone) {
      <button #trigger hwButton type="button" variant="secondary" [attr.data-notice-open]="notice.tone" aria-haspopup="dialog" (click)="dialog.show(trigger)">{{ notice.title }}</button>
      <hw-dialog #dialog data-variant="notification" [attr.data-tone]="notice.tone" [title]="notice.title" [describedBy]="'notice-message-' + notice.tone" closeLabel="${close}">
        <p [id]="'notice-message-' + notice.tone">{{ notice.message }}</p>
        <ng-container hwDialogFooter>
          @if (notice.primary) {<button hwButton type="button" data-notice-action (click)="outcome = notice.primary; dialog.close()">{{ notice.primary }}</button>}
          @if (notice.secondary) {<button hwButton type="button" data-notice-action variant="secondary" (click)="outcome = notice.secondary; dialog.close()">{{ notice.secondary }}</button>}
        </ng-container>
      </hw-dialog>
    }
    <output data-notice-outcome>{{ outcome }}</output>
  </main>\`,
})
export class AppComponent {
  readonly notices = ${source};
  outcome = '';
}
`, "import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(console.error);\n", '<app-root></app-root>');
}

export function notificationDialogRecipes(locale: Locale) {
  return [{title:title(locale), markup:notificationDialogMarkup(locale, 'ready-notice'),
    vanillaScript:notificationDialogProject('vanilla','javascript',locale).files.js.replace("import './style.css';", "import '@hawiyah/styles/styles.css';"),
    react:notificationDialogProject('react','typescript',locale).files.html,
    vue:notificationDialogProject('vue','typescript',locale).files.html,
    angular:notificationDialogProject('angular','typescript',locale).files.html,
  }];
}
