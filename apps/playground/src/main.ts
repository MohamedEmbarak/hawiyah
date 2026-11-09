import {inlineExample} from './guide-html';
import { foundationExamples } from './foundation-examples';
import {selectDemoCases, selectDemoMarkup} from './select-demo';
import { paginationDemoMarkup } from "./pagination-demo";
import { statusMarkup } from "./ready-examples";
import { bindDemoPreviews } from "./demo-previews";
import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@hawiyah/styles/reset.css";
import "@hawiyah/styles/styles.css";
import "./playground.css";
import "./expansion.css";
import { renderGuide, renderComponentGuide, guideTitle, guideTopics, bindGuide } from "./guide";
import { renderHome, bindHome } from "./guide-home";
import { hawiyahMinor } from "./release";
import { renderDgaTemplates, bindDgaTemplates } from "./dga-templates";
import { createGuideSearch } from "./guide-search";
import "./experience.css";
import nicLogo from "./assets/nic-logo.webp";
import { expandedSample } from "./expanded-samples";
import { loaderDemo } from "./loader-demo";
import { formatRiyal, riyalAmount } from './currency';
import { stepperSample, bindStepperSamples } from './stepper-demo';
import {
  layoutPage,
  inputPage,
  bindLayoutStudio,
  bindInputLab,
} from "./layout-studio";
import { enhance } from "@hawiyah/vanilla";
import { normalizeSearch, formatNumber, formatDate } from "@hawiyah/core";
import {
  catalog,
  services,
  requests,
  escape as e,
  icon,
  type Locale,
  type Service,
  type ComponentId,
} from "./data";

import "./demo-previews.css";

const base = import.meta.env.BASE_URL;
const app = document.querySelector<HTMLDivElement>("#app")!;
const mobileViewport = matchMedia('(max-width: 1024px)');
let dispose = () => {};
const state = {
  locale: (localStorage.getItem("hawiyah-locale") === "en" ? "en" : "ar") as Locale,
  mode: localStorage.getItem("hawiyah-mode") || "light",
  theme: "dga",
  density: "comfortable",
  view: location.hash.slice(1) || "overview",
  framework: localStorage.getItem("hawiyah-framework") || "vanilla",
  search: "",
  category: "all",
  componentSearch: "",
  componentCategory: "All",
  page: 1,
  requestSearch: "",
  requestStatus: "all",
  selected: new Set<string>(),
  applicationStep: 0,
  service: services[0] as Service,
  submitted: false,
  draft: {
    business: "",
    city: "",
    email: "",
    activity: "retail",
    description: "",
    declaration: false,
  },
  fileName: "",
  mobileNav: false,
  component: "button" as ComponentId,
};
const t = (en: string, ar: string) => (state.locale === "ar" ? ar : en);
const text = (pair: readonly string[]) => pair[state.locale === "ar" ? 1 : 0]!;
const button = (label: string, attrs = "", variant = "primary") =>
  `<button type="button" class="hw-button" data-variant="${variant}" ${attrs}>${label}</button>`;
const pill = (label: string, tone = "neutral") =>
  `<span class="hw-badge" data-tone="${tone}">${label}</span>`;
const statusLabel = (status: string) =>
  ({
    review: t("In review", "قيد المراجعة"),
    action: t("Action needed", "يتطلب إجراء"),
    completed: t("Completed", "مكتمل"),
    draft: t("Draft", "مسودة"),
  })[status] || status;
const statusTone = (status: string) =>
  ({
    review: "info",
    action: "warning",
    completed: "success",
    draft: "neutral",
  })[status] || "neutral";
const copyButton = (value: string) =>
  button(
    icon("copy", 16) + t("Copy", "نسخ"),
    `data-copy="${e(value)}" data-size="sm"`,
    "ghost",
  );
const codeBlock = (code: string) =>
  `<div class="code-block"><div class="code-label"><span>${t("Ready to make your own", "جاهز للتخصيص")}</span>${copyButton(code)}</div><pre dir="ltr" tabindex="0" role="region" aria-label="${t("Code example", "مثال الشفرة")}"><code>${e(code)}</code></pre></div>`;
