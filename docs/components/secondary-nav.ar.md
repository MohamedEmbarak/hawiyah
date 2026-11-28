---
source:
  summary: fae43216e98f
  example: c384d76162f9
  variants-and-states: 4e5c7eff6dc9
  api: eb4dbc910d68
  accessibility: be1a4a45a48b
  rtl-and-localisation: f1fe48778c77
  platforms-code-reference: 97b7c0110807
---
# التنقل الثانوي

التنقل الثانوي معلَم تنقل يضمّ روابط صفحات عادية، ويمكن تمييز أحدها بأنه الصفحة الحالية. وليس له سلوك قائمة تبويبات ولا سلوك قائمة أوامر: فكل بند رابط يتبعه المتصفح.

## مثال

تؤدي الروابط إلى صفحات مجال خدمة واحد، ويُميَّز بند الصفحة المفتوحة بأنه البند الحالي. وللمعلَم اسم يميّزه من التنقل الرئيسي.

```html live example=basic differences=secondary-nav-adapter-variant
<nav class="hw-secondary-nav" aria-label="مجال الخدمة">
  <ul>
    <li><a href="/requests" aria-current="page"><span>الطلبات</span></a></li>
    <li><a href="/documents"><span>المستندات</span></a></li>
    <li><a href="/profile"><span>الملف الشخصي</span></a></li>
  </ul>
</nav>
```

```tsx live example=basic
<SecondaryNav
  label="مجال الخدمة"
  items={[
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المستندات', href: '/documents' },
    { label: 'الملف الشخصي', href: '/profile' },
  ]}
/>
```

```vue live example=basic
<SecondaryNav
  label="مجال الخدمة"
  :items="[
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المستندات', href: '/documents' },
    { label: 'الملف الشخصي', href: '/profile' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-secondary-nav
  label="مجال الخدمة"
  [items]="[
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المستندات', href: '/documents' },
    { label: 'الملف الشخصي', href: '/profile' },
  ]"
/>`
```

## الأشكال والحالات

### شريط الجوال

يرتّب الشكل `mobile` الروابط بنودًا متساوية العرض، فوق تسمية كل منها أيقونة من أيقونات الحزم، لشريط يضمّ الوجهات الرئيسية على شاشة ضيقة. والأيقونة زخرفية، وتبقى التسمية مطلوبة. ولا يستخدم اسمَ أيقونة البند إلا هذا الشكل.

```html live example=mobile
<nav class="hw-secondary-nav" data-variant="mobile" aria-label="روابط سريعة">
  <ul>
    <li><a href="/" aria-current="page"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span>الرئيسية</span></a></li>
    <li><a href="/documents"><span class="hw-icon" data-icon="file-01" aria-hidden="true"></span><span>المستندات</span></a></li>
    <li><a href="/messages"><span class="hw-icon" data-icon="message-01" aria-hidden="true"></span><span>الرسائل</span></a></li>
  </ul>
</nav>
```

```tsx live example=mobile
<SecondaryNav
  label="روابط سريعة"
  variant="mobile"
  items={[
    { label: 'الرئيسية', href: '/', icon: 'home-01', current: true },
    { label: 'المستندات', href: '/documents', icon: 'file-01' },
    { label: 'الرسائل', href: '/messages', icon: 'message-01' },
  ]}
/>
```

```vue live example=mobile
<SecondaryNav
  label="روابط سريعة"
  variant="mobile"
  :items="[
    { label: 'الرئيسية', href: '/', icon: 'home-01', current: true },
    { label: 'المستندات', href: '/documents', icon: 'file-01' },
    { label: 'الرسائل', href: '/messages', icon: 'message-01' },
  ]"
/>
```

```ts live example=mobile framework=angular
template: `<hw-secondary-nav
  label="روابط سريعة"
  variant="mobile"
  [items]="[
    { label: 'الرئيسية', href: '/', icon: 'home-01', current: true },
    { label: 'المستندات', href: '/documents', icon: 'file-01' },
    { label: 'الرسائل', href: '/messages', icon: 'message-01' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-secondary-nav

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-secondary-nav'` | `true` | — |
| `data-variant` | `'mobile'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للتنقل الثانوي متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `nav` بالصنف `hw-secondary-nav` له اسم من الخاصية `aria-label` أو `aria-labelledby`، وداخله عنصر `ul`، وعنصر `li` فيه عنصر `a` لكل رابط. واكتب `aria-current="page"` على رابط الصفحة المفتوحة؛ ويتولّى التطبيق هذا التحديث. وتضبط الخاصية `data-variant="mobile"` شريط الجوال، وتحتوي روابطه على عنصر `hw-icon` زخرفي يحمل `aria-hidden="true"` قبل التسمية. ودون `data-variant` يكون للروابط المظهر الافتراضي.

### React

جدول: خصائص SecondaryNav

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `items` | `readonly SecondaryNavItem[]` | `true` | — |
| `variant` | `'default' \| 'mobile'` | `false` | `'default'` |
| `label` | `string` | `false` | — |

لكل بند من `items` الحقلان `label` و`href`، والحقلان الاختياريان `current` و`icon`. ويُعرض رابط البند الذي يحمل `current` مع `aria-current="page"`. ويُسمّى المعلَم بالخاصية `label`، أو بالخاصية `aria-label` أو `aria-labelledby`. وعندما تكون قيمة `variant` هي `'mobile'` يعرض البند الذي يحمل `icon` أيقونة زخرفية من أيقونات الحزم قبل تسميته؛ وفي الشكل الافتراضي لا يُعرض `icon`. ويعرض المكوّن عنصر `nav`، فتصل إليه الخصائص الأخرى لعنصر `nav` الأصلي.

### Vue

جدول: خصائص SecondaryNav وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | prop | `'default' \| 'mobile'` | `false` | `'default'` |
| `items` | prop | `readonly SecondaryNavItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |

