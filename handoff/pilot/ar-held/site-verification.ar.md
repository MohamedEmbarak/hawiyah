---
source:
  summary: 7c0e5c50b902
  example: 922ebf24b880
  variants-and-states: d4fd2b454bde
  api: 1607692f2d1f
  accessibility: 467d49023ac5
  rtl-and-localisation: ba041c4e7d5b
  platforms-code-reference: 45e6dc0ea699
---
# شريط التحقق من الموقع

شريط التحقق من الموقع عنصر إظهار وإخفاء أصلي يقع فوق ترويسة الموقع، ويتيح للقارئ فتح معلومات عن الموقع: نطاقه، واستخدامه HTTPS، ورابط التسجيل عندما يوفّره التطبيق. وليس في المكوّن أي صياغة خاصة به، ويتولّى التطبيق كل تسمية وكل قيمة.

## مثال

يسمّي سطرُ الملخّص عنصرَ الإظهار والإخفاء، وتبيّن للقارئ تسميةٌ ثانية أنه يُفتح. وتعرض اللوحة المفتوحة النطاق وبيان HTTPS في مجموعتين لكل منهما عنوان. ويوفّر التطبيق كل النصوص، وهو المسؤول عمّا تذكره اللوحة.

```html live example=basic
<aside class="hw-site-verification" aria-label="معلومات الموقع">
  <details open>
    <summary><span>معلومات الموقع</span><span class="hw-verification-toggle">عرض التفاصيل<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary>
    <div class="hw-verification-content">
      <div class="hw-verification-checks">
        <section><span class="hw-icon" data-icon="link-04" aria-hidden="true"></span><div><h2>اسم النطاق: <bdi>portal.example.test</bdi></h2><p>تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية.</p></div></section>
        <section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>اتصال آمن عبر HTTPS</h2><p>يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل.</p></div></section>
      </div>
    </div>
  </details>
</aside>
```

```tsx live example=basic
<SiteVerification
  label="معلومات الموقع"
  detailsLabel="عرض التفاصيل"
  domain="portal.example.test"
  domainLabel="اسم النطاق:"
  domainDescription="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  httpsLabel="اتصال آمن عبر HTTPS"
  httpsDescription="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
  defaultOpen
/>
```

```vue live example=basic
<SiteVerification
  label="معلومات الموقع"
  details-label="عرض التفاصيل"
  domain="portal.example.test"
  domain-label="اسم النطاق:"
  domain-description="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  https-label="اتصال آمن عبر HTTPS"
  https-description="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
  default-open
/>
```

```ts live example=basic framework=angular
template: `<hw-site-verification
  label="معلومات الموقع"
  detailsLabel="عرض التفاصيل"
  domain="portal.example.test"
  domainLabel="اسم النطاق:"
  domainDescription="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  httpsLabel="اتصال آمن عبر HTTPS"
  httpsDescription="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
  [open]="true"
/>`
```

## الأشكال والحالات

### مطويّ دون نطاق

دون `domain` تحذف اللوحة مجموعة النطاق، ولا تعرض إلا بيان HTTPS. ويظل مثالا React وVue ومثال Angular يمرّرون `domainLabel` و`domainDescription`، لأن هذه الخصائص تبقى مطلوبة سواء كُتبت `domain` أم لم تُكتب. ويبقى عنصر الإظهار والإخفاء مغلقًا حتى يفتحه القارئ، وهذه هي الحالة الافتراضية. ودون `registrationHref` لا يُعرض رابط التسجيل.

```html live example=collapsed
<aside class="hw-site-verification" aria-label="معلومات الموقع">
  <details>
    <summary><span>معلومات الموقع</span><span class="hw-verification-toggle">عرض التفاصيل<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary>
    <div class="hw-verification-content">
      <div class="hw-verification-checks">
        <section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>اتصال آمن عبر HTTPS</h2><p>يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل.</p></div></section>
      </div>
    </div>
  </details>
</aside>
```

```tsx live example=collapsed
<SiteVerification
  label="معلومات الموقع"
  detailsLabel="عرض التفاصيل"
  domainLabel="اسم النطاق:"
  domainDescription="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  httpsLabel="اتصال آمن عبر HTTPS"
  httpsDescription="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
/>
```

```vue live example=collapsed
<SiteVerification
  label="معلومات الموقع"
  details-label="عرض التفاصيل"
  domain-label="اسم النطاق:"
  domain-description="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  https-label="اتصال آمن عبر HTTPS"
  https-description="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
/>
```

```ts live example=collapsed framework=angular
template: `<hw-site-verification
  label="معلومات الموقع"
  detailsLabel="عرض التفاصيل"
  domainLabel="اسم النطاق:"
  domainDescription="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  httpsLabel="اتصال آمن عبر HTTPS"
  httpsDescription="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
