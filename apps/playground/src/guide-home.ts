import { escape as e, icon, type Locale, type ComponentId } from './data';
import './guide-home.css';

type Framework = 'vanilla' | 'react' | 'vue' | 'angular';
const frameworks: Framework[] = ['vanilla', 'react', 'vue', 'angular'];
const labels = { vanilla: 'Vanilla JS', react: 'React', vue: 'Vue', angular: 'Angular' };
const marks = { vanilla: 'JS', react: 'R', vue: 'V', angular: 'A' };
// DGA preview uses shared semantic tokens. The other palettes are isolated experiments.
const accents = { dga: ['#1b8354', '#166a45', '#f3fcf6'], teal: ['#006a64', '#005750', '#e0f2ec'], emerald: ['#176b47', '#115135', '#e1f1e6'], iris: ['#5144b5', '#3e348c', '#ece8fc'] } as const;
const studio = { accent: 'dga' as keyof typeof accents, compact: false, round: false };

export function renderHome(locale: Locale, selected: string, sample: (id: ComponentId, prefix: string) => string): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const framework = frameworks.includes(selected as Framework) ? selected as Framework : 'vanilla';
  const command = framework === 'vanilla' ? 'pnpm dev' : `pnpm --filter @nasaq/example-${framework} dev`;
  const start = `git clone https://github.com/MohamedEmbarak/nasaq.git\ncd nasaq\npnpm install --frozen-lockfile\npnpm build:packages\n${command}`;
  const featured: [ComponentId, string, string, string][] = [
    ['date-picker', 'Two calendars. One date.', 'تقويمان. تاريخ واحد.', '01'],
    ['combobox', 'Find it as you type.', 'تجدها وأنت تكتب.', '02'],
    ['tabs', 'Give every idea its place.', 'مساحة لكل فكرة.', '03'],
  ];
  return `<div class="home-experience">
  <section class="home-hero" aria-labelledby="home-title">
    <div class="home-intro"><a class="home-release" href="#docs/getting-started"><span></span>${t('Open source. Ready to explore.', 'مفتوح المصدر. مفتوح للإبداع.')}<b dir="ltr">v0.1</b>${icon('arrow',14)}</a>
      <h1 id="home-title">${t('Your next interface.<br><em>In your own rhythm.</em>', 'واجهتك القادمة.<br><em>على نسقك.</em>')}</h1>
      <p class="home-lead">${t('An Arabic-first component system that feels like yours. Explore the parts, try the interactions, and build with the framework you love.', 'نظام مكوّنات يبدأ بالعربية، ويتشكّل بطريقتك. استكشف التفاصيل، جرّب التفاعل، وابنِ بإطار العمل الذي تحب.')}</p>
      <div class="home-actions"><a class="nq-button" href="#docs/getting-started">${t('Start building', 'ابدأ البناء')}${icon('arrow',18)}</a><a class="home-secondary" href="#components">${t('Explore 77 components', 'استكشف ٧٧ مكوّنًا')}${icon('layers',18)}</a></div>
      <div class="home-proof"><span>${icon('globe',16)}${t('Arabic, by default', 'العربية في الأساس')}</span><span>${icon('code',16)}${t('4 native adapters', '٤ أطر عمل')}</span><span>${icon('check',16)}${t('Apache 2.0', 'ترخيص Apache 2.0')}</span></div>
    </div>
    <div class="home-studio"><div class="home-studio-heading"><span class="studio-live"><i></i>${t('A LITTLE LIVE PREVIEW', 'مساحة صغيرة للتجربة')}</span><span class="studio-number" dir="ltr">01 / 03</span></div>
      <div class="home-stage" data-home-stage data-nq-theme="${studio.accent === 'dga' ? 'dga' : 'custom'}" data-nq-mode="light" data-nq-density="${studio.compact ? 'compact' : 'comfortable'}">
        <div class="home-stage-grid" aria-hidden="true"></div><div class="home-floating-label" aria-hidden="true">${t('Make it feel like you', 'غيّر التفاصيل. احتفظ بالاتساق.')}</div>
        <div class="home-request nq-card"><div class="home-request-top"><span class="home-request-icon">${icon('building',23)}</span><span class="nq-badge" data-tone="success">${t('Ready to begin', 'جاهز للبدء')}</span></div>
          <h2>${t('Your next service', 'خدمتك القادمة')}</h2><p>${t('A clear first step makes a difference.', 'الخطوة الأولى الواضحة تصنع الفرق.')}</p>
          <label class="nq-field"><span class="nq-label">${t('Project name', 'اسم المشروع')}</span><input class="nq-input" name="preview-project" placeholder="${t('A new beginning', 'بداية جديدة')}" autocomplete="off"></label>
          <div class="home-request-bottom"><div><span>${t('Your progress', 'تقدّمك')}</span><b data-home-progress>١ من ٣</b></div><progress class="nq-progress" value="1" max="3" aria-label="${t('Preview progress', 'تقدّم المعاينة')}"></progress></div>
          <button class="nq-button home-request-submit" type="button" data-home-continue>${t('Try the next step', 'جرّب الخطوة التالية')}${icon('arrow',17)}</button><span data-home-status class="nq-sr-only" role="status"></span>
        </div>
      </div>
      <div class="home-studio-controls"><fieldset><legend>${t('Palette', 'الألوان')}</legend>${(Object.keys(accents) as (keyof typeof accents)[]).map((name,index)=>`<label class="home-color-choice" title="${t(['DGA-informed baseline','Teal experiment','Emerald experiment','Iris experiment'][index]!,['أساس مستلهم من الهيئة','تجربة بترولية','تجربة زمردية','تجربة بنفسجية'][index]!)}"><input type="radio" name="home-accent" value="${name}" ${studio.accent===name?'checked':''} aria-label="${t(['DGA-informed baseline','Teal experiment','Emerald experiment','Iris experiment'][index]!,['أساس مستلهم من الهيئة','تجربة بترولية','تجربة زمردية','تجربة بنفسجية'][index]!)}"><span style="--swatch:${accents[name][0]}"></span></label>`).join('')}</fieldset><label class="home-toggle"><input type="checkbox" role="switch" class="nq-switch" data-home-compact ${studio.compact?'checked':''}>${t('Compact', 'مكثّف')}</label><label class="home-toggle"><input type="checkbox" role="switch" class="nq-switch" data-home-round ${studio.round?'checked':''}>${t('Soft corners', 'زوايا ناعمة')}</label></div>
      <div class="home-studio-foot"><span>${icon('spark',14)}${t('DGA-informed baseline. Other colors are experiments.', 'أساس مستلهم من الهيئة. الألوان الأخرى تجارب.')}</span><a href="#docs/theming">${t('How it works', 'كيف أخصّصها؟')} ${icon('arrow',14)}</a></div>
    </div>
  </section>
  <section class="home-quickstart" aria-labelledby="quickstart-title"><div><span class="home-section-label">${t('FROM IDEA TO INTERFACE', 'من الفكرة إلى الواجهة')}</span><h2 id="quickstart-title">${t('Your stack.<br>Your starting point.', 'إطارك المفضّل.<br>ونقطة بداية جاهزة.')}</h2><p>${t('One foundation, native components in every framework.', 'أساس واحد، ومكوّنات أصلية في كل إطار عمل.')}</p></div><div class="home-install"><div class="home-frameworks" role="group" aria-label="${t('Choose your framework', 'اختر إطار العمل')}">${frameworks.map(f=>`<button type="button" id="home-framework-${f}" data-framework="${f}" aria-pressed="${framework===f}" class="${framework===f?'selected':''}"><span aria-hidden="true">${marks[f]}</span>${labels[f]}</button>`).join('')}</div><div class="home-terminal" dir="ltr"><div><span class="terminal-prompt" aria-hidden="true">$</span><code>${e(command)}</code></div><button type="button" data-copy="${e(start)}" aria-label="${t('Copy complete setup commands', 'انسخ أوامر الإعداد كاملة')}">${icon('copy',17)}</button></div><div class="home-install-foot"><span>${t('From source · Node 24 · npm release pending', 'من المصدر · Node 24 · النشر على npm لاحقًا')}</span><a href="#docs/${framework}">${t('Setup guide', 'دليل الإعداد')} ${icon('arrow',14)}</a></div></div></section>
  <section class="home-collection" aria-labelledby="collection-title"><div class="home-section-head"><div><span class="home-section-label">${t('LESS READING. MORE TRYING.', 'اقرأ الفكرة. وجرّبها فورًا.')}</span><h2 id="collection-title">${t('Small details.<br>Better experiences.', 'تفاصيل صغيرة.<br>وتجربة تصنع الفرق.')}</h2></div><a class="home-secondary" href="#components">${t('The whole collection', 'المكتبة كاملة')}${icon('arrow',18)}</a></div>
    <div class="home-featured">${featured.map(([id,en,ar,n])=>`<article class="home-feature-card"><div class="home-feature-caption"><span dir="ltr">${n}</span><span>${t(en,ar)}</span>${icon('spark',16)}</div><div class="home-feature-demo">${sample(id,'home-feature-'+id)}</div><a href="#component/${id}">${t(id === 'date-picker' ? 'Explore Date picker' : id === 'combobox' ? 'Explore Combobox' : 'Explore Tabs',id === 'date-picker' ? 'اكتشف منتقي التاريخ' : id === 'combobox' ? 'اكتشف البحث والاختيار' : 'اكتشف التبويبات')}${icon('arrow',17)}</a></article>`).join('')}</div>
  </section>
  <section class="home-paths" aria-labelledby="paths-title"><div class="home-section-head"><div><span class="home-section-label">${t('BUILT TO BE YOURS', 'أساس تتوسّع به')}</span><h2 id="paths-title">${t('Take the next step.', 'اختر خطوتك التالية.')}</h2></div><p>${t('A component, a complete page, or your own visual language.', 'مكوّن واحد، أو صفحة متكاملة، أو لغة بصرية تخصّك.')}</p></div><div class="home-path-grid">
    ${[['layouts','grid','Compose a page','ركّب صفحة','See spacing, columns and responsive behavior change together.','غيّر المسافات والأعمدة وشاهد التجاوب أمامك.'],['inputs','filter','Get the input right','ابدأ بمدخل صحيح','22 native input types, each with its own semantics.','٢٢ نوعًا من المدخلات الأصلية، لكلٍ منها سلوكه.'],['docs/extending','code','Make it your own','أضف طابعك','Extend through tokens, variants and composition.','وسّع النظام بالرموز والأنماط والتركيب.']].map(([url,symbol,en,ar,descEn,descAr],index)=>`<a class="home-path-card" href="#${url}"><div class="home-path-art path-art-${index}" aria-hidden="true">${index===0?'<i></i><i></i><i></i><i></i>':index===1?'<div><span></span><b></b></div><div><span></span><b></b></div>':'<span>{</span><i></i><span>}</span>'}</div><div><span class="home-path-icon">${icon(symbol!,20)}</span><h3>${t(en!,ar!)}</h3><p>${t(descEn!,descAr!)}</p>${icon('arrow',18)}</div></a>`).join('')}
  </div></section>
  <section class="home-manifesto"><div class="home-manifesto-pattern" aria-hidden="true"></div><span class="home-section-label">${t('LOCAL ROOTS. OPEN POSSIBILITIES.', 'جذور محلية. وإمكانات مفتوحة.')}</span><h2>${t('Arabic comes first.<br>Your ideas come next.', 'العربية أولًا.<br>ثم تأتي أفكارك.')}</h2><p>${t('Independent by design. Informed by Saudi DGA Platforms Code, with room for your product to find its own voice.', 'تصميم مستقل يستلهم كود المنصات لهيئة الحكومة الرقمية، ويترك لمنتجك مساحة ليعبّر عن نفسه.')}</p><a href="#docs/alignment">${t('Explore the approach', 'تعرّف على المنهج')}${icon('arrow',18)}</a></section>
  </div>`;
}

