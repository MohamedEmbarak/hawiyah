---
source:
  summary: 3b3e8f4de862
  example: 0c6cb27f4b77
  composition: d70a89771ff8
  platforms-code-reference: e608ed3ff86e
---
# نموذج طلب خدمة

قالب نموذج لطلب خدمة: ترويسة صفحة، ونموذج يضمّ حقولًا نصية وقائمة اختيار ومجموعة أزرار اختيار وحقلًا لاختيار التاريخ وحقلًا لرفع ملف، مع تمييز الحقول المطلوبة، وملخّص للأخطاء على مستوى النموذج، وزرَّي التقديم والإلغاء. ويُعرض القالب في حالة السكون ومع أخطاء التحقق.

## مثال

تسمّي ترويسة الصفحة الخدمة، ويليها النموذج في عمود واحد. وتذكر جملة في بداية النموذج أن علامة النجمة تميّز الحقل المطلوب. ويحمل كل عنصر تحكم تسمية ظاهرة، وتقع الإجراءات في نهاية النموذج: التقديم أولًا، ثم الإلغاء بعده. ويكتب التطبيق كل نص وتسمية ورسالة بلغة الصفحة، والقيم في المثالين متخيَّلة.

### النموذج في حالة السكون

لا يحمل أي حقل رسالة. ولا يحمل قيمة ثابتة إلا تاريخ الموعد، كي لا يعتمد المثال على تاريخ اليوم، وتبقى الحقول الأخرى فارغة. وتعرض الحقول المطلوبة علامة واحدة بعد تسميتها، وتحتفظ بالخاصية الأصلية `required`. ويُحدَّد خيار واحد من خيارات طريقة الاستلام، فتحمل المجموعة قيمة دائمًا. ويحمل النموذج الخاصية novalidate، فيتولى التطبيق التحقق ويكتب الرسائل بنفسه؛ ومن دونها يعرض المتصفح رسائله الخاصة.

