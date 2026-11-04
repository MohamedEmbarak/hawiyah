import {isServicePatternId, servicePatternIds, servicePatternProject} from './service-pattern-projects.ts';
import {dividerProjectMarkup} from './divider-demo.ts';
import {isPortalShellId, portalShellIds, portalShellProject} from './portal-shell-projects.ts';
import {disclosureProjectIds, disclosureProjectRecipe, isDisclosureProjectId} from './disclosure-projects.ts';
import {siteVerificationMarkup} from './site-verification-demo.ts';
import {portalMenuItems, portalMenuMarkup} from './portal-navigation-demo.ts';
import {choiceInputIds, choiceInputProject, isChoiceInput} from './choice-input-projects.ts';
import {notificationDialogProject} from './notification-dialog-demo.ts';
import {fileProject, fileProjectIds, isFileProjectId} from './file-projects.ts';
import {calendarProject} from './calendar-projects.ts';
import {basicInputProjectIds, basicInputProjectRecipe, isBasicInputId} from './basic-input-projects.ts';
import {toastProject} from './toast-demo.ts';
import {contentComponents, contentProjectIds, contentProjectRecipe, isContentProjectId} from './content-project-recipes.ts';
import {isLayoutId, layoutComponents, layoutProjectCss, layoutProjectMarkup} from './layout-projects.ts';
import {selectDemoCases, selectDemoMarkup, selectNativeMarkup} from './select-demo.ts';
import {searchProject} from './search-demo.ts';
import {contentNavigationProject,contentNavigationDemoCases,contentNavigationDemoMarkup} from './content-navigation-demo.ts';
import {tabsDemoCases,tabsNativeMarkup} from './tabs-demo.ts';
import {paginationDemoCases,paginationNativeMarkup} from './pagination-demo.ts';
import {ratingDemoCases,ratingNativeMarkup} from './rating-demo.ts';
import {carouselDemoCases,carouselNativeMarkup} from './carousel-demo.ts';
import {iconButtonCases,iconButtonLabel,iconBackgroundMarkup} from './icon-button-demo.ts';
import {avatarDemoCases,avatarDemoProps} from './avatar-demo.ts';
import type { IDEFiles } from "./component-ide";
import type { ProjectFramework, ProjectLanguage } from "./project-compiler";
import type { Locale } from "./data";

