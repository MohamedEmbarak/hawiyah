import { frameworkIcon } from './framework-icons';
import { catalog, escape as e, icon, type Locale, type ComponentId } from './data';
import './guide-home.css';
import { hawiyahMinor, hawiyahVersion } from './release';

type Framework = 'vanilla' | 'react' | 'vue' | 'angular';
const frameworks: Framework[] = ['vanilla', 'react', 'vue', 'angular'];
const labels = { vanilla: 'JavaScript', react: 'React', vue: 'Vue', angular: 'Angular' };
export function renderHome(locale: Locale, selected: string, sample: (id: ComponentId, prefix: string) => string): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const framework = frameworks.includes(selected as Framework) ? selected as Framework : 'vanilla';
  const command = framework === 'vanilla' ? 'pnpm dev' : `pnpm --filter @hawiyah/example-${framework} dev`;
  const start = `git clone https://github.com/MohamedEmbarak/hawiyah.git\ncd hawiyah\ncorepack enable\npnpm install --frozen-lockfile\npnpm build:packages\n${command}`;
  const install = `npm install @hawiyah/styles @hawiyah/${framework}`;
  const usage: Record<Framework, string> = {
    vanilla: "import '@hawiyah/styles/styles.css';\nimport { enhance } from '@hawiyah/vanilla';\n\n// Enhance only application-owned HTML with data-hw hooks.\nconst dispose = enhance(document);\n// Call dispose() before removing the enhanced tree.",
    react: "import '@hawiyah/styles/styles.css';\nimport { Button } from '@hawiyah/react';\n\nexport function Example() {\n  return <Button>Continue</Button>;\n}",
    vue: "<script setup>\nimport '@hawiyah/styles/styles.css';\nimport { Button } from '@hawiyah/vue';\n</script>\n\n<template><Button>Continue</Button></template>",
    angular: "// src/styles.css: @import '@hawiyah/styles/styles.css';\nimport { Component } from '@angular/core';\nimport { HwButtonDirective } from '@hawiyah/angular';\n\n@Component({\n  selector: 'app-example', standalone: true,\n  imports: [HwButtonDirective],\n  template: '<button hwButton>Continue</button>'\n})\nexport class ExampleComponent {}",
  };
  const featured: [ComponentId, string, string, string][] = [
    ['date-picker', 'Gregorian and Umm al-Qura dates.', 'التاريخان الميلادي والهجري (أم القرى).', '01'],
    ['combobox', 'Searchable selection.', 'اختيار مع البحث.', '02'],
    ['tabs', 'Organized content sections.', 'تنظيم المحتوى في أقسام.', '03'],
  ];
  return `<div class="home-experience">
  <section class="home-hero" aria-labelledby="home-title">
    <div class="home-intro"><a class="home-release" href="#docs/getting-started"><span></span>${t('Open source · Apache 2.0', 'مفتوح المصدر · Apache 2.0')}<b dir="ltr">v${hawiyahMinor}</b>${icon('arrow',14)}</a>
      <h1 id="home-title">${t('Built to the<br><em>DGA Platforms Code.</em>', 'مكوّنات واجهات للمنصات الحكومية.<br><em>وفق كود المنصات.</em>')}</h1>
      <p class="home-lead">${t('Hawiyah is a component library built to comply with the Digital Government Authority Platforms Code. It provides design tokens, styles and accessible components for JavaScript, React, Vue and Angular, with full Arabic and English support.', 'هوية مكتبة مكوّنات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وتوفّر رموز التصميم والأنماط والمكوّنات القابلة للوصول لـ JavaScript وReact وVue وAngular، مع دعم كامل للعربية والإنجليزية.')}</p>
      <div class="home-actions"><a class="hw-button" href="#docs/getting-started">${t('Get started', 'ابدأ الاستخدام')}${icon('arrow',18)}</a><a class="home-secondary" href="#components">${t(`Explore ${catalog.length} components`, `استكشف ${catalog.length} مكوّنًا`)}${icon('layers',18)}</a></div>
      <div class="home-proof"><span>${icon('globe',16)}${t('DGA Platforms Code', 'كود المنصات')}</span><span>${icon('code',16)}${t('4 framework adapters', '4 محوّلات لأطر العمل')}</span><span>${icon('check',16)}${t('Apache 2.0', 'ترخيص Apache 2.0')}</span></div>
    </div>
    <div class="home-studio"><div class="home-studio-heading"><span class="studio-live"><i></i>${t('LIVE PREVIEW', 'معاينة مباشرة')}</span><span class="studio-number" dir="ltr">01 / 03</span></div>
      <div class="home-stage" data-home-stage data-hw-theme="dga" data-hw-mode="light" data-hw-density="comfortable">
        <div class="home-stage-grid" aria-hidden="true"></div><div class="home-floating-label" aria-hidden="true">${t('DGA foundations in action', 'أسس كود المنصات في التطبيق')}</div>
        <div class="home-request hw-card"><div class="home-request-top"><span class="home-request-icon">${icon('building',23)}</span><span class="hw-badge" data-tone="success">${t('Ready to begin', 'جاهز للبدء')}</span></div>
          <h2>${t('New service request', 'طلب خدمة جديد')}</h2><p>${t('Enter the project name to continue.', 'أدخل اسم المشروع للمتابعة.')}</p>
          <label class="hw-field"><span class="hw-label">${t('Project name', 'اسم المشروع')}</span><input class="hw-input" name="preview-project" placeholder="${t('Service portal', 'بوابة الخدمات')}" autocomplete="off"></label>
          <div class="home-request-bottom"><div><span>${t('Your progress', 'تقدّمك')}</span><b data-home-progress>1 من 3</b></div><progress class="hw-progress" value="1" max="3" aria-label="${t('Preview progress', 'تقدّم المعاينة')}"></progress></div>
          <button class="hw-button home-request-submit" type="button" data-home-continue>${t('Next step', 'الخطوة التالية')}${icon('arrow',17)}</button><span data-home-status class="hw-sr-only" role="status"></span>
        </div>
      </div>
      <div class="home-studio-foot"><span>${icon('spark',14)}${t('Shared DGA colors, spacing and radii.', 'ألوان ومسافات وزوايا كود المنصات المشتركة.')}</span><a href="#foundations">${t('Explore foundations', 'استكشف الأسس')} ${icon('arrow',14)}</a></div>
    </div>
  </section>
  <section class="home-quickstart" aria-labelledby="quickstart-title"><div><span class="home-section-label">${t('INSTALLATION', 'التثبيت')}</span><h2 id="quickstart-title">${t('Run Hawiyah from source', 'شغّل هوية من المصدر')}</h2><p>${t('Choose an adapter, then follow the complete checkout and setup commands.', 'اختر المحوّل، ثم اتبع أوامر تنزيل المصدر والإعداد كاملة.')}</p></div><div class="home-install"><div class="home-frameworks" role="group" aria-label="${t('Choose your framework', 'اختر إطار العمل')}">${frameworks.map(f=>`<button type="button" id="home-framework-${f}" data-framework="${f}" aria-pressed="${framework===f}" class="${framework===f?'selected':''}"><span class="framework-name">${frameworkIcon(f)}${labels[f]}</span></button>`).join('')}</div><p class="home-setup-note">${t('Run the source checkout with Node 24 and the pinned pnpm version. To add Hawiyah to an existing application, install the published npm packages instead.', 'شغّل نسخة المصدر باستخدام Node 24 وإصدار pnpm المثبّت في المشروع. لإضافة هوية إلى تطبيق قائم، ثبّت الحزم المنشورة على npm بدلًا من ذلك.')}</p><div class="home-terminal" dir="ltr"><pre><code>${e(start)}</code></pre><button type="button" data-copy="${e(start)}" aria-label="${t('Copy complete setup commands', 'انسخ أوامر الإعداد كاملة')}">${icon('copy',17)}</button></div><div class="home-install-foot"><span>${t(`From source · Node 24 · npm ${hawiyahVersion}`, `من المصدر · Node 24 · npm ${hawiyahVersion}`)}</span><a href="#docs/${framework}">${t('Setup guide', 'دليل الإعداد')} ${icon('arrow',14)}</a></div><details class="home-consumer-setup"><summary>${t('Use packages in an existing application', 'استخدم الحزم في تطبيق قائم')}</summary><p>${t('Install the published packages in your existing application. The adapter brings in @hawiyah/core, and @hawiyah/styles brings in @hawiyah/tokens. Version 0.x releases may change APIs between minor versions.', 'ثبّت الحزم المنشورة داخل تطبيقك القائم. يجلب المحوّل حزمة @hawiyah/core، وتجلب @hawiyah/styles حزمة @hawiyah/tokens. قد تتغير الواجهات البرمجية بين الإصدارات الفرعية ما دام الإصدار 0.x.')}</p><div class="home-terminal" dir="ltr"><pre><code>${e(install)}</code></pre><button type="button" data-copy="${e(install)}" aria-label="${t('Copy package installation command', 'انسخ أمر تثبيت الحزم')}">${icon('copy',17)}</button></div><p>${t('Load @hawiyah/styles/styles.css once in the application entry point or global styles. Use the selected adapter setup guide for component imports, framework prerequisites and lifecycle cleanup.', 'حمّل @hawiyah/styles/styles.css مرة واحدة في نقطة دخول التطبيق أو أنماطه العامة. اتبع دليل إعداد المحوّل المحدد لاستيراد المكوّنات ومتطلبات إطار العمل وتنظيف دورة الحياة.')}</p><div class="home-terminal" dir="ltr"><pre><code>${e(usage[framework])}</code></pre><button type="button" data-copy="${e(usage[framework])}" aria-label="${t('Copy package usage example', 'انسخ مثال استخدام الحزمة')}">${icon('copy',17)}</button></div><a href="#docs/${framework}">${t('Open', 'افتح دليل')} ${labels[framework]} ${t('setup and imports', 'الإعداد والاستيراد')}${icon('arrow',14)}</a></details></div></section>
  <section class="home-collection" aria-labelledby="collection-title"><div class="home-section-head"><div><span class="home-section-label">${t('COMPONENT CATALOG', 'فهرس المكوّنات')}</span><h2 id="collection-title">${t('Documented components.<br>Tested behavior.', 'مكوّنات موثقة.<br>وسلوك مختبَر.')}</h2></div><a class="home-secondary" href="#components">${t('Full catalog', 'الفهرس الكامل')}${icon('arrow',18)}</a></div>
    <div class="home-featured">${featured.map(([id,en,ar,n])=>`<article class="home-feature-card"><div class="home-feature-caption"><span dir="ltr">${n}</span><span>${t(en,ar)}</span>${icon('spark',16)}</div><div class="home-feature-demo">${sample(id,'home-feature-'+id)}</div><a href="#component/${id}">${t(id === 'date-picker' ? 'Explore Date picker' : id === 'combobox' ? 'Explore Combobox' : 'Explore Tabs',id === 'date-picker' ? 'اكتشف منتقي التاريخ' : id === 'combobox' ? 'اكتشف البحث والاختيار' : 'اكتشف التبويبات')}${icon('arrow',17)}</a></article>`).join('')}</div>
  </section>
  <section class="home-paths" aria-labelledby="paths-title"><div class="home-section-head"><div><span class="home-section-label">${t('EXTENSION', 'التوسعة')}</span><h2 id="paths-title">${t('Extend within the standard.', 'توسّع ضمن المعيار.')}</h2></div><p>${t('Compose components, page templates and themes through documented tokens and variants.', 'ركّب المكوّنات وقوالب الصفحات والسمات عبر الرموز والمتغيرات الموثقة.')}</p></div><div class="home-path-grid">
    ${[['layouts','grid','Compose a page','ركّب صفحة','See spacing, columns and responsive behavior change together.','غيّر المسافات والأعمدة وشاهد التجاوب أمامك.'],['inputs','filter','Get the input right','ابدأ بمدخل صحيح','22 native input types, each with its own semantics.','22 نوعًا من المدخلات الأصلية، لكلٍ منها سلوكه.'],['docs/extending','code','Make it your own','أضف طابعك','Extend through tokens, variants and composition.','وسّع النظام بالرموز والأنماط والتركيب.']].map(([url,symbol,en,ar,descEn,descAr],index)=>`<a class="home-path-card" href="#${url}"><div class="home-path-art path-art-${index}" aria-hidden="true">${index===0?'<i></i><i></i><i></i><i></i>':index===1?'<div><span></span><b></b></div><div><span></span><b></b></div>':'<span>{</span><i></i><span>}</span>'}</div><div><span class="home-path-icon">${icon(symbol!,20)}</span><h3>${t(en!,ar!)}</h3><p>${t(descEn!,descAr!)}</p>${icon('arrow',18)}</div></a>`).join('')}
  </div></section>
  <section class="home-manifesto"><div class="home-manifesto-pattern" aria-hidden="true"></div><span class="home-section-label">${t('COMPLIANCE APPROACH', 'منهج الامتثال')}</span><h2>${t('Platforms Code foundations.<br>Documented evidence.', 'أسس كود المنصات.<br>وأدلة موثقة.')}</h2><p>${t('The default theme applies the Platforms Code foundations for color, typography, spacing and components. Each requirement is traced to its implementation, with test evidence and open items recorded.', 'تطبّق السمة الافتراضية أسس كود المنصات في الألوان والخطوط والمسافات والمكوّنات، ويُربط كل متطلب بتنفيذه مع توثيق أدلة الاختبار والبنود المفتوحة.')}</p><a href="#docs/alignment">${t('Review compliance evidence', 'راجع أدلة الامتثال')}${icon('arrow',18)}</a></section>
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
