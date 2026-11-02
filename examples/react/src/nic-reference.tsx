import { useState } from 'react';
import { Card } from '@nasaq/react';
export function NicReferenceExample() {
  const [english, setEnglish] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [activations, setActivations] = useState(0);
  const t = (ar: string, en: string) => english ? en : ar;
  return <main className="nq-container nq-stack" data-testid="nic-showcase" data-nq-theme="dga" lang={english ? 'en' : 'ar'} dir={english ? 'ltr' : 'rtl'} style={{paddingBlock: '2rem'}}>
    <h1>{t('مرجع واجهة المركز', 'NIC UI reference')}</h1>
    <button className="nq-button" onClick={() => setEnglish(!english)}>{english ? 'العربية' : 'English'}</button>
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
