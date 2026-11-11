# Changelog

All seven `@hawiyah/*` packages share one version. Versions below 1.0 may change
APIs in a minor release; read the notes before upgrading.

## Unreleased

- Button groups keep their content width inside flex and grid containers.
  In plain HTML, React and Vue a group stretched to the full width of a stack;
  Angular hid this behind its host element. In vertical attached groups, icon
  buttons now share the other segments' width.
- The button group preview, code tab and all four live editor projects render
  one shared example, and the preview style control switches whole groups.
- The guide header links to GitHub with the DGA set's `github` icon instead of
  the word GitHub and an external-link mark.
- The release script reports when every package was already on npm instead of
  claiming it published them.

### Breaking: the application supplies every text and the locale

The seven packages no longer contain a user-visible string and no longer
choose a locale. Every text a component places itself (accessible names,
labels of internal controls, headings, live-region, status, empty and
validation messages, templated text) is an input that the application
supplies, under the same name in vanilla, React, Vue and Angular. The rules
are in CONTRACT.md, "Text and localisation"; each adapter README lists its
inputs. Applications that relied on the former Arabic or English defaults now
pass them; the table below lists each former default with the input that
replaces it.

- **No built-in strings.** Primary content stays children, slots, projected
  content or authored markup. Strings are named `<thing>Label` or
  `<thing>Message`; templated text is a function `get<Thing>Label(...)` or
  `get<Thing>Message(...)` that returns the whole string. No adapter joins two
  texts with words or punctuation. Vanilla uses authored markup as written;
  otherwise it reads the controller option of the same name or
  `data-hw-<kebab-name>` on the controller root (a template such as
  `data-hw-page-label="… {page}"` for a function input), and the option wins.
- **Required text.** Text needed in every use is a required prop (React), a
  required input (Angular) or `required: true` (Vue). Text needed only when a
  prop, slot, handler or attribute switches a feature on is required under
  that condition. A missing text renders nothing in its place and warns once
  in development through `requireText` ("Hawiyah: ..."); production builds
  stay silent, in the browser as well: development is read from
  `process.env.NODE_ENV` alone, which a bundler replaces, and a page without a
  bundler counts as development unless it sets `globalThis.__HAWIYAH_DEV__`.
  The warning names the component as its adapter exposes it (the selector in
  Angular: `hw-file-dropzone`). A constraint whose validation message is
  missing still blocks submission, and `aria-invalid` does not depend on the
  message.
- **Names are required alike in every adapter.** A SearchField needs a field
  name: `label`, or an `aria-label` or `aria-labelledby` on the input in React
  and Vue (Vue also accepts a parent `Field`); a field without one now warns
  in Vue and Angular as it does in React. Angular `hw-search-field`,
  `hw-toggle-group` and `hw-tree-view` take `label` as a required input, so a
  template without it no longer compiles (NG8008). A Tabs list without
  `label` warns in React and Vue as it does in Angular. Vue `Feedback`
  requires `commentLabel` and `submitLabel` in every use, as React does,
  because the comment field appears once the reader answers. React
  `ContentNavigation` accepts an `aria-label` or `aria-labelledby` in place of
  `label`, as Vue does; the heading is printed only from `label`.
- **Nothing in place of absent optional text (Angular).** Field components
  render no empty `<label>` or `<legend>` and no empty `placeholder` attribute
  when `label` or `placeholder` is not supplied.
- **Vanilla.** `createSearchField` names the clear button from its authored
  `aria-label` or text before the icon replaces that text; `clearLabel` still
  wins when it is passed. `createPortalHeader` gives a brand that is not a
  link and has no role `role="img"` together with `brandLabel`, as React
  does, and removes both on `destroy()`.
- Core `layoutStyles` errors carry the `Hawiyah:` prefix.
- **No default locale.** Core `formatNumber`, `formatDate` and `sortRows` take
  a required locale; the `ar-SA` default is removed. These helpers,
  `getCalendarMonth` and `formatCalendarDate` throw a `TypeError` without a
  locale. Calendar, DatePicker and DataTable take a required `locale` in all
  adapters (vanilla: the `locale` option or `data-hw-locale` on the root);
  the vanilla RangeSlider takes one when it has a `[data-hw-range-output]`
  element. Without it the component warns and leaves out what Intl would
  have produced; it does not throw. No adapter reads `lang`,
  `document.documentElement.lang` or `navigator.language`, and no component
  writes `lang` or a default `dir`.
- **Removed core exports.** `getCalendarLabels`, `fileUploadLabels` and
  `getSiteVerificationLabels` are removed; importing them is a build error.
  `SiteVerificationOptions` now requires every `SiteVerificationLabels` field
  and has no `locale`. `FileUploadLabels` gains `getProgressLabel(name)` and
  `getRemoveLabel(name)`. New core exports: `requireText`, `hasText`,
  `resetTextWarnings`, `formatTextTemplate`, `getFragmentHref`,
  `getFragmentId`, `bindFragmentLink` and the types `FragmentLink` and
  `FragmentLinkOptions`.
