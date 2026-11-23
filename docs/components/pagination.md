# Pagination

Pagination is a navigation landmark with previous and next arrows, numbered page buttons and disclosures for the pages that a window omits. It reports the selected page; the application loads the matching records.

## Example

The landmark has a name, each page button has a name that includes its number, and the current page carries `aria-current="page"`. On the first page the previous arrow is `aria-disabled`, stays focusable and ignores activation.

```html live example=basic static differences=pagination-adapter-markup,pagination-vue-gap-text
<nav class="hw-pagination" data-hw="pagination" aria-label="Request pages" data-hw-total="10" data-hw-current="1" data-hw-page-label="Page {page}" data-hw-gap-label="Pages {start} to {end}" data-hw-jump-label="Page number" data-hw-go-label="Go">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="Previous page"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="Next page"></button>
</nav>
```

```tsx live example=basic
<Pagination
  label="Request pages"
  totalPages={10}
  defaultPage={1}
  previousLabel="Previous page"
  nextLabel="Next page"
  getPageLabel={page => `Page ${page}`}
  getGapLabel={(start, end) => `Pages ${start} to ${end}`}
  jumpLabel="Page number"
  goLabel="Go"
/>
```

```vue live example=basic
<Pagination
  label="Request pages"
  :total-pages="10"
  :default-value="1"
  previous-label="Previous page"
  next-label="Next page"
  :get-page-label="(page: number) => `Page ${page}`"
  :get-gap-label="(start: number, end: number) => `Pages ${start} to ${end}`"
  jump-label="Page number"
  go-label="Go"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwPaginationComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwPaginationComponent],
  template: `<hw-pagination
    label="Request pages"
    [totalPages]="10"
    [page]="1"
    previousLabel="Previous page"
    nextLabel="Next page"
    [getPageLabel]="pageLabel"
    [getGapLabel]="gapLabel"
    jumpLabel="Page number"
    goLabel="Go"
  />`,
})
export class BasicExample {
  pageLabel = (page: number) => `Page ${page}`;
  gapLabel = (start: number, end: number) => `Pages ${start} to ${end}`;
}
```

## Variants and states

### Gaps between pages

The window shows the first and the last page, the current page and its neighbours. Each omitted range is an ellipsis disclosure whose name states the range of pages it holds, and the pages inside it are buttons.

```html live example=middle static differences=pagination-adapter-markup,pagination-vue-gap-text
<nav class="hw-pagination" data-hw="pagination" aria-label="Request pages" data-hw-total="20" data-hw-current="6" data-hw-page-label="Page {page}" data-hw-gap-label="Pages {start} to {end}" data-hw-jump-label="Page number" data-hw-go-label="Go">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="Previous page"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="Next page"></button>
</nav>
```

```tsx live example=middle
<Pagination
  label="Request pages"
  totalPages={20}
  defaultPage={6}
  previousLabel="Previous page"
  nextLabel="Next page"
  getPageLabel={page => `Page ${page}`}
  getGapLabel={(start, end) => `Pages ${start} to ${end}`}
  jumpLabel="Page number"
  goLabel="Go"
/>
```

```vue live example=middle
<Pagination
  label="Request pages"
  :total-pages="20"
  :default-value="6"
  previous-label="Previous page"
  next-label="Next page"
  :get-page-label="(page: number) => `Page ${page}`"
  :get-gap-label="(start: number, end: number) => `Pages ${start} to ${end}`"
  jump-label="Page number"
  go-label="Go"
/>
```

```ts live example=middle framework=angular
import { Component } from '@angular/core';
import { HwPaginationComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-middle-example',
  imports: [HwPaginationComponent],
  template: `<hw-pagination
    label="Request pages"
    [totalPages]="20"
    [page]="6"
    previousLabel="Previous page"
    nextLabel="Next page"
    [getPageLabel]="pageLabel"
    [getGapLabel]="gapLabel"
    jumpLabel="Page number"
    goLabel="Go"
  />`,
})
export class MiddleExample {
  pageLabel = (page: number) => `Page ${page}`;
  gapLabel = (start: number, end: number) => `Pages ${start} to ${end}`;
}
```

### Disabled

A disabled pagination keeps its page buttons in the layout, blocks selection and shows its ellipses as plain text that is hidden from assistive technology.

