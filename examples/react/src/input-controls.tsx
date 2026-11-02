import { useState, type CSSProperties } from 'react';
import { Checkbox, PasswordField, Rating, Slider, Stepper, Switch } from '@nasaq/react';

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
    <section className="nq-stack" data-testid="mobile-switches" data-nq-density="mobile" aria-label={t('أحجام مفاتيح التبديل', 'Switch sizing')}>
      <Switch name="mobile-switch" label={t('تبديل الجوال', 'Mobile switch')} />
      <Switch name="mobile-switch-disabled" label={t('تبديل معطل', 'Disabled switch')} disabled />
      <div data-nq-density="comfortable"><Switch name="desktop-switch" label={t('تبديل مريح', 'Comfortable switch')} /></div>
      <div data-nq-density="compact"><Switch name="compact-switch" label={t('تبديل مضغوط', 'Compact switch')} /></div>
    </section>
    <Stepper label={t('التقدم', 'Progress')} activeIndex={1} style={{ '--nq-step-current-background': '#4f378b' } as CSSProperties} items={[
      { value: 'details', label: t('البيانات', 'Details') }, { value: 'review', label: t('المراجعة', 'Review') }, { value: 'send', label: t('الإرسال', 'Submit') },
    ]} />
  </main>;
}
