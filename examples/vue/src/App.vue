<script setup lang="ts">
import { computed, h, ref, watchEffect } from 'vue';
import { formatCalendarDate, formatDate, formatNumber, isCalendarDateSupported } from '@nasaq/core';
import { Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Combobox, Dialog, Divider, EmptyState, Field, FileUpload, Pagination, Progress, Radio, Select, Skeleton, Spinner, Stepper, Switch, Table, Tabs, Textarea, TextField, Tooltip, DatePicker, Grid, Stack, Section } from '@nasaq/vue';
import type { CalendarSystem } from '@nasaq/core';
import type { TableColumn } from '@nasaq/vue';
import brand from '../../../brand/assets/nasaq-lockup-bilingual.svg';
import brandReverse from '../../../brand/assets/nasaq-lockup-bilingual-reverse.svg';
import symbol from '../../../brand/assets/nasaq-symbol.svg';
import symbolReverse from '../../../brand/assets/nasaq-symbol-reverse.svg';

const locale = ref('ar'); const direction = ref('rtl'); const theme = ref('dga'); const mode = ref('light'); const density = ref('comfortable');
const t = (ar: string, en: string) => locale.value === 'ar' ? ar : en;
const number = (value: number) => formatNumber(value, { locale: locale.value === 'ar' ? 'ar-SA' : 'en-SA' });
watchEffect(() => { document.documentElement.lang = locale.value; document.documentElement.dir = direction.value; Object.assign(document.documentElement.dataset, { nqTheme: theme.value, nqMode: mode.value, nqDensity: density.value }); document.title = t('نسق · الخدمات', 'Nasaq · Services'); });
const tab = ref('apply'); const applicant = ref(''); const email = ref(''); const city = ref(''); const service = ref('personal'); const company = ref(''); const details = ref(''); const consent = ref(false); const notifications = ref(true); const contact = ref('email'); const files = ref<File[]>([]);
const reviewOpen = ref(false); const detailsOpen = ref(false); const success = ref(false); const selectedRequest = ref<Record<string, unknown>>();
const appointmentDate = ref('2024-03-11'); const appointmentCalendar = ref<CalendarSystem>('gregory'); const appointmentChecked = ref(false);
const appointmentLabel = (calendar: CalendarSystem) => isCalendarDateSupported(appointmentDate.value, calendar) ? formatCalendarDate(appointmentDate.value, { locale: locale.value === 'ar' ? 'ar-SA' : 'en-SA', calendar, dateStyle: 'full' }) : t('خارج نطاق التقويم المدعوم', 'Outside the supported calendar range');
const search = ref(''); const status = ref('all'); const page = ref(1);
const requests = ref<Record<string, unknown>[]>([
  { id: 'NQ-1042', applicant: 'نورة أحمد', service: 'personal', status: 'review', date: '2026-10-27T09:00:00+03:00' },
  { id: 'NQ-1038', applicant: 'سعد عبدالله', service: 'business', status: 'complete', date: '2026-10-25T10:00:00+03:00' },
  { id: 'NQ-1031', applicant: 'ريم خالد', service: 'personal', status: 'complete', date: '2026-10-22T09:00:00+03:00' },
  { id: 'NQ-1029', applicant: 'فهد علي', service: 'business', status: 'review', date: '2026-10-20T09:00:00+03:00' },
]);
const cities = computed(() => [{ value: 'riyadh', label: t('الرياض', 'Riyadh') }, { value: 'jeddah', label: t('جدة', 'Jeddah') }, { value: 'dammam', label: t('الدمام', 'Dammam') }, { value: 'abha', label: t('أبها', 'Abha'), disabled: true }]);
const services = computed(() => [{ value: 'personal', label: t('خدمة أفراد', 'Individual service') }, { value: 'business', label: t('خدمة منشآت', 'Business service') }]);
const statusLabel = (value: unknown) => value === 'complete' ? t('مكتمل', 'Completed') : t('قيد المراجعة', 'In review');
const filtered = computed(() => requests.value.filter(row => (status.value === 'all' || row.status === status.value) && `${row.id} ${row.applicant}`.toLowerCase().includes(search.value.toLowerCase())));
const visible = computed(() => filtered.value.slice((page.value - 1) * 3, page.value * 3));
watchEffect(() => { void search.value; void status.value; page.value = 1; });
const columns = computed<TableColumn[]>(() => [
  { key: 'id', header: t('رقم الطلب', 'Request'), rowHeader: true }, { key: 'applicant', header: t('مقدم الطلب', 'Applicant') },
  { key: 'service', header: t('الخدمة', 'Service'), cell: row => services.value.find(item => item.value === row.service)?.label },
  { key: 'date', header: t('تاريخ التقديم', 'Submitted'), cell: row => formatDate(String(row.date), { locale: locale.value === 'ar' ? 'ar-SA' : 'en-SA', dateStyle: 'medium' }) },
  { key: 'status', header: t('الحالة', 'Status'), cell: row => h(Badge, { tone: row.status === 'complete' ? 'success' : 'warning' }, () => statusLabel(row.status)) },
  { key: 'action', header: t('التفاصيل', 'Details'), cell: row => h(Button, { variant: 'ghost', size: 'sm', 'aria-label': `${t('عرض الطلب', 'View request')} ${row.id}`, onClick: () => { selectedRequest.value = row; detailsOpen.value = true; } }, () => t('عرض', 'View')) },
]);
const completion = computed(() => Math.round([applicant.value, email.value, city.value, details.value, consent.value].filter(Boolean).length / 5 * 100));
const serviceLabel = computed(() => services.value.find(item => item.value === service.value)?.label);
const cityLabel = computed(() => cities.value.find(item => item.value === city.value)?.label);
function review() { success.value = false; reviewOpen.value = true; }
function submit() {
  requests.value.unshift({ id: `NQ-${1043 + requests.value.length - 4}`, applicant: applicant.value, service: service.value, status: 'review', date: new Date().toISOString() });
  reviewOpen.value = false; success.value = true; tab.value = 'requests'; page.value = 1;
}
</script>

