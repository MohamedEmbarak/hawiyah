import { useState } from 'react';
import { Checkbox, Radio, Card, Button, IconButton, InputGroup, TextField, Alert, Badge, ToastRegion, PortalHeader, PortalFooter } from '@hawiyah/react';
export function NicReferenceExample() {
  const [buttonCount, setButtonCount] = useState(0);
  const [english, setEnglish] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [activations, setActivations] = useState(0);
  const t = (ar: string, en: string) => english ? en : ar;
  return <main className="hw-container hw-stack" data-testid="nic-showcase" data-hw-theme="dga" lang={english ? 'en' : 'ar'} dir={english ? 'ltr' : 'rtl'} style={{paddingBlock: '2rem', background: 'var(--hw-color-canvas)', color: 'var(--hw-color-text)'}}>
    <h1>{t('مرجع واجهة المركز', 'NIC UI reference')}</h1>
    <button className="hw-button" onClick={() => setEnglish(!english)}>{english ? 'العربية' : 'English'}</button>
<section className="hw-stack" aria-label={t('الأزرار', 'Buttons')} data-testid="button-showcase">
      <div className="hw-cluster"><span style={{padding: '4px'}}><Button data-testid="button-primary" variant="primary" onClick={() => setButtonCount(n => n + 1)}>{t('أساسي', 'primary')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-default" variant="default" onClick={() => setButtonCount(n => n + 1)}>{t('داكن', 'default')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-secondary" variant="secondary" onClick={() => setButtonCount(n => n + 1)}>{t('ثانوي', 'secondary')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-outline" variant="outline" onClick={() => setButtonCount(n => n + 1)}>{t('بإطار', 'outline')}</Button></span><span style={{padding: '4px', background: '#14573a'}}><Button data-testid="button-outline-white" variant="outline-white" onClick={() => setButtonCount(n => n + 1)}>{t('إطار أبيض', 'outline-white')}</Button></span><span style={{padding: '4px', background: '#14573a'}}><Button data-testid="button-light" variant="light" onClick={() => setButtonCount(n => n + 1)}>{t('أبيض', 'light')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-danger" variant="danger" onClick={() => setButtonCount(n => n + 1)}>{t('خطر', 'danger')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-ghost" variant="ghost" onClick={() => setButtonCount(n => n + 1)}>{t('خفيف', 'ghost')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-soft" variant="soft" onClick={() => setButtonCount(n => n + 1)}>{t('هادئ', 'soft')}</Button></span><span style={{padding: '4px'}}><Button data-testid="button-link" variant="link" onClick={() => setButtonCount(n => n + 1)}>{t('رابط', 'link')}</Button></span></div>
      <Button data-testid="button-disabled" disabled onClick={() => setButtonCount(n => n + 1)}>{t('غير متاح', 'Disabled')}</Button>
      <Button data-testid="button-loading" loading onClick={() => setButtonCount(n => n + 1)}>{t('جارٍ الحفظ', 'Saving')}</Button>
      <IconButton data-testid="button-icon" variant="default" label={t('إضافة', 'Add')} onClick={() => setButtonCount(n => n + 1)}><span className="hw-icon" data-icon="add-01" aria-hidden="true" /></IconButton>
      <output data-testid="button-count">{buttonCount}</output>
    </section>
<section className="hw-stack" data-testid="status-showcase" aria-label={t('الحالات', 'Statuses')}><Alert data-testid="alert-neutral" tone="neutral" title="neutral" role="group"><p>{t('تفاصيل الحالة', 'Status details')}</p></Alert><Badge tone="neutral" data-variant="dot">neutral</Badge><Alert data-testid="alert-info" tone="info" title="info" role="group"><p>{t('تفاصيل الحالة', 'Status details')}</p></Alert><Badge tone="info" data-variant="dot">info</Badge><Alert data-testid="alert-success" tone="success" title="success" role="group"><p>{t('تفاصيل الحالة', 'Status details')}</p></Alert><Badge tone="success" data-variant="dot">success</Badge><Alert data-testid="alert-warning" tone="warning" title="warning" role="group"><p>{t('تفاصيل الحالة', 'Status details')}</p></Alert><Badge tone="warning" data-variant="dot">warning</Badge><Alert data-testid="alert-danger" tone="danger" title="danger" role="group"><p>{t('تفاصيل الحالة', 'Status details')}</p></Alert><Badge tone="danger" data-variant="dot">danger</Badge><Alert data-testid="alert-outline" tone="success" variant="outline" title="Outline" role="group"><p>Details</p></Alert><Alert data-testid="alert-minimal" tone="warning" variant="minimal" title="Minimal" role="group"><p>Details</p></Alert>
    <ToastRegion data-testid="status-toasts" data-variant="inline" label={t('الإشعارات', 'Notifications')} messages={['neutral','info','success','warning','danger'].map(tone => ({id:tone,tone: tone as 'neutral'|'info'|'success'|'warning'|'danger',title:tone,message:t('تفاصيل الإشعار','Notification details')}))} />
    </section><section data-testid="chrome-showcase" onClick={event => { if ((event.target as Element).closest('a[href]')) event.preventDefault(); }}>
      <PortalHeader brand="هوية" homeHref="/" mainId="nic-demo-main" skipLabel={t('انتقل إلى المحتوى', 'Skip to content')} menuLabel={t('القائمة', 'Menu')} navigationLabel={t('التنقل الرئيسي', 'Main navigation')} links={[{label:t('الخدمات','Services'),href:'/services',current:true},{label:t('طلباتي','My requests'),href:'/requests'}]} actions={<Button>{t('تسجيل الدخول','Sign in')}</Button>} />
      <section id="nic-demo-main" tabIndex={-1}><h2>{t('محتوى الصفحة','Page content')}</h2></section>
      <PortalFooter brand="هوية" navigationLabel={t('روابط التذييل', 'Footer links')} externalLabel={t('يفتح في نافذة جديدة', 'opens in a new window')} description={t('منصة توضيحية','Example platform')} links={[{label:t('الخصوصية','Privacy'),href:'/privacy'},{label:t('تواصل معنا','Contact'),href:'/contact'}]} legal="2026" />
    </section>
    <section data-testid="choices-showcase" className="hw-stack">
      <Checkbox id="nic-check" label="Checkbox" /><Checkbox id="nic-mixed" label="Mixed" indeterminate />
      <Checkbox id="nic-disabled" label="Disabled" disabled defaultChecked />
      <Checkbox id="nic-readonly" label="Read only" readOnly defaultChecked />
      <Radio id="nic-radio-a" name="nic-radio" value="a" label="First radio" defaultChecked />
      <Radio id="nic-radio-b" name="nic-radio" value="b" label="Second radio" />
      <Radio id="nic-radio-readonly" name="nic-radio" value="locked" label="Read only radio" readOnly />
    </section><section className="hw-field" data-testid="group-example"><label className="hw-label" htmlFor="group-email">{t('البريد الإلكتروني','Email')}</label><InputGroup data-testid="group-field" start="@"><TextField id="group-email" name="group-email" type="email" defaultValue="ready@example.test" required /></InputGroup></section>
    <section className="hw-grid" style={{'--hw-layout-columns': '1', '--hw-layout-columns-md': '2'} as React.CSSProperties}>
      <Card data-testid="base-card" header={<h2 className="hw-card-title">{t('بطاقة معلومات', 'Information card')}</h2>} footer={<span>{t('تفاصيل إضافية', 'Additional details')}</span>}><p className="hw-card-description">{t('محتوى واضح بمسافات موحدة.', 'Clear content with consistent spacing.')}</p></Card>
      <Card data-testid="border-card" variant="outlined" header={<h2 className="hw-card-title">{t('بطاقة بإطار', 'Bordered card')}</h2>}><p className="hw-card-description">{t('إطار دون ظل.', 'A border without a shadow.')}</p></Card>
      <Card data-testid="action-card" href="#card-destination" header={<h2 className="hw-card-title">{t('عرض التفاصيل', 'View details')}</h2>}><p className="hw-card-description">{t('الرابط يشمل البطاقة كاملة.', 'The complete card is a native link.')}</p></Card>
      <Card data-testid="disabled-card" href="#disabled-destination" disabled={disabled} onClick={() => setActivations(value => value + 1)} header={<h2 className="hw-card-title">{t('خدمة اختيارية', 'Optional service')}</h2>}><p className="hw-card-description">{t('يمكن تغيير إتاحتها.', 'Availability can be changed.')}</p></Card>
    </section>
    <button className="hw-button" data-testid="toggle-card" onClick={() => setDisabled(!disabled)}>{t('تغيير الإتاحة', 'Toggle availability')}</button>
    <output data-testid="card-activations">{activations}</output>
    <h2 id="card-destination" tabIndex={-1}>{t('تفاصيل البطاقة', 'Card details')}</h2>
    <h2 id="disabled-destination" tabIndex={-1}>{t('الخدمة الاختيارية', 'Optional service details')}</h2>
  </main>;
}
