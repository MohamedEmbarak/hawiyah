import { Component } from '@angular/core';
import { NqCheckboxComponent, NqPasswordFieldComponent, NqRatingComponent, NqSliderComponent, NqStepperComponent } from '@nasaq/angular';

@Component({
  selector: 'app-root', standalone: true,
  imports: [NqCheckboxComponent, NqPasswordFieldComponent, NqRatingComponent, NqSliderComponent, NqStepperComponent],
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
    <nq-stepper [label]="t('التقدم', 'Progress')" [activeIndex]="1" style="--nq-step-current-background:#4f378b" [steps]="[{label:t('البيانات','Details')}, {label:t('المراجعة','Review')}, {label:t('الإرسال','Submit')}]" />
  </main>`,
})
export class InputControlsExampleComponent {
  arabic = true;
  t(ar: string, en: string): string { return this.arabic ? ar : en; }
  ratingLabel = (value: number, max: number): string => this.t(`${value} من ${max}`, `${value} of ${max}`);
}
