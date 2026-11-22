# Questions for the native Arabic reader

Work in progress, kept with the pilot notes; deleted with `handoff/` before the branch
merges into `main`. The pages to read are `docs/components/text-field.ar.md` and
`docs/components/service-card.ar.md` (and the two model pages, `button.ar.md` and
`tabs.ar.md`). An answer here becomes a row of the Arabic glossary in
`docs/components/README.md` before more pages are translated.

## Asked by the reviewer of the two pilot pages

Line numbers are those of the first Arabic version; the wording on the page may
already carry the reviewer's preferred form.

1. `text-field.ar.md`, line 228: التقنيات المساندة (text-field) / التقنيات المساعدة (service-card 76, 274)
   Which of the two names assistive technology in the guide? The reviewer recommends المساعدة; the two pages must agree.
2. `text-field.ar.md`, line 113: فيستطيع القارئ نقل التركيز إليه وتحديد نصه (also 219, 226; service-card 17, 288)
   The English pages say "reader" for the person who uses a form. Is «القارئ» right for someone who types into a field, or should the Arabic pages say «المستخدم»?
3. `text-field.ar.md`, line 150: المظهر المعبّأ / مظهر الإطار
   Names of the filled and the outline appearance of a field: المعبّأ or المملوء; مظهر الإطار or المظهر ذو الإطار?
4. `text-field.ar.md`, line 219: ويعمل المكوّن أيضًا عنصرَ تحكم في نموذج عبر موصّل القيمة الخاص به
   Does an Angular developer understand «موصّل القيمة» as the value accessor, or should the sentence avoid the term?
5. `text-field.ar.md`, line 233: والنص النائب
   Is «النص النائب» the term for a placeholder, or «النص التوضيحي»?
6. `text-field.ar.md`, line 23: اكتب الاسم كما يظهر في وثيقة هويتك.
   Would a Saudi portal write «كما هو مدوَّن في وثيقة إثبات الهوية», or name الهوية الوطنية / هوية مقيم?
7. `text-field.ar.md`, line 117: الجهة: وزارة المثال
   Label and value of the organisation field: «الجهة» or «جهة العمل»; and a fictional name that is not a ministry («شركة المثال»)? The English "Ministry of Example" would change with it.
8. `text-field.ar.md`, line 71: value="مقدم الطلب" in the email field of the Error group
   Do you agree that the invalid email value stays Latin (applicant), as a user would type it, although the rule asks for an Arabic letter in every shown value?
9. `text-field.ar.md`, line 243: ورقة أنماط كود المنصات المزوَّدة (also button.ar.md and tabs.ar.md)
   «المزوَّدة» for the "supplied" Platforms Code files comes from the model pages. Is it understood, or is «المقدَّمة» / «المستلَمة» the word?
10. `service-card.ar.md`, line 296: ضمن مكوّنات المنصات في نطاق المكوّنات
   What is the Arabic for "pattern" outside WAI-ARIA (the row "Platform patterns" of the coverage notes), given that نمط is kept for WAI-ARIA patterns and الأنماط for styles?
11. `service-card.ar.md`, line 229: ويُعرض العنوان عنوانًا من المستوى الثالث
   Title and heading are both «عنوان». Is «عنوان البطاقة ... في عنصر عنوان من المستوى الثالث» the way to keep them apart?
12. `service-card.ar.md`, line 266: أسقِط عنصر رابط يحمل `hwServiceAction`
   The glossary fixes إسقاط المحتوى for content projection. Does the imperative «أسقِط عنصر رابط» read as an instruction to project, or as "drop"? Alternative: «ضع عنصر رابط يحمل ... محتوًى مُسقَطًا».
13. `service-card.ar.md`, line 273: «تقديم»
   Which generic action label does a Saudi portal repeat on every card: «تقديم», «تقديم الطلب» or «ابدأ الخدمة»?
14. `service-card.ar.md`, line 24: <dd>3 أيام</dd> ... <dd>دون رسوم</dd>
   Value of the fee: «دون رسوم», «مجانًا» or «مجانية»? And are Western digits (3) right in the Arabic examples, as in the rest of the guide?
15. `service-card.ar.md`, line 247: قائمة وصفية عمودية
   Is «متراصّة» understood for a stacked list (each description under its term)?

## Glossary rows the reviewer proposes

| English | Arabic | Why |
| --- | --- | --- |
| assistive technology | التقنيات المساعدة | The two pages chose two different words (المساندة, المساعدة); every component page needs the term. |
| label, hint, error message, placeholder (of a form field) | التسمية، النص الإرشادي، رسالة الخطأ، النص النائب | All form pages need them; the note should say that تلميح is the TIP title and that text starting «نص مؤقت» fails HWC-TODO. |
| native input element (the input) against the field | عنصر الإدخال against الحقل | المُدخل is the Angular input; without a row a writer drifts to حقل الإدخال (text-field 181, 235, 243). |
| header, body, footer (of a card or a region) | الترويسة، المتن، التذييل | Used by service-card and agree with ترويسة المنصة and تذييل المنصة of components.json. |
| title (of a card) against heading (element, with its level) | عنوان البطاقة against عنصر عنوان من المستوى الثالث | Both are عنوان; without a rule the sentences read «العنوان عنوانًا». |
| pattern outside WAI-ARIA (the row Platform patterns of docs/coverage.md) | Owner to decide; until then the row name in Latin | نمط is restricted to WAI-ARIA patterns and الأنماط means styles, so the writer took the category label مكوّنات المنصات, which is another list. |
| selects (a stylesheet selector matches) | تستهدف | يحدّد and يضبط are taken; the stylesheet notes of every page without a controller need the verb. |
| controlled, uncontrolled (field, selection) | متحكَّم فيه، غير متحكَّم فيه | Used by tabs.ar.md and text-field.ar.md and not in the glossary. |
| string | سلسلة نصية | Recurs in API prose. |
| focus indicator; reduced motion | مؤشر التركيز؛ تقليل الحركة | Used by button.ar.md and text-field.ar.md; AGENTS.md lists both behaviours for every component. |
| read-only (field) | للقراءة فقط؛ الحقل المخصّص للقراءة فقط | Avoids «الحقل الذي للقراءة فقط». |
| host element (Angular); factory function | العنصر المضيف؛ الدالة المُنشئة | Both recur in Angular and Vue prose. |
| item, entry (of an array option) | البند، البنود | عنصر is a DOM element on every page. |
| where (conditional), with (a prop is given) | عندما، إذا؛ عند كتابة `href` | A note under the table: حيث and «ومع `href`» are calques that both pages repeat. |
| two-way binding | ربط ثنائي الاتجاه | tabs.ar.md and text-field.ar.md attach «ثنائي الاتجاه» to the value or the selection instead of the binding. |

## Open since the model pages

1. «الطراز المرئي» for the visual variant of a component: is it the word, or «النمط المرئي» / «الشكل»?
2. The caption of the keyboard table: «جدول: التفاعل من لوحة المفاتيح مع المكوّن: <الاسم>».
3. The names of the arrow keys: «السهم الأيمن», «السهم الأيسر», «السهم لأعلى», «السهم لأسفل».
4. The category labels of the catalogue: «الإجراءات، النماذج، التنقل، الطبقات المتراكبة، الإظهار والإخفاء، التخطيط، التغذية الراجعة، عرض البيانات، المحتوى، مكوّنات المنصات»; alternatives «التنبيهات والحالة» for feedback and «النوافذ المتراكبة» for overlays.
