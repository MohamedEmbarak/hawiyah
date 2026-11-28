---
source:
  summary: 9448b6157119
  example: 0d67aec1b194
  variants-and-states: 68e2029bfdbc
  api: 33d337f6c3e0
  accessibility: 307e5793549f
  rtl-and-localisation: 66da134656b4
  platforms-code-reference: 87b149deef84
---
# إشعارات فورية

منطقة الإشعارات الفورية منطقة مسمّاة تعرض رسائل قصيرة يملكها التطبيق، وتعلنها التقنيات المساعدة. ويقرّر التطبيق الرسائل الموجودة، ومتى تُزال، وما يحدث عندما يغلق القارئ إحداها.

## مثال

للرسالة الحقل `id`، والحقل الاختياري `title`، والحقل `message`، وتسمّي المنطقة نفسها بالخاصية `label`. وتُعلَن الرسالة دون مقاطعة القارئ ما لم تُعلَّم بالحقل `urgent`؛ وتحتفظ المنطقة بمنطقتين حيّتين منفصلتين للنوعين، فلا تقاطع القارئَ إلا الرسالةُ العاجلة. وتستخدم الأمثلة `position="inline"` لتقع المنطقة داخل الصفحة. ودونها تُثبَّت المنطقة في النافذة، عند زاويتها السفلية من جهة النهاية.

```html live example=basic static differences=toast-region-adapter-markup
<section class="hw-toast-region" tabindex="-1" aria-label="الإشعارات" data-position="inline">
  <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">
    <article class="hw-toast" data-hw-toast="submitted" data-tone="success">
      <div class="hw-toast-content"><strong>قُدِّم الطلب</strong><p>استُلم طلبك. احتفظ بالرقم المرجعي للمتابعة.</p></div>
    </article>
  </div>
  <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive">
    <article class="hw-toast" data-hw-toast="upload" data-tone="danger">
      <div class="hw-toast-content"><strong>تعذّر الرفع</strong><p>تعذّر رفع المستند. حاول مرة أخرى.</p></div>
    </article>
  </div>
</section>
```

```tsx live example=basic
<ToastRegion
  label="الإشعارات"
  position="inline"
  messages={[
    { id: 'submitted', title: 'قُدِّم الطلب', message: 'استُلم طلبك. احتفظ بالرقم المرجعي للمتابعة.', tone: 'success' },
    { id: 'upload', title: 'تعذّر الرفع', message: 'تعذّر رفع المستند. حاول مرة أخرى.', tone: 'danger', urgent: true },
  ]}
/>
```

```vue live example=basic
<ToastRegion
  label="الإشعارات"
  position="inline"
  :messages="[
    { id: 'submitted', title: 'قُدِّم الطلب', message: 'استُلم طلبك. احتفظ بالرقم المرجعي للمتابعة.', tone: 'success' },
    { id: 'upload', title: 'تعذّر الرفع', message: 'تعذّر رفع المستند. حاول مرة أخرى.', tone: 'danger', urgent: true },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-toast-region
  label="الإشعارات"
  position="inline"
  [messages]="[
    { id: 'submitted', title: 'قُدِّم الطلب', message: 'استُلم طلبك. احتفظ بالرقم المرجعي للمتابعة.', tone: 'success' },
    { id: 'upload', title: 'تعذّر الرفع', message: 'تعذّر رفع المستند. حاول مرة أخرى.', tone: 'danger', urgent: true },
  ]"
/>`
```

## الأشكال والحالات

### الألوان الدلالية

قيمة الحقل `tone` للرسالة هي `neutral` أو `info` أو `success` أو `warning` أو `danger`، والرسالة التي ليس لها لون دلالي تأخذ `info`. ويضبط اللون الدلالي لون الرسالة. واكتب المعنى بالكلمات أيضًا، لأن اللون وحده لا ينقله.

```html live example=tones static differences=toast-region-adapter-markup
<section class="hw-toast-region" tabindex="-1" aria-label="الإشعارات" data-position="inline">
  <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">
    <article class="hw-toast" data-hw-toast="neutral" data-tone="neutral"><div class="hw-toast-content"><strong>الرقم المرجعي</strong><p>رقمك المرجعي هو 2041.</p></div></article>
    <article class="hw-toast" data-hw-toast="info" data-tone="info"><div class="hw-toast-content"><strong>المراجعة جارية</strong><p>طلبك قيد المراجعة.</p></div></article>
    <article class="hw-toast" data-hw-toast="success" data-tone="success"><div class="hw-toast-content"><strong>قُبِل الطلب</strong><p>قُبِل طلبك.</p></div></article>
    <article class="hw-toast" data-hw-toast="warning" data-tone="warning"><div class="hw-toast-content"><strong>مستندات ناقصة</strong><p>أرفق المستندات المؤيدة قبل التقديم.</p></div></article>
    <article class="hw-toast" data-hw-toast="danger" data-tone="danger"><div class="hw-toast-content"><strong>رُفض الطلب</strong><p>رُفض طلبك. اطّلع على السبب وقدّم طلبًا جديدًا.</p></div></article>
  </div>
  <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive"></div>