- **Brand as artwork.** PortalHeader, PortalFooter and PortalLayout render
  brand text only when the application supplies it, so a logo can stand
  alone: React `brand` accepts a node, Vue has a `brand` slot (the `logo` slot
  is removed), Angular projects `[hwBrand]` content (`brand` becomes
  optional), vanilla uses the markup inside `.hw-portal-brand`. The optional
  `brandLabel` names an artwork-only brand. A brand without a home address is
  not a link.
- **Fragment links.** Skip links and ContentNavigation links render
  `href="#id"` on the server and on the first client render. In the browser
  core `bindFragmentLink` keeps them on the current document under any
  `<base href>`, moves focus to the target and does not write the URL
  fragment; ContentNavigation gains `updateHash` to write it. Vanilla adds
  `createSkipLink(link)`, registered with `enhance()` for
  `data-hw="skip-link"`.
- **Angular ids.** Generated ids come from one `HwIdSource` per application
  instead of module-level counters, so a server render and its hydration
  produce the same ids. Explicit id inputs still win. `hw-popover` and
  `hw-menu` take `panelId` and `hw-tooltip` takes `tooltipId` instead of
  `id`, so the host no longer repeats the inner element's id. New id inputs:
  `rangeTooltipId` on `hw-calendar`, `titleId` on `hw-navigation-drawer` and
  `navigationId` on `hw-portal-layout`. Wrappers no longer leave a native
  `title`, `role` or `align` attribute on their host element.
- **Other behaviour.** RatingDisplay has no `label`; `getValueLabel(value,
  max)` returns the whole text alternative. Carousel slides are named by
  `getSlideLabel(position, total)` alone; the Vue slide `label` field is
  removed. The Vue Stat no longer formats numbers and has no `locale`; pass
  the formatted string. Vanilla Calendar and DatePicker warn instead of
  throwing without a locale. The Angular FileDropzone `getSelectedMessage` is
  optional and its status is visible when supplied. React no longer sets
  `aria-invalid` because a `requiredMessage` is missing.
- The flat `styles.css` that includes the tokens and the 28 added icons are
  described under "One flat stylesheet, more icons and style-only fixes"
  below.

#### Migration

The left column is the former default text or input name; where the adapters
differed, the variants are listed. "Required" uses the terms of CONTRACT.md.
The names were checked against the built type declarations of each package.