```html live example=disabled static differences=pagination-adapter-markup
<nav class="hw-pagination" data-hw="pagination" aria-label="Request pages" data-hw-total="10" data-hw-current="3" aria-disabled="true" data-hw-page-label="Page {page}" data-hw-gap-label="Pages {start} to {end}" data-hw-jump-label="Page number" data-hw-go-label="Go">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="Previous page"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="Next page"></button>
</nav>
```

```tsx live example=disabled
<Pagination
  label="Request pages"
  totalPages={10}
  defaultPage={3}
  disabled
  previousLabel="Previous page"
  nextLabel="Next page"
  getPageLabel={page => `Page ${page}`}
  getGapLabel={(start, end) => `Pages ${start} to ${end}`}
  jumpLabel="Page number"
  goLabel="Go"
/>
```

```vue live example=disabled
<Pagination
  label="Request pages"
  :total-pages="10"
  :default-value="3"
  disabled
  previous-label="Previous page"
  next-label="Next page"
  :get-page-label="(page: number) => `Page ${page}`"
  :get-gap-label="(start: number, end: number) => `Pages ${start} to ${end}`"
  jump-label="Page number"
  go-label="Go"
/>
```

```ts live example=disabled framework=angular
import { Component } from '@angular/core';
import { HwPaginationComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-disabled-example',
  imports: [HwPaginationComponent],
  template: `<hw-pagination
    label="Request pages"
    [totalPages]="10"
    [page]="3"
    [disabled]="true"
    previousLabel="Previous page"
    nextLabel="Next page"
    [getPageLabel]="pageLabel"
    [getGapLabel]="gapLabel"
    jumpLabel="Page number"
    goLabel="Go"
  />`,
})
export class DisabledExample {
  pageLabel = (page: number) => `Page ${page}`;
  gapLabel = (start: number, end: number) => `Pages ${start} to ${end}`;
}
```

### Long ranges

A gap of more than 100 pages does not list every page. The disclosure holds a numeric field with a visible label and a button, and the page changes only when the entered number lies inside the gap.

```html live example=long-range static differences=pagination-adapter-markup,pagination-vue-gap-text
<nav class="hw-pagination" data-hw="pagination" aria-label="Request pages" data-hw-total="250" data-hw-current="1" data-hw-page-label="Page {page}" data-hw-gap-label="Pages {start} to {end}" data-hw-jump-label="Page number" data-hw-go-label="Go">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="Previous page"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="Next page"></button>
</nav>
```

```tsx live example=long-range
<Pagination
  label="Request pages"
  totalPages={250}
  defaultPage={1}
  previousLabel="Previous page"
  nextLabel="Next page"
  getPageLabel={page => `Page ${page}`}
  getGapLabel={(start, end) => `Pages ${start} to ${end}`}
  jumpLabel="Page number"
  goLabel="Go"
/>
```

```vue live example=long-range
<Pagination
  label="Request pages"
  :total-pages="250"
  :default-value="1"
  previous-label="Previous page"
  next-label="Next page"
  :get-page-label="(page: number) => `Page ${page}`"
  :get-gap-label="(start: number, end: number) => `Pages ${start} to ${end}`"
  jump-label="Page number"
  go-label="Go"
/>
```

```ts live example=long-range framework=angular
import { Component } from '@angular/core';
import { HwPaginationComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-long-range-example',
  imports: [HwPaginationComponent],
  template: `<hw-pagination
    label="Request pages"
    [totalPages]="250"
    [page]="1"
    previousLabel="Previous page"
    nextLabel="Next page"
    [getPageLabel]="pageLabel"
    [getGapLabel]="gapLabel"
    jumpLabel="Page number"
    goLabel="Go"
  />`,
})
export class LongRangeExample {
  pageLabel = (page: number) => `Page ${page}`;
  gapLabel = (start: number, end: number) => `Pages ${start} to ${end}`;
}
```

## API

### JavaScript

Table: Options of createPagination

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `page` | `number` | `false` | — |
| `totalPages` | `number` | `false` | — |
| `siblingCount` | `number` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `hideOnSinglePage` | `boolean` | `false` | — |
| `label` | `string` | `false` | — |
| `getPageLabel` | `(page: number) => string` | `false` | — |
| `formatPage` | `(page: number) => string` | `false` | — |
| `getGapLabel` | `(start: number, end: number) => string` | `false` | — |
| `jumpLabel` | `string` | `false` | — |
| `goLabel` | `string` | `false` | — |
| `onPageChange` | `(page: number) => void` | `false` | — |

