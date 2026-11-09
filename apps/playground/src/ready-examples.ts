import {cardActionRecipe} from './card-action-demo';
import {inlineExample} from './guide-html';
import {dividerExamples} from './divider-demo';
import {portalMenuRecipe} from './portal-navigation-demo';
import {notificationDialogRecipes} from './notification-dialog-demo';
import {toastDemoMarkup, toastDemoRecipes} from './toast-demo';
import {listDemoRecipes} from './list-demo';
import {copyActionRecipes} from './copy-action-demo';
import {selectDemoCases, selectDemoMarkup, selectNativeMarkup} from './select-demo';
import {searchDemoCases,searchDemoMarkup,searchProject} from './search-demo';
import {contentNavigationDemoCases,contentNavigationDemoMarkup,contentNavigationProject} from './content-navigation-demo';
import {tabsDemoCases,tabsDemoMarkup,tabsNativeMarkup} from './tabs-demo';
import {paginationDemoCases,paginationDemoMarkup,paginationNativeMarkup} from './pagination-demo';
import {ratingDemoCases,ratingDemoMarkup,ratingNativeMarkup} from './rating-demo';
import {carouselDemoCases,carouselDemoMarkup,carouselNativeMarkup} from './carousel-demo';
import {iconButtonCases,iconButtonLabel,iconBackgroundMarkup} from './icon-button-demo';
import {toggleGroupMarkup} from './segmented-demo';
import {siteVerificationMarkup,siteVerificationDemoLabels} from './site-verification-demo';
import {portalFooterMarkup,portalFooterExampleData} from './portal-footer-demo';
import { escape as e, icon, type ComponentId, type Locale } from './data';
import {feedbackMarkup} from './feedback-demo';
import {avatarDemoCases,avatarDemoMarkup,avatarDemoProps} from './avatar-demo';

export const statusExamples = [
  { tone: 'neutral', en: 'Scheduled maintenance', ar: 'صيانة مجدولة', bodyEn: 'Service hours are shown on this page.', bodyAr: 'مواعيد الخدمة موضّحة في هذه الصفحة.' },
  { tone: 'info', en: 'Before you begin', ar: 'قبل البدء', bodyEn: 'Prepare your supporting documents.', bodyAr: 'جهّز المستندات الداعمة قبل تقديم الطلب.' },
  { tone: 'success', en: 'Request saved', ar: 'تم حفظ الطلب', bodyEn: 'You can return to your draft later.', bodyAr: 'يمكنك العودة إلى المسودة لاحقًا.' },
  { tone: 'warning', en: 'Review required', ar: 'المراجعة مطلوبة', bodyEn: 'Check the entered details before sending.', bodyAr: 'تحقّق من البيانات المدخلة قبل الإرسال.' },
  { tone: 'danger', en: 'Unable to send', ar: 'تعذّر الإرسال', bodyEn: 'Try again or contact support.', bodyAr: 'حاول مجددًا أو تواصل مع الدعم.' },
] as const;

export function statusMarkup(id: 'alert' | 'badge' | 'chip' | 'toast-region', locale: Locale, variant = 'default', _prefix = 'status') {
  if (id === 'toast-region') return toastDemoMarkup(locale);
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const items = statusExamples.map(item => {
    const label = t(item.en, item.ar), body = t(item.bodyEn, item.bodyAr);
    if (id === 'badge' || id === 'chip') return `<span class="hw-${id}" data-tone="${item.tone}" data-variant="${variant}">${label}</span>`;
    return `<div class="hw-alert" data-tone="${item.tone}" data-variant="${variant}"><div class="hw-alert-content"><strong>${label}</strong><p>${body}</p></div></div>`;
  }).join('\n');
  return `<div class="${id === 'alert' ? 'hw-stack' : id === 'badge' ? 'hw-cluster hw-badges' : 'hw-cluster'}">${items}</div>`;
}

type Recipe = { title: string; markup: string; vanillaScript?: string; react?: string; vue?: string; angular?: string };

