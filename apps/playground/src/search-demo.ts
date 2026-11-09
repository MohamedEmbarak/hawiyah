import type {Locale} from './data';
import type {ProjectFramework, ProjectLanguage} from './project-compiler';

const e=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export type SearchDemoKind = 'plain' | 'suggestions' | 'states' | 'modal';
export function searchDemoCases(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return [
    {kind:'plain',title:t('Clearable free-text search','بحث نصي مع مسح القيمة')},
    {kind:'suggestions',title:t('Local bilingual suggestions','اقتراحات محلية بالعربية والإنجليزية')},
    {kind:'states',title:t('Read-only, disabled and invalid states','حالات القراءة فقط والتعطيل والخطأ')},
    {kind:'modal',title:t('Search dialog and suggested terms','حوار بحث وعبارات مقترحة')},
  ] as const;
}
export function searchDemoCopy(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return {
    label:t('Search services','ابحث عن الخدمات'),clear:t('Clear search','مسح البحث'),submit:t('Search','بحث'),
    placeholder:t('Type a service or question','اكتب خدمة أو سؤالًا'),
    initial:t('License renewal','تجديد الرخصة'),
    hint:t('Try إصدار or اصدار, License, or <img. Suggestions are literal local text.','جرّب إصدار أو اصدار أو License أو <img. الاقتراحات نصوص محلية تُعرض كما هي.'),
    readonly:t('Read-only search','بحث للقراءة فقط'),disabled:t('Disabled search','بحث معطل'),invalid:t('Search with an error','بحث مع خطأ'),
    error:t('Enter a more specific search phrase.','أدخل عبارة بحث أكثر تحديدًا.'),
    open:t('Open search dialog','فتح حوار البحث'),title:t('Find a service','اعثر على خدمة'),close:t('Close search','إغلاق البحث'),
    suggested:t('Suggested searches','عمليات بحث مقترحة'),advanced:t('Advanced search','بحث متقدم'),
    advancedStatus:t('Advanced search requested in this local example.','تم طلب البحث المتقدم في هذا المثال المحلي.'),
    resultPrefix:t('Search requested: ','طلب بحث: '),empty:t('Enter a search phrase.','أدخل عبارة للبحث.'),
    suggestions:['إصدار رخصة','إصْدار شهادة','أفراد','افراد','تجديد الرخصة','License renewal','Application status','<img src=x onerror=alert(1)>'],
    terms:[t('License renewal','تجديد الرخصة'),t('Application status','حالة الطلب'),t('Support','الدعم')],
    resultsExpression:locale==='ar'?"count + ' اقتراحات متاحة'":"count + ' suggestions available'",
  };
}

type SearchState = 'readonly'|'disabled'|'invalid'|'';
/** A field inside an existing form. The caller owns submission. */
export function searchFieldMarkup(locale: Locale, id: string, name: string, options: {
  label?: string; value?: string; state?: SearchState; suggestions?: boolean; autofocus?: boolean;
} = {}) {
  const d = searchDemoCopy(locale);
  const {label = d.label, value = '', state = '', suggestions = false, autofocus = false} = options;
  const hint = state === 'invalid' ? `${id}-error` : '';
  return `<div class="hw-field hw-search-field" data-hw="search-field"${suggestions?` data-hw-suggestions="${e(JSON.stringify(d.suggestions))}" data-hw-max-suggestions="8"`:''}><label class="hw-label" for="${id}">${e(label)}</label><div class="hw-search-control"><input id="${id}" class="hw-input" type="search" name="${e(name)}" autocomplete="off" placeholder="${e(d.placeholder)}" value="${e(value)}" data-hw-search-input${autofocus?' autofocus':''}${state==='readonly'?' readonly':state==='disabled'?' disabled':state==='invalid'?' aria-invalid="true"':''}${hint?` aria-describedby="${hint}"`:''}><button type="button" class="hw-button hw-search-clear" data-variant="ghost" data-hw-search-clear aria-label="${e(d.clear)}"></button></div>${state==='invalid'?`<p class="hw-error" id="${id}-error">${e(d.error)}</p>`:''}</div>`;
}

