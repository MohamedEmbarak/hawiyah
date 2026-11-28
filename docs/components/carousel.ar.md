---
source:
  summary: 99943e225911
  example: 4278b3efa9c1
  variants-and-states: 6c9a131abaf2
  api: 8939b20eb1de
  accessibility: 4127e1b4f3b4
  rtl-and-localisation: a861acb42eb2
  platforms-code-reference: ea2a2e93e8f3
---
# عارض شرائح

يعرض عارض الشرائح شريحة واحدة من سلسلة قصيرة في كل مرة، ويتيح للقارئ التنقل بين الشرائح بزرّي السابق والتالي وبمؤشر لكل شريحة. والتنقل يدوي، ولا تشغيل تلقائي، ويُعلَن الموضع الحالي دون مقاطعة القارئ.

## مثال

للمنطقة اسم، ولكل شريحة اسم مبني على موضعها، وللسهمين والمؤشرات أسماء ميسّرة. ويوفّر التطبيق كل هذه النصوص، لأن المكوّن ليس فيه نص خاص به.

```html live example=basic static differences=carousel-adapter-markup
<section class="hw-carousel" data-hw="carousel" aria-label="خطوات طلب خدمة" data-hw-slide-label="الخطوة {position} من {total}" data-hw-empty-label="لا توجد خطوات لعرضها">
  <div class="hw-carousel-viewport hw-carousel-slides">
    <div class="hw-carousel-track">
      <div class="hw-carousel-slide" data-hw-slide><h3>تقديم الطلب</h3><p>أكمل النموذج وأرفق المستندات التي يتطلبها الطلب.</p></div>
      <div class="hw-carousel-slide" data-hw-slide><h3>المراجعة</h3><p>يُدقَّق الطلب، وتطلب رسالةٌ أي مستند ناقص.</p></div>
      <div class="hw-carousel-slide" data-hw-slide><h3>القرار</h3><p>يُرسَل القرار في رسالة تذكر الرقم المرجعي.</p></div>
    </div>
  </div>
  <div class="hw-carousel-controls hw-inline">
    <div class="hw-carousel-pagination" role="group" aria-label="اختر خطوة">
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="0"></button>
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="1"></button>
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="2"></button>
    </div>
    <div class="hw-carousel-arrows">
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-previous aria-label="الخطوة السابقة"></button>
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-next aria-label="الخطوة التالية"></button>
    </div>
    <span class="hw-carousel-status hw-sr-only" data-hw-carousel-status></span>
  </div>
</section>
```

```tsx live example=basic
<Carousel
  label="خطوات طلب خدمة"
  previousLabel="الخطوة السابقة"
  nextLabel="الخطوة التالية"
  indicatorsLabel="اختر خطوة"
  emptyLabel="لا توجد خطوات لعرضها"
  getSlideLabel={(position, total) => `الخطوة ${position} من ${total}`}
  slides={[
    <><h3>تقديم الطلب</h3><p>أكمل النموذج وأرفق المستندات التي يتطلبها الطلب.</p></>,
    <><h3>المراجعة</h3><p>يُدقَّق الطلب، وتطلب رسالةٌ أي مستند ناقص.</p></>,
    <><h3>القرار</h3><p>يُرسَل القرار في رسالة تذكر الرقم المرجعي.</p></>,
  ]}
/>
```

```vue live example=basic
<Carousel
  label="خطوات طلب خدمة"
  previous-label="الخطوة السابقة"
  next-label="الخطوة التالية"
  indicators-label="اختر خطوة"
  empty-label="لا توجد خطوات لعرضها"
  :get-slide-label="(position, total) => `الخطوة ${position} من ${total}`"
  :wrap="false"
  :slides="[{ id: 'submit' }, { id: 'review' }, { id: 'decision' }]"
>
  <template #submit><h3>تقديم الطلب</h3><p>أكمل النموذج وأرفق المستندات التي يتطلبها الطلب.</p></template>
  <template #review><h3>المراجعة</h3><p>يُدقَّق الطلب، وتطلب رسالةٌ أي مستند ناقص.</p></template>
  <template #decision><h3>القرار</h3><p>يُرسَل القرار في رسالة تذكر الرقم المرجعي.</p></template>
</Carousel>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwCarouselComponent, HwSlide } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwCarouselComponent],
  template: `<hw-carousel
    label="خطوات طلب خدمة"
    previousLabel="الخطوة السابقة"
    nextLabel="الخطوة التالية"
    indicatorsLabel="اختر خطوة"
    emptyLabel="لا توجد خطوات لعرضها"
    [getSlideLabel]="slideLabel"
    [slides]="slides"
  />`,
})
export class BasicExample {
  slideLabel = (position: number, total: number) => `الخطوة ${position} من ${total}`;
  slides: HwSlide[] = [
    { title: 'تقديم الطلب', content: 'أكمل النموذج وأرفق المستندات التي يتطلبها الطلب.' },
    { title: 'المراجعة', content: 'يُدقَّق الطلب، وتطلب رسالةٌ أي مستند ناقص.' },
    { title: 'القرار', content: 'يُرسَل القرار في رسالة تذكر الرقم المرجعي.' },
  ];
}
```