function recipes(id: ComponentId, locale: Locale, preview: (id: ComponentId) => string): Recipe[] {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  if (id === 'divider') return dividerExamples(locale);
  if (id === 'card') return [...listDemoRecipes(locale), cardActionRecipe(locale)];
  if (id === 'select') return selectDemoCases(locale).map(example => {
    const native = selectNativeMarkup(example);
    return {
      title: example.title,
      markup: selectDemoMarkup(example, 'ready-region'),
      react: `import { Select } from '@hawiyah/react';\n\nexport default function RegionPicker() {\n  return ${native.react};\n}`,
      vue: `${example.kind === 'multiple' ? '' : "<script setup>\nimport { Select } from '@hawiyah/vue';\n</script>\n\n"}<template>\n  ${native.vue}\n</template>`,
      angular: `import { Component } from '@angular/core';\n${example.kind === 'multiple' || example.kind === 'listbox' ? '' : "import { HwSelectComponent } from '@hawiyah/angular';\n"}\n@Component({\n  selector: 'app-region-picker',\n  standalone: true,\n  imports: [${example.kind === 'multiple' || example.kind === 'listbox' ? '' : 'HwSelectComponent'}],\n  template: \`${native.angular}\`,\n})\nexport class RegionPicker {}`,

    };
  });
  if(id==='search-field')return searchDemoCases(locale).map(item=>({
    title:item.title,markup:searchDemoMarkup(locale,item.kind),
    vanillaScript:searchProject('vanilla','javascript',locale,[item.kind]).files.js.replace("import './style.css';","import '@hawiyah/styles/styles.css';").replace("'#app'",`'[data-search-demo="${item.kind}"]'`),
    react:searchProject('react','typescript',locale,[item.kind]).files.html,
    vue:searchProject('vue','typescript',locale,[item.kind]).files.html,
    angular:searchProject('angular','typescript',locale,[item.kind]).files.html,
  }));
  if(id==='content-navigation')return contentNavigationDemoCases(locale).map(item=>({
    title:item.title,markup:contentNavigationDemoMarkup(locale,item.kind),
    react:contentNavigationProject('react','typescript',locale,[item.kind]).files.html,
    vue:contentNavigationProject('vue','typescript',locale,[item.kind]).files.html,
    angular:contentNavigationProject('angular','typescript',locale,[item.kind]).files.html,
  }));
  if(id==='tabs')return tabsDemoCases(locale).map(item=>{
    const native=tabsNativeMarkup(locale,item.kind);
    return {title:item.title,markup:tabsDemoMarkup(locale,item.kind),
      react:`import { Tabs } from '@hawiyah/react';\n\n${native.react}`,
      vue:`<!-- import { Tabs } from '@hawiyah/vue' -->\n${native.vue}`,
      angular:`<!-- import { HwTabsComponent, HwTabComponent } from '@hawiyah/angular'; add both to imports -->\n${native.angular}`,
    };
  });
  if(id==='pagination')return paginationDemoCases(locale).map(item=>{
    const native=paginationNativeMarkup(locale,item.kind);
    return {title:item.title,markup:paginationDemoMarkup(locale,item.kind),
      react:`import { Pagination } from '@hawiyah/react';\n\n${native.react}`,
      vue:`<!-- import { Pagination } from '@hawiyah/vue' -->\n${native.vue}`,
      angular:`<!-- import { HwPaginationComponent } from '@hawiyah/angular'; add to imports -->\n<!-- Component class members:${native.angularMember} -->\n${native.angular}`,
    };
  });
  if(id==='rating')return ratingDemoCases(locale).map(item=>{
    const native=ratingNativeMarkup(locale,item.kind),name=item.kind==='scores'?'RatingDisplay':'Rating';
    return {title:item.title,markup:ratingDemoMarkup(locale,item.kind),
      react:`import { ${name} } from '@hawiyah/react';\n\n${native.react}`,
      vue:`<!-- import { ${name} } from '@hawiyah/vue' -->\n${native.vue}`,
      angular:`<!-- import { Hw${name}Component } from '@hawiyah/angular'; add to imports -->\n<!-- Component class member:${native.angularMember} -->\n${native.angular}`,
    };
  });
  if(id==='carousel')return carouselDemoCases(locale).map(item=>{
    const native=carouselNativeMarkup(locale,item.kind);
    return {title:item.title,markup:carouselDemoMarkup(locale,item.kind),
      react:`import { Carousel } from '@hawiyah/react';\n\n${native.react}`,
      vue:`<!-- import { Carousel } from '@hawiyah/vue' -->\n${native.vue}`,
      angular:`<!-- import { HwCarouselComponent } from '@hawiyah/angular'; add to imports -->\n<!-- Component class member:${native.angularMember} -->\n${native.angular}`,
    };
  });
  if(id==='avatar')return avatarDemoCases(locale).map(item=>({
    title:item.title,markup:avatarDemoMarkup(item),
    react:`import { Avatar } from '@hawiyah/react';\n\n<Avatar ${avatarDemoProps(item)} />`,
    vue:`<!-- import { Avatar } from '@hawiyah/vue' -->\n<Avatar ${avatarDemoProps(item)} />`,
    angular:`<!-- import { HwAvatarComponent } from '@hawiyah/angular'; add to imports -->\n<hw-avatar ${avatarDemoProps(item)} />`,
  }));
  if (id === 'table' || id === 'data-table') {
    const sortable = id === 'data-table', component = sortable ? 'DataTable' : 'Table';
    const service = t('Service', 'الخدمة'), days = t('Days', 'الأيام');
    const emptyMessage = t('No requests found', 'لا توجد طلبات');
    const items = [{ service: t('License', 'الرخصة'), days: 3 }, { service: t('Certificate', 'الشهادة'), days: 1 }];
    const cases = [
      { title: t('Default · minimum 48px', 'افتراضي · حد أدنى 48 بكسل'), variant: 'default', size: 'md' },
      { title: t('Striped rows', 'صفوف متناوبة'), variant: 'striped', size: 'md' },
      { title: t('Column borders', 'حدود الأعمدة'), variant: 'bordered', size: 'md' },
      { title: t('Small · minimum 40px adaptation', 'صغير · تكييف بحد أدنى 40 بكسل'), variant: 'default', size: 'sm' },
      { title: t('Large · minimum 56px adaptation', 'كبير · تكييف بحد أدنى 56 بكسل'), variant: 'default', size: 'lg' },
      { title: t('Empty data', 'بيانات فارغة'), variant: 'default', size: 'md', empty: true },
    ];
    return cases.map(item => {
      const caption = `${t('Requests', 'الطلبات')} · ${item.title}`, rows = item.empty ? [] : items;
      const data = JSON.stringify(rows), language = locale === 'ar' ? 'ar-SA' : 'en';
      // A filtered result retains the row shape in copied JS and strict TS examples.
      const reactRows = item.empty ? `${JSON.stringify(items)}.filter(row => row.days > 30)` : data;
      const body = rows.length
        ? rows.map(row => `<tr><th scope="row">${row.service}</th><td>${row.days}</td></tr>`).join('')
        : `<tr><td colspan="2">${emptyMessage}</td></tr>`;
      const headings = sortable
        ? `<th scope="col" data-hw-key="service"><button type="button" data-hw-sort="service">${service}<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th><th scope="col" data-hw-key="days" data-hw-type="number"><button type="button" data-hw-sort="days">${days}<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>`
        : `<th scope="col">${service}</th><th scope="col">${days}</th>`;
      const columns = [{ key: 'service', label: service, rowHeader: true, ...(sortable ? { sortable: true } : {}) }, { key: 'days', label: days, ...(sortable ? { sortable: true } : {}) }];
      const reactColumns = sortable ? JSON.stringify(columns)
        : `[{key:'service',header:'${service}',rowHeader:true,cell:row => row.service},{key:'days',header:'${days}',cell:row => row.days}]`;
      const vueColumns = sortable ? columns : columns.map(({ key, label, ...rest }) => ({ key, header: label, ...rest }));
      return {
        title: item.title,
        markup: `<div class="hw-table-wrap" tabindex="0" role="region" aria-label="${caption}"><table class="hw-table${sortable ? ' hw-data-table' : ''}" ${sortable ? `data-hw="data-table" data-hw-locale="${language}"` : ''} data-variant="${item.variant}" data-size="${item.size}"><caption>${caption}</caption><thead><tr>${headings}</tr></thead><tbody>${body}</tbody></table></div>`,
        react: `import { ${component} } from '@hawiyah/react';\n\nconst rows = ${reactRows};\n\n<${component} caption="${caption}" rows={rows} columns={${reactColumns}} variant="${item.variant}" size="${item.size}" emptyMessage="${emptyMessage}" ${sortable ? `locale="${language}"` : ''} />`,
        vue: `<!-- import { ${component} } from '@hawiyah/vue' -->\n<${component} caption="${caption}" :rows='${data}' :columns='${JSON.stringify(vueColumns)}' variant="${item.variant}" size="${item.size}" empty-message="${emptyMessage}" ${sortable ? `locale="${language}"${locale === 'en' ? ` :sort-label="(column, direction) => 'Sort ' + column.label + ' ' + direction"` : ''}` : ''} />`,
        angular: `<!-- import { Hw${component}Component } from '@hawiyah/angular'; add to imports -->\n<hw-${sortable ? 'data-table' : 'table'} caption="${caption}" [rows]='${data}' [columns]='${JSON.stringify(columns)}' variant="${item.variant}" size="${item.size}" emptyMessage="${emptyMessage}" ${sortable ? `locale="${language}"` : ''} />`,
      };
    });
  }
  if(id==='icon-button')return [
    ...iconButtonCases.map(item=>{
      const label=iconButtonLabel(locale,item.key), pressed='pressed' in item, disabled='disabled' in item, loading='loading' in item;
      return {title:label,markup:`<button class="hw-button hw-icon-button" type="button" aria-label="${label}" data-variant="${item.variant}" data-size="${item.size}" data-shape="${item.shape}" ${pressed?'aria-pressed="true"':''} ${disabled||loading?'disabled':''} ${loading?'aria-busy="true"':''}><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></button>`,
        react:`import { IconButton } from '@hawiyah/react';\n\n<IconButton label="${label}" variant="${item.variant}" size="${item.size}" shape="${item.shape}" ${pressed?'aria-pressed={true}':''} ${disabled?'disabled':''} ${loading?'loading':''}><span className="hw-icon" data-icon="search-01" /></IconButton>`,
        vue:`<!-- import { IconButton } from '@hawiyah/vue' -->\n<IconButton label="${label}" variant="${item.variant}" size="${item.size}" shape="${item.shape}" ${pressed?':aria-pressed="true"':''} ${disabled?'disabled':''} ${loading?'loading':''}><span class="hw-icon" data-icon="search-01" /></IconButton>`,
        angular:`<!-- imports: [HwIconButtonComponent] -->\n<hw-icon-button label="${label}" variant="${item.variant}" size="${item.size}" shape="${item.shape}" ${pressed?'[pressed]="true"':''} ${disabled?'disabled':''} ${loading?'loading':''}><span class="hw-icon" data-icon="search-01"></span></hw-icon-button>`,
      };
    }),
    {title:t('Decorative background icons','أيقونات زخرفية بخلفية'),markup:iconBackgroundMarkup()},
    {title:t('Standalone artwork: 14, 20, 24 px; larger artwork uses Featured icons','الأيقونات المستقلة: 14، 20، 24 بكسل؛ تُستخدم الأيقونات المميزة للأحجام الأكبر'),markup:`<div class="hw-cluster" style="color:var(--hw-color-primary-text)" aria-hidden="true">${['sm','md','lg'].map(size=>`<span class="hw-icon" data-icon="search-01" data-size="${size}"></span>`).join('')}</div>`},
  ];
  if(id==='toggle-group')return ['segmented','outline','multiple','readonly','disabled','readonly-outline'].map(kind=>{
    const options=JSON.stringify([{value:'first',label:t('List','قائمة')},{value:'second',label:t('Grid','شبكة')},{value:'blocked',label:t('Map','خريطة'),disabled:true}]),label=t('View mode','نمط العرض'),variant=kind.includes('outline')?'outline':'segmented';
    return {title:t(`Toggle group · ${kind}`,`مجموعة اختيار · ${kind}`),markup:toggleGroupMarkup(locale,kind,`ready-toggle-${kind}`),
      react:`import { ToggleGroup } from '@hawiyah/react';\n\n<ToggleGroup label="${label}" options={${options}} variant="${variant}" ${(kind==='multiple'||kind==='readonly-outline')?"multiple defaultValue={['first']}":'defaultValue="first"'} ${kind.startsWith('readonly')?'readOnly':kind==='disabled'?'disabled':''} />`,
      vue:`<!-- import { ToggleGroup } from '@hawiyah/vue' -->\n<ToggleGroup label="${label}" :options='${options}' variant="${variant}" ${(kind==='multiple'||kind==='readonly-outline')?"multiple :default-value=\"['first']\"":'default-value="first"'} ${kind.startsWith('readonly')?'readonly':kind==='disabled'?'disabled':''} />`,
      angular:`<!-- imports: [HwToggleGroupComponent] -->\n<hw-toggle-group label="${label}" [options]='${options}' variant="${variant}" ${(kind==='multiple'||kind==='readonly-outline')?"[multiple]=\"true\" [value]=\"['first']\"":'value="first"'} ${kind.startsWith('readonly')?'[readOnly]="true"':kind==='disabled'?'[disabled]="true"':''} />`,
    };
  });
  if(id==='button-group')return ['horizontal','vertical'].map(orientation=>({title:t(`Attached actions · ${orientation}`,`إجراءات متصلة · ${orientation}`),
    markup:`<div class="hw-button-group" role="group" aria-label="${t('Document actions','إجراءات المستند')}" data-variant="attached" data-orientation="${orientation}"><button class="hw-button" data-variant="secondary" type="button">${t('Save','حفظ')}</button><button class="hw-button" data-variant="secondary" type="button">${t('Preview','معاينة')}</button><button class="hw-button" data-variant="secondary" type="button" disabled>${t('Delete','حذف')}</button></div>`,
    react:`import { ButtonGroup, Button } from '@hawiyah/react';\n\n<ButtonGroup label="${t('Document actions','إجراءات المستند')}" variant="attached" orientation="${orientation}"><Button variant="secondary">${t('Save','حفظ')}</Button><Button variant="secondary">${t('Preview','معاينة')}</Button><Button variant="secondary" disabled>${t('Delete','حذف')}</Button></ButtonGroup>`,
    vue:`<!-- import { ButtonGroup, Button } from '@hawiyah/vue' -->\n<ButtonGroup label="${t('Document actions','إجراءات المستند')}" variant="attached" orientation="${orientation}"><Button variant="secondary">${t('Save','حفظ')}</Button><Button variant="secondary">${t('Preview','معاينة')}</Button><Button variant="secondary" disabled>${t('Delete','حذف')}</Button></ButtonGroup>`,
    angular:`<!-- imports: [HwButtonGroupComponent, HwButtonDirective] -->\n<hw-button-group label="${t('Document actions','إجراءات المستند')}" variant="attached" orientation="${orientation}"><button hwButton variant="secondary">${t('Save','حفظ')}</button><button hwButton variant="secondary">${t('Preview','معاينة')}</button><button hwButton variant="secondary" disabled>${t('Delete','حذف')}</button></hw-button-group>`,
  }));
  if(id==='link')return (['default','neutral','standalone','disabled'] as const).map(variant=>{
    const disabled=variant==='disabled',label=disabled?t('Unavailable destination','وجهة غير متاحة'):t('Read the guide','اقرأ الدليل');
    return {title:t(`Link · ${variant}`,`رابط · ${variant}`),markup:`<a class="hw-link" ${disabled?'role="link" aria-disabled="true" tabindex="-1"':`href="#guide" data-variant="${variant}"`}>${label}${variant==='standalone'?'<span class="hw-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true"></span>':''}</a>`,
      react:`import { Link } from '@hawiyah/react';\n\n<Link href="#guide" ${disabled?'disabled':`variant="${variant}"`}>${label}</Link>`,
      vue:`<!-- import { Link } from '@hawiyah/vue' -->\n<Link href="#guide" ${disabled?'disabled':`variant="${variant}"`}>${label}</Link>`,
      angular:`<!-- import { HwLinkComponent } from '@hawiyah/angular'; add to imports -->\n<hw-link href="#guide" ${disabled?'[disabled]="true"':`variant="${variant}"`}>${label}</hw-link>`,
    };
  }).concat([{
    title: t('External destination', 'وجهة خارجية'),
    markup: `<a class="hw-link" href="https://example.test/reference" target="_blank" rel="noopener noreferrer">${t('External reference','مرجع خارجي')}<span class="hw-sr-only"> · ${t('opens in a new window','يفتح في نافذة جديدة')}</span></a>`,
    react: `import { Link } from '@hawiyah/react';\n<Link href="https://example.test/reference" external>${t('External reference','مرجع خارجي')}<span className="hw-sr-only"> · ${t('opens in a new window','يفتح في نافذة جديدة')}</span></Link>`,
    vue: `<!-- import { Link } from '@hawiyah/vue' -->\n<Link href="https://example.test/reference" external>${t('External reference','مرجع خارجي')}<span class="hw-sr-only"> · ${t('opens in a new window','يفتح في نافذة جديدة')}</span></Link>`,
    angular: `<!-- imports: [HwLinkComponent] -->\n<hw-link href="https://example.test/reference" target="_blank">${t('External reference','مرجع خارجي')}<span class="hw-sr-only"> · ${t('opens in a new window','يفتح في نافذة جديدة')}</span></hw-link>`,
  }]);
  if (id === 'site-verification') {
    const copy=siteVerificationDemoLabels(locale);
    return [false,true].map(open=>({title:open?t('Expanded verification','تفاصيل التحقق'):t('Collapsed verification','شريط التحقق المطوي'),markup:siteVerificationMarkup(locale,open),
      react:`import { SiteVerification } from '@hawiyah/react';\n\n<SiteVerification locale="${locale}" label="${copy.label}" domain="example.test" registrationHref="#example-registration" registrationLabel="${copy.registrationLabel}" defaultOpen={${open}} />`,
      vue:`<!-- import { SiteVerification } from '@hawiyah/vue' -->\n<SiteVerification locale="${locale}" label="${copy.label}" domain="example.test" registration-href="#example-registration" registration-label="${copy.registrationLabel}" :default-open="${open}" />`,
      angular:`<!-- import { HwSiteVerificationComponent } from '@hawiyah/angular'; add to imports -->\n<hw-site-verification locale="${locale}" label="${copy.label}" domain="example.test" registrationHref="#example-registration" registrationLabel="${copy.registrationLabel}" [open]="${open}" />`,
    }));
  }
  if(id==='feedback')return (['text','icon-text','icon'] as const).map(variant=>({
    title:t(`Feedback · ${variant}`,`تقييم الصفحة · ${variant}`), markup:feedbackMarkup(locale,variant),
    react:`import { Feedback } from '@hawiyah/react';\n\n<Feedback label="${t('Was this page helpful?','هل كانت هذه الصفحة مفيدة؟')}" choiceVariant="${variant}" yesLabel="${t('Yes','نعم')}" noLabel="${t('No','لا')}" commentLabel="${t('Tell us more','أخبرنا بالمزيد')}" submitLabel="${t('Send feedback','إرسال التقييم')}" successMessage="${t('Thank you for your feedback.','شكراً على تقييمك.')}" onFeedback={value => console.log(value)} />`,
    vue:`<!-- import { Feedback } from '@hawiyah/vue' -->\n<Feedback label="${t('Was this page helpful?','هل كانت هذه الصفحة مفيدة؟')}" choice-variant="${variant}" yes-label="${t('Yes','نعم')}" no-label="${t('No','لا')}" comment-label="${t('Tell us more','أخبرنا بالمزيد')}" submit-label="${t('Send feedback','إرسال التقييم')}" thanks="${t('Thank you for your feedback.','شكراً على تقييمك.')}" @submit="value => console.log(value)" />`,
    angular:`<!-- imports: [HwFeedbackComponent] -->\n<hw-feedback label="${t('Was this page helpful?','هل كانت هذه الصفحة مفيدة؟')}" choiceVariant="${variant}" positiveLabel="${t('Yes','نعم')}" negativeLabel="${t('No','لا')}" />`,
  }));
  if (id === 'checkbox' || id === 'radio') {
    const component = id === 'checkbox' ? 'Checkbox' : 'Radio';
    const states = [
      {label:t('Default','افتراضي'),checked:false,disabled:false,readonly:false},
      {label:t('Selected','محدد'),checked:true,disabled:false,readonly:false},
      {label:t('Disabled','غير متاح'),checked:true,disabled:true,readonly:false},
      {label:t('Read only','للقراءة فقط'),checked:true,disabled:false,readonly:true},
    ];
    return [{ title:t('Interactive, selected, disabled and read-only states','الحالات التفاعلية والمحددة والمعطلة وللقراءة فقط'),
      markup:`<div class="hw-stack">${states.map((s,i)=>`<label class="hw-choice"><input class="hw-${id}" type="${id}" name="ready-${id}-${i}" ${s.checked?'checked':''} ${s.disabled?'disabled':''} ${s.readonly?'readonly aria-disabled="true"':''}>${s.label}</label>`).join('')}</div>`,
      react:`import { ${component} } from '@hawiyah/react';\n\n${states.map((s,i)=>`<${component} label="${s.label}" name="example-${i}" ${s.checked?'defaultChecked ':''}${s.disabled?'disabled ':''}${s.readonly?'readOnly ':''}/>`).join('\n')}`,
      vue:`<script setup>\nimport { ${component} } from '@hawiyah/vue';\n</script>\n<template>\n${states.map((s,i)=>`  <${component} label="${s.label}" name="example-${i}" ${id==='radio'?`value="on" ${s.checked?'default-value="on" ':''}`:s.checked?':default-value="true" ':''}${s.disabled?'disabled ':''}${s.readonly?'read-only ':''}/>`).join('\n')}\n</template>`,
      angular:`<!-- Import Hw${component}Component from @hawiyah/angular into the standalone component. -->\n${states.map((s,i)=>`<hw-${id} label="${s.label}" name="example-${i}" ${id==='radio'?`[options]="[{value:'on',label:'${s.label}'}]" ${s.checked?'value="on" ':''}`:s.checked?'[value]="true" ':''}${s.disabled?'disabled ':''}${s.readonly?'readOnly ':''}/>`).join('\n')}`,
    }];
  }
  if (id === 'alert' || id === 'badge' || id === 'chip') {
    const component = id[0]!.toUpperCase() + id.slice(1);
    const variants = id === 'alert' ? ['default', 'outline', 'minimal'] : id === 'badge' ? ['soft', 'outline', 'dot'] : ['soft', 'outline'];
    return variants.map(variant => {
      const lines = statusExamples.map(item => ({ tone: item.tone, title: t(item.en, item.ar), body: t(item.bodyEn, item.bodyAr) }));
      return {
        title: `${t('All statuses', 'كل الحالات')} · ${variant}`,
        markup: statusMarkup(id, locale, variant, `ready-${id}-${variant}`),
        react: `import { ${component} } from '@hawiyah/react';\n\n` + (id === 'badge' ? '<div className="hw-badges">\n' : '') + lines.map(s => id === 'alert' ? `<Alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></Alert>` : `<${component} tone="${s.tone}" ${id === 'badge' ? 'variant' : 'data-variant'}="${variant}">${s.title}</${component}>`).join('\n') + (id === 'badge' ? '\n</div>' : ''),
        vue: `<!-- import { ${component} } from '@hawiyah/vue' -->\n` + (id === 'badge' ? '<div class="hw-badges">\n' : '') + lines.map(s => id === 'alert' ? `<Alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></Alert>` : `<${component} tone="${s.tone}" ${id === 'badge' ? 'variant' : 'data-variant'}="${variant}">${s.title}</${component}>`).join('\n') + (id === 'badge' ? '\n</div>' : ''),
        angular: `<!-- imports: [Hw${component}Component] from @hawiyah/angular -->\n` + (id === 'badge' ? '<div class="hw-badges">\n' : '') + lines.map(s => id === 'alert' ? `<hw-alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></hw-alert>` : `<hw-${id} tone="${s.tone}" variant="${variant}">${s.title}</hw-${id}>`).join('\n') + (id === 'badge' ? '\n</div>' : ''),
      };
    });
  }
  if (id === 'button') {
    const variants = ['primary', 'default', 'secondary', 'outline', 'outline-white', 'light', 'danger', 'ghost', 'soft', 'link'];
    return [{ title: t('Every appearance', 'جميع الأنماط'),
      markup: `<div class="hw-cluster">${variants.map(v => `<span style="padding:8px;${['outline-white', 'light'].includes(v) ? 'background:#14573a' : ''}"><button class="hw-button" type="button" data-variant="${v}">${v}</button></span>`).join('')}</div>`,
      react: `import { Button } from '@hawiyah/react';\n\n${variants.map(v => `<Button variant="${v}">${v}</Button>`).join('\n')}`,
      vue: `<!-- import { Button } from '@hawiyah/vue' -->\n${variants.map(v => `<Button variant="${v}">${v}</Button>`).join('\n')}`,
      angular: `<!-- imports: [HwButtonDirective] -->\n${variants.map(v => `<button hwButton variant="${v}" type="button">${v}</button>`).join('\n')}`,
    }, { title: t('Sizes, disabled and loading', 'الأحجام والتعطيل والتحميل'),
      markup: `<div class="hw-cluster">${['sm','md','lg'].map(size => `<button class="hw-button" type="button" data-size="${size}">${size}</button>`).join('')}<button class="hw-button" type="button" disabled>${t('Unavailable', 'غير متاح')}</button><button class="hw-button" type="button" disabled aria-busy="true">${t('Saving…', 'جارٍ الحفظ…')}</button></div>`,
      react: '<Button size="sm">sm</Button>\n<Button size="md">md</Button>\n<Button size="lg">lg</Button>\n<Button disabled>غير متاح</Button>\n<Button loading>جارٍ الحفظ</Button>',
      vue: '<Button size="sm">sm</Button>\n<Button size="md">md</Button>\n<Button size="lg">lg</Button>\n<Button disabled>غير متاح</Button>\n<Button loading>جارٍ الحفظ</Button>',
      angular: '<button hwButton size="sm" type="button">sm</button>\n<button hwButton size="md" type="button">md</button>\n<button hwButton size="lg" type="button">lg</button>\n<button hwButton type="button" disabled>غير متاح</button>\n<button hwButton type="button" disabled aria-busy="true">جارٍ الحفظ</button>',
    }, ...copyActionRecipes(locale)];
  }
  if (id === 'toast-region') return toastDemoRecipes(locale);
  if (id === 'dialog') return notificationDialogRecipes(locale);
  if (id === 'portal-header') {
    const services = t('Services','الخدمات'), requests = t('My requests','طلباتي'), signIn = t('Sign in','تسجيل الدخول');
    const links = JSON.stringify([{label:services,href:'/services',current:true},{label:requests,href:'/requests'}]);
    const brand = `<img src="${import.meta.env.BASE_URL}brand/assets/hawiyah-wordmark.svg" width="80" height="50" alt="هوية">`;
    return [{ title: t('Header with identity, navigation and actions', 'ترويسة بالهوية والتنقل والإجراءات'),
      markup: `<header class="hw-portal-header" data-hw="portal-header"><a class="hw-skip-link" href="#ready-header-main">${t('Skip to content','انتقل إلى المحتوى')}</a><a class="hw-portal-brand" href="/">${brand}</a><button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle>${t('Menu','القائمة')}</button><nav data-hw-portal-navigation aria-label="${t('Example navigation','تنقل المثال')}"><ul><li><a href="/services" aria-current="page">${services}</a></li><li><a href="/requests">${requests}</a></li></ul></nav><div class="hw-portal-header-actions"><a class="hw-button" href="/login">${signIn}</a></div></header><section id="ready-header-main" tabindex="-1"><h3>${services}</h3><p>${t('Your page content goes here.','يوضع محتوى صفحتك هنا.')}</p></section>`,
      react: `import { PortalHeader } from '@hawiyah/react';\n\n<PortalHeader brand={<img src="/brand/hawiyah-wordmark.svg" alt="هوية" width={80} height={50} />} brandHref="/" mainId="main-content" navigation={${links}} actions={<a className="hw-button" href="/login">${signIn}</a>} />\n<main id="main-content" tabIndex={-1}>...</main>`,
      vue: `<!-- import { PortalHeader } from '@hawiyah/vue' -->\n<PortalHeader brand="هوية" home-href="/" main-id="main-content" :links='${links}'><template #logo><img src="/brand/hawiyah-wordmark.svg" alt="هوية" width="80" height="50"></template><template #actions><a class="hw-button" href="/login">${signIn}</a></template></PortalHeader>\n<main id="main-content" tabindex="-1">...</main>`,
      angular: `<!-- imports: [HwPortalHeaderComponent]; links = ${links} -->\n<hw-portal-header brand="" homeHref="/" mainId="main-content" [links]="links"><img hwBrand src="/brand/hawiyah-wordmark.svg" alt="هوية" width="80" height="50"><a class="hw-button" href="/login">${signIn}</a></hw-portal-header>\n<main id="main-content" tabindex="-1">...</main>`,
    }, portalMenuRecipe(locale)];
  }
  if (id === 'portal-footer') {
    const d=portalFooterExampleData(locale),groups=JSON.stringify(d.groups),policies=JSON.stringify(d.legalLinks);
    const support=`<p>${d.supportDescription}</p><div class="hw-portal-footer-actions"><a class="hw-button" data-variant="outline-white" href="/help">${d.helpLabel}</a><a class="hw-button" data-variant="outline-white" href="/contact">${d.contactLabel}</a></div>`;
    return [{title:t('Grouped footer with identity, support and policies','تذييل بالهوية ومجموعات الروابط والدعم والسياسات'),markup:portalFooterMarkup(locale,'ready-footer'),
      react:`import { PortalFooter } from '@hawiyah/react';\n\n<PortalFooter brand={<span className="hw-portal-footer-wordmark" role="img" aria-label="هوية" />} description="${d.description}" groups={${groups}} legalLinks={${policies}} legalLinksLabel="${d.legalLinksLabel}" legal="${d.legal}" supportLabel="${d.supportLabel}" support={<>${support.replaceAll('class=','className=')}</>} />`,
      vue:`<!-- import { PortalFooter } from '@hawiyah/vue' -->\n<PortalFooter description="${d.description}" :groups='${groups}' :legal-links='${policies}' legal-links-label="${d.legalLinksLabel}" copyright="${d.legal}" support-label="${d.supportLabel}"><template #logo><span class="hw-portal-footer-wordmark" role="img" aria-label="هوية"></span></template><template #support>${support}</template></PortalFooter>`,
      angular:`<!-- import { HwPortalFooterComponent } from '@hawiyah/angular'; add to imports; groups = ${groups}; policies = ${policies} -->\n<hw-portal-footer description="${d.description}" [groups]="groups" [legalLinks]="policies" legalLinksLabel="${d.legalLinksLabel}" copyright="${d.legal}" supportLabel="${d.supportLabel}"><span hwFooterBrand class="hw-portal-footer-wordmark" role="img" aria-label="هوية"></span><div hwFooterSupport>${support}</div></hw-portal-footer>`,
    }];
  }
  if (id === 'portal-layout') return [{ title:t('Header, page and footer together','الترويسة والصفحة والتذييل معًا'),markup:preview(id).replaceAll('reference-', 'ready-reference-') }];
  return [];
}

