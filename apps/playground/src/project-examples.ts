import type { IDEFiles } from "./component-ide";
import type { ProjectFramework, ProjectLanguage } from "./project-compiler";
import type { Locale } from "./data";

export const nativeProjectComponents = new Set([
  "button",
  "icon-button",
  "text-field",
  "textarea",
  "checkbox",
  "switch",
  "toggle-group",
  "badge",
  "alert",
  "divider",
  "spinner",
  "select",
  "radio",
  "card",
  "accordion",
  "table",
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
  const typed = language === "typescript",
    ext = typed ? "ts" : "js",
    ar = locale === "ar";
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const css =
    "@import '@nasaq/styles/styles.css';\n\n/* Application-specific styles */\n.demo { display: grid; gap: 1rem; }\n";
  if (framework === "vanilla")
    return {
      names: { html: "index.html", css: "style.css", js: `main.${ext}` },
      entry: `main.${ext}`,
      host: "",
      files: {
        html: `<!doctype html>\n<html lang="${locale}" dir="${ar ? "rtl" : "ltr"}">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nasaq example</title></head>\n<body>\n<div id="app">\n${html}\n</div>\n<script type="module" src="./main.${ext}"></script>\n</body>\n</html>\n`,
        css,
        js: `import { enhance } from '@nasaq/vanilla';\nimport './style.css';\n\nconst root = document.querySelector${typed ? "<HTMLElement>" : ""}('#app');\nif (!root) throw new Error('Missing app root');\nconst cleanup = enhance(root);\nroot.addEventListener('nq:change', event => console.log(${typed ? "(event as CustomEvent).detail" : "event.detail"}));\nwindow.addEventListener('pagehide', cleanup, { once: true });\n`,
      },
    };
  if (!nativeProjectComponents.has(id))
    throw new Error("Native project recipe pending for " + id);
  const name: Record<string, string> = {
    "icon-button": "IconButton",
    "text-field": "TextField",
    "toggle-group": "ToggleGroup",
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
    card: "Card",
    accordion: "Accordion",
    table: "Table",
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
  };
  const component = name[id]!;
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
  if (id === "button") {
    state = true;
    react = `<Button onClick={() => setValue(value + '!')}>${t("Click me", "اضغط هنا")}</Button><output>{value}</output>`;
    vue = `<Button @click="value += '!'">${t("Click me", "اضغط هنا")}</Button><output>{{ value }}</output>`;
    angular = `<button nqButton type="button" (click)="value = value + '!'">${t("Click me", "اضغط هنا")}</button><output>{{ value }}</output>`;
  } else if (id === "icon-button") {
    state = true;
    react = `<IconButton label="${t("Search", "بحث")}" onClick={() => setValue(value + '!')}><span className="nq-icon" data-icon="search-01" aria-hidden="true" /></IconButton><output>{value}</output>`;
    vue = `<IconButton label="${t("Search", "بحث")}" @click="value += '!'"><span class="nq-icon" data-icon="search-01" aria-hidden="true" /></IconButton><output>{{ value }}</output>`;
    angular = `<nq-icon-button label="${t("Search", "بحث")}" (activated)="value = value + '!'"><span class="nq-icon" data-icon="search-01" aria-hidden="true"></span></nq-icon-button><output>{{ value }}</output>`;
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
    react = `<ToggleGroup label="${label}" options={${options}} value={value} onValueChange={setValue} /><output>{value}</output>`;
    vue = `<ToggleGroup label="${label}" :options='${options}' v-model="value" /><output>{{ value }}</output>`;
    angular = `<nq-toggle-group label="${label}" [options]="options" [(value)]="value" /><output>{{ value }}</output>`;
    angularMember = `\n  options = ${options};`;
  } else if (id === "select") {
    state = true;
    initialValue = "'first'";
    react = `<Select label="${label}" options={${options}} value={value} onChange={event => setValue(event.currentTarget.value)} /><output>{value}</output>`;
    vue = `<Select label="${label}" :options='${options}' v-model="value" /><output>{{ value }}</output>`;
    angular = `<nq-select label="${label}" [options]="options" placeholder="" [(value)]="value" /><output>{{ value }}</output>`;
    angularMember = `\n  options = ${options};`;
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
    state = numberState = true;
    initialValue = "1";
    const labels = `label="${t("Pages", "الصفحات")}" previousLabel="${t("Previous", "السابق")}" nextLabel="${t("Next", "التالي")}"`;
    const pageLabel = t("Page", "الصفحة");
    react = `<Pagination ${labels} totalPages={10} page={value} onPageChange={setValue} getPageLabel={page => '${pageLabel} ' + page} /><output>{value}</output>`;
    vue = `<Pagination ${labels} :total-pages="10" v-model="value" :page-label="page => '${pageLabel} ' + page" /><output>{{ value }}</output>`;
    angular = `<nq-pagination ${labels} [totalPages]="10" [(page)]="value" [pageLabel]="pageLabel" /><output>{{ value }}</output>`;
    angularMember = `\n  pageLabel = (page: number) => '${pageLabel} ' + page;`;
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
    const items = [
      {
        value: "first",
        label: t("Details", "التفاصيل"),
        content: t("Service details", "تفاصيل الخدمة"),
      },
      {
        value: "second",
        label: t("Requirements", "المتطلبات"),
        content: t("Required documents", "المستندات المطلوبة"),
      },
      {
        value: "third",
        label: t("Unavailable", "غير متاح"),
        content: "",
        disabled: true,
      },
    ];
    react = `<Tabs label="${label}" items={${JSON.stringify(items)}} value={value} onValueChange={setValue} /><output>{value}</output>`;
    vue = `<Tabs label="${label}" :items='${JSON.stringify(items)}' v-model="value" /><output>{{ value }}</output>`;
    angular = `<nq-tabs label="${label}" [(value)]="value">${items.map((item) => `<nq-tab value="${item.value}" label="${item.label}"${item.disabled ? " disabled" : ""}>${item.content}</nq-tab>`).join("")}</nq-tabs><output>{{ value }}</output>`;
  } else if (id === "progress") {
    react = `<Progress label="${t("Upload progress", "تقدم الرفع")}" value={65} max={100} />`;
    vue = `<Progress label="${t("Upload progress", "تقدم الرفع")}" :value="65" :max="100" />`;
    angular = `<nq-progress label="${t("Upload progress", "تقدم الرفع")}" [value]="65" [max]="100" />`;
  } else if (id === "skeleton") {
    react = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><Skeleton style={{width:'100%',height:'4rem'}} /></div>`;
    vue = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><Skeleton style="width:100%;height:4rem" /></div>`;
    angular = `<div aria-busy="true" aria-label="${t("Loading content", "تحميل المحتوى")}"><nq-skeleton width="100%" height="4rem" /></div>`;
  } else if (id === "avatar") {
    react = `<Avatar name="${t("Example user", "مستخدم تجريبي")}" />`;
    vue = react;
    angular = `<nq-avatar name="${t("Example user", "مستخدم تجريبي")}" />`;
  } else if (id === "empty") {
    react = `<EmptyState title="${t("No applications", "لا توجد طلبات")}" description="${t("Your applications will appear here.", "ستظهر طلباتك هنا.")}" />`;
    vue = react;
    angular = `<nq-empty-state title="${t("No applications", "لا توجد طلبات")}" description="${t("Your applications will appear here.", "ستظهر طلباتك هنا.")}" />`;
  } else if (id === "link") {
    const text = t("Read the guide", "اقرأ الدليل");
    react = `<Link href="#guide">${text}<span className="nq-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true" /></Link>`;
    vue = `<Link href="#guide">${text}<span class="nq-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true" /></Link>`;
    angular = `<nq-link href="#guide">${text}<span class="nq-icon" data-icon="arrow-right-01" data-directional="true" aria-hidden="true"></span></nq-link>`;
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
    react = `<Badge tone="success">${label}</Badge>`;
    vue = react;
    angular = `<nq-badge tone="success">${label}</nq-badge>`;
  } else if (id === "alert") {
    react = `<Alert tone="success" title="${label}"><p>${t("Saved successfully", "تم الحفظ بنجاح")}</p></Alert>`;
    vue = react;
    angular = `<nq-alert tone="success" title="${label}"><p>${t("Saved successfully", "تم الحفظ بنجاح")}</p></nq-alert>`;
  } else if (id === "divider") {
    react = "<Divider />";
    vue = react;
    angular = "<nq-divider />";
  } else {
    react = `<Spinner label="${t("Loading", "جارٍ التحميل")}" />`;
    vue = react;
    angular = `<nq-spinner label="${t("Loading", "جارٍ التحميل")}" />`;
  }
  const initial =
    initialValue ??
    (booleanState ? "false" : id === "toggle-group" ? "'first'" : "''");
  const stateType = booleanState
    ? "boolean"
    : numberState
      ? "number"
      : "string";
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
        html: `${state ? "import { useState } from 'react';\n" : ""}import { ${component} } from '@nasaq/react';\n\nexport default function App() {\n${state ? `  const [value, setValue] = useState${typed ? `<${stateType}>` : ""}(${initial});\n` : ""}  return <main className="demo" lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${react}</main>;\n}\n`,
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
        html: `<script setup${typed ? ' lang="ts"' : ""}>\n${state ? "import { ref } from 'vue';\n" : ""}import { ${component} } from '@nasaq/vue';\n${state ? `const value = ref${typed ? `<${stateType}>` : ""}(${initial});\n` : ""}</script>\n\n<template>\n  <main class="demo" lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${vue}</main>\n</template>\n`,
        js: `import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\n\ncreateApp(App).mount('#app');\n`,
      },
    };
  const angularClass = `Nq${component}${id === "button" ? "Directive" : "Component"}${id === "tabs" ? ", NqTabComponent" : ""}`;
  return {
    names: { html: "app.component.ts", css: "style.css", js: "main.ts" },
    entry: "main.ts",
    host: "<app-root></app-root>",
    files: {
      css,
      html: `import { Component } from '@angular/core';\nimport { ${angularClass} } from '@nasaq/angular';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [${angularClass}],\n  template: \`<main class="demo" lang="${locale}" dir="${ar ? "rtl" : "ltr"}">${angular}</main>\`,\n})\nexport class AppComponent {${state ? `\n  value: ${id === "toggle-group" ? "string | string[]" : stateType} = ${initial};` : ""}${angularMember}\n}\n`,
      js: "import '@angular/compiler';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\nimport './style.css';\n\nbootstrapApplication(AppComponent).catch(error => console.error(error));\n",
    },
  };
}
