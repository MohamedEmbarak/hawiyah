---
source:
  summary: 6c676bb16b41
  example: e49c3be3fcd1
  variants-and-states: f583a628df58
  api: dbe030a5266a
  accessibility: 5033d18641db
  rtl-and-localisation: 1270e54a8e30
  platforms-code-reference: 21d633e4e0d5
---
# تنبيه

يعرض التنبيه داخل الصفحة رسالة قصيرة عن حالة مهمة أو مستند، بأحد خمسة ألوان دلالية. ويُعلن عن نفسه للتقنيات المساعدة بحسب لونه الدلالي، ويقرّر التطبيق هل يمكن إغلاقه.

## مثال

يحمل التنبيه نص الرسالة في محتواه. واللون الدلالي الافتراضي هو `info`، ويُعلَن التنبيه به حالةً دون مقاطعة القارئ.

```html live example=basic
<div class="hw-alert" data-tone="info" role="status">
  <div class="hw-alert-content"><p>تُعالَج الطلبات الواردة بعد الساعة 14:00 في يوم العمل التالي.</p></div>
</div>
```

```tsx live example=basic
<Alert>
  <p>تُعالَج الطلبات الواردة بعد الساعة 14:00 في يوم العمل التالي.</p>
</Alert>
```

```vue live example=basic
<Alert>
  <p>تُعالَج الطلبات الواردة بعد الساعة 14:00 في يوم العمل التالي.</p>
</Alert>
```

```ts live example=basic framework=angular
template: `<hw-alert>
  <p>تُعالَج الطلبات الواردة بعد الساعة 14:00 في يوم العمل التالي.</p>
</hw-alert>`
```

## الأشكال والحالات

### اللون الدلالي

تقبل الخاصية `tone` القيم `neutral` و`info` و`success` و`warning` و`danger`. ويُعلَن تنبيه الخطر فورًا بوصفه تنبيهًا عاجلًا، ويُعلَن التنبيه بكل لون دلالي آخر حالةً. واذكر المعنى بالكلمات، لأن اللون الدلالي يغيّر لون التنبيه أيضًا.

```html live example=danger
<div class="hw-alert" data-tone="danger" role="alert">
  <div class="hw-alert-content"><p>لم يُرفع المستند. اختر ملفًا بصيغة PDF ثم أعد المحاولة.</p></div>
</div>
```

```tsx live example=danger
<Alert tone="danger">
  <p>لم يُرفع المستند. اختر ملفًا بصيغة PDF ثم أعد المحاولة.</p>
</Alert>
```

```vue live example=danger
<Alert tone="danger">
  <p>لم يُرفع المستند. اختر ملفًا بصيغة PDF ثم أعد المحاولة.</p>
</Alert>
```

```ts live example=danger framework=angular
template: `<hw-alert tone="danger">
  <p>لم يُرفع المستند. اختر ملفًا بصيغة PDF ثم أعد المحاولة.</p>
</hw-alert>`
```

### المظهر ذو الإطار

تضبط الخاصية `variant` المظهر `outline` أو المظهر `minimal`. ودونها يكون للتنبيه المظهر الافتراضي.

```html live example=outline
<div class="hw-alert" data-tone="success" data-variant="outline" role="status">
  <div class="hw-alert-content"><p>تم تقديم طلبك.</p></div>
</div>
```

```tsx live example=outline
<Alert tone="success" variant="outline">
  <p>تم تقديم طلبك.</p>
</Alert>
```

```vue live example=outline
<Alert tone="success" variant="outline">
  <p>تم تقديم طلبك.</p>
</Alert>
```

```ts live example=outline framework=angular
template: `<hw-alert tone="success" variant="outline">
  <p>تم تقديم طلبك.</p>
</hw-alert>`
```

### العنوان

تضيف الخاصية `title` عنوانًا قصيرًا بنص عريض في بداية المحتوى، فوق الرسالة. وهو عنصر `strong` لا عنصر عنوان، فلا تعرضه التقنيات المساعدة بوصفه عنوانًا.

