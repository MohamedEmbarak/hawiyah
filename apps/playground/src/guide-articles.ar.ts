/** Full Arabic guide articles. Keep code samples synchronized with the English guide. */
type Code = (value: string) => string;

const samples: Record<string, readonly string[]> = {
  "getting-started": [
    "npm install --global pnpm@11.25.0\ngit clone https://github.com/MohamedEmbarak/nasaq.git\ncd nasaq\npnpm install --frozen-lockfile\npnpm build:packages\npnpm dev",
    "import '@nasaq/styles/reset.css'; // Optional\nimport '@nasaq/styles/styles.css';",
    "<main lang=\"ar\" dir=\"rtl\"\n      data-nq-theme=\"dga\" data-nq-mode=\"light\"\n      data-nq-density=\"comfortable\">\n  <button type=\"button\" class=\"nq-button\">ابدأ الطلب</button>\n</main>",
    "pnpm build\npnpm test\npnpm test:browser\npnpm check:packages"
  ],
  "vanilla": [
    "pnpm build:packages\npnpm dev",
    "<div id=\"application\" lang=\"ar\" dir=\"rtl\" data-nq-theme=\"dga\">\n  <div class=\"nq-field\">\n    <label class=\"nq-label\" for=\"name\">الاسم الكامل</label>\n    <input id=\"name\" name=\"name\" class=\"nq-input\"\n           autocomplete=\"name\" required aria-describedby=\"name-hint\">\n    <span id=\"name-hint\" class=\"nq-hint\">كما يظهر في المستند.</span>\n  </div>\n  <button type=\"button\" class=\"nq-button\">متابعة</button>\n</div>",
    "import '@nasaq/styles/styles.css';\nimport { enhance } from '@nasaq/vanilla';\n\nconst root = document.querySelector('#application');\nif (!root) throw new Error('Application root not found.');\nlet dispose = enhance(root);\n\nfunction replaceView(markup) {\n  dispose();\n  root.innerHTML = markup; // Use only your own trusted templates.\n  dispose = enhance(root);\n}\n\n// When leaving this view:\ndispose();"
  ],
  "react": [
    "pnpm build:packages\npnpm --filter @nasaq/example-react dev",
    "import { useState } from 'react';\nimport { Button, TextField } from '@nasaq/react';\nimport '@nasaq/styles/styles.css';\n\nexport function RequestForm() {\n  const [name, setName] = useState('');\n  return (\n    <form lang=\"ar\" dir=\"rtl\" onSubmit={event => event.preventDefault()}>\n      <TextField label=\"الاسم الكامل\" name=\"name\" required\n        value={name} onChange={event => setName(event.currentTarget.value)} />\n      <Button type=\"submit\">متابعة</Button>\n    </form>\n  );\n}"
  ],
  "vue": [
    "pnpm build:packages\npnpm --filter @nasaq/example-vue dev",
    "<script setup lang=\"ts\">\nimport { ref } from 'vue';\nimport { Button, Dialog, TextField } from '@nasaq/vue';\nimport '@nasaq/styles/styles.css';\nconst name = ref('');\nconst reviewing = ref(false);\n</script>\n\n<template>\n  <form lang=\"ar\" dir=\"rtl\" @submit.prevent=\"reviewing = true\">\n    <TextField v-model=\"name\" label=\"الاسم\" name=\"name\" required />\n    <Button type=\"submit\">مراجعة</Button>\n  </form>\n  <Dialog v-model:open=\"reviewing\" title=\"مراجعة الطلب\" close-label=\"إغلاق\">\n    <p>{{ name }}</p>\n    <template #footer=\"{ close }\"><Button @click=\"close\">تم</Button></template>\n  </Dialog>\n</template>"
  ],
  "angular": [
    "pnpm build:packages\npnpm --filter @nasaq/example-angular dev",
    "import { Component } from '@angular/core';\nimport { FormsModule } from '@angular/forms';\nimport { NqButtonDirective, NqTextFieldComponent } from '@nasaq/angular';\n\n@Component({\n  standalone: true,\n  imports: [FormsModule, NqButtonDirective, NqTextFieldComponent],\n  template: `\n    <form #form=\"ngForm\" lang=\"ar\" dir=\"rtl\" (ngSubmit)=\"save()\">\n      <nq-text-field controlId=\"name\" label=\"الاسم\" name=\"name\"\n        [(ngModel)]=\"name\" [required]=\"true\" />\n      <button nqButton type=\"submit\">حفظ</button>\n      <button nqButton variant=\"secondary\" type=\"button\"\n        (click)=\"form.resetForm()\">إعادة تعيين</button>\n    </form>\n  `,\n})\nexport class RequestForm {\n  name = '';\n  save() { /* Your application action. */ }\n}"
  ],
  "theming": [
    "<main data-nq-theme=\"dga\" data-nq-mode=\"dark\"\n      data-nq-density=\"comfortable\" lang=\"ar\" dir=\"rtl\">\n  <!-- Components inherit this context. -->\n</main>",
    "[data-nq-theme=\"custom\"] {\n  --nq-color-primary: #293b8f;\n  --nq-color-primary-hover: #1d2c70;\n  --nq-color-on-primary: #ffffff;\n  --nq-color-primary-subtle: #dadff7;\n  --nq-color-primary-text: #293b8f;\n  --nq-radius-md: 0.5rem;\n}"
  ],
  "layouts": [
    "<main class=\"nq-container\">\n  <section class=\"nq-stack\" style=\"--nq-layout-gap:var(--nq-space-6)\">\n    <header class=\"nq-page-header\"><h1>الخدمات</h1></header>\n    <div class=\"nq-grid\" style=\"--nq-layout-columns:auto-fit;--nq-layout-min-item:18rem\">\n      <article class=\"nq-card\"><div class=\"nq-card-body\">خدمة أولى</div></article>\n      <article class=\"nq-card\"><div class=\"nq-card-body\">خدمة ثانية</div></article>\n    </div>\n  </section>\n</main>",
    "import { Container, Grid, Card, Stack } from '@nasaq/react';\n\n<Container maxWidth=\"78rem\">\n  <Stack gap={{ base: 4, lg: 6 }}>\n    <h1>Services</h1>\n    <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>\n      <Card>First service</Card>\n      <Card>Second service</Card>\n    </Grid>\n  </Stack>\n</Container>"
  ],
  "lifecycle": [],
  "calendars": [
    "const selectedDay = \"2026-10-28\"; // YYYY-MM-DD\n// The calendar can display this same day in Gregorian or Umm al-Qura."
  ],
  "accessibility": [
    "pnpm test\npnpm test:browser"
  ],
  "extending": [
    "pnpm new:component request-summary",
    "Read AGENTS.md, CONTRACT.md, EXPANSION.md, and components.json.\nUse actual exports and examples.\nExtend documented tokens or composition first.\nPreserve names, roles, keyboard behavior, focus, RTL, and cleanup.\nDescribe the change and run the checks appropriate to its behavior."
  ],
  "alignment": []
};

