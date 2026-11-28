---
source:
  summary: aa469f0329df
  example: 985584730254
  variants-and-states: 74717d08e86e
  api: 6159caf09fff
  accessibility: 266c7096a9db
  rtl-and-localisation: 9c55e1dd13c6
  platforms-code-reference: 2bcbeb6f3a7b
---
# مجموعة إدخال

تضمّ مجموعة الإدخال عنصر تحكم أصليًا إلى بادئة أو لاحقة أو إليهما معًا في صف واحد؛ والضمّ مرئي فقط، وليست الملحقات جزءًا من الاسم الميسّر لعنصر التحكم ولا من وصفه. وتبقى التسمية والنص الإرشادي خارج الصف، وتبقى الملحقات محتوى عاديًا.

## مثال

يكتب الحقلُ المحيط بالمجموعة التسميةَ والنصَّ الإرشادي، وتسمّي التسمية عنصر الإدخال الأصلي داخلها. والبادئة واللاحقة ملحقان يذكران وحدة القيمة. وفي React لا يمنح الحقل عنصر الإدخال الأصلي إلا `for` الخاص بتسميته، فيكرّر عنصر الإدخال معرّف الحقل في `id` الخاص به، ويكتب `aria-describedby` الخاص به بنفسه.

```html live example=basic differences=input-group-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-amount" id="basic-amount-label">المبلغ</label>
  <div class="hw-input-group">
    <span class="hw-input-addon">ر.س</span>
    <input class="hw-input" id="basic-amount" name="amount" inputmode="decimal" aria-describedby="basic-amount-hint">
    <span class="hw-input-addon">شهريًا</span>
  </div>
  <p class="hw-hint" id="basic-amount-hint">أدخل المبلغ دون رمز العملة.</p>
</div>
```

```tsx live example=basic
<Field controlId="basic-amount" label="المبلغ" hint="أدخل المبلغ دون رمز العملة.">
  <InputGroup start="ر.س" end="شهريًا">
    <input className="hw-input" id="basic-amount" name="amount" inputMode="decimal" aria-describedby="basic-amount-hint" />
  </InputGroup>
</Field>
```

```vue live example=basic
<Field control-id="basic-amount" label="المبلغ" hint="أدخل المبلغ دون رمز العملة." v-slot="field">
  <InputGroup>
    <template #prefix>ر.س</template>
    <input class="hw-input" :id="field.id" name="amount" inputmode="decimal" :aria-describedby="field.describedby" />
    <template #suffix>شهريًا</template>
  </InputGroup>
</Field>
```

```ts live example=basic framework=angular
template: `<hw-field #f controlId="basic-amount" label="المبلغ" hint="أدخل المبلغ دون رمز العملة."><hw-input-group><ng-container hwPrefix>ر.س</ng-container><input class="hw-input" [id]="f.controlId" name="amount" inputmode="decimal" [attr.aria-describedby]="f.descriptionIds"><ng-container hwSuffix>شهريًا</ng-container></hw-input-group></hw-field>`
```

## الأشكال والحالات

### حجم صغير

حجم الصف هو حجم عنصر التحكم فيه: تضبطه الخاصية `data-size` بالقيمة `sm` أو `lg` على عنصر `hw-input` الأصلي، ودونها يكون عنصر التحكم بالحجم المتوسط. وليس لعنصر المجموعة نفسه حجم، فلا تغيّر الخاصية `data-size` على المجموعة شيئًا.

```html live example=small differences=input-group-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="small-fee" id="small-fee-label">رسوم النسخة الواحدة</label>
  <div class="hw-input-group">
    <span class="hw-input-addon">ر.س</span>
    <input class="hw-input" id="small-fee" name="fee" inputmode="decimal" data-size="sm">
  </div>
</div>
```

```tsx live example=small
<Field controlId="small-fee" label="رسوم النسخة الواحدة">
  <InputGroup start="ر.س">
    <input className="hw-input" id="small-fee" name="fee" inputMode="decimal" data-size="sm" />
  </InputGroup>