</section>
```

```tsx live example=tones
<ToastRegion
  label="الإشعارات"
  position="inline"
  messages={[
    { id: 'neutral', title: 'الرقم المرجعي', message: 'رقمك المرجعي هو 2041.', tone: 'neutral' },
    { id: 'info', title: 'المراجعة جارية', message: 'طلبك قيد المراجعة.', tone: 'info' },
    { id: 'success', title: 'قُبِل الطلب', message: 'قُبِل طلبك.', tone: 'success' },
    { id: 'warning', title: 'مستندات ناقصة', message: 'أرفق المستندات المؤيدة قبل التقديم.', tone: 'warning' },
    { id: 'danger', title: 'رُفض الطلب', message: 'رُفض طلبك. اطّلع على السبب وقدّم طلبًا جديدًا.', tone: 'danger' },
  ]}
/>
```

```vue live example=tones
<ToastRegion
  label="الإشعارات"
  position="inline"
  :messages="[
    { id: 'neutral', title: 'الرقم المرجعي', message: 'رقمك المرجعي هو 2041.', tone: 'neutral' },
    { id: 'info', title: 'المراجعة جارية', message: 'طلبك قيد المراجعة.', tone: 'info' },
    { id: 'success', title: 'قُبِل الطلب', message: 'قُبِل طلبك.', tone: 'success' },
    { id: 'warning', title: 'مستندات ناقصة', message: 'أرفق المستندات المؤيدة قبل التقديم.', tone: 'warning' },
    { id: 'danger', title: 'رُفض الطلب', message: 'رُفض طلبك. اطّلع على السبب وقدّم طلبًا جديدًا.', tone: 'danger' },
  ]"
/>
```

```ts live example=tones framework=angular
template: `<hw-toast-region
  label="الإشعارات"
  position="inline"
  [messages]="[
    { id: 'neutral', title: 'الرقم المرجعي', message: 'رقمك المرجعي هو 2041.', tone: 'neutral' },
    { id: 'info', title: 'المراجعة جارية', message: 'طلبك قيد المراجعة.', tone: 'info' },
    { id: 'success', title: 'قُبِل الطلب', message: 'قُبِل طلبك.', tone: 'success' },
    { id: 'warning', title: 'مستندات ناقصة', message: 'أرفق المستندات المؤيدة قبل التقديم.', tone: 'warning' },
    { id: 'danger', title: 'رُفض الطلب', message: 'رُفض طلبك. اطّلع على السبب وقدّم طلبًا جديدًا.', tone: 'danger' },
  ]"
/>`
```

### الإغلاق

لا يكون للرسالة زر إغلاق إلا عندما يستمع التطبيق إلى الإغلاق، وتسمّي `getDismissLabel` كل زر؛ ويمكن للتطبيق في ترميز vanilla أن يكتب بدلًا من ذلك الخاصية `aria-label` لكل زر بنفسه، فيحتفظ بها المتحكم. والرسالة المعلَّمة بأنها غير قابلة للإغلاق ليس لها زر. ولا تزيل المنطقة أي رسالة من قائمة التطبيق: يزيلها التطبيق في معالجه، وتنقل المنطقة التركيز إلى إجراء مجاور أو إلى المنطقة نفسها عندما تغادر الرسالة التي كان عليها التركيز. ويُخفي المتحكم الذي تنشئه الدالة `enhance()` الرسالة التي أغلقها القارئ، ويبلّغ عن معرّفها.

```html live example=dismissal static differences=toast-region-adapter-markup
<section class="hw-toast-region" tabindex="-1" aria-label="الإشعارات" data-position="inline" data-hw="toast-region">
  <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">
    <article class="hw-toast" data-hw-toast="saved" data-tone="success">
      <div class="hw-toast-content"><strong>حُفظت المسودة</strong><p>حُفظت تغييراتك على الطلب.</p></div>
      <button type="button" class="hw-button hw-toast-dismiss" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="إغلاق: حُفظت المسودة"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </article>
    <article class="hw-toast" data-hw-toast="documents" data-tone="warning">
      <div class="hw-toast-content"><strong>مستندات مطلوبة</strong><p>أرفق المستندات المؤيدة قبل التقديم.</p></div>
      <button type="button" class="hw-button hw-toast-dismiss" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="إغلاق: مستندات مطلوبة"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </article>
  </div>
  <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive"></div>
