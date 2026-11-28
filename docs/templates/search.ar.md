---
source:
  summary: 94f7243626ed
  example: 3740bc231564
  composition: e382e95723f4
  platforms-code-reference: 28fcda0e2b4f
---
# نتائج البحث

يعرض قالب صفحة نتائج البحث حقل البحث وفيه عبارة البحث، وعدد النتائج، والنتائج في قائمة روابط مع ملخصاتها أو في بطاقات خدمات، وحالة فارغة في حالة مستقلة، وترقيم الصفحات. ويُجري التطبيق البحث، ويتولّى كل نص وكل عنوان وجهة والصفحة المعروضة.

## مثال

كل حالة أدناه هي الصفحة التي يراها القارئ في لحظة من لحظات البحث. وفي الصفحة منطقة `main` واحدة، وعنصر `h1` يسمّي الصفحة، وحقل البحث فوق النتائج، ليتمكّن القارئ من تغيير عبارة البحث دون مغادرة النتائج. ويقع عدد النتائج تحت الحقل ويذكر عبارة البحث، وتليه النتائج بالترتيب الذي يُعيدها به التطبيق. والعدد فقرة تحمل `role="status"`، تُعلنها التقنيات المساعدة عندما يغيّر التطبيق محتواها في مكانه؛ ولا يُعلَن المحتوى الموجود عند تحميل الصفحة. وتحت العدد عنصر `h2` أصلي باسم «النتائج» يحفظ تسلسل العناوين دون انقطاع، لأن عنوانَي ServiceCard وEmptyState يُعرضان في عنصرَي عنوان من المستوى الثالث.

### النتائج روابط

النتيجة رابط يسمّي نصُّه وجهته، يليه ملخص في فقرة. وتقع النتائج في قائمة مرتّبة، لتُعلن التقنيات المساعدة عدد النتائج في الصفحة المعروضة وموضع كل نتيجة منها. ويلي ترقيمُ الصفحات القائمةَ ويسمّي الصفحة المعروضة. وتعرض الأمثلة زر البحث دون معالج؛ فإما أن يعالج التطبيق دالة الاستدعاء الخاصة بالبحث في [SearchField](../components/search-field.md)، وإما أن يضع الحقل في نموذج، كما تصف تلك الصفحة. وتضمّ صفحات المثال الثلاث تسع نتائج، ثلاث نتائج في كل صفحة.

```html live example=links static differences=container-vue-layout-attributes,stack-vue-layout-attributes,search-field-adapter-markup,pagination-adapter-markup frame
<main>
  <div class="hw-container">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>نتائج البحث</h1></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field">
        <label class="hw-label" for="links-query">البحث في الخدمات</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="links-query" name="query" type="search" value="تصريح الإقامة" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
          </div>
          <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="بحث"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
        </div>
      </div>
      <h2>النتائج</h2>
      <p role="status">9 نتائج للبحث عن تصريح الإقامة</p>
      <ol>
        <li>
          <a class="hw-link" href="/services/residence-permit">طلب تصريح إقامة</a>
          <p>قدّم الطلب والمستندات والرسوم لإصدار تصريح إقامة جديد.</p>
        </li>
        <li>
          <a class="hw-link" href="/services/residence-renewal">تجديد تصريح الإقامة</a>
          <p>جدّد تصريحًا ينتهي خلال الأيام التسعين القادمة.</p>
        </li>
        <li>
          <a class="hw-link" href="/services/residence-transfer">نقل تصريح الإقامة</a>
          <p>انقل تصريحًا ساريًا إلى كفيل جديد.</p>
        </li>
      </ol>
      <nav class="hw-pagination" data-hw="pagination" aria-label="صفحات النتائج" data-hw-total="3" data-hw-current="1" data-hw-page-label="الصفحة {page}" data-hw-gap-label="الصفحات من {start} إلى {end}" data-hw-jump-label="رقم الصفحة" data-hw-go-label="انتقال">
        <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="الصفحة السابقة"></button>
        <span class="hw-pagination-items" data-hw-pagination-items></span>
        <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="الصفحة التالية"></button>
      </nav>
    </div>
  </div>
</main>
```

