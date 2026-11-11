import { Component } from '@angular/core';
import { HwCheckboxComponent, HwSearchFieldComponent, HwPasswordFieldComponent, HwRatingComponent, HwSliderComponent, HwStepperComponent, HwSwitchComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-root', standalone: true,
  imports: [HwCheckboxComponent, HwSearchFieldComponent, HwPasswordFieldComponent, HwRatingComponent, HwSliderComponent, HwStepperComponent, HwSwitchComponent],
  template: `<main class="hw-container hw-stack" data-testid="input-controls" data-hw-theme="dga" [attr.dir]="arabic ? 'rtl' : 'ltr'" [attr.lang]="arabic ? 'ar' : 'en'" style="max-width:40rem;padding:1rem;--hw-layout-gap:1.5rem">
    <h1>{{ t('معاينة حقول هوية', 'Hawiyah input preview') }}</h1>
    <button class="hw-button" type="button" (click)="arabic = !arabic">{{ arabic ? 'English' : 'العربية' }}</button>
    <form class="hw-stack" (submit)="$event.preventDefault()">
      <hw-search-field name="query" [label]="t('بحث', 'Search')" [clearLabel]="t('مسح البحث', 'Clear search')" [searchLabel]="t('بحث', 'Search')" value="Hawiyah" />
      <hw-password-field name="password" [label]="t('كلمة المرور', 'Password')" [showLabel]="t('إظهار كلمة المرور', 'Show password')" [hideLabel]="t('إخفاء كلمة المرور', 'Hide password')" autocomplete="new-password" />
      <hw-password-field name="text-password" [label]="t('كلمة المرور مع زر نصي', 'Password with text toggle')" toggleVariant="text" [showLabel]="t('إظهار', 'Show')" [hideLabel]="t('إخفاء', 'Hide')" autocomplete="new-password" />
      <hw-rating name="rating" [label]="t('التقييم', 'Rating')" [value]="3" [getRatingLabel]="ratingLabel" />
      <hw-slider name="readonly-slider" [label]="t('نطاق للقراءة فقط', 'Read-only range')" [value]="30" [readOnly]="true" />
      <hw-checkbox name="consent" [label]="t('أوافق على الشروط', 'I agree to the terms')" />
      <button class="hw-button" type="reset">{{ t('إعادة ضبط', 'Reset') }}</button>
    </form>
    <section class="hw-stack" data-testid="mobile-switches" data-hw-density="mobile" [attr.aria-label]="t('أحجام مفاتيح التبديل', 'Switch sizing')">
      <hw-switch name="mobile-switch" [label]="t('تبديل الجوال', 'Mobile switch')" />
      <hw-switch name="mobile-switch-disabled" [label]="t('تبديل معطل', 'Disabled switch')" [disabled]="true" />
      <div data-hw-density="comfortable"><hw-switch name="desktop-switch" [label]="t('تبديل مريح', 'Comfortable switch')" /></div>
      <div data-hw-density="compact"><hw-switch name="compact-switch" [label]="t('تبديل مضغوط', 'Compact switch')" /></div>
    </section>
    <hw-stepper [label]="t('التقدم', 'Progress')" [activeIndex]="1" style="--hw-step-current-background:#4f378b" [steps]="[{label:t('البيانات','Details')}, {label:t('المراجعة','Review')}, {label:t('الإرسال','Submit')}]" />
  </main>`,
})
export class InputControlsExampleComponent {
  arabic = true;
  t(ar: string, en: string): string { return this.arabic ? ar : en; }
  ratingLabel = (value: number, max: number): string => this.t(`${value} من ${max}`, `${value} of ${max}`);
}
