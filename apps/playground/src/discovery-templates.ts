import { normalizeSearch } from '@hawiyah/core';

type Locale = 'ar' | 'en';
type Copy = readonly [string, string];
const text = (locale: Locale, value: Copy) => value[locale === 'ar' ? 1 : 0];
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export interface DiscoveryItem { id: string; title: Copy; description: Copy; category: 'service' | 'guidance'; route: string }
const items: DiscoveryItem[] = [
  {id:'permit', title:['Building permit','رخصة بناء'], description:['Prepare your application and review the requirements.','جهّز طلبك وراجع المتطلبات.'], category:'service',route:'service'},
  {id:'application', title:['Start an application','بدء طلب'], description:['Enter your details, review and confirm.','أدخل بياناتك وراجعها وأكدها.'], category:'service',route:'form'},
  {id:'journey', title:['Plan your building project','خطّط لمشروع البناء'], description:['Explore connected services and next steps.','استكشف الخدمات المرتبطة والخطوات التالية.'], category:'service',route:'life-journeys'},
  {id:'support', title:['Contact support','التواصل مع الدعم'], description:['Choose a support channel for your question.','اختر قناة دعم لسؤالك.'], category:'service',route:'support'},
  {id:'faq', title:['Frequently asked questions','الأسئلة الشائعة'], description:['Find answers about applications and attachments.','اعثر على إجابات حول الطلبات والمرفقات.'], category:'guidance',route:'faq'},
  {id:'guide', title:['Using the portal','استخدام البوابة'], description:['Read guidance about this demonstration.','اقرأ إرشادات حول هذه التجربة.'], category:'guidance',route:'content'},
  {id:'about', title:['About the portal','عن البوابة'], description:['Learn about the purpose of these services.','تعرّف على هدف هذه الخدمات.'], category:'guidance',route:'about'},
];
const state = {query:'', category:'all', sort:'relevance', page:1};
const pageSize = 3;
const label = (locale:Locale, category:string) => text(locale,category==='service'?['Services','الخدمات']:['Guidance','الإرشادات']);
const itemCard = (item:DiscoveryItem, locale:Locale) => `<article class="${item.category==='service'?'hw-card hw-service-card':'hw-discovery-link'}"><div class="hw-card-body"><span class="hw-badge">${label(locale,item.category)}</span><h3><a href="#templates/${escape(item.route)}">${escape(text(locale,item.title))}</a></h3><p>${escape(text(locale,item.description))}</p></div></article>`;

/** Application-owned demonstration content; no authority marks or official statistics. */
export function renderHome(locale:Locale, variant: 'services' | 'information' = 'services'):string {
  const t=(en:string,ar:string)=>text(locale,[en,ar]);
  const services = `<section class="hw-discovery-section" aria-labelledby="hw-home-services"><h2 id="hw-home-services">${t('Popular services','الخدمات الأكثر طلبًا')}</h2><div class="hw-template-grid">${items.slice(0,3).map(item=>itemCard(item,locale)).join('')}</div><p><a href="#templates/search">${t('View all services','عرض جميع الخدمات')}</a></p></section>`;
  const news = `<section class="hw-discovery-section" aria-labelledby="hw-home-news"><h2 id="hw-home-news">${t('Updates and guidance','المستجدات والإرشادات')}</h2><div class="hw-template-grid">${items.slice(4).map(item=>itemCard(item,locale)).join('')}</div></section>`;
  return `<section class="hw-discovery-hero"><p>${variant === 'information' ? t('Hawiyah information portal','بوابة هوية المعلوماتية') : t('Hawiyah services','خدمات هوية')}</p><h1 tabindex="-1">${variant === 'information' ? t('Information and guidance in one place','المعلومات والإرشادات في مكان واحد') : t('Your services, with clear next steps','خدماتك بخطوات واضحة')}</h1><p>${variant === 'information' ? t('Read the latest guidance and find the information you need.','اطلع على أحدث الإرشادات واعثر على المعلومات التي تحتاجها.') : t('Find the service you need, understand its requirements and prepare your application.','اعثر على الخدمة التي تحتاجها وتعرّف على متطلباتها وجهّز طلبك.')}</p><div class="hw-cluster"><a class="hw-button" href="#templates/search">${t('Explore services','استكشف الخدمات')}</a><a class="hw-button" data-variant="secondary" href="#templates/life-journeys">${t('Explore journeys','استكشف الرحلات')}</a></div></section>
  ${variant === 'information' ? news : services}
  <section class="hw-discovery-section" aria-labelledby="hw-home-statistics"><h2 id="hw-home-statistics">${t('Explore this demonstration','استكشف هذه التجربة')}</h2><dl class="hw-discovery-stats">${[[4,t('Example services','خدمات تجريبية')],[3,t('Application stages','مراحل للطلب')],[2,t('Interface languages','لغات للواجهة')]].map(([value,name])=>`<div class="hw-card"><dt>${name}</dt><dd>${new Intl.NumberFormat(locale, { numberingSystem: 'latn' }).format(Number(value))}</dd></div>`).join('')}</dl></section>
  ${variant === 'information' ? services : news}
  <section class="hw-discovery-section" aria-labelledby="hw-home-partners"><h2 id="hw-home-partners">${t('Service partners','شركاء الخدمة')}</h2><p>${t('Partner information will appear here when available.','ستظهر معلومات الشركاء هنا عند توفرها.')}</p></section>`;
}

