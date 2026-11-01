import { layoutStyles, type LayoutProps } from "@nasaq/core";
import { escape as e, type Locale } from "./data";
import { expandedSample } from "./expanded-samples";

const css = (props: LayoutProps) =>
  Object.entries(layoutStyles(props))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
const words = (locale: Locale) => (en: string, ar: string) =>
  locale === "ar" ? ar : en;
const tiles = (locale: Locale) =>
  Array.from(
    { length: 6 },
    (_, i) =>
      `<article class="layout-demo-tile"><span class="nq-badge">0${i + 1}</span><strong>${words(locale)("Your content", "المحتوى")}</strong><p>${words(locale)("Room for what matters.", "مساحة لما يهم.")}</p></article>`,
  ).join("");
const layoutState = {
  pattern: "grid",
  columns: 3,
  gap: 4,
  padding: 4,
  width: "100%",
};
const layoutPatterns = [
  ["grid", "Grid", "شبكة"],
  ["stack", "Stack", "ترتيب عمودي"],
  ["inline", "Inline", "ترتيب أفقي"],
  ["columns", "Columns", "أعمدة"],
  ["sidebar", "Sidebar", "تخطيط جانبي"],
] as const;
function markup(locale: Locale) {
  const props: LayoutProps = {
    gap: layoutState.gap as 4,
    padding: layoutState.padding as 4,
    columns: { base: 1, md: 2, lg: layoutState.columns },
    sidebarWidth: "14rem",
    collapseAt: "md",
  };
  const body =
    layoutState.pattern === "sidebar"
      ? `<aside class="layout-demo-tile">${words(locale)("Filters & navigation", "الفلاتر والتنقل")}</aside><div class="nq-grid" style="${css({ columns: { base: 1, md: 2 }, gap: 4 })}">${tiles(locale)}</div>`
      : tiles(locale);
  return `<div class="nq-${layoutState.pattern}" data-collapse-at="md" style="${css(props)}">${body}</div>`;
}
function code(locale: Locale) {
  return markup(locale)
    .replace(/><(article|aside|div)/g, ">\n  <$1")
    .replace(/<\/article>/g, "</article>\n");
}
export function layoutPage(locale: Locale) {
  const t = words(locale);
  return `<div class="page-heading"><div><div class="eyebrow">${t("COMPOSITION, MADE SIMPLE", "تركيب بسيط")}</div><h1>${t("A little structure. Endless possibilities.", "قليل من التنظيم. إمكانات بلا حدود.")}</h1><p>${t("Choose a pattern, adjust its rhythm, and copy working markup. Responsive columns begin with one on small screens.", "اختر نمطًا واضبط المسافات وانسخ الشفرة. تبدأ الأعمدة المتجاوبة بعمود واحد على الشاشات الصغيرة.")}</p></div></div>
  <section class="layout-studio"><div class="layout-studio-controls">
  <label class="nq-field"><span class="nq-label">${t("Pattern", "النمط")}</span><select class="nq-select" id="layout-pattern">${layoutPatterns.map(([value, en, ar]) => `<option value="${value}" ${layoutState.pattern === value ? "selected" : ""}>${t(en, ar)}</option>`).join("")}</select></label>
  <label class="nq-field"><span class="nq-label">${t("Large-screen columns", "أعمدة الشاشة الكبيرة")}</span><input class="nq-input" type="number" id="layout-columns" min="1" max="6" value="${layoutState.columns}"></label>
  <label class="nq-field"><span class="nq-label">${t("Gap token", "رمز التباعد")}</span><input class="nq-input" type="number" id="layout-gap" min="0" max="16" value="${layoutState.gap}"></label>
  <label class="nq-field"><span class="nq-label">${t("Padding token", "رمز الحشو")}</span><input class="nq-input" type="number" id="layout-padding" min="0" max="16" value="${layoutState.padding}"></label>
  <label class="nq-field"><span class="nq-label">${t("Preview width", "عرض المعاينة")}</span><select class="nq-select" id="layout-width"><option value="100%">${t("Fill available width", "ملء المساحة")}</option><option value="390px">${t("Narrow container · 390px", "حاوية ضيقة · 390px")}</option></select></label>
  </div><p class="nq-hint">${t("Breakpoints follow the browser viewport. Narrow-container mode demonstrates wrapping; resize the browser to try responsive columns.", "تتبع نقاط التحول عرض المتصفح. تعرض الحاوية الضيقة التفاف المحتوى؛ غيّر حجم المتصفح لتجربة الأعمدة المتجاوبة.")}</p>
  <div class="layout-studio-canvas" id="layout-canvas" style="max-inline-size:${layoutState.width}">${markup(locale)}</div>
  <div class="code-block"><div class="code-label"><span>Vanilla HTML</span><button class="nq-button" data-variant="ghost" data-size="sm" id="layout-copy" data-copy="${e(code(locale))}">${t("Copy", "نسخ")}</button></div><pre dir="ltr" tabindex="0" aria-label="${t("Generated layout markup", "شفرة التخطيط الناتجة")}"><code id="layout-code">${e(code(locale))}</code></pre></div></section>
  <section class="section"><h2>${t("The same idea in every framework", "الفكرة نفسها في كل إطار")}</h2><div class="integration-grid">${[
    [
      "React",
      "<Grid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>\n  <Card>...</Card>\n</Grid>",
    ],
    [
      "Vue",
      '<Grid :columns="{ base: 1, md: 2, lg: 3 }" :gap="4">\n  <Card>...</Card>\n</Grid>',
    ],
    [
      "Angular",
      '<nq-grid [columns]="{ base: 1, md: 2, lg: 3 }" [gap]="4">\n  <nq-card>...</nq-card>\n</nq-grid>',
    ],
  ]
    .map(
      ([name, snippet]) =>
        `<article class="nq-card"><div class="nq-card-header"><h3>${name}</h3></div><div class="nq-card-body"><pre dir="ltr"><code>${e(snippet)}</code></pre></div></article>`,
    )
    .join("")}</div></section>`;
}

