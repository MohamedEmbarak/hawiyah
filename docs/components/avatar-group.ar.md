---
source:
  summary: 840bdbe89062
  example: 97eea086bb18
  variants-and-states: 5dd6d15ca798
  api: 3669b8bb0132
  accessibility: e5fa491d6b44
  rtl-and-localisation: dd7184dab69f
  platforms-code-reference: 6e98d958ec0f
---
# مجموعة صور رمزية

تعرض مجموعة الصور الرمزية عدة صور رمزية متجاورة في مجموعة واحدة لها اسم، وتضع مكان الصور الرمزية التي تتجاوز حدًّا معيّنًا عددَ الأشخاص المخفيين. وهي عنصر ثابت: ليست قائمة من عناصر التحكم.

## مثال

للمجموعة اسم يذكر مَن تضمّهم. وعندما تكون قيمة `max` هي 3، تعرض المجموعة أول ثلاث صور رمزية وعلامةً بعدد الآخرين، وللعلامة اسم ميسّر خاص بها من `getOverflowLabel`.

```html live example=basic
<div class="hw-avatar-group" role="group" aria-label="فريق معالجة الطلب">
  <span class="hw-avatar" role="img" aria-label="رنا كمال"><span aria-hidden="true">رك</span></span>
  <span class="hw-avatar" role="img" aria-label="سامي حداد"><span aria-hidden="true">سح</span></span>
  <span class="hw-avatar" role="img" aria-label="لينا منصور"><span aria-hidden="true">لم</span></span>
  <span class="hw-avatar" role="img" aria-label="2 من الأشخاص الآخرين">+2</span>
</div>
```

```tsx live example=basic
<AvatarGroup
  label="فريق معالجة الطلب"
  max={3}
  items={[
    { name: 'رنا كمال' },
    { name: 'سامي حداد' },
    { name: 'لينا منصور' },
    { name: 'عمر قاسم' },
    { name: 'دانة وليد' },
  ]}
  getOverflowLabel={(count) => (count === 1 ? 'شخص واحد آخر' : count + ' من الأشخاص الآخرين')}
/>
```

```vue live example=basic
<AvatarGroup
  label="فريق معالجة الطلب"
  :max="3"
  :items="[
    { name: 'رنا كمال' },
    { name: 'سامي حداد' },
    { name: 'لينا منصور' },
    { name: 'عمر قاسم' },
    { name: 'دانة وليد' },
  ]"
  :get-overflow-label="(count: number) => (count === 1 ? 'شخص واحد آخر' : count + ' من الأشخاص الآخرين')"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwAvatarGroupComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwAvatarGroupComponent],
  template: `<hw-avatar-group label="فريق معالجة الطلب" [max]="3" [items]="items" [getOverflowLabel]="overflowLabel" />`,
})
export class ExampleComponent {
  items = [
    { name: 'رنا كمال' },
    { name: 'سامي حداد' },
    { name: 'لينا منصور' },
    { name: 'عمر قاسم' },
    { name: 'دانة وليد' },
  ];
  overflowLabel = (count: number) => (count === 1 ? 'شخص واحد آخر' : count + ' من الأشخاص الآخرين');
}
```

## الأشكال والحالات

### ضمن الحد

عندما لا تزيد القائمة على `max`، تعرض المجموعة كل الصور الرمزية دون علامة. وتبقى الخاصية `getOverflowLabel` مطلوبة.

```html live example=short
<div class="hw-avatar-group" role="group" aria-label="مراجعو الطلب">
  <span class="hw-avatar" role="img" aria-label="رنا كمال"><span aria-hidden="true">رك</span></span>
  <span class="hw-avatar" role="img" aria-label="سامي حداد"><span aria-hidden="true">سح</span></span>
</div>
```

```tsx live example=short
<AvatarGroup
  label="مراجعو الطلب"
  items={[{ name: 'رنا كمال' }, { name: 'سامي حداد' }]}
  getOverflowLabel={(count) => (count === 1 ? 'شخص واحد آخر' : count + ' من الأشخاص الآخرين')}
/>
```

```vue live example=short
<AvatarGroup
  label="مراجعو الطلب"
  :items="[{ name: 'رنا كمال' }, { name: 'سامي حداد' }]"
  :get-overflow-label="(count: number) => (count === 1 ? 'شخص واحد آخر' : count + ' من الأشخاص الآخرين')"
/>
```

