---
source:
  summary: e6b6477b22d8
  example: 9e2a26bd497a
  variants-and-states: dfc8f80aaa7d
  api: c02a3a2c59cf
  accessibility: f1f1c94c6291
  rtl-and-localisation: 629209572af0
  platforms-code-reference: b8d2dc26e403
---
# تذييل المنصة

تذييل المنصة هو معلَم التذييل في صفحة البوابة: فهو ينظّم منطقة العلامة مع وصف، ومجموعات روابط التنقل، وقسم الدعم، وسطرًا من النص القانوني، وقائمة الروابط القانونية، ومنطقة الشركاء. ويوفّر التطبيق كل نص وكل وجهة.

## مثال

يسمّي التذييل كل مجموعة روابط بعنوان، ويمنح كل منطقة تنقل اسمًا يطابق عنوانها. والمجموعة الأولى من الروابط، `links`، هي مجموعة التنقل الأولى، وتُسمّى المجموعات التي تليها بعناوينها، وتقع الروابط القانونية في منطقة خاصة بها في الأسفل.

```html live example=basic differences=portal-footer-adapter-markup frame
<footer class="hw-portal-footer">
  <div class="hw-portal-footer-main">
    <div class="hw-portal-footer-brand"><p>قدّم طلباتك وتابعها، واحفظ مستنداتك وملفك الشخصي في مكان واحد.</p></div>
    <nav class="hw-portal-footer-group" aria-label="الخدمات"><h2>الخدمات</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/services/requests">الطلبات</a></li><li><a class="hw-link" href="/services/documents">المستندات</a></li></ul></nav>
    <nav class="hw-portal-footer-group" aria-label="المساعدة"><h2>المساعدة</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/help/contact">تواصل معنا</a></li><li><a class="hw-link" href="/help/questions">الأسئلة الشائعة</a></li></ul></nav>
  </div>
  <div class="hw-portal-footer-bottom">
    <small>بوابة المثال، جميع الحقوق محفوظة.</small>
    <nav class="hw-portal-footer-legal" aria-label="الروابط القانونية"><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/privacy">سياسة الخصوصية</a></li><li><a class="hw-link" href="/terms">شروط الاستخدام</a></li></ul></nav>
  </div>
</footer>
```

```tsx live example=basic
<PortalFooter
  description="قدّم طلباتك وتابعها، واحفظ مستنداتك وملفك الشخصي في مكان واحد."
  links={[
    { label: 'الطلبات', href: '/services/requests' },
    { label: 'المستندات', href: '/services/documents' },
  ]}
  navigationLabel="الخدمات"
  groups={[
    {
      title: 'المساعدة',
      links: [
        { label: 'تواصل معنا', href: '/help/contact' },
        { label: 'الأسئلة الشائعة', href: '/help/questions' },
      ],
    },
  ]}
  legal="بوابة المثال، جميع الحقوق محفوظة."
  legalLinks={[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]}
  legalLinksLabel="الروابط القانونية"
  externalLabel="يُفتح في نافذة جديدة"
/>
```

```vue live example=basic
<PortalFooter
  description="قدّم طلباتك وتابعها، واحفظ مستنداتك وملفك الشخصي في مكان واحد."
  :links="[
    { label: 'الطلبات', href: '/services/requests' },
    { label: 'المستندات', href: '/services/documents' },
  ]"
  navigation-label="الخدمات"
  :groups="[
    {
      title: 'المساعدة',
      links: [
        { label: 'تواصل معنا', href: '/help/contact' },
        { label: 'الأسئلة الشائعة', href: '/help/questions' },
      ],
    },
  ]"
  copyright="بوابة المثال، جميع الحقوق محفوظة."
  :legal-links="[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]"
  legal-links-label="الروابط القانونية"
  external-label="يُفتح في نافذة جديدة"
/>
```

