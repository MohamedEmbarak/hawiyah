---
source:
  summary: fa402f6e5c26
  example: b3f4e725f388
  variants-and-states: aae499fb25d0
  api: 27af517d4805
  accessibility: 95c2f6a6aee3
  rtl-and-localisation: 956b9ceab8ad
  platforms-code-reference: f74d0e9546b2
---
# تفضيلات الخصوصية

مكوّن تفضيلات الخصوصية منطقة تطلب من القارئ قبول ملفات تعريف الارتباط الاختيارية أو رفضها. ويبلّغ التطبيقَ بالاختيار ثم يُغلَق، ويقرّر التطبيق ما يُخزَّن والبرامج النصية التي تعمل.

## مثال

تُسمّى المنطقة بعنوانها، وتحتوي على وصف قصير وإجراءين، هما القبول والرفض، وإجراء القبول أولًا. ويبلّغ كل من الإجراءين عن اختيار ويُغلق المنطقة. اكتب تسميات تذكر ما يفعله الاختيار، ليتمكّن القارئ منه دون أن يقرأ السياسة أولًا.

```html live example=basic static differences=cookie-consent-adapter-markup
<section class="hw-cookie-consent" data-hw="cookie-consent" aria-labelledby="basic-consent-title">
  <h2 id="basic-consent-title">تفضيلات ملفات تعريف الارتباط</h2>
  <p>نستخدم ملفات تعريف الارتباط لإبقائك مسجَّل الدخول ولتذكّر لغتك. اختر ما إذا كنت تسمح بملفات تعريف الارتباط غير الضرورية.</p>
  <div class="hw-button-group">
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-consent="accepted">قبول جميع ملفات تعريف الارتباط</button>
    <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-consent="rejected">رفض ملفات تعريف الارتباط الاختيارية</button>
  </div>
</section>
```

```tsx live example=basic
<CookieConsent
  title="تفضيلات ملفات تعريف الارتباط"
  description="نستخدم ملفات تعريف الارتباط لإبقائك مسجَّل الدخول ولتذكّر لغتك. اختر ما إذا كنت تسمح بملفات تعريف الارتباط غير الضرورية."
  acceptLabel="قبول جميع ملفات تعريف الارتباط"
  rejectLabel="رفض ملفات تعريف الارتباط الاختيارية"
/>
```

```vue live example=basic
<CookieConsent
  title="تفضيلات ملفات تعريف الارتباط"
  description="نستخدم ملفات تعريف الارتباط لإبقائك مسجَّل الدخول ولتذكّر لغتك. اختر ما إذا كنت تسمح بملفات تعريف الارتباط غير الضرورية."
  accept-label="قبول جميع ملفات تعريف الارتباط"
  reject-label="رفض ملفات تعريف الارتباط الاختيارية"
/>
```

```ts live example=basic framework=angular
template: `<hw-cookie-consent
  title="تفضيلات ملفات تعريف الارتباط"
  description="نستخدم ملفات تعريف الارتباط لإبقائك مسجَّل الدخول ولتذكّر لغتك. اختر ما إذا كنت تسمح بملفات تعريف الارتباط غير الضرورية."
  acceptLabel="قبول جميع ملفات تعريف الارتباط"
  rejectLabel="رفض ملفات تعريف الارتباط الاختيارية"
/>`
```

## الأشكال والحالات

### رابط السياسة والتفضيلات

يلي رابطُ السياسة الوصفَ عندما يوفّر التطبيق وجهته وتسميته. ويفتح إجراء ثالث شفاف التفضيلاتِ الخاصة بالتطبيق عندما يستمع التطبيق إليه؛ ولا يفعل الإجراء إلا الإبلاغ، ويعرض التطبيق التفضيلات.

```html live example=preferences static differences=cookie-consent-adapter-markup
<section class="hw-cookie-consent" data-hw="cookie-consent" aria-labelledby="preferences-consent-title">
  <h2 id="preferences-consent-title">تفضيلات ملفات تعريف الارتباط</h2>
  <p>نستخدم ملفات تعريف الارتباط لإبقائك مسجَّل الدخول ولتذكّر لغتك. اختر ما إذا كنت تسمح بملفات تعريف الارتباط غير الضرورية.</p>
  <a class="hw-link" href="/cookie-policy">الاطلاع على سياسة ملفات تعريف الارتباط</a>
  <div class="hw-button-group">
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-consent="accepted">قبول جميع ملفات تعريف الارتباط</button>
    <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-consent="rejected">رفض ملفات تعريف الارتباط الاختيارية</button>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md">إدارة التفضيلات</button>
  </div>
</section>
```