export function renderSearch(locale:Locale):string {
  const t=(en:string,ar:string)=>text(locale,[en,ar]);
  return `<header class="hw-template-heading"><h1 tabindex="-1">${t('Search services and guidance','البحث في الخدمات والإرشادات')}</h1><p>${t('Search the local demonstration catalog.','ابحث في دليل الخدمات التجريبي المحلي.')}</p></header><section data-discovery-search>
  <form role="search" class="hw-discovery-search-form"><label class="hw-field"><span class="hw-label">${t('Search query','عبارة البحث')}</span><input class="hw-input" type="search" name="query" value="${escape(state.query)}"></label><button class="hw-button" type="submit"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span>${t('Search','بحث')}</button><button class="hw-button" data-variant="ghost" type="button" data-search-clear><span class="hw-icon" data-icon="cancel-01" aria-hidden="true"></span>${t('Clear search','مسح البحث')}</button></form>
  <details class="hw-discovery-filters" open><summary>${t('Filter and sort results','تصفية النتائج وترتيبها')}</summary><div class="hw-template-search"><label class="hw-field"><span class="hw-label">${t('Content type','نوع المحتوى')}</span><select class="hw-select" name="category">${['all','service','guidance'].map(value=>`<option value="${value}" ${state.category===value?'selected':''}>${value==='all'?t('All types','جميع الأنواع'):label(locale,value)}</option>`).join('')}</select></label><label class="hw-field"><span class="hw-label">${t('Sort by','ترتيب حسب')}</span><select class="hw-select" name="sort"><option value="relevance" ${state.sort==='relevance'?'selected':''}>${t('Relevance','الصلة')}</option><option value="name" ${state.sort==='name'?'selected':''}>${t('Name','الاسم')}</option></select></label><button class="hw-button" data-variant="secondary" type="button" data-search-reset>${t('Reset filters','إعادة ضبط التصفية')}</button></div></details>
  <div data-search-chips class="hw-cluster"></div><p role="status" aria-live="polite" data-search-status></p><div data-search-results aria-busy="true"></div><nav class="hw-pagination" aria-label="${t('Search result pages','صفحات نتائج البحث')}" data-search-pages></nav></section>`;
}

