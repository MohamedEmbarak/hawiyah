import type {Locale} from './data';
import type {ProjectFramework, ProjectLanguage} from './project-compiler';
import type {ProjectExample} from './project-examples';

const components = { combobox: 'Combobox', 'pin-input': 'PinInput', 'tag-input': 'TagInput', 'multi-select': 'MultiSelect' } as const;
export type ChoiceInputId = keyof typeof components;
export const choiceInputIds = Object.keys(components) as ChoiceInputId[];
export function isChoiceInput(id: string): id is ChoiceInputId { return Object.hasOwn(components, id); }

export function choiceInputProject(id: ChoiceInputId, framework: ProjectFramework, language: ProjectLanguage, locale: Locale): ProjectExample {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const typed = language === 'typescript';
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const component = components[id];
  const combo = id === 'combobox', pin = id === 'pin-input', tags = id === 'tag-input';
  const multiple = tags || id === 'multi-select';
  const settings = {
    combobox: {name: 'city', initial: 'riyadh', label: t('Service office', 'مكتب الخدمة'), hint: t('Type to filter offices. Use the arrow keys, then Enter to select an office.', 'اكتب لتصفية المكاتب، ثم استخدم الأسهم واضغط Enter لاختيار مكتب.')},
    'pin-input': {name: 'code', initial: '0123', label: t('Practice code', 'رمز تجريبي'), hint: t('Enter a sample four-digit code. Leading zeros are retained.', 'أدخل رمزًا تجريبيًا من 4 أرقام. تُحفظ الأصفار في بداية الرمز.')},
    'tag-input': {name: 'tags', initial: [t('Reports', 'التقارير')], label: t('Service topics', 'موضوعات الخدمة'), hint: t('Enter or comma adds a topic. Backspace in an empty field removes the last topic.', 'اضغط Enter أو الفاصلة لإضافة موضوع. يحذف Backspace آخر موضوع عند فراغ الحقل.')},
    'multi-select': {name: 'offices', initial: ['riyadh'], label: t('Available offices', 'المكاتب المتاحة'), hint: t('Search the offices, then use Space to toggle a checkbox. Selections survive filtering.', 'ابحث عن المكاتب ثم اضغط مفتاح المسافة لتحديد خيار. تحتفظ التصفية بالخيارات المحددة.')},
  };
  const {name, initial, label, hint} = settings[id];
  const options = [{value: 'riyadh', label: t('Riyadh', 'الرياض')}, {value: 'jeddah', label: t('Jeddah', 'جدة')}, {value: 'dammam', label: t('Dammam', 'الدمام'), disabled: true}];
  const search = t('Filter offices', 'تصفية المكاتب'), empty = t('No matching offices', 'لا توجد مكاتب مطابقة');
  const required = combo ? t('Choose an office from the list.', 'اختر مكتبًا من القائمة.') : tags ? t('Add at least one topic.', 'أضف موضوعًا واحدًا على الأقل.') : t('Choose at least one office.', 'اختر مكتبًا واحدًا على الأقل.');
  const remove = t('Remove', 'إزالة'), add = t('Add', 'إضافة');
  const results = t('matching offices', 'مكاتب مطابقة'), selected = t('selected offices', 'مكاتب محددة');
  const disable = t('Disable field', 'تعطيل الحقل'), submit = t('Inspect form values', 'عرض قيم النموذج'), reset = t('Reset', 'إعادة الضبط');
  const modelLabel = t('Current value', 'القيمة الحالية'), formLabel = t('Submitted values', 'القيم المرسلة');
  const attrs = `data-choice-input-project="${id}" lang="${locale}" dir="${direction}"`;
  const buttons = `<div class="nq-inline"><button type="submit" class="nq-button">${submit}</button><button type="reset" class="nq-button" data-variant="secondary">${reset}</button></div>`;
  const css = "@import '@nasaq/styles/styles.css';\n\n.demo { display:grid; gap:1rem; max-inline-size:34rem; }\n.demo fieldset { min-inline-size:0; }\n.demo > fieldset { border:0; margin:0; padding:0; }\n.demo output { overflow-wrap:anywhere; }\n";
  const initialCode = JSON.stringify(initial);
  const ext = typed ? 'ts' : 'js';
  const collect = `function submittedValues(form${typed ? ': HTMLFormElement' : ''}) {
  return JSON.stringify(new FormData(form).getAll('${name}'));
}`;
  const nativeOptions = combo || !pin && !tags;
  const data = nativeOptions ? `const offices = ${JSON.stringify(options, null, 2)};
` : '';
  const type = multiple ? 'string[]' : 'string';

  if (framework === 'vanilla') {
    const inputLabel = `<label class="nq-label" for="choice-input">${label}</label>`;
    const hints = `<p class="nq-hint" id="choice-hint">${hint}</p>`;
    const inputAttrs = 'id="choice-input" class="nq-input" aria-describedby="choice-hint"';
    const fields = {
      combobox: `<div class="nq-field nq-combobox" data-control>${inputLabel}
    <input ${inputAttrs} required data-nq-combobox-input autocomplete="off">
    <input type="hidden" name="${name}" value="riyadh" data-nq-combobox-value>
    <ul class="nq-listbox" hidden data-nq-combobox-list>${options.map(o => `<li class="nq-option" data-nq-value="${o.value}"${o.disabled ? ' aria-disabled="true"' : ''}>${o.label}</li>`).join('')}</ul>
    ${hints}</div>`,
      'pin-input': `<div class="nq-field" data-control>${inputLabel}
    <input ${inputAttrs} data-nq-pin-input name="${name}" value="0123" maxlength="4" required>${hints}</div>`,
      'tag-input': `<div class="nq-field nq-tag-input" data-control data-nq-value='${initialCode}'>${inputLabel}
    <div class="nq-tags" data-nq-tags></div><input ${inputAttrs} data-nq-tag-input name="${name}" required>${hints}</div>`,
      'multi-select': `<fieldset class="nq-multi-select" data-control data-nq-required="true" aria-describedby="choice-hint"><legend class="nq-label">${label}</legend>
    <label for="choice-input">${search}</label><input ${inputAttrs} type="search" data-nq-multiselect-search>
    ${options.map(o => `<label class="nq-choice" data-nq-option><input type="checkbox" class="nq-checkbox" name="${name}" value="${o.value}"${o.value === 'riyadh' ? ' checked' : ''}${o.disabled ? ' disabled' : ''}>${o.label}</label>`).join('\n    ')}
    <span class="nq-sr-only" role="status" data-nq-status></span>${hints}</fieldset>`,
    };
    const config = combo ? `, { getResultsMessage: count => count + ' ${results}', invalidSelectionMessage: '${required}' }` : '';
    const html = `<!doctype html>
<html lang="${locale}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${label}</title></head>
<body><form class="demo" ${attrs}>
  <fieldset data-field><legend class="nq-sr-only">${label}</legend>${fields[id]}</fieldset>
  <label><input type="checkbox" data-disable> ${disable}</label>
  <p>${modelLabel} <output data-model></output></p>
  ${buttons}
  <p>${formLabel} <output data-submitted>—</output></p>
</form><script type="module" src="./main.${ext}"></script></body></html>`;
    const js = `import { create${component} } from '@nasaq/vanilla';
import './style.css';

${collect}
const form = document.querySelector('form');
const field = document.querySelector('[data-field]');
const root = document.querySelector('[data-control]');
const disable = document.querySelector('[data-disable]');
const model = document.querySelector('[data-model]');
const submitted = document.querySelector('[data-submitted]');
if (!(form instanceof HTMLFormElement) || !(root instanceof HTMLElement) || !(field instanceof HTMLFieldSetElement) || !(disable instanceof HTMLInputElement) || !(model instanceof HTMLOutputElement) || !(submitted instanceof HTMLOutputElement)) throw new Error('Missing example controls');
const controller = create${component}(root${config});
const listeners = new AbortController();
const events = { signal: listeners.signal };
const refresh = () => { model.value = JSON.stringify(controller.value); };
root.addEventListener('nq:change', refresh, events);
disable.addEventListener('change', () => { field.disabled = disable.checked; }, events);
form.addEventListener('submit', event => { event.preventDefault(); submitted.value = submittedValues(form); }, events);
form.addEventListener('reset', () => queueMicrotask(() => { field.disabled = false; submitted.value = '—'; refresh(); }), events);
refresh();
window.addEventListener('pagehide', () => { listeners.abort(); controller.destroy(); }, {once: true});
`;
    return {names:{html:'index.html', css:'style.css', js:`main.${ext}`}, files:{html, css, js}, entry:`main.${ext}`, host:''};
  }
  const common = `name="${name}" label="${label}" hint="${hint}" required`;
  if (framework === 'react') {
    const jsx = typed ? 'tsx' : 'jsx';
    const props = combo ? `options={offices} emptyMessage="${empty}" getResultsMessage={count => count + ' ${results}'} requiredMessage="${required}"` : pin ? 'length={4}' : tags ? `getRemoveLabel={tag => '${remove} ' + tag} requiredMessage="${required}"` : `options={offices} searchLabel="${search}" emptyMessage="${empty}" requiredMessage="${required}"`;
    const html = `import { useState } from 'react';
import { ${component} } from '@nasaq/react';

${data}${collect}

export default function App() {
  const [value, setValue] = useState${typed ? `<${type}>` : ''}(${initialCode});
  const [locked, setLocked] = useState(false);
  const [submitted, setSubmitted] = useState('—');
  return <form className="demo" ${attrs}
    onSubmit={event => { event.preventDefault(); setSubmitted(submittedValues(event.currentTarget)); }}
    onReset={() => { setValue(${initialCode}); setLocked(false); setSubmitted('—'); }}>
    <${component} ${common} ${props}
      disabled={locked} value={value} onValueChange={setValue} />
    <label><input type="checkbox" data-disable checked={locked} onChange={event => setLocked(event.currentTarget.checked)} /> ${disable}</label>
    <p>${modelLabel} <output data-model>{JSON.stringify(value)}</output></p>
    ${buttons.replaceAll('class=', 'className=')}
    <p>${formLabel} <output data-submitted>{submitted}</output></p>
  </form>;
}
`;
    const js = "import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\nconst root = document.getElementById('app');\nif (!root) throw new Error('Missing app root');\ncreateRoot(root).render(<App />);\n";
    return {names:{html:`App.${jsx}`, css:'style.css', js:`main.${jsx}`}, files:{html,css,js}, entry:`main.${jsx}`, host:'<div id="app"></div>'};
  }
  if (framework === 'vue') {
    const props = combo ? `:options="offices" empty-message="${empty}" :results-message="count => count + ' ${results}'" required-message="${required}"` : pin ? ':length="4"' : tags ? `:remove-label="tag => '${remove} ' + tag" required-message="${required}"` : `:options="offices" search-label="${search}" empty-message="${empty}" required-message="${required}"`;
    const html = `<script setup${typed ? ' lang="ts"' : ''}>
import { ref } from 'vue';
import { ${component} } from '@nasaq/vue';

${data}const initial = ${initialCode};
const value = ref${typed ? `<${type}>` : ''}(initial);
const locked = ref(false);
const submitted = ref('—');
${collect}
function submit(event${typed ? ': Event' : ''}) {
  if (event.currentTarget instanceof HTMLFormElement) submitted.value = submittedValues(event.currentTarget);
}
function reset() { value.value = initial; locked.value = false; submitted.value = '—'; }
</script>

<template>
  <form class="demo" ${attrs} @submit.prevent="submit" @reset="reset">
    <${component} ${common} ${props}
      :default-value="initial" v-model="value" :disabled="locked" />
    <label><input type="checkbox" data-disable v-model="locked"> ${disable}</label>
    <p>${modelLabel} <output data-model>{{ JSON.stringify(value) }}</output></p>
    ${buttons}
    <p>${formLabel} <output data-submitted>{{ submitted }}</output></p>
  </form>
</template>
`;
    const js = "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n";
    return {names:{html:'App.vue',css:'style.css',js:`main.${ext}`}, files:{html,css,js}, entry:`main.${ext}`, host:'<div id="app"></div>'};
  }
  const props = combo ? `[options]="offices" emptyMessage="${empty}" [resultsMessage]="resultsMessage" validationMessage="${required}"` : pin ? '[length]="4"' : tags ? `addLabel="${add}" removeLabel="${remove}" validationMessage="${required}"` : `[options]="offices" searchLabel="${search}" emptyMessage="${empty}" [selectedMessage]="selectedMessage" validationMessage="${required}"`;
  const members = combo ? `
  resultsMessage = (count: number) => count + ' ${results}';` : id === 'multi-select' ? `
  selectedMessage = (count: number) => count + ' ${selected}';` : '';
  const html = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Nq${component}Component } from '@nasaq/angular';