لبنود الخاصية `items` الحقول نفسها التي لها في React، والحقل `label` فيها سلسلة نصية. ويُعرض رابط البند الذي يحمل `current` مع `aria-current="page"`. ويُسمّى المعلَم بالخاصية `label`، أو بالخاصية `aria-label` أو `aria-labelledby` المكتوبة على المكوّن. ولا يُعرض الحقل `icon` للبند إلا عندما تكون قيمة `variant` هي `'mobile'`. ولا يعرّف المكوّن أي منفذ.

### Angular

جدول: مُدخلات hw-secondary-nav ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `variant` | input | `'default' \| 'mobile'` | `false` | `'default'` |
| `items` | input | `readonly HwSecondaryNavItem[]` | `false` | `[]` |

يُطبَّق `HwSecondaryNavComponent` على `hw-secondary-nav`. ويأخذ المُدخل `items` كائنات فيها الحقلان `label` و`href`، والحقلان الاختياريان `current` و`icon`. والمُدخل `label` مطلوب ما لم تُكتب الخاصية `aria-label` أو `aria-labelledby` على `hw-secondary-nav`؛ وتُمرَّر هاتان الخاصيتان والخاصية `aria-describedby` إلى عنصر `nav`، ولا تبقى على العنصر المضيف. ويُكتب المُدخل `variant` في الخاصية `data-variant`، ولا يُعرض الحقل `icon` للبند إلا في الشكل `mobile`.

## إمكانية الوصول

يعرض التنقل الثانوي عنصر `nav`، فيوفّر المتصفح معلَم تنقل، وكل بند رابط أصلي. ويتبع استخدام لوحة المفاتيح سلوك الروابط: ينقل <kbd>Tab</kbd> التركيز إلى الرابط التالي، وينتقل <kbd>Enter</kbd> إلى وجهته.

- ليست الروابط قائمة تبويبات ولا قائمة أوامر، ولا يضيف المكوّن أي تعامل مع مفاتيح الأسهم ولا تركيزًا متنقلًا.
- تُميَّز الصفحة الحالية بالخاصية `aria-current="page"` على رابطها؛ ويبقى الرابط قابلًا للتركيز، ويحتفظ بوجهته.
- يحتاج المعلَم إلى اسم يميّزه من التنقل الرئيسي ومن معالم التنقل الأخرى في الصفحة.
- أيقونة شكل الجوال مخفية عن التقنيات المساعدة، فتسمّي التسميةُ وحدها الرابط.
- في السمة الافتراضية تمنح ورقة الأنماط روابط شكل الجوال انتقالًا لونيًا؛ ويكون الانتقال فوريًا في سمة هوية الأصلية، وتلغيه ورقة الأنماط عندما يطلب القارئ تقليل الحركة.

> [!NOTE]
> استخدم التبويبات للتبديل بين اللوحات داخل صفحة واحدة. ويؤدي التنقل الثانوي إلى صفحات أخرى، وليس فيه لوحات.

## الاتجاه والتوطين

ليس في التنقل الثانوي نص مدمج. يكتب التطبيق اسم المعلَم وتسمية كل بند بلغة الصفحة، وقائمة الروابط صف مرن يتبع اتجاه السطر في الصفحة، فيقع الرابط الأول في جهة بدء القراءة، في العربية وفي الإنجليزية.

- اسم أيقونة البند معرّف لأيقونة من أيقونات الحزم، لا نص، ويبقى نفسه في اللغتين.
- ترتيب `items` هو ترتيب القراءة. فأبقِ الروابط نفسها بالترتيب نفسه في لغتَي الخدمة كلتيهما.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط التنقل الثانوي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج التنقل الثانوي في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md)، وتصفه الملاحظات بأنه روابط عادية تُميَّز فيها الصفحة الحالية، وتميّزه من التبويبات ومن التنقل في المحتوى.
- تُوثّق [ملاحظات التنقل في الجوال](../mobile-navigation.md) شكل الجوال: بنود متساوية العرض، وأيقونة زخرفية فوق كل تسمية، ومؤشر للصفحة الحالية.