/>`
```

### الشعار

يميّز شعارٌ قبل التسمية عنصرَ الإظهار والإخفاء بصريًا. ويوفّره التطبيق: خاصية المكوّن `mark` في React، والمنفذ `mark` في Vue، والمحتوى الذي يحمل `hwVerificationMark` في Angular. وتضبط ورقة الأنماط حجم عنصر `img` أو `svg` داخل منطقة الشعار ليلائمها. وعندما يقتصر الشعار على تكرار التسمية، كما تفعل أيقونة القفل هنا، أخفِه عن التقنيات المساعدة.

```html live example=mark
<aside class="hw-site-verification" aria-label="معلومات الموقع">
  <details>
    <summary><span class="hw-verification-mark"><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span></span><span>معلومات الموقع</span><span class="hw-verification-toggle">عرض التفاصيل<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary>
    <div class="hw-verification-content">
      <div class="hw-verification-checks">
        <section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>اتصال آمن عبر HTTPS</h2><p>يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل.</p></div></section>
      </div>
    </div>
  </details>
</aside>
```

```tsx live example=mark
<SiteVerification
  label="معلومات الموقع"
  detailsLabel="عرض التفاصيل"
  domainLabel="اسم النطاق:"
  domainDescription="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  httpsLabel="اتصال آمن عبر HTTPS"
  httpsDescription="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
  mark={<span className="hw-icon" data-icon="lock-password" aria-hidden="true" />}
/>
```

```vue live example=mark
<SiteVerification
  label="معلومات الموقع"
  details-label="عرض التفاصيل"
  domain-label="اسم النطاق:"
  domain-description="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  https-label="اتصال آمن عبر HTTPS"
  https-description="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
>
  <template #mark><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span></template>
</SiteVerification>
```

```ts live example=mark framework=angular
template: `<hw-site-verification
  label="معلومات الموقع"
  detailsLabel="عرض التفاصيل"
  domainLabel="اسم النطاق:"
  domainDescription="تحقّق من أن العنوان في المتصفح يطابق هذا النطاق قبل إدخال معلوماتك الشخصية."
  httpsLabel="اتصال آمن عبر HTTPS"
  httpsDescription="يبدأ عنوان هذا الموقع بالبادئة https، ويعرض المتصفح رمز القفل."
>
  <span hwVerificationMark class="hw-icon" data-icon="lock-password" aria-hidden="true"></span>