export function bindHome(root: HTMLElement, locale: Locale): () => void {
  const stage = root.querySelector<HTMLElement>('[data-home-stage]');
  if (!stage) return () => {};
  const t = (en:string,ar:string) => locale==='ar'?ar:en;
  const apply = () => {
    const [primary,hover,subtle] = accents[studio.accent];
    stage.dataset.nqTheme=studio.accent==='dga'?'dga':'custom';
    for (const [key,value] of Object.entries({primary,'primary-hover':hover,'primary-text':primary,'primary-subtle':subtle})) {
      if (studio.accent==='dga') stage.style.removeProperty('--nq-color-'+key);
      else stage.style.setProperty('--nq-color-'+key,value);
    }
    stage.style.setProperty('--nq-radius-md',studio.round?'1rem':'.5rem');
    stage.style.setProperty('--nq-radius-lg',studio.round?'1rem':'.5rem');
    stage.dataset.nqDensity=studio.compact?'compact':'comfortable';
    stage.classList.toggle('is-compact',studio.compact);
  };
  let progress=1;
  const setProgress=()=>{
    stage.querySelector('progress')!.value=progress;
    stage.querySelector('[data-home-progress]')!.textContent=new Intl.NumberFormat(locale==='ar'?'ar-SA':'en',{numberingSystem:locale==='ar'?'arab':'latn'}).format(progress)+(locale==='ar'?' من ٣':' / 3');
  };
  const onChange=(event:Event)=>{
    const target=event.target as HTMLInputElement;
    if(target.name==='home-accent'&&target.value in accents) studio.accent=target.value as keyof typeof accents;
    if(target.hasAttribute('data-home-compact')) studio.compact=target.checked;
    if(target.hasAttribute('data-home-round')) studio.round=target.checked;
    apply();
  };
  const onClick=(event:Event)=>{
    if(!(event.target as Element).closest('[data-home-continue]'))return;
    progress=progress===3?1:progress+1;setProgress();
    stage.querySelector('[data-home-status]')!.textContent=progress===3?t('Preview complete. Try another design.','اكتملت المعاينة. جرّب طابعًا آخر.'):t(`Preview step ${progress} of 3.`,`خطوة المعاينة ${progress} من ٣.`);
  };
  root.addEventListener('change',onChange);root.addEventListener('click',onClick);apply();setProgress();
  return()=>{root.removeEventListener('change',onChange);root.removeEventListener('click',onClick);};
}
