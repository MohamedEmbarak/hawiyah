import type {Locale} from './data';
import type {ProjectExample} from './project-examples';
import type {ProjectFramework, ProjectLanguage} from './project-compiler';

const components = {'secondary-nav':'SecondaryNav', 'portal-layout':'PortalLayout', 'mobile-top-bar':'MobileTopBar', 'navigation-drawer':'NavigationDrawer'} as const;
type ShellId = keyof typeof components;
export const portalShellIds = Object.keys(components) as ShellId[];
export function isPortalShellId(id: string): id is ShellId { return Object.hasOwn(components, id); }

export function portalShellProject(id: ShellId, framework: ProjectFramework, language: ProjectLanguage, locale: Locale): ProjectExample {
  const typed = language === 'typescript', ar = locale === 'ar', dir = ar ? 'rtl' : 'ltr';
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const secondary = id === 'secondary-nav', shell = id === 'portal-layout', bar = id === 'mobile-top-bar', drawer = !secondary && !shell;
  const pages = [
    {id:'overview', label:t('Overview','نظرة عامة'), icon:'home-01', description:t('Browse service information and check your submitted requests.', 'اطّلع على معلومات الخدمة وتابع الطلبات المقدمة.')},
    {id:'requests', label:t('My requests','طلباتي'), icon:'calendar-03', description:t('You have 2 requests under review.', 'لديك طلبان قيد المراجعة.')},
    {id:'help', label:t('Help','المساعدة'), icon:'link-04', description:t('Find answers about requests and processing times.', 'اطّلع على إجابات حول الطلبات ومدة المعالجة.')},
  ].map(item => ({...item, href:`#demo-page-${item.id}`}));
  const portal = t('Service portal','بوابة الخدمات'), menu = t('Open navigation','فتح قائمة التنقل');
  const close = t('Close navigation','إغلاق قائمة التنقل'), mainNav = t('Main navigation','التنقل الرئيسي');
  const sections = t('Service sections','أقسام الخدمات'), shortcuts = t('Mobile shortcuts','اختصارات الجوال');
  const skip = t('Skip to page content','انتقل إلى محتوى الصفحة'), trail = t('Breadcrumb','مسار التنقل'), footer = t('Support links','روابط المساعدة');
  const account = t('Guest account','حساب زائر'), group = t('Service directory','دليل الخدمات'), upcoming = t('Appointments (coming soon)','المواعيد (قريبًا)');
  const env = `data-portal-project="${id}" data-project-format="${framework}-${language}" lang="${locale}" dir="${dir}"`;
  const ts = (type: string) => typed ? ': ' + type : '';
  const data = `const pages = ${JSON.stringify(pages,null,2)};

function pageFromClick(event${ts('MouseEvent')}) {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (link.matches('.hw-skip-link')) {
    event.preventDefault();
    document.getElementById('service-content')?.focus();
    return;
  }
  const page = pages.find(item => item.href === link.getAttribute('href'));
  if (page) event.preventDefault();
  return page;
}
`;
  const linkData = `function navigation(active${ts('string')}) {
  return pages.map(item => ({ ...item, current: item.id === active }));
}`;
  const menuData = `function drawerItems(active${ts('string')}) {
  const [overview, requests, help] = navigation(active);
  return [overview, { id:'directory', label:'${group}', children:[requests, help] }, {id:'appointments', label:'${upcoming}', disabled:true}];
}`;
  const declarations = data + (framework === 'vanilla' ? '' : '\n' + linkData + (drawer ? '\n\n' + menuData : ''));
  const css = "@import '@hawiyah/styles/styles.css';\n\n.demo { display:grid; gap:1rem; min-inline-size:0; }\n.demo nav { max-inline-size:100%; }\n.demo h1, .demo h2 { margin-block:0 .5rem; }\n";
  const component = components[id], imports = bar ? 'MobileTopBar, NavigationDrawer' : component;
  const classes = framework === 'react' ? 'className' : 'class';
  const triggerClass = bar ? 'hw-button hw-icon-button' : 'hw-button';
  const triggerLabel = bar ? ` data-variant="ghost" aria-label="${menu}"` : '';
  const triggerContent = bar ? `<span ${classes}="hw-icon" data-icon="menu-01" aria-hidden="true"></span>` : menu;
  const back = t('Back to overview','العودة إلى النظرة العامة');
  const helpLink = `<a ${classes}="hw-link" href="${pages[2]!.href}">${pages[2]!.label}</a>`;
  const backLink = `<a ${classes}="hw-link" href="${pages[0]!.href}">${back}</a>`;
  const markup = {
    react: `<section data-page-view={page.id} aria-live="polite"><h2>{page.label}</h2><p>{page.description}</p></section>`,
    vue: `<section :data-page-view="page.id" aria-live="polite"><h2>{{ page.label }}</h2><p>{{ page.description }}</p></section>`,
    angular: `<section [attr.data-page-view]="page.id" aria-live="polite"><h2>{{ page.label }}</h2><p>{{ page.description }}</p></section>`,
    vanilla: `<section data-page-view="overview" aria-live="polite"><h2>${pages[0]!.label}</h2><p>${pages[0]!.description}</p></section>`,
  };
  const ext = typed ? 'ts' : 'js';
  if (framework === 'vanilla') {
    const link = (p: typeof pages[number], icons = false) => `<li><a href="${p.href}"${p.id === 'overview' ? ' aria-current="page"' : ''}>${icons ? `<span class="hw-icon" data-icon="${p.icon}" aria-hidden="true"></span>` : ''}<span>${p.label}</span></a></li>`;
    const links = pages.map(p => link(p)).join('');
    const nav = (mobile: boolean) => `<nav class="hw-secondary-nav" aria-label="${mobile ? shortcuts : sections}" data-variant="${mobile ? 'mobile' : 'default'}"><ul>${pages.map(p => link(p,mobile)).join('')}</ul></nav>`;
    const trigger = `<button class="${triggerClass}" type="button" data-drawer-open aria-haspopup="dialog" aria-controls="service-menu" aria-expanded="false"${triggerLabel}>${triggerContent}</button>`;
    const row = (p: typeof pages[number]) => link(p,true).replace('<a ', '<a class="hw-navigation-drawer-row" ');
    const drawerHtml = `<dialog id="service-menu" aria-labelledby="menu-heading" class="hw-dialog hw-drawer hw-navigation-drawer">
    <header class="hw-dialog-header"><h2 id="menu-heading">${mainNav}</h2><button type="button" class="hw-button" data-hw-dialog-close data-variant="ghost" aria-label="${close}">×</button></header>
    <div class="hw-dialog-body"><div class="hw-navigation-drawer-user">${account}</div>
      <nav class="hw-navigation-drawer-nav" aria-label="${mainNav}"><ul>${row(pages[0]!)}
        <li><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row">${group}</summary><ul>${row(pages[1]!)}${row(pages[2]!)}</ul></details></li>
        <li><span class="hw-navigation-drawer-row" aria-disabled="true">${upcoming}</span></li>
      </ul></nav></div></dialog>`;
    const topBar = `<header class="hw-mobile-top-bar" data-variant="main"><div class="hw-mobile-top-bar-leading">${trigger}</div><div class="hw-mobile-top-bar-copy"><h1 class="hw-mobile-top-bar-title">${portal}</h1><p class="hw-mobile-top-bar-subtitle">${account}</p></div><div class="hw-mobile-top-bar-actions">${helpLink}</div></header>`;
    const layout = `<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header"><a class="hw-skip-link" href="#service-content">${skip}</a><div class="hw-portal-header-main"><a class="hw-portal-brand" href="${pages[0]!.href}">${portal}</a>
    <button type="button" class="hw-button hw-portal-menu-toggle" data-hw-portal-toggle>${menu}</button><nav data-hw-portal-navigation aria-label="${mainNav}"><ul>${links}</ul></nav><span>${account}</span></div></header>
  ${nav(false)}
  <main id="service-content" tabindex="-1" class="hw-portal-layout-main hw-container"><nav class="hw-breadcrumb" aria-label="${trail}"><ol><li><a href="${pages[0]!.href}">${portal}</a></li><li><span aria-current="page" data-crumb>${pages[0]!.label}</span></li></ol></nav>${markup.vanilla.replaceAll('h2','h1')}</main>
  <footer class="hw-portal-footer"><div class="hw-portal-footer-main"><strong>${portal}</strong><nav class="hw-portal-footer-group" aria-label="${footer}"><h2>${footer}</h2><ul>${link(pages[2]!)}</ul></nav></div></footer></div>`;
    const content = shell ? layout : secondary ? nav(false) + '\n' + nav(true) + '\n' + markup.vanilla : (bar ? topBar : trigger) + '\n' + drawerHtml + '\n' + markup.vanilla;
    const html = `<!doctype html>
<html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${portal}</title></head>
<body><div class="demo" ${env}>${content}</div><script type="module" src="./main.${ext}"></script></body></html>`;
    const setup = drawer ? `const dialog = root.querySelector('dialog');
const trigger = root.querySelector('[data-drawer-open]');
if (!dialog || !(trigger instanceof HTMLButtonElement)) throw new Error('Missing navigation drawer');
const drawer = createNavigationDrawer(dialog, {onOpenChange: open => trigger.setAttribute('aria-expanded', String(open))});
trigger.addEventListener('click', () => drawer.show(trigger), events);` : `const release = enhance(root);`;
    const js = `import { ${drawer ? 'createNavigationDrawer' : 'enhance'} } from '@hawiyah/vanilla';
import './style.css';

${data}
const root = document.querySelector('[data-portal-project]');
if (!(root instanceof HTMLElement)) throw new Error('Missing portal');
const listeners = new AbortController();
const events = {signal: listeners.signal};
${setup}
root.addEventListener('click', event => {
  const page = pageFromClick(event);
  if (!page) return;
  const view = root.querySelector('[data-page-view]');
  if (!view) return;
  view.setAttribute('data-page-view', page.id);
  const title = view.querySelector('${shell ? 'h1' : 'h2'}'), description = view.querySelector('p');
  if (title) title.textContent = page.label;
  if (description) description.textContent = page.description;${bar ? `
  const topBar = root.querySelector('.hw-mobile-top-bar');
  const topTitle = topBar?.querySelector('.hw-mobile-top-bar-title');
  const action = topBar?.querySelector('a');
  const home = page.id === 'overview';
  if (topBar) topBar.setAttribute('data-variant', home ? 'main' : 'internal');
  if (topTitle) topTitle.textContent = home ? '${portal}' : page.label;
  if (action) { action.href = home ? pages[2].href : pages[0].href; action.textContent = home ? pages[2].label : '${back}'; }` : ''}
  for (const link of root.querySelectorAll(':is(.hw-secondary-nav,.hw-navigation-drawer-nav,[data-hw-portal-navigation]) a[href]')) {
    if (link.getAttribute('href') === page.href) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }${shell ? "\n  const crumb = root.querySelector('[data-crumb]');\n  if (crumb) crumb.textContent = page.label;" : ''}${drawer ? '\n  drawer.close();' : ''}
}, events);
window.addEventListener('pagehide', () => {listeners.abort(); ${drawer ? 'drawer.destroy()' : 'release()'};}, {once:true});
`;
    return {names:{html:'index.html',css:'style.css',js:`main.${ext}`},entry:`main.${ext}`,host:'',files:{html,css,js}};
  }
  if (framework === 'react') {
    const trigger = `<button className="${triggerClass}" type="button" data-drawer-open aria-haspopup="dialog" aria-controls="service-menu" aria-expanded={open} onClick={() => setOpen(true)}${triggerLabel}>${triggerContent}</button>`;
    const panel = `<NavigationDrawer id="service-menu" title="${mainNav}" navigationLabel="${mainNav}" closeLabel="${close}" items={drawerItems(page.id)} open={open} onOpenChange={setOpen} userContent={<span>${account}</span>} />`;
    const content = shell ? `<PortalLayout brand="${portal}" lang="${locale}" dir="${dir}" mainId="service-content" skipLabel="${skip}"
      headerProps={{brandHref: pages[0].href, navigation: links, menuLabel:'${menu}', navigationLabel:'${mainNav}', actions:<span>${account}</span>}}
      secondaryNavigation={links} secondaryLabel="${sections}" breadcrumbLabel="${trail}"
      breadcrumbs={[{label:'${portal}', href:pages[0].href}, {label:page.label, current:true}]}
      footerProps={{links:[pages[2]], linksLabel:'${footer}'}}>
      ${markup.react.replaceAll('h2','h1')}
    </PortalLayout>` : secondary ? `<SecondaryNav items={links} label="${sections}" />
    <SecondaryNav items={links} label="${shortcuts}" variant="mobile" />
    ${markup.react}` : `${bar ? `<MobileTopBar title={page.id === 'overview' ? '${portal}' : page.label} subtitle="${account}" variant={page.id === 'overview' ? 'main' : 'internal'} leading={${trigger}} actions={page.id === 'overview' ? ${helpLink} : ${backLink}} />` : trigger}
    ${panel}
    ${markup.react}`;
    const jsx = typed ? 'tsx' : 'jsx';
    const html = `import { useState } from 'react';
import { ${imports} } from '@hawiyah/react';

${declarations}
export default function App() {
  const [page, setPage] = useState(pages[0]);${drawer ? '\n  const [open, setOpen] = useState(false);' : '\n  const links = navigation(page.id);'}
  return <div className="demo" ${env} onClick={event => {
    const next = pageFromClick(event.nativeEvent);
    if (next) { setPage(next);${drawer ? ' setOpen(false);' : ''} }
  }}>
    ${content}
  </div>;
}
`;
    const js = "import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\n\nconst root = document.getElementById('app');\nif (!root) throw new Error('Missing app root');\ncreateRoot(root).render(<App />);\n";
    return {names:{html:`App.${jsx}`,css:'style.css',js:`main.${jsx}`},entry:`main.${jsx}`,host:'<div id="app"></div>',files:{html,css,js}};
  }
  if (framework === 'vue') {
    const trigger = `<button class="${triggerClass}" type="button" data-drawer-open aria-haspopup="dialog" aria-controls="service-menu" :aria-expanded="open" @click="open = true"${triggerLabel}>${triggerContent}</button>`;
    const panel = `<NavigationDrawer id="service-menu" title="${mainNav}" navigation-label="${mainNav}" close-label="${close}" :items="drawerItems(page.id)" v-model:open="open"><template #user>${account}</template></NavigationDrawer>`;
    const content = shell ? `<PortalLayout brand="${portal}" lang="${locale}" dir="${dir}" main-id="service-content" skip-label="${skip}" :home-href="pages[0].href" :links="links" menu-label="${menu}" navigation-label="${mainNav}" :secondary-navigation="links" secondary-label="${sections}" breadcrumb-label="${trail}" :breadcrumbs="[{label:'${portal}',href:pages[0].href},{label:page.label,current:true}]" :footer-links="[pages[2]]" footer-label="${footer}">
      <template #actions><span>${account}</span></template>
      ${markup.vue.replaceAll('h2','h1')}
    </PortalLayout>` : secondary ? `<SecondaryNav :items="links" label="${sections}" />
    <SecondaryNav :items="links" label="${shortcuts}" variant="mobile" />
    ${markup.vue}` : `${bar ? `<MobileTopBar :title="page.id === 'overview' ? '${portal}' : page.label" subtitle="${account}" :variant="page.id === 'overview' ? 'main' : 'internal'">
      <template #leading>${trigger}</template><template #actions><a class="hw-link" :href="page.id === 'overview' ? pages[2].href : pages[0].href">{{ page.id === 'overview' ? pages[2].label : '${back}' }}</a></template>
    </MobileTopBar>` : trigger}
    ${panel}
    ${markup.vue}`;
    const html = `<script setup${typed ? ' lang="ts"' : ''}>
import { ${drawer ? 'ref' : 'ref, computed'} } from 'vue';
import { ${imports} } from '@hawiyah/vue';

${declarations}
const page = ref(pages[0]);${drawer ? '\nconst open = ref(false);' : '\nconst links = computed(() => navigation(page.value.id));'}
function route(event${ts('MouseEvent')}) {
  const next = pageFromClick(event);
  if (next) { page.value = next;${drawer ? ' open.value = false;' : ''} }
}
</script>

<template>
  <div class="demo" ${env} @click="route">
    ${content}
  </div>
</template>
`;
    const js = "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n";
    return {names:{html:'App.vue',css:'style.css',js:`main.${ext}`},entry:`main.${ext}`,host:'<div id="app"></div>',files:{html,css,js}};
  }
  const native = imports.split(', ').map(name => `Hw${name}Component`).join(', ');
  const trigger = `<button #trigger class="${triggerClass}" type="button" data-drawer-open aria-haspopup="dialog" aria-controls="service-menu" [attr.aria-expanded]="open" (click)="drawer.show(trigger)"${bar ? ' hwTopBarLeading' : ''}${triggerLabel}>${triggerContent}</button>`;
  const panel = `<hw-navigation-drawer #drawer id="service-menu" title="${mainNav}" navigationLabel="${mainNav}" closeLabel="${close}" [items]="items" [(open)]="open"><span hwNavigationDrawerUser>${account}</span></hw-navigation-drawer>`;
  const content = shell ? `<hw-portal-layout brand="${portal}" lang="${locale}" dir="${dir}" mainId="service-content" skipLabel="${skip}" [homeHref]="pages[0].href" [links]="links" menuLabel="${menu}" navigationLabel="${mainNav}" [secondaryNavigation]="links" secondaryLabel="${sections}" breadcrumbLabel="${trail}" [breadcrumbs]="[{label:'${portal}',href:pages[0].href},{label:page.label}]" [footerLinks]="[pages[2]]" footerLabel="${footer}">
      <span hwPortalActions>${account}</span>
      ${markup.angular.replaceAll('h2','h1')}
    </hw-portal-layout>` : secondary ? `<hw-secondary-nav [items]="links" label="${sections}" />
    <hw-secondary-nav [items]="links" label="${shortcuts}" variant="mobile" />
    ${markup.angular}` : `${bar ? `<hw-mobile-top-bar [title]="page.id === 'overview' ? '${portal}' : page.label" subtitle="${account}" [variant]="page.id === 'overview' ? 'main' : 'internal'">${trigger}<a hwTopBarActions class="hw-link" [href]="page.id === 'overview' ? pages[2].href : pages[0].href">{{ page.id === 'overview' ? pages[2].label : '${back}' }}</a></hw-mobile-top-bar>` : trigger}
    ${panel}
    ${markup.angular}`;
  const html = `import { Component } from '@angular/core';
import { ${native} } from '@hawiyah/angular';

${declarations}
@Component({
  selector:'app-root', standalone:true, imports:[${native}],
  template:\`<div class="demo" ${env} (click)="route($event${drawer ? ', drawer' : ''})">
    ${content}
  </div>\`,
})
export class AppComponent {
  pages = pages;
  page = pages[0];${drawer ? '\n  open = false;\n  items = drawerItems(this.page.id);' : '\n  links = navigation(this.page.id);'}
  route(event: MouseEvent${drawer ? ', drawer: HwNavigationDrawerComponent' : ''}) {
    const next = pageFromClick(event);
    if (!next) return;
    this.page = next;${drawer ? '\n    this.items = drawerItems(next.id);\n    drawer.close();' : '\n    this.links = navigation(next.id);'}
  }
}
`;
  const js = "import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n";
  return {names:{html:'app.component.ts',css:'style.css',js:'main.ts'},entry:'main.ts',host:'<app-root></app-root>',files:{html,css,js}};
}