</hw-site-verification>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العناصر hw-site-verification وhw-portal-masthead

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-site-verification' \| 'hw-portal-masthead'` | `true` | — |
| `data-variant` | `'sticky'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لشريط التحقق من الموقع متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `aside` بالصنف `hw-site-verification` مع الخاصية `aria-label`، وداخله عنصر `details` أصليًا، مع الخاصية `open` للحالة المفتوحة. ويحتوي عنصر `summary` على التسمية وعلى عنصر `span` بالصنف `hw-verification-toggle` فيه تسمية التفاصيل وأيقونة سهم من أيقونات الحزم. واللوحة عنصر `div` بالصنف `hw-verification-content`؛ ويحتوي عنصر `div` بالصنف `hw-verification-checks` على عنصر `section` لكل بيان، فيه أيقونة وعنصر عنوان من المستوى الثاني وفقرة، وتحتوي فقرة بالصنف `hw-verification-registration` على رابط التسجيل. ويُفتح الرابط في نافذة جديدة عندما يحمل هدف الرابط ونوعي الرابط noopener وnoreferrer؛ واحذفها عندما يعود السجل إلى التطبيق نفسه، فلا يحتاج الرابط عندئذ إلى نص مخفي يذكر النافذة الجديدة. ويحتوي عنصر `span` بالصنف `hw-verification-mark` قبل التسمية على شعار اختياري. ويحيط الصنف `hw-portal-masthead` بعنصر الإظهار والإخفاء وبترويسة المنصة، وتثبّت الخاصية `data-variant="sticky"` عليه كتلة الترويسة كلها في بداية حاوية التمرير الخاصة بها، وهي منفذ العرض عندما تُمرَّر الصفحة نفسها. وحالة عنصر الإظهار والإخفاء هي الخاصية الأصلية `open` والحدث الأصلي toggle.

### React

جدول: خصائص SiteVerification

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `mark` | `ReactNode` | `false` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `label` | `string` | `true` | — |
| `domain` | `string` | `false` | — |
| `registrationNumber` | `string` | `false` | — |
| `detailsLabel` | `string` | `true` | — |
| `domainLabel` | `string` | `true` | — |
| `domainDescription` | `string` | `true` | — |
| `httpsLabel` | `string` | `true` | — |
| `httpsDescription` | `string` | `true` | — |
| `registrationHref` | `string` | `false` | — |
| `registrationLabel` | `string` | `false` | — |
| `registrationExternal` | `boolean` | `false` | `true` |
| `externalLabel` | `string` | `false` | — |

يعرض المكوّن عنصر `aside` الخاص به، وتكون الخاصية `label` اسمه الميسّر ما لم تُمرَّر `aria-label`. والخصائص `label` و`detailsLabel` و`domainLabel` و`domainDescription` و`httpsLabel` و`httpsDescription` نصوص مطلوبة. ولا تُعرض مجموعة النطاق إلا عند كتابة `domain`، وعنوانها قيمة `domainLabel` يليها النطاق. وتعرض الخاصية `registrationHref` رابط التسجيل، وتكون `registrationLabel` عندئذ مطلوبة، وتُعرض `registrationNumber` بعدها. وعندما تكون `registrationExternal` مفعّلة، وهذه قيمتها الافتراضية، يُفتح الرابط في نافذة جديدة، وتكون `externalLabel` مطلوبة وتُضاف إلى اسم الرابط للتقنيات المساعدة. وتتحكم `open` مع `onOpenChange` في عنصر الإظهار والإخفاء، وتضبط `defaultOpen` الحالة الأولية لعنصر غير متحكَّم فيه؛ وفي الاستخدام المتحكَّم فيه يستدعي المكوّن `onOpenChange` بالحالة المطلوبة، ويضبط التطبيق `open`. وتملأ الخاصية `mark` منطقة الشعار قبل التسمية، وتُعرض العناصر الأبناء في نهاية اللوحة، بعد رابط التسجيل. ويقبل المكوّن أيضًا خصائص عنصر `aside`.

### Vue

جدول: خصائص SiteVerification وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `true` | — |
| `detailsLabel` | prop | `string` | `true` | — |
| `domainLabel` | prop | `string` | `true` | — |
| `domainDescription` | prop | `string` | `true` | — |
| `httpsLabel` | prop | `string` | `true` | — |
| `httpsDescription` | prop | `string` | `true` | — |
| `registrationLabel` | prop | `string` | `false` | — |
| `domain` | prop | `string` | `false` | — |
| `registrationHref` | prop | `string` | `false` | — |
| `registrationNumber` | prop | `string` | `false` | — |
| `externalLabel` | prop | `string` | `false` | — |
| `registrationExternal` | prop | `boolean` | `false` | `true` |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(open: boolean) => void` | `false` | — |
| `mark` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

الخصائص المطلوبة هي `label` و`detailsLabel` و`domainLabel` و`domainDescription` و`httpsLabel` و`httpsDescription`؛ وتكون `registrationLabel` مطلوبة عند كتابة `registrationHref`، وتكون `externalLabel` مطلوبة عندما تنطبق `registrationExternal`، وهي مفعّلة افتراضيًا. ولا تُعرض مجموعة النطاق إلا عند كتابة `domain`. وتتحكم الخاصية `open` في عنصر الإظهار والإخفاء، ويُرسل المكوّن الحدث `update:open` بالحالة المطلوبة، فيربطها `v-model` بالوسيط `open`، وتضبط `defaultOpen` حالة عنصر غير متحكَّم فيه. ويملأ المنفذ `mark` المنطقة التي قبل التسمية، ويُعرض المنفذ الافتراضي في نهاية اللوحة، بعد رابط التسجيل. وتصل خصائص HTML التي ليست خصائص للمكوّن، مثل `aria-label`، إلى عنصر `aside`. ويسرد الجدول المنفذين `mark` و`default` لأن الإصدار المنشور يقرؤهما؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-site-verification ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `true` | — |
| `detailsLabel` | input | `string` | `true` | — |
| `domain` | input | `string` | `false` | `''` |
| `domainLabel` | input | `string` | `true` | — |
| `domainDescription` | input | `string` | `true` | — |
| `httpsLabel` | input | `string` | `true` | — |
| `httpsDescription` | input | `string` | `true` | — |
| `registrationHref` | input | `string` | `false` | `''` |
| `registrationLabel` | input | `string` | `false` | `''` |
| `registrationNumber` | input | `string` | `false` | `''` |
| `registrationExternal` | input | `boolean` | `false` | `true` |
| `externalLabel` | input | `string` | `false` | `''` |
| `open` | input | `boolean` | `false` | `false` |
| `openChange` | output | `boolean` | `false` | — |
| `[hwVerificationMark]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwSiteVerificationComponent` على `hw-site-verification`، ويعرض عنصر `aside` داخل العنصر المضيف. والمُدخلات `label` و`detailsLabel` و`domainLabel` و`domainDescription` و`httpsLabel` و`httpsDescription` نصوص مطلوبة، ولا يوجد مُدخل للإعدادات المحلية. ولا تُعرض مجموعة النطاق إلا عندما لا يكون `domain` فارغًا. ويعرض `registrationHref` غير الفارغ رابط التسجيل، ويحتاج إلى `registrationLabel`؛ وعندما يكون `registrationExternal` مفعّلًا، وهذه قيمته الافتراضية، يُفتح الرابط في نافذة جديدة ويحتاج إلى `externalLabel`. والمُدخل `open` هو حالة عنصر الإظهار والإخفاء، ويُكتب `[(open)]` للربط ثنائي الاتجاه، ويُرسل المُخرج `openChange` الحالة الجديدة عندما يفتح القارئ العنصر أو يغلقه. ويملأ المحتوى الذي يحمل `hwVerificationMark` منطقة الشعار قبل التسمية، ويُعرض المحتوى الآخر في نهاية اللوحة، بعد رابط التسجيل.