export function renderReadyExamples(id: ComponentId, locale: Locale, preview: (id: ComponentId) => string, code: (value: string) => string) {
  const examples=recipes(id,locale,preview); if (!examples.length) return '';
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return `<section id="component-examples" class="guide-content-section"><h2>${t('Ready-to-use examples','أمثلة جاهزة للاستخدام')}</h2><p>${t('Every status is visible below. Demo links stay inside the preview; use your real routes when copying a component. Static examples do not announce every message as a live alert.','تظهر جميع الحالات أدناه. تبقى روابط الأمثلة داخل المعاينة؛ استخدم مسارات تطبيقك عند نسخ المكوّن. لا تعلن الأمثلة الثابتة كل رسالة كتنبيه مباشر.')}</p><div class="ready-examples">${examples.map((r,i)=>`<article class="ready-example" data-ready-example="${id}-${i}"><h3>${e(r.title)}</h3><div class="component-preview" data-demo-preview>${inlineExample(id, r.markup)}</div><details class="source-details"><summary>${t('Copy component code','انسخ شفرة المكوّن')}<span class="source-details-state" aria-hidden="true">${icon("add",14)}${icon("minus",14)}</span></summary>${Object.entries({Vanilla:r.markup,...(r.vanillaScript?{'Vanilla JavaScript':r.vanillaScript}:{}),React:r.react,Vue:r.vue,Angular:r.angular}).filter(([,v])=>v).map(([name,value])=>`<h4 dir="ltr">${name}</h4>${code(value!)}`).join('')}</details></article>`).join('')}</div></section>`;
}
