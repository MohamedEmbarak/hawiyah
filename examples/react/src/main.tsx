import { StrictMode, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Combobox,
  Dialog, Divider, EmptyState, FileUpload, Pagination, Progress, Radio, Select,
  Stepper, Switch, Table, Tabs, Textarea, TextField, Tooltip, DatePicker, Grid, Stack, Section,
} from '@nasaq/react';
import { formatCalendarDate, formatDate, formatNumber, isCalendarDateSupported } from '@nasaq/core';
import type { CalendarSystem } from '@nasaq/core';
import '@nasaq/styles/reset.css';
import '@nasaq/styles/styles.css';
import '../../../brand/fonts.css';
import symbol from '../../../brand/assets/nasaq-symbol.svg';
import reverseSymbol from '../../../brand/assets/nasaq-symbol-reverse.svg';
import './app.css';

type RequestRecord = { id: string; service: string; city: string; date: string; status: 'review' | 'complete' | 'draft' };
const initialRequests: RequestRecord[] = [
  { id: 'NQ-1024', service: 'permit', city: 'riyadh', date: '2026-10-26T09:00:00+03:00', status: 'review' },
  { id: 'NQ-1023', service: 'certificate', city: 'jeddah', date: '2026-10-23T09:00:00+03:00', status: 'complete' },
  { id: 'NQ-1022', service: 'permit', city: 'dammam', date: '2026-10-20T09:00:00+03:00', status: 'complete' },
  { id: 'NQ-1021', service: 'appointment', city: 'riyadh', date: '2026-10-18T09:00:00+03:00', status: 'draft' },
];
function App() {
  const [arabic, setArabic] = useState(true);
  const [rtl, setRtl] = useState(true);
  const [dark, setDark] = useState(false);
  const [theme, setTheme] = useState('dga');
  const [tab, setTab] = useState('apply');
  const [city, setCity] = useState('');
  const [service, setService] = useState('permit');
  const [applicant, setApplicant] = useState('individual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [review, setReview] = useState(false);
  const [submitted, setSubmitted] = useState<string>();
  const [requests, setRequests] = useState(initialRequests);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [detail, setDetail] = useState<RequestRecord>();
  const [files, setFiles] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('2024-03-11');
  const [appointmentCalendar, setAppointmentCalendar] = useState<CalendarSystem>('gregory');
  const [appointmentChecked, setAppointmentChecked] = useState(false);
  const t = (ar: string, en: string) => arabic ? ar : en;
  const locale = arabic ? 'ar-SA' : 'en-SA';
  const dateLabel = (calendar: CalendarSystem) => isCalendarDateSupported(appointmentDate, calendar) ? formatCalendarDate(appointmentDate, { locale, calendar, dateStyle: 'full' }) : t('خارج نطاق التقويم المدعوم', 'Outside the supported calendar range');
  const cities = [{ value: 'riyadh', label: t('الرياض', 'Riyadh') }, { value: 'jeddah', label: t('جدة', 'Jeddah') }, { value: 'dammam', label: t('الدمام', 'Dammam') }, { value: 'abha', label: t('أبها — قريباً', 'Abha — coming soon'), disabled: true }];
  const services = [{ value: 'permit', label: t('تصريح نشاط', 'Activity permit') }, { value: 'certificate', label: t('إصدار شهادة', 'Issue a certificate') }, { value: 'appointment', label: t('حجز موعد', 'Book an appointment') }];
  const statusLabel = (value: RequestRecord['status']) => value === 'review' ? t('قيد المراجعة', 'In review') : value === 'complete' ? t('مكتمل', 'Complete') : t('مسودة', 'Draft');
  const serviceLabel = (value: string) => services.find(item => item.value === value)?.label ?? value;
  const cityLabel = (value: string) => cities.find(item => item.value === value)?.label ?? value;
  const applicationSteps = [{ value: 'details', label: t('البيانات', 'Details') }, { value: 'review', label: t('المراجعة', 'Review') }, { value: 'send', label: t('الإرسال', 'Submit') }];
  const applicationStep = review ? 1 : 0;
  const filtered = requests.filter(item => (status === 'all' || item.status === status) && `${item.id} ${serviceLabel(item.service)} ${cityLabel(item.city)}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  useEffect(() => {
    document.documentElement.lang = arabic ? 'ar' : 'en';
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.dataset.nqMode = dark ? 'dark' : 'light';
    document.documentElement.dataset.nqTheme = theme;
    document.title = t('نسق — مركز الخدمات', 'Nasaq — Service center');
  }, [arabic, rtl, dark, theme]);
  function submit() {
    const id = `NQ-${1025 + requests.length - initialRequests.length}`;
    setRequests(previous => [{ id, service, city, date: new Date().toISOString(), status: 'review' }, ...previous]);
    setSubmitted(id); setReview(false); setTab('requests'); setPage(1);
  }
  return <>
    <a className="demo-skip" href="#main">{t('انتقل إلى المحتوى', 'Skip to content')}</a>
    <header className="demo-header"><div className="nq-container nq-service-container demo-header-inner">
      <a className="demo-brand" href="#main" aria-label={t('نسق — مركز الخدمات', 'Nasaq — Service center')}>
        <img src={dark ? reverseSymbol : symbol} width="40" height="40" alt="" />
        <span>{t('نسق', 'Nasaq')}<small>{t('مركز الخدمات', 'Service center')}</small></span>
      </a>
      <div className="demo-controls nq-cluster">
        <Select aria-label={t('السمة', 'Theme')} value={theme} onChange={event => setTheme(event.currentTarget.value)} options={[{ value: 'dga', label: t('سمة DGA', 'DGA theme') }, { value: 'nasaq', label: t('نسق', 'Nasaq') }]} />
        <Button variant="ghost" onClick={() => setArabic(!arabic)}>{arabic ? 'English' : 'العربية'}</Button>
        <Tooltip content={t('اتجاه الصفحة مستقل عن لغة المحتوى', 'Page direction is independent of language')}><Button variant="ghost" onClick={() => setRtl(!rtl)} aria-label={t('تغيير اتجاه الصفحة', 'Change page direction')}>{rtl ? 'RTL' : 'LTR'}</Button></Tooltip>
        <Switch checked={dark} onChange={event => setDark(event.currentTarget.checked)} label={t('الوضع الداكن', 'Dark mode')} />
        <Avatar name={t('مستخدم تجريبي', 'Demo user')} initials={t('م ت', 'DU')} />
      </div>
    </div></header>
    <main id="main" className="nq-container nq-service-container demo-main" tabIndex={-1}>
      <Breadcrumb label={t('مسار التنقل', 'Breadcrumb')} items={[{ label: t('الرئيسية', 'Home'), href: '#main' }, { label: t('خدمات الأفراد', 'Personal services') }]} />
      <section className="demo-hero">
        <div><Badge tone="success">{t('خدمات أبسط، وقت أكثر', 'Simple services. More time.')}</Badge><h1>{t('خطوتك القادمة، بكل وضوح.', 'Your next step, made clear.')}</h1><p>{t('قدّم طلبك وتابع كل خطوة من مكان واحد. رحلة واضحة، من البداية حتى الإنجاز.', 'Apply and follow every step in one place. A clear journey, from your first detail to the final decision.')}</p></div>
        <div className="demo-hero-stat"><strong>{formatNumber(requests.filter(item => item.status === 'review').length, { locale })}</strong><span>{t('طلبات قيد المراجعة', 'Requests in review')}</span><Button variant="secondary" size="sm" onClick={() => setTab('requests')}>{t('متابعة طلباتي', 'Track my requests')} <span aria-hidden="true">↗</span></Button></div>
      </section>
      <p className="nq-hint demo-disclosure">{t('نموذج تفاعلي مستقل لنسق. بيانات تجريبية تُحفظ مؤقتاً في هذه الصفحة.', 'An independent Nasaq demo. Sample data stays in this page for this session.')}</p>
      {submitted && <Alert tone="success" title={t('تم إرسال الطلب بنجاح', 'Application submitted')}><p>{t('رقم طلبك', 'Your reference')}: <bdi>{submitted}</bdi>. {t('يمكنك متابعة حالته في قائمة طلباتي.', 'Track its status in My requests.')}</p></Alert>}
      <Tabs value={tab} onValueChange={setTab} label={t('مركز الخدمات', 'Service center')} items={[
        { value: 'apply', label: t('طلب جديد', 'New application'), content: <div className="nq-form-layout">
            <div className="nq-stepper-responsive">
              <Stepper label={t('خطوات الطلب', 'Application steps')} current={applicationSteps[applicationStep]!.value} items={applicationSteps} />
              <div className="nq-stepper-mobile" role="group" aria-label={t(`الخطوة ${formatNumber(applicationStep + 1, { locale })} من ${formatNumber(applicationSteps.length, { locale })}`, `Step ${applicationStep + 1} of ${applicationSteps.length}`)}>
                <span className="nq-stepper-ring" aria-hidden="true" style={{ '--nq-step-progress': `${(applicationStep + 1) / applicationSteps.length * 100}%` } as CSSProperties}>{formatNumber(applicationStep + 1, { locale })}/{formatNumber(applicationSteps.length, { locale })}</span>
                <div className="nq-stepper-summary"><strong>{applicationSteps[applicationStep]!.label}</strong><p>{t('التالي: ', 'Next: ')}{applicationSteps[applicationStep + 1]!.label}</p></div>
              </div>
            </div>
          <Card className="nq-form-main" header={<div><span className="demo-eyebrow">{t('ابدأ رحلتك', 'GET STARTED')}</span><h2>{t('تفاصيل الطلب', 'Application details')}</h2></div>}>
            <form className="nq-stack" onSubmit={event => { event.preventDefault(); setReview(true); }}>
              <div className="nq-form-grid"><Select label={t('الخدمة', 'Service')} name="service" required options={services} value={service} onChange={event => setService(event.currentTarget.value)} /><Combobox key={arabic ? 'ar' : 'en'} label={t('المدينة', 'City')} name="city" required options={cities} value={city} onValueChange={setCity} placeholder={t('ابحث عن مدينة', 'Search for a city')} emptyMessage={t('لا توجد نتائج', 'No results')} getResultsMessage={count => t(`${count} نتائج متاحة`, `${count} results available`)} requiredMessage={t('اختر مدينة من القائمة.', 'Choose a city from the list.')} /></div>
              <fieldset className="demo-fieldset"><legend className="nq-label">{t('نوع مقدم الطلب', 'Applicant type')}</legend><div className="nq-cluster"><Radio name="applicant" value="individual" label={t('فرد', 'Individual')} checked={applicant === 'individual'} onChange={() => setApplicant('individual')} /><Radio name="applicant" value="business" label={t('منشأة', 'Business')} checked={applicant === 'business'} onChange={() => setApplicant('business')} /></div></fieldset>
              <div className="nq-form-grid"><TextField label={t('الاسم الكامل', 'Full name')} autoComplete="name" name="fullName" value={fullName} onChange={event => setFullName(event.currentTarget.value)} required placeholder={t('كما يظهر في الهوية', 'As shown on your ID')} /><TextField label={t('البريد الإلكتروني', 'Email')} name="email" value={email} onChange={event => setEmail(event.currentTarget.value)} type="email" dir="ltr" autoComplete="email" required placeholder="name@example.com" /></div>
              {applicant === 'business' && <TextField name="businessName" value={businessName} onChange={event => setBusinessName(event.currentTarget.value)} label={t('اسم المنشأة', 'Business name')} autoComplete="organization" required />}
              <Textarea label={t('وصف الطلب', 'Application description')} name="description" value={description} onChange={event => setDescription(event.currentTarget.value)} hint={t('أضف التفاصيل التي تساعدنا على معالجة طلبك.', 'Add the details that will help us process your application.')} rows={3} required />
              <FileUpload label={t('المرفقات الداعمة (اختياري)', 'Supporting documents (optional)')} name="attachments" accept=".pdf,.png,.jpg,.jpeg" multiple hint={t('PDF أو PNG أو JPG. لا تُرفع الملفات إلى أي خادم.', 'PDF, PNG or JPG. Files are not uploaded to a server.')} onFilesChange={selected => setFiles(selected.map(file => file.name))}>{files.length > 0 && <ul className="demo-file-list">{files.map((file, index) => <li key={`${file}-${index}`}><bdi>{file}</bdi></li>)}</ul>}</FileUpload>
              <Checkbox name="consent" required label={t('أقر بصحة المعلومات المدخلة.', 'I confirm that the information is accurate.')} />
              <div className="demo-form-footer"><p className="nq-hint">{t('الحقول المعلّمة بـ * مطلوبة.', 'Fields marked * are required.')}</p><Button type="submit">{t('مراجعة الطلب', 'Review application')} <span aria-hidden="true">{rtl ? '←' : '→'}</span></Button></div>
            </form>
          </Card>
          <div className="nq-service-aside nq-stack"><Card header={<h2>{t('قبل أن تبدأ', 'Before you begin')}</h2>}><div className="nq-stack"><p>{t('جهّز معلومات التواصل وحدد المدينة والخدمة المناسبة لطلبك.', 'Have your contact information ready, and choose the right city and service for your application.')}</p><div className="demo-meta"><span>{t('وقت تعبئة الطلب', 'Time to apply')}</span><strong>{t('٥ دقائق', '5 minutes')}</strong></div><div className="demo-meta"><span>{t('الرسوم', 'Fee')}</span><strong>{t('دون رسوم', 'No fee')}</strong></div><div className="demo-meta"><span>{t('مدة المعالجة', 'Processing time')}</span><strong>{t('٣ أيام عمل', '3 working days')}</strong></div><Divider /><p className="nq-hint">{t('هذه مدد توضيحية للنموذج وليست التزاماً من جهة حكومية.', 'These example timings are illustrative, with no government service commitment.')}</p></div></Card>
            <Card header={<h2>{t('تحتاج مساعدة؟', 'Need a hand?')}</h2>}><p>{t('اطّلع على متطلبات الخدمة والأسئلة الشائعة قبل تقديم الطلب.', 'Read the requirements and frequently asked questions before applying.')}</p><Button variant="secondary" onClick={() => setTab('help')}>{t('دليل الخدمة', 'Service guide')}</Button></Card></div>
        </div> },
        { value: 'requests', label: <>{t('طلباتي', 'My requests')} <Badge>{formatNumber(requests.length, { locale })}</Badge></>, content: <Card header={<h2>{t('كل طلباتك، في مكان واحد', 'All your requests, in one place')}</h2>}>
          <div className="demo-filter"><TextField type="search" label={t('البحث في الطلبات', 'Search requests')} placeholder={t('رقم الطلب أو الخدمة', 'Reference or service')} value={query} onChange={event => { setQuery(event.currentTarget.value); setPage(1); }} /><Select label={t('الحالة', 'Status')} value={status} onChange={event => { setStatus(event.currentTarget.value); setPage(1); }} options={[{ value: 'all', label: t('كل الحالات', 'All statuses') }, ...(['review', 'complete', 'draft'] as const).map(value => ({ value, label: statusLabel(value) }))]} /></div>
          {filtered.length ? <><Table caption={t('قائمة الطلبات التجريبية', 'Sample applications')} rows={filtered.slice((page - 1) * 3, page * 3)} rowKey={row => row.id} columns={[{ key: 'reference', header: t('رقم الطلب', 'Reference'), rowHeader: true, cell: row => <bdi>{row.id}</bdi> }, { key: 'service', header: t('الخدمة', 'Service'), cell: row => serviceLabel(row.service) }, { key: 'date', header: t('التاريخ', 'Date'), cell: row => formatDate(row.date, { locale, dateStyle: 'medium' }) }, { key: 'status', header: t('الحالة', 'Status'), cell: row => <Badge tone={row.status === 'complete' ? 'success' : row.status === 'review' ? 'warning' : 'neutral'}>{statusLabel(row.status)}</Badge> }, { key: 'actions', header: t('التفاصيل', 'Details'), cell: row => <Button variant="ghost" size="sm" onClick={() => setDetail(row)} aria-label={`${t('عرض الطلب', 'View request')} ${row.id}`}>{t('عرض', 'View')}</Button> }]} /><Pagination page={page} onPageChange={setPage} totalPages={Math.ceil(filtered.length / 3)} label={t('صفحات الطلبات', 'Request pages')} previousLabel={t('السابق', 'Previous')} nextLabel={t('التالي', 'Next')} getPageLabel={number => t(`الصفحة ${number}`, `Page ${number}`)} formatPage={number => formatNumber(number, { locale })} /></> : <EmptyState title={t('لا توجد طلبات مطابقة', 'No matching requests')} description={t('جرّب البحث بكلمة أخرى أو تغيير الحالة.', 'Try another search or change the status filter.')} action={<Button variant="secondary" onClick={() => { setQuery(''); setStatus('all'); }}>{t('مسح التصفية', 'Clear filters')}</Button>} />}
        </Card> },
        { value: 'help', label: t('دليل الخدمة', 'Service guide'), content: <Card header={<h2>{t('كل ما تحتاج معرفته', 'Everything you need to know')}</h2>}><Accordion items={[{ value: 'eligibility', title: t('من يمكنه تقديم الطلب؟', 'Who can apply?'), content: <p>{t('يتيح هذا النموذج تجربة طلبات الأفراد والمنشآت، دون التحقق من هوية حقيقية.', 'This demo lets you try individual and business applications without verifying a real identity.')}</p>, defaultOpen: true }, { value: 'documents', title: t('ما المستندات المطلوبة؟', 'What documents are required?'), content: <p>{t('المرفقات اختيارية في هذا النموذج. في الخدمة الفعلية تعتمد المتطلبات على نوع الطلب.', 'Attachments are optional in this demo. A real service determines its documents by application type.')}</p> }, { value: 'tracking', title: t('كيف أتابع الطلب؟', 'How do I track an application?'), content: <p>{t('بعد الإرسال، يظهر الطلب في تبويب طلباتي. تُمسح بيانات التجربة عند إعادة تحميل الصفحة.', 'After submission, your application appears in My requests. Refreshing clears the demo data.')}</p> }]} /></Card> },
      ]} />
      <Section data-testid="calendar-showcase" aria-labelledby="calendar-showcase-title" padding={{ base: 4, md: 6 }}>
        <Stack gap={5}>
          <header><h2 id="calendar-showcase-title">{t('موعدك، بالتقويم الذي تفضله', 'Your appointment, in either calendar')}</h2><p className="nq-hint">{t('بدّل بين الميلادي وأم القرى مع الاحتفاظ باليوم نفسه.', 'Switch between Gregorian and Umm al-Qura while keeping the same day.')}</p></header>
          <Grid columns={{ base: 1, md: 2 }} gap={6}>
            <Card><form onSubmit={event => { event.preventDefault(); setAppointmentChecked(true); }}><Stack gap={4}>
              <DatePicker label={t('تاريخ الموعد', 'Appointment date')} name="calendar-date" required value={appointmentDate} onValueChange={date => { setAppointmentDate(date); setAppointmentChecked(false); }} calendar={appointmentCalendar} onCalendarChange={calendar => { setAppointmentCalendar(calendar); setAppointmentChecked(false); }} locale={locale} calendarLabel={t('اختر تاريخ الموعد', 'Choose appointment date')} calendarSystemLabel={t('نوع التقويم', 'Calendar system')} gregorianLabel={t('ميلادي', 'Gregorian')} hijriLabel={t('هجري — أم القرى', 'Hijri — Umm al-Qura')} buttonLabel={t('فتح التقويم', 'Open calendar')} previousLabel={t('الشهر السابق', 'Previous month')} nextLabel={t('الشهر التالي', 'Next month')} closeLabel={t('إغلاق التقويم', 'Close calendar')} unsupportedCalendarMessage={t('التاريخ خارج نطاق أم القرى المدعوم (١٩٢٤-٠٨-٠١ إلى ٢٠٧٧-١١-١٦). اختر الميلادي للاحتفاظ به.', 'The date is outside the supported Umm al-Qura range (1924-08-01 to 2077-11-16). Choose Gregorian to keep it.')} />
              <Button type="submit">{t('التحقق من التاريخ', 'Check date')}</Button><p role="status" data-testid="date-check">{appointmentChecked ? t('التاريخ صالح للتقويم المختار.', 'The date is valid for the selected calendar.') : ''}</p>
            </Stack></form></Card>
            <Card><Stack gap={4}><h3>{t('اليوم نفسه، بصيغتين', 'The same day, two calendars')}</h3><dl className="nq-description-list"><div><dt>ISO</dt><dd><output data-testid="date-iso" dir="ltr">{appointmentDate}</output></dd></div><div><dt>{t('ميلادي', 'Gregorian')}</dt><dd><output data-testid="date-gregorian">{dateLabel('gregory')}</output></dd></div><div><dt>{t('أم القرى', 'Umm al-Qura')}</dt><dd><output data-testid="date-hijri">{dateLabel('islamic-umalqura')}</output></dd></div></dl></Stack></Card>
          </Grid>
        </Stack>
      </Section>
      <Dialog open={review} onOpenChange={setReview} title={t('راجع طلبك قبل الإرسال', 'Review your application')} description={t('تأكد من صحة البيانات الأساسية، ثم أرسل طلبك.', 'Check the key details, then submit your application.')} closeLabel={t('إغلاق', 'Close')} footer={({ close }) => <><Button variant="secondary" onClick={close}>{t('العودة للتعديل', 'Back to edit')}</Button><Button onClick={submit}>{t('إرسال الطلب', 'Submit application')}</Button></>}>
        <dl className="demo-review"><div><dt>{t('الاسم', 'Name')}</dt><dd>{fullName}</dd></div><div><dt>{t('البريد الإلكتروني', 'Email')}</dt><dd><bdi>{email}</bdi></dd></div><div><dt>{t('نوع مقدم الطلب', 'Applicant type')}</dt><dd>{applicant === 'business' ? t('منشأة', 'Business') : t('فرد', 'Individual')}</dd></div>{applicant === 'business' && <div><dt>{t('اسم المنشأة', 'Business name')}</dt><dd>{businessName}</dd></div>}<div><dt>{t('الخدمة', 'Service')}</dt><dd>{serviceLabel(service)}</dd></div><div><dt>{t('المدينة', 'City')}</dt><dd>{cityLabel(city)}</dd></div><div><dt>{t('وصف الطلب', 'Application description')}</dt><dd>{description}</dd></div><div><dt>{t('المرفقات', 'Attachments')}</dt><dd>{formatNumber(files.length, { locale })}</dd></div></dl><Alert tone="info"><p>{t('هذا نموذج تجريبي. لن يُرسل طلب إلى أي جهة.', 'This is a demo. No application is sent to an organization.')}</p></Alert>
      </Dialog>
      <Dialog open={Boolean(detail)} onOpenChange={open => { if (!open) setDetail(undefined); }} title={<>{t('تفاصيل الطلب', 'Request details')} <bdi>{detail?.id}</bdi></>} closeLabel={t('إغلاق', 'Close')}>
        {detail && <div className="nq-stack"><Badge tone={detail.status === 'complete' ? 'success' : 'warning'}>{statusLabel(detail.status)}</Badge><h3>{serviceLabel(detail.service)} · {cityLabel(detail.city)}</h3><Progress label={t('تقدم الطلب', 'Application progress')} value={detail.status === 'complete' ? 100 : detail.status === 'review' ? 50 : 20} /><Stepper current={detail.status === 'complete' ? 'complete' : detail.status === 'review' ? 'review' : 'received'} items={[{ value: 'received', label: t('تم الاستلام', 'Received') }, { value: 'review', label: t('المراجعة', 'Review') }, { value: 'complete', label: t('مكتمل', 'Complete') }]} /><p className="nq-hint">{t('آخر تحديث', 'Last updated')}: {formatDate(detail.date, { locale, dateStyle: 'long' })}</p></div>}
      </Dialog>
    </main>
    <footer className="demo-footer nq-container nq-service-container"><span>{t('نسق — مصمم ليمنح التفاصيل انسجامها.', 'Nasaq — details, in harmony.')}</span><span>React · {t('نموذج تفاعلي', 'Interactive demo')}</span></footer>
  </>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
