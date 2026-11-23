---
source:
  summary: 76fc24f9ce73
  example: 8080793a7785
  variants-and-states: 1c45c8cf7bc4
  api: 74960172afb2
  accessibility: 7360bf4bcd17
  rtl-and-localisation: c53f5c4b9c0e
  platforms-code-reference: 4ad03ac7c6a7
---
# قائمة إشعارات

تعرض قائمة الإشعارات إشعارات الشخص في قسم له اسم، فيه قائمة من البنود. ولكل بند عنوان، ورابط ووصف وتاريخ اختيارية، وحالة مقروء أو غير مقروء؛ ويتولّى التطبيق البيانات وكل إجراء.

## مثال

يسمّي عنوانٌ ظاهر القسم. ويعرض البند غير المقروء شارة فيها النص الذي يوفّره التطبيق، فلا تعتمد الحالة على اللون، ويكون العنوان رابطًا عندما تكون للبند وجهة.

```html live example=basic
<section class="hw-notification-list" aria-labelledby="basic-title">
  <h2 id="basic-title">الإشعارات</h2>
  <ul>
    <li data-state="unread">
      <h3><a class="hw-link" href="/requests/1042">تحديث الطلب 1042</a></h3>
      <span class="hw-badge" data-tone="info">جديد</span>
      <p>طلب المراجِع مستندًا إضافيًا واحدًا.</p>
      <time datetime="2026-03-04T09:00:00+03:00">4 مارس 2026</time>
    </li>
    <li data-state="read">
      <h3>استلام الطلب 1042</h3>
      <p>الطلب بانتظار المراجعة.</p>
      <time datetime="2026-03-02T14:30:00+03:00">2 مارس 2026</time>
    </li>
  </ul>
</section>
```

```tsx live example=basic
<NotificationList
  label="الإشعارات"
  unreadLabel="جديد"
  emptyMessage="لا توجد إشعارات."
  items={[
    {
      id: 'updated',
      title: 'تحديث الطلب 1042',
      href: '/requests/1042',
      description: 'طلب المراجِع مستندًا إضافيًا واحدًا.',
      dateTime: '2026-03-04T09:00:00+03:00',
      dateLabel: '4 مارس 2026',
    },
    {
      id: 'received',
      title: 'استلام الطلب 1042',
      description: 'الطلب بانتظار المراجعة.',
      dateTime: '2026-03-02T14:30:00+03:00',
      dateLabel: '2 مارس 2026',
      read: true,
    },
  ]}
/>
```

```vue live example=basic
<NotificationList
  label="الإشعارات"
  unread-label="جديد"
  empty-message="لا توجد إشعارات."
  :items="[
    {
      id: 'updated',
      title: 'تحديث الطلب 1042',
      href: '/requests/1042',
      description: 'طلب المراجِع مستندًا إضافيًا واحدًا.',
      dateTime: '2026-03-04T09:00:00+03:00',
      dateLabel: '4 مارس 2026',
    },
    {
      id: 'received',
      title: 'استلام الطلب 1042',
      description: 'الطلب بانتظار المراجعة.',
      dateTime: '2026-03-02T14:30:00+03:00',
      dateLabel: '2 مارس 2026',
      read: true,
    },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-notification-list
  label="الإشعارات"
  unreadLabel="جديد"
  emptyMessage="لا توجد إشعارات."
  [items]="[
    {
      id: 'updated',
      title: 'تحديث الطلب 1042',
      href: '/requests/1042',
      description: 'طلب المراجِع مستندًا إضافيًا واحدًا.',
      dateTime: '2026-03-04T09:00:00+03:00',
      dateLabel: '4 مارس 2026',
    },
    {
      id: 'received',
      title: 'استلام الطلب 1042',
      description: 'الطلب بانتظار المراجعة.',
      dateTime: '2026-03-02T14:30:00+03:00',
      dateLabel: '2 مارس 2026',
      read: true,
    },
  ]"
/>`
```

## الأشكال والحالات

### إجراء التعيين كمقروء وإجراء الإزالة

لا يعرض المكوّن إجراءً إلا ما دام التطبيق يوفّر معالجه. فيضيف معالج التعيين كمقروء زرًا نصيًا إلى كل بند غير مقروء، ويضيف معالج الإزالة زر أيقونة إلى كل بند. ويوفّر التطبيق اسم كل زر. والمعالجات في الأمثلة فارغة؛ ويحدّث التطبيق قائمته في معالجه.

```html live example=actions
<section class="hw-notification-list" aria-labelledby="actions-title" tabindex="-1">
  <h2 id="actions-title">الرسائل</h2>
  <ul>
    <li data-state="unread">
      <h3>استلام الدفعة</h3>
      <span class="hw-badge" data-tone="info">غير مقروء</span>
      <p>استُلمت رسوم الطلب 1042.</p>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-mark-read>تعيين كمقروء: استلام الدفعة</button>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="إزالة: استلام الدفعة"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </li>
    <li data-state="read">
      <h3>قبول المستند</h3>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="إزالة: قبول المستند"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </li>
  </ul>