Pagination has no stylesheet-only form: the markup is generated by `createPagination` or written by hand. Write a `nav` element with the class `hw-pagination` and `data-hw="pagination"`, then either authored controls marked with the attribute `data-hw-page`, whose value is previous, next or the number of a page (the arrows also carry `data-hw-previous` or `data-hw-next`, and the stylesheet mirrors the previous arrow through `data-hw-previous`), or an element with `data-hw-pagination-items` between the two arrows, which the controller fills with page buttons and ellipsis disclosures. The root reads `data-hw-total`, `data-hw-current`, `data-hw-siblings` and `data-hw-hide-single`; `data-hw-page-label` and `data-hw-gap-label`, and the matching attributes for the jump label and the go label, carry the names, with {page}, {start} and {end} as placeholders. The options publish no default in 0.3.0; the published build takes page 1 as the current page when none is given, and `siblingCount` as 1. `totalPages` must be a positive safe integer, otherwise the controller throws. With an items container, `getPageLabel`, `getGapLabel`, `jumpLabel` and `goLabel` are required, either as options or as the attributes of the root. `onPageChange` receives the new page. The returned controller has `page`, `select(page)` and `destroy()`; `select` ignores a page that is not an integer inside the range, a page that is already current and a disabled pagination, and `destroy` restores the original children and attributes.

The `disabled` option, `aria-disabled="true"` on the root and a disabled ancestor `fieldset` block selection. The `hideOnSinglePage` option and the attribute `data-hw-hide-single` with the value `true` hide a pagination of one page; the attribute has no effect with any other value.

### React

Table: Props of Pagination

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `page` | `number` | `false` | — |
| `defaultPage` | `number` | `false` | `1` |
| `totalPages` | `number` | `true` | — |
| `onPageChange` | `(page: number) => void` | `false` | — |
| `previousLabel` | `string` | `true` | — |
| `nextLabel` | `string` | `true` | — |
| `getPageLabel` | `(page: number) => string` | `true` | — |
| `formatPage` | `(page: number) => ReactNode` | `false` | — |
| `siblingCount` | `number` | `false` | `1` |
| `disabled` | `boolean` | `false` | `false` |
| `hideOnSinglePage` | `boolean` | `false` | `false` |
| `getGapLabel` | `(start: number, end: number) => string` | `true` | — |
| `jumpLabel` | `string` | `true` | — |
| `goLabel` | `string` | `true` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

`page` with `onPageChange` makes the page controlled, and `defaultPage` sets the start page of an uncontrolled pagination. The page is normalised to the range of `totalPages`. `previousLabel`, `nextLabel`, `getPageLabel`, `getGapLabel`, `jumpLabel` and `goLabel` are required text supplied by the application, and the pagination needs a name from `label`, `aria-label` or `aria-labelledby`. `formatPage` defaults to the function String and may return React content. `siblingCount` sets how many page buttons stand on each side of the current page. `disabled` blocks selection, and `hideOnSinglePage` hides the landmark when `totalPages` is 1. The other props of a native `nav` element reach the landmark, and the ref reaches the same element.

### Vue

Table: Props, events and slots of Pagination

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `number` | `false` | — |
| `defaultValue` | prop | `number` | `false` | `1` |
| `totalPages` | prop | `number` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `previousLabel` | prop | `string` | `true` | — |
| `nextLabel` | prop | `string` | `true` | — |
| `getPageLabel` | prop | `(page: number) => string` | `true` | — |
| `formatPage` | prop | `(page: number) => string` | `false` | — |
| `siblingCount` | prop | `number` | `false` | `1` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `hideOnSinglePage` | prop | `boolean` | `false` | `false` |
| `getGapLabel` | prop | `(start: number, end: number) => string` | `true` | — |
| `jumpLabel` | prop | `string` | `true` | — |
| `goLabel` | prop | `string` | `true` | — |
| `update:modelValue` | event | `(value: number) => void` | `false` | — |

`v-model` binds the page and `defaultValue` sets the start page of an uncontrolled pagination; `update:modelValue` carries the new page. `label` names the landmark, and the labels and the functions `getPageLabel` and `getGapLabel` are required. `formatPage` defaults to the function String and returns a string. `siblingCount`, `disabled` and `hideOnSinglePage` behave as in React. The build reads no slot.