${data}${collect}

@Component({
  selector: 'app-root', standalone: true, imports: [ReactiveFormsModule, Nq${component}Component],
  template: \`<form #form class="demo" ${attrs} (submit)="$event.preventDefault(); submit(form)" (reset)="$event.preventDefault(); reset()">
    <nq-${id} ${common} ${props} [formControl]="control" />
    <label><input #toggle type="checkbox" data-disable [checked]="control.disabled" (change)="setDisabled(toggle.checked)"> ${disable}</label>
    <p>${modelLabel} <output data-model>{{ model }}</output></p>
    ${buttons}
    <p>${formLabel} <output data-submitted>{{ submitted }}</output></p>
  </form>\`,
})
export class AppComponent {
  control = new FormControl<${type}>(${initialCode}, { nonNullable: true });${nativeOptions ? '\n  offices = offices;' : ''}${members}
  submitted = '—';
  get model() { return JSON.stringify(this.control.value); }
  submit(form: HTMLFormElement) { this.submitted = submittedValues(form); }
  setDisabled(disabled: boolean) { if (disabled) this.control.disable(); else this.control.enable(); }
  reset() { this.control.enable(); this.control.reset(); this.submitted = '—'; }
}
`;
  const js = "import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n";
  return {names:{html:'app.component.ts',css:'style.css',js:'main.ts'}, files:{html,css,js}, entry:'main.ts', host:'<app-root></app-root>'};
}