| Component | Former default or name | Input now | Required |
|---|---|---|---|
| Alert | Angular `'Dismiss'` | `closeLabel` | when the alert is dismissible (Angular; React and Vue render no dismiss button) |
| AppShell | `'انتقل إلى المحتوى'` | `skipLabel` | always |
| AvatarGroup | Angular `'People'` | `label` | always |
| AvatarGroup | `` `${count} more people` ``; Vue `remainingLabel`, Angular `overflowLabel` | `getOverflowLabel(count)` | always |
| Breadcrumb | `'مسار التنقل'` | `label` | always |
| Calendar | `'ar-SA'` (Angular), the document language (vanilla), a default (React, Vue) | `locale` | always |
| Calendar | `'التقويم'` / `'Calendar'` | `label` | always |
| Calendar | `'الشهر السابق'` / `'Previous month'` | `previousLabel` | always |
| Calendar | `'الشهر التالي'` / `'Next month'` | `nextLabel` | always |
| Calendar | `'التواريخ الهجرية المدعومة'` / `'Supported Hijri dates'` | `rangeLabel` | when `calendar` is `islamic-umalqura`; always in vanilla |
| Calendar (vanilla) | `'نظام التقويم'` / `'Calendar system'`; `'ميلادي'` / `'Gregorian'`; `'هجري · أم القرى'` / `'Hijri · Umm al-Qura'` | `calendarSystemLabel`, `gregorianLabel`, `hijriLabel` | always |
| Calendar (vanilla, Vue) | the Umm al-Qura range sentence | `unsupportedMessage` | always (vanilla); when `calendar` is `islamic-umalqura` (Vue) |
| Calendar | Intl day name (Angular: a day name joined with a comma) | `getDayLabel(value)` | optional |
| Calendar (Angular) | module counter | `rangeTooltipId` | optional |
| Carousel | `'الشريحة السابقة'` | `previousLabel` | always |
| Carousel | `'الشريحة التالية'` | `nextLabel` | always |
| Carousel | `'اختيار الشريحة'` | `indicatorsLabel` | when indicators are shown |
| Carousel | `'n من t'`; Vue `slideMessage`, Angular `slideLabel`; Vue slide `label` | `getSlideLabel(position, total)` | always |
| Carousel | `'لا توجد شرائح'` / `'No slides'` | `emptyLabel` | always |
| Carousel | `'عرض شرائح'` / `'carousel'` | `carouselDescription` | optional |
| Carousel | `'شريحة'` / `'slide'` | `slideDescription` | optional |
| Chip | `'Remove'` | `removeLabel` | when the chip is removable |
| Combobox | `'No options found'`; Angular `'No results'` | `emptyMessage` | always |
| Combobox | `` `${count} results available` ``; vanilla `` `${count} نتيجة` ``; Vue and Angular `resultsMessage` | `getResultsMessage(count)` | always |
| Combobox | `'Choose an option from the list.'`; Angular `validationMessage`; vanilla `invalidSelectionMessage` | `requiredMessage` | when `required` is set |
| ContentNavigation | `'في هذه الصفحة'` | `label` | always |
| ContentNavigation | the controller rewrote link addresses | `updateHash` | optional |
| CookieConsent | `'Cookie preferences'`; Vue `label` | `title` | always |
| CookieConsent | `'Accept optional cookies'` | `acceptLabel` | always |
| CookieConsent | `'Reject optional cookies'` | `rejectLabel` | always |
| CookieConsent | `'Manage preferences'` | `preferencesLabel` | when a preferences handler is bound |
| CookieConsent | `'Cookie policy'` | `policyLabel` | when `policyHref` is set (React, Angular) |
| DataTable | `'ar-SA'` | `locale` | always |
| DataTable | `'لا توجد سجلات'`; Angular `'لا توجد نتائج'` | `emptyMessage` | always |
| DataTable | Vue `sortLabel` (`'ترتيب … تصاعديًا'`) | `getSortLabel(column, direction)` | optional |
| DatePicker | `'ar-SA'` (Angular), the document language (vanilla), a default (React, Vue) | `locale` | always |
| DatePicker | `'التاريخ'` / `'Date'` | `label` | always |
| DatePicker | `'اختر التاريخ'` / `'Choose date'`; Angular `dialogTitle` | `calendarLabel` (dialog name) | always |
| DatePicker | `'فتح التقويم'` / `'Open calendar'`; React `buttonLabel` | `openLabel` | always |
| DatePicker | `'إغلاق التقويم'` / `'Close calendar'` | `closeLabel` | always |
| DatePicker | `'الشهر السابق'` / `'Previous month'`, `'الشهر التالي'` / `'Next month'` | `previousLabel`, `nextLabel` | always |
| DatePicker | `'نظام التقويم'` / `'Calendar system'`; Angular `calendarLabel` | `calendarSystemLabel` | always |
| DatePicker | `'ميلادي'` / `'Gregorian'`; Vue `gregoryLabel` | `gregorianLabel` | always |
| DatePicker | `'هجري · أم القرى'` / `'Hijri · Umm al-Qura'` | `hijriLabel` | always |
| DatePicker | `'التواريخ الهجرية المدعومة'` / `'Supported Hijri dates'` | `rangeLabel` | always |
| DatePicker | `'أدخل تاريخًا ميلاديًا متاحًا بصيغة YYYY-MM-DD.'` / `'Enter an available Gregorian date in YYYY-MM-DD format.'` | `invalidMessage` | always |
| DatePicker | the Umm al-Qura range sentence; React `unsupportedCalendarMessage` | `unsupportedMessage` | always |
| DatePicker | `'هذا التاريخ غير متاح.'` / `'This date is unavailable.'` | `unavailableMessage` | when `isDateDisabled` is given (not in Angular) |
| DatePicker | `'YYYY-MM-DD'` | `placeholder` | optional |
| Dialog, Drawer | `'Close'`; Angular `'Close dialog'` | `closeLabel` | always |
| Feedback | `'Was this page helpful?'` | `label` | always |
| Feedback | `'Yes'`; Angular `positiveLabel` | `yesLabel` | always |
| Feedback | `'No'`; Angular `negativeLabel` | `noLabel` | always |
| Feedback | `'Tell us more (optional)'` | `commentLabel` | always in React and Vue; not in Angular |
| Feedback | `'Send feedback'` | `submitLabel` | always in React and Vue; not in Angular |
| Feedback | `'Thank you for your feedback.'`; Vue `thanks`, Angular `thanksMessage` | `successMessage` | always |
| FileDropzone | `dropLabel` used as the input name; Angular optional `label` | `label` (or `aria-label`, `aria-labelledby`, a parent Field) | always |
| FileDropzone | `'Drop files here or choose files'`; Vue `'Choose files or drop them here'`; Angular `instruction` | `dropLabel` | always |
| FileDropzone | `` `${count} files selected` ``; Angular `selectedMessage`; vanilla file names joined with `'، '` | `getSelectedMessage(files)` | optional; the status is rendered only when it is supplied |
| FileDropzone | `'Some files do not match the accepted file types.'` | `getRejectedMessage(rejected)` | when `accept` is set (React) or the vanilla status element exists with `accept` or a maximum size |
| FileDropzone (vanilla) | `'Use the file chooser to attach documents.'` / `'استخدم اختيار الملفات لإرفاق المستندات.'` | `unsupportedDropMessage` | while the status element exists |
| FileUploadList | core `fileUploadLabels` (`'جاهز للرفع'`, `'جارٍ الرفع'`, `'اكتمل الرفع'`, `'تعذر الرفع'`, `'إزالة الملف'`) | `labels: FileUploadLabels` with `getProgressLabel(name)` and `getRemoveLabel(name)` | always |
| Menu, Popover | Angular `'Open'` | `triggerLabel` | where the adapter renders the trigger (Vue Popover, Angular) |
| Menu, Popover (Angular) | `id` | `panelId` | optional |
| MobileTopBar | `'رجوع'` | `backLabel` | when a back address or action is given |
| MultiSelect | `'Search options'` | `searchLabel` | always |
| MultiSelect | `'No options found'`; Angular `'No options'` | `emptyMessage` | always |
| MultiSelect | `'Choose at least one option.'`; Angular `validationMessage` | `requiredMessage` | when `required` is set |
| MultiSelect (vanilla) | `` `${count} options` `` / `` `${count} خيارات` `` | `getResultsMessage(count)` | when a `[data-hw-status]` element exists |
| MultiSelect (Angular) | `` `${count} selected` ``; `selectedMessage` | `getSelectedMessage(count)` | always |
| NavigationDrawer | `'التنقل الرئيسي'` | `navigationLabel` | always |
| NavigationDrawer | `'إغلاق القائمة'` | `closeLabel` | always |
| NavigationDrawer (Angular) | not settable | `titleId` | optional |
| NotificationList | `'Notifications'` | `label` | always |
| NotificationList | `'No notifications'` | `emptyMessage` | always |
| NotificationList | `'Unread'` | `unreadLabel` | always (React, Angular) |
| NotificationList | `'Mark as read'`; Vue `readLabel` | `getMarkReadLabel(item)` | when a mark-read handler is bound (React, Vue) |
| NotificationList | `'Dismiss'`; Vue and Angular `dismissLabel` | `getDismissLabel(item)` | when a dismiss handler is bound (Vue, Angular) |
| Pagination | `'ترقيم الصفحات'` | `label` | always |
| Pagination | `'الصفحة السابقة'` | `previousLabel` | always |
| Pagination | `'الصفحة التالية'` | `nextLabel` | always |
| Pagination | `'الصفحة ' + page`; Vue and Angular `pageLabel` | `getPageLabel(page)` | always |
| Pagination | `'الصفحات … إلى …'`; Vue and Angular `gapLabel` | `getGapLabel(start, end)` | always |
| Pagination | `'الانتقال إلى صفحة'` / `'Go to page'` | `jumpLabel` | always |
| Pagination | `'انتقال'` / `'Go'` | `goLabel` | always |
| PasswordField | `'Show password'` / `'إظهار كلمة المرور'` | `showLabel` | always |
| PasswordField | `'Hide password'` / `'إخفاء كلمة المرور'` | `hideLabel` | always |
| PasswordField (Vue) | `clearLabel` `'Clear search'` | removed; PasswordField renders no clear button | — |
| PortalHeader | `'انتقل إلى المحتوى'`; Angular `mainId` default `'main-content'` | `skipLabel` | when `mainId` is set |
| PortalHeader | `'القائمة'` | `menuLabel` | always |
| PortalHeader | `'التنقل الرئيسي'`; Vue `navLabel` | `navigationLabel` | always |
| PortalHeader, PortalFooter, PortalLayout | brand text always printed; Vue `logo` slot | `brand` (node, `brand` slot or `[hwBrand]`), `brandLabel` | `brandLabel` when the brand has no text |
| PortalFooter | `'روابط التذييل'`; React `linksLabel`, Vue `navLabel` | `navigationLabel` | when links are given |
| PortalFooter | `'السياسات وإمكانية الوصول'` | `legalLinksLabel` | when legal links are given |
| PortalFooter | `'المساعدة والتواصل'` | `supportLabel` | when support content is given |
| PortalFooter | `'يفتح في نافذة جديدة'` | `externalLabel` | always |
| PortalLayout | `lang="ar"`, `dir="rtl"` | `dir` (no default); `lang` removed | optional |
| PortalLayout | `'انتقل إلى المحتوى'` | `skipLabel` | always |
| PortalLayout | `'القائمة'` | `menuLabel` | always |
| PortalLayout | `'التنقل الرئيسي'` | `navigationLabel` | always |
| PortalLayout | `'التنقل الثانوي'` | `secondaryLabel` | when secondary navigation is given |
| PortalLayout | `'مسار التنقل'` | `breadcrumbLabel` | when breadcrumbs are given |
| PortalLayout | `'روابط التذييل'` | `footerLabel` | when footer links are given |
| PortalLayout | `'يفتح في نافذة جديدة'` | `externalLabel` (React, Vue: `footerProps.externalLabel`) | always |
| PortalLayout (Angular) | not settable | `navigationId` | optional |
| RangeSlider | `'Minimum'` | `lowerLabel` | always |
| RangeSlider | `'Maximum'` | `upperLabel` | always |
| RangeSlider (vanilla) | the document language | `locale` | when a `[data-hw-range-output]` element exists |
| Rating | `'n من t'`; Vue `optionLabel`, Angular `ratingLabel` | `getRatingLabel(value, max)` | always |
| RatingDisplay | `label` joined with `'n من t'`; Vue and Angular `valueLabel` | `getValueLabel(value, max)`; `label` removed | always |
| SearchField | none; the field could be left unnamed without a warning in Vue and Angular | `label` (or `aria-label`, `aria-labelledby`; in Vue a parent Field) | always; a required input in Angular |
| SearchField | `'مسح البحث'` / `'Clear search'` | `clearLabel` | always (vanilla: unless the clear button has an `aria-label` or text) |
| SearchField | `'بحث'` | `searchLabel` | when the search button is shown |
| SearchField | `` `${count} اقتراحات متاحة` ``; `resultsMessage` | `getResultsMessage(count)` | when suggestions are given |
| SecondaryNav | `'التنقل الثانوي'` | `label` | always |
| Select | Angular `'اختر خيارًا'` | `placeholder` | optional |
| ServiceCard | `'View service'`; Vue `'Start service'` | `actionLabel` | when the card renders its own action link |
| ServiceDetails | `'Requirements'` | `requirementsLabel` | when requirements are given (React, Angular) |
| SiteVerification | core `getSiteVerificationLabels(locale)` and the `locale` prop | `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel`, `httpsDescription` | always |
| SiteVerification | as above | `registrationLabel`, `externalLabel` | when `registrationHref` is set (`externalLabel` when the link opens a new window) |
| Spinner | `'Loading'` | `label` | always, unless the spinner is decorative |
| Stat (Vue) | `locale` and number formatting | removed; pass the formatted value | — |
| Stepper | `'التقدم'` | `label` | always |
| Table | `'لا توجد سجلات'` | `emptyMessage` | when `columns` is given |
| Tabs | none | `label` | always; a missing one now warns in React and Vue too |
| Tabs | `'المزيد من التبويبات'` / `'More tabs'` | `overflowLabel` | when overflow uses a menu |
| TagInput | `` `Remove ${tag}` ``; Vue and Angular `removeLabel` | `getRemoveLabel(tag)` | always |
| TagInput | `'Add at least one tag.'`; Angular `validationMessage` | `requiredMessage` | when `required` is set |
| TagInput (Angular) | `'Add'` | `addLabel` | always |
| Timeline | `'Timeline'` | `label` | always |
| ToastRegion | `'الإشعارات'` / `'Notifications'` | `label` | always |
| ToastRegion | `'إغلاق الإشعار'`; Vue and Angular `dismissLabel` | `getDismissLabel(message)` | when a message can be dismissed |
| ToggleGroup, TreeView (Angular) | optional `label` | `label` | always; a required input |
| Tooltip (Angular) | `id` | `tooltipId` | optional |
| TreeView | `'Expand ' + label`; Vue `expandLabel` | `getExpandLabel(node)` | always (React, Vue) |
| TreeView | `'Collapse ' + label`; Vue `collapseLabel` | `getCollapseLabel(node)` | always (React, Vue) |