```tsx live example=links
<main>
  <Container>
    <Stack>
      <PageHeader title="نتائج البحث" />
      <SearchField label="البحث في الخدمات" name="query" defaultValue="تصريح الإقامة" clearLabel="مسح البحث" showSearchButton searchLabel="بحث" />
      <h2>النتائج</h2>
      <p role="status">9 نتائج للبحث عن تصريح الإقامة</p>
      <ol>
        <li>
          <Link href="/services/residence-permit">طلب تصريح إقامة</Link>
          <p>قدّم الطلب والمستندات والرسوم لإصدار تصريح إقامة جديد.</p>
        </li>
        <li>
          <Link href="/services/residence-renewal">تجديد تصريح الإقامة</Link>
          <p>جدّد تصريحًا ينتهي خلال الأيام التسعين القادمة.</p>
        </li>
        <li>
          <Link href="/services/residence-transfer">نقل تصريح الإقامة</Link>
          <p>انقل تصريحًا ساريًا إلى كفيل جديد.</p>
        </li>
      </ol>
      <Pagination
        label="صفحات النتائج"
        totalPages={3}
        defaultPage={1}
        previousLabel="الصفحة السابقة"
        nextLabel="الصفحة التالية"
        getPageLabel={page => `الصفحة ${page}`}
        getGapLabel={(start, end) => `الصفحات من ${start} إلى ${end}`}
        jumpLabel="رقم الصفحة"
        goLabel="انتقال"
      />
    </Stack>
  </Container>
</main>
```

```vue live example=links
<main>
  <Container>
    <Stack>
      <PageHeader title="نتائج البحث" />
      <SearchField label="البحث في الخدمات" name="query" default-value="تصريح الإقامة" clear-label="مسح البحث" show-search-button search-label="بحث" />
      <h2>النتائج</h2>
      <p role="status">9 نتائج للبحث عن تصريح الإقامة</p>
      <ol>
        <li>
          <Link href="/services/residence-permit">طلب تصريح إقامة</Link>
          <p>قدّم الطلب والمستندات والرسوم لإصدار تصريح إقامة جديد.</p>
        </li>
        <li>
          <Link href="/services/residence-renewal">تجديد تصريح الإقامة</Link>
          <p>جدّد تصريحًا ينتهي خلال الأيام التسعين القادمة.</p>
        </li>
        <li>
          <Link href="/services/residence-transfer">نقل تصريح الإقامة</Link>
          <p>انقل تصريحًا ساريًا إلى كفيل جديد.</p>
        </li>
      </ol>
      <Pagination
        label="صفحات النتائج"
        :total-pages="3"
        :default-value="1"
        previous-label="الصفحة السابقة"
        next-label="الصفحة التالية"
        :get-page-label="(page: number) => `الصفحة ${page}`"
        :get-gap-label="(start: number, end: number) => `الصفحات من ${start} إلى ${end}`"
        jump-label="رقم الصفحة"
        go-label="انتقال"
      />
    </Stack>
  </Container>
</main>
```