```html live example=title
<div class="hw-alert" data-tone="warning" role="status">
  <div class="hw-alert-content"><strong>معلومات ناقصة.</strong><p>أضف تاريخ الميلاد قبل تقديم الطلب.</p></div>
</div>
```

```tsx live example=title
<Alert tone="warning" title="معلومات ناقصة.">
  <p>أضف تاريخ الميلاد قبل تقديم الطلب.</p>
</Alert>
```

```vue live example=title
<Alert tone="warning" title="معلومات ناقصة.">
  <p>أضف تاريخ الميلاد قبل تقديم الطلب.</p>
</Alert>
```

```ts live example=title framework=angular
template: `<hw-alert tone="warning" title="معلومات ناقصة.">
  <p>أضف تاريخ الميلاد قبل تقديم الطلب.</p>
</hw-alert>`
```

### الإغلاق

يأتي زر الإغلاق بعد المحتوى عندما يستمع التطبيق إلى إجراء الإغلاق، واسمه الميسّر هو قيمة `closeLabel`. ولا يزيل التنبيه نفسه أبدًا: فالتطبيق هو الذي يزيله وينقل التركيز إلى العنصر الذي تتعلق به الرسالة. وتحتفظ أمثلة React وVue وAngular بحالة التنبيه، وتزيله عند إغلاقه، وتنقل التركيز إلى عنصر عنوان يمثّل ما تتعلق به الرسالة؛ ويُعرض معالج ترميز vanilla بعد المثال.

```html live example=dismiss
<div class="hw-alert" data-tone="info" role="status">
  <div class="hw-alert-content"><p>تم حفظ المسودة.</p></div>
  <button type="button" class="hw-button hw-alert-dismiss" data-variant="ghost" data-size="md" aria-label="إغلاق الرسالة"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
</div>
<h2 tabindex="-1">مسودة الطلب</h2>
```

```tsx live example=dismiss
import { useRef, useState } from 'react';
import { Alert } from '@hawiyah/react';

export default function Example() {
  const [open, setOpen] = useState(true);
  const target = useRef<HTMLHeadingElement>(null);
  return (
    <>
      {open ? (
        <Alert
          closeLabel="إغلاق الرسالة"
          onDismiss={() => {
            setOpen(false);
            target.current?.focus();
          }}
        >
          <p>تم حفظ المسودة.</p>
        </Alert>
      ) : null}
      <h2 ref={target} tabIndex={-1}>مسودة الطلب</h2>
    </>
  );
}
```

```vue live example=dismiss
<script setup lang="ts">
import { ref } from 'vue';
import { Alert } from '@hawiyah/vue';

const open = ref(true);
const target = ref<HTMLElement | null>(null);
function dismiss() {
  open.value = false;
  target.value?.focus();
}
</script>

<template>
  <Alert v-if="open" close-label="إغلاق الرسالة" @dismiss="dismiss">
    <p>تم حفظ المسودة.</p>
  </Alert>
  <h2 ref="target" tabindex="-1">مسودة الطلب</h2>
</template>
```

```ts live example=dismiss framework=angular
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { HwAlertComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwAlertComponent],
  template: `
    @if (open()) {
      <hw-alert closeLabel="إغلاق الرسالة" (dismissed)="dismiss()">
        <p>تم حفظ المسودة.</p>
      </hw-alert>
    }
    <h2 #target tabindex="-1">مسودة الطلب</h2>
  `,
})
export class ExampleComponent {
  readonly open = signal(true);
  private readonly target = viewChild.required<ElementRef<HTMLElement>>('target');

  dismiss(): void {
    this.open.set(false);
    this.target().nativeElement.focus();
  }
}
```

ليس في ترميز vanilla برنامج نصي. ويربط التطبيق المعالج بنفسه، ويزيل التنبيه، وينقل التركيز إلى ما تتعلق به الرسالة:

```ts
const alert = document.querySelector<HTMLElement>('.hw-alert')!;
alert.querySelector('.hw-alert-dismiss')!.addEventListener('click', () => {
  alert.remove();
  document.querySelector<HTMLElement>('main h1')?.focus();
});
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-alert

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-alert'` | `true` | — |
| `data-tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | — |
| `data-variant` | `'outline' \| 'minimal'` | `false` | — |

ليس للتنبيه متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-alert`، وعنصر `div` بالصنف `hw-alert-content` يحتوي على الرسالة، والخاصيتين `data-tone` و`role`. ولا تُكتب الخاصية `role` تلقائيًا: استخدم `role="alert"` لتنبيه الخطر، و`role="status"` لكل لون دلالي آخر؛ واكتب `role="status"` لرسالة الخطر التي تُعرض مع الصفحة وليست حدثًا لاحقًا. والخاصية `data-variant` اختيارية، ودونها يكون للتنبيه المظهر الافتراضي. وللتنبيه القابل للإغلاق، اكتب عنصر `button` بالصنفين `hw-button` و`hw-alert-dismiss`، يحمل الخاصية `data-variant="ghost"` وأيقونة من أيقونات الحزم تحمل الخاصية `aria-hidden="true"`، ويحمل الخاصية `aria-label`، عنصرًا ابنًا مباشرًا بعد المحتوى. ويربط التطبيق معالج النقر، ويزيل التنبيه، وينقل التركيز؛ ولا يُخفي الترميز نفسه أبدًا.

### React

جدول: خصائص Alert

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `false` | `'info'` |
| `variant` | `'default' \| 'outline' \| 'minimal'` | `false` | — |
| `title` | `string` | `false` | — |
| `onDismiss` | `() => void` | `false` | — |
| `closeLabel` | `string` | `false` | — |

العناصر الأبناء هي الرسالة. ودون خاصية المكوّن `role` يحمل التنبيه الخاصية `role="alert"` للون الدلالي `danger`، و`role="status"` لكل لون دلالي آخر؛ ومرّر `role="status"` لرسالة الخطر التي تُعرض مع الصفحة وليست حدثًا لاحقًا. ولا تُكتب الخاصية `variant` في `data-variant` إلا عند تمريرها. وتعرض الخاصية `onDismiss` زر إغلاق شفافًا بعد المحتوى، والخاصية `closeLabel`، وهي اسمه الميسّر، مطلوبة عند تمرير `onDismiss`. ولا يُخفي التنبيه نفسه أبدًا. وتصل الخصائص الأخرى لعنصر `div` الأصلي إلى عنصر التنبيه.

### Vue

جدول: خصائص Alert وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `tone` | prop | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'info'` |
| `title` | prop | `string` | `false` | — |
| `variant` | prop | `'default' \| 'outline' \| 'minimal'` | `false` | — |
| `closeLabel` | prop | `string` | `false` | — |
| `onDismiss` | prop | `(() => void) \| (() => void)[]` | `false` | — |
| `default` | slot | — | `false` | — |

المنفذ الافتراضي هو الرسالة. ودون خاصية HTML `role` يحمل التنبيه الخاصية `role="alert"` للون الدلالي `danger`، و`role="status"` لكل لون دلالي آخر؛ ومرّر `role="status"` لرسالة الخطر التي تُعرض مع الصفحة. واستمع إلى إجراء الإغلاق بمعالج، يسرده التصريح خاصيةً باسم `onDismiss`: فالمستمع المربوط يعرض زر إغلاق شفافًا بعد المحتوى، وتكون الخاصية `closeLabel`، وهي اسمه الميسّر، مطلوبة عندئذ. ولا يُخفي التنبيه نفسه أبدًا. وتصل خصائص HTML الأخرى إلى عنصر التنبيه.

### Angular

جدول: مُدخلات hw-alert ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `tone` | input | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `false` | `'info'` |
| `variant` | input | `'default' \| 'outline' \| 'minimal'` | `false` | — |
| `title` | input | `string` | `false` | `''` |
| `role` | input | `'alert' \| 'status' \| 'region' \| 'group'` | `false` | — |
| `closeLabel` | input | `string` | `false` | `''` |
| `dismissed` | output | `void` | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwAlertComponent` على `hw-alert`؛ والعنصر المضيف هو التنبيه نفسه، ويحمل الصنف `hw-alert`، والمحتوى المُسقَط هو الرسالة. ودون المُدخل `role` يحمل العنصر المضيف الخاصية `role="alert"` للون الدلالي `danger`، و`role="status"` لكل لون دلالي آخر؛ واضبط `role="status"` لرسالة الخطر التي تُعرض مع الصفحة. واكتب `role` و`variant` مُدخلَين، بقيمة ثابتة أو مربوطة؛ فالكتابة `[attr.role]` و`[attr.data-variant]` على `hw-alert` غير مدعومة. ولا يُكتب المُدخل `variant` في `data-variant` إلا عند تمريره. وما دام مستمع `(dismissed)` مربوطًا، يأتي زر إغلاق شفاف بعد المحتوى، ويكون المُدخل `closeLabel`، وهو اسمه الميسّر، مطلوبًا عندئذ لا في غيره. ولا يُخفي التنبيه نفسه أبدًا.