### Angular server rendering and hydration

Found by server-rendering and hydrating every component of the published
0.2.1 packages in a prerendered Angular 22 application.

- `hw-tabs` and `hw-content-navigation` no longer end a prerender. Both
  started layout measurement during server rendering; a timer then called
  `getBoundingClientRect`, which the server DOM does not have, and the uncaught
  exception stopped the render worker and unrelated routes with it. The Angular
  adapter now starts the observers only in the browser, and
  `observeTabOverflow` / `observeContentNavigation` in `@hawiyah/core` return
  inert handles when the DOM has no layout.
- `hw-combobox`, `hw-tag-input`, `hw-multi-select` and `hw-date-picker` no
  longer throw `setCustomValidity is not a function` on the server (an unhandled
  rejection when bound through `ngModel`). The date picker's dialog now receives
  its id on the server, so `aria-controls` resolves in the prerendered page.
- `hw-toggle-group` in single-select mode and `hw-accordion` (and
  `details[hwAccordionOpen]`) no longer throw on the server, where the failed
  pass left later accordion items and following components empty.
  `observeReadonlyChoice` falls back to the owner document without
  `getRootNode`, and `createAccordionMotion` no longer spreads
  `details.children`. Choice guards and accordion motion start in the browser;
  the server keeps `<details open>` and the native `name` of an exclusive group.