```html live example=rest static differences=text-field-adapter-attributes,select-adapter-attributes,file-upload-adapter-labelledby,radio-adapter-markup,date-picker-adapter-markup,stack-vue-layout-attributes,inline-vue-layout-attributes,date-picker-value-order,date-picker-adapter-height frame
<div class="hw-stack">
  <header class="hw-page-header">
    <div class="hw-page-header-main">
      <div><h1>طلب خدمة</h1><p>أكمل النموذج لتقديم طلب خدمة. ويمكنك مراجعة الطلب قبل إرساله.</p></div>
    </div>
  </header>
  <form novalidate>
    <div class="hw-stack">
      <p>الحقول المميّزة بعلامة النجمة (*) مطلوبة.</p>
      <div class="hw-field">
        <label class="hw-label" for="rest-name" id="rest-name-label">الاسم الكامل<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="rest-name" name="full-name" autocomplete="name" required aria-describedby="rest-name-hint">
        <p class="hw-hint" id="rest-name-hint">اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية.</p>
      </div>
      <div class="hw-field">
        <label class="hw-label" for="rest-email" id="rest-email-label">البريد الإلكتروني<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="rest-email" name="email" type="email" autocomplete="email" required>
      </div>
      <div class="hw-field">
        <label class="hw-label" for="rest-mobile" id="rest-mobile-label">رقم الجوال</label>
        <input class="hw-input" id="rest-mobile" name="mobile" type="tel" autocomplete="tel">
      </div>
      <div class="hw-field">
        <label class="hw-label" for="rest-type" id="rest-type-label">نوع الطلب<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <select class="hw-select" id="rest-type" name="type" required>
          <option value="">اختر النوع</option>
          <option value="new">طلب جديد</option>
          <option value="renewal">تجديد</option>
          <option value="replacement">استبدال</option>
        </select>
      </div>
      <fieldset class="hw-field">
        <legend class="hw-label">كيف تفضّل استلام القرار؟</legend>
        <label class="hw-choice" for="rest-delivery-post"><input class="hw-radio" id="rest-delivery-post" name="delivery" type="radio" value="post" checked>عبر البريد</label>
        <label class="hw-choice" for="rest-delivery-email"><input class="hw-radio" id="rest-delivery-email" name="delivery" type="radio" value="email">عبر البريد الإلكتروني</label>
        <label class="hw-choice" for="rest-delivery-office"><input class="hw-radio" id="rest-delivery-office" name="delivery" type="radio" value="office">الاستلام حضوريًا</label>
      </fieldset>
      <div class="hw-date-picker" data-hw="date-picker" data-hw-locale="ar" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-calendar-system-label="نظام التقويم" data-hw-gregorian-label="ميلادي" data-hw-hijri-label="هجري (أم القرى)" data-hw-range-label="النطاق المدعوم" data-hw-invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." data-hw-unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى.">
        <label class="hw-label" for="rest-date">تاريخ الموعد المفضّل<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <div class="hw-date-picker-control"><input class="hw-input" id="rest-date" type="text" placeholder="سنة-شهر-يوم" data-hw-date-input name="appointment" value="2026-03-12" required aria-describedby="rest-date-hint">
        <button type="button" data-hw-date-trigger aria-label="فتح التقويم">التقويم</button></div>
        <p class="hw-hint" id="rest-date-hint">استخدم الصيغة YYYY-MM-DD.</p>
        <dialog class="hw-dialog" data-hw-date-dialog aria-label="اختر تاريخ الموعد">
          <header class="hw-dialog-header"><h2>اختر تاريخ الموعد</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>إغلاق</button></header>
          <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
        </dialog>
      </div>
      <div class="hw-field hw-upload">
        <label class="hw-label" for="rest-document" id="rest-document-label">المستند الداعم<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="rest-document" name="document" type="file" accept=".pdf,.jpg,.png" required aria-describedby="rest-document-hint">
        <p class="hw-hint" id="rest-document-hint">أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت.</p>
      </div>
      <div class="hw-inline">
        <button class="hw-button" type="submit" data-variant="primary" data-size="md">تقديم الطلب</button>
        <button class="hw-button" type="button" data-variant="secondary" data-size="md">إلغاء</button>
      </div>
    </div>
  </form>
</div>
```

```tsx live example=rest
<Stack>
  <PageHeader
    title="طلب خدمة"
    description="أكمل النموذج لتقديم طلب خدمة. ويمكنك مراجعة الطلب قبل إرساله."
  />
  <form noValidate>
    <Stack>
      <p>الحقول المميّزة بعلامة النجمة (*) مطلوبة.</p>
      <TextField id="rest-name" label="الاسم الكامل" name="full-name" autoComplete="name" required hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." />
      <TextField id="rest-email" label="البريد الإلكتروني" name="email" type="email" autoComplete="email" required />
      <TextField id="rest-mobile" label="رقم الجوال" name="mobile" type="tel" autoComplete="tel" />
      <Select
        id="rest-type"
        label="نوع الطلب"
        name="type"
        placeholder="اختر النوع"
        required
        options={[
          { value: 'new', label: 'طلب جديد' },
          { value: 'renewal', label: 'تجديد' },
          { value: 'replacement', label: 'استبدال' },
        ]}
      />
      <fieldset className="hw-field">
        <legend className="hw-label">كيف تفضّل استلام القرار؟</legend>
        <Radio label="عبر البريد" name="delivery" value="post" defaultChecked />
        <Radio label="عبر البريد الإلكتروني" name="delivery" value="email" />
        <Radio label="الاستلام حضوريًا" name="delivery" value="office" />
      </fieldset>
      <DatePicker id="rest-date" name="appointment" defaultValue="2026-03-12" required locale="ar" label="تاريخ الموعد المفضّل" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." />
      <FileUpload id="rest-document" label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" required hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." />
      <Inline>
        <Button variant="primary" type="submit">تقديم الطلب</Button>
        <Button variant="secondary" type="button">إلغاء</Button>
      </Inline>
    </Stack>
  </form>
</Stack>
```

