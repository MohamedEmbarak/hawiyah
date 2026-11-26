# دليل الاختبار

هذه الصفحة صفحة اختبار لبناء الدليل ولا تُنشر أبدًا. وتعرض البنية التي يمكن أن تكون للدليل: أقسام حرة وعناوين تحتها ومجموعة أمثلة حية.

## أقسام الدليل

للدليل عنوان رئيسي واحد وملخص من جملة أو جملتين، ثم أقسامه الخاصة به. ويختار الكاتب العناوين وترتيبها.

### العناوين تحت القسم

يقسّم العنوان من المستوى الثالث القسم، ويقسّم العنوان من المستوى الرابع العنوان من المستوى الثالث. ويمكن الانتقال من هنا إلى صفحة [الزر](../components/button.md) وإلى [قالب الاختبار](../templates/fixture-template.md#composition).

## مجموعة أمثلة حية

تقع مجموعة الأمثلة الحية في الدليل تحت أي عنوان من عناوينه. وتعرض هذه المجموعة الزر الأساسي من صفحة [الزر](../components/button.md) في أطر العمل الأربعة.

```html live example=continue
<button class="hw-button" type="button" data-variant="primary" data-size="md">متابعة</button>
```

```tsx live example=continue
<Button variant="primary">متابعة</Button>
```

```vue live example=continue
<Button variant="primary">متابعة</Button>
```

```ts live example=continue framework=angular
template: `<button hwButton variant="primary">متابعة</button>`
```

## الروابط بين الصفحات

- يقود الرابط إلى صفحة مكوّن إلى عرضها المرجعي، مثل [أشكال الزر](../components/button.md#variants).
- يقود الرابط إلى قسم من هذه الصفحة إلى عنوانه، مثل [أقسام الدليل](#sections-of-a-guide).