## الأشكال والحالات

### التكرار الدائري

مع التكرار الدائري يؤدي سهم التالي في الشريحة الأخيرة إلى الشريحة الأولى، ويؤدي سهم السابق في الشريحة الأولى إلى الأخيرة. ودونه يحتفظ السهم الواقع عند أحد الطرفين بالتركيز، ويتجاهل التفعيل. ويسمّي React وAngular والمتحكم في JavaScript هذا الخيار `loop`؛ ويسمّيه Vue `wrap`.

```html live example=loop static differences=carousel-adapter-markup
<section class="hw-carousel" data-hw="carousel" data-hw-loop="true" aria-label="إشعارات عن مستند" data-hw-slide-label="الإشعار {position} من {total}" data-hw-empty-label="لا توجد إشعارات لعرضها">
  <div class="hw-carousel-viewport hw-carousel-slides">
    <div class="hw-carousel-track">
      <div class="hw-carousel-slide" data-hw-slide><h3>استُلم المستند</h3><p>سُجّل المستند في سجلك.</p></div>
      <div class="hw-carousel-slide" data-hw-slide><h3>دُقّق المستند</h3><p>المستند قيد المراجعة.</p></div>
    </div>
  </div>
  <div class="hw-carousel-controls hw-inline">
    <div class="hw-carousel-pagination" role="group" aria-label="اختر إشعارًا">
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="0"></button>
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="1"></button>
    </div>
    <div class="hw-carousel-arrows">
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-previous aria-label="الإشعار السابق"></button>
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-next aria-label="الإشعار التالي"></button>
    </div>
    <span class="hw-carousel-status hw-sr-only" data-hw-carousel-status></span>
  </div>
</section>
```

```tsx live example=loop
<Carousel
  label="إشعارات عن مستند"
  previousLabel="الإشعار السابق"
  nextLabel="الإشعار التالي"
  indicatorsLabel="اختر إشعارًا"
  emptyLabel="لا توجد إشعارات لعرضها"
  getSlideLabel={(position, total) => `الإشعار ${position} من ${total}`}
  loop
  slides={[
    <><h3>استُلم المستند</h3><p>سُجّل المستند في سجلك.</p></>,
    <><h3>دُقّق المستند</h3><p>المستند قيد المراجعة.</p></>,
  ]}
/>
```

```vue live example=loop
<Carousel
  label="إشعارات عن مستند"
  previous-label="الإشعار السابق"
  next-label="الإشعار التالي"
  indicators-label="اختر إشعارًا"
  empty-label="لا توجد إشعارات لعرضها"
  :get-slide-label="(position, total) => `الإشعار ${position} من ${total}`"
  :wrap="true"
  :slides="[{ id: 'received' }, { id: 'checked' }]"
>
  <template #received><h3>استُلم المستند</h3><p>سُجّل المستند في سجلك.</p></template>
  <template #checked><h3>دُقّق المستند</h3><p>المستند قيد المراجعة.</p></template>
</Carousel>
```

```ts live example=loop framework=angular
import { Component } from '@angular/core';
import { HwCarouselComponent, HwSlide } from '@hawiyah/angular';

@Component({
  selector: 'app-loop-example',
  imports: [HwCarouselComponent],
  template: `<hw-carousel
    label="إشعارات عن مستند"
    previousLabel="الإشعار السابق"
    nextLabel="الإشعار التالي"
    indicatorsLabel="اختر إشعارًا"
    emptyLabel="لا توجد إشعارات لعرضها"
    [getSlideLabel]="slideLabel"
    [loop]="true"
    [slides]="slides"
  />`,
})
export class LoopExample {
  slideLabel = (position: number, total: number) => `الإشعار ${position} من ${total}`;
  slides: HwSlide[] = [
    { title: 'استُلم المستند', content: 'سُجّل المستند في سجلك.' },
    { title: 'دُقّق المستند', content: 'المستند قيد المراجعة.' },
  ];
}
```

