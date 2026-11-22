---
source:
  summary: 6acb07b0e20a
  example: 0be3dd79b3d6
  variants-and-states: 1acca979fa1b
  api: fab220362469
  accessibility: 4deffcc85991
  rtl-and-localisation: 1d839b846bd4
  platforms-code-reference: bb7f35339bcc
---
# تبويبات

تقسّم التبويبات محتوى مترابطًا إلى لوحات وتعرض لوحة واحدة في كل مرة. وتسمّي قائمة التبويبات اللوحات، ويعرض التبويب المحدَّد لوحته بينما تبقى اللوحات الأخرى في المستند بالخاصية `hidden`.

## مثال

لقائمة التبويبات اسم يصف مجموعة اللوحات. ويسمّي نص كل تبويب لوحته بكلمة أو كلمتين.

```html live example=basic check=tabs-keyboard differences=tabs-bar-orientation
<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">
  <div class="hw-tab-list" role="tablist" aria-label="تفاصيل الطلب" aria-orientation="horizontal">
    <button class="hw-tab" type="button" role="tab" id="basic-tab-overview" aria-controls="basic-panel-overview" aria-selected="true" data-hw-value="overview">نظرة عامة</button>
    <button class="hw-tab" type="button" role="tab" id="basic-tab-documents" aria-controls="basic-panel-documents" aria-selected="false" data-hw-value="documents">المستندات</button>
    <button class="hw-tab" type="button" role="tab" id="basic-tab-history" aria-controls="basic-panel-history" aria-selected="false" data-hw-value="history">السجل</button>
  </div>
  <section class="hw-tab-panel" id="basic-panel-overview" role="tabpanel" aria-labelledby="basic-tab-overview"><p>الطلب قيد المراجعة.</p></section>
  <section class="hw-tab-panel" id="basic-panel-documents" role="tabpanel" aria-labelledby="basic-tab-documents" hidden><p>أُرفق بالطلب مستندان.</p></section>
  <section class="hw-tab-panel" id="basic-panel-history" role="tabpanel" aria-labelledby="basic-tab-history" hidden><p>قُدّم الطلب وأُسند إلى مراجع.</p></section>
</div>
```

```tsx live example=basic
<Tabs
  label="تفاصيل الطلب"
  overflow="scroll"
  items={[
    { value: 'overview', label: 'نظرة عامة', content: <p>الطلب قيد المراجعة.</p> },
    { value: 'documents', label: 'المستندات', content: <p>أُرفق بالطلب مستندان.</p> },
    { value: 'history', label: 'السجل', content: <p>قُدّم الطلب وأُسند إلى مراجع.</p> },
  ]}
/>
```

```vue live example=basic
<Tabs
  label="تفاصيل الطلب"
  overflow="scroll"
  :items="[
    { value: 'overview', label: 'نظرة عامة' },
    { value: 'documents', label: 'المستندات' },
    { value: 'history', label: 'السجل' },
  ]"
>
  <template #overview><p>الطلب قيد المراجعة.</p></template>
  <template #documents><p>أُرفق بالطلب مستندان.</p></template>
  <template #history><p>قُدّم الطلب وأُسند إلى مراجع.</p></template>
</Tabs>
```

```ts live example=basic framework=angular
template: `<hw-tabs label="تفاصيل الطلب" overflow="scroll">
  <hw-tab value="overview" label="نظرة عامة"><p>الطلب قيد المراجعة.</p></hw-tab>
  <hw-tab value="documents" label="المستندات"><p>أُرفق بالطلب مستندان.</p></hw-tab>
  <hw-tab value="history" label="السجل"><p>قُدّم الطلب وأُسند إلى مراجع.</p></hw-tab>
</hw-tabs>`
```

## الأشكال والحالات

### عمودية

تضع قائمة التبويبات العمودية التبويبات في عمود، قبل اللوحات. ويتنقّل السهمان العلوي والسفلي بين التبويبات في اتجاهَي القراءة كليهما، ولا تنقل القائمة العمودية تبويباتها أبدًا إلى عنصر الإظهار والإخفاء الخاص بالتبويبات الزائدة.