- `hw-tabs` can be hydrated. Each `hw-tab` now renders its own
  `section.hw-tab-panel` instead of handing a template to `hw-tabs`, which
  Angular could only locate from `document.body` and which failed with NG0509,
  leaving the tabs inert. **Markup change:** panels are children of their
  `hw-tab` element (given `display: contents` by `@hawiyah/styles`) instead of
  direct children of `.hw-tabs`; roles, ids, `aria-controls`,
  `aria-labelledby` and panel order are unchanged. **API change:** the
  `content` template reference on `HwTabComponent` is removed, and the
  component gains the signals `panelId`, `tabId` and `active`, which the
  owning tabset sets. Inputs, outputs and selectors are unchanged.
- A package test now server-renders every exported Angular component and
  directive with `@angular/platform-server`, value controls through
  `[(value)]`, `ngModel` and `formControl`, and fails on any thrown or logged
  error; a second test hydrates the same pages in jsdom. React and Vue were
  checked for the same hazards and needed no change.

### Typed values and accessible names

- Angular `hw-number-field` and `hw-text-field` no longer rewrite text while
  it is typed. Replacing `12` with `-5` committed `5`, typing `1e2` committed
  `2`, and editing one segment of a `type="date"` field cleared the whole date,
  because the model was bound back into the input on every keystroke. The input
  is now written only when the model changes from outside and does not already
  show that value; a form reset still clears a draft. Values emitted match the
  other adapters: `-5` and `100` from NumberField, the typed string from
  TextField.
- A FileDropzone without a label has an accessible name in Angular and Vue.
  Angular rendered an empty `<label>` and Vue none, so the file input was
  announced without a name (Angular) or with the browser's own button text
  (Vue). As in React, the visible instruction (`instruction` / `dropLabel`) is
  now the input's label when no label is given; with a label nothing changes.

### Choice styles, clean package builds and continuous integration

