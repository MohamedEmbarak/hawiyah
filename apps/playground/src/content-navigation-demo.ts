import type {Locale} from './data';
import type {ProjectFramework, ProjectLanguage} from './project-compiler';

const e=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

export type ContentNavigationDemoKind = 'nested' | 'compact';
export const contentNavigationDemoCss = `.content-navigation-demo { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr)); gap:1rem; align-items:start; min-inline-size:0; }
.content-navigation-demo-scroll { block-size:260px; overflow:auto; min-inline-size:0; border:1px solid var(--hw-color-border); border-radius:var(--hw-radius-sm); padding:1rem; scroll-padding-block-start:0; }
.content-navigation-demo-section { min-block-size:260px; padding-block:1rem; border-block-end:1px solid var(--hw-color-border); overflow-wrap:anywhere; }
.content-navigation-demo-section:last-child { border-block-end:0; }
.content-navigation-demo-current { grid-column:1 / -1; overflow-wrap:anywhere; }
`;

export function contentNavigationDemoCases(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return [
    {kind:'nested',title:t('Nested sections and a disabled destination','أقسام متداخلة ووجهة معطلة')},
    {kind:'compact',title:t('Hidden heading and a custom navigation label','عنوان مخفي وتسمية تنقل مخصصة')},
  ] as const;
}

export function contentNavigationDemoCopy(locale: Locale,kind: ContentNavigationDemoKind,prefix=`content-nav-${kind}`) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  const sections=[
    {id:`${prefix}-overview`,label:t('Overview','نظرة عامة'),body:t('Review this service before preparing an application. Scroll this area to follow the current section.','تعرّف على الخدمة قبل تجهيز الطلب. مرّر هذه المساحة لمتابعة القسم الحالي.')},
    {id:`${prefix}-requirements`,label:t('Requirements','المتطلبات'),body:t('Prepare the application information and supporting documents.','جهّز بيانات الطلب والمستندات الداعمة.')},
    ...(kind==='nested'?[{id:`${prefix}-documents`,label:t('Documents','المستندات'),body:t('Check the accepted document types and keep the originals available.','راجع أنواع المستندات المقبولة واحتفظ بالأصول متاحة.')}]:[]),
    {id:`${prefix}-support`,label:t('Support','الدعم'),body:t('Use the contact channels supplied by your service provider. This is demonstration content.','استخدم قنوات التواصل التي يوفّرها مقدم الخدمة. هذا محتوى توضيحي.')},
  ];
  const items=[
    {id:sections[0]!.id,label:sections[0]!.label},
    {id:sections[1]!.id,label:sections[1]!.label,...(kind==='nested'?{children:[{id:sections[2]!.id,label:sections[2]!.label}]}:{})},
    ...(kind==='nested'?[{id:`${prefix}-unavailable`,label:t('Unavailable section','قسم غير متاح'),disabled:true}]:[]),
    {id:sections.at(-1)!.id,label:sections.at(-1)!.label},
  ];
  return {sections,items,showHeading:kind!=='compact',scrollId:`${prefix}-scroll`,
    label:kind==='compact'?t('Application guide sections','أقسام دليل التقديم'):t('On this page','في هذه الصفحة'),
    scrollLabel:kind==='nested'?t('Scrollable service information','معلومات الخدمة القابلة للتمرير'):t('Scrollable application guide','دليل التقديم القابل للتمرير'),
    currentLabel:t('Current section','القسم الحالي'),
  };
}

type DemoItem = {id:string;label:string;disabled?:boolean;children?:DemoItem[]};
export function contentNavigationDemoMarkup(locale: Locale,kind: ContentNavigationDemoKind='nested',prefix=`ready-content-nav-${kind}`) {
  const d=contentNavigationDemoCopy(locale,kind,prefix);
  const list=(items:DemoItem[],nested=false):string=>`<ul class="${nested?'hw-content-nav-sublist':'hw-content-nav-list'}">${items.map(item=>`<li><a class="hw-content-nav-link" data-hw-section="${item.id}" href="#${item.id}"${item.disabled?' aria-disabled="true" tabindex="-1"':''}><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">${e(item.label)}</span></a>${item.children?list(item.children,true):''}</li>`).join('')}</ul>`;
  const sections=d.sections.map(item=>`<section id="${item.id}" style="min-block-size:260px;padding-block:1rem;border-block-end:1px solid var(--hw-color-border);overflow-wrap:anywhere"><h3>${e(item.label)}</h3><p>${e(item.body)}</p></section>`).join('');
  return `<div class="content-navigation-demo" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:1rem;align-items:start;min-inline-size:0"><nav class="hw-content-nav" data-hw="content-navigation" data-hw-scroll-root="${d.scrollId}" data-hw-offset="0" aria-label="${e(d.label)}">${d.showHeading?`<h2 class="hw-content-nav-heading">${e(d.label)}</h2>`:''}${list(d.items)}</nav><div id="${d.scrollId}" class="content-navigation-demo-scroll" style="block-size:260px;overflow:auto;min-inline-size:0;border:1px solid var(--hw-color-border);border-radius:var(--hw-radius-sm);padding:1rem;scroll-padding-block-start:0" tabindex="0" role="region" aria-label="${e(d.scrollLabel)}">${sections}</div></div>`;
}

