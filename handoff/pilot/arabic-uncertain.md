# Renderings the Arabic translators were unsure of

Work in progress, deleted with `handoff/` before the branch merges into `main`. Each translator listed the lines of its page whose rendering it could not settle from the glossary. The line is that of the Arabic page when it was written; a later change to the page may have moved it. An answer that applies to more than one page becomes a row of the Arabic glossary in `docs/components/README.md`.


## docs/components/accordion.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 11 | # أقسام قابلة للطي | The labelAr is plural; the prose names the component 'مكوّن الأقسام القابلة للطي' in subject position to keep agreement. Confirm the form. |
| 229 | يعرض عنصر `summary` الخاصية `aria-expanded="false"` من قبل انتهاء الإغلاق | English 'already exposes' is rendered as 'before the closing ends'; is this the intended reading? |
| 243 | ولا يثبت تطابقًا مرئيًا مع المظهر الرسمي | 'not official visual parity' is rendered without the claim forms رسميًا/منتج رسمي; is 'المظهر الرسمي' acceptable to the owner? |

## docs/components/alert.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 73 | ### المظهر ذو الإطار | The glossary form for the outline appearance of a field is reused for the outline variant of Alert; the Badge page wrote الشكل ذو الإطار for a variant. Which does the lead want for a variant value named outline? |
| 251 | زر إغلاق شفافًا | 'ghost close button' rendered زر إغلاق شفاف (no background). Keep, or name the variant in Latin script? |

## docs/components/app-shell.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 17 | وتمنح الصفحة المنطقة الرئيسية معرّفها عبر `mainId` | English 'marks the main region with mainId' is rendered as giving the region its id through mainId; confirm the meaning is kept. |
| 230 | دون أن يكتب المعرّف الجزئي في عنوان الصفحة | Is المعرّف الجزئي the right reader term for the address fragment (URL hash), or should the page say دون أن يغيّر عنوان الصفحة? |

## docs/components/aspect-ratio.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 47 | عرضه 3 وحدات مقابل كل وحدتين من الارتفاع | English '3 units wide for every 2 units high'; the numeral 2 is written as the dual وحدتين. Keep, or write the numeral? |
| 75 | تضبط ملاءمة هذين العنصرين على التغطية | The CSS value cover is named in Arabic (التغطية) and not in code, as the English names it in plain text. Confirm the term. |

## docs/components/avatar.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | وهي عنصر ثابت: ليست زرًا ولا رابطًا ولا عنصرًا من عناصر النموذج. | 'form control' rendered عنصر من عناصر النموذج; the glossary term عنصر تحكم في النموذج is tied to Angular. Which does the owner prefer here? |
| 24 | <Avatar name="رنا كمال" /> | content:scaffold-ar did not replace the reader prop name of Avatar (name is a token name) and did not report it; I translated name in the 12 React, Vue and Angular blocks by hand so that the four results match the Arabic html block. Should string-map.mjs treat name as reader text where the group's html block shows it as aria-label? |
| 82 | د. سامي حداد / سح | The English example shows given initials that differ from the derived ones (Dr. Sami Haddad would derive DS). The Arabic keeps that: د. سامي حداد derives دس, initials gives سح. Acceptable? |

## docs/components/avatar-group.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | وتضع مكان الصور الرمزية التي تتجاوز حدًّا معيّنًا عددَ الأشخاص المخفيين | Is the order of the clause clear, or is وتعرض بدل الصور الرمزية الزائدة على حدّ معيّن عددَ الأشخاص المخفيين preferred? |
| 24 | aria-label="2 من الأشخاص الآخرين"; count + ' من الأشخاص الآخرين' | The function must keep the tokens of the English one (count + string), so the plural phrase cannot follow Arabic number agreement (شخصان آخران, 3 أشخاص آخرين, 11 شخصًا آخر). I chose the agreement-free form '<n> من الأشخاص الآخرين' (and '<n> من الجهات الأخرى'). Acceptable, or should the English example move to a form that lets each language pick its plural? |

## docs/components/badge.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 37 | ### الألوان الدلالية | 'Tones' has no glossary term; «اللون الدلالي» is used for tone throughout. Owner to confirm (alternative: «الدرجة اللونية»). |
| 39 | فعبارة «مطلوب إجراء» تقول أكثر من «تحذير» | The quoted 'Warning' is rendered as «تحذير», the word of the WARNING alert in the glossary; it is the generic status word here, not the alert. |

## docs/components/breadcrumb.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 215 | شكل سهم زاوي فارغ لا نص فيه | Is سهم زاوي the preferred word for the chevron separator, or should the guide keep a transliteration such as شيفرون? |

## docs/components/button-group.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 91 | يضع التوجّه `horizontal` الأزرار في صف | The glossary reserves الاتجاه for the reading direction; is التوجّه accepted for orientation on every page (ButtonGroup, Divider, Tabs prose)? |