- A radio group with no selection no longer shows every radio as selected in
  the DGA and custom themes. Browsers match `:indeterminate` on every radio of
  a group with no checked member, and the shared choice styles showed the mark
  for it; this happened in all four adapters, and in Angular also after a
  native form reset. Only a checkbox now uses the mixed presentation. A
  Chromium test loads only the package stylesheet and checks an unselected,
  a selected and a reset group, and a mixed checkbox, in every theme and mode.
- `pnpm build:packages` empties each package's `dist` before building it. The
  0.2.1 `@hawiyah/styles` tarball shipped 12 asset files that had been deleted
  from the sources and survived in `dist` from earlier builds.
- `pnpm check:packages` fails when a tarball contains a file the last clean
  build did not produce or that changed since, and when an `exports` target is
  not in the tarball. Files other than `dist` are now staged from each
  package's `files` field, so `@hawiyah/tokens` ships
  `reference/dga-foundations.json`, which 0.2.1 exported without containing.
- A CI workflow runs the package build, unit and token-contrast tests, the
  guide typecheck, the tarball check and the Chromium browser suite on every
  push and pull request. Before this, no workflow ran a test.

### One flat stylesheet, more icons and style-only fixes

- `@hawiyah/styles/styles.css` is now one flat file. The build inlines the
  tokens and every component file in source order, so the published entry has
  no `@import` and a page can link it directly, without a bundler; 0.2.1
  started with a bare `@import '@hawiyah/tokens/tokens.css'` that a browser
  cannot resolve, followed by 47 more imports. Font and icon URLs stay relative
  to the file. `reset.css` remains separate and opt-in, and the individual
  files stay available as `@hawiyah/styles/<file>.css`. The source files are
  unchanged. `node scripts/build.mjs --only <package>` rebuilds one package.
- `pnpm check:packages` checks that the packed `styles.css` contains no
  `@import`, defines `--hw-color-primary`, contains `.hw-button`, leaves the
  reset out and references only files that are in the tarball.
- 28 icons, each an unchanged Hugeicons Stroke Rounded file from the pinned
  commit with its SHA-256 and upstream URL: `book-open-01`, `briefcase-01`,
  `building-03`, `certificate-01`, `clock-01`, `code`, `copy-01`,
  `download-01`, `file-01`, `folder-01`, `github`, `globe-02`, `grid-view`,
  `layers-01`, `left-to-right-list-bullet`, `location-01`, `message-01`,
  `moon-02`, `paint-board`, `play`, `reload`, `right-to-left-list-bullet`,
  `shield-01`, `source-code`, `sparkles`, `sun-03`, `translate` and
  `upload-01`. The pinned commit has no dedicated text-direction icon, so the
  two list-bullet icons stand for left-to-right and right-to-left text.
  `calendar-03`, `view` and `view-off-slash` now have `data-icon` rules too,
  and `arrow-up-right-01` mirrors with `data-directional="true"`, as its
  provenance already declared.
- A `progress` without a value shows a segment moving along the inline axis,
  with static stripes under reduced motion; it looked the same as 0% before.
- In dark mode, progress and meter tracks and skeletons are visible on
  surfaces. The DGA dark palette gives surface and surface-muted one value, so
  they had disappeared; light mode is unchanged.
- Forced colours: the progress value is drawn in `Highlight`, carousel arrows
  keep their glyph, and a pressed icon button takes the selection colours.
- Segmented toggle groups: keyboard focus no longer gives an unpressed button
  in multiple mode the pressed colours. Outline groups keep 4.5:1 label
  contrast on hover and focus. At 576px and below a segment starts from the
  width of its label and may be narrower than the 76px desktop minimum, and
  four or more segments use 14px text with 4px inline padding, so a
  four-option group no longer wraps to a second row at 390px or 320px and a
  label that fits stays on one line.
- The upload-list remove action no longer turns green on hover or focus, where
  its glyph had 2.74:1 contrast.
- The file upload and dropzone native inputs shrink inside a narrow card
  instead of widening the page at 320px. The vanilla dropzone's
  `data-dragover` marker now shows the drag-over state.
- A calendar month button that contains icon markup (React and Angular) shows
  one chevron, not two. An empty-state icon wrapped in a decorative span
  (React and Vue) gets the icon tile.
- Field hints use 12px, the smallest step of the documented type scale,
  instead of the 10px of the NIC source.

### Copy button, side navigation, code and prose styles, opt-in fonts

The catalogue grows from 83 to 85 entries. Every text of the additions is an
input of the application, as described above; nothing here ships wording.

- **CopyButton** (React and Vue `CopyButton`, Angular `hw-copy-button`,
  vanilla `createCopyButton` and `data-hw="copy-button"`). It copies a value
  the page already shows and reports the outcome in a polite status beside the
  button. Required: `text`, `label`, `copiedMessage` and `failedMessage`;
  optional `display`, `variant`, `size`, `feedbackDuration` (3000 ms) and
  `disabled`; the result is `{status, text}` with `status` one of `copied`,
  `denied`, `unavailable`, `failed` or `empty`. The clipboard is written on
  activation only, through the asynchronous Clipboard API; it is never read
  and there is no `document.execCommand` fallback. A failure message is
  visible text and stays until the next activation.
