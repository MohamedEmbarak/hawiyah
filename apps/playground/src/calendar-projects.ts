import type { Locale } from './data';
import type { ProjectFramework, ProjectLanguage } from './project-compiler';

export type CalendarProjectId = 'calendar' | 'date-picker';

export function calendarProject(
  id: CalendarProjectId,
  framework: Exclude<ProjectFramework, 'vanilla'>,
  language: ProjectLanguage,
  locale: Locale,
) {
  const typed = language === 'typescript';
  const ar = locale === 'ar';
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const calendar = id === 'calendar';
  const component = calendar ? 'Calendar' : 'DatePicker';
  const initial = '2026-10-28';
  const heading = t('Appointment dates', 'تواريخ المواعيد');
  const dateLabel = t('Appointment date', 'تاريخ الموعد');
  const hint = t('Enter a Gregorian date as YYYY-MM-DD or open the calendar.', 'أدخل تاريخًا ميلاديًا بصيغة YYYY-MM-DD أو افتح التقويم.');
  const canonical = t('Selected ISO date', 'التاريخ المحدد بصيغة ISO');
  const readOnly = t('Read-only field', 'حقل للقراءة فقط');
  const action = t('Show submitted date', 'اعرض التاريخ المرسل');
  const submitted = t('Submitted ISO value', 'القيمة المرسلة بصيغة ISO');
  const lang = ar ? 'ar-SA' : 'en';
  const direction = ar ? 'rtl' : 'ltr';
  const dateProps = `locale="${lang}" min="2026-10-01" max="2026-12-31"`;
  const calendars = [
    ['gregory', t('Gregorian appointments', 'المواعيد بالتقويم الميلادي')],
    ['islamic-umalqura', t('Umm al-Qura appointments', 'المواعيد بتقويم أم القرى')],
  ] as const;
  const css = `@import '@hawiyah/styles/styles.css';\n\n.demo, .demo form { display:grid; gap:1rem; min-inline-size:0; }\n.calendar-comparison { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr)); gap:1rem; }\n.demo form > button { justify-self:start; }\n`;

  if (framework === 'react') {
    const content = calendar
      ? `<div className="calendar-comparison">\n${calendars.map(([system, title]) => `    <section data-calendar-case="${system}"><h2>${title}</h2>\n      <Calendar label="${title}" ${dateProps} calendar="${system}" value={date} onValueChange={setDate} />\n    </section>`).join('\n')}\n  </div>`
      : `<form onSubmit={event => {\n    event.preventDefault();\n    setSubmitted(String(new FormData(event.currentTarget).get('appointment') ?? ''));\n  }}>\n    <label><input type="checkbox" checked={locked} onChange={event => setLocked(event.currentTarget.checked)} /> ${readOnly}</label>\n    <DatePicker name="appointment" label="${dateLabel}" hint="${hint}" ${dateProps}\n      value={date} onValueChange={setDate} calendar={system} onCalendarChange={setSystem} readOnly={locked} required />\n    <button className="hw-button" type="submit">${action}</button>\n    <p>${submitted}: <output data-calendar-submitted dir="ltr">{submitted}</output></p>\n  </form>`;
    const systemImport = typed && !calendar ? "import type { CalendarSystem } from '@hawiyah/core';\n" : '';
    const state = calendar ? '' : `\n  const [system, setSystem] = useState${typed ? '<CalendarSystem>' : ''}('gregory');\n  const [locked, setLocked] = useState(false);\n  const [submitted, setSubmitted] = useState('');`;
    const extension = typed ? 'tsx' : 'jsx';
    return {
      names: {html: `App.${extension}`, css: 'style.css', js: `main.${extension}`}, entry: `main.${extension}`, host: '<div id="app"></div>',
      files: {
        css,
        html: `import { useState } from 'react';\nimport { ${component} } from '@hawiyah/react';\n${systemImport}\nexport default function App() {\n  const [date, setDate] = useState('${initial}');${state}\n  return <main className="demo" data-calendar-project="${id}" lang="${locale}" dir="${direction}">\n  <h1>${heading}</h1>\n  ${content}\n  <p>${canonical}: <output data-calendar-model dir="ltr">{date}</output></p>\n  </main>;\n}\n`,
        js: "import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\nconst root = document.getElementById('app');\nif (!root) throw new Error('Missing app root');\ncreateRoot(root).render(<App />);\n",
      },
    };
  }

  if (framework === 'vue') {
    const content = calendar
      ? `<div class="calendar-comparison">\n${calendars.map(([system, title]) => `    <section data-calendar-case="${system}"><h2>${title}</h2>\n      <Calendar label="${title}" ${dateProps} calendar="${system}" v-model="date" />\n    </section>`).join('\n')}\n  </div>`
      : `<form @submit.prevent="submit">\n    <label><input type="checkbox" v-model="locked" /> ${readOnly}</label>\n    <DatePicker name="appointment" label="${dateLabel}" hint="${hint}" ${dateProps}\n      v-model="date" v-model:calendar="system" :readonly="locked" required />\n    <button class="hw-button" type="submit">${action}</button>\n    <p>${submitted}: <output data-calendar-submitted dir="ltr">{{ submitted }}</output></p>\n  </form>`;
    const systemImport = typed && !calendar ? "import type { CalendarSystem } from '@hawiyah/core';\n" : '';
    const state = calendar ? '' : `\nconst system = ref${typed ? '<CalendarSystem>' : ''}('gregory');\nconst locked = ref(false);\nconst submitted = ref('');\nfunction submit(event${typed ? ': Event' : ''}) {\n  const form = event.currentTarget;\n  if (form instanceof HTMLFormElement) submitted.value = String(new FormData(form).get('appointment') ?? '');\n}`;
    const extension = typed ? 'ts' : 'js';
    return {
      names: {html: 'App.vue', css: 'style.css', js: `main.${extension}`}, entry: `main.${extension}`, host: '<div id="app"></div>',
      files: {
        css,
        html: `<script setup${typed ? ' lang="ts"' : ''}>\nimport { ref } from 'vue';\nimport { ${component} } from '@hawiyah/vue';\n${systemImport}const date = ref('${initial}');${state}\n</script>\n\n<template>\n<main class="demo" data-calendar-project="${id}" lang="${locale}" dir="${direction}">\n  <h1>${heading}</h1>\n  ${content}\n  <p>${canonical}: <output data-calendar-model dir="ltr">{{ date }}</output></p>\n</main>\n</template>\n`,
        js: "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n",
      },
    };
  }

  const content = calendar
    ? `<div class="calendar-comparison">\n${calendars.map(([system, title]) => `    <section data-calendar-case="${system}"><h2>${title}</h2>\n      <hw-calendar label="${title}" ${dateProps} calendar="${system}" [(value)]="date" />\n    </section>`).join('\n')}\n  </div>`
    : `<form (submit)="submit($event)">\n    <label><input #lock type="checkbox" [checked]="locked" (change)="locked = lock.checked" /> ${readOnly}</label>\n    <hw-date-picker name="appointment" label="${dateLabel}" hint="${hint}" ${dateProps}\n      [(value)]="date" [(calendar)]="system" [readOnly]="locked" required />\n    <button class="hw-button" type="submit">${action}</button>\n    <p>${submitted}: <output data-calendar-submitted dir="ltr">{{ submitted }}</output></p>\n  </form>`;
  const native = `Hw${component}Component`;
  const imports = calendar ? '' : "import type { CalendarSystem } from '@hawiyah/core';\n";
  const state = calendar ? '' : `\n  system: CalendarSystem = 'gregory';\n  locked = false;\n  submitted = '';\n  submit(event: Event) {\n    event.preventDefault();\n    const form = event.currentTarget;\n    if (form instanceof HTMLFormElement) this.submitted = String(new FormData(form).get('appointment') ?? '');\n  }`;
  return {
    names: {html: 'app.component.ts', css: 'style.css', js: 'main.ts'}, entry: 'main.ts', host: '<app-root></app-root>',
    files: {
      css,
      html: `import { Component } from '@angular/core';\nimport { ${native} } from '@hawiyah/angular';\n${imports}\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [${native}],\n  template: \`<main class="demo" data-calendar-project="${id}" lang="${locale}" dir="${direction}">\n  <h1>${heading}</h1>\n  ${content}\n  <p>${canonical}: <output data-calendar-model dir="ltr">{{ date }}</output></p>\n</main>\`,\n})\nexport class AppComponent {\n  date = '${initial}';${state}\n}\n`,
      js: "import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n",
    },
  };
}
