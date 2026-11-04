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
    if (id === 'badge' || id === 'chip') return `<span class="nq-${id}" data-tone="${item.tone}" data-variant="${variant}">${label}</span>`;
    return `<div class="nq-alert" data-tone="${item.tone}" data-variant="${variant}"><div class="nq-alert-content"><strong>${label}</strong><p>${body}</p></div></div>`;
  }).join('\n');
  return `<div class="${id === 'alert' ? 'nq-stack' : id === 'badge' ? 'nq-cluster nq-badges' : 'nq-cluster'}">${items}</div>`;
}

type Recipe = { title: string; markup: string; vanillaScript?: string; react?: string; vue?: string; angular?: string };

function recipes(id: ComponentId, locale: Locale, preview: (id: ComponentId) => string): Recipe[] {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  if (id === 'card') return listDemoRecipes(locale);
  if (id === 'select') return selectDemoCases(locale).map(example => {
    const native = selectNativeMarkup(example);
    return {
      title: example.title,
      markup: selectDemoMarkup(example, 'ready-region'),
      react: `import { Select } from '@nasaq/react';\n\nexport default function RegionPicker() {\n  return ${native.react};\n}`,
      vue: `${example.kind === 'multiple' ? '' : "<script setup>\nimport { Select } from '@nasaq/vue';\n</script>\n\n"}<template>\n  ${native.vue}\n</template>`,
      angular: `import { Component } from '@angular/core';\n${example.kind === 'multiple' || example.kind === 'listbox' ? '' : "import { NqSelectComponent } from '@nasaq/angular';\n"}\n@Component({\n  selector: 'app-region-picker',\n  standalone: true,\n  imports: [${example.kind === 'multiple' || example.kind === 'listbox' ? '' : 'NqSelectComponent'}],\n  template: \`${native.angular}\`,\n})\nexport class RegionPicker {}`,

    };
  });
  if(id==='search-field')return searchDemoCases(locale).map(item=>({
    title:item.title,markup:searchDemoMarkup(locale,item.kind),
    vanillaScript:searchProject('vanilla','javascript',locale,[item.kind]).files.js.replace("import './style.css';","import '@nasaq/styles/styles.css';").replace("'#app'",`'[data-search-demo="${item.kind}"]'`),
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
      react:`import { Tabs } from '@nasaq/react';\n\n${native.react}`,
      vue:`<!-- import { Tabs } from '@nasaq/vue' -->\n${native.vue}`,
      angular:`<!-- import { NqTabsComponent, NqTabComponent } from '@nasaq/angular'; add both to imports -->\n${native.angular}`,
    };
  });
  if(id==='pagination')return paginationDemoCases(locale).map(item=>{
    const native=paginationNativeMarkup(locale,item.kind);
    return {title:item.title,markup:paginationDemoMarkup(locale,item.kind),
      react:`import { Pagination } from '@nasaq/react';\n\n${native.react}`,
      vue:`<!-- import { Pagination } from '@nasaq/vue' -->\n${native.vue}`,
      angular:`<!-- import { NqPaginationComponent } from '@nasaq/angular'; add to imports -->\n<!-- Component class members:${native.angularMember} -->\n${native.angular}`,
    };
  });
  if(id==='rating')return ratingDemoCases(locale).map(item=>{
    const native=ratingNativeMarkup(locale,item.kind),name=item.kind==='scores'?'RatingDisplay':'Rating';
    return {title:item.title,markup:ratingDemoMarkup(locale,item.kind),
      react:`import { ${name} } from '@nasaq/react';\n\n${native.react}`,
      vue:`<!-- import { ${name} } from '@nasaq/vue' -->\n${native.vue}`,
      angular:`<!-- import { Nq${name}Component } from '@nasaq/angular'; add to imports -->\n<!-- Component class member:${native.angularMember} -->\n${native.angular}`,
    };
  });
  if(id==='carousel')return carouselDemoCases(locale).map(item=>{
    const native=carouselNativeMarkup(locale,item.kind);
    return {title:item.title,markup:carouselDemoMarkup(locale,item.kind),
      react:`import { Carousel } from '@nasaq/react';\n\n${native.react}`,
      vue:`<!-- import { Carousel } from '@nasaq/vue' -->\n${native.vue}`,
      angular:`<!-- import { NqCarouselComponent } from '@nasaq/angular'; add to imports -->\n<!-- Component class member:${native.angularMember} -->\n${native.angular}`,
    };
  });
  if(id==='avatar')return avatarDemoCases(locale).map(item=>({
    title:item.title,markup:avatarDemoMarkup(item),
    react:`import { Avatar } from '@nasaq/react';\n\n<Avatar ${avatarDemoProps(item)} />`,
    vue:`<!-- import { Avatar } from '@nasaq/vue' -->\n<Avatar ${avatarDemoProps(item)} />`,
    angular:`<!-- import { NqAvatarComponent } from '@nasaq/angular'; add to imports -->\n<nq-avatar ${avatarDemoProps(item)} />`,
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
        ? `<th scope="col" data-nq-key="service"><button type="button" data-nq-sort="service">${service}<span class="nq-table-sort-icon" aria-hidden="true"></span></button></th><th scope="col" data-nq-key="days" data-nq-type="number"><button type="button" data-nq-sort="days">${days}<span class="nq-table-sort-icon" aria-hidden="true"></span></button></th>`
        : `<th scope="col">${service}</th><th scope="col">${days}</th>`;
      const columns = [{ key: 'service', label: service, rowHeader: true, ...(sortable ? { sortable: true } : {}) }, { key: 'days', label: days, ...(sortable ? { sortable: true } : {}) }];
      const reactColumns = sortable ? JSON.stringify(columns)
        : `[{key:'service',header:'${service}',rowHeader:true,cell:row => row.service},{key:'days',header:'${days}',cell:row => row.days}]`;
      const vueColumns = sortable ? columns : columns.map(({ key, label, ...rest }) => ({ key, header: label, ...rest }));
      return {
        title: item.title,
        markup: `<div class="nq-table-wrap" tabindex="0" role="region" aria-label="${caption}"><table class="nq-table${sortable ? ' nq-data-table' : ''}" ${sortable ? `data-nq="data-table" data-nq-locale="${language}"` : ''} data-variant="${item.variant}" data-size="${item.size}"><caption>${caption}</caption><thead><tr>${headings}</tr></thead><tbody>${body}</tbody></table></div>`,
        react: `import { ${component} } from '@nasaq/react';\n\nconst rows = ${reactRows};\n\n<${component} caption="${caption}" rows={rows} columns={${reactColumns}} variant="${item.variant}" size="${item.size}" emptyMessage="${emptyMessage}" ${sortable ? `locale="${language}"` : ''} />`,
        vue: `<!-- import { ${component} } from '@nasaq/vue' -->\n<${component} caption="${caption}" :rows='${data}' :columns='${JSON.stringify(vueColumns)}' variant="${item.variant}" size="${item.size}" empty-message="${emptyMessage}" ${sortable ? `locale="${language}"${locale === 'en' ? ` :sort-label="(column, direction) => 'Sort ' + column.label + ' ' + direction"` : ''}` : ''} />`,
        angular: `<!-- import { Nq${component}Component } from '@nasaq/angular'; add to imports -->\n<nq-${sortable ? 'data-table' : 'table'} caption="${caption}" [rows]='${data}' [columns]='${JSON.stringify(columns)}' variant="${item.variant}" size="${item.size}" emptyMessage="${emptyMessage}" ${sortable ? `locale="${language}"` : ''} />`,
      };
    });
  }
  if(id==='icon-button')return [
    ...iconButtonCases.map(item=>{
      const label=iconButtonLabel(locale,item.key), pressed='pressed' in item, disabled='disabled' in item, loading='loading' in item;
      return {title:label,markup:`<button class="nq-button nq-icon-button" type="button" aria-label="${label}" data-variant="${item.variant}" data-size="${item.size}" data-shape="${item.shape}" ${pressed?'aria-pressed="true"':''} ${disabled||loading?'disabled':''} ${loading?'aria-busy="true"':''}><span class="nq-icon" data-icon="search-01" aria-hidden="true"></span></button>`,
        react:`import { IconButton } from '@nasaq/react';\n\n<IconButton label="${label}" variant="${item.variant}" size="${item.size}" shape="${item.shape}" ${pressed?'aria-pressed={true}':''} ${disabled?'disabled':''} ${loading?'loading':''}><span className="nq-icon" data-icon="search-01" /></IconButton>`,
        vue:`<!-- import { IconButton } from '@nasaq/vue' -->\n<IconButton label="${label}" variant="${item.variant}" size="${item.size}" shape="${item.shape}" ${pressed?':aria-pressed="true"':''} ${disabled?'disabled':''} ${loading?'loading':''}><span class="nq-icon" data-icon="search-01" /></IconButton>`,
        angular:`<!-- imports: [NqIconButtonComponent] -->\n<nq-icon-button label="${label}" variant="${item.variant}" size="${item.size}" shape="${item.shape}" ${pressed?'[pressed]="true"':''} ${disabled?'disabled':''} ${loading?'loading':''}><span class="nq-icon" data-icon="search-01"></span></nq-icon-button>`,
      };
    }),
    {title:t('Decorative background icons','أيقونات زخرفية بخلفية'),markup:iconBackgroundMarkup()},
    {title:t('Artwork sizes: 14, 20, 24, 30, 48 px','أحجام الرسم: 14، 20، 24، 30، 48 بكسل'),markup:`<div class="nq-cluster" style="color:var(--nq-color-success)" aria-hidden="true">${['sm','md','lg','xl','2xl'].map(size=>`<span class="nq-icon" data-icon="search-01" data-size="${size}"></span>`).join('')}</div>`},
  ];
  if(id==='toggle-group')return ['segmented','outline','multiple','readonly','disabled','readonly-outline'].map(kind=>{
    const options=JSON.stringify([{value:'first',label:t('List','قائمة')},{value:'second',label:t('Grid','شبكة')},{value:'blocked',label:t('Map','خريطة'),disabled:true}]),label=t('View mode','نمط العرض'),variant=kind.includes('outline')?'outline':'segmented';
    return {title:t(`Toggle group · ${kind}`,`مجموعة اختيار · ${kind}`),markup:toggleGroupMarkup(locale,kind,`ready-toggle-${kind}`),
      react:`import { ToggleGroup } from '@nasaq/react';\n\n<ToggleGroup label="${label}" options={${options}} variant="${variant}" ${(kind==='multiple'||kind==='readonly-outline')?"multiple defaultValue={['first']}":'defaultValue="first"'} ${kind.startsWith('readonly')?'readOnly':kind==='disabled'?'disabled':''} />`,
      vue:`<!-- import { ToggleGroup } from '@nasaq/vue' -->\n<ToggleGroup label="${label}" :options='${options}' variant="${variant}" ${(kind==='multiple'||kind==='readonly-outline')?"multiple :default-value=\"['first']\"":'default-value="first"'} ${kind.startsWith('readonly')?'readonly':kind==='disabled'?'disabled':''} />`,
      angular:`<!-- imports: [NqToggleGroupComponent] -->\n<nq-toggle-group label="${label}" [options]='${options}' variant="${variant}" ${(kind==='multiple'||kind==='readonly-outline')?"[multiple]=\"true\" [value]=\"['first']\"":'value="first"'} ${kind.startsWith('readonly')?'[readOnly]="true"':kind==='disabled'?'[disabled]="true"':''} />`,
    };
  });
  if(id==='button-group')return ['horizontal','vertical'].map(orientation=>({title:t(`Attached actions · ${orientation}`,`إجراءات متصلة · ${orientation}`),
    markup:`<div class="nq-button-group" role="group" aria-label="${t('Document actions','إجراءات المستند')}" data-variant="attached" data-orientation="${orientation}"><button class="nq-button" data-variant="secondary" type="button">${t('Save','حفظ')}</button><button class="nq-button" data-variant="secondary" type="button">${t('Preview','معاينة')}</button><button class="nq-button" data-variant="secondary" type="button" disabled>${t('Delete','حذف')}</button></div>`,
    react:`import { ButtonGroup, Button } from '@nasaq/react';\n\n<ButtonGroup label="${t('Document actions','إجراءات المستند')}" variant="attached" orientation="${orientation}"><Button variant="secondary">${t('Save','حفظ')}</Button><Button variant="secondary">${t('Preview','معاينة')}</Button><Button variant="secondary" disabled>${t('Delete','حذف')}</Button></ButtonGroup>`,
    vue:`<!-- import { ButtonGroup, Button } from '@nasaq/vue' -->\n<ButtonGroup label="${t('Document actions','إجراءات المستند')}" variant="attached" orientation="${orientation}"><Button variant="secondary">${t('Save','حفظ')}</Button><Button variant="secondary">${t('Preview','معاينة')}</Button><Button variant="secondary" disabled>${t('Delete','حذف')}</Button></ButtonGroup>`,
    angular:`<!-- imports: [NqButtonGroupComponent, NqButtonDirective] -->\n<nq-button-group label="${t('Document actions','إجراءات المستند')}" variant="attached" orientation="${orientation}"><button nqButton variant="secondary">${t('Save','حفظ')}</button><button nqButton variant="secondary">${t('Preview','معاينة')}</button><button nqButton variant="secondary" disabled>${t('Delete','حذف')}</button></nq-button-group>`,
  }));
  if(id==='link')return (['default','neutral','standalone','disabled'] as const).map(variant=>{
    const disabled=variant==='disabled',label=disabled?t('Unavailable destination','وجهة غير متاحة'):t('Read the guide','اقرأ الدليل');
    return {title:t(`Link · ${variant}`,`رابط · ${variant}`),markup:`<a class="nq-link" ${disabled?'role="link" aria-disabled="true" tabindex="-1"':`href="#guide" data-variant="${variant}"`}>${label}${variant==='standalone'?'<span class="nq-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true"></span>':''}</a>`,
      react:`import { Link } from '@nasaq/react';\n\n<Link href="#guide" ${disabled?'disabled':`variant="${variant}"`}>${label}</Link>`,
      vue:`<!-- import { Link } from '@nasaq/vue' -->\n<Link href="#guide" ${disabled?'disabled':`variant="${variant}"`}>${label}</Link>`,
      angular:`<!-- import { NqLinkComponent } from '@nasaq/angular'; add to imports -->\n<nq-link href="#guide" ${disabled?'[disabled]="true"':`variant="${variant}"`}>${label}</nq-link>`,
    };
  });
  if (id === 'site-verification') {
    const copy=siteVerificationDemoLabels(locale);
    return [false,true].map(open=>({title:open?t('Expanded verification','تفاصيل التحقق'):t('Collapsed verification','شريط التحقق المطوي'),markup:siteVerificationMarkup(locale,open),
      react:`import { SiteVerification } from '@nasaq/react';\n\n<SiteVerification locale="${locale}" label="${copy.label}" domain="example.test" registrationHref="#example-registration" registrationLabel="${copy.registrationLabel}" defaultOpen={${open}} />`,
      vue:`<!-- import { SiteVerification } from '@nasaq/vue' -->\n<SiteVerification locale="${locale}" label="${copy.label}" domain="example.test" registration-href="#example-registration" registration-label="${copy.registrationLabel}" :default-open="${open}" />`,
      angular:`<!-- import { NqSiteVerificationComponent } from '@nasaq/angular'; add to imports -->\n<nq-site-verification locale="${locale}" label="${copy.label}" domain="example.test" registrationHref="#example-registration" registrationLabel="${copy.registrationLabel}" [open]="${open}" />`,
    }));
  }
  if(id==='feedback')return (['text','icon-text','icon'] as const).map(variant=>({
    title:t(`Feedback · ${variant}`,`تقييم الصفحة · ${variant}`), markup:feedbackMarkup(locale,variant),
    react:`import { Feedback } from '@nasaq/react';\n\n<Feedback label="${t('Was this page helpful?','هل كانت هذه الصفحة مفيدة؟')}" choiceVariant="${variant}" yesLabel="${t('Yes','نعم')}" noLabel="${t('No','لا')}" commentLabel="${t('Tell us more','أخبرنا بالمزيد')}" submitLabel="${t('Send feedback','إرسال التقييم')}" successMessage="${t('Thank you for your feedback.','شكراً على تقييمك.')}" onFeedback={value => console.log(value)} />`,
    vue:`<!-- import { Feedback } from '@nasaq/vue' -->\n<Feedback label="${t('Was this page helpful?','هل كانت هذه الصفحة مفيدة؟')}" choice-variant="${variant}" yes-label="${t('Yes','نعم')}" no-label="${t('No','لا')}" comment-label="${t('Tell us more','أخبرنا بالمزيد')}" submit-label="${t('Send feedback','إرسال التقييم')}" thanks="${t('Thank you for your feedback.','شكراً على تقييمك.')}" @submit="value => console.log(value)" />`,
    angular:`<!-- imports: [NqFeedbackComponent] -->\n<nq-feedback label="${t('Was this page helpful?','هل كانت هذه الصفحة مفيدة؟')}" choiceVariant="${variant}" positiveLabel="${t('Yes','نعم')}" negativeLabel="${t('No','لا')}" />`,
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
      markup:`<div class="nq-stack">${states.map((s,i)=>`<label class="nq-choice"><input class="nq-${id}" type="${id}" name="ready-${id}-${i}" ${s.checked?'checked':''} ${s.disabled?'disabled':''} ${s.readonly?'readonly aria-disabled="true"':''}>${s.label}</label>`).join('')}</div>`,
      react:`import { ${component} } from '@nasaq/react';\n\n${states.map((s,i)=>`<${component} label="${s.label}" name="example-${i}" ${s.checked?'defaultChecked ':''}${s.disabled?'disabled ':''}${s.readonly?'readOnly ':''}/>`).join('\n')}`,
      vue:`<script setup>\nimport { ${component} } from '@nasaq/vue';\n</script>\n<template>\n${states.map((s,i)=>`  <${component} label="${s.label}" name="example-${i}" ${id==='radio'?`value="on" ${s.checked?'default-value="on" ':''}`:s.checked?':default-value="true" ':''}${s.disabled?'disabled ':''}${s.readonly?'read-only ':''}/>`).join('\n')}\n</template>`,
      angular:`<!-- Import Nq${component}Component from @nasaq/angular into the standalone component. -->\n${states.map((s,i)=>`<nq-${id} label="${s.label}" name="example-${i}" ${id==='radio'?`[options]="[{value:'on',label:'${s.label}'}]" ${s.checked?'value="on" ':''}`:s.checked?'[value]="true" ':''}${s.disabled?'disabled ':''}${s.readonly?'readOnly ':''}/>`).join('\n')}`,
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
        react: `import { ${component} } from '@nasaq/react';\n\n` + (id === 'badge' ? '<div className="nq-badges">\n' : '') + lines.map(s => id === 'alert' ? `<Alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></Alert>` : `<${component} tone="${s.tone}" ${id === 'badge' ? 'variant' : 'data-variant'}="${variant}">${s.title}</${component}>`).join('\n') + (id === 'badge' ? '\n</div>' : ''),
        vue: `<!-- import { ${component} } from '@nasaq/vue' -->\n` + (id === 'badge' ? '<div class="nq-badges">\n' : '') + lines.map(s => id === 'alert' ? `<Alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></Alert>` : `<${component} tone="${s.tone}" ${id === 'badge' ? 'variant' : 'data-variant'}="${variant}">${s.title}</${component}>`).join('\n') + (id === 'badge' ? '\n</div>' : ''),
        angular: `<!-- imports: [Nq${component}Component] from @nasaq/angular -->\n` + (id === 'badge' ? '<div class="nq-badges">\n' : '') + lines.map(s => id === 'alert' ? `<nq-alert tone="${s.tone}" variant="${variant}" title="${s.title}" role="group"><p>${s.body}</p></nq-alert>` : `<nq-${id} tone="${s.tone}" variant="${variant}">${s.title}</nq-${id}>`).join('\n') + (id === 'badge' ? '\n</div>' : ''),
      };
    });
  }
  if (id === 'button') {
    const variants = ['primary', 'default', 'secondary', 'outline', 'outline-white', 'light', 'danger', 'ghost', 'soft', 'link'];
    return [{ title: t('Every appearance', 'جميع الأنماط'),
      markup: `<div class="nq-cluster">${variants.map(v => `<span style="padding:8px;${['outline-white', 'light'].includes(v) ? 'background:#14573a' : ''}"><button class="nq-button" type="button" data-variant="${v}">${v}</button></span>`).join('')}</div>`,
      react: `import { Button } from '@nasaq/react';\n\n${variants.map(v => `<Button variant="${v}">${v}</Button>`).join('\n')}`,
      vue: `<!-- import { Button } from '@nasaq/vue' -->\n${variants.map(v => `<Button variant="${v}">${v}</Button>`).join('\n')}`,
      angular: `<!-- imports: [NqButtonDirective] -->\n${variants.map(v => `<button nqButton variant="${v}" type="button">${v}</button>`).join('\n')}`,
    }, { title: t('Sizes, disabled and loading', 'الأحجام والتعطيل والتحميل'),
      markup: `<div class="nq-cluster">${['sm','md','lg'].map(size => `<button class="nq-button" type="button" data-size="${size}">${size}</button>`).join('')}<button class="nq-button" type="button" disabled>${t('Unavailable', 'غير متاح')}</button><button class="nq-button" type="button" disabled aria-busy="true">${t('Saving…', 'جارٍ الحفظ…')}</button></div>`,
      react: '<Button size="sm">sm</Button>\n<Button size="md">md</Button>\n<Button size="lg">lg</Button>\n<Button disabled>غير متاح</Button>\n<Button loading>جارٍ الحفظ</Button>',
      vue: '<Button size="sm">sm</Button>\n<Button size="md">md</Button>\n<Button size="lg">lg</Button>\n<Button disabled>غير متاح</Button>\n<Button loading>جارٍ الحفظ</Button>',
      angular: '<button nqButton size="sm" type="button">sm</button>\n<button nqButton size="md" type="button">md</button>\n<button nqButton size="lg" type="button">lg</button>\n<button nqButton type="button" disabled>غير متاح</button>\n<button nqButton type="button" disabled aria-busy="true">جارٍ الحفظ</button>',
    }, ...copyActionRecipes(locale)];
  }
  if (id === 'toast-region') return toastDemoRecipes(locale);
  if (id === 'dialog') return notificationDialogRecipes(locale);
  if (id === 'portal-header') {
    const services = t('Services','الخدمات'), requests = t('My requests','طلباتي'), signIn = t('Sign in','تسجيل الدخول');
    const links = JSON.stringify([{label:services,href:'/services',current:true},{label:requests,href:'/requests'}]);
    const brand = `<img src="${import.meta.env.BASE_URL}brand/assets/nasaq-wordmark.svg" width="80" height="50" alt="نسق">`;
    return [{ title: t('Header with identity, navigation and actions', 'ترويسة بالهوية والتنقل والإجراءات'),
      markup: `<header class="nq-portal-header" data-nq="portal-header"><a class="nq-skip-link" href="#ready-header-main">${t('Skip to content','انتقل إلى المحتوى')}</a><a class="nq-portal-brand" href="/">${brand}</a><button class="nq-button nq-portal-menu-toggle" type="button" data-nq-portal-toggle>${t('Menu','القائمة')}</button><nav data-nq-portal-navigation aria-label="${t('Example navigation','تنقل المثال')}"><ul><li><a href="/services" aria-current="page">${services}</a></li><li><a href="/requests">${requests}</a></li></ul></nav><div class="nq-portal-header-actions"><a class="nq-button" href="/login">${signIn}</a></div></header><section id="ready-header-main" tabindex="-1"><h3>${services}</h3><p>${t('Your page content goes here.','يوضع محتوى صفحتك هنا.')}</p></section>`,
      react: `import { PortalHeader } from '@nasaq/react';\n\n<PortalHeader brand={<img src="/brand/nasaq-wordmark.svg" alt="نسق" width={80} height={50} />} brandHref="/" mainId="main-content" navigation={${links}} actions={<a className="nq-button" href="/login">${signIn}</a>} />\n<main id="main-content" tabIndex={-1}>...</main>`,
      vue: `<!-- import { PortalHeader } from '@nasaq/vue' -->\n<PortalHeader brand="نسق" home-href="/" main-id="main-content" :links='${links}'><template #logo><img src="/brand/nasaq-wordmark.svg" alt="نسق" width="80" height="50"></template><template #actions><a class="nq-button" href="/login">${signIn}</a></template></PortalHeader>\n<main id="main-content" tabindex="-1">...</main>`,
      angular: `<!-- imports: [NqPortalHeaderComponent]; links = ${links} -->\n<nq-portal-header brand="" homeHref="/" mainId="main-content" [links]="links"><img nqBrand src="/brand/nasaq-wordmark.svg" alt="نسق" width="80" height="50"><a class="nq-button" href="/login">${signIn}</a></nq-portal-header>\n<main id="main-content" tabindex="-1">...</main>`,
    }, portalMenuRecipe(locale)];
  }
  if (id === 'portal-footer') {
    const d=portalFooterExampleData(locale),groups=JSON.stringify(d.groups),policies=JSON.stringify(d.legalLinks);
    const support=`<p>${d.supportDescription}</p><div class="nq-portal-footer-actions"><a class="nq-button" data-variant="outline-white" href="/help">${d.helpLabel}</a><a class="nq-button" data-variant="outline-white" href="/contact">${d.contactLabel}</a></div>`;
    return [{title:t('Grouped footer with identity, support and policies','تذييل بالهوية ومجموعات الروابط والدعم والسياسات'),markup:portalFooterMarkup(locale,'ready-footer'),
      react:`import { PortalFooter } from '@nasaq/react';\n\n<PortalFooter brand={<span className="nq-portal-footer-wordmark" role="img" aria-label="نسق" />} description="${d.description}" groups={${groups}} legalLinks={${policies}} legalLinksLabel="${d.legalLinksLabel}" legal="${d.legal}" supportLabel="${d.supportLabel}" support={<>${support.replaceAll('class=','className=')}</>} />`,
      vue:`<!-- import { PortalFooter } from '@nasaq/vue' -->\n<PortalFooter description="${d.description}" :groups='${groups}' :legal-links='${policies}' legal-links-label="${d.legalLinksLabel}" copyright="${d.legal}" support-label="${d.supportLabel}"><template #logo><span class="nq-portal-footer-wordmark" role="img" aria-label="نسق"></span></template><template #support>${support}</template></PortalFooter>`,
      angular:`<!-- import { NqPortalFooterComponent } from '@nasaq/angular'; add to imports; groups = ${groups}; policies = ${policies} -->\n<nq-portal-footer description="${d.description}" [groups]="groups" [legalLinks]="policies" legalLinksLabel="${d.legalLinksLabel}" copyright="${d.legal}" supportLabel="${d.supportLabel}"><span nqFooterBrand class="nq-portal-footer-wordmark" role="img" aria-label="نسق"></span><div nqFooterSupport>${support}</div></nq-portal-footer>`,
    }];
  }
  if (id === 'portal-layout') return [{ title:t('Header, page and footer together','الترويسة والصفحة والتذييل معًا'),markup:preview(id).replaceAll('reference-', 'ready-reference-') }];
  return [];
}