const articles: Record<string, string> = {
  "getting-started": `
<p class="guide-lead">ابنِ واجهة خدمات باستخدام HTML واضح الدلالة، وتنسيقات مشتركة، وإطار العمل الذي تعرفه. يفصل نسق الأساس البصري عن سلوك التفاعل لتتمكن من تعديل كل منهما بوضوح.</p>
<aside class="guide-note"><strong>مصدر متاح · الإصدار 0.1 قيد التطوير</strong><p>تتوفر شفرة نسق على GitHub بترخيص Apache 2.0. لم تُنشر الحزم على npm بعد. ابدأ من المستودع وأمثلته الجاهزة؛ تُحلّ استيرادات <code>@nasaq/*</code> الواردة هنا من حزم مساحة العمل.</p></aside>
<h2 id="run-source">١. شغّل المشروع من المصدر</h2>
<p>استخدم Node.js 24 وpnpm 11.25.0 لمطابقة أدوات المستودع. يتضمن الأمر الأول تثبيت pnpm إن لم يكن متاحًا لديك.</p>
{{code:0}}
<p>افتح العنوان المحلي الذي يطبعه Vite. التطبيق الافتراضي هو دليل نسق ومعرض التجربة المبني بـJavaScript دون إطار عمل.</p>
<h2 id="choose-framework">٢. اختر نقطة البداية</h2>
<div class="guide-choice-grid">
<a class="guide-choice" href="#docs/vanilla"><span><bdi>HTML + JavaScript</bdi></span><p>ابدأ بعناصر HTML الأصلية، وأضف السلوك للمكونات التي تحتاج إليه.</p><b>إعداد JavaScript ←</b></a>
<a class="guide-choice" href="#docs/react"><span><bdi>React</bdi></span><p>استخدم مكونات React وحالة التطبيق وأساليب العرض المعتادة.</p><b>إعداد React ←</b></a>
<a class="guide-choice" href="#docs/vue"><span><bdi>Vue</bdi></span><p>اربط القيم باستخدام <code>v-model</code>، وركّب المحتوى عبر فتحات المحتوى (slots).</p><b>إعداد Vue ←</b></a>
<a class="guide-choice" href="#docs/angular"><span><bdi>Angular</bdi></span><p>استخدم المكونات المستقلة وتكامل النماذج في Angular.</p><b>إعداد Angular ←</b></a>
</div>
<h2 id="styles-context">٣. حمّل التنسيقات وحدّد السياق</h2>
<p>استورد ملف التنسيق مرة واحدة عند نقطة دخول تطبيقك. ملف إعادة الضبط اختياري؛ حمّله أولًا إذا احتجت إليه. يختار كل تطبيق الخطوط التي يحمّلها.</p>
{{code:1}}
{{code:2}}
<h2 id="first-component">٤. استكشف مكونًا كاملًا</h2>
<p>تحتوي صفحة كل مكون على مثال تفاعلي، وشفرة قابلة للنسخ، ومرجع للواجهات البرمجية، ودورة الحياة، وإرشادات إمكانية الوصول، وحدود التنفيذ. ابدأ بـ<a href="#component/text-field">حقل النص</a> أو <a href="#component/dialog">الحوار</a> أو <a href="#component/date-picker">منتقي التاريخ</a>، ثم ركّب صفحتك في <a href="#layouts">استوديو التخطيط</a>.</p>
<h2 id="verify-changes">٥. تحقّق من التغييرات</h2>
{{code:3}}
<p>تحتاج اختبارات المتصفح إلى Chromium. حدّد مسار نسخة محلية عبر <code>NASAQ_CHROMIUM</code> عند الحاجة. تفحص أوامر الحزم أرشيفات محلية وتختبر استهلاكها؛ لا تنشر شيئًا على npm. يوضح <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/validation.md" target="_blank" rel="noopener">سجل التحقق ↗</a> نطاق الفحوص الفعلية وما بقي منها.</p>
<h2 id="package-layers">تعرّف على طبقات الحزم</h2>
<div class="guide-table-wrap" tabindex="0" role="region" aria-label="جدول الحزم، قابل للتمرير">
<table class="nq-table"><thead><tr><th>الحزمة</th><th>المسؤولية</th></tr></thead><tbody>
<tr><td><code>@nasaq/tokens</code></td><td>قيم التصميم الدلالية ومتغيرات السمات.</td></tr>
<tr><td><code>@nasaq/styles</code></td><td>تنسيقات المكونات، وأدوات التخطيط المتجاوب، وإعادة الضبط الاختيارية.</td></tr>
<tr><td><code>@nasaq/core</code></td><td>منطق مشترك مستقل عن العرض، وتحويل التواريخ، والتنسيق، وأدوات التخطيط.</td></tr>
<tr><td><code>@nasaq/vanilla</code></td><td>إضافة التفاعل إلى عناصر DOM مع إتاحة إنهاء التفعيل وتنظيف آثاره.</td></tr>
<tr><td><code>@nasaq/react</code><br><code>@nasaq/vue</code><br><code>@nasaq/angular</code></td><td>مكونات طبيعية لكل إطار، متكاملة مع حالته ودورة حياته.</td></tr>
</tbody></table></div>
<p>للتجربة في تطبيق آخر قبل إصدار npm، اتبع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/scripts/check-packages.mjs" target="_blank" rel="noopener">إعداد استهلاك الحزم المحلية المستخدم في الفحوص ↗</a>، أو اعمل داخل أحد تطبيقات الأمثلة. لا تفترض أن أي حزمة موجودة في السجل تحمل الاسم نفسه تابعة لهذا المشروع.</p>
`,
  "vanilla": `
<p class="guide-lead">ابدأ بعناصر HTML الأصلية. أضف متحكمًا عندما يتطلب التفاعل سلوكًا إضافيًا.</p>
<h2 id="run-example">شغّل المثال</h2>
{{code:0}}
<h2 id="semantic-markup">اكتب HTML يعبّر عن وظيفة المحتوى</h2>
<p>اربط التسمية بالحقل، وحدّد اسم القيمة داخل النموذج، وأبقِ المساعدة ظاهرة ومتاحة للتقنيات المساعدة. لا تحتاج هذه الأساسيات إلى متحكم JavaScript.</p>
{{code:1}}
<h2 id="mount-cleanup">فعّل السلوك بعد الإدراج، ونظّفه قبل الاستبدال</h2>
{{code:2}}
<p>تبحث الدالة <code>enhance</code> عن علامات <code>data-nq</code> الصريحة لتفعيل التبويبات، والحوارات، والقوائم القابلة للبحث، والتقاويم، وقوائم الإجراءات وغيرها. تحتفظ الأزرار والتسميات والحقول وقوائم الاختيار الأصلية وأقسام <code>details/summary</code> بسلوك المتصفح دون هذا التفعيل. حافظ على استقرار عناصر DOM ما دام المتحكم مرتبطًا بها.</p>
<aside class="guide-note"><strong>جهة واحدة تدير كل جزء من DOM</strong><p>لا تستخدم تفعيل vanilla على شجرة مكونات يديرها React أو Vue أو Angular. تتولى حزمة كل إطار حالتها التفاعلية وتنظيفها بالفعل.</p></aside>
<h2 id="events-data">اربط أحداث التطبيق وبياناته</h2>
<p>تحتفظ الحقول الأصلية بالأسماء، والتحقق من الحقول المطلوبة، و<code>FormData</code>، وأحداث <code>input</code> و<code>change</code>. توفّر المكونات الأغنى أحداثًا موثقة أو قيمًا مؤكدة داخل حقول مخفية. تعامل مع نص البحث في Combobox والقيمة المختارة منه باعتبارهما معلومتين مختلفتين. تختار حقول الملفات ملفات محلية؛ يتولى تطبيقك نقلها إلى الخادم.</p>
<p>تابع إلى <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/packages/vanilla/README.md" target="_blank" rel="noopener">مرجع vanilla ↗</a> و<a href="https://github.com/MohamedEmbarak/nasaq/blob/main/packages/vanilla/EXPANSION-API.md" target="_blank" rel="noopener">العقد الكامل لبنية التفعيل ↗</a> لمعرفة العلامات والواجهات الفعلية لكل متحكم.</p>
`,
  "react": `
<p class="guide-lead">استخدم مكونات مبنية خصيصًا لـReact، مع حالة يديرها التطبيق أو يحتفظ بها العنصر نفسه. تتولى ملفات CSS المشتركة المظهر.</p>
<h2 id="run-example">شغّل مثال React</h2>
{{code:0}}
<h2 id="controlled-field">حقل تدير قيمته حالة التطبيق</h2>
<p>مرّر القيمة الحالية إلى الحقل، وحدّثها عند حدث التغيير. يبقى التحقق والإرسال ضمن النموذج المعتاد في React.</p>
{{code:1}}
<h2 id="interaction-owner">حدّد مسؤولية التفاعل</h2>
<ul>
<li>استخدم <code>value/defaultValue</code> أو <code>checked/defaultChecked</code> مع <code>onChange</code> للحقول الأصلية. توفّر مكونات مثل Combobox وTabs واجهة <code>onValueChange</code>.</li>
<li>تشير مراجع العناصر (refs) في React 19 إلى عنصر التحكم الأصلي الرئيسي. تظل سمات HTML وARIA و<code>className</code> ومعالجات الأحداث متاحة.</li>
<li>يقبل Dialog الزوج <code>open/onOpenChange</code> أو القيمة <code>defaultOpen</code>، ويعيد التركيز إلى زر الفتح ما دام متصلًا بالصفحة عند الإغلاق. لا تضف آلية ثانية لحصر التركيز داخله.</li>
<li>يتولى React تركيب المكونات وتنظيف التأثيرات. لا تستدعِ متحكمات vanilla داخل مكون React.</li>
</ul>
<h2 id="server-rendering">العرض على الخادم وربط التفاعل</h2>
<p>لا تصل الاستيرادات والعرض على الخادم إلى كائنات المتصفح العامة. تُنشأ المعرّفات باستخدام <code>useId</code> في React، وتُفتح الحوارات الأصلية بعد تركيب المكون. حافظ على تطابق البيانات الأولية بين الخادم والعميل، واتبع متطلبات React المعتادة لعملية hydration، أي ربط HTML المولّد على الخادم بالتفاعل. يصف سجل التحقق الحالات التي اختُبرت؛ لا يعني ذلك ضمان كل تكامل محتمل مع أطر الاستضافة.</p>
<p>راجع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/packages/react/README.md" target="_blank" rel="noopener">خصائص React وواجهات تركيب المحتوى ↗</a>، أو استكشف <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/examples/react/src/main.tsx" target="_blank" rel="noopener">المثال الكامل ↗</a>.</p>
`,
  "vue": `
<p class="guide-lead">ركّب واجهتك من مكونات Vue 3.5+، باستخدام <code>v-model</code> وفتحات المحتوى (slots) والحالة التفاعلية المعتادة.</p>
<h2 id="run-example">شغّل مثال Vue</h2>
{{code:0}}
<h2 id="field-dialog">حقل يتبعه حوار للمراجعة</h2>
<p>يحتفظ النموذج بالقيمة في <code>ref</code>، وتتحكم قيمة مستقلة في فتح الحوار. تتيح فتحة محتوى التذييل استخدام دالة الإغلاق التي يقدمها Dialog.</p>
{{code:1}}
<h2 id="models-slots-refs">القيم وفتحات المحتوى والمراجع</h2>
<ul>
<li>تستخدم حقول النص والاختيار وCombobox والتبويبات وترقيم الصفحات <code>v-model</code>. قيمة Checkbox وSwitch منطقية، بينما يستخدم Dialog الصيغة <code>v-model:open</code>.</li>
<li>إذا أردت أن يدير المكون حالته الداخلية، اترك <code>v-model</code> واستخدم <code>defaultValue</code> أو <code>defaultOpen</code>. مرّر <code>defaultValue</code> مع <code>v-model</code> عندما ينبغي أن تسترجع إعادة التعيين قيمة غير فارغة.</li>
<li>تمر سمات HTML ومستمعات الأحداث إلى عنصر التحكم الرئيسي. تندمج أصناف CSS، وتحتفظ المعالجات الداخلية بمستمعات التطبيق.</li>
<li>تُتيح الحقول <code>element</code> و<code>focus()</code> عبر مراجع القالب. يتيح Dialog الخصائص والدوال <code>element</code> و<code>show()</code> و<code>close()</code>.</li>
<li>يتولى Vue دورة الحياة وإنهاء الارتباط. لا تشغّل تفعيل vanilla فوق مكونات يعرضها Vue.</li>
</ul>
<h2 id="rendering-accessibility">العرض وإمكانية الوصول</h2>
<p>توفر <code>useId</code> في Vue معرّفات ثابتة لربط العناصر بين الخادم والعميل. يتحول الحوار المعروض مفتوحًا من الخادم إلى حوار يمنع التفاعل مع بقية الصفحة (modal) بعد تركيب المكون. وفّر تسميات مترجمة، ورسائل للحالات الفارغة، ونصوص أزرار الإغلاق، وإعلانات الحالة؛ تعيين <code>dir</code> وحده لا يترجمها.</p>
<p>راجع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/packages/vue/README.md" target="_blank" rel="noopener">نماذج القيم وفتحات المحتوى وخصائص Vue ↗</a> و<a href="https://github.com/MohamedEmbarak/nasaq/blob/main/examples/vue/src/App.vue" target="_blank" rel="noopener">مثال Vue الكامل ↗</a>.</p>
`,
  "angular": `
<p class="guide-lead">استورد مكونات Angular المستقلة. تتكامل حقول القيم مع النماذج المعتمدة على القالب والنماذج التفاعلية.</p>
<h2 id="run-example">شغّل مثال Angular</h2>
{{code:0}}
<h2 id="standalone-field">استخدم حقلًا مستقلًا</h2>
<p>أضف المكونات والتوجيهات المطلوبة إلى <code>imports</code>، ثم اربط القيمة باستخدام آلية النماذج التي يعتمدها تطبيقك.</p>
{{code:1}}
<p>حمّل <code>@nasaq/styles/styles.css</code> مرة واحدة في ملف التنسيق العام لتطبيقك أو عند نقطة دخوله. لا تستورده حزمة Angular ضمنيًا.</p>
<h2 id="forms-lifecycle">عقد النماذج ودورة الحياة</h2>
<ul>
<li>تطبّق حقول القيم <code>ControlValueAccessor</code>. استخدم <code>ngModel</code> أو عنصرًا من النماذج التفاعلية أو الزوج <code>value/valueChange</code>؛ لا تربط أكثر من آلية متنافسة للقيمة نفسها.</li>
<li>تجعل قيم <code>controlId</code> التي يحددها التطبيق ارتباط التسمية بالحقل واضحًا، خاصة عند العرض على الخادم.</li>
<li>استخدم <code>resetForm()</code> أو <code>FormGroup.reset()</code> في Angular لإعادة تعيين حقول النماذج المخصصة. تعرض خصائص الأخطاء الرسائل، وتحدد أدوات التحقق في التطبيق صلاحية البيانات.</li>
<li>يتولى Angular عناصر DOM والتنظيف. تعتمد المكونات قوالب Angular المعتادة، دون أغلفة عناصر ويب مخصصة (custom elements) أو متحكمات vanilla.</li>
<li>يبدأ عرض الحوار الأصلي بوضع يمنع التفاعل مع بقية الصفحة (modal) بعد إنشاء العرض. يعيد الإغلاق أو إتلاف المكون التركيز إلى عنصر الفتح إذا ظل متصلًا بالصفحة.</li>
</ul>
<aside class="guide-note"><strong>صيغة الحزمة وحدود المثال</strong><p>تُبنى المكتبة بصيغة Angular Package Format باستخدام <code>ng-packagr</code> والتجميع الجزئي. يستخدم مثال Vite الصغير وضع JIT عمدًا. استخدم بناء Angular المعتاد بنمط AOT للإنتاج؛ لا يثبت هذا المثال تغطية AOT أو العرض على الخادم أو hydration.</p></aside>
<p>راجع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/packages/angular/README.md" target="_blank" rel="noopener">محددات المكونات المستقلة ومدخلاتها ومخرجاتها ↗</a>.</p>
`,
  "theming": `
<p class="guide-lead">غيّر المظهر عبر قيم تصميم دلالية. اجعل السمة، والوضع اللوني، والكثافة، واللغة، واتجاه النص إعدادات مستقلة.</p>
<h2 id="theme-context">حدّد السمة على عنصر يضم المكونات</h2>
{{code:0}}
<p>السمة الافتراضية هي <code>dga</code>، وترتبط بلقطات المصدر المزوّدة لأسس كود المنصات. اختر <code>nasaq</code> للاحتفاظ بألوان هوية نسق ومقاييس الخطوط والزوايا والمسافات والمحتوى الأصلية؛ وتبدأ <code>custom</code> من أساس DGA مع تجاوزاتك الخاصة. اختر الوضع <code>light</code> أو <code>dark</code>، والكثافة <code>comfortable</code> أو <code>compact</code>. جرّب التركيبات في صفحة <a href="#foundations">الأسس</a>، واقرأ <a href="#docs/alignment">إرشادات المصدر والانتقال</a>.</p>
<h2 id="semantic-overrides">عدّل المعنى المشترك بدلًا من كل مكون</h2>
{{code:1}}
<p>حمّل التجاوزات بعد ملف التنسيق المشترك. راجع تباين النص والتركيز وحالات التعطيل والتحويم والأخطاء في الوضعين الفاتح والداكن. قد يحتاج اللون المناسب لخلفية زر ممتلئ إلى قيمة مختلفة عند استخدامه نصًا فوق سطح.</p>
<h2 id="application-fonts">يتولى التطبيق تحميل الخطوط</h2>
<p>تُعرّف التنسيقات عائلات الخطوط، لكنها لا تنزّل ملفاتها. يستخدم هذا الدليل IBM Plex Sans Arabic وIBM Plex Sans. حمّل الأوزان ومجموعات المحارف التي تحتاج إليها فقط، واحتفظ بإشعارات تراخيص الخطوط عند إعادة توزيعها. شعار نسق العربي مسارات SVG، ولا يعتمد عرضه على تحميل خط.</p>
<h2 id="language-direction">العربية لغة، وRTL اتجاه للتخطيط</h2>
<ul>
<li>حدّد <code>lang="ar"</code> للمحتوى العربي و<code>dir="rtl"</code> للتخطيط من اليمين إلى اليسار؛ لا يحل أحدهما محل الآخر.</li>
<li>اعرض أرقام الهاتف وIBAN والروابط والشفرة ضمن سياق محلي مناسب من اليسار إلى اليمين. ترجم التسميات والرسائل بصورة مستقلة.</li>
<li>استخدم خصائص CSS المنطقية مثل <code>margin-inline</code> و<code>padding-inline</code> و<code>inset-inline</code> عند توسيع المكونات.</li>
<li>لا تعكس سلاسل النص العربي، ولا تضف تباعدًا بين الحروف المتصلة، ولا تعكس الشعار.</li>
<li>اختبر التنقل الأفقي في الاتجاهين، وحافظ على ترتيب بصري وترتيب قراءة في DOM لهما معنى.</li>
</ul>
<p>راجع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/packages/tokens/README.md" target="_blank" rel="noopener">حزمة قيم التصميم ↗</a> و<a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/design-principles.md" target="_blank" rel="noopener">مبادئ التصميم ↗</a>.</p>
`,
  "layouts": `
<p class="guide-lead">ركّب الصفحة من مجموعة صغيرة من الأدوات ذات السلوك الواضح. تتولى CSS التجاوب دون الحاجة إلى قياس عرض الشاشة بـJavaScript.</p>
<h2 id="layout-primitives">ابدأ بثلاثة اختيارات</h2>
<div class="guide-choice-grid">
<a class="guide-choice" href="#component/stack"><span><bdi>Stack</bdi> · ترتيب عمودي</span><p>تسلسل واحد للتسميات والحقول والأقسام والمحتوى.</p></a>
<a class="guide-choice" href="#component/inline"><span><bdi>Inline</bdi> · ترتيب أفقي</span><p>إجراءات ووسوم وبيانات موجزة في صف منطقي يسمح بالالتفاف.</p></a>
<a class="guide-choice" href="#component/grid"><span><bdi>Grid</bdi> · شبكة</span><p>بطاقات أو لوحات تتقاسم المساحة مع تغيّر عرض الشاشة.</p></a>
</div>
<h2 id="responsive-html">صفحة متجاوبة باستخدام HTML</h2>
{{code:0}}
<h2 id="responsive-react">البنية نفسها في React</h2>
{{code:1}}
<p>تستخدم الخصائص المتجاوبة <code>base</code> ثم <code>sm</code> عند 40rem، و<code>md</code> عند 48rem، و<code>lg</code> عند 64rem، و<code>xl</code> عند 80rem. ترث النقطة غير المحددة أقرب قيمة من النقاط الأصغر. يتيح <code>minItemWidth</code> شبكة تتكيف مع عرض العناصر، وتكون له الأولوية على عدد الأعمدة المحدد.</p>
<h2 id="page-shell">أكمل هيكل الصفحة</h2>
<p>استخدم <a href="#component/sidebar">Sidebar</a> للمحتوى أو التنقل الجانبي، و<a href="#component/app-shell">App shell</a> لمناطق التطبيق، و<a href="#component/page-header">Page header</a> للعنوان والإجراءات، و<a href="#component/aspect-ratio">Aspect ratio</a> لحجز مساحة الوسائط. حافظ على دلالات مناطق الصفحة؛ لا تضع عنصر <code>main</code> داخل عنصر <code>main</code> آخر.</p>
<p>جرّب <a href="#layouts">استوديو التخطيط التفاعلي</a>، وراجع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/layout.md" target="_blank" rel="noopener">خصائص التخطيط ومتغيرات CSS وأمثلة الأطر ↗</a>.</p>
`,
  "lifecycle": `
<p class="guide-lead">لكل مكون جهة تديره، وحالة، وقواعد تفاعل، ونهاية لدورة حياته. وضّح هذه الحدود منذ البداية.</p>
<ol class="guide-lifecycle">
<li><strong>الإنشاء</strong><p>اعرض عناصر ذات دلالة وتسميات متاحة. حدّد للحقول معرّفات ثابتة، وأسماء، وقيمًا أولية، وإرشادات للتحقق.</p></li>
<li><strong>الربط</strong><p>ركّب مكون إطار العمل، أو فعّل جزء vanilla بعد وجود عناصره في الصفحة. اربط الحالة والأحداث بتطبيقك.</p></li>
<li><strong>التفاعل</strong><p>دع المكون يدير لوحة المفاتيح والتركيز وحالات الفتح والبحث المؤقتة. يتولى التطبيق البيانات والصلاحيات والطلبات.</p></li>
<li><strong>التحديث</strong><p>مرّر القيم الجديدة عبر الخصائص أو عقد المتحكم الموثّق. افصل الاختيار ونص البحث والقيمة المرسلة عندما تميّز الواجهة البرمجية بينها.</p></li>
<li><strong>إنهاء الارتباط</strong><p>استدعِ تنظيف vanilla قبل استبدال عناصره. ينفّذ إطار العمل تنظيف الحزمة عند إزالة المكون أو إتلافه. أغلق الواجهات المؤقتة وأعد التركيز إلى موضع مناسب.</p></li>
</ol>
<h2 id="value-ownership">اختر من يدير القيمة</h2>
<div class="guide-table-wrap" tabindex="0" role="region" aria-label="جدول إدارة الحالة، قابل للتمرير">
<table class="nq-table"><thead><tr><th>الأسلوب</th><th>متى تستخدمه؟</th><th>المسؤولية</th></tr></thead><tbody>
<tr><td>حالة أصلية يديرها العنصر</td><td>عندما يستطيع النموذج المحلي الاحتفاظ بقيمه الحالية.</td><td>اقرأ FormData أو الأحداث، واستخدم القيم الأولية وسلوك إعادة التعيين الموثّقين.</td></tr>
<tr><td>حالة يديرها التطبيق</td><td>عندما تحتاج عدة حقول إلى التنسيق مع حالة واحدة في التطبيق.</td><td>حدّث الحالة بعد استدعاء معالج التغيير، ولا تُعد تمرير قيمة قديمة.</td></tr>
<tr><td>قيمة مشتقة</td><td>عندما تُحسب قيمة من حالة أخرى.</td><td>احتفظ بمصدر واحد للحقيقة بدلًا من مزامنة نسخ متعددة منها.</td></tr>
</tbody></table></div>
<h2 id="transient-persistent">الحالة المؤقتة والبيانات المستمرة</h2>
<p>فتح الحوار، والخيار النشط في Combobox، وظهور التلميح حالات مؤقتة. أما قيمة النموذج المؤكدة فتخص التطبيق. يقرر التطبيق التخزين وطلبات الشبكة. لا تحفظ معظم المكونات بيانات بصورة مستمرة؛ ويتطلب حفظ تفضيلات الموافقة اختيارًا صريحًا. عمليات الإرسال وأسماء الملفات المعروضة في أمثلة هذا الموقع محلية وتجريبية.</p>
<h2 id="interaction-flow">تتبّع تفاعلًا حقيقيًا</h2>
<p>يفتح <a href="#component/combobox">Combobox</a> عند التفاعل، ويصفّي الخيارات وفق نص البحث، وينقل الخيار النشط بالأسهم، ويؤكد القيمة عند Enter أو الاختيار، ثم يُغلق عند Escape أو فقد التركيز. تؤدي الكتابة إلى مسح الاختيار المؤكد السابق. يدخل <a href="#component/dialog">Dialog</a> الطبقة العليا للمتصفح بعد التركيب، ويترك للمتصفح حصر التركيز، ويُغلق عند Escape أو إجراء مناسب، ثم يعيد التركيز إلى عنصر الفتح.</p>
<h2 id="async-work">أدر العمل غير المتزامن بوضوح</h2>
<ul>
<li>أبقِ إلغاء الطلبات وإعادة المحاولة والمصادقة والتخزين في طبقة التطبيق.</li>
<li>عبّر عن التحميل برسالة حالة نصية واحدة، وعطّل فقط الإجراءات التي لا يصح تكرارها أثناء التنفيذ.</li>
<li>احتفظ بالبيانات المدخلة عند الفشل، وضع رسالة خطأ تساعد على التصحيح بجوار الحقل المعني.</li>
<li>تجاهل الاستجابات القديمة عندما تتغير معطيات الطلب أو الصفحة المعروضة.</li>
<li>عند اختفاء منطقة من الواجهة، انقل التركيز إلى عنصر باقٍ ومناسب بدل تركه دون موضع واضح.</li>
</ul>
<p>توضح صفحة كل مكون في <a href="#components">المرجع التفاعلي</a> دورة حياته وانتقالات الحالة التي يدعمها.</p>
`,
  "calendars": `
<p class="guide-lead">يوم واحد يُرسل في النموذج، وتقويمان لعرضه. يجب ألا يغيّر الانتقال بين الميلادي والهجري التاريخ الذي اختاره المستخدم.</p>
<h2 id="stored-date">القيمة المحفوظة تاريخ ميلادي دون وقت</h2>
{{code:0}}
<p>يجمع <a href="#component/date-picker">منتقي التاريخ</a> بين حقل تاريخ أصلي وحوار تقويم يمكن التبديل فيه، بينما يعرض <a href="#component/calendar">Calendar</a> التقويم مباشرة داخل الصفحة. تبقى قيمة الحقل والنموذج ميلادية بصيغة ISO، ويعرض النص المرتبط بالحقل اليوم المختار وفق التقويم النشط.</p>
<h2 id="hijri-reference">ما المرجع المستخدم للهجري؟</h2>
<p>يستخدم نسق مجموعة بيانات منشورة ومثبتة الإصدار لتقويم أم القرى، تشترك فيها جميع حزم الأطر. لا يستخدم تقريبًا حسابيًا جدوليًا، ولا يعتمد ضمنيًا على نسخة تقويم ICU داخل المتصفح. النطاق الموثّق هو <strong><bdi>1924-08-01</bdi> إلى <bdi>2077-11-16</bdi></strong>، ضمن الأعوام الهجرية 1343–1500.</p>
<aside class="guide-note"><strong>تقويم مدني بمرجع وحدود واضحين</strong><p>الجدول المرجعي مجموعة بيانات منشورة يمكن إعادة إنتاج نتائجها، وليس بثًا مباشرًا من خدمة سعودية رسمية. قد تعتمد المناسبات الدينية على إعلان رسمي. يوضح بحث المصادر هذا الفرق، ولماذا لا تحل حسابات رؤية الهلال البديلة محل مرجع التقويم المدني السعودي.</p></aside>
<h2 id="switches-boundaries">التبديل وحدود النطاق</h2>
<ul>
<li>احتفظ بقيمة ISO نفسها عند تغيير تقويم العرض.</li>
<li>احفظ التاريخ الخارج عن نطاق الهجري المدعوم، واعرض رسالة نطاق واضحة عند اختيار الهجري؛ لا تُعد تفسيره ضمنيًا.</li>
<li>حافظ على ارتباط min/max والتحقق من الحقول المطلوبة والتحرير الأصلي وإعادة التعيين وإعادة التركيز.</li>
<li>افصل تاريخ العمل الذي لا يتضمن وقتًا عن الطابع الزمني. لا تمرّر <code>YYYY-MM-DD</code> عبر تحويل منطقة زمنية محلية قد يغيّر اليوم.</li>
<li>ترجم أسماء الأشهر وتسميات التنقل ورسائل الحالة. نمط الأرقام واتجاه النص إعدادان مستقلان.</li>
</ul>
<p>راجع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/date-calendars.md" target="_blank" rel="noopener">بحث مصادر التقويم، ومنشأ البيانات، وفحوص الموثوقية ↗</a> قبل دمج التواريخ في سجلات رسمية.</p>
`,
  "accessibility": `
<p class="guide-lead">حافظ على إمكانات المتصفح الأصلية، ثم اختبر التجربة كاملة بمحتوى وتفاعل واقعيين.</p>
<h2 id="names-relations">الأسماء والعلاقات بين العناصر</h2>
<ul>
<li>امنح كل عنصر تحكم اسمًا متاحًا. استخدم <code>label/for</code> أو خاصية <code>label</code> في المكون، ولا تعتمد على النص الإرشادي داخل الحقل وحده.</li>
<li>اربط المساعدة والأخطاء باستخدام <code>aria-describedby</code>، ووضّح عدم صلاحية القيمة وكيفية تصحيحها.</li>
<li>استخدم <code>fieldset</code> و<code>legend</code> لمجموعات خيارات الاختيار الأحادي (radio) ومربعات الاختيار المرتبطة.</li>
<li>استخدم الأزرار لتنفيذ الإجراءات والروابط للتنقل، وحافظ على دلالات مناطق الصفحة وتسلسل العناوين.</li>
</ul>
<h2 id="keyboard-focus">لوحة المفاتيح والتركيز</h2>
<ul>
<li>اختبر التنقل باستخدام Tab وShift+Tab عبر النموذج كاملًا، بما في ذلك حالات التحقق.</li>
<li>اختبر الأسهم وHome/End وEnter/Space وEscape وفق ما توضحه صفحة كل مكون.</li>
<li>أبقِ التركيز مرئيًا، وأعده بعد إغلاق الواجهات المنبثقة، وراعِ قواعد RTL في عناصر التحكم الأفقية.</li>
<li>لا تضف حصر تركيز مخصصًا إلى الحوارات الأصلية، ولا تضع محتوى تفاعليًا داخل التلميحات الوصفية.</li>
</ul>
<h2 id="motion-contrast">الحركة والتحميل والتباين</h2>
<p>احترم تفضيل <code>prefers-reduced-motion</code>. تتوفر بدائل SVG ثابتة لمؤشرات تحميل الشعار المتحركة. أعلن التحميل مرة واحدة بنص؛ لا تعلن كل هيكل مؤقت للمحتوى (Skeleton) أو كل إطار من الحركة. افحص تباين النص ومؤشرات التركيز والحدود اللازمة لتمييز الحقول وحالات الخطأ في كل سمة وكثافة.</p>
<h2 id="test-experience">اختبر تجربة التطبيق</h2>
{{code:0}}
<p>تكشف الفحوص الآلية جزءًا من المشكلات فقط. اختبر قارئ شاشة، والتكبير وإعادة تدفق المحتوى، والاستخدام بلوحة المفاتيح وحدها، وأحجام أهداف اللمس، والتسميات العربية الطويلة، ومتصفحات تمثل الاستخدام المتوقع. الهدف هو WCAG 2.2 AA؛ لا يمنح استيراد نسق وحده حكمًا شاملًا بالمطابقة.</p>
<p>راجع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/validation.md" target="_blank" rel="noopener">نطاق التحقق والفجوات المتبقية ↗</a>. تحدد صفحات المكونات مسؤوليات إمكانية الوصول الخاصة بسلوك كل مكون.</p>
`,
  "extending": `
<p class="guide-lead">اختر توسعة صغيرة وموثقة تحافظ على سلوك المكون.</p>
<h2 id="extension-level">اختر أصغر تغيير يلبّي الحاجة</h2>
<ol class="guide-lifecycle">
<li><strong>تجاوز قيمة تصميم</strong><p>عدّل لونًا دلاليًا أو تباعدًا أو نصف قطر أو قيمة طباعية لتكييف النظام كله.</p></li>
<li><strong>تنويع موثّق أو تركيب</strong><p>استخدم تنويعًا قائمًا، أو slot، أو children، أو قالبًا، أو أداة تخطيط لحاجة موضعية.</p></li>
<li><strong>كتلة يملكها التطبيق</strong><p>ركّب ملخص خدمة أو رحلة استخدام من المكونات الأساسية، وأبقِ منطق التطبيق ضمنها.</p></li>
<li><strong>مكون أساسي جديد</strong><p>أضف مكونًا مشتركًا عندما يكون سلوكه وعقد إمكانية الوصول فيه قابلين لإعادة الاستخدام.</p></li>
</ol>
<h2 id="scaffold-block">أنشئ هيكل كتلة للتطبيق</h2>
{{code:0}}
<p>ينشئ الأمر ملفات HTML وCSS وإرشادات قابلة للتعديل داخل <code>blocks/</code>، ولا يولّد الأجزاء الداخلية لحزم الأطر. اقرأ الملفات الناتجة، واربط بيانات التطبيق، وحافظ على دلالات HTML.</p>
<h2 id="stable-contract">حافظ على عقد واضح عند التخصيص</h2>
<ul>
<li>ابدأ أصناف CSS العامة بالبادئة <code>nq-</code>، والمتغيرات المخصصة بالبادئة <code>--nq-</code>.</li>
<li>استخدم خصائص CSS المنطقية، واختبر العربية والإنجليزية وRTL وLTR والوضعين الفاتح والداكن والكثافتين المريحة والمضغوطة.</li>
<li>أبقِ انتقالات الحالة والأدوات المستقلة عن العرض في الحزمة الأساسية <code>core</code>؛ تتولى حزم الأطر العرض ودورة الحياة.</li>
<li>لا تستبدل السلوك الأصلي بمحاكاة بصرية، إلا إذا حُدّد السلوك الجديد واختُبر بوضوح.</li>
<li>وثّق القيم والأحداث وفتحات المحتوى والتنويعات وقواعد لوحة المفاتيح وحالات التعطيل والقراءة فقط وإعادة التعيين والتنظيف.</li>
<li>حدّث <code>components.json</code> والأمثلة وصادرات الحزم والتوثيق والاختبارات التي تحمي السلوك الفعلي.</li>
</ul>
<h2 id="coding-assistant">اعمل بوضوح مع مساعد برمجي</h2>
<p>يمكنك استخدام التوجيه التالي، مع تحديد المهمة وإطار العمل ولغة الواجهة والحالات المطلوبة:</p>
{{code:1}}
<p>استعن بـ<a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/extension.md" target="_blank" rel="noopener">دليل التوسعة ↗</a> و<a href="https://github.com/MohamedEmbarak/nasaq/blob/main/CONTRACT.md" target="_blank" rel="noopener">عقد التنفيذ المشترك ↗</a> و<a href="https://github.com/MohamedEmbarak/nasaq/blob/main/llms.txt" target="_blank" rel="noopener">المرجع المختصر للمساعدات البرمجية ↗</a>. المشروع مرخّص وفق <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/LICENSE" target="_blank" rel="noopener">Apache 2.0 ↗</a>، وتبقى إشعارات الأطراف الأخرى سارية.</p>
`,
  "alignment": `
<p class="guide-lead">أساس افتراضي مستند إلى DGA، بمراجع يمكن تتبّعها، وتنفيذ مستقل، ونقاط توسعة واضحة.</p>
<h2 id="reference-snapshot">ما المرجع الذي يستخدمه نسق؟</h2>
<p>تربط سمة <code>dga</code> الافتراضية قيمها بالأسس المحلية في ملفات Figma Community المزوّدة من <strong>كود المنصات · DGA Platforms Code</strong> بتاريخ <strong><bdi>2026-10-29</bdi></strong>. هذا تاريخ التصدير، وليس رقم إصدار رسميًا أو إثباتًا أن الملفات تمثل أحدث إرشادات الهيئة. يحتفظ نسق بشعاره العربي وواجهاته البرمجية.</p>
<p>فُكّ ترميز 17 ملفًا، وتركّز الفحص التفصيلي على الأسس وقالبَي صفحة الخدمة والنموذج. تجاوزت ستة ملفات حد النقل البالغ 32 MiB: الأيقونات، ويوم التأسيس السعودي، والصفحة الرئيسية، والحج، ومكونات الجوال، وصفحة البحث. لم تُزوَّد مكتبة مستقلة لمكونات الويب؛ لذلك لا يثبت فهرس نسق المؤلف من 77 مكوّنًا مطابقة جميع المكونات الرسمية.</p>
<h2 id="semantic-source-values">قيم المصدر في الوضعين الفاتح والداكن</h2>
<p>يحتوي ملف الأسس على 784 متغيرًا محليًا حُلّت قيمه. لكل دور دلالي قيمه في الوضعين؛ ولا ينتج الوضع الداكن من عكس ألوان الوضع الفاتح. من أمثلة ذلك:</p>
<ul>
<li>خلفية الصفحة <code>Background/background-body</code>، العنصر <code>122:19</code>: <code>#F9FAFB</code> فاتح و<code>#111927</code> داكن.</li>
<li>النص الافتراضي <code>Text/text-default</code>، العنصر <code>53:392</code>: <code>#161616</code> فاتح و<code>#FFFFFF</code> داكن.</li>
<li>خلفية حقل الإدخال <code>Form/field-background-default</code>، العنصر <code>113:7</code>: <code>#FFFFFF</code> فاتح و<code>#1F2A37</code> داكن.</li>
<li>اللون الأساسي في العنصر <code>50:65</code> هو <code>#1B8354</code>، بينما يستخدم النص الأساسي <code>Text/text-primary</code> في العنصر <code>50:204</code> اللون <code>#54C08A</code> في الوضع الداكن. لا تُستخدم هذه الأدوار بالتبادل.</li>
</ul>
<p>يسجل <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/packages/tokens/reference/dga-foundations.json" target="_blank" rel="noopener">مرجع الأسس المنشور ↗</a> ومصدر قيم التصميم معرّفات العناصر والتعديلات. مثلًا، يستخدم النص الثانوي المشترك درجة محايدة أغمق في الوضع الفاتح لأنه يظهر أيضًا فوق أسطح مخففة اللون؛ ويحتفظ النص الإرشادي داخل الحقل بقيمته الدلالية الخاصة. تبقى قيمة حدود الحقل الأصلية في حالة السكون مسجلة باللون <code>#9DA4AE</code> في الوضع الفاتح؛ ويستخدم التنفيذ اللون الأقوى <code>#6C737F</code> لزيادة التباين، مع الحفاظ على حدود التركيز المرئية. الارتباط بالمصدر وتقييم الإتاحة سجلان منفصلان.</p>
<h2 id="template-guidance">طبّق تعليمات القوالب</h2>
<ul>
<li>مراجع الخدمة المفحوصة هي <code>1:21371</code> و<code>1:22148</code>، وللجوال <code>27:4851</code>. ومراجع النموذج هي <code>2:17277</code>، وللجوال <code>7:3658</code>.</li>
<li>حافظ على بنية الترويسة والتذييل وألوانهما وخطوطهما عند تطبيق تعليمات فصلهما الواردة في المصدر. شريط التنقّل الثانوي اختياري.</li>
<li>قدّم وصفًا موجزًا للخدمة وخطوات مرقمة ومعلومات الفئة المستهدفة والمدة والقنوات والتكلفة والتواصل والوصول إلى الأسئلة الشائعة.</li>
<li>وضّح الحقول المطلوبة والخطوات المرقمة. يصف قالب النموذج مؤشر خطوات دائريًا للشاشات الصغيرة؛ أرفق به وصفًا نصيًا للتقدم.</li>
<li>العرضان 1440 و430 بكسل أمثلة لإطارات التصميم، وليسا نقطتَي توقف رسميتين في CSS. اختبر إعادة التدفق على عروض أصغر ومتوسطة.</li>
<li>لا تثبت وجهة انتقال مفقودة أو مدة حركة غير محددة سلوكًا رسميًا. حافظ على بدائل لوحة المفاتيح وتقليل الحركة في التنفيذ.</li>
</ul>
<h2 id="theme-migration">نقل تطبيق قائم إلى الأساس الافتراضي</h2>
<p>حدّد <code>data-nq-theme="dga"</code> صراحة، أو استخدم الأساس الافتراضي على عنصر جذر دون سمة. وللاحتفاظ بالألوان ومقاييس الخطوط والزوايا والمسافات والمحتوى الأصلية، حدّد <code>data-nq-theme="nasaq"</code>. تشترك السمتان في ارتفاعات عناصر التحكم: الكثافة المريحة 40 بكسل للحجم الافتراضي و32 للصغير و40 للكبير؛ والمكثفة 32 للافتراضي و24 للصغير و40 للكبير، عند حجم خط جذري قدره 16 بكسل. لذلك لا يحفظ اختيار نسق كل تفصيل بصري سابق. قد يحافظ اختيار سمة محفوظ سابقًا على مظهر مختلف في الدليل. راجع التجاوزات المخصصة والمسافات والتركيز والتحقق من الإدخال والاتجاهين بعد الانتقال؛ تبقى عقود قيم المكونات وأحداثها وقيم التاريخ بصيغة ISO مستقلة عن التغيير البصري.</p>
<h2 id="product-alignment">تُقيّم مواءمة DGA على مستوى المنتج</h2>
<p>لا تمنح السمة أو سجل المصدر اعتمادًا أو شهادة أو ضمانًا للمطابقة الكاملة. يحتاج المحتوى والمعرّفات الرسمية المصرّح بها والخصوصية والإتاحة ورحلات الاستخدام والتزامات الخدمة إلى تقييم مستقل. لا تُضمَّن ملفات Figma الخام أو الأصول المصدّرة بالجملة في الحزم المنشورة؛ فأذونات الأصول منفصلة عن ترخيص Apache 2.0 لشفرة نسق.</p>
<p>راجع <a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/dga-reference.md" target="_blank" rel="noopener">سجل لقطات المصدر والانتقال الكامل ↗</a>، و<a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/alignment.md" target="_blank" rel="noopener">سجل المتطلبات والمواءمة ↗</a>، و<a href="https://github.com/MohamedEmbarak/nasaq/blob/main/docs/validation.md" target="_blank" rel="noopener">الفحوص التي أُجريت بالفعل ↗</a>.</p>
`,};

export function arabicArticle(topic: string, code: Code): string {
  const body = articles[topic];
  if (typeof body !== 'string') return '<p>لم نعثر على هذه الصفحة. <a href="#docs/getting-started">ابدأ بدليل الإعداد</a>.</p>';
  return body.replace(/\{\{code:(\d+)\}\}/g, (_, index: string) => {
    const sample = samples[topic]?.[Number(index)];
    if (sample === undefined) throw new Error('Missing guide code sample: ' + topic + '/' + index);
    return code(sample);
  });
}