</section>
```

```tsx live example=dismissal
import { useState } from 'react';
import { ToastRegion } from '@hawiyah/react';

export default function Example() {
  const [messages, setMessages] = useState([
    { id: 'saved', title: 'حُفظت المسودة', message: 'حُفظت تغييراتك على الطلب.', tone: 'success' as const },
    { id: 'documents', title: 'مستندات مطلوبة', message: 'أرفق المستندات المؤيدة قبل التقديم.', tone: 'warning' as const },
  ]);
  return (
    <ToastRegion
      label="الإشعارات"
      position="inline"
      messages={messages}
      getDismissLabel={(message) => `إغلاق: ${message.title}`}
      onDismiss={(id) => setMessages((current) => current.filter((message) => message.id !== id))}
    />
  );
}
```

```vue live example=dismissal
<script setup lang="ts">
import { ref } from 'vue';
import { ToastRegion } from '@hawiyah/vue';

const messages = ref([
  { id: 'saved', title: 'حُفظت المسودة', message: 'حُفظت تغييراتك على الطلب.', tone: 'success' as const },
  { id: 'documents', title: 'مستندات مطلوبة', message: 'أرفق المستندات المؤيدة قبل التقديم.', tone: 'warning' as const },
]);

function remove(id: string) {
  messages.value = messages.value.filter((message) => message.id !== id);
}
</script>

<template>
  <ToastRegion
    label="الإشعارات"
    position="inline"
    :messages="messages"
    :get-dismiss-label="(message) => `إغلاق: ${message.title}`"
    @dismiss="remove"
  />
</template>
```

```ts live example=dismissal framework=angular
import { Component, signal } from '@angular/core';
import { HwToastRegionComponent, type HwToast } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwToastRegionComponent],
  template: `
    <hw-toast-region
      label="الإشعارات"
      position="inline"
      [messages]="messages()"
      [getDismissLabel]="dismissLabel"
      (dismissed)="remove($event)"
    />
  `,
})
export class ExampleComponent {
  readonly messages = signal<HwToast[]>([
    { id: 'saved', title: 'حُفظت المسودة', message: 'حُفظت تغييراتك على الطلب.', tone: 'success' },
    { id: 'documents', title: 'مستندات مطلوبة', message: 'أرفق المستندات المؤيدة قبل التقديم.', tone: 'warning' },
  ]);

  readonly dismissLabel = (message: HwToast): string => `إغلاق: ${message.title}`;

