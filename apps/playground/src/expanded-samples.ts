import {buttonGroupMarkup} from './button-group-demo';
import {portalMenuList} from './portal-navigation-demo';
import {searchDemoMarkup} from './search-demo';
import {contentNavigationDemoMarkup} from './content-navigation-demo';
import {ratingDemoMarkup} from './rating-demo';
import {carouselDemoMarkup} from './carousel-demo';
import {iconButtonMarkup} from './icon-button-demo';
import {toggleGroupMarkup} from './segmented-demo';
import {portalFooterMarkup} from './portal-footer-demo';
import {siteVerificationMarkup} from './site-verification-demo';
import {datePickerTexts, projectLocale, textDataAttributes, vanillaCalendarTexts} from './project-texts';
import { statusMarkup } from "./ready-examples";
import { feedbackMarkup } from './feedback-demo';
import { escape as e, icon, type Locale } from "./data";
import { navigationDrawerMarkup } from './component-mobile-guides';
import { copyButtonMarkup, sideNavigationMarkup } from './component-support-guides';
import { riyalAmount } from './currency';

/** Copyable HTML recipes: behavior lives in @hawiyah/vanilla, never in the gallery. */
export function expandedSample(
  id: string,
  prefix: string,
  locale: Locale,
  mode: "light" | "dark" = "light",
): string {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  if (id === "site-verification") return siteVerificationMarkup(locale);
  const uid = `${prefix}-${id}`;
  const b = (text: string, attrs = "", variant = "secondary") =>
    `<button type="button" class="hw-button" data-variant="${variant}" ${attrs}>${text}</button>`;
  const label = (text: string, control: string) =>
    `<label class="hw-field"><span class="hw-label">${text}</span>${control}</label>`;
  const cell = (n: number) =>
    `<span class="layout-demo-tile">${t("Content", "محتوى")} ${n}</span>`;
  const cells = [1, 2, 3].map(cell).join("");
  switch (id) {
    case "content-navigation": return contentNavigationDemoMarkup(locale,'nested',uid);
    case "navigation-drawer": return navigationDrawerMarkup(uid, locale);
    case "copy-button": return copyButtonMarkup(uid, locale);
    case "side-navigation": return sideNavigationMarkup(locale);
    case "mobile-top-bar":
      return `<header class="hw-mobile-top-bar" data-variant="internal"><div class="hw-mobile-top-bar-leading"><a class="hw-mobile-top-bar-back" href="#components" aria-label="${t('Back','رجوع')}"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a></div><div class="hw-mobile-top-bar-copy"><h2 class="hw-mobile-top-bar-title">${t('My requests','طلباتي')}</h2><p class="hw-mobile-top-bar-subtitle">${t('Track your applications','تابع طلباتك')}</p></div><div class="hw-mobile-top-bar-actions"><a class="hw-button" data-variant="ghost" href="#templates/search" aria-label="${t('Search','بحث')}"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></a></div></header>`;
    case "input-group":
      return label(
        t("Website", "الموقع"),
        `<span class="hw-input-group"><span class="hw-input-addon">https://</span><input class="hw-input" placeholder="example.test" type="text"><span class="hw-input-addon">${icon("globe", 16)}</span></span>`,
      );
    case "password-field":
      return `<div class="hw-field hw-password-field" data-hw="password-field"><label class="hw-label" for="${uid}-input">${t("Password", "كلمة المرور")}</label><div class="hw-password-control"><input id="${uid}-input" class="hw-input" type="password" name="password" autocomplete="new-password" minlength="8" data-hw-password-input>${b(t("Show password", "إظهار كلمة المرور"), `data-hw-password-toggle data-hw-show-label="${t("Show password", "إظهار كلمة المرور")}" data-hw-hide-label="${t("Hide password", "إخفاء كلمة المرور")}"`)}</div></div>`;
    case "search-field": return searchDemoMarkup(locale,'plain',uid);
    case "number-field":
      return label(
        t("Quantity", "الكمية"),
        '<input class="hw-input hw-number-field" type="number" min="0" max="50" step="1" value="3">',
      );
    case "slider":
      return label(
        t("Volume", "الصوت"),
        '<input class="hw-slider" type="range" min="0" max="100" value="40">',
      );
    case "range-slider":
      return `<div class="hw-range-slider" data-hw="range-slider" data-hw-locale="${projectLocale(locale)}" data-hw-range-label="{lower} – {upper}">${label(t("Minimum budget", "الحد الأدنى للميزانية"), '<input class="hw-slider" type="range" min="0" max="100" value="20" data-hw-lower>')}${label(t("Maximum budget", "الحد الأعلى للميزانية"), '<input class="hw-slider" type="range" min="0" max="100" value="80" data-hw-upper>')}<output data-hw-range-output></output></div>`;
    case "rating":
      return ratingDemoMarkup(locale,'selected',uid);
    case "pin-input":
      return `<div class="hw-pin-input" data-hw="pin-input">${label(t("One-time code", "رمز التحقق"), '<input class="hw-input" name="code" data-hw-pin-input pattern="[0-9]{6}" autocomplete="one-time-code" inputmode="numeric" placeholder="000000">')}<p class="hw-hint">${t("Paste Arabic or Latin digits.", "الصق أرقامًا عربية أو لاتينية.")}</p></div>`;
    case "tag-input":
      return `<div class="hw-field"><label class="hw-label" for="${uid}-input">${t("Add a topic", "أضف موضوعًا")}</label><div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="${t("Remove {tag}", "إزالة {tag}")}" data-hw-name="topics" data-hw-value='["${t("Design", "تصميم")}"]'><ul data-hw-tags></ul><input id="${uid}-input" class="hw-input" data-hw-tag-input placeholder="${t("Type and press Enter", "اكتب ثم اضغط Enter")}"></div></div>`;
    case "multi-select":
      return `<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="${t("{count} options", "{count} خيارات")}"><legend class="hw-label">${t("Service interests", "الخدمات المفضّلة")}</legend><label class="hw-label" for="${uid}-search">${t("Filter options", "تصفية الخيارات")}</label><input id="${uid}-search" class="hw-input" type="search" data-hw-multiselect-search><div class="hw-multi-select-options">${[t("Business", "الأعمال"), t("Municipal", "البلدية"), t("Education", "التعليم")].map((v, i) => `<label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="interest" value="${i}" ${i === 0 ? "checked" : ""}>${v}</label>`).join("")}</div><span class="hw-sr-only" data-hw-status role="status"></span></fieldset>`;
    case "calendar":
      return `<div class="hw-calendar" role="group" data-hw="calendar" data-hw-month="2026-10-01" data-hw-value="2026-10-28" data-hw-min="2026-01-01" data-hw-max="2027-12-31" data-hw-locale="${locale === "ar" ? "ar-SA" : "en-GB"}" ${textDataAttributes(vanillaCalendarTexts(locale))} aria-label="${t("Appointment calendar", "تقويم المواعيد")}"></div>`;
    case "date-picker":
      return `<div class="hw-field hw-date-picker" data-hw="date-picker" data-hw-calendar="islamic-umalqura" data-hw-locale="${locale === "ar" ? "ar-SA" : "en-GB"}" ${textDataAttributes(datePickerTexts(locale))}>
      <label class="hw-label" for="${uid}">${t("Appointment · Umm al-Qura picker", "الموعد · تقويم أم القرى")}</label>
      <div class="hw-date-picker-control"><input id="${uid}" class="hw-input" type="text" placeholder="YYYY-MM-DD" data-hw-date-input value="2026-10-28" name="appointment" aria-describedby="${uid}-format">
      <button type="button" class="hw-button hw-date-picker-trigger" data-variant="ghost" data-hw-date-trigger aria-label="${t("Choose date", "اختيار التاريخ")}"><span class="hw-date-picker-icon" aria-hidden="true"></span></button></div>
      <p class="hw-hint" id="${uid}-format">${t("When editing, type a Gregorian ISO date: YYYY-MM-DD.", "عند التحرير، اكتب تاريخًا ميلاديًا بصيغة ISO: YYYY-MM-DD.")}</p>
      <dialog class="hw-dialog" data-hw-date-dialog aria-label="${t("Choose appointment date", "اختر تاريخ الموعد")}"><header class="hw-dialog-header"><h2>${t("Choose appointment date", "اختر تاريخ الموعد")}</h2>${b(t("Close", "إغلاق"), "data-hw-date-close", "ghost")}</header><div class="hw-dialog-body"><div data-hw-date-calendar class="hw-calendar"></div></div></dialog></div>`;
    case "file-dropzone":
      return `<div class="hw-field hw-file-dropzone" data-hw="file-dropzone" data-hw-max-size="5242880" data-hw-selected-message="${t("Selected files {count}", "عدد الملفات المختارة {count}")}" data-hw-rejected-message="${t("Choose files matching the allowed type and size.", "اختر ملفات توافق النوع والحجم المسموح.")}" data-hw-unsupported-drop-message="${t("Use the file chooser to attach documents.", "استخدم اختيار الملفات لإرفاق المستندات.")}">${icon("upload", 24)}<label class="hw-label" for="${uid}-input">${t("Choose or drop documents", "اختر المستندات أو أفلتها")}</label><input class="hw-input" type="file" id="${uid}-input" data-hw-file-input name="documents" accept=".pdf,.png" multiple aria-describedby="${uid}-hint"><p data-hw-file-status role="status"></p><p class="hw-hint" id="${uid}-hint">${t("PDF, PNG · 5 MB", "PDF، PNG · 5 ميغابايت")}</p></div>`;
    case "toggle-group":
      return toggleGroupMarkup(locale,'segmented',uid);
    case "popover":
      return `<div class="hw-popover" data-hw="popover">${b(t("More information", "معلومات إضافية"), "data-hw-trigger")}<div class="hw-popover-panel" data-hw-panel role="region" aria-label="${t("Service information", "معلومات الخدمة")}" hidden><p>${t("Keep useful context close to the action.", "ضع المعلومات المفيدة بالقرب من الإجراء.")}</p><a href="#discover" class="hw-link">${t("Explore services", "استكشف الخدمات")}</a>${b(t("Close", "إغلاق"), "data-hw-close", "ghost")}</div></div>`;
    case "menu":
      return `<div class="hw-menu" data-hw="menu">${b(t("Request actions", "إجراءات الطلب"), "data-hw-trigger")}<div class="hw-menu-content" data-hw-panel role="menu" aria-label="${t("Request actions", "إجراءات الطلب")}" hidden>${[t("Edit details", "تعديل التفاصيل"), t("Duplicate", "نسخ"), t("Archive", "أرشفة")].map((v, i) => `<button class="hw-menu-item" type="button" role="menuitem" data-hw-value="${i}">${v}</button>`).join("")}</div></div>`;
    case "drawer":
      return `${b(t("Open filters", "فتح الفلاتر"), `data-hw-dialog-open="${uid}"`)}<dialog id="${uid}" class="hw-dialog hw-drawer" data-hw="drawer" data-side="end" aria-labelledby="${uid}-title"><div class="hw-dialog-header"><h2 id="${uid}-title">${t("Filter requests", "تصفية الطلبات")}</h2>${b(t("Close", "إغلاق"), "data-hw-dialog-close", "ghost")}</div><div class="hw-dialog-body">${label(t("Status", "الحالة"), `<select class="hw-select"><option>${t("All statuses", "كل الحالات")}</option><option>${t("In review", "قيد المراجعة")}</option></select>`)}</div><div class="hw-dialog-footer">${b(t("Apply filters", "تطبيق الفلاتر"), "data-hw-dialog-close", "primary")}</div></dialog>`;
    case "toast-region":
      return statusMarkup("toast-region", locale, "default", uid);
    case "collapsible":
      return `<details class="hw-collapsible"><summary>${t("Before you begin", "قبل البدء")}</summary><p>${t("Prepare your organization details and supporting documents.", "جهّز بيانات منشأتك والمستندات الداعمة.")}</p></details>`;
    case "tree-view":
      return `<ul class="hw-tree-view" data-hw="tree-view" role="tree" aria-label="${t("Documents", "المستندات")}" data-hw-expand-label="${t("Expand", "توسيع")} {label}" data-hw-collapse-label="${t("Collapse", "طي")} {label}"><li role="treeitem" data-hw-value="business" aria-expanded="true"><button type="button" class="hw-tree-toggle" data-hw-tree-toggle tabindex="-1"><span class="hw-icon" data-icon="arrow-down-01" data-size="sm" aria-hidden="true"></span></button><span data-hw-tree-label>${t("Business", "الأعمال")}</span><ul role="group">${[t("Commercial license", "الرخصة التجارية"), t("Address proof", "إثبات العنوان")].map((v, i) => `<li role="treeitem" data-hw-value="doc-${i}"><span data-hw-tree-label>${v}</span></li>`).join("")}</ul></li><li role="treeitem" data-hw-value="personal"><span data-hw-tree-label>${t("Personal documents", "مستندات شخصية")}</span></li></ul>`;
    case "carousel":
      return carouselDemoMarkup(locale);
    case "link":
      return `<div class="hw-stack"><a class="hw-link" href="#discover">${t("Explore services", "استكشف الخدمات")}</a><a class="hw-link" data-variant="neutral" href="#docs">${t("Read the guide", "اقرأ الدليل")}</a><a class="hw-link" data-variant="standalone" href="#details">${t("Service details", "تفاصيل الخدمة")} ${icon("arrow", 16)}</a><a class="hw-link" role="link" aria-disabled="true" tabindex="-1">${t("Unavailable destination", "وجهة غير متاحة")}</a><a class="hw-link" href="https://example.test/reference" target="_blank" rel="noopener noreferrer">${t("External reference", "مرجع خارجي")}<span class="hw-sr-only"> · ${t("opens in a new window", "يفتح في نافذة جديدة")}</span></a></div>`;
    case "icon-button":
      return iconButtonMarkup(locale);
    case "button-group":
      return buttonGroupMarkup(locale);
    case "chip":
      return statusMarkup("chip", locale, "default", uid);
    case "description-list":
      return `<dl class="hw-description-list"><div><dt>${t("Reference", "المرجع")}</dt><dd dir="ltr">HW-2026-1043</dd></div><div><dt>${t("Service fee", "رسوم الخدمة")}</dt><dd>${riyalAmount(t("200", "200"), locale, locale === 'en' ? 'before' : 'after')}</dd></div><div><dt>${t("Expected time", "المدة المتوقعة")}</dt><dd>${t("3 working days", "3 أيام عمل")}</dd></div></dl>`;
    case "stat":
      return `<div class="hw-stat"><span class="hw-stat-label">${t("Requests completed", "الطلبات المكتملة")}</span><strong class="hw-stat-value">1,284</strong><span class="hw-stat-trend" data-tone="success"><span class="hw-icon" data-icon="arrow-up-02" data-size="sm" aria-hidden="true"></span> 12% ${t("this month", "هذا الشهر")}</span></div>`;
    case "timeline":
      return `<ol class="hw-timeline">${[t("Application received", "استلام الطلب"), t("Documents checked", "فحص المستندات"), t("Review in progress", "المراجعة جارية")].map((v, i) => `<li class="hw-timeline-item" data-state="${i === 2 ? "current" : "complete"}"${i === 2 ? ' aria-current="step"' : ""}><strong>${v}</strong><p class="hw-hint">${i === 2 ? t("Current stage", "المرحلة الحالية") : "28 / 10 / 2026"}</p></li>`).join("")}</ol>`;
    case "meter":
      return label(
        t("Storage · 65%", "التخزين · 65٪"),
        '<meter class="hw-meter" min="0" max="100" low="25" high="85" optimum="20" value="65">65%</meter>',
      );
    case "avatar-group":
      return `<div class="hw-avatar-group" role="group" aria-label="${t("Review team", "فريق المراجعة")}">${["ن", "س", "ق"].map((v) => `<span class="hw-avatar" aria-label="${t("Team member", "عضو الفريق")} ${v}">${v}</span>`).join("")}<span class="hw-avatar" aria-label="${t("2 more members", "عضوان إضافيان")}">+2</span></div>`;
    case "data-table":
      return `<div class="hw-table-wrap" tabindex="0" role="region" aria-label="${t("Requests", "الطلبات")}"><table class="hw-table hw-data-table" data-variant="striped" data-hw="data-table" data-hw-locale="${locale}"><caption>${t("Requests · select a heading to sort", "الطلبات · اختر عنوانًا للترتيب")}</caption><thead><tr><th scope="col" data-hw-key="name">${b(t("Service", "الخدمة") + '<span class="hw-table-sort-icon" aria-hidden="true"></span>', 'data-hw-sort="name"', "ghost")}</th><th scope="col" data-hw-key="days" data-hw-type="number">${b(t("Days", "الأيام") + '<span class="hw-table-sort-icon" aria-hidden="true"></span>', 'data-hw-sort="days"', "ghost")}</th></tr></thead><tbody><tr><th scope="row">${t("License", "الرخصة")}</th><td>3</td></tr><tr><th scope="row">${t("Certificate", "الشهادة")}</th><td>1</td></tr><tr><th scope="row">${t("Permit", "التصريح")}</th><td>5</td></tr></tbody></table></div>`;
    case "service-card":
      return `<article class="hw-service-card" data-variant="featured"><span class="hw-badge" data-tone="info">${t("Business", "الأعمال")}</span><h3>${t("Start a business", "بدء نشاط تجاري")}</h3><p>${t("One clear path from idea to application.", "مسار واضح من الفكرة إلى الطلب.")}</p><dl class="hw-description-list"><div><dt>${t("Service fee", "رسوم الخدمة")}</dt><dd>${riyalAmount(t("200", "200"), locale)}</dd></div><div><dt>${t("Expected time", "المدة المتوقعة")}</dt><dd>${t("3 days", "3 أيام")}</dd></div></dl><a class="hw-button" href="#discover">${t("View service", "عرض الخدمة")}</a></article>`;
    case "service-details":
      return `<section class="hw-service-details"><h3>${t("Before applying", "قبل التقديم")}</h3><dl class="hw-description-list"><div><dt>${t("Eligibility", "الأهلية")}</dt><dd>${t("Registered organizations", "المنشآت المسجلة")}</dd></div><div><dt>${t("Required documents", "المستندات المطلوبة")}</dt><dd>${t("License and address proof", "الرخصة وإثبات العنوان")}</dd></div><div><dt>${t("Support", "الدعم")}</dt><dd><a href="#docs" class="hw-link">${t("Help center", "مركز المساعدة")}</a></dd></div></dl></section>`;
    case "portal-header":
      return `<div class="hw-portal-masthead">${siteVerificationMarkup(locale)}<header class="hw-portal-header" data-hw="portal-header"><a href="#overview" class="hw-portal-brand" aria-label="${t("Hawiyah home", "هوية — الصفحة الرئيسية")}"><img src="${import.meta.env.BASE_URL}brand/assets/hawiyah-wordmark${mode === "dark" ? "-white" : ""}.svg" width="64" height="50" style="object-fit:contain" alt="هوية"></a><button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>${t("Menu", "القائمة")}</button><nav data-hw-portal-navigation aria-label="${t("Example portal navigation", "تنقل المنصة التوضيحية")}"><ul>${portalMenuList(locale)}</ul></nav></header></div>`;
    case "secondary-nav":
      return `<nav class="hw-secondary-nav" data-variant="mobile" aria-label="${t("Service navigation", "تنقل الخدمات")}"><ul><li><a href="#discover" aria-current="page"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span>${t("Services", "الخدمات")}</span></a></li><li><a href="#workspace"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span><span>${t("My requests", "طلباتي")}</span></a></li><li><a href="#docs"><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span><span>${t("Help", "المساعدة")}</span></a></li></ul></nav>`;
    case "portal-layout":
      return `<div class="hw-portal-layout" style="min-block-size:24rem"><a class="hw-skip-link" href="#${uid}-content">${t('Skip to page content','انتقل إلى محتوى الصفحة')}</a>${expandedSample('portal-header',prefix+'-header',locale,mode)}<main id="${uid}-content" tabindex="-1" class="hw-portal-layout-main hw-container"><h2>${t('Your digital services','خدماتك الرقمية')}</h2><p>${t('Page content belongs here.','يوضع محتوى الصفحة هنا.')}</p></main>${portalFooterMarkup(locale,uid+'-footer')}</div>`;
    case "portal-footer":
      return portalFooterMarkup(locale,uid);
    case "feedback":
      return feedbackMarkup(locale, "text", uid);
    case "cookie-consent":
      return `<section class="hw-cookie-consent" data-hw="cookie-consent" aria-label="${t("Cookie preferences", "تفضيلات ملفات الارتباط")}"><h3>${t("Your privacy, your choice.", "خصوصيتك، اختيارك.")}</h3><p>${t("Choose whether to allow optional analytics. This demo stores no consent or tracking cookies.", "اختر السماح بالتحليلات الاختيارية. لا يحفظ هذا المثال الموافقة ولا ملفات تتبع.")}</p><div class="hw-button-group">${b(t("Accept optional", "قبول الاختيارية"), 'data-hw-consent="accepted"', "primary")}${b(t("Reject optional", "رفض الاختيارية"), 'data-hw-consent="rejected"')}</div></section>`;
    case "notification-list":
      return `<div class="hw-notification-list"><ul><li data-state="unread"><a class="hw-link" href="#workspace">${t("Your license is ready", "رخصتك جاهزة")}</a><p class="hw-hint">${t("2 minutes ago · Unread", "قبل دقيقتين · غير مقروء")}</p></li><li data-state="read"><a class="hw-link" href="#workspace">${t("Document received", "تم استلام المستند")}</a><p class="hw-hint">${t("Yesterday", "أمس")}</p></li></ul></div>`;
    case "container":
      return `<div class="hw-container" style="--hw-layout-max-width:28rem">${cell(1)}</div>`;
    case "stack":
      return `<div class="hw-stack" style="--hw-layout-gap:1rem">${cells}</div>`;
    case "inline":
      return `<div class="hw-inline" style="--hw-layout-gap:.75rem">${cells}</div>`;
    case "grid":
      return `<div class="hw-grid" style="--hw-layout-columns:1;--hw-layout-columns-md:3;--hw-layout-gap:.75rem">${cells}</div>`;
    case "columns":
      return `<div class="hw-columns" style="--hw-layout-columns:1;--hw-layout-columns-md:2;--hw-layout-gap:.75rem">${cells}</div>`;
    case "sidebar":
      return `<div class="hw-sidebar" data-collapse-at="md" style="--hw-layout-sidebar-width:6rem;--hw-layout-gap:.75rem"><aside class="layout-demo-tile">${t("Menu", "القائمة")}</aside>${cell(1)}</div>`;
    case "center":
      return `<div class="hw-center" style="min-block-size:8rem">${cell(1)}</div>`;
    case "spacer":
      return `<div class="hw-inline">${cell(1)}<span class="hw-spacer"></span>${cell(2)}</div>`;
    case "aspect-ratio":
      return `<div class="hw-aspect-ratio layout-demo-tile" style="--hw-layout-ratio:1.77778"><span>16 : 9</span></div>`;
    case "section":
      return `<section class="hw-section"><h3>${t("A meaningful section", "قسم ذو معنى")}</h3><p>${t("Use native headings and a consistent vertical rhythm.", "عناوين واضحة ومسافات عمودية متّسقة.")}</p></section>`;
    case "app-shell":
      return `<div class="hw-app-shell" style="min-block-size:12rem;--hw-layout-sidebar-width:5rem"><header class="layout-demo-tile">${t("Header", "الترويسة")}</header><aside class="layout-demo-tile">${t("Nav", "التنقل")}</aside><div class="hw-app-shell-main layout-demo-tile">${t("Main content", "المحتوى الرئيسي")}</div><footer class="layout-demo-tile">${t("Footer", "التذييل")}</footer></div>`;
    case "page-header":
      return `<header class="hw-page-header"><div class="hw-page-header-content"><span class="hw-hint">${t("YOUR WORKSPACE", "مساحة عملك")}</span><h3>${t("A clear next step.", "خطوة قادمة واضحة.")}</h3><p>${t("Page context, title and actions.", "سياق الصفحة وعنوانها وإجراءاتها.")}</p></div><div class="hw-page-header-actions">${b(t("New request", "طلب جديد"), 'data-action="demo-info"', "primary")}</div></header>`;
    default:
      throw new Error(`Missing live component recipe: ${e(id)}`);
  }
}