### دون مؤشرات

دون مجموعة المؤشرات يكون السهمان عنصرَي التحكم الوحيدين، ولا حاجة إلى اسم المجموعة. وتزيل محوّلات أطر العمل المجموعة عند إيقاف المؤشرات، ولا يتضمّنها الترميز المكتوب يدويًا.

```html live example=no-indicators static differences=carousel-adapter-markup
<section class="hw-carousel" data-hw="carousel" aria-label="إرشادات تحديث الملف الشخصي" data-hw-slide-label="الصفحة {position} من {total}" data-hw-empty-label="لا توجد إرشادات لعرضها">
  <div class="hw-carousel-viewport hw-carousel-slides">
    <div class="hw-carousel-track">
      <div class="hw-carousel-slide" data-hw-slide><h3>قبل أن تبدأ</h3><p>احرص على أن تكون بيانات التواصل الحالية في متناولك.</p></div>
      <div class="hw-carousel-slide" data-hw-slide><h3>بعد الحفظ</h3><p>تسري البيانات الجديدة على الرسائل اللاحقة.</p></div>
    </div>
  </div>
  <div class="hw-carousel-controls hw-inline">
    <div class="hw-carousel-arrows">
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-previous aria-label="الصفحة السابقة"></button>
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-next aria-label="الصفحة التالية"></button>
    </div>
    <span class="hw-carousel-status hw-sr-only" data-hw-carousel-status></span>
  </div>
</section>
```

```tsx live example=no-indicators
<Carousel
  label="إرشادات تحديث الملف الشخصي"
  previousLabel="الصفحة السابقة"
  nextLabel="الصفحة التالية"
  emptyLabel="لا توجد إرشادات لعرضها"
  getSlideLabel={(position, total) => `الصفحة ${position} من ${total}`}
  showIndicators={false}
  slides={[
    <><h3>قبل أن تبدأ</h3><p>احرص على أن تكون بيانات التواصل الحالية في متناولك.</p></>,
    <><h3>بعد الحفظ</h3><p>تسري البيانات الجديدة على الرسائل اللاحقة.</p></>,
  ]}
/>
```

```vue live example=no-indicators
<Carousel
  label="إرشادات تحديث الملف الشخصي"
  previous-label="الصفحة السابقة"
  next-label="الصفحة التالية"
  empty-label="لا توجد إرشادات لعرضها"
  :get-slide-label="(position, total) => `الصفحة ${position} من ${total}`"
  :show-indicators="false"
  :wrap="false"
  :slides="[{ id: 'before' }, { id: 'after' }]"
>
  <template #before><h3>قبل أن تبدأ</h3><p>احرص على أن تكون بيانات التواصل الحالية في متناولك.</p></template>
  <template #after><h3>بعد الحفظ</h3><p>تسري البيانات الجديدة على الرسائل اللاحقة.</p></template>
</Carousel>
```