## docs/components/calendar.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | التقويم شبكة تواريخ يُتنقَّل فيها بلوحة المفاتيح | Rendering of 'keyboard date grid'; confirm. |
| 20 | data-hw-locale="ar" / locale="ar" in all twenty live blocks | The English blocks use locale "en"; the Arabic blocks use "ar" (a language tag, which HWC-PAR4 allows to differ) so that month and weekday names render in Arabic beside the Arabic labels. Is "ar" wanted, or should the Arabic page keep "en" or use "ar-SA"? |
| 258 | ينقل التركيز إلى اليوم المجاور في جهة السهم، ففي صفحة من اليمين إلى اليسار ينقل السهم الأيمن التركيز إلى اليوم السابق. | The English cell is written in visual terms (the day on that side); the rule asks Arabic Action cells for logical terms. The cell keeps the English meaning and names the previous day; confirm this form. |

## docs/components/card.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 21 | طلب الخدمة ط-2041 | SR-2041 is rendered «ط-2041», as on the DescriptionList page; the href /requests/sr-2041 stays unchanged. Owner to confirm the form of the reference number. |
| 194 | فالأصناف لا تجعل عنصر `article` زرًّا | English 'a class does not turn an article into a button' is written in the plural, because the glossary test refuses «الصنف» not followed by a class name in code. Meaning unchanged. |

## docs/components/carousel.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | ويُعلَن الموضع الحالي دون مقاطعة القارئ | Is دون مقاطعة القارئ an acceptable rendering of 'politely' (aria-live polite) across the guide? |
| 286 | وتقرّب `select` القيمة إلى العدد الصحيح الأدنى وتحصرها بين الطرفين، أو تلفّها عند الطرفين مع `loop` | Do floors, clamps and wraps read clearly in Arabic as written? |

## docs/components/center.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 126 | حاوية لها حد أدنى لحجمها في اتجاه الكتل | Is this rendering of 'minimum block size' clear, or should it name the CSS property? |
| 194 | وتحتفظ الصيغة `[hwCenter]` بالعنصر الأصلي المكتوبة عليه | الصيغة was chosen for 'form' because الشكل is the variant; is it clear to a reader? |

## docs/components/checkbox.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | مربع الاختيار عنصر إدخال أصلي من نوع مربع الاختيار | The component name and the native input type share one Arabic word; the sentence repeats it. Accept, or name the type in Latin (من النوع checkbox)? |

## docs/components/chip.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 62 | مُقدَّم | 'Submitted' as a request status rendered as «مُقدَّم»; «تم التقديم» is the alternative. |
| 110 | يستدعي الدالة `prepareRemovalFocus` من `@hawiyah/core` بأربع وسائط | The English page says four arguments and lists three (container, activated button, options object); the published declaration (core/dist/removal-focus.d.ts:13) has three parameters. Translated as written; the English page should be corrected first, then carried over. |

## docs/components/collapsible.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | ويعرض عنصر `details` أصليًا فيه عنصر `summary` | The English writes details and summary in plain text; the Arabic puts both element names in code formatting throughout the page. Acceptable, or keep them plain? |
| 166 | ترسم ورقة الأنماط العلامة قناعًا على عنصر `summary` | Is قناع the preferred rendering of a CSS mask for a native reader? |

## docs/components/columns.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 0 | مكوّن الأعمدة | labelAr أعمدة is also the plain word for columns; the prose always writes مكوّن الأعمدة for the component to keep it apart from the columns it lays out. |

## docs/components/combobox.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 22 | {count} نتيجة / count + ' نتيجة' | The suffix form of the English template (count + ' ...') fixes the numeral before the noun; numeral + singular نتيجة is common UI Arabic but ungrammatical for 3 to 10. Acceptable, or should the English examples use a form that lets Arabic write «عدد النتائج: {count}»? |
| 26 | وثيقة الميلاد، وثيقة الإقامة | A Saudi portal says شهادة الميلاد / شهادة الإقامة, but «شهادة» anywhere outside the compliance sentence fails HWT-COMPLIANCE (MARKERS.ar of guide/scripts/content/page-rules.mjs, live blocks included). Keep وثيقة, or should the lead narrow the marker? |
| 28 | خطاب تعريف بالعمل | Rendering of Employment letter; خطاب تعريف بالراتب is also common. |

## docs/components/container.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | مع هامش جانبي على كل جهة | Gutter rendered as الهامش الجانبي although the stylesheet implements it as inline padding; is الحشوة الجانبية preferred? |
| 21 | قُدِّم الطلب رقم 2041 في 4 مارس. | Gregorian month name مارس (not آذار) chosen for a Saudi portal; confirm. |