/** Project-shaped usage with a local scroll root; no host page or URL navigation. */
export function contentNavigationProject(framework: Exclude<ProjectFramework,'vanilla'>,language: ProjectLanguage,locale: Locale,kinds: readonly ContentNavigationDemoKind[]=['nested','compact']) {
  const typed=language==='typescript',ext=typed?'ts':'js';
  const cases=kinds.map((kind,index)=>({kind,index,...contentNavigationDemoCopy(locale,kind,`project-content-nav-${kind}`),title:contentNavigationDemoCases(locale).find(item=>item.kind===kind)!.title}));
  const sections=(d:typeof cases[number],react=false)=>d.sections.map(item=>`<section id="${item.id}" ${react?'className':'class'}="content-navigation-demo-section" ${react?`style={{minBlockSize:260,paddingBlock:'1rem',borderBlockEnd:'1px solid var(--hw-color-border)',overflowWrap:'anywhere'}}`:`style="min-block-size:260px;padding-block:1rem;border-block-end:1px solid var(--hw-color-border);overflow-wrap:anywhere"`}><h3>${item.label}</h3><p>${item.body}</p></section>`).join('');
  const css=`@import '@hawiyah/styles/styles.css';\n\n.demo { display:grid; gap:1.5rem; }\n${contentNavigationDemoCss}`;
  const direction=locale==='ar'?'rtl':'ltr';
  if(framework==='react')return {
    names:{html:`App.${typed?'tsx':'jsx'}`,css:'style.css',js:`main.${typed?'tsx':'jsx'}`},entry:`main.${typed?'tsx':'jsx'}`,host:'<div id="app"></div>',
    files:{css,
      html:`import { useState } from 'react';\nimport { ContentNavigation } from '@hawiyah/react';\n\nexport default function App() {\n${cases.map(d=>`  const [scrollRoot${d.index}, setScrollRoot${d.index}] = useState${typed?'<HTMLElement | null>':''}(null);\n  const [current${d.index}, setCurrent${d.index}] = useState('');`).join('\n')}\n  return <main className="demo" lang="${locale}" dir="${direction}">${cases.map(d=>`<section data-content-nav-demo="${d.kind}"><h2>${d.title}</h2><div className="content-navigation-demo" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,12rem),1fr))',gap:'1rem',alignItems:'start',minInlineSize:0}}><ContentNavigation label="${d.label}" items={${JSON.stringify(d.items)}} showHeading={${d.showHeading}} scrollRoot={scrollRoot${d.index}} offset={0} onCurrentChange={setCurrent${d.index}} /><div ref={setScrollRoot${d.index}} className="content-navigation-demo-scroll" style={{blockSize:260,overflow:'auto',minInlineSize:0,border:'1px solid var(--hw-color-border)',padding:'1rem'}} tabIndex={0} role="region" aria-label="${d.scrollLabel}">${sections(d,true)}</div><p className="content-navigation-demo-current">${d.currentLabel}: <output>{current${d.index}}</output></p></div></section>`).join('')}</main>;\n}\n`,
      js:`import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\nconst root = document.getElementById('app');\nif (!root) throw new Error('Missing app root');\ncreateRoot(root).render(<App />);\n`,
    },
  };
  if(framework==='vue')return {
    names:{html:'App.vue',css:'style.css',js:`main.${ext}`},entry:`main.${ext}`,host:'<div id="app"></div>',
    files:{css,
      html:`<script setup${typed?' lang="ts"':''}>\nimport { ref } from 'vue';\nimport { ContentNavigation } from '@hawiyah/vue';\n${cases.map(d=>`const scrollRoot${d.index} = ref${typed?'<HTMLElement | null>':''}(null);\nconst current${d.index} = ref('');`).join('\n')}\n</script>\n\n<template>\n<main class="demo" lang="${locale}" dir="${direction}">${cases.map(d=>`<section data-content-nav-demo="${d.kind}"><h2>${d.title}</h2><div class="content-navigation-demo" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:1rem;align-items:start;min-inline-size:0"><ContentNavigation label="${d.label}" :items='${JSON.stringify(d.items)}' :show-heading="${d.showHeading}" :scroll-root="scrollRoot${d.index}" :offset="0" @current-change="current${d.index} = $event" /><div ref="scrollRoot${d.index}" class="content-navigation-demo-scroll" style="block-size:260px;overflow:auto;min-inline-size:0;border:1px solid var(--hw-color-border);padding:1rem" tabindex="0" role="region" aria-label="${d.scrollLabel}">${sections(d)}</div><p class="content-navigation-demo-current">${d.currentLabel}: <output>{{ current${d.index} }}</output></p></div></section>`).join('')}</main>\n</template>\n`,
      js:`import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n`,
    },
  };
  const template=cases.map(d=>`<section data-content-nav-demo="${d.kind}"><h2>${d.title}</h2><div class="content-navigation-demo" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:1rem;align-items:start;min-inline-size:0"><hw-content-navigation label="${d.label}" [items]='${JSON.stringify(d.items)}' [showHeading]="${d.showHeading}" [scrollRoot]="scrollRoot${d.index}" [offset]="0" (currentChange)="current${d.index} = $event" /><div #scrollRoot${d.index} class="content-navigation-demo-scroll" style="block-size:260px;overflow:auto;min-inline-size:0;border:1px solid var(--hw-color-border);padding:1rem" tabindex="0" role="region" aria-label="${d.scrollLabel}">${sections(d)}</div><p class="content-navigation-demo-current">${d.currentLabel}: <output>{{ current${d.index} }}</output></p></div></section>`).join('');
  return {
    names:{html:'app.component.ts',css:'style.css',js:'main.ts'},entry:'main.ts',host:'<app-root></app-root>',
    files:{css,
      html:`import { Component } from '@angular/core';\nimport { HwContentNavigationComponent } from '@hawiyah/angular';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [HwContentNavigationComponent],\n  template: \`<main class="demo" lang="${locale}" dir="${direction}">${template}</main>\`,\n})\nexport class AppComponent {\n${cases.map(d=>`  current${d.index} = '';`).join('\n')}\n}\n`,
      js:`import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n`,
    },
  };
}