```html live example=vertical check=tabs-click,tabs-keyboard-vertical differences=tabs-bar-orientation
<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">
  <div class="hw-tab-list" role="tablist" aria-label="إعدادات الحساب" aria-orientation="vertical">
    <button class="hw-tab" type="button" role="tab" id="vertical-tab-profile" aria-controls="vertical-panel-profile" aria-selected="true" data-hw-value="profile">الملف الشخصي</button>
    <button class="hw-tab" type="button" role="tab" id="vertical-tab-security" aria-controls="vertical-panel-security" aria-selected="false" data-hw-value="security">الأمان</button>
    <button class="hw-tab" type="button" role="tab" id="vertical-tab-notifications" aria-controls="vertical-panel-notifications" aria-selected="false" data-hw-value="notifications">الإشعارات</button>
  </div>
  <section class="hw-tab-panel" id="vertical-panel-profile" role="tabpanel" aria-labelledby="vertical-tab-profile"><p>الاسم والبريد الإلكتروني ورقم الجوال.</p></section>
  <section class="hw-tab-panel" id="vertical-panel-security" role="tabpanel" aria-labelledby="vertical-tab-security" hidden><p>كلمة المرور وطرق التحقق.</p></section>
  <section class="hw-tab-panel" id="vertical-panel-notifications" role="tabpanel" aria-labelledby="vertical-tab-notifications" hidden><p>الرسائل المتعلقة بالطلبات والمواعيد.</p></section>
</div>
```

```tsx live example=vertical
<Tabs
  label="إعدادات الحساب"
  orientation="vertical"
  overflow="scroll"
  items={[
    { value: 'profile', label: 'الملف الشخصي', content: <p>الاسم والبريد الإلكتروني ورقم الجوال.</p> },
    { value: 'security', label: 'الأمان', content: <p>كلمة المرور وطرق التحقق.</p> },
    { value: 'notifications', label: 'الإشعارات', content: <p>الرسائل المتعلقة بالطلبات والمواعيد.</p> },
  ]}
/>
```

```vue live example=vertical
<Tabs
  label="إعدادات الحساب"
  orientation="vertical"
  overflow="scroll"
  :items="[
    { value: 'profile', label: 'الملف الشخصي' },
    { value: 'security', label: 'الأمان' },
    { value: 'notifications', label: 'الإشعارات' },
  ]"
>
  <template #profile><p>الاسم والبريد الإلكتروني ورقم الجوال.</p></template>
  <template #security><p>كلمة المرور وطرق التحقق.</p></template>
  <template #notifications><p>الرسائل المتعلقة بالطلبات والمواعيد.</p></template>
</Tabs>
```

```ts live example=vertical framework=angular
template: `<hw-tabs label="إعدادات الحساب" orientation="vertical" overflow="scroll">
  <hw-tab value="profile" label="الملف الشخصي"><p>الاسم والبريد الإلكتروني ورقم الجوال.</p></hw-tab>
  <hw-tab value="security" label="الأمان"><p>كلمة المرور وطرق التحقق.</p></hw-tab>
  <hw-tab value="notifications" label="الإشعارات"><p>الرسائل المتعلقة بالطلبات والمواعيد.</p></hw-tab>
</hw-tabs>`
```

### التفعيل اليدوي

في التفعيل اليدوي تنقل مفاتيح الأسهم التركيز بين التبويبات دون تغيير اللوحة، ويحدّد المفتاح Enter أو Space التبويب الذي عليه التركيز. استخدمه عندما يكون عرض اللوحة بطيئًا أو يغيّر محتوى آخر في الصفحة.

```html live example=manual check=tabs-activate differences=tabs-bar-orientation
<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll" data-hw-activation="manual">
  <div class="hw-tab-list" role="tablist" aria-label="خطوات الخدمة" aria-orientation="horizontal">
    <button class="hw-tab" type="button" role="tab" id="manual-tab-apply" aria-controls="manual-panel-apply" aria-selected="true" data-hw-value="apply">التقديم</button>
    <button class="hw-tab" type="button" role="tab" id="manual-tab-pay" aria-controls="manual-panel-pay" aria-selected="false" data-hw-value="pay">الدفع</button>
    <button class="hw-tab" type="button" role="tab" id="manual-tab-receive" aria-controls="manual-panel-receive" aria-selected="false" data-hw-value="receive">الاستلام</button>
  </div>
  <section class="hw-tab-panel" id="manual-panel-apply" role="tabpanel" aria-labelledby="manual-tab-apply"><p>عبّئ نموذج الطلب.</p></section>
  <section class="hw-tab-panel" id="manual-panel-pay" role="tabpanel" aria-labelledby="manual-tab-pay" hidden><p>ادفع رسوم الخدمة.</p></section>
  <section class="hw-tab-panel" id="manual-panel-receive" role="tabpanel" aria-labelledby="manual-tab-receive" hidden><p>استلم المستند عبر البريد الإلكتروني.</p></section>
</div>
```

