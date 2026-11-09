import { createStepper } from '@hawiyah/vanilla';
import type { Locale } from './data';

export function stepperSample(locale: Locale): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const palette = `<option value="">${t('Theme default', 'اللون الافتراضي للسمة')}</option><option value="#175cd3">${t('Blue', 'أزرق')}</option><option value="#6941c6">${t('Purple', 'بنفسجي')}</option>`;
  return `<div class="hw-stack" data-stepper-demo>
    <ol class="hw-stepper" aria-label="${t('Application progress', 'تقدم الطلب')}">
      <li class="hw-step" data-state="complete"><span>${t('Details', 'البيانات')}</span></li>
      <li class="hw-step" data-state="current" aria-current="step"><span>${t('Review', 'المراجعة')}</span></li>
      <li class="hw-step" data-state="upcoming"><span>${t('Confirmation', 'التأكيد')}</span></li>
    </ol>
    <div class="hw-stack">
      <label class="hw-field"><span class="hw-label">${t('Active step', 'الخطوة النشطة')}</span><select class="hw-select" data-stepper-index><option value="-1">${t('Not started', 'لم تبدأ')}</option><option value="0">${t('1 — Details', '1 — البيانات')}</option><option value="1" selected>${t('2 — Review', '2 — المراجعة')}</option><option value="2">${t('3 — Confirmation', '3 — التأكيد')}</option><option value="3">${t('All complete', 'اكتملت جميع الخطوات')}</option></select></label>
      <label class="hw-field"><span class="hw-label">${t('First step status', 'حالة الخطوة الأولى')}</span><select class="hw-select" data-stepper-status><option value="">${t('Automatic', 'تلقائية')}</option><option value="complete">${t('Complete', 'مكتملة')}</option><option value="upcoming">${t('Upcoming', 'قادمة')}</option></select></label>
      <label class="hw-field"><span class="hw-label">${t('Active step color', 'لون الخطوة النشطة')}</span><select class="hw-select" data-stepper-color="current">${palette}</select></label>
      <label class="hw-field"><span class="hw-label">${t('Previous step color', 'لون الخطوات السابقة')}</span><select class="hw-select" data-stepper-color="complete">${palette}</select></label>
    </div>
  </div>`;
}

export function bindStepperSamples(root: ParentNode): () => void {
  const cleanups: (() => void)[] = [];
  root.querySelectorAll<HTMLElement>('[data-stepper-demo]').forEach(demo => {
    const list = demo.querySelector<HTMLOListElement>('.hw-stepper')!;
    const controller = createStepper(list, { activeIndex: 1 });
    const change = (event: Event) => {
      const control = event.target as HTMLSelectElement;
      if (control.matches('[data-stepper-index]')) controller.setActiveIndex(Number(control.value));
      else if (control.matches('[data-stepper-status]')) {
        const first = list.children[0] as HTMLElement;
        if (control.value) first.dataset.status = control.value; else delete first.dataset.status;
        controller.refresh();
      } else if (control.matches('[data-stepper-color]')) {
        const state = control.dataset.stepperColor!;
        for (const suffix of ['color', 'background', 'border', 'connector', 'marker-color']) {
          const property = `--hw-step-${state}-${suffix}`;
          if (control.value) list.style.setProperty(property, suffix === 'marker-color' ? '#fff' : control.value);
          else list.style.removeProperty(property);
        }
      }
    };
    demo.addEventListener('change', change);
    cleanups.push(() => { demo.removeEventListener('change', change); controller.destroy(); });
  });
  return () => cleanups.forEach(cleanup => cleanup());
}
