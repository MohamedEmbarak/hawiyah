import '@angular/compiler';
import { NicReferenceExampleComponent } from './nic-reference';
import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HwAlertComponent, HwBadgeComponent, HwBreadcrumbComponent, HwButtonDirective, HwCardComponent, HwCheckboxComponent, HwComboboxComponent, HwDialogComponent, HwPaginationComponent, HwSelectComponent, HwStepperComponent, HwTabComponent, HwTableComponent, HwTabsComponent, HwTextareaComponent, HwTextFieldComponent, HwFileUploadComponent, HwDatePickerComponent, HwGridComponent, HwStackComponent, HwSectionComponent } from '@hawiyah/angular';
import { formatCalendarDate, formatNumber, isCalendarDateSupported } from '@hawiyah/core';
import type { CalendarSystem, Option } from '@hawiyah/core';
import '@hawiyah/styles/styles.css';
import '@hawiyah/styles/reset.css';
import '../../../brand/fonts.css';
import './style.css';
import { PortalExampleComponent } from './portal';
import { InputControlsExampleComponent } from './input-controls';

@Component({
  selector: 'app-root', standalone: true,
  imports: [FormsModule, HwAlertComponent, HwBadgeComponent, HwBreadcrumbComponent, HwButtonDirective, HwCardComponent, HwCheckboxComponent, HwComboboxComponent, HwDialogComponent, HwPaginationComponent, HwSelectComponent, HwStepperComponent, HwTabComponent, HwTableComponent, HwTabsComponent, HwTextareaComponent, HwTextFieldComponent, HwFileUploadComponent, HwDatePickerComponent, HwGridComponent, HwStackComponent, HwSectionComponent],
  template: `
    <div [attr.dir]="arabic() ? 'rtl' : 'ltr'" [attr.lang]="arabic() ? 'ar' : 'en'" [attr.data-hw-theme]="theme" [attr.data-hw-mode]="mode" [attr.data-hw-density]="density" class="example-shell">
      <header class="example-header hw-container hw-service-container"><a class="example-brand" href="#services" aria-label="Hawiyah home"><span class="example-mark" aria-hidden="true">ن</span><span>{{ arabic() ? 'هوية' : 'Hawiyah' }}<small>{{ arabic() ? 'خدمات المجتمع' : 'Community services' }}</small></span></a><div class="hw-cluster"><hw-badge tone="info">Angular</hw-badge><button hwButton variant="ghost" type="button" (click)="arabic.set(!arabic())">{{ arabic() ? 'English' : 'العربية' }}</button></div></header>
      <main class="hw-container hw-service-container hw-stack example-main">
        <hw-breadcrumb [label]="arabic() ? 'مسار التنقل' : 'Breadcrumb'" [items]="[{label: arabic() ? 'الرئيسية' : 'Home', href: '#services'}, {label: arabic() ? 'تصريح فعالية مجتمعية' : 'Community event permit'}]" />
        <section class="example-hero" id="services"><div><p class="example-eyebrow">{{ arabic() ? 'خدمات أقرب إليك' : 'GOOD IDEAS START HERE' }}</p><h1>{{ arabic() ? 'مساحة لنجتمع.' : 'Make room for community.' }}</h1><p>{{ arabic() ? 'خطط لفعالية محلية، وقدم طلب التصريح، وتابع خطواتك في مكان واحد.' : 'Plan a local event, apply for a permit, and follow every step in one place.' }}</p><div class="hw-cluster"><hw-badge tone="success">{{ arabic() ? 'خدمة رقمية' : 'Digital service' }}</hw-badge><span>{{ arabic() ? '5 دقائق للتقديم' : '5 minutes to apply' }}</span></div></div><div class="example-hero-aside"><span class="example-number">01—03</span><strong>{{ arabic() ? 'من الفكرة إلى اللقاء' : 'From an idea to a gathering' }}</strong><p>{{ arabic() ? 'نموذج تجريبي؛ لا تُرسل البيانات إلى أي جهة.' : 'A local demonstration. Your details stay in this browser session.' }}</p></div></section>
        <div class="example-controls"><hw-select controlId="theme" [label]="arabic() ? 'المظهر' : 'Theme'" [(value)]="theme" [options]="themes" /><hw-select controlId="mode" [label]="arabic() ? 'الألوان' : 'Color mode'" [(value)]="mode" [options]="modes" /><hw-select controlId="density" [label]="arabic() ? 'الكثافة' : 'Density'" [(value)]="density" [options]="densities" /></div>
        @if (submitted()) {<hw-alert tone="success" [title]="arabic() ? 'تم حفظ طلبك التجريبي' : 'Your demo request is ready'"> <p>{{ arabic() ? 'رقم الطلب HW-2026-104. هذه تجربة محلية ولا تمثل تقديمًا رسميًا.' : 'Reference HW-2026-104. This is a local simulation, not an official submission.' }}</p></hw-alert>}
        <hw-tabs [label]="arabic() ? 'الخدمة والطلبات' : 'Service and requests'" [overflowLabel]="arabic() ? 'المزيد من التبويبات' : 'More tabs'" [(value)]="tab">
          <hw-tab value="apply" [label]="arabic() ? 'طلب جديد' : 'New application'">
            <div class="hw-form-layout">
              <div class="hw-stepper-responsive">
                <hw-stepper [label]="arabic() ? 'مراحل الطلب' : 'Application stages'" [completeLabel]="arabic() ? 'مكتملة' : 'Complete'" [upcomingLabel]="arabic() ? 'قادمة' : 'Upcoming'" [activeIndex]="currentStep" [items]="applicationSteps" />
                <div class="hw-stepper-mobile" role="group" [attr.aria-label]="stepProgressLabel">
                  <span class="hw-stepper-ring" aria-hidden="true" [style.--hw-step-progress]="((currentStep + 1) / 3 * 100) + '%'">{{ stepCount }}</span>
                  <div class="hw-stepper-summary"><strong>{{ applicationSteps[currentStep]?.label }}</strong><p>{{ nextStepLabel }}</p></div>
                </div>
              </div>
              <section class="hw-form-main hw-stack">
              <form #application="ngForm" class="hw-stack" (ngSubmit)="reviewOpen = true">
                <div class="hw-form-grid">
                <hw-text-field controlId="event-title" name="title" [label]="arabic() ? 'اسم الفعالية' : 'Event name'" [(ngModel)]="eventTitle" [required]="true" [placeholder]="arabic() ? 'مثل: لقاء الحي' : 'For example, neighborhood gathering'" />
                <hw-combobox controlId="event-city" name="city" [label]="arabic() ? 'المدينة' : 'City'" [(ngModel)]="city" [options]="cities" [required]="true" [hint]="arabic() ? 'ابحث بالعربية أو الإنجليزية؛ ثم اختر نتيجة.' : 'Search the bilingual city names, then select a result.'" [emptyMessage]="arabic() ? 'لا توجد نتائج' : 'No cities found'" [getResultsMessage]="resultMessage" [requiredMessage]="arabic() ? 'اختر مدينة من القائمة.' : 'Select an option from the list.'" />
                </div>
                <hw-select controlId="event-type" name="type" [label]="arabic() ? 'نوع الفعالية' : 'Event type'" [(ngModel)]="eventType" [options]="eventTypes" />
                @if (eventType === 'outdoor') {<hw-alert tone="info">{{ arabic() ? 'للفعاليات الخارجية، وضح خطة السلامة ومسار الدخول.' : 'For outdoor events, include your safety plan and accessible entry route.' }}</hw-alert>}
                <hw-textarea controlId="event-description" name="description" [label]="arabic() ? 'عن الفعالية' : 'Tell us about your event'" [(ngModel)]="description" [rows]="3" />
                <hw-file-upload controlId="event-file" name="attachment" [label]="arabic() ? 'مخطط المكان (اختياري)' : 'Venue plan (optional)'" [(ngModel)]="files" accept=".pdf,.png,.jpg" [hint]="arabic() ? 'يبقى الملف على جهازك في هذا المثال.' : 'Files are selected locally and are not uploaded.'" />
                <hw-checkbox controlId="event-consent" name="consent" [label]="arabic() ? 'راجعت المعلومات وهي صحيحة.' : 'I have checked these details and they are accurate.'" [(ngModel)]="consent" [required]="true" />
                <div class="hw-cluster"><button hwButton type="submit" [disabled]="!eventTitle.trim() || !city || !consent">{{ arabic() ? 'مراجعة الطلب' : 'Review application' }}</button><button hwButton variant="ghost" type="button" (click)="application.resetForm({title: '', city: '', type: 'indoor', description: '', attachment: [], consent: false})">{{ arabic() ? 'مسح النموذج' : 'Clear form' }}</button></div>
              </form>
              </section>
              <aside class="hw-service-aside hw-stack"><hw-card><div hwCardHeader><hw-badge tone="neutral">{{ arabic() ? 'قبل أن تبدأ' : 'BEFORE YOU BEGIN' }}</hw-badge><h2>{{ arabic() ? 'تفاصيل واضحة. بداية سهلة.' : 'A little preparation goes a long way.' }}</h2></div><p>{{ arabic() ? 'جهز اسم الفعالية، والمدينة، ووصفًا موجزًا لما تخطط له.' : 'Have your event name, city, and a short description of your plans ready.' }}</p><dl class="example-facts"><div><dt>{{ arabic() ? 'مدة الخدمة' : 'Service time' }}</dt><dd>{{ arabic() ? '3 أيام عمل' : '3 working days' }}</dd></div><div><dt>{{ arabic() ? 'الرسوم' : 'Fee' }}</dt><dd>{{ arabic() ? 'بدون رسوم' : 'No fee' }}</dd></div></dl></hw-card><hw-alert tone="info">{{ arabic() ? 'مكتبة واجهات مبنية للامتثال لكود المنصات. هذا مثال وليس خدمة حكومية.' : 'A UI library built to comply with the DGA Platforms Code. This is an example, not a government service.' }}</hw-alert></aside>
            </div>
          </hw-tab>
          <hw-tab value="requests" [label]="arabic() ? 'طلباتي' : 'My requests'"><hw-table [caption]="arabic() ? 'الطلبات التجريبية' : 'Demo requests'" [columns]="[{key:'id', label: arabic() ? 'رقم الطلب' : 'Reference', rowHeader:true}, {key:'title', label: arabic() ? 'الفعالية' : 'Event'}, {key:'status', label: arabic() ? 'الحالة' : 'Status'}]" [rows]="requestRows" [emptyMessage]="arabic() ? 'لا توجد سجلات' : 'No records'" /><hw-pagination [totalPages]="3" [(page)]="page" [label]="arabic() ? 'ترقيم الصفحات' : 'Pagination'" [getPageLabel]="pageLabel" [getGapLabel]="gapLabel" [jumpLabel]="arabic() ? 'الانتقال إلى صفحة' : 'Go to page'" [goLabel]="arabic() ? 'انتقال' : 'Go'" [previousLabel]="arabic() ? 'السابق' : 'Previous'" [nextLabel]="arabic() ? 'التالي' : 'Next'" /></hw-tab>
        </hw-tabs>
        <section data-testid="calendar-showcase" aria-labelledby="calendar-showcase-title">
          <hw-section [padding]="{base: 4, md: 6}"><hw-stack [gap]="5">
            <header><h2 id="calendar-showcase-title">{{ arabic() ? 'موعدك، بالتقويم الذي تفضله' : 'Your appointment, in either calendar' }}</h2><p class="hw-hint">{{ arabic() ? 'بدّل بين الميلادي وأم القرى مع الاحتفاظ باليوم نفسه.' : 'Switch between Gregorian and Umm al-Qura while keeping the same day.' }}</p></header>
            <hw-grid [columns]="{base: 1, md: 2}" [gap]="6">
              <hw-card><form ngNativeValidate (ngSubmit)="appointmentChecked = true"><hw-stack [gap]="4">
                <hw-date-picker controlId="calendar-date" name="calendar-date" [(ngModel)]="appointmentDate" (ngModelChange)="appointmentChecked = false" [(calendar)]="appointmentCalendar" (calendarChange)="appointmentChecked = false" [required]="true" [label]="arabic() ? 'تاريخ الموعد' : 'Appointment date'" [locale]="arabic() ? 'ar-SA' : 'en-SA'" [direction]="arabic() ? 'rtl' : 'ltr'" [calendarLabel]="arabic() ? 'اختر تاريخ الموعد' : 'Choose appointment date'" [calendarSystemLabel]="arabic() ? 'نوع التقويم' : 'Calendar system'" [rangeLabel]="arabic() ? 'التواريخ الهجرية المدعومة' : 'Supported Hijri dates'" [invalidMessage]="arabic() ? 'أدخل تاريخًا ميلاديًا متاحًا بصيغة YYYY-MM-DD.' : 'Enter an available Gregorian date in YYYY-MM-DD format.'" [gregorianLabel]="arabic() ? 'ميلادي' : 'Gregorian'" [hijriLabel]="arabic() ? 'هجري — أم القرى' : 'Hijri — Umm al-Qura'" [openLabel]="arabic() ? 'فتح التقويم' : 'Open calendar'" [closeLabel]="arabic() ? 'إغلاق التقويم' : 'Close calendar'" [previousLabel]="arabic() ? 'الشهر السابق' : 'Previous month'" [nextLabel]="arabic() ? 'الشهر التالي' : 'Next month'" [unsupportedMessage]="arabic() ? 'التاريخ خارج نطاق أم القرى المدعوم (1924-08-01 إلى 2077-11-16).' : 'The date is outside the supported Umm al-Qura range (1924-08-01 to 2077-11-16).'" />
                <button hwButton type="submit">{{ arabic() ? 'التحقق من التاريخ' : 'Check date' }}</button><p role="status" data-testid="date-check">{{ appointmentChecked ? (arabic() ? 'التاريخ صالح للتقويم المختار.' : 'The date is valid for the selected calendar.') : '' }}</p>
              </hw-stack></form></hw-card>
              <hw-card><hw-stack [gap]="4"><h3>{{ arabic() ? 'اليوم نفسه، بصيغتين' : 'The same day, two calendars' }}</h3><dl class="hw-description-list"><div><dt>ISO</dt><dd><output data-testid="date-iso" dir="ltr">{{ appointmentDate }}</output></dd></div><div><dt>{{ arabic() ? 'ميلادي' : 'Gregorian' }}</dt><dd><output data-testid="date-gregorian">{{ appointmentLabel('gregory') }}</output></dd></div><div><dt>{{ arabic() ? 'أم القرى' : 'Umm al-Qura' }}</dt><dd><output data-testid="date-hijri">{{ appointmentLabel('islamic-umalqura') }}</output></dd></div></dl></hw-stack></hw-card>
            </hw-grid>
          </hw-stack></hw-section>
        </section>
      </main>
      <footer class="hw-container hw-service-container example-footer"><strong>{{ arabic() ? 'هوية — طابع واحد، تجارب متعددة.' : 'Hawiyah — one identity, many experiences.' }}</strong><span>DGA Platforms Code · Angular components</span></footer>
      <hw-dialog [title]="arabic() ? 'مراجعة الطلب' : 'Review your application'" [(open)]="reviewOpen" [closeLabel]="arabic() ? 'إغلاق' : 'Close dialog'"><dl class="example-facts"><div><dt>{{ arabic() ? 'الفعالية' : 'Event' }}</dt><dd>{{ eventTitle }}</dd></div><div><dt>{{ arabic() ? 'المدينة' : 'City' }}</dt><dd>{{ cityLabel }}</dd></div></dl><p>{{ description }}</p><div hwDialogFooter class="hw-cluster"><button hwButton type="button" (click)="submit()">{{ arabic() ? 'تأكيد الطلب التجريبي' : 'Confirm demo request' }}</button><button hwButton variant="secondary" type="button" (click)="reviewOpen = false">{{ arabic() ? 'العودة للتعديل' : 'Keep editing' }}</button></div></hw-dialog>
    </div>
  `,
})
class AppComponent {
  readonly arabic = signal(false);
  readonly submitted = signal(false);
  theme = 'dga'; mode = 'light'; density = 'comfortable'; tab = 'apply'; page = 1;
  get currentStep(): number { return this.submitted() ? 2 : this.reviewOpen ? 1 : 0; }
  get applicationSteps(): {value: string; label: string}[] { return this.arabic() ? [{value:'details',label:'التفاصيل'}, {value:'review',label:'المراجعة'}, {value:'confirmation',label:'التأكيد'}] : [{value:'details',label:'Your details'}, {value:'review',label:'Review'}, {value:'confirmation',label:'Confirmation'}]; }
  get stepCount(): string { const locale = this.arabic() ? 'ar-SA' : 'en-SA'; return `${formatNumber(this.currentStep + 1, {locale})} / ${formatNumber(3, {locale})}`; }
  get stepProgressLabel(): string { return this.arabic() ? `مراحل الطلب: الخطوة ${this.stepCount}` : `Application progress: step ${this.stepCount}`; }
  get nextStepLabel(): string { const next = this.applicationSteps[this.currentStep + 1]; return next ? `${this.arabic() ? 'التالي:' : 'Next:'} ${next.label}` : this.arabic() ? 'تم تأكيد الطلب التجريبي.' : 'Your demo request is confirmed.'; }
  appointmentDate = '2024-03-11'; appointmentCalendar: CalendarSystem = 'gregory'; appointmentChecked = false;
  appointmentLabel(calendar: CalendarSystem): string { return isCalendarDateSupported(this.appointmentDate, calendar) ? formatCalendarDate(this.appointmentDate, { locale: this.arabic() ? 'ar-SA' : 'en-SA', calendar, dateStyle: 'full' }) : this.arabic() ? 'خارج نطاق التقويم المدعوم' : 'Outside the supported calendar range'; }
  reviewOpen = false; eventTitle = ''; city = ''; eventType = 'indoor'; description = ''; consent = false; files: readonly File[] = [];
  readonly themes: Option[] = [{value:'dga',label:'DGA informed'}, {value:'hawiyah',label:'Hawiyah'}, {value:'custom',label:'Custom'}];
  readonly modes: Option[] = [{value:'light',label:'Light'}, {value:'dark',label:'Dark'}];
  readonly densities: Option[] = [{value:'comfortable',label:'Comfortable'}, {value:'compact',label:'Compact'}];
  readonly cities: Option[] = [{value:'riyadh',label:'الرياض · Riyadh'}, {value:'jeddah',label:'جدة · Jeddah'}, {value:'dammam',label:'الدمام · Dammam'}, {value:'abha',label:'أبها · Abha',disabled:true}];
  get eventTypes(): Option[] { return this.arabic() ? [{value:'indoor',label:'داخلية'}, {value:'outdoor',label:'خارجية'}] : [{value:'indoor',label:'Indoor gathering'}, {value:'outdoor',label:'Outdoor event'}]; }
  get cityLabel(): string { return this.cities.find(city => city.value === this.city)?.label ?? ''; }
  readonly resultMessage = (count: number): string => this.arabic() ? `${count} نتائج متاحة` : `${count} results available`;
  readonly pageLabel = (page: number): string => this.arabic() ? `الصفحة ${page}` : `Page ${page}`;
  readonly gapLabel = (start: number, end: number): string => this.arabic() ? `الصفحات ${start} إلى ${end}` : `Pages ${start} to ${end}`;
  get requestRows(): Record<string, string>[] {
    if (this.submitted() && this.page === 1) return [{id:'HW-2026-104', title:this.eventTitle, status:this.arabic() ? 'قيد المراجعة' : 'In review'}];
    return [{id:`HW-2026-${100 - this.page}`,title:this.arabic() ? 'لقاء المجتمع' : `Community gathering ${this.page}`,status:this.arabic() ? 'مسودة' : 'Draft'}];
  }
  submit(): void { this.reviewOpen = false; this.submitted.set(true); }
}

const preview = new URLSearchParams(location.search).get('preview');
bootstrapApplication(preview === 'nic' ? NicReferenceExampleComponent : preview === 'inputs' ? InputControlsExampleComponent : preview === 'portal' ? PortalExampleComponent : AppComponent).catch(error => console.error(error));