## إمكانية الوصول

يعرض شريط التحقق من الموقع معلَم `aside` اسمه الميسّر قيمة `label`، وعنصر `details` أصليًا فيه عنصر `summary`. ويوفّر المتصفح حالة التوسيع وتفعيل الملخّص بالمفتاحين <kbd>Enter</kbd> و<kbd>Space</kbd>، ويُبقي محتوى عنصر الإظهار والإخفاء المغلق خارج ترتيب التركيز.

- يحتوي الملخّص على نص `label` ونص `detailsLabel`. والسهم المجاور لتسمية التفاصيل مخفي عن التقنيات المساعدة، ويدور عندما يكون عنصر الإظهار والإخفاء مفتوحًا؛ وتلغي ورقة الأنماط هذا الانتقال عندما يطلب القارئ تقليل الحركة.
- لكل بيان في اللوحة عنصر عنوان من المستوى الثاني: تسمية النطاق مع النطاق، وتسمية HTTPS. وتقع هذه العناوين داخل المعلَم، فتحقّق من ترتيب العناوين في الصفحة التي يوضع فيها المكوّن.
- يُكتب النطاق ورقم التسجيل في عنصر `bdi`، فتحتفظ القيمة المكتوبة بالحروف اللاتينية باتجاهها داخل النص العربي.
- يُكتب رابط التسجيل الذي يفتح نافذة جديدة بنوعي الرابط noopener وnoreferrer، ويُضاف نص `externalLabel` إلى اسمه للتقنيات المساعدة، ويُخفى بصريًا.
- للملخّص حد أدنى للارتفاع قدره 2.75rem، وللملخّص وللرابط مؤشر تركيز ظاهر.
- لا يذكر المكوّن إلا ما يكتبه التطبيق. فهو لا يتحقق من النطاق ولا من حالة الاتصال ولا من التسجيل، فلا تكتب إلا بيانات يستطيع النشر الفعلي للموقع أن يدعمها.

## الاتجاه والتوطين

ليس في شريط التحقق من الموقع نص مدمج: يوفّر التطبيق التسميات والأوصاف وتسمية التفاصيل وتسمية النافذة الجديدة بلغة الصفحة؛ وتسرد الجداول السابقة المطلوب منها، ولا يوجد مُدخل للإعدادات المحلية.

- يتبع المكوّن اتجاه الصفحة عبر خصائص CSS المنطقية، فيبدأ الشعار والتسمية ومفتاح الفتح والإغلاق من جهة بدء القراءة، في العربية وفي الإنجليزية.
- قيمتا `domain` و`registrationNumber` قيمتان، لا نص مترجم. اكتبهما كما صدرتا؛ فعنصر `bdi` يعزلهما عن النص المحيط.
- يلتفّ النطاق الطويل داخل اللوحة بدلًا من أن يتجاوز حدودها.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط شريط التحقق من الموقع بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تقارن [ملاحظات التحقق من الموقع](../site-verification.md) بنية البرنامج النصي المزوَّد، وهي عنصر إظهار وإخفاء في أعلى الصفحة فيه إرشاد عن النطاق وإرشاد عن HTTPS ورابط تسجيل، بالتنفيذ، وتذكر درجة الثقة في كل ربط.
- تسجّل [ملاحظات التحقق من الموقع](../site-verification.md) أن المكوّن ليس فيه نص خاص به، وأن التطبيق يوفّر تسمياته ونطاقه وبيانات تسجيله وصوره. وتذكر الملاحظات أيضًا حدود المقارنة: فالملفات المزوَّدة لم تتضمّن أنماط الختم الدقيقة، وتعذّر جلب الصفحات المنشورة عند كتابة الملاحظات.
