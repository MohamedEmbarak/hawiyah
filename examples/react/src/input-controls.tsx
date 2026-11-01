import { useState, type CSSProperties } from 'react';
import { Checkbox, PasswordField, Rating, Slider, Stepper } from '@nasaq/react';

export function InputControlsExample() {
  const [arabic, setArabic] = useState(true);
  const t = (ar: string, en: string) => arabic ? ar : en;
  return <main className="nq-container nq-stack" data-testid="input-controls" data-nq-theme="dga" dir={arabic ? 'rtl' : 'ltr'} lang={arabic ? 'ar' : 'en'} style={{ maxWidth: '40rem', padding: '1rem', '--nq-layout-gap': '1.5rem' } as CSSProperties}>
    <h1>{t('معاينة حقول نسق', 'Nasaq input preview')}</h1>
    <button className="nq-button" type="button" onClick={() => setArabic(!arabic)}>{arabic ? 'English' : 'العربية'}</button>
    <form className="nq-stack" onSubmit={event => event.preventDefault()}>
      <PasswordField name="password" label={t('كلمة المرور', 'Password')} showLabel={t('إظهار كلمة المرور', 'Show password')} hideLabel={t('إخفاء كلمة المرور', 'Hide password')} autoComplete="new-password" />
      <PasswordField name="text-password" label={t('كلمة المرور مع زر نصي', 'Password with text toggle')} toggleVariant="text" showLabel={t('إظهار', 'Show')} hideLabel={t('إخفاء', 'Hide')} autoComplete="new-password" />
      <Rating name="rating" label={t('التقييم', 'Rating')} defaultValue={3} getRatingLabel={(value, max) => t(`${value} من ${max}`, `${value} of ${max}`)} />
      <Slider name="readonly-slider" label={t('نطاق للقراءة فقط', 'Read-only range')} defaultValue={30} readOnly />
      <Checkbox name="consent" label={t('أوافق على الشروط', 'I agree to the terms')} />
      <button className="nq-button" type="reset">{t('إعادة ضبط', 'Reset')}</button>
    </form>
    <Stepper label={t('التقدم', 'Progress')} activeIndex={1} style={{ '--nq-step-current-background': '#4f378b' } as CSSProperties} items={[
      { value: 'details', label: t('البيانات', 'Details') }, { value: 'review', label: t('المراجعة', 'Review') }, { value: 'send', label: t('الإرسال', 'Submit') },
    ]} />
  </main>;
}
