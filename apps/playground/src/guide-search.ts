import { normalizeSearch } from "@nasaq/core";
import { catalog, escape as e, icon, type Locale } from "./data";
import "./guide-search.css";

type Group = "guides" | "components" | "explore";
type Label = readonly [en: string, ar: string];
type SearchItem = {
  route: string;
  label: Label;
  group: Group;
  detail: Label;
  icon: string;
  keywords?: string;
};

// Keep these destinations aligned with guideTopics; importing the article renderer
// would also pull all component documentation into this small navigation module.
const topics = [
  ["getting-started", "Getting started", "البداية", "installation install setup npm pnpm بدء تثبيت إعداد استخدام"],
  ["vanilla", "Vanilla JavaScript", "جافاسكريبت", "html javascript js enhance cleanup تطوير"],
  ["react", "React", "React", "jsx tsx hooks رياكت ريأكت"],
  ["vue", "Vue", "Vue", "composition api فيو"],
  ["angular", "Angular", "Angular", "signals انغولار أنجولار"],
  ["theming", "Themes, typography & RTL", "السمات والخطوط والاتجاه", "tokens colors fonts dark light rtl ltr theme ألوان مظهر داكن فاتح خط تخصيص"],
  ["layouts", "Composing layouts", "تركيب التخطيطات", "responsive grid stack inline css layout تخطيط متجاوب شبكة"],
  ["lifecycle", "State & component lifecycle", "الحالة ودورة حياة المكوّن", "state lifecycle mount update dispose destroy cleanup حالة تهيئة تحديث إزالة تنظيف"],
  ["calendars", "Gregorian & Hijri dates", "التواريخ الميلادية والهجرية", "calendar date picker umm al qura umalqura تقويم تاريخ هجري ميلادي أم القرى"],
  ["accessibility", "Accessibility", "الإتاحة", "a11y wcag keyboard screen reader focus إتاحة وصول إمكانية الوصول قارئ شاشة لوحة مفاتيح تركيز"],
  ["extending", "Extending the system", "توسيع النظام", "extend custom variants composition ai vibe coding تعديل تخصيص توسيع ذكاء اصطناعي"],
  ["alignment", "DGA alignment", "المواءمة مع DGA", "ksa saudi compliance unified design system platforms code dga هيئة الحكومة الرقمية كود المنصات نظام التصميم الموحد امتثال السعودية"],
] as const;

const categories: Record<string, Label> = {
  Actions: ["Actions", "الإجراءات"],
  Forms: ["Forms & inputs", "النماذج والمدخلات"],
  Navigation: ["Navigation", "التنقل"],
  Feedback: ["Feedback & status", "الملاحظات والحالة"],
  Content: ["Content", "المحتوى"],
  Platforms: ["Platform patterns", "أنماط المنصات"],
  Layout: ["Layout primitives", "عناصر التخطيط"],
};

const aliases: Record<string, string> = {
  "date-picker": "datepicker date time hijri gregorian umm al qura umalqura تاريخ هجري ميلادي أم القرى تقويم",
  calendar: "date dates hijri gregorian umm al qura umalqura تاريخ هجري ميلادي أم القرى",
  "pin-input": "otp password verification code رمز تحقق كلمة مرور مؤقتة",
  "text-field": "input text email tel url phone حقل إدخال نص بريد هاتف",
  textarea: "multiline text input حقل نص متعدد الأسطر",
  combobox: "autocomplete search select بحث اختيار إكمال تلقائي",
  "file-dropzone": "upload drag drop file رفع سحب إفلات ملفات",
  upload: "file attachment مرفق ملفات تحميل",
  "cookie-consent": "cookies privacy consent موافقة خصوصية ملفات تعريف الارتباط",
  "toast-region": "notification snackbar إشعار تنبيه",
  "data-table": "datatable sorting rows columns فرز صفوف أعمدة",
  spinner: "loader loading indicator تحميل انتظار",
  skeleton: "loader loading placeholder تحميل انتظار",
};