```ts live example=basic framework=angular
template: `<hw-portal-footer
  description="قدّم طلباتك وتابعها، واحفظ مستنداتك وملفك الشخصي في مكان واحد."
  [links]="[
    { label: 'الطلبات', href: '/services/requests' },
    { label: 'المستندات', href: '/services/documents' },
  ]"
  navigationLabel="الخدمات"
  [groups]="[
    {
      title: 'المساعدة',
      links: [
        { label: 'تواصل معنا', href: '/help/contact' },
        { label: 'الأسئلة الشائعة', href: '/help/questions' },
      ],
    },
  ]"
  copyright="بوابة المثال، جميع الحقوق محفوظة."
  [legalLinks]="[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]"
  legalLinksLabel="الروابط القانونية"
  externalLabel="يُفتح في نافذة جديدة"
/>`
```

## الأشكال والحالات

### رابط خارجي

يُفتح الرابط الذي تُضبط فيه `external` على `true` في نافذة جديدة بنوعي الرابط noopener وnoreferrer، ويعرض مؤشرًا صغيرًا بعد تسميته، ويضيف نص `externalLabel` إلى اسمه للتقنيات المساعدة.

```html live example=external differences=portal-footer-adapter-markup frame
<footer class="hw-portal-footer">
  <div class="hw-portal-footer-main">
    <nav class="hw-portal-footer-group" aria-label="المساعدة"><h2>المساعدة</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="https://example.test/guides" target="_blank" rel="noopener noreferrer">أدلة المستخدم<span class="hw-portal-footer-external hw-icon" data-icon="link-square-02" data-size="sm" aria-hidden="true"></span><span class="hw-sr-only"> يُفتح في نافذة جديدة</span></a></li><li><a class="hw-link" href="/help/contact">تواصل معنا</a></li></ul></nav>
  </div>
</footer>
```

```tsx live example=external
<PortalFooter
  groups={[
    {
      title: 'المساعدة',
      links: [
        { label: 'أدلة المستخدم', href: 'https://example.test/guides', external: true },
        { label: 'تواصل معنا', href: '/help/contact' },
      ],
    },
  ]}
  externalLabel="يُفتح في نافذة جديدة"
/>
```

```vue live example=external
<script setup lang="ts">
import { PortalFooter } from '@hawiyah/vue';

const groups = [
  {
    title: 'المساعدة',
    links: [
      { label: 'أدلة المستخدم', href: 'https://example.test/guides', external: true },
      { label: 'تواصل معنا', href: '/help/contact' },
    ],
  },
];
</script>

<template>
  <PortalFooter :groups="groups" external-label="يُفتح في نافذة جديدة" />
</template>
```

```ts live example=external framework=angular
template: `<hw-portal-footer
  [groups]="[
    {
      title: 'المساعدة',
      links: [
        { label: 'أدلة المستخدم', href: 'https://example.test/guides', external: true },
        { label: 'تواصل معنا', href: '/help/contact' },
      ],
    },
  ]"
  externalLabel="يُفتح في نافذة جديدة"
/>`
```

### محتوى الدعم

يقع محتوى الدعم، مثل إجراء للتواصل، في قسم خاص به. ويحتاج إلى `supportLabel`، الذي يسمّي القسم ويكون عنوانه. وهو خاصية المكوّن `support` في React، والمنفذ `support` في Vue، والمحتوى الذي يحمل `hwFooterSupport` في Angular.

```html live example=support differences=portal-footer-adapter-markup frame
<footer class="hw-portal-footer">
  <div class="hw-portal-footer-main">
    <section class="hw-portal-footer-support" aria-label="الدعم"><h2>الدعم</h2><div class="hw-portal-footer-support-content"><a class="hw-link" href="/help/contact">التواصل مع مكتب الخدمة</a></div></section>
  </div>
</footer>
```

```tsx live example=support
<PortalFooter
  support={<a className="hw-link" href="/help/contact">التواصل مع مكتب الخدمة</a>}
  supportLabel="الدعم"
  externalLabel="يُفتح في نافذة جديدة"
/>
```

```vue live example=support
<PortalFooter support-label="الدعم" external-label="يُفتح في نافذة جديدة">
  <template #support><a class="hw-link" href="/help/contact">التواصل مع مكتب الخدمة</a></template>
</PortalFooter>
```

```ts live example=support framework=angular
template: `<hw-portal-footer supportLabel="الدعم" externalLabel="يُفتح في نافذة جديدة">
  <a hwFooterSupport class="hw-link" href="/help/contact">التواصل مع مكتب الخدمة</a>