## docs/components/content-navigation.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 298 | تُتجاهل الأقسام المفقودة والمعطَّلة والمخفية والخاملة والمحجوبة | «الخاملة» for inert and «المحجوبة» for concealed: does a native reader accept both, or prefer keeping `inert` in code? |
| 315 | بدلًا من مراقب التقاطع | «مراقب التقاطع» for an intersection observer (IntersectionObserver): acceptable, or write the API name in Latin script? |

## docs/components/copy-button.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | في عنصر حالة بجانبه يُعلَن دون مقاطعة القارئ | The English says a polite status; the Arabic paraphrases aria-live polite as announced without interrupting the reader. Acceptable, or keep the value polite in Latin? |
| 21 | طلب-2041-7783 | The reference REQ-2041-7783 is rendered as طلب-2041-7783, following the reference numbers of an existing Arabic page (طلب-1042). Confirm this form for a copied reference. |
| 258 | قيمة aria-live فيه polite وقيمة aria-atomic فيه true | The attribute values polite and true stay in Latin script as in the English plain text; confirm. |

## docs/components/data-table.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 20 | data-hw-locale="ar" / locale="ar" | The locale tag of the twelve blocks is changed from en to ar so that the collator sorts the Arabic cell text; a language tag is a token the contract allows to differ. |
| 31 | طلب-1042 ... إيصال-201 | The reference codes REQ-1042 and RC-201 need an Arabic letter in reader text (HWC-PAR8); they follow the Table page as طلب-1042 and إيصال-201. Is that form acceptable? |

## docs/components/date-picker.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 20 | data-hw-locale="ar" / locale="ar" | The locale tag of the twelve blocks is changed from en to ar (a token the contract allows to differ), as on the Calendar page, so month and weekday names render in Arabic. |
| 22 | placeholder="سنة-شهر-يوم" | The placeholder YYYY-MM-DD needs an Arabic letter (HWC-PAR8) and is written سنة-شهر-يوم; in a right-to-left field it reads year first from the right while the typed ISO value shows the year on the left. Is this form acceptable, or should the placeholder be removed from the Arabic example? |

## docs/components/description-list.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 21 | <dd>ط-2041</dd> | The reference number SR-2041 is rendered «ط-2041» in all six example blocks and the strings map, because scaffold-ar reports SR-2041 as an untranslated reader string and HWC-PAR8 requires an Arabic letter. A portal may keep a Latin reference such as SR-2041; owner to confirm the form (the Card page uses the same value). |

## docs/components/divider.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 21 | قُدِّم الطلب 2041 في 4 مارس 2026. | The example date keeps the Gregorian month name مارس, as the English example does; should a Saudi portal example add or prefer the Hijri date? |

## docs/components/empty-state.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 167 | تُدرج الحالة الفارغة ضمن مكوّنات العرض الأولية في نطاق المكوّنات | The English names the coverage row Initial presentation in plain words; it is translated as «مكوّنات العرض الأولية» rather than kept in Latin as «الصف Initial presentation», as the Service card page does for Platform patterns. Owner to confirm which form. |

## docs/components/feedback.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | بخيارَي إجابة | I chose خيار الإجابة for 'choice' so that it is not confused with الخيار, the JavaScript option. Is that acceptable? |
| 20 | شكرًا لك على ملاحظاتك. | Is this the preferred acknowledgement wording for a Saudi service portal, or is شكرًا لتقييمك better? |

## docs/components/field.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | مكوّن التحكم بالقيمة من هوية | Is this the term the owner wants for 'Hawiyah value control' (TextField, NumberField, Select inside a field)? Alternative: مكوّن إدخال من هوية. |
| 13 | ويعرض العنصر الحاوي والتسمية والفقرتين | 'the paragraphs' is rendered as the dual (hint and error); confirm. |
| 157 | ولذلك تكون قيمته الافتراضية شرطة طويلة | English refers to the table's em dash; rendered literally as شرطة طويلة. |

## docs/components/file-dropzone.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 195 | وفوق منطقة إفلات معطَّلة أو مخصّصة للقراءة فقط لا يسمح تأثير الإفلات بأي عملية | English 'the drop effect is none' is rendered without the value none; confirm. |
| 195 | لا تُلغى إلا عمليات السحب التي تحمل ملفات | Literal rendering of 'Only drags that carry files are cancelled' (the default handling of the drag is cancelled); a native reader may prefer a fuller wording. |

## docs/components/file-upload.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 119 | data-message="true" | Not a translation issue: HWC-PAR8 reads the vanilla state attribute data-message of the list example as reader text (a name that ends in 'message') and asks for Arabic script in its value 'true', which the stylesheet selects and must stay. Proposed entry for the lead, guide/scripts/content/arabic-exceptions.json: { file: docs/components/file-upload.ar.md, text: the whole string, reason: state attribute selected by the stylesheet, not reader text } — the 12-character minimum of an entry may need the lead's decision, or the check should not treat data-* attributes as reader names. |
| 124 | بطاقة الهوية.pdf | The file names of the list example are translated (بطاقة الهوية.pdf، إثبات العنوان.pdf، الصورة الشخصية.jpg), because HWC-PAR8 reads the name of a data object as reader text and a file name is not one of the values that are Latin by nature. |