export function searchDemoMarkup(locale: Locale,kind: SearchDemoKind='plain',prefix=`ready-search-${kind}`) {
  const d=searchDemoCopy(locale);
  const field=(key:string,label:string,value='',state:SearchState='',suggestions=false)=>
    searchFieldMarkup(locale,`${prefix}-${key}`,'query',{label,value,state,suggestions,autofocus:kind==='modal'});
  const form=(suggestions=false)=>`${suggestions?`<p class="hw-hint">${e(d.hint)}</p>`:''}<form class="hw-search-form" data-search-demo-form>${field('query',d.label,kind==='plain'?d.initial:'','',suggestions)}<button class="hw-button hw-search-submit" type="submit" aria-label="${e(d.submit)}"><span class="hw-search-submit-icon" aria-hidden="true"></span></button></form>`;
  const status=`<output class="hw-hint" data-search-demo-result role="status"></output>`;
  const modal=`<button class="hw-button" type="button" data-search-demo-open data-hw-dialog-open="${prefix}-dialog">${e(d.open)}</button><dialog id="${prefix}-dialog" class="hw-dialog hw-search-dialog" data-hw="dialog" aria-labelledby="${prefix}-title"><header class="hw-dialog-header"><h2 id="${prefix}-title">${e(d.title)}</h2><button class="hw-button" type="button" data-variant="ghost" data-hw-dialog-close aria-label="${e(d.close)}"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></header><div class="hw-dialog-body">${form(true)}<div class="hw-search-terms" role="group" aria-label="${e(d.suggested)}"><h3>${e(d.suggested)}</h3>${d.terms.map(term=>`<button class="hw-search-term" type="button" data-search-demo-term="${e(term)}">${e(term)}</button>`).join('')}</div><div class="hw-search-advanced"><button type="button" data-search-demo-advanced>${e(d.advanced)}</button></div>${status}</div></dialog>`;
  return `<div class="hw-stack" data-search-demo="${kind}" data-search-demo-locale="${locale}">${kind==='states'?field('readonly',d.readonly,d.initial,'readonly')+field('disabled',d.disabled,d.initial,'disabled')+field('invalid',d.invalid,'?','invalid'):kind==='modal'?modal:form(kind==='suggestions')+status}</div>`;
}

/** Guide-only application actions. The library continues to own field/dialog behavior. */
export function bindSearchDemos(root: HTMLElement) {
  const abort=new AbortController();
  const host=(target:EventTarget|null)=>target instanceof Element?target.closest<HTMLElement>('[data-search-demo]'):null;
  const show=(example:HTMLElement,message:string)=>{const output=example.querySelector<HTMLElement>('[data-search-demo-result]');if(output)output.textContent=message;};
  root.addEventListener('submit',event=>{
    const form=event.target instanceof HTMLFormElement&&event.target.matches('[data-search-demo-form]')?event.target:null;
    const example=host(form);if(!form||!example)return;
    event.preventDefault();const d=searchDemoCopy(example.dataset.searchDemoLocale==='en'?'en':'ar');
    const query=String(new FormData(form).get('query')??'').trim();show(example,query?d.resultPrefix+query:d.empty);
  },{signal:abort.signal});
  root.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target.closest<HTMLElement>('[data-search-demo-term],[data-search-demo-advanced]'):null;
    const example=host(target);if(!target||!example)return;
    const d=searchDemoCopy(example.dataset.searchDemoLocale==='en'?'en':'ar');
    if(target.hasAttribute('data-search-demo-advanced')){show(example,d.advancedStatus);return;}
    const input=example.querySelector<HTMLInputElement>('[data-hw-search-input]');if(!input||input.disabled||input.readOnly)return;
    input.value=target.dataset.searchDemoTerm??'';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();show(example,d.resultPrefix+input.value.trim());
  },{signal:abort.signal});
  return ()=>abort.abort();
}

export function searchDemoScript(locale: Locale,typed=false) {
  const d=searchDemoCopy(locale);
  return `// Application actions: field/dialog behavior is initialized with enhance(root).\nconst interactions = new AbortController();\nroot.addEventListener('submit', event => {\n  const form = event.target;\n  if (!(form instanceof HTMLFormElement) || !form.matches('[data-search-demo-form]')) return;\n  event.preventDefault();\n  const example = form.closest('[data-search-demo]');\n  const output = example?.querySelector('[data-search-demo-result]');\n  const query = String(new FormData(form).get('query') ?? '').trim();\n  if (output) output.textContent = query ? ${JSON.stringify(d.resultPrefix)} + query : ${JSON.stringify(d.empty)};\n}, { signal: interactions.signal });\nroot.addEventListener('click', event => {\n  const action = event.target instanceof Element ? event.target.closest('[data-search-demo-term],[data-search-demo-advanced]') : null;\n  const example = action?.closest('[data-search-demo]');\n  if (!action || !example) return;\n  if (action.hasAttribute('data-search-demo-advanced')) {\n    const output = example.querySelector('[data-search-demo-result]');\n    if (output) output.textContent = ${JSON.stringify(d.advancedStatus)};\n    return;\n  }\n  const input = example.querySelector${typed?'<HTMLInputElement>':''}('[data-hw-search-input]');\n  if (!(input instanceof HTMLInputElement) || input.disabled || input.readOnly) return;\n  input.value = action.getAttribute('data-search-demo-term') ?? '';\n  input.dispatchEvent(new Event('input', { bubbles: true }));\n  input.focus();\n  const output = example.querySelector('[data-search-demo-result]');\n  if (output) output.textContent = ${JSON.stringify(d.resultPrefix)} + input.value.trim();\n}, { signal: interactions.signal });\nwindow.addEventListener('pagehide', () => interactions.abort(), { once: true });\n`;
}

