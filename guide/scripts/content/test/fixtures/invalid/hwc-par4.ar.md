---
source:
  summary: 6863414dc351
  example: f8be251bb758
  variants-and-states: fd49d91bfb70
  api: 76babfc30d7b
  accessibility: 29c24403f585
  rtl-and-localisation: 22b2b0a4fd7c
  platforms-code-reference: e2b4dfa527ec
---
# النموذج أ

النموذج أ صفحة اختبار لمسار المحتوى. وتستخدم كل بنية يسمح بها عقد التأليف.

## مثال

يعرض المثال إجراءً أساسيًا واحدًا.

```html live example=primary
<button class="hw-button" type="button" data-variant="primary">متابعة</button>
```

```tsx live example=primary
<Button variant="secondary">متابعة</Button>
```

```vue live example=primary
<HwButton variant="primary">متابعة</HwButton>
```

```ts live example=primary framework=angular
template: `<button hwButton variant="primary">متابعة</button>`
```

## الأشكال والحالات

### اللغة والاتجاه

يجوز أن تحدد المجموعة لغة محتواها واتجاهه.

```html live example=direction check=tabs-click
<p class="hw-type" lang="ar" dir="rtl">اقرأ <strong>الشروط</strong> أولًا.</p>
```

```jsx live example=direction
<p className="hw-type" lang="ar" dir="rtl">اقرأ <strong>الشروط</strong> أولًا.</p>
```

```vue live example=direction
<p class="hw-type" lang="ar" dir="rtl">اقرأ <strong>الشروط</strong> أولًا.</p>
```

```ts live example=direction framework=angular
template: `<p class="hw-type" lang="ar" dir="rtl">اقرأ <strong>الشروط</strong> أولًا.</p>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createFixture

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `string` | `true` | — |
| `size` | `'sm' \| 'md'` | `false` | `'md'` |

يسمّي الخيار label عنصر التحكم. ويحدد الخيار size الكثافة.

### React

جدول: خصائص Fixture

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `string` | `true` | — |

### Vue

جدول: خصائص HwFixture وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `true` | — |
| `change` | event | `string` | `false` | — |

### Angular

جدول: مدخلات hw-fixture ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `true` | — |
| `[hwFixtureIcon]` | content | `—` | `false` | — |

## إمكانية الوصول

لعنصر التحكم اسم متاح لتقنيات المساعدة. راجع [الواجهة البرمجية](#api) و[خيارات JavaScript](fixture-a.ar.md#javascript).

جدول: لوحة المفاتيح

| المفتاح | الإجراء |
| :-- | --: |
| Enter | يفعّل عنصر التحكم. |
| Space | يفعّل عنصر التحكم. |

> [!NOTE]
> يحتفظ عنصر التحكم بدلالات **الزر** الأصلية.

### قارئات الشاشة

#### الإعلانات

تُعلَن الحالة *مرة واحدة*.

1. انقل التركيز إلى عنصر التحكم.
2. اضغط Enter.

## الاتجاه والتوطين

يستخدم التخطيط الخصائص المنطقية فقط. راجع [كود المنصات](https://www.dga.gov.sa/) و[قائمة المكونات](../components.json).

---

- يتبع النص اتجاه الصفحة.
- تحتفظ الأرقام باتجاهها.

## مرجع كود المنصات

أمر التثبيت نص برمجي.

```shell
npm install @hawiyah/vanilla
```

```ts title="setup.ts"
import { enhance } from '@hawiyah/vanilla';
enhance(document.body);
```