- **SideNavigation** (React and Vue `SideNavigation`, Angular
  `hw-side-navigation` and `nav[hwSideNavigation]`, vanilla
  `createSideNavigation` and `data-hw="side-navigation"`). It renders the list
  of NavigationDrawer outside a drawer, from the same `items`, with the same
  markup and classes. Required: `items` and `label`; `sticky` makes it stick
  from 64rem and scroll in its own box, placed with
  `--hw-side-navigation-top` and `--hw-side-navigation-bottom-reserve`.
- **NavigationDrawer.** Items accept `expanded`. A group is open when it holds
  the current page or is marked `expanded`; before, every group started
  closed. The drawer also closes after a click that the application's router
  took. The decision to close is now taken in a timer after the click was
  dispatched: with the former microtask, a click that a listener on an
  ancestor prevented still closed the drawer when a person clicked. The
  vanilla controller gains `refresh()` and recomputes its groups each time the
  drawer is shown.
- **Core helpers.** `copyText`, `createCopyFeedback`, `copyFeedbackIcons` and
  `COPY_FEEDBACK_DURATION`; `bindLinkNavigation(root, {navigate, base?})` and
  `isLinkNavigationHandled`, with which an application's router takes over
  packaged links through one delegated listener that renders nothing;
  `getNavigationItemKind`, `getNavigationGroupEntries`,
  `isNavigationGroupOpen`, `getNavigationCurrentId` and
  `revealNavigationCurrent` with the `NavigationItem` type. CONTRACT.md
  records the rules under "Routed links", "Copying" and "Navigation lists".
- **Code styles.** `.hw-code-block` (with a header, a title, actions and a
  scrolling or wrapping listing), `.hw-code` and `.hw-kbd`, and ten syntax
  role classes, `hw-code-token-comment` to `hw-code-token-punctuation`. The
  tokens `--hw-color-code-surface`, `-text`, `-border` and one per role are
  aliases of existing Platforms Code colours; every role measures at least
  4.5:1 on the code surface in both themes and both modes. Code stays left to
  right in a right-to-left page, and each role span is its own bidirectional
  run, so two Arabic strings on one line keep their source order.
- **Prose.** `.hw-prose` on any container styles class-less content inside it
  (headings, paragraphs, lists, quotations, tables, figures, code) and leaves
  an element with a class to its component. `.hw-type` accepts
  `data-tone="muted"` or `"subtle"`. See docs/code-and-prose.md.
- **Opt-in fonts.** `@hawiyah/styles/fonts.css` declares IBM Plex Sans Arabic
  400, 500, 600 and 700 and IBM Plex Mono 400 with `font-display: swap`.
  `styles.css` never imports it and still fetches no text font. The nine WOFF2
  files are IBM's published files, unchanged, 366,128 bytes together, with
  the SIL Open Font License text and a provenance record beside them. They
  take the packed `@hawiyah/styles` tarball from 275,524 to 647,257 bytes (154
  to 166 files). See docs/fonts.md.
- **ToggleGroup** accepts `labelHidden`, which hides the legend visually and
  keeps it as the accessible name.
- **PortalHeader.** Vue and Angular accept the notice above the brand row that
  React already had. The actions container is `hw-portal-header-actions` in
  every adapter; the stylesheet keeps the earlier `hw-portal-actions` for one
  release. Actions shrink and may wrap at 320px. The header is not sticky.
- **ContentNavigation** keeps one current item while a scroll that it started
  is in progress, instead of stepping through the sections the scroll passes.
- **Fixes.** The current row of NavigationDrawer and SideNavigation keeps the
  text colour and shows the primary colour in its marker: `primary-text` on
  `surface-muted` measured 4.32:1 in the default light theme. The Vue
  CopyButton no longer writes an empty `style` attribute in server markup.
  Vue `SideNavigation` types the native attributes it forwards.
- **Package check.** `pnpm check:packages` verifies the new exports of the
  five packages, renders CopyButton and SideNavigation on the server in the
  clean consumer, resolves `@hawiyah/styles/fonts.css` and every file it
  names, and fails when `styles.css` declares a font other than the riyal face
  or loads the opt-in fonts. The tree-shaking budgets are unchanged: React
  Button measures 382 bytes gzip of 4,096 and vanilla Tabs 4,474 of 6,144.

#### Breaking: Angular layout primitives render on the host element

`hw-container`, `hw-stack`, `hw-inline`, `hw-grid`, `hw-columns`, `hw-sidebar`,
`hw-center`, `hw-aspect-ratio`, `hw-section` and `hw-app-shell` now carry their
`hw-` class and the layout custom properties on the host element, as
`hw-spacer` did, and render the projected content alone. `class`, `id`,
`aria-*` and `data-*` written on the element therefore take effect on the
layout box. The same box is available on a native element through the
attribute selectors `hwContainer`, `hwStack`, `hwInline`, `hwGrid`,
`hwColumns`, `hwCenter`, `hwAspectRatio` and `hwSection`. `<hw-inline wrap>`
now means `wrap` is true. React, Vue and vanilla are unchanged.

Migration:

- A selector such as `hw-stack > .hw-stack` no longer matches: select
  `.hw-stack`, which is the host. A rule that styled the host as an inline
  wrapper now styles the box.