const index: SearchItem[] = [
  ...topics.map(([id, en, ar, keywords]) => ({
    route: `docs/${id}`, label: [en, ar] as Label, group: "guides" as const,
    detail: ["Developer guide", "دليل المطوّر"] as Label, icon: "book", keywords,
  })),
  ...catalog.map(([id, en, ar, category]) => ({
    route: `component/${id}`, label: [en, ar] as Label, group: "components" as const,
    detail: categories[category] || [category, category] as Label,
    icon: category === "Layout" ? "grid" : "layers",
    keywords: `${id} ${aliases[id] || ""}`,
  })),
  ...([
    ["overview", "Nasaq overview", "نظرة عامة على نسق", "home", "home nasaq نسق الرئيسية"],
    ["components", "All components", "كل المكوّنات", "layers", "catalog library components مكونات مكتبة فهرس"],
    ["foundations", "Design foundations", "أسس التصميم", "palette", "tokens typography color spacing themes ألوان خطوط مسافات سمات"],
    ["layouts", "Layout studio", "استوديو التخطيطات", "grid", "responsive grid stack inline layout تخطيط متجاوب شبكة"],
    ["inputs", "Input lab", "مختبر المدخلات", "code", "native html inputs forms iban saudi national phone id إدخال نماذج آيبان هوية وطنية هاتف"],
    ["brand", "Brand & wordmark", "الهوية والشعار", "spark", "logo loader gif animation sadu identity nasaq نسق شعار هوية تحميل حركة رقعة"],
    ["discover", "Service discovery example", "مثال استكشاف الخدمات", "search", "services journey منصة خدمة رحلة"],
    ["apply", "Application form example", "مثال نموذج الطلب", "file", "form journey application تقديم طلب رحلة نموذج"],
    ["workspace", "Requests workspace example", "مثال مساحة الطلبات", "briefcase", "dashboard requests table لوحة طلبات جدول"],
  ] as const).map(([route, en, ar, itemIcon, keywords]) => ({
    route, label: [en, ar] as Label, group: "explore" as const,
    detail: ["Guide & playground", "الدليل ومساحة التجربة"] as Label,
    icon: itemIcon, keywords,
  })),
];

const suggestions = ["docs/getting-started", "docs/react", "component/button", "component/text-field", "component/date-picker", "layouts", "inputs", "brand"];
const groupLabels: Record<Group, Label> = {
  guides: ["Guides", "الأدلة"], components: ["Components", "المكوّنات"], explore: ["Explore", "استكشف"],
};
const fold = (value: string) => normalizeSearch(value.replace(/[-_/]/gu, " "));
const searchable = index.map(item => ({
  item,
  labels: item.label.map(fold),
  terms: fold(`${item.detail.join(" ")} ${item.keywords || ""}`).split(" "),
}));
let nextId = 0;