## docs/components/grid.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 0 | justify-content | The CSS property name stays in plain Latin text as in the English page (في خاصية CSS المسمّاة justify-content); code formatting would make the vocabulary check read it. |
| 96 | المدفوعات: طلب واحد. | English writes the digit 1 ('1 request'); Arabic writes طلب واحد, the natural form. Same number, different notation. |
| 98 | الرسائل: رسالتان غير مقروءتين. | English writes the digit 2 ('2 unread'); Arabic uses the dual رسالتان. Same number, different notation. |

## docs/guides/getting-started.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 23 | \| JavaScript المجرّدة \| ... \| محوّل React \| محوّل Vue \| محوّل Angular | The Way cells carry an Arabic word for HWC-PAR8 (the English cells are the bare framework names); is محوّل React etc. acceptable, or should the lead add arabic-exceptions entries for the bare names? |
| 30 | فقد يغيّر إصدار فرعي واجهةً برمجية | 'minor version' rendered as إصدار فرعي without the Latin word minor; confirm the term. |
| 73 | لأن محرّكات المتصفحات التي لا تدعم النطاقات في CSS تطبّق الهندسة الزخرفية للحدّ ذي الاتجاه التلقائي في اتجاه القراءة من اليسار إلى اليمين | Rendering of 'engines without CSS scope' and 'decorative geometry of an automatic boundary' (dir=auto); is النطاقات في CSS / الحدّ ذي الاتجاه التلقائي clear to a technical reader? |
| 91 | ويُقرأ ما يقابل الدالة في المحوّلات من خاصية في القالب لا يحمل اسمها البادئة get، مثل `data-hw-page-label` لدالة تسمية الصفحة | 'function input' is rendered as the counterpart of the adapter function, avoiding المُدخل (the Angular input); does it keep the meaning? |

## docs/components/icon-button.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 193 | وحجم الهدف للأحجام الثلاثة 32 و40 و40 px في الكثافة المريحة؛ وتستخدم الكثافة المدمجة 24 و32 و40 px، وكثافة الجوّال 32 و40 و44 px. | The English names the densities in plain words (comfortable, compact, mobile); the Arabic translates them. Should the density names stay as the `data-hw-density` values in Latin instead? |

## docs/components/inline.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | يرتّب مكوّن الترتيب الأفقي أبناءه | labelAr ترتيب أفقي reads as an action noun; in prose the page writes مكوّن الترتيب الأفقي at first mention and الترتيب الأفقي after it. Confirm or propose another label. |
| 22 | حفظ كمسودة | Common portal wording; حفظ مسودة is the stricter MSA alternative. |

## docs/components/input-group.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 23 | ر.س | SAR is written as the Arabic abbreviation ر.س in the addon; confirm against «ريال» or «ريال سعودي». |
| 55 | ### حجم صغير | Heading 'Small' rendered حجم صغير; confirm. |
| 143 | يكتب القارئ قيمة عنصر الإدخال الرقمي أو عنصر إدخال الرمز بالخط وبالأرقام التي يختارها | 'code input' read as an input for a code (such as a verification code); confirm the reading. |

## docs/components/link.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 187 | فتبقى `href` وتوجيه المسارات وكل الخصائص والأحداث الأصلية على العنصر الحقيقي | The glossary has no term for an Angular directive; the Button page writes التوجيه, which also reads as routing. Is توجيه المسارات clear for the router directive, or should the glossary fix another term for directive (for example الموجّه)? |
| 197 | وفي وضع الألوان القسرية تستخدم ورقة الأنماط ألوان الروابط في النظام. | Is وضع الألوان القسرية the preferred term for forced-colours mode (alternative: وضع التباين العالي, which names only one of its uses)? |

## docs/components/menu.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 201 | على المشغِّل يفتح القائمة وينقل التركيز إلى أول بند متاح، وعلى بند يفعّله ... | The English cell joins its three cases with semicolons; the Arabic joins them with commas to stay one sentence. Confirm the punctuation. |
| 216 | يقارن البحث بالكتابة الحروف المكتوبة بنصوص البنود | Is البحث بالكتابة the preferred term for type-ahead? |

## docs/components/meter.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | قياسًا عدديًا واحدًا ضمن نطاق معروف | Is قياس عددي واحد a natural rendering of 'scalar measurement', or is قيمة قياس واحدة better? |
| 59 | عبر العناصر الزائفة الخاصة بـWebKit وBlink | العناصر الزائفة for CSS pseudo-elements: keep, or write pseudo-elements in Latin script? |

