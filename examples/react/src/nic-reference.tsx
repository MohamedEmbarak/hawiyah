import { useState } from 'react';
import { Card, Button, IconButton } from '@nasaq/react';
export function NicReferenceExample() {
  const [buttonCount, setButtonCount] = useState(0);
  const [english, setEnglish] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [activations, setActivations] = useState(0);
  const t = (ar: string, en: string) => english ? en : ar;
  return <main className="nq-container nq-stack" data-testid="nic-showcase" data-nq-theme="dga" lang={english ? 'en' : 'ar'} dir={english ? 'ltr' : 'rtl'} style={{paddingBlock: '2rem'}}>
    <h1>{t('مرجع واجهة المركز', 'NIC UI reference')}</h1>
    <button className="nq-button" onClick={() => setEnglish(!english)}>{english ? 'العربية' : 'English'}</button>
<section className="nq-stack" aria-label={t('الأزرار', 'Buttons')} data-testid="button-showcase">
      <div className="nq-cluster"><span style={{padding: '4px'}}><Button data-testid="button-primary" variant="primary" onClick={() => setButtonCount(n => n + 1)}>{t('أساسي', 'primary')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-default" variant="default" onClick={() => setButtonCount(n => n + 1)}>{t('داكن', 'default')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-secondary" variant="secondary" onClick={() => setButtonCount(n => n + 1)}>{t('ثانوي', 'secondary')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-outline" variant="outline" onClick={() => setButtonCount(n => n + 1)}>{t('بإطار', 'outline')}</Button></span><span style={{padding: '4px', background: '#14573a'}}><Button data-testid="button-outline-white" variant="outline-white" onClick={() => setButtonCount(n => n + 1)}>{t('إطار أبيض', 'outline-white')}</Button></span><span style={{padding: '4px', background: '#14573a'}}><Button data-testid="button-light" variant="light" onClick={() => setButtonCount(n => n + 1)}>{t('أبيض', 'light')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-danger" variant="danger" onClick={() => setButtonCount(n => n + 1)}>{t('خطر', 'danger')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-ghost" variant="ghost" onClick={() => setButtonCount(n => n + 1)}>{t('خفيف', 'ghost')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-soft" variant="soft" onClick={() => setButtonCount(n => n + 1)}>{t('هادئ', 'soft')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-link" variant="link" onClick={() => setButtonCount(n => n + 1)}>{t('رابط', 'link')}</Button></span></div>
      <Button data-testid="button-disabled" disabled onClick={() => setButtonCount(n => n + 1)}>{t('غير متاح', 'Disabled')}</Button>
      <Button data-testid="button-loading" loading onClick={() => setButtonCount(n => n + 1)}>{t('جارٍ الحفظ', 'Saving')}</Button>
      <IconButton data-testid="button-icon" variant="default" label={t('إضافة', 'Add')} onClick={() => setButtonCount(n => n + 1)}>+</IconButton>
      <output data-testid="button-count">{buttonCount}</output>
    </section>
    <section className="nq-grid" style={{'--nq-layout-columns': '1', '--nq-layout-columns-md': '2'} as React.CSSProperties}>
      <Card data-testid="base-card" header={<h2 className="nq-card-title">{t('بطاقة معلومات', 'Information card')}</h2>} footer={<span>{t('تفاصيل إضافية', 'Additional details')}</span>}><p className="nq-card-description">{t('محتوى واضح بمسافات موحدة.', 'Clear content with consistent spacing.')}</p></Card>
      <Card data-testid="border-card" variant="outlined" header={<h2 className="nq-card-title">{t('بطاقة بإطار', 'Bordered card')}</h2>}><p className="nq-card-description">{t('إطار دون ظل.', 'A border without a shadow.')}</p></Card>
      <Card data-testid="action-card" href="#card-destination" header={<h2 className="nq-card-title">{t('عرض التفاصيل', 'View details')}</h2>}><p className="nq-card-description">{t('الرابط يشمل البطاقة كاملة.', 'The complete card is a native link.')}</p></Card>
      <Card data-testid="disabled-card" href="#disabled-destination" disabled={disabled} onClick={() => setActivations(value => value + 1)} header={<h2 className="nq-card-title">{t('خدمة اختيارية', 'Optional service')}</h2>}><p className="nq-card-description">{t('يمكن تغيير إتاحتها.', 'Availability can be changed.')}</p></Card>
    </section>
    <button className="nq-button" data-testid="toggle-card" onClick={() => setDisabled(!disabled)}>{t('تغيير الإتاحة', 'Toggle availability')}</button>
    <output data-testid="card-activations">{activations}</output>
    <h2 id="card-destination" tabIndex={-1}>{t('تفاصيل البطاقة', 'Card details')}</h2>
    <h2 id="disabled-destination" tabIndex={-1}>{t('الخدمة الاختيارية', 'Optional service details')}</h2>
  </main>;
}
