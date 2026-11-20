# Authoring contract for component pages

This directory holds the Markdown sources of the component pages of the public
guide in `guide/`. Each component has an English page and an Arabic page. The
guide build (step 20, `guide/scripts/content/`) reads both, checks them against
this contract, and stops with a coded finding when a rule is not met. The same
files remain readable on GitHub.

This file is the contract for writers. It is not a component page: its name is
not a component id, and the build does not render it.

Hawiyah is built to comply with the DGA Platforms Code. It is not an official
DGA product and holds no certification. Pages state compliance evidence and
open items; they do not claim conformance.

## Files

- `<id>.md` is the English page and `<id>.ar.md` the Arabic page, where `<id>`
  is a component id in the root `components.json`.
- Both files exist, or neither does. A file whose id is not in
  `components.json`, an English page without its Arabic sibling, or the
  reverse, fails the build (`HWC-FILE`). While its translation is written, an
  English page may stand alone only when
  `guide/scripts/content/pending-translation.json` lists its id: the build gives
  it no route and counts it (`content: <n> pages pending translation`), and an
  entry whose Arabic page exists fails. The list is empty when the milestone ends.
- `npm run check:page -- <id>` (in `guide/`, after one production build) proves
  one page while it is written: its content, the compile of its live groups, its
  API tables and vocabulary, and the equivalence of its groups, with the
  coverage report. The full build stays the gate.
- A page is built when both files pass every check. Pages appear in the guide
  at `<lang>/components/<id>/` (brief) and `<lang>/components/<id>/reference/`.

## Page structure

A page has exactly this outline. The first line of an English page is its h1;
the first line of an Arabic page after its front matter is its h1.

1. The h1: the component name. English uses `name` and Arabic uses `labelAr`
   from `components.json`, character for character (`HWC-H1`).
2. The summary: exactly one paragraph of one or two sentences between the h1
   and the first h2, with no live block (`HWC-SUM`). A sentence ends with `.`,
   `!`, `?` or `؟` followed by a space or the end of the paragraph.
3. The h2 sections below, in this order, each at most once (`HWC-H2`).

Table: The h2 sections of a component page