### Angular

Table: Inputs, outputs and content of hw-pagination

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `page` | input | `number` | `false` | `1` |
| `totalPages` | input | `number` | `false` | `1` |
| `previousLabel` | input | `string` | `true` | — |
| `nextLabel` | input | `string` | `true` | — |
| `getPageLabel` | input | `(page: number) => string` | `true` | — |
| `formatPage` | input | `(page: number) => string` | `false` | — |
| `siblingCount` | input | `number` | `false` | `1` |
| `disabled` | input | `boolean` | `false` | `false` |
| `hideOnSinglePage` | input | `boolean` | `false` | `false` |
| `getGapLabel` | input | `(start: number, end: number) => string` | `true` | — |
| `jumpLabel` | input | `string` | `true` | — |
| `goLabel` | input | `string` | `true` | — |
| `pageChange` | output | `number` | `false` | — |

`HwPaginationComponent` (`hw-pagination`) renders the `nav` element. Bind `[(page)]` for the current page; `pageChange` emits the new page. `totalPages` defaults to 1. A function input such as `getPageLabel` is bound to a property of the host component, because a template cannot declare an arrow function. The pagination needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-pagination`. `formatPage` defaults to the function String. `siblingCount`, `disabled` and `hideOnSinglePage` behave as in React.

## Accessibility

Pagination is a `nav` element named by `label`, `aria-label` or `aria-labelledby`. Generated page buttons and arrows, and those of the three adapters, are native `button` elements with `type="button"`; authored vanilla page controls may be links. Each has an accessible name written by the application: `previousLabel`, `nextLabel` and `getPageLabel`. The current page carries `aria-current="page"`.

Table: Keyboard interaction of Pagination

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the next arrow, page button or ellipsis disclosure, and to the destinations of an open disclosure. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the previous control in the same order. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused arrow or page button and opens or closes the focused ellipsis disclosure. |
| <kbd>Escape</kbd> | Closes an open ellipsis disclosure and returns focus to its summary. |

- At the first page the previous arrow, and at the last page the next arrow, has `aria-disabled="true"`, keeps focus and its name, and ignores activation. The native `disabled` attribute is used only while the whole pagination is disabled, and in vanilla on a control that was authored disabled.
- Selecting a page inside an ellipsis disclosure closes the disclosure. Focus then moves to the button of the current page after the owning framework has updated the page.
- The numeric field of a long gap is a native `input` with `type="number"` inside a `label`. Enter in the field and the button named by `goLabel` validate the number; an invalid number sets `aria-invalid="true"` on the field and leaves the page unchanged.
- Opening a second ellipsis disclosure closes the first, and a click outside the pagination closes an open one.
- Pagination does not scroll the page after a change and does not change the address of the page; it moves focus only as described above, after a selection inside an ellipsis disclosure. A page button in authored vanilla markup may be a link with `href`; the vanilla controller leaves its native navigation, including modifier keys, to the browser.
- The stylesheet removes the transitions of the controls when the reader asks for reduced motion, and keeps focus and current-page cues in forced colours.

## RTL and localisation

Pagination has no built-in text: the name of the landmark, the names of the arrows, the page buttons, the gaps and the jump field are written by the application in the language of the page. `formatPage` formats the visible number of a page button, so an application may show Arabic-Indic digits; without it the digits are Latin.

- The direction of the arrows follows the nearest HTML direction boundary, so the previous arrow points toward the start of the reading direction. The packaged styles use logical properties.
- `getPageLabel` and `getGapLabel` receive numbers and return the full name, so the application controls the word order of each language.
- The jump field is a native number input, so the browser decides how a typed number is shown and read.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Pagination; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The page windows, the geometry of the controls, the current-page underline, the disclosures and the mobile profile of the supplied Platforms Code style sheet and script are mapped in the [pagination notes](../nic-pagination.md), which state a confidence for some of the mappings.
- The [pagination notes](../nic-pagination.md) record the decision of 0.3.0 that the arrow at a bound is `aria-disabled` and keeps focus, and that Hawiyah retains `siblingCount` while the shared helper follows the default windows of the source.
- Data loading, filtering and scrolling are not copied from the source, as the [pagination notes](../nic-pagination.md) state; they remain with the application.
