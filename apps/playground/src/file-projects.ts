import type {Locale} from './data';
import type {ProjectExample} from './project-examples';
import type {ProjectFramework, ProjectLanguage} from './project-compiler';

export const fileProjectIds = ['upload', 'file-dropzone'] as const;
type FileProjectId = typeof fileProjectIds[number];
export function isFileProjectId(id: string): id is FileProjectId {
  return fileProjectIds.some(value => value === id);
}

export function fileProject(id: FileProjectId, framework: ProjectFramework, language: ProjectLanguage, locale: Locale): ProjectExample {
  const ar = locale === 'ar', typed = language === 'typescript', drop = id === 'file-dropzone';
  const component = drop ? 'FileDropzone' : 'FileUpload';
  const selector = drop ? 'nq-file-dropzone' : 'nq-file-upload';
  const dir = ar ? 'rtl' : 'ltr';
  const label = ar ? 'أرفق المستندات' : 'Attach documents';
  const help = !drop
    ? (ar ? 'يقترح منتقي الملفات مستندات PDF وصور PNG.' : 'The file chooser suggests PDF documents and PNG images.')
    : framework === 'angular'
      ? (ar ? 'إذا ضمّت الدفعة أنواعًا مختلفة، تبقى ملفات PDF وPNG ويُستبعد سواها.' : 'A mixed batch keeps the PDF and PNG files and excludes the other files.')
      : (ar ? 'إذا احتوت الدفعة على ملف بغير صيغة PDF أو PNG، يُرفض الاختيار بالكامل.' : 'If any file is outside PDF or PNG, the entire selection is cleared.');
  const disabled = ar ? 'تعطيل اختيار الملفات' : 'Disable file selection';
  const rejected = ar ? 'رُفضت ملفات لا تطابق الأنواع المسموحة.' : 'Some files did not match the permitted types.';
  const count = ar ? 'عدد الملفات المختارة' : 'Selected files';
  const submit = ar ? 'تحقّق من بيانات النموذج محليًا' : 'Inspect form data locally';
  const reset = ar ? 'إعادة ضبط' : 'Reset';
  const result = ar ? 'الملفات في بيانات النموذج' : 'Files in form data';
  const local = ar ? 'تُعرض أسماء الملفات محليًا فقط.' : 'Filenames are displayed locally.';
  const statesTitle = ar ? 'أمثلة حالات الرفع' : 'Upload state examples';
  const statesHint = ar ? 'حالات توضيحية. يزوّد التطبيق حالة الرفع الفعلية ونسبته، ويعالج طلب الإزالة.' : 'Illustrative states. The application supplies actual upload status and progress, and handles removal requests.';
  const statusLabels = JSON.stringify(ar ? {selected:'جاهز للرفع',uploading:'جارٍ الرفع',complete:'اكتمل الرفع',error:'تعذر الرفع',remove:'إزالة الملف'} : {selected:'Ready to upload',uploading:'Uploading',complete:'Upload complete',error:'Upload failed',remove:'Remove file'});
  const statusItems = JSON.stringify([
    {id:'selected',name:'document.pdf',status:'selected'},
    {id:'uploading',name:'attachment.png',status:'uploading',progress:45},
    {id:'complete',name:'approved.pdf',status:'complete'},
    {id:'error',name:'retry.pdf',status:'error',message:ar ? 'تعذر الاتصال. أعد المحاولة.' : 'Connection failed. Please retry.'},
  ]);
  const css = `@import '@nasaq/styles/styles.css';\n\n.demo { display: grid; gap: 1rem; max-inline-size: 34rem; margin-inline: auto; }\n.demo ul { margin: 0; overflow-wrap: anywhere; }\n.demo output { overflow-wrap: anywhere; }\n`;
  const ext = typed ? 'ts' : 'js';
  const formDataHelper = `function submittedNames(form${typed || framework === 'angular' ? ': HTMLFormElement' : ''}) {
  return new FormData(form).getAll('documents')
    .flatMap(entry => entry instanceof File && entry.name ? [entry.name] : []).join(', ') || '—';
}

function removeSelectedFile(id${typed || framework === 'angular' ? ': string' : ''}) {
  // Scope the native FileList update to this example's owning form.
  const input = document.querySelector('#${id}-example-form input[type="file"]');
  if (!(input instanceof HTMLInputElement) || input.matches(':disabled')) return;
  const files = Array.from(input.files || []);
  const index = Number(id);
  if (!Number.isInteger(index) || index < 0 || index >= files.length) return;
  const transfer = new DataTransfer();
  files.forEach((file, position) => { if (position !== index) transfer.items.add(file); });
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', {bubbles: true}));
  input.focus();
}`;
  const formAttrs = `id="${id}-example-form" class="demo" data-file-project="${id}" lang="${locale}" dir="${dir}"`;
  const inputAttrs = 'name="documents" multiple accept=".pdf,.png"';
  const buttons = `<div class="nq-inline"><button class="nq-button" type="submit">${submit}</button><button class="nq-button" data-variant="secondary" type="reset">${reset}</button></div>`;

  if (framework === 'vanilla') {
    const html = `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${label}</title></head>
<body><form ${formAttrs}>
  <div class="nq-field ${drop ? 'nq-file-dropzone' : 'nq-upload'}"${drop ? ' data-file-dropzone' : ''}>
    <label class="nq-label" for="documents">${label}</label>
    <input id="documents" class="nq-input" type="file" ${inputAttrs} aria-describedby="file-hint"${drop ? ' data-nq-file-input' : ''}>
    <p id="file-hint" class="nq-hint">${help}</p>${drop ? '\n    <p role="status" data-nq-file-status></p>' : ''}
  </div>
  <label><input type="checkbox" class="nq-checkbox" data-file-disable> ${disabled}</label>
  <div>${count} <output data-file-count>0</output><div data-file-names></div></div>
  ${buttons}
  <div>${result} <output data-file-submitted>—</output></div>
  <p class="nq-hint">${local}</p>
</form><section class="demo"><h2>${statesTitle}</h2><p>${statesHint}</p><div data-upload-states></div></section><script type="module" src="./main.${ext}"></script></body></html>`;
    const js = `import { createFileUploadList, ${drop ? 'createFileDropzone' : 'enhance'} } from '@nasaq/vanilla';
${typed ? "import type { FileUploadItem } from '@nasaq/core';" : ''}
import './style.css';

let transferItems${typed ? ': FileUploadItem[]' : ''} = ${statusItems};
const transferHost = document.querySelector('[data-upload-states]');
if (!(transferHost instanceof HTMLElement)) throw new Error('Missing upload list');
const transferList = createFileUploadList(transferHost, {items: transferItems, labels: ${statusLabels}, onRemove(id) {
  transferItems = transferItems.filter(item => item.id !== id);
  transferList.update(transferItems);
}});
window.addEventListener('pagehide', () => transferList.destroy(), {once: true});

${formDataHelper}

const form = document.querySelector('form');
const input = document.querySelector('input[type="file"]');
const toggle = document.querySelector('[data-file-disable]');
const count = document.querySelector('[data-file-count]');
const names = document.querySelector('[data-file-names]');
const submitted = document.querySelector('[data-file-submitted]');
if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement) ||
    !(toggle instanceof HTMLInputElement) || !count || !names || !submitted) throw new Error('Missing form controls');
const selectedList = createFileUploadList(names${typed ? ' as HTMLElement' : ''}, {items: [], labels: ${statusLabels}, onRemove: removeSelectedFile});

function showFiles(files${typed ? ': readonly File[]' : ''}) {
  count${typed ? '!' : ''}.textContent = String(files.length);
  selectedList.update(files.map((file, index) => ({id: String(index), name: file.name, status: 'selected'})));
}

const listeners = new AbortController();
const events = {signal: listeners.signal};
${drop ? `const zone = form.querySelector('[data-file-dropzone]');
if (!(zone instanceof HTMLElement)) throw new Error('Missing dropzone');
const controller = createFileDropzone(zone, {
  getStatusMessage: (_files, rejected) => rejected ? ${JSON.stringify(rejected)} : '',
  onValueChange: showFiles,
});` : `const release = enhance(form);
input.addEventListener('change', () => showFiles(Array.from(input.files || [])), events);`}
toggle.addEventListener('change', () => { input.disabled = toggle.checked; selectedList.setDisabled(toggle.checked); }, events);
form.addEventListener('submit', event => {
  event.preventDefault();
  submitted.textContent = submittedNames(form);
}, events);
form.addEventListener('reset', () => {
  input.disabled = false;
  selectedList.setDisabled(false);
  showFiles([]);
  submitted.textContent = '—';
}, events);
window.addEventListener('pagehide', () => { listeners.abort(); selectedList.destroy(); ${drop ? 'controller.destroy()' : 'release()'}; }, {once: true});
`;
    return {names:{html:'index.html', css:'style.css', js:`main.${ext}`}, files:{html,css,js}, entry:`main.${ext}`, host:''};
  }

  if (framework === 'react') {
    const jsx = typed ? 'tsx' : 'jsx';
    const html = `import { useState } from 'react';
import { Button, FileUploadList, ${component} } from '@nasaq/react';
${typed ? "import type { FileUploadItem } from '@nasaq/core';" : ''}

${formDataHelper}

export default function App() {
  const [transfers, setTransfers] = useState${typed ? '<FileUploadItem[]>' : ''}(${statusItems});
  const [files, setFiles] = useState${typed ? '<File[]>' : ''}([]);
  const [disabled, setDisabled] = useState(false);
  const [submitted, setSubmitted] = useState('—');
  return <><form ${formAttrs.replace('class=', 'className=')} onSubmit={event => {
    event.preventDefault();
    setSubmitted(submittedNames(event.currentTarget));
  }} onReset={() => { setFiles([]); setDisabled(false); setSubmitted('—'); }}>
    <${component} label="${label}" hint="${help}" ${inputAttrs} disabled={disabled} onFilesChange={setFiles}${drop ? ` getRejectedMessage={() => ${JSON.stringify(rejected)}}` : ''} />
    <label><input className="nq-checkbox" type="checkbox" checked={disabled} onChange={event => setDisabled(event.target.checked)} /> ${disabled}</label>
    <div>${count} <output data-file-count>{files.length}</output><div data-file-names><FileUploadList items={files.map((file, index) => ({id: String(index), name: file.name, status: 'selected'}))} labels={${statusLabels}} disabled={disabled} onRemove={removeSelectedFile} /></div></div>
    <div className="nq-inline"><Button type="submit">${submit}</Button><Button type="reset" variant="secondary">${reset}</Button></div>
    <div>${result} <output data-file-submitted>{submitted}</output></div>
    <p className="nq-hint">${local}</p>
  </form><section className="demo"><h2>${statesTitle}</h2><p>${statesHint}</p><FileUploadList items={transfers} labels={${statusLabels}} onRemove={id => setTransfers(items => items.filter(item => item.id !== id))} /></section></>;
}
`;
    return {names:{html:`App.${jsx}`, css:'style.css', js:`main.${jsx}`}, files:{html,css,js:`import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\ncreateRoot(document.getElementById('app')${typed ? '!' : ''}).render(<App />);\n`},entry:`main.${jsx}`,host:'<div id="app"></div>'};
  }

  if (framework === 'vue') {
    const html = `<script setup${typed ? ' lang="ts"' : ''}>
import { ref, computed } from 'vue';
import { Button, FileUploadList, ${component} } from '@nasaq/vue';
${typed ? "import type { FileUploadItem } from '@nasaq/core';" : ''}
const transfers = ref${typed ? '<FileUploadItem[]>' : ''}(${statusItems});
const transferLabels = ${statusLabels};
function removeTransfer(id${typed ? ': string' : ''}) { transfers.value = transfers.value.filter(item => item.id !== id); }

${formDataHelper}

const files = ref${typed ? '<File[]>' : ''}([]);
const selectedItems = computed(() => files.value.map((file, index) => ({id: String(index), name: file.name, status: 'selected'${typed ? ' as const' : ''}})));
const disabled = ref(false);
const submitted = ref('—');${drop ? "\nconst rejection = ref('');" : ''}
function inspect(event${typed ? ': Event' : ''}) {
  if (event.currentTarget instanceof HTMLFormElement) submitted.value = submittedNames(event.currentTarget);
}
function reset() {
  files.value = [];
  disabled.value = false;
  submitted.value = '—';${drop ? "\n  rejection.value = '';" : ''}
}
</script>

<template>
  <form ${formAttrs} @submit.prevent="inspect" @reset="reset">
    <${component} label="${label}" hint="${help}" ${inputAttrs} :disabled="disabled" @update:files="files = $event${drop ? "; rejection = ''" : ''}"${drop ? ` drop-label="${label}" @reject="rejection = '${rejected}'"` : ''} />${drop ? '\n    <p role="status">{{ rejection }}</p>' : ''}
    <label><input class="nq-checkbox" type="checkbox" v-model="disabled"> ${disabled}</label>
    <div>${count} <output data-file-count>{{ files.length }}</output><div data-file-names><FileUploadList :items="selectedItems" :labels="transferLabels" :disabled="disabled" removable @remove="removeSelectedFile" /></div></div>
    <div class="nq-inline"><Button type="submit">${submit}</Button><Button type="reset" variant="secondary">${reset}</Button></div>
    <div>${result} <output data-file-submitted>{{ submitted }}</output></div>
    <p class="nq-hint">${local}</p>
  </form>
  <section class="demo"><h2>${statesTitle}</h2><p>${statesHint}</p><FileUploadList :items="transfers" :labels="transferLabels" removable @remove="removeTransfer" /></section>
</template>
`;
    return {names:{html:'App.vue',css:'style.css',js:`main.${ext}`},files:{html,css,js:"import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n"},entry:`main.${ext}`,host:'<div id="app"></div>'};
  }

  const html = `import { Component } from '@angular/core';
import { NqButtonDirective, NqFileUploadListComponent, Nq${component}Component } from '@nasaq/angular';
import type { FileUploadItem } from '@nasaq/core';

${formDataHelper}

@Component({
  selector: 'app-root', standalone: true, imports: [NqButtonDirective, NqFileUploadListComponent, Nq${component}Component],
  template: \`<form ${formAttrs} (submit)="inspect($event)" (reset)="reset()">
    <${selector} label="${label}" hint="${help}" ${inputAttrs} [disabled]="disabled" [value]="files" (valueChange)="files = $event"${drop ? ` instruction="${label}" [selectedMessage]="selectionMessage" (rejected)="setRejected($event)"` : ''} />${drop ? '\n    <p role="status">{{ rejection }}</p>' : ''}
    <label><input class="nq-checkbox" type="checkbox" [checked]="disabled" (change)="disabled = $any($event.target).checked"> ${disabled}</label>
    <div>${count} <output data-file-count>{{ files.length }}</output><div data-file-names><nq-file-upload-list [items]="selectedItems" [labels]="transferLabels" [disabled]="disabled" removable (remove)="removeSelectedFile($event)" /></div></div>
    <div class="nq-inline"><button nqButton type="submit">${submit}</button><button nqButton type="reset" variant="secondary">${reset}</button></div>
    <div>${result} <output data-file-submitted>{{ submitted }}</output></div>
    <p class="nq-hint">${local}</p>
  </form><section class="demo"><h2>${statesTitle}</h2><p>${statesHint}</p><nq-file-upload-list [items]="transfers" [labels]="transferLabels" removable (remove)="removeTransfer($event)" /></section>\`,
})
export class AppComponent {
  transfers: FileUploadItem[] = ${statusItems};
  transferLabels = ${statusLabels};
  removeTransfer(id: string) { this.transfers = this.transfers.filter(item => item.id !== id); }
  files: ${drop ? '' : 'readonly '}File[] = [];
  removeSelectedFile = removeSelectedFile;
  get selectedItems(): FileUploadItem[] { return this.files.map((file, index) => ({id: String(index), name: file.name, status: 'selected'})); }
  disabled = false;
  submitted = '—';${drop ? `
  rejection = '';
  selectionMessage = (count: number) => ${JSON.stringify(count+' ')} + count;
  setRejected(files: readonly File[]) {
    this.rejection = ${JSON.stringify(ar ? 'آخر ملفات مستبعدة' : 'Most recently excluded files')} + ' — ' + files.map(file => file.name).join(', ');
  }` : ''}
  inspect(event: Event) {
    event.preventDefault();
    if (event.currentTarget instanceof HTMLFormElement) this.submitted = submittedNames(event.currentTarget);
  }
  reset() {
    this.files = [];
    this.disabled = false;
    this.submitted = '—';${drop ? "\n    this.rejection = '';" : ''}
  }
}
`;
  return {names:{html:'app.component.ts',css:'style.css',js:'main.ts'},files:{html,css,js:"import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n"},entry:'main.ts',host:'<app-root></app-root>'};
}