</section>
```

```tsx live example=actions
<NotificationList
  label="الرسائل"
  unreadLabel="غير مقروء"
  emptyMessage="لا توجد رسائل."
  items={[
    { id: 'payment', title: 'استلام الدفعة', description: 'استُلمت رسوم الطلب 1042.' },
    { id: 'document', title: 'قبول المستند', read: true },
  ]}
  onRead={() => undefined}
  getMarkReadLabel={(item) => 'تعيين كمقروء: ' + item.title}
  onDismiss={() => undefined}
  getDismissLabel={(item) => 'إزالة: ' + item.title}
/>
```

```vue live example=actions
<NotificationList
  label="الرسائل"
  unread-label="غير مقروء"
  empty-message="لا توجد رسائل."
  :items="[
    { id: 'payment', title: 'استلام الدفعة', description: 'استُلمت رسوم الطلب 1042.' },
    { id: 'document', title: 'قبول المستند', read: true },
  ]"
  :get-mark-read-label="(item) => 'تعيين كمقروء: ' + item.title"
  :get-dismiss-label="(item) => 'إزالة: ' + item.title"
  @read="() => undefined"
  @dismiss="() => undefined"
/>
```

```ts live example=actions framework=angular
import { Component } from '@angular/core';
import { HwNotificationListComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwNotificationListComponent],
  template: `<hw-notification-list
    label="الرسائل"
    unreadLabel="غير مقروء"
    emptyMessage="لا توجد رسائل."
    [items]="items"
    [getMarkReadLabel]="markReadLabel"
    [getDismissLabel]="dismissLabel"
    (read)="onRead($event)"
    (dismissed)="onDismissed($event)"
  />`,
})
export class ExampleComponent {
  items = [
    { id: 'payment', title: 'استلام الدفعة', description: 'استُلمت رسوم الطلب 1042.' },
    { id: 'document', title: 'قبول المستند', read: true },
  ];
  markReadLabel = (item: { title: string }) => 'تعيين كمقروء: ' + item.title;
  dismissLabel = (item: { title: string }) => 'إزالة: ' + item.title;
  onRead(id: string) {}
  onDismissed(id: string) {}
}
```

### دون بنود

تعرض القائمة الفارغة الرسالة التي يوفّرها التطبيق بدلًا من القائمة.

```html live example=empty
<section class="hw-notification-list" aria-labelledby="empty-title">
  <h2 id="empty-title">الإشعارات</h2>
  <p>ليس لديك إشعارات.</p>
</section>
```

```tsx live example=empty
<NotificationList label="الإشعارات" unreadLabel="جديد" emptyMessage="ليس لديك إشعارات." items={[]} />
```

```vue live example=empty
<NotificationList label="الإشعارات" unread-label="جديد" empty-message="ليس لديك إشعارات." :items="[]" />
```

```ts live example=empty framework=angular
template: `<hw-notification-list label="الإشعارات" unreadLabel="جديد" emptyMessage="ليس لديك إشعارات." [items]="[]" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-notification-list

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-notification-list'` | `true` | — |
| `data-state` | `'read' \| 'unread'` | `false` | — |