| English heading | Arabic heading | Section id | Required | Content |
| --- | --- | --- | --- | --- |
| Example | مثال | `example` | Yes | Paragraphs and exactly one live group; no headings, lists, tables or other blocks. |
| Variants and states | الأشكال والحالات | `variants-and-states` | No | Free h3 headings; each h3 contains exactly one live group. |
| API | الواجهة البرمجية | `api` | Yes | The four API h3 headings and their tables. |
| Accessibility | إمكانية الوصول | `accessibility` | Yes | Free text, h3 and h4; the keyboard table of a component with a controller (see [Keyboard table](#keyboard-table)). |
| RTL and localisation | الاتجاه والتوطين | `rtl-and-localisation` | Yes | Free text, h3 and h4. |
| Platforms Code reference | مرجع كود المنصات | `platforms-code-reference` | Yes | The compliance sentence, then free text, h3 and h4 on the sources of the mapping. The evidence panel is generated after it (see [Evidence panel](#evidence-panel)). |

Any other h2 text fails the build, including the right heading in the other
language.

### Headings below h2

- The API section has exactly four h3 headings, in this order and with the same
  text in both languages: `JavaScript`, `React`, `Vue`, `Angular` (`HWC-API`).
  It has no h4.
- In Variants and states, Accessibility, RTL and localisation, and Platforms
  Code reference, h3 and h4 are free text. An h4 stands under an h3. h5 and h6
  are not allowed (`HWC-H5`).
- Headings stand at the top level of the page, never inside a list or a
  quotation.
- English heading ids are the ids GitHub generates. The Arabic page has the same
  heading tree as the English page, and each Arabic heading takes the id of the
  English heading at the same position, so links to a section work in both
  languages.

## API tables

Each API h3 is followed by its caption paragraph, then exactly one table, then
the descriptions as prose. The header rows are fixed (`HWC-API`):

Table: Header rows of the API tables

| h3 | English header | Arabic header |
| --- | --- | --- |
| JavaScript | `\| Option \| Type \| Required \| Default \|` | `\| الخيار \| النوع \| مطلوب \| القيمة الافتراضية \|` |
| React | `\| Prop \| Type \| Required \| Default \|` | `\| الخاصية \| النوع \| مطلوب \| القيمة الافتراضية \|` |
| Vue | `\| Name \| Kind \| Type \| Required \| Default \|` | `\| الاسم \| الفئة \| النوع \| مطلوب \| القيمة الافتراضية \|` |
| Angular | `\| Name \| Kind \| Type \| Required \| Default \|` | `\| الاسم \| الفئة \| النوع \| مطلوب \| القيمة الافتراضية \|` |

- Name and Type cells are inline code, and Default cells inline code or an em
  dash (`—`, without code formatting). A Type cell is an em dash where the
  package declares no type: a Vue slot row, an Angular content row, and a native
  attribute that `exclusions.json` lists.
- Required is `` `true` `` or `` `false` ``.
- Kind is `prop`, `event` or `slot` for Vue, and `input`, `output` or `content`
  for Angular. For Angular content projection the name is the selector.
- The body rows are byte-identical in the English and Arabic tables. Only the
  caption, the header row and the prose after the table are translated.
- Build step 30 compares every row with the installed packages: the names (a
  table that lists a name the package does not declare, or omits one it
  declares, fails the build), the kind, the required flag, the type and the
  default (`HWC-APIX`). Do not write the tables by hand:
  `npm run content:scaffold -- <id>` writes them for a new page and
  `npm run content:api-tables -- <id> --write` rewrites them in both files, from
  the same readers as step 30; the fact sheet (`npm run content:facts -- <id>`)
  lists the same members with the published line each default is read from.
- The Type column has the written form of the type printer
  (`guide/scripts/api-tables/types.mjs`): single quotes; a union of literals that
  the declaration names (`ButtonVariant`) written out, an object, interface or
  function type by its name (`TabItem`, `Responsive<LayoutSpacing>`); no
  `| undefined` on an optional member; `T[]` and `readonly T[]`; a function type
  as `(value: string) => void`; an Angular output as its payload type
  (`EventEmitter<string>` is `string`), a signal input as its value type; a Vue
  event as the signature of its handler, `(...) => void`. Step 30 ignores white
  space, the order of a union and the names of parameters.
- The Default column holds the value the published build applies: the
  destructuring default of the React component, the `default` of the Vue prop
  (`false` for a Boolean prop without one, as Vue casts it), the field
  initialiser of the Angular class. A default that is absent, generated (an id)
  or computed in the component body is an em dash and is described in the prose
  after the table; so is the default of a required member. Vanilla options and
  stylesheet attributes publish no default in 0.3.0: their Default is an em dash
  unless `guide/scripts/api-tables/defaults.json` quotes a line of an installed
  file that sets it.
- A Vue table lists the slots the published `@hawiyah/vue` build reads, as rows
  of kind `slot`, although 0.3.0 types none of them. A slot whose name the build
  computes is written as a pattern, for example `tab:<value>` on the Tabs page;
  each pattern is an entry of `VUE_SLOT_PATTERNS` in
  `guide/scripts/api-tables/targets.mjs`.
- A table that documents several exports lists the members of the first by
  name and the members of each further export with a qualifier: an Angular
  class by its element (`hw-tab value` and `hw-tab *` on the Tabs page), a
  React or Vue component and a vanilla controller by its export name
  (`RatingDisplay value` on the Rating page, `createFileUploadList items` on the
  FileUpload page, after the attributes of `hw-upload`). The further exports of
  a page are named in `TARGET_OVERRIDES` of
  `guide/scripts/api-tables/targets.mjs`. Every component, directive and
  controller factory of the four installed adapters is documented by exactly
  one page, or is an entry of `UNOWNED_EXPORTS` there
  (`guide/scripts/api-tables/test/ownership.test.mjs`).
- A JavaScript table of a component without a controller, such as Button, lists
  the class and the attributes that the stylesheet contract of the
  `@hawiyah/styles` README documents for the component's classes together with
  the attributes that the selectors of the published `dist/styles.css` use on
  them; enumerated selector values give the Type, a presence attribute is
  `boolean`, and the Required column is not compared. Native HTML and ARIA
  attributes the page adds, and documented attributes it leaves out, are entries
  of `guide/scripts/api-tables/exclusions.json`. The 26 components whose classes
  have no row in that contract carry, directly after their JavaScript table, the
  note that `content:api-tables` writes:
  `> [!NOTE]` and `> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.`
  (in Arabic: `> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.`).
- `exclusions.json`, `defaults.json`, `vocabulary-exceptions.json`,
  `TARGET_OVERRIDES`, `VUE_SLOT_PATTERNS` and `UNOWNED_EXPORTS` of `targets.mjs`, `guide/scripts/content/arabic-exceptions.json` and
  `guide/scripts/page-guards/latin-allowlist.json` are the lead's lists: each
  entry carries `approvedBy` and a reason, one page has at most five entries
  over all of them, and a writer proposes an entry in the result of the run
  instead of adding it.

Example:

~~~markdown
### React

Table: Props of Button

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary'` | `false` | `'primary'` |
| `loading` | `boolean` | `false` | — |

The variant sets the visual family. Loading disables the button and sets
aria-busy.
~~~

## Vocabulary

Build step 30 also checks the names a page writes in code formatting outside
the API tables, in prose, lists, headings, alerts and other tables, and the
classes, `data-hw` hooks and `data-*` attributes of its `html` live blocks
(`HWC-VOCAB`, `guide/scripts/api-tables/vocabulary.mjs`). It is not a spelling
or style check. Each name must exist in the installed packages:

- `hw-*` is a class of the published stylesheet or an element of
  `@hawiyah/angular`; `data-hw="<hook>"` names a hook that `enhance()` of
  `@hawiyah/vanilla` registers; `hw:change` and other `hw:` names are events a
  published module dispatches.
- `data-*` and `aria-*` occur in the stylesheet or in a published module, or are
  attributes of `guide/scripts/api-tables/vocabulary-allow.json`.
- A name that starts with `Hw`, `create` or an upper-case letter is an export of
  an installed `@hawiyah` package; `@hawiyah/...` is a package or an export path;
  `components.json` and other file names exist at the repository root.
- Any other name is a member of the component in some adapter (props, options,
  inputs, outputs, events, slots, the fields of their types, the parameters and
  returned members of its controllers, the members its Vue component exposes,
  the selectors of its Angular classes), a member of a component page that the
  same sentence links to, an export, a value of the component, or a name that
  HTML, ARIA, the DOM, CSS or the Vue and Angular template syntax define
  (`vocabulary-allow.json`, each group with its specification).
- A quoted literal, and the value of an attribute (`aria-busy="true"`,
  `[role="tab"]`), is a value of a member type or of an enumerated attribute of
  the component. The expression of a binding (`[loading]="saving"`) is
  application code and is not judged.

Framework scope: a paragraph under a framework heading (JavaScript, React,
Vue, Angular), or whose text names a framework, is scoped to those frameworks;
a member or an export it names must belong to one of them. A name that belongs
only to another framework is a case the check cannot decide: it fails unless
`guide/scripts/api-tables/vocabulary-exceptions.json` lists it. That file is
one of the lead's lists: an entry `{ file, text, reason, approvedBy }` names the
whole code value, an entry that matches nothing fails the step, and writers
propose entries instead of adding them.

Coverage: `npm run content:coverage -- <id>` (and `check:page`) report the
enumerated values and boolean members of the API that no live group shows and
that Variants and states does not name. The report is not a gate.

## Live examples

A live group shows one example in the four frameworks. The guide renders the
Angular result in the page and offers the four sources, each compiled against
the published packages during the build.

### Syntax

Each block of a group is a fenced code block whose info string is:

~~~text
<lang> live example=<name> [framework=<framework>] [check=<check>[,<check>...] | static] [differences=<id>] [frame [width=390]]
~~~

- `lang` is `html`, `tsx`, `jsx`, `vue` or `ts`. The framework follows from it:
  `html` is vanilla, `tsx` and `jsx` are React, `vue` is Vue. A `ts` block
  states `framework=angular`.
- `name` matches `^[a-z][a-z0-9-]{0,39}$` and is unique in the file
  (`HWC-LIVE3`).
- `check` names one interaction check or several, separated by commas; `static`
  declares that the group is compared at rest only; `differences` names an
  approved known difference. They stand only on the `html` block, the first of
  the group, and a group is either `static` or names checks. Every group of a
  component with a controller (`sourceType` `interactive` in `components.json`)
  names the checks that exercise what its text says, or is `static`
  (`HWE-CHECK`).
- A known difference is an entry of
  `guide/scripts/equivalence/known-differences.json` with the fields `id`,
  `component`, `aspect` (`structure`, `aria` or `screenshot`), `description`,
  `source` (`CHANGELOG.md, <version>, <section>: <text of the entry>`, checked
  against `CHANGELOG.md`) and
  `approvedBy` (`lead`). An entry without `ignore` leaves its aspect out of the
  equivalence check of the groups that name it. An entry of aspect `structure`
  may instead carry `ignore: [{ "class": "hw-...", "attribute": "..." }]`: only
  that attribute on elements with that class is left out of the comparison
  with the JavaScript result, and every other structural difference still
  fails with `HWE-STRUCT`; the other three results are compared with each
  other in full, and the check fails once the JavaScript result writes the
  attribute. The Tabs groups name
  `tabs-bar-orientation`, which ignores `data-orientation` on `.hw-tab-bar`
  (CHANGELOG.md, Known defects in 0.3.0); the entry is removed when the guide
  pins a release that corrects it.
- `frame` renders the Angular result of the group in the sandboxed frame, like
  the other three, instead of in the guide page. Use it only on a page-level
  component that renders a `main` landmark, a skip link or an `h1` of its own
  (AppShell, PortalLayout, PortalHeader, PortalFooter, PageHeader, MobileTopBar:
  `FRAMED_COMPONENTS` of `guide/scripts/content/config.mjs`) and, from stage 5e,
  on a template; anywhere else it fails (`HWC-LIVE1`). `width=390` (only with
  `frame`) compares the screenshots of the group a second time with frames 390 px
  wide; a framed group is first compared at 1280 px. Without script a framed group
  shows its Angular listing and one sentence instead of a result. `frame` and
  `width` stand only on the `html` block.
- Any other key or value fails the build (`HWC-LIVE1`). GitHub highlights the
  block by its first word and ignores the rest.

A group is four consecutive live blocks with the same name, in the order
vanilla (`html`), React (`tsx` or `jsx`), Vue (`vue`), Angular
(`ts framework=angular`), separated only by blank lines. A missing, repeated,
reordered or separated block fails the build (`HWC-LIVE2`), as does a live
block inside a list or quotation, or a group outside the Example section and the
h3 headings of Variants and states.

A page has at most 8 live groups (`HWC-LIVE2`): the equivalence step takes longer
with every group. An example does not depend on today's date, the time zone,
random values or a request: a live block that calls `Date.now()`, `new Date()`
without a value, `Math.random()`, `crypto.getRandomValues()` or
`crypto.randomUUID()`, `fetch()` or `XMLHttpRequest`, or reads the time zone from
`resolvedOptions()`, fails (`HWC-LIVE2`), so that its screenshots can be compared.

### Forms

Each block is written in fragment form or in module form.

Table: Fragment and module forms of live blocks

| Framework | Fragment form | Module form |
| --- | --- | --- |
| Vanilla (`html`) | An HTML fragment, inserted into `#app` and enhanced with `enhance()` from `@hawiyah/vanilla`. | None. |
| React (`tsx`, `jsx`) | One JSX expression (a fragment `<>...</>` is allowed), without import or export. | The block contains `export default function`. |
| Vue (`vue`) | Template markup without a top-level `<template>` or `<script>`. | The block has a top-level `<template>`. |
| Angular (`ts`) | Exactly one property: ``template: `...` ``. | The block contains `@Component(` and `export class`. |

In fragment form the build adds the imports of the components the markup uses.
Module forms import only from their adapter package, `@hawiyah/core`, and
`react`, `vue`, `@angular/core`, `@angular/common` or `@angular/forms`.

Example:

~~~markdown
```html live example=primary
<button class="hw-button" type="button" data-variant="primary">Continue</button>
```

```tsx live example=primary
<Button variant="primary">Continue</Button>
```

```vue live example=primary
<HwButton variant="primary">Continue</HwButton>
```

```ts live example=primary framework=angular
template: `<button hwButton variant="primary">Continue</button>`
```
~~~

### Rules for the code

- No `style` attributes and no `:style` or `[style]` bindings, no `<style>`
  elements, and no `styles` or `styleUrl` in Angular metadata.
- No raw colours. Every class name starts with `hw-`.
- No `<script>` and no inline event handler attributes in HTML.
- Layout uses `hw-` layout classes, never white space between elements.
- The four blocks of a group produce the same result: the build compares their
  structure, accessibility tree and rendering.
- Every result is free of WCAG 2.2 AA violations that axe finds: the build runs
  axe in each of the four frame documents at rest (`HWE-AXE`), so an example
  without an accessible name fails before anyone reads the page.

### Text in Arabic pages

Live blocks in the Arabic page carry Arabic text. `npm run content:scaffold-ar`
writes them from the English blocks with a string map (the Arabic text of each
English reader string, once for the four frameworks), and
`npm run content:sync-ar` rewrites them in place after the English blocks change,
with the map that the two existing pages give. The map replaces markup text and
the values of reader attributes and text props only (the names listed below);
it never replaces a `value`, `id`, `name`, slot or option value. Apart from that, each Arabic
block has the same tokens as the English block of the same framework. Only
these tokens may differ (`HWC-PAR4`):

- strings and markup text whose Arabic form contains Arabic characters;
- language tags, such as `en` and `ar`;
- the pair `rtl` and `ltr`.

## Other tables

Every table has a caption: a paragraph directly above it that starts with
`Table: ` in English or `جدول: ` in Arabic (`HWC-TAB1`). The rest of the
paragraph becomes the caption of the rendered table, and the paragraph itself is
not rendered. GitHub shows it as the line above the table.

Tables other than API tables, such as keyboard tables, have the same number of
columns and rows in both languages, with translated cells. Column alignment
(`:--`, `:-:`, `--:`) is rendered as start, centre and end alignment.

## Key element

A key is written with the one raw HTML form the contract accepts:
`<kbd>Enter</kbd>`. It stands in a paragraph, a list item, an alert or a table
cell, holds the key name as plain text, and has no attribute, no markup inside,
no line break and no space at its start or end. GitHub shows it as a key, and
the guide renders it as `kbd` with the package class `hw-kbd`; a Latin key name
also gets `dir="ltr"` and `translate="no"`. Any other form fails (`HWC-MD`).

The text of a key element is a key name of `KEY_NAMES` in
`guide/scripts/content/config.mjs`, written as printed on the key: Tab, Shift,
Ctrl, Alt, Enter, Space, Escape, Backspace, Delete, Home, End, Page Up, Page Down,
F10. The four arrow keys carry no word and are named in the language of the page:
Right Arrow, Left Arrow, Up Arrow, Down Arrow in English, and السهم الأيمن،
السهم الأيسر، السهم العلوي، السهم السفلي in Arabic. Any other text, or the
English name of an arrow on the Arabic page, fails (`HWC-KEYS`).

The Arabic page names the same keys in the same order as the English page,
paragraph by paragraph and cell by cell (`HWC-KEYS`); only a cell made of arrow
keys may list them in another order, so that its first key is the one that moves
forward in reading order. `npm run content:scaffold-ar` writes the Arabic names of
the arrow keys.

## Keyboard table

A component with a controller (a controller factory of `@hawiyah/vanilla`, 34 of
the 85 components) has one keyboard table in its Accessibility section. Another
page may have one as well; it follows the same form but is not bound to a check.

- The caption is `Table: Keyboard interaction of <name>` in English and
  `جدول: التفاعل من لوحة المفاتيح مع المكوّن: <labelAr>` in Arabic, with the
  names of `components.json`; the headers are `| Key | Action |` and
  `| المفتاح | الإجراء |` (`HWC-KEYS`).
- Each Key cell holds key elements only: a chord joins keys with `+`
  (`<kbd>Shift</kbd> + <kbd>Tab</kbd>`), and keys with the same action are
  separated by a comma (an Arabic comma on the Arabic page).
- Each Action cell states the outcome in one sentence. In Arabic, write it in
  logical terms: next and previous in reading order, first and last.
- The brief page shows the keyboard table under the example.

The table drives a test. The checks that the live groups of the page name
(`check=` on the `html` block, written by a check author in
`guide/scripts/equivalence/checks/`) press keys and assert the documented outcome
in all four frameworks and in both languages, so also in right-to-left frames.
The build fails with `HWE-KEYS` when the table documents a key that no step of
those checks presses, when a step presses a key the table does not document, and
when a component with a controller has no keyboard table. A step that does not
reach its documented outcome in a framework fails with `HWE-EXPECT`, which
prints the outcome and the reference it is taken from. The expected outcome comes
from the WAI-ARIA Authoring Practices pattern the page names, from `CONTRACT.md`
or from a convention recorded in `CHANGELOG.md`, never from what an adapter does:
a row is never changed to match a package. A failing outcome is a package defect
for the lead (an entry under Known defects of the pinned version and, where
frameworks differ, a documented difference); the page keeps the documented
behaviour. `npm run check:page -- <id>` prints each row of the table with the steps
that press its keys and their outcomes; `--draft` leaves `HWE-KEYS` out while the
check is not written yet. A key that a sandboxed frame cannot press, or a
component that is left out of the rule, is an entry of
`guide/scripts/equivalence/keyboard-exceptions.json`, one of the lead's lists.

Example:

~~~markdown
Table: Keyboard interaction of Tabs

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus into the tab list on the selected tab; from a tab, moves focus to the visible panel. |
| <kbd>Home</kbd>, <kbd>End</kbd> | Moves focus to the first or the last enabled tab. |
~~~

## Evidence panel

The section Platforms Code reference opens with the compliance sentence, followed
by a sentence that introduces the sources of the page, and states the sources of
the mapping of the component (the notes on the supplied Platforms Code files, the
adaptations and their limits). It does not restate the verification evidence of
`components.json` and keeps no list of open items: the guide generates both, in
the evidence panel at the end of the section, in both languages.

- Verification evidence: the adapters the component is built in and those
  recorded as verified in `components.json`, then each evidence entry with its
  adapter, kind, scope, tests, result, date, command and source path (shown as
  code, never as a link), and the notes of `components.json`. Without an entry,
  the panel says that no verification evidence is recorded.
- Open items: each entry of the section Known defects of the pinned version in
  `CHANGELOG.md` that names the component (its `components.json` name as a whole
  word), and each documented difference of
  `guide/scripts/equivalence/known-differences.json` for it. Without any, the
  panel says so.

The evidence is English text of `components.json` and `CHANGELOG.md`; on an
Arabic page it is marked with `lang="en"` and `dir="ltr"`. A package defect is
stated once, in `CHANGELOG.md` under Known defects of the pinned version, by the
lead; the page keeps the example that shows it, and the panel lists it. The two
headings of the panel have the ids `evidence-recorded` and `evidence-open` in
both languages; a heading of the page with one of these ids fails (`HWC-H2`).

## Alerts

GitHub alert quotations render as notes in the guide:

Table: Alert kinds and their titles

| Markdown | English title | Arabic title |
| --- | --- | --- |
| `> [!NOTE]` | Note | ملاحظة |
| `> [!TIP]` | Tip | تلميح |
| `> [!IMPORTANT]` | Important | مهم |
| `> [!WARNING]` | Warning | تحذير |
| `> [!CAUTION]` | Caution | تنبيه |

The marker stands alone on the first line of the quotation. Both languages have
the same alert kinds in the same sections and order (`HWC-PAR6`). Any other
quotation renders as a plain quotation.

## Links

- `https://` and `http://` links stay as written and are marked external.
- A relative link to another component page (`button.md` or `button.ar.md`,
  optionally with `#section`) leads to that page's reference view in the
  language of the linking page when that page is built, and to the file on
  GitHub otherwise.
- `#section` leads to a heading of the same page; the id must exist. The
  `#section` of a link to another built component page must be a heading id of
  that page.
- A relative link to any other repository file leads to the file on GitHub. A
  file inside the paths the guide build reads (`guide/build-inputs.json`:
  `guide/`, `docs/`, `components.json`, `NOTICE`, `CHANGELOG.md`,
  `pnpm-workspace.yaml`, the guide workflow) must exist. A file outside them
  (for example `CONTRACT.md` or a package README) is accepted only when
  `guide/link-targets.json` lists it: the guide workflow builds from a sparse
  checkout that does not hold it, and `tests/guide-link-targets.test.ts` checks
  in the full checkout that every listed file exists.
- A relative link to a missing file, an absolute path, a path outside the
  repository, another scheme or a malformed percent escape fails the build
  (`HWC-LINK`).

## Code listings

Fenced code blocks without `live` render as code listings with a visible title
and a copy button. The title is the `title="..."` value of the info string, for
example ` ```ts title="main.ts" `; otherwise the language name. Code listings are
identical in both languages, in the same order and language (`HWC-PAR2`).

## Arabic front matter

The Arabic page starts with a front matter block with exactly one key,
`source`. It maps each section id (`summary` and the h2 ids) to the first 12
hexadecimal characters of the SHA-256 of the English section it was translated
from. An English page has no front matter (`HWC-FM1`); a missing block, an
unknown key or a malformed value fails the build (`HWC-FM2`).

~~~yaml
---
source:
  summary: 3f2a9c1b0d4e
  example: 9b7d1e2f3a4c
  api: 0c5d8e7f6a1b
  accessibility: 4e3d2c1b0a9f
  rtl-and-localisation: 7a6b5c4d3e2f
  platforms-code-reference: 1f2e3d4c5b6a
---
~~~

A section is the Markdown source from its h2 line up to the next h2 or the end
of the file, with line endings normalised and trailing white space removed from
each line; blank lines at its start and end do not count. The summary is the
text between the h1 and the first h2.

When an English section changes, the build reports each Arabic section whose
hash no longer matches (`HWC-STALE`). Update the translation, then print the
current block from the `guide/` directory and replace the front matter with it:

~~~shell
npm run content:hash -- <id>
~~~

The command prints the block and edits no file.

## Parity of the two languages

Besides the rules above, the Arabic page mirrors the English page:

- the same heading tree: levels and positions, and the same h2 sections
  (`HWC-PAR1`);
- the same code listings (`HWC-PAR2`);
- the same live groups, names and frameworks in the same order (`HWC-PAR3`);
- the same tables in the same order and dimensions, with identical API table
  bodies (`HWC-PAR5`);
- the same blocks in every section, in the same order: paragraphs, lists and
  the blocks of each item, code, tables, alerts and headings (`HWC-PAR7`);
- an Arabic letter in every paragraph, list item, heading h2 to h6 and table
  cell outside code and API tables, and in the reader text of every live block
  (`HWC-PAR8`): its text; the values of `label`, `aria-label`, `title`,
  `placeholder`, `alt`, `description`, `heading`, `caption`, `hint`, `message`,
  `text` and of every name that ends in `label`, `message`, `text` or `title`;
  `value`, `defaultValue` and `modelValue` where an element shows them (a text
  field, a text area, a button input, an output element or a component), and
  `name` and `defaultValue` as properties of a data object; and any phrase of
  two Latin words under another name that is not a token name (`class`, `id`,
  `role`, `type`, `href`, `name`, `value` and the other names of
  `TOKEN_NAMES` in `parity.mjs`). The value of an option, a check box or a radio
  button and the name of a form field are tokens. Headings that name a framework
  (JavaScript, React, Vue, Angular) stay Latin. A key element is not reader
  text, so a table cell made only of key elements needs no Arabic letter; a table
  cell made only of key names without the key element (Tab, Enter, ...) also
  stays Latin, while a heading, paragraph or list item made of them does not. Any other exception is an entry
  `{ "file", "text", "reason", "approvedBy" }` of
  `guide/scripts/content/arabic-exceptions.json`, which is empty.

## Forbidden constructs

These fail the build (`HWC-MD`):

- raw HTML, as a block or inline, including `<pre>`, `<details>` and any `<kbd>`
  other than the [key element](#key-element);
- an install command in a code listing (`npm install`, `pnpm add`, `yarn add` and
  the like): the guide generates install text from the pinned version;
- images;
- reference-style links and link definitions;
- footnotes;
- strikethrough and task list items;
- front matter in any position other than the start of the Arabic page;
- a fenced block without its closing fence (reported at the line where it
  opens), and an info string of a block that is not live with anything other
  than `title="..."`.

## Writing style

- Write in a formal register, in the present tense, without marketing language.
- Describe Hawiyah as built to comply with the DGA Platforms Code. It is not an
  official DGA product and holds no certification; state evidence and open
  items from `components.json` and `docs/` instead.
- Write Arabic text in Arabic and keep code, package names and API names in
  Latin script.
- The compliance sentence has one wording in each language, kept in
  `guide/src/app/i18n/compliance.json`. The footer and the landing import it,
  and the section Platforms Code reference of every page opens with it, word for
  word, followed by the sentence that introduces the sources of the page and the
  evidence panel after them.
  `guide/scripts/content/test/compliance.test.mjs` checks both and fails on any
  other wording of the claim.

### Arabic glossary

The Arabic terms of the guide are in [docs/guides/glossary.md](../guides/glossary.md):
the terms of the text sources and the pages, the frozen API terms (slot, event,
output, emit, default value, required, type, content projection, density, locale,
direction), one term each for an HTML attribute, a React or Vue prop and a CSS
property, the category labels and the proper-noun exception for «كود المنصات».
Its table of excluded forms is the source of
`guide/scripts/content/test/glossary.test.mjs`, which fails on any of them in an
Arabic page or a guide text source. A writer proposes a new term in the result of
the run; the lead adds it.

## Failure codes

Each finding is printed as `<code> <file>:<line>: <message>`. The build
collects every finding of the step before it stops.

Table: Failure codes of the content step

| Code | Rule |
| --- | --- |
| `HWC-FILE` | File names, ids and language siblings |
| `HWC-FM1` | Front matter in an English page |
| `HWC-FM2` | Missing or malformed Arabic front matter |
| `HWC-H1` | The h1 |
| `HWC-SUM` | The summary |
| `HWC-H2` | The h2 sections and the content of Example |
| `HWC-API` | The API section and its tables |
| `HWC-H5` | h4 placement, h5 and h6 |
| `HWC-TAB1` | Table captions |
| `HWC-LINK` | Links |
| `HWC-MD` | Forbidden Markdown constructs |
| `HWC-LIVE1` | Live block info strings |
| `HWC-LIVE2` | Live groups: placement, at most 8 per page, no date, time zone, random value or request |
| `HWC-LIVE3` | Repeated example names |
| `HWC-PAR1` to `HWC-PAR8` | Parity of the Arabic page with the English page |
| `HWC-STALE` | Arabic sections translated from an earlier English text |
| `HWC-KEYS` | Key elements, their parity, and the keyboard table |
| `HWC-APIX` | API tables that differ from the installed packages (step 30) |
| `HWC-VOCAB` | Code-formatted names that the installed packages do not have (step 30) |

Table: Failure codes of the equivalence step that a page can cause

| Code | Rule |
| --- | --- |
| `HWE-CHECK` | A group of a component with a controller names no check and is not `static`; a check that does not exist; a step that cannot run or presses other keys than it declares |
| `HWE-KEYS` | The keys of the keyboard table differ from the keys the steps of the page's checks press, or the table is missing |
| `HWE-EXPECT` | A step does not reach its documented outcome in a framework |
| `HWE-AXE` | axe finds a WCAG 2.2 AA violation in a frame document at rest |
| `HWE-STRUCT`, `HWE-ARIA`, `HWE-SHOT` | The four results differ in structure, accessibility tree or rendering |

## Not yet in force

Milestone 5 adds two more kinds of document, guides (`docs/guides/`) and
templates (`docs/templates/`), with the same parity, hash, link, vocabulary and
equivalence rules, and checks the install listings of the getting-started guide
against the generated install data (`HWC-INSTALL`). Both come with stage 5e; until
then `docs/guides/glossary.md` is a plain Markdown file that the build does not
render, and no template exists for `frame` to be used on.
