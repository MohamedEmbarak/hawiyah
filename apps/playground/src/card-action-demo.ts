import type { Locale } from './data';

export function cardActionMarkup(locale: Locale, framework: 'vanilla' | 'react' | 'vue' | 'angular'): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const title = t('Service details', 'تفاصيل الخدمة');
  const description = t('Review the requirements before applying.', 'راجع المتطلبات قبل التقديم.');
  const action = `<a class="nq-button" href="#card-details">${t('View requirements', 'عرض المتطلبات')}</a>`;
  const destination = `<p class="nq-hint" id="card-details">${t('Prepare identity details and supporting documents.', 'جهّز بيانات الهوية والمستندات الداعمة.')}</p>`;
  if (framework === 'react') return `<><Card variant="outlined" header={<h2 className="nq-card-title">${title}</h2>} footer={${action.replace('class=', 'className=')}}><p className="nq-card-description">${description}</p></Card>${destination.replace('class=', 'className=')}</>`;
  if (framework === 'vue') return `<Card variant="outlined"><template #header><h2 class="nq-card-title">${title}</h2></template><p class="nq-card-description">${description}</p><template #footer>${action}</template></Card>${destination}`;
  if (framework === 'angular') return `<nq-card variant="outlined"><h2 nqCardHeader class="nq-card-title">${title}</h2><p class="nq-card-description">${description}</p><div nqCardFooter>${action}</div></nq-card>${destination}`;
  return `<article class="nq-card" data-variant="outlined"><header class="nq-card-header"><h2 class="nq-card-title">${title}</h2></header><div class="nq-card-body"><p class="nq-card-description">${description}</p></div><footer class="nq-card-footer">${action}</footer></article>${destination}`;
}

export function cardActionRecipe(locale: Locale) {
  return {
    title: locale === 'ar' ? 'بطاقة بإجراء واضح' : 'Card with an explicit action',
    markup: cardActionMarkup(locale, 'vanilla'),
    react: `import { Card } from '@nasaq/react';\n\nexport default function Example() { return (${cardActionMarkup(locale, 'react')}); }`,
    vue: `<script setup>\nimport { Card } from '@nasaq/vue';\n</script>\n<template>${cardActionMarkup(locale, 'vue')}</template>`,
    angular: `import { Component } from '@angular/core';\nimport { NqCardComponent } from '@nasaq/angular';\n\n@Component({selector:'app-root', standalone:true, imports:[NqCardComponent], template:\`${cardActionMarkup(locale, 'angular')}\`})\nexport class AppComponent {}`,
  };
}