```ts live example=no-indicators framework=angular
import { Component } from '@angular/core';
import { HwCarouselComponent, HwSlide } from '@hawiyah/angular';

@Component({
  selector: 'app-no-indicators-example',
  imports: [HwCarouselComponent],
  template: `<hw-carousel
    label="إرشادات تحديث الملف الشخصي"
    previousLabel="الصفحة السابقة"
    nextLabel="الصفحة التالية"
    emptyLabel="لا توجد إرشادات لعرضها"
    [getSlideLabel]="slideLabel"
    [showIndicators]="false"
    [slides]="slides"
  />`,
})
export class NoIndicatorsExample {
  slideLabel = (position: number, total: number) => `الصفحة ${position} من ${total}`;
  slides: HwSlide[] = [
    { title: 'قبل أن تبدأ', content: 'احرص على أن تكون بيانات التواصل الحالية في متناولك.' },
    { title: 'بعد الحفظ', content: 'تسري البيانات الجديدة على الرسائل اللاحقة.' },
  ];
}
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createCarousel

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `index` | `number` | `false` | — |
| `loop` | `boolean` | `false` | — |
| `onValueChange` | `(index: number) => void` | `false` | — |
| `label` | `string` | `false` | — |
| `getSlideLabel` | `(position: number, total: number) => string` | `false` | — |
| `emptyLabel` | `string` | `false` | — |
| `carouselDescription` | `string` | `false` | — |
| `slideDescription` | `string` | `false` | — |

تقرأ الدالة `createCarousel(root, options)` الترميز المكتوب: تحمل الشرائح `data-hw-slide`، ويحمل السهمان `data-hw-previous` و`data-hw-next`، وتحمل المؤشرات `data-hw-carousel-dot` بموضع يبدأ من الصفر، ويحمل عنصر الحالة `data-hw-carousel-status`، ويحمل المسار الصنف `hw-carousel-track`. ويُرجع المتحكم `index` و`select(index)` و`previous()` و`next()` و`destroy()`؛ وتقرّب `select` القيمة إلى العدد الصحيح الأدنى وتحصرها بين الطرفين، أو تلفّها عند الطرفين مع `loop`، ولا تفعل شيئًا للموضع الحالي. ويتلقّى `onValueChange` الفهرس الجديد الذي يبدأ من الصفر. ويضبط `index` الشريحة الأولية، ويُقرأ `loop` أيضًا من `data-hw-loop` على الجذر. والخيارات `label` و`getSlideLabel` و`emptyLabel` نصوص مطلوبة؛ والخياران `carouselDescription` و`slideDescription` اختياريان. و`getSlideLabel` هي الدالة التي تأخذ موضعًا يبدأ من الواحد، وتسمّي كل شريحة وكل مؤشر، وتُعطي نص الحالة الذي يُعلَن دون مقاطعة. وفي الترميز يمكن أن يحمل الجذر نصوصه في خصائص تحمل أسماء الخيارات، وتحمل الخاصية `data-hw-slide-label` اسم الشريحة قالبًا يقوم فيه {position} و{total} مقام الرقمين؛ وتكتب الأمثلة اسم المنطقة في `aria-label`. وتأخذ كل شريحة وكل مؤشر دون `aria-label` مكتوب الاسمَ الذي تُرجعه `getSlideLabel`؛ ويبقى `aria-label` المكتوب. وفي الشريحة الأولى أو الأخيرة من عارض لا يلتفّ، يحمل السهم `aria-disabled="true"`، ويحتفظ بالتركيز، ويتجاهل التفعيل. وأزل المتحكم وأنشئه من جديد عندما يستبدل التطبيق الشرائح.

### React

جدول: خصائص Carousel

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `slides` | `readonly ReactNode[]` | `true` | — |
| `index` | `number` | `false` | — |
| `defaultIndex` | `number` | `false` | `0` |
| `onIndexChange` | `(index: number) => void` | `false` | — |
| `previousLabel` | `string` | `true` | — |
| `nextLabel` | `string` | `true` | — |
| `getSlideLabel` | `(position: number, total: number) => string` | `true` | — |
| `loop` | `boolean` | `false` | `false` |
| `emptyLabel` | `string` | `true` | — |
| `carouselDescription` | `string` | `false` | — |
| `slideDescription` | `string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |
| `showIndicators` | `boolean` | `false` | `true` |
| `indicatorsLabel` | `string` | `false` | — |

تحمل الخاصية `slides` محتوى قابلًا للعرض، بندًا لكل شريحة، ولا تُزال أي شريحة من الصفحة، فتُحفظ حالة محتواها. استخدم `index` مع `onIndexChange` لعارض متحكَّم فيه، أو `defaultIndex` لعارض غير متحكَّم فيه؛ ولا تُستدعى الدالة للموضع الحالي. والخصائص `previousLabel` و`nextLabel` و`emptyLabel` و`getSlideLabel` مطلوبة، وتتلقّى `getSlideLabel` موضعًا يبدأ من الواحد، وتُرجع الاسم الكامل للشريحة. وتحتاج المنطقة إلى `label`، أو إلى `aria-label` أو `aria-labelledby`. والخاصية `indicatorsLabel` مطلوبة ما دامت `showIndicators` مفعّلة. ولا تكتب الخاصيتان `carouselDescription` و`slideDescription` الخاصية `aria-roledescription` إلا عند كتابتهما. والقيمة الافتراضية للخاصية `loop` هي `false`، ففي الشريحة الأولى أو الأخيرة يحمل السهم `aria-disabled="true"`، ويحتفظ بالتركيز، ويتجاهل التفعيل؛ ويُعطَّل السهمان كلاهما عندما يقلّ عدد الشرائح عن اثنتين.

### Vue

