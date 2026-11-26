# قالب الاختبار

هذه الصفحة صفحة اختبار لبناء الدليل ولا تُنشر أبدًا. وتعرض صفحة طلب في حالتين، مبنية من المكوّنات التي يسردها قسم المكوّنات المستخدمة.

## مثال

كل حالة من حالات الصفحة مجموعة أمثلة حية واحدة معروضة في إطار معزول في أطر العمل الأربعة.

### استلام الطلب

قُدِّم الطلب: تؤكد الصفحة ذلك وتعرض الإجراء التالي.

```html live example=received frame width=390
<main>
  <h1>استُلم الطلب</h1>
  <div class="hw-alert" data-tone="success" data-variant="outline" role="status">
    <div class="hw-alert-content"><p>تم تقديم طلبك.</p></div>
  </div>
  <button class="hw-button" type="button" data-variant="primary" data-size="md">متابعة</button>
</main>
```

```tsx live example=received
<main>
  <h1>استُلم الطلب</h1>
  <Alert tone="success" variant="outline">
    <p>تم تقديم طلبك.</p>
  </Alert>
  <Button variant="primary">متابعة</Button>
</main>
```

```vue live example=received
<main>
  <h1>استُلم الطلب</h1>
  <Alert tone="success" variant="outline">
    <p>تم تقديم طلبك.</p>
  </Alert>
  <Button variant="primary">متابعة</Button>
</main>
```

```ts live example=received framework=angular
template: `<main>
  <h1>استُلم الطلب</h1>
  <hw-alert tone="success" variant="outline">
    <p>تم تقديم طلبك.</p>
  </hw-alert>
  <button hwButton variant="primary">متابعة</button>
</main>`
```

### تعذّر رفع المستند

لم يُرفع مستند الطلب: تسمّي الصفحة المشكلة وتعرض إعادة المحاولة.

```html live example=not-uploaded frame
<main>
  <h1>لم يُقدَّم الطلب</h1>
  <div class="hw-alert" data-tone="danger" role="alert">
    <div class="hw-alert-content"><p>لم يُرفع المستند. اختر ملفًا بصيغة PDF ثم أعد المحاولة.</p></div>
  </div>
  <button class="hw-button" type="button" data-variant="primary" data-size="md">أعد المحاولة</button>
</main>
```

```tsx live example=not-uploaded
<main>
  <h1>لم يُقدَّم الطلب</h1>
  <Alert tone="danger">
    <p>لم يُرفع المستند. اختر ملفًا بصيغة PDF ثم أعد المحاولة.</p>
  </Alert>
  <Button variant="primary">أعد المحاولة</Button>
</main>
```

```vue live example=not-uploaded
<main>
  <h1>لم يُقدَّم الطلب</h1>
  <Alert tone="danger">
    <p>لم يُرفع المستند. اختر ملفًا بصيغة PDF ثم أعد المحاولة.</p>
  </Alert>
  <Button variant="primary">أعد المحاولة</Button>
</main>
```

```ts live example=not-uploaded framework=angular
template: `<main>
  <h1>لم يُقدَّم الطلب</h1>
  <hw-alert tone="danger">
    <p>لم يُرفع المستند. اختر ملفًا بصيغة PDF ثم أعد المحاولة.</p>
  </hw-alert>
  <button hwButton variant="primary">أعد المحاولة</button>
</main>`
```

## المكوّنات المستخدمة

تستخدم الصفحة هذه المكوّنات:

- يذكر [التنبيه](../components/alert.md) نتيجة الطلب.
- يبدأ [الزر](../components/button.md) الإجراء التالي.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر القالب؛ وتذكر صفحات المكوّنات المدرجة في قسم المكوّنات المستخدمة أدلة كل مكوّن.

- تسرد [ملاحظات التغطية](../coverage.md) المكوّنات التي يستخدمها القالب.
