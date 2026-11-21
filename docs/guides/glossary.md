# Arabic glossary

The Arabic terms of Hawiyah's public guide: its text sources (`guide/src/app/**/i18n.ts`,
`guide/src/app/i18n/`) and the Arabic component pages (`docs/components/*.ar.md`)
use them. A writer of an Arabic page reads this file with the authoring contract
in [docs/components/README.md](../components/README.md). New terms are proposed
in a writer's result and added here by the lead; the owner confirms the open rows
(marked "Owner to confirm") and the category labels at the pilot pause.

This file is also the source of a test: `guide/scripts/content/test/glossary.test.mjs`
reads the table of excluded forms below and fails on any of them in the guide's
Arabic text sources and Arabic pages. The rows marked frozen are the terms the API
tables and their prose need; they change only with the lead's approval.

## Terms

Table: Arabic terms of the guide

| Concept | Arabic | Notes |
| --- | --- | --- |
| colour mode | وضع الألوان؛ الوضع الفاتح، الوضع الداكن | Never نمط for a mode. |
| styles (CSS) | الأنماط | |
| style sheet | ورقة الأنماط | Everywhere, also in install steps; never ملف الأنماط, ملفات الأنماط, ملف أنماط or ملف CSS. |
| CSS class | الصنف | Followed by its name in code: بالصنف `hw-button`; never بالفئة. |
| Kind column of the Vue and Angular API tables | الفئة | The column header and its meaning, also in prose; never الصنف, which is the CSS class. |
| pattern (WAI-ARIA Authoring Practices) | نمط | Only before the name of a pattern (نمط التبويبات، نمط الأكورديون), with the reference to the practices later in the same sentence (في ممارسات التأليف الخاصة بـWAI-ARIA); never for a colour mode. |
| theme (`data-hw-theme`) | السمة | سمة never names an HTML attribute (not بالسمة `hidden`). |
| HTML attribute | الخاصية | Followed by its name in code: الخاصية `type`. Where the same sentence also names a prop or a CSS property: خاصية HTML. Never السمة, which is the theme. |
| CSS property | خاصية CSS | On its first mention in a section; الخاصية after it. |
| React or Vue prop | خاصية المكوّن، خصائص المكوّن | Under the React and Vue headings of the API section, where every name is a prop, الخاصية followed by its name. The React table header is الخاصية. |
| slot (Vue) | المنفذ، المنافذ | The Kind value `slot` stays Latin in the API table. |
| event (Vue) | الحدث، الأحداث | The Kind value `event` stays Latin. |
| emit (an event) | يُرسل الحدث | A component يُرسل الحدث `update:modelValue`; a controller يُرسل الحدث `hw:change` على الجذر. |
| output (Angular) | المُخرج، المُخرجات | The captions write مخرجات without diacritics. The Kind value `output` stays Latin. |
| Angular input | المُدخل | Plural المُدخلات. |
| content projection (Angular) | إسقاط المحتوى؛ المحتوى المُسقَط | The Kind value `content` stays Latin. |
| default value | القيمة الافتراضية | The header of the Default column. |
| required | مطلوب | The header of the Required column; مطلوبة for a feminine noun. |
| type | النوع | The header of the Type column. |
| density | الكثافة | `data-hw-density`. |
| locale | الإعدادات المحلية | The BCP 47 tag of a `locale` option or input; not اللغة, which is the language of the page. |
| direction | الاتجاه | Reading direction: اتجاه القراءة; from right to left: من اليمين إلى اليسار. |
| keyboard table caption | جدول: التفاعل من لوحة المفاتيح مع المكوّن: <labelAr> | Fixed in `KEYBOARD_TABLE` of `guide/scripts/content/config.mjs`; the headers are المفتاح and الإجراء. Owner to confirm (proposed: جدول: استخدام لوحة المفاتيح في المكوّن: <labelAr>). |
| equivalence check (step 80) | فحص التكافؤ | |
| evidence panel | لوحة الأدلة؛ أدلة التحقق، البنود المفتوحة | The two headings of the panel (`guide/src/app/i18n/evidence-headings.json`). |
| known defect | العيب المعروف، العيوب المعروفة | العيوب المعروفة في الإصدار 0.3.0 for the CHANGELOG section Known defects in 0.3.0. |
| controller | المتحكم، المتحكمات | Not وحدة تحكم (with or without shadda), which a reader also knows as the console. |
| adapter | المحوّل، المحوّلات | The npm package of an adapter is حزمة المحوّل; never مهايئ. |
| code | الشيفرة | Copy buttons and listing titles; never الكود. |
| `script` element or block | البرنامج النصي | |
| key names, in the key element `<kbd>` | Latin, as printed on the key | Tab, Shift, Ctrl, Alt, Enter, Space, Escape, Backspace, Delete, Home, End, Page Up, Page Down, F10. The four arrow keys carry no word and are named in Arabic: السهم الأيمن، السهم الأيسر، السهم العلوي، السهم السفلي (English: Right Arrow, Left Arrow, Up Arrow, Down Arrow). `KEY_NAMES` of `guide/scripts/content/config.mjs` holds the list. Owner to confirm the names of the up and down arrows (proposed: سهم الأعلى، سهم الأسفل). |
| both reading directions | في اتجاهَي القراءة كليهما | Not في كلا الاتجاهين, which reads as up and down. |
| selected | المحدَّد | |
| selects (a tab, an option) | يحدّد | |
| sets (a value, a look) | يضبط | Not يحدّد, which means selects: يضبط الشكلُ الطرازَ المرئي للزر. |
| visual family (of Button) | الطراز المرئي، الطُّرُز المرئية | Never الفئة, which is the Kind column, and never الشكل, which is the variant. Owner to confirm. |
| accessible name | الاسم الميسّر | اسم ميسّر without the article. |
| bundled runtime | بيئة التشغيل المجمّعة | حزمة names an npm package only. |
| licence | الترخيص | ترخيص Apache 2.0; never رخصة. |
| stable API | الواجهة المستقرة | Not الثابتة. |
| enabled, disabled | متاح، معطَّل | |
| activation | التفعيل | |
| disclosure element | عنصر الإظهار والإخفاء | |
| hover | المرور بالمؤشر | |
| scroll | التمرير | |
| Warning, Caution | تحذير، تنبيه | Also the log level warning: تحذير. |
| variant names | Latin, in code | `primary`, `outline`. |
| page titles and links with a component name | مرجع المكوّن: زر؛ صفحة المكوّن: زر | A form that needs no definite article on the name. |

