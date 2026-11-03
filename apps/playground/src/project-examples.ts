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
    booleanState = false;
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
  const initial = booleanState
    ? "false"
    : id === "toggle-group"
      ? "'first'"
      : "''";
  const stateType = booleanState ? "boolean" : "string";
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
  const angularClass = `Nq${component}${id === "button" ? "Directive" : "Component"}`;
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