```tsx live example=preferences
<CookieConsent
  title="تفضيلات ملفات تعريف الارتباط"
  description="نستخدم ملفات تعريف الارتباط لإبقائك مسجَّل الدخول ولتذكّر لغتك. اختر ما إذا كنت تسمح بملفات تعريف الارتباط غير الضرورية."
  acceptLabel="قبول جميع ملفات تعريف الارتباط"
  rejectLabel="رفض ملفات تعريف الارتباط الاختيارية"
  policyHref="/cookie-policy"
  policyLabel="الاطلاع على سياسة ملفات تعريف الارتباط"
  preferencesLabel="إدارة التفضيلات"
  onPreferences={() => undefined}
/>
```

```vue live example=preferences
<CookieConsent
  title="تفضيلات ملفات تعريف الارتباط"
  description="نستخدم ملفات تعريف الارتباط لإبقائك مسجَّل الدخول ولتذكّر لغتك. اختر ما إذا كنت تسمح بملفات تعريف الارتباط غير الضرورية."
  accept-label="قبول جميع ملفات تعريف الارتباط"
  reject-label="رفض ملفات تعريف الارتباط الاختيارية"
  policy-href="/cookie-policy"
  policy-label="الاطلاع على سياسة ملفات تعريف الارتباط"
  preferences-label="إدارة التفضيلات"
  @preferences="() => undefined"
/>
```

```ts live example=preferences framework=angular
template: `<hw-cookie-consent
  title="تفضيلات ملفات تعريف الارتباط"
  description="نستخدم ملفات تعريف الارتباط لإبقائك مسجَّل الدخول ولتذكّر لغتك. اختر ما إذا كنت تسمح بملفات تعريف الارتباط غير الضرورية."
  acceptLabel="قبول جميع ملفات تعريف الارتباط"
  rejectLabel="رفض ملفات تعريف الارتباط الاختيارية"
  policyHref="/cookie-policy"
  policyLabel="الاطلاع على سياسة ملفات تعريف الارتباط"
  preferencesLabel="إدارة التفضيلات"
  (preferences)="null"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createCookieConsent

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `onConsent` | `(choice: 'accepted' \| 'rejected') => void` | `false` | — |
| `storageKey` | `string` | `false` | — |

تضيف الدالة `createCookieConsent(root, options)` السلوك إلى منطقة كتبها التطبيق؛ وتنشئها الدالة `enhance()` لكل عنصر يحمل `data-hw="cookie-consent"`. والترميز هو الواجهة البرمجية: عنصر `section` بالصنف `hw-cookie-consent` يسمّيه عنصر `h2` الخاص به عبر `aria-labelledby`، وفقرة فيها الوصف، ورابط اختياري بالصنف `hw-link`، وعنصر `div` بالصنف `hw-button-group` يحتوي على الأزرار. ويبلّغ الزر الذي تُضبط فيه الخاصية `data-hw-consent` على `accepted` أو `rejected` عن ذلك الاختيار؛ فاكتب على زر الرفض `data-variant="secondary"`، ليحتفظ إجراء القبول بالإبراز الأساسي. ولا يحتاج زر التفضيلات إلى أي خاصية يقرؤها المتحكم، لأن التطبيق يربط به معالجه الخاص. والمنطقة مفتوحة ما لم تكن قيمة `open` هي `false`، ويضبط المتحكم الخاصية `hidden` ما دامت مغلقة. وتفتح `setOpen(open)` المنطقة أو تغلقها، وتبلّغ `choose(choice)` عن اختيار كما يفعل النقر على زر، وتقرأ `open` الحالة، وتزيل `destroy()` المستمعات. ويُرسل الاختيار الحدث `hw:change` وفي تفاصيله الاختيار تحت المفتاح consent، ويستدعي `onConsent`، ثم يُغلق المنطقة، فيُرسَل الحدث `hw:change` مع `open` وتُستدعى `onOpenChange`. وحفظ الاختيار لا يعمل إلا عند طلبه: عند كتابة `storageKey` يخزّن المتحكم الاختيار في التخزين المحلي للمتصفح تحت ذلك المفتاح، وتبدأ المنطقة مغلقة إذا كان مفتاحها يحمل اختيارًا من قبل. وعندما يمنع المتصفح التخزين، تبقى المنطقة قابلة للاستخدام، ويُبلَّغ عن الاختيار مع ذلك.