ليس لقائمة الإشعارات متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `section` بالصنف `hw-notification-list`، يسمّيه عنصر عنوان ظاهر من المستوى الثاني عبر `aria-labelledby`، وعنصر `ul` تحمل عناصر `li` فيه الخاصية `data-state` بالقيمة `unread` أو `read`، دون خاصية `class`. ويضمّ كل بند عنصر عنوان من المستوى الثالث فيه العنوان، ويكون العنوان رابطًا بالصنف `hw-link` عندما تكون للبند وجهة، وشارة بالصنف `hw-badge` في البند غير المقروء، وفقرة اختيارية، وعنصر `time` اختياريًا، وأزرار الإجراءات. والإجراءات أزرار يكتبها التطبيق ويعالجها: تميّز الخاصية `data-hw-mark-read` زر التعيين كمقروء، وتميّز الخاصية `data-hw-dismiss` زر الإزالة. وعند وجود إجراءات اكتب على القسم الخاصية `tabindex` بالقيمة `-1`، ليستطيع القسم تلقّي التركيز عندما تصبح القائمة فارغة. وقبل أن تتغيّر القائمة بعد إجراء، استدعِ `prepareRemovalFocus` من `@hawiyah/core`، كما يصف ملف README في `@hawiyah/vanilla`، ثم غيّر القائمة وشغّل الدالة التي تُرجعها لنقل التركيز. والقائمة الفارغة فقرة واحدة بدلًا من عنصر `ul`.

### React