export function searchProject(framework: ProjectFramework,language: ProjectLanguage,locale: Locale,kinds: readonly SearchDemoKind[]=['plain','suggestions','states','modal']) {
  const typed=language==='typescript',ext=typed?'ts':'js',d=searchDemoCopy(locale),direction=locale==='ar'?'rtl':'ltr';
  const cases=kinds.map(kind=>({...searchDemoCases(locale).find(item=>item.kind===kind)!,key:kind==='plain'?'0':kind==='suggestions'?'1':'3'}));
  const css="@import '@hawiyah/styles/styles.css';\n\n.demo { display:grid; gap:1.5rem; }\n";
  if(framework==='vanilla')return {
    names:{html:'index.html',css:'style.css',js:`main.${ext}`},entry:`main.${ext}`,host:'',files:{css,
      html:`<!doctype html>\n<html lang="${locale}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hawiyah search example</title></head><body><main id="app" class="demo">${cases.map(item=>`<section><h2>${e(item.title)}</h2>${searchDemoMarkup(locale,item.kind,`project-search-${item.kind}`)}</section>`).join('')}</main><script type="module" src="./main.${ext}"></script></body></html>\n`,
      js:`import { enhance } from '@hawiyah/vanilla';\nimport './style.css';\n\nconst root = document.querySelector${typed?'<HTMLElement>':''}('#app');\nif (!root) throw new Error('Missing app root');\nconst cleanup = enhance(root);\nwindow.addEventListener('pagehide', cleanup, { once: true });\n\n${searchDemoScript(locale,typed)}`,
    },
  };
  const modal=kinds.includes('modal'),interactive=cases.filter(item=>item.kind!=='states');
  const result=`query.trim() ? ${JSON.stringify(d.resultPrefix)} + query.trim() : ${JSON.stringify(d.empty)}`;
  const reactField=(key:string,suggest=false,props='')=>`<SearchField label="${d.label}" name="query" value={value${key}} onValueChange={setValue${key}} clearLabel="${d.clear}" searchLabel="${d.submit}" placeholder="${d.placeholder}" showSearchButton={false}${suggest?' suggestions={suggestions} maxSuggestions={8} resultsMessage={resultsMessage}':''} ${props} />`;
  const vueField=(key:string,suggest=false,props='')=>`<SearchField label="${d.label}" name="query" v-model="value${key}" clear-label="${d.clear}" search-label="${d.submit}" placeholder="${d.placeholder}" :show-search-button="false"${suggest?' :suggestions="suggestions" :max-suggestions="8" :results-message="resultsMessage"':''} ${props} />`;
  const angularField=(key:string,suggest=false,props='')=>`<hw-search-field label="${d.label}" name="query" [(value)]="value${key}" clearLabel="${d.clear}" searchLabel="${d.submit}" placeholder="${d.placeholder}" [showSearchButton]="false"${suggest?' [suggestions]="suggestions" [maxSuggestions]="8" [resultsMessage]="resultsMessage"':''} ${props} />`;
  const submit=(react=false)=>`<button type="submit" ${react?'className':'class'}="hw-button hw-search-submit" ${react?'aria-label':'aria-label'}="${d.submit}"><span ${react?'className':'class'}="hw-search-submit-icon" aria-hidden="true"></span></button>`;
  const reactForm=(key:string,suggest=false,props='')=>`${suggest?`<p className="hw-hint">{${JSON.stringify(d.hint)}}</p>`:''}<form className="hw-search-form" data-search-demo-form onSubmit={event => {event.preventDefault(); setStatus${key}(result(value${key}));}}>${reactField(key,suggest,props)}${submit(true)}</form>`;
  const vueForm=(key:string,suggest=false,props='')=>`${suggest?`<p class="hw-hint">${e(d.hint)}</p>`:''}<form class="hw-search-form" data-search-demo-form @submit.prevent="status${key} = result(value${key})">${vueField(key,suggest,props)}${submit()}</form>`;
  const angularForm=(key:string,suggest=false,props='')=>`${suggest?`<p class="hw-hint">${e(d.hint)}</p>`:''}<form class="hw-search-form" data-search-demo-form (submit)="$event.preventDefault(); status${key} = result(value${key})">${angularField(key,suggest,props)}${submit()}</form>`;
  const reactStatus=(key:string)=>`<output className="hw-hint" data-search-demo-result role="status">{status${key}}</output>`;
  const vueStatus=(key:string)=>`<output class="hw-hint" data-search-demo-result role="status">{{ status${key} }}</output>`;
  const reactMarkup=cases.map(item=>{
    const content=item.kind==='states'?`<SearchField label="${d.readonly}" value="${d.initial}" readOnly clearLabel="${d.clear}" showSearchButton={false} /><SearchField label="${d.disabled}" value="${d.initial}" disabled clearLabel="${d.clear}" showSearchButton={false} /><SearchField label="${d.invalid}" defaultValue="?" error="${d.error}" clearLabel="${d.clear}" showSearchButton={false} />`
      :item.kind==='modal'?`<Dialog className="hw-search-dialog" title="${d.title}" closeLabel="${d.close}" onToggle={event => { if (event.currentTarget.open) modalInput.current?.focus(); }} trigger={<button className="hw-button" type="button" data-search-demo-open>${d.open}</button>}>${reactForm('3',true,'ref={modalInput}')}<div className="hw-search-terms" role="group" aria-label="${d.suggested}"><h3>${d.suggested}</h3>${d.terms.map(term=>`<button className="hw-search-term" type="button" onClick={() => {setValue3(${JSON.stringify(term)}); setStatus3(result(${JSON.stringify(term)})); modalInput.current?.focus();}}>${term}</button>`).join('')}</div><div className="hw-search-advanced"><button type="button" onClick={() => setStatus3(${JSON.stringify(d.advancedStatus)})}>${d.advanced}</button></div>${reactStatus('3')}</Dialog>`
      :reactForm(item.key,item.kind==='suggestions')+reactStatus(item.key);
    return `<section className="hw-stack" data-search-demo="${item.kind}"><h2>${item.title}</h2>${content}</section>`;
  }).join('');
  if(framework==='react')return {
    names:{html:`App.${typed?'tsx':'jsx'}`,css:'style.css',js:`main.${typed?'tsx':'jsx'}`},entry:`main.${typed?'tsx':'jsx'}`,host:'<div id="app"></div>',files:{css,
      html:`${interactive.length?`import { useState${modal?', useRef':''} } from 'react';\n`:''}import { SearchField${modal?', Dialog':''} } from '@hawiyah/react';\n\nconst suggestions = ${JSON.stringify(d.suggestions)};\nconst resultsMessage = (count${typed?': number':''}) => ${d.resultsExpression};\nconst result = (query${typed?': string':''}) => ${result};\n\nexport default function App() {\n${interactive.map(item=>`  const [value${item.key}, setValue${item.key}] = useState(${JSON.stringify(item.kind==='plain'?d.initial:'')});\n  const [status${item.key}, setStatus${item.key}] = useState('');`).join('\n')}${modal?`\n  const modalInput = useRef${typed?'<HTMLInputElement | null>':''}(null);`:''}\n  return <main className="demo" lang="${locale}" dir="${direction}">${reactMarkup}</main>;\n}\n`,
      js:`import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\nconst root = document.getElementById('app');\nif (!root) throw new Error('Missing app root');\ncreateRoot(root).render(<App />);\n`,
    },
  };
  const vueMarkup=cases.map(item=>{
    const content=item.kind==='states'?`<SearchField label="${d.readonly}" model-value="${d.initial}" readonly clear-label="${d.clear}" :show-search-button="false" /><SearchField label="${d.disabled}" model-value="${d.initial}" disabled clear-label="${d.clear}" :show-search-button="false" /><SearchField label="${d.invalid}" default-value="?" error="${d.error}" clear-label="${d.clear}" :show-search-button="false" />`
      :item.kind==='modal'?`<Dialog class="hw-search-dialog" title="${d.title}" close-label="${d.close}"><template #trigger="{ open }"><button class="hw-button" type="button" data-search-demo-open @click="open">${d.open}</button></template>${vueForm('3',true,'ref="modalInput" autofocus')}<div class="hw-search-terms" role="group" aria-label="${d.suggested}"><h3>${d.suggested}</h3>${d.terms.map(term=>`<button class="hw-search-term" type="button" @click='value3 = ${JSON.stringify(term)}; status3 = result(${JSON.stringify(term)}); modalInput?.focus()'>${term}</button>`).join('')}</div><div class="hw-search-advanced"><button type="button" @click='status3 = ${JSON.stringify(d.advancedStatus)}'>${d.advanced}</button></div>${vueStatus('3')}</Dialog>`
      :vueForm(item.key,item.kind==='suggestions')+vueStatus(item.key);
    return `<section class="hw-stack" data-search-demo="${item.kind}"><h2>${item.title}</h2>${content}</section>`;
  }).join('');
  if(framework==='vue')return {
    names:{html:'App.vue',css:'style.css',js:`main.${ext}`},entry:`main.${ext}`,host:'<div id="app"></div>',files:{css,
      html:`<script setup${typed?' lang="ts"':''}>\n${interactive.length?"import { ref } from 'vue';\n":''}import { SearchField${modal?', Dialog':''} } from '@hawiyah/vue';\nconst suggestions = ${JSON.stringify(d.suggestions)};\nconst resultsMessage = (count${typed?': number':''}) => ${d.resultsExpression};\nconst result = (query${typed?': string':''}) => ${result};\n${interactive.map(item=>`const value${item.key} = ref(${JSON.stringify(item.kind==='plain'?d.initial:'')});\nconst status${item.key} = ref('');`).join('\n')}${modal?`\nconst modalInput = ref${typed?'<{focus: () => void} | null>':''}(null);`:''}\n</script>\n\n<template>\n<main class="demo" lang="${locale}" dir="${direction}">${vueMarkup}</main>\n</template>\n`,
      js:`import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n`,
    },
  };
  const angularMarkup=cases.map(item=>{
    const content=item.kind==='states'?`<hw-search-field label="${d.readonly}" value="${d.initial}" [readOnly]="true" clearLabel="${d.clear}" [showSearchButton]="false" /><hw-search-field label="${d.disabled}" value="${d.initial}" [disabled]="true" clearLabel="${d.clear}" [showSearchButton]="false" /><hw-search-field label="${d.invalid}" value="?" error="${d.error}" clearLabel="${d.clear}" [showSearchButton]="false" />`
      :item.kind==='modal'?`<button class="hw-button" type="button" data-search-demo-open (click)="dialogOpen = true">${d.open}</button><hw-dialog class="hw-search-dialog" title="${d.title}" closeLabel="${d.close}" [(open)]="dialogOpen">${angularForm('3',true,'#modalSearch [autofocus]="true"')}<div class="hw-search-terms" role="group" aria-label="${d.suggested}"><h3>${d.suggested}</h3>${d.terms.map(term=>`<button class="hw-search-term" type="button" (click)='value3 = ${JSON.stringify(term)}; status3 = result(${JSON.stringify(term)}); modalSearch.focus()'>${term}</button>`).join('')}</div><div class="hw-search-advanced"><button type="button" (click)='status3 = ${JSON.stringify(d.advancedStatus)}'>${d.advanced}</button></div>${vueStatus('3')}</hw-dialog>`
      :angularForm(item.key,item.kind==='suggestions')+vueStatus(item.key);
    return `<section class="hw-stack" data-search-demo="${item.kind}"><h2>${item.title}</h2>${content}</section>`;
  }).join('');
  return {
    names:{html:'app.component.ts',css:'style.css',js:'main.ts'},entry:'main.ts',host:'<app-root></app-root>',files:{css,
      html:`import { Component } from '@angular/core';\nimport { HwSearchFieldComponent${modal?', HwDialogComponent':''} } from '@hawiyah/angular';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [HwSearchFieldComponent${modal?', HwDialogComponent':''}],\n  template: \`<main class="demo" lang="${locale}" dir="${direction}">${angularMarkup}</main>\`,\n})\nexport class AppComponent {\n  suggestions = ${JSON.stringify(d.suggestions)};\n  resultsMessage = (count: number) => ${d.resultsExpression};\n  result = (query: string) => ${result};\n${interactive.map(item=>`  value${item.key} = ${JSON.stringify(item.kind==='plain'?d.initial:'')};\n  status${item.key} = '';`).join('\n')}${modal?'\n  dialogOpen = false;':''}\n}\n`,
      js:`import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n`,
    },
  };
}