```tsx live example=manual
<Tabs
  label="خطوات الخدمة"
  activationMode="manual"
  overflow="scroll"
  items={[
    { value: 'apply', label: 'التقديم', content: <p>عبّئ نموذج الطلب.</p> },
    { value: 'pay', label: 'الدفع', content: <p>ادفع رسوم الخدمة.</p> },
    { value: 'receive', label: 'الاستلام', content: <p>استلم المستند عبر البريد الإلكتروني.</p> },
  ]}
/>
```

```vue live example=manual
<Tabs
  label="خطوات الخدمة"
  activation-mode="manual"
  overflow="scroll"
  :items="[
    { value: 'apply', label: 'التقديم' },
    { value: 'pay', label: 'الدفع' },
    { value: 'receive', label: 'الاستلام' },
  ]"
>
  <template #apply><p>عبّئ نموذج الطلب.</p></template>
  <template #pay><p>ادفع رسوم الخدمة.</p></template>
  <template #receive><p>استلم المستند عبر البريد الإلكتروني.</p></template>
</Tabs>
```

```ts live example=manual framework=angular
template: `<hw-tabs label="خطوات الخدمة" activationMode="manual" overflow="scroll">
  <hw-tab value="apply" label="التقديم"><p>عبّئ نموذج الطلب.</p></hw-tab>
  <hw-tab value="pay" label="الدفع"><p>ادفع رسوم الخدمة.</p></hw-tab>
  <hw-tab value="receive" label="الاستلام"><p>استلم المستند عبر البريد الإلكتروني.</p></hw-tab>
</hw-tabs>`
```

### تبويب معطَّل

يبقى التبويب المعطَّل في القائمة ويبيّن أن لوحته موجودة لكنها غير متاحة. وتتجاوزه مفاتيح الأسهم، ولا يمكن تحديده. اذكر السبب في نص الصفحة.

```html live example=disabled-tab check=tabs-keyboard,tabs-disabled differences=tabs-bar-orientation
<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll">
  <div class="hw-tab-list" role="tablist" aria-label="تفاصيل الطلب" aria-orientation="horizontal">
    <button class="hw-tab" type="button" role="tab" id="disabled-tab-tab-overview" aria-controls="disabled-tab-panel-overview" aria-selected="true" data-hw-value="overview">نظرة عامة</button>
    <button class="hw-tab" type="button" role="tab" id="disabled-tab-tab-decision" aria-controls="disabled-tab-panel-decision" aria-selected="false" data-hw-value="decision" disabled>القرار</button>
    <button class="hw-tab" type="button" role="tab" id="disabled-tab-tab-documents" aria-controls="disabled-tab-panel-documents" aria-selected="false" data-hw-value="documents">المستندات</button>
    <button class="hw-tab" type="button" role="tab" id="disabled-tab-tab-history" aria-controls="disabled-tab-panel-history" aria-selected="false" data-hw-value="history">السجل</button>
  </div>
  <section class="hw-tab-panel" id="disabled-tab-panel-overview" role="tabpanel" aria-labelledby="disabled-tab-tab-overview"><p>يتاح القرار بعد انتهاء المراجعة.</p></section>
  <section class="hw-tab-panel" id="disabled-tab-panel-decision" role="tabpanel" aria-labelledby="disabled-tab-tab-decision" hidden><p>لم يصدر قرار بعد.</p></section>
  <section class="hw-tab-panel" id="disabled-tab-panel-documents" role="tabpanel" aria-labelledby="disabled-tab-tab-documents" hidden><p>أُرفق بالطلب مستندان.</p></section>
  <section class="hw-tab-panel" id="disabled-tab-panel-history" role="tabpanel" aria-labelledby="disabled-tab-tab-history" hidden><p>قُدّم الطلب وأُسند إلى مراجع.</p></section>
</div>
```