## docs/components/mobile-top-bar.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | الترويسة العلوية للجوال هي ترويسة الصفحة على الشاشة الضيقة | labelAr says للجوال while the English says narrow screen; the summary keeps both, is that acceptable? |
| 209 | لا يقلّ حجم هدف كل إجراء عن 44 px | Units kept in Latin (px) as on the English page; confirm that px stays Latin in Arabic prose. |

## docs/components/multi-select.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 24 | وثيقة الميلاد، وثيقة الإقامة | As on Combobox: «شهادة» is refused by HWT-COMPLIANCE. |
| 92 | {count} محدَّد / count + ' محدَّد' | The suffix form of the English template (count + ' ...') fixes the numeral before the noun; is the terse «3 محدَّد» acceptable UI Arabic? |

## docs/components/navigation-drawer.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 12 | درج التنقل لوحة جانبية مشروطة | Is مشروطة the preferred term for modal, or should the guide use another word (for example نافذة حوار مشروطة)? |
| 208 | درج التنقل في تصدير Mobile Components المزوَّد | I kept the name of the supplied export, Mobile Components, in Latin script. Should it have an Arabic gloss? |

## docs/components/notification-list.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 130 | تعيين كمقروء: استلام الدفعة | Is تعيين كمقروء the preferred button text for mark as read, and إزالة for dismiss, on a Saudi portal? |
| 237 | وعند وجود إجراءات اكتب على القسم الخاصية `tabindex` بالقيمة `-1` | `tabindex="-1"` in code fails HWC-VOCAB (-1 is not an enumerated value), so the value is written as a separate code span. Acceptable? |

## docs/components/number-field.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | الحقل الرقمي حقل لإدخال رقم | English 'a numeric entry'; rendered as a field for entering a number. Confirm the register. |
| 189 | بأرقام لاتينية وبنقطة فاصلةً عشرية | 'Latin digits' rendered أرقام لاتينية; an editor may prefer الأرقام العربية الغربية (0-9). Which is the guide's term? |

## docs/components/page-header.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | يفتتح مكوّن عنوان الصفحة صفحةً أو قسمًا بعنوانه | The component is named مكوّن عنوان الصفحة in prose to keep it apart from العنوان (its title); is this form acceptable, or should prose use the bare labelAr? |
| 240 | معلَم الترويسة العامة (banner) | Term for the ARIA banner landmark; the glossary has none. |

## docs/components/pagination.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 20 | goLabel="انتقال" | The button 'Go' of the jump field is translated انتقال; is اذهب or عرض preferred on a Saudi portal? |

## docs/components/password-field.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 80 | استخدم 12 خانة على الأقل. | Is خانة the expected word for password characters on a Saudi portal, or حرفًا ورمزًا? |

## docs/components/pin-input.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 116 | خانات زخرفية | Is خانة the right word for the decorative slots of PinInput? |
| 182 | الأرقام الهندية العربية والأرقام العربية الشرقية ... أرقامًا لاتينية | Does the owner prefer الأرقام العربية (0-9) over الأرقام اللاتينية for Latin digits? |

## docs/components/popover.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 149 | استخدم مكوّن قائمة الإجراءات لقائمة إجراءات تتبع سلوك لوحة المفاتيح الخاص بالقوائم | The English names the Menu component in plain text without a link; the Arabic names it by its labelAr. Confirm that no link is wanted. |

## docs/components/portal-footer.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | منطقة العلامة | brand is rendered as العلامة (brand marks شعارات العلامة); an alternative is الهوية, avoided because it is the name of the library. |
| 34 | الروابط القانونية | The example string for the Legal navigation label; Saudi portals also use المعلومات النظامية. |

## docs/components/portal-header.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 17 | العلامة تعرّف بالمنتج | I rendered 'the identity of the product' with تعرّف بالمنتج, so that هوية, the product name, is not used as a common noun. Is العلامة the preferred term for brand? |
| 262 | وفي العرض الواسع تبقى الروابط ظاهرة. | I rendered 'The desktop links stay visible' as the wide layout rather than سطح المكتب. Is that right? |

## docs/components/portal-layout.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 340 | دون عمل الدالة `enhance()` يبقى تنقل vanilla ظاهرًا | English 'Without enhancement' is rendered as 'without enhance() running'; confirm this reading, or choose a noun for enhancement. |
| 359 | مسافات اللوحة ومستوى ارتفاعها وأعمدتها | Is مستوى الارتفاع the preferred term for elevation, or should the page name the shadow (الظل)? |

## docs/components/progress.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | شريط التقدم عنصر `progress` أصلي بأنماط هوية. | labelAr is «تقدم»; the prose names the component «شريط التقدم», since «التقدم» alone does not read as an element. Owner to confirm. |
| 21 | جارٍ رفع مستنداتك: 60 من 100 ملف | Example string for 'Uploading your documents: 60 of 100 files'; the numerals stay Western as in the English example. |

