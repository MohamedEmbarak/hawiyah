import { catalog, escape as e, icon, type ComponentId, type Locale } from './data';
import { componentGuides } from './component-guides';
import { arabicComponentGuides } from './component-guides.ar';
import { arabicArticle } from './guide-articles.ar';
import type { IDEFiles } from './component-ide';
import './guide.css';

const sourceRoot = 'https://github.com/MohamedEmbarak/nasaq/blob/main/';
const source = (path: string, label: string) => `<a href="${sourceRoot + path}" target="_blank" rel="noopener">${e(label)} ↗</a>`;
const list = (items: readonly string[], ordered = false) => `<${ordered ? 'ol' : 'ul'}>${items.map(item => `<li>${e(item)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`;
const note = (title: string, body: string) => `<aside class="guide-note"><strong>${title}</strong><p>${body}</p></aside>`;
type Code = (value: string) => string;

export const guideTopics = [
  ['getting-started', 'Getting started', 'البداية'],
  ['vanilla', 'Vanilla JavaScript', 'جافاسكريبت'],
  ['react', 'React', 'React'],
  ['vue', 'Vue', 'Vue'],
  ['angular', 'Angular', 'Angular'],
  ['theming', 'Themes, typography & RTL', 'السمات والخطوط والاتجاه'],
  ['layouts', 'Composing layouts', 'تركيب التخطيطات'],
  ['lifecycle', 'State & component lifecycle', 'الحالة ودورة حياة المكوّن'],
  ['calendars', 'Gregorian & Hijri dates', 'التواريخ الميلادية والهجرية'],
  ['accessibility', 'Accessibility', 'الإتاحة'],
  ['extending', 'Extending the system', 'توسيع النظام'],
  ['alignment', 'DGA alignment', 'المواءمة مع DGA'],
] as const;

export function guideTitle(view: string, locale: Locale): string | undefined {
  if (view.startsWith('component/')) {
    const item = catalog.find(c => c[0] === view.slice('component/'.length));
    return item?.[locale === 'ar' ? 2 : 1];
  }
  if (view === 'docs' || view.startsWith('docs/')) {
    const topic = guideTopics.find(t => t[0] === (view.split('/')[1] || 'getting-started'));
    return topic?.[locale === 'ar' ? 2 : 1];
  }
}

function article(topic: string, code: Code): string {
  switch (topic) {
    case 'getting-started': return `
      <p class="guide-lead">Build a service interface with semantic HTML, shared styles, and the framework you already use. Nasaq keeps its visual foundation separate from interaction behavior.</p>
      ${note('Public source · 0.1 development', 'Nasaq is available from GitHub under Apache 2.0. The packages are not yet published on npm. Start from the repository and its working examples; the <code>@nasaq/*</code> imports below resolve through the workspace.')}
      <h2>1. Run the source</h2><p>Use Node.js 24 and pnpm 11.25.0, matching the repository toolchain. Install pnpm if it is not already available.</p>
      ${code('npm install --global pnpm@11.25.0\ngit clone https://github.com/MohamedEmbarak/nasaq.git\ncd nasaq\npnpm install --frozen-lockfile\npnpm build:packages\npnpm dev')}
      <p>Open the local address printed by Vite. The default app is the vanilla guide and playground you are reading now.</p>
      <h2>2. Choose a starting point</h2><div class="guide-choice-grid">${['vanilla','react','vue','angular'].map(f => `<a class="guide-choice" href="#docs/${f}"><span>${f === 'vanilla' ? 'HTML + JavaScript' : f[0]!.toUpperCase()+f.slice(1)}</span><p>${f === 'vanilla' ? 'Keep semantic markup and enhance only interactive controls.' : 'Use native components, framework state, and normal application rendering.'}</p><b>Read the setup guide ${icon('arrow',14)}</b></a>`).join('')}</div>
      <h2>3. Bring in styles and context</h2><p>Import the stylesheet once in your application entry. The reset is optional and should come first if you choose it. Each application controls its font loading.</p>
      ${code("import '@nasaq/styles/reset.css'; // Optional\nimport '@nasaq/styles/styles.css';")}
      ${code('<main lang="ar" dir="rtl"\n      data-nq-theme="dga" data-nq-mode="light"\n      data-nq-density="comfortable">\n  <button type="button" class="nq-button">ابدأ الطلب</button>\n</main>')}
      <h2>4. Explore a complete component</h2><p>Every catalog entry has a working example, copyable markup, API notes, lifecycle, accessibility guidance, and implementation boundaries. Start with <a href="#component/text-field">Text field</a>, <a href="#component/dialog">Dialog</a>, or <a href="#component/date-picker">Date picker</a>, then compose a page in the <a href="#layouts">layout studio</a>.</p>
      <h2>5. Check your changes</h2>${code('pnpm build\npnpm test\npnpm test:browser\npnpm check:packages')}
      <p>Browser checks need Chromium. Set <code>NASAQ_CHROMIUM</code> to a local executable when necessary. Package checks build and test local tarballs; they do not publish anything. See ${source('docs/validation.md','the validation record')} for the exact coverage and remaining checks.</p>
      <h2>Understand the package layers</h2><div class="guide-table-wrap" tabindex="0" role="region" aria-label="Scrollable reference table"><table class="nq-table"><thead><tr><th>Package</th><th>Responsibility</th></tr></thead><tbody>${[['tokens','Semantic design values and theme variables'],['styles','CSS components, responsive layout helpers, and optional reset'],['core','Pure shared behavior, date conversion, formatting, and layout helpers'],['vanilla','DOM enhancement and explicit cleanup'],['react / vue / angular','Native framework components and lifecycle integration']].map(([a,b])=>`<tr><td><code>@nasaq/${a}</code></td><td>${b}</td></tr>`).join('')}</tbody></table></div>
      <p>To experiment in another application before the npm release, follow ${source('scripts/check-packages.mjs','the tested local package-consumer setup')} or work within one of the example apps. Do not assume registry packages with these names are this project.</p>`;
    case 'vanilla': return `
      <p class="guide-lead">Start with native HTML. Add a controller only where the interaction needs one.</p>
      <h2>Run the example</h2>${code('pnpm build:packages\npnpm dev')}
      <h2>Render meaningful markup</h2>${code('<div id="application" lang="ar" dir="rtl" data-nq-theme="dga">\n  <div class="nq-field">\n    <label class="nq-label" for="name">الاسم الكامل</label>\n    <input id="name" name="name" class="nq-input"\n           autocomplete="name" required aria-describedby="name-hint">\n    <span id="name-hint" class="nq-hint">كما يظهر في المستند.</span>\n  </div>\n  <button type="button" class="nq-button">متابعة</button>\n</div>')}
      <h2>Enhance after mounting; dispose before replacement</h2>${code("import '@nasaq/styles/styles.css';\nimport { enhance } from '@nasaq/vanilla';\n\nconst root = document.querySelector('#application');\nif (!root) throw new Error('Application root not found.');\nlet dispose = enhance(root);\n\nfunction replaceView(markup) {\n  dispose();\n  root.innerHTML = markup; // Use only your own trusted templates.\n  dispose = enhance(root);\n}\n\n// When leaving this view:\ndispose();")}
      <p>The enhancer finds explicit <code>data-nq</code> hooks for tabs, dialogs, comboboxes, calendars, menus, and other controls. Plain buttons, labels, inputs, native selects, and details/summary accordions retain browser behavior without an enhancer. Keep the DOM stable while a controller is active.</p>
      ${note('One owner per DOM subtree', 'Do not enhance a React, Vue, or Angular component tree. Those adapters already own their interaction state and cleanup.')}
      <h2>Application events and data</h2><p>Native controls retain names, required validation, FormData, and input/change events. Rich controls expose documented events or hidden committed values. Treat a combobox query and its selected value as separate data. File pickers select files locally; your application owns upload transport.</p>
      <p>Continue with ${source('packages/vanilla/README.md','the vanilla API')} and ${source('packages/vanilla/EXPANSION-API.md','the full enhancement markup contract')}.</p>`;
    case 'react': return `
      <p class="guide-lead">Use native React components and ordinary controlled or uncontrolled state. Shared CSS supplies the appearance.</p>
      <h2>Run the React example</h2>${code('pnpm build:packages\npnpm --filter @nasaq/example-react dev')}
      <h2>A controlled field</h2>${code(`import { useState } from 'react';\nimport { Button, TextField } from '@nasaq/react';\nimport '@nasaq/styles/styles.css';\n\nexport function RequestForm() {\n  const [name, setName] = useState('');\n  return (\n    <form lang="ar" dir="rtl" onSubmit={event => event.preventDefault()}>\n      <TextField label="الاسم الكامل" name="name" required\n        value={name} onChange={event => setName(event.currentTarget.value)} />\n      <Button type="submit">متابعة</Button>\n    </form>\n  );\n}`)}
      <h2>Interaction ownership</h2>${list(['Use value/defaultValue or checked/defaultChecked with onChange for native input controls. Rich controls such as Combobox and Tabs expose onValueChange.', 'React 19 refs target the principal native control. Native attributes, ARIA attributes, className, and event handlers remain available.', 'Dialog accepts open/onOpenChange or defaultOpen and restores focus to its connected trigger when closed. Do not add a second focus trap.', 'React owns mounting and effect cleanup. Do not call the vanilla enhancer inside a React component.'])}
      <h2>Server rendering</h2><p>Imports and server rendering do not access browser globals. IDs use React useId. Native modal dialogs open after mounting. Preserve the same initial data on the server and client; follow normal React hydration requirements. The validation record describes tested cases, not a blanket certification of every host framework.</p>
      <p>Read ${source('packages/react/README.md','all React props and composition APIs')} or inspect ${source('examples/react/src/main.tsx','the complete example')}.</p>`;
    case 'vue': return `
      <p class="guide-lead">Compose native Vue 3.5+ components with v-model, slots, and normal reactive state.</p>
      <h2>Run the Vue example</h2>${code('pnpm build:packages\npnpm --filter @nasaq/example-vue dev')}
      <h2>A field and review dialog</h2>${code(`<script setup lang="ts">\nimport { ref } from 'vue';\nimport { Button, Dialog, TextField } from '@nasaq/vue';\nimport '@nasaq/styles/styles.css';\nconst name = ref('');\nconst reviewing = ref(false);\n</script>\n\n<template>\n  <form lang="ar" dir="rtl" @submit.prevent="reviewing = true">\n    <TextField v-model="name" label="الاسم" name="name" required />\n    <Button type="submit">مراجعة</Button>\n  </form>\n  <Dialog v-model:open="reviewing" title="مراجعة الطلب" close-label="إغلاق">\n    <p>{{ name }}</p>\n    <template #footer="{ close }"><Button @click="close">تم</Button></template>\n  </Dialog>\n</template>`)}
      <h2>Models, slots, and refs</h2>${list(['Text inputs, select, combobox, tabs, and pagination use v-model. Checkbox and switch models are boolean. Dialog uses v-model:open.', 'For uncontrolled state, omit v-model and supply defaultValue or defaultOpen. Give defaultValue alongside v-model when a form reset should restore a nonempty value.', 'Native attributes and listeners fall through to the main control; classes merge and internal handlers retain consumer listeners.', 'Field controls expose element and focus() through template refs. Dialog exposes element, show(), and close().', 'Vue owns lifecycle and disposal. Do not run the vanilla enhancer over Vue-rendered components.'])}
      <h2>Rendering and accessibility</h2><p>Vue useId supplies stable server/client associations. A server-rendered open dialog becomes modal after mounting. Provide translated labels, empty messages, close labels, and status announcements separately from <code>dir</code>.</p>
      <p>Read ${source('packages/vue/README.md','all Vue models, slots, and props')} and ${source('examples/vue/src/App.vue','the complete Vue example')}.</p>`;
    case 'angular': return `
      <p class="guide-lead">Import standalone Angular components. Value controls integrate with template-driven and reactive forms.</p>
      <h2>Run the Angular example</h2>${code('pnpm build:packages\npnpm --filter @nasaq/example-angular dev')}
      <h2>Use a standalone field</h2>${code(`import { Component } from '@angular/core';\nimport { FormsModule } from '@angular/forms';\nimport { NqButtonDirective, NqTextFieldComponent } from '@nasaq/angular';\n\n@Component({\n  standalone: true,\n  imports: [FormsModule, NqButtonDirective, NqTextFieldComponent],\n  template: \`\n    <form #form="ngForm" lang="ar" dir="rtl" (ngSubmit)="save()">\n      <nq-text-field controlId="name" label="الاسم" name="name"\n        [(ngModel)]="name" [required]="true" />\n      <button nqButton type="submit">حفظ</button>\n      <button nqButton variant="secondary" type="button"\n        (click)="form.resetForm()">إعادة تعيين</button>\n    </form>\n  \`,\n})\nexport class RequestForm {\n  name = '';\n  save() { /* Your application action. */ }\n}`)}
      <p>Load <code>@nasaq/styles/styles.css</code> once in your application's global stylesheet or entry. Angular does not import it implicitly.</p>
      <h2>Form and lifecycle contract</h2>${list(['Value controls implement ControlValueAccessor. Use ngModel, a reactive form control, or value/valueChange; do not bind competing value mechanisms on one control.', 'Application-owned controlId values make label associations explicit, especially during server rendering.', 'Use Angular resetForm() or FormGroup.reset() for custom form controls. Error props present feedback; application validators decide validity.', 'Angular owns the DOM and cleanup. The components use normal templates and no custom-element wrappers or vanilla controllers.', 'Native dialog modality starts after view creation. Closing and destruction restore focus when the opener is still connected.'])}
      ${note('Library packaging and example scope', 'The library builds to Angular Package Format using ng-packagr and partial compilation. The small Vite example intentionally uses JIT. Use a normal Angular AOT build for production; the example does not establish AOT, SSR, or hydration coverage.')}
      <p>Read ${source('packages/angular/README.md','all standalone selectors, inputs, and outputs')}.</p>`;
    case 'theming': return `
      <p class="guide-lead">Change the look with semantic tokens. Keep theme, mode, density, language, and text direction independent.</p>
      <h2>Set a theme on a containing element</h2>${code('<main data-nq-theme="dga" data-nq-mode="dark"\n      data-nq-density="comfortable" lang="ar" dir="rtl">\n  <!-- Components inherit this context. -->\n</main>')}
      <p>The default is <code>dga</code>, mapped from supplied Platforms Code foundation snapshots. Choose <code>nasaq</code> to retain the original Woven Rhythm palette and font/radius/spacing/content metrics; <code>custom</code> starts from DGA and accepts your overrides. Modes are <code>light</code> and <code>dark</code>; density is <code>comfortable</code> or <code>compact</code>. Try these combinations in <a href="#foundations">Foundations</a> and read the <a href="#docs/alignment">source and migration guidance</a>.</p>
      <h2>Override meaning, not individual components</h2>${code('[data-nq-theme="custom"] {\n  --nq-color-primary: #293b8f;\n  --nq-color-primary-hover: #1d2c70;\n  --nq-color-on-primary: #ffffff;\n  --nq-color-primary-subtle: #dadff7;\n  --nq-color-primary-text: #293b8f;\n  --nq-radius-md: 0.5rem;\n}')}
      <p>Put overrides after the shared stylesheet. Review text, focus, disabled, hover, and error contrast in both modes. A color that works for a filled button may need a separate token when used as text on a surface.</p>
      <h2>Typography belongs to the application</h2><p>Styles declare font families but do not download fonts. This guide uses IBM Plex Sans Arabic and IBM Plex Sans. Load only the weights and scripts you need; keep upstream font license notices when redistributing them. The Arabic logo is outlined SVG and has no font dependency.</p>
      <h2>RTL is a layout choice; Arabic is a language</h2>${list(['Set lang="ar" for Arabic content and dir="rtl" for right-to-left layout; neither substitutes for the other.', 'Keep telephone numbers, IBANs, URLs, and code in an appropriate local LTR context. Translate labels and feedback independently.', 'Use margin-inline, padding-inline, inset-inline, and other logical CSS properties when extending a component.', 'Do not reverse Arabic strings, add letter spacing to connected Arabic, or mirror the logo.', 'Test horizontal navigation in both directions and check that visual and DOM reading order stay meaningful.'])}
      <p>Read ${source('packages/tokens/README.md','the token package')} and ${source('docs/design-principles.md','the design principles')}.</p>`;
    case 'layouts': return `
      <p class="guide-lead">Compose a page with a small set of predictable primitives. CSS handles responsiveness; no JavaScript viewport measurement is required.</p>
      <h2>Start with three choices</h2><div class="guide-choice-grid"><a class="guide-choice" href="#component/stack"><span>Stack</span><p>One vertical sequence: labels, fields, sections, and content.</p></a><a class="guide-choice" href="#component/inline"><span>Inline</span><p>Wrapping actions, tags, and metadata in a logical row.</p></a><a class="guide-choice" href="#component/grid"><span>Grid</span><p>Cards or panels that share space as the viewport changes.</p></a></div>
      <h2>A responsive page in HTML</h2>${code('<main class="nq-container">\n  <section class="nq-stack" style="--nq-layout-gap:var(--nq-space-6)">\n    <header class="nq-page-header"><h1>الخدمات</h1></header>\n    <div class="nq-grid" style="--nq-layout-columns:auto-fit;--nq-layout-min-item:18rem">\n      <article class="nq-card"><div class="nq-card-body">خدمة أولى</div></article>\n      <article class="nq-card"><div class="nq-card-body">خدمة ثانية</div></article>\n    </div>\n  </section>\n</main>')}
      <h2>The same structure in React</h2>${code(`import { Container, Grid, Card, Stack } from '@nasaq/react';\n\n<Container maxWidth="78rem">\n  <Stack gap={{ base: 4, lg: 6 }}>\n    <h1>Services</h1>\n    <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>\n      <Card>First service</Card>\n      <Card>Second service</Card>\n    </Grid>\n  </Stack>\n</Container>`)}
      <p>Responsive props use <code>base</code>, <code>sm</code> (40rem), <code>md</code> (48rem), <code>lg</code> (64rem), and <code>xl</code> (80rem). Unspecified steps inherit the nearest smaller value. <code>minItemWidth</code> enables an adaptive grid and takes precedence over column counts.</p>
      <h2>Complete the shell</h2><p>Use <a href="#component/sidebar">Sidebar</a> for contextual navigation, <a href="#component/app-shell">App shell</a> for application regions, <a href="#component/page-header">Page header</a> for a heading and actions, and <a href="#component/aspect-ratio">Aspect ratio</a> to reserve media space. Preserve semantic landmarks; do not nest multiple main regions.</p>
      <p>Try the <a href="#layouts">interactive layout studio</a> and read ${source('docs/layout.md','all layout props, CSS variables, and adapter examples')}.</p>`;
    case 'lifecycle': return `
      <p class="guide-lead">A component has an owner, state, interaction rules, and an end to its lifetime. Make those boundaries explicit.</p>
      <ol class="guide-lifecycle"><li><strong>Create</strong><p>Render semantic elements and accessible names. Give inputs stable IDs, names, initial values, and validation hints.</p></li><li><strong>Connect</strong><p>Mount the framework component or enhance a vanilla subtree once its elements exist. Connect application state and events.</p></li><li><strong>Interact</strong><p>Let the component manage keyboard, focus, and transient open/query state. Let your application own data, permissions, and requests.</p></li><li><strong>Update</strong><p>Pass new values through the documented props or controller contract. Keep selection, displayed query, and submitted values distinct when the API does.</p></li><li><strong>Dispose</strong><p>Call the vanilla cleanup before replacing a subtree. Framework unmount/destruction runs adapter cleanup. Close transient UI and restore meaningful focus.</p></li></ol>
      <h2>Choose who owns the value</h2><div class="guide-table-wrap" tabindex="0" role="region" aria-label="Scrollable reference table"><table class="nq-table"><thead><tr><th>Approach</th><th>Use it when</th><th>Responsibility</th></tr></thead><tbody><tr><td>Native / uncontrolled</td><td>A local form can retain its own current values.</td><td>Read FormData or events; use documented defaults and reset behavior.</td></tr><tr><td>Controlled</td><td>Application state must coordinate several controls.</td><td>Update state after the change callback; do not pass a stale value back.</td></tr><tr><td>Derived</td><td>One value is computed from other state.</td><td>Keep a single source of truth instead of synchronizing duplicate stores.</td></tr></tbody></table></div>
      <h2>Transient and persistent state</h2><p>Dialog open state, a highlighted combobox option, and a tooltip are transient. A committed form value belongs to the application. Storage and network requests are application decisions. Most components do not persist anything; consent persistence is an explicit option. Demo submissions and uploaded file names on this site are local examples.</p>
      <h2>Understand a real interaction</h2><p>A <a href="#component/combobox">Combobox</a> opens on interaction, filters a query, moves active focus with arrows, commits on Enter or selection, and closes on Escape/blur. Typing clears a previous committed selection. A <a href="#component/dialog">Dialog</a> enters the browser top layer after mounting, lets the browser contain focus, closes on Escape or an action, and restores the opener.</p>
      <h2>Handle asynchronous work explicitly</h2>${list(['Keep request cancellation, retries, authentication, and storage in the application layer.', 'Show loading with a single text status and disable only actions that cannot safely repeat.', 'Preserve entered data on failure; place actionable error text beside the relevant control.', 'Discard stale responses when the request parameters or mounted view change.', 'When a region disappears, move focus to a sensible surviving control instead of leaving it lost.'])}
      <p>Every <a href="#components">component reference</a> contains its own lifecycle and supported state transitions.</p>`;
    case 'calendars': return `
      <p class="guide-lead">One submitted day, two display calendars. Switching between Gregorian and Hijri must not change the chosen date.</p>
      <h2>The stored value is a Gregorian date-only string</h2>${code('const selectedDay = "2026-10-28"; // YYYY-MM-DD\n// The calendar can display this same day in Gregorian or Umm al-Qura.')}
      <p><a href="#component/date-picker">Date picker</a> combines a native date input with a switchable calendar dialog. <a href="#component/calendar">Calendar</a> is the inline version. The input and form value remain Gregorian ISO; the associated visible output shows the selected day in the active calendar.</p>
      <h2>Which Hijri calculation?</h2><p>Nasaq uses a pinned published Umm al-Qura reference dataset, shared by all adapters. It does not use a tabular arithmetic approximation or silently depend on a browser's ICU calendar version. The documented range is <strong>1924-08-01 through 2077-11-16</strong> (AH 1343–1500).</p>
      ${note('Civil calendar, with an explicit source boundary', 'The reference table is a reproducible published dataset, not a live official Saudi feed. Religious observance may depend on an official announcement. The source research documents this distinction and explains why alternative crescent-visibility calculations do not replace a Saudi civil calendar.')}
      <h2>Handle boundaries and switches</h2>${list(['Keep the ISO value unchanged when the display calendar switches.', 'A date outside the supported Hijri range stays preserved and receives an explicit range message when Hijri is selected; it is not silently reinterpreted.', 'Keep min/max, required validation, native input editing, reset behavior, and focus return connected.', 'Separate date-only business values from timestamps. Do not route YYYY-MM-DD through a local timezone conversion that changes the day.', 'Translate month/navigation labels and status text; numeral style and text direction are independent.'])}
      <p>Read ${source('docs/date-calendars.md','calendar sources, research, exact dataset provenance, and reliability checks')} before integrating dates into official records.</p>`;
    case 'accessibility': return `
      <p class="guide-lead">Preserve the native platform, then test the complete experience with real content and real interaction.</p>
      <h2>Names and relationships</h2>${list(['Give every control an accessible name. Use label/for or the adapter label prop, not a placeholder alone.', 'Connect hints and errors through aria-describedby; communicate invalid state and explain how to correct it.', 'Use fieldset and legend for related radio buttons and checkbox groups.', 'Use buttons for actions and links for navigation. Preserve meaningful landmarks and heading order.'])}
      <h2>Keyboard and focus</h2>${list(['Test Tab and Shift+Tab through the complete form and its validation states.', 'Test arrow keys, Home/End, Enter/Space, and Escape where each component documents them.', 'Keep focus visible, restore focus after closing overlays, and follow RTL navigation rules for horizontal controls.', 'Do not add custom focus traps to native dialogs or put interactive content inside descriptive tooltips.'])}
      <h2>Motion, loading, and contrast</h2><p>Respect <code>prefers-reduced-motion</code>. Animated wordmark loaders have static SVG alternatives. Announce loading once in text; do not announce every skeleton or animation frame. Check text, focus indicators, borders required to identify controls, and error states in every theme and density.</p>
      <h2>Test the application</h2>${code('pnpm test\npnpm test:browser')}
      <p>Automated checks find only part of the problem. Test a screen reader, zoom/reflow, keyboard-only use, touch targets, long Arabic labels, and representative browsers. WCAG 2.2 AA is the intended target; no blanket conformance claim follows from importing Nasaq.</p>
      <p>Read ${source('docs/validation.md','the verified coverage and remaining gaps')}. Component pages list behavior-specific accessibility responsibilities.</p>`;
    case 'extending': return `
      <p class="guide-lead">Prefer a small, documented extension that keeps the component's behavior intact.</p>
      <h2>Choose the smallest useful change</h2><ol class="guide-lifecycle"><li><strong>Token override</strong><p>Change a semantic color, spacing, radius, or type value to adapt the whole system.</p></li><li><strong>Documented variant or composition</strong><p>Use an existing variant, slot, children, template, or layout primitive for a local need.</p></li><li><strong>Application-owned block</strong><p>Compose a service summary or journey with the primitives and own its application logic.</p></li><li><strong>New primitive</strong><p>Add a shared component only when its behavior and accessible contract are reusable.</p></li></ol>
      <h2>Scaffold an application block</h2>${code('pnpm new:component request-summary')}
      <p>This generates editable HTML, CSS, and guidance under <code>blocks/</code>. It does not generate framework library internals. Read the output, connect application data, and retain semantic HTML.</p>
      <h2>A contract that survives customization</h2>${list(['Keep public CSS classes prefixed nq- and custom properties prefixed --nq-.', 'Use logical CSS properties and test Arabic/English, RTL/LTR, light/dark, and comfortable/compact combinations.', 'Keep state transitions and pure helpers in core; framework adapters own rendering and lifecycle.', 'Do not replace native behavior with a visual approximation unless the new behavior is explicitly specified and tested.', 'Document values, events, slots, variants, keyboard rules, disabled/read-only states, reset behavior, and cleanup.', 'Update components.json, examples, package exports, documentation, and tests that protect real behavior.'])}
      <h2>Working with a coding assistant</h2>${code('Read AGENTS.md, CONTRACT.md, EXPANSION.md, and components.json.\nUse actual exports and examples.\nExtend documented tokens or composition first.\nPreserve names, roles, keyboard behavior, focus, RTL, and cleanup.\nDescribe the change and run the checks appropriate to its behavior.')}
      <p>Use ${source('docs/extension.md','the extension guide')}, ${source('CONTRACT.md','the shared implementation contract')}, and ${source('llms.txt','the concise AI reference')}. The project is licensed under ${source('LICENSE','Apache 2.0')}; third-party notices remain applicable.</p>`;
    case 'alignment': return `
      <p class="guide-lead">A DGA-based default foundation with traceable source references, independent implementation, and explicit room for extension.</p>
      <h2>Which reference does Nasaq use?</h2><p>The default <code>dga</code> theme maps local foundations from supplied <strong>DGA Platforms Code · كود المنصات</strong> Community Figma exports dated <strong>2026-10-29</strong>. This is the export date, not an official release number or proof that the files are the latest guidance. Nasaq retains its Arabic wordmark and component API.</p>
      <p>Seventeen files were decoded, with detailed inspection focused on Foundations, Service Page, and Form. Six files exceeded the 32 MiB transfer limit: Icons, Saudi Founding Day, Home Page, Hajj, Mobile Components, and Search Page. No standalone web Components Library was supplied. The 77-entry Nasaq catalog does not establish full official component parity.</p>
      <h2>Source values in both modes</h2><p>Foundations contains 784 resolved local variables. Semantic roles keep their own light and dark values; dark mode is not an inverted light palette. Examples include:</p>
      ${list(['Background/background-body, node 122:19: #F9FAFB light and #111927 dark.', 'Text/text-default, node 53:392: #161616 light and #FFFFFF dark.', 'Form/field-background-default, node 113:7: #FFFFFF light and #1F2A37 dark.', 'Primary primitive 50:65: #1B8354. Text/text-primary 50:204 uses #54C08A in dark mode; these roles are not interchangeable.'])}
      <p>The ${source('packages/tokens/reference/dga-foundations.json','public foundation reference')} and token source record the mapped nodes and adaptations. For example, shared subtle text uses a stronger neutral in light mode because it also appears on muted surfaces; field placeholders retain their own semantic value. The source resting field-border token remains <code>#9DA4AE</code> in light mode, while rendered inputs use the stronger control-border value <code>#6C737F</code> and retain visible focus outlines. Source correspondence and accessibility evaluation are separate records.</p>
      <h2>Use the template instructions</h2>${list(['Service frames 1:21371 / 1:22148 and mobile 27:4851 define the reviewed service references. Form frames 2:17277 and mobile 7:3658 define the reviewed form references.', 'Preserve the referenced header/footer structure, colors, and fonts when applying their detachment instructions. The secondary navigation is optional.', 'Supply concise service descriptions, numbered steps, and metadata for audience, duration, channels, cost, contact, and FAQ access.', 'Keep required-field guidance and numbered progress clear. The Form template describes a radial stepper on small screens; provide a text equivalent.', 'The reference widths 1440 and 430 px are frame examples, not official CSS breakpoints. Reflow at narrower and intermediate sizes.', 'Missing prototype destinations or timing do not establish an official transition. Preserve keyboard and reduced-motion behavior for implemented motion.'])}
      <h2>Move an existing application to the default</h2><p>Set <code>data-nq-theme="dga"</code> explicitly, or use the default on an unthemed root. To keep the original palette and font/radius/spacing/content metrics, set <code>data-nq-theme="nasaq"</code>. Control heights are shared across both themes: comfortable uses 40 px by default, 32 px small, and 40 px large; compact uses 32 px by default, 24 px small, and 40 px large, at a 16 px root size. Selecting Nasaq does not preserve every legacy visual detail. Existing saved theme choices may retain a different appearance in the guide. Review custom overrides, spacing, focus, validation, and both text directions after a visual migration; component value/event contracts and calendar ISO values remain unchanged.</p>
      <h2>DGA compliance is evaluated per product</h2><p>Neither the theme nor this source record is an endorsement, certification, or guarantee of complete conformity. Product content, authorized official identifiers, privacy, accessibility, journeys, and service-specific obligations need their own evaluation. Keep raw Figma files and bulk exported assets out of published packages; asset permissions are separate from Nasaq's Apache 2.0 source license.</p>
      <p>Read ${source('docs/dga-reference.md','the complete source snapshot and migration record')}, ${source('docs/alignment.md','the requirement and alignment record')}, and ${source('docs/validation.md','the checks actually run')}.</p>`;
    default: return `<p>This guide page could not be found. <a href="#docs/getting-started">Start with the setup guide</a>.</p>`;
  }
}

const categoryNames: Record<string, string> = { Actions: 'الإجراءات', Forms: 'النماذج', Navigation: 'التنقّل', Feedback: 'التغذية الراجعة', Content: 'المحتوى', Platforms: 'المنصات', Layout: 'التخطيط' };
const topicDescriptions: Record<string, readonly [string,string]> = {
  'getting-started': ['From a fresh checkout to your first thoughtful interface. Choose your framework and make something yours.', 'من أول تشغيل إلى أول واجهة مدروسة. اختر إطار عملك، ثم ابنِ تجربة تحمل طابعك.'],
  vanilla: ['Meaningful HTML. A little JavaScript. A foundation you can see and shape.', 'HTML واضح، وجافاسكريبت بقدر الحاجة. أساس تراه وتفهمه وتشكّله بطريقتك.'],
  react: ['Your React state, familiar composition, one shared visual language.', 'حالة React التي تعرفها، وتركيب مرن، ولغة بصرية واحدة.'],
  vue: ['Reactive models and expressive templates, with the details already connected.', 'حالة تفاعلية وقوالب معبّرة، وتفاصيل تعمل معًا.'],
  angular: ['Standalone components that fit naturally into your Angular forms and application.', 'مكوّنات مستقلة تنسجم مع نماذج Angular وتطبيقك.'],
  theming: ['Keep the system coherent. Give your product its own character.', 'حافظ على اتساق النظام، وامنح منتجك شخصيته الخاصة.'],
  layouts: ['Start with content. Let a few clear primitives organize the space around it.', 'ابدأ بالمحتوى، ودع أدوات واضحة تنظّم المساحة من حوله.'],
  lifecycle: ['Understand what happens before, during, and after every interaction.', 'افهم ما يحدث قبل كل تفاعل، وأثناءه، وبعده.'],
  calendars: ['One selected day. Two calendars. Clear, reproducible date behavior.', 'يوم واحد مختار، وتقويمان للعرض، وسلوك واضح يمكن التحقّق منه.'],
  accessibility: ['Small decisions that let more people use the complete experience.', 'قرارات صغيرة تمنح مزيدًا من الناس تجربة متكاملة.'],
  extending: ['Make the change you need, with a contract that keeps everything connected.', 'أضف ما تحتاجه، مع عقد واضح يحافظ على ترابط النظام.'],
  alignment: ['Saudi service conventions, independent design, and evidence you can inspect.', 'أنماط الخدمات السعودية، وتصميم مستقل، وأدلة يمكنك مراجعتها.'],
};
const formatIndex = (value: number, locale: Locale) => new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en', { minimumIntegerDigits: 2 }).format(value);

export function renderGuide(view: string, locale: Locale, code: Code): string {
  const topic = view.split('/')[1] || 'getting-started';
  const index = guideTopics.findIndex(item => item[0] === topic);
  const selected = guideTopics[index];
  const ar = locale === 'ar';
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const title = selected?.[ar ? 2 : 1] || t('Guide not found', 'لم نعثر على هذا الدليل');
  const previous = guideTopics[index - 1], next = guideTopics[index + 1];
  return `<section class="guide-topic-header" lang="${locale}" dir="${ar ? 'rtl' : 'ltr'}">
    <div class="guide-topic-copy"><div class="guide-kicker"><span class="guide-chip">${icon('book',15)}${t('THE PRACTICAL GUIDE','الدليل العملي')}</span><span>${formatIndex(index + 1,locale)} <span aria-hidden="true">/</span> ${formatIndex(guideTopics.length,locale)}</span></div><h1>${e(title)}</h1><p>${e(topicDescriptions[topic]?.[ar?1:0] || '')}</p><div class="guide-header-links"><a href="#components">${t('Explore live components','استكشف المكوّنات مباشرة')}${icon('arrow',16)}</a><a href="https://github.com/MohamedEmbarak/nasaq" target="_blank" rel="noopener">GitHub ${icon('code',16)}</a></div></div>
    <div class="guide-topic-symbol" aria-hidden="true"><span>${formatIndex(index + 1,locale)}</span><i></i><b>${t('Learn. Build. Make it yours.','تعلّم. ابنِ. امنحه طابعك.')}</b></div>
  </section>
  <div class="guide-layout"><article class="guide-article" lang="${locale}" dir="${ar?'rtl':'ltr'}">${ar ? arabicArticle(topic,code) : article(topic,code)}
    <footer class="guide-pagination">${previous ? `<a href="#docs/${previous[0]}"><small>${t('Previous chapter','الفصل السابق')}</small><strong>${e(previous[ar?2:1])}</strong></a>` : `<a href="#overview"><small>${t('A clear foundation','أساس واضح')}</small><strong>${t('Meet Nasaq','تعرّف على نسق')}</strong></a>`}${next ? `<a href="#docs/${next[0]}"><small>${t('Continue learning','واصل التعلّم')}</small><strong>${e(next[ar?2:1])}${icon('arrow',18)}</strong></a>` : `<a href="#components"><small>${t('Put it into practice','حوّل المعرفة إلى تجربة')}</small><strong>${t('Explore components','استكشف المكوّنات')}${icon('arrow',18)}</strong></a>`}</footer>
    <div class="guide-article-footer"><span>Apache 2.0</span><span>${t('Independent Nasaq implementation','تنفيذ مستقل من نسق')}</span></div>
  </article><aside class="guide-outline"><p class="guide-outline-title">${t('IN THIS GUIDE','في هذا الدليل')}</p><nav data-guide-toc aria-label="${t('On this page','أقسام هذه الصفحة')}"></nav><a class="guide-outline-help" href="#docs/extending">${icon('spark',18)}<span>${t('Have a different idea?','لديك فكرة مختلفة؟')}<strong>${t('Make it yours','خصّصه بطريقتك')}${icon('arrow',15)}</strong></span></a></aside></div>`;
}

function demoControls(id: string, locale: Locale): string {
  const t = (en:string,ar:string) => locale==='ar'?ar:en;
  if (['button','icon-button','button-group'].includes(id)) return `<label class="guide-control"><span>${t('Variant','النمط')}</span><select data-guide-variant data-guide-selector=".nq-button" data-guide-attribute="data-variant">${[['primary','Primary','أساسي'],['secondary','Secondary','ثانوي'],['ghost','Ghost','خفيف'],['danger','Danger','خطر'],['soft','Soft','هادئ'],['outline','Outline','حدود'],['link','Link','رابط']].map(([value,en,ar])=>`<option value="${value}">${t(en!,ar!)}</option>`).join('')}</select></label><label class="guide-control"><span>${t('Size','الحجم')}</span><select data-guide-size><option value="md">${t('Medium','متوسط')}</option><option value="sm">${t('Small','صغير')}</option><option value="lg">${t('Large','كبير')}</option></select></label>`;
  if (['badge','alert','chip'].includes(id)) return `<label class="guide-control"><span>${t('Tone','الدلالة')}</span><select data-guide-variant data-guide-selector=".nq-${id}" data-guide-attribute="data-tone">${[['neutral','Neutral','محايد'],['info','Information','معلومات'],['success','Success','نجاح'],['warning','Warning','تحذير'],['danger','Danger','خطر']].filter(([value])=>id!=='alert'||value!=='neutral').map(([value,en,ar])=>`<option value="${value}">${t(en!,ar!)}</option>`).join('')}</select></label>`;
  return '';
}

export function renderComponentGuide(id: string, locale: Locale, preview: (id: ComponentId) => string, code: Code): string {
  const item = catalog.find(component => component[0] === id);
  const dictionary = locale === 'ar' ? arabicComponentGuides : componentGuides;
  const guide = dictionary[id];
  const ar = locale === 'ar';
  const t = (en:string,arabic:string) => ar?arabic:en;
  if (!item || !guide) return `<section class="guide-article"><h1>${t('Component not found','لم نعثر على هذا المكوّن')}</h1><p><a href="#components">${t('Return to the component catalog','العودة إلى فهرس المكوّنات')}</a>.</p></section>`;
  const index = catalog.findIndex(component => component[0] === id);
  const previous = catalog[index-1], next = catalog[index+1];
  const title = item[ar?2:1];
  const toc = [['usage',t('Usage','الاستخدام')],['api',t('API & markup','واجهة البرمجة')],['lifecycle',t('Lifecycle','دورة الحياة')],['accessibility',t('Accessibility','الإتاحة')],['frameworks',t('Frameworks','أطر العمل')]];
  return `<div class="component-guide-header" lang="${locale}" dir="${ar?'rtl':'ltr'}"><a class="guide-back" href="#components">${icon('arrow-back',16)}${t('All components','كل المكوّنات')}</a>
    <div class="guide-kicker"><span class="guide-chip">${icon('layers',15)}${e(ar?categoryNames[item[3]]||item[3]:item[3])}</span><code dir="ltr">${item[0]}</code><span class="guide-live-badge"><i></i>${t('LIVE EXAMPLE','مثال تفاعلي')}</span></div>
    <div class="guide-title-row"><div><h1>${e(title)}</h1><p class="guide-lead">${e(guide.summary)}</p></div><div class="guide-title-actions"><button type="button" data-guide-launch-editor>${icon('spark',16)}${t('Edit live','عدّل مباشرة')}</button>${guide.source?source(guide.source,t('View source','تصفّح المصدر')):''}<button type="button" data-guide-section="component-api">${t('API reference','مرجع البرمجة')}${icon('arrow',16)}</button></div></div>
    <div class="guide-compatibility"><span>${t('One foundation. Your framework.','أساس واحد. وإطار العمل الذي تختاره.')}</span><div>${['Vanilla','React','Vue','Angular'].map(name=>`<a href="#docs/${name.toLowerCase()}" dir="ltr">${name}</a>`).join('')}</div></div>
  </div>
  <div class="component-guide-layout"><article class="guide-article component-guide" lang="${locale}" dir="${ar?'rtl':'ltr'}">
    <section class="guide-demo" data-guide-demo data-guide-key="${item[0]}:${locale}" data-guide-usage="${e(guide.usage)}" data-guide-initial-dir="${ar?'rtl':'ltr'}" data-guide-locale="${locale}" data-guide-title="${e(title)}" aria-label="${t('Interactive component example','مثال تفاعلي للمكوّن')}">
      <div class="guide-demo-top"><div class="guide-demo-tabs" role="tablist" aria-label="${t('Example view','عرض المثال')}"><button type="button" role="tab" id="guide-preview-tab" aria-controls="guide-preview-panel" aria-selected="true" tabindex="0" data-guide-tab="preview">${icon('grid',17)}${t('Preview','المعاينة')}</button><button type="button" role="tab" id="guide-code-tab" aria-controls="guide-code-panel" aria-selected="false" tabindex="-1" data-guide-tab="code">${icon('code',17)}${t('Code','الشفرة')}</button><button type="button" role="tab" id="guide-playground-tab" aria-controls="guide-playground-panel" aria-selected="false" tabindex="-1" data-guide-tab="playground">${icon('spark',17)}${t('Playground','محرّر مباشر')}</button></div><button type="button" class="guide-copy-button" data-guide-copy data-copy="${e(guide.usage)}" aria-label="${t('Copy example markup','نسخ شفرة المثال')}">${icon('copy',16)}<span>${t('Copy','نسخ')}</span></button></div>
      <div role="tabpanel" id="guide-preview-panel" aria-labelledby="guide-preview-tab" data-guide-panel="preview">
        <div class="component-preview guide-preview" data-guide-canvas tabindex="0" role="region" aria-label="${t('Component preview canvas','مساحة معاينة المكوّن')}" data-surface="grid" dir="${ar?'rtl':'ltr'}">${preview(item[0])}</div>
        <div class="guide-demo-controls">${demoControls(id,locale)}<div class="guide-direction-control" role="group" aria-label="${t('Preview direction','اتجاه المعاينة')}"><span>${t('Direction','الاتجاه')}</span><div dir="ltr"><button type="button" data-guide-direction="rtl" aria-pressed="${ar}">RTL</button><button type="button" data-guide-direction="ltr" aria-pressed="${!ar}">LTR</button></div></div><label class="guide-control"><span>${t('Surface','الخلفية')}</span><select data-guide-surface><option value="grid">${t('Grid','شبكة')}</option><option value="plain">${t('Plain','صافية')}</option><option value="soft">${t('Soft','هادئة')}</option></select></label><button class="guide-reset" type="button" id="reset-component-demo" data-action="reset-component-demo">${t('Reset','إعادة الضبط')}</button></div>
      </div>
      <div role="tabpanel" id="guide-code-panel" aria-labelledby="guide-code-tab" data-guide-panel="code" hidden><section id="component-usage"><div class="guide-code-intro"><h2 data-guide-ignore>${t('Use this recipe','استخدم هذا المثال')}</h2><span dir="ltr">HTML</span></div><p>${t('Load the shared stylesheet. Interactive data-nq hooks use the vanilla enhancer.','حمّل ملف الأنماط المشترك. تستخدم الخطافات التفاعلية data-nq أداة التحسين لجافاسكريبت.')} <a href="#docs/vanilla">${t('Setup guide','دليل الإعداد')}${icon('arrow',14)}</a></p>${code(guide.usage)}</section></div>
      <div role="tabpanel" id="guide-playground-panel" aria-labelledby="guide-playground-tab" data-guide-panel="playground" hidden><div data-guide-ide></div></div>
      <div class="guide-demo-footnote"><span>${icon('code',14)}${t('Real components. Real interaction.','مكوّنات حقيقية، وتفاعل فعلي.')}</span><span>${t('Try Tab, arrows & Escape','جرّب Tab والأسهم وEscape')}</span></div>
    </section>
    ${guide.variants?.length ? `<section id="component-variants" class="guide-content-section"><div class="guide-section-heading"><span>${icon('palette',19)}</span><h2>${t('Variants & composition','أنماط تناسب تجربتك')}</h2></div><div class="guide-variant-list">${guide.variants.map(variant=>`<span>${e(variant)}</span>`).join('')}</div></section>`:''}
    <section id="component-api" class="guide-content-section"><div class="guide-section-heading"><span>${icon('code',19)}</span><h2>${t('API & markup contract','واجهة البرمجة وعقد البنية')}</h2></div><p class="guide-section-intro">${t('The small details that connect appearance, state, and behavior.','التفاصيل التي تربط المظهر والحالة والسلوك.')}</p><div class="guide-table-wrap" tabindex="0" role="region" aria-label="${t('Scrollable API reference','جدول مرجع البرمجة القابل للتمرير')}"><table class="nq-table"><thead><tr><th scope="col">${t('Name','الاسم')}</th><th scope="col">${t('Type / values','النوع والقيم')}</th><th scope="col">${t('Purpose','الاستخدام')}</th></tr></thead><tbody>${guide.api.map(property=>`<tr><td><code dir="ltr">${e(property.name)}</code></td><td><code dir="auto">${e(property.type)}</code></td><td>${e(property.description)}</td></tr>`).join('')}</tbody></table></div></section>
    <section id="component-lifecycle" class="guide-content-section"><div class="guide-section-heading"><span>${icon('clock',19)}</span><h2>${t('From mount to cleanup','من الإنشاء إلى التنظيف')}</h2></div><p class="guide-section-intro">${t('Follow the component through its lifecycle and interaction states.','تتبّع دورة حياة المكوّن وحالات التفاعل خطوة بخطوة.')}</p><ol class="guide-lifecycle">${guide.lifecycle.map(step=>`<li><p>${e(step)}</p></li>`).join('')}</ol></section>
    <section id="component-accessibility" class="guide-content-section"><div class="guide-section-heading"><span>${icon('globe',19)}</span><h2>${t('An experience more people can use','تجربة يستطيع مزيد من الناس استخدامها')}</h2></div><p class="guide-section-intro">${t('Keep these relationships intact when you customize.','حافظ على هذه العلاقات عند تخصيص المكوّن.')}</p><ul class="guide-checklist">${guide.accessibility.map(item=>`<li>${icon('check',17)}<span>${e(item)}</span></li>`).join('')}</ul></section>
    <section id="component-frameworks" class="guide-content-section"><div class="guide-section-heading"><span>${icon('layers',19)}</span><h2>${t('At home in your framework','ينسجم مع إطار عملك')}</h2></div>${guide.frameworkNotes?`<p>${e(guide.frameworkNotes)}</p>`:`<p>${t('Use the native adapter so your framework owns rendering, state, and cleanup.','استخدم المكوّن الأصلي ليبقى العرض والحالة والتنظيف ضمن إطار عملك.')}</p>`}<div class="guide-framework-links">${['react','vue','angular'].map(f=>`<div><a href="#docs/${f}"><strong dir="ltr">${f[0]!.toUpperCase()+f.slice(1)}</strong><span>${t('Setup guide','دليل الإعداد')}${icon('arrow',15)}</span></a>${source(`packages/${f}/README.md`,t('API reference','مرجع البرمجة'))}</div>`).join('')}</div><p class="guide-small-note">${t('Each adapter follows its framework conventions. Markup attributes are not necessarily identical to component props.','يتبع كل مكيّف اصطلاحات إطار عمله. قد تختلف أسماء خصائص المكوّن عن سمات HTML.')}</p></section>
    ${guide.limitations?.length?`<section id="component-boundaries" class="guide-content-section guide-boundaries"><h2>${t('Know the boundaries','تعرّف على حدود المكوّن')}</h2>${list(guide.limitations)}</section>`:''}
    ${guide.related?.length?`<section class="guide-content-section"><div class="guide-section-heading"><span>${icon('grid',19)}</span><h2>${t('Build the next piece','أكمل تجربتك')}</h2></div><div class="guide-related">${guide.related.map(related=>{const c=catalog.find(c=>c[0]===related);const other=dictionary[related];return c?`<a href="#component/${c[0]}"><span class="guide-related-category">${e(ar?categoryNames[c[3]]||c[3]:c[3])}</span><strong>${e(c[ar?2:1])}${icon('arrow',18)}</strong>${other?`<p>${e(other.summary)}</p>`:''}</a>`:'';}).join('')}</div></section>`:''}
    <footer class="guide-pagination">${previous?`<a href="#component/${previous[0]}"><small>${t('Previous component','المكوّن السابق')}</small><strong>${e(previous[ar?2:1])}</strong></a>`:'<span></span>'}${next?`<a href="#component/${next[0]}"><small>${t('Explore next','اكتشف التالي')}</small><strong>${e(next[ar?2:1])}${icon('arrow',18)}</strong></a>`:''}</footer>
  </article><aside class="guide-outline"><p class="guide-outline-title">${t('ON THIS PAGE','في هذه الصفحة')}</p><nav aria-label="${t('On this page','أقسام هذه الصفحة')}">${toc.map(([key,label])=>`<button type="button" data-guide-section="component-${key}">${label}</button>`).join('')}</nav><a class="guide-outline-help" href="#docs/extending">${icon('spark',18)}<span>${t('Keep the foundation.','احتفظ بالأساس.')}<strong>${t('Make it yours.','وامنحه طابعك.')}${icon('arrow',15)}</strong></span></a></aside></div>`;
}

type GuideSession = {
  key: string;
  tab: string;
  draft?: IDEFiles;
  direction?: 'ltr' | 'rtl';
  surface?: string;
  variant?: string;
  size?: string;
};
// One current route only: preserve work through shell redraws, not across visits.
let guideSession: GuideSession | undefined;

/** Owns only guide controls; component examples keep their normal vanilla lifecycle. */
export function bindGuide(root: HTMLElement): () => void {
  const demo = root.querySelector<HTMLElement>('[data-guide-demo]');
  const canvas = demo?.querySelector<HTMLElement>('[data-guide-canvas]');
  const key = demo?.dataset.guideKey;
  if (!key) guideSession = undefined;
  else if (guideSession?.key !== key) guideSession = { key, tab: 'preview' };
  const session = guideSession;
  if (demo && canvas) {
    const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
    canvas.dir = session?.direction || direction;
    demo.dataset.guideInitialDir = direction;
    demo.querySelectorAll<HTMLElement>('[data-guide-direction]').forEach(control=>control.setAttribute('aria-pressed',String(control.dataset.guideDirection===canvas.dir)));
  }
  const toc = root.querySelector<HTMLElement>('[data-guide-toc]');
  if (toc) {
    const headings = [...root.querySelectorAll<HTMLHeadingElement>('.guide-article h2:not([data-guide-ignore])')];
    toc.innerHTML = headings.map((heading,index) => {
      heading.id ||= `guide-section-${index + 1}`;
      return `<button type="button" data-guide-section="${e(heading.id)}">${e(heading.textContent || '')}</button>`;
    }).join('');
  }
  const tabs = [...(demo?.querySelectorAll<HTMLButtonElement>('[data-guide-tab]') || [])];
  let editorDispose: (() => void) | undefined;
  let editorLoading = false;
  let disposed = false;
  const loadEditor = async () => {
    const host = demo?.querySelector<HTMLElement>('[data-guide-ide]');
    if (!host || editorDispose || editorLoading || disposed) return;
    editorLoading = true;
    const ar = demo?.dataset.guideLocale === 'ar';
    host.innerHTML = `<p class="guide-editor-loading" role="status">${ar ? 'جارٍ تجهيز المحرّر…' : 'Preparing your playground…'}</p>`;
    try {
      const { mountComponentIDE } = await import('./component-ide');
      if (disposed) return;
      editorDispose = mountComponentIDE(host, {
        html: demo?.querySelector('#guide-code-panel pre code')?.textContent || demo?.dataset.guideUsage || '',
        locale: ar ? 'ar' : 'en',
        title: demo?.dataset.guideTitle || '',
        draft: session?.draft,
        onDraftChange: draft => {
          if (session && guideSession === session) session.draft = draft;
        },
      });
    } catch {
      if (!disposed) host.innerHTML = `<div class="guide-editor-loading" role="alert"><p>${ar ? 'تعذّر تحميل المحرّر. تحقّق من اتصالك ثم حاول مجددًا.' : 'The editor could not load. Check your connection and try again.'}</p><button type="button" class="nq-button" data-variant="secondary" data-guide-retry>${ar ? 'إعادة المحاولة' : 'Try again'}</button></div>`;
    } finally { editorLoading = false; }
  };
  const activateTab = (value: string, focus = false) => {
    if (session) session.tab = value;
    for (const tab of tabs) {
      const selected = tab.dataset.guideTab === value;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    demo?.querySelectorAll<HTMLElement>('[data-guide-panel]').forEach(panel => panel.hidden = panel.dataset.guidePanel !== value);
    if (value === 'playground') void loadEditor();
  };
  const updateCode = () => {
    if (!demo || !canvas) return;
    const template = document.createElement('template');
    template.innerHTML = demo.dataset.guideUsage || '';
    const variant = demo.querySelector<HTMLSelectElement>('[data-guide-variant]');
    const size = demo.querySelector<HTMLSelectElement>('[data-guide-size]');
    if (variant) template.content.querySelector(variant.dataset.guideSelector!)?.setAttribute(variant.dataset.guideAttribute!, variant.value);
    if (size) template.content.querySelector('.nq-button')?.setAttribute('data-size', size.value);
    let markup = (variant || size) ? template.innerHTML : demo.dataset.guideUsage || '';
    if (canvas.dir !== demo.dataset.guideInitialDir) markup = `<div dir="${canvas.dir}">\n${markup}\n</div>`;
    const code = demo.querySelector<HTMLElement>('#guide-code-panel pre code');
    if (code) code.textContent = markup;
    demo.querySelectorAll<HTMLElement>('[data-copy]').forEach(button=>button.dataset.copy=markup);
  };
  const variant = demo?.querySelector<HTMLSelectElement>('[data-guide-variant]');
  if (variant && canvas) {
    const initial = canvas.querySelector(variant.dataset.guideSelector!)?.getAttribute(variant.dataset.guideAttribute!) || 'primary';
    const value = session?.variant || initial;
    if ([...variant.options].some(option=>option.value===value)) variant.value=value;
    if (session?.variant) canvas.querySelector(variant.dataset.guideSelector!)?.setAttribute(variant.dataset.guideAttribute!,variant.value);
  }
  const size = demo?.querySelector<HTMLSelectElement>('[data-guide-size]');
  if (size && canvas && session?.size) {
    size.value=session.size;
    canvas.querySelector('.nq-button')?.setAttribute('data-size',size.value);
  }
  const surface = demo?.querySelector<HTMLSelectElement>('[data-guide-surface]');
  if (surface && canvas && session?.surface) {
    surface.value=session.surface;
    canvas.dataset.surface=surface.value;
  }
  if (session?.variant || session?.size || session?.direction) updateCode();
  const onReset = (event: Event) => {
    if ((event.target as Element).closest('[data-action="reset-component-demo"]')) guideSession=undefined;
  };
  const onClick = (event: Event) => {
    const button = (event.target as Element).closest<HTMLElement>('button');
    if (!button || !root.contains(button)) return;
    if (button.dataset.guideTab) activateTab(button.dataset.guideTab);
    if (button.hasAttribute('data-guide-retry')) void loadEditor();
    if (button.hasAttribute('data-guide-launch-editor')) {
      activateTab('playground', true);
      demo?.scrollIntoView({ behavior:'instant', block:'start' });
    }
    if (button.dataset.guideDirection && canvas) {
      canvas.dir = button.dataset.guideDirection;
      if (session) session.direction=canvas.dir === 'rtl' ? 'rtl' : 'ltr';
      demo?.querySelectorAll<HTMLElement>('[data-guide-direction]').forEach(control=>control.setAttribute('aria-pressed',String(control.dataset.guideDirection===canvas.dir)));
      updateCode();
    }
    if (button.dataset.guideSection) {
      if (button.dataset.guideSection==='component-usage') activateTab('code');
      const target = root.querySelector<HTMLElement>(`#${CSS.escape(button.dataset.guideSection)}`);
      target?.scrollIntoView({ behavior: 'instant', block: 'start' });
      target?.setAttribute('tabindex','-1');
      target?.focus({ preventScroll:true });
    }
  };
  const onChange = (event: Event) => {
    const select=event.target as HTMLSelectElement;
    if (!canvas || !demo) return;
    if (select.matches('[data-guide-surface]')) {canvas.dataset.surface=select.value;if(session)session.surface=select.value;}
    if (select.matches('[data-guide-variant]')) {
      canvas.querySelector(select.dataset.guideSelector!)?.setAttribute(select.dataset.guideAttribute!,select.value);
      if (session) session.variant=select.value;
      updateCode();
    }
    if (select.matches('[data-guide-size]')) {
      canvas.querySelector('.nq-button')?.setAttribute('data-size',select.value);
      if (session) session.size=select.value;
      updateCode();
    }
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const tab=(event.target as Element).closest<HTMLButtonElement>('[data-guide-tab]');
    if (!tab || !tabs.includes(tab) || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const current=tabs.indexOf(tab);
    const rtl=getComputedStyle(tab.parentElement!).direction==='rtl';
    const delta=(event.key==='ArrowRight'?1:-1)*(rtl?-1:1);
    const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+delta+tabs.length)%tabs.length;
    activateTab(tabs[index]!.dataset.guideTab!,true);
  };
  root.addEventListener('click',onReset,true);
  root.addEventListener('click',onClick);
  root.addEventListener('change',onChange);
  root.addEventListener('keydown',onKeyDown);
  const outlineButtons=[...root.querySelectorAll<HTMLButtonElement>('[data-guide-section]')].filter(button=>button.closest('.guide-outline'));
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if (!visible) return;
    for(const button of outlineButtons){
      if(button.dataset.guideSection===visible.target.id)button.setAttribute('aria-current','location');
      else button.removeAttribute('aria-current');
    }
  },{rootMargin:'-125px 0px -55% 0px',threshold:0});
  for(const button of outlineButtons){const target=root.querySelector(`#${CSS.escape(button.dataset.guideSection!)}`);if(target)observer.observe(target);}
  if (session) activateTab(session.tab);
  return()=>{disposed=true;editorDispose?.();root.removeEventListener('click',onReset,true);root.removeEventListener('click',onClick);root.removeEventListener('change',onChange);root.removeEventListener('keydown',onKeyDown);observer.disconnect();};
}