```vue live example=rest
<Stack>
  <PageHeader title="طلب خدمة" description="أكمل النموذج لتقديم طلب خدمة. ويمكنك مراجعة الطلب قبل إرساله." />
  <form novalidate>
    <Stack>
      <p>الحقول المميّزة بعلامة النجمة (*) مطلوبة.</p>
      <TextField id="rest-name" label="الاسم الكامل" name="full-name" autocomplete="name" required hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." />
      <TextField id="rest-email" label="البريد الإلكتروني" name="email" type="email" autocomplete="email" required />
      <TextField id="rest-mobile" label="رقم الجوال" name="mobile" type="tel" autocomplete="tel" />
      <Select
        id="rest-type"
        label="نوع الطلب"
        name="type"
        placeholder="اختر النوع"
        required
        :options="[
          { value: 'new', label: 'طلب جديد' },
          { value: 'renewal', label: 'تجديد' },
          { value: 'replacement', label: 'استبدال' },
        ]"
      />
      <fieldset class="hw-field">
        <legend class="hw-label">كيف تفضّل استلام القرار؟</legend>
        <Radio label="عبر البريد" name="delivery" value="post" default-value="post" />
        <Radio label="عبر البريد الإلكتروني" name="delivery" value="email" default-value="post" />
        <Radio label="الاستلام حضوريًا" name="delivery" value="office" default-value="post" />
      </fieldset>
      <DatePicker id="rest-date" name="appointment" default-value="2026-03-12" required locale="ar" label="تاريخ الموعد المفضّل" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendar-label="اختر تاريخ الموعد" open-label="فتح التقويم" close-label="إغلاق" previous-label="الشهر السابق" next-label="الشهر التالي" calendar-system-label="نظام التقويم" gregorian-label="ميلادي" hijri-label="هجري (أم القرى)" range-label="النطاق المدعوم" invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." />
      <FileUpload id="rest-document" label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" required hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." />
      <Inline>
        <Button variant="primary" type="submit">تقديم الطلب</Button>
        <Button variant="secondary" type="button">إلغاء</Button>
      </Inline>
    </Stack>
  </form>
</Stack>
```

```ts live example=rest framework=angular
template: `<hw-stack>
  <hw-page-header title="طلب خدمة" description="أكمل النموذج لتقديم طلب خدمة. ويمكنك مراجعة الطلب قبل إرساله." />
  <form novalidate>
    <hw-stack>
      <p>الحقول المميّزة بعلامة النجمة (*) مطلوبة.</p>
      <hw-text-field controlId="rest-name" label="الاسم الكامل" name="full-name" autocomplete="name" [required]="true" hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." />
      <hw-text-field controlId="rest-email" label="البريد الإلكتروني" name="email" type="email" autocomplete="email" [required]="true" />
      <hw-text-field controlId="rest-mobile" label="رقم الجوال" name="mobile" type="tel" autocomplete="tel" />
      <hw-select
        controlId="rest-type"
        label="نوع الطلب"
        name="type"
        placeholder="اختر النوع"
        [required]="true"
        [options]="[
          { value: 'new', label: 'طلب جديد' },
          { value: 'renewal', label: 'تجديد' },
          { value: 'replacement', label: 'استبدال' },
        ]"
      />
      <hw-radio-group label="كيف تفضّل استلام القرار؟" name="delivery" value="post" [options]="[
        { value: 'post', label: 'عبر البريد' },
        { value: 'email', label: 'عبر البريد الإلكتروني' },
        { value: 'office', label: 'الاستلام حضوريًا' },
      ]" />
      <hw-date-picker controlId="rest-date" name="appointment" value="2026-03-12" [required]="true" locale="ar" label="تاريخ الموعد المفضّل" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." />
      <hw-file-upload controlId="rest-document" label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" [required]="true" hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." />
      <hw-inline>
        <button hwButton variant="primary" type="submit">تقديم الطلب</button>
        <button hwButton variant="secondary" type="button">إلغاء</button>
      </hw-inline>
    </hw-stack>
  </form>
</hw-stack>`
```

### النموذج مع أخطاء التحقق

