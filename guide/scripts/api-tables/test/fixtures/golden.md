# Golden members of step 30

Written by hand from the declarations (`dist/**/*.d.ts`, `dist/types/*.d.ts`)
and the published JavaScript of the installed `@hawiyah/*` 0.3.0 packages,
before the type printer and the default readers were run on them. Each row is one real member in the written
form of `docs/components/README.md`: single quotes, a literal-union alias
expanded, an object or interface alias by name, no `| undefined` on an optional
member, an Angular output as its payload type, a Vue event as its handler
signature, an em dash for slot and content rows and for a default that is
absent, generated or computed. A required member has no default.
`api-tables/test/golden.test.mjs` parses this table and requires the printer and
the readers to give exactly these cells. Where the first run of the printer
disagreed with the hand-written text, the declarations decided (two rows, both
corrected here: the required flag of the Angular Pagination input getPageLabel,
which its ɵcmp declares required, and the Calendar output focusEvents, whose
template name is its alias focused). The defaults of three vanilla rows (Tabs activationMode, Button
data-variant and data-size) follow the `defaults.json` entries the lead approved;
before them these cells were em dashes. 0.3.0 declares no Angular signal input
or output, so no row covers one; `types.test.mjs` covers them with a declaration
written for the test.

Table: Golden members

| Id | Framework | Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- | --- | --- |
| `button` | react | `variant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `button` | react | `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `button` | react | `loading` | prop | `boolean` | `false` | — |
| `tabs` | react | `items` | prop | `readonly TabItem[]` | `true` | — |
| `tabs` | react | `onValueChange` | prop | `(value: string) => void` | `false` | — |
| `tabs` | react | `orientation` | prop | `'horizontal' \| 'vertical'` | `false` | `'horizontal'` |
| `tabs` | react | `overflow` | prop | `'scroll' \| 'menu'` | `false` | `'menu'` |
| `tabs` | react | `overflowLabel` | prop | `string` | `false` | — |
| `tabs` | react | `aria-label` | prop | `string` | `false` | — |
| `tabs` | react | `label` | prop | `string` | `false` | — |
| `dialog` | react | `children` | prop | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `dialog` | react | `trigger` | prop | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `false` | — |
| `dialog` | react | `closeLabel` | prop | `string` | `true` | — |
| `dialog` | react | `defaultOpen` | prop | `boolean` | `false` | `false` |
| `dialog` | react | `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `search-field` | react | `suggestions` | prop | `readonly string[]` | `false` | — |
| `search-field` | react | `maxSuggestions` | prop | `number` | `false` | `8` |
| `search-field` | react | `showSearchButton` | prop | `boolean` | `false` | `false` |
| `search-field` | react | `getResultsMessage` | prop | `(count: number) => string` | `false` | — |
| `stack` | react | `gap` | prop | `Responsive<LayoutSpacing>` | `false` | — |
| `stack` | react | `align` | prop | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `stack` | react | `collapseAt` | prop | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `button` | vue | `variant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `button` | vue | `loading` | prop | `boolean` | `false` | `false` |
| `button` | vue | `type` | prop | `'button' \| 'submit' \| 'reset'` | `false` | `'button'` |
| `button` | vue | `default` | slot | — | `false` | — |
| `tabs` | vue | `items` | prop | `readonly TabItem[]` | `true` | — |
| `tabs` | vue | `modelValue` | prop | `string` | `false` | — |
| `tabs` | vue | `orientation` | prop | `'horizontal' \| 'vertical'` | `false` | `'horizontal'` |
| `tabs` | vue | `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `dialog` | vue | `open` | prop | `boolean` | `false` | — |
| `dialog` | vue | `defaultOpen` | prop | `boolean` | `false` | `false` |
| `dialog` | vue | `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `dialog` | vue | `update:open` | event | `(open: boolean) => void` | `false` | — |
| `field` | vue | `controlId` | prop | `string` | `false` | — |
| `button` | angular | `variant` | input | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `button` | angular | `loading` | input | `boolean` | `false` | `false` |
| `button` | angular | `type` | input | `string \| null` | `false` | `null` |
| `tabs` | angular | `id` | input | `string` | `false` | — |
| `tabs` | angular | `orientation` | input | `'horizontal' \| 'vertical'` | `false` | `'horizontal'` |
| `tabs` | angular | `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `tabs` | angular | `aria-label` | input | `string \| null` | `false` | `null` |
| `tabs` | angular | `valueChange` | output | `string` | `false` | — |
| `tabs` | angular | `hw-tab value` | input | `string` | `true` | — |
| `tabs` | angular | `hw-tab disabled` | input | `boolean` | `false` | `false` |
| `dialog` | angular | `openChange` | output | `boolean` | `false` | — |
| `dialog` | angular | `cancelled` | output | `void` | `false` | — |
| `pagination` | angular | `page` | input | `number` | `false` | `1` |
| `pagination` | angular | `getPageLabel` | input | `(page: number) => string` | `true` | — |
| `pagination` | angular | `formatPage` | input | `(page: number) => string` | `false` | — |
| `pagination` | angular | `pageChange` | output | `number` | `false` | — |
| `calendar` | angular | `valueChange` | output | `string` | `false` | — |
| `calendar` | angular | `controlId` | input | `string \| null \| undefined` | `false` | — |
| `calendar` | angular | `focused` | output | `FocusEvent` | `false` | — |
| `select` | angular | `options` | input | `readonly Option[]` | `false` | `[]` |
| `tabs` | vanilla | `activationMode` | option | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `tabs` | vanilla | `onValueChange` | option | `(value: string) => void` | `false` | — |
| `calendar` | vanilla | `calendar` | option | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `calendar` | vanilla | `label` | option | `string` | `false` | — |
| `calendar` | vanilla | `isDateDisabled` | option | `(value: string) => boolean` | `false` | — |
| `pagination` | vanilla | `getGapLabel` | option | `(start: number, end: number) => string` | `false` | — |
| `button` | vanilla | `class` | option | `'hw-button'` | `true` | — |
| `button` | vanilla | `data-variant` | option | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `button` | vanilla | `data-size` | option | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `button` | vanilla | `data-icon-only` | option | `boolean` | `false` | — |
| `button` | vanilla | `aria-busy` | option | `'true'` | `false` | — |