```ts live example=links framework=angular
import { Component } from '@angular/core';
import {
  HwContainerComponent,
  HwLinkDirective,
  HwPageHeaderComponent,
  HwPaginationComponent,
  HwSearchFieldComponent,
  HwStackComponent,
} from '@hawiyah/angular';

@Component({
  selector: 'app-links-example',
  imports: [
    HwContainerComponent,
    HwLinkDirective,
    HwPageHeaderComponent,
    HwPaginationComponent,
    HwSearchFieldComponent,
    HwStackComponent,
  ],
  template: `<main>
    <hw-container>
      <hw-stack>
        <hw-page-header title="نتائج البحث" />
        <hw-search-field label="البحث في الخدمات" name="query" value="تصريح الإقامة" clearLabel="مسح البحث" [showSearchButton]="true" searchLabel="بحث" />
        <h2>النتائج</h2>
        <p role="status">9 نتائج للبحث عن تصريح الإقامة</p>
        <ol>
          <li>
            <a hwLink href="/services/residence-permit">طلب تصريح إقامة</a>
            <p>قدّم الطلب والمستندات والرسوم لإصدار تصريح إقامة جديد.</p>
          </li>
          <li>
            <a hwLink href="/services/residence-renewal">تجديد تصريح الإقامة</a>
            <p>جدّد تصريحًا ينتهي خلال الأيام التسعين القادمة.</p>
          </li>
          <li>
            <a hwLink href="/services/residence-transfer">نقل تصريح الإقامة</a>
            <p>انقل تصريحًا ساريًا إلى كفيل جديد.</p>
          </li>
        </ol>
        <hw-pagination
          label="صفحات النتائج"
          [totalPages]="3"
          [page]="1"
          previousLabel="الصفحة السابقة"
          nextLabel="الصفحة التالية"
          [getPageLabel]="pageLabel"
          [getGapLabel]="gapLabel"
          jumpLabel="رقم الصفحة"
          goLabel="انتقال"
        />
      </hw-stack>
    </hw-container>
  </main>`,
})
export class LinksExample {
  pageLabel = (page: number) => `الصفحة ${page}`;
  gapLabel = (start: number, end: number) => `الصفحات من ${start} إلى ${end}`;
}
```

### النتائج بطاقات خدمات

عندما تكون كل نتيجة خدمة، تعرض بطاقة الخدمة تصنيفها وعنوانها وملخصًا لها ومعلوماتها، ويحمل رابط إجرائها اسمًا يذكر الخدمة. وتقع البطاقات في شبكة ذات عمود واحد في منفذ العرض الضيّق، وثلاثة أعمدة ابتداءً من الدرجة المتوسطة.

```html live example=cards static differences=container-vue-layout-attributes,stack-vue-layout-attributes,search-field-adapter-markup,grid-vue-layout-attributes,service-card-angular-variant-icon frame
<main>
  <div class="hw-container">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>نتائج البحث</h1></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field">
        <label class="hw-label" for="cards-query">البحث في الخدمات</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="cards-query" name="query" type="search" value="ترخيص القيادة" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
          </div>
          <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="بحث"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
        </div>
      </div>
      <h2>النتائج</h2>
      <p role="status">3 نتائج للبحث عن ترخيص القيادة</p>
      <div class="hw-grid" style="--hw-layout-columns: 1; --hw-layout-columns-md: 3">
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">التراخيص</span><h3>إصدار ترخيص قيادة</h3></div></header>
          <div class="hw-card-body">
            <p>اطلب أول ترخيص قيادة بعد اجتيازك اختبار القيادة.</p>
            <dl class="hw-description-list"><div><dt>المدة</dt><dd>يومان</dd></div><div><dt>الرسوم</dt><dd>مستحقة</dd></div></dl>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/licence-issue">طلب ترخيص قيادة</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">التراخيص</span><h3>تجديد ترخيص القيادة</h3></div></header>
          <div class="hw-card-body">
            <p>جدّد ترخيصًا انتهى أو ينتهي خلال 30 يومًا.</p>
            <dl class="hw-description-list"><div><dt>المدة</dt><dd>يوم واحد</dd></div><div><dt>الرسوم</dt><dd>مستحقة</dd></div></dl>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/licence-renewal">تجديد ترخيص القيادة</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">التراخيص</span><h3>بدل ترخيص القيادة</h3></div></header>
          <div class="hw-card-body">
            <p>اطلب بدلًا لترخيص مفقود أو تالف.</p>
            <dl class="hw-description-list"><div><dt>المدة</dt><dd>3 أيام</dd></div><div><dt>الرسوم</dt><dd>مستحقة</dd></div></dl>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/licence-replacement">بدل ترخيص القيادة</a></footer>
        </article>
      </div>
    </div>
  </div>
</main>
```