تحقّق التطبيق من الطلب المُرسَل. وملخّص الأخطاء تنبيه بلون الخطر يقع في بداية النموذج، قبل جملة الحقول المطلوبة، ويسرد كل مشكلة رابطًا يقود إلى حقلها. ويعرض كل حقل فيه مشكلة رسالته في فقرة بعد عنصر التحكم، ويميّز عنصر التحكم بالخاصية `aria-invalid="true"`، ويصفه بالرسالة. ويحمل الملخّص الخاصية `role="status"` لأن الترميز يُعرض مع الصفحة وليس حدثًا لاحقًا؛ أما التطبيق الذي يضيف الملخّص بعد الإرسال فيستخدم الدور الافتراضي للون الخطر، الذي يقاطع القارئ، وينقل التركيز إلى الملخّص. ولا يقبل التنبيه التركيز، لذلك يضيف التطبيق إلى الملخّص الخاصية `tabindex` بالقيمة -1 قبل أن ينقل التركيز إليه. والترميز ثابت: لا يتضمّن برنامجًا نصيًا ولا يتحقق من القيم.

```html live example=errors static differences=text-field-adapter-attributes,select-adapter-attributes,file-upload-adapter-labelledby,radio-adapter-markup,date-picker-adapter-markup,stack-vue-layout-attributes,inline-vue-layout-attributes,date-picker-value-order,date-picker-adapter-height frame
<div class="hw-stack">
  <header class="hw-page-header">
    <div class="hw-page-header-main">
      <div><h1>طلب خدمة</h1><p>أكمل النموذج لتقديم طلب خدمة. ويمكنك مراجعة الطلب قبل إرساله.</p></div>
    </div>
  </header>
  <form novalidate>
    <div class="hw-stack">
      <div class="hw-alert" data-tone="danger" role="status">
        <div class="hw-alert-content"><strong>لم يُقدَّم الطلب.</strong><p>صحّح ما يلي، ثم قدّم الطلب مرة أخرى.</p><ul class="hw-stack">
          <li><a class="hw-link" href="#errors-name">أدخل اسمك الكامل.</a></li>
          <li><a class="hw-link" href="#errors-email">أدخل البريد الإلكتروني بالصيغة name@example.com.</a></li>
          <li><a class="hw-link" href="#errors-type">اختر نوع الطلب.</a></li>
          <li><a class="hw-link" href="#errors-date">اختر يوم عمل للموعد.</a></li>
          <li><a class="hw-link" href="#errors-document">أرفق المستند الداعم قبل تقديم الطلب.</a></li>
        </ul></div>
      </div>
      <p>الحقول المميّزة بعلامة النجمة (*) مطلوبة.</p>
      <div class="hw-field">
        <label class="hw-label" for="errors-name" id="errors-name-label">الاسم الكامل<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="errors-name" name="full-name" autocomplete="name" required aria-invalid="true" aria-describedby="errors-name-hint errors-name-error">
        <p class="hw-hint" id="errors-name-hint">اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية.</p>
        <p class="hw-error" id="errors-name-error">أدخل اسمك الكامل.</p>
      </div>
      <div class="hw-field">
        <label class="hw-label" for="errors-email" id="errors-email-label">البريد الإلكتروني<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="errors-email" name="email" type="email" autocomplete="email" value="applicant.example.com" required aria-invalid="true" aria-describedby="errors-email-error">
        <p class="hw-error" id="errors-email-error">أدخل البريد الإلكتروني بالصيغة name@example.com.</p>
      </div>
      <div class="hw-field">
        <label class="hw-label" for="errors-mobile" id="errors-mobile-label">رقم الجوال</label>
        <input class="hw-input" id="errors-mobile" name="mobile" type="tel" autocomplete="tel" value="0500000000">
      </div>
      <div class="hw-field">
        <label class="hw-label" for="errors-type" id="errors-type-label">نوع الطلب<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <select class="hw-select" id="errors-type" name="type" required aria-invalid="true" aria-describedby="errors-type-error">
          <option value="">اختر النوع</option>
          <option value="new">طلب جديد</option>
          <option value="renewal">تجديد</option>
          <option value="replacement">استبدال</option>
        </select>
        <p class="hw-error" id="errors-type-error">اختر نوع الطلب.</p>
      </div>
      <fieldset class="hw-field">
        <legend class="hw-label">كيف تفضّل استلام القرار؟</legend>
        <label class="hw-choice" for="errors-delivery-post"><input class="hw-radio" id="errors-delivery-post" name="delivery" type="radio" value="post" checked>عبر البريد</label>
        <label class="hw-choice" for="errors-delivery-email"><input class="hw-radio" id="errors-delivery-email" name="delivery" type="radio" value="email">عبر البريد الإلكتروني</label>
        <label class="hw-choice" for="errors-delivery-office"><input class="hw-radio" id="errors-delivery-office" name="delivery" type="radio" value="office">الاستلام حضوريًا</label>
      </fieldset>
      <div class="hw-date-picker" data-hw="date-picker" data-hw-locale="ar" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-calendar-system-label="نظام التقويم" data-hw-gregorian-label="ميلادي" data-hw-hijri-label="هجري (أم القرى)" data-hw-range-label="النطاق المدعوم" data-hw-invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." data-hw-unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى.">
        <label class="hw-label" for="errors-date">تاريخ الموعد المفضّل<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <div class="hw-date-picker-control"><input class="hw-input" id="errors-date" type="text" placeholder="سنة-شهر-يوم" data-hw-date-input name="appointment" value="2026-03-14" required aria-invalid="true" aria-describedby="errors-date-hint errors-date-error">
        <button type="button" data-hw-date-trigger aria-label="فتح التقويم">التقويم</button></div>
        <p class="hw-hint" id="errors-date-hint">استخدم الصيغة YYYY-MM-DD.</p>
        <p class="hw-error" id="errors-date-error">اختر يوم عمل للموعد.</p>
        <dialog class="hw-dialog" data-hw-date-dialog aria-label="اختر تاريخ الموعد">
          <header class="hw-dialog-header"><h2>اختر تاريخ الموعد</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>إغلاق</button></header>
          <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
        </dialog>
      </div>
      <div class="hw-field hw-upload">
        <label class="hw-label" for="errors-document" id="errors-document-label">المستند الداعم<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="errors-document" name="document" type="file" accept=".pdf,.jpg,.png" required aria-invalid="true" aria-describedby="errors-document-hint errors-document-error">
        <p class="hw-hint" id="errors-document-hint">أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت.</p>
        <p class="hw-error" id="errors-document-error">أرفق المستند الداعم قبل تقديم الطلب.</p>
      </div>
      <div class="hw-inline">
        <button class="hw-button" type="submit" data-variant="primary" data-size="md">تقديم الطلب</button>
        <button class="hw-button" type="button" data-variant="secondary" data-size="md">إلغاء</button>
      </div>
    </div>
  </form>
</div>
```