export const nativeProjectComponents = new Set([
  ...Object.keys(layoutComponents),
  ...contentProjectIds,
  ...basicInputProjectIds,
  ...disclosureProjectIds,
  ...portalShellIds,
  ...servicePatternIds,
  ...fileProjectIds,
  ...choiceInputIds,
  "dialog",
  "calendar",
  "date-picker",
  "toast-region",
  "search-field",
  "content-navigation",
  "button",
  "icon-button",
  "text-field",
  "textarea",
  "checkbox",
  "switch",
  "toggle-group",
  "button-group",
  "badge",
  "alert",
  "divider",
  "spinner",
  "select",
  "radio",
  "rating",
  "card",
  "accordion",
  "carousel",
  "table",
  "data-table",
  "breadcrumb",
  "pagination",
  "stepper",
  "tabs",
  "progress",
  "skeleton",
  "avatar",
  "empty",
  "feedback",
  "link",
  "site-verification",
  "portal-header",
  "portal-footer",
]);
export type ProjectExample = {
  names: Record<keyof IDEFiles, string>;
  files: IDEFiles;
  entry: string;
  host: string;
};
export function projectExample(
  id: string,
  framework: ProjectFramework,
  language: ProjectLanguage,
  locale: Locale,
  html: string,
): ProjectExample {
  if (isServicePatternId(id)) return servicePatternProject(id, framework, language, locale);
  if (isPortalShellId(id)) return portalShellProject(id, framework, language, locale);
  if (isChoiceInput(id)) return choiceInputProject(id, framework, language, locale);
  if (id === "dialog") return notificationDialogProject(framework, language, locale);
  if (isFileProjectId(id)) return fileProject(id, framework, language, locale);
  if (id === "toast-region") return toastProject(framework, language, locale);
  if (id === "search-field") return searchProject(framework,language,locale);
  const typed = language === "typescript",
    ext = typed ? "ts" : "js",
    ar = locale === "ar";
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const css =
    "@import '@nasaq/styles/styles.css';\n\n/* Application-specific styles */\n.demo { display: grid; gap: 1rem; }\n" + (isLayoutId(id) ? layoutProjectCss : "");
  if (id === "content-navigation") html=contentNavigationDemoCases(locale).map(item=>`<section><h2>${item.title}</h2>${contentNavigationDemoMarkup(locale,item.kind,`project-content-nav-${item.kind}`)}</section>`).join('');
  const contentRecipe = isContentProjectId(id) ? contentProjectRecipe(id, locale, typed) : undefined;
  const basicInput = isBasicInputId(id) ? basicInputProjectRecipe(id, locale) : undefined;
  const disclosure = isDisclosureProjectId(id) ? disclosureProjectRecipe(id, locale, typed) : undefined;
  const recipe = disclosure ?? basicInput ?? contentRecipe;
  if (recipe) html = recipe.vanilla;
  let vanillaExampleScript = recipe?.vanillaScript ?? '';
  if (id === 'select' && framework === 'vanilla') {
    html = selectDemoCases(locale).map(example => `<section class="nq-stack"><h2>${example.title}</h2>${selectDemoMarkup(example, 'project-region')}${example.kind === 'single' ? '<output data-select-value>first</output>' : ''}</section>`).join('\n');
    vanillaExampleScript = `\nconst region = root.querySelector('[data-select-demo="single"] select');\nconst selectedValue = root.querySelector('[data-select-value]');\nif (region instanceof HTMLSelectElement && selectedValue instanceof HTMLOutputElement) {\n  const displayValue = () => { selectedValue.value = region.value; };\n  region.addEventListener('change', displayValue);\n  window.addEventListener('pagehide', () => region.removeEventListener('change', displayValue), { once: true });\n}\n`;
  }
  if (id === "portal-header") html = `<div class="nq-portal-masthead">${siteVerificationMarkup(locale)}${portalMenuMarkup(locale)}</div>`;
  if (id === "divider") html = dividerProjectMarkup(locale, "vanilla");
  if (framework === "vanilla")
    return {
      names: { html: "index.html", css: "style.css", js: `main.${ext}` },
      entry: `main.${ext}`,
      host: "",
      files: {
        html: `<!doctype html>\n<html lang="${locale}" dir="${ar ? "rtl" : "ltr"}">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nasaq example</title></head>\n<body>\n<div id="app">\n${html}\n</div>\n<script type="module" src="./main.${ext}"></script>\n</body>\n</html>\n`,
        css,
        js: `import { enhance } from '@nasaq/vanilla';\nimport './style.css';\n\nconst root = document.querySelector${typed ? "<HTMLElement>" : ""}('#app');\nif (!root) throw new Error('Missing app root');\nconst cleanup = enhance(root);\n${vanillaExampleScript}root.addEventListener('nq:change', event => console.log(${typed ? "(event as CustomEvent).detail" : "event.detail"}));\nwindow.addEventListener('pagehide', cleanup, { once: true });\n`,
      },
    };
  if (id === "calendar" || id === "date-picker") return calendarProject(id, framework, language, locale);
  if (id === "content-navigation") return contentNavigationProject(framework,language,locale);
  if (!nativeProjectComponents.has(id))
    throw new Error("Native project recipe pending for " + id);
  const name: Record<string, string> = {
    "icon-button": "IconButton",
    "text-field": "TextField",
    "toggle-group": "ToggleGroup",
    "button-group": "ButtonGroup",
    button: "Button",
    textarea: "Textarea",
    checkbox: "Checkbox",
    switch: "Switch",
    badge: "Badge",
    alert: "Alert",
    divider: "Divider",
    spinner: "Spinner",
    select: "Select",
    radio: "Radio",
    rating: "Rating",
    card: "Card",
    accordion: "Accordion",
    carousel: "Carousel",
    table: "Table",
    "data-table": "DataTable",
    breadcrumb: "Breadcrumb",
    pagination: "Pagination",
    stepper: "Stepper",
    tabs: "Tabs",
    progress: "Progress",
    skeleton: "Skeleton",
    avatar: "Avatar",
    empty: "EmptyState",
    feedback: "Feedback",
    link: "Link",
    "site-verification": "SiteVerification",
    "portal-header": "PortalHeader",
    "portal-footer": "PortalFooter",
  };
  const component = disclosure?.component ?? (isContentProjectId(id) ? contentComponents[id] : isLayoutId(id) ? layoutComponents[id] : name[id]!);
  // AppShell provides the application's main landmark.
  const wrapperTag = id === 'app-shell' ? 'div' : 'main';
  const layoutMarker = isLayoutId(id) ? ` data-layout-project="${id}"` : '';
  const componentImports = basicInput?.componentImports ?? (["site-verification","portal-header"].includes(id) ? "SiteVerification, PortalHeader" : id==="button-group" ? "ButtonGroup, Button, IconButton" : id==="rating" ? "Rating, RatingDisplay" : component);
  const options = JSON.stringify([
    { value: "first", label: t("First", "الأول") },
    { value: "second", label: t("Second", "الثاني") },
  ]);
  let react = "",
    vue = "",
    angular = "",
    angularMember = "",
    state = false,
    booleanState = false,
    numberState = false,
    initialValue: string | undefined;
  const label = t("Example", "مثال");
  if (disclosure) {
    ({react, vue, angular, initialValue} = disclosure);
    state = initialValue !== undefined;
    angularMember = disclosure.angularMember ?? '';
  } else if (basicInput) {
    ({react, vue, angular, initialValue} = basicInput);
    state = true;
  } else if (contentRecipe) {
    react = contentRecipe.react;
    vue = contentRecipe.vue;
    angular = contentRecipe.angular;
    angularMember = contentRecipe.angularMember ?? '';
    state = contentRecipe.state ?? false;
  } else if (isLayoutId(id)) {
    react = layoutProjectMarkup(id, 'react', locale);
    vue = layoutProjectMarkup(id, 'vue', locale);
    angular = layoutProjectMarkup(id, 'angular', locale);
    state = booleanState = id === 'page-header';
  } else if (["site-verification","portal-header"].includes(id)) {
    state=true;booleanState=true;
    const copy={label:t('Verification banner — demonstration','شريط التحقق — مثال توضيحي'),registrationLabel:t('Example platform-registration link','مثال على رابط تسجيل المنصة')},brand=t('Example service portal','بوابة خدمات توضيحية');
    const links=JSON.stringify(id === 'portal-header' ? portalMenuItems(locale) : [{label:t('Services','الخدمات'),href:'#services',current:true},{label:t('Contact','تواصل معنا'),href:'#contact'}]);
    react=`<div className="nq-portal-masthead"><SiteVerification locale="${locale}" label="${copy.label}" domain="example.test" registrationHref="#example-registration" registrationLabel="${copy.registrationLabel}" open={value} onOpenChange={setValue} /><PortalHeader brand="${brand}" brandHref="#home" navigation={${links}} /></div><output>{String(value)}</output>`;
    vue=`<div class="nq-portal-masthead"><SiteVerification locale="${locale}" label="${copy.label}" domain="example.test" registration-href="#example-registration" registration-label="${copy.registrationLabel}" v-model:open="value" /><PortalHeader brand="${brand}" home-href="#home" :links='${links}' /></div><output>{{value}}</output>`;
    angularMember=`\n  links = ${links};`;
    angular=`<div class="nq-portal-masthead"><nq-site-verification locale="${locale}" label="${copy.label}" domain="example.test" registrationHref="#example-registration" registrationLabel="${copy.registrationLabel}" [(open)]="value" /><nq-portal-header brand="${brand}" homeHref="#home" [links]="links" /></div><output>{{value}}</output>`;
  } else if (id === "portal-footer") {
    const groups=JSON.stringify([{title:t('Explore the platform','استكشف المنصة'),links:[{label:t('Services','الخدمات'),href:'#services'},{label:t('About us','عن المنصة'),href:'#about'}]},{title:t('Useful links','روابط مفيدة'),links:[{label:t('Service guide','دليل الخدمات'),href:'#guide'},{label:t('Contact us','تواصل معنا'),href:'#contact'}]}]);
    const legalLinks=JSON.stringify([{label:t('Privacy policy','سياسة الخصوصية'),href:'#privacy'},{label:t('Accessibility','إمكانية الوصول'),href:'#accessibility'}]);
    const description=t('Find services, track requests and get support in one place.','تعرّف على الخدمات، وتابع طلباتك، واحصل على الدعم من مكان واحد.'),support=t('Help and contact','المساعدة والتواصل'),help=t('Help centre','مركز المساعدة'),legal=t('Example platform · 2026','منصة توضيحية · 2026'),policies=t('Policies and accessibility','السياسات وإمكانية الوصول');
    react=`<PortalFooter brand={<span className="nq-portal-footer-wordmark" role="img" aria-label="نسق" />} description="${description}" groups={${groups}} legalLinks={${legalLinks}} legalLinksLabel="${policies}" legal="${legal}" supportLabel="${support}" support={<div className="nq-portal-footer-actions"><a className="nq-button" data-variant="outline-white" href="#help">${help}</a></div>} />`;
    vue=`<PortalFooter description="${description}" :groups='${groups}' :legal-links='${legalLinks}' legal-links-label="${policies}" copyright="${legal}" support-label="${support}"><template #logo><span class="nq-portal-footer-wordmark" role="img" aria-label="نسق"></span></template><template #support><div class="nq-portal-footer-actions"><a class="nq-button" data-variant="outline-white" href="#help">${help}</a></div></template></PortalFooter>`;
    angularMember=`\n  groups = ${groups};\n  policies = ${legalLinks};`;
    angular=`<nq-portal-footer description="${description}" [groups]="groups" [legalLinks]="policies" legalLinksLabel="${policies}" copyright="${legal}" supportLabel="${support}"><span nqFooterBrand class="nq-portal-footer-wordmark" role="img" aria-label="نسق"></span><div nqFooterSupport class="nq-portal-footer-actions"><a class="nq-button" data-variant="outline-white" href="#help">${help}</a></div></nq-portal-footer>`;
  } else if (id === "button") {
    state = true;
    react = `<Button onClick={() => setValue(value + '!')}>${t("Click me", "اضغط هنا")}</Button><output>{value}</output>`;
    vue = `<Button @click="value += '!'">${t("Click me", "اضغط هنا")}</Button><output>{{ value }}</output>`;
    angular = `<button nqButton type="button" (click)="value = value + '!'">${t("Click me", "اضغط هنا")}</button><output>{{ value }}</output>`;
  } else if (id === "icon-button") {
    state = true; initialValue = "'saved'";
    const svg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></svg>';
    react = `<div className="nq-stack"><div className="nq-cluster">${iconButtonCases.map(item=>`<IconButton label="${iconButtonLabel(locale,item.key)}" size="${item.size}" shape="${item.shape}" ${item.key==='standard'?'':`variant="${item.variant}"`} ${item.key==='selected'?"aria-pressed={value === 'saved'}":'pressed' in item?'aria-pressed={true}':''} ${'disabled' in item?'disabled':''} ${'loading' in item?'loading':''} onClick={()=>setValue(${item.key==='selected'?"value === 'saved' ? '' : 'saved'":"'search'"})}>${item.key==='small'?svg:'<span className="nq-icon" data-icon="search-01" />'}</IconButton>`).join('')}</div><output>{value}</output>${iconBackgroundMarkup().replaceAll('class=','className=')}</div>`;
    vue = `<div class="nq-stack"><div class="nq-cluster">${iconButtonCases.map(item=>`<IconButton label="${iconButtonLabel(locale,item.key)}" size="${item.size}" shape="${item.shape}" ${item.key==='standard'?'':`variant="${item.variant}"`} ${item.key==='selected'?`:aria-pressed="value === 'saved'"`:'pressed' in item?':aria-pressed="true"':''} ${'disabled' in item?'disabled':''} ${'loading' in item?'loading':''} @click="value=${item.key==='selected'?"value === 'saved' ? '' : 'saved'":"'search'"}">${item.key==='small'?svg:'<span class="nq-icon" data-icon="search-01" />'}</IconButton>`).join('')}</div><output>{{ value }}</output>${iconBackgroundMarkup()}</div>`;
    angular = `<div class="nq-stack"><div class="nq-cluster">${iconButtonCases.map(item=>`<nq-icon-button label="${iconButtonLabel(locale,item.key)}" size="${item.size}" shape="${item.shape}" ${item.key==='standard'?'':`variant="${item.variant}"`} ${item.key==='selected'?`[pressed]="value === 'saved'"`:'pressed' in item?'[pressed]="true"':''} ${'disabled' in item?'disabled':''} ${'loading' in item?'loading':''} (activated)="value=${item.key==='selected'?"value === 'saved' ? '' : 'saved'":"'search'"}">${item.key==='small'?svg:'<span class="nq-icon" data-icon="search-01"></span>'}</nq-icon-button>`).join('')}</div><output>{{ value }}</output>${iconBackgroundMarkup()}</div>`;
  } else if (["text-field", "textarea"].includes(id)) {
    state = true;
    react = `<${component} label="${label}" value={value} onChange={event => setValue(event.currentTarget.value)} /><output>{value}</output>`;
    vue = `<${component} label="${label}" v-model="value" /><output>{{ value }}</output>`;
    angular = `<nq-${id} label="${label}" [(value)]="value" /><output>{{ value }}</output>`;
  } else if (["checkbox", "switch"].includes(id)) {
    state = true;
    booleanState = true;
    react = `<${component} label="${label}" checked={value} onChange={event => setValue(event.currentTarget.checked)} /><output>{String(value)}</output>`;
    vue = `<${component} label="${label}" v-model="value" /><output>{{ value }}</output>`;
    angular = `<nq-${id} label="${label}" [(value)]="value" /><output>{{ value }}</output>`;
  } else if (id === "toggle-group") {
    state = true;
    const choices=JSON.stringify([{value:'first',label:t('First','الأول')},{value:'second',label:t('Second','الثاني')},{value:'blocked',label:t('Unavailable','غير متاح'),disabled:true}]);
    react = `<div className="nq-stack"><ToggleGroup label="${label}" options={${choices}} value={value} onValueChange={setValue} /><output>{value}</output><ToggleGroup label="${t('Multiple choices','اختيارات متعددة')}" options={${choices}} multiple defaultValue={['first']} /><ToggleGroup label="${t('Read only','للقراءة فقط')}" options={${choices}} defaultValue="first" readOnly /><ToggleGroup label="${t('Disabled','معطل')}" options={${choices}} defaultValue="first" disabled /><ToggleGroup label="${t('Outlined','محدد بإطار')}" options={${choices}} defaultValue="first" variant="outline" /><ToggleGroup label="${t('Read-only multiple','اختيارات متعددة للقراءة فقط')}" options={${choices}} multiple defaultValue={['first']} variant="outline" readOnly /></div>`;
    vue = `<div class="nq-stack"><ToggleGroup label="${label}" :options='${choices}' v-model="value" /><output>{{ value }}</output><ToggleGroup label="${t('Multiple choices','اختيارات متعددة')}" :options='${choices}' multiple :default-value="['first']" /><ToggleGroup label="${t('Read only','للقراءة فقط')}" :options='${choices}' default-value="first" readonly /><ToggleGroup label="${t('Disabled','معطل')}" :options='${choices}' default-value="first" disabled /><ToggleGroup label="${t('Outlined','محدد بإطار')}" :options='${choices}' default-value="first" variant="outline" /><ToggleGroup label="${t('Read-only multiple','اختيارات متعددة للقراءة فقط')}" :options='${choices}' multiple :default-value="['first']" variant="outline" readonly /></div>`;
    angular = `<div class="nq-stack"><nq-toggle-group label="${label}" [options]="options" [(value)]="value" /><output>{{ value }}</output><nq-toggle-group label="${t('Multiple choices','اختيارات متعددة')}" [options]="options" [multiple]="true" [value]="['first']" /><nq-toggle-group label="${t('Read only','للقراءة فقط')}" [options]="options" value="first" [readOnly]="true" /><nq-toggle-group label="${t('Disabled','معطل')}" [options]="options" value="first" [disabled]="true" /><nq-toggle-group label="${t('Outlined','محدد بإطار')}" [options]="options" value="first" variant="outline" /><nq-toggle-group label="${t('Read-only multiple','اختيارات متعددة للقراءة فقط')}" [options]="options" [multiple]="true" [value]="['first']" variant="outline" [readOnly]="true" /></div>`;
    angularMember = `\n  options = ${choices};`;
  } else if (id === "button-group") {
    state=true;
    react=`<div className="nq-stack">${['horizontal','vertical'].map(orientation=>`<ButtonGroup label="${label}" variant="attached" orientation="${orientation}"><IconButton label="${t('Search','بحث')}" variant="secondary" onClick={()=>setValue('search')}><span className="nq-icon" data-icon="search-01" aria-hidden="true" /></IconButton><Button variant="secondary" onClick={()=>setValue('preview')}>${t('Preview','معاينة')}</Button><Button variant="secondary" disabled>${t('Delete','حذف')}</Button></ButtonGroup>`).join('')}<output>{value}</output></div>`;
    vue=`<div class="nq-stack">${['horizontal','vertical'].map(orientation=>`<ButtonGroup label="${label}" variant="attached" orientation="${orientation}"><IconButton label="${t('Search','بحث')}" variant="secondary" @click="value='search'"><span class="nq-icon" data-icon="search-01" aria-hidden="true" /></IconButton><Button variant="secondary" @click="value='preview'">${t('Preview','معاينة')}</Button><Button variant="secondary" disabled>${t('Delete','حذف')}</Button></ButtonGroup>`).join('')}<output>{{ value }}</output></div>`;
    angular=`<div class="nq-stack">${['horizontal','vertical'].map(orientation=>`<nq-button-group label="${label}" variant="attached" orientation="${orientation}"><nq-icon-button label="${t('Search','بحث')}" variant="secondary" (activated)="value='search'"><span class="nq-icon" data-icon="search-01" aria-hidden="true"></span></nq-icon-button><button nqButton variant="secondary" (click)="value='preview'">${t('Preview','معاينة')}</button><button nqButton variant="secondary" disabled>${t('Delete','حذف')}</button></nq-button-group>`).join('')}<output>{{ value }}</output></div>`;
  } else if (id === "select") {
    state = true;
    initialValue = "'first'";
    const cases = selectDemoCases(locale).map(example => ({ ...example, ...selectNativeMarkup(example, example.kind === 'single') }));
    react = cases.map(example => `<section className="nq-stack" data-select-demo="${example.kind}"><h2>${example.title}</h2>${example.react}${example.kind === 'single' ? '<output>{value}</output>' : ''}</section>`).join('\n');
    vue = cases.map(example => `<section class="nq-stack" data-select-demo="${example.kind}"><h2>${example.title}</h2>${example.vue}${example.kind === 'single' ? '<output>{{ value }}</output>' : ''}</section>`).join('\n');
    angular = cases.map(example => `<section class="nq-stack" data-select-demo="${example.kind}"><h2>${example.title}</h2>${example.angular}${example.kind === 'single' ? '<output>{{ value }}</output>' : ''}</section>`).join('\n');
  } else if (id === "radio") {
    state = true;
    initialValue = "'first'";
    react = `<fieldset><legend>${label}</legend>{${options}.map(option => <Radio key={option.value} name="choice" label={option.label} value={option.value} checked={value === option.value} onChange={event => setValue(event.currentTarget.value)} />)}</fieldset><output>{value}</output>`;
    vue = `<fieldset><legend>${label}</legend><Radio v-for='option in ${options}' :key="option.value" name="choice" :label="option.label" :value="option.value" v-model="value" /></fieldset><output>{{ value }}</output>`;
    angular = `<nq-radio label="${label}" name="choice" [options]="options" [(value)]="value" /><output>{{ value }}</output>`;
    angularMember = `\n  options = ${options};`;
  } else if (id === "card") {
    const title = t("Service details", "تفاصيل الخدمة"),
      description = t(
        "Review the requirements before applying.",
        "راجع المتطلبات قبل التقديم.",
      );
    react = `<Card variant="outlined" header={<h2 className="nq-card-title">${title}</h2>} footer={<span>${t("Available online", "متاحة إلكترونياً")}</span>}><p className="nq-card-description">${description}</p></Card>`;
    vue = `<Card variant="outlined"><template #header><h2 class="nq-card-title">${title}</h2></template><p class="nq-card-description">${description}</p><template #footer>${t("Available online", "متاحة إلكترونياً")}</template></Card>`;
    angular = `<nq-card variant="outlined"><h2 nqCardHeader class="nq-card-title">${title}</h2><p class="nq-card-description">${description}</p><span nqCardFooter>${t("Available online", "متاحة إلكترونياً")}</span></nq-card>`;
  } else if (id === "accordion") {
    state = true;
    const items = [
      {
        value: "first",
        title: t("Requirements", "المتطلبات"),
        content: t(
          "Prepare the required documents.",
          "جهز المستندات المطلوبة.",
        ),
      },
      {
        value: "second",
        title: t("Processing time", "مدة المعالجة"),
        content: t("3 working days", "3 أيام عمل"),
      },
    ];
    react = `<Accordion exclusive items={${JSON.stringify(items)}.map(item => ({...item, onOpenChange: open => setValue(item.value + ':' + open)}))} /><output>{value}</output>`;
    vue = `<Accordion exclusive :items='${JSON.stringify(items)}' @toggle="(item, open) => value = item + ':' + open" /><output>{{ value }}</output>`;
    angular = `<nq-accordion exclusive [items]="items" (toggled)="value = $event.id + ':' + $event.open" /><output>{{ value }}</output>`;
    angularMember = `\n  items = ${JSON.stringify(items.map(({ value, ...item }) => ({ id: value, ...item })))};`;
  } else if (id === "table") {
    const caption = t("Applications", "الطلبات"),
      heading = t("Reference", "المرجع"),
      status = t("Status", "الحالة");
    const rows = JSON.stringify([
      { reference: "NQ-101", status: t("Submitted", "مقدم") },
      { reference: "NQ-102", status: t("Draft", "مسودة") },
    ]);
    react = `<Table caption="${caption}" rows={${rows}} rowKey={row => row.reference} columns={[{key:'reference',header:'${heading}',rowHeader:true,cell:row => row.reference},{key:'status',header:'${status}',cell:row => row.status}]} />`;
    vue = `<Table caption="${caption}" :rows='${rows}' :columns='${JSON.stringify(
      [
        { key: "reference", header: heading, rowHeader: true },
        { key: "status", header: status },
      ],
    )}' />`;
    angular = `<nq-table caption="${caption}" [rows]="rows" [columns]="columns" />`;
    angularMember = `\n  rows = ${rows};\n  columns = ${JSON.stringify([
      { key: "reference", label: heading, rowHeader: true },
      { key: "status", label: status },
    ])};`;
  } else if (id === "data-table") {
    state = true;
    const caption = t("Requests · select a heading to sort", "الطلبات · اختر عنوانًا للترتيب");
    const empty = t("No records", "لا توجد سجلات");
    const columns = JSON.stringify([
      {key: "name", label: t("Service", "الخدمة"), sortable: true, rowHeader: true},
      {key: "days", label: t("Days", "الأيام"), sortable: true},
    ]);
    const rows = JSON.stringify([
      {name: t("License", "الرخصة"), days: 3},
      {name: t("Certificate", "الشهادة"), days: 1},
      {name: t("Permit", "التصريح"), days: 5},
    ]);
    react = `<DataTable caption="${caption}" variant="striped" columns={${columns}} rows={${rows}} locale="${locale}" rowKey={row => row.name} onSortChange={sort => setValue(sort.direction)} /><output>{value}</output><DataTable caption="${t("Empty results", "نتائج فارغة")}" columns={${columns}} rows={[]} emptyMessage="${empty}" />`;
    vue = `<DataTable caption="${caption}" variant="striped" :columns='${columns}' :rows='${rows}' locale="${locale}" :sort-label="(column, direction) => column.label + ': ' + (direction === 'ascending' ? '${t("ascending", "تصاعدي")}' : '${t("descending", "تنازلي")}')" @update:sort-direction="value = $event" /><output>{{ value }}</output><DataTable caption="${t("Empty results", "نتائج فارغة")}" :columns='${columns}' :rows="[]" empty-message="${empty}" />`;
    angular = `<nq-data-table caption="${caption}" variant="striped" [columns]="columns" [rows]="rows" locale="${locale}" (sortChange)="value = $event.direction" /><output>{{ value }}</output><nq-data-table caption="${t("Empty results", "نتائج فارغة")}" [columns]="columns" [rows]="[]" emptyMessage="${empty}" />`;
    angularMember = `\n  columns = ${columns};\n  rows = ${rows};`;
  } else if (id === "breadcrumb") {
    const items = JSON.stringify([
      { label: t("Home", "الرئيسية"), href: "#home" },
      { label: t("Services", "الخدمات"), href: "#services" },
      { label: t("Application", "الطلب") },
    ]);
    react = `<Breadcrumb label="${t("Breadcrumb", "مسار التنقل")}" items={${items}} />`;
    vue = `<Breadcrumb label="${t("Breadcrumb", "مسار التنقل")}" :items='${items}' />`;
    angular = `<nq-breadcrumb label="${t("Breadcrumb", "مسار التنقل")}" [items]="items" />`;
    angularMember = `\n  items = ${items};`;
  } else if (id === "pagination") {
    state = numberState = true; initialValue = "1";
    const cases = paginationDemoCases(locale).map(item => ({...item, ...paginationNativeMarkup(locale,item.kind,item.kind==='first')}));
    react = cases.map(item => `<section className="nq-stack"><h2>${item.title}</h2>${item.react}${item.kind==='first'?'<output>{value}</output>':''}</section>`).join('');
    vue = cases.map(item => `<section class="nq-stack"><h2>${item.title}</h2>${item.vue}${item.kind==='first'?'<output>{{value}}</output>':''}</section>`).join('');
    angular = cases.map(item => `<section class="nq-stack"><h2>${item.title}</h2>${item.angular}${item.kind==='first'?'<output>{{value}}</output>':''}</section>`).join('');
    angularMember = cases[0]!.angularMember;
  } else if (id === "stepper") {
    state = numberState = true;
    initialValue = "1";
    const steps = [
      { value: "details", label: t("Details", "البيانات") },
      { value: "review", label: t("Review", "المراجعة") },
      { value: "done", label: t("Complete", "الإكمال") },
    ];
    react = `<Stepper label="${t("Progress", "التقدم")}" items={${JSON.stringify(steps)}} activeIndex={value} /><button type="button" className="nq-button" onClick={() => setValue((value + 1) % 4)}>${t("Next step", "الخطوة التالية")}</button><output>{value}</output>`;
    vue = `<Stepper label="${t("Progress", "التقدم")}" :items='${JSON.stringify(steps)}' :active-index="value" /><button type="button" class="nq-button" @click="value = (value + 1) % 4">${t("Next step", "الخطوة التالية")}</button><output>{{ value }}</output>`;
    angular = `<nq-stepper label="${t("Progress", "التقدم")}" [steps]="steps" [activeIndex]="value" /><button type="button" class="nq-button" (click)="value = (value + 1) % 4">${t("Next step", "الخطوة التالية")}</button><output>{{ value }}</output>`;
    angularMember = `\n  steps = ${JSON.stringify(steps.map(({ label }) => ({ label })))};`;
  } else if (id === "tabs") {
    state = true;
    initialValue = "'first'";
    const cases=tabsDemoCases(locale).map(item=>({...item,...tabsNativeMarkup(locale,item.kind,item.kind==='basic')}));
    react=cases.map(item=>`<section className="nq-stack" data-tabs-demo="${item.kind}"><h2>${item.title}</h2>${item.react}${item.kind==='basic'?'<output>{value}</output>':''}</section>`).join('');
    vue=cases.map(item=>`<section class="nq-stack" data-tabs-demo="${item.kind}"><h2>${item.title}</h2>${item.vue}${item.kind==='basic'?'<output>{{value}}</output>':''}</section>`).join('');
    angular=cases.map(item=>`<section class="nq-stack" data-tabs-demo="${item.kind}"><h2>${item.title}</h2>${item.angular}${item.kind==='basic'?'<output>{{value}}</output>':''}</section>`).join('');
  } else if (id === "progress") {
    react = `<Progress label="${t("Upload progress", "تقدم الرفع")}" value={65} max={100} />`;
    vue = `<Progress label="${t("Upload progress", "تقدم الرفع")}" :value="65" :max="100" />`;
    angular = `<nq-progress label="${t("Upload progress", "تقدم الرفع")}" [value]="65" [max]="100" />`;
  } else if (id === "skeleton") {
    react = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><Skeleton style={{width:'100%',height:'4rem'}} /></div>`;
    vue = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><Skeleton style="width:100%;height:4rem" /></div>`;
    angular = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><nq-skeleton width="100%" height="4rem" /></div>`;
  } else if (id === "rating") {
    state = true; numberState = true; initialValue = "4";
    const cases = ratingDemoCases(locale).map(item => ({...item, ...ratingNativeMarkup(locale,item.kind,item.kind==='selected')}));
    react = cases.map(item => `<section className="nq-stack"><h2>${item.title}</h2>${item.react}${item.kind==='selected'?'<output>{value}</output>':''}</section>`).join('');
    vue = cases.map(item => `<section class="nq-stack"><h2>${item.title}</h2>${item.vue}${item.kind==='selected'?'<output>{{value}}</output>':''}</section>`).join('');
    angular = cases.map(item => `<section class="nq-stack"><h2>${item.title}</h2>${item.angular}${item.kind==='selected'?'<output>{{value}}</output>':''}</section>`).join('');
    angularMember = cases[0]!.angularMember;
  } else if (id === "carousel") {
    state = true; numberState = true; initialValue = "0";
    const cases = carouselDemoCases(locale).map(item => ({...item, ...carouselNativeMarkup(locale,item.kind,item.kind==='bounded')}));
    react = cases.map(item => `<section className="nq-stack"><h2>${item.title}</h2>${item.react}${item.kind==='bounded'?'<output>{value}</output>':''}</section>`).join('');
    vue = cases.map(item => `<section class="nq-stack"><h2>${item.title}</h2>${item.vue}${item.kind==='bounded'?'<output>{{value}}</output>':''}</section>`).join('');
    angular = cases.map(item => `<section class="nq-stack"><h2>${item.title}</h2>${item.angular}${item.kind==='bounded'?'<output>{{value}}</output>':''}</section>`).join('');
    angularMember = cases[0]!.angularMember;
  } else if (id === "avatar") {
    react = `<div className="nq-cluster">${avatarDemoCases(locale).map(item=>`<div className="nq-stack"><Avatar ${avatarDemoProps(item)} /><span>${item.title}</span></div>`).join('')}</div>`;
    vue = react.replaceAll('className=','class=');
    angular = vue.replaceAll('<Avatar ','<nq-avatar ');
  } else if (id === "empty") {
    react = `<EmptyState title="${t("No applications", "لا توجد طلبات")}" description="${t("Your applications will appear here.", "ستظهر طلباتك هنا.")}" />`;
    vue = react;
    angular = `<nq-empty-state title="${t("No applications", "لا توجد طلبات")}" description="${t("Your applications will appear here.", "ستظهر طلباتك هنا.")}" />`;
  } else if (id === "link") {
    const text=t("Read the guide", "اقرأ الدليل"),neutral=t("Explore services","استكشف الخدمات"),unavailable=t("Unavailable destination","وجهة غير متاحة");
    react = `<div className="nq-stack"><Link href="#guide">${text}</Link><Link href="#services" variant="neutral">${neutral}</Link><Link href="#details" variant="standalone">${text}<span className="nq-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true" /></Link><Link href="#unavailable" disabled>${unavailable}</Link></div>`;
    vue = `<div class="nq-stack"><Link href="#guide">${text}</Link><Link href="#services" variant="neutral">${neutral}</Link><Link href="#details" variant="standalone">${text}<span class="nq-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true" /></Link><Link href="#unavailable" disabled>${unavailable}</Link></div>`;
    angular = `<div class="nq-stack"><nq-link href="#guide">${text}</nq-link><nq-link href="#services" variant="neutral">${neutral}</nq-link><nq-link href="#details" variant="standalone">${text}<span class="nq-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true"></span></nq-link><nq-link href="#unavailable" [disabled]="true">${unavailable}</nq-link></div>`;
  } else if (id === "feedback") {
    state = true;
    const question = t("Was this page helpful?", "هل كانت هذه الصفحة مفيدة؟"),
      yes = t("Yes", "نعم"),
      no = t("No", "لا"),
      comment = t("Tell us more", "أخبرنا بالمزيد"),
      submit = t("Send feedback", "إرسال التقييم"),
      thanks = t("Thank you for your feedback.", "شكراً على تقييمك.");
    react =
      (["text", "icon-text", "icon"] as const)
        .map(
          (variant) =>
            `<Feedback label="${question}" choiceVariant="${variant}" yesLabel="${yes}" noLabel="${no}" commentLabel="${comment}" submitLabel="${submit}" successMessage="${thanks}" onValueChange={feedback => setValue(feedback.helpful)} onFeedback={feedback => console.log(feedback)} />`,
        )
        .join("") + "<output>{value}</output>";
    vue =
      (["text", "icon-text", "icon"] as const)
        .map(
          (variant) =>
            `<Feedback label="${question}" choice-variant="${variant}" yes-label="${yes}" no-label="${no}" comment-label="${comment}" submit-label="${submit}" thanks="${thanks}" @update:model-value="value = $event" @submit="feedback => console.log(feedback)" />`,
        )
        .join("") + "<output>{{ value }}</output>";
    angular =
      (["text", "icon-text", "icon"] as const)
        .map(
          (variant) =>
            `<nq-feedback label="${question}" choiceVariant="${variant}" positiveLabel="${yes}" negativeLabel="${no}" thanksMessage="${thanks}" (valueChange)="value = $event ? 'yes' : 'no'" />`,
        )
        .join("") + "<output>{{ value }}</output>";
  } else if (id === "badge") {
    const statuses = [
      { tone: "neutral", text: t("Scheduled", "مجدول") },
      { tone: "info", text: t("In progress", "قيد التنفيذ") },
      { tone: "success", text: t("Complete", "مكتمل") },
      { tone: "warning", text: t("Needs review", "يحتاج إلى مراجعة") },
      { tone: "danger", text: t("Unable to send", "تعذّر الإرسال") },
    ];
    react = (["soft", "outline", "dot"] as const).map(variant =>
      `<section className="nq-stack"><h2>${variant === "soft" ? t("Badges", "الشارات") : variant === "outline" ? t("Outlined badges", "شارات بإطار") : t("Status labels", "تسميات الحالة")}</h2><div className="nq-cluster nq-badges">${statuses.map(status => `<Badge tone="${status.tone}" variant="${variant}">${status.text}</Badge>`).join("")}</div></section>`,
    ).join("");
    vue = react.replaceAll("className=", "class=");
    angular = vue.replaceAll("<Badge ", "<nq-badge ").replaceAll("</Badge>", "</nq-badge>");
  } else if (id === "alert") {
    react = `<Alert tone="success" title="${label}"><p>${t("Saved successfully", "تم الحفظ بنجاح")}</p></Alert>`;
    vue = react;
    angular = `<nq-alert tone="success" title="${label}"><p>${t("Saved successfully", "تم الحفظ بنجاح")}</p></nq-alert>`;
  } else if (id === "divider") {
    react = dividerProjectMarkup(locale, "react");
    vue = dividerProjectMarkup(locale, "vue");
    angular = dividerProjectMarkup(locale, "angular");
  } else {
    react = `<Spinner label="${t("Loading", "جارٍ التحميل")}" />`;
    vue = react;
    angular = `<nq-spinner label="${t("Loading", "جارٍ التحميل")}" />`;
  }
  const initial =
    initialValue ??
    (booleanState ? "false" : id === "toggle-group" ? "'first'" : "''");
  const stateType = basicInput?.stateType ?? (booleanState
    ? "boolean"
    : numberState
      ? "number"
      : "string");
  if (framework === "react")
    return {
      names: {
        html: `App.${typed ? "tsx" : "jsx"}`,
        css: "style.css",
        js: `main.${typed ? "tsx" : "jsx"}`,
      },
      entry: `main.${typed ? "tsx" : "jsx"}`,
      host: '<div id="app"></div>',
      files: {
        css,
        html: `${state ? "import { useState } from 'react';\n" : ""}import { ${componentImports} } from '@nasaq/react';\n\n${contentRecipe?.reactDeclarations ? contentRecipe.reactDeclarations + '\n\n' : ''}export default function App() {\n${state ? `  const [value, setValue] = useState${typed ? `<${stateType}>` : ""}(${initial});\n` : ""}  return <${wrapperTag} className="demo"${layoutMarker} lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${react}</${wrapperTag}>;\n}\n`,
        js: `import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\nconst root = document.getElementById('app');\nif (!root) throw new Error('Missing app root');\ncreateRoot(root).render(<App />);\n`,
      },
    };
  if (framework === "vue")
    return {
      names: { html: "App.vue", css: "style.css", js: `main.${ext}` },
      entry: `main.${ext}`,
      host: '<div id="app"></div>',
      files: {
        css,
        html: `<script setup${typed ? ' lang="ts"' : ""}>\n${state ? "import { ref } from 'vue';\n" : ""}import { ${componentImports} } from '@nasaq/vue';\n${state ? `const value = ref${typed ? `<${id === "toggle-group" ? "string | readonly string[]" : stateType}>` : ""}(${initial});\n` : ""}${contentRecipe?.vueDeclarations ? contentRecipe.vueDeclarations + "\n" : ""}</script>\n\n<template>\n  <${wrapperTag} class="demo"${layoutMarker} lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${vue}</${wrapperTag}>\n</template>\n`,
        js: `import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n`,
      },
    };
  const angularClass = basicInput?.angularImports ?? `Nq${component}${id === "button" ? "Directive" : "Component"}${id === "button-group" ? ", NqButtonDirective, NqIconButtonComponent" : id === "rating" ? ", NqRatingDisplayComponent" : id === "tabs" ? ", NqTabComponent" : id === "site-verification" ? ", NqPortalHeaderComponent" : id === "portal-header" ? ", NqSiteVerificationComponent" : ""}`;
  return {
    names: { html: "app.component.ts", css: "style.css", js: "main.ts" },
    entry: "main.ts",
    host: "<app-root></app-root>",
    files: {
      css,
      html: `import { Component } from '@angular/core';\nimport { ${angularClass} } from '@nasaq/angular';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [${angularClass}],\n  template: \`<${wrapperTag} class="demo"${layoutMarker} lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${angular}</${wrapperTag}>\`,\n})\nexport class AppComponent {${state ? `\n  value: ${basicInput?.angularStateType ?? (id === "toggle-group" ? "string | string[]" : stateType)} = ${initial};` : ""}${angularMember}\n}\n`,
      js: "import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n",
    },
  };
}