```tsx live example=cards
<main>
  <Container>
    <Stack>
      <PageHeader title="نتائج البحث" />
      <SearchField label="البحث في الخدمات" name="query" defaultValue="ترخيص القيادة" clearLabel="مسح البحث" showSearchButton searchLabel="بحث" />
      <h2>النتائج</h2>
      <p role="status">3 نتائج للبحث عن ترخيص القيادة</p>
      <Grid columns={{ base: 1, md: 3 }}>
        <ServiceCard
          title="إصدار ترخيص قيادة"
          category="التراخيص"
          description="اطلب أول ترخيص قيادة بعد اجتيازك اختبار القيادة."
          metadata={[
            { term: 'المدة', description: 'يومان' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]}
          href="/services/licence-issue"
          actionLabel="طلب ترخيص قيادة"
        />
        <ServiceCard
          title="تجديد ترخيص القيادة"
          category="التراخيص"
          description="جدّد ترخيصًا انتهى أو ينتهي خلال 30 يومًا."
          metadata={[
            { term: 'المدة', description: 'يوم واحد' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]}
          href="/services/licence-renewal"
          actionLabel="تجديد ترخيص القيادة"
        />
        <ServiceCard
          title="بدل ترخيص القيادة"
          category="التراخيص"
          description="اطلب بدلًا لترخيص مفقود أو تالف."
          metadata={[
            { term: 'المدة', description: '3 أيام' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]}
          href="/services/licence-replacement"
          actionLabel="بدل ترخيص القيادة"
        />
      </Grid>
    </Stack>
  </Container>
</main>
```

```vue live example=cards
<main>
  <Container>
    <Stack>
      <PageHeader title="نتائج البحث" />
      <SearchField label="البحث في الخدمات" name="query" default-value="ترخيص القيادة" clear-label="مسح البحث" show-search-button search-label="بحث" />
      <h2>النتائج</h2>
      <p role="status">3 نتائج للبحث عن ترخيص القيادة</p>
      <Grid :columns="{ base: 1, md: 3 }">
        <ServiceCard
          title="إصدار ترخيص قيادة"
          category="التراخيص"
          description="اطلب أول ترخيص قيادة بعد اجتيازك اختبار القيادة."
          :metadata="[
            { term: 'المدة', description: 'يومان' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]"
          href="/services/licence-issue"
          action-label="طلب ترخيص قيادة"
        />
        <ServiceCard
          title="تجديد ترخيص القيادة"
          category="التراخيص"
          description="جدّد ترخيصًا انتهى أو ينتهي خلال 30 يومًا."
          :metadata="[
            { term: 'المدة', description: 'يوم واحد' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]"
          href="/services/licence-renewal"
          action-label="تجديد ترخيص القيادة"
        />
        <ServiceCard
          title="بدل ترخيص القيادة"
          category="التراخيص"
          description="اطلب بدلًا لترخيص مفقود أو تالف."
          :metadata="[
            { term: 'المدة', description: '3 أيام' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]"
          href="/services/licence-replacement"
          action-label="بدل ترخيص القيادة"
        />
      </Grid>
    </Stack>
  </Container>
</main>
```

```ts live example=cards framework=angular
template: `<main>
  <hw-container>
    <hw-stack>
      <hw-page-header title="نتائج البحث" />
      <hw-search-field label="البحث في الخدمات" name="query" value="ترخيص القيادة" clearLabel="مسح البحث" [showSearchButton]="true" searchLabel="بحث" />
      <h2>النتائج</h2>
      <p role="status">3 نتائج للبحث عن ترخيص القيادة</p>
      <hw-grid [columns]="{ base: 1, md: 3 }">
        <hw-service-card
          title="إصدار ترخيص قيادة"
          category="التراخيص"
          description="اطلب أول ترخيص قيادة بعد اجتيازك اختبار القيادة."
          [metadata]="[
            { term: 'المدة', description: 'يومان' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]"
          href="/services/licence-issue"
          actionLabel="طلب ترخيص قيادة"
        />
        <hw-service-card
          title="تجديد ترخيص القيادة"
          category="التراخيص"
          description="جدّد ترخيصًا انتهى أو ينتهي خلال 30 يومًا."
          [metadata]="[
            { term: 'المدة', description: 'يوم واحد' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]"
          href="/services/licence-renewal"
          actionLabel="تجديد ترخيص القيادة"
        />
        <hw-service-card
          title="بدل ترخيص القيادة"
          category="التراخيص"
          description="اطلب بدلًا لترخيص مفقود أو تالف."
          [metadata]="[
            { term: 'المدة', description: '3 أيام' },
            { term: 'الرسوم', description: 'مستحقة' },
          ]"
          href="/services/licence-replacement"
          actionLabel="بدل ترخيص القيادة"
        />
      </hw-grid>
    </hw-stack>
  </hw-container>