## docs/components/radio.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | الخيار الواحد زر اختيار أصلي | labelAr خيار واحد names the component; the native input is زر اختيار. Confirm the pair. |
| 204 | ينقل <kbd>السهم السفلي</kbd> و<kbd>السهم الأيمن</kbd> والسهمان المقابلان لهما | Keys kept in the English order (Down Arrow, Right Arrow; then Left Arrow, Right Arrow) as HWC-KEYS requires outside a keyboard table; does it read naturally? |

## docs/components/search-field.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 50 | ترخيص القيادة | A Saudi portal says رخصة القيادة, but the glossary excludes رخصة on any line of an Arabic page (live blocks included); is ترخيص القيادة acceptable, or should the glossary rule allow رخصة in example strings? |
| 265 | أقرب مربع حوار مشروط | Is مربع حوار مشروط the term the owner wants for a modal dialog (the Dialog page is not translated yet)? |

## docs/components/secondary-nav.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | وليس له سلوك قائمة تبويبات ولا سلوك قائمة أوامر | Is قائمة أوامر acceptable for an ARIA menu, to keep it apart from القائمة (a list)? |
| 20 | aria-label="مجال الخدمة" | Is مجال الخدمة the natural portal wording for 'Service area', or would أقسام الخدمة read better as a landmark name? |

## docs/components/section.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 113 | ### الدرجة اللونية للعلامة | Heading for 'Brand tone' (value brand, the subtle primary colour). Is العلامة clear for brand, or is الدرجة اللونية الأساسية preferred? |
| 258 | يُعيَّن لعنصر `section` الأصلي الذي لا اسم له الدورُ العام | 'maps to the generic role' rendered without the Latin role name generic. Confirm. |

## docs/components/select.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | ويبقى للنظام الأساسي عرض القائمة المنسدلة | "the platform" is rendered النظام الأساسي here and in the Accessibility list; confirm the term. |
| 26 | استبدال | "Replacement" (of a document) is rendered استبدال; a Saudi portal may write بدل فاقد or بدل تالف, which narrows the meaning. |
| 187 | إفادة | The option "Certificate" is rendered إفادة to keep the claim word شهادة out of the page; confirm, or name another document type. |

## docs/components/service-details.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 106 | ### متطلبات بعرض مخصّص | The heading renders Rich requirements by its meaning (the application renders each entry itself). Acceptable? |
| 233 | عنصر `hw-description-list` من المكوّن [DescriptionList](description-list.md) | The link keeps the English file name because description-list has no Arabic page yet (pending translation); the guide then links it to GitHub. Should it point to description-list.ar.md once that page exists? |

## docs/components/side-navigation.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 153 | يكتب التطبيق بلغة الصفحة اسم المعلَم وتسميات البنود وأيقونات الحزم التي يسمّيها البند عبر `icon` | The English sentence says the packaged icons are written in the language of the page; the Arabic keeps that meaning. Should the English page say instead that the application chooses the icons? |

## docs/components/sidebar.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 319 | العرض الافتراضي للعمود الجانبي | English 'the default sidebar width' (the width of the secondary column); rendered as the default width of the side column rather than of the whole component. Confirm. |

## docs/components/site-verification.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | عنصر إظهار وإخفاء أصلي يقع فوق ترويسة الموقع | disclosure is written with the glossary term عنصر الإظهار والإخفاء throughout; it is long when repeated, confirm. |
| 25 | <bdi>portal.example.test</bdi> | The domain is Latin by nature and stays Latin in the four blocks (lines 25, 37, 50, 63), as the task requires. HWC-PAR8 refuses it in the vanilla block, because only values of type email, url, tel or number are excepted. Proposed entry for the lead's guide/scripts/content/arabic-exceptions.json: { "file": "docs/components/site-verification.ar.md", "text": "portal.example.test", "reason": "A domain name is a value Latin by nature, shown in a bdi element; the reserved .test domain of the English example is kept.", "approvedBy": "lead" }. Alternative if the lead prefers no entry: an Arabic IDN under the IANA test label إختبار, which changes a value that the English page keeps. |

## docs/components/skeleton.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | عنصر التحميل شكل زخرفي يحجز مكان المحتوى في أثناء تحميله. | labelAr is «عنصر تحميل»; the prose uses «عنصر التحميل» for the component and «العنصر البديل» for 'placeholder'. Owner to confirm. |
| 146 | اضبط حجم عنصر التحميل بخاصيتَي CSS inline-size وblock-size | The two CSS property names are plain Latin text, as in the English page; in code formatting HWC-VOCAB refuses them (not in vocabulary-allow.json). Should the lead add inline-size and block-size to the CSS group of vocabulary-allow.json? |

## docs/components/slider.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 55 | formatValue={value => `${value} أيام`} | The example formats every value from 1 to 30 with «أيام», which is correct Arabic only for 3 to 10; the shown value 7 reads correctly («7 أيام»). A formatter with Arabic number agreement would change the code of the example, so it was not done; the owner may prefer another wording. |
| 108 | اختر نسختين على الأقل للطلب المشترك. | The English error string writes the digit 2 ('at least 2 copies'); Arabic uses the dual «نسختين» without a digit. Same meaning. |