  remove(id: string): void {
    this.messages.update((current) => current.filter((message) => message.id !== id));
  }
}
```

### الشريط

تمنح القيمة `variant="banner"` كل رسالة منطقة أيقونة ومظهر الشريط. ويُبقي الموضع المضمَّن الشريط في تدفّق الصفحة، ودونه يُثبَّت الشريط في النافذة قرب زاويتها العلوية من جهة النهاية.

```html live example=banner static
<section class="hw-toast-region" tabindex="-1" aria-label="الإشعارات" data-variant="banner" data-position="inline">
  <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">
    <article class="hw-toast" data-hw-toast="maintenance" data-tone="info">
      <span class="hw-toast-icon" aria-hidden="true"></span>
      <div class="hw-toast-content"><strong>صيانة مجدولة</strong><p>لا يمكن تقديم الطلبات يوم الجمعة بين الساعة 01:00 والساعة 03:00.</p></div>
    </article>
  </div>
  <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive"></div>
</section>
```

```tsx live example=banner
<ToastRegion
  label="الإشعارات"
  variant="banner"
  position="inline"
  messages={[
    { id: 'maintenance', title: 'صيانة مجدولة', message: 'لا يمكن تقديم الطلبات يوم الجمعة بين الساعة 01:00 والساعة 03:00.', tone: 'info' },
  ]}
/>
```

```vue live example=banner
<ToastRegion
  label="الإشعارات"
  variant="banner"
  position="inline"
  :messages="[
    { id: 'maintenance', title: 'صيانة مجدولة', message: 'لا يمكن تقديم الطلبات يوم الجمعة بين الساعة 01:00 والساعة 03:00.', tone: 'info' },
  ]"
/>
```

```ts live example=banner framework=angular
template: `<hw-toast-region
  label="الإشعارات"
  variant="banner"
  position="inline"
  [messages]="[
    { id: 'maintenance', title: 'صيانة مجدولة', message: 'لا يمكن تقديم الطلبات يوم الجمعة بين الساعة 01:00 والساعة 03:00.', tone: 'info' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createToastRegion

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'inline' \| 'banner'` | `false` | — |
| `position` | `'inline' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `false` | — |
| `label` | `string` | `false` | — |
| `getDismissLabel` | `(toast: HTMLElement) => string` | `false` | — |
| `onDismiss` | `(id: string) => void` | `false` | — |

تضيف الدالة `createToastRegion(root, options)` السلوك إلى منطقة كتبها التطبيق؛ وتنشئها الدالة `enhance()` لكل عنصر يحمل `data-hw="toast-region"`. ويُرجع المتحكم `dismiss(target)`، التي تأخذ معرّف رسالة أو عنصرها، و`destroy()`. والترميز هو الواجهة البرمجية: عنصر `section` بالصنف `hw-toast-region`، ومنطقة حيّة للرسائل التي تُعلَن دون مقاطعة ومنطقة حيّة للرسائل العاجلة، وفي كل منهما عنصر `article` بالصنف `hw-toast`، تُضبط فيه الخاصية `data-hw-toast` على معرّف الرسالة، والخاصية `data-tone` على لونها الدلالي. والرسالة عنصر `div` بالصنف `hw-toast-content` يحتوي على عنوان اختياري في عنصر `strong` وعلى فقرة. ولزر الإغلاق الصنفان `hw-button` و`hw-toast-dismiss` والخاصية `data-hw-dismiss`، وتمنع الخاصية `data-hw-dismissible` على عنصر `article`، بالقيمة false، إغلاقَ الرسالة. ويُكتب الخياران `variant` و`position` في الخاصيتين `data-variant` و`data-position` على المنطقة، ولشكل الشريط عنصر `span` بالصنف `hw-toast-icon` قبل المحتوى. والخيار `label` هو الاسم الميسّر للمنطقة؛ وهو مطلوب ما لم يكن للترميز اسم من قبل بالخاصية `aria-label` أو `aria-labelledby`، ولا يكتبه المتحكم إلا إذا لم يكن للمنطقة اسم. وتتلقّى `getDismissLabel` عنصر الرسالة وتُرجع اسم زر إغلاقها، وهي مطلوبة ما دامت رسالة قابلة للإغلاق وليس لزرها اسم خاص به. ويُخفي المتحكم الرسالة المغلقة، ويُرسل الحدث `hw:change` وفي تفاصيله معرّف الرسالة المغلقة، ويستدعي `onDismiss` بالمعرّف، ثم ينقل التركيز إلى إجراء مجاور أو إلى المنطقة، إذا كان التركيز على الرسالة المغلقة فقط. ولا تحتاج الأمثلة الثابتة في هذه الصفحة، التي تعرض الرسائل فقط، إلى متحكم؛ ولا تحتاج المنطقة إلى `data-hw="toast-region"` إلا للإغلاق وللتحقق من اسمها.

### React

جدول: خصائص ToastRegion

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `messages` | `readonly ToastMessage[]` | `true` | — |
| `variant` | `'default' \| 'inline' \| 'banner'` | `false` | — |
| `position` | `'inline' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |
| `onDismiss` | `(id: string) => void` | `false` | — |
| `getDismissLabel` | `(message: ToastMessage) => string` | `false` | — |