</main>`
```

### لا توجد نتائج

الحالة الفارغة حالة مستقلة من حالات الصفحة. ويحتفظ حقل البحث بعبارة البحث التي لم تُعِد شيئًا، ليتمكّن القارئ من تصحيحها، ويذكر العدد أنه لا توجد نتائج، وتذكر الحالة الفارغة الخطوة التالية. ولا تُعرض القائمة ولا ترقيم الصفحات. ويُعرض إجراء الحالة الفارغة دون معالج؛ فيعالجه التطبيق أو يستبدل به رابطًا إلى قائمة الخدمات.

```html live example=empty static differences=container-vue-layout-attributes,stack-vue-layout-attributes,search-field-adapter-markup frame
<main>
  <div class="hw-container">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>نتائج البحث</h1></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field">
        <label class="hw-label" for="empty-query">البحث في الخدمات</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="empty-query" name="query" type="search" value="تصرح الإقمة" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
          </div>
          <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="بحث"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
        </div>
      </div>
      <h2>النتائج</h2>
      <p role="status">0 نتيجة للبحث عن تصرح الإقمة</p>
      <div class="hw-empty">
        <span class="hw-empty-icon" aria-hidden="true"><span class="hw-icon" data-icon="search-01"></span></span>
        <h3>لم يُعثر على خدمات</h3>
        <p>لا تطابق أي خدمة الكلمات التي أدخلتها. تحقّق من الإملاء أو ابحث بكلمات أقل.</p>
        <button class="hw-button" type="button" data-variant="secondary" data-size="md">عرض جميع الخدمات</button>
      </div>
    </div>
  </div>
</main>
```

```tsx live example=empty
<main>
  <Container>
    <Stack>
      <PageHeader title="نتائج البحث" />
      <SearchField label="البحث في الخدمات" name="query" defaultValue="تصرح الإقمة" clearLabel="مسح البحث" showSearchButton searchLabel="بحث" />
      <h2>النتائج</h2>
      <p role="status">0 نتيجة للبحث عن تصرح الإقمة</p>
      <EmptyState
        title="لم يُعثر على خدمات"
        description="لا تطابق أي خدمة الكلمات التي أدخلتها. تحقّق من الإملاء أو ابحث بكلمات أقل."
        icon={<span className="hw-icon" data-icon="search-01" />}
        action={<Button variant="secondary">عرض جميع الخدمات</Button>}
      />
    </Stack>
  </Container>
</main>
```

```vue live example=empty
<main>
  <Container>
    <Stack>
      <PageHeader title="نتائج البحث" />
      <SearchField label="البحث في الخدمات" name="query" default-value="تصرح الإقمة" clear-label="مسح البحث" show-search-button search-label="بحث" />
      <h2>النتائج</h2>
      <p role="status">0 نتيجة للبحث عن تصرح الإقمة</p>
      <EmptyState
        title="لم يُعثر على خدمات"
        description="لا تطابق أي خدمة الكلمات التي أدخلتها. تحقّق من الإملاء أو ابحث بكلمات أقل."
      >
        <template #icon><span class="hw-icon" data-icon="search-01"></span></template>
        <template #action><Button variant="secondary">عرض جميع الخدمات</Button></template>
      </EmptyState>
    </Stack>
  </Container>
</main>
```