- `hw-section` no longer renders a `section` element. With `label` the host
  has `role="region"` and `aria-label`; write `<section hwSection label="…">`
  where a `section` element is wanted. An `aria-label` or `role` that the
  application writes or binds on the element is kept, and `label` takes its
  place only while it is set.
- `hw-sidebar` no longer wraps its two panes in `aside` and `div`: the element
  marked `hwSidebar` and one content element are the two children of the host,
  so use the element that fits, for example `<aside hwSidebar>`.
- `hw-app-shell` renders `div.hw-app-shell-header` and
  `div.hw-app-shell-footer`, as React and Vue do, where it rendered `header`
  and `footer`. Project a `header` and a `footer` element to keep the banner
  and contentinfo landmarks. The skip link is a child of the host.
- `@hawiyah/styles` makes `hw-container`, `hw-section`, `hw-aspect-ratio`,
  `hw-page-header` and `hw-alert` blocks and `hw-card` and `hw-service-card`
  grids, with zero specificity.
- The public method `HwNavigationDrawerComponent.groupEntries(item)` is
  removed; core `getNavigationGroupEntries(item)` returns the same entries.

## 0.2.1 — 2026-11-10

### Icons follow the DGA Platforms Code icon library

Every interface icon now comes from Hugeicons Stroke Rounded at the pinned
commit already recorded in `packages/styles/src/assets/icons/provenance.json`,
the set used by the DGA Platforms Code icon library. Files are shipped
unchanged and colored through CSS masks; the two native select arrows keep the
upstream geometry with a fixed text color, as recorded under `derived`.

- Close and remove buttons in every adapter render a `cancel-01` icon element
  instead of a `×` character. Tree toggles use `add-01` / `minus-sign`,
  calendar navigation uses `arrow-left-01` / `arrow-right-01` (mirrored in
  RTL), sortable table headers use `arrow-up-02`, `arrow-down-02` and
  `arrow-data-transfer-vertical`, and external footer links use
  `link-square-02`.
- Stylesheet glyphs became icon masks: accordion and collapsible indicators,
  checkbox ticks, the date-picker information trigger, carousel arrows, table
  sort indicators, external links, pagination arrows and notification icons.
  Completed and error stepper markers are now solid circles with the DGA tick
  or exclamation cut out.
- Where a component's CSS already draws a close icon, it is skipped when the
  button contains its own `.hw-icon`, so markup written for 0.2.0 still shows
  exactly one icon.
- The rating keeps its star glyph: the DGA reference CSS draws stars as a glyph
  with a fractional fill, which the outline-only icon set cannot reproduce.

### Fixes

- The official-site verification toggle uses the DGA link color
  (`--hw-color-link`), raising its contrast on the muted banner from 4.31:1 to
  6.0:1 in light mode.
- Private custom properties that kept the old prefix (`--_nq-*`) are renamed
  `--_hw-*`.
- Guide tab titles use the page name. The overview and layout studio titles were
  built from their two-line headings and ran words together.
- The guide search shortcut hint stays at the inline end of the field in Arabic.

## 0.2.0 — 2026-11-09

First npm release of `@hawiyah/tokens`, `@hawiyah/styles`, `@hawiyah/core`,
`@hawiyah/vanilla`, `@hawiyah/react`, `@hawiyah/vue`, and `@hawiyah/angular`.

- Packages install from npm: `npm install @hawiyah/styles @hawiyah/<adapter>`.
- Internal `@hawiyah/*` dependencies are pinned to the exact matching version.
- `pnpm release:packages` builds, verifies, and publishes the checked tarballs;
  source manifests stay `private: true`. Pushing a `v*` tag publishes through
  GitHub Actions with npm provenance.
- The guide's install commands and downloaded example projects use the
  published packages instead of local tarballs.

### Renamed from Nasaq to Hawiyah

The project was developed as Nasaq (نسق) through 0.1 and is renamed Hawiyah
(هوية) in this release; the `@nasaq` npm scope belongs to another publisher.
The source moved from `MohamedEmbarak/nasaq` to `MohamedEmbarak/hawiyah`.
Code written against the 0.1 source needs these renames:

| 0.1 (Nasaq) | 0.2 (Hawiyah) |
| --- | --- |
| `@nasaq/*` packages | `@hawiyah/*` |
| `.nq-*` classes | `.hw-*` |
| `--nq-*` custom properties | `--hw-*` |
| `data-nq`, `data-nq-*` attributes | `data-hw`, `data-hw-*` |
| `nq:change` and other `nq:` events | `hw:change`, `hw:` |
| Angular `Nq*Component`, `Nq*Directive`, `nq-*` selectors, `nq*` directive attributes | `Hw*`, `hw-*`, `hw*` |
| Theme `nasaq` (Woven Rhythm palette) | Theme `hawiyah` (Signature palette) |
| `nasaq-*` brand assets and loaders | `hawiyah-*` |

The logo is now the Arabic word هوية in outlined Aref Ruqaa Bold, colored with
DGA Platforms Code variables, and the handwriting loader writes the new word.
Hawiyah is described as a UI component library built to comply with the DGA
Platforms Code; compliance evidence and open items remain documented in the
alignment and validation records.
