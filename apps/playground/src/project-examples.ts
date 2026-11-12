import { buttonGroupDemo, buttonGroupMarkup } from './button-group-demo';
import {cardActionMarkup} from './card-action-demo.ts';
import {isServicePatternId, servicePatternIds, servicePatternProject} from './service-pattern-projects.ts';
import {dividerProjectMarkup} from './divider-demo.ts';
import {isPortalShellId, portalShellIds, portalShellProject} from './portal-shell-projects.ts';
import {disclosureProjectIds, disclosureProjectRecipe, isDisclosureProjectId} from './disclosure-projects.ts';
import {siteVerificationMarkup,siteVerificationTextAttributes} from './site-verification-demo.ts';
import {portalHeaderTexts,portalTexts,textAttributes} from './project-texts.ts';
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
    "@import '@hawiyah/styles/styles.css';\n\n/* Application-specific styles */\n.demo { display: grid; gap: 1rem; }\n" + (isLayoutId(id) ? layoutProjectCss : "");
  if (id === "content-navigation") html=contentNavigationDemoCases(locale).map(item=>`<section><h2>${item.title}</h2>${contentNavigationDemoMarkup(locale,item.kind,`project-content-nav-${item.kind}`)}</section>`).join('');
  const contentRecipe = isContentProjectId(id) ? contentProjectRecipe(id, locale, typed) : undefined;
  const basicInput = isBasicInputId(id) ? basicInputProjectRecipe(id, locale) : undefined;
  const disclosure = isDisclosureProjectId(id) ? disclosureProjectRecipe(id, locale, typed) : undefined;
  const recipe = disclosure ?? basicInput ?? contentRecipe;
  if (recipe) html = recipe.vanilla;
  let vanillaExampleScript = recipe?.vanillaScript ?? '';
  if (id === 'select' && framework === 'vanilla') {
    html = selectDemoCases(locale).map(example => `<section class="hw-stack"><h2>${example.title}</h2>${selectDemoMarkup(example, 'project-region')}${example.kind === 'single' ? '<output data-select-value>first</output>' : ''}</section>`).join('\n');
    vanillaExampleScript = `\nconst region = root.querySelector('[data-select-demo="single"] select');\nconst selectedValue = root.querySelector('[data-select-value]');\nif (region instanceof HTMLSelectElement && selectedValue instanceof HTMLOutputElement) {\n  const displayValue = () => { selectedValue.value = region.value; };\n  region.addEventListener('change', displayValue);\n  window.addEventListener('pagehide', () => region.removeEventListener('change', displayValue), { once: true });\n}\n`;
  }
  if (id === "button-group") {
    html = buttonGroupMarkup(locale, { values: true, pretty: true });
    vanillaExampleScript = typed
      ? `\nconst chosen = root.querySelector<HTMLOutputElement>('[data-button-group-value]');\nconst choose = (event: Event) => {\n  const button = (event.target as Element | null)?.closest<HTMLElement>('.hw-button-group [data-value]');\n  if (button && chosen) chosen.value = button.dataset.value ?? '';\n};\nroot.addEventListener('click', choose);\nwindow.addEventListener('pagehide', () => root.removeEventListener('click', choose), { once: true });\n`
      : `\nconst chosen = root.querySelector('[data-button-group-value]');\nconst choose = event => {\n  const button = event.target.closest('.hw-button-group [data-value]');\n  if (button && chosen) chosen.value = button.dataset.value ?? '';\n};\nroot.addEventListener('click', choose);\nwindow.addEventListener('pagehide', () => root.removeEventListener('click', choose), { once: true });\n`;
  }
  if (id === "portal-header") html = `<div class="hw-portal-masthead">${siteVerificationMarkup(locale)}${portalMenuMarkup(locale)}</div>`;
  if (id === "divider") html = dividerProjectMarkup(locale, "vanilla");
  if (id === "card") html = cardActionMarkup(locale, "vanilla");
  if (id === "icon-button") html += iconBackgroundMarkup();
  if (framework === "vanilla")
    return {
      names: { html: "index.html", css: "style.css", js: `main.${ext}` },
      entry: `main.${ext}`,
      host: "",
      files: {
        html: `<!doctype html>\n<html lang="${locale}" dir="${ar ? "rtl" : "ltr"}">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hawiyah example</title></head>\n<body>\n<div id="app">\n${html}\n</div>\n<script type="module" src="./main.${ext}"></script>\n</body>\n</html>\n`,
        css,
        js: `import { enhance } from '@hawiyah/vanilla';\nimport './style.css';\n\nconst root = document.querySelector${typed ? "<HTMLElement>" : ""}('#app');\nif (!root) throw new Error('Missing app root');\nconst cleanup = enhance(root);\n${vanillaExampleScript}root.addEventListener('hw:change', event => console.log(${typed ? "(event as CustomEvent).detail" : "event.detail"}));\nwindow.addEventListener('pagehide', cleanup, { once: true });\n`,
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
    initialValue: string | undefined,
    customStateType: string | undefined;
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
    const brand=t('Example service portal','بوابة خدمات توضيحية');
    const links=JSON.stringify(id === 'portal-header' ? portalMenuItems(locale) : [{label:t('Services','الخدمات'),href:'#services',current:true},{label:t('Contact','تواصل معنا'),href:'#contact'}]);
    react=`<div className="hw-portal-masthead"><SiteVerification ${siteVerificationTextAttributes(locale,'react')} domain="example.test" registrationHref="#example-registration" open={value} onOpenChange={setValue} /><PortalHeader brand="${brand}" homeHref="#home" ${textAttributes(portalHeaderTexts(locale),'react')} links={${links}} /></div><output>{String(value)}</output>`;
    vue=`<div class="hw-portal-masthead"><SiteVerification ${siteVerificationTextAttributes(locale,'vue')} domain="example.test" registration-href="#example-registration" v-model:open="value" /><PortalHeader brand="${brand}" home-href="#home" ${textAttributes(portalHeaderTexts(locale),'vue')} :links='${links}' /></div><output>{{value}}</output>`;
    angularMember=`\n  links = ${links};`;
    angular=`<div class="hw-portal-masthead"><hw-site-verification ${siteVerificationTextAttributes(locale,'angular')} domain="example.test" registrationHref="#example-registration" [(open)]="value" /><hw-portal-header brand="${brand}" homeHref="#home" ${textAttributes(portalHeaderTexts(locale),'angular')} [links]="links" /></div><output>{{value}}</output>`;
  } else if (id === "portal-footer") {
    const groups=JSON.stringify([{title:t('Explore the platform','استكشف المنصة'),links:[{label:t('Services','الخدمات'),href:'#services'},{label:t('About us','عن المنصة'),href:'#about'}]},{title:t('Useful links','روابط مفيدة'),links:[{label:t('Service guide','دليل الخدمات'),href:'#guide'},{label:t('Contact us','تواصل معنا'),href:'#contact'}]}]);
    const legalLinks=JSON.stringify([{label:t('Privacy policy','سياسة الخصوصية'),href:'#privacy'},{label:t('Accessibility','إمكانية الوصول'),href:'#accessibility'}]);
    const description=t('Find services, track requests and get support in one place.','تعرّف على الخدمات، وتابع طلباتك، واحصل على الدعم من مكان واحد.'),support=t('Help and contact','المساعدة والتواصل'),help=t('Help centre','مركز المساعدة'),legal=t('Example platform · 2026','منصة توضيحية · 2026'),policies=t('Policies and accessibility','السياسات وإمكانية الوصول');
    react=`<PortalFooter brand={<span className="hw-portal-footer-wordmark" role="img" aria-label="هوية" />} description="${description}" groups={${groups}} legalLinks={${legalLinks}} legalLinksLabel="${policies}" legal="${legal}" supportLabel="${support}" externalLabel="${portalTexts(locale).externalLabel}" support={<div className="hw-portal-footer-actions"><a className="hw-button" data-variant="outline-white" href="#help">${help}</a></div>} />`;
    vue=`<PortalFooter description="${description}" :groups='${groups}' :legal-links='${legalLinks}' legal-links-label="${policies}" copyright="${legal}" support-label="${support}" external-label="${portalTexts(locale).externalLabel}"><template #brand><span class="hw-portal-footer-wordmark" role="img" aria-label="هوية"></span></template><template #support><div class="hw-portal-footer-actions"><a class="hw-button" data-variant="outline-white" href="#help">${help}</a></div></template></PortalFooter>`;
    angularMember=`\n  groups = ${groups};\n  policies = ${legalLinks};`;
    angular=`<hw-portal-footer description="${description}" [groups]="groups" [legalLinks]="policies" legalLinksLabel="${policies}" copyright="${legal}" supportLabel="${support}" externalLabel="${portalTexts(locale).externalLabel}"><span hwFooterBrand class="hw-portal-footer-wordmark" role="img" aria-label="هوية"></span><div hwFooterSupport class="hw-portal-footer-actions"><a class="hw-button" data-variant="outline-white" href="#help">${help}</a></div></hw-portal-footer>`;
  } else if (id === "button") {
    state = true;
    react = `<Button onClick={() => setValue(value + '!')}>${t("Click me", "اضغط هنا")}</Button><output>{value}</output>`;
    vue = `<Button @click="value += '!'">${t("Click me", "اضغط هنا")}</Button><output>{{ value }}</output>`;
    angular = `<button hwButton type="button" (click)="value = value + '!'">${t("Click me", "اضغط هنا")}</button><output>{{ value }}</output>`;
  } else if (id === "icon-button") {
    state = true; initialValue = "'saved'";
    react = `<div className="hw-stack"><div className="hw-cluster">${iconButtonCases.map(item=>`<IconButton label="${iconButtonLabel(locale,item.key)}" size="${item.size}" shape="${item.shape}" ${item.key==='standard'?'':`variant="${item.variant}"`} ${item.key==='selected'?"aria-pressed={value === 'saved'}":'pressed' in item?'aria-pressed={true}':''} ${'disabled' in item?'disabled':''} ${'loading' in item?'loading':''} onClick={()=>setValue(${item.key==='selected'?"value === 'saved' ? '' : 'saved'":"'search'"})}>${'<span className="hw-icon" data-icon="search-01" />'}</IconButton>`).join('')}</div><output>{value}</output>${iconBackgroundMarkup().replaceAll('class=','className=')}</div>`;
    vue = `<div class="hw-stack"><div class="hw-cluster">${iconButtonCases.map(item=>`<IconButton label="${iconButtonLabel(locale,item.key)}" size="${item.size}" shape="${item.shape}" ${item.key==='standard'?'':`variant="${item.variant}"`} ${item.key==='selected'?`:aria-pressed="value === 'saved'"`:'pressed' in item?':aria-pressed="true"':''} ${'disabled' in item?'disabled':''} ${'loading' in item?'loading':''} @click="value=${item.key==='selected'?"value === 'saved' ? '' : 'saved'":"'search'"}">${'<span class="hw-icon" data-icon="search-01" />'}</IconButton>`).join('')}</div><output>{{ value }}</output>${iconBackgroundMarkup()}</div>`;
    angular = `<div class="hw-stack"><div class="hw-cluster">${iconButtonCases.map(item=>`<hw-icon-button label="${iconButtonLabel(locale,item.key)}" size="${item.size}" shape="${item.shape}" ${item.key==='standard'?'':`variant="${item.variant}"`} ${item.key==='selected'?`[pressed]="value === 'saved'"`:'pressed' in item?'[pressed]="true"':''} ${'disabled' in item?'disabled':''} ${'loading' in item?'loading':''} (activated)="value=${item.key==='selected'?"value === 'saved' ? '' : 'saved'":"'search'"}">${'<span class="hw-icon" data-icon="search-01"></span>'}</hw-icon-button>`).join('')}</div><output>{{ value }}</output>${iconBackgroundMarkup()}</div>`;
  } else if (["text-field", "textarea"].includes(id)) {
    state = true;
    react = `<${component} label="${label}" value={value} onChange={event => setValue(event.currentTarget.value)} /><output>{value}</output>`;
    vue = `<${component} label="${label}" v-model="value" /><output>{{ value }}</output>`;
    angular = `<hw-${id} label="${label}" [(value)]="value" /><output>{{ value }}</output>`;
  } else if (["checkbox", "switch"].includes(id)) {
    state = true;
    booleanState = true;
    react = `<${component} label="${label}" checked={value} onChange={event => setValue(event.currentTarget.checked)} /><output>{String(value)}</output>`;
    vue = `<${component} label="${label}" v-model="value" /><output>{{ value }}</output>`;
    angular = `<hw-${id} label="${label}" [(value)]="value" /><output>{{ value }}</output>`;
  } else if (id === "toggle-group") {
    state = true;
    const choices=JSON.stringify([{value:'first',label:t('First','الأول')},{value:'second',label:t('Second','الثاني')},{value:'blocked',label:t('Unavailable','غير متاح'),disabled:true}]);
    react = `<div className="hw-stack"><ToggleGroup label="${label}" options={${choices}} value={value} onValueChange={setValue} /><output>{value}</output><ToggleGroup label="${t('Multiple choices','اختيارات متعددة')}" options={${choices}} multiple defaultValue={['first']} /><ToggleGroup label="${t('Read only','للقراءة فقط')}" options={${choices}} defaultValue="first" readOnly /><ToggleGroup label="${t('Disabled','معطل')}" options={${choices}} defaultValue="first" disabled /><ToggleGroup label="${t('Outlined','محدد بإطار')}" options={${choices}} defaultValue="first" variant="outline" /><ToggleGroup label="${t('Read-only multiple','اختيارات متعددة للقراءة فقط')}" options={${choices}} multiple defaultValue={['first']} variant="outline" readOnly /></div>`;
    vue = `<div class="hw-stack"><ToggleGroup label="${label}" :options='${choices}' v-model="value" /><output>{{ value }}</output><ToggleGroup label="${t('Multiple choices','اختيارات متعددة')}" :options='${choices}' multiple :default-value="['first']" /><ToggleGroup label="${t('Read only','للقراءة فقط')}" :options='${choices}' default-value="first" readonly /><ToggleGroup label="${t('Disabled','معطل')}" :options='${choices}' default-value="first" disabled /><ToggleGroup label="${t('Outlined','محدد بإطار')}" :options='${choices}' default-value="first" variant="outline" /><ToggleGroup label="${t('Read-only multiple','اختيارات متعددة للقراءة فقط')}" :options='${choices}' multiple :default-value="['first']" variant="outline" readonly /></div>`;
    angular = `<div class="hw-stack"><hw-toggle-group label="${label}" [options]="options" [(value)]="value" /><output>{{ value }}</output><hw-toggle-group label="${t('Multiple choices','اختيارات متعددة')}" [options]="options" [multiple]="true" [value]="['first']" /><hw-toggle-group label="${t('Read only','للقراءة فقط')}" [options]="options" value="first" [readOnly]="true" /><hw-toggle-group label="${t('Disabled','معطل')}" [options]="options" value="first" [disabled]="true" /><hw-toggle-group label="${t('Outlined','محدد بإطار')}" [options]="options" value="first" variant="outline" /><hw-toggle-group label="${t('Read-only multiple','اختيارات متعددة للقراءة فقط')}" [options]="options" [multiple]="true" [value]="['first']" variant="outline" [readOnly]="true" /></div>`;
    angularMember = `\n  options = ${choices};`;
  } else if (id === "button-group") {
    state=true;
    const groups = buttonGroupDemo(locale);
    react=`<div className="hw-stack">${groups.map(g=>`<ButtonGroup label="${g.label}" variant="attached" orientation="${g.orientation}"><IconButton label="${g.search}" variant="secondary" onClick={()=>setValue('search')}><span className="hw-icon" data-icon="search-01" aria-hidden="true" /></IconButton><Button variant="secondary" onClick={()=>setValue('preview')}>${g.preview}</Button><Button variant="secondary" disabled>${g.remove}</Button></ButtonGroup>`).join('')}<output>{value}</output></div>`;
    vue=`<div class="hw-stack">${groups.map(g=>`<ButtonGroup label="${g.label}" variant="attached" orientation="${g.orientation}"><IconButton label="${g.search}" variant="secondary" @click="value='search'"><span class="hw-icon" data-icon="search-01" aria-hidden="true" /></IconButton><Button variant="secondary" @click="value='preview'">${g.preview}</Button><Button variant="secondary" disabled>${g.remove}</Button></ButtonGroup>`).join('')}<output>{{ value }}</output></div>`;
    angular=`<div class="hw-stack">${groups.map(g=>`<hw-button-group label="${g.label}" variant="attached" orientation="${g.orientation}"><hw-icon-button label="${g.search}" variant="secondary" (activated)="value='search'"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></hw-icon-button><button hwButton variant="secondary" (click)="value='preview'">${g.preview}</button><button hwButton variant="secondary" disabled>${g.remove}</button></hw-button-group>`).join('')}<output>{{ value }}</output></div>`;
  } else if (id === "select") {
    state = true;
    initialValue = "'first'";
    const cases = selectDemoCases(locale).map(example => ({ ...example, ...selectNativeMarkup(example, example.kind === 'single') }));
    react = cases.map(example => `<section className="hw-stack" data-select-demo="${example.kind}"><h2>${example.title}</h2>${example.react}${example.kind === 'single' ? '<output>{value}</output>' : ''}</section>`).join('\n');
    vue = cases.map(example => `<section class="hw-stack" data-select-demo="${example.kind}"><h2>${example.title}</h2>${example.vue}${example.kind === 'single' ? '<output>{{ value }}</output>' : ''}</section>`).join('\n');
    angular = cases.map(example => `<section class="hw-stack" data-select-demo="${example.kind}"><h2>${example.title}</h2>${example.angular}${example.kind === 'single' ? '<output>{{ value }}</output>' : ''}</section>`).join('\n');
  } else if (id === "radio") {
    state = true;
    initialValue = "'first'";
    react = `<fieldset><legend>${label}</legend>{${options}.map(option => <Radio key={option.value} name="choice" label={option.label} value={option.value} checked={value === option.value} onChange={event => setValue(event.currentTarget.value)} />)}</fieldset><output>{value}</output>`;
    vue = `<fieldset><legend>${label}</legend><Radio v-for='option in ${options}' :key="option.value" name="choice" :label="option.label" :value="option.value" v-model="value" /></fieldset><output>{{ value }}</output>`;
    angular = `<hw-radio-group label="${label}" name="choice" [options]="options" [(value)]="value" /><output>{{ value }}</output>`;
    angularMember = `\n  options = ${options};`;
  } else if (id === "card") {
    react = cardActionMarkup(locale, 'react');
    vue = cardActionMarkup(locale, 'vue');
    angular = cardActionMarkup(locale, 'angular');
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
    vue = `<Accordion exclusive :items='${JSON.stringify(items)}' @toggle="(itemValue, open) => value = itemValue + ':' + open" /><output>{{ value }}</output>`;
    angular = `<hw-accordion exclusive [items]="items" (toggled)="value = $event.value + ':' + $event.open" /><output>{{ value }}</output>`;
    angularMember = `\n  items = ${JSON.stringify(items)};`;
  } else if (id === "table") {
    const caption = t("Applications", "الطلبات"),
      heading = t("Reference", "المرجع"),
      status = t("Status", "الحالة"),
      empty = t("No records", "لا توجد سجلات");
    const rows = JSON.stringify([
      { reference: "HW-101", status: t("Submitted", "مقدم") },
      { reference: "HW-102", status: t("Draft", "مسودة") },
    ]);
    react = `<Table caption="${caption}" emptyMessage="${empty}" rows={${rows}} rowKey={row => row.reference} columns={[{key:'reference',label:'${heading}',rowHeader:true,cell:row => row.reference},{key:'status',label:'${status}',cell:row => row.status}]} />`;
    vue = `<Table caption="${caption}" empty-message="${empty}" :rows='${rows}' :columns='${JSON.stringify(
      [
        { key: "reference", label: heading, rowHeader: true },
        { key: "status", label: status },
      ],
    )}' />`;
    angular = `<hw-table caption="${caption}" emptyMessage="${empty}" [rows]="rows" [columns]="columns" />`;
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
    const sortLabel = `(column, direction) => column.label + ': ' + (direction === 'ascending' ? '${t("ascending", "تصاعدي")}' : '${t("descending", "تنازلي")}')`;
    react = `<DataTable caption="${caption}" variant="striped" columns={${columns}} rows={${rows}} locale="${locale}" emptyMessage="${empty}" getSortLabel={${sortLabel}} rowKey={row => row.name} onSortDirectionChange={setValue} /><output>{value}</output><DataTable caption="${t("Empty results", "نتائج فارغة")}" columns={${columns}} rows={[]} locale="${locale}" emptyMessage="${empty}" />`;
    vue = `<DataTable caption="${caption}" variant="striped" :columns='${columns}' :rows='${rows}' locale="${locale}" empty-message="${empty}" :get-sort-label="${sortLabel}" @update:sort-direction="value = $event" /><output>{{ value }}</output><DataTable caption="${t("Empty results", "نتائج فارغة")}" :columns='${columns}' :rows="[]" locale="${locale}" empty-message="${empty}" />`;
    angular = `<hw-data-table caption="${caption}" variant="striped" [columns]="columns" [rows]="rows" locale="${locale}" emptyMessage="${empty}" [getSortLabel]="sortLabel" (sortDirectionChange)="value = $event" /><output>{{ value }}</output><hw-data-table caption="${t("Empty results", "نتائج فارغة")}" [columns]="columns" [rows]="[]" locale="${locale}" emptyMessage="${empty}" />`;
    angularMember = `\n  columns = ${columns};\n  rows = ${rows};\n  sortLabel = ${sortLabel.replace("(column, direction)", typed ? "(column: { label: string }, direction: 'ascending' | 'descending')" : "(column, direction)")};`;
  } else if (id === "breadcrumb") {
    const items = JSON.stringify([
      { label: t("Home", "الرئيسية"), href: "#home" },
      { label: t("Services", "الخدمات"), href: "#services" },
      { label: t("Application", "الطلب") },
    ]);
    react = `<Breadcrumb label="${t("Breadcrumb", "مسار التنقل")}" items={${items}} />`;
    vue = `<Breadcrumb label="${t("Breadcrumb", "مسار التنقل")}" :items='${items}' />`;
    angular = `<hw-breadcrumb label="${t("Breadcrumb", "مسار التنقل")}" [items]="items" />`;
    angularMember = `\n  items = ${items};`;
  } else if (id === "pagination") {
    state = numberState = true; initialValue = "1";
    const cases = paginationDemoCases(locale).map(item => ({...item, ...paginationNativeMarkup(locale,item.kind,item.kind==='first')}));
    react = cases.map(item => `<section className="hw-stack"><h2>${item.title}</h2>${item.react}${item.kind==='first'?'<output>{value}</output>':''}</section>`).join('');
    vue = cases.map(item => `<section class="hw-stack"><h2>${item.title}</h2>${item.vue}${item.kind==='first'?'<output>{{value}}</output>':''}</section>`).join('');
    angular = cases.map(item => `<section class="hw-stack"><h2>${item.title}</h2>${item.angular}${item.kind==='first'?'<output>{{value}}</output>':''}</section>`).join('');
    angularMember = cases[0]!.angularMember;
  } else if (id === "stepper") {
    state = numberState = true;
    initialValue = "1";
    const steps = [
      { value: "details", label: t("Details", "البيانات") },
      { value: "review", label: t("Review", "المراجعة") },
      { value: "done", label: t("Complete", "الإكمال") },
    ];
    const stepTexts = (syntax: "react" | "vue" | "angular") => textAttributes({completeLabel: t("Complete", "مكتملة"), upcomingLabel: t("Upcoming", "قادمة")}, syntax);
    react = `<Stepper label="${t("Progress", "التقدم")}" ${stepTexts("react")} items={${JSON.stringify(steps)}} activeIndex={value} /><button type="button" className="hw-button" onClick={() => setValue((value + 1) % 4)}>${t("Next step", "الخطوة التالية")}</button><output>{value}</output>`;
    vue = `<Stepper label="${t("Progress", "التقدم")}" ${stepTexts("vue")} :items='${JSON.stringify(steps)}' :active-index="value" /><button type="button" class="hw-button" @click="value = (value + 1) % 4">${t("Next step", "الخطوة التالية")}</button><output>{{ value }}</output>`;
    angular = `<hw-stepper label="${t("Progress", "التقدم")}" ${stepTexts("angular")} [items]="steps" [activeIndex]="value" /><button type="button" class="hw-button" (click)="value = (value + 1) % 4">${t("Next step", "الخطوة التالية")}</button><output>{{ value }}</output>`;
    angularMember = `\n  steps = ${JSON.stringify(steps)};`;
  } else if (id === "tabs") {
    state = true;
    initialValue = "'first'";
    const cases=tabsDemoCases(locale).map(item=>({...item,...tabsNativeMarkup(locale,item.kind,item.kind==='basic')}));
    react=cases.map(item=>`<section className="hw-stack" data-tabs-demo="${item.kind}"><h2>${item.title}</h2>${item.react}${item.kind==='basic'?'<output>{value}</output>':''}</section>`).join('');
    vue=cases.map(item=>`<section class="hw-stack" data-tabs-demo="${item.kind}"><h2>${item.title}</h2>${item.vue}${item.kind==='basic'?'<output>{{value}}</output>':''}</section>`).join('');
    angular=cases.map(item=>`<section class="hw-stack" data-tabs-demo="${item.kind}"><h2>${item.title}</h2>${item.angular}${item.kind==='basic'?'<output>{{value}}</output>':''}</section>`).join('');
  } else if (id === "progress") {
    react = `<Progress label="${t("Upload progress", "تقدم الرفع")}" value={65} max={100} />`;
    vue = `<Progress label="${t("Upload progress", "تقدم الرفع")}" :value="65" :max="100" />`;
    angular = `<hw-progress label="${t("Upload progress", "تقدم الرفع")}" [value]="65" [max]="100" />`;
  } else if (id === "skeleton") {
    react = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><Skeleton style={{inlineSize:'100%',blockSize:'4rem'}} /></div>`;
    vue = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><Skeleton style="inline-size:100%;block-size:4rem" /></div>`;
    angular = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><hw-skeleton style="inline-size:100%;block-size:4rem" /></div>`;
  } else if (id === "rating") {
    state = true; numberState = true; initialValue = "4";
    const cases = ratingDemoCases(locale).map(item => ({...item, ...ratingNativeMarkup(locale,item.kind,item.kind==='selected')}));
    react = cases.map(item => `<section className="hw-stack"><h2>${item.title}</h2>${item.react}${item.kind==='selected'?'<output>{value}</output>':''}</section>`).join('');
    vue = cases.map(item => `<section class="hw-stack"><h2>${item.title}</h2>${item.vue}${item.kind==='selected'?'<output>{{value}}</output>':''}</section>`).join('');
    angular = cases.map(item => `<section class="hw-stack"><h2>${item.title}</h2>${item.angular}${item.kind==='selected'?'<output>{{value}}</output>':''}</section>`).join('');
    angularMember = [...new Set(cases.map(item => item.angularMember))].join('');
  } else if (id === "carousel") {
    state = true; numberState = true; initialValue = "0";
    const cases = carouselDemoCases(locale).map(item => ({...item, ...carouselNativeMarkup(locale,item.kind,item.kind==='bounded')}));
    react = cases.map(item => `<section className="hw-stack"><h2>${item.title}</h2>${item.react}${item.kind==='bounded'?'<output>{value}</output>':''}</section>`).join('');
    vue = cases.map(item => `<section class="hw-stack"><h2>${item.title}</h2>${item.vue}${item.kind==='bounded'?'<output>{{value}}</output>':''}</section>`).join('');
    angular = cases.map(item => `<section class="hw-stack"><h2>${item.title}</h2>${item.angular}${item.kind==='bounded'?'<output>{{value}}</output>':''}</section>`).join('');
    angularMember = cases[0]!.angularMember;
  } else if (id === "avatar") {
    react = `<div className="hw-cluster">${avatarDemoCases(locale).map(item=>`<div className="hw-stack"><Avatar ${avatarDemoProps(item)} /><span>${item.title}</span></div>`).join('')}</div>`;
    vue = react.replaceAll('className=','class=');
    angular = vue.replaceAll('<Avatar ','<hw-avatar ');
  } else if (id === "empty") {
    react = `<EmptyState title="${t("No applications", "لا توجد طلبات")}" description="${t("Your applications will appear here.", "ستظهر طلباتك هنا.")}" />`;
    vue = react;
    angular = `<hw-empty-state title="${t("No applications", "لا توجد طلبات")}" description="${t("Your applications will appear here.", "ستظهر طلباتك هنا.")}" />`;
  } else if (id === "link") {
    const text=t("Read the guide", "اقرأ الدليل"),neutral=t("Explore services","استكشف الخدمات"),unavailable=t("Unavailable destination","وجهة غير متاحة");
    const externalText=t("External reference", "مرجع خارجي"), windowText=t("opens in a new window", "يفتح في نافذة جديدة");
    react = `<div className="hw-stack"><Link href="#guide">${text}</Link><Link href="#services" variant="neutral">${neutral}</Link><Link href="#details" variant="standalone">${text}<span className="hw-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true" /></Link><Link href="#unavailable" disabled>${unavailable}</Link><Link href="https://example.test/reference" external>${externalText}<span className="hw-sr-only"> · ${windowText}</span></Link></div>`;
    vue = `<div class="hw-stack"><Link href="#guide">${text}</Link><Link href="#services" variant="neutral">${neutral}</Link><Link href="#details" variant="standalone">${text}<span class="hw-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true" /></Link><Link href="#unavailable" disabled>${unavailable}</Link><Link href="https://example.test/reference" external>${externalText}<span class="hw-sr-only"> · ${windowText}</span></Link></div>`;
    angular = `<div class="hw-stack"><a hwLink href="#guide">${text}</a><a hwLink href="#services" variant="neutral">${neutral}</a><a hwLink href="#details" variant="standalone">${text}<span class="hw-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true"></span></a><a hwLink href="#unavailable" [disabled]="true">${unavailable}</a><a hwLink href="https://example.test/reference" external>${externalText}<span class="hw-sr-only"> · ${windowText}</span></a></div>`;
  } else if (id === "feedback") {
    state = true;
    initialValue = "null";
    customStateType = "boolean | null";
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
        .join("") + "<output>{value === null ? '' : String(value)}</output>";
    vue =
      (["text", "icon-text", "icon"] as const)
        .map(
          (variant) =>
            `<Feedback label="${question}" choice-variant="${variant}" yes-label="${yes}" no-label="${no}" comment-label="${comment}" submit-label="${submit}" success-message="${thanks}" @update:model-value="value = $event.helpful" @feedback="feedback => console.log(feedback)" />`,
        )
        .join("") + "<output>{{ value }}</output>";
    angular =
      (["text", "icon-text", "icon"] as const)
        .map(
          (variant) =>
            `<hw-feedback label="${question}" choiceVariant="${variant}" yesLabel="${yes}" noLabel="${no}" commentLabel="${comment}" submitLabel="${submit}" successMessage="${thanks}" (valueChange)="value = $event.helpful" (feedback)="report($event)" />`,
        )
        .join("") + "<output>{{ value }}</output>";
    angularMember = `\n  report(feedback: HwFeedbackValue) { console.log(feedback); }`;
  } else if (id === "badge") {
    const statuses = [
      { tone: "neutral", text: t("Scheduled", "مجدول") },
      { tone: "info", text: t("In progress", "قيد التنفيذ") },
      { tone: "success", text: t("Complete", "مكتمل") },
      { tone: "warning", text: t("Needs review", "يحتاج إلى مراجعة") },
      { tone: "danger", text: t("Unable to send", "تعذّر الإرسال") },
    ];
    react = (["soft", "outline", "dot"] as const).map(variant =>
      `<section className="hw-stack"><h2>${variant === "soft" ? t("Badges", "الشارات") : variant === "outline" ? t("Outlined badges", "شارات بإطار") : t("Status labels", "تسميات الحالة")}</h2><div className="hw-cluster hw-badges">${statuses.map(status => `<Badge tone="${status.tone}" variant="${variant}">${status.text}</Badge>`).join("")}</div></section>`,
    ).join("");
    vue = react.replaceAll("className=", "class=");
    angular = vue.replaceAll("<Badge ", "<hw-badge ").replaceAll("</Badge>", "</hw-badge>");
  } else if (id === "alert") {
    react = `<Alert tone="success" title="${label}"><p>${t("Saved successfully", "تم الحفظ بنجاح")}</p></Alert>`;
    vue = react;
    angular = `<hw-alert tone="success" title="${label}"><p>${t("Saved successfully", "تم الحفظ بنجاح")}</p></hw-alert>`;
  } else if (id === "divider") {
    react = dividerProjectMarkup(locale, "react");
    vue = dividerProjectMarkup(locale, "vue");
    angular = dividerProjectMarkup(locale, "angular");
  } else {
    react = `<Spinner label="${t("Loading", "جارٍ التحميل")}" />`;
    vue = react;
    angular = `<hw-spinner label="${t("Loading", "جارٍ التحميل")}" />`;
  }
  const initial =
    initialValue ??
    (booleanState ? "false" : id === "toggle-group" ? "'first'" : "''");
  const stateType = basicInput?.stateType ?? customStateType ?? (booleanState
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
        html: `${state ? "import { useState } from 'react';\n" : ""}import { ${componentImports} } from '@hawiyah/react';\n\n${contentRecipe?.reactDeclarations ? contentRecipe.reactDeclarations + '\n\n' : ''}export default function App() {\n${state ? `  const [value, setValue] = useState${typed ? `<${stateType}>` : ""}(${initial});\n` : ""}  return <${wrapperTag} className="demo"${layoutMarker} lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${react}</${wrapperTag}>;\n}\n`,
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
        html: `<script setup${typed ? ' lang="ts"' : ""}>\n${state ? "import { ref } from 'vue';\n" : ""}import { ${componentImports} } from '@hawiyah/vue';\n${state ? `const value = ref${typed ? `<${id === "toggle-group" ? "string | readonly string[]" : stateType}>` : ""}(${initial});\n` : ""}${contentRecipe?.vueDeclarations ? contentRecipe.vueDeclarations + "\n" : ""}</script>\n\n<template>\n  <${wrapperTag} class="demo"${layoutMarker} lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${vue}</${wrapperTag}>\n</template>\n`,
        js: `import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n`,
      },
    };
  const angularClass = basicInput?.angularImports ?? (id === "radio" ? "HwRadioGroupComponent" : id === "link" ? "HwLinkDirective" : `Hw${component}${id === "button" ? "Directive" : "Component"}`) + `${id === "button-group" ? ", HwButtonDirective, HwIconButtonComponent" : id === "rating" ? ", HwRatingDisplayComponent" : id === "tabs" ? ", HwTabComponent" : id === "tooltip" ? ", HwTooltipTriggerDirective" : id === "site-verification" ? ", HwPortalHeaderComponent" : id === "portal-header" ? ", HwSiteVerificationComponent" : ""}`;
  return {
    names: { html: "app.component.ts", css: "style.css", js: "main.ts" },
    entry: "main.ts",
    host: "<app-root></app-root>",
    files: {
      css,
      html: `import { Component } from '@angular/core';\nimport { ${angularClass} } from '@hawiyah/angular';\n${id === "feedback" ? "import type { HwFeedbackValue } from '@hawiyah/angular';\n" : ""}\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [${angularClass}],\n  template: \`<${wrapperTag} class="demo"${layoutMarker} lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${angular}</${wrapperTag}>\`,\n})\nexport class AppComponent {${state ? `\n  value: ${basicInput?.angularStateType ?? (id === "toggle-group" ? "string | string[]" : stateType)} = ${initial};` : ""}${angularMember}\n}\n`,
      js: "import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n",
    },
  };
}