```tsx live example=errors
<Stack>
  <PageHeader
    title="طلب خدمة"
    description="أكمل النموذج لتقديم طلب خدمة. ويمكنك مراجعة الطلب قبل إرساله."
  />
  <form noValidate>
    <Stack>
      <Alert tone="danger" role="status" title="لم يُقدَّم الطلب.">
        <p>صحّح ما يلي، ثم قدّم الطلب مرة أخرى.</p>
        <ul className="hw-stack">
          <li><Link href="#errors-name">أدخل اسمك الكامل.</Link></li>
          <li><Link href="#errors-email">أدخل البريد الإلكتروني بالصيغة name@example.com.</Link></li>
          <li><Link href="#errors-type">اختر نوع الطلب.</Link></li>
          <li><Link href="#errors-date">اختر يوم عمل للموعد.</Link></li>
          <li><Link href="#errors-document">أرفق المستند الداعم قبل تقديم الطلب.</Link></li>
        </ul>
      </Alert>
      <p>الحقول المميّزة بعلامة النجمة (*) مطلوبة.</p>
      <TextField id="errors-name" label="الاسم الكامل" name="full-name" autoComplete="name" required hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." error="أدخل اسمك الكامل." />
      <TextField id="errors-email" label="البريد الإلكتروني" name="email" type="email" autoComplete="email" defaultValue="applicant.example.com" required error="أدخل البريد الإلكتروني بالصيغة name@example.com." />
      <TextField id="errors-mobile" label="رقم الجوال" name="mobile" type="tel" autoComplete="tel" defaultValue="0500000000" />
      <Select
        id="errors-type"
        label="نوع الطلب"
        name="type"
        placeholder="اختر النوع"
        required
        error="اختر نوع الطلب."
        options={[
          { value: 'new', label: 'طلب جديد' },
          { value: 'renewal', label: 'تجديد' },
          { value: 'replacement', label: 'استبدال' },
        ]}
      />
      <fieldset className="hw-field">
        <legend className="hw-label">كيف تفضّل استلام القرار؟</legend>
        <Radio label="عبر البريد" name="delivery" value="post" defaultChecked />
        <Radio label="عبر البريد الإلكتروني" name="delivery" value="email" />
        <Radio label="الاستلام حضوريًا" name="delivery" value="office" />
      </fieldset>
      <DatePicker id="errors-date" name="appointment" defaultValue="2026-03-14" required locale="ar" label="تاريخ الموعد المفضّل" hint="استخدم الصيغة YYYY-MM-DD." error="اختر يوم عمل للموعد." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." />
      <FileUpload id="errors-document" label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" required hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." error="أرفق المستند الداعم قبل تقديم الطلب." />
      <Inline>
        <Button variant="primary" type="submit">تقديم الطلب</Button>
        <Button variant="secondary" type="button">إلغاء</Button>
      </Inline>
    </Stack>
  </form>
</Stack>
```