جدول: خصائص NotificationList

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly NotificationItem[]` | `true` | — |
| `emptyMessage` | `ReactNode` | `true` | — |
| `unreadLabel` | `string` | `true` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `onRead` | `(id: string) => void` | `false` | — |
| `getMarkReadLabel` | `(item: NotificationItem) => string` | `false` | — |
| `onDismiss` | `(id: string) => void` | `false` | — |
| `getDismissLabel` | `(item: NotificationItem) => string` | `false` | — |

الخاصية `items` مطلوبة، ولكل `NotificationItem` الحقلان المطلوبان `id` و`title`، والحقول الاختيارية `description` و`href` و`dateTime` و`dateLabel` و`read`. ويبقى البند غير مقروء إلى أن تكون قيمة `read` هي `true`. والخاصية `unreadLabel` مطلوبة: وهي النص الظاهر للشارة التي يعرضها البند غير المقروء. والخاصية `emptyMessage` مطلوبة: وتُعرض فقرةً بدلًا من القائمة. ويأتي العنوان من `label`؛ وتحلّ `aria-label` أو `aria-labelledby` المكتوبة على المكوّن محلّه، ولا تعرض `label` عندئذ عنوانًا إلا عند تمريرها. والحقل `dateLabel` هو التاريخ الظاهر، والحقل `dateTime` قيمته المخصّصة للمعالجة الآلية؛ ولا يعرض البند الذي ليس فيه `dateLabel` أي تاريخ. ويُعرض `description` في فقرة، فيجب أن يكون محتوى نصيًا ضمن السطر (phrasing content). وتتلقّى `onRead` و`onDismiss` معرّف البند. وتضيف `onRead` زرًا نصيًا إلى كل بند غير مقروء، نصه السلسلة النصية التي تُرجعها `getMarkReadLabel` للبند، وتضيف `onDismiss` زر أيقونة إلى كل بند، يسمّيه السلسلة النصية التي تُرجعها `getDismissLabel` للبند؛ وتكون الدالة المقابلة مطلوبة عند تمرير معالجها. وبعد الإجراء ينتقل التركيز إلى عنصر التحكم نفسه في البند التالي، وإلا ففي البند السابق، وإلا فإلى القسم. والقائمة حالةٌ يملكها التطبيق: فلا يزيل المكوّن شيئًا.

### Vue

جدول: خصائص NotificationList وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly NotificationItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `emptyMessage` | prop | `string` | `true` | — |
| `unreadLabel` | prop | `string` | `true` | — |
| `getMarkReadLabel` | prop | `(item: NotificationItem) => string` | `false` | — |
| `getDismissLabel` | prop | `(item: NotificationItem) => string` | `false` | — |
| `onRead` | prop | `((id: string) => void) \| ((id: string) => void)[]` | `false` | — |
| `onDismiss` | prop | `((id: string) => void) \| ((id: string) => void)[]` | `false` | — |
| `<id>` | slot | — | `false` | — |

الخاصية `items` مطلوبة، ولكل `NotificationItem` الحقلان المطلوبان `id` و`title`، والحقول الاختيارية `description` و`href` و`dateTime` و`dateLabel` و`read`. ويبقى البند غير مقروء إلى أن تكون قيمة `read` هي `true`. والخاصيتان `unreadLabel` و`emptyMessage` مطلوبتان، كما في المحوّلات الأخرى: الأولى هي النص الظاهر لشارة البند غير المقروء، والثانية تُعرض بدلًا من القائمة. وتعرض الخاصية `label` العنوان الظاهر؛ ولا تغيّر `aria-label` أو `aria-labelledby` المكتوبة على المكوّن إلا اسم القسم. ويضيف المستمع `onRead` زرًا نصيًا إلى كل بند غير مقروء، نصه السلسلة النصية التي تُرجعها `getMarkReadLabel` للبند، ويضيف المستمع `onDismiss` زر أيقونة إلى كل بند، يسمّيه السلسلة النصية التي تُرجعها `getDismissLabel` للبند؛ وتكون الدالة المقابلة مطلوبة عند ربط مستمعها. ويتلقّى المستمعان معرّف البند. ويضيف المنفذ المسمّى بقيمة `id` لأحد البنود محتواه إلى ذلك البند. وبعد الإجراء ينتقل التركيز إلى عنصر التحكم نفسه في البند التالي، وإلا ففي البند السابق، وإلا فإلى القسم، الذي يحمل الخاصية `tabindex` بالقيمة `-1` ما دام مستمع مربوطًا. والقائمة حالةٌ يملكها التطبيق: فلا يزيل المكوّن شيئًا. ويسرد الجدول المنفذ بالصيغة `<id>` لأن اسمه يُحسب من البنود؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-notification-list ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwNotification[]` | `false` | `[]` |
| `emptyMessage` | input | `string` | `true` | — |
| `unreadLabel` | input | `string` | `true` | — |
| `getDismissLabel` | input | `(item: HwNotification) => string` | `false` | — |
| `getMarkReadLabel` | input | `(item: HwNotification) => string` | `false` | — |
| `dismissed` | output | `string` | `false` | — |
| `read` | output | `string` | `false` | — |

يُطبَّق `HwNotificationListComponent` على `hw-notification-list`. والمُدخل `items` قائمة من `HwNotification` لكل منها الحقلان المطلوبان `id` و`title`، والحقول الاختيارية `description` و`href` و`dateTime` و`dateLabel` و`read`. والمُدخلان `unreadLabel` و`emptyMessage` مطلوبان. ويعرض المُدخل `label` العنوان الظاهر الذي يسمّي القسم؛ وتسمّي `aria-label` أو `aria-labelledby` المكتوبة على `hw-notification-list` القسمَ بدلًا منه، ولا تحتاج إلى عنوان. ويُرسل المُخرج `read` معرّف البند من زر نصي في كل بند غير مقروء، نصه السلسلة النصية التي تُرجعها `getMarkReadLabel` للبند، ويُرسل المُخرج `dismissed` المعرّف من زر أيقونة يسمّيه `getDismissLabel`. ولا يُعرض كل زر إلا ما دام مستمع مربوطًا بمُخرجه، وتكون الدالة المقابلة مطلوبة عندئذ. وبعد الإجراء ينتقل التركيز إلى عنصر التحكم نفسه في البند التالي، وإلا ففي البند السابق، وإلا فإلى القسم، الذي يحمل الخاصية `tabindex` بالقيمة `-1` ما دام مستمع مربوطًا. والقائمة حالةٌ يملكها التطبيق: فلا يزيل المكوّن شيئًا.