function nav(view: string, label: string, symbol: string, extra = "") {
  const active = state.view === view || (view === "docs" && state.view.startsWith("docs/")) || (view === "components" && state.view.startsWith("component/"));
  return `<a href="#${view}" class="nav-link ${active ? "active" : ""}" ${active ? 'aria-current="page"' : ""}>${icon(symbol, 19)}<span>${label}</span>${extra}</a>`;
}
function categoryName(category: string) {
  return state.locale === 'en' ? category : ({ Actions: 'الإجراءات', Forms: 'المدخلات والنماذج', Navigation: 'التنقّل', Feedback: 'التغذية الراجعة', Content: 'المحتوى', Platforms: 'أنماط المنصات', Layout: 'التخطيط' } as Record<string,string>)[category] || category;
}
function shell() {
  if (new URLSearchParams(location.search).get('preview') === 'template' && state.view.startsWith('templates')) {
    return `<nav class="hw-inline" aria-label="${t('Template preview controls','أدوات معاينة القالب')}" style="padding:12px 16px;background:var(--hw-color-surface);border-block-end:1px solid var(--hw-color-border)"><a class="hw-button" data-variant="ghost" href="${base}#${e(state.view)}">${icon('arrow-back',16)}${t('Back to the guide','العودة إلى الدليل')}</a><button type="button" class="hw-button" data-variant="ghost" data-action="locale">${t('العربية','English')}</button><button type="button" class="hw-button" data-variant="ghost" data-action="mode">${t('Toggle color mode','تبديل المظهر')}</button></nav><main id="main" tabindex="-1" data-view="${e(state.view)}" style="padding:0">${renderDgaTemplates(state.view,state.locale)||''}</main><div id="toast" role="status" class="toast" hidden></div>`;
  }
  const titles: Record<string, string> = {
    overview: t('About Hawiyah', 'عن هوية'), components: t('Components', 'المكوّنات'),
    foundations: t('Foundations', 'الأساسيات'), discover: t('Service discovery', 'اكتشاف الخدمات'),
    apply: t('Guided application', 'طلب خطوة بخطوة'), workspace: t('Request workspace', 'مساحة الطلبات'),
    docs: t('Getting started', 'البداية'), brand: t('Brand identity', 'الهوية البصرية'),
    layouts: t('Layout studio', 'مختبر التخطيط'), inputs: t('Input laboratory', 'مختبر المدخلات'),
  };
  const isDocs = state.view === 'docs' || state.view.startsWith('docs/');
  const isComponent = state.view.startsWith('component/');
  const activeComponent = catalog.find(c => 'component/'+c[0] === state.view);
  const mobileOpen = state.mobileNav && mobileViewport.matches;
  const docNav = guideTopics.map(([id,en,ar]) => `<a class="sidebar-child ${state.view==='docs/'+id || (state.view==='docs'&&id==='getting-started')?'is-active':''}" href="#docs/${id}" ${state.view==='docs/'+id || (state.view==='docs'&&id==='getting-started')?'aria-current="page"':''}>${t(en,ar)}</a>`).join('');
  const componentsNav = [...new Set(catalog.map(c=>c[3]))].map(category => `<details class="sidebar-category" ${activeComponent?.[3]===category?'open':''}><summary>${categoryName(category)}<small>${catalog.filter(c=>c[3]===category).length}</small></summary><div>${catalog.filter(c=>c[3]===category).map(c=>`<a class="sidebar-child ${activeComponent?.[0]===c[0]?'is-active':''}" href="#component/${c[0]}" ${activeComponent?.[0]===c[0]?'aria-current="page"':''}>${text([c[1],c[2]])}</a>`).join('')}</div></details>`).join('');
  return `<a class="skip-link" href="#main" ${mobileOpen?'inert':''}>${t('Skip to content','انتقل إلى المحتوى')}</a>
    <aside id="site-navigation" class="sidebar ${mobileOpen?'mobile-open':''}" ${mobileOpen?'role="dialog" aria-modal="true"':''} aria-label="${t('Main navigation','التنقّل الرئيسي')}">
      <div class="sidebar-brand-row"><a href="#overview" class="brand brand-wordmark" aria-label="${t('Hawiyah home','هوية — الصفحة الرئيسية')}"><img src="${base}brand/assets/hawiyah-wordmark${state.mode==='dark'?'-white':''}.svg" alt="هوية" width="100" height="78"></a><span class="sidebar-version" dir="ltr">${hawiyahMinor}</span><button type="button" class="icon-button sidebar-close" data-action="menu" aria-label="${t('Close navigation','أغلق التنقّل')}">${icon('close',21)}</button></div>
      <button type="button" class="sidebar-search" data-action="search-components">${icon('search',17)}<span>${t('Quick search…','بحث سريع…')}</span><kbd dir="ltr" aria-hidden="true">⌘ K</kbd></button>
      <nav aria-label="${t('Guide and examples','الدليل والأمثلة')}">
        ${nav('overview',t('About Hawiyah','عن هوية'),'spark')}
        <details class="sidebar-group" ${isDocs || state.view==='overview'?'open':''}><summary>${icon('code',18)}<span>${t('Build with Hawiyah','ابدأ مع هوية')}</span><span class="sidebar-chevron" aria-hidden="true">${icon("chevron-down",16)}</span></summary><div>${docNav}</div></details>
        ${nav('components',t('Component library','مكتبة المكوّنات'),'layers',`<small>${catalog.length}</small>`)}
        <details class="sidebar-group component-navigation" ${isComponent?'open':''}><summary>${icon('grid',18)}<span>${t('Browse by category','تصفّح حسب الفئة')}</span><span class="sidebar-chevron" aria-hidden="true">${icon("chevron-down",16)}</span></summary><div>${componentsNav}</div></details>
        <details class="sidebar-group" ${state.view.startsWith('templates')?'open':''}><summary>${icon('building',18)}<span>${t('DGA reference templates','قوالب كود المنصات')}</span><span class="sidebar-chevron" aria-hidden="true">${icon("chevron-down",16)}</span></summary><div>${nav('templates',t('Template gallery','معرض القوالب'),'grid')}${nav('templates/service',t('Service details','تفاصيل الخدمة'),'briefcase')}${nav('templates/form',t('Application form','نموذج الطلب'),'file')}</div></details>
        <p class="nav-label">${t('CREATE & EXPERIMENT','صمّم وجرّب')}</p>
        ${nav('layouts',t('Layout studio','مختبر التخطيط'),'grid')}${nav('inputs',t('Input laboratory','مختبر المدخلات'),'filter')}${nav('foundations',t('Design foundations','أسس التصميم'),'palette')}${nav('brand',t('Brand identity','الهوية البصرية'),'spark')}
        <details class="sidebar-group" ${['discover','apply','workspace'].includes(state.view)?'open':''}><summary>${icon('briefcase',18)}<span>${t('Complete journeys','تجارب متكاملة')}</span><span class="sidebar-chevron" aria-hidden="true">${icon("chevron-down",16)}</span></summary><div>${nav('discover',t('Discover a service','اكتشف خدمة'),'search')}${nav('apply',t('Application flow','رحلة تقديم طلب'),'file')}${nav('workspace',t('Request workspace','مساحة الطلبات'),'briefcase')}</div></details>
      </nav>
      <div class="sidebar-bottom"><a class="sidebar-github" href="https://github.com/MohamedEmbarak/hawiyah" target="_blank" rel="noopener">${icon('code',17)}<span>${t('Source on GitHub','المصدر على GitHub')}</span>${icon('external',14)}</a><span class="version">${t('Open source · Apache 2.0','مفتوح المصدر · Apache 2.0')}</span></div>
    </aside>
    ${mobileOpen?`<button class="nav-backdrop" type="button" data-action="menu" aria-label="${t('Close navigation','أغلق التنقّل')}" tabindex="-1"></button>`:''}
    <div class="main-shell" ${mobileOpen?'inert':''}><header class="topbar"><p class="site-attribution"><img src="${nicLogo}" width="136" height="150" alt="" decoding="async"><span>${t("Developed by the Development Team in the National Platforms Sector — National Information Center", "تم التطوير بواسطة فريق التطوير في قطاع المنصات الوطنية - مركز المعلومات الوطني ")}</span></p><div class="breadcrumb-top"><button type="button" class="icon-button mobile-menu" data-action="menu" aria-controls="site-navigation" aria-expanded="${mobileOpen}" aria-label="${t('Toggle navigation','تبديل التنقّل')}">${icon('menu')}</button><a href="#overview" class="topbar-home">${t('Hawiyah','هوية')}</a><span class="breadcrumb-separator" aria-hidden="true">/</span><span>${guideTitle(state.view,state.locale)||titles[state.view]||(state.view.startsWith('templates')?t('DGA reference templates','قوالب كود المنصات'):titles.overview)}</span></div><div class="topbar-actions"><button type="button" class="search-trigger" data-action="search-components" aria-label="${t('Search the guide…','ابحث في الدليل…')} ⌘ K" aria-keyshortcuts="Control+k Meta+k">${icon('search',17)}<span>${t('Search the guide…','ابحث في الدليل…')}</span><kbd dir="ltr" aria-hidden="true">⌘ K</kbd></button><button type="button" class="icon-button locale-button" data-action="locale" aria-label="${t('ع — Switch to Arabic','EN — Switch to English')}">${icon('globe',18)}<span>${t('ع','EN')}</span></button><a class="topbar-github" href="https://github.com/MohamedEmbarak/hawiyah" target="_blank" rel="noopener" aria-label="${t('Hawiyah on GitHub','هوية على GitHub')}">GitHub ${icon('external',14)}</a></div></header>
    <main id="main" tabindex="-1" data-view="${e(state.view)}">${content()}</main><footer class="page-footer"><span>${t('Made for the way you build.','مصمّم للطريقة التي تبني بها.')}</span><a href="#docs/alignment">${t('DGA reference · Independent implementation.','مرجع كود المنصات · تنفيذ مستقل.')}</a><span dir="ltr">Apache 2.0 · Hawiyah</span></footer></div><div id="toast" role="status" class="toast" hidden></div>`;
}

function content() {
  if (state.view === "templates" || state.view.startsWith("templates/")) return `<div class="hw-inline" style="margin-block-end:16px"><a class="hw-button" data-variant="secondary" href="${base}?preview=template#${e(state.view)}" target="_blank" rel="noopener">${t('Open full-width preview','افتح معاينة بعرض كامل')} ${icon('external',14)}</a></div>` + (renderDgaTemplates(state.view, state.locale) || overview());
  if (state.view === "components") return componentPage();
  if (state.view === "foundations") return foundations();
  if (state.view === "discover") return discovery();
  if (state.view === "apply") return application();
  if (state.view === "workspace") return workspace();
  if (state.view === "docs" || state.view.startsWith("docs/")) return renderGuide(state.view, state.locale, codeBlock);
  if (state.view.startsWith("component/")) return renderComponentGuide(state.view.slice("component/".length), state.locale, id => sample(id, "reference"), codeBlock);
  if (state.view === "brand") return brand();
  if (state.view === "layouts") return layoutPage(state.locale);
  if (state.view === "inputs") return inputPage(state.locale, state.mode === "dark" ? "dark" : "light");
  return overview();
}
function heading(
  kicker: string,
  title: string,
  description: string,
  action = "",
) {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}
function overview() {
  return renderHome(state.locale, state.framework, sample);
}