```vue live example=errors
<Stack>
  <PageHeader title="طلب خدمة" description="أكمل النموذج لتقديم طلب خدمة. ويمكنك مراجعة الطلب قبل إرساله." />
  <form novalidate>
    <Stack>
      <Alert tone="danger" role="status" title="لم يُقدَّم الطلب.">
        <p>صحّح ما يلي، ثم قدّم الطلب مرة أخرى.</p>
        <ul class="hw-stack">
          <li><Link href="#errors-name">أدخل اسمك الكامل.</Link></li>
          <li><Link href="#errors-email">أدخل البريد الإلكتروني بالصيغة name@example.com.</Link></li>
          <li><Link href="#errors-type">اختر نوع الطلب.</Link></li>
          <li><Link href="#errors-date">اختر يوم عمل للموعد.</Link></li>
          <li><Link href="#errors-document">أرفق المستند الداعم قبل تقديم الطلب.</Link></li>
        </ul>
      </Alert>
      <p>الحقول المميّزة بعلامة النجمة (*) مطلوبة.</p>
      <TextField id="errors-name" label="الاسم الكامل" name="full-name" autocomplete="name" required hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." error="أدخل اسمك الكامل." />
      <TextField id="errors-email" label="البريد الإلكتروني" name="email" type="email" autocomplete="email" default-value="applicant.example.com" required error="أدخل البريد الإلكتروني بالصيغة name@example.com." />
      <TextField id="errors-mobile" label="رقم الجوال" name="mobile" type="tel" autocomplete="tel" default-value="0500000000" />
      <Select
        id="errors-type"
        label="نوع الطلب"
        name="type"
        placeholder="اختر النوع"
        required
        error="اختر نوع الطلب."
        :options="[
          { value: 'new', label: 'طلب جديد' },
          { value: 'renewal', label: 'تجديد' },
          { value: 'replacement', label: 'استبدال' },
        ]"
      />
      <fieldset class="hw-field">
        <legend class="hw-label">كيف تفضّل استلام القرار؟</legend>
        <Radio label="عبر البريد" name="delivery" value="post" default-value="post" />
        <Radio label="عبر البريد الإلكتروني" name="delivery" value="email" default-value="post" />
        <Radio label="الاستلام حضوريًا" name="delivery" value="office" default-value="post" />
      </fieldset>
      <DatePicker id="errors-date" name="appointment" default-value="2026-03-14" required locale="ar" label="تاريخ الموعد المفضّل" hint="استخدم الصيغة YYYY-MM-DD." error="اختر يوم عمل للموعد." placeholder="سنة-شهر-يوم" calendar-label="اختر تاريخ الموعد" open-label="فتح التقويم" close-label="إغلاق" previous-label="الشهر السابق" next-label="الشهر التالي" calendar-system-label="نظام التقويم" gregorian-label="ميلادي" hijri-label="هجري (أم القرى)" range-label="النطاق المدعوم" invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." />
      <FileUpload id="errors-document" label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" required hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." error="أرفق المستند الداعم قبل تقديم الطلب." />
      <Inline>
        <Button variant="primary" type="submit">تقديم الطلب</Button>
        <Button variant="secondary" type="button">إلغاء</Button>
      </Inline>
    </Stack>
  </form>
</Stack>
```