### React

جدول: خصائص CookieConsent

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `true` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `onConsent` | `(choice: 'accepted' \| 'rejected') => void` | `false` | — |
| `acceptLabel` | `string` | `true` | — |
| `rejectLabel` | `string` | `true` | — |
| `variant` | `'banner'` | `false` | — |
| `policyHref` | `string` | `false` | — |
| `policyLabel` | `string` | `false` | — |
| `onPreferences` | `() => void` | `false` | — |
| `preferencesLabel` | `string` | `false` | — |

تُعرض الخاصية `title` في عنصر عنوان من المستوى الثاني يسمّي المنطقة، وتُعرض الخاصية `description` في فقرة؛ وكلتاهما مطلوبة، وكذلك `acceptLabel` و`rejectLabel`. ويستدعي إجراءا القبول والرفض `onConsent` بالاختيار، ويُغلقان المنطقة. والمنطقة مفتوحة افتراضيًا؛ استخدم `open` مع `onOpenChange` للتحكم فيها، أو `defaultOpen` لضبط الحالة الأولية. وتعرض الخاصية `policyHref` رابط السياسة بعد الوصف، وتكون `policyLabel` عندئذ مطلوبة. وتعرض الخاصية `onPreferences` الزر الأخير الشفاف، الذي لا يفعل إلا استدعاء المعالج، وتكون `preferencesLabel` عندئذ مطلوبة. وتُعرض `children` بعد رابط السياسة. وتحمل المنطقة الخاصية `hidden` ما دامت مغلقة. ولا يخزّن المكوّن شيئًا، ولا يشغّل أي برنامج نصي؛ فحفظ الاختيار وتفعيل ملفات تعريف الارتباط والتركيز بعد الإغلاق من مسؤولية التطبيق.

### Vue

جدول: خصائص CookieConsent وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `true` |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `true` | — |
| `acceptLabel` | prop | `string` | `true` | — |
| `rejectLabel` | prop | `string` | `true` | — |
| `preferencesLabel` | prop | `string` | `false` | — |
| `policyHref` | prop | `string` | `false` | — |
| `policyLabel` | prop | `string` | `false` | — |
| `variant` | prop | `'banner'` | `false` | — |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `consent` | event | `(choice: 'accepted' \| 'rejected') => void` | `false` | — |
| `preferences` | event | `() => void` | `false` | — |
| `default` | slot | — | `false` | — |