export function renderReadyExamples(id: ComponentId, locale: Locale, preview: (id: ComponentId) => string, code: (value: string) => string) {
  const examples=recipes(id,locale,preview); if (!examples.length) return '';
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return `<section id="component-examples" class="guide-content-section"><h2>${t('Ready-to-use examples','أمثلة جاهزة للاستخدام')}</h2><p>${t('Every status is visible below. Demo links stay inside the preview; use your real routes when copying a component. Static examples do not announce every message as a live alert.','تظهر جميع الحالات أدناه. تبقى روابط الأمثلة داخل المعاينة؛ استخدم مسارات تطبيقك عند نسخ المكوّن. لا تعلن الأمثلة الثابتة كل رسالة كتنبيه مباشر.')}</p><div class="ready-examples">${examples.map((r,i)=>`<article class="ready-example" data-ready-example="${id}-${i}"><h3>${e(r.title)}</h3><div class="component-preview" data-demo-preview>${r.markup}</div><details class="source-details"><summary>${t('Copy component code','انسخ شفرة المكوّن')}</summary>${Object.entries({Vanilla:r.markup,...(r.vanillaScript?{'Vanilla JavaScript':r.vanillaScript}:{}),React:r.react,Vue:r.vue,Angular:r.angular}).filter(([,v])=>v).map(([name,value])=>`<h4 dir="ltr">${name}</h4>${code(value!)}`).join('')}</details></article>`).join('')}</div></section>`;
}
