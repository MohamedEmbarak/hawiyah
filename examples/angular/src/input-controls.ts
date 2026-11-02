import { Component } from '@angular/core';
import { NqCheckboxComponent, NqPasswordFieldComponent, NqRatingComponent, NqSliderComponent, NqStepperComponent, NqSwitchComponent } from '@nasaq/angular';

@Component({
  selector: 'app-root', standalone: true,
  imports: [NqCheckboxComponent, NqPasswordFieldComponent, NqRatingComponent, NqSliderComponent, NqStepperComponent, NqSwitchComponent],
  template: `<main class="nq-container nq-stack" data-testid="input-controls" data-nq-theme="dga" [attr.dir]="arabic ? 'rtl' : 'ltr'" [attr.lang]="arabic ? 'ar' : 'en'" style="max-width:40rem;padding:1rem;--nq-layout-gap:1.5rem">
    <h1>{{ t('معاينة حقول نسق', 'Nasaq input preview') }}</h1>
    <button class="nq-button" type="button" (click)="arabic = !arabic">{{ arabic ? 'English' : 'العربية' }}</button>
    <form class="nq-stack" (submit)="$event.preventDefault()">
      <nq-password-field name="password" [label]="t('كلمة المرور', 'Password')" [showLabel]="t('إظهار كلمة المرور', 'Show password')" [hideLabel]="t('إخفاء كلمة المرور', 'Hide password')" autocomplete="new-password" />
      <nq-password-field name="text-password" [label]="t('كلمة المرور مع زر نصي', 'Password with text toggle')" toggleVariant="text" [showLabel]="t('إظهار', 'Show')" [hideLabel]="t('إخفاء', 'Hide')" autocomplete="new-password" />
      <nq-rating name="rating" [label]="t('التقييم', 'Rating')" [value]="3" [ratingLabel]="ratingLabel" />
      <nq-slider name="readonly-slider" [label]="t('نطاق للقراءة فقط', 'Read-only range')" [value]="30" [readOnly]="true" />
      <nq-checkbox name="consent" [label]="t('أوافق على الشروط', 'I agree to the terms')" />
      <button class="nq-button" type="reset">{{ t('إعادة ضبط', 'Reset') }}</button>
    </form>
    <section class="nq-stack" data-testid="mobile-switches" data-nq-density="mobile" [attr.aria-label]="t('أحجام مفاتيح التبديل', 'Switch sizing')">
      <nq-switch name="mobile-switch" [label]="t('تبديل الجوال', 'Mobile switch')" />
      <nq-switch name="mobile-switch-disabled" [label]="t('تبديل معطل', 'Disabled switch')" [disabled]="true" />
      <div data-nq-density="comfortable"><nq-switch name="desktop-switch" [label]="t('تبديل مريح', 'Comfortable switch')" /></div>
      <div data-nq-density="compact"><nq-switch name="compact-switch" [label]="t('تبديل مضغوط', 'Compact switch')" /></div>
    </section>
    <nq-stepper [label]="t('التقدم', 'Progress')" [activeIndex]="1" style="--nq-step-current-background:#4f378b" [steps]="[{label:t('البيانات','Details')}, {label:t('المراجعة','Review')}, {label:t('الإرسال','Submit')}]" />
  </main>`,
})
export class InputControlsExampleComponent {
  arabic = true;
  t(ar: string, en: string): string { return this.arabic ? ar : en; }
  ratingLabel = (value: number, max: number): string => this.t(`${value} من ${max}`, `${value} of ${max}`);
}