```ts live example=short framework=angular
import { Component } from '@angular/core';
import { HwAvatarGroupComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwAvatarGroupComponent],
  template: `<hw-avatar-group label="مراجعو الطلب" [items]="items" [getOverflowLabel]="overflowLabel" />`,
})
export class ExampleComponent {
  items = [{ name: 'رنا كمال' }, { name: 'سامي حداد' }];
  overflowLabel = (count: number) => (count === 1 ? 'شخص واحد آخر' : count + ' من الأشخاص الآخرين');
}
```

### الحجم والشكل

يقبل كل بند حقول الصورة الرمزية، مثل `size` و`variant` و`initials`، فيمكن أن تشترك الصور الرمزية في المجموعة في حجم واحد وشكل واحد.

```html live example=sized
<div class="hw-avatar-group" role="group" aria-label="الجهات المشاركة">
  <span class="hw-avatar" data-size="64" data-variant="square" role="img" aria-label="عيادة واحة الشمال"><span aria-hidden="true">عو</span></span>
  <span class="hw-avatar" data-size="64" data-variant="square" role="img" aria-label="مؤسسة مرفأ للتوريدات"><span aria-hidden="true">مم</span></span>
</div>
```

```tsx live example=sized
<AvatarGroup
  label="الجهات المشاركة"
  items={[
    { name: 'عيادة واحة الشمال', size: '64', variant: 'square' },
    { name: 'مؤسسة مرفأ للتوريدات', size: '64', variant: 'square' },
  ]}
  getOverflowLabel={(count) => (count === 1 ? 'جهة واحدة أخرى' : count + ' من الجهات الأخرى')}
/>
```

```vue live example=sized
<AvatarGroup
  label="الجهات المشاركة"
  :items="[
    { name: 'عيادة واحة الشمال', size: '64', variant: 'square' },
    { name: 'مؤسسة مرفأ للتوريدات', size: '64', variant: 'square' },
  ]"
  :get-overflow-label="(count: number) => (count === 1 ? 'جهة واحدة أخرى' : count + ' من الجهات الأخرى')"
/>
```

```ts live example=sized framework=angular
import { Component } from '@angular/core';
import { HwAvatarGroupComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwAvatarGroupComponent],
  template: `<hw-avatar-group label="الجهات المشاركة" [items]="items" [getOverflowLabel]="overflowLabel" />`,
})
export class ExampleComponent {
  items = [
    { name: 'عيادة واحة الشمال', size: '64' as const, variant: 'square' as const },
    { name: 'مؤسسة مرفأ للتوريدات', size: '64' as const, variant: 'square' as const },
  ];
  overflowLabel = (count: number) => (count === 1 ? 'جهة واحدة أخرى' : count + ' من الجهات الأخرى');
}
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-avatar-group

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-avatar-group'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لمجموعة الصور الرمزية متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصرًا بالصنف `hw-avatar-group` يحمل الخاصية `role="group"` وخاصية `aria-label` تسمّي المجموعة، واكتب الصور الرمزية عناصرَ أبناءً له (انظر [الصورة الرمزية](avatar.md) لترميزها). ويكتب التطبيق علامة الفائض بنفسه، عنصرًا إضافيًا بالصنف `hw-avatar` يحمل الخاصية `role="img"` وخاصية `aria-label` تذكر عدد الأشخاص المخفيين، ونصُّه هو العدد. ولا تطبّق حزمة vanilla أي برنامج نصي على الترميز.

### React

جدول: خصائص AvatarGroup

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `items` | `readonly AvatarProps[]` | `true` | — |
| `max` | `number` | `false` | `5` |
| `getOverflowLabel` | `(count: number) => string` | `true` | — |
| `label` | `string` | `false` | — |

تسرد الخاصية `items` الصور الرمزية؛ ويقبل كل بند خصائص المكوّن Avatar، والحقل `name` مطلوب في كل بند. وتعرض المجموعة أول `max` من البنود، وتُقرَّب قيمة `max` إلى أدنى عدد صحيح. وعندما تبقى بنود، تضيف المجموعة علامة نصُّها علامة الزائد (+) وعدد البنود المخفية، واسمها الميسّر هو نتيجة استدعاء `getOverflowLabel` بهذا العدد. والخاصية `label` هي الاسم الميسّر للمجموعة، وهي مطلوبة ما لم تُمرَّر `aria-label` أو `aria-labelledby`. وتصل الخصائص الأخرى لعنصر `div` الأصلي إلى عنصر المجموعة.

### Vue

جدول: خصائص AvatarGroup وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly AvatarItem[]` | `true` | — |
| `max` | prop | `number` | `false` | `5` |
| `label` | prop | `string` | `false` | — |
| `getOverflowLabel` | prop | `(count: number) => string` | `true` | — |