```ts live example=errors framework=angular
template: `<hw-stack>
  <hw-page-header title="طلب خدمة" description="أكمل النموذج لتقديم طلب خدمة. ويمكنك مراجعة الطلب قبل إرساله." />
  <form novalidate>
    <hw-stack>
      <hw-alert tone="danger" role="status" title="لم يُقدَّم الطلب.">
        <p>صحّح ما يلي، ثم قدّم الطلب مرة أخرى.</p>
        <ul class="hw-stack">
          <li><a hwLink href="#errors-name">أدخل اسمك الكامل.</a></li>
          <li><a hwLink href="#errors-email">أدخل البريد الإلكتروني بالصيغة name@example.com.</a></li>
          <li><a hwLink href="#errors-type">اختر نوع الطلب.</a></li>
          <li><a hwLink href="#errors-date">اختر يوم عمل للموعد.</a></li>
          <li><a hwLink href="#errors-document">أرفق المستند الداعم قبل تقديم الطلب.</a></li>
        </ul>
      </hw-alert>
      <p>الحقول المميّزة بعلامة النجمة (*) مطلوبة.</p>
      <hw-text-field controlId="errors-name" label="الاسم الكامل" name="full-name" autocomplete="name" [required]="true" hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." error="أدخل اسمك الكامل." />
      <hw-text-field controlId="errors-email" label="البريد الإلكتروني" name="email" type="email" autocomplete="email" value="applicant.example.com" [required]="true" error="أدخل البريد الإلكتروني بالصيغة name@example.com." />
      <hw-text-field controlId="errors-mobile" label="رقم الجوال" name="mobile" type="tel" autocomplete="tel" value="0500000000" />
      <hw-select
        controlId="errors-type"
        label="نوع الطلب"
        name="type"
        placeholder="اختر النوع"
        [required]="true"
        error="اختر نوع الطلب."
        [options]="[
          { value: 'new', label: 'طلب جديد' },
          { value: 'renewal', label: 'تجديد' },
          { value: 'replacement', label: 'استبدال' },
        ]"
      />
      <hw-radio-group label="كيف تفضّل استلام القرار؟" name="delivery" value="post" [options]="[
        { value: 'post', label: 'عبر البريد' },
        { value: 'email', label: 'عبر البريد الإلكتروني' },
        { value: 'office', label: 'الاستلام حضوريًا' },
      ]" />
      <hw-date-picker controlId="errors-date" name="appointment" value="2026-03-14" [required]="true" locale="ar" label="تاريخ الموعد المفضّل" hint="استخدم الصيغة YYYY-MM-DD." error="اختر يوم عمل للموعد." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." />
      <hw-file-upload controlId="errors-document" label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" [required]="true" hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." error="أرفق المستند الداعم قبل تقديم الطلب." />
      <hw-inline>
        <button hwButton variant="primary" type="submit">تقديم الطلب</button>
        <button hwButton variant="secondary" type="button">إلغاء</button>
      </hw-inline>
    </hw-stack>
  </form>
</hw-stack>`
```

## المكوّنات المستخدمة