</hw-portal-footer>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-portal-footer

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-portal-footer'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لتذييل المنصة متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `footer` بالصنف `hw-portal-footer`. وداخله يحتوي عنصر `div` بالصنف `hw-portal-footer-main` على المجموعات، ويحتوي عنصر `div` بالصنف `hw-portal-footer-bottom` على النص القانوني والروابط القانونية. ومنطقة العلامة عنصر `div` بالصنف `hw-portal-footer-brand`، يحتوي على عنصر `div` اختياري بالصنف `hw-portal-footer-brand-marks` للصور أو للاسم، وعلى فقرة للوصف. وكل مجموعة روابط عنصر `nav` بالصنف `hw-portal-footer-group`، مع الخاصية `aria-label` وعنصر عنوان من المستوى الثاني بالنص نفسه، تليه قائمة بالصنف `hw-portal-footer-links`. ويحتوي قسم بالصنف `hw-portal-footer-support` وعنصر `div` بالصنف `hw-portal-footer-support-content` على محتوى الدعم؛ وتقع الروابط القانونية في عنصر `nav` بالصنف `hw-portal-footer-legal`، ويحتوي `hw-portal-footer-partners` على صور الشركاء. ويحمل الرابط الذي يفتح نافذة جديدة الصنف `hw-portal-footer-external` الخاص بالمؤشر ونصًا بالصنف `hw-sr-only` يذكر هذا السلوك. واكتب الخاصية `aria-label` على كل عنصر `nav` وعلى قسم الدعم، وعلى شعارات العلامة مع `role="group"` عندما لا تحتوي العلامة إلا على صور.

### React

جدول: خصائص PortalFooter

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | `false` | — |
| `brandLabel` | `string` | `false` | — |
| `description` | `ReactNode` | `false` | — |
| `legal` | `ReactNode` | `false` | — |
| `groups` | `readonly PortalFooterGroup[]` | `false` | `[]` |
| `partners` | `ReactNode` | `false` | — |
| `externalLabel` | `string` | `true` | — |
| `links` | `readonly PortalFooterLink[]` | `false` | — |
| `legalLinks` | `readonly PortalFooterLink[]` | `false` | `[]` |
| `legalLinksLabel` | `string` | `false` | — |
| `support` | `ReactNode` | `false` | — |
| `supportLabel` | `string` | `false` | — |
| `navigationLabel` | `string` | `false` | — |

الخاصية `externalLabel` مطلوبة: فهي النص الذي تقرؤه التقنيات المساعدة بعد الرابط الذي يحمل `external`. وتعرض الخاصية `links` مجموعة التنقل الأولى، وتحتاج إلى `navigationLabel`، الذي يسمّي المنطقة ويكون عنوانها. ولكل بند من `groups` الحقلان `title` و`links`؛ ويسمّي العنوان المنطقة ويكون عنوانها، وتُحذف المجموعة التي ليس فيها روابط. ولكل رابط الحقول `label` و`href` والحقل الاختياري `external`؛ وعند كتابته يُفتح الرابط في نافذة جديدة بنوعي الرابط noopener وnoreferrer، ويعرض مؤشرًا. وتعرض الخاصية `legalLinks` منطقة تنقل في الأسفل، وتحتاج إلى `legalLinksLabel`، والخاصية `legal` هي سطر النص الذي يسبقها. والخاصية `brand` محتوى قابل للعرض لمنطقة العلامة، مثل الصور أو الاسم؛ وتسمّي `brandLabel` هذه المنطقة مجموعةً، وهي الاسم الميسّر للعلامة التي لا تحتوي إلا على صور. والخاصية `description` فقرة في منطقة العلامة. وتعرض الخاصية `support` قسمًا اسمه وعنوانه قيمة `supportLabel`، وتُعرض الخاصية `partners` في الأسفل، وتُعرض العناصر الأبناء في منطقة إضافية من المنطقة الرئيسية. ويوفّر التطبيق كل تسمية وكل عنوان وكل نص؛ والقيمة الافتراضية لـ`groups` و`legalLinks` مصفوفة فارغة، ويقبل المكوّن أيضًا خصائص عنصر `footer`.