<template>
  <a class="skip-link" href="#main">{{ t('انتقل إلى المحتوى', 'Skip to content') }}</a>
  <header class="masthead">
    <div class="nq-container nq-service-container masthead-inner">
      <a class="brand" href="#main"><img :src="mode === 'dark' ? brandReverse : brand" alt="نسق · Nasaq" /></a>
      <div class="nq-cluster"><Badge tone="info">Vue 3</Badge><Tooltip :content="t('نموذج تفاعلي للخدمات الرقمية', 'An interactive digital services example')"><Button variant="ghost">{{ t('عن التجربة', 'About this example') }}</Button></Tooltip><Avatar :name="t('زائر نسق', 'Nasaq guest')" :initials="t('ن', 'N')" /></div>
    </div>
  </header>
  <main id="main" class="nq-container nq-service-container page-main">
    <div class="settings">
      <Select :label="t('اللغة', 'Language')" v-model="locale" :options="[{value:'ar',label:'العربية'},{value:'en',label:'English'}]" />
      <Select :label="t('الاتجاه', 'Direction')" v-model="direction" :options="[{value:'rtl',label:'RTL'},{value:'ltr',label:'LTR'}]" />
      <Select :label="t('السمة', 'Theme')" v-model="theme" :options="[{value:'dga',label:t('مستوحاة من الهيئة','DGA informed')},{value:'nasaq',label:t('نسق','Nasaq')},{value:'custom',label:t('مخصصة','Custom')}]" />
      <Select :label="t('المظهر', 'Mode')" v-model="mode" :options="[{value:'light',label:t('فاتح','Light')},{value:'dark',label:t('داكن','Dark')}]" />
      <Select :label="t('الكثافة', 'Density')" v-model="density" :options="[{value:'comfortable',label:t('مريحة','Comfortable')},{value:'compact',label:t('مكثفة','Compact')}]" />
    </div>
    <Breadcrumb :label="t('مسار التصفح', 'Breadcrumb')" :items="[{label:t('الرئيسية','Home'),href:'#main'},{label:t('الخدمات الرقمية','Digital services')} ]" />
    <section class="hero" aria-labelledby="page-title">
      <div><span class="eyebrow">{{ t('خطوات واضحة. تجربة مترابطة.', 'Clear steps. Connected experiences.') }}</span><h1 id="page-title">{{ t('خدماتك، بنسق أوضح.', 'Your services, in clear rhythm.') }}</h1><p>{{ t('قدّم طلبك، راجع تفاصيله، وتابع حالته في مساحة واحدة.', 'Start your application, review its details, and follow its progress in one place.') }}</p><div class="nq-cluster"><Badge tone="success">{{ t('متاح على مدار الساعة', 'Available around the clock') }}</Badge><span class="nq-hint">{{ t('وقت الإكمال: ٥ دقائق', 'Completion time: 5 minutes') }}</span></div></div>
      <div class="hero-art" aria-hidden="true"><img :src="mode === 'dark' ? symbolReverse : symbol" alt="" /><i></i><b></b></div>
    </section>
    <Alert v-if="success" tone="success" :title="t('تم إرسال طلبك بنجاح', 'Your request has been submitted')">{{ t('يمكنك متابعة الحالة من قائمة الطلبات أدناه.', 'Follow its progress in the request list below.') }}</Alert>
    <Tabs v-model="tab" :label="t('مساحة الخدمات', 'Service workspace')" :items="[{value:'apply',label:t('طلب جديد','New application')},{value:'requests',label:t('طلباتي','My requests')},{value:'components',label:t('المكونات','Components')}]">
      <template #apply>
        <div class="nq-form-layout">
            <div class="nq-stepper-responsive">
              <Stepper :label="t('مراحل الطلب', 'Application steps')" :current="reviewOpen ? 'review' : 'details'" :items="[{value:'details',label:t('التفاصيل','Details')},{value:'review',label:t('المراجعة','Review')},{value:'send',label:t('الإرسال','Submit')}]" />
              <div class="nq-stepper-mobile" role="group" :aria-label="t(`الخطوة ${number(reviewOpen ? 2 : 1)} من ${number(3)}`, `Step ${reviewOpen ? 2 : 1} of 3`)">
                <span class="nq-stepper-ring" :style="{'--nq-step-progress': reviewOpen ? '66.667%' : '33.333%'}" aria-hidden="true">{{ number(reviewOpen ? 2 : 1) }} / {{ number(3) }}</span>
                <div class="nq-stepper-summary"><strong>{{ reviewOpen ? t('المراجعة', 'Review') : t('التفاصيل', 'Details') }}</strong><p>{{ t('التالي: ', 'Next: ') }}{{ reviewOpen ? t('الإرسال', 'Submit') : t('المراجعة', 'Review') }}</p></div>
              </div>
            </div>
          <Card class="nq-form-main">
            <template #header><h2>{{ t('ابدأ طلبك', 'Start your application') }}</h2><p class="nq-hint">{{ t('الحقول المعلّمة بنجمة مطلوبة.', 'Fields marked with an asterisk are required.') }}</p></template>
            <form class="nq-stack" @submit.prevent="review">
              <div class="nq-form-grid"><TextField :label="t('الاسم الكامل', 'Full name')" name="applicant" v-model="applicant" autocomplete="name" required :placeholder="t('أدخل اسمك الكامل', 'Enter your full name')" /><TextField :label="t('البريد الإلكتروني', 'Email address')" name="email" type="email" dir="ltr" v-model="email" autocomplete="email" required placeholder="name@example.com" /></div>
              <div class="nq-form-grid"><Select :label="t('نوع الخدمة', 'Service type')" name="service" v-model="service" :options="services" required /><Combobox :label="t('المدينة', 'City')" name="city" v-model="city" :options="cities" required :hint="t('ابحث واختر مدينة من القائمة.', 'Search and choose a city from the list.')" :empty-message="t('لا توجد نتائج', 'No results found')" :required-message="t('اختر مدينة من القائمة.', 'Choose a city from the list.')" :results-message="count => t(`${number(count)} نتائج متاحة`, `${count} results available`)" /></div>
              <TextField v-if="service === 'business'" :label="t('اسم المنشأة', 'Business name')" name="company" v-model="company" autocomplete="organization" required />
              <Textarea :label="t('تفاصيل الطلب', 'Application details')" name="details" v-model="details" :rows="4" required :hint="t('صف ما تحتاجه لمساعدتنا في توجيه طلبك.', 'Tell us what you need so we can direct your request.')" />
              <FileUpload :label="t('المرفقات الداعمة', 'Supporting documents')" name="attachment" accept=".pdf,.png,.jpg,.jpeg" multiple :hint="t('ملفات PDF أو صور. المرفقات اختيارية.', 'PDF files or images. Attachments are optional.')" @update:files="files = $event" /><span v-if="files.length" class="nq-hint">{{ files.map(file => file.name).join('، ') }}</span>
              <fieldset class="contact-options"><legend class="nq-label">{{ t('وسيلة التواصل المفضلة', 'Preferred contact method') }}</legend><div class="nq-cluster"><Radio name="contact" value="email" v-model="contact" :label="t('البريد الإلكتروني','Email')" /><Radio name="contact" value="phone" v-model="contact" :label="t('الهاتف','Phone')" /></div></fieldset>
              <TextField v-if="contact === 'phone'" :label="t('رقم الجوال', 'Mobile number')" name="phone" type="tel" autocomplete="tel" dir="ltr" required placeholder="+966 5X XXX XXXX" />
              <Switch v-model="notifications" :label="t('أرسل لي تحديثات حالة الطلب', 'Send me request status updates')" />
              <Checkbox v-model="consent" name="consent" required :label="t('أؤكد صحة البيانات المدخلة', 'I confirm the information is accurate')" />
              <div class="form-actions"><Button type="submit">{{ t('مراجعة الطلب', 'Review application') }} <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 19 19 5M5 5h14v14" /></svg></Button><Button type="reset" variant="ghost">{{ t('مسح الحقول', 'Clear fields') }}</Button></div>
            </form>
          </Card>
          <div class="nq-service-aside nq-stack">
              <Card><template #header><h2>{{ t('قبل أن تبدأ', 'Before you begin') }}</h2></template><ul class="guidance"><li>{{ t('جهّز بيانات التواصل الخاصة بك.', 'Have your contact information ready.') }}</li><li>{{ t('اختر الخدمة والمدينة المناسبة.', 'Choose the relevant service and city.') }}</li><li>{{ t('راجع التفاصيل قبل الإرسال.', 'Review your details before submitting.') }}</li></ul><Divider /><div class="progress-label"><span>{{ t('اكتمال البيانات', 'Application progress') }}</span><strong>{{ number(completion) }}%</strong></div><Progress :label="t('اكتمال البيانات', 'Application progress')" :value="completion" /></Card>
              <Alert tone="info" :title="t('تجربة توضيحية', 'Demonstration')">{{ t('تبقى البيانات في هذه الصفحة فقط وتُمسح عند تحديثها.', 'Data stays on this page and clears when you reload.') }}</Alert>
              <Accordion :items="[{value:'time',title:t('متى يصلني الرد؟','When will I hear back?'),content:t('هذا نموذج توضيحي. لا تُرسل الطلبات إلى جهة خارجية.','This is a demonstration. Requests are not sent to an external service.')},{value:'edit',title:t('هل يمكن تعديل الطلب؟','Can I edit my application?'),content:t('يمكنك العودة من شاشة المراجعة لتعديل البيانات قبل الإرسال.','Return from the review dialog to edit your information before submitting.')}]" />
            </div>
        </div>
      </template>
      <template #requests>
        <Card><template #header><div class="section-heading"><div><h2>{{ t('طلباتك في مكان واحد', 'Your requests, together') }}</h2><p class="nq-hint">{{ t('تابع آخر التحديثات وتفاصيل كل طلب.', 'Track the latest updates and every request detail.') }}</p></div><Button @click="tab = 'apply'">{{ t('طلب جديد', 'New application') }}</Button></div></template>
          <div class="request-filters"><TextField v-model="search" type="search" :label="t('البحث في الطلبات', 'Search requests')" :placeholder="t('رقم الطلب أو اسم مقدمه', 'Request number or applicant')" /><Select v-model="status" :label="t('الحالة', 'Status')" :options="[{value:'all',label:t('كل الحالات','All statuses')},{value:'review',label:t('قيد المراجعة','In review')},{value:'complete',label:t('مكتمل','Completed')}]" /></div>
          <Table v-if="visible.length" :caption="t('قائمة الطلبات', 'Request list')" :rows="visible" :columns="columns" :row-key="row => String(row.id)" />
          <EmptyState v-else :title="t('لا توجد طلبات مطابقة', 'No matching requests')" :description="t('جرّب عبارة بحث أخرى أو غيّر الحالة.', 'Try another search term or change the status filter.')"><template #action><Button variant="secondary" @click="search = ''; status = 'all'">{{ t('مسح التصفية', 'Clear filters') }}</Button></template></EmptyState>
          <Pagination v-if="filtered.length" v-model="page" :total-pages="Math.ceil(filtered.length / 3)" :label="t('صفحات الطلبات','Request pages')" :previous-label="t('السابق','Previous')" :next-label="t('التالي','Next')" :page-label="value => t(`صفحة ${number(value)}`, `Page ${value}`)" :format-page="number" />
        </Card>
      </template>
      <template #components>
        <div class="catalog-grid">
          <Card><template #header><h2>{{ t('الحالات والإشعارات', 'Status and feedback') }}</h2></template><div class="nq-stack"><div class="nq-cluster"><Badge tone="success">{{ t('مكتمل','Complete') }}</Badge><Badge tone="warning">{{ t('قيد المراجعة','In review') }}</Badge><Badge tone="danger">{{ t('يحتاج تعديل','Needs attention') }}</Badge></div><Alert tone="warning" :title="t('تذكير','Reminder')">{{ t('راجع البيانات قبل تأكيد الإرسال.','Review your information before confirming.') }}</Alert><Progress :label="t('تقدم المعالجة','Processing progress')" :value="65" /><div class="nq-cluster"><Spinner :label="t('جار التحميل','Loading')" /><span>{{ t('جار تجهيز التفاصيل…','Preparing your details…') }}</span></div><Skeleton style="height: 1rem; width: 80%" /><Skeleton style="height: 1rem; width: 55%" /></div></Card>
          <Card><template #header><h2>{{ t('تكوين الحقول', 'Composing fields') }}</h2></template><div class="nq-stack"><Field :label="t('مرجع الطلب','Reference')" :hint="t('حقل داخل مكوّن Field مشترك.','An input inside a shared Field component.')"><TextField default-value="NQ-1042" readonly /></Field><TextField :label="t('حقل مع خطأ','Field with an error')" :error="t('أدخل قيمة صالحة.','Enter a valid value.')" /><div class="nq-cluster"><Button>{{ t('أساسي','Primary') }}</Button><Button variant="secondary">{{ t('ثانوي','Secondary') }}</Button><Button variant="danger">{{ t('حذف','Delete') }}</Button><Button disabled>{{ t('غير متاح','Unavailable') }}</Button></div><Divider /><EmptyState :title="t('مساحة لبداية جديدة','Room for a fresh start')" :description="t('ستظهر العناصر الجديدة هنا.','New items will appear here.')" /></div></Card>
        </div>
      </template>
    </Tabs>
    <Section data-testid="calendar-showcase" aria-labelledby="calendar-showcase-title" :padding="{base: 4, md: 6}">
      <Stack :gap="5"><header><h2 id="calendar-showcase-title">{{ t('موعدك، بالتقويم الذي تفضله', 'Your appointment, in either calendar') }}</h2><p class="nq-hint">{{ t('بدّل بين الميلادي وأم القرى مع الاحتفاظ باليوم نفسه.', 'Switch between Gregorian and Umm al-Qura while keeping the same day.') }}</p></header>
        <Grid :columns="{base: 1, md: 2}" :gap="6">
          <Card><form @submit.prevent="appointmentChecked = true"><Stack :gap="4">
            <DatePicker v-model="appointmentDate" v-model:calendar="appointmentCalendar" @update:model-value="appointmentChecked = false" @update:calendar="appointmentChecked = false" name="calendar-date" required :label="t('تاريخ الموعد', 'Appointment date')" :locale="locale === 'ar' ? 'ar-SA' : 'en-SA'" :calendar-label="t('اختر تاريخ الموعد', 'Choose appointment date')" :calendar-system-label="t('نوع التقويم', 'Calendar system')" :gregory-label="t('ميلادي', 'Gregorian')" :hijri-label="t('هجري — أم القرى', 'Hijri — Umm al-Qura')" :open-label="t('فتح التقويم', 'Open calendar')" :close-label="t('إغلاق التقويم', 'Close calendar')" :previous-label="t('الشهر السابق', 'Previous month')" :next-label="t('الشهر التالي', 'Next month')" :invalid-message="t('اختر تاريخاً صالحاً للتقويم المختار.', 'Choose a date valid for the selected calendar.')" :unsupported-message="t('التاريخ خارج نطاق أم القرى المدعوم (١٩٢٤-٠٨-٠١ إلى ٢٠٧٧-١١-١٦).', 'The date is outside the supported Umm al-Qura range (1924-08-01 to 2077-11-16).')" />
            <Button type="submit">{{ t('التحقق من التاريخ', 'Check date') }}</Button><p role="status" data-testid="date-check">{{ appointmentChecked ? t('التاريخ صالح للتقويم المختار.', 'The date is valid for the selected calendar.') : '' }}</p>
          </Stack></form></Card>
          <Card><Stack :gap="4"><h3>{{ t('اليوم نفسه، بصيغتين', 'The same day, two calendars') }}</h3><dl class="nq-description-list"><div><dt>ISO</dt><dd><output data-testid="date-iso" dir="ltr">{{ appointmentDate }}</output></dd></div><div><dt>{{ t('ميلادي', 'Gregorian') }}</dt><dd><output data-testid="date-gregorian">{{ appointmentLabel('gregory') }}</output></dd></div><div><dt>{{ t('أم القرى', 'Umm al-Qura') }}</dt><dd><output data-testid="date-hijri">{{ appointmentLabel('islamic-umalqura') }}</output></dd></div></dl></Stack></Card>
        </Grid>
      </Stack>
    </Section>
    <Dialog v-model:open="reviewOpen" :title="t('راجع طلبك', 'Review your application')" :description="t('تأكد من صحة التفاصيل قبل الإرسال.', 'Make sure your details are correct before submitting.')" :close-label="t('إغلاق','Close')">
      <dl class="review-list"><dt>{{ t('الاسم','Name') }}</dt><dd>{{ applicant }}</dd><dt>{{ t('البريد الإلكتروني','Email') }}</dt><dd dir="ltr">{{ email }}</dd><dt>{{ t('الخدمة','Service') }}</dt><dd>{{ serviceLabel }}</dd><dt>{{ t('المدينة','City') }}</dt><dd>{{ cityLabel }}</dd><template v-if="service === 'business'"><dt>{{ t('المنشأة','Business') }}</dt><dd>{{ company }}</dd></template><dt>{{ t('التفاصيل','Details') }}</dt><dd>{{ details }}</dd></dl>
      <template #footer="{close}"><Button variant="secondary" @click="close">{{ t('العودة للتعديل','Back to edit') }}</Button><Button @click="submit">{{ t('تأكيد الإرسال','Confirm submission') }}</Button></template>
    </Dialog>
    <Dialog v-model:open="detailsOpen" :title="`${t('الطلب','Request')} ${selectedRequest?.id ?? ''}`" :close-label="t('إغلاق','Close')"><div class="nq-stack"><Badge :tone="selectedRequest?.status === 'complete' ? 'success' : 'warning'">{{ statusLabel(selectedRequest?.status) }}</Badge><p>{{ selectedRequest?.applicant }}</p><p>{{ t('تم استلام الطلب وهو متاح للمتابعة من هذه القائمة.','The request has been received and is available to track from this list.') }}</p></div><template #footer="{close}"><Button @click="close">{{ t('تم','Done') }}</Button></template></Dialog>
    <footer class="page-footer"><span>نسق · Nasaq</span><span>{{ t('تصميم مستقل مستلهم من سياق الخدمات السعودية.', 'Independent design informed by Saudi digital services.') }}</span><a href="https://mohamedembarak.github.io/nasaq/">{{ t('استكشف النظام', 'Explore the system') }}</a></footer>
  </main>
</template>
