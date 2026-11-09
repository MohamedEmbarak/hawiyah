import type { Locale } from './data';

export function listDemoRecipes(locale: Locale) {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const marker = '<span class="hw-list-marker" aria-hidden="true"></span>';
  const lists = [
    {
      kind: 'icon',
      title: t('Indented icons and nested steps', 'أيقونات بمسافة بادئة وخطوات متداخلة'),
      heading: t('Required information', 'المعلومات المطلوبة'),
      items: [t('Identity details', 'بيانات الهوية'), t('Contact details', 'بيانات التواصل'), t('Supporting documents', 'المستندات الداعمة')],
    },
    {
      kind: 'custom',
      title: t('Inline decorative markers', 'مؤشرات زخرفية داخل السطر'),
      heading: t('Service notes', 'ملاحظات الخدمة'),
      items: [t('Applications are available online.', 'يمكن تقديم الطلبات إلكترونيًا.'), t('Keep a copy of your documents.', 'احتفظ بنسخة من مستنداتك.'), t('Save your request number.', 'احفظ رقم طلبك.')],
    },
    {
      kind: 'ordered',
      title: t('Continue an ordered sequence', 'متابعة تسلسل مرقّم'),
      heading: t('After creating a draft', 'بعد إنشاء المسودة'),
      items: [t('Review the draft.', 'راجع المسودة.'), t('Attach the documents.', 'أرفق المستندات.'), t('Submit the request.', 'أرسل الطلب.')],
    },
  ] as const;

  return lists.map(({ kind, title, heading, items }) => {
    const nested = `<ol class="hw-list-ordered" aria-label="${t('Document preparation', 'تجهيز المستندات')}"><li>${t('Scan each page.', 'امسح كل صفحة ضوئيًا.')}</li><li>${t('Check that the image is readable.', 'تحقق من وضوح الصورة.')}</li></ol>`;
    const rows = items.map((text, index) => {
      const children = kind === 'icon' && index === items.length - 1 ? nested : '';
      return `<li>${kind === 'ordered' ? '' : marker}${text}${children}</li>`;
    }).join('\n    ');
    const tag = kind === 'ordered' ? 'ol' : 'ul';
    const attributes = kind === 'ordered' ? 'start="2"' : 'role="list"';
    const list = `<${tag} class="hw-list-${kind}" ${attributes} aria-label="${heading}">\n    ${rows}\n  </${tag}>`;
    const cardTitle = `<h3 class="hw-card-title">${heading}</h3>`;
    const jsx = (markup: string) => markup.replaceAll('class=', 'className=').replace('start="2"', 'start={2}');
    return {
      title,
      markup: `<article class="hw-card" data-variant="outlined"><header class="hw-card-header">${cardTitle}</header><div class="hw-card-body">${list}</div></article>`,
      react: `import { Card } from '@hawiyah/react';\n\nexport default function ServiceList() {\n  return <Card variant="outlined" header={${jsx(cardTitle)}}>\n    ${jsx(list)}\n  </Card>;\n}`,
      vue: `<script setup>\nimport { Card } from '@hawiyah/vue';\n</script>\n\n<template>\n  <Card variant="outlined">\n    <template #header>${cardTitle}</template>\n    ${list}\n  </Card>\n</template>`,
      angular: `import { Component } from '@angular/core';\nimport { HwCardComponent } from '@hawiyah/angular';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [HwCardComponent],\n  template: \`<hw-card variant="outlined">\n    ${cardTitle.replace('<h3 ', '<h3 hwCardHeader ')}\n    ${list}\n  </hw-card>\`,\n})\nexport class AppComponent {}`,
    };
  });
}