function sample(id: ComponentId, p = "sample"): string {
  const uid = p + "-" + id;
  switch (id) {
    case "button":
      return `<div class="hw-cluster">${button(t("Continue", "متابعة"), 'data-action="demo-continue"')}${button(t("Secondary", "ثانوي"), 'data-action="demo-info"', "secondary")}${button(t("Disabled", "غير متاح"), "disabled", "ghost")}</div>`;
    case "field":
    case "text-field":
      return `<div class="hw-field"><label class="hw-label" for="${uid}">${t("Full name", "الاسم الكامل")}</label><input id="${uid}" class="hw-input" placeholder="${t("Enter your name", "أدخل اسمك")}" aria-describedby="${uid}-hint"><span class="hw-hint" id="${uid}-hint">${t("As shown on your document.", "كما يظهر في المستند.")}</span></div>`;
    case "textarea":
      return `<label class="hw-field"><span class="hw-label">${t("Tell us more", "أخبرنا المزيد")}</span><textarea class="hw-textarea" rows="3" placeholder="${t("A little context goes a long way…", "القليل من التفاصيل يساعد كثيرًا…")}"></textarea></label>`;
    case "select":
      return selectDemoMarkup(selectDemoCases(state.locale)[0]!, uid);
    case "checkbox":
      return `<div class="hw-stack"><label class="choice-line"><input class="hw-checkbox" type="checkbox" checked>${t("Email updates", "تحديثات البريد الإلكتروني")}</label><label class="choice-line"><input class="hw-checkbox" type="checkbox">${t("SMS notifications", "إشعارات الرسائل النصية")}</label></div>`;
    case "radio":
      return `<fieldset class="plain-fieldset"><legend class="hw-label">${t("Account type", "نوع الحساب")}</legend><label class="choice-line"><input type="radio" class="hw-radio" name="${uid}" checked>${t("Individual", "فرد")}</label><label class="choice-line"><input type="radio" class="hw-radio" name="${uid}">${t("Business", "منشأة")}</label></fieldset>`;
    case "switch":
      return `<label class="choice-line"><input type="checkbox" role="switch" class="hw-switch" checked>${t("Enable notifications", "تفعيل الإشعارات")}</label>`;
    case "combobox":
      return `<div class="hw-field hw-combobox" data-hw="combobox"><label class="hw-label" for="${uid}">${t("Find a city", "ابحث عن مدينة")}</label><input id="${uid}" class="hw-input" data-hw-combobox-input autocomplete="off" placeholder="${t("Search cities…", "ابحث عن المدن…")}"><input type="hidden" data-hw-combobox-value name="city"><ul class="hw-listbox" data-hw-combobox-list hidden>${[
        ["riyadh", "Riyadh", "الرياض"],
        ["jeddah", "Jeddah", "جدة"],
        ["dammam", "Dammam", "الدمام"],
        ["abha", "Abha", "أبها"],
      ]
        .map(
          ([v, en, ar]) =>
            `<li class="hw-option" data-hw-value="${v}">${t(en!, ar!)}</li>`,
        )
        .join(
          "",
        )}</ul><span class="hw-sr-only" data-hw-combobox-status role="status"></span></div>`;
    case "tabs":
      return `<div class="hw-tabs" data-hw="tabs"><div class="hw-tab-list" role="tablist" aria-label="${t("Example sections", "أقسام المثال")}">${["overview", "details", "history"].map((v, i) => `<button class="hw-tab" role="tab" id="${uid}-t${i}" data-hw-value="${v}" aria-controls="${uid}-p${i}" aria-selected="${i === 0}">${[t("Overview", "نظرة عامة"), t("Details", "التفاصيل"), t("History", "السجل")][i]}</button>`).join("")}</div>${["overview", "details", "history"].map((v, i) => `<section class="hw-tab-panel" role="tabpanel" id="${uid}-p${i}" aria-labelledby="${uid}-t${i}" ${i ? "hidden" : ""}>${[t("Everything you need, in one place.", "كل ما تحتاجه في مكان واحد."), t("Clear information for your next step.", "معلومات واضحة لخطوتك القادمة."), t("Your latest updates appear here.", "تظهر آخر تحديثاتك هنا.")][i]}</section>`).join("")}</div>`;
    case "dialog":
      return `${button(t("Open dialog", "افتح الحوار"), `data-hw-dialog-open="${uid}"`)}<dialog id="${uid}" class="hw-dialog" data-hw="dialog" aria-labelledby="${uid}-title"><div class="hw-dialog-header"><h2 id="${uid}-title">${t("A moment of clarity", "لحظة وضوح")}</h2>${button(icon("close"), `data-hw-dialog-close aria-label="${t("Close", "إغلاق")}"`, "ghost")}</div><div class="hw-dialog-body"><p>${t("A focused space for a meaningful decision. Escape closes this dialog and returns focus to your starting point.", "مساحة مركّزة لاتخاذ قرار واضح. يغلق مفتاح Escape الحوار ويعيد التركيز إلى نقطة البداية.")}</p></div><div class="hw-dialog-footer">${button(t("Got it", "فهمت"), "data-hw-dialog-close autofocus")}</div></dialog>`;
    case "accordion":
      return `<div class="hw-accordion" data-hw="accordion">${[t("What is Hawiyah?", "ما هي هوية؟"), t("Can I customize it?", "هل يمكنني تخصيصها؟")].map((s, i) => `<details class="hw-accordion-item"><summary class="hw-accordion-trigger">${s}</summary><div class="hw-accordion-content">${i ? t("Yes, through semantic tokens and documented variants that keep the Platforms Code requirements.", "نعم، عبر الرموز الدلالية والمتغيرات الموثقة التي تحافظ على متطلبات كود المنصات.") : t("A UI component library built to comply with the DGA Platforms Code.", "مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات.")}</div></details>`).join("")}</div>`;
    case "card":
      return `<article class="hw-card"><div class="hw-card-header"><h3 class="hw-card-title">${t("A place for your next idea", "مساحة لفكرتك القادمة")}</h3></div><div class="hw-card-body"><p class="hw-card-description">${t("Flexible parts, a consistent whole.", "أجزاء مرنة، ونتيجة متّسقة.")}</p></div><div class="hw-card-footer">${pill(t("Ready", "جاهز"), "success")}</div></article>`;
    case "badge":
      return statusMarkup("badge", state.locale, "default", uid);
    case "alert":
      return statusMarkup("alert", state.locale, "default", uid);
    case "table":
      return `<div class="hw-table-wrap"><table class="hw-table"><caption class="hw-sr-only">${t("Example requests", "طلبات توضيحية")}</caption><thead><tr><th>${t("Request", "الطلب")}</th><th>${t("Status", "الحالة")}</th></tr></thead><tbody><tr><td>${t("License renewal", "تجديد رخصة")}</td><td>${pill(t("Complete", "مكتمل"), "success")}</td></tr><tr><td>${t("Registration", "تسجيل")}</td><td>${pill(t("In review", "قيد المراجعة"), "info")}</td></tr></tbody></table></div>`;
    case "pagination":
      return paginationDemoMarkup(state.locale);
    case "breadcrumb":
      return `<nav aria-label="${t("Breadcrumb", "مسار التنقل")}"><ol class="hw-breadcrumb"><li><a href="#overview">${t("Home", "الرئيسية")}</a></li><li><a href="#discover">${t("Services", "الخدمات")}</a></li><li aria-current="page">${t("Details", "التفاصيل")}</li></ol></nav>`;
    case "progress":
      return `<label class="hw-stack">${t("Uploading · 65%", "جارٍ الرفع · 65٪")}<progress class="hw-progress" value="65" max="100"></progress></label>`;
    case "spinner":
      return loaderDemo(state.locale);
    case "skeleton":
      return `<div class="hw-stack" aria-label="${t("Loading content", "جارٍ تحميل المحتوى")}" role="status"><div class="hw-skeleton" style="height:18px;width:70%"></div><div class="hw-skeleton" style="height:12px"></div><div class="hw-skeleton" style="height:12px;width:85%"></div></div>`;
    case "avatar":
      return `<div class="hw-cluster"><span class="hw-avatar" role="img" aria-label="${t("Noura", "نورة")}">${t("N", "ن")}</span><span class="hw-avatar" role="img" aria-label="${t("Amal", "أمل")}">${t("A", "أ")}</span><span class="hw-avatar" role="img" aria-label="${t("Mohammed", "محمد")}">${t("M", "م")}</span></div>`;
    case "divider":
      return `<div class="hw-stack"><span>${t("A little breathing room", "مساحة للتنفّس")}</span><hr class="hw-divider"><span class="muted">${t("Between the things that matter.", "بين التفاصيل المهمة.")}</span></div>`;
    case "tooltip":
      return `<span data-hw="tooltip">${button(t("Hover or focus me", "مرّر أو ركّز هنا"), "data-hw-tooltip-trigger", "secondary")}<span class="hw-tooltip" role="tooltip" id="${uid}" hidden>${t("Helpful context, right here.", "معلومة مفيدة في مكانها.")}</span></span>`;
    case "upload":
      return `<label class="hw-upload">${icon("upload", 26)}<strong>${t("Choose a document", "اختر مستندًا")}</strong><span class="hw-hint">PDF · PNG · JPG</span><input type="file" accept=".pdf,.png,.jpg,.jpeg" aria-label="${t("Choose a document", "اختر مستندًا")}"></label>`;
    case "stepper":
      return stepperSample(state.locale);
    case "empty":
      return `<div class="hw-empty">${icon("search", 28)}<strong>${t("Nothing here just yet", "لا يوجد شيء هنا بعد")}</strong><p>${t("Try another search or start something new.", "جرّب بحثًا آخر أو ابدأ شيئًا جديدًا.")}</p></div>`;
  }
  return expandedSample(id, p, state.locale, state.mode === "dark" ? "dark" : "light");
}
function componentPage() {
  const list = catalog.filter(
    (c) =>
      (state.componentCategory === "All" || c[3] === state.componentCategory) &&
      normalizeSearch(c[1] + " " + c[2]).includes(
        normalizeSearch(state.componentSearch),
      ),
  );
  return `${heading(t("THE BUILDING BLOCKS", "لبنات البناء"), t("Defined for every state.", "محددة في كل حالة."), t("Each component documents its states, keyboard behavior and accessibility requirements, and shares the Platforms Code foundation.", "يوثّق كل مكوّن حالاته وسلوك لوحة المفاتيح ومتطلبات إمكانية الوصول، ويرتكز على أسس كود المنصات."))}<div class="catalog-controls"><label class="search-field">${icon("search", 18)}<input id="component-search" type="search" value="${e(state.componentSearch)}" placeholder="${t(`Search ${catalog.length} components…`, `ابحث في ${catalog.length} مكوّنًا…`)}" aria-label="${t("Search components", "البحث في المكوّنات")}"></label><div class="filter-chips" aria-label="${t("Component categories", "فئات المكوّنات")}">${["All", "Actions", "Forms", "Navigation", "Feedback", "Content", "Platforms", "Layout"].map((c) => `<button class="filter-chip ${state.componentCategory === c ? "active" : ""}" data-component-category="${c}" aria-pressed="${state.componentCategory === c}">${state.locale === "en" ? c : { All: "الكل", Actions: "الإجراءات", Forms: "النماذج", Navigation: "التنقل", Feedback: "التغذية الراجعة", Content: "المحتوى", Platforms: "المنصات", Layout: "التخطيط" }[c]}</button>`).join("")}</div></div><p class="result-count" role="status">${list.length} ${t("components", "مكوّنًا")}</p><div class="component-grid">${list.map((c) => `<article class="component-card"><div class="component-card-title"><h2><a href="#component/${c[0]}">${text([c[1], c[2]])}</a></h2><span>${categoryName(c[3])}</span></div><div class="component-preview">${inlineExample(c[0], sample(c[0], `gallery-${c[0]}`))}</div><details class="source-details"><summary>${icon("code", 15)}${t("View markup", "عرض الشفرة")}<span class="source-details-state" aria-hidden="true">${icon("add",14)}${icon("minus",14)}</span></summary>${codeBlock(sample(c[0], `example-${c[0]}`).replace(/ data-action="[^"]*"/g, ""))}</details><a class="component-card-docs" href="#component/${c[0]}">${t("Usage, API & lifecycle", "الاستخدام وواجهة البرمجة ودورة الحياة")}${icon("arrow", 15)}</a></article>`).join("")}</div>${list.length ? "" : `<div class="hw-empty"><h2>${t("No components found", "لم نعثر على مكوّنات")}</h2>${button(t("Reset search", "إعادة البحث"), 'data-action="reset-components"', "secondary")}</div>`}`;
}
function foundations() {
  const palette = [
    ["primary", t("Primary action", "الإجراء الرئيسي")],
    ["primary-subtle", t("Primary tint", "خلفية الإجراء الرئيسي")],
    ["canvas", t("Page background", "خلفية الصفحة")],
    ["text", t("Body text", "النص الأساسي")],
    ["surface", t("Surface", "سطح")],
    ["border", t("Border", "حدود")],
    ["success", t("Success", "نجاح")],
    ["warning", t("Warning", "تحذير")],
  ];
  return `${heading(t("THE SHARED LANGUAGE", "اللغة المشتركة"), t("Configurable within the standard.", "قابلة للضبط ضمن المعيار."), t("Themes, typography, spacing and density are controlled through semantic tokens.", "تُضبط السمات والخطوط والمسافات والكثافة عبر الرموز الدلالية."))}<div class="theme-toolbar"><label class="hw-field"><span class="hw-label">${t("Density", "الكثافة")}</span><select id="density-select" class="hw-select"><option value="comfortable" ${state.density === "comfortable" ? "selected" : ""}>${t("Comfortable", "مريحة")}</option><option value="compact" ${state.density === "compact" ? "selected" : ""}>${t("Compact", "مكثّفة")}</option><option value="mobile" ${state.density === "mobile" ? "selected" : ""}>${t("Mobile", "الجوال")}</option></select></label><label class="hw-field"><span class="hw-label">${t("Direction", "الاتجاه")}</span><select id="direction-select" class="hw-select"><option value="ltr" ${document.documentElement.dir === "ltr" ? "selected" : ""}>${t("Left to right", "من اليسار إلى اليمين")}</option><option value="rtl" ${document.documentElement.dir === "rtl" ? "selected" : ""}>${t("Right to left", "من اليمين إلى اليسار")}</option></select></label>${button(icon("download", 17) + t("Export theme CSS", "تصدير CSS للسمة"), 'data-action="export-theme"', "secondary")}</div><section class="section"><h2>${t("Color with a purpose", "ألوان ذات معنى")}</h2><div class="swatch-grid">${palette.map(([key, label]) => `<div class="swatch-card"><div class="swatch" style="background:var(--hw-color-${key})"></div><strong>${label}</strong><code>--hw-color-${key}</code></div>`).join("")}</div></section><section class="foundation-split"><div class="type-specimen"><div class="eyebrow">${t("TYPOGRAPHY", "الخطوط")}</div><p class="type-display" lang="ar" dir="rtl">وضوحٌ يربط التفاصيل</p><p class="type-display latin" lang="en" dir="ltr">Clarity, woven together.</p><p>${t("Readable rhythm in both languages. Type scales serve the content, from a public service page to a working dashboard.", "إيقاع مقروء في اللغتين. مقاييس خط تخدم المحتوى، من صفحة خدمة عامة إلى لوحة عمل.")}</p></div><div class="foundation-preview"><div class="eyebrow">${t("SAME COMPONENTS, YOUR EXPRESSION", "المكوّنات نفسها، بتعبيرك")}</div>${sample("text-field", "theme")}${sample("button", "theme")}${sample("alert", "theme")}</div></section><section class="section"><h2>${t("Space to make sense", "مساحة للوضوح")}</h2><div class="spacing-scale">${[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => `<div><span style="width:var(--hw-space-${n})"></span><code>${n}</code></div>`).join("")}</div></section>${codeBlock(":root {\n  --hw-color-primary: #1B8354;\n  --hw-color-primary-hover: #166A45;\n  --hw-color-primary-subtle: #F3FCF6;\n  --hw-radius-md: 0.5rem;\n}\n/* Components keep the same behavior. */")}${foundationExamples(state.locale)}`;
}
function serviceCard(s: Service) {
  return `<article class="service-card"><div class="service-card-top"><span class="service-icon">${icon(s.icon, 23)}</span>${"popular" in s ? pill(t("Popular", "شائعة"), "success") : ""}</div><h2>${text(s.title)}</h2><p>${text(s.description)}</p><div class="service-meta"><span>${icon("clock", 15)}${s.days} ${t("working days", "أيام عمل")}</span><span>${s.fee ? riyalAmount(String(s.fee), state.locale, 'before') : t("Free", "مجانية")}</span></div><button class="service-link" data-service="${s.id}">${t("View service", "عرض الخدمة")}${icon("arrow", 18)}</button></article>`;
}
function discovery() {
  const filtered = services.filter(
    (s) =>
      (state.category === "all" || s.category === state.category) &&
      normalizeSearch(text(s.title) + " " + text(s.description)).includes(
        normalizeSearch(state.search),
      ),
  );
  const pages = Math.ceil(filtered.length / 6);
  state.page = Math.min(state.page, Math.max(pages, 1));
  return `${heading(t("EXPERIENCE / 01", "التجربة / 01"), t("Service discovery.", "الوصول إلى الخدمة."), t("Search, browse and open a service with clear eligibility and next steps.", "البحث عن الخدمة وتصفحها وفتحها، مع توضيح الأهلية والخطوات التالية."))}<div class="demo-notice">${icon("spark", 16)}${t("An interactive example with fictional services. No requests are sent.", "مثال تفاعلي بخدمات افتراضية. لا تُرسل أي طلبات.")}</div><div class="discovery-search"><label class="search-field">${icon("search", 21)}<input id="service-search" type="search" value="${e(state.search)}" placeholder="${t("What would you like to do?", "ماذا تود أن تفعل؟")}" aria-label="${t("Search services", "ابحث عن الخدمات")}"></label><div class="filter-chips">${[
    ["all", "All services", "كل الخدمات"],
    ["business", "Business", "الأعمال"],
    ["personal", "Individuals", "الأفراد"],
    ["municipal", "Municipal", "البلدية"],
  ]
    .map(
      ([v, en, ar]) =>
        `<button class="filter-chip ${state.category === v ? "active" : ""}" data-category="${v}" aria-pressed="${state.category === v}">${t(en!, ar!)}</button>`,
    )
    .join(
      "",
    )}</div></div><div class="section-heading"><p class="result-count" role="status">${filtered.length} ${t("services to help you move forward", "خدمات تساعدك على الانطلاق")}</p>${button(t("Reset filters", "إعادة ضبط الفلاتر"), 'data-action="reset-services" data-size="sm"', "ghost")}</div><div class="services-grid">${filtered
    .slice((state.page - 1) * 6, state.page * 6)
    .map(serviceCard)
    .join(
      "",
    )}</div>${!filtered.length ? `<div class="hw-empty">${icon("search", 32)}<h2>${t("Let’s try another way", "لنجرّب طريقة أخرى")}</h2><p>${t("Try a different word or clear your filters.", "جرّب كلمة أخرى أو امسح الفلاتر.")}</p>${button(t("Show all services", "عرض كل الخدمات"), 'data-action="reset-services"', "secondary")}</div>` : ""}<nav class="page-pagination" aria-label="${t("Service pages", "صفحات الخدمات")}">${Array.from({ length: pages }, (_, i) => button(String(i + 1), `data-service-page="${i + 1}" ${state.page === i + 1 ? 'aria-current="page"' : ""}`, state.page === i + 1 ? "primary" : "ghost")).join("")}</nav><dialog id="service-dialog" class="hw-dialog service-dialog" data-hw="dialog" aria-labelledby="service-dialog-title"><div id="service-dialog-content"></div></dialog>`;
}
function application() {
  if (state.submitted)
    return `<div class="success-page"><span class="success-icon">${icon("check", 40)}</span><div class="eyebrow">${t("EXAMPLE COMPLETE", "اكتمل المثال")}</div><h1>${t("A good beginning.", "بداية موفّقة.")}</h1><p>${t("You have completed the sample application. In a connected platform, this is where your reference and next steps would appear.", "لقد أكملت الطلب التجريبي. في منصة متصلة، يظهر هنا الرقم المرجعي والخطوات التالية.")}</p><div class="reference-box"><span>${t("Demo reference", "مرجع توضيحي")}</span><strong dir="ltr">HW-DEMO-1043</strong></div><div class="hw-cluster">${button(t("Start another example", "بدء مثال جديد"), 'data-action="restart-application"', "secondary")}<a class="hw-button" href="#workspace">${t("Explore request tracking", "استكشف متابعة الطلبات")}${icon("arrow", 17)}</a></div></div>`;
  const step = state.applicationStep;
  const d = state.draft;
  return `${heading(t("EXPERIENCE / 02", "التجربة / 02"), t("Guided application.", "تقديم الطلب خطوة بخطوة."), t("A structured path from the first field to the final review.", "مسار منظم من أول حقل حتى المراجعة النهائية."))}<div class="application-layout"><div class="application-main"><ol class="app-stepper" aria-label="${t("Application steps", "خطوات الطلب")}">${[t("Your details", "تفاصيلك"), t("Documents", "المستندات"), t("Review", "المراجعة")].map((s, i) => `<li class="${i === step ? "current" : i < step ? "complete" : ""}" ${i === step ? 'aria-current="step"' : ""}><span>${i < step ? icon("check", 16) : i + 1}</span><strong>${s}</strong></li>`).join("")}</ol><form id="application-form" class="application-form"><div class="form-step-label">${t("STEP", "الخطوة")} ${step + 1} / 3</div><h2>${[t("Tell us about your business", "أخبرنا عن منشأتك"), t("Bring the details together", "اجمع التفاصيل"), t("A final look before you go", "نظرة أخيرة قبل الإرسال")][step]}</h2><p class="muted">${[t("A few essentials to get you started. Fields marked * are required.", "بعض الأساسيات للبدء. الحقول المعلّمة * مطلوبة."), t("Use a sample file. Documents stay in this browser and are never uploaded.", "استخدم ملفًا تجريبيًا. تبقى المستندات في المتصفح ولا تُرفع."), t("Check your information. You can go back and make changes at any time.", "تحقّق من المعلومات. يمكنك العودة والتعديل في أي وقت.")][step]}</p>
 ${
   step === 0
     ? `<div class="form-grid"><label class="hw-field full"><span class="hw-label">${t("Business name", "اسم المنشأة")} *</span><input class="hw-input" id="business-name" name="business" required minlength="2" value="${e(d.business)}" placeholder="${t("For example, Hawiyah Studio", "مثلًا: استوديو هوية")}"></label><label class="hw-field"><span class="hw-label">${t("Activity", "النشاط")} *</span><select name="activity" id="business-activity" class="hw-select">${[
         ["retail", "Retail", "تجارة التجزئة"],
         ["consulting", "Consulting", "استشارات"],
         ["other", "Other", "آخر"],
       ]
         .map(
           ([v, en, ar]) =>
             `<option value="${v}" ${d.activity === v ? "selected" : ""}>${t(en!, ar!)}</option>`,
         )
         .join(
           "",
         )}</select></label><label class="hw-field"><span class="hw-label">${t("City", "المدينة")} *</span><select name="city" class="hw-select" required><option value="">${t("Select a city", "اختر مدينة")}</option>${[
         ["riyadh", "Riyadh", "الرياض"],
         ["jeddah", "Jeddah", "جدة"],
         ["dammam", "Dammam", "الدمام"],
       ]
         .map(
           ([v, en, ar]) =>
             `<option value="${v}" ${d.city === v ? "selected" : ""}>${t(en!, ar!)}</option>`,
         )
         .join(
           "",
         )}</select></label>${d.activity === "other" ? `<label class="hw-field full"><span class="hw-label">${t("Describe your activity", "صِف نشاطك")} *</span><textarea class="hw-textarea" name="description" required>${e(d.description)}</textarea></label>` : ""}<label class="hw-field full"><span class="hw-label">${t("Contact email", "البريد الإلكتروني")} *</span><input type="email" class="hw-input" name="email" required value="${e(d.email)}" placeholder="hello@example.com" dir="ltr"><span class="hw-hint">${t("Use a fictional address for this demo.", "استخدم عنوانًا افتراضيًا لهذا المثال.")}</span></label></div>`
     : step === 1
       ? `<div class="document-checklist"><div>${icon("check", 18)}<span>${t("Business details", "معلومات المنشأة")}</span>${pill(t("Ready", "جاهزة"), "success")}</div><div>${icon("file", 18)}<span>${t("Supporting document", "مستند داعم")}</span>${pill(t("Optional in this demo", "اختياري في المثال"))}</div></div><label class="hw-upload application-upload">${icon("upload", 34)}<strong>${state.fileName ? e(state.fileName) : t("Choose a supporting document", "اختر مستندًا داعمًا")}</strong><span>${t("PDF, PNG or JPG · Up to 5 MB", "PDF أو PNG أو JPG · حتى 5 ميجابايت")}</span><input id="application-file" type="file" accept=".pdf,.png,.jpg,.jpeg" aria-label="${t("Supporting document", "مستند داعم")}"></label><p id="file-error" class="hw-error" role="alert"></p>`
       : `<dl class="review-list"><div><dt>${t("Service", "الخدمة")}</dt><dd>${text(state.service.title)}</dd></div><div><dt>${t("Business name", "اسم المنشأة")}</dt><dd>${e(d.business)}</dd></div><div><dt>${t("Activity", "النشاط")}</dt><dd>${({ retail: t("Retail", "تجارة التجزئة"), consulting: t("Consulting", "استشارات"), other: t("Other", "آخر") } as Record<string, string>)[d.activity] || e(d.activity)}</dd></div>${d.activity === "other" ? `<div><dt>${t("Activity details", "تفاصيل النشاط")}</dt><dd>${e(d.description)}</dd></div>` : ""}<div><dt>${t("City", "المدينة")}</dt><dd>${({ riyadh: t("Riyadh", "الرياض"), jeddah: t("Jeddah", "جدة"), dammam: t("Dammam", "الدمام") } as Record<string, string>)[d.city] || e(d.city)}</dd></div><div><dt>${t("Email", "البريد الإلكتروني")}</dt><dd dir="ltr">${e(d.email)}</dd></div><div><dt>${t("Document", "المستند")}</dt><dd>${e(state.fileName || t("Not attached", "غير مرفق"))}</dd></div></dl><label class="choice-line declaration"><input type="checkbox" class="hw-checkbox" name="declaration" required ${d.declaration ? "checked" : ""}>${t("I understand this is a demonstration and no real application will be submitted.", "أفهم أن هذا مثال توضيحي ولن يُرسل طلب فعلي.")}</label>`
 }
 <div class="form-actions">${step ? button(icon("arrow-back", 16) + t("Back", "السابق"), 'data-action="previous-step"', "ghost") : button(t("Save demo draft", "حفظ المسودة التجريبية"), 'data-action="save-draft"', "ghost")}<button class="hw-button" type="submit">${step === 2 ? t("Complete example", "إكمال المثال") : t("Continue", "متابعة")}${icon("arrow", 17)}</button></div></form></div><aside class="application-aside"><span class="service-icon">${icon(state.service.icon, 25)}</span><h3>${text(state.service.title)}</h3><p>${text(state.service.description)}</p><div class="aside-fact">${icon("clock", 18)}<div><span>${t("Estimated processing", "المدة المتوقعة")}</span><strong>${state.service.days} ${t("working days", "أيام عمل")}</strong></div></div><div class="aside-fact">${icon("file", 18)}<div><span>${t("Service fee", "رسوم الخدمة")}</span><strong>${state.service.fee ? riyalAmount(String(state.service.fee), state.locale) : t("Free", "مجانية")}</strong></div></div><div class="aside-help"><strong>${t("A little help along the way", "مساعدة في كل خطوة")}</strong><p>${t("Your progress stays here while you explore. Only a draft you explicitly save is kept on this device.", "يبقى تقدّمك أثناء التجربة. تُحفظ على هذا الجهاز فقط المسودة التي تختار حفظها.")}</p>${button(t("Load saved draft", "استرجاع المسودة"), 'data-action="load-draft" data-size="sm"', "secondary")}</div></aside></div>`;
}
function workspace() {
  const rows = requests.filter(
    (r) =>
      (state.requestStatus === "all" || r.status === state.requestStatus) &&
      normalizeSearch(r.id + " " + text(r.name)).includes(
        normalizeSearch(state.requestSearch),
      ),
  );
  return `${heading(t("EXPERIENCE / 03", "التجربة / 03"), t("Request tracking.", "متابعة الطلبات."), t("Requests, their status, and the actions that are required.", "الطلبات وحالاتها والإجراءات المطلوبة."), `<a class="hw-button" href="#apply" data-action="new-application">${t("New request", "طلب جديد")}${icon("arrow", 17)}</a>`)}<div class="demo-notice">${icon("spark", 16)}${t("Sample workspace · All records are fictional.", "مساحة عمل توضيحية · كل السجلات افتراضية.")}</div><div class="metrics-row">${[
    [t("Total requests", "إجمالي الطلبات"), "5", "briefcase"],
    [t("In review", "قيد المراجعة"), "1", "clock"],
    [t("Needs attention", "تحتاج إجراء"), "1", "message"],
    [t("Completed", "مكتملة"), "2", "check"],
  ]
    .map(
      ([l, v, i]) =>
        `<div class="metric"><span>${l}</span><strong>${v}</strong>${icon(i!, 23)}</div>`,
    )
    .join(
      "",
    )}</div><section class="workspace-panel"><div class="workspace-toolbar"><label class="search-field">${icon("search", 18)}<input id="request-search" type="search" value="${e(state.requestSearch)}" placeholder="${t("Search requests…", "ابحث في الطلبات…")}" aria-label="${t("Search requests", "ابحث في الطلبات")}"></label><label class="status-filter"><span class="hw-sr-only">${t("Filter by status", "تصفية حسب الحالة")}</span><select class="hw-select" id="request-status"><option value="all">${t("All statuses", "كل الحالات")}</option>${["review", "action", "completed", "draft"].map((s) => `<option value="${s}" ${state.requestStatus === s ? "selected" : ""}>${statusLabel(s)}</option>`).join("")}</select></label></div>${state.selected.size ? `<div class="bulk-bar"><span>${state.selected.size} ${t("selected", "محدد")}</span>${button(icon("download", 15) + t("Export selected", "تصدير المحدد"), 'data-action="export-selected" data-size="sm"', "secondary")}${button(t("Clear selection", "إلغاء التحديد"), 'data-action="clear-selection" data-size="sm"', "ghost")}</div>` : ""}<div class="hw-table-wrap"><table class="hw-table requests-table"><caption class="hw-sr-only">${t("Your sample requests", "طلباتك التوضيحية")}</caption><thead><tr><th><input class="hw-checkbox" id="select-all" type="checkbox" ${rows.length && rows.every((r) => state.selected.has(r.id)) ? "checked" : ""} aria-label="${t("Select visible requests", "تحديد الطلبات الظاهرة")}"></th><th>${t("Request", "الطلب")}</th><th>${t("Reference", "المرجع")}</th><th>${t("Submitted", "تاريخ التقديم")}</th><th>${t("Status", "الحالة")}</th><th><span class="hw-sr-only">${t("Details", "التفاصيل")}</span></th></tr></thead><tbody>${rows.map((r) => `<tr><td><input class="hw-checkbox" type="checkbox" data-select="${r.id}" ${state.selected.has(r.id) ? "checked" : ""} aria-label="${e(t("Select ", "تحديد ") + text(r.name))}"></td><td><strong>${text(r.name)}</strong></td><td class="reference" dir="ltr">${r.id}</td><td>${formatDate(r.date + "T12:00:00Z", { locale: state.locale === "ar" ? "ar-SA" : "en-GB", month: "short", day: "numeric" })}</td><td>${pill(statusLabel(r.status), statusTone(r.status))}</td><td><button class="icon-button" data-request="${r.id}" aria-label="${e(t("View ", "عرض ") + text(r.name))}">${icon("arrow", 18)}</button></td></tr>`).join("")}</tbody></table></div>${!rows.length ? `<div class="hw-empty">${t("No matching requests. Try another search.", "لا توجد طلبات مطابقة. جرّب بحثًا آخر.")}</div>` : ""}<div class="table-footer"><span role="status">${rows.length} ${t("requests", "طلبات")}</span><span>${t("Sample data · October 2026", "بيانات توضيحية · أكتوبر 2026")}</span></div></section><dialog id="request-dialog" class="hw-dialog" data-hw="dialog" aria-labelledby="request-title"><div id="request-content"></div></dialog>`;
}
function brand() {
  return `${heading(t("THE HAWIYAH WORDMARK", "شعار هوية"), t("One wordmark. Platforms Code colors.", "شعار واحد. بألوان كود المنصات."), t("The Arabic wordmark is the complete Hawiyah logo, shown in the Platforms Code primary color.", "الشعار العربي هو شعار هوية كاملًا، ويظهر باللون الأساسي لكود المنصات."))}<section class="brand-showcase"><img src="${base}brand/assets/hawiyah-lockup-bilingual.svg" alt="Hawiyah — هوية"><p>${t("Different parts. One identity.", "تفاصيل مختلفة. هوية واحدة.")}</p></section><div class="brand-principles"><article><span>01</span><h2>${t("Arabic, by name", "عربيٌ باسمه")}</h2><p>${t("The Arabic name هوية stands alone in outlined Aref Ruqaa lettering. No separate icon or Latin wordmark.", "اسم هوية وحده بحروف عارف رقعة المحوّلة إلى مسارات متجهة. دون رمز منفصل أو كتابة لاتينية.")}</p></article><article><span>02</span><h2>${t("Considered", "مدروس")}</h2><p>${t("Calm colors, clear typography, and purposeful space.", "ألوان هادئة، وخطوط واضحة، ومساحات هادفة.")}</p></article><article><span>03</span><h2>${t("Adaptable", "مرن")}</h2><p>${t("A consistent foundation with room for individual expression.", "أساس متّسق يترك مساحة للتعبير الخاص.")}</p></article></div><a class="hw-button" href="${base}brand/${state.locale === "ar" ? "index.html" : "index-en.html"}" target="_blank" rel="noopener">${t("Open the complete identity guide", "افتح دليل الهوية الكامل")}${icon("arrow", 17)}</a>`;
}

function applySettings() {
  document.documentElement.lang = state.locale;
  document.documentElement.dataset.hwTheme = state.theme;
  document.documentElement.dataset.hwMode = state.mode;
  document.documentElement.dataset.hwDensity = state.density;
  document.documentElement.style.colorScheme = state.mode;
  const custom = state.mode === 'dark'
    ? {primary:'#A4BCFD', 'primary-hover':'#B2CCFF', 'primary-active':'#C7D7FE', 'on-primary':'#101828', 'primary-subtle':'#1D2939', 'primary-text':'#B2CCFF'}
    : {primary:'#293B8F', 'primary-hover':'#1D2C70', 'primary-active':'#18245C', 'on-primary':'#FFFFFF', 'primary-subtle':'#DADFF7', 'primary-text':'#293B8F'};
  for (const [key, value] of Object.entries(custom)) {
    if (state.theme === 'custom') document.documentElement.style.setProperty('--hw-color-' + key, value);
    else document.documentElement.style.removeProperty('--hw-color-' + key);
  }
}
function render() {
  const active = document.activeElement as HTMLInputElement | null;
  const activeId = active?.id;
  const selection = active?.selectionStart;
  dispose();
  applySettings();
  app.innerHTML = shell();
  const pageTitle = guideTitle(state.view, state.locale) || app.querySelector('main h1')?.textContent?.trim() || t('Guide & playground', 'الدليل ومساحة التجربة');
  document.title = `${pageTitle} · ${t('Hawiyah — هوية', 'هوية — Hawiyah')}`;
  document.body.classList.toggle("navigation-open", state.mobileNav);
  document.documentElement.classList.toggle("navigation-open", state.mobileNav);
  const unpreviews = bindDemoPreviews(app, state.locale);
  const unguide = bindGuide(app);
  const unhome = bindHome(app, state.locale);
  const untemplates = bindDgaTemplates(app, state.locale);
  const unenhance = enhance(app);
  const unlayout = bindLayoutStudio(app, state.locale);
  const uninput = bindInputLab(app);
  const unsteppers = bindStepperSamples(app);
  dispose = () => {
    unpreviews();
    unguide();
    unhome();
    untemplates();
    uninput();
    unsteppers();
    unlayout();
    unenhance();
  };
  if (activeId) {
    const next = document.getElementById(activeId) as HTMLInputElement | null;
    next?.focus({ preventScroll: true });
    try {
      if (selection != null) next?.setSelectionRange(selection, selection);
    } catch {}
  }
}
// Toggle the shell in place so opening navigation preserves live component state.
function setMobileNavigation(open: boolean, focus: 'toggle' | 'main' | 'none' = 'toggle') {
  state.mobileNav = open && mobileViewport.matches;
  const sidebar = app.querySelector<HTMLElement>('#site-navigation');
  if (!sidebar) return;
  sidebar.classList.toggle('mobile-open', state.mobileNav);
  if (state.mobileNav) {
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
  } else {
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
  }
  app.querySelectorAll<HTMLElement>('.main-shell,.skip-link').forEach(node => node.inert = state.mobileNav);
  app.querySelector('.mobile-menu')?.setAttribute('aria-expanded', String(state.mobileNav));
  document.body.classList.toggle('navigation-open', state.mobileNav);
  document.documentElement.classList.toggle('navigation-open', state.mobileNav);
  let backdrop = app.querySelector<HTMLButtonElement>('.nav-backdrop');
  if (state.mobileNav && !backdrop) {
    backdrop = document.createElement('button');
    backdrop.className = 'nav-backdrop';
    backdrop.type = 'button';
    backdrop.dataset.action = 'menu';
    backdrop.setAttribute('aria-label', t('Close navigation', 'أغلق التنقّل'));
    backdrop.tabIndex = -1;
    sidebar.after(backdrop);
  } else if (!state.mobileNav) backdrop?.remove();
  if (state.mobileNav) {
    sidebar.scrollTop = 0;
    // Inherited visibility can settle after inert focus cleanup; focus only when ready.
    const focusClose = () => {
      if (!state.mobileNav || !sidebar.isConnected) return;
      const close = sidebar.querySelector<HTMLElement>('.sidebar-close');
      if (!close) return;
      if (getComputedStyle(close).visibility !== 'visible') {
        requestAnimationFrame(focusClose);
        return;
      }
      close.focus({ preventScroll: true });
    };
    requestAnimationFrame(focusClose);
  } else if (focus !== 'none') {
    app.querySelector<HTMLElement>(focus === 'main' ? '#main' : '.mobile-menu')?.focus({ preventScroll: true });
  }
}
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const el = document.getElementById("toast")!;
  clearTimeout(toastTimer);
  el.textContent = message;
  el.hidden = false;
  toastTimer = setTimeout(() => (el.hidden = true), 3500);
}
function download(name: string, value: string, type: string) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(new Blob([value], { type }));
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function captureDraft() {
  const form = document.querySelector<HTMLFormElement>("#application-form");
  if (!form) return;
  const data = new FormData(form);
  for (const key of [
    "business",
    "city",
    "email",
    "activity",
    "description",
  ] as const) {
    const v = data.get(key);
    if (typeof v === "string") state.draft[key] = v;
  }
}
app.addEventListener("click", async (event) => {
  const el = (event.target as Element).closest<HTMLElement>("button,a");
  if (!el) return;
  if (event.defaultPrevented && el.tagName === "A") return;
  if (state.mobileNav && el.matches('#site-navigation a[href^="#"]') &&
      !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    const sameRoute = el.getAttribute('href') === location.hash;
    setMobileNavigation(false, sameRoute ? 'main' : 'none');
    if (sameRoute) {
      event.preventDefault();
      return;
    }
  }
  if (el.matches(".skip-link, .hw-skip-link") && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    const href = el.getAttribute("href");
    const target = href?.startsWith("#") ? document.getElementById(href.slice(1)) : null;
    if (target) {
      event.preventDefault();
      target.focus();
      return;
    }
  }
  if (el.dataset.docSection) {
    const section = document.getElementById(el.dataset.docSection);
    section?.scrollIntoView({ behavior: "instant", block: "start" });
    section?.setAttribute("tabindex", "-1");
    section?.focus({ preventScroll: true });
    return;
  }
  if (el.dataset.framework) {
    state.framework = el.dataset.framework;
    localStorage.setItem("hawiyah-framework", state.framework);
    render();
    return;
  }
  if (el.dataset.componentCategory) {
    state.componentCategory = el.dataset.componentCategory;
    render();
    return;
  }
  if (el.dataset.category) {
    state.category = el.dataset.category;
    state.page = 1;
    render();
    return;
  }
  if (el.dataset.servicePage) {
    state.page = Number(el.dataset.servicePage);
    render();
    return;
  }
  if (el.dataset.copy !== undefined) {
    try {
      await navigator.clipboard.writeText(el.dataset.copy);
      toast(t("Copied to clipboard", "تم النسخ"));
    } catch {
      toast(t("Select and copy the code below.", "حدّد الشفرة وانسخها."));
    }
    return;
  }
  if (el.dataset.service) {
    const service = services.find((s) => s.id === el.dataset.service)!;
    state.service = service;
    document.getElementById("service-dialog-content")!.innerHTML =
      `<div class="hw-dialog-header"><span class="service-icon">${icon(service.icon, 24)}</span>${button(icon("close"), `data-hw-dialog-close aria-label="${t("Close", "إغلاق")}"`, "ghost")}</div><div class="hw-dialog-body"><h2 id="service-dialog-title">${text(service.title)}</h2><p>${text(service.description)}</p><dl class="review-list"><div><dt>${t("Fee", "الرسوم")}</dt><dd>${service.fee ? formatRiyal(service.fee, state.locale) : t("Free", "مجانية")}</dd></div><div><dt>${t("Time", "المدة")}</dt><dd>${service.days} ${t("working days", "أيام عمل")}</dd></div></dl><h3>${t("Before you begin", "قبل البدء")}</h3><ul><li>${t("Prepare your organization details.", "جهّز معلومات منشأتك.")}</li><li>${t("Have a contact email ready.", "جهّز بريدًا إلكترونيًا للتواصل.")}</li><li>${t("Review supporting document requirements.", "راجع متطلبات المستندات الداعمة.")}</li></ul></div><div class="hw-dialog-footer">${button(t("Start example application", "بدء طلب تجريبي"), 'data-action="start-service"')}</div>`;
    (
      document.getElementById("service-dialog") as HTMLDialogElement
    ).showModal();
    return;
  }
  if (el.dataset.request) {
    const r = requests.find((r) => r.id === el.dataset.request)!;
    document.getElementById("request-content")!.innerHTML =
      `<div class="hw-dialog-header"><h2 id="request-title">${text(r.name)}</h2>${button(icon("close"), `data-hw-dialog-close aria-label="${t("Close", "إغلاق")}"`, "ghost")}</div><div class="hw-dialog-body"><p class="reference" dir="ltr">${r.id}</p>${pill(statusLabel(r.status), statusTone(r.status))}<ol class="request-timeline">${[t("Application prepared", "تم إعداد الطلب"), t("Documents received", "تم استلام المستندات"), t("Under review", "قيد المراجعة"), t("Completed", "مكتمل")].map((x, i) => `<li class="${i <= r.step ? "done" : ""}"><span>${i <= r.step ? icon("check", 13) : ""}</span><div><strong>${x}</strong><p>${i === r.step ? t("Current stage", "المرحلة الحالية") : i < r.step ? t("Complete", "مكتمل") : t("Coming next", "الخطوة القادمة")}</p></div></li>`).join("")}</ol>${r.status === "action" ? `<div class="hw-alert" data-tone="warning"><p>${t("Next step: attach an updated supporting document. This is a sample status.", "الخطوة التالية: أرفق مستندًا داعمًا محدّثًا. هذه حالة توضيحية.")}</p></div>` : ""}</div><div class="hw-dialog-footer">${button(t("Close details", "إغلاق التفاصيل"), "data-hw-dialog-close", "secondary")}</div>`;
    (
      document.getElementById("request-dialog") as HTMLDialogElement
    ).showModal();
    return;
  }
  switch (el.dataset.action) {
    case "reset-component-demo":
      render();
      break;
    case "mode":
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("hawiyah-mode", state.mode);
      render();
      break;
    case "locale":
      captureDraft();
      state.locale = state.locale === "en" ? "ar" : "en";
      document.documentElement.dir = state.locale === "ar" ? "rtl" : "ltr";
      localStorage.setItem("hawiyah-locale", state.locale);
      render();
      break;
    case "menu":
      setMobileNavigation(!state.mobileNav);
      break;
    case "search-components":
      guideSearch.open();
      break;
    case "demo-continue":
      toast(
        t("A small action. A clear response.", "إجراء بسيط. استجابة واضحة."),
      );
      break;
    case "demo-info":
      toast(
        t(
          "Customize this component with tokens, variants, and composition.",
          "خصّص هذا المكوّن بالرموز والأنماط والتركيب.",
        ),
      );
      break;
    case "reset-components":
      state.componentSearch = "";
      state.componentCategory = "All";
      render();
      break;
    case "reset-services":
      state.search = "";
      state.category = "all";
      state.page = 1;
      render();
      break;
    case "start-service":
      state.applicationStep = 0;
      state.submitted = false;
      location.hash = "apply";
      break;
    case "previous-step":
      captureDraft();
      state.applicationStep--;
      render();
      break;
    case "save-draft":
      captureDraft();
      localStorage.setItem("hawiyah-demo-draft", JSON.stringify(state.draft));
      toast(
        t(
          "Demo draft saved on this device.",
          "حُفظت المسودة التجريبية على هذا الجهاز.",
        ),
      );
      break;
    case "load-draft":
      try {
        const saved = JSON.parse(
          localStorage.getItem("hawiyah-demo-draft") || "null",
        );
        if (!saved) throw new Error();
        for (const key of [
          "business",
          "city",
          "email",
          "activity",
          "description",
        ] as const)
          if (typeof saved[key] === "string") state.draft[key] = saved[key];
        state.applicationStep = 0;
        render();
        toast(t("Draft restored.", "تم استرجاع المسودة."));
      } catch {
        toast(
          t(
            "No saved draft on this device.",
            "لا توجد مسودة محفوظة على هذا الجهاز.",
          ),
        );
      }
      break;
    case "new-application":
    case "restart-application":
      state.applicationStep = 0;
      state.submitted = false;
      state.draft = {
        business: "",
        city: "",
        email: "",
        activity: "retail",
        description: "",
        declaration: false,
      };
      state.fileName = "";
      render();
      break;
    case "clear-selection":
      state.selected.clear();
      render();
      break;
    case "export-selected":
      download(
        "hawiyah-demo-requests.json",
        JSON.stringify(
          requests.filter((r) => state.selected.has(r.id)),
          null,
          2,
        ),
        "application/json",
      );
      toast(
        t(
          "Selected sample records exported.",
          "تم تصدير السجلات التجريبية المحددة.",
        ),
      );
      break;
    case "export-theme": {
      const css = getComputedStyle(document.documentElement);
      const names = [
        "primary",
        "primary-hover",
        "primary-subtle",
        "text",
        "canvas",
        "surface",
      ];
      download(
        "hawiyah-theme.css",
        `:root {\n${names.map((n) => `  --hw-color-${n}: ${css.getPropertyValue("--hw-color-" + n).trim()};`).join("\n")}\n}`,
        "text/css",
      );
      break;
    }
  }
});
app.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  if (target.closest("#application-form")) {
    captureDraft();
    if (target.name === "declaration") state.draft.declaration = target.checked;
  }
  switch (target.id) {
    case "service-search":
      state.search = target.value;
      state.page = 1;
      render();
      break;
    case "component-search":
      state.componentSearch = target.value;
      render();
      break;
    case "request-search":
      state.requestSearch = target.value;
      render();
      break;
  }
});
app.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;
  switch (target.id) {
    case "density-select":
      state.density = target.value;
      render();
      break;
    case "direction-select":
      document.documentElement.dir = target.value;
      render();
      break;
    case "business-activity":
      captureDraft();
      render();
      break;
    case "request-status":
      state.requestStatus = target.value;
      render();
      break;
    case "select-all": {
      const rows = requests.filter(
        (r) =>
          (state.requestStatus === "all" || r.status === state.requestStatus) &&
          normalizeSearch(r.id + " " + text(r.name)).includes(
            normalizeSearch(state.requestSearch),
          ),
      );
      for (const r of rows)
        target.checked ? state.selected.add(r.id) : state.selected.delete(r.id);
      render();
      break;
    }
    case "application-file": {
      const f = target.files?.[0];
      if (!f) break;
      const err = document.getElementById("file-error")!;
      if (f.size > 5 * 1024 * 1024 || !/\.(pdf|png|jpe?g)$/i.test(f.name)) {
        err.textContent = t(
          "Choose a PDF, PNG, or JPG smaller than 5 MB.",
          "اختر PDF أو PNG أو JPG بحجم أقل من 5 ميجابايت.",
        );
        target.value = "";
        state.fileName = "";
      } else {
        state.fileName = f.name;
        render();
      }
      break;
    }
  }
  if (target.dataset.select) {
    target.checked
      ? state.selected.add(target.dataset.select)
      : state.selected.delete(target.dataset.select);
    render();
  }
});
app.addEventListener("submit", (event) => {
  if (event.defaultPrevented) return;
  if ((event.target as HTMLElement).id !== "application-form") return;
  event.preventDefault();
  captureDraft();
  if (state.applicationStep < 2) state.applicationStep++;
  else {
    state.submitted = true;
    localStorage.removeItem("hawiyah-demo-draft");
  }
  render();
  document
    .querySelector<HTMLElement>(".application-form h2,.success-page h1")
    ?.setAttribute("tabindex", "-1");
  document
    .querySelector<HTMLElement>(".application-form h2,.success-page h1")
    ?.focus();
});
window.addEventListener("hashchange", () => {
  captureDraft();
  state.view = location.hash.slice(1) || "overview";
  state.mobileNav = false;
  render();
  window.scrollTo({ top: 0 });
  document.getElementById("main")?.focus({ preventScroll: true });
});
document.addEventListener('keydown', event => {
  if (!state.mobileNav || document.querySelector('dialog[open]')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    setMobileNavigation(false);
  }
  if (event.key === 'Tab') {
    const links = [...app.querySelectorAll<HTMLElement>('.sidebar a, .sidebar button, .sidebar summary')].filter(el => el.getClientRects().length);
    const first = links[0], last = links.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
mobileViewport.addEventListener('change', () => {
  if (state.mobileNav) {
    const focusInNavigation = app.querySelector('#site-navigation')?.contains(document.activeElement);
    setMobileNavigation(false, 'none');
    if (focusInNavigation) app.querySelector<HTMLElement>('#site-navigation a[aria-current="page"],.sidebar .brand')?.focus({ preventScroll:true });
  }
});
const guideSearch = createGuideSearch({ getLocale: () => state.locale });
if (import.meta.hot) import.meta.hot.dispose(() => { dispose(); guideSearch.destroy(); });
document.documentElement.dir = state.locale === "ar" ? "rtl" : "ltr";
render();
