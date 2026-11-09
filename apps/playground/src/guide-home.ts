import { frameworkIcon } from './framework-icons';
import { catalog, escape as e, icon, type Locale, type ComponentId } from './data';
import './guide-home.css';
import { nasaqMinor, nasaqVersion } from './release';

type Framework = 'vanilla' | 'react' | 'vue' | 'angular';
const frameworks: Framework[] = ['vanilla', 'react', 'vue', 'angular'];
const labels = { vanilla: 'JavaScript', react: 'React', vue: 'Vue', angular: 'Angular' };
export function renderHome(locale: Locale, selected: string, sample: (id: ComponentId, prefix: string) => string): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const framework = frameworks.includes(selected as Framework) ? selected as Framework : 'vanilla';
  const command = framework === 'vanilla' ? 'pnpm dev' : `pnpm --filter @nasaq/example-${framework} dev`;
  const start = `git clone https://github.com/MohamedEmbarak/nasaq.git\ncd nasaq\ncorepack enable\npnpm install --frozen-lockfile\npnpm build:packages\n${command}`;
  const tarballs = ['tokens', 'styles', 'core', framework].map(name => `../nasaq/.artifacts/package-check/nasaq-${name}-${nasaqVersion}.tgz`).join(' ');
  const install = `pnpm add ${tarballs}`;
  const usage: Record<Framework, string> = {
    vanilla: "import '@nasaq/styles/styles.css';\nimport { enhance } from '@nasaq/vanilla';\n\n// Enhance only application-owned HTML with data-nq hooks.\nconst dispose = enhance(document);\n// Call dispose() before removing the enhanced tree.",
    react: "import '@nasaq/styles/styles.css';\nimport { Button } from '@nasaq/react';\n\nexport function Example() {\n  return <Button>Continue</Button>;\n}",
    vue: "<script setup>\nimport '@nasaq/styles/styles.css';\nimport { Button } from '@nasaq/vue';\n</script>\n\n<template><Button>Continue</Button></template>",
    angular: "// src/styles.css: @import '@nasaq/styles/styles.css';\nimport { Component } from '@angular/core';\nimport { NqButtonDirective } from '@nasaq/angular';\n\n@Component({\n  selector: 'app-example', standalone: true,\n  imports: [NqButtonDirective],\n  template: '<button nqButton>Continue</button>'\n})\nexport class ExampleComponent {}",
  };
  const featured: [ComponentId, string, string, string][] = [
    ['date-picker', 'Two calendars. One date.', 'تقويمان. تاريخ واحد.', '01'],
    ['combobox', 'Find it as you type.', 'تجدها وأنت تكتب.', '02'],
    ['tabs', 'Give every idea its place.', 'مساحة لكل فكرة.', '03'],
  ];
  return `<div class="home-experience">
  <section class="home-hero" aria-labelledby="home-title">
    <div class="home-intro"><a class="home-release" href="#docs/getting-started"><span></span>${t('Open source. Ready to explore.', 'مفتوح المصدر. مفتوح للإبداع.')}<b dir="ltr">v${nasaqMinor}</b>${icon('arrow',14)}</a>
      <h1 id="home-title">${t('Your next interface.<br><em>In your own rhythm.</em>', 'واجهتك القادمة.<br><em>على نسقك.</em>')}</h1>
      <p class="home-lead">${t('An Arabic-first component system that feels like yours. Explore the parts, try the interactions, and build with the framework you love.', 'نظام مكوّنات يبدأ بالعربية، ويتشكّل بطريقتك. استكشف التفاصيل، جرّب التفاعل، وابنِ بإطار العمل الذي تحب.')}</p>
      <div class="home-actions"><a class="nq-button" href="#docs/getting-started">${t('Start building', 'ابدأ البناء')}${icon('arrow',18)}</a><a class="home-secondary" href="#components">${t(`Explore ${catalog.length} components`, `استكشف ${catalog.length} مكوّنًا`)}${icon('layers',18)}</a></div>
      <div class="home-proof"><span>${icon('globe',16)}${t('Arabic, by default', 'العربية في الأساس')}</span><span>${icon('code',16)}${t('4 native adapters', '4 أطر عمل')}</span><span>${icon('check',16)}${t('Apache 2.0', 'ترخيص Apache 2.0')}</span></div>
    </div>
    <div class="home-studio"><div class="home-studio-heading"><span class="studio-live"><i></i>${t('A LITTLE LIVE PREVIEW', 'مساحة صغيرة للتجربة')}</span><span class="studio-number" dir="ltr">01 / 03</span></div>
      <div class="home-stage" data-home-stage data-nq-theme="dga" data-nq-mode="light" data-nq-density="comfortable">
        <div class="home-stage-grid" aria-hidden="true"></div><div class="home-floating-label" aria-hidden="true">${t('DGA foundations in action', 'أسس كود المنصات في التطبيق')}</div>
        <div class="home-request nq-card"><div class="home-request-top"><span class="home-request-icon">${icon('building',23)}</span><span class="nq-badge" data-tone="success">${t('Ready to begin', 'جاهز للبدء')}</span></div>
          <h2>${t('Your next service', 'خدمتك القادمة')}</h2><p>${t('A clear first step makes a difference.', 'الخطوة الأولى الواضحة تصنع الفرق.')}</p>
          <label class="nq-field"><span class="nq-label">${t('Project name', 'اسم المشروع')}</span><input class="nq-input" name="preview-project" placeholder="${t('A new beginning', 'بداية جديدة')}" autocomplete="off"></label>
          <div class="home-request-bottom"><div><span>${t('Your progress', 'تقدّمك')}</span><b data-home-progress>1 من 3</b></div><progress class="nq-progress" value="1" max="3" aria-label="${t('Preview progress', 'تقدّم المعاينة')}"></progress></div>
          <button class="nq-button home-request-submit" type="button" data-home-continue>${t('Try the next step', 'جرّب الخطوة التالية')}${icon('arrow',17)}</button><span data-home-status class="nq-sr-only" role="status"></span>
        </div>
      </div>
      <div class="home-studio-foot"><span>${icon('spark',14)}${t('Shared DGA colors, spacing and radii.', 'ألوان ومسافات وزوايا كود المنصات المشتركة.')}</span><a href="#foundations">${t('Explore foundations', 'استكشف الأسس')} ${icon('arrow',14)}</a></div>
    </div>
  </section>
  <section class="home-quickstart" aria-labelledby="quickstart-title"><div><span class="home-section-label">${t('FROM IDEA TO INTERFACE', 'من الفكرة إلى الواجهة')}</span><h2 id="quickstart-title">${t('Run Nasaq from source', 'شغّل نسق من المصدر')}</h2><p>${t('Choose an adapter, then follow the complete checkout and setup commands.', 'اختر المحوّل، ثم اتبع أوامر تنزيل المصدر والإعداد كاملة.')}</p></div><div class="home-install"><div class="home-frameworks" role="group" aria-label="${t('Choose your framework', 'اختر إطار العمل')}">${frameworks.map(f=>`<button type="button" id="home-framework-${f}" data-framework="${f}" aria-pressed="${framework===f}" class="${framework===f?'selected':''}"><span class="framework-name">${frameworkIcon(f)}${labels[f]}</span></button>`).join('')}</div><p class="home-setup-note">${t('Run the source checkout with Node 24 and the pinned pnpm version. These packages are private source previews, not published npm packages.', 'شغّل نسخة المصدر باستخدام Node 24 وإصدار pnpm المثبّت في المشروع. الحزم معاينات مصدر خاصة وليست منشورة على npm.')}</p><div class="home-terminal" dir="ltr"><pre><code>${e(start)}</code></pre><button type="button" data-copy="${e(start)}" aria-label="${t('Copy complete setup commands', 'انسخ أوامر الإعداد كاملة')}">${icon('copy',17)}</button></div><div class="home-install-foot"><span>${t('From source · Node 24 · npm release pending', 'من المصدر · Node 24 · النشر على npm لاحقًا')}</span><a href="#docs/${framework}">${t('Setup guide', 'دليل الإعداد')} ${icon('arrow',14)}</a></div><details class="home-consumer-setup"><summary>${t('Use packages in an existing application', 'استخدم الحزم في تطبيق قائم')}</summary><p>${t('After the build, run pnpm check:packages in the Nasaq checkout. It creates and validates local package archives in .artifacts/package-check. Then run the following from your existing application; this example assumes the Nasaq checkout is a sibling directory named nasaq.', 'بعد البناء، شغّل pnpm check:packages داخل نسخة نسق. ينشئ الأمر أرشيفات الحزم المحلية ويتحقق منها في .artifacts/package-check. ثم شغّل الأمر التالي داخل تطبيقك القائم؛ يفترض المثال أن نسخة نسق في مجلد مجاور باسم nasaq.')}</p><div class="home-terminal" dir="ltr"><pre><code>${e(install)}</code></pre><button type="button" data-copy="${e(install)}" aria-label="${t('Copy local package installation command', 'انسخ أمر تثبيت الحزم المحلية')}">${icon('copy',17)}</button></div><p>${t('Load @nasaq/styles/styles.css once in the application entry point or global styles. Use the selected adapter setup guide for component imports, framework prerequisites and lifecycle cleanup.', 'حمّل @nasaq/styles/styles.css مرة واحدة في نقطة دخول التطبيق أو أنماطه العامة. اتبع دليل إعداد المحوّل المحدد لاستيراد المكوّنات ومتطلبات إطار العمل وتنظيف دورة الحياة.')}</p><div class="home-terminal" dir="ltr"><pre><code>${e(usage[framework])}</code></pre><button type="button" data-copy="${e(usage[framework])}" aria-label="${t('Copy package usage example', 'انسخ مثال استخدام الحزمة')}">${icon('copy',17)}</button></div><a href="#docs/${framework}">${t('Open', 'افتح دليل')} ${labels[framework]} ${t('setup and imports', 'الإعداد والاستيراد')}${icon('arrow',14)}</a></details></div></section>
  <section class="home-collection" aria-labelledby="collection-title"><div class="home-section-head"><div><span class="home-section-label">${t('LESS READING. MORE TRYING.', 'اقرأ الفكرة. وجرّبها فورًا.')}</span><h2 id="collection-title">${t('Small details.<br>Better experiences.', 'تفاصيل صغيرة.<br>وتجربة تصنع الفرق.')}</h2></div><a class="home-secondary" href="#components">${t('The whole collection', 'المكتبة كاملة')}${icon('arrow',18)}</a></div>
    <div class="home-featured">${featured.map(([id,en,ar,n])=>`<article class="home-feature-card"><div class="home-feature-caption"><span dir="ltr">${n}</span><span>${t(en,ar)}</span>${icon('spark',16)}</div><div class="home-feature-demo">${sample(id,'home-feature-'+id)}</div><a href="#component/${id}">${t(id === 'date-picker' ? 'Explore Date picker' : id === 'combobox' ? 'Explore Combobox' : 'Explore Tabs',id === 'date-picker' ? 'اكتشف منتقي التاريخ' : id === 'combobox' ? 'اكتشف البحث والاختيار' : 'اكتشف التبويبات')}${icon('arrow',17)}</a></article>`).join('')}</div>
  </section>
  <section class="home-paths" aria-labelledby="paths-title"><div class="home-section-head"><div><span class="home-section-label">${t('BUILT TO BE YOURS', 'أساس تتوسّع به')}</span><h2 id="paths-title">${t('Take the next step.', 'اختر خطوتك التالية.')}</h2></div><p>${t('A component, a complete page, or your own visual language.', 'مكوّن واحد، أو صفحة متكاملة، أو لغة بصرية تخصّك.')}</p></div><div class="home-path-grid">
    ${[['layouts','grid','Compose a page','ركّب صفحة','See spacing, columns and responsive behavior change together.','غيّر المسافات والأعمدة وشاهد التجاوب أمامك.'],['inputs','filter','Get the input right','ابدأ بمدخل صحيح','22 native input types, each with its own semantics.','22 نوعًا من المدخلات الأصلية، لكلٍ منها سلوكه.'],['docs/extending','code','Make it your own','أضف طابعك','Extend through tokens, variants and composition.','وسّع النظام بالرموز والأنماط والتركيب.']].map(([url,symbol,en,ar,descEn,descAr],index)=>`<a class="home-path-card" href="#${url}"><div class="home-path-art path-art-${index}" aria-hidden="true">${index===0?'<i></i><i></i><i></i><i></i>':index===1?'<div><span></span><b></b></div><div><span></span><b></b></div>':'<span>{</span><i></i><span>}</span>'}</div><div><span class="home-path-icon">${icon(symbol!,20)}</span><h3>${t(en!,ar!)}</h3><p>${t(descEn!,descAr!)}</p>${icon('arrow',18)}</div></a>`).join('')}
  </div></section>
  <section class="home-manifesto"><div class="home-manifesto-pattern" aria-hidden="true"></div><span class="home-section-label">${t('LOCAL ROOTS. OPEN POSSIBILITIES.', 'جذور محلية. وإمكانات مفتوحة.')}</span><h2>${t('Arabic comes first.<br>Your ideas come next.', 'العربية أولًا.<br>ثم تأتي أفكارك.')}</h2><p>${t('Independent by design. Informed by Saudi DGA Platforms Code, with room for your product to find its own voice.', 'تصميم مستقل يستلهم كود المنصات لهيئة الحكومة الرقمية، ويترك لمنتجك مساحة ليعبّر عن نفسه.')}</p><a href="#docs/alignment">${t('Explore the approach', 'تعرّف على المنهج')}${icon('arrow',18)}</a></section>
  </div>`;
}

export function bindHome(root: HTMLElement, locale: Locale): () => void {
  const stage = root.querySelector<HTMLElement>('[data-home-stage]');
  if (!stage) return () => {};
  const t = (en:string,ar:string) => locale==='ar'?ar:en;
  let progress=1;
  const setProgress=()=>{
    stage.querySelector('progress')!.value=progress;
    stage.querySelector('[data-home-progress]')!.textContent=new Intl.NumberFormat(locale==='ar'?'ar-SA':'en',{numberingSystem:'latn'}).format(progress)+(locale==='ar'?' من 3':' / 3');
  };
  const onClick=(event:Event)=>{
    if(!(event.target as Element).closest('[data-home-continue]'))return;
    progress=progress===3?1:progress+1;setProgress();
    stage.querySelector('[data-home-status]')!.textContent=progress===3?t('Preview complete. Start again.','اكتملت المعاينة. ابدأ من جديد.'):t(`Preview step ${progress} of 3.`,`خطوة المعاينة ${progress} من 3.`);
  };
  root.addEventListener('click',onClick);setProgress();
  return()=>{root.removeEventListener('click',onClick);};
}
