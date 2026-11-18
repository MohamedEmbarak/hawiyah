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
  reverse, fails the build (`HWC-FILE`).
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
| Accessibility | إمكانية الوصول | `accessibility` | Yes | Free text, h3 and h4. |
| RTL and localisation | الاتجاه والتوطين | `rtl-and-localisation` | Yes | Free text, h3 and h4. |
| Platforms Code reference | مرجع كود المنصات | `platforms-code-reference` | Yes | Free text, h3 and h4: evidence and open items. |

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
| Vue | `\| Name \| Kind \| Type \| Required \| Default \|` | `\| الاسم \| الصنف \| النوع \| مطلوب \| القيمة الافتراضية \|` |
| Angular | `\| Name \| Kind \| Type \| Required \| Default \|` | `\| الاسم \| الصنف \| النوع \| مطلوب \| القيمة الافتراضية \|` |

- Name, Type and Default cells are inline code. A missing default is an em dash
  (`—`), written without code formatting.
- Required is `` `true` `` or `` `false` ``.
- Kind is `prop`, `event` or `slot` for Vue, and `input`, `output` or `content`
  for Angular. For Angular content projection the name is the selector.
- The body rows are byte-identical in the English and Arabic tables. Only the
  caption, the header row and the prose after the table are translated.
- The names are compared with the declarations of the installed packages in a
  later build step; a table that lists a name the package does not declare, or
  omits one it does, fails the build.
- An Angular table that documents several classes lists the members of the
  first class by name and the members of each further class as
  `<element> <name>`, for example `hw-tab value` and `hw-tab *` on the Tabs
  page. The further classes of a page are named in
  `guide/scripts/api-tables/targets.mjs`.
- A JavaScript table of a component without a controller, such as Button, is
  checked against the documented classes and data attributes of the stylesheet
  contract (the `@hawiyah/styles` README); native HTML and ARIA attributes and
  reviewed omissions are listed in `guide/scripts/api-tables/exclusions.json`.

Example:

~~~markdown
### React

Table: Props of Button

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary'` | `false` | `'primary'` |
| `loading` | `boolean` | `false` | `false` |

The variant sets the visual family. Loading disables the button and sets
aria-busy.
~~~

## Live examples

A live group shows one example in the four frameworks. The guide renders the
Angular result in the page and offers the four sources, each compiled against
the published packages during the build.

### Syntax

Each block of a group is a fenced code block whose info string is:

~~~text
<lang> live example=<name> [framework=<framework>] [check=<check>] [differences=<id>]
~~~

- `lang` is `html`, `tsx`, `jsx`, `vue` or `ts`. The framework follows from it:
  `html` is vanilla, `tsx` and `jsx` are React, `vue` is Vue. A `ts` block
  states `framework=angular`.
- `name` matches `^[a-z][a-z0-9-]{0,39}$` and is unique in the file
  (`HWC-LIVE3`).
- `check` names an interaction check and `differences` names an approved known
  difference. Both stand only on the `html` block, the first of the group.
- Any other key or value fails the build (`HWC-LIVE1`). GitHub highlights the
  block by its first word and ignores the rest.

A group is four consecutive live blocks with the same name, in the order
vanilla (`html`), React (`tsx` or `jsx`), Vue (`vue`), Angular
(`ts framework=angular`), separated only by blank lines. A missing, repeated,
reordered or separated block fails the build (`HWC-LIVE2`), as does a live
block inside a list or quotation, or a group outside the Example section and the
h3 headings of Variants and states.

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

### Text in Arabic pages

Live blocks in the Arabic page carry Arabic text. Apart from that, each Arabic
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
- `#section` leads to a heading of the same page; the id must exist.
- A relative link to any other repository file leads to the file on GitHub.
- A relative link to a missing file, an absolute path, a path outside the
  repository or another scheme fails the build (`HWC-LINK`).

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
  bodies (`HWC-PAR5`).

## Forbidden constructs

These fail the build (`HWC-MD`):

- raw HTML, as a block or inline, including `<pre>`, `<details>` and `<kbd>`;
- images;
- reference-style links and link definitions;
- footnotes;
- strikethrough and task list items;
- front matter in any position other than the start of the Arabic page.

## Writing style

- Write in a formal register, in the present tense, without marketing language.
- Describe Hawiyah as built to comply with the DGA Platforms Code. It is not an
  official DGA product and holds no certification; state evidence and open
  items from `components.json` and `docs/` instead.
- Write Arabic text in Arabic and keep code, package names and API names in
  Latin script.

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
| `HWC-LIVE2` | Live groups and their placement |
| `HWC-LIVE3` | Repeated example names |
| `HWC-PAR1` to `HWC-PAR6` | Parity of the Arabic page with the English page |
| `HWC-STALE` | Arabic sections translated from an earlier English text |
