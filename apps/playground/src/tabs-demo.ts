import type {Locale} from './data';

// Keep project recipes usable in Node's export checker without loading guide UI data.
const e = (value: string) => value.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));

export type TabsDemoKind = 'basic' | 'overflow' | 'manual' | 'vertical' | 'scroll' | 'selected-overflow';
export function tabsDemoCases(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return [
    {kind:'basic',title:t('Automatic activation and a disabled tab','تفعيل تلقائي وتبويب معطل')},
    {kind:'overflow',title:t('Long labels and responsive overflow','تسميات طويلة وتبويبات تتكيف مع العرض')},
    {kind:'manual',title:t('Manual activation with Enter or Space','تفعيل يدوي باستخدام Enter أو المسافة')},
    {kind:'vertical',title:t('Vertical tab list','قائمة تبويبات رأسية')},
    {kind:'scroll',title:t('Explicit scrolling tab list','قائمة تبويبات قابلة للتمرير')},
    {kind:'selected-overflow',title:t('Initially selected overflow tab','تبويب مختار ابتدائيًا داخل القائمة الإضافية')},
  ] as const;
}

export function tabsDemoCopy(locale: Locale,kind: TabsDemoKind='basic') {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  const title=tabsDemoCases(locale).find(item=>item.kind===kind)!.title;
  const basic=[
    {value:'first',label:t('Details','التفاصيل'),content:t('Service details','تفاصيل الخدمة')},
    {value:'second',label:t('Requirements','المتطلبات'),content:t('Required documents','المستندات المطلوبة')},
    {value:'third',label:t('Unavailable','غير متاح'),content:'',disabled:true},
  ];
  const longLabels=[
    t('Service overview and eligibility','نظرة عامة على الخدمة والأهلية'),
    t('Application requirements and documents','متطلبات الطلب والمستندات'),
    t('Application steps and processing time','خطوات التقديم ومدة المعالجة'),
    t('Unavailable service channel','قناة خدمة غير متاحة'),
    t('Fees and payment information','الرسوم ومعلومات الدفع'),
    t('Frequently asked questions','الأسئلة المتكررة'),
    t('Related services and resources','الخدمات والموارد ذات الصلة'),
    t('Support and contact information','الدعم ومعلومات التواصل'),
  ];
  const items=['overflow','scroll','selected-overflow'].includes(kind)
    ? longLabels.map((label,index)=>({value:`section-${index+1}`,label,content:`${t('Panel','لوحة')} ${index+1}: ${label}`,disabled:index===3}))
    : basic;
  return {title,items,label:`${t('Service sections','أقسام الخدمة')} · ${title}`,
    more:t('More service sections','المزيد من أقسام الخدمة'),
    orientation:kind==='vertical'?'vertical':'horizontal',
    activation:kind==='manual'?'manual':'automatic',
    overflow:kind==='scroll'?'scroll':'menu',
    initial:kind==='selected-overflow'?'section-8':items[0]!.value,
  };
}

export function tabsDemoMarkup(locale: Locale,kind: TabsDemoKind='basic',prefix=`ready-tabs-${kind}`) {
  const d=tabsDemoCopy(locale,kind);
  return `<div class="nq-tabs" data-nq="tabs" data-nq-activation="${d.activation}" data-nq-overflow="${d.overflow}" data-nq-overflow-label="${e(d.more)}"><div class="nq-tab-list" role="tablist" aria-label="${e(d.label)}" aria-orientation="${d.orientation}">${d.items.map((item,index)=>`<button class="nq-tab" type="button" role="tab" id="${prefix}-tab-${index}" aria-controls="${prefix}-panel-${index}" data-nq-value="${item.value}" aria-selected="${item.value===d.initial}"${item.disabled?' disabled':''}>${e(item.label)}</button>`).join('')}</div>${d.items.map((item,index)=>`<section class="nq-tab-panel" role="tabpanel" id="${prefix}-panel-${index}" aria-labelledby="${prefix}-tab-${index}"${item.value!==d.initial?' hidden':''}>${e(item.content)}</section>`).join('')}</div>`;
}

export function tabsNativeMarkup(locale: Locale,kind: TabsDemoKind='basic',controlled=false) {
  const d=tabsDemoCopy(locale,kind);
  const common=`label="${d.label}" orientation="${d.orientation}" activationMode="${d.activation}" overflow="${d.overflow}" overflowLabel="${d.more}"`;
  return {
    react:`<Tabs ${common} items={${JSON.stringify(d.items)}} ${controlled?'value={value} onValueChange={setValue}':`defaultValue="${d.initial}"`} />`,
    vue:`<Tabs ${common} :items='${JSON.stringify(d.items)}' ${controlled?'v-model="value"':`default-value="${d.initial}"`} />`,
    angular:`<nq-tabs ${common} ${controlled?'[(value)]="value"':`value="${d.initial}"`}>${d.items.map(item=>`<nq-tab value="${item.value}" label="${item.label}"${item.disabled?' disabled':''}>${item.content}</nq-tab>`).join('')}</nq-tabs>`,
  };
}