### Vue

جدول: خصائص PortalFooter وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `brand` | prop | `string` | `false` | — |
| `brandLabel` | prop | `string` | `false` | — |
| `description` | prop | `string` | `false` | — |
| `copyright` | prop | `string` | `false` | — |
| `links` | prop | `readonly PortalFooterLink[]` | `false` | — |
| `groups` | prop | `readonly PortalFooterGroup[]` | `false` | — |
| `legalLinks` | prop | `readonly PortalFooterLink[]` | `false` | — |
| `navigationLabel` | prop | `string` | `false` | — |
| `legalLinksLabel` | prop | `string` | `false` | — |
| `supportLabel` | prop | `string` | `false` | — |
| `externalLabel` | prop | `string` | `true` | — |
| `brand` | slot | — | `false` | — |
| `support` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `partners` | slot | — | `false` | — |

الخاصية `externalLabel` مطلوبة، وتقرؤها التقنيات المساعدة بعد الرابط الذي يحمل `external`. وتعرض الخاصية `links` مجموعة التنقل الأولى وتحتاج إلى `navigationLabel`، وتعرض الخاصية `groups` مجموعات أخرى تُسمّى بقيمة `title` في كل منها، وتعرض الخاصية `legalLinks` منطقة التنقل القانونية وتحتاج إلى `legalLinksLabel`؛ والقيمة الافتراضية لـ`links` و`groups` و`legalLinks` مصفوفة فارغة. ولكل رابط الحقول `label` و`href` والحقل الاختياري `external`، ويُفتح الرابط الخارجي في نافذة جديدة بنوعي الرابط noopener وnoreferrer. والخاصية `copyright` هي سطر النص في الأسفل، ويسمّيها Vue `copyright` بينما يسمّيها React `legal`. والخاصية `brand` نص يكتبه المكوّن في عنصر `strong` بعد محتوى المنفذ `brand`، وتسمّي `brandLabel` هذه المنطقة مجموعةً. والخاصية `description` فقرة في منطقة العلامة. ويعرض المنفذ `support` قسمًا تسمّيه `supportLabel`، ويُعرض المنفذ `partners` في الأسفل، ويُعرض المنفذ الافتراضي في منطقة إضافية من المنطقة الرئيسية. ويسرد الجدول المنافذ الأربعة لأن الإصدار المنشور يقرؤها؛ ولا يعرّف التصريح نوع أي منها.

### Angular

جدول: مُدخلات hw-portal-footer ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `brand` | input | `string` | `false` | `''` |
| `description` | input | `string` | `false` | `''` |
| `copyright` | input | `string` | `false` | `''` |
| `brandLabel` | input | `string` | `false` | `''` |
| `navigationLabel` | input | `string` | `false` | `''` |
| `links` | input | `readonly HwPortalFooterLink[]` | `false` | `[]` |
| `groups` | input | `readonly HwPortalFooterGroup[]` | `false` | `[]` |
| `legalLinks` | input | `readonly HwPortalFooterLink[]` | `false` | `[]` |
| `legalLinksLabel` | input | `string` | `false` | `''` |
| `supportLabel` | input | `string` | `false` | `''` |
| `externalLabel` | input | `string` | `true` | — |
| `[hwFooterBrand]` | content | — | `false` | — |
| `[hwFooterSupport]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwFooterPartners]` | content | — | `false` | — |

يُطبَّق `HwPortalFooterComponent` على `hw-portal-footer`، ويعرض عنصر `footer` داخل العنصر المضيف. والمُدخل `externalLabel` مطلوب، وتقرؤه التقنيات المساعدة بعد الرابط الذي يحمل `external`. ويعرض المُدخل `links` مجموعة التنقل الأولى ويحتاج إلى `navigationLabel`، ويعرض المُدخل `groups` مجموعات أخرى تُسمّى بقيمة `title` في كل منها، ويعرض المُدخل `legalLinks` منطقة التنقل القانونية ويحتاج إلى `legalLinksLabel`. ولكل رابط الحقول `label` و`href` والحقل الاختياري `external`، ويُفتح الرابط الخارجي في نافذة جديدة بنوعي الرابط noopener وnoreferrer. والمُدخل `copyright` هو سطر النص في الأسفل. والمُدخل `brand` نص يكتبه المكوّن في عنصر `strong`، بعد أي محتوى يحمل `hwFooterBrand`، ويسمّي `brandLabel` هذه المنطقة مجموعةً. والمُدخل `description` فقرة في منطقة العلامة. ويملأ المحتوى الذي يحمل `hwFooterSupport` قسم الدعم، الذي لا يظهر إلا عندما يكون فيه محتوى، ويحتاج عندئذ إلى `supportLabel`؛ وإلا بقي القسم في المستند بالخاصية `hidden`، دون عنوان ودون اسم. ويُعرض المحتوى الذي يحمل `hwFooterPartners` في الأسفل، ويُعرض المحتوى الآخر في منطقة إضافية من المنطقة الرئيسية.

