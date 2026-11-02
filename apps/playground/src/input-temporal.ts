import { escape as e, type Locale } from './data';
import { expandedSample } from './expanded-samples';

export type InputTemporalKind = 'month' | 'week' | 'datetime-local';
const initialDate = '2026-10-28';
const initialTime = '09:30';
const dayMilliseconds = 86_400_000;

function utcDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return;
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return;
  const date = new Date(Date.UTC(2000, 0, 1));
  date.setUTCFullYear(year, month - 1, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return;
  return date;
}

/** Guide-only projection of an accepted Gregorian ISO day; no calendar conversion. */
export function projectInputTemporal(kind: InputTemporalKind, date: string, time = ''): string {
  const day = utcDate(date);
  if (!day) return '';
  if (kind === 'month') return date.slice(0, 7);
  if (kind === 'datetime-local') return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/u.test(time) ? `${date}T${time}` : '';
  // Thursday determines an ISO week-year; UTC avoids timezone/DST shifts.
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const year = day.getUTCFullYear();
  const first = new Date(Date.UTC(2000, 0, 1)); first.setUTCFullYear(year);
  const week = Math.ceil(((day.getTime() - first.getTime()) / dayMilliseconds + 1) / 7);
  return `${String(year).padStart(4, '0')}-W${String(week).padStart(2, '0')}`;
}

export function inputTemporalMarkup(kind: InputTemporalKind, locale: Locale): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const label = kind === 'month' ? t('Gregorian month · choose any day in the month', 'الشهر الميلادي · اختر أي يوم في الشهر')
    : kind === 'week' ? t('ISO week · choose any day in the week', 'أسبوع ISO · اختر أي يوم في الأسبوع')
      : t('Local date and time · choose a date', 'التاريخ والوقت المحلي · اختر التاريخ');
  const picker = expandedSample('date-picker', `input-lab-${kind}`, locale)
    .replace('data-nq-calendar="islamic-umalqura"', 'data-nq-calendar="gregory"')
    .replace('name="appointment"', 'name=""')
    .replace(t('Appointment · Umm al-Qura picker', 'الموعد · تقويم أم القرى'), e(label));
  const projected = projectInputTemporal(kind, initialDate, initialTime);
  return `<div class="nq-stack" data-input-temporal="${kind}" data-temporal-default="${initialDate}" data-temporal-locale="${locale}">${picker}${kind === 'datetime-local' ? `<label class="nq-field"><span class="nq-label">${t('Local time (no timezone)', 'الوقت المحلي (دون منطقة زمنية)')}</span><input class="nq-input" type="time" value="${initialTime}" data-temporal-time></label>` : ''}<input type="hidden" name="${kind}" value="${projected}" data-temporal-value><p class="nq-hint">${t('Submitted Gregorian ISO value', 'القيمة الميلادية المرسلة بصيغة ISO')}: <output data-temporal-output dir="ltr" aria-live="polite">${projected}</output></p></div>`;
}

/** Bind after enhance(), so DatePicker accepts canonical values before projection. */
export function bindInputTemporal(root: HTMLElement): () => void {
  const disposers: (() => void)[] = [];
  for (const wrapper of root.querySelectorAll<HTMLElement>('[data-input-temporal]')) {
    const kind = wrapper.dataset.inputTemporal as InputTemporalKind;
    const picker = wrapper.querySelector<HTMLElement>('[data-nq="date-picker"]')!;
    const hidden = wrapper.querySelector<HTMLInputElement>('[data-temporal-value]')!;
    const output = wrapper.querySelector<HTMLOutputElement>('[data-temporal-output]')!;
    const time = wrapper.querySelector<HTMLInputElement>('[data-temporal-time]');
    let date = wrapper.dataset.temporalDefault || '';
    let destroyed = false;
    const update = () => {
      hidden.value = projectInputTemporal(kind, date, time?.value);
      output.value = hidden.value || '—';
      if (time) time.setCustomValidity(date && !time.value ? (wrapper.dataset.temporalLocale === 'en' ? 'Choose a local time.' : 'اختر الوقت المحلي.') : '');
    };
    const selected = (event: Event) => {
      if (event.target !== picker) return;
      const value = (event as CustomEvent<{ value?: string }>).detail?.value;
      if (typeof value !== 'string') return;
      date = value; update();
    };
    const reset = (event: Event) => queueMicrotask(() => {
      if (destroyed || event.defaultPrevented) return;
      date = wrapper.dataset.temporalDefault || ''; update();
    });
    picker.addEventListener('nq:change', selected); time?.addEventListener('input', update); time?.addEventListener('change', update); hidden.form?.addEventListener('reset', reset);
    const form = hidden.form;
    disposers.push(() => { destroyed = true; picker.removeEventListener('nq:change', selected); time?.removeEventListener('input', update); time?.removeEventListener('change', update); form?.removeEventListener('reset', reset); time?.setCustomValidity(''); });
    update();
  }
  return () => disposers.splice(0).forEach(dispose => dispose());
}