لكل `ToastMessage` الحقلان المطلوبان `id` و`message`، والحقل الاختياري `title`، والحقل `tone` بإحدى القيم `neutral` أو `info` أو `success` أو `warning` أو `danger`، والحقلان `urgent` و`dismissible`. والحقل `message` محتوى قابل للعرض يُعرض في فقرة، والرسالة التي لا تحمل `tone` تأخذ `info`. وتحتاج المنطقة إلى اسم من `label` أو `aria-label` أو `aria-labelledby`. ولا تظهر أزرار الإغلاق إلا عند تمرير `onDismiss`، وتكون `getDismissLabel` عندئذ مطلوبة. والرسالة التي قيمة `dismissible` فيها `false` ليس لها زر. وتتلقّى `onDismiss` المعرّف؛ ولا تزيل المنطقة الرسالة، فأزلها من `messages` في المعالج. وتنقل المنطقة التركيز بعد أن يقبل التطبيق الإزالة، وتراعي الرسالة التي يُبقيها التطبيق أو التركيز الذي ينقله التطبيق.

### Vue

جدول: خصائص ToastRegion وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `messages` | prop | `readonly ToastMessage[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `getDismissLabel` | prop | `(message: ToastMessage) => string` | `false` | — |
| `variant` | prop | `'default' \| 'inline' \| 'banner'` | `false` | — |
| `position` | prop | `'inline' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `false` | — |
| `onDismiss` | prop | `ToastDismissHandler \| ToastDismissHandler[]` | `false` | — |
| `onDismissOnce` | prop | `ToastDismissHandler \| ToastDismissHandler[]` | `false` | — |

حقول الرسالة هي `id` و`message`، وهما مطلوبان، والحقول الاختيارية `title` و`tone` و`urgent` و`dismissible`. وتحتاج المنطقة إلى اسم من `label`. ويظهر زر الإغلاق عندما يستمع التطبيق إلى الإغلاق بمستمع v-on، وتكون `getDismissLabel` عندئذ مطلوبة؛ والرسالة التي قيمة `dismissible` فيها `false` ليس لها زر. ويتلقّى المستمع معرّف الرسالة، ويزيل التطبيق الرسالة من `messages`. ويسرد الجدول `onDismiss` و`onDismissOnce` خصائصَ للمكوّن، لأن التصريح المنشور يعرّف أنواع المستمعات على هذا النحو. ويُظهر المستمع من نوع once الأزرار حتى أول استدعاء له ثم يزيلها، ما لم يستمع `onDismiss` أيضًا. ولا يصرّح المكوّن بأي منفذ.

### Angular