```ts live example=empty framework=angular
template: `<main>
  <hw-container>
    <hw-stack>
      <hw-page-header title="نتائج البحث" />
      <hw-search-field label="البحث في الخدمات" name="query" value="تصرح الإقمة" clearLabel="مسح البحث" [showSearchButton]="true" searchLabel="بحث" />
      <h2>النتائج</h2>
      <p role="status">0 نتيجة للبحث عن تصرح الإقمة</p>
      <hw-empty-state
        title="لم يُعثر على خدمات"
        description="لا تطابق أي خدمة الكلمات التي أدخلتها. تحقّق من الإملاء أو ابحث بكلمات أقل."
      >
        <span hwEmptyIcon class="hw-icon" data-icon="search-01"></span>
        <button hwButton hwEmptyAction variant="secondary">عرض جميع الخدمات</button>
      </hw-empty-state>
    </hw-stack>
  </hw-container>
</main>`
```

## المكوّنات المستخدمة

يتألف القالب من المكوّنات الآتية، ولكل منها صفحته.

- [PageHeader](../components/page-header.md) يسمّي الصفحة بعنصر `h1`.
- [SearchField](../components/search-field.md) يحتفظ بعبارة البحث ويُبلغ عنها؛ ويُجري التطبيق البحث.
- [Link](../components/link.md) هو النتيجة في قائمة النتائج.
- [ServiceCard](../components/service-card.md) هو النتيجة عندما تكون كل نتيجة خدمة.
- [EmptyState](../components/empty-state.md) هو حالة البحث الذي لا نتائج له.
- [Pagination](../components/pagination.md) يُبلغ عن الصفحة التي يحدّدها القارئ؛ ويعرض التطبيق تلك الصفحة من النتائج.
- [Container](../components/container.md) يحدّ عرض محتوى الصفحة.
- [Stack](../components/stack.md) يضع أجزاء الصفحة في عمود واحد.
- [Grid](../components/grid.md) يضع بطاقات الخدمات في أعمدة.
- [Button](../components/button.md) هو إجراء الحالة الفارغة.

لا يتضمّن الإصدار 0.3.0 مكوّنًا لقائمة النتائج، ولا لعدد النتائج، ولا لعوامل التصفية وترتيب الفرز في قائمة نتائج. ويكتب القالب القائمة المرتّبة والفقرة بالعناصر الأصلية `ol` و`li` و`p`، ولا يعرض عوامل تصفية ولا عنصر تحكم في الفرز. وتعرض حالة الروابط ترقيم الصفحات؛ أما حالة البطاقات ففيها صفحة واحدة من ثلاث نتائج ولا تعرضه. ولا تتضمّن الحزم مكوّنًا يُعلن تغيّر عدد النتائج.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر القالب؛ وأدلة كل مكوّن في صفحته.

### المصادر

- تصف [ملاحظات البحث](../nic-search.md) حقل البحث وإجراء المسح فيه واقتراحاته، وتسجّل أن البحث وأحداث النموذج تبقى من مسؤولية التطبيق.
- تصف [ملاحظات ترقيم الصفحات](../nic-pagination.md) عناصر التحكم في الصفحات، وتسجّل أن عرض البيانات يبقى من مسؤولية التطبيق.
- تربط [ملاحظات التغطية](../coverage.md) نوع عنصر الإدخال الخاص بالبحث بالمكوّن SearchField. وتسجّل [متابعة التدقيق](../dga-audit-followup.md) قالب صفحة البحث في الملفات المزوَّدة. ويعرض ذلك القالب عبارة البحث، والعدد، والنتائج في بطاقات خدمات أو روابط بسيطة، وترقيم الصفحات، ويُغفل عوامل التصفية وترتيب الفرز وحالتَي التحميل والخطأ؛ وتُدرج المتابعة الحالة الفارغة متطلّبًا، وتعرضها هذه الصفحة في حالة مستقلة.
