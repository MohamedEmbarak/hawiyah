# Changelog

All seven `@hawiyah/*` packages share one version. Versions below 1.0 may change
APIs in a minor release; read the notes before upgrading.

## 0.3.0 — 2026-11-18

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
  `hw-toggle-group` and `hw-tree-view` warn without `label` unless an
  `aria-label` or `aria-labelledby` names them (see "Parity, accessibility and
  behaviour fixes" below). A Tabs list without `label`, `aria-label` or
  `aria-labelledby` warns in React and Vue as it does in Angular. Vue `Feedback`
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
  the vanilla RangeSlider no longer formats its output and takes the text from
  `getRangeLabel` instead. Without it the component warns and leaves out what Intl would
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
| Alert | Angular `'Dismiss'` | `closeLabel` | when a dismiss handler is bound (React `onDismiss`, Vue `@dismiss`, Angular `(dismissed)`) |
| AppShell | `'انتقل إلى المحتوى'` | `skipLabel` | always |
| AvatarGroup | Angular `'People'` | `label` | always |
| AvatarGroup | `` `${count} more people` ``; Vue `remainingLabel`, Angular `overflowLabel` | `getOverflowLabel(count)` | always |
| Breadcrumb | `'مسار التنقل'` | `label` | always |
| Calendar | `'ar-SA'` (Angular), the document language (vanilla), a default (React, Vue) | `locale` | always |
| Calendar | `'التقويم'` / `'Calendar'` | `label` | always |
| Calendar | `'الشهر السابق'` / `'Previous month'` | `previousLabel` | always |
| Calendar | `'الشهر التالي'` / `'Next month'` | `nextLabel` | always |
| Calendar | `'التواريخ الهجرية المدعومة'` / `'Supported Hijri dates'` | `rangeLabel` | when `calendar` is `islamic-umalqura`; always in vanilla |
| Calendar (vanilla) | `'نظام التقويم'` / `'Calendar system'`; `'ميلادي'` / `'Gregorian'`; `'هجري · أم القرى'` / `'Hijri · Umm al-Qura'` | none: the standalone Calendar renders no Gregorian / Hijri switch; the three texts belong to DatePicker | — |
| Calendar | the Umm al-Qura range sentence (vanilla, Vue); nothing (React, Angular) | `unsupportedMessage` | when `calendar` is `islamic-umalqura` |
| Calendar | Intl day name (Angular: a day name joined with a comma) | `getDayLabel(value)` | optional |
| Calendar (Angular) | module counter | `rangeTooltipId` | optional |
| Carousel | `'الشريحة السابقة'` | `previousLabel` | always |
| Carousel | `'الشريحة التالية'` | `nextLabel` | always |
| Carousel | `'اختيار الشريحة'` | `indicatorsLabel` | when indicators are shown |
| Carousel | `'n من t'`; Vue `slideMessage`, Angular `slideLabel`; Vue slide `label` | `getSlideLabel(position, total)` | always |
| Carousel | `'لا توجد شرائح'` / `'No slides'` | `emptyLabel` | always |
| Carousel | `'عرض شرائح'` / `'carousel'` | `carouselDescription` | optional |
| Carousel | `'شريحة'` / `'slide'` | `slideDescription` | optional |
| Chip | `'Remove'` | `removeLabel` | when a remove handler is bound |
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
| DatePicker | `'هذا التاريخ غير متاح.'` / `'This date is unavailable.'` | `unavailableMessage` | when `isDateDisabled` is given |
| DatePicker | `'YYYY-MM-DD'` | `placeholder` | optional |
| Dialog, Drawer | `'Close'`; Angular `'Close dialog'` | `closeLabel` | always |
| Feedback | `'Was this page helpful?'` | `label` | always |
| Feedback | `'Yes'`; Angular `positiveLabel` | `yesLabel` | always |
| Feedback | `'No'`; Angular `negativeLabel` | `noLabel` | always |
| Feedback | `'Tell us more (optional)'` | `commentLabel` | always |
| Feedback | `'Send feedback'` | `submitLabel` | always |
| Feedback | `'Thank you for your feedback.'`; Vue `thanks`, Angular `thanksMessage` | `successMessage` | always |
| FileDropzone | `dropLabel` used as the input name; Angular optional `label` | `label` (or `aria-label`, `aria-labelledby`, a parent Field) | always |
| FileDropzone | `'Drop files here or choose files'`; Vue `'Choose files or drop them here'`; Angular `instruction` | `dropLabel` | always |
| FileDropzone | `` `${count} files selected` ``; Angular `selectedMessage`; vanilla file names joined with `'، '` | `getSelectedMessage(files)` | optional; the status is rendered only when it is supplied |
| FileDropzone | `'Some files do not match the accepted file types.'` | `getRejectedMessage(rejected)` | when `accept` or `maxSize` is set |
| FileDropzone (vanilla) | `'Use the file chooser to attach documents.'` / `'استخدم اختيار الملفات لإرفاق المستندات.'` | `unsupportedDropMessage` | while the status element exists |
| FileUploadList | core `fileUploadLabels` (`'جاهز للرفع'`, `'جارٍ الرفع'`, `'اكتمل الرفع'`, `'تعذر الرفع'`, `'إزالة الملف'`) | `labels: FileUploadLabels` with `getProgressLabel(name)` and `getRemoveLabel(name)` | always |
| Menu, Popover | Angular `'Open'`; Vue Menu printed `label` on its trigger | `triggerLabel` | where the adapter renders the trigger (Vue, Angular) |
| Menu, Popover (Angular) | `id` | `panelId` | optional |
| MobileTopBar | `'رجوع'` | `backLabel` | when a back address or action is given |
| MultiSelect | `'Search options'` | `searchLabel` | always |
| MultiSelect | `'No options found'`; Angular `'No options'` | `emptyMessage` | always |
| MultiSelect | `'Choose at least one option.'`; Angular `validationMessage` | `requiredMessage` | when `required` is set |
| MultiSelect | `` `${count} options` `` / `` `${count} خيارات` `` (vanilla); nothing (React, Vue, Angular) | `getResultsMessage(count)` | always |
| MultiSelect | `` `${count} selected` ``; Angular `selectedMessage` | `getSelectedMessage(count)` | optional; the selected-count line is rendered only when it is supplied |
| NavigationDrawer | `'التنقل الرئيسي'` | `navigationLabel` | always |
| NavigationDrawer | `'إغلاق القائمة'` | `closeLabel` | always |
| NavigationDrawer (Angular) | not settable | `titleId` | optional |
| NotificationList | `'Notifications'` | `label` | always |
| NotificationList | `'No notifications'` | `emptyMessage` | always |
| NotificationList | `'Unread'` | `unreadLabel` | always |
| NotificationList | `'Mark as read'`; Vue `readLabel` | `getMarkReadLabel(item)` | when a read handler is bound |
| NotificationList | `'Dismiss'`; Vue and Angular `dismissLabel` | `getDismissLabel(item)` | when a dismiss handler is bound |
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
| RangeSlider | a built-in `lower – upper` text (vanilla in the document language, Angular) or one output per thumb (React) | `getRangeLabel(lower, upper)` (vanilla: also `data-hw-range-label="… {lower} … {upper}"`) | optional; the range output is rendered only with it (vanilla: required when a `[data-hw-range-output]` element exists) |
| Rating | `'n من t'`; Vue `optionLabel`, Angular `ratingLabel` | `getRatingLabel(value, max)` | always |
| RatingDisplay | `label` joined with `'n من t'`; Vue and Angular `valueLabel` | `getValueLabel(value, max)`; `label` removed | always |
| SearchField | none; the field could be left unnamed without a warning in Vue and Angular | `label` (or `aria-label`, `aria-labelledby`; a parent Field) | always |
| SearchField | `'مسح البحث'` / `'Clear search'` | `clearLabel` | always (vanilla: unless the clear button has an `aria-label` or text) |
| SearchField | `'بحث'` | `searchLabel` | when the search button is shown |
| SearchField | `` `${count} اقتراحات متاحة` ``; `resultsMessage` | `getResultsMessage(count)` | when suggestions are given |
| SecondaryNav | `'التنقل الثانوي'` | `label` | always |
| Select | Angular `'اختر خيارًا'` | `placeholder` | optional |
| ServiceCard | `'View service'`; Vue `'Start service'` | `actionLabel` | when the card renders its own action link |
| ServiceDetails | `'Requirements'` | `requirementsLabel` | when requirements are given |
| SiteVerification | core `getSiteVerificationLabels(locale)` and the `locale` prop | `label`, `detailsLabel`, `domainLabel`, `domainDescription`, `httpsLabel`, `httpsDescription` | always |
| SiteVerification | as above | `registrationLabel`, `externalLabel` | when `registrationHref` is set (`externalLabel` when the link opens a new window) |
| Spinner | `'Loading'` | `label` | always, unless the spinner is decorative |
| Stat (Vue) | `locale` and number formatting | removed; pass the formatted value | — |
| Stepper | `'التقدم'` | `label` | always |
| Stepper | none: complete and upcoming steps had no text equivalent | `completeLabel`, `upcomingLabel` | always |
| Table | `'لا توجد سجلات'` | `emptyMessage` | when `columns` is given |
| Tabs | none | `label` (or `aria-label`, `aria-labelledby`) | always; a missing name now warns in React and Vue too |
| Tabs | `'المزيد من التبويبات'` / `'More tabs'` | `overflowLabel` | when overflow uses a menu |
| TagInput | `` `Remove ${tag}` ``; Vue and Angular `removeLabel` | `getRemoveLabel(tag)` | always |
| TagInput | `'Add at least one tag.'`; Angular `validationMessage` | `requiredMessage` | when `required` is set |
| TagInput (Angular) | `'Add'` | removed with the Add button; Enter or comma commits | — |
| Timeline | `'Timeline'` | `label` | always |
| ToastRegion | `'الإشعارات'` / `'Notifications'` | `label` | always |
| ToastRegion | `'إغلاق الإشعار'`; Vue and Angular `dismissLabel` | `getDismissLabel(message)` | when a message can be dismissed |
| ToggleGroup, TreeView | optional `label` (Angular) | `label` (or `aria-label`, `aria-labelledby`) | always |
| Tooltip (Angular) | `id` | `tooltipId` | optional |
| TreeView | `'Expand ' + label`; Vue `expandLabel`; a hidden glyph (Angular); an authored `aria-label` (vanilla) | `getExpandLabel(node)` (vanilla: also `data-hw-expand-label="… {label}"`) | always |
| TreeView | `'Collapse ' + label`; Vue `collapseLabel`; a hidden glyph (Angular); an authored `aria-label` (vanilla) | `getCollapseLabel(node)` (vanilla: also `data-hw-collapse-label="… {label}"`) | always |

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
  instead of widening the page at 320px. The vanilla dropzone now shows the
  drag-over state (marked `data-state="dragging"` in every adapter, see
  below).
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
  markup and classes. Required: `items` and a name (`label`, `aria-label` or
  `aria-labelledby`); `sticky` makes it stick
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

### Parity, accessibility and behaviour fixes

This part closes the findings that remained open from the audit of 0.2.1 and
from the later reviews. Where the adapters differed, one rule now applies in
vanilla, React, Vue and Angular; the rules are recorded in CONTRACT.md and in
each adapter README. Every rename and removal is made outright, without a
deprecated alias; the table "Breaking: renamed and removed" below lists each
one with its migration, and the adapter READMEs repeat the rows of their
adapter.

#### The same in the four adapters

- **Native form reset.** A `reset` of the surrounding form that is not
  default-prevented returns every control to its reset target, shows it,
  submits it and reports it once through the ordinary value notification, and
  only when the value changed (arrays compared by content). The control acts
  after the browser has applied the reset: in the microtask that follows the
  event for a scripted reset, before the next paint for a reset button. The
  reset target is `defaultValue` (React, Vue), the value after the first
  inputs (Angular without Angular Forms; with Angular Forms the model keeps
  ownership), or the authored default (vanilla); without one it is the empty
  value of the control (`''`, `[]`, `false`, `null`, the slider midpoint). A
  controlled React control shows and submits its prop again when the
  application ignores the notification. Secondary state returns as well:
  password visibility, a date draft and visible month, a dropzone rejection,
  a combobox query. This reverses the earlier record that a native reset
  leaves application state alone (docs/input-review.md, docs/nic-segmented.md).
- **Angular attributes on wrapper hosts.** `aria-label`, `aria-labelledby`,
  `aria-describedby` and `aria-invalid` are inputs of those names on every
  Angular value control, on `hw-dialog`, `hw-drawer`, `hw-card`,
  `hw-icon-button` and on the named landmarks and groups; they land on the
  native control, fieldset, dialog or landmark and are removed from the host.
  `[attr.aria-*]` on a wrapper host is not supported. Badge, Avatar,
  ButtonGroup, Alert, Chip, Skeleton, Spinner, EmptyState, Stat, AvatarGroup
  and CookieConsent render on the host element, so `class`, `id` and ARIA
  attributes written there sit on the styled element. `@hawiyah/styles` gives
  the form-control and content hosts a block box; `hw-toggle-group` and
  `hw-content-navigation` generate no box (`display: contents`).
- **Names without a visible label.** A control, group or landmark is named by
  `label`, `aria-label` or `aria-labelledby`; `label` is required only when
  neither attribute is given (React types this as a union, Vue and Angular
  warn at render). This applies to ToggleGroup, Tabs, TreeView, Calendar,
  DatePicker, Carousel, Table, Progress, Meter, ButtonGroup, Menu, Popover and
  the Angular navigation components. A missing label renders no empty legend.
- **Fields.** Hint and error are `p.hw-hint` and `p.hw-error` in every adapter.
  A message the component produces (DatePicker validation, FileDropzone
  rejection) is the one `p.hw-error` of the field, after the hint, with
  `role="alert"`; an `error` from the application wins. Angular `hw-field`
  provides its id, label, descriptions, required and invalid state to a
  Hawiyah control placed in it (`HW_FIELD`), as React and Vue already did.
- **Required marker.** Every required control with a visible label shows one
  `span.hw-required-marker` as the last child of its `label.hw-label` or
  `legend.hw-label`, including composite controls and fieldset groups. The
  marker is never the only carrier of the requirement and takes no text input.
- **`aria-invalid`** is set from `error`, from an explicit `aria-invalid`, or
  after the control's `invalid` event (a failed submission) until its value is
  valid again or the form resets. It never depends on a missing message;
  Angular no longer sets it because `requiredMessage` is missing.
- **Controlled and observable state** has one name per state in every
  adapter: Combobox `open` and `query`, PasswordField `visible`, DataTable
  `sortKey` and `sortDirection`, TreeView `expanded`, Menu and Popover
  `open`, PortalHeader `open`, CookieConsent `open`, Feedback `value`. React
  has `x`, `defaultX` and `onXChange`; Vue `v-model:x`; Angular `[(x)]`;
  vanilla the option, `onXChange`, `hw:change` and a controller method.
- **Read-only** keeps a control in the tab order, named, submitted and showing
  its value. Checkboxes, toggle buttons and file inputs carry
  `aria-disabled="true"` instead of `disabled`; this now holds for MultiSelect
  rows and FileDropzone, which React now also offers. Vue Checkbox, Radio and
  Switch spell the prop `readonly`, as every other Vue control.
- **Values are shown and formatted by the application.** Slider shows its
  value only with `showValue` and formats it only through `formatValue`;
  `aria-valuetext` is written only with `formatValue`. RangeSlider renders the
  documented vanilla structure (two `label.hw-label` wrapping their input) and
  one output only with `getRangeLabel(lower, upper)`; no adapter writes a
  separator. Timeline and NotificationList items show a date only from
  `dateLabel`, with `dateTime` as the machine-readable value. The vanilla
  DatePicker announces the full date with the weekday, as the frameworks do.
- **One item shape per component**: Menu and Accordion items are keyed by
  `value`; TreeView takes `items` and `expanded`; Stepper takes `items` with a
  `value` each; Table and DataTable columns are `{key, label, cell?,
  sortable?, rowHeader?}`; ServiceCard and ServiceDetails take
  `metadata: {term, description}[]`; Timeline items are `{id, title,
  description, dateTime, dateLabel, status}`; NotificationList items are
  `{id, title, description, href, dateTime, dateLabel, read}`; toast messages
  are `{id, title?, message, tone?, urgent?, dismissible?}`.
- **Rich content where text was the only option**: Angular `titleTemplate` and
  `contentTemplate` on `hw-accordion`, a `cell` template and `rowKey` on
  `hw-table` and `hw-data-table`, `[hwStatValue]` and `[hwStatTrend]` on
  `hw-stat`, `[hwEmptyIcon]` and `[hwEmptyAction]` on `hw-empty-state`,
  `[hwServiceAction]` on the service components; Vue `#title` and `#content`
  scoped slots on Accordion, `cell-<key>` slots on the tables and `#value` and
  `#trend` on Stat.
- **One DOM per component.** The frameworks render the documented vanilla
  markup for Combobox, MultiSelect, TagInput, FileDropzone, RangeSlider,
  ToggleGroup, Menu, Popover, TreeView, Stepper, Stat, Timeline,
  NotificationList, Feedback, CookieConsent, ServiceCard and ServiceDetails;
  the changes are listed in the table below.

#### Accessibility and behaviour fixes

- **Forms.** Angular value controls gain `(focused)`, `(blurred)` and `form`;
  `hw-select` projects native `option` and `optgroup` children; `hw-checkbox`
  and `hw-switch` take `submitValue` and projected label content; `hw-textarea`
  sets no `rows` by default. Vue RangeSlider submits both thumbs under `name`
  and no longer leaves `name` and `form` on the fieldset. A multiple
  ToggleGroup's empty value is `[]`; the pressed buttons carry
  `class="hw-button"`, `data-variant="secondary"` and `data-size="md"` in
  every adapter.
- **Combobox.** In Angular the listbox opens below the input again instead of
  below the hint and error: `div.hw-combobox` wraps only the input, the
  hidden input, the listbox and the status. Angular `(valueChange)` fires only
  when the value changed, and a value written by the application no longer
  closes the list. Focus on the input opens the popup in the four adapters
  (the vanilla controller opened it on click, typing and arrows only). An
  option chosen with the pointer while the input has no focus leaves the list
  closed: the focus the component gives the input after a selection does not
  reopen it (vanilla, Vue and Angular reopened it, and React also lost the
  selected text).
- **MultiSelect** has a visible filter label and announces the number of
  matching options after the reader filters, through the new required
  `getResultsMessage(count)` and a polite status present from the first
  render.
- **TagInput.** After a remove button is activated, focus moves to the next
  remove button, else the previous one, else the text input. Angular no
  longer renders an Add button: Enter or comma commits, as in the other
  adapters.
- **PinInput.** A pasted or autofilled code such as `123 456` is normalised
  before its length is applied; the input carries no `maxlength`, and an
  incomplete code is `aria-invalid` after blur.
- **SearchField.** The Angular search button is off by default, as in React
  and Vue.
- **FileDropzone.** A batch replaces the selection; a batch with any rejected
  file leaves the dropzone empty and reports every rejected file, also when
  several files are dropped on a single-file dropzone. `maxSize` (bytes)
  works in the four adapters. The rejection is rendered as
  `getRejectedMessage(rejected)` with `role="alert"`. The zone cancels
  `dragover` for file drags only, with `dropEffect` `'none'` while it is
  unavailable. No adapter renders a file list: compose FileUploadList.
  `data-state="dragging"` marks a drag. A rejected batch that replaces held
  files reports the rejection first and the emptied selection second in the
  four adapters (React and Vue reported the empty selection first).
- **Calendar and DatePicker.** Angular gains `isDateDisabled`,
  `unavailableMessage` and `getDayLabel`; React gains `getDayLabel` on
  DatePicker. A typed date that breaks several constraints gets the same
  message in every adapter (core `getDateViolation`: malformed, unsupported,
  out of range, unavailable). Opening the picker moves focus to the selected
  day, else today; an empty calendar's tab stop is today when it is shown and
  available. Each opening starts again from the selected day: a typed date is
  the focused day (vanilla focused today, React the day that last had focus),
  the focus memory of the last opening is dropped, and the month shown comes
  only from a value inside `min` and `max`, else it is today's month, held
  inside `min` and `max` (core `getCalendarMonth` no longer anchors on a value
  outside the bounds, and anchors on `max` when today is later and on `min`
  when today is earlier). A picker whose window does not contain today, such
  as a date of birth with `max` in the past, therefore opens on a month with
  available days and a tab stop. The previous and next month buttons follow
  one rule in the four adapters, from core (`hasPrevious`, `hasNext`): a
  button is disabled only when the whole neighbouring month is outside `min`
  and `max` (Vue and vanilla disabled both buttons on a month without an
  available day). In vanilla each opening starts from the selection, else the
  held today, so `controller.setMonth()` before `show()` does not choose the
  month an opening shows. A value changed while the React picker is open
  moves the month, as in the other adapters; switching the calendar system in
  vanilla keeps the month for a value outside `min` and `max`; the Angular
  Calendar no longer follows a bound or written value beyond `max`, and a
  cleared value no longer keeps the tab stop on the former day. A standalone Calendar announces a value outside the supported
  Umm al-Qura range through a status element and `unsupportedMessage` in
  every adapter. The Gregorian / Hijri switch belongs to DatePicker; the
  vanilla standalone Calendar no longer renders it.
- **Dialog and Drawer.** An empty `.hw-dialog-footer` is hidden; Angular
  `hw-drawer` now passes its description to the native dialog.
- **Tooltip (Angular).** The host is the positioned wrapper and the
  application's element marked `hwTooltipTrigger` is described, so a tooltip
  on a button no longer adds a second tab stop.
- **Collapsible (Angular)** takes `disabled`; the stylesheet shows the
  disabled state.
- **Carousel and Pagination.** At the first or last slide or page the arrow
  that was just used is `aria-disabled="true"`, keeps focus and ignores
  activation; it no longer drops focus to the document body.
- **Table and DataTable (Angular).** The scroll region is named by the caption
  through `aria-labelledby` and exists as a region only with a caption.
- **PageHeader** takes `level` (1 to 6, default 1) in React and Angular, as in
  Vue, so an embedded page header no longer creates a second `h1`.
- **Breadcrumb.** The current item is one `span[aria-current="page"]`, never a
  link; Angular gains the `current` field.
- **Stepper.** Complete and upcoming steps carry a visually hidden state text
  from the required `completeLabel` and `upcomingLabel`. The Angular
  description is a sibling `p.hw-hint`.
- **Menu and TreeView** move focus by type-ahead in the four adapters (core
  `createTypeahead`: 500 ms buffer, a repeated letter cycles, visible nodes
  only). Menu and Popover close when focus moves outside them, without moving
  focus; the React Popover handles Escape on its own root only. An Escape
  that a control inside the panel or the application has used for itself
  (default-prevented) leaves the popover or menu open in the four adapters;
  vanilla and Angular closed the popover, and React, Vue and Angular closed
  the menu. In Angular one Escape closes one level of nested popovers, as in
  the other adapters (it closed both). The vanilla Menu reports the action
  before the closing, as the frameworks do. In vanilla and Angular the
  trigger takes focus before the action runs, so a dialog that the action
  opens returns focus to the trigger when it closes; an action that moves
  focus elsewhere keeps it there. The React Menu reports the closing once
  after an action that moves focus (it reported it twice).
- **TreeView.** The expand and collapse control is `button.hw-tree-toggle` in
  every adapter, outside the tab order and named by `getExpandLabel(node)` and
  `getCollapseLabel(node)`; Angular hid it from assistive technology. Nested
  levels are indented through `--hw-tree-depth` and `--hw-tree-indent`. The
  tree is one flat list of `li[role="treeitem"]` with `aria-level` in the four
  adapters: the authored vanilla markup no longer nests `ul[role="group"]`
  inside a tree item, because a labelled item that contains its child items
  shows text that is not in its name (WCAG 2.5.3, axe
  `label-content-name-mismatch`). `createTreeView` reads the authored
  `aria-level`, hides the rows of a collapsed branch and throws for a nested
  tree item; the `.hw-tree-view [role='group']` rules are gone. It warns once
  in development when an item has a toggle or `aria-expanded` and no child
  item after it, which usually means a child lost its `aria-level`. The
  controller sets the indentation (`--hw-tree-depth`) and owns the `hidden`
  attribute of the rows; `destroy()` restores the authored markup.
- **PortalHeader.** Below 48rem one press on another branch heading opens it
  and closes the open one; the click is no longer lost. A brand without a home
  link is `div.hw-portal-brand`, with `role="img"` exactly when `brandLabel`
  is given. The current top-level link is semibold in the four adapters
  through `.hw-portal-header nav a[aria-current='page']` (Vue and the vanilla
  markup showed it in regular weight).
- **ServiceCard and ServiceDetails** render the card anatomy of React in
  every adapter (header with category and `h3`, body, footer with the
  action); the packaged action is `a.hw-link` and exists only with `href`.
  ServiceDetails is an `article` with an optional requirements section and
  its action in a footer.
- **Alert.** Without an explicit role, a `danger` alert is `role="alert"` and
  every other tone `role="status"`, also in Angular. Every adapter offers the
  same dismiss action, rendered while a dismiss handler is bound; the alert
  never removes itself, and the application moves focus after removing it.
- **Progress in dark mode.** The filled part is `primary-text`, the lighter
  primary, so that it has 3:1 against its track (it had 1.59:1 in the DGA
  dark theme); light mode keeps `primary`.
- **ToggleGroup (Vue).** A bound single value whose notification the
  application ignores stays the checked and submitted option, as in React.
- **Select (Vue).** A hydrated select shows a value held by a slotted
  `option`; before, the first option stayed selected until the next change.
- **IconButton.** A missing `label` is reported through the text contract in
  React and Vue as in Angular; `aria-label` or `aria-labelledby` names the
  button instead. In Vue `label` is optional in the declaration, so a button
  named by `aria-label` or `aria-labelledby` gives no Vue warning.
- **Stat (Vue).** `tone` is `neutral | success | danger` and `trendTone` is
  `success | danger`, the values the stylesheet and the other adapters have.
- **Tabs (vanilla).** `createTabs` finds each panel inside its root, so a root
  that is enhanced before it is inserted into the document works.
- **Progress, Meter, Skeleton, Spinner.** Progress and Meter are one native
  element named through `aria-label`, with raw values; Meter defaults to min
  0, max 100, value 0 and no regions. Skeleton takes `variant` (`text`,
  `circle`) and is sized with `style` or `class`. Spinner is one element with
  `role="status"` that holds its hidden name. The documented loading pattern
  is a `role="status"` container with a visually hidden text around
  `aria-hidden` skeletons.
- **Chip.** The remove control is a plain button, rendered while a remove
  handler is bound; removing a focused chip moves focus to the neighbouring
  chip's remove button (core `prepareRemovalFocus`).
- **NotificationList.** A visible `h2` names the region; unread items show a
  visible badge from `unreadLabel`, so the state does not depend on colour;
  the read and dismiss actions exist in every adapter and move focus to the
  same control of the next item, then the previous one, then the list.
- **Feedback** has one contract: a named group with two pressed-state
  buttons, then a comment field and a submit button once a choice exists, a
  value `{helpful, comment}` and a `feedback` action on submit. Nothing is
  sent anywhere.
- **CookieConsent** has one contract: the state `open`, the action
  `consent('accepted' | 'rejected')`, an optional preferences action, a
  region named by its heading, and the buttons Accept, Reject, Preferences in
  a button group. `variant="banner"` is a typed input in every framework.
- **Button and Link (Angular).** `button[hwButton]` defaults to
  `type="button"` and takes `loading` and `disabled` inputs. The link is the
  directive `a[hwLink]` on the application's own anchor, so `routerLink` and
  every native attribute apply to the real element. The Vue `external` link
  adds `noopener noreferrer` to an authored `rel` instead of replacing it.

#### Core and styles

- New in `@hawiyah/core`: `observeFormReset(control, onReset)` with the type
  `FormResetObserver`, and `sameValue(a, b)`; `createTypeahead(options?)` and
  `isTypeaheadKey(event)` with the types `Typeahead` and `TypeaheadOptions`;
  `evaluateFileSelection(files, rules?)`, `matchesFileAccept(file, accept)`
  and `isFileDrag(transfer)` with the types `FileSelectionRules`,
  `FileRejectionReason` and `FileSelectionResult`;
  `prepareRemovalFocus(container, control, options)` with
  `RemovalFocusOptions`; `getDateViolation(draft, options)` with
  `DateViolation` and `DateViolationOptions`; `normalizePinInput(raw, length,
  previous?, inputType?)`; `getPortalBranchSummary(target, scope)`;
  `warnInDevelopment(key, message)`, the once-per-key development warning
  that `requireText` uses; `hasPrevious` and `hasNext` on the result of
  `getCalendarMonth`; the types `FeedbackValue` and `ConsentChoice`. `observeFieldValue` and
  `observeReadonlyChoice` keep their signatures and read a reset through
  `observeFormReset`.
- New in `@hawiyah/styles`: `.hw-slider-value`, `.hw-alert-dismiss`,
  `button.hw-tree-toggle` with `--hw-tree-depth` and `--hw-tree-indent`, the
  read-only FileDropzone, the disabled Collapsible, MultiSelect read-only
  rows and status, `:empty` rules for dialog footers, service-details footers,
  stat trends and empty-state icons, the focus ring of an
  `aria-disabled` button, and `Highlight` for the pressed Feedback choice in
  forced colours. Removed hooks are listed in the table below.

#### Breaking: renamed and removed

Each row names the component, the adapter, the former name, markup or default,
and what replaces it; a search-and-replace form is given where one exists.
"Frameworks" means React, Vue and Angular. The names were checked against the
built type declarations of each package.

| Component | Adapter | Old | New |
|---|---|---|---|
| Every value control, `hw-field` | Angular | `describedBy` | `aria-describedby`: `[describedBy]="id"` -> `[aria-describedby]="id"` |
| Every value control | Angular | `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid` stayed on the host | on the native control or fieldset; `[attr.aria-label]` on a host -> `[aria-label]` |
| Every form control | Angular | a native reset without Angular Forms emptied the DOM and kept the value | the initial value returns and `(valueChange)` emits it when it changed; remove handlers that copied the model back |
| Every form control | Vue | `update:modelValue` on every reset | only for a control whose value the reset changed |
| Every form control | React | controlled controls ignored a native reset or showed the browser default | `onValueChange(target)` (`onFilesChange([])`) once when the target differs; the prop is shown again |
| Every form control | vanilla | RangeSlider, ToggleGroup, Rating and the composite controls reset silently | `hw:change` and the `on…Change` option fire once when the reset changed the state |
| Field and decorated controls | React | `div.hw-hint` / `div.hw-error`; `span.hw-hint` / `span.hw-error` (Checkbox, Radio, Switch) | `p.hw-hint` / `p.hw-error`; pass phrasing content |
| Field and decorated controls | Vue | `span.hw-hint` / `span.hw-error` | `p.hw-hint` / `p.hw-error` |
| Field | Angular | `controlId` and `label` required; a control inside repeated its own id and wiring | both optional; the control takes the field's id, label, descriptions and state |
| Labelled controls | Angular, Vue | no required marker on several controls and legends | `span.hw-required-marker`; remove asterisks written into `label` |
| Checkbox, Radio, Switch | Vue | `readOnly` (`:read-only`) | `readonly` |
| Checkbox, Switch, radio group | Angular | `label.hw-choice > input + span` | `label.hw-choice > input` + text: `.hw-choice > span` -> `.hw-choice` |
| Radio group | Angular | `hw-radio` / `HwRadioComponent` | `hw-radio-group` / `HwRadioGroupComponent` |
| Textarea | Angular | `rows` = 4 | no default; add `[rows]="4"` to keep the height |
| Slider | React | `showValue` = true; `aria-valuetext` always set | `showValue` = false; `aria-valuetext` only with `formatValue`; add `showValue` to keep the output |
| Slider | Angular | `<output>` always rendered | `output.hw-slider-value` only with `showValue` |
| Slider | Vue | `defaultValue` = 0 | no default: `(min + max) / 2`; add `:default-value="0"` to keep the start |
| RangeSlider | React, Vue | `defaultValue` = `[0, 100]` | `[min, max]`; pass `[0, 100]` where wanted |
| RangeSlider | React | `div.hw-field` per thumb with an output; `formatValue` = `String` | `fieldset.hw-field.hw-range-slider > label.hw-label` ×2, one output only with `getRangeLabel`: `.hw-range-slider > .hw-field` -> `.hw-range-slider > label` |
| RangeSlider | Angular | `label[for]` beside the input; output `lower – upper` always | `label.hw-label` wrapping each input; output only with `[getRangeLabel]` |
| RangeSlider | Vue | `name` and `form` fell onto the fieldset | both thumbs submitted under `name` |
| RangeSlider | vanilla | `[data-hw-range-output]` filled with `lower – upper`; `locale` required | `data-hw-range-label="{lower} – {upper}"` or `getRangeLabel`; `locale` optional |
| ToggleGroup | Vue | `defaultValue` = `''` in both modes | no default; `[]` in multiple mode |
| ToggleGroup | React | `label.hw-choice > input.hw-radio`; empty legend without `label` | `label > input[type=radio]`: `.hw-toggle-group .hw-choice` -> `.hw-toggle-group > label`, `.hw-toggle-group .hw-radio` -> `.hw-toggle-group input[type='radio']` |
| ToggleGroup | Vue | `name` and `form` on the fieldset; `data-selected` on the label | neither: `[data-selected='true']` -> `:has(input:checked)` |
| ToggleGroup | Angular | `options` optional; a span around each option; hidden inputs beside the fieldset | `options` required; text in the label; `hw-toggle-group > input[type=hidden]` -> `hw-toggle-group fieldset > input[type=hidden]`; the host has no box |
| ToggleGroup | Vue, Angular | `label` required | optional with `aria-label` or `aria-labelledby` |
| Combobox | React | `onInputChange` | `onQueryChange` |
| Combobox | Angular | `div.hw-field.hw-combobox`; list id `{controlId}-list`; `aria-haspopup`; `(valueChange)` per keystroke | `div.hw-field > div.hw-combobox`; `{controlId}-listbox`; no `aria-haspopup`; `(queryChange)` for the typed text |
| Combobox | vanilla | `hw:change` always carried `detail.value`; hint inside `[data-hw=combobox]` | also `{open}` and `{query}`: test `'value' in event.detail`; hint and error after `.hw-combobox` |
| Combobox, TagInput, MultiSelect | Angular | `unnamedConstraint` and `aria-invalid` while `requiredMessage` was missing | removed; `aria-invalid` from `error` or a failed submission |
| MultiSelect | frameworks | filter named by `aria-label` or a hidden label; read-only rows `disabled` | visible `label.hw-label` with `searchLabel`; rows enabled with `aria-disabled="true"`; new required `getResultsMessage(count)` |
| MultiSelect | React | `fieldset.hw-multi-select > div.hw-stack`; bare marker span | `fieldset.hw-field.hw-multi-select > div.hw-multi-select-options`: `.hw-multi-select .hw-stack` -> `.hw-multi-select-options` |
| MultiSelect | Vue | `p[role=status]` with `emptyMessage` after the options | `p.hw-hint` inside `div.hw-multi-select-options` |
| MultiSelect | Angular | `getSelectedMessage` required; option text in a span | optional, `p.hw-multi-select-selected` only with it; `label.hw-choice` with a text node |
| MultiSelect | vanilla | status written at creation, only with an authored `[data-hw-status]` | created when missing, written after filtering; `data-hw-results-message` required |
| TagInput | Angular | Add button and its required text input | removed: delete the attribute; Enter or comma commits |
| TagInput | Angular | `div.hw-field.hw-tag-input` with `div.hw-input-group` | `div.hw-field > label, div.hw-tag-input > ul, input; hint` |
| TagInput | React | `div.hw-field.hw-tag-input > div.hw-inline > span.hw-chip` with `button.hw-button` | `div.hw-tag-input > ul[role=list] > li.hw-chip` with a bare button: `.hw-inline > .hw-chip` -> `.hw-tag-input li.hw-chip` |
| TagInput | Vue | remove button `.hw-button`; hidden inputs after the text input | bare button in the chip; hidden input in its `li`: `.hw-tag-input .hw-button` -> `.hw-chip button` |
| TagInput | vanilla | `label.hw-field` inside `.hw-tag-input`, `div[data-hw-tags]` | `div.hw-field > label.hw-label, div.hw-tag-input > ul[data-hw-tags], input[data-hw-tag-input]` |
| PinInput | React, Vue, Angular | the rendered input had `maxlength="N"` | the rendered input has no `maxlength`; `pattern="[0-9]{N}"`: select it by class or `inputmode`, not by `[maxlength]` |
| PinInput | vanilla | the controller kept the authored `maxlength="N"` on the input | keep the authored `maxlength="N"` (or pass `options.length`): it remains the source of the length; the controller removes it while enhanced, restores it on `destroy()` and overwrites `pattern` |
| PasswordField | Angular | public field `revealed` | `[(visible)]` / `visible`, `(visibleChange)` |
| PasswordField | Angular | every value written by Angular Forms hid the password | only the toggle, the input and a native reset change visibility |
| PasswordField | React | a reset returned to `defaultVisible` | a reset hides the value and calls `onVisibleChange(false)` |
| SearchField | Angular | `showSearchButton` = true | false; add `showSearchButton` and `searchLabel` where the button is wanted |
| FileDropzone | Angular | a mixed batch kept the accepted files; `readOnly` rendered `disabled` | any rejected file empties the selection, `(rejected)` carries it; read-only stays focusable and submitted |
| FileDropzone | Vue | `@reject` received the whole batch; `aria-readonly` on the input | only the rejected files; `aria-disabled="true"` and `data-hw-readonly="true"` on the root |
| FileDropzone | React, vanilla | several files on a single dropzone kept the first | the batch is rejected (reason `count`) and reported |
| FileDropzone | React | `maxSize` ignored; the rejection replaced the application error | `maxSize` limits the size; the application error wins, the rejection is `p.hw-error[role=alert]` |
| FileDropzone | Vue, Angular | no rejection text | `getRejectedMessage(rejected)` required with `accept` or `maxSize`; remove the hand-written message |
| FileDropzone | frameworks | built-in file list (React, Angular); label, hint and error outside the zone (Vue); `data-dragging` | `div.hw-field.hw-file-dropzone` with label, instruction, input, status, content, hint and error; compose FileUploadList; `[data-dragging='true']` -> `[data-state='dragging']` |
| FileDropzone | vanilla | `data-dragover`; root `label.hw-file-dropzone`; rejection in `[data-hw-file-status]` | `data-state="dragging"`; root `div.hw-field.hw-file-dropzone` with `label[for]`; rejection in `[data-hw-error]` or a created `p.hw-error[role=alert]` |
| FileUpload | Angular | no marker; `accept=""` always; projected content dropped | shared label with marker; `accept` only when given; content after the input |
| Calendar | React, Angular | no `unsupportedMessage` | required with `calendar="islamic-umalqura"` |
| Calendar | vanilla | standalone switch with `data-hw-calendar-system-label`, `data-hw-gregorian-label`, `data-hw-hijri-label` | removed from the standalone Calendar; call `controller.setCalendar(system)` from your own control |
| Calendar | Vue, Angular, vanilla | tab stop of an empty calendar: first day of the month | today when shown and available |
| DatePicker | Vue | `p#{id}-validation-error` before the hint | `p#{id}-error.hw-error[role=alert]` after the hint: `#<id>-validation-error` -> `#<id>-error` |
| DatePicker | Angular | `p#{controlId}-date-error` before the hint; `describedBy`; `label` always required | `p#{controlId}-error[role=alert]` after the hint; `aria-describedby`; `label` optional with `aria-label` / `aria-labelledby` |
| DatePicker | React | outside min/max and outside the Umm al-Qura range showed `invalidMessage` | `unsupportedMessage` |
| DatePicker | vanilla | `div.hw-calendar-options` inside `.hw-calendar`; output showed a message or the long date | before the calendar in the dialog body: `.hw-calendar > .hw-calendar-options` -> `.hw-dialog-body > .hw-calendar-options`; output shows the full date; message in `[data-hw-error]` or a created `p.hw-error` |
| Dialog, Drawer | Angular | `describedBy` | `aria-describedby` |
| Tooltip | Angular | `span.hw-tooltip-anchor.hw-tooltip-trigger[tabindex=0]` inside the host | the host is the wrapper: `<hw-tooltip text="T">term</hw-tooltip>` -> `<hw-tooltip text="T"><span hwTooltipTrigger tabindex="0">term</span></hw-tooltip>` |
| Accordion | Angular | `HwAccordionItem.id`; `(toggled)` emits `{id, open}` | `value`; `{value, open}`: `$event.id` -> `$event.value` |
| Accordion | Vue | a slot per item value (`<template #faq-1>`) | scoped slots `#title` and `#content="{item, index}"` |
| Collapsible | React | `title` | `label` |
| Carousel, Pagination | all | arrow at a bound `disabled` | `aria-disabled="true"`: `[data-hw-next]:disabled` -> `[data-hw-next]:is(:disabled, [aria-disabled='true'])` |
| Table | React, Vue | `TableColumn.header` | `label`: `{header: 'Name'}` -> `{label: 'Name'}` |
| Table, DataTable | Vue | slot `cell:<key>` with `{row, index}` | `cell-<key>` with `{row, index, column}`: `#cell:name` -> `#cell-name` |
| Table, DataTable | Angular | wrapper `aria-label`; caption always rendered; text cells | `aria-labelledby` the caption id, only with a caption; `cell` template, `rowKey`; caption optional with `aria-label` / `aria-labelledby` |
| DataTable | React | `sort` / `defaultSort` / `onSortChange({key, direction})` | `sortKey`, `sortDirection`, `defaultSortKey`, `defaultSortDirection`, `onSortKeyChange`, `onSortDirectionChange` |
| DataTable | React | `DataTableColumn.render(value, row)`; `table.hw-table.hw-data-table` | `cell(row, index)`; `div.hw-table-wrap.hw-data-table > table`: `table.hw-data-table` -> `.hw-data-table > table` |
| DataTable | Angular | `(sortChange)` | `[(sortKey)]`, `[(sortDirection)]`, `(sortKeyChange)`, `(sortDirectionChange)` |
| DataTable | vanilla | `onSortChange`; `detail.key`, `detail.direction` | `onSortKeyChange`, `onSortDirectionChange`; `detail.sortKey`, `detail.sortDirection` |
| PageHeader | Vue | a fractional `level` gave an invalid tag | truncated and clamped to 1..6 |
| Breadcrumb | React, Vue | the current item with `href` was a link | `span[aria-current=page]`: style `[aria-current]` |
| Breadcrumb | Angular | the last item was always current | `HwBreadcrumbItem.current`; the last item by default |
| Stepper | all | no state text | required `completeLabel` and `upcomingLabel` (vanilla `data-hw-complete-label`, `data-hw-upcoming-label`); remove hand-written state suffixes |
| Stepper | Angular | `[steps]`; `current` a zero-based index; `small.hw-hint` in the label | `[items]` with `value`; `current` is a value, `[activeIndex]` an index; `p.hw-hint` after the label |
| Carousel, Calendar and navigation components | Angular | `label` required; `aria-label` stayed on the host | `label` optional with `aria-label` / `aria-labelledby`, forwarded to the named element |
| Menu | Vue | `@select`; `label` printed on the trigger | `@action`; `trigger-label` is the trigger text: `<Menu label="Actions">` -> `<Menu label="Actions" trigger-label="Actions">` |
| Menu | Vue | `ul[role=menu] > li[role=none] > button\|a` | `div.hw-menu-content[role=menu] > .hw-menu-item` |
| Menu | React | `ul.hw-menu-list > li[role=none]` | `div.hw-menu-content > .hw-menu-item`: `.hw-menu-list` -> `.hw-menu-content` |
| Menu | Angular | `HwMenuItem.id`; `div.hw-menu-panel`; primary trigger | `value`; `div.hw-menu-content`; `triggerVariant` default `'secondary'` (add `triggerVariant="primary"` for the old look) |
| Popover | Angular | primary trigger | `triggerVariant` default `'secondary'` |
| Menu | vanilla | `createMenu(root, {onSelect})` | `{onAction}` |
| Popover | React | `title` rendered as an `h3`; `section.hw-popover-panel` | `label` (accessible name, nothing printed); `div.hw-popover-panel[aria-label]`; write a heading in the content |
| Popover | Vue, styles | `div.hw-popover-content` | `div.hw-popover-panel`: `.hw-popover-content` -> `.hw-popover-panel` |
| Tabs | React, Vue | `aria-label` / `aria-labelledby` on `div.hw-tabs` | on the tablist: `.hw-tabs[aria-label]` -> `.hw-tab-list[aria-label]` |
| TreeView | Angular | `nodes`, `expandedIds`, `(expandedIdsChange)`; `span.hw-tree-toggle[aria-hidden]` | `items`, `expanded`, `(expandedChange)`; `button.hw-tree-toggle`; required `getExpandLabel`, `getCollapseLabel` |
| TreeView | React, Vue | toggle button without class; Vue `li[aria-label]` | `button.hw-tree-toggle`; `li[aria-labelledby]` |
| TreeView | vanilla | `expandedValues` (option, controller, `detail`); toggle with a fixed `aria-label` | `expanded`; `button.hw-tree-toggle` with `data-hw-expand-label` / `data-hw-collapse-label` on the root |
| TreeView | vanilla, styles | child items in `ul[role="group"]` inside the parent `li[role="treeitem"]`; `.hw-tree-view [role='group']` rules | one flat list, parent first: each child `li` follows its parent as a child of the root with `aria-level="2"` (3, …); no group element and no group rule |
| PortalHeader | React | `navigation`, `brandHref`; no home link by default; `div.hw-portal-header-main` | `links`, `homeHref` (default `'/'`, `""` for no link); brand, toggle, nav and actions are children of the header |
| PortalHeader | Angular | public field `menuOpen`; `a.hw-portal-brand` without `href` | `[(open)]`; `div.hw-portal-brand` |
| PortalHeader | Vue | `span.hw-portal-brand[role=group]` | `div.hw-portal-brand[role=img]` |
| AppShell | React | `div.hw-app-shell-body` | sidebar and main are children of `.hw-app-shell` |
| PortalLayout, SiteVerification | React | `footerLabel`, `externalLabel` optional in the types | required with `footerProps.links`; with `registrationHref` unless `registrationExternal={false}` |
| ServiceCard | Vue | `metadata: string[]`; `badge` | `metadata: {term, description}[]`; `category` |
| ServiceCard | Angular | `duration`, `fee`; `href` required; title link and a secondary button | `[metadata]`; `href` optional; `a.hw-link` action only with `href` (project `<a hwButton variant="secondary" hwServiceAction>` for a button) |
| ServiceDetails | Vue | `items`; `section`; `div.hw-service-details-action` | `metadata`; `article`; `footer` |
| ServiceDetails | Angular | `[details]`; `section` root; projected actions | `[metadata]`; `article`; `<button hwButton hwServiceAction>` in the footer |
| Service facts | styles | `.hw-service-card-meta` | `dl.hw-description-list` |
| Alert | Angular | `dismissible`; role `status` for every tone; `hw-alert > div.hw-alert`; `data-variant="default"` | removed (the button follows `(dismissed)`); `alert` for `danger`; the host is `.hw-alert`; no default `data-variant` |
| Progress | Angular | visible label wrapper; values clamped | `progress.hw-progress` named by `aria-label`; raw values |
| Meter | React | native 0..1 | min 0, max 100: `<Meter value={0.4}>` -> `<Meter value={0.4} max={1}>` |
| Meter | Angular | `low` 25, `high` 75, `optimum` 100; visible label | no regions unless given; `meter.hw-meter` named by `aria-label` |
| Skeleton | Angular | `width`, `height`; `hw-skeleton > span.hw-skeleton` | `style="inline-size: …; block-size: …"`; the host is `.hw-skeleton` |
| Spinner | Angular | `span[role=status] > span.hw-spinner` inside the host | the host is `.hw-spinner[role=status]` |
| EmptyState | Angular | `hw-empty-state > section.hw-empty` | the host is `.hw-empty`; icon in `[hwEmptyIcon]`, action in `[hwEmptyAction]` |
| EmptyState | React, Vue | `span[aria-hidden]` around the icon | `span.hw-empty-icon[aria-hidden]` |
| Chip | Vue, Angular | `removable` | removed; the button follows `@remove` / `(removed)` |
| Chip | React, Vue | `button.hw-button` in the chip | plain button: `.hw-chip .hw-button` -> `.hw-chip button` |
| Badge, Avatar, ButtonGroup, Chip | Angular | inner `span` / `div` carried the class; default `data-*` always written | the host carries the class; `data-*` only when the input is given |
| Card, IconButton | Angular | ARIA on the host; IconButton `describedBy` | forwarded to the native element; `aria-describedby` |
| AvatarGroup | Angular | `[avatars]` | `[items]` of `HwAvatarItem` |
| DescriptionList | Vue | `variant` = `'horizontal'` | stacked; pass `variant="horizontal"` |
| Stat | React | `dl > dt + dd`, `p`, `div.hw-stat-trend` | `span.hw-stat-label`, `strong.hw-stat-value`, `p.hw-stat-description`, `span.hw-stat-trend` |
| Stat | Angular | `hw-stat > div.hw-stat`; trend as a projected span | the host is `.hw-stat`; `trend`, `trendTone` or `[hwStatTrend]` |
| Stat | Vue | `tone` and `trendTone` typed `neutral \| success \| warning \| danger \| info` | `tone`: `neutral \| success \| danger`; `trendTone`: `success \| danger` (the tones that have a style) |
| Menu | vanilla | `hw:change` `{ open: false }` and `onOpenChange` before `{ value }` and `onAction` | the action first, then the closing |
| Timeline | React | `status: 'active'`; `li` without class | `'current'`; `li.hw-timeline-item > h3, time, p` |
| Timeline | Vue | item `date` | `dateTime` with `dateLabel` |
| Timeline | Angular | `state`, `'pending'`, `time`; no `id` | `status`, `'upcoming'`, `dateLabel` + `dateTime`; a unique `id` |
| Timeline | vanilla, styles | `data-state="active"` | `data-state="current"` |
| NotificationList | React | `onMarkRead` | `onRead` |
| NotificationList | Vue | item `date`; `li[data-read]`; `aria-label` on the section | `dateTime` with `dateLabel`; `li[data-state]`; a visible `h2`; required `unreadLabel` |
| NotificationList | Angular | `unread`, `time`; `li.hw-notification[data-unread]`; hidden unread text | `read` (inverted), `dateLabel` + `dateTime`; `li[data-state]`; a visible badge |
| NotificationList | vanilla, styles | `data-unread="true"`, `data-read="false"` | `data-state="unread"` |
| ToastRegion | React | `ToastMessage.description` | `message`, rendered in a `p` |
| Feedback | React | `helpful: 'yes' \| 'no' \| ''`; a form with radios; `onSubmit` / `onReset` | `true \| false \| null`; `div[role=group]` with pressed buttons; `onFeedback` |
| Feedback | Vue | string `v-model`; `@submit({value, comment})`; `readonly` | `v-model` of `FeedbackValue`; `@feedback`; `disabled` |
| Feedback | Angular | `[(value)]` `boolean \| null`; success on the choice | `HwFeedbackValue`; required `commentLabel` and `submitLabel`; `(feedback)` on submit |
| Feedback | vanilla | string value; `getStatusMessage` | `FeedbackValue`; `onFeedback`; `successMessage` |
| Feedback | styles | `.hw-feedback > h2`, `fieldset` and choice rules | a first-child `p` and pressed buttons |
| CookieConsent | React | `value` / `defaultValue: CookieChoice`, `onValueChange`; Reject before Accept in `div.hw-inline` | `open` / `defaultOpen` / `onOpenChange`, `onConsent(choice)`, `ConsentChoice`; Accept, Reject in `div.hw-button-group` |
| CookieConsent | Vue | `@accept`, `@reject`; `section[role=region][aria-label]` | `@consent` with `'accepted' \| 'rejected'`; named by its `h2` |
| CookieConsent | Angular | `[(visible)]`; removed from the DOM when closed | `[(open)]`; the host is the region, hidden when closed |
| CookieConsent | vanilla | `onValueChange`, `controller.value`, `detail.value` | `onConsent`, `onOpenChange`, `controller.open`, `setOpen`, `detail.consent`; Reject carries `data-variant="secondary"` |
| Button | Angular | `<button hwButton>` submitted its form; `[attr.disabled]`, `[attr.aria-busy]` | `type="button"` unless written; `[disabled]`, `[loading]` |
| Link | Angular | `hw-link` / `HwLinkComponent` | `<a hwLink>` / `HwLinkDirective`; `target="_blank"` -> `external` |
| Link | Vue | `external` replaced an authored `rel` | adds to it |

#### Known defects in 0.3.0

- The vanilla Tabs controller (`createTabs`) creates the tab bar
  (`.hw-tab-bar`) without the `data-orientation` attribute that the React, Vue
  and Angular adapters write. The appearance and the accessibility tree are the
  same; a later release corrects it.
- The README of each package gives its install command without a version
  (`npm install @hawiyah/styles @hawiyah/<adapter>`). While 0.3.0 carries the
  dist-tag `next` and `latest` names 0.2.1, that command installs 0.2.1, whose
  API differs; `@next` or the exact version (`@0.3.0`) installs 0.3.0. The
  defect ends when `latest` names 0.3.0.
- `.hw-code` sets `overflow-wrap: anywhere`, so inside a cell of an
  auto-layout `.hw-table` a value breaks into fragments (`data-|varian|t`,
  `'prima|ry'` at 390 px).
- The PortalHeader skip link and the ContentNavigation links are rendered as a
  bare `#id`; before hydration and without script, under a `<base href>` they
  open the base address with the fragment instead of the section of the page.
- ContentNavigation (Angular): a pointer activation scrolls to the section but
  leaves focus on the link, so the next Tab goes to the next entry; a native
  fragment link moves the focus starting point to the section.
- ContentNavigation: with `updateHash` the address receives the fragment through
  `history.replaceState`, so an activation adds no history entry; Back leaves
  the page instead of returning to the position before the activation (all four
  adapters).
- PortalHeader: without script its navigation stays collapsed below the
  breakpoint, behind a Menu button that does nothing.
- RadioGroup (Angular) renders `fieldset.hw-field`, which keeps the browser's
  fieldset border, padding and margin.
- The Umm al-Qura range trigger of Calendar and DatePicker is the typed letter
  `i` in a circle drawn by CSS, not an icon of the packaged set (all four
  adapters).
- The `role` input of `hw-alert` (Angular) is typed without `note`, although
  the host renders `role="note"` when it is given.
- PageHeader (Angular) renders its `h1` without `tabindex` or an id input, so
  the heading cannot be the focus target after a route change.
- Alert: the title is an inline `strong` without a separator, so a title
  followed by text reads as one run (`NoteLight and ...`).
- Tabs (Vue) declares no slot types for its panel and tab slots.
- Tabs (Angular) calls `preventDefault` on a keydown that hydration replays,
  and Angular reports `preventDefault called during event replay`.
- The `@hawiyah/angular` README says that a plain activation of a packaged
  in-page link focuses the target; its Content navigation section says that
  only keyboard activation does, which is the behaviour.
- Carousel (Vue) has `wrap`, default `true`; React and Angular have `loop`,
  default `false`.
- `@hawiyah/vue` does not export the types `ButtonVariant` and `Orientation`
  that its Button and Tabs props use.
- Dialog (React): `autoFocus` on a child renders no `autofocus` attribute, so
  the dialog opens with focus on its close button instead of the marked element.
  The vanilla, Vue and Angular dialogs focus the marked element.
- Dialog (Angular) renders its close button without `data-size="md"`, which the
  React and Vue dialogs write on theirs. The appearance is the same.
- The vanilla Combobox controller (`createCombobox`) leaves its status empty when
  Down Arrow or Up Arrow opens a closed list; the React, Vue and Angular adapters
  announce `getResultsMessage(count)`.
- PortalHeader (React) renders the brand link with the classes
  `hw-link hw-portal-brand`; Vue, Angular and the vanilla markup write
  `hw-portal-brand` only, so the brand has the link focus and hover styles in
  React alone.
- PortalHeader (Vue) renders the top-level navigation links without the class
  `hw-link` that React, Angular and the vanilla markup write, so their focus
  indicator differs.
- PortalHeader (React, Vue) writes `data-branch-href` on each
  `details.hw-portal-branch`; Angular and the vanilla markup do not.
- PortalHeader (Angular) always renders `div.hw-portal-notice`, empty when no
  `[hwPortalNotice]` content is projected; React and Vue render the container
  only when a notice is given.
- The vanilla PortalHeader controller (`createPortalHeader`) keeps the `menu-01`
  icon on the menu toggle while the navigation is expanded; React, Vue and
  Angular switch it to `cancel-01`.
- The `@hawiyah/vanilla` `PORTAL.md` says that "moving focus out" closes the
  navigation below 48rem without saying out of what; the four adapters close it
  when focus leaves the header, as the `@hawiyah/vue` `PORTAL.md` says.
- Stack (Vue), with the other layout primitives built by the same function,
  always writes `data-collapse-at="md"` and `data-side="start"`; React writes the two
  attributes only when the props are given, and Angular and the vanilla markup
  never write them on Stack.
- TextField: React and Vue write `aria-labelledby` on the input next to the
  `for` of its label; Angular and the vanilla markup rely on the label alone.
  Angular always writes `data-size="md"`, `data-variant="outline"` and, unless
  another value is given, `autocomplete="off"`; React and Vue write none of the
  three. Vue writes `value=""` on an input without a value. The accessible name
  and the appearance are the same.
- TextField (Angular) writes `type="text"` when no type is given, and sets the
  value of the input only as a DOM property, so an input with an initial value
  has no `value` attribute where the vanilla markup, React and Vue write one.
  The value the reader sees is the same.
- ServiceCard (Angular) always writes `data-variant` (`default` when no variant
  is given) and always renders `div.hw-service-card-icon`, empty when no
  `[hwServiceIcon]` content is projected; React, Vue and the vanilla markup write
  the attribute and the region only when they are given.
- Progress (React, Vue, Angular) writes `max="100"` when `max` is not given,
  also on an indeterminate bar, where the vanilla markup
  (`<progress class="hw-progress" aria-label="Loading"></progress>`) writes no
  `max`. The appearance and the accessibility tree are the same.
- Card (Angular): `hw-card` always renders `header.hw-card-header` and
  `footer.hw-card-footer`, empty when no `[hwCardHeader]` or `[hwCardFooter]`
  content is projected, while React and Vue render them only with header or
  footer content. The stylesheet hides an empty header and footer
  (`.hw-card > :is(.hw-card-header, .hw-card-footer):empty`), so the rendering
  is the same, but the markup differs.
- IconButton (Angular) writes `data-shape="square"` and an empty `value`
  attribute on its button when no shape or value is given; React, Vue and the
  vanilla markup write neither, so the structure of the four results differs in
  these two attributes.
- IconButton (React, Vue, Angular) renders the icon inside a wrapper
  `span[aria-hidden="true"]`, where the icon button of the `@hawiyah/vanilla`
  README puts `aria-hidden="true"` on the `span.hw-icon` itself, so the
  structure differs by one wrapper element. The appearance and the
  accessibility tree are the same.
- Field: in Angular a value control such as `hw-text-field` inside `hw-field`
  renders its own `div.hw-field` around its input, so the field holds two nested
  `.hw-field` elements, and the input carries `aria-labelledby`, `data-size`,
  `data-variant` and `autocomplete`; React and Vue render the input alone inside
  `Field`, with `aria-labelledby` next to the `for` of the label, and Vue writes
  `value=""` on an empty input. Field does not track the value presence
  (`data-hw-filled`) of a native control it holds (React, Vue, Angular), which the
  vanilla `enhance()` sets on every `.hw-input`, so the valid state of the
  stylesheet does not apply to that control. The appearance and the accessibility
  tree are the same.
- Textarea: React and Vue write `aria-labelledby` on the textarea next to the
  `for` of its label; Angular and the vanilla markup rely on the label alone.
  Angular always writes `data-size="md"` and `data-variant="outline"`, which
  React, Vue and the vanilla markup write only when given. Vue writes the value
  as a `value` attribute of the textarea (`value=""` when empty) and no text
  content, and Angular sets it as a property only; the vanilla markup and React
  write an initial value as the text content of the textarea. The shown value,
  the appearance and the accessibility tree are the same.
- NumberField: React and Vue write `aria-labelledby` on the input next to the
  `for` of its label; Angular and the vanilla markup rely on the label alone. Vue
  writes `value=""` on a NumberField without a value. Angular writes
  `hw-number-field` on the `div.hw-field` wrapper instead of the input and always
  writes `step` (`1` when none is given); React, Vue and the vanilla markup put
  the class on the input and write `step` only when given. The appearance and the
  accessibility tree are the same.
- InputGroup (Angular) always writes `data-size` (`md` when no size is given) on
  `.hw-input-group` and always renders both `span.hw-input-addon` elements, empty
  when no `[hwPrefix]` or `[hwSuffix]` content is projected; React, Vue and the
  vanilla markup write the attribute and an addon only when given. The
  stylesheet hides an empty addon (`.hw-input-addon:empty`) and does not select
  `data-size` on `.hw-input-group`, so the `size` input changes nothing; the
  control is sized by its own `data-size`. InputGroup (React, Vue) does not track
  the value presence (`data-hw-filled`) of a native control it holds, so the
  valid state of the joined row never applies; the vanilla `enhance()` and
  Angular set it.
- Switch (Vue) writes an `id` on `label.hw-choice`, `aria-labelledby` on the
  input pointing to that label, `value="on"` when no `value` is given and
  `data-hw-filled="true"` on the input; the vanilla markup, React and Angular
  write none of these. Switch (Angular) sets the checked state as the `checked`
  property only, so a checked switch has no `checked` attribute, unlike the
  vanilla markup and React. The appearance and the accessibility tree are the
  same.
- Checkbox (Vue) writes an `id` on `label.hw-choice`, `aria-labelledby` on the
  input pointing to that label, `value="on"` when no `value` is given and
  `data-hw-filled="true"` on the input; the vanilla markup, React and Angular
  write none of these. Checkbox (Angular) sets the checked state as the
  `checked` property only, so a checked checkbox has no `checked` attribute,
  unlike the vanilla markup and React. The appearance and the accessibility tree
  are the same.
- Radio (Vue) writes an `id` on `label.hw-choice`, `aria-labelledby` on the
  input pointing to that label and `data-hw-filled="true"` on the input; the
  vanilla markup, React and Angular write none of these. Radio (Angular
  `hw-radio-group`) sets the checked state as the `checked` property only, so the
  selected radio has no `checked` attribute, unlike the vanilla markup, React and
  Vue. The appearance and the accessibility tree are the same.
- Select: React and Vue write `aria-labelledby` on the select next to the `for`
  of its label; Angular and the vanilla markup rely on the label alone. Angular
  always writes `data-size` and `data-variant` (`md` and `outline` by default)
  and selects the chosen option as a property, without a `selected` attribute;
  Vue writes a `value` attribute on the select when it holds a value. The
  appearance and the accessibility tree are the same.
- Slider: React and Vue write `aria-labelledby` on the range input next to the
  `for` of its label; the vanilla markup and Angular name the input by the label
  alone. Vue writes `data-hw-filled` on the range input through the
  value-presence observer of its form-reset hook; the vanilla `enhance()`, React
  and Angular do not write it on `.hw-slider`. Angular sets the value of the
  range input as a DOM property, so the input carries no `value` attribute, which
  the vanilla markup, React and Vue write; the shown and submitted value is the
  same. React passes `readOnly` on to the range input, which renders a
  `readonly` attribute that HTML does not apply to a range input; Vue and Angular
  write only `aria-readonly`. The appearance and the accessibility tree are the
  same.
- FileUpload: React and Vue write `aria-labelledby` on the file input next to
  the `for` of its label; the vanilla markup and Angular name the input by the
  label alone. The appearance and the accessibility tree are the same.
- The `@hawiyah/angular` README calls the `remove` label of FileUploadList the
  visible text of the remove button; the stylesheet draws the button as an icon
  and hides that text (`font-size: 0`), and `getRemoveLabel` names it.
- Chip (React, Vue, Angular) writes `data-tone="neutral"` when no tone is given;
  the stylesheet selects `data-tone` on `.hw-chip` only for `success`, `warning`,
  `danger` and `info`, and the vanilla markup of a neutral chip writes no
  `data-tone`. The appearance and the accessibility tree are the same.
- SecondaryNav: React, Vue and Angular write `data-variant="default"` on the nav
  when no variant is given; the stylesheet selects only `data-variant="mobile"`,
  and the vanilla markup of the default appearance has no `data-variant`. The
  appearance and the accessibility tree are the same.
- SecondaryNav (React, Vue): the item type `SecondaryNavItem` declares `groups`,
  which the component does not render.
- Spacer (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  which the stylesheet does not select on `.hw-spacer`; React writes the two
  attributes only when the props are given, and Angular and the vanilla markup
  never write them on Spacer.
- Center (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  which the stylesheet does not select on `.hw-center`; React writes the two
  attributes only when the props are given, and Angular and the vanilla markup
  never write them on Center.
- Collapsible (React) writes `aria-controls` on the `summary` and the `id` it
  names on the content element; Collapsible (Angular) writes the class
  `hw-collapsible-trigger` on the `summary` and `hw-collapsible-content` on the
  content element. Vue and the vanilla markup write neither, and the stylesheet
  styles the `summary` and the content element of `.hw-collapsible` with or
  without the two classes. The appearance and the accessibility tree are the
  same.
- Container (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  which the stylesheet does not select on `.hw-container`; React writes the two
  attributes only when the props are given, and Angular and the vanilla markup
  never write them on Container. The appearance and the accessibility tree are
  the same.
- Inline (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  which the stylesheet does not select on `.hw-inline`; React writes the two
  attributes only when the props are given, and Angular and the vanilla markup
  never write them on Inline. The appearance and the accessibility tree are the
  same.
- Grid (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  which the stylesheet does not select on `.hw-grid`; React writes the two
  attributes only when the props are given, and Angular and the vanilla markup
  never write them on Grid. The appearance and the accessibility tree are the
  same.
- Columns (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  which the stylesheet does not select on `.hw-columns`; React writes the two
  attributes only when the props are given, and Angular and the vanilla markup
  never write them on Columns. The appearance and the accessibility tree are the
  same.
- Section (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  which the stylesheet does not select on `.hw-section`; React writes the two
  attributes only when the props are given, and Angular and the vanilla markup
  never write them on Section. The appearance and the accessibility tree are the
  same.
- Sidebar (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  and Sidebar (Angular) always writes them on `hw-sidebar`, the initial values of
  its `side` and `collapseAt` inputs; React writes the two attributes only when
  the props are given, and the vanilla markup only when they are written. The
  stylesheet treats the absent attributes of `.hw-sidebar` as `start` and `md`,
  so the appearance and the accessibility tree are the same.
- AspectRatio (Vue) always writes `data-collapse-at="md"` and `data-side="start"`,
  which the stylesheet does not select on `.hw-aspect-ratio`; React writes the
  two attributes only when the props are given, and Angular and the vanilla
  markup never write them on AspectRatio. AspectRatio (Angular) always writes
  `--hw-layout-ratio: 1.7777777777777777` in the `style` attribute of
  `hw-aspect-ratio` when no `ratio` is given, because its `ratio` input is
  initialised to 16 / 9; React, Vue and the vanilla markup write the property
  only when a ratio is given, and the default of the stylesheet (1.777777778)
  gives the same box. The appearance and the accessibility tree are the same.
- AppShell (Vue) always writes `data-collapse-at="md"` and `data-side="start"`
  on `.hw-app-shell`, and AppShell (Angular) always writes `data-side="start"` on
  `hw-app-shell`, the initial value of its `side` input; the stylesheet selects
  only `data-side="end"` on `.hw-app-shell` and no `data-collapse-at`. React
  declares no `side` prop and writes neither attribute (a `data-side` attribute
  passes through to the root), and the vanilla markup writes `data-side` only for
  `end`. The appearance and the accessibility tree are the same.
- PageHeader places content that is not a title, description, breadcrumb or
  action differently in each adapter: React renders its children inside the
  title block after the description, Vue renders the default slot after the
  title row as a direct child of the header, and Angular renders all content
  not marked `hwBreadcrumb` in the actions region. The appearance and the order
  of the accessibility tree therefore differ when such content is given.
- PageHeader (Angular) always renders `div.hw-page-header-actions`, empty when
  no content is projected; React and Vue render it only when actions are given.
  The stylesheet has no rule for an empty actions region, so it stays a flex
  item of `.hw-page-header-main` and the row keeps one gap after the title
  block; the accessibility tree is the same.
- MobileTopBar: React, Vue and Angular always write `data-variant` on the
  header, including `data-variant="internal"` when no variant is given; the
  vanilla markup and the stylesheet use `data-variant` only for `main`. The
  appearance and the accessibility tree are the same.
- MobileTopBar (Angular) always renders `div.hw-mobile-top-bar-leading` and
  `div.hw-mobile-top-bar-actions`, empty when nothing is projected or no
  `backHref` is set, and the stylesheet hides an empty one; React and Vue render
  them only when they have content. MobileTopBar (Angular) has no default
  content projection, so content not marked `hwTopBarLeading` or
  `hwTopBarActions` is not rendered, where React children and the Vue default
  slot render after the actions. Without such content the appearance and the
  accessibility tree are the same.
- SiteVerification (Angular): `hw-site-verification` always renders
  `span.hw-verification-mark`, empty when no `[hwVerificationMark]` content is
  projected; React and Vue render the region only with a mark, and the
  stylesheet hides it while it is empty. The appearance and the accessibility
  tree are the same.
- SiteVerification: in light mode the registration link
  (`.hw-verification-registration a`, `--hw-color-primary-text`, #1B8354) has a
  contrast ratio of 4.32:1 against the muted surface of `.hw-site-verification`
  (#F3F4F6) in the default theme, below the 4.5:1 that WCAG 2.2 AA requires for
  its text (14 px, normal weight); in dark mode it measures 6.43:1 (#54C08A on
  #1F2A37). The vanilla markup, React, Vue and Angular render the same link, so
  the appearance and the accessibility tree are the same in the four.
- PortalFooter (Angular): `hw-portal-footer` always renders
  `div.hw-portal-footer-brand` with an empty `div.hw-portal-footer-brand-marks`,
  an empty `div.hw-portal-footer-extra` and `div.hw-portal-footer-bottom` with an
  empty `div.hw-portal-footer-partners` when nothing is given or projected, and
  keeps the support section with the `hidden` attribute as its README documents;
  React and Vue render each region only with content. The stylesheet hides the
  empty regions, so the appearance and the accessibility tree are the same.
- PortalFooter (Vue): the links are written without the class `hw-link` that
  the React and Angular footers write. The footer rules select the links by
  their container, so the appearance and the accessibility tree are the same.
- PortalFooter: a text `brand` renders as plain text in React and in a `strong`
  element in Vue and Angular, on which the stylesheet sets no weight, so the
  brand is bold in Vue and Angular only and the accessibility tree has a
  `strong` element there in place of the text.
- PortalHeader (Angular) always renders `div.hw-portal-header-actions`, empty
  when no content is projected; React and Vue render it only when actions are
  given. The stylesheet hides it while it is empty, so the appearance and the
  accessibility tree are the same.
- PortalHeader (Vue, Angular) writes a text `brand` inside a `span` in the brand
  link, where React writes the text directly in the link. The appearance and the
  accessibility tree are the same.
- SecondaryNav: the vanilla recipe in the `@hawiyah/vanilla` `PORTAL.md` writes
  each link text directly in its `a`, where React, Vue and Angular wrap it in a
  `span`. The stylesheet does not select that `span`, so the appearance and the
  accessibility tree are the same.
- Tooltip (Angular) gives its host element `hw-tooltip` the class
  `hw-tooltip-anchor` and the trigger marked `hwTooltipTrigger` the class
  `hw-tooltip-trigger`; the vanilla, React and Vue results wrap the trigger in a
  `span` with `data-hw="tooltip"` and carry neither class. The stylesheet styles
  both wrappers alike, so the appearance is the same.
- Popover and Menu (Vue, Angular) render their packaged trigger as
  `button.hw-button` without the `data-size` attribute that the button component
  of each adapter writes as `md` by default; the stylesheet selects only `sm` and
  `lg`, so the appearance is the same.
- Popover and Menu: the stylesheet limits an open panel to
  `min(24rem, calc(100vw - 2rem))` and places it at the inline start of its
  trigger, so when the trigger stands more than 1rem from the edge of a narrow
  viewport, a panel whose content reaches that width extends past the viewport
  and the page scrolls sideways (at 320 px with a trigger 33 px from the edge,
  by 1 px).
- Menu (React, Vue) gives the first enabled item of a closed menu
  `tabindex="0"`, while the vanilla controller and Angular give every item
  `tabindex="-1"` until the menu opens or an item takes focus; the closed menu is
  hidden, so the keyboard behaviour is the same.
- Menu (React, Vue) does not activate a link item on Space; the vanilla
  controller and Angular activate every enabled item on Space, as on Enter.
- Menu (React, Vue) runs the action of an activated item before it moves focus
  to the trigger, so a dialog that the action opens returns focus to the hidden
  item; the vanilla controller and Angular focus the trigger first.
- Dialog and Drawer (React) set `aria-haspopup="dialog"` on the element given as
  `trigger`; the Vue `trigger` slot and the Angular dialogs leave the opening
  button without it.
- Dialog and Drawer (Angular) render their close button without
  `data-size="md"`, which the React and Vue dialogs and drawers write on theirs.
  The appearance is the same.
- Drawer (Vue) renders a `side` attribute on its dialog element besides
  `data-side`; the vanilla markup and the React and Angular drawers have only
  `data-side`. The placement is the same.
- ToastRegion (Angular) writes `data-variant="default"` on the region when no
  variant is given, where the vanilla, React and Vue regions write no
  `data-variant`, and renders the dismiss button without `data-size="md"`, which
  the React and Vue regions write on theirs. The appearance is the same.
- ToastRegion (vanilla): `createToastRegion` writes `role="region"` on a region
  that holds polite and urgent live containers, which the React, Vue and Angular
  regions do not write; the named `section` already has the region role.
- CookieConsent (Angular): the host element `hw-cookie-consent` is the consent
  region and carries `role="region"`, as the `@hawiyah/angular` README
  documents; the vanilla markup, React and Vue render a `section`, which has the
  region role without the attribute. The role and the name of the region are the
  same.
- PasswordField (Vue) writes `hw-password-field` on `div.hw-password-control`
  instead of its root element; React, Angular and the documented vanilla markup
  write it on the root.
- PasswordField: React and Vue write `aria-labelledby` on the input next to the
  `for` of its label and `data-size="md"` on the toggle; Angular writes neither,
  and Vue writes an empty `value` attribute on the input.
- SearchField (vanilla, `createSearchField`) creates the polite results status
  as a `div.hw-sr-only`; React, Vue and Angular render a `span.hw-sr-only`.
- SearchField (Vue) names the suggestion listbox with `aria-label`, the text of
  `label`; React, Angular and the vanilla controller name it with
  `aria-labelledby`.
- SearchField (Angular) writes `autocomplete="off"` on every field unless
  `autocomplete` is given, where React, Vue and the vanilla controller turn it
  off only with suggestions; its clear button has no `data-size` and its search
  button neither `data-variant` nor `data-size`. React and Vue write
  `aria-labelledby` on the input next to the `for` of its label and an empty
  `value` attribute, which Angular and the vanilla markup do not write.
- SearchField (Angular) sets the value of the input only as a DOM property, so
  a field that holds a query has no `value` attribute where the vanilla markup,
  React and Vue write one, and it writes an id on the label without
  `aria-labelledby` on the input. The query the reader sees and the accessible
  name are the same.
- PinInput (Vue) writes `hw-pin-input` on the input instead of its root
  element, and writes `dir="ltr"` on the input, which React, Angular and the
  vanilla controller do not.
- PinInput: React and Vue write `aria-labelledby` on the input next to the
  `for` of its label, Angular does not, and React and Vue write an empty `value`
  attribute.
- Rating (Angular) names each radio with a visually hidden `span.hw-sr-only`
  inside its label instead of `aria-label`, so its accessibility tree differs
  from React, Vue and the vanilla markup; it checks the selected radio as a
  property, so the radio has no `checked` attribute.
- Rating (React) renders `fieldset.hw-rating` without `hw-field`, which Vue,
  Angular and the vanilla markup write, and writes `hw-radio` on the radios and
  `data-state` on the stars; without `hw-field` a React rating with an error
  message renders 7 px shorter than the other three. Rating (Vue) writes
  `data-selected` on the labels, `data-hw-filled` on the first radio and the
  `name` attribute on the fieldset as well as on the radios.
- Rating (Vue) declares the props `min` and `step`, which it does not read.
- Combobox: React and Vue write `aria-labelledby` on the input next to the `for`
  of its label; Angular and the vanilla markup rely on the label alone. The
  accessible name is the same.
- Combobox (React) writes an id on its status element; the other adapters write
  none. No behaviour differs.
- Combobox (Angular) sets the text of the input as a property only, so its DOM
  has no `value` attribute, where React and Vue write one; the text shown is the
  same.
- MultiSelect: the class `hw-multi-select-selected` of the selected-count
  paragraph, which React, Vue and Angular render with `getSelectedMessage` and
  which the adapter READMEs and the vanilla markup contract document, has no rule
  in `@hawiyah/styles`; the paragraph is styled through `.hw-multi-select > p`.
- MultiSelect (React, Vue) writes `value=""` on the filter input; vanilla and
  Angular write none.
- TagInput: React and Vue write `aria-labelledby` and `value=""` on the text
  input next to the `for` of its label; Angular and the vanilla markup rely on
  the label alone. The accessible name is the same.
- RangeSlider (Vue, Angular) always writes `step="1"` on the two range inputs;
  React and the vanilla markup write it only when `step` is given. Vue writes
  `data-hw-filled` on the lower range input through the value-presence observer
  of its form-reset hook. No behaviour differs.
- RangeSlider (Angular) sets the value of the range inputs as a property, so its
  DOM has no `value` attribute; the values are the same.
- RangeSlider: the class `hw-range-slider-value` of the range output, which
  React, Vue and Angular write and which the `@hawiyah/styles` README and the
  vanilla markup contract document, has no rule in `dist/styles.css`; the output
  is styled through `.hw-range-slider output`.
- Calendar renders a different structure and accessibility tree in each
  adapter: the vanilla controller wraps the toolbar and the grid in
  `div.hw-calendar-content > div.hw-calendar-header`, shows the names of the
  month buttons as text and names the grid by the month heading; React renders
  a `section` region named by `label` with icon month buttons and names the grid
  by the month heading; Vue renders the hidden input first, then
  `div.hw-calendar-toolbar`, the month in a `span` instead of an `h3` and text
  month buttons, and names the grid by `label`; Angular renders
  `div.hw-field.hw-calendar` with `div.hw-calendar-toolbar` and icon month
  buttons, and names the grid by `label`. The vanilla calendar is 8 px taller
  than the Angular calendar.
- Calendar (Vue) writes `data-hw-filled` on its hidden value input, which its
  form-reset hook observes with core `observeFieldValue`; the other adapters
  write none.
- DatePicker renders a different structure in each adapter: React and Angular
  put `hw-field` on the `.hw-date-picker` root and Vue wraps
  `div.hw-date-picker` in `div.hw-field`; React, Vue and Angular render
  `output.hw-date-picker-value` after the control, before the hint, while the
  vanilla controller appends it at the end of the root after the dialog, so in
  the vanilla accessibility tree the hint precedes the announced date. At rest
  the picker is 99 px high in vanilla, 96 px in React and Vue and 104 px in
  Angular. The vanilla markup has no `hw-field` on the root, so its hint and
  error message take 14 px text where the adapters show the 12 px text of a
  field; with a hint and an error message the picker is 127 px high in
  vanilla, 117 px in React and Vue and 125 px in Angular.
- FileDropzone (Vue) sets `data-state="error"` on its root only for a rejected
  batch, not for the application's `error`; React and Angular set it for both.
  The error styling still applies through `aria-invalid` on the input.
- FileDropzone: React and Vue write `aria-labelledby` with the id of the label
  on the file input next to the `for` of the label; the vanilla controller and
  Angular name the input by the label alone. The accessible name is the same.
- ToggleGroup in multiple mode: React, Vue and Angular render a disabled hidden
  input before the option buttons and one hidden input per selected value
  directly in the fieldset; the vanilla controller renders no such first input
  and writes its hidden inputs inside a hidden `span` that it appends to the
  root.
- ToggleGroup (Vue) writes `data-hw-filled` on its first radio (single mode) or
  on its disabled hidden input (multiple mode) through its form-reset hook; the
  other adapters write none.
- ToggleGroup (Angular) sets `checked` on the selected radio as a property
  only, so the radio carries no `checked` attribute; the other adapters write
  the attribute. The selection is the same.
- Pagination (Vue) wraps the ellipsis of a gap disclosure in an `aria-hidden`
  `span` inside the summary, so the summary exposes no text of its own; the
  vanilla controller, React and Angular write the ellipsis as the text of the
  summary. The accessible name from `getGapLabel` is the same in the four.
- Pagination (vanilla): every control that carries `data-hw-page` receives
  `aria-disabled`, `"false"` while it is available and `"true"` together with
  `disabled` while the pagination is disabled; React, Vue and Angular write
  `aria-disabled="true"` only on the arrow at the first or the last page, and
  `disabled` only while the pagination is disabled.
- Stepper (vanilla): `createStepper` writes the index it uses as
  `data-active-index` on the list; React, Vue and Angular write no such
  attribute.
- CopyButton (Angular): the host element `hw-copy-button` is the root and
  carries the class `hw-copy`, as the `@hawiyah/angular` README documents; the
  vanilla markup, React and Vue render a `span.hw-copy`.
- TreeView (Angular) writes `data-node` on every tree item and
  `aria-disabled="false"` on the tree when it is not disabled; React, Vue and
  the vanilla markup write neither.
- TreeView: the vanilla controller keeps the rows of a collapsed branch in the
  document with the `hidden` attribute, as the `@hawiyah/vanilla` README
  documents; React, Vue and Angular render only the visible rows.
- SideNavigation and NavigationDrawer (vanilla): the controller writes
  `tabindex="-1"` on a disabled row, which React, Vue and Angular do not write.
  The row is not focusable in any adapter.
- NavigationDrawer (Vue) writes its prop `side` as an attribute `side` on the
  dialog element next to `data-side`, as Drawer (Vue) does; React, Angular and
  the vanilla markup write `data-side` only.
- NavigationDrawer (Vue): the element in the `trigger` slot does not receive
  `aria-haspopup="dialog"`, which React writes on its `trigger` element.
- NavigationDrawer (Angular) renders the dialog inside a host element with the
  class `hw-navigation-drawer-host` and an `hw-drawer` element, always renders
  the user and footer containers, and gives the dialog the classes
  `hw-dialog hw-drawer` without `hw-navigation-drawer`; React, Vue and the
  vanilla markup render the `dialog` with the classes
  `hw-dialog hw-drawer hw-navigation-drawer` as the outer element.
- Carousel (vanilla): `createCarousel` writes `aria-disabled="false"` on the
  available arrows and indicators and `aria-hidden="false"` on the current
  slide, where React, Vue and Angular write neither attribute.
- Carousel (Vue, Angular): the controls group lacks the class `hw-inline` that
  React renders.
- Carousel (Angular): the previous and next arrows carry neither
  `data-variant="secondary"` nor `data-size="md"`, which React and Vue render.
- DataTable (Vue, Angular): the sort button is a plain button without the class
  `hw-button`, `data-variant="ghost"` and `data-size="md"` that React renders.
- DataTable: React, Vue and Angular show the sort state of a header with a
  packaged icon, `span.hw-icon` with `data-icon`, while the vanilla markup that
  the `@hawiyah/styles` README documents places `span.hw-table-sort-icon`,
  whose indicator follows `aria-sort`; the two indicators differ in width, so
  the columns of a sortable table are placed a few pixels apart.
- Feedback (React, Vue, Angular): the comment step is rendered as
  `div.hw-feedback-comment`, a class for which `@hawiyah/styles` defines no
  rule; the vanilla README documents the step only as
  `[data-hw-feedback-comment]`.
- Feedback (React, Vue, Angular): the group carries `data-choice-variant="text"`
  by default, a value that the stylesheet does not select.

#### Left for a later release

- RadioGroup and CheckboxGroup for React, Vue and vanilla, and a
  single-option Angular radio; a radio group is composed with a fieldset.
- A general pass-through of native attributes (`enterkeyhint`,
  `autocapitalize`, `spellcheck`, `list` and the rest) on Angular value
  controls, and `autofocus` or `webkitdirectory` on `hw-file-upload`; use a
  native input with the `hw-` classes inside `hw-field`.
- `multiple` on the Angular select; use `hw-multi-select` or a native select.
- `required` on a multiple ToggleGroup is not enforced; explain the minimum in
  the hint or through `error`.
- Native composition of `hw-table` (authored rows are ignored); write a native
  table with the `hw-` classes.
- Form participation (`name`, read-only, hint, error) of TreeView in React and
  Vue.
- A packaged trigger in React and a projected trigger in Angular for Menu and
  Popover; the Angular trigger stays a text button.
- `as` on the React layout primitives and attribute selectors for
  `hw-sidebar` and `hw-app-shell`; header and footer options passed through
  PortalLayout in Vue and Angular (compose PortalHeader and PortalFooter);
  rich tab labels in Angular.
- A Gregorian / Hijri switch on the standalone Calendar; the Calendar hidden
  input of Angular, Vue and vanilla still submits a date that `isDateDisabled`
  rejects.
- `hwTooltipTrigger` on a Hawiyah wrapper component (mark a native element),
  a `description` input on the Angular dialog, focus hand-over when an alert,
  the last chip or the cookie region is removed, a rich title for the Angular
  PageHeader, rich per-item content for Timeline and NotificationList in Vue
  and Angular, and an opt-out of the Feedback comment step.
- Browser cases of this milestone. Written and run in `tests/browser`:
  TREE-02, TREE-05 and TREE-06 (`tree-view.spec.ts`); ALERT-04, PROGRESS-03,
  SKELETON-02, SKELETON-04, SPINNER-04, DESCRIPTION-LIST-02, TIMELINE-03,
  NOTIFICATION-04, CONSENT-03, CONSENT-05, COLLAPSIBLE-03, PAGE-HEADER-02,
  TEXTAREA-02 and ATTR-06 for the form-control and table hosts
  (`feedback-status.spec.ts`); TOGGLE-GROUP-03 (`toggle-group.spec.ts`);
  PROGRESS-04 (`progress-states.spec.ts`). Not written, and run nowhere in
  the repository: RESET-12, TOGGLE-GROUP-02, COMBOBOX-02, MULTISELECT-03,
  TAGINPUT-03, PININPUT-03, FILEDROPZONE-08, FILEDROPZONE-12, TOOLTIP-04,
  MENU-04, POPOVER-04, PORTAL-04, PORTAL-07, SERVICE-03, METER-03,
  FEEDBACK-06, the browser half of FOCUS-01 and ATTR-06 for the sticky
  content navigation and the popover host. They need the four adapters
  running in one page; their behaviour was measured by hand in the reviews of
  this milestone. Only FOCUS-01 has a jsdom case under its id; the others
  are not covered by any automated test.
- A disabled FileDropzone shows its instruction in the disabled text colour
  (2.03:1 in the DGA light theme). Text of an inactive control is exempt from
  WCAG 1.4.3; whether the instruction should use the muted text colour is an
  open decision.
- The Vue server markup of a Select does not mark a slotted `option` as
  selected (the value is applied when the component mounts or hydrates).
- Differences that leave the accessibility tree equal and are not changed:
  a closed Menu has one item with `tabindex="0"` in React and Vue and none in
  vanilla and Angular; Angular `hw-toast-region` requires `label`, where
  React and Vue also accept `aria-label` or `aria-labelledby`; the Calendar
  region and heading structure differs between React, Vue and Angular; the
  React Calendar submits an empty value for a date outside the Umm al-Qura
  range, the other adapters the date.
- Two Menu and TreeView differences found in review: after a menu action
  that focuses a field, React and Vue return focus to the trigger while
  vanilla and Angular keep it in the field; ArrowUp on the first row of a
  TreeView moves to the last row in vanilla and Angular and stays in React.
  One rule for each is decided in a later release.

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