export function bindLayoutStudio(
  root: HTMLElement,
  locale: Locale,
): () => void {
  const update = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.id.startsWith("layout-")) return;
    const key = input.id.slice(7);
    if (key === "pattern") layoutState.pattern = input.value;
    else if (key === "width") layoutState.width = input.value;
    else if (
      ["columns", "gap", "padding"].includes(key) &&
      input.validity.valid &&
      input.value !== ""
    )
      (layoutState as unknown as Record<string, number>)[key] = Number(
        input.value,
      );
    const canvas = root.querySelector<HTMLElement>("#layout-canvas");
    if (!canvas) return;
    canvas.style.maxInlineSize = layoutState.width;
    canvas.innerHTML = markup(locale);
    root.querySelector("#layout-code")!.textContent = code(locale);
    (root.querySelector("#layout-copy") as HTMLElement).dataset.copy =
      code(locale);
  };
  root.addEventListener("input", update);
  return () => root.removeEventListener("input", update);
}

export function inputPage(locale: Locale, mode: "light" | "dark" = "light") {
  const t = words(locale);
  const fields: [string, string, string, string][] = [
    [
      "text",
      "Text / Arabic names",
      "النص / الأسماء العربية",
      'autocomplete="name"',
    ],
    [
      "email",
      "Email",
      "البريد الإلكتروني",
      'autocomplete="email" placeholder="name@example.test"',
    ],
    [
      "tel",
      "Telephone",
      "رقم الهاتف",
      'autocomplete="tel" placeholder="+966 5X XXX XXXX" dir="ltr"',
    ],
    [
      "url",
      "Website URL",
      "رابط الموقع",
      'autocomplete="url" placeholder="https://example.test" dir="ltr"',
    ],
    ["search", "Search", "بحث", `placeholder="${t("Search", "ابحث")}"`],
    [
      "password",
      "Password",
      "كلمة المرور",
      'autocomplete="new-password" minlength="8"',
    ],
    [
      "number",
      "Number / quantity",
      "العدد / الكمية",
      'min="0" max="100" step="1" value="5"',
    ],
    ["date", "Gregorian date", "تاريخ ميلادي", 'value="2026-10-28"'],
    [
      "datetime-local",
      "Local date & time",
      "التاريخ والوقت المحلي",
      'value="2026-10-28T09:30"',
    ],
    ["month", "Month", "الشهر", 'value="2026-10"'],
    ["week", "Week", "الأسبوع", 'value="2026-W44"'],
    ["time", "Time", "الوقت", 'value="09:30"'],
    ["color", "Color", "اللون", 'value="#006a64"'],
    ["range", "Range", "نطاق", 'min="0" max="100" value="60"'],
    ["file", "Files", "الملفات", 'accept=".pdf,.png,.jpg" multiple'],
    ["checkbox", "Checkbox", "مربع اختيار", 'value="yes"'],
    ["radio", "Radio option", "خيار واحد", 'value="yes"'],
  ];
  return `<div class="page-heading"><div><div class="eyebrow">${t("EVERY NATIVE INPUT", "كل مدخلات المتصفح")}</div><h1>${t("The right control for every detail.", "المدخل المناسب لكل تفصيل.")}</h1><p>${t("Native browser semantics, styled consistently. Try validation, reset, and local FormData output.", "خصائص المتصفح الأصلية بتصميم متّسق. جرّب التحقق وإعادة الضبط وعرض البيانات محليًا.")}</p></div></div>
  <form id="native-input-lab" class="nq-stack" style="--nq-layout-gap:1.5rem"><div class="nq-grid" style="--nq-layout-columns:1;--nq-layout-columns-md:2;--nq-layout-columns-xl:3;--nq-layout-gap:1rem">${fields.map(([type, en, ar, attrs]) => type === "password" ? expandedSample("password-field", "input-lab", locale) : type === "date" ? expandedSample("date-picker", "input-lab", locale).replace('data-nq-calendar="islamic-umalqura"', 'data-nq-calendar="gregory"').replace('name="appointment"', 'name="date"').replace(t("Appointment · Umm al-Qura picker", "الموعد · تقويم أم القرى"), t("Gregorian ISO date · custom picker", "تاريخ ميلادي ISO · منتقي نسق")) : `<label class="nq-field"><span class="nq-label">${t(en, ar)} <code>${type}</code></span><input type="${type}" class="${type === "checkbox" ? "nq-checkbox" : type === "radio" ? "nq-radio" : type === "range" ? "nq-slider" : "nq-input"}" name="${type}" ${attrs}></label>`).join("")}</div>
  <input type="hidden" name="hidden" value="demo-context">
  <fieldset class="nq-field"><legend class="nq-label">${t("Common platform fields", "حقول المنصات الشائعة")}</legend><div class="nq-grid" style="--nq-layout-columns-md:2;--nq-layout-gap:1rem">
  <label class="nq-field"><span class="nq-label">${t("IBAN format example", "مثال تنسيق آيبان")}</span><input class="nq-input" name="iban" dir="ltr" pattern="SA[0-9]{22}" placeholder="${t("SA + 22 digits", "SA + ٢٢ رقمًا")}" aria-describedby="iban-help"><span class="nq-hint" id="iban-help">${t("Format only. Account existence and checksum need separate validation.", "تنسيق فقط. وجود الحساب وصحة التحقق يحتاجان تحققًا منفصلًا.")}</span></label>
  <label class="nq-field"><span class="nq-label">${t("National ID / Iqama format example", "مثال تنسيق الهوية / الإقامة")}</span><input class="nq-input" name="identity" inputmode="numeric" pattern="[12][0-9]{9}" maxlength="10" aria-describedby="id-help"><span class="nq-hint" id="id-help">${t("Use fictional digits. This does not verify identity.", "استخدم أرقامًا وهمية. هذا الحقل لا يثبت الهوية.")}</span></label>
  <label class="nq-field"><span class="nq-label">${t("Street address", "عنوان الشارع")}</span><input class="nq-input" name="address" autocomplete="street-address"></label>
  <label class="nq-field"><span class="nq-label">${t("Amount in SAR", "المبلغ بالريال السعودي")}</span><span class="nq-input-group"><input class="nq-input" name="amount" type="number" min="0" step="0.01"><span class="nq-input-addon">${t("SAR", "ر.س")}</span></span></label>
  </div></fieldset><div class="nq-inline" style="--nq-layout-gap:1rem"><input type="submit" class="nq-button" value="${t("Inspect form values", "عرض قيم النموذج")}"><input type="reset" class="nq-button" data-variant="secondary" value="${t("Reset", "إعادة ضبط")}"><input type="button" class="nq-button" data-variant="ghost" value="${t("Native button", "زر أصلي")}" data-action="demo-info"><input type="image" src="${import.meta.env.BASE_URL}brand/assets/nasaq-wordmark${mode === "dark" ? "-white" : ""}.svg" width="64" height="50" style="object-fit:contain" alt="${t("Submit using image button", "إرسال بزر صورة")}" name="image-submit"></div>
  <p class="nq-hint">${t("All 22 standard input types are represented, including hidden and image buttons. The date example uses Nasaq’s custom picker with typed ISO input. Browser support for month/week and time widgets varies. Files and entered values stay in this tab.", "جميع أنواع الإدخال القياسية الـ٢٢ موجودة، بما فيها الحقول المخفية وأزرار الصور. يستخدم مثال التاريخ منتقي نسق المخصص مع إدخال ISO. يختلف دعم الشهر والأسبوع والوقت حسب المتصفح. تبقى القيم والملفات في علامة التبويب هذه.")}</p>
  <pre id="native-input-output" class="input-lab-output" aria-live="polite" dir="ltr">{}</pre></form>`;
}

export function bindInputLab(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>("#native-input-lab");
  if (!form) return () => {};
  const output = root.querySelector<HTMLElement>("#native-input-output")!;
  const submit = (event: Event) => {
    event.preventDefault();
    const entries = [...new FormData(form).entries()].map(([key, value]) => [
      key,
      value instanceof File
        ? { name: value.name, size: value.size, type: value.type }
        : key === "password"
          ? "[redacted]"
          : value,
    ]);
    output.textContent = JSON.stringify(Object.fromEntries(entries), null, 2);
  };
  const reset = () => {
    output.textContent = "{}";
  };
  form.addEventListener("submit", submit);
  form.addEventListener("reset", reset);
  return () => {
    form.removeEventListener("submit", submit);
    form.removeEventListener("reset", reset);
  };
}