## إمكانية الوصول

التنبيه عنصر `div` دوره `alert` أو `status`؛ ودون `role` تمنح المحوّلات تنبيه الخطر الخاصية `role="alert"`، والتنبيه بكل لون دلالي آخر الخاصية `role="status"`. ويتبع الدور درجة إلحاح الرسالة.

- يحمل تنبيه الخطر الخاصية `role="alert"`، التي تقاطع القارئ. ويحمل التنبيه بكل لون دلالي آخر الخاصية `role="status"`، التي تنتظر توقفًا. واختر اللون الدلالي بحسب درجة الإلحاح والتوقيت.
- الرسالة الموجودة في الصفحة عند تحميلها ليست حدثًا لاحقًا. فامنح رسالة الخطر من هذا النوع الخاصية `role="status"`، كي لا تقاطع القارئ فورًا.
- يغيّر اللون الدلالي لون التنبيه أيضًا. فاذكر معنى الرسالة بالكلمات، لأن القارئ لا يستطيع الاعتماد على اللون وحده.
- زر الإغلاق عنصر `button` أصلي يقبل التركيز في ترتيب التنقل بالمفتاح Tab، ويُسمّى بقيمة `closeLabel`، أو بقيمة الخاصية `aria-label` للزر في الترميز الذي يكتبه التطبيق بنفسه. وأيقونته مخفية عن التقنيات المساعدة.
- لا يزيل التنبيه نفسه أبدًا. وعندما يزيله التطبيق، انقل التركيز إلى العنصر الذي تتعلق به الرسالة أو إلى عنصر عنوان المنطقة المحيطة، كي لا يعود التركيز إلى بداية الصفحة.
- ضع الرسالة التي تتطلب إجراءً بجانب عنصر التحكم الذي تخصّه، واستخدم نص الرسالة لبيان ما يجب فعله.

## الاتجاه والتوطين

ليس في التنبيه نص مدمج: يكتب التطبيق الرسالة والعنوان وقيمة `closeLabel` بلغة الصفحة، ويرث التنبيه اتجاهها، فيتبع المحتوى وزر الإغلاق اتجاه القراءة. ويُرسم الشريط الملوّن باللون الدلالي على جانب بداية السطر في التنبيه، فيقع عند بداية القراءة.

- اكتب قيمة `closeLabel` بلغة التنبيه، واذكر فيها ما يُغلَق عندما تجتمع عدة تنبيهات في صفحة واحدة.
- اكتب الأرقام والتواريخ والأوقات في الرسالة بالصيغة التي يستخدمها التطبيق للغته.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط التنبيه بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج التنبيه ضمن مكوّنات العرض الأولية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- تربط [ملاحظات الإشعارات](../nic-notifications.md) الألوان الدلالية وحجم الرسالة في شريط الإشعار الوارد في ملفات كود المنصات المزوَّدة. وتسمّي الملاحظات شريط الإشعار لا المكوّن Alert، ولا يعرض التنبيه أي رمز تصويري.