## docs/components/spacer.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 23 | سحب الطلب | Is سحب الطلب the expected button label for 'Withdraw' a request on a service portal (alternative: إلغاء الطلب)? |
| 55 | والرقم 8 هو رمز المسافات 8 | Is رمز المسافات acceptable for 'spacing token', or should token be متغيّر التصميم across the guide? |

## docs/components/spinner.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 161 | والحلقة مفتوحة من جهة النهاية | 'open on its end side' (the inline-end side) is rendered as «من جهة النهاية»; «من جهة نهاية السطر» would be more explicit. Owner to confirm. |
| 172 | ويدير الأساس الافتراضي لكود المنصات في `@hawiyah/styles` مؤشرَ التحميل في 1000 ملّي ثانية | 'The default Platforms Code foundation of @hawiyah/styles' is rendered as «الأساس الافتراضي لكود المنصات»; the README speaks of the DGA/custom motion roles (--hw-duration-spinner: 1000ms). Is «الأساس» the right word for 'foundation' here? |

## docs/components/stack.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 21 | قُدِّم الطلب 2041 في 4 مارس. | Gregorian month name مارس was used for '4 March'; should a Saudi portal example write it differently (for example with the Hijri date)? |
| 131 | وتُكتب بشرطتين ثم hw ثم شرطة ثم gap | The English spells the property name out in words; the Arabic keeps that form. Is it readable? |

## docs/components/stat.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 24 | بزيادة 12% عن الشهر الماضي | The percent sign and Western digits are kept as in the English example; the page does not format numbers. |
| 69 | بزيادة 2 عن الأسبوع الماضي | Trend string for '2 more than last week' (also quoted at line 221); the count noun is left implicit as in the English. A portal might write «بزيادة طلبين عن الأسبوع الماضي», which changes the digit to a word; owner to confirm. |

## docs/components/stepper.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 198 | هي complete أو current أو upcoming | The data-status values are kept in plain Latin text as in the English page (not code); confirm, or should they be in code formatting (vocabulary-checked) or in Arabic words? |
| 261 | حالتَي الخطوة السابقة والخطوة الحالية، تقدّمًا أو رجوعًا | Rendering of 'in either direction' chosen to avoid في كلا الاتجاهين; confirm. |

## docs/components/switch.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 149 | آلية المنع التي تُبقي القيمة دون تغيير | "guard" is rendered آلية المنع on all four pages; confirm or give the preferred term. |
| 216 | «الإشعارات مفعَّلة» التي تتحوّل إلى «الإشعارات متوقفة» | The two quoted labels render "Notifications on" and "Notifications off"; is متوقفة the wording the owner prefers over غير مفعَّلة? |

## docs/components/table.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 25 | طلب-1042 | HWC-PAR8 requires Arabic script in the cell text, so the references REQ-1042 to REQ-1044 and RC-201 to RC-203 are written طلب-1042 and إيصال-201; a portal may keep Latin reference codes. |
| 168 | سجل الميلاد | 'Birth certificate' is «شهادة الميلاد» in Saudi usage, but HWT-COMPLIANCE refuses «شهادة» anywhere outside the compliance sentence, also in a live block; «سجل الميلاد» is used. The lead may prefer an exception. |
| 347 | فعرّفه اسمًا مستعارًا للنوع (type alias) لا واجهة (interface). | The TypeScript terms are added in Latin script in parentheses for clarity; they are not in the English sentence. |

## docs/components/tag-input.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 79 | data-hw-value='["تجديد","عاجل"]' and ['تجديد', 'عاجل'] | content:scaffold-ar left the tag values Renewal and Urgent untranslated (strings of a value array), though they render as the visible tags and in the names of the remove buttons. I translated them by hand in the four blocks of the groups tags and readonly; check:page passes. Should string-map.mjs read the strings of a TagInput value array as reader text? |

## docs/templates/form.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 16 | ### النموذج في حالة السكون | Is «في حالة السكون» the preferred rendering of 'at rest', or «في حالته الأولية»? |
| 18 | ويحمل النموذج الخاصية novalidate، | novalidate stays in plain Latin as in the English page, because HWC-VOCAB refuses it in code formatting; should vocabulary-allow.json accept native HTML attributes such as novalidate? |
| 429 | [عنوان الصفحة](../components/page-header.md) | The Composition links use the Arabic titles of the component pages instead of the export names of the English page; confirm this is the preferred form for templates. |
| 436 | ويحمل الحقل قيمة ثابتة في المثالين | The English 'The group holds a fixed value' is rendered as 'the field holds a fixed value in both examples'; confirm this is the intended meaning. |
| 447 | بالمكوّن FileUpload أو FileDropzone ... بالمكوّن Button من النوع submit | Component and type names stay in plain Latin as in the English Sources item; should they be in code formatting in both languages? |