```tsx live example=disabled-tab
<Tabs
  label="تفاصيل الطلب"
  overflow="scroll"
  items={[
    { value: 'overview', label: 'نظرة عامة', content: <p>يتاح القرار بعد انتهاء المراجعة.</p> },
    { value: 'decision', label: 'القرار', content: <p>لم يصدر قرار بعد.</p>, disabled: true },
    { value: 'documents', label: 'المستندات', content: <p>أُرفق بالطلب مستندان.</p> },
    { value: 'history', label: 'السجل', content: <p>قُدّم الطلب وأُسند إلى مراجع.</p> },
  ]}
/>
```

```vue live example=disabled-tab
<Tabs
  label="تفاصيل الطلب"
  overflow="scroll"
  :items="[
    { value: 'overview', label: 'نظرة عامة' },
    { value: 'decision', label: 'القرار', disabled: true },
    { value: 'documents', label: 'المستندات' },
    { value: 'history', label: 'السجل' },
  ]"
>
  <template #overview><p>يتاح القرار بعد انتهاء المراجعة.</p></template>
  <template #decision><p>لم يصدر قرار بعد.</p></template>
  <template #documents><p>أُرفق بالطلب مستندان.</p></template>
  <template #history><p>قُدّم الطلب وأُسند إلى مراجع.</p></template>
</Tabs>
```

```ts live example=disabled-tab framework=angular
template: `<hw-tabs label="تفاصيل الطلب" overflow="scroll">
  <hw-tab value="overview" label="نظرة عامة"><p>يتاح القرار بعد انتهاء المراجعة.</p></hw-tab>
  <hw-tab value="decision" label="القرار" disabled><p>لم يصدر قرار بعد.</p></hw-tab>
  <hw-tab value="documents" label="المستندات"><p>أُرفق بالطلب مستندان.</p></hw-tab>
  <hw-tab value="history" label="السجل"><p>قُدّم الطلب وأُسند إلى مراجع.</p></hw-tab>
</hw-tabs>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createTabs

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `activationMode` | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `overflow` | `'menu' \| 'scroll'` | `false` | `'menu'` |
| `overflowLabel` | `string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |

تستدعي الدالة `enhance()` من `@hawiyah/vanilla` الدالة `createTabs(root, options)` لكل عنصر يحمل `data-hw="tabs"`؛ واستدعِ `createTabs` مباشرة لتمرير الخيارات. ويحتوي الجذر على عنصر `[role="tablist"]` فيه زر `[role="tab"]` لكل لوحة، ويشير كل تبويب إلى لوحته داخل الجذر عبر `aria-controls`. وقيمة التبويب هي `data-hw-value`، وإلا فمعرّفه. ودون الخيار `value` يكون التبويب المحدَّد أول تبويب يحمل `aria-selected="true"`، وإلا فأول تبويب متاح. وتحلّ خصائص الجذر `data-hw-activation="manual"` و`data-hw-overflow` و`data-hw-overflow-label` محلّ الخيارات المقابلة لها، وتجعل الخاصية `aria-orientation="vertical"` على قائمة التبويبات القائمةَ عمودية. والخيار `overflowLabel` مطلوب ما دام `overflow` يساوي `menu`. ويُرجع المتحكم `{ value, select(value), destroy() }`، ويرسل الحدث `hw:change` مع `detail.value` على الجذر، وتعيد `destroy()` الترميز المكتوب إلى حاله.

### React

جدول: خصائص Tabs

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly TabItem[]` | `true` | — |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `label` | `string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `orientation` | `'horizontal' \| 'vertical'` | `false` | `'horizontal'` |
| `activationMode` | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `overflow` | `'menu' \| 'scroll'` | `false` | `'menu'` |
| `overflowLabel` | `string` | `false` | — |

العنصر `TabItem` هو `{ value, label, content, disabled? }`، و`label` و`content` عقدتا React. ويلزم واحد من `label` و`aria-label` و`aria-labelledby`، وهو يسمّي قائمة التبويبات لا الجذر `div.hw-tabs`. والخاصية `overflowLabel` مطلوبة ما لم تكن `overflow` مساوية `scroll`. مرّر `value` مع `onValueChange` لتحديد متحكَّم فيه، أو `defaultValue` لتحديد غير متحكَّم فيه. ويقبل Tabs أيضًا خصائص عنصر `div`، وتصل إلى الجذر.

### Vue

جدول: خصائص Tabs وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly TabItem[]` | `true` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `orientation` | prop | `'horizontal' \| 'vertical'` | `false` | `'horizontal'` |
| `activationMode` | prop | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `overflow` | prop | `'menu' \| 'scroll'` | `false` | `'menu'` |
| `overflowLabel` | prop | `string` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `tab:<value>` | slot | — | `false` | — |
| `<value>` | slot | — | `false` | — |