تسرد الخاصية `items` الصور الرمزية؛ ولكل بند الحقل المطلوب `name` والحقول الاختيارية `src` و`initials` و`size` و`variant` من المكوّن Avatar. وتعرض المجموعة أول `max` من البنود، وتُقرَّب قيمة `max` إلى أدنى عدد صحيح. وعندما تبقى بنود، تضيف المجموعة علامة نصُّها علامة الزائد (+) وعدد البنود المخفية، واسمها الميسّر هو نتيجة استدعاء `getOverflowLabel` بهذا العدد. والخاصية `label` هي الاسم الميسّر للمجموعة، وهي مطلوبة ما لم تُمرَّر `aria-label` أو `aria-labelledby` خاصيةَ HTML. ولا يقرأ AvatarGroup أي منفذ، ولا يُرسل أي حدث.

### Angular

جدول: مُدخلات hw-avatar-group ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwAvatarItem[]` | `false` | `[]` |
| `max` | input | `number` | `false` | `5` |
| `getOverflowLabel` | input | `(count: number) => string` | `true` | — |

يُطبَّق `HwAvatarGroupComponent` على `hw-avatar-group`؛ والعنصر المضيف هو المجموعة نفسها، ويحمل الصنف `hw-avatar-group`. ويسرد المُدخل `items` الصور الرمزية؛ وكل بند من النوع `HwAvatarItem`، له الحقل المطلوب `name` والحقول الاختيارية `src` و`initials` و`size` و`variant` من `hw-avatar`. وتعرض المجموعة أول `max` من البنود. وعندما تبقى بنود، تضيف المجموعة علامة نصُّها علامة الزائد (+) وعدد البنود المخفية، واسمها الميسّر هو نتيجة استدعاء `getOverflowLabel` بهذا العدد. ويُكتب المُدخل `label` في الخاصية `aria-label` للعنصر المضيف، وهو مطلوب ما لم يحمل العنصر المضيف نفسه `aria-label` أو `aria-labelledby`.

## إمكانية الوصول

تحمل المجموعة الخاصية `role="group"` واسمًا، وتحتفظ كل صورة رمزية بالاسم والدور اللذين يمنحهما لها المكوّن Avatar. والمجموعة عنصر ثابت: لا تقبل التركيز، وليس لها سلوك مع لوحة المفاتيح.

- سمِّ المجموعة بما تضمّه، مثل «فريق معالجة الطلب»، لا بعبارة «صور رمزية».
- تحمل علامة الفائض الخاصية `role="img"` والاسم الذي يُرجعه `getOverflowLabel`، فيسمع القارئ «2 من الأشخاص الآخرين» لا الرمز والرقم. وأرجِع عبارة تتضمّن العدد، وفق قواعد لغة الصفحة.
- لا تعرض المجموعة الأسماء إلا عبر الأسماء الميسّرة لصورها الرمزية. وعندما يلزم التمييز بين الأشخاص أو التواصل معهم، اسرد أسماءهم نصًّا في موضع آخر من الصفحة؛ فلا يعرف القارئ عن الأشخاص المخفيين إلا عددهم.
- لا تستخدم المجموعة عنصرَ تحكم. ويحتاج الإجراء الذي يفتح القائمة الكاملة إلى عنصر `button` أو `a` أصلي منفصل له اسمه الميسّر الخاص.

## الاتجاه والتوطين

ليس في مجموعة الصور الرمزية نص مدمج: يكتب التطبيق اسم المجموعة وأسماء الأشخاص والنص الذي يُرجعه `getOverflowLabel` بلغة الصفحة. وتتلقّى الدالة عدد الصور الرمزية المخفية، فيختار التطبيق صيغة الجمع والأرقام المناسبة للغته.

- تعرض العلامة علامة الزائد ورقمًا نصًّا؛ واسمها الميسّر هو العبارة التي يُرجعها `getOverflowLabel`، لا ذلك النص.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مجموعة الصور الرمزية بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج مجموعة الصور الرمزية ضمن مكوّنات المحتوى الإضافية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- تذكر [ملاحظات الصور الرمزية](../nic-avatars.md) أن تداخل الصور الرمزية المجمّعة وعدد الفائض تركيبات من هوية، وليسا سلوكًا تعرّفه ورقة أنماط كود المنصات المزوَّدة.
