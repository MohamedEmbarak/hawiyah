import type { Locale } from "./data";

type SelectKind =
  "single" | "required" | "error" | "disabled" | "multiple" | "listbox";
interface SelectExample {
  kind: SelectKind;
  title: string;
  label: string;
  hint: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  initial: string[];
}

export function selectDemoCases(locale: Locale): SelectExample[] {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const options = [
    { value: "first", label: t("Riyadh", "الرياض") },
    { value: "second", label: t("Makkah", "مكة المكرمة") },
    { value: "third", label: t("Eastern Province", "المنطقة الشرقية") },
    {
      value: "unavailable",
      label: t("Unavailable region", "منطقة غير متاحة"),
      disabled: true,
    },
  ];
  const prompt = { value: "", label: t("Choose a region", "اختر المنطقة") };
  return [
    {
      kind: "single",
      title: t("Single selection", "اختيار مفرد"),
      label: t("Region", "المنطقة"),
      hint: t(
        "Choose the region where you need the service.",
        "اختر المنطقة التي تحتاج فيها إلى الخدمة.",
      ),
      options,
      initial: ["first"],
    },
    {
      kind: "required",
      title: t("Required selection", "اختيار مطلوب"),
      label: t("Service region", "منطقة الخدمة"),
      hint: t(
        "Choose a region before submitting.",
        "اختر المنطقة قبل الإرسال.",
      ),
      options: [prompt, ...options],
      initial: [""],
    },
    {
      kind: "error",
      title: t("Selection with an error", "اختيار مع رسالة خطأ"),
      label: t("Appointment region", "منطقة الموعد"),
      hint: t(
        "Availability depends on the service.",
        "يعتمد التوفر على الخدمة.",
      ),
      error: t(
        "Appointments are unavailable in this region.",
        "لا تتوفر مواعيد في هذه المنطقة.",
      ),
      options,
      initial: ["second"],
    },
    {
      kind: "disabled",
      title: t("Disabled selection", "اختيار معطل"),
      label: t("Assigned region", "المنطقة المحددة"),
      hint: t(
        "The service provider assigns this region.",
        "يحدد مقدم الخدمة هذه المنطقة.",
      ),
      options,
      initial: ["first"],
    },
    {
      kind: "multiple",
      title: t("Native multiple selection", "اختيار أصلي متعدد"),
      label: t("Preferred regions", "المناطق المفضلة"),
      hint: t(
        "You may choose more than one region.",
        "يمكنك اختيار أكثر من منطقة.",
      ),
      options,
      initial: ["first", "third"],
    },
    {
      kind: "listbox",
      title: t("Visible single-selection list", "قائمة ظاهرة باختيار مفرد"),
      label: t("Review region", "منطقة المراجعة"),
      hint: t(
        "Choose one of the visible options.",
        "اختر أحد الخيارات الظاهرة.",
      ),
      options,
      initial: ["second"],
    },
  ];
}

function content(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function selectDemoMarkup(
  example: SelectExample,
  prefix = "select-example",
) {
  const { kind, label, hint, error, options, initial } = example;
  const id = `${prefix}-${kind}`;
  const attributes = [
    kind === "required" && "required",
    kind === "disabled" && "disabled",
    kind === "multiple" && 'multiple size="4"',
    kind === "listbox" && 'size="3"',
    error && 'aria-invalid="true"',
  ]
    .filter(Boolean)
    .join(" ");
  const optionMarkup = options
    .map(
      (option) =>
        `<option value="${option.value}"${initial.includes(option.value) ? " selected" : ""}${option.disabled ? " disabled" : ""}>${content(option.label)}</option>`,
    )
    .join("");
  return `<div class="hw-field" data-select-demo="${kind}"><label class="hw-label" for="${id}">${content(label)}</label><select id="${id}" class="hw-select" name="${kind}-region" aria-describedby="${id}-hint${error ? ` ${id}-error` : ""}" ${attributes}>${optionMarkup}</select><span id="${id}-hint" class="hw-hint">${content(hint)}</span>${error ? `<span id="${id}-error" class="hw-error">${content(error)}</span>` : ""}</div>`;
}

export function selectNativeMarkup(example: SelectExample, controlled = false) {
  const { kind, label, hint, error, options, initial } = example;
  const attributes = `name="${kind}-region" label="${content(label)}" hint="${content(hint)}"${error ? ` error="${content(error)}"` : ""}${kind === "required" ? " required" : ""}${kind === "disabled" ? " disabled" : ""}`;
  const placeholder = kind === "required" ? options[0]!.label : "";
  const data = JSON.stringify(placeholder ? options.slice(1) : options);
  const nativeMarkup = () =>
    selectDemoMarkup(example, "app").replace(` data-select-demo="${kind}"`, "");
  const value = initial[0] ?? "";
  const reactValue = controlled
    ? "value={value} onChange={event => setValue(event.currentTarget.value)}"
    : `defaultValue={${JSON.stringify(kind === "multiple" ? initial : value)}}`;
  const reactMode =
    kind === "multiple"
      ? " multiple size={4}"
      : kind === "listbox"
        ? " size={3}"
        : "";
  return {
    react: `<Select ${attributes} options={${data}}${placeholder ? ` placeholder="${content(placeholder)}"` : ""} ${reactValue}${reactMode} />`,
    vue:
      kind === "multiple"
        ? nativeMarkup()
        : `<Select ${attributes} :options='${data}'${placeholder ? ` placeholder="${content(placeholder)}"` : ""} ${controlled ? 'v-model="value"' : `default-value="${value}"`}${kind === "listbox" ? ' :size="3"' : ""} />`,
    angular:
      kind === "multiple" || kind === "listbox"
        ? nativeMarkup()
        : `<hw-select ${attributes} [options]='${data}' placeholder="${content(placeholder)}" ${controlled ? '[(value)]="value"' : `value="${value}"`} />`,
  };
}