العنصر `TabItem` هو `{ value, label, content?, disabled? }`، و`label` نص. وتعرض اللوحة المنفذ المسمّى باسم قيمة العنصر، وإلا فالمحتوى `content`؛ ويحلّ منفذ اختياري باسم `tab:<value>` محلّ نص التبويب. ولا تعرّف تصريحات الإصدار 0.3.0 أنواع هذه المنافذ، فيسرد الجدول المنافذ التي يقرؤها الإصدار المنشور دون نوع. ويربط `v-model` القيمة المحدَّدة. وتُسمّى قائمة التبويبات بالخاصية `label`، أو بالخاصية `aria-label` أو `aria-labelledby` التي تصل إلى قائمة التبويبات. والخاصية `overflowLabel` مطلوبة ما دامت `overflow` مساوية `menu`.

### Angular

جدول: مُدخلات hw-tabs وhw-tab ومخرجاتهما ومحتواهما

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `id` | input | `string` | `false` | — |
| `value` | input | `string` | `false` | `''` |
| `label` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `orientation` | input | `'horizontal' \| 'vertical'` | `false` | `'horizontal'` |
| `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `activationMode` | input | `'automatic' \| 'manual'` | `false` | `'automatic'` |
| `overflow` | input | `'menu' \| 'scroll'` | `false` | `'menu'` |
| `overflowLabel` | input | `string` | `false` | `''` |
| `valueChange` | output | `string` | `false` | — |
| `*` | content | — | `false` | — |
| `hw-tab value` | input | `string` | `true` | — |
| `hw-tab label` | input | `string` | `true` | — |
| `hw-tab disabled` | input | `boolean` | `false` | `false` |
| `hw-tab *` | content | — | `false` | — |

يحتوي `HwTabsComponent` (`hw-tabs`) على مكوّن `HwTabComponent` (`hw-tab`) لكل لوحة؛ والصفوف التي تبدأ بـ`hw-tab` هي مُدخلات `hw-tab` ومحتواه. اربط `[(value)]` ربطًا ثنائي الاتجاه بالتحديد. ويسمّي المُدخل `label` قائمة التبويبات، وهو مطلوب ما لم تُكتب الخاصية `aria-label` أو `aria-labelledby` على `hw-tabs`؛ والمُدخل `overflowLabel` مطلوب ما لم يكن `overflow` مساويًا `scroll`. ودون `id` يولّد المكوّن معرّفًا لتبويباته ولوحاته. ويعرض كل `hw-tab` محتواه المُسقَط في عنصر `section.hw-tab-panel` خاص به، وتمنح ورقة الأنماط العنصر `hw-tab` القيمة `display: contents`، فتحافظ اللوحات على تخطيط المحوّلات الأخرى، ويمكن استكمال تهيئة مجموعة التبويبات في المتصفح بعد العرض على الخادم.

## إمكانية الوصول

تتبع التبويبات نمط التبويبات في ممارسات التأليف الخاصة بـWAI-ARIA. فلقائمة التبويبات الدور tablist واسم ميسّر، وكل تبويب زر أصلي بالدور tab، ولكل لوحة الدور tabpanel ويسمّيها تبويبها عبر `aria-labelledby`. ويحمل التبويب المحدَّد `aria-selected="true"` ويتحكم في اللوحة الظاهرة عبر `aria-controls`.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: تبويبات

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى قائمة التبويبات على التبويب المحدَّد؛ ومن التبويب ينقل التركيز إلى اللوحة الظاهرة. |
| <kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd> | في القائمة الأفقية، ينقل التركيز إلى التبويب المتاح التالي أو السابق في ترتيب القراءة، ويلتفّ عند الطرفين: من آخر تبويب إلى أوله، ومن أوله إلى آخره؛ وينقل السهم الأيسر إلى التبويب التالي في صفحة من اليمين إلى اليسار، والسهم الأيمن في صفحة من اليسار إلى اليمين. |
| <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | في القائمة العمودية، ينقل التركيز إلى التبويب المتاح التالي أو السابق في اتجاهَي القراءة كليهما، ويلتفّ عند الطرفين: من آخر تبويب إلى أوله، ومن أوله إلى آخره. |
| <kbd>Home</kbd>، <kbd>End</kbd> | ينقل التركيز إلى أول تبويب متاح أو آخر تبويب متاح. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | في التفعيل اليدوي، يحدّد التبويب الذي عليه التركيز. |

- لا يكون في ترتيب التنقل بالمفتاح Tab إلا تبويب واحد في كل مرة، وتنقل مفاتيح الأسهم التركيز داخل القائمة.
- في التفعيل التلقائي، وهو الافتراضي، يحدّد نقل التركيز التبويب أيضًا ويعرض لوحته.
- تتجاوز مفاتيح الأسهم التبويبات المعطَّلة، ولا يمكن تحديدها.
- كل لوحة قابلة للتركيز، فيمكن الوصول إلى اللوحة التي لا تحتوي على عنصر قابل للتركيز وقراءتها.
- عندما لا تتسع القائمة الأفقية لنصوص التبويبات ويكون `overflow` مساويًا `menu`، تنتقل النصوص التي لا تتسع إلى عنصر إظهار وإخفاء أصلي بعد القائمة، يسمّيه `overflowLabel`. ويقع هذا العنصر خارج قائمة التبويبات، وتستخدم أزراره `aria-pressed` للوحة المحدَّدة.

> [!IMPORTANT]
> استخدم التبويبات للوحات من محتوى مترابط في الصفحة نفسها. واستخدم الروابط للتنقل بين الصفحات، ومؤشر الخطوات للعمليات المرتّبة.

## الاتجاه والتوطين

ليس في التبويبات نص مدمج: يكتب التطبيق اسم قائمة التبويبات ونصوص التبويبات ومحتوى اللوحات و`overflowLabel` بلغة الصفحة. ويرث المكوّن لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.

- في القائمة الأفقية تتبع مفاتيح الأسهم الترتيب المرئي للتبويبات: ففي صفحة من اليمين إلى اليسار ينقل السهم الأيسر إلى التبويب التالي والسهم الأيمن إلى التبويب السابق.
- يقرأ المتحكم في vanilla ومكوّنا React وVue الاتجاه المحسوب لقائمة التبويبات؛ ويقرؤه مكوّن Angular كذلك، ويضبطه مُدخله `direction` صراحة.
- تستخدم القوائم العمودية السهمين العلوي والسفلي في اتجاهَي القراءة كليهما.
- قيم التبويبات معرّفات لا نصوص، وتبقى نفسها في كل لغة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط التبويبات بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- رُبطت سكة التبويبات، وأحجام النصوص وحشوتها، وحالات المرور بالمؤشر والضغط والتركيز، والخط السفلي للتبويب المحدَّد، والتعامل المتجاوب مع التبويبات الزائدة، الواردة في ورقة أنماط كود المنصات وبرنامجها النصي المزوَّدَين، مع درجة الثقة في كل ربط، في [ملاحظات التبويبات](../nic-tabs.md).
- تسجّل ملاحظات التبويبات عرضًا تجريبيًا لورقة أنماط المصدر دون ملفات خطوطها الرسمية واعتمادياتها، ولا تثبت تطابقًا مرئيًا كاملًا مع المواقع الحكومية الحية.
- يقيس التعامل مع التبويبات الزائدة حاوية المكوّن بدلًا من اتساع نافذة العرض كما في البرنامج النصي للمصدر، وهذا التكييف موثّق في ملاحظات التبويبات.