</Field>
```

```vue live example=small
<Field control-id="small-fee" label="رسوم النسخة الواحدة" v-slot="field">
  <InputGroup>
    <template #prefix>ر.س</template>
    <input class="hw-input" :id="field.id" name="fee" inputmode="decimal" data-size="sm" />
  </InputGroup>
</Field>
```

```ts live example=small framework=angular
template: `<hw-field #f controlId="small-fee" label="رسوم النسخة الواحدة"><hw-input-group><ng-container hwPrefix>ر.س</ng-container><input class="hw-input" [id]="f.controlId" name="fee" inputmode="decimal" data-size="sm"></hw-input-group></hw-field>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-input-group

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-input-group'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لمجموعة الإدخال متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصرًا بالصنف `hw-input-group` أبناؤه المباشرون هم عنصر التحكم الأصلي، بالصنف `hw-input` أو `hw-select`، والملحقات، وكل ملحق عنصر بالصنف `hw-input-addon`. واكتب عنصر `label` والنص الإرشادي خارج المجموعة، في عنصر بالصنف `hw-field`. ويتبع ارتفاع الصف الخاصية `data-size` بالقيمة `sm` أو `lg` على عنصر التحكم، لا على المجموعة. وتضبط الدالة `enhance()` من حزمة vanilla حالة وجود القيمة في عنصر التحكم المكتوب يدويًا؛ فلا تحتاج المجموعة إلى أي خاصية لذلك.

### React

جدول: خصائص InputGroup

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `start` | `ReactNode` | `false` | — |
| `end` | `ReactNode` | `false` | — |

الخاصيتان `start` و`end` محتوى React قابل للعرض، يضعه InputGroup في ملحق قبل العناصر الأبناء وفي ملحق بعدها؛ ولا يُعرض الملحق إلا عند تمرير خاصيته. والعناصر الأبناء هي عنصر التحكم، ولا يمنحه InputGroup تسمية: فاكتب التسمية والنص الإرشادي في مكوّن `Field` يحيط به. ويقبل InputGroup خصائص HTML الأصلية لعنصر `div` الخاص به، مثل `className`. وتصل الخاصية `data-size` على المجموعة إلى عنصرها، لكنها لا تغيّر شيئًا، لأن ورقة الأنماط تقرؤها على عنصر التحكم. ولا يتتبّع InputGroup وجود القيمة في عنصر التحكم الأصلي، فلا تُضبط حالة القيمة للصف المدمج (`data-hw-filled`) في React.

### Vue

جدول: خصائص InputGroup وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `prefix` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `suffix` | slot | — | `false` | — |

يضمّ المنفذان `prefix` و`suffix` الملحقين، ويضمّ المنفذ `default` عنصر التحكم. ولا يُعرض الملحق إلا عند تمرير منفذه. ولا يعرّف التصريح المنشور نوع أي منفذ. ولا يمنح InputGroup عنصر التحكم تسمية: فاكتب التسمية والنص الإرشادي في مكوّن `Field` يحيط به. وتصل خصائص HTML للمكوّن، مثل `class`، إلى عنصر المجموعة؛ ولا تغيّر الخاصية `data-size` هناك شيئًا، لأن ورقة الأنماط تقرؤها على عنصر التحكم. ولا يتتبّع InputGroup وجود القيمة في عنصر التحكم الأصلي، فلا تُضبط حالة القيمة للصف المدمج (`data-hw-filled`) في Vue.

### Angular

جدول: مُدخلات hw-input-group ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `[hwPrefix]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwSuffix]` | content | — | `false` | — |

يُسقط `HwInputGroupComponent` (`hw-input-group`) العناصر التي تحمل `hwPrefix` في ملحق البادئة، والعناصر التي تحمل `hwSuffix` في ملحق اللاحقة، وكل محتوى آخر، وهو عنصر التحكم، بينهما. ويكتب المُدخل `size` الخاصية `data-size` على المجموعة، ولا تستهدفها ورقة الأنماط، فلا تغيّر القيمتان `sm` و`lg` شيئًا: فاضبط حجم عنصر التحكم بالخاصية `data-size` الخاصة به. ويتتبّع المكوّن بعد العرض وجود القيمة في عناصر التحكم الأصلية `hw-input` و`hw-select` المُسقَطة، فتطبّق ورقة الأنماط حالة القيمة دون دالة التحسين في حزمة vanilla. وتبقى الملحقات محتوى عاديًا، فعالج الأيقونة الزخرفية فيها معالجة مناسبة لإمكانية الوصول. ولا يمنح المكوّن عنصر التحكم تسمية: فاستخدم عنصر `hw-field` يحيط به أو عنصر `label` خاصًا بعنصر التحكم نفسه، واكتب التسمية والنص الإرشادي خارج المجموعة. وصف المحتوى `*` هو عنصر التحكم المُسقَط.

## إمكانية الوصول

لا تضيف مجموعة الإدخال دورًا ولا اسمًا. ويحتفظ عنصر التحكم داخل المجموعة بدوره الأصلي وبتعامله الأصلي مع لوحة المفاتيح، ويأتي الاسم الميسّر لعنصر التحكم من عنصر `label` الخاص به، أو من `Field` أو `hw-field` يحيط به، أو من `aria-label` أو `aria-labelledby`. ولا تحلّ المجموعة المحيطة محلّ التسمية الفعلية لعنصر الإدخال.

- الملحقات عناصر `span` بسيطة ومحتوى عادي، فتُعالَج الأيقونة الزخرفية في أحدها بالتسمية المناسبة. وليست الملحقات جزءًا من اسم عنصر التحكم ولا من وصفه: فالوحدة التي يحتاج إليها القارئ مكانها التسمية أو النص الإرشادي، أو يُشار إليها من الخاصية `aria-describedby` لعنصر التحكم.
- مكان النص الإرشادي والخطأ خارج المجموعة، ويرتبطان بعنصر التحكم عبر الخاصية `aria-describedby`، كما في الحقل الذي ليس فيه مجموعة.
- لا تغيّر المجموعة ترتيب التركيز. والملحق الذي ليس فيه محتوى تفاعلي لا يقبل التركيز، فلا يقبل التركيز إلا عنصر التحكم؛ ويقبل التركيز أيضًا زر إجراء `hw-button` موضوع في المجموعة.

## الاتجاه والتوطين

ليس في مجموعة الإدخال نص مدمج: يكتب التطبيق الملحقات والتسمية والنص الإرشادي والخطأ بلغة الصفحة. وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فيقع ملحق البادئة في بداية الصف وملحق اللاحقة في نهايته في اتجاهَي القراءة كليهما، وتتبع الزوايا الظاهرة للصف المدمج الاتجاه.

- يكتب القارئ قيمة عنصر الإدخال الرقمي أو عنصر إدخال الرمز بالخط وبالأرقام التي يختارها؛ فاكتب الوحدة في الملحق بلغة الصفحة، واكتبها أيضًا في التسمية أو النص الإرشادي، لأن الملحق ليس جزءًا من وصف عنصر التحكم.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مجموعة الإدخال بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات حقول الإدخال](../nic-inputs.md) الخط السفلي الواحد الممتد تحت عنصر التحكم وملحقاته، وتذكر درجة الثقة في هذا الربط؛ ووضع التسمية والنص الإرشادي خارج المجموعة المدمجة توصية في قسم التركيب من الملاحظات نفسها، دون درجة ثقة.
- تُدرج [ملاحظات التغطية](../coverage.md) مجموعة الإدخال ضمن عناصر التحكم الإضافية.