## إمكانية الوصول

تعرض قائمة الإشعارات عنصر `section` يسمّيه عنصر العنوان الظاهر من المستوى الثاني، وقائمة بنود تكون عناوينها عناصر عناوين من المستوى الثالث. وليس المكوّن منطقة حيّة: فلا يعلن إشعارًا يُضاف بعد تحميل الصفحة. وأعلن الرسالة العاجلة بتنبيه أو برسالة حالة من التطبيق، أو بالمكوّن ToastRegion.

- يُسمّى القسم بالعنوان الذي تعرضه `label`، عبر `aria-labelledby`؛ وعند كتابة `aria-label` أو `aria-labelledby` على المكوّن يُستخدم ذلك الاسم، ولا يلزم عنوان. واجعل للاسم مصدرًا واحدًا.
- يعرض البند غير المقروء شارة ظاهرة فيها نص `unreadLabel`، فلا تعتمد الحالة على اللون. وتطبّق الخاصية `data-state` على البند أنماطه، وليس لها نص خاص بها.
- العنوان الذي له وجهة رابط بالصنف `hw-link`؛ وهو دون وجهة نص عادي. والتاريخ عنصر `time` أصلي، ولا يُعرض إلا عند تمرير `dateLabel`.
- لكل زر تعيين كمقروء النص الظاهر الذي تُرجعه `getMarkReadLabel`، وكل زر إزالة زر أيقونة يسمّيه `getDismissLabel`. اكتب أسماء تتضمّن عنوان البند، مثل «إزالة: استلام الدفعة»، لأن قائمة أزرار يكون نص كل منها «إزالة» لا تتيح للقارئ أي وسيلة للتمييز بينها.
- بعد الإجراء ينتقل التركيز إلى عنصر التحكم نفسه في البند التالي، وإلا ففي البند السابق، وإلا فإلى القسم، فلا يبقى القارئ على عنصر تحكم أُزيل. ويحمل القسم الخاصية `tabindex` بالقيمة `-1` ما دام إجراء مربوطًا، ليستطيع تلقّي التركيز عندما تصبح القائمة فارغة.
- ضع القسم تحت عنوان من المستوى الأول في الصفحة، لأن عنوانه من المستوى الثاني.

## الاتجاه والتوطين

ليس في قائمة الإشعارات نص مدمج: يكتب التطبيق العنوان والعناوين والأوصاف والتواريخ ونص البند غير المقروء ورسالة القائمة الفارغة وأسماء الأزرار كلها بلغة الصفحة. ويتبع القسم اتجاه الصفحة عبر خصائص CSS المنطقية، فيبدأ المحتوى من جهة بدء القراءة في العربية وفي الإنجليزية.

- الحقل `dateLabel` نص يكتبه التطبيق، فيتحكم التطبيق في لغة التاريخ الظاهر وتقويمه وأرقامه؛ ويبقى `dateTime` قيمة مخصّصة للمعالجة الآلية بصيغ HTML.
- يحتوي زر الإزالة على أيقونة لا اتجاه لها ولا نص فيها؛ ويأتي اسمه من `getDismissLabel`، بلغة الصفحة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط قائمة الإشعارات بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج قائمة الإشعارات في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- تقيس [ملاحظات الإشعارات](../nic-notifications.md) الشريط والنافذة الحوارية في ملفات كود المنصات المزوَّدة، لا قائمة الإشعارات. ويسجّل صفّها الخاص بالإزالة والتركيز الترتيب الذي تتبعه قائمة الإشعارات بعد الإجراء: عنصر تحكم لاحق، ثم عنصر تحكم سابق، ثم المنطقة المسمّاة.
