import type { Locale } from './data';

export function dividerExamples(locale: Locale) {
  const tones = [
    ['neutral', 'Neutral', 'محايد'], ['primary', 'Primary', 'رئيسي'],
    ['gold', 'Gold', 'ذهبي'], ['tertiary', 'Tertiary', 'بنفسجي'],
  ] as const;
  return tones.map(([tone, en, ar]) => ({
    title: locale === 'ar' ? ar : en,
    markup: `<hr class="nq-divider" data-tone="${tone}">`,
    react: `import { Divider } from '@nasaq/react';\nexport default function SectionDivider() { return <Divider tone="${tone}" />; }`,
    vue: `<script setup>\nimport { Divider } from '@nasaq/vue';\n</script>\n<template><Divider tone="${tone}" /></template>`,
    angular: `import { Component } from '@angular/core';\nimport { NqDividerComponent } from '@nasaq/angular';\n@Component({ selector: 'app-section-divider', standalone: true, imports: [NqDividerComponent], template: '<nq-divider tone="${tone}" />' })\nexport class SectionDivider {}`,
  }));
}
export function dividerProjectMarkup(locale: Locale, framework: 'vanilla' | 'react' | 'vue' | 'angular') {
  const labels = locale === 'ar' ? ['محايد','رئيسي','ذهبي','بنفسجي'] : ['Neutral','Primary','Gold','Tertiary'];
  const hr = (tone: string, vertical = false) => {
    if (framework === 'vanilla') return `<hr class="nq-divider" data-tone="${tone}"${vertical ? ' aria-orientation="vertical"' : ''}>`;
    const name = framework === 'angular' ? 'nq-divider' : 'Divider';
    return `<${name} tone="${tone}"${vertical ? ' orientation="vertical"' : ''} />`;
  };
  const classAttr = framework === 'react' ? 'className' : 'class';
  const horizontal = ['neutral','primary','gold','tertiary'].map((tone,index) => `<div><span>${labels[index]}</span>${hr(tone)}</div>`).join('\n');
  const before = locale === 'ar' ? 'الطلبات' : 'Requests', after = locale === 'ar' ? 'المواعيد' : 'Appointments';
  return `<div data-divider-examples="true">${horizontal}<div ${classAttr}="nq-inline"><span>${before}</span>${hr('primary',true)}<span>${after}</span></div></div>`;
}