- [عنوان الصفحة](../components/page-header.md) يسمّي الخدمة ويذكر ما يستطيع القارئ فعله في الصفحة. والعنوان هو العنصر `h1` في الصفحة.
- [الترتيب العمودي](../components/stack.md) يُبقي جملة الحقول المطلوبة والحقول والإجراءات في عمود واحد، بمسافة واحدة بينها. ويقع العنصر `form` بين ترتيبين عموديين: يضمّ الخارجي منهما الترويسة والنموذج، ويضمّ الداخلي جملة الحقول المطلوبة والحقول والإجراءات.
- [التنبيه](../components/alert.md) يحمل ملخّص الأخطاء. ولا يتضمّن الإصدار 0.3.0 من هوية مكوّنًا لملخّص الأخطاء: فالتنبيه يضمّ عنوانًا وجملة واحدة وقائمة روابط يكتبها التطبيق، وينقل التطبيق التركيز إليه بعد إرسال لم ينجح، وهذا يتطلّب الخاصية `tabindex` بالقيمة -1 على التنبيه لأنه لا يقبل التركيز.
- [الرابط](../components/link.md) هو كل بند من بنود ملخّص الأخطاء، ويقود إلى الحقل الذي فيه المشكلة.
- [الإدخال النصي](../components/text-field.md) يجمع الاسم والبريد الإلكتروني ورقم الجوال. ويعرض الحقل المطلوب علامته، ويظهر الخطأ بعد عنصر التحكم.
- [قائمة الاختيار](../components/select.md) تجمع نوع الطلب؛ ويدعو خيارها الأول الفارغ القارئَ إلى الاختيار، وهو القيمة التي يرفضها المتصفح عندما يكون الحقل مطلوبًا.
- [الخيار الواحد](../components/radio.md) يجمع طريقة الاستلام. ففي ترميز vanilla وفي مثالَي React وVue يكتب التطبيق العنصرين `fieldset` و`legend`، ولا يعرض زر الاختيار علامة الحقل المطلوب؛ ويستخدم مثال Angular المكوّن `hw-radio-group` الذي يعرضهما. ولا تُميَّز المجموعة بأنها مطلوبة، ويحدّد التطبيق خيارًا واحدًا مسبقًا كي تحمل المجموعة قيمة دائمًا.
- [اختيار التاريخ](../components/date-picker.md) يجمع تاريخ الموعد المفضّل تاريخًا بصيغة ISO. ويحمل الحقل قيمة ثابتة في المثالين، كي لا يعتمد المثال على تاريخ اليوم.
- [رفع الملف](../components/file-upload.md) يختار المستند الداعم. ولا يرسل الملف؛ فالنقل والتحقق في الخادم من مسؤولية التطبيق.
- [الترتيب الأفقي](../components/inline.md) يضع الإجراءين في صف واحد، وينتقل أحدهما إلى سطر جديد عندما يضيق الصف.
- [الزر](../components/button.md) هو إجراء التقديم الأساسي وإجراء الإلغاء الثانوي. ويتولى التطبيق تنفيذ ما يترتّب على إجراء الإلغاء.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر القالب؛ وأدلة كل مكوّن في صفحته.

### المصادر

- تربط [ملاحظات التغطية](../coverage.md) أنواع الإدخال الأصلية بالمكوّنات، ومنها ربط إدخال الملف بالمكوّن FileUpload أو FileDropzone، وإدخال التاريخ بالمكوّن DatePicker، وعنصر التقديم بالمكوّن Button من النوع submit. ولا تسجّل الملاحظات تطابقًا بين هذا القالب وقالب من ملفات كود المنصات المزوَّدة.
- تصف [ملاحظات التحقق من الإدخال](../input-validation-colors.md) الخطأ الصريح الذي يكتبه التطبيق فيميّز الحقل بأنه غير صالح، وتذكر أن التطبيق يقرّر متى يعرضه، وعلى ذلك تقوم حالة الخطأ في المجموعة الثانية.
- تذكر [ملاحظات التخطيط](../layout.md) أن التخطيط تتولاه CSS؛ ولا يقيس القالب نافذة العرض ببرنامج نصي.