الخصائص `title` و`description` و`acceptLabel` و`rejectLabel` سلاسل نصية مطلوبة. ويُرسل إجراءا القبول والرفض الحدث `consent` بالقيمة `'accepted'` أو `'rejected'`، ويُغلقان المنطقة. اربط حالة الفتح بالتوجيه v-model على `open`، أو استخدم `defaultOpen` لمنطقة غير متحكَّم فيها تبدأ مفتوحة. وتعرض الخاصية `policyHref` رابط السياسة بعد الوصف، وتكون `policyLabel` عندئذ مطلوبة. ويعرض الحدث `preferences` الزر الأخير الشفاف ما دام له مستمع مربوط، وتكون `preferencesLabel` عندئذ مطلوبة. ويُعرض المنفذ الافتراضي بعد رابط السياسة. وتحمل المنطقة الخاصية `hidden` ما دامت مغلقة؛ ولا يخزّن المكوّن شيئًا، والتركيز بعد الإغلاق من مسؤولية التطبيق. ويسرد الجدول المنفذ الذي يقرؤه الإصدار المنشور؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-cookie-consent ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `description` | input | `string` | `true` | — |
| `acceptLabel` | input | `string` | `true` | — |
| `rejectLabel` | input | `string` | `true` | — |
| `preferencesLabel` | input | `string` | `false` | `''` |
| `policyHref` | input | `string` | `false` | `''` |
| `policyLabel` | input | `string` | `false` | `''` |
| `variant` | input | `'banner'` | `false` | — |
| `open` | input | `boolean` | `false` | `true` |
| `openChange` | output | `boolean` | `false` | — |
| `consent` | output | `'accepted' \| 'rejected'` | `false` | — |
| `preferences` | output | `void` | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwCookieConsentComponent` على `hw-cookie-consent`، والعنصر المضيف هو المنطقة: يحمل `role="region"`، ويحمل الخاصية `hidden` ما دامت المنطقة مغلقة. والمُدخلات `title` و`description` و`acceptLabel` و`rejectLabel` مطلوبة. اربط `[(open)]` ربطًا ثنائي الاتجاه بحالة الفتح. ويُرسل إجراءا القبول والرفض المُخرج `consent` بالقيمة `'accepted'` أو `'rejected'` مرة واحدة، ويُغلقان المنطقة، ويُرسلان المُخرج `openChange` بالقيمة `false`؛ ولا يُرسَل شيء عندما يغيّر التطبيق `open`. ويعرض المُدخل `policyHref` رابط السياسة بعد الوصف، ويكون `policyLabel` عندئذ مطلوبًا. ويعرض ربط `(preferences)` الزر الأخير الشفاف، ويكون `preferencesLabel` عندئذ مطلوبًا. ويُعرض المحتوى المُسقَط بعد رابط السياسة. وتحلّ الخاصية `aria-label` أو `aria-labelledby` التي يكتبها التطبيق على العنصر المضيف محلّ الإشارة إلى عنصر العنوان.

## إمكانية الوصول

في vanilla وReact وVue يعرض مكوّن تفضيلات الخصوصية عنصر `section` يقدّمه المتصفح منطقةً، ويسمّيه عنصر عنوانه عبر `aria-labelledby`. وفي Angular يكون العنصر المضيف `hw-cookie-consent` هو المنطقة، ويحمل `role="region"`؛ ولا يُعرض عنصر `section`. وفي React وVue تحلّ الخاصية `aria-label` أو `aria-labelledby` التي يكتبها التطبيق محلّ تلك الإشارة. والمنطقة ليست مشروطة، وليس فيها حصر للتركيز، فيستطيع القارئ متابعة استخدام الصفحة ما دامت مفتوحة.

- ترتيب المحتوى هو عنصر العنوان، فالوصف، فرابط السياسة، فالمحتوى المُسقَط، فالأزرار، والأزرار بالترتيب: القبول، فالرفض، فالتفضيلات. ويتبع ترتيبُ التنقل بلوحة المفاتيح هذا الترتيب.
- زرّا القبول والرفض زرّان أصليان. ولا تنقل المنطقة التركيز عند إغلاقها، فانقل التركيز إلى العنوان الرئيسي للصفحة، أو إلى العنصر الذي يعيد فتح التفضيلات.
- تحمل المنطقة الخاصية `hidden` ما دامت مغلقة، فتخرج من شجرة إمكانية الوصول ومن ترتيب التنقل بالمفتاح Tab.
- يجب ألا يغطّي الشريط المثبَّت عند نهاية النافذة عنصرًا عليه التركيز. فامنح الصفحة حشوة مماثلة عند نهايتها ما دام الشريط مفتوحًا.
- تبلّغ المنطقة عن الاختيار ولا شيء غيره. ولا تبيّن أن الاختيار خُزِّن؛ فاكتب ذلك في نص الصفحة عندما يخزّنه التطبيق.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: تفضيلات الخصوصية

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd>، <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى العنصر التالي أو السابق القابل للتركيز، بترتيب محتوى المنطقة. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل الزر الأصلي الذي عليه التركيز، فيبلّغ زرّا القبول والرفض عن اختيار، ويشغّل زر التفضيلات معالج التطبيق. |
| <kbd>Enter</kbd> | ينتقل إلى وجهة رابط السياسة الذي عليه التركيز. |

## الاتجاه والتوطين

ليس في مكوّن تفضيلات الخصوصية نص مدمج. يكتب التطبيق العنوان والوصف وتسمية رابط السياسة وتسميات الإجراءات بلغة الصفحة. وتتبع المنطقة اتجاه الصفحة، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فيبدأ النص والإجراءات من جهة بدء القراءة، في العربية وفي الإنجليزية.

- اكتب تسميتَي القبول والرفض عبارتين صريحتين تذكران الاختيار بلغة المنطقة، وحافظ على ترتيب الإجراءات نفسه في اللغتين: القبول، فالرفض، فالتفضيلات.
- يُثبَّت الشريط الذي يحمل `variant="banner"` عند نهاية النافذة في الاتجاه الكتلي، وهي نهاية لا تتغيّر بتغيّر اتجاه الصفحة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن تفضيلات الخصوصية بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج مكوّن تفضيلات الخصوصية في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- لا تتحكم واجهة التفضيلات في تشغيل أي برنامج نصي: تبلّغ المنطقة عن الاختيار، ويضبط التطبيق حفظه والتعامل مع السياسة.