جدول: خصائص Carousel وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `slides` | prop | `readonly CarouselSlide[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `modelValue` | prop | `number` | `false` | — |
| `defaultValue` | prop | `number` | `false` | `0` |
| `previousLabel` | prop | `string` | `true` | — |
| `nextLabel` | prop | `string` | `true` | — |
| `showIndicators` | prop | `boolean` | `false` | `true` |
| `indicatorsLabel` | prop | `string` | `false` | — |
| `emptyLabel` | prop | `string` | `true` | — |
| `carouselDescription` | prop | `string` | `false` | — |
| `slideDescription` | prop | `string` | `false` | — |
| `getSlideLabel` | prop | `(position: number, total: number) => string` | `true` | — |
| `wrap` | prop | `boolean` | `false` | `true` |
| `update:modelValue` | event | `(value: number) => void` | `false` | — |
| `<id>` | slot | — | `false` | — |

لكل بند من `slides` الحقل `id` والحقل الاختياري `content`، ويملأ المنفذ الذي يحمل اسمَ قيمة `id` تلك الشريحة؛ ويكتب الجدول اسم المنفذ بالصيغة `<id>`. ويربط `v-model` الموضع الذي يبدأ من الصفر، وتضبط الخاصية `defaultValue` الموضع الأولي. والقيمة الافتراضية للخاصية `wrap` هي `true`، خلافًا لخيار التكرار الدائري في المحوّلات الأخرى، فاكتب `:wrap="false"` لعارض يتوقف عند طرفيه، كما تفعل كتل Vue في المثال الأساسي وفي المثال الذي لا مؤشرات فيه. ودون الالتفاف يحمل السهم في الشريحة الأولى أو الأخيرة `aria-disabled="true"`، ويحتفظ بالتركيز، ويتجاهل التفعيل. والخصائص `previousLabel` و`nextLabel` و`emptyLabel` و`getSlideLabel` مطلوبة، وتسمّي الخاصية `label` المنطقة، والخاصية `indicatorsLabel` مطلوبة ما دامت `showIndicators` مفعّلة.

### Angular

جدول: مُدخلات hw-carousel ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `slides` | input | `readonly HwSlide[]` | `false` | `[]` |
| `slideTemplate` | input | `TemplateRef<{ $implicit: HwSlide; index: number }>` | `false` | — |
| `current` | input | `number` | `false` | `0` |
| `loop` | input | `boolean` | `false` | `false` |
| `showIndicators` | input | `boolean` | `false` | `true` |
| `indicatorsLabel` | input | `string` | `false` | `''` |
| `previousLabel` | input | `string` | `true` | — |
| `nextLabel` | input | `string` | `true` | — |
| `emptyLabel` | input | `string` | `true` | — |
| `carouselDescription` | input | `string` | `false` | `''` |
| `slideDescription` | input | `string` | `false` | `''` |
| `getSlideLabel` | input | `(position: number, total: number) => string` | `true` | — |
| `currentChange` | output | `number` | `false` | — |

يُطبَّق `HwCarouselComponent` على `hw-carousel`. ولكل `HwSlide` الحقول الاختيارية `id` و`title` و`content` و`src` و`alt`؛ ودون `slideTemplate` تعرض الشريحة منها الصورة، وعنصر عنوان من المستوى الثالث، وفقرة. ويأخذ المُدخل `slideTemplate` قالبًا يحمل سياقه الشريحة قيمةً ضمنية، ويحمل موضعها. اربط `[(current)]` ربطًا ثنائي الاتجاه بالموضع الذي يبدأ من الصفر؛ ولا يُرسَل المُخرج `currentChange` للموضع الحالي. وتحتاج المنطقة إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-carousel`؛ ويصل `aria-describedby` إلى المنطقة أيضًا. والمُدخل `getSlideLabel` دالة تتلقّى موضعًا يبدأ من الواحد، وتُرجع الاسم الكامل للشريحة؛ وتعرّفها الأمثلة في شيفرة المكوّن. والقيمة الافتراضية للمُدخل `loop` هي `false`، فيحمل السهم عند أحد الطرفين `aria-disabled="true"`، ويحتفظ بالتركيز، ويتجاهل التفعيل.

## إمكانية الوصول