جدول: مُدخلات hw-toast-region ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | input | `'default' \| 'inline' \| 'banner'` | `false` | `'default'` |
| `position` | input | `'inline' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `false` | — |
| `label` | input | `string` | `true` | — |
| `messages` | input | `readonly HwToast[]` | `false` | `[]` |
| `getDismissLabel` | input | `(message: HwToast) => string` | `false` | — |
| `dismissed` | output | `string` | `false` | — |

يُطبَّق `HwToastRegionComponent` على `hw-toast-region`. والمُدخل `label` يسمّي المنطقة، وهو مطلوب. ولكل `HwToast` في `messages` الحقلان `id` و`message`، واختياريًا الحقول `title` و`tone` و`urgent` و`dismissible`. والرسالة التي لا تحمل `tone` تأخذ `info`. ويفعّل ربط `(dismissed)` أزرار الإغلاق، ويُرسل المُخرج `dismissed` معرّف الرسالة المغلقة؛ فأزل تلك الرسالة من `messages` في المعالج. ويسمّي `getDismissLabel` كل زر، وهو مطلوب ما دامت رسالة قابلة للإغلاق. والرسالة التي قيمة `dismissible` فيها `false` ليس لها زر. ولا يعرض المكوّن أي محتوى مُسقَط.

## إمكانية الوصول

تعرض منطقة الإشعارات الفورية عنصر `section` اسمه الميسّر قيمة `label`، وقيمة الخاصية tabindex فيه `-1`، فيستطيع التطبيق نقل التركيز إليه. وداخله تقع الرسائل غير العاجلة في منطقة حيّة تحمل `role="status"` وتعلن الإضافات دون مقاطعة القارئ، وتقع الرسائل العاجلة في منطقة حيّة تحمل `role="alert"` وتعلنها فورًا. واقصر `urgent` على رسالة يجب أن يسمعها القارئ في الحال؛ وتُعلَن الرسائل الأخرى دون مقاطعة.

- كل رسالة عنصر `article`. وليس للرسالة انتهاء تلقائي: تبقى حتى يزيلها التطبيق. فلا تُزِل رسالة لم يتّسع للقارئ وقت لقراءتها.
- يحمل زر الإغلاق أيقونة فقط، فيأتي اسمه من `getDismissLabel`. اكتب اسمًا يتضمّن عنوان الرسالة، مثل «إغلاق: حُفظت المسودة»، لتختلف الأزرار المتعددة بعضها عن بعض.
- عندما يكون التركيز على الرسالة المغلقة، تنقل المنطقة التركيز إلى زر الإغلاق التالي، وإلا فإلى السابق، وإلا فإلى المنطقة نفسها، ما لم يُبقِ التطبيق الرسالة أو ينقل التركيز.
- الرسالة غير القابلة للإغلاق ليس لها زر، ولا يستطيع القارئ إزالتها. فلا تستخدمها إلا لإشعار يجب أن يبقى.
- ليس اللون الإشارة الوحيدة: اكتب معنى الرسالة في عنوانها أو في نصها.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: إشعارات فورية

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd>، <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى العنصر التالي أو السابق القابل للتركيز، فيغادر المنطقة بعد آخر زر إغلاق فيها؛ وأزرار الإغلاق بترتيب الرسائل. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل زر الإغلاق الذي عليه التركيز، فيطلب إغلاق رسالته. |

## الاتجاه والتوطين

ليس في منطقة الإشعارات الفورية نص مدمج. يكتب التطبيق التسمية والعناوين والرسائل وأسماء أزرار الإغلاق بلغة الصفحة. وتتبع المنطقة اتجاه الصفحة، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فتقع الأيقونة والمحتوى وزر الإغلاق بترتيب القراءة في العربية وفي الإنجليزية، ومواضع الزوايا `top-start` و`top-end` و`bottom-start` و`bottom-end` منطقية: تتبع اتجاه القراءة.

- اكتب اسم زر الإغلاق بلغة الرسالة. فالاسم مثل «إغلاق: حُفظت المسودة» تبنيه `getDismissLabel`، فيتبع لغة التطبيق.
- اكتب الأعداد والأوقات والأرقام المرجعية في الرسالة بالأرقام والصيغة المستخدمة في الصفحة؛ فالمنطقة لا تغيّرها.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط منطقة الإشعارات الفورية بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج منطقة الإشعارات الفورية في الصف Additional interaction من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- تربط [ملاحظات الإشعارات](../nic-notifications.md) أبعاد الشريط، والألوان الدلالية، وقواعد الإعلان، والإشعار المحمي، واستعادة التركيز بعد الإغلاق، وتذكر قياسات المصدر والتكييفات.