The API terms from slot to type, the three terms for an HTML attribute, a prop
and a CSS property, and the keyboard table caption are frozen for milestone 5.

## Category labels

The ten categories of `components.json` name the sections of the catalogue and
the groups of the side navigation (`guide/src/app/i18n/categories.json`). Owner
to confirm.

Table: Category labels

| Category | Arabic | Notes |
| --- | --- | --- |
| Actions (`actions`) | الإجراءات | |
| Forms (`forms`) | النماذج | |
| Navigation (`navigation`) | التنقل | |
| Overlays (`overlays`) | الطبقات المتراكبة | Open; proposed alternative: النوافذ المتراكبة. |
| Disclosure (`disclosure`) | الإظهار والإخفاء | |
| Layout (`layout`) | التخطيط | |
| Feedback (`feedback`) | التغذية الراجعة | Open; proposed alternative: التنبيهات والحالة (the category holds Alert, Progress and the toasts). |
| Data display (`data-display`) | عرض البيانات | |
| Content (`content`) | المحتوى | |
| Platform components (`platforms`) | مكوّنات المنصات | |

## Proper nouns

«كود المنصات» is the proper name of the DGA Platforms Code (كود المنصات الصادر
عن هيئة الحكومة الرقمية). It keeps the word كود, although the guide writes
الشيفرة for code everywhere else: the excluded form of الكود below has the
article, which the proper name never takes. Product and package names (Hawiyah
in Latin text, `@hawiyah/react`), framework names (JavaScript, React, Vue,
Angular) and the names of files and standards (WAI-ARIA, `components.json`) stay
in Latin script.

## Excluded forms

Each form is a JavaScript regular expression, tested line by line.

Table: Forms the glossary excludes

| Excluded form | Use instead |
| --- | --- |
| `` /ملف(?:ات)? (?:ال)?أنماط\|ملف(?:ات)? CSS/ `` | ورقة الأنماط |
| `` /وحد(?:ة\|ات) (?:ال)?تحك\u0651?م/ `` | المتحكم |
| `` /^[\|][^\n]*[\|]\s*الصنف\s*[\|][^\n]*[\|]\s*$/m `` | الفئة as the Kind column header |
| `` /نمط(?!\s+(?!(?:ال)?(?:وضع\|ألوان))\S[^\n]*في ممارسات التأليف)/ `` | نمط only before the name of a pattern, with في ممارسات التأليف later in the same sentence |
| `` /(?:[وفبلك]?ال\|[وفبلك])فئة\s+`?hw-/ `` | الصنف for a CSS class (الفئة is the Kind column) |
| `` /(?:^\|[^\u0600-\u06FF])(?:[وفبلك]?ال\|[وفبلك])?صنف(?![\u0600-\u06FF])(?!\s+`)/ `` | الصنف only for a CSS class, followed by its name in code (the Kind column is الفئة) |
| `` /سمة[\u064B-\u0652]?\s+`?(?!dga\b\|custom\b\|data-hw-theme\b)[A-Za-z]/ `` | الخاصية for an HTML attribute (السمة is the theme) |
| `` /(?:^\|[^\u0600-\u06FF])(?:[وفبلك]?ال)كود/ `` | الشيفرة for code (كود المنصات is the Platforms Code) |
| `` /مهاي[ئي]/ `` | المحوّل for an adapter |
| `` /في كلا الاتجاهين/ `` | في اتجاهَي القراءة كليهما |
| `` /(?:[وفبلك]?ال\|[وفبلك])فئات? المرئية/ `` | الطراز المرئي, الطُّرُز المرئية for a visual family of Button |
| `` /رخصة/ `` | الترخيص |