/** One persistent dialog per app; destroy it with the app's own lifecycle. */
export function createGuideSearch({ getLocale }: { getLocale: () => Locale }): { open(): void; destroy(): void } {
  const id = `nq-guide-search-${++nextId}`;
  const dialog = document.createElement("dialog");
  dialog.className = "nq-guide-search";
  dialog.id = id;
  dialog.setAttribute("aria-labelledby", `${id}-title`);
  dialog.innerHTML = `
    <header class="nq-guide-search-header"><div><span class="nq-guide-search-eyebrow">نسق</span><h2 id="${id}-title"></h2></div><button type="button" class="nq-guide-search-close">${icon("close", 20)}</button></header>
    <div class="nq-guide-search-field">${icon("search", 22)}<input id="${id}-input" type="text" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-results" aria-describedby="${id}-help" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" autofocus></div>
    <div class="nq-guide-search-meta" aria-hidden="true"></div>
    <div class="nq-guide-search-results" id="${id}-results" role="listbox" tabindex="-1"></div>
    <div class="nq-guide-search-empty" hidden></div>
    <footer class="nq-guide-search-footer" id="${id}-help"></footer>
    <p class="nq-guide-search-sr-only" role="status" aria-live="polite" aria-atomic="true"></p>`;
  document.body.append(dialog);

  const input = dialog.querySelector<HTMLInputElement>("input")!;
  const title = dialog.querySelector<HTMLElement>("h2")!;
  const closeButton = dialog.querySelector<HTMLButtonElement>("button")!;
  const list = dialog.querySelector<HTMLElement>("[role=listbox]")!;
  const empty = dialog.querySelector<HTMLElement>(".nq-guide-search-empty")!;
  const meta = dialog.querySelector<HTMLElement>(".nq-guide-search-meta")!;
  const help = dialog.querySelector<HTMLElement>("footer")!;
  const status = dialog.querySelector<HTMLElement>("[role=status]")!;
  const events = new AbortController();
  const { signal } = events;
  let locale: Locale = "ar";
  let results: SearchItem[] = [];
  let active = -1;
  let opener: HTMLElement | null = null;
  let destroyed = false;
  let composing = false;
  let announcement: ReturnType<typeof setTimeout> | undefined;
  const text = (pair: Label) => pair[locale === "ar" ? 1 : 0];
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;
  const count = (value: number) => new Intl.NumberFormat(locale, { numberingSystem: 'latn' }).format(value);

  function activate(position: number, scroll = false) {
    active = results.length ? Math.max(0, Math.min(position, results.length - 1)) : -1;
    list.querySelectorAll<HTMLElement>("[role=option]").forEach((option, i) => {
      option.setAttribute("aria-selected", String(i === active));
    });
    const option = active < 0 ? null : document.getElementById(`${id}-option-${active}`);
    if (option) {
      input.setAttribute("aria-activedescendant", option.id);
      if (scroll) option.scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  }

  function renderResults() {
    const query = fold(input.value);
    const words = query.split(" ").filter(Boolean);
    const matches = query ? searchable.filter(entry => words.every(word =>
      entry.labels.some(label => label.includes(word)) || entry.terms.some(term => term.startsWith(word)),
    )).map(entry => ({
      item: entry.item,
      score: Math.max(...entry.labels.map(label => label === query ? 100 : label.startsWith(query) ? 80 : label.includes(query) ? 60 : 0)),
    })).sort((a, b) => b.score - a.score).map(entry => entry.item)
      : suggestions.map(route => index.find(item => item.route === route)!);
    // Keep each group contiguous; the highest-ranking match determines group order.
    const groups = [...new Set(matches.map(item => item.group))];
    results = groups.flatMap(group => matches.filter(item => item.group === group));
    let position = 0;
    list.innerHTML = groups.map(group => `<div class="nq-guide-search-group" role="group" aria-labelledby="${id}-${group}"><div class="nq-guide-search-group-title" id="${id}-${group}">${e(text(groupLabels[group]))}</div>${results.filter(item => item.group === group).map(item => {
      const i = position++;
      return `<div class="nq-guide-search-option" id="${id}-option-${i}" role="option" aria-selected="false" data-search-index="${i}"><span class="nq-guide-search-option-icon">${icon(item.icon, 19)}</span><span class="nq-guide-search-option-copy"><strong>${e(text(item.label))}</strong><small>${e(text(item.detail))}${item.group === "components" ? ` <span aria-hidden="true">·</span> <bdi lang="${locale === "ar" ? "en" : "ar"}">${e(item.label[locale === "ar" ? 0 : 1])}</bdi>` : ""}</small></span><span class="nq-guide-search-enter" aria-hidden="true">↵</span></div>`;
    }).join("")}</div>`).join("");
    empty.hidden = results.length > 0;
    if (!results.length) empty.innerHTML = `${icon("search", 28)}<strong>${t("No matching pages", "لا توجد صفحات مطابقة")}</strong><p>${t("Try a component name or topic in Arabic or English.", "جرّب اسم مكوّن أو موضوع بالعربية أو الإنجليزية.")}</p>`;
    meta.textContent = query
      ? t(`${count(results.length)} results`, `${count(results.length)} نتيجة`)
      : t(`Start here · ${count(catalog.length)} components and ${count(topics.length)} guides`, `ابدأ من هنا · ${count(catalog.length)} مكوّنًا و${count(topics.length)} دليلًا`);
    activate(0);
    list.scrollTop = 0;
    clearTimeout(announcement);
    announcement = setTimeout(() => {
      status.textContent = results.length
        ? t(`${count(results.length)} ${query ? "results" : "suggestions"}. Use the up and down arrows to choose.`, `${count(results.length)} ${query ? "نتيجة" : "اقتراحات"}. استخدم سهمي الأعلى والأسفل للاختيار.`)
        : t("No results. Try another word.", "لا توجد نتائج. جرّب كلمة أخرى.");
    }, 120);
  }

  function restoreFocus() {
    // The browser normally restores focus synchronously. Its later close event
    // must not steal focus if the user has already moved to another control.
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && focused !== document.body && !dialog.contains(focused)) {
      opener = null;
      return;
    }
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    else document.querySelector<HTMLElement>('[data-action="search-components"]')?.focus({ preventScroll: true });
    opener = null;
  }

  function close() {
    if (!dialog.open) return;
    input.setAttribute("aria-expanded", "false");
    dialog.close();
  }

  function choose(position = active) {
    const item = results[position];
    if (!item) return;
    close();
    location.hash = item.route;
  }

  function open() {
    if (destroyed) return;
    if (dialog.open) { input.focus(); return; }
    locale = getLocale() === "en" ? "en" : "ar";
    dialog.lang = locale;
    dialog.dir = locale === "ar" ? "rtl" : "ltr";
    title.textContent = t("Search the guide", "ابحث في دليل نسق");
    input.setAttribute("aria-label", t("Search components and guides", "ابحث عن المكوّنات والأدلة"));
    input.placeholder = t("A component, a question, a place to start…", "مكوّن، موضوع، أو بداية جديدة…");
    closeButton.setAttribute("aria-label", t("Close search", "إغلاق البحث"));
    list.setAttribute("aria-label", t("Search results", "نتائج البحث"));
    help.innerHTML = `<span><kbd>↑</kbd><kbd>↓</kbd> ${t("Navigate", "تنقّل")}</span><span><kbd>↵</kbd> ${t("Open", "افتح")}</span><span><kbd>Esc</kbd> ${t("Close", "أغلق")}</span><span class="nq-guide-search-language">${t("Arabic + English", "العربية + English")}</span>`;
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    input.value = "";
    status.textContent = "";
    composing = false;
    renderResults();
    dialog.showModal();
    input.setAttribute("aria-expanded", "true");
    input.focus({ preventScroll: true });
  }

  input.addEventListener("input", () => { if (!composing) renderResults(); }, { signal });
  input.addEventListener("compositionstart", () => { composing = true; }, { signal });
  input.addEventListener("compositionend", () => { composing = false; renderResults(); }, { signal });
  input.addEventListener("keydown", event => {
    if (event.isComposing || composing || event.keyCode === 229 || event.ctrlKey || event.metaKey || event.altKey) return;
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!results.length) return;
      const next = event.key === "Home" ? 0 : event.key === "End" ? results.length - 1
        : (active + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      activate(next, true);
    } else if (event.key === "Enter") { event.preventDefault(); choose(); }
  }, { signal });
  list.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse" && event.button === 0 && (event.target as Element).closest("[data-search-index]")) event.preventDefault();
  }, { signal });
  list.addEventListener("click", event => {
    const option = (event.target as Element).closest<HTMLElement>("[data-search-index]");
    if (option) choose(Number(option.dataset.searchIndex));
  }, { signal });
  closeButton.addEventListener("click", close, { signal });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  }, { signal });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    clearTimeout(announcement);
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    restoreFocus();
  }, { signal });
  // Native dialog owns Escape and modal focus containment; do not layer a trap on it.
  document.addEventListener("keydown", event => {
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.repeat || event.altKey) return;
    const editing = event.composedPath().some(target => target instanceof HTMLElement &&
      (target.isContentEditable || target.matches('input, textarea, select, [role="textbox"], [role="combobox"]')));
    if (editing || document.querySelector("dialog[open]")) return;
    const command = (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "k";
    const slash = !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key === "/";
    if (!command && !slash) return;
    event.preventDefault();
    open();
  }, { signal });

  return {
    open,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearTimeout(announcement);
      events.abort();
      if (dialog.open) { dialog.close(); restoreFocus(); }
      dialog.remove();
    },
  };
}
