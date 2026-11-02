import { Component } from '@angular/core';
import { NqCardComponent } from '@nasaq/angular';
@Component({
  selector: 'app-root', standalone: true, imports: [NqCardComponent],
  template: `<main class="nq-container nq-stack" data-testid="nic-showcase" data-nq-theme="dga" [attr.lang]="english ? 'en' : 'ar'" [attr.dir]="english ? 'ltr' : 'rtl'" style="padding-block:2rem">
    <h1>{{ t('مرجع واجهة المركز', 'NIC UI reference') }}</h1>
    <button class="nq-button" (click)="english = !english">{{ english ? 'العربية' : 'English' }}</button>
    <section class="nq-grid" style="--nq-layout-columns:1;--nq-layout-columns-md:2">
      <nq-card data-testid="base-card"><h2 nqCardHeader class="nq-card-title">{{ t('بطاقة معلومات', 'Information card') }}</h2><p class="nq-card-description">{{ t('محتوى واضح بمسافات موحدة.', 'Clear content with consistent spacing.') }}</p><span nqCardFooter>{{ t('تفاصيل إضافية', 'Additional details') }}</span></nq-card>
      <nq-card data-testid="border-card" variant="outlined"><h2 nqCardHeader class="nq-card-title">{{ t('بطاقة بإطار', 'Bordered card') }}</h2><p class="nq-card-description">{{ t('إطار دون ظل.', 'A border without a shadow.') }}</p></nq-card>
      <nq-card data-testid="action-card" href="#card-destination"><h2 nqCardHeader class="nq-card-title">{{ t('عرض التفاصيل', 'View details') }}</h2><p class="nq-card-description">{{ t('الرابط يشمل البطاقة كاملة.', 'The complete card is a native link.') }}</p></nq-card>
      <nq-card data-testid="disabled-card" href="#disabled-destination" [disabled]="disabled" (click)="activations = activations + 1"><h2 nqCardHeader class="nq-card-title">{{ t('خدمة اختيارية', 'Optional service') }}</h2><p class="nq-card-description">{{ t('يمكن تغيير إتاحتها.', 'Availability can be changed.') }}</p></nq-card>
    </section>
    <button class="nq-button" data-testid="toggle-card" (click)="disabled = !disabled">{{ t('تغيير الإتاحة', 'Toggle availability') }}</button>
    <output data-testid="card-activations">{{ activations }}</output>
    <h2 id="card-destination" tabindex="-1">{{ t('تفاصيل البطاقة', 'Card details') }}</h2>
    <h2 id="disabled-destination" tabindex="-1">{{ t('الخدمة الاختيارية', 'Optional service details') }}</h2>
  </main>`
})
export class NicReferenceExampleComponent {
  english = false; disabled = true; activations = 0;
  t(ar: string, en: string) { return this.english ? en : ar; }
}