## إمكانية الوصول

يعرض تذييل المنصة عنصر `footer` أصليًا، يعرضه المتصفح معلَمَ معلومات المحتوى (contentinfo) في الصفحة عندما لا يقع داخل عنصر `article` أو `aside` أو `main` أو `nav` أو `section`. وكل مجموعة روابط عنصر `nav` له اسم ميسّر، فيستطيع القارئ الذي يتنقّل بين المعالم أن يميّز بين المجموعات.

- للمجموعة عنصر عنوان من المستوى الثاني يكرّر اسمها، فيمكن تصفّح التذييل بالعناوين أيضًا. ضع التذييل بعد المحتوى الرئيسي، في صفحة يسمح ترتيب العناوين فيها بعناوين من المستوى الثاني في ذلك الموضع.
- امنح كل منطقة اسمًا مختلفًا. فمنطقتا التنقل اللتان تحملان الاسم نفسه لا تتيحان للقارئ الذي يتنقّل بين المعالم أي وسيلة للتمييز بينهما، ويأخذ المكوّن كل اسم من التطبيق.
- يفتح الرابط الذي يحمل `external` نافذة جديدة، ويعرض مؤشرًا لا تقرؤه التقنيات المساعدة، ويحمل نص `externalLabel` في اسمه، فيُبلَّغ القارئ بأن الرابط يفتح نافذة جديدة.
- عندما لا تحتوي العلامة إلا على صور، اكتب `brandLabel` ليكون للمنطقة اسم؛ ويُبلغ React وVue عن منطقة العلامة التي ليس لها اسم عندما لا يكون للمحتوى اسم، ولا يُبلغ Angular عنها إلا في وضع التطوير.
- الروابط عناصر `a` أصلية، فيكون استخدام لوحة المفاتيح والتفعيل بحسب المتصفح.

## الاتجاه والتوطين

ليس في تذييل المنصة نص مدمج: يكتب التطبيق الوصف وكل تسمية وعناوين المجموعات ونصوص الروابط والنص القانوني ونص `externalLabel` بلغة الصفحة.

- يتبع التذييل اتجاه الصفحة عبر خصائص CSS المنطقية، فتبدأ العلامة والمجموعات والروابط القانونية من جهة بدء القراءة، في العربية وفي الإنجليزية.
- اكتب المجموعات وروابطها بالترتيب الذي يجب أن تُقرأ به في كل لغة؛ فالمكوّن لا يفرزها ولا يعيد ترتيبها.
- يوفّر التطبيق صور العلامة. وفّر صور كل لغة عندما تختلف، وسمِّها بـ`brandLabel` عندما لا يكون فيها نص.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط تذييل المنصة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات التذييل](../nic-footer.md) عناوين التذييل وروابطه وصفوف الإجراءات والمسافات، وروابط التصفّح والروابط القانونية المجمّعة، الواردة في ورقة أنماط كود المنصات المزوَّدة وبرنامجها النصي، بأصناف المكوّن، وتذكر درجة الثقة في كل ربط وحدوده.
- تذكر [ملاحظات التذييل](../nic-footer.md) أن المكوّن ليس فيه نص خاص به، وأن التطبيق يتولّى كل الوجهات وإجراءات الدعم وبيانات التواصل، وأن الملاحظات تسجّل ربطًا بالمصدر ولا تدّعي التطابق البصري الكامل.
