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

## Who does what

Four people work on a component page. The check author, the page writer and the
reviewer of one page are three different people.

- The check author writes the keyboard checks of a component with a controller
  before its page is written (see [Keyboard table](#keyboard-table)), and hands
  the page writer the check report.
- The page writer writes `<id>.md` and `<id>.ar.md` from the fact sheet, the
  READMEs of the installed packages and the check report, and runs
  `npm run check:page -- <id>` until it passes. The page writer changes no other
  file: not a check, not a list of the lead, not `CHANGELOG.md`; an entry or a
  defect is proposed in the result of the run.
- The reviewer reads both pages against the same sources and returns findings
  (see [Review](#review)). A page is not merged before that reading.
- The lead takes only page files and check modules from the others, decides
  every entry of the lead's lists and records package defects in `CHANGELOG.md`.

The checks prove structure, names, types, defaults, the keys of the keyboard
table, the outcome of each keyboard step and the equivalence of the four results.
No check proves that a sentence is true: that is the reviewer's work.

The lead's lists are `exclusions.json`, `defaults.json`,
`vocabulary-exceptions.json`, and `TARGET_OVERRIDES`, `VUE_SLOT_PATTERNS` and
`UNOWNED_EXPORTS` of `targets.mjs` (in `guide/scripts/api-tables/`);
`arabic-exceptions.json`, `claim-exceptions.json`,
`live-component-exceptions.json` and `marketing-terms.json` (in
`guide/scripts/content/`); `guide/scripts/page-guards/latin-allowlist.json`; and
`keyboard-exceptions.json`, `known-differences.json`, `empty-elements.json` and
`vanilla-hooks.json` (in `guide/scripts/equivalence/`). Each entry carries
`approvedBy` and a reason; one page has at most five entries over all of them (the
marketing terms belong to no page). An entry of `arabic-exceptions.json` or
`latin-allowlist.json` names the whole text it excepts (a whole paragraph, item,
cell or string, or a whole Latin-script run), 12 characters at least.
`guide/scripts/test/lead-lists.test.mjs` pins every list by the hash of its
content, so a changed list fails until the lead renews its pin with the entry.

## Files

- `<id>.md` is the English page and `<id>.ar.md` the Arabic page, where `<id>`
  is a component id in the root `components.json`.
- Both files exist, or neither does. A file whose id is not in
  `components.json`, an English page without its Arabic sibling, or the
  reverse, fails the build (`HWC-FILE`). While its translation is written, an
  English page may stand alone only when
  `guide/scripts/content/pending-translation.json` lists its id: the build gives
  it no route and counts it (`content: <n> pages pending translation`), its id is
  in no generated file of the build (`pages.json` lists only pages with both
  languages), and an entry whose Arabic page exists fails. The list is empty when
  the milestone ends.
- `npm run check:page -- <id>` (in `guide/`, after one production build) proves
  one page while it is written: its content (with the claim, text and component
  codes of step 20), the compile of its live groups, its API tables and
  vocabulary, the glossary and compliance assertions of the script tests and the
  Latin-script guard of step 72 on its own Markdown, and the equivalence of its
  groups, with the coverage report. What it does not run: the browser tests of
  the page, and the parts of step 72 that need a rendered document (the icon,
  `svg` and emoji guards, and the Latin-script guard over the examples and the
  generated text). Two commands run them:
  `HAWIYAH_BASE_PATH=/hawiyah/ npm run build -- --pages <id>` (every step but 90)
  and then `npm run test:page -- <id>`. The full build stays the gate.
- A writer reads the API of a component in two places: the fact sheet
  (`npm run content:facts -- <id>`, written to `guide/.cache/facts/<id>.md`: the
  members of each adapter with their types and defaults, the vanilla markup with
  the classes of the component's parts and the section of the `@hawiyah/vanilla`
  README that documents it, the fields of the item and option types of each
  adapter, the hooks a controller reads) and the READMEs of the installed packages,
  `guide/node_modules/@hawiyah/*/README.md`. A page states nothing about the API
  that neither holds.
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
language. Each required section holds at least one paragraph or list of its own
beyond the fixed text (table captions, the generated note, the compliance
sentence), and each API table is followed by prose (`HWC-EMPTY`). TODO, TBD,
FIXME, lorem ipsum and «قيد الكتابة» fail anywhere in the text, and so does the
placeholder of `content:scaffold-ar --placeholder` (any text that starts «نص مؤقت»)
in a page of `docs/components/` (`HWC-TODO`); the placeholder is accepted only in a
copy outside it, read with `--docs`.

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
  initialiser of the Angular class. Only a literal is written. A default that is
  absent, generated (an id), computed in the component body, or a function or an
  identifier (`formatPage = String`, an arrow function) is an em dash and is
  described in the prose after the table; so is the default of a required
  member. Vanilla options and stylesheet attributes publish no default in 0.3.0:
  their Default is an em dash unless `guide/scripts/api-tables/defaults.json`
  quotes a line of an installed file that sets it and states the default literal
  (a script test fails an entry whose quoted line does not contain it).
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
  `boolean`, and the Required column is not compared. A contract row that names
  several classes of `components.json` (the Feedback row of alerts and badges)
  gives an attribute, and each of its values, to a component only where
  `dist/styles.css` selects it on one of the component's classes or on an
  element inside one. Native HTML and ARIA
  attributes the page adds, and documented attributes it leaves out, are entries
  of `guide/scripts/api-tables/exclusions.json`. The 26 components whose classes
  have no row in that contract carry, directly after their JavaScript table and
  nowhere else in the API section (step 30 refuses the note anywhere else, and on
  every other component), the note that `content:api-tables` writes:
  `> [!NOTE]` and `> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.`
  (in Arabic: `> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.`).

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
the API tables, in prose, lists, headings, link text, alerts, other tables and
their captions, and the classes, `data-hw` hooks, `data-*` attributes with their
values and `aria-*` attribute names of its `html` live blocks (`HWC-VOCAB`,
`guide/scripts/api-tables/vocabulary.mjs`). It is not a spelling or style check,
and it reads code formatting only: a name in plain text is not checked, and a
name split across formatting (`` `orientation`*Mode* ``) fails. Each name must
exist in the installed packages:

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
  (`vocabulary-allow.json`, each group with its specification; a list of the
  guide, not one of the lead's lists, and a group without its specification
  fails step 30).
- A quoted literal is a value of a member type or of an enumerated attribute of
  the component. The value of an attribute or member (`aria-busy="true"`,
  `[role="tab"]`, `orientation="vertical"`) is a value of that attribute or
  member only; the value of a `data-*` attribute of an `html` block is one of
  the values the stylesheet selects it with, of its contract row, or of the
  member a `data-hw-<name>` hook configures, when such values exist. The
  expression of a binding (`[loading]="saving"`) is application code and is not
  judged.
- The names of the rows of the page's own API tables (a content selector such as
  `[hwStatValue]`, and its bare name) are accepted in the scope of their table,
  and so are the type words `boolean`, `string`, `number`, `true`, `false`,
  `null` and `undefined`.

Framework scope: a paragraph under an h3 or h4 heading whose text is a
framework name (JavaScript, React, Vue, Angular), in any section, or whose text
names a framework, is scoped to those frameworks;
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
  component with a controller (as [Keyboard table](#keyboard-table) defines it)
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
- A designed difference between the adapters is one of two narrow forms, each an
  entry of a lead's list with `component`, `reason`, `approvedBy` and a
  `reference` (a `CHANGELOG.md, <version>, <section>: <text>` entry for a defect,
  or `@hawiyah/<name> README.md: "<sentence>"` for a documented behaviour, both
  checked against the files): `guide/scripts/equivalence/empty-elements.json`
  (`class`: an element with that `hw-` class is left out of the structure
  comparison of the component's groups while it is empty, such as the trend
  region that one adapter always renders) and
  `guide/scripts/equivalence/vanilla-hooks.json` (`attribute`: a `data-hw-*`
  configuration attribute that `@hawiyah/vanilla` reads and the stylesheet does
  not select is left out of the vanilla result of the component's groups). Every
  other structural difference still fails with `HWE-STRUCT`; a malformed entry
  fails with `HWE-KD`. No entry exists yet; a writer proposes one in the result of
  the run instead of bending the example.
- `frame` renders the Angular result of the group in the sandboxed frame, like
  the other three, instead of in the guide page. Use it only on a page-level
  component that renders a `main` landmark, a skip link or an `h1` of its own
  (AppShell, PortalLayout, PortalHeader, PortalFooter, PageHeader, MobileTopBar:
  `FRAMED_COMPONENTS` of `guide/scripts/content/config.mjs`) and, from stage 5e,
  on a template; anywhere else it fails (`HWC-LIVE1`). `width=390` (only with
  `frame`) compares the screenshots of the group a second time with frames 390 px
  wide; a framed group is first compared at 1280 px. Without script a framed group
  shows its Angular listing and one sentence instead of a result, and no status. `frame` and
  `width` stand only on the `html` block.
- Any other key or value fails the build (`HWC-LIVE1`). GitHub highlights the
  block by its first word and ignores the rest.

A group is four consecutive live blocks with the same name, in the order
vanilla (`html`), React (`tsx` or `jsx`), Vue (`vue`), Angular
(`ts framework=angular`), separated only by blank lines. A missing, repeated,
reordered or separated block fails the build (`HWC-LIVE2`), as does a live
block inside a list or quotation, or a group outside the Example section and the
h3 headings of Variants and states.

Every live group shows the page's component (`HWC-LIVE7`): its `html` block has
one of the component's classes (`cssClasses` in `components.json`) or its
`data-hw` hook, its React and Vue blocks use its export, and its Angular block
uses the selector or the class of its Angular export (the export names are those
of the page's API tables). A group that legitimately shows no such name is an
entry `{ file, example, reason, approvedBy }` of
`guide/scripts/content/live-component-exceptions.json`, one of the lead's lists
(an entry that matches nothing fails).

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
`react`, `vue`, `@angular/core`, `@angular/common` or `@angular/forms`. A Vue
block is type-checked as `vue-tsc` checks a consumer of `@hawiyah/vue` at its
default settings: a `data-*` attribute on a native element (the packaged icon
`<span class="hw-icon" data-icon="add-01" aria-hidden="true">`) and an attribute
that falls through to a component are accepted; a wrong value of a declared prop
fails (`HWC-U1`).

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
with the map that the two existing pages give. The map replaces markup text, the
values of reader attributes and text props (the names listed below), and any other
string of two or more Latin words that `HWC-PAR8` reads as reader text (a Stat
`trend`, the `content` of an accordion item) when the map translates it; it never
replaces a `value`, `id`, `name`, slot or option value. Both commands print one
line for every string they leave in English that renders as reader text, and
`content:sync-ar` never replaces an Arabic string by an English one: where a
rewritten block aligns with the Arabic block, a string the map leaves in English
keeps the Arabic string of the page (the command prints it to be checked), and a
block that changed its shape is reported. Vue and Angular templates may close any
tag with `/>`. Apart from that, each Arabic
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
cell, holds the key name as plain text (a character reference such as `&#84;`
is not plain text), and has no attribute, no markup inside, no line break and no
space at its start or end. GitHub shows it as a key, and
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
keys may list them in another order (see [Keyboard table](#keyboard-table)).
`npm run content:scaffold-ar` writes the Arabic names of the arrow keys.

## Keyboard table

A component with a controller is a component whose page documents a controller
factory of `@hawiyah/vanilla` (`createTabs` on the Tabs page; 34 of the 85
components). This contract uses the words in that one meaning. Such a page has one
keyboard table in its Accessibility section. Another page may have one as well; it
follows the same form but is not bound to a check.

- The caption is `Table: Keyboard interaction of <name>` in English and
  `جدول: التفاعل من لوحة المفاتيح مع المكوّن: <labelAr>` in Arabic, with the
  names of `components.json`; the headers are `| Key | Action |` and
  `| المفتاح | الإجراء |`.
- Each Key cell holds key elements only. A chord joins keys with `+`
  (`<kbd>Shift</kbd> + <kbd>Tab</kbd>`); keys with the same action are separated
  by the comma of the page's language, `,` in English and `،` in Arabic (not by
  "or" or «أو»).
- In a cell of arrow keys, the key that moves forward in reading order comes
  first: Right Arrow before Left Arrow in English, السهم الأيسر before السهم الأيمن
  in Arabic, Down Arrow before Up Arrow in both.
- Each Action cell is one sentence that ends with a full stop.

A table that breaks one of these fails with `HWC-KEYS`. The brief page shows the
keyboard table under the example.

### Checks come before the page

The check author writes the checks of a component in
`guide/scripts/equivalence/checks/` before its page is written, and is not its page
writer. The expected outcome of each step is taken from a reference fixed before
the check is written: the WAI-ARIA Authoring Practices pattern of the component,
`CONTRACT.md`, or a convention recorded in `CHANGELOG.md`; never from what an
adapter does, and never from the page. Each step names its keys, a one-line outcome
and that reference, and computes the state it expects from the state before it.
Each check has a negative control: its fixture and a deliberately wrong oracle, under
which every step that presses a key must fail (`npm run test:scripts` runs it). The
form of a check is in `guide/README.md` (Build steps, step 80); the Tabs checks
(`checks/lib/tabs.mjs` and the five `tabs-*.mjs`) are the model.

The page writer receives the check report: `npm run check:page -- <id>` prints each
row of the keyboard table, then each step that presses its keys, with the step's
outcome and its reference. The page writer writes the Key cells with exactly the keys
the steps press, and each Action cell from the outcomes of its keys. A page whose
checks are not written yet is checked with `--draft`, which leaves out `HWE-KEYS`; it
is not merged that way.

Only the keys are bound mechanically. Step 80 fails with `HWE-KEYS` when the table
documents a key that no step presses, when a step presses a key the table does not
document, and when a component with a controller has no keyboard table; it fails with
`HWE-EXPECT` when a step does not reach its outcome in a framework, in both languages
and so also in right-to-left frames. The words of an Action cell are not compared
with anything: the reviewer compares them with the outcome lines (see
[Review](#review)).

A failing outcome is a package defect for the lead: an entry under Known defects of
the pinned version in `CHANGELOG.md` and, where frameworks differ, a documented
difference. The check and the table row keep the documented behaviour; neither is
changed to match a package. A key that a sandboxed frame cannot press, or a component
that is left out of the rule, is an entry of
`guide/scripts/equivalence/keyboard-exceptions.json`, one of the lead's lists; an
entry that matches nothing fails with `HWE-KEYS`.

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
adaptations and their limits). The guide generates the rest in the evidence panel
at the end of the section, in both languages; the page does not restate it. A
heading of the section that names it (Evidence, Verification evidence, Open items,
Known defects, «أدلة التحقق», «البنود المفتوحة» and the like) fails (`HWC-H2`).

- Verification evidence: the adapters the component is built in and those
  recorded as verified in `components.json`; each evidence entry as a list of
  fields, one per line (adapter, kind, scope, tests, result, date, command, and the
  source path, shown as code and never as a link); one line that names each kind of
  evidence that some built adapters have and others do not, with the adapters that
  have none; and the notes of `components.json`. Without an entry, the panel says
  that no verification evidence is recorded.
- Open items: each entry of the section Known defects of the pinned version in
  `CHANGELOG.md` that names the component (its `components.json` name as a whole
  word), with the documented differences of
  `guide/scripts/equivalence/known-differences.json` that cite it shown under it,
  then each documented difference that cites no such entry. Without any, the panel
  says so.

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
  `guide/scripts/content/arabic-exceptions.json` whose text is the whole text it
  excepts (12 characters at least); the list is empty.

## Forbidden constructs

These fail the build (`HWC-MD`):

- raw HTML, as a block or inline, including `<pre>`, `<details>` and any `<kbd>`
  other than the [key element](#key-element);
- an install command (`npm install`, `pnpm add`, `yarn add` and the like) or a
  pinned package address (`@hawiyah/<name>@<version>`), in a code listing or in
  running text, also as inline code: the guide generates install text from the
  pinned version;
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
  A term of `guide/scripts/content/marketing-terms.json` (beautiful, stunning,
  seamless, best-in-class and the others, and «رائع»، «مذهل»، «الأفضل»، «فائق
  السرعة») fails in any text of the page (`HWC-TONE`); the list is the lead's. The
  register and the tense are the reviewer's to read.
- Describe Hawiyah as built to comply with the DGA Platforms Code. It is not an
  official DGA product and holds no certification; the evidence panel states the
  evidence and the open items. Outside the compliance
  sentence, a paragraph, heading, list item or table cell that says that
  Hawiyah or a component is certified, accredited, endorsed, approved, licensed,
  official (`is official`, `official DGA ...`, `officially`), conformant or
  compliant (`conforms`, `compliant`, `complies`), or meant for government
  platforms (`for government`, `government platforms`), or the Arabic forms
  («معتمد»، «مصدّق»، «مرخّص»، «شهادة»، «رسميًا»، «منتج رسمي»، «للمنصات
  الحكومية»، «للجهات الحكومية»، «مطابق لكود المنصات» and their inflections,
  with or without diacritics), fails the build (`HWC-CLAIM`). A negated form
  passes only through an entry `{ file, text, reason, approvedBy }` of
  `guide/scripts/content/claim-exceptions.json` whose text is the whole
  paragraph, item or cell; the list is the lead's. Code is not read, and neither
  are the live blocks: a claim in the text of an example is the reviewer's to
  find.
- Write Arabic text in Arabic and keep code, package names and API names in
  Latin script.
- The compliance sentence has one wording in each language, kept in
  `guide/src/app/i18n/compliance.json`. The footer and the landing import it,
  and the section Platforms Code reference of every page opens with it, word for
  word, followed by the sentence that introduces the sources of the page and the
  evidence panel after them.
  `guide/scripts/content/test/compliance.test.mjs` checks both and fails on the
  marker words of the sentence (`certification`, `built to comply`, «شهادة» and
  the others) anywhere else; step 20 fails on the claims above (`HWC-CLAIM`).

### Arabic glossary

The Arabic terms of the guide are in [docs/guides/glossary.md](../guides/glossary.md):
the terms of the text sources and the pages, the frozen API terms (slot, event,
output, emit, default value, required, type, content projection, density, locale,
direction), one term each for an HTML attribute, a React or Vue prop and a CSS
property, the category labels and the proper-noun exception for «كود المنصات».
Its table of excluded forms is the source of
`guide/scripts/content/test/glossary.test.mjs`, which fails on any of them in an
Arabic page or a guide text source (`check:page` prints them as `HWT-GLOSSARY`).
«نمط» names a WAI-ARIA pattern only («نمط التبويبات»، «نمط الأكورديون»), with
«في ممارسات التأليف الخاصة بـWAI-ARIA» later in the same sentence. A writer
proposes a new term in the result of the run; the lead adds it.

## Review

No check reads the prose of a page for truth. Every page is read in both languages,
before it is merged, by a reviewer who did not write it and did not write its
checks. The page is not merged without that reading.

The reviewer answers every question below from four sources, and from nothing
else:

- the fact sheet, `npm run content:facts -- <id>` (`guide/.cache/facts/<id>.md`);
- the check report, `npm run check:page -- <id>` (each keyboard row with the outcome
  lines of its steps, and the coverage report);
- the installed packages, `guide/node_modules/@hawiyah/*/` (their `README.md`, the
  `.d.ts` declarations and the published JavaScript);
- the page in the other language.

A statement that none of the four supports is a finding. Four questions need one
more text each, and the reviewer reads it for that question only: the repository
note a Sources item links (`docs/nic-<id>.md`, `docs/coverage.md`) for what that
item says of it; the [Arabic glossary](#arabic-glossary) for question 13; the list
of changed files for the last sentence of question 7 and for question 14; and the
check modules of the component (`guide/scripts/equivalence/checks/`) for question 15.

### Rules the reviewer checks

These rules have no check. They bind the page as the checked rules do.

- An Arabic Action cell is written in logical terms: next and previous in reading
  order, first and last.
- An example lays out with `hw-` layout classes, never with white space or `&nbsp;`
  between elements.
- An example is code a reader can copy. It writes no internal part that an adapter
  renders itself (an `hw-<component>-*` element in a React, Vue or Angular block), no
  empty element, no `v-bind` of an object for one attribute and no prop that exists
  only to make the four results equal. A difference between adapters is proposed as a
  `CHANGELOG.md` entry and a known difference, not worked around in the example.
- The section Platforms Code reference restates no evidence and no open item under
  any heading.
- The text is formal and in the present tense, and praises nothing.
- Every name of the API in the prose is in code formatting (a name in plain text is
  not checked).
- The text of a live block claims nothing (the claim check does not read it).
- Each step of a check cites the WAI-ARIA Authoring Practices pattern, `CONTRACT.md`
  or `CHANGELOG.md` (step 80 checks only that a reference is given).

### Checklist

1. Summary: does it describe this component as the fact sheet describes it?
2. API prose: for each member it names, is the stated effect what the declaration
   and the package README say, in that framework?
3. Every default, type and required flag named in the prose: is it the value of the
   row of the same member in the table of the same framework?
4. Every paragraph above a live group and every table caption: does each of the four
   blocks show what it says, with the same kind of state (controlled or not), the
   same handlers and the same accessible names?
5. Every Action cell, in both languages: does it agree with the outcome lines of its
   keys in the check report, for the orientation or mode the cell names? A cell is
   one sentence; it need not repeat an outcome line that says a key changes nothing.
6. Every accessibility statement (roles, names, focus movement, announcements,
   reduced motion): does an outcome line of the check report, a package README, a
   declaration or the published JavaScript state it? If none does, it is removed.
7. The Arabic page against the English page, paragraph by paragraph, item by item and
   cell by cell, with the strings of the live blocks: the same meaning, numbers,
   members and order? Meaning is compared, not wording. A source hash renewed without
   a change to the Arabic section is a finding.
8. Every example: is it free of the work-arounds listed above?
9. Every sentence that names DGA, the Platforms Code, WCAG, a standard or a
   government body: does it say or imply certified, approved, official, conformant,
   compliant, endorsed or meant for government use, outside the fixed compliance
   sentence? Does it state evidence that the evidence panel does not list?
10. Does the page restate what the evidence panel generates (adapters, evidence
    entries, notes, open items)?
11. Every command, version, address and member name in the prose: does the fact sheet
    or the installed package hold it?
12. Does each section answer its own question (what, when, the API notes of each
    framework, keyboard and names, direction and text, sources)? A sentence that would
    fit any component is not content.
13. Does the Arabic page read as Arabic a technical editor would publish, with the
    terms of the glossary?
14. Does the change touch a file other than the two pages? Then the lead reviews that
    file separately.
15. For a new check: does each step's `expect` compute the state after the key from the
    state before it and the cited reference, and does the check fail if the component
    does nothing (its negative control)?

### What the reviewer returns

A list of findings. Each names the file and line (`docs/components/<id>.ar.md:42`), the
question it answers, what the page says, what the source says and which source, and
one verdict: "must change" (the page states something the sources do not support, or
breaks a rule of this contract) or "suggest" (wording, order, clarity). A page with an
open "must change" finding is not merged. The reviewer edits no file.

## Failure codes

Each finding is printed as `<code> <file>:<line>: <message>`. The build
collects every finding of the step before it stops. `npm run check:page -- <id>`
prints the codes of steps 20, 25, 30 and 80, and `HWT-GLOSSARY`, `HWT-COMPLIANCE`
and `HWP-LATIN` on the page's Markdown; the page guards over the rendered page
(step 72) run in a `--pages` build.

Table: Failure codes of the content step (step 20) and the API step (step 30)

| Code | Rule |
| --- | --- |
| `HWC-FILE` | File names, ids and language siblings |
| `HWC-FM1` | Front matter in an English page |
| `HWC-FM2` | Missing or malformed Arabic front matter |
| `HWC-H1` | The h1 |
| `HWC-SUM` | The summary |
| `HWC-H2` | The h2 sections, the content of Example, a heading that restates the evidence panel |
| `HWC-API` | The API section and its tables |
| `HWC-H5` | h4 placement, h5 and h6 |
| `HWC-TAB1` | Table captions |
| `HWC-LINK` | Links |
| `HWC-MD` | Forbidden Markdown constructs, install text, a key element that is not plain text |
| `HWC-LIVE1` | Live block info strings |
| `HWC-LIVE2` | Live groups: placement, at most 8 per page, no date, time zone, random value or request |
| `HWC-LIVE3` | Repeated example names |
| `HWC-LIVE7` | A live group that does not show the page's component |
| `HWC-PAR1` to `HWC-PAR8` | Parity of the Arabic page with the English page |
| `HWC-STALE` | Arabic sections translated from an earlier English text |
| `HWC-KEYS` | Key elements, their parity, the keyboard table and its rows (separator, order of an arrow cell, one sentence per Action cell) |
| `HWC-CLAIM` | A claim of certification, official status, conformance or use for government platforms outside the compliance sentence |
| `HWC-EMPTY` | A required section without a paragraph or list of its own, an API table without prose after it |
| `HWC-TODO` | Placeholder text: TODO, TBD, FIXME, lorem ipsum, «قيد الكتابة», the scaffold placeholder in `docs/components/` |
| `HWC-TONE` | A term of the marketing list |
| `HWC-APIX` | API tables that differ from the installed packages (step 30) |
| `HWC-VOCAB` | Code-formatted names that the installed packages do not have (step 30) |

Table: Failure codes of the example step (step 25)

| Code | Rule |
| --- | --- |
| `HWC-LIVE4` | A React or Vue tag that the adapter does not export, an `hw-` element that no Angular component has |
| `HWC-LIVE5` | A module form that imports from another package than its adapter, `@hawiyah/core` and its framework |
| `HWC-LIVE6` | Style attributes and bindings, `<style>`, raw colours, a class without `hw-`, `<script>`, inline event handlers |
| `HWC-V1`, `HWC-V2`, `HWC-V3` | The `html` block: an HTML parse error, a class the stylesheet does not define, a `data-hw` value that `enhance()` does not know |
| `HWC-R1` | The React block does not type-check or compile |
| `HWC-U1` | The Vue block does not type-check or compile |
| `HWC-A1` | The Angular block does not compile |

Table: Failure codes of the page guards (step 72) and the stage of check:page

| Code | Rule |
| --- | --- |
| `HWP-ICON` | A `data-icon` value without a rule in `@hawiyah/styles` |
| `HWP-SVG`, `HWP-FONT`, `HWP-EMOJI` | An `svg` element, an icon-font class, an emoji |
| `HWP-LATIN` | A run of four or more Latin-script words in the reader text of an Arabic page |
| `HWT-GLOSSARY` | A form that the Arabic glossary excludes (check:page; `glossary.test.mjs` in the script tests) |
| `HWT-COMPLIANCE` | A changed compliance sentence, or its marker words elsewhere (check:page; `compliance.test.mjs` in the script tests) |

Table: Failure codes of the equivalence step that a page can cause

| Code | Rule |
| --- | --- |
| `HWE-CHECK` | A group of a component with a controller names no check and is not `static`; a check that does not exist; a step that cannot run or presses other keys than it declares |
| `HWE-KEYS` | The keys of the keyboard table differ from the keys the steps of the page's checks press, or the table is missing; a check without its form or negative control |
| `HWE-EXPECT` | A step does not reach its documented outcome in a framework |
| `HWE-AXE` | axe finds a WCAG 2.2 AA violation in a frame document at rest |
| `HWE-FRAME` | A result frame failed to load or reported an error |
| `HWE-STRUCT`, `HWE-ARIA`, `HWE-SHOT` | The four results differ in structure, accessibility tree or rendering |
| `HWE-KD` | A malformed entry of `known-differences.json`, `empty-elements.json` or `vanilla-hooks.json`, or a group that names a difference that does not exist |

`HWE-SCOPE` and `HWE-MERGE` concern a run, its selection and the merge of its
shards, not a page; `guide/README.md` describes them.

## Not yet in force

Milestone 5 adds two more kinds of document, guides (`docs/guides/`) and
templates (`docs/templates/`), with the same parity, hash, link, vocabulary and
equivalence rules, and checks the install listings of the getting-started guide
against the generated install data (`HWC-INSTALL`). Both come with stage 5e; until
then `docs/guides/glossary.md` is a plain Markdown file that the build does not
render, and no template exists for `frame` to be used on.
