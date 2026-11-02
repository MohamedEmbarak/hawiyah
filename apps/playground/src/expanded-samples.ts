import { statusMarkup } from "./ready-examples";
import { escape as e, icon, type Locale } from "./data";
import { navigationDrawerMarkup } from './component-mobile-guides';
import { riyalAmount } from './currency';

/** Copyable HTML recipes: behavior lives in @nasaq/vanilla, never in the gallery. */
export function expandedSample(
  id: string,
  prefix: string,
  locale: Locale,
  mode: "light" | "dark" = "light",
): string {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const uid = `${prefix}-${id}`;
  const b = (text: string, attrs = "", variant = "secondary") =>
    `<button type="button" class="nq-button" data-variant="${variant}" ${attrs}>${text}</button>`;
  const label = (text: string, control: string) =>
    `<label class="nq-field"><span class="nq-label">${text}</span>${control}</label>`;
  const cell = (n: number) =>
    `<span class="layout-demo-tile">${t("Content", "محتوى")} ${n}</span>`;
  const cells = [1, 2, 3].map(cell).join("");
  switch (id) {
    case "navigation-drawer": return navigationDrawerMarkup(uid, locale);
    case "mobile-top-bar":
      return `<header class="nq-mobile-top-bar" data-variant="internal"><div class="nq-mobile-top-bar-leading"><a class="nq-mobile-top-bar-back" href="#components" aria-label="${t('Back','رجوع')}"><span class="nq-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a></div><div class="nq-mobile-top-bar-copy"><h2 class="nq-mobile-top-bar-title">${t('My requests','طلباتي')}</h2><p class="nq-mobile-top-bar-subtitle">${t('Track your applications','تابع طلباتك')}</p></div><div class="nq-mobile-top-bar-actions"><a class="nq-button" data-variant="ghost" href="#templates/search" aria-label="${t('Search','بحث')}"><span class="nq-icon" data-icon="search-01" aria-hidden="true"></span></a></div></header>`;
    case "input-group":
      return label(
        t("Website", "الموقع"),
        `<span class="nq-input-group"><span class="nq-input-addon">https://</span><input class="nq-input" placeholder="example.test" type="text"><span class="nq-input-addon">${icon("globe", 16)}</span></span>`,
      );
    case "password-field":
      return `<div class="nq-field nq-password-field" data-nq="password-field"><label class="nq-label" for="${uid}-input">${t("Password", "كلمة المرور")}</label><div class="nq-password-control"><input id="${uid}-input" class="nq-input" type="password" name="password" autocomplete="new-password" minlength="8" data-nq-password-input>${b(t("Show password", "إظهار كلمة المرور"), `data-nq-password-toggle data-nq-show-label="${t("Show password", "إظهار كلمة المرور")}" data-nq-hide-label="${t("Hide password", "إخفاء كلمة المرور")}"`)}</div></div>`;
    case "search-field":
      return `<div class="nq-field nq-search-field" data-nq="search-field"><label class="nq-label" for="${uid}-input">${t("Search services", "ابحث عن الخدمات")}</label><div class="nq-search-control"><input id="${uid}-input" type="search" class="nq-input" name="query" autocomplete="off" data-nq-search-input placeholder="${t("Type to search…", "اكتب للبحث…")}"><button type="button" class="nq-button nq-search-clear" hidden data-nq-search-clear aria-label="${t("Clear search", "مسح البحث")}"></button></div></div>`;
    case "number-field":
      return label(
        t("Quantity", "الكمية"),
        '<input class="nq-input nq-number-field" type="number" min="0" max="50" step="1" value="3">',
      );
    case "slider":
      return label(
        t("Volume", "الصوت"),
        '<input class="nq-slider" type="range" min="0" max="100" value="40">',
      );
    case "range-slider":
      return `<div class="nq-range-slider" data-nq="range-slider">${label(t("Minimum budget", "الحد الأدنى للميزانية"), '<input class="nq-slider" type="range" min="0" max="100" value="20" data-nq-lower>')}${label(t("Maximum budget", "الحد الأعلى للميزانية"), '<input class="nq-slider" type="range" min="0" max="100" value="80" data-nq-upper>')}<output data-nq-range-output></output></div>`;
    case "rating":
      return `<fieldset class="nq-rating" data-nq="rating"><legend class="nq-label">${t("Rate this experience", "قيّم التجربة")}</legend><div class="nq-inline">${[1, 2, 3, 4, 5].map((n) => `<label><input class="nq-radio" type="radio" name="${uid}" value="${n}" ${n === 4 ? "checked" : ""}><span aria-hidden="true">★</span><span class="nq-sr-only">${n} ${t("out of 5", "من 5")}</span></label>`).join("")}</div></fieldset>`;
    case "pin-input":
      return `<div class="nq-pin-input" data-nq="pin-input">${label(t("One-time code", "رمز التحقق"), '<input class="nq-input" name="code" data-nq-pin-input maxlength="6" autocomplete="one-time-code" inputmode="numeric" placeholder="000000">')}<span class="nq-hint">${t("Paste Arabic or Latin digits.", "الصق أرقامًا عربية أو لاتينية.")}</span></div>`;
    case "tag-input":
      return `<div class="nq-tag-input" data-nq="tag-input" data-nq-name="topics" data-nq-value='["${t("Design", "تصميم")}"]'>${label(t("Add a topic", "أضف موضوعًا"), `<input class="nq-input" data-nq-tag-input placeholder="${t("Type and press Enter", "اكتب ثم اضغط Enter")}">`)}<div data-nq-tags></div></div>`;
    case "multi-select":
      return `<fieldset class="nq-multi-select" data-nq="multi-select"><legend class="nq-label">${t("Service interests", "الخدمات المفضّلة")}</legend>${label(t("Filter options", "تصفية الخيارات"), '<input class="nq-input" type="search" data-nq-multiselect-search>')}${[t("Business", "الأعمال"), t("Municipal", "البلدية"), t("Education", "التعليم")].map((v, i) => `<div data-nq-option><label class="nq-inline"><input class="nq-checkbox" type="checkbox" name="interest" value="${i}" ${i === 0 ? "checked" : ""}>${v}</label></div>`).join("")}<span class="nq-hint" data-nq-status role="status"></span></fieldset>`;
    case "calendar":
      return `<div class="nq-calendar" role="group" data-nq="calendar" data-nq-month="2026-10-01" data-nq-value="2026-10-28" data-nq-min="2026-01-01" data-nq-max="2027-12-31" data-nq-locale="${locale === "ar" ? "ar-SA" : "en-GB"}" aria-label="${t("Appointment calendar", "تقويم المواعيد")}"></div>`;
    case "date-picker":
      return `<div class="nq-field nq-date-picker" data-nq="date-picker" data-nq-calendar="islamic-umalqura" data-nq-locale="${locale === "ar" ? "ar-SA" : "en-GB"}">
      <label class="nq-label" for="${uid}">${t("Appointment · Umm al-Qura picker", "الموعد · تقويم أم القرى")}</label>
      <div class="nq-date-picker-control"><input id="${uid}" class="nq-input" type="text" placeholder="YYYY-MM-DD" data-nq-date-input value="2026-10-28" name="appointment" aria-describedby="${uid}-format">
      <button type="button" class="nq-button nq-date-picker-trigger" data-variant="ghost" data-nq-date-trigger aria-label="${t("Choose date", "اختيار التاريخ")}"><span class="nq-date-picker-icon" aria-hidden="true"></span></button></div>
      <span class="nq-hint" id="${uid}-format">${t("When editing, type a Gregorian ISO date: YYYY-MM-DD.", "عند التحرير، اكتب تاريخًا ميلاديًا بصيغة ISO: YYYY-MM-DD.")}</span>
      <dialog class="nq-dialog" data-nq-date-dialog aria-label="${t("Choose appointment date", "اختر تاريخ الموعد")}"><header class="nq-dialog-header"><h2>${t("Choose appointment date", "اختر تاريخ الموعد")}</h2>${b(t("Close", "إغلاق"), "data-nq-date-close", "ghost")}</header><div class="nq-dialog-body"><div data-nq-date-calendar class="nq-calendar"></div></div></dialog></div>`;
    case "file-dropzone":
      return `<label class="nq-file-dropzone" data-nq="file-dropzone" data-nq-max-size="5242880">${icon("upload", 24)}<strong>${t("Choose or drop documents", "اختر المستندات أو أفلتها")}</strong><span class="nq-hint">${t("PDF, PNG · 5 MB", "PDF، PNG · 5 ميغابايت")}</span><input type="file" data-nq-file-input name="documents" accept=".pdf,.png" multiple><span data-nq-file-status role="status"></span></label>`;
    case "toggle-group":
      return `<fieldset class="nq-toggle-group" data-nq="toggle-group" data-variant="segmented"><legend class="nq-label">${t("View mode", "نمط العرض")}</legend>${[t("List", "قائمة"), t("Grid", "شبكة"), t("Map", "خريطة")].map((s, i) => `<label><input type="radio" name="${uid}" value="${i}" ${i === 0 ? "checked" : ""}><span>${s}</span></label>`).join("")}</fieldset>`;
    case "popover":
      return `<div class="nq-popover" data-nq="popover">${b(t("More information", "معلومات إضافية"), "data-nq-trigger")}<div class="nq-popover-panel" data-nq-panel role="region" aria-label="${t("Service information", "معلومات الخدمة")}" hidden><p>${t("Keep useful context close to the action.", "ضع المعلومات المفيدة بالقرب من الإجراء.")}</p><a href="#discover" class="nq-link">${t("Explore services", "استكشف الخدمات")}</a>${b(t("Close", "إغلاق"), "data-nq-close", "ghost")}</div></div>`;
    case "menu":
      return `<div class="nq-menu" data-nq="menu">${b(t("Request actions", "إجراءات الطلب"), "data-nq-trigger")}<div class="nq-menu-content" data-nq-panel role="menu" aria-label="${t("Request actions", "إجراءات الطلب")}" hidden>${[t("Edit details", "تعديل التفاصيل"), t("Duplicate", "نسخ"), t("Archive", "أرشفة")].map((v, i) => `<button class="nq-menu-item" type="button" role="menuitem" data-nq-value="${i}">${v}</button>`).join("")}</div></div>`;
    case "drawer":
      return `${b(t("Open filters", "فتح الفلاتر"), `data-nq-dialog-open="${uid}"`)}<dialog id="${uid}" class="nq-dialog nq-drawer" data-nq="drawer" data-side="end" aria-labelledby="${uid}-title"><div class="nq-dialog-header"><h2 id="${uid}-title">${t("Filter requests", "تصفية الطلبات")}</h2>${b(t("Close", "إغلاق"), "data-nq-dialog-close", "ghost")}</div><div class="nq-dialog-body">${label(t("Status", "الحالة"), `<select class="nq-select"><option>${t("All statuses", "كل الحالات")}</option><option>${t("In review", "قيد المراجعة")}</option></select>`)}</div><div class="nq-dialog-footer">${b(t("Apply filters", "تطبيق الفلاتر"), "data-nq-dialog-close", "primary")}</div></dialog>`;
    case "toast-region":
      return statusMarkup("toast-region", locale, "default", uid);
    case "collapsible":
      return `<details class="nq-collapsible"><summary>${t("Before you begin", "قبل البدء")}</summary><p>${t("Prepare your organization details and supporting documents.", "جهّز بيانات منشأتك والمستندات الداعمة.")}</p></details>`;
    case "tree-view":
      return `<ul class="nq-tree-view" data-nq="tree-view" role="tree" aria-label="${t("Documents", "المستندات")}"><li role="treeitem" data-nq-value="business" aria-expanded="true"><button type="button" data-nq-tree-toggle tabindex="-1" aria-label="${t("Toggle business documents", "توسيع مستندات الأعمال")}">▾</button><span data-nq-tree-label>${t("Business", "الأعمال")}</span><ul role="group">${[t("Commercial license", "الرخصة التجارية"), t("Address proof", "إثبات العنوان")].map((v, i) => `<li role="treeitem" data-nq-value="doc-${i}"><span data-nq-tree-label>${v}</span></li>`).join("")}</ul></li><li role="treeitem" data-nq-value="personal"><span data-nq-tree-label>${t("Personal documents", "مستندات شخصية")}</span></li></ul>`;
    case "carousel":
      return `<section class="nq-carousel" data-nq="carousel" aria-label="${t("Featured services", "الخدمات المميزة")}"><div>${[t("A clearer beginning.", "بداية أوضح."), t("Everything in one place.", "كل شيء في مكان واحد."), t("Made for your next step.", "مصمّم لخطوتك القادمة.")].map((v) => `<article class="layout-demo-tile" data-nq-slide><h3>${v}</h3><a class="nq-link" href="#discover">${t("Explore services", "استكشف الخدمات")}</a></article>`).join("")}</div><div class="nq-inline">${b(icon("arrow-back", 18), `data-nq-previous aria-label="${t("Previous slide", "الشريحة السابقة")}"`)}<span data-nq-carousel-status role="status"></span>${b(icon("arrow", 18), `data-nq-next aria-label="${t("Next slide", "الشريحة التالية")}"`)}</div></section>`;
    case "link":
      return `<div class="nq-stack"><a class="nq-link" href="#discover">${t("Explore services", "استكشف الخدمات")}</a><a class="nq-link" data-variant="subtle" href="#docs">${t("Read the guide", "اقرأ الدليل")} ${icon("arrow", 16)}</a></div>`;
    case "icon-button":
      return `<div class="nq-inline">${b(icon("search", 19), `data-icon-only aria-label="${t("Search", "بحث")}" data-action="search-components"`)}${b(icon("palette", 19), `aria-label="${t("Change theme", "تغيير السمة")}" data-action="mode"`, "ghost")}</div>`;
    case "button-group":
      return `<div class="nq-button-group" role="group" aria-label="${t("Document actions", "إجراءات المستند")}">${b(t("Save", "حفظ"), 'data-action="demo-continue"', "primary")}${b(t("Preview", "معاينة"), 'data-action="demo-info"')}${b(t("Cancel", "إلغاء"), 'data-action="demo-info"', "ghost")}</div>`;
    case "chip":
      return statusMarkup("chip", locale, "default", uid);
    case "description-list":
      return `<dl class="nq-description-list"><div><dt>${t("Reference", "المرجع")}</dt><dd dir="ltr">NQ-2026-1043</dd></div><div><dt>${t("Service fee", "رسوم الخدمة")}</dt><dd>${riyalAmount(t("200", "200"), locale, locale === 'en' ? 'before' : 'after')}</dd></div><div><dt>${t("Expected time", "المدة المتوقعة")}</dt><dd>${t("3 working days", "3 أيام عمل")}</dd></div></dl>`;
    case "stat":
      return `<div class="nq-stat"><span class="nq-stat-label">${t("Requests completed", "الطلبات المكتملة")}</span><strong class="nq-stat-value">1,284</strong><span class="nq-stat-trend" data-tone="success">↑ 12% ${t("this month", "هذا الشهر")}</span></div>`;
    case "timeline":
      return `<ol class="nq-timeline">${[t("Application received", "استلام الطلب"), t("Documents checked", "فحص المستندات"), t("Review in progress", "المراجعة جارية")].map((v, i) => `<li class="nq-timeline-item" ${i === 2 ? 'aria-current="step"' : ""}><strong>${v}</strong><p class="nq-hint">${i === 2 ? t("Current stage", "المرحلة الحالية") : "28 / 10 / 2026"}</p></li>`).join("")}</ol>`;
    case "meter":
      return label(
        t("Storage · 65%", "التخزين · 65٪"),
        '<meter class="nq-meter" min="0" max="100" low="25" high="85" optimum="20" value="65">65%</meter>',
      );
    case "avatar-group":
      return `<div class="nq-avatar-group" role="group" aria-label="${t("Review team", "فريق المراجعة")}">${["ن", "س", "ق"].map((v) => `<span class="nq-avatar" aria-label="${t("Team member", "عضو الفريق")} ${v}">${v}</span>`).join("")}<span class="nq-avatar" aria-label="${t("2 more members", "عضوان إضافيان")}">+2</span></div>`;
    case "data-table":
      return `<div class="nq-table-wrap"><table class="nq-table nq-data-table" data-nq="data-table" data-nq-locale="${locale}"><caption>${t("Requests · select a heading to sort", "الطلبات · اختر عنوانًا للترتيب")}</caption><thead><tr><th data-nq-key="name">${b(t("Service", "الخدمة"), 'data-nq-sort="name"', "ghost")}</th><th data-nq-key="days" data-nq-type="number">${b(t("Days", "الأيام"), 'data-nq-sort="days"', "ghost")}</th></tr></thead><tbody><tr><td>${t("License", "الرخصة")}</td><td>3</td></tr><tr><td>${t("Certificate", "الشهادة")}</td><td>1</td></tr><tr><td>${t("Permit", "التصريح")}</td><td>5</td></tr></tbody></table></div>`;
    case "service-card":
      return `<article class="nq-service-card" data-variant="featured"><span class="nq-badge" data-tone="info">${t("Business", "الأعمال")}</span><h3>${t("Start a business", "بدء نشاط تجاري")}</h3><p>${t("One clear path from idea to application.", "مسار واضح من الفكرة إلى الطلب.")}</p><div class="nq-service-card-meta"><span>${riyalAmount(t("200", "200"), locale)}</span><span>${t("3 days", "3 أيام")}</span></div><a class="nq-button" href="#discover">${t("View service", "عرض الخدمة")}</a></article>`;
    case "service-details":
      return `<section class="nq-service-details"><h3>${t("Before applying", "قبل التقديم")}</h3><dl class="nq-description-list"><div><dt>${t("Eligibility", "الأهلية")}</dt><dd>${t("Registered organizations", "المنشآت المسجلة")}</dd></div><div><dt>${t("Required documents", "المستندات المطلوبة")}</dt><dd>${t("License and address proof", "الرخصة وإثبات العنوان")}</dd></div><div><dt>${t("Support", "الدعم")}</dt><dd><a href="#docs" class="nq-link">${t("Help center", "مركز المساعدة")}</a></dd></div></dl></section>`;
    case "portal-header":
      return `<header class="nq-portal-header" data-nq="portal-header"><a href="#overview" class="nq-portal-brand" aria-label="${t("Nasaq home", "نسق — الصفحة الرئيسية")}"><img src="${import.meta.env.BASE_URL}brand/assets/nasaq-wordmark${mode === "dark" ? "-white" : ""}.svg" width="64" height="50" style="object-fit:contain" alt="نسق"></a><button class="nq-button nq-portal-menu-toggle" type="button" data-nq-portal-toggle><span class="nq-icon" data-icon="menu-01" aria-hidden="true"></span>${t("Menu", "القائمة")}</button><nav data-nq-portal-navigation aria-label="${t("Example portal navigation", "تنقل المنصة التوضيحية")}"><ul><li><a class="nq-link" href="#discover">${t("Services", "الخدمات")}</a></li><li><a class="nq-link" href="#workspace">${t("My requests", "طلباتي")}</a></li></ul></nav></header>`;
    case "secondary-nav":
      return `<nav class="nq-secondary-nav" data-variant="mobile" aria-label="${t("Service navigation", "تنقل الخدمات")}"><ul><li><a href="#discover" aria-current="page"><span class="nq-icon" data-icon="home-01" aria-hidden="true"></span><span>${t("Services", "الخدمات")}</span></a></li><li><a href="#workspace"><span class="nq-icon" data-icon="search-01" aria-hidden="true"></span><span>${t("My requests", "طلباتي")}</span></a></li><li><a href="#docs"><span class="nq-icon" data-icon="menu-01" aria-hidden="true"></span><span>${t("Help", "المساعدة")}</span></a></li></ul></nav>`;
    case "portal-layout":
      return `<div class="nq-portal-layout" style="min-block-size:24rem"><header class="nq-portal-header" data-nq="portal-header"><a class="nq-skip-link" href="#${uid}-content">${t("Skip to content", "انتقل إلى المحتوى")}</a><a class="nq-portal-brand" href="#overview" aria-label="${t("Nasaq home", "نسق — الصفحة الرئيسية")}"><img src="${import.meta.env.BASE_URL}brand/assets/nasaq-wordmark${mode === "dark" ? "-white" : ""}.svg" width="64" height="50" style="object-fit:contain" alt="نسق"></a><button class="nq-button nq-portal-menu-toggle" type="button" data-nq-portal-toggle><span class="nq-icon" data-icon="menu-01" aria-hidden="true"></span>${t("Menu", "القائمة")}</button><nav data-nq-portal-navigation aria-label="${t("Example main navigation", "التنقل الرئيسي التوضيحي")}"><ul><li><a href="#${uid}-content" aria-current="page">${t("Services", "الخدمات")}</a></li></ul></nav></header><nav class="nq-secondary-nav" aria-label="${t("Example secondary navigation", "التنقل الثانوي التوضيحي")}"><ul><li><a href="#${uid}-content" aria-current="page">${t("Service directory", "دليل الخدمات")}</a></li></ul></nav><section class="nq-portal-layout-main nq-container" id="${uid}-content" tabindex="-1" aria-labelledby="${uid}-heading"><nav class="nq-breadcrumb" aria-label="${t("Example breadcrumb", "مسار التنقل التوضيحي")}"><ol><li><a href="#overview">${t("Home", "الرئيسية")}</a></li><li><span aria-current="page">${t("Services", "الخدمات")}</span></li></ol></nav><h3 id="${uid}-heading">${t("Services", "الخدمات")}</h3><p>${t("A reusable shell for your service pages.", "هيكل قابل لإعادة الاستخدام لصفحات الخدمات.")}</p></section><footer class="nq-portal-footer"><strong>نسق</strong><nav aria-label="${t("Example footer links", "روابط التذييل التوضيحي")}"><ul><li><a href="#docs">${t("Privacy", "الخصوصية")}</a></li></ul></nav></footer></div>`;
    case "portal-footer":
      return `<footer class="nq-portal-footer"><strong>${t("Nasaq", "نسق")}</strong><nav aria-label="${t("Example footer links", "روابط التذييل التوضيحي")}"><a class="nq-link" href="#docs">${t("Privacy", "الخصوصية")}</a><a class="nq-link" href="#docs">${t("Accessibility", "إمكانية الوصول")}</a></nav><small>${t("Independent demonstration platform.", "منصة توضيحية مستقلة.")}</small></footer>`;
    case "feedback":
      return `<div class="nq-feedback" data-nq="feedback" role="group" aria-label="${t("Was this page helpful?", "هل كانت هذه الصفحة مفيدة؟")}"><p>${t("Was this page helpful?", "هل كانت هذه الصفحة مفيدة؟")}</p><div class="nq-inline">${b(t("Yes", "نعم"), 'data-nq-value="yes" aria-pressed="false"')}${b(t("No", "لا"), 'data-nq-value="no" aria-pressed="false"')}</div><input type="hidden" data-nq-feedback-value name="helpful"><span data-nq-feedback-status role="status"></span></div>`;
    case "cookie-consent":
      return `<section class="nq-cookie-consent" data-nq="cookie-consent" aria-label="${t("Cookie preferences", "تفضيلات ملفات الارتباط")}"><h3>${t("Your privacy, your choice.", "خصوصيتك، اختيارك.")}</h3><p>${t("Choose whether to allow optional analytics. This demo stores no consent or tracking cookies.", "اختر السماح بالتحليلات الاختيارية. لا يحفظ هذا المثال الموافقة ولا ملفات تتبع.")}</p><div class="nq-inline">${b(t("Accept optional", "قبول الاختيارية"), 'data-nq-consent="accepted"')}${b(t("Reject optional", "رفض الاختيارية"), 'data-nq-consent="rejected"')}</div></section>`;
    case "notification-list":
      return `<ul class="nq-notification-list"><li data-unread="true"><a class="nq-link" href="#workspace">${t("Your license is ready", "رخصتك جاهزة")}</a><p class="nq-hint">${t("2 minutes ago · Unread", "قبل دقيقتين · غير مقروء")}</p></li><li><a class="nq-link" href="#workspace">${t("Document received", "تم استلام المستند")}</a><p class="nq-hint">${t("Yesterday", "أمس")}</p></li></ul>`;
    case "container":
      return `<div class="nq-container" style="--nq-layout-max-width:28rem">${cell(1)}</div>`;
    case "stack":
      return `<div class="nq-stack" style="--nq-layout-gap:1rem">${cells}</div>`;
    case "inline":
      return `<div class="nq-inline" style="--nq-layout-gap:.75rem">${cells}</div>`;
    case "grid":
      return `<div class="nq-grid" style="--nq-layout-columns:1;--nq-layout-columns-md:3;--nq-layout-gap:.75rem">${cells}</div>`;
    case "columns":
      return `<div class="nq-columns" style="--nq-layout-columns:1;--nq-layout-columns-md:2;--nq-layout-gap:.75rem">${cells}</div>`;
    case "sidebar":
      return `<div class="nq-sidebar" data-collapse-at="md" style="--nq-layout-sidebar-width:6rem;--nq-layout-gap:.75rem"><aside class="layout-demo-tile">${t("Menu", "القائمة")}</aside>${cell(1)}</div>`;
    case "center":
      return `<div class="nq-center" style="min-block-size:8rem">${cell(1)}</div>`;
    case "spacer":
      return `<div class="nq-inline">${cell(1)}<span class="nq-spacer"></span>${cell(2)}</div>`;
    case "aspect-ratio":
      return `<div class="nq-aspect-ratio layout-demo-tile" style="--nq-layout-ratio:1.77778"><span>16 : 9</span></div>`;
    case "section":
      return `<section class="nq-section"><h3>${t("A meaningful section", "قسم ذو معنى")}</h3><p>${t("Use native headings and a consistent vertical rhythm.", "عناوين واضحة ومسافات عمودية متّسقة.")}</p></section>`;
    case "app-shell":
      return `<div class="nq-app-shell" style="min-block-size:12rem;--nq-layout-sidebar-width:5rem"><header class="layout-demo-tile">${t("Header", "الترويسة")}</header><aside class="layout-demo-tile">${t("Nav", "التنقل")}</aside><div class="nq-app-shell-main layout-demo-tile">${t("Main content", "المحتوى الرئيسي")}</div><footer class="layout-demo-tile">${t("Footer", "التذييل")}</footer></div>`;
    case "page-header":
      return `<header class="nq-page-header"><div class="nq-page-header-content"><span class="nq-hint">${t("YOUR WORKSPACE", "مساحة عملك")}</span><h3>${t("A clear next step.", "خطوة قادمة واضحة.")}</h3><p>${t("Page context, title and actions.", "سياق الصفحة وعنوانها وإجراءاتها.")}</p></div><div class="nq-page-header-actions">${b(t("New request", "طلب جديد"), 'data-action="demo-info"', "primary")}</div></header>`;
    default:
      throw new Error(`Missing live component recipe: ${e(id)}`);
  }
}