/** Loader is a boundary for application data. Cleanup prevents stale asynchronous rendering. */
export function bindSearch(root:HTMLElement, locale:Locale, load:()=>Promise<DiscoveryItem[]> = async()=>items):()=>void {
  const scope=root.querySelector<HTMLElement>('[data-discovery-search]');
  if(!scope)return ()=>{};
  const t=(en:string,ar:string)=>text(locale,[en,ar]);
  const controller=new AbortController();
  const query=scope.querySelector<HTMLInputElement>('[name=query]')!;
  const category=scope.querySelector<HTMLSelectElement>('[name=category]')!;
  const sort=scope.querySelector<HTMLSelectElement>('[name=sort]')!;
  const status=scope.querySelector<HTMLElement>('[data-search-status]')!;
  const results=scope.querySelector<HTMLElement>('[data-search-results]')!;
  const pages=scope.querySelector<HTMLElement>('[data-search-pages]')!;
  const chips=scope.querySelector<HTMLElement>('[data-search-chips]')!;
  let request=0;
  async function update(focus=false) {
    const current=++request;
    status.textContent=t('Loading results…','جارٍ تحميل النتائج…');
    results.setAttribute('aria-busy','true');results.replaceChildren();pages.replaceChildren();
    chips.innerHTML=state.category==='all'?'':`<button class="hw-chip" type="button" data-search-remove aria-label="${t('Remove filter: ','إزالة التصفية: ')+label(locale,state.category)}">${label(locale,state.category)} ×</button>`;
    try {
      const catalog=await load();
      if(controller.signal.aborted||current!==request)return;
      const normalized=normalizeSearch(state.query);
      const found=catalog.filter(item=>(state.category==='all'||item.category===state.category)&&normalizeSearch(`${text(locale,item.title)} ${text(locale,item.description)}`).includes(normalized));
      if(state.sort==='name')found.sort((a,b)=>text(locale,a.title).localeCompare(text(locale,b.title),locale));
      const count=Math.max(1,Math.ceil(found.length/pageSize));state.page=Math.min(state.page,count);
      status.textContent=t(`${found.length} results${state.query?` for “${state.query}”`:''}`,`${new Intl.NumberFormat(locale, { numberingSystem: 'latn' }).format(found.length)} نتائج${state.query?` عن «${state.query}»`:''}`);
      results.innerHTML=found.length?`<h2 tabindex="-1">${t('Search results','نتائج البحث')}</h2><div class="hw-discovery-results">${found.slice((state.page-1)*pageSize,state.page*pageSize).map(item=>itemCard(item,locale)).join('')}</div>`:`<div class="hw-empty"><h2 tabindex="-1">${t('No matching results','لا توجد نتائج مطابقة')}</h2><p>${t('Try a different query or remove filters.','جرّب عبارة بحث أخرى أو أزل عوامل التصفية.')}</p></div>`;
      pages.innerHTML=count<=1?'':Array.from({length:count},(_,i)=>`<button type="button" class="hw-button" data-variant="${state.page===i+1?'primary':'secondary'}" data-search-page="${i+1}" ${state.page===i+1?'aria-current="page"':''} aria-label="${t('Page ','الصفحة ')}${new Intl.NumberFormat(locale, { numberingSystem: 'latn' }).format(i+1)}">${new Intl.NumberFormat(locale, { numberingSystem: 'latn' }).format(i+1)}</button>`).join('');
      if(focus)results.querySelector<HTMLElement>('h2')?.focus();
    } catch {
      if(controller.signal.aborted||current!==request)return;
      status.textContent=t('Results could not be loaded.','تعذر تحميل النتائج.');
      results.innerHTML=`<button class="hw-button" type="button" data-search-retry>${t('Try again','إعادة المحاولة')}</button>`;
    } finally { if(!controller.signal.aborted&&current===request)results.setAttribute('aria-busy','false'); }
  }
  const listen=(type:string, listener:EventListener)=>scope.addEventListener(type,listener,{signal:controller.signal});
  listen('input',()=>{state.query=query.value;});
  listen('submit',event=>{event.preventDefault();state.query=query.value;state.page=1;void update(true);});
  listen('change',()=>{state.category=category.value;state.sort=sort.value;state.page=1;void update();});
  listen('click',event=>{
    const target=(event.target as Element).closest<HTMLElement>('button');if(!target)return;
    if(target.hasAttribute('data-search-page')){state.page=Number(target.dataset.searchPage);void update(true);}
    else if(target.hasAttribute('data-search-clear')){state.query='';query.value='';state.page=1;void update();query.focus();}
    else if(target.hasAttribute('data-search-reset')||target.hasAttribute('data-search-remove')){state.category='all';category.value='all';state.page=1;if(target.hasAttribute('data-search-reset')){state.sort='relevance';sort.value='relevance';}else category.focus();void update();}
    else if(target.hasAttribute('data-search-retry'))void update();
  });
  void update();
  return ()=>{controller.abort();request++;};
}