## docs/templates/home.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 14 | وذات ثلاثة أعمدة ابتداءً من الدرجة `md` في [الشبكة](../components/grid.md) | Is الدرجة the right word for a breakpoint step of Grid, or does grid.ar.md use another term (نقطة التوقف)? |
| 234 | وتعرض الصفحة الحقل في حالة السكون، كما تعرضه حالات القالب الأخرى. | Does حالة السكون read naturally for a field shown at rest (not focused, no input)? |
| 440 | [عنوان الصفحة](../components/page-header.md) يفتتح الحاوية الرئيسية بعنوان الصفحة | The component label عنوان الصفحة (components.json) coincides with the page title it shows; is the sentence clear, or should the link text be المكوّن عنوان الصفحة? |
| 452 | وتُدرج الملاحظات هيكل البوابة في الصف Platform patterns | The English names PortalLayout in Latin; the Arabic uses its label هيكل البوابة. Keep, or write `PortalLayout`? |

## docs/templates/search.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 10 | ويتولّى كل نص وكل عنوان وجهة والصفحة المعروضة | «عنوان وجهة» for every address (URL); is «كل رابط» clearer? |
| 16 | ### النتائج روابط / ### النتائج بطاقات خدمات | Are these nominal-sentence headings acceptable, or is «عرض النتائج روابطَ» preferred? |
| 234 | <dd>مستحقة</dd> (Fee: Paid) | Is مستحقة the right counterpart of مجانًا for a paid service fee, or should a portal write بمقابل مالي? |
| 421 | تصرح الإقمة (residnce permt) | The misspelled query is rendered by dropping one letter from each word; is it recognisable as a misspelling of تصريح الإقامة? |
| 428 | 0 نتيجة للبحث عن تصرح الإقمة | Keeps the digit 0 for parity with the English count; a portal may prefer «لا توجد نتائج للبحث عن ...». |

## docs/templates/service.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 8 | # الخدمة | The English h1 is Service; is الخدمة clear as the title of a template page, or should it read صفحة الخدمة? |
| 25 | <dt>القناة</dt><dd>إلكترونيًا</dd> | Is إلكترونيًا the value a Saudi portal shows for the channel Online, or عبر الإنترنت / المنصة الإلكترونية? |
| 173 | ويُختار الخط الزمني بدلًا من [الخطوات](../components/stepper.md) لأن مكوّن الخطوات يعرض حالة كل مرحلة | The label of Stepper (خطوات) coincides with the steps of the service; is مكوّن الخطوات after the link clear enough? |
| 179 | تُدرج [ملاحظات التغطية](../coverage.md) تفاصيل الخدمة في الصف Platform patterns، ومسار التنقل في الصف Initial interaction/navigation | The English says group; the Arabic writes الصف, as the component pages do for the rows of docs/coverage.md. Keep الصف, or write المجموعة? |

## docs/components/textarea.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 88 | ### للقراءة فقط | The glossary form for a heading is used; the TextField page writes «حقل مخصّص للقراءة فقط» for the same heading. Which should the set follow? |

## docs/components/timeline.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 13 | وحالة اختيارية من complete أو current أو upcoming | The state values stay Latin in plain text, as in the English page: code formatting fails HWC-VOCAB (complete, current, upcoming, datetime and item are not accepted as code values). Should they be Arabic words instead (مكتملة، حالية، قادمة)? |
| 21 | 2 مارس 2026 | The example dates use the Gregorian month name مارس and Western digits; a Saudi portal may add the suffix م (2 مارس 2026م) or show Hijri dates. Confirm the form (used the same way on notification-list). |

## docs/components/toggle-group.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 24 | البريد العادي | The English option 'Post' (postal mail) is translated as البريد العادي to keep it apart from البريد الإلكتروني; is البريد الورقي or العنوان الوطني more usual on a Saudi portal? |
| 25 | اختر الطريقة التي يردّ بها المكتب على الطلب. | 'the office' is rendered المكتب; would الجهة read more naturally? |

## docs/components/tooltip.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 11 | # تلميح | The glossary keeps تلميح for the TIP alert and the labelAr names the component تلميح; the page has no TIP alert, so no clash occurs here. Confirm. |
| 128 | والعنصر المضيف هو الغلاف الذي يُحدَّد موضع التلميح بالنسبة إليه | 'the positioned wrapper' is rendered by its function (the box the tooltip is positioned against); is this precise enough? |

## docs/components/tree-view.ar.md

| Line | Text | Question |
| --- | --- | --- |
| 12 | مثل مجلدات ملف المعاملة ومستنداته | Case file is rendered as ملف المعاملة (also in the example name مجلدات ملف المعاملة) rather than ملف القضية, which reads as legal; confirm. |