يعرض عارض الشرائح عنصر `section` يحمل `role="region"`، وتسمّيه التسمية التي يوفّرها التطبيق، وكل شريحة مجموعة تسمّيها `getSlideLabel`. ولا يضيف المتحكم في JavaScript الخاصية `role="group"` إلا إلى شريحة ليست عنصر `article` وليس لها دور خاص بها، ويُبقي اسم الشريحة المكتوب. ولا تُتاح إلا الشريحة الحالية: فالشرائح الأخرى تحمل `hidden` و`inert` و`aria-hidden`، فلا يصل التركيز إلى محتواها، ولا يُقرأ. ولا يبدأ المكوّن الحركة من تلقاء نفسه، وليس فيه مؤقّت.

- السهمان السابق والتالي زرّان أصليان اسماهما `previousLabel` و`nextLabel`. وفي الشريحة الأولى أو الأخيرة من عارض لا يلتفّ، يحمل السهم `aria-disabled="true"`، ويحتفظ بالتركيز، ويتجاهل التفعيل، فيبقى التركيز على السهم الذي استخدمه القارئ. وفي React وVue وAngular لا تُكتب الخاصية الأصلية `disabled` إلا عندما يقلّ عدد الشرائح عن اثنتين. ويكتبها المتحكم في JavaScript أيضًا عندما يحمل الجذر `disabled` أو `aria-disabled="true"` أو `data-hw-disabled`، وعندما يُكتب السهم بالخاصية `disabled`.
- كل مؤشر زر أصلي تسمّيه `getSlideLabel`، ويحمل المؤشر الحالي `aria-current="true"`. والمؤشرات أزرار، لا تبويبات.
- يُعلن عنصر حالة يحمل `role="status"` وخاصية `aria-live` لا تقاطع القارئ اسمَ الشريحة الحالية، أو نص `emptyLabel` عندما لا توجد شرائح.
- تضبط الخاصيتان `carouselDescription` و`slideDescription` الخاصية `aria-roledescription` على المنطقة وعلى كل شريحة، ولا تضبطانها إلا عندما يوفّرهما التطبيق.
- تقليل الحركة: عندما يطلب القارئ تقليل الحركة، تزيل ورقة الأنماط حركة المسار وتأخير الشريحة المغادرة.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: عارض شرائح

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى عنصر التحكم التالي بترتيب الصفحة: المؤشرات، ثم سهم السابق وسهم التالي. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل المؤشر الذي عليه التركيز فيعرض الشريحة التي يسمّيها، أو السهم الذي عليه التركيز فيعرض الشريحة السابقة أو التالية؛ وفي الشريحة الأولى أو الأخيرة من عارض لا يلتفّ، يحتفظ السهم بالتركيز ويتجاهل التفعيل. |

لا يعرّف عارض الشرائح مفاتيح أخرى. وعناصر التحكم أزرار أصلية، فتتبع المفاتيح سلوك المتصفح؛ ولا يصل المفتاح <kbd>Tab</kbd> إلى العناصر القابلة للتركيز في محتوى الشريحة إلا ما دامت شريحتها هي الشريحة الحالية.

## الاتجاه والتوطين

ليس في عارض الشرائح نص مدمج. يكتب التطبيق التسمية، واسمَي السهمين، واسم مجموعة المؤشرات، ونص الحالة الفارغة، وأوصاف الأدوار الاختيارية، وأسماء الشرائح بلغة الصفحة، ولا يضيف المكوّن أي كلمة أو علامة ترقيم إلى ما تُرجعه `getSlideLabel`.

- يتحرّك المسار في اتجاه القراءة. ويأتي الاتجاه من الخاصية `dir` لأقرب عنصر يضبطها، وهو مستقل عن اللغة، فيتبع العارضُ الواقع داخل قسم له اتجاهه الخاص اتجاهَ ذلك القسم.
- يعرض سهما السابق والتالي رمزًا يراعي الاتجاه، يُختار بحسب الاتجاه الفعلي، فيشير سهم السابق إلى جهة بدء القراءة.
- تتلقّى `getSlideLabel` موضعًا يبدأ من الواحد في كل محوّل. وتبقى الأرقام كما تكتبها الدالة، فيختار التطبيق شكل الأرقام.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط عارض الشرائح بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات عارض الشرائح](../nic-carousel.md) عرض المسار والسهمين والمؤشرات بورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل صف وحدوده.
- لا تتضمّن الملفات المزوَّدة أي برنامج نصي لعارض الشرائح. فالتكرار الدائري، وسلوك لوحة المفاتيح، وإعلان الحالة، وغياب التشغيل التلقائي قرارات من هوية، تسجّلها [ملاحظات عارض الشرائح](../nic-carousel.md).
