import { expandedSample } from './expanded-samples';
import type { GuideInput } from './component-guide-types';
import { expandedGuides } from './component-expanded-guides';

const apiTypes: Record<string, string> = {
  "React renderable content": "محتوى قابل للعرض في React",
  "CSS class": "صنف CSS",
  "Input content": "محتوى الحقل",
  "Markers": "علامات ربط",
  "Vanilla options": "خيارات المتحكم المباشر",
  "Controller methods": "دوال المتحكم",
  "React props": "خصائص React",
  "React string": "نص في React",
  "Native input type": "نوع إدخال أصلي",
  "Native numeric attributes": "صفات رقمية أصلية",
  "React native input props": "خصائص الإدخال الأصلي في React",
  "Framework props": "خصائص إطار العمل",
  "React numeric props": "خصائص رقمية في React",
  "React boolean / formatter": "قيمة منطقية أو منسّق في React",
  "Input markers": "علامات حقول الإدخال",
  "Controller readonly [number,number]": "قراءة فقط: [number,number]",
  "Required React strings": "تسميات نصية مطلوبة في React",
  "React integer 1–10; default 5": "عدد صحيح من 1 إلى 10 في React؛ الافتراضي 5",
  "Native form attributes": "صفات النموذج الأصلية",
  "Vanilla/React positive integer": "عدد صحيح موجب في المتحكم المباشر أو React",
  "React boolean": "قيمة منطقية في React",
  "Optional marker": "علامة اختيارية",
  "JSON string array / controller option": "مصفوفة نصية بصيغة JSON أو خيار المتحكم",
  "Localized controller options": "خيارات متحكم مترجمة",
  "Wrapper marker": "علامة الغلاف",
  "Controller readonly string[]": "قراءة فقط: string[]",
  "Gregorian ISO date strings": "تواريخ ميلادية نصية بصيغة ISO",
  "string / 0–6 / predicate": "نص / من 0 إلى 6 / دالة شرطية",
  "Calendar system / BCP 47 locale": "نظام التقويم / رمز لغة BCP 47",
  "Native input attributes": "صفات الحقل الأصلية",
  "Vanilla controller callbacks": "معالجات المتحكم المباشر",
  "Native file attributes": "صفات حقل الملفات الأصلية",
  "Vanilla bytes": "عدد البايتات في المتحكم المباشر",
  "true for multiple mode": "true للوضع المتعدد",
  "String on multiple-mode button": "نص على زر الوضع المتعدد",
  "React segmented | outline": "segmented | outline في React",
  "React string or string[]": "string أو string[] في React",
  "Vanilla callback / boolean": "معالج أو قيمة منطقية في المتحكم المباشر",
  "String on menuitem": "نص على عنصر menuitem",
  "React menu data / callback": "بيانات القائمة أو معالجها في React",
  "Vanilla controller methods": "دوال المتحكم المباشر",
  "React Dialog props": "خصائص Dialog في React",
  "Vanilla methods": "دوال المتحكم المباشر",
  "React ToastMessage[] / callback": "ToastMessage[] أو معالج في React",
  "React message boolean": "قيمة منطقية للرسالة في React",
  "Native boolean attribute": "صفة HTML منطقية",
  "React disclosure props": "خصائص الظهور في React",
  "Stable string": "معرّف نصي ثابت",
  "Parent state / child group": "حالة الأب / مجموعة الأبناء",
  "React node data / selection props": "بيانات العقد أو خصائص التحديد في React",
  "React string[] props": "مصفوفة string[] في React",
  "React localization props": "خصائص الترجمة في React",
  "URL string": "رابط نصي",
  "React required string": "نص مطلوب في React",
  "Vanilla marker": "علامة ربط في HTML",
  "React Button props": "خصائص Button في React",
  "Button content": "محتوى الأزرار",
  "Vanilla semantics": "دلالات HTML",
  "React Badge tone": "نبرة Badge في React",
  "React callback / string": "معالج أو نص في React",
  "React required content": "محتوى مطلوب في React",
  "React optional content": "محتوى اختياري في React",
  "React optional string": "نص اختياري في React",
  "Native numbers": "أعداد أصلية",
  "React AvatarProps[]": "AvatarProps[] في React",
  "React number; default 5": "عدد في React؛ الافتراضي 5",
  "React formatter": "منسّق في React",
  "Matching string keys": "مفاتيح نصية متطابقة",
  "number for numeric columns": "number للأعمدة الرقمية",
  "Optional cell attribute": "صفة خلية اختيارية",
  "React sort props": "خصائص الفرز في React",
};

type ArabicEntry = Omit<GuideInput, 'api' | 'source' | 'related'> & { api: string[] };
function localized(id: string, entry: ArabicEntry): GuideInput {
  const original = expandedGuides[id];
  if (!original || original.api.length !== entry.api.length) throw new Error(`Incomplete Arabic API: ${id}`);
  for (const field of ['frameworkNotes', 'limitations', 'variants'] as const) {
    if (original[field] && !entry[field]) throw new Error(`Missing Arabic ${field}: ${id}`);
  }
  return { ...original, ...entry, api: original.api.map((item, i) => ({ ...item, type: apiTypes[item.type] ?? item.type, description: entry.api[i]! })) };
}

export const arabicExpandedGuides: Record<string, GuideInput> = {
  'input-group': localized('input-group', {
    summary: 'تجمع بادئة أو لاحقة أو إجراءً مساعدًا بجوار حقل أصلي، مع الحفاظ على تسمية الحقل وقيمته المستقلة.',
    usage: `<label class="nq-field"><span class="nq-label">نطاق الموقع</span>
  <span class="nq-input-group">
    <span class="nq-input-addon" aria-hidden="true">https://</span>
    <input class="nq-input" name="host" type="text" dir="ltr" aria-describedby="host-hint">
  </span>
</label>
<span class="nq-hint" id="host-hint">أدخل اسم النطاق؛ يضيف التطبيق بادئة HTTPS.</span>`,
    lifecycle: ['ضع الحقل المسمّى بين الإضافات الاختيارية.', 'اقرأ قيمة الحقل الفعلية؛ لا يدخل نص البادئة أو اللاحقة ضمن FormData تلقائيًا.', 'لا تحتاج المجموعة إلى تهيئة JavaScript. تظل الأزرار المساعدة مسؤولة عن سلوكها الأصلي، وينظّف التطبيق مستمعيها عند إزالة الواجهة.'],
    api: ['محتوى اختياري قبل الحقل وبعده في React.', 'صنف غلاف البادئة أو اللاحقة في HTML.', 'الحقل الحقيقي يحتفظ باسمه وقيمته ودوره داخل النموذج.'],
    accessibility: ['وفّر تسمية فعلية عبر Field أو عنصر label.', 'اربط الوحدات أو البوادئ المؤثرة بتعليمات ظاهرة باستخدام aria-describedby.', 'أخفِ الأيقونة الزخرفية عن قارئات الشاشة، وسمِّ الزر المساعد تسمية مستقلة.'],
  }),
  'password-field': localized('password-field', {
    summary: 'حقل كلمة مرور أصلي مع أيقونة عين مدمجة لإظهارها أو إخفائها. يتغير نوع العرض مع بقاء عنصر الإدخال نفسه وقيمته.',
    usage: `<div class="nq-field nq-password-field" data-nq="password-field">
  <label class="nq-label" for="account-password">كلمة المرور</label>
  <div class="nq-password-control">
    <input id="account-password" class="nq-input" type="password" name="password" autocomplete="current-password" data-nq-password-input>
    <button class="nq-button" type="button" data-nq-password-toggle data-nq-show-label="إظهار كلمة المرور" data-nq-hide-label="إخفاء كلمة المرور">إظهار كلمة المرور</button>
  </div>
</div>`,
    lifecycle: ['هيّئ الحقل وزر الرؤية بعد تركيب عناصرهما في الصفحة.', 'يبدّل الزر النوع بين password وtext، ويحدّث حالته وتسميته، ويصدر الحدث {visible}. لا يمكن كشف قيمة حقل معطّل عبر الزر.', 'تعيد إعادة ضبط النموذج الحقل في نسخة JavaScript المباشرة إلى وضع الإخفاء.', 'عند destroy تُستعاد صفات الحقل والزر ومحتواه الأصلي، وتُزال المراقبات والمستمعات.'],
    api: ['علامتان تربطان الحقل بزر التحكم في ظهوره.', 'تسميتا الإظهار والإخفاء لقارئات الشاشة؛ يمكن توفيرهما أيضًا بصفات data-nq-show-label وdata-nq-hide-label.', 'الأيقونة المدمجة هي الافتراضية. اختر text لعرض التسمية نصيًا؛ تدعم النسخة المباشرة data-nq-toggle-variant="text".', 'خصّص قناعي العين باستخدام url(...)، وحجمهما الافتراضي 1.5rem عند الحاجة.', 'تبديل الرؤية ثم إنهاء دورة حياة المتحكم.', 'تحكم في الرؤية أو قيمتها الابتدائية في React، بصورة مستقلة عن قيمة كلمة المرور.'],
    accessibility: ['اختر autocomplete=current-password أو new-password وفق الغرض.', 'للزر تسمية مترجمة وحالة ضغط تقرؤهما التقنيات المساعدة، والأيقونة زخرفية. يجب ألا يرسل الزر النموذج.', 'ضع تسمية الحقل الفعلية خارج غلاف الحقل والزر. اسمح باللصق والتكامل مع مدير كلمات المرور.', 'يمكن إظهار قيمة حقل للقراءة فقط، بينما يمنع التعطيل المباشر أو تعطيل fieldset المحيط تبديل الرؤية.'],
    limitations: ['لا يفرض المكوّن قواعد قوة كلمة المرور، ولا يصادق على المستخدم، ولا يخزّن بيانات الدخول.'],
  }),
  'search-field': localized('search-field', {
    summary: 'حقل بحث أصلي لقيمة نصية. يتولى التطبيق تنفيذ البحث وتأخيره وإدارة النتائج والتنقل.',
    usage: `<label class="nq-field"><span class="nq-label">ابحث عن الخدمات</span>
  <input class="nq-input nq-search-field" type="search" name="query" autocomplete="off">
</label>`,
    lifecycle: ['اعرض حقلًا مسمّى، مع عبارة بحث ابتدائية عند الحاجة.', 'استمع إلى input للتصفية المحلية أو أرسل نموذج بحث. ألغِ الطلبات القديمة عند تغير العبارة.', 'يمسح زر الإزالة في React العبارة ويعيد التركيز إلى الحقل. نظّف مؤقتات التطبيق وطلباته عند مغادرة الواجهة.'],
    api: ['عبارة البحث الحالية أو الابتدائية في React.', 'يعيد النص الجديد؛ يبقى الحدث الأصلي onChange متاحًا أيضًا.', 'التسمية المترجمة لزر مسح عبارة البحث في React.', 'يحافظ على دلالات تحرير البحث التي يوفّرها المتصفح.'],
    accessibility: ['لا تستخدم أيقونة البحث بدلًا من تسمية الحقل.', 'أعلن عدد النتائج المفيد خارج الحقل دون إعلان كل ضغطة مفتاح.', 'حافظ على اختصارات التحرير الأصلية، ولا تستحوذ على Escape إلا إذا كانت نافذة فعلية تستخدمه.'],
  }),
  'number-field': localized('number-field', {
    summary: 'حقل رقمي أصلي للكميات مع قيود الحد الأدنى والأقصى والخطوة. تبقى القيمة الفارغة فارغة ولا تتحول إلى صفر.',
    usage: `<label class="nq-field"><span class="nq-label">عدد الحضور</span>
  <input class="nq-input nq-number-field" type="number" name="attendees" min="1" max="50" step="1" required>
</label>`,
    lifecycle: ['حدّد نطاقًا وخطوة يناسبان الكمية المطلوبة.', 'اختر عمدًا بين النص value والعدد valueAsNumber؛ تكون الأخيرة NaN عندما يكون الحقل فارغًا أو غير صالح.', 'افصل الحسابات عن حالة التحرير. يحتفظ الحقل بالتحقق الأصلي وإعادة الضبط.'],
    api: ['نطاق الأعداد المسموح وخطوة الزيادة أو النقصان.', 'خصائص حقل React الأصلية؛ NumberField يبني على TextField مع النوع number.', 'تسمية الحقل والتعليمات ورسالة الخطأ المرتبطة به.'],
    accessibility: ['استخدم text أو tel للمعرّفات الرقمية التي قد تبدأ بصفر.', 'وضّح الوحدة بجوار الحقل.', 'اسمح بالكتابة إلى جانب زري الزيادة والنقصان في المتصفح.'],
  }),
  slider: localized('slider', {
    summary: 'اختيار قيمة رقمية واحدة عبر شريط نطاق أصلي مسمّى. يناسب الضبط النسبي أكثر من الإدخال الرقمي الدقيق.',
    usage: `<label class="nq-field"><span class="nq-label">مستوى الصوت</span>
  <input class="nq-slider" type="range" name="volume" min="0" max="100" step="5" value="40">
</label>`,
    lifecycle: ['اعرض شريطًا ذا حدود رقمية منتهية وقيمة ابتدائية.', 'يتولى المتصفح التفاعل بالمؤشر ولوحة المفاتيح. يعيد onValueChange في React عددًا؛ ويمكن الاستماع إلى input في HTML.', 'تعيد إعادة الضبط القيمة الابتدائية. لا يحتاج الشريط البسيط إلى متحكم إضافي.'],
    api: ['حدود النطاق ومقدار التغيير.', 'القيمة الرقمية الحالية أو الابتدائية ومعالج التغييرات في React.', 'إظهار القيمة المنسّقة اختياريًا إلى جانب الشريط في React.'],
    accessibility: ['وفّر تسمية ظاهرة ونصًا يوضح الوحدة.', 'استخدم aria-valuetext عندما يحتاج العدد إلى تفسير قابل للقراءة.', 'وفّر NumberField إذا كان اختيار قيمة دقيقة على الشريط صعبًا.'],
  }),
  'range-slider': localized('range-slider', {
    summary: 'اختيار حد أدنى وحد أعلى عبر حقلي نطاق أصليين. يتوقف كل مقبض عند الآخر حتى تبقى القيمتان مرتبتين.',
    usage: `<fieldset class="nq-range-slider" data-nq="range-slider">
  <legend>نطاق الميزانية</legend>
  <label>الحد الأدنى<input class="nq-slider" type="range" data-nq-lower name="minimum" min="0" max="100" value="20"></label>
  <label>الحد الأعلى<input class="nq-slider" type="range" data-nq-upper name="maximum" min="0" max="100" value="80"></label>
  <output data-nq-range-output></output>
</fieldset>`,
    lifecycle: ['هيّئ حقلي النطاق بعد تركيبهما بحدود متوافقة؛ تُضبط القيم الابتدائية داخل النطاق وبترتيب صحيح.', 'تصدر حركة المقبض nq:change بالقيمة {value:[lower,upper]}، وتبقى القيمتان الأصليتان جزءًا من بيانات النموذج.', 'تعيد إعادة الضبط النطاق الابتدائي. يمنع وضع القراءة فقط التعديل دون افتراض أن range يدعم readonly أصلًا.', 'يستعيد destroy القيم والصفات ونص المخرج الأصلي.'],
    api: ['علامتان لحقلي النطاق المسمّيين.', 'حدود مشتركة منتهية ومعالج يستقبل زوج القيم.', 'النطاق المرتب الحالي؛ قراءة فقط من المتحكم.', 'تسميتان مستقلتان للمقبضين، مطلوبتان في React.'],
    accessibility: ['سمِّ كل حد على حدة؛ لا تكفي تسمية المجموعة وحدها.', 'حافظ على التعديل بالأسهم وميّز القيمتين بالنص.', 'لا تعتمد على اللون وحده لتحديد المقبض النشط.'],
    frameworkNotes: 'يقبل React زوجًا في value أو defaultValue ومعالج onValueChange. يرسل lowerName وupperName القيمتين باسمين، أو يرسل name مكررًا. تضبط min وmax وstep الحقلين الأصليين.',
  }),
  rating: localized('rating', {
    summary: 'جمع تقييم واحد عبر مجموعة خيارات radio أصلية. تُبرز النجوم من البداية إلى الدرجة المختارة، ويعرض مرور المؤشر معاينة للنطاق دون تغيير القيمة المرسلة.',
    usage: `<fieldset class="nq-rating"><legend>قيّم الخدمة</legend>
  <label><input class="nq-radio" type="radio" name="rating" value="1" required> 1 من 3</label>
  <label><input class="nq-radio" type="radio" name="rating" value="2"> 2 من 3</label>
  <label><input class="nq-radio" type="radio" name="rating" value="3"> 3 من 3</label>
</fieldset>`,
    lifecycle: ['اعرض مجموعة خيارات مسمّاة تشترك في name ثابت.', 'يُثبت الاختيار الدرجة عبر سلوك النموذج الأصلي أو onValueChange في إطار العمل.', 'تعيد إعادة الضبط التقييم الابتدائي. إرسال التقييم وحفظه عمليتان يتولاهما التطبيق.'],
    api: ['درجة التقييم الحالية أو الابتدائية ومعالجها في React.', 'عدد الدرجات المعروضة؛ من 1 إلى 10 والافتراضي 5 في React.', 'تسمية مترجمة لكل درجة في React.', 'التحقق والمشاركة في بيانات النموذج الأصلي.'],
    accessibility: ['استخدم legend للسؤال وتسمية مفهومة لكل درجة.', 'أخفِ النجوم الزخرفية عن قارئات الشاشة.', 'حافظ على سلوك الأسهم والمسافة الأصلي لمجموعة radio. يحتفظ التقييم للقراءة فقط بالتركيز والقيمة المرسلة؛ ولا يُرسل التقييم المعطّل.'],
  }),
  'pin-input': localized('pin-input', {
    summary: 'إدخال رمز تحقق رقمي بطول محدد في حقل واحد قابل للوصول، مع دعم لصق الأرقام العربية والهندية الشرقية وتحويلها إلى أرقام ASCII.',
    usage: `<div class="nq-pin-input" data-nq="pin-input">
  <label class="nq-field"><span class="nq-label">رمز التحقق</span>
    <input class="nq-input" data-nq-pin-input name="code" maxlength="6" autocomplete="one-time-code" inputmode="numeric" required>
  </label>
</div>`,
    lifecycle: ['هيّئ الحقل الواحد؛ يُؤخذ الطول من maxlength أو يُستخدم ستة افتراضيًا، ويضيف المتحكم صفات الرمز الرقمي.', 'تُوحّد الأرقام وتُحذف المحارف غير الرقمية عند الإدخال واللصق دون توزيع الرمز على نقاط تركيز متعددة. ينتظر التطبيع اكتمال تركيب المحارف.', 'تعيد إعادة الضبط الرمز الابتدائي، ويستعيد destroy الصفات والقيمة ومحتوى الخانات الزخرفية الأصلي.'],
    api: ['عدد صحيح موجب لطول الرمز؛ الافتراضي ستة.', 'يعيد الرمز كنص موحّد الأرقام؛ تبقى الأصفار في بدايته ذات معنى.', 'خانات مرئية زخرفية اختيارية في React مع بقاء حقل إدخال حقيقي واحد.', 'خانات زخرفية اختيارية في HTML تُحدّث وتُخفى عن قارئات الشاشة.'],
    accessibility: ['استخدم حقلًا واحدًا مسمّى مع autocomplete=one-time-code.', 'لا تستخدم type=number؛ الرمز نص وقد يبدأ بصفر.', 'وضّح انتهاء صلاحية الرمز وأخطاء التحقق دون مسح ما أدخله المستخدم بصمت.'],
    limitations: ['لا يرسل المكوّن الرموز، ولا يتحقق منها، ولا يوفّر المصادقة أو تقييد المحاولات.'],
  }),
  'tag-input': localized('tag-input', {
    summary: 'إنشاء مجموعة وسوم نصية مميزة مع إضافة وحذف صريحين، وإرسال كل وسم كقيمة أصلية مكررة في النموذج.',
    usage: `<div class="nq-tag-input" data-nq="tag-input" data-nq-name="topics" data-nq-value='["التصميم"]'>
  <label class="nq-field"><span class="nq-label">أضف موضوعًا</span><input class="nq-input" data-nq-tag-input></label>
  <div data-nq-tags></div>
</div>`,
    lifecycle: ['هيّئ العناصر المركبة؛ تُهذّب الوسوم الابتدائية وتُزال المكررات، ثم تُعرض كشرائح قابلة للحذف.', 'يثبت Enter أو الفاصلة وسمًا فريدًا غير فارغ. يحذف Backspace آخر وسم عندما يكون الحقل فارغًا؛ ويمكن للصق إضافة وسوم مفصولة بفواصل أو أسطر.', 'ينشئ كل وسم مثبت حقلًا مخفيًا مسمّى. النص الجاري تحريره لا يُرسل كوسم، ويُفحص required على الوسوم المثبتة.', 'يعيد destroy محتوى الحاوية وصفات الحقل وقيمته وصلاحية الإدخال الأصلية. تعيد إعادة ضبط النموذج مجموعة الوسوم الابتدائية.'],
    api: ['مصفوفة الوسوم الابتدائية؛ JSON في الصفة أو مصفوفة في خيارات المتحكم.', 'اسم حقل النموذج المكرر للقيم المثبتة.', 'إضافة الوسوم وحذفها وإنهاء دورة حياة المتحكم.', 'تسميات الحذف ورسالة التحقق مترجمة حسب لغة التطبيق.'],
    accessibility: ['اشرح مفاتيح تثبيت الوسم بجوار الحقل. لا يثبت Enter الفارغ وسمًا، ولا تعترض اختصارات Control/Alt/Meta أو تركيب النص.', 'يحتاج كل زر حذف إلى تسمية تتضمن الوسم المقصود. يعود التركيز إلى محرر الوسوم بعد الحذف.', 'طبّق التعطيل والقراءة فقط على الكتابة والحذف معًا.'],
    frameworkNotes: 'يستخدم React مصفوفات نصية في value أو defaultValue مع onValueChange. عند التحكم الخارجي، طبّق التغييرات الواردة في المعالج. تعيد النماذج غير المتحكم بها القيم الافتراضية عند إعادة الضبط.',
  }),
  'multi-select': localized('multi-select', {
    summary: 'تصفية قائمة مربعات اختيار أصلية مع الحفاظ على جميع الخيارات المحددة، بما فيها المخفية مؤقتًا بنتيجة البحث.',
    usage: `<fieldset class="nq-multi-select" data-nq="multi-select" data-nq-required="true" lang="ar">
  <legend>الخدمات التي تهمك (اختر خدمة واحدة على الأقل)</legend>
  <label>تصفية الخيارات<input class="nq-input" type="search" data-nq-multiselect-search></label>
  <div data-nq-option><label><input class="nq-checkbox" type="checkbox" name="interest" value="business"> الأعمال</label></div>
  <div data-nq-option><label><input class="nq-checkbox" type="checkbox" name="interest" value="education"> التعليم</label></div>
  <span data-nq-status role="status"></span>
</fieldset>`,
    lifecycle: ['هيّئ القائمة القابلة للبحث؛ تحدد حالات checked القيم المختارة أولًا.', 'يخفي البحث التسميات غير المطابقة بعد تطبيع النص، لكنه لا يلغي اختيار عنصر مخفي.', 'تصدر تغييرات المربعات {value:string[]} وتُرسل القيم المكررة في النموذج. تعيد إعادة الضبط الاختيارات الأصلية وتطبق التصفية مجددًا.', 'يعيد destroy حالة التصفية ونص الحالة ويزيل المستمعات. أنهِ المتحكم وأعد تركيبه قبل استبدال عناصر الخيارات في HTML.'],
    api: ['غلاف يحتوي مربع اختيار أصليًا واحدًا مع تسميته.', 'معالج الاختيار ورسالة مترجمة لعدد النتائج المطابقة.', 'قيم الخيارات المحددة والمتاحة؛ لا تُرسل الخيارات المعطّلة.', 'اختيار قيمة متاحة واحدة على الأقل. تسمى رسالة التحقق validationMessage في Angular.', 'استخدم data-nq-required="true" أو خيارات createMultiSelect(root, { required: true, requiredMessage }). تتقدم الخيارات الصريحة على الصفات.'],
    accessibility: ['استخدم legend للمجموعة وتسمية مستقلة لحقل البحث.', 'يتحقق الاختيار الإلزامي عبر custom validity وaria-required على حقل البحث القابل للتركيز؛ لا تجعل نص البحث أو كل مربع اختيار إلزاميًا.', 'تمنع القراءة فقط تغيير الاختيار مع إبقاء البحث متاحًا؛ لا تُرسل المجموعة المعطّلة قيمًا ولا تمنع إرسال النموذج.', 'وضّح حالات عدم وجود نتائج والتحقق؛ تظل الاختيارات المخفية جزءًا من النموذج.'],
    limitations: ['قائمة محلية بمربعات اختيار، دون تحميل خيارات عن بُعد أو عرض افتراضي للقوائم الضخمة.'],
  }),
  calendar: localized('calendar', {
    summary: 'شبكة شهر قابلة للتنقل بلوحة المفاتيح، تعرض الميلادي أو أم القرى مع حفظ اليوم المختار بصيغة ISO الميلادية YYYY-MM-DD.',
    usage: `<div class="nq-calendar" data-nq="calendar" data-nq-value="2026-10-28"
  data-nq-month="2026-10-01" data-nq-min="2026-01-01" data-nq-max="2027-12-31"
  data-nq-calendar="islamic-umalqura" data-nq-locale="ar-SA" data-nq-name="appointment"
  aria-label="اختر تاريخ الموعد"></div>`,
    lifecycle: ['هيّئ العنصر المركب؛ ينشئ المتحكم شريط التنقل واختيار نظام التقويم وأسماء الأيام وشبكة التواريخ.', 'يغيّر التنقل الشهر المعروض، ويحدّث اختيار يوم متاح قيمة ISO. يحافظ تبديل التقويم على اليوم الميلادي نفسه.', 'يدعم المرجع الهجري الفترة الميلادية من 1924-08-01 إلى 2077-11-16. يلتزم التنقل بهذه الحدود ولا يستبدل المرجع بخوارزمية حسابية عامة بصمت.', 'يزيل destroy العناصر المولدة ويُبقي المحتوى الأصلي. حدّد شهرًا أو قيمة ابتدائية ثابتة إذا أردت عرضًا متطابقًا عند التصيير على الخادم.'],
    api: ['الاختيار ومرساة الشهر المرئي وحدود التطبيق كلها تواريخ ISO ميلادية.', 'نظام العرض مستقل عن اللغة واتجاه الكتابة.', 'لغة التسميات وبداية الأسبوع وقاعدة التطبيق للتواريخ غير المتاحة.', 'تُبلغ select عن التغيير، وتزامن setValue القيمة بصمت، وتتحكم بقية الدوال في العرض والتنظيف.'],
    accessibility: ['تتنقل الأسهم بالأيام والأسابيع، ويتبع الاتجاه الأفقي RTL أو LTR. ينتقل Home وEnd داخل الأسبوع.', 'ينتقل PageUp وPageDown بين الأشهر المعروضة، ويضيف Shift التنقل بالسنوات. لا يمكن اختيار يوم معطّل.', 'وفّر تسميات واضحة للأيام وشرحًا ظاهرًا للنطاق غير المتاح.'],
    limitations: ['المرجع المنشور المثبت بيانات تقويم مدني ذات نطاق محدد؛ ليس مزامنة حية مع خدمة رسمية أو إعلانًا لرؤية الهلال.', 'لا يوفر الحقل المخفي الاختياري في Calendar تحقق required الأصلي للتاريخ؛ استخدم DatePicker لهذا الغرض.'],
    frameworkNotes: 'يتيح React التحكم عبر value/defaultValue/onValueChange والشهر عبر month/defaultMonth/onMonthChange ومعالجات نظام التقويم. تحافظ بقية المحوّلات على عقد قيمة ISO نفسه. ترجم التسميات صراحةً، وراجع دليل موثوقية التقويم للمصادر والتحقق.',
  }),
  'date-picker': localized('date-picker', {
    summary: 'حقل نصي قابل لتحرير ISO مع تقويم نسق الميلادي أو الهجري بأم القرى؛ لا تظهر نافذة التاريخ الأصلية للمتصفح. تبقى القيمة المرسلة ميلادية بصيغة ISO مهما كان تقويم العرض.',
    usage: expandedSample('date-picker', 'guide-date-picker', 'ar'),
    lifecycle: ['هيّئ المكوّن بعد تركيب الحقل والزر والحوار وحاوية التقويم الداخلية. لا تهيّئ الحاوية الداخلية كمكوّن Calendar مستقل.', 'يفتح التقويم على شهر التاريخ المختار. يحدّث تأكيد اليوم الحقل الأصلي مرة واحدة، ويغلق الحوار، ويعيد التركيز إلى زر الفتح.', 'يبقي تبديل الميلادي والهجري الحوار مفتوحًا ويحافظ على قيمة ISO. يصف مخرج حي تحت الحقل التاريخ بنظام العرض المختار حتى بعد الإغلاق.', 'تُحفظ القيم الواقعة خارج النطاق الهجري وتُعلَّم بأنها غير صالحة مع شرح النطاق. يزيل الرجوع للميلادي خطأ النطاق الهجري دون إلغاء min وmax.', 'تزامن تواريخ ISO وإعادة الضبط التقويم والمخرج؛ تبقى المسودات الخاطئة ظاهرة وغير صالحة دون تغيير القيمة المعتمدة. يحرر destroy التقويم والحوار والمخرج المولد.'],
    api: ['تفضيلات نظام العرض واللغة الابتدائية.', 'يمتلك الحقل النصي المرئي التحقق، ويحمل حقل مخفي الاسم وقيمة ISO المعتمدة فقط. يعرض الحقل التاريخ بالتقويم النشط، ويكشف مسودة ISO عند التركيز للتحرير.', 'التحكم في فتح الحوار وإغلاقه ونظام العرض، مع تنظيف صريح.', 'تختلف أحداث تغيير قيمة ISO عن تغيير تقويم العرض. يتولى Calendar الداخلي تأكيد اليوم.'],
    accessibility: ['اكتب YYYY-MM-DD ميلاديًا أو افتح تقويم نسق بالزر أو ArrowDown. يحرّر النقر النص ويبقى Enter لإرسال النموذج.', 'يحتاج الحوار إلى عنوان وزر إغلاق، ويوفر Calendar تفاعل شبكة الأيام بلوحة المفاتيح. تعرض أيقونة المعلومات الرمادية بجوار الشهر الهجري النطاق عند المرور أو التركيز، ويغلق Escape التلميح وحده.', 'اربط رسائل النطاق وعدم الإتاحة المترجمة بالحقل، ولا تمسح تاريخًا قائمًا خارج النطاق بصمت.'],
    limitations: ['نطاق أم القرى: 1924-08-01–2077-11-16. تتبع المعاملات الرسمية سياسة الجهة المسؤولة عن التاريخ.'],
    frameworkNotes: 'يقبل DatePicker في React قيمة value/defaultValue/onValueChange ونظام calendar/defaultCalendar/onCalendarChange، مع تسميات مترجمة للمحدد والزر والحوار. تدخل isDateDisabled أيضًا ضمن صلاحية الحقل الأصلي في React.',
  }),
  'file-dropzone': localized('file-dropzone', {
    summary: 'إضافة سحب الملفات وإفلاتها إلى حقل ملفات حقيقي، مع فحص الأنواع المقبولة والإبقاء على اختيار الملف متاحًا للجميع.',
    usage: `<label class="nq-file-dropzone" data-nq="file-dropzone" data-nq-max-size="5242880">
  <strong>اختر المستندات أو أفلتها هنا</strong><span>PDF أو PNG، حتى 5 ميبيبايت للملف</span>
  <input type="file" data-nq-file-input name="documents" accept=".pdf,.png" multiple>
  <span data-nq-file-status role="status"></span>
</label>`,
    lifecycle: ['هيّئ غلاف حقل الملفات؛ يبقى الحقل الأصلي قابلًا للاستخدام دون السحب والإفلات.', 'ينقل الإفلات الصحيح ملفات المستخدم إلى FileList الحقيقي ويصدر change. يمنع التعطيل أو وضع القراءة فقط تغيير الاختيار.', 'تُمسح المجموعة إذا خالفت الأنواع أو حد الحجم في نسخة JavaScript المباشرة، وتُعلن رسالة الرفض. تمسح إعادة الضبط رسالة الحالة.', 'يزيل destroy مستمعي السحب والتغيير ويستعيد صفات الغلاف والحالة. ينظّف التطبيق طلبات الرفع وروابط object URL الخاصة به.'],
    api: ['أنواع الملفات وعددها وإتاحة الحقل وفق الصفات الأصلية.', 'حد اختياري بالبايت لكل ملف في المتحكم المباشر.', 'يعيد الملفات ويتيح ترجمة نص القبول أو الرفض في المتحكم المباشر.', 'يعيد الملفات ويترجم رفض النوع في React؛ يتولى المستهلك التحقق من الحجم.'],
    accessibility: ['أبقِ زر اختيار الملفات متاحًا للوحة المفاتيح واللمس.', 'وضّح قواعد النوع والحجم قبل الاختيار.', 'لا تعرض اختيار ملف محلي على أنه اكتمال رفع إلى الخادم.'],
    limitations: ['لا يتضمن المكوّن نقل الملفات أو تخزينها أو فحص محتواها أو التحقق على الخادم. عند غياب DataTransfer يبقى الاختيار الأصلي متاحًا.'],
  }),
  'toggle-group': localized('toggle-group', {
    summary: 'اختيار وضع واحد حصري أو عدة خيارات مستقلة. يستخدم الوضع المفرد أزرار radio، والمتعدد أزرارًا ذات حالة ضغط.',
    usage: `<fieldset class="nq-toggle-group" data-nq="toggle-group" data-variant="segmented">
  <legend>طريقة العرض</legend>
  <label><input type="radio" name="view" value="list" checked> قائمة</label>
  <label><input type="radio" name="view" value="grid"> شبكة</label>
</fieldset>`,
    lifecycle: ['اختر نموذج التحديد المفرد أو المتعدد وهيّئ المجموعة بعد تركيبها.', 'يعيد الوضع المفرد قيمة نصية من radio. يبدّل المتعدد aria-pressed ويعيد مصفوفة قيم نصية.', 'يحدد التطبيق أثر كل اختيار. تعيد إعادة الضبط الاختيار الابتدائي.', 'أنه المتحكم قبل استبدال عناصر المجموعة ونظّف الآثار الجانبية التي يملكها التطبيق.'],
    api: ['فعّل الوضع المتعدد؛ استخدم خيارات radio الأصلية في الوضع الآخر.', 'معرّف ثابت على زر الوضع المتعدد.', 'طريقة العرض البصرية في React.', 'يتبع شكل القيمة الوضع المفرد أو المتعدد في React.'],
    accessibility: ['وفّر legend أو تسمية للمجموعة.', 'تحتاج الأزرار المضغوطة تسمية ثابتة وaria-pressed، بينما يحتفظ radio بسلوك الأسهم الأصلي.', 'استخدم Tabs إذا كانت الخيارات تتحكم في لوحات تبويب مرتبطة.'],
    variants: ['مقاطع متجاورة: segmented', 'حدود خارجية: outline', 'اختيار مفرد أو متعدد'],
  }),
  popover: localized('popover', {
    summary: 'إظهار معلومات أو أدوات سياقية قرب الإجراء دون حجب بقية الصفحة. يبقى التنقل بين العناصر وفق ترتيب التركيز العادي.',
    usage: `<div class="nq-popover" data-nq="popover">
  <button class="nq-button" type="button" data-nq-trigger>معلومات الخدمة</button>
  <div class="nq-popover-panel" data-nq-panel role="region" aria-label="معلومات الخدمة" hidden>
    <p>راجع قائمة المستندات المطلوبة قبل التقديم.</p>
    <button type="button" data-nq-close>إغلاق</button>
  </div>
</div>`,
    lifecycle: ['هيّئ زر الفتح واللوحة المسمّاة؛ تُزامن aria-controls وaria-expanded تلقائيًا.', 'يبدّل الزر ظهور اللوحة، ويستخدم Tab ترتيب التركيز العادي. ينقل الخيار focusOnOpen التركيز إلى الداخل عند تفعيله.', 'يعيد Escape أو زر الإغلاق التركيز إلى زر الفتح. يغلق الضغط الخارجي أو خروج التركيز اللوحة دون احتجاز التركيز.', 'يعيد destroy الصفات ويزيل مستمعي المستند، ويستعيد التركيز إذا أزيلت لوحة مفتوحة كان التركيز داخلها.'],
    api: ['علامات زر الفتح واللوحة وزر الإغلاق الاختياري.', 'إشعار تغير الحالة وخيار نقل التركيز أول الفتح.', 'دوال إظهار اللوحة وإغلاقها وإنهاء المتحكم.', 'حالة ظهور متحكم بها أو ابتدائية ومعالجها في React.'],
    accessibility: ['سمِّ اللوحة عندما تكون منطقة region.', 'ضع المحتوى التفاعلي هنا أو في Dialog، وليس داخل Tooltip.', 'استخدم Dialog للمهام المشروطة كي يكون تعطيل الخلفية واحتواء التركيز واضحين.'],
    limitations: ['هذا نمط إظهار سياقي؛ لا يتضمن محرك تموضع عائم يتجنب حدود الشاشة تلقائيًا.'],
  }),
  menu: localized('menu', {
    summary: 'قائمة إجراءات مختصرة بتنقل لوحة مفاتيح يتجاوز العناصر المعطّلة ويدعم البحث بالكتابة. تختلف عن روابط تنقل الموقع العادية.',
    usage: `<div class="nq-menu" data-nq="menu">
  <button class="nq-button" type="button" data-nq-trigger>إجراءات الطلب</button>
  <div class="nq-menu-content" data-nq-panel role="menu" aria-label="إجراءات الطلب" hidden>
    <button class="nq-menu-item" type="button" role="menuitem" data-nq-value="edit">تعديل</button>
    <button class="nq-menu-item" type="button" role="menuitem" data-nq-value="archive">أرشفة</button>
  </div>
</div>`,
    lifecycle: ['هيّئ الزر واللوحة وقائمة عناصر menuitem المركبة والثابتة.', 'يركز الفتح على عنصر متاح. تتنقل الأسهم الرأسية وHome وEnd، وتبحث الكتابة عن التسميات المطابقة.', 'ينفذ Enter أو المسافة أو النقر اختيار الإجراء، ويصدر قيمته، ويغلق القائمة، ويعيد التركيز. يتولى التطبيق العملية الفعلية.', 'يغلق Escape ويعيد التركيز؛ يغلق Tab ويواصل التنقل. يزيل destroy المستمعات ومؤقت البحث بالكتابة.'],
    api: ['معرّف الإجراء الذي يتلقاه التطبيق.', 'معالج الاختيار في المتحكم المباشر؛ يصعد nq:change بالقيمة أيضًا.', 'التحكم في ظهور القائمة ودورة حياتها.', 'بيانات القائمة ومعالجها في React؛ قد يحتوي العنصر disabled وhref وonSelect.'],
    accessibility: ['استخدم button للإجراءات وa للتنقل الحقيقي.', 'سمِّ القائمة وزرها، ولا تسمح بتنفيذ العناصر المعطلة.', 'استخدم روابط nav العادية لتنقل الموقع دون فرض أدوار menu بلا حاجة.'],
    limitations: ['لا توجد قوائم فرعية متداخلة أو سحب وإفلات أو تنفيذ إجراءات عن بُعد.'],
  }),
  drawer: localized('drawer', {
    summary: 'لوحة حوار مشروطة من الجانب أو الأسفل تستخدم دورة Dialog الأصلية، وتناسب المرشحات أو المهام المساندة المركّزة.',
    usage: `<button class="nq-button" type="button" data-nq-dialog-open="filters">فتح المرشحات</button>
<dialog id="filters" class="nq-dialog nq-drawer" data-nq="drawer" data-side="end" aria-labelledby="filters-title">
  <h2 id="filters-title">مرشحات الطلبات</h2>
  <label>الحالة<select class="nq-select" name="status"><option value="all">الكل</option><option value="review">قيد المراجعة</option></select></label>
  <button type="button" class="nq-button" data-nq-dialog-close autofocus>تم</button>
</dialog>`,
    lifecycle: ['هيّئ dialog بعد تركيبه، واربط زر فتح خارجيًا بمعرّفه.', 'يوفر showModal الطبقة العليا وتعطيل الخلفية واحتواء التركيز. يتبع الجانب المنطقي اتجاه الصفحة.', 'يعيد الإغلاق أو Escape التركيز إلى زر الفتح المتصل. يحدد التطبيق سياسة تطبيق المرشحات أو تجاهلها.', 'يستخدم destroy تنظيف Dialog دون إضافة مصيدة تركيز أو مدير حوارات آخر.'],
    api: ['موضع منطقي مستقل عن اللغة.', 'دورة حياة الحوار الأصلي نفسها في المتحكم المباشر.', 'يرث Drawer خصائص Dialog في React ويضيف جانب الظهور.'],
    accessibility: ['وفّر عنوانًا واضحًا وزر إغلاق.', 'اختر موضع التركيز الأول داخل المهمة، لا على عنصر dialog نفسه.', 'لا تستخدم حوارًا مشروطًا للتنقل الجانبي الدائم.'],
    variants: ['بداية السطر: start', 'نهاية السطر: end', 'أسفل الصفحة: bottom'],
  }),
  'toast-region': localized('toast-region', {
    summary: 'منطقة إشعارات يملكها التطبيق مع إغلاق صريح وأولوية إعلان مقصودة. لا تختفي الرسائل تلقائيًا بمؤقت.',
    usage: `<div class="nq-toast-region" data-nq="toast-region" aria-label="الإشعارات">
  <div id="draft-saved" class="nq-toast" data-nq-toast data-tone="success">
    <p>تم حفظ مسودتك.</p>
    <button type="button" data-nq-dismiss aria-label="إغلاق إشعار حفظ المسودة">×</button>
  </div>
</div>`,
    lifecycle: ['ركّب منطقة الإعلان مبكرًا وهيّئ أزرار الإغلاق. أضف رسائل استجابة لنتائج فعلية.', 'يخفي الإغلاق المباشر الإشعار الأقرب ويصدر معرّفه. إذا كان التركيز داخله، ينتقل إلى زر إغلاق آخر أو المنطقة.', 'تبقى رسائل إطار العمل ملكًا للمستدعي؛ طبّق onDismiss بحذف المعرّف الثابت من الحالة.', 'يستعيد destroy حالات الإخفاء وصفات المنطقة ويزيل المستمعات. لا يوجد مؤقت انتهاء تلقائي يلزم تنسيقه.'],
    api: ['علامتا جذر الرسالة وزر إغلاقها.', 'إغلاق صريح بمعرّف أو عنصر، ثم إنهاء المتحكم.', 'بيانات رسائل يملكها التطبيق وطلبات إزالتها في React.', 'تذهب الرسائل المعلّمة صراحةً بأنها عاجلة فقط إلى المنطقة ذات الإعلان الفوري في React.'],
    accessibility: ['استخدم حالة مهذبة للنتائج العادية، واحجز الإعلان الفوري للتنبيهات العاجلة.', 'وفّر تسمية مفيدة لكل زر إغلاق ومعرّفًا ثابتًا لكل رسالة.', 'أبقِ الإجراءات المهمة وأخطاء التحقق متاحة في الصفحة، ولا تكتفِ بالإشعار العابر.'],
    variants: ['معلومات، نجاح، تحذير، خطر', 'إعلان مهذب أو إعلان عاجل عند تحديده صراحةً'],
  }),
  collapsible: localized('collapsible', {
    summary: 'قسم قابل للطي مبني على details الأصلي للمحتوى المساند الاختياري، مع دعم لوحة المفاتيح دون تهيئة JavaScript.',
    usage: `<details class="nq-collapsible">
  <summary>قبل أن تبدأ</summary>
  <p>جهّز بيانات المنشأة والمستندات الداعمة.</p>
</details>`,
    lifecycle: ['اعرض details مع summary يصف محتواه، وحدد open اختياريًا.', 'يغيّر تفعيل summary الحالة ويصدر toggle. يمكن في React التحكم في open أو تعيين defaultOpen.', 'لا يُركب متحكم مباشر. تزول الحالة مع الواجهة ما لم يحفظها التطبيق.'],
    api: ['حالة التوسيع الأصلية.', 'النص الذي يعرضه summary في React.', 'الحالة المتحكم بها أو الابتدائية وطلبات تغييرها في React.', 'يمنع التفعيل داخل محوّل React؛ لا توجد صفة disabled أصلية على details.'],
    accessibility: ['اجعل عنوان summary موجزًا وواضحًا.', 'لا تضع أدوات تفاعلية غير مرتبطة داخل summary.', 'أبقِ التعليمات الضرورية ظاهرة بدل اشتراط اكتشاف قسم مطوي.'],
  }),
  'tree-view': localized('tree-view', {
    summary: 'التنقل في مجموعة هرمية بتحديد واحد وحالة توسع، مع نقطة تركيز متحركة واحدة بين العقد المرئية.',
    usage: `<ul class="nq-tree-view" data-nq="tree-view" role="tree" aria-label="المستندات">
  <li role="treeitem" data-nq-value="business" aria-expanded="true">
    <button type="button" data-nq-tree-toggle tabindex="-1" aria-label="توسيع مستندات المنشأة أو طيها">▾</button>
    <span data-nq-tree-label>المنشأة</span>
    <ul role="group"><li role="treeitem" data-nq-value="license"><span data-nq-tree-label>الرخصة</span></li></ul>
  </li>
</ul>`,
    lifecycle: ['هيّئ الهيكل الثابت بمعرّفات فريدة وعقد أم قابلة للتوسيع محددة صراحةً.', 'تتنقل الأسهم الرأسية بين العقد المرئية، وتوسّع الأسهم الأفقية أو تطوي وتنتقل للأب أو الابن بحسب RTL أو LTR.', 'يختار Enter أو المسافة عقدة متاحة ويبلغ بقيمتها؛ لا يؤدي الاختيار وحده إلى تنقل أو جلب مستند.', 'أنه المتحكم قبل استبدال الهيكل لاستعادة صفات التركيز وARIA وإزالة المستمعات.'],
    api: ['هوية ثابتة للعقدة المستخدمة في التحديد.', 'حالة الأب ومجموعة أبنائه لبناء هيكل صريح.', 'بيانات العقد وخصائص التحديد في React؛ تتضمن العقدة id وlabel وdisabled وchildren.', 'معرّفات العقد الموسعة، كحالة متحكم بها أو ابتدائية في React.'],
    accessibility: ['استخدم tree عندما يفيد نموذج لوحة المفاتيح الهرمي؛ قد تكون قائمة تنقل متداخلة أبسط.', 'سمِّ الشجرة وكل عقدة بتسمية مقروءة.', 'امنع التفاعل مع العقد المعطلة وحافظ على تركيز مرئي بعد الطي.'],
    limitations: ['لا يدعم التحديد المتعدد أو العرض الافتراضي أو السحب والإفلات أو تحميل العقد عن بُعد.'],
  }),
  carousel: localized('carousel', {
    summary: 'عرض شريحة واحدة في كل مرة، مع زري السابق والتالي وإعلان موضعها. لا ينتقل تلقائيًا.',
    usage: `<section class="nq-carousel" data-nq="carousel" aria-label="الخدمات المميزة">
  <div><article data-nq-slide><h3>خدمات الأعمال</h3></article><article data-nq-slide><h3>الخدمات البلدية</h3></article></div>
  <button type="button" data-nq-previous>الشريحة السابقة</button>
  <span data-nq-carousel-status role="status"></span>
  <button type="button" data-nq-next>الشريحة التالية</button>
</section>`,
    lifecycle: ['هيّئ الشرائح وأزرارها بعد تركيبها؛ تُخفى الشرائح غير النشطة.', 'يغيّر تنقل المستخدم الفهرس النشط ويعلن موضع الشريحة. تتعطل أزرار الأطراف ما لم يُفعّل الالتفاف.', 'يبقى المحتوى ملكًا للمستدعي، ولا يوجد مؤقت تشغيل تلقائي أو عمل شبكي في الخلفية.', 'يستعيد destroy حالات الشرائح والأزرار ويزيل المستمعات قبل استبدال عناصر الشرائح.'],
    api: ['علامات الشرائح وأزرار التنقل الصريحة.', 'فهرس شريحة يبدأ من الصفر، متحكم به أو ابتدائي في React.', 'التفاف اختياري بين أول شريحة وآخرها في React.', 'تسميات مترجمة للأزرار وإعلان الموضع في React.'],
    accessibility: ['سمِّ العارض وزري اتجاه التنقل.', 'يجب ألا يبقى محتوى الشرائح المخفية قابلًا للوصول بلوحة المفاتيح.', 'فضّل قائمة بسيطة عندما يحتاج المستخدم إلى مقارنة العناصر معًا.'],
    limitations: ['لا يوجد تشغيل تلقائي أو محرك تمرير بالإيماءة أو تحميل افتراضي للشرائح.'],
  }),
  link: localized('link', {
    summary: 'التنقل إلى وجهة فعلية بعنصر رابط أصلي، مع الحفاظ على سجل المتصفح والقائمة السياقية وسلوك لوحة المفاتيح.',
    usage: `<a class="nq-link" href="./services">استكشف الخدمات</a>
<a class="nq-link" href="https://example.org" target="_blank" rel="noopener noreferrer">إرشادات خارجية — تفتح في تبويب جديد</a>`,
    lifecycle: ['وفّر href فعليًا ونصًا يصف الوجهة.', 'دع المتصفح يتنقل أو اربط العنصر بموجّه التطبيق مع الحفاظ على دلالات الرابط الأصلية.', 'لا يحتاج الرابط إلى متحكم مباشر؛ يدير الموجّه مستمعيه ودورة حياته.'],
    api: ['عنوان الوجهة الفعلية.', 'يفتح تبويبًا جديدًا ويضيف noopener وnoreferrer في React.', 'معالجة بصرية أخف للرابط.'],
    accessibility: ['اكتب نصًا مفهومًا للرابط حتى خارج سياقه.', 'وضّح فتح تبويب جديد عندما يؤثر ذلك على المستخدم.', 'استخدم button للإجراءات التي لا تنتقل إلى وجهة.'],
    variants: ['افتراضي', 'هادئ: subtle', 'رابط خارجي'],
  }),
  'icon-button': localized('icon-button', {
    summary: 'زر إجراء مختصر بأيقونة زخرفية وتسمية قابلة للوصول تصف العملية.',
    usage: `<button class="nq-button" type="button" data-icon-only aria-label="إغلاق الحوار">
  <span aria-hidden="true">×</span>
</button>`,
    lifecycle: ['اعرض الزر الأصلي باسم صريح للعملية.', 'عالج النقر كأي زر آخر، بما في ذلك الانشغال أو التعطيل عند الحاجة.', 'لا يحتاج إلى متحكم مباشر؛ تتبع مستمعات إجراء التطبيق دورة حياة الواجهة.'],
    api: ['اسم قابل للوصول يطبّقه React على الزر.', 'علامة لتحديد أبعاد زر مربع في HTML.', 'نفس خصائص المظهر والحجم والانشغال في Button الخاص بـReact.'],
    accessibility: ['لا تعتمد على title أو شكل الأيقونة بوصفه الاسم الوحيد.', 'أخفِ الأيقونة عن قارئات الشاشة وأبقِ مساحة النقر مناسبة.', 'يمكن للتلميح أن يكمّل التسمية، لكنه لا يحل محلها.'],
  }),
  'button-group': localized('button-group', {
    summary: 'تجميع بصري ودلالي لإجراءات مستقلة مترابطة، دون إضافة حالة اختيار أو اختصارات شريط أدوات.',
    usage: `<div class="nq-button-group" role="group" aria-label="إجراءات المستند">
  <button class="nq-button" type="button">حفظ</button>
  <button class="nq-button" data-variant="secondary" type="button">معاينة</button>
</div>`,
    lifecycle: ['اعرض مجموعة مسمّاة تحتوي أزرار إجراءات أصلية.', 'ينفذ كل زر إجراءه ويظل محطة Tab عادية.', 'لا يوجد متحكم للمجموعة أو إدارة ضمنية لحالات الضغط.'],
    api: ['اسم مجموعة الإجراءات في React.', 'أزرار أصلية مستقلة داخل المجموعة.', 'دلالات المجموعة في HTML دون ادعاء سلوك toolbar.'],
    accessibility: ['سمِّ المجموعة بإيجاز إذا لم تكن العلاقة واضحة من السياق.', 'لا تضف دور toolbar دون تطبيق نموذج لوحة مفاتيحه.', 'استخدم ToggleGroup للأوضاع القابلة للاختيار.'],
  }),
  chip: localized('chip', {
    summary: 'وسم مختصر أو اختيار قابل للإزالة، مع زر حذف اختياري منفصل عن نصه.',
    usage: `<span class="nq-chip" data-tone="info">الأعمال
  <button type="button" aria-label="إزالة مرشح الأعمال">×</button>
</span>`,
    lifecycle: ['اعرض النص وزر حذف مسمّى عندما يكون الوسم قابلًا للإزالة.', 'يحذف التطبيق القيمة المختارة عند تفعيل الزر؛ لا تحتوي شريحة HTML وحدها متحكمًا تلقائيًا.', 'يبلغ onRemove في React عن الإجراء دون تعديل مصفوفات المستدعي. بعد إزالة شريحة مركّزة أعد التركيز إلى عنصر مجاور مفيد.'],
    api: ['نبرة مرئية للفئة أو الحالة في React.', 'معالج الإزالة الاختياري وتسميته القابلة للوصول في React.', 'يمنع إجراء الإزالة في React.', 'مظهر اختياري بحدود خارجية في HTML.'],
    accessibility: ['اجعل تسمية الحذف محددة بالوسم.', 'لا تجعل وسوم الحالة غير التفاعلية محطات تركيز.', 'استخدم TagInput لدورة كاملة لتحرير الوسوم وإرسال قيمها.'],
    variants: ['نبرة لونية', 'حدود خارجية', 'قابل للإزالة'],
  }),
  stat: localized('stat', {
    summary: 'عرض مؤشر رقمي مسمّى مع شرح أو اتجاه تغير اختياري. يتولى التطبيق تنسيق القيمة وتفسير التغير.',
    usage: `<div class="nq-stat">
  <span class="nq-stat-label">الطلبات المكتملة</span>
  <strong class="nq-stat-value">1٬284</strong>
  <span class="nq-stat-trend" data-tone="success">أكثر بنسبة 12٪ من الشهر الماضي</span>
</div>`,
    lifecycle: ['نسّق القيمة للغة المختارة واعرض اسم المؤشر وفترته الزمنية.', 'حدّثه من بيانات فعلية ووضّح هل الارتفاع أو الانخفاض إيجابي أم سلبي أم محايد في هذا السياق.', 'لا يجلب المكوّن البيانات أو يستطلعها؛ ألغِ اشتراكات التطبيق عند إزالة الواجهة.'],
    api: ['اسم المؤشر والقيمة المنسّقة لدى المستدعي، وهما مطلوبان في React.', 'سياق اختياري ومعلومات المقارنة في React.'],
    accessibility: ['اذكر الوحدات وفترة المقارنة.', 'لا تعتمد على سهم أو لون أخضر أو أحمر لتفسير الاتجاه.', 'تجنب تحويل المؤشرات السريعة إلى مناطق حيّة كثيرة الإعلانات.'],
  }),
  timeline: localized('timeline', {
    summary: 'عرض أحداث أو سجل إجراءات بترتيب مفهوم، مع تواريخ وأوصاف وحالة حالية أو مكتملة عند الحاجة.',
    usage: `<ol class="nq-timeline" aria-label="سجل الطلب">
  <li class="nq-timeline-item"><strong>استلام الطلب</strong><time datetime="2026-10-27">27 أكتوبر 2026</time></li>
  <li class="nq-timeline-item" aria-current="step"><strong>المراجعة جارية</strong><p>يجري فحص المستندات الداعمة.</p></li>
</ol>`,
    lifecycle: ['اعرض أحداثًا ثابتة الهوية بترتيب زمني أو إجرائي مقصود.', 'أضف الأحداث أو حدّثها من بيانات التطبيق المعتمدة؛ لا يتابع المكوّن طلبًا عن بُعد بمفرده.', 'أزل العرض مع الواجهة ونظّف استطلاع التطبيق للبيانات بصورة مستقلة.'],
    api: ['سجلات أحداث ثابتة وتواريخ ظاهرة مترجمة في React.', 'حالة كل حدث ضمن التسلسل.', 'اسم اختياري قابل للوصول للسجل في React.'],
    accessibility: ['استخدم قائمة مرتبة وعنصر time بصفة datetime عند وجود تاريخ.', 'عبّر عن الحالة الحالية والمكتملة بالنص إلى جانب المظهر.', 'ميّز الأحداث المسجلة عن التقديرات المستقبلية.'],
  }),
  meter: localized('meter', {
    summary: 'عرض قياس عددي ضمن نطاق معلوم باستخدام meter الأصلي، مثل استخدام التخزين أو درجة تقييم.',
    usage: `<label>استخدام التخزين — 65٪
  <meter class="nq-meter" min="0" max="100" low="25" high="85" optimum="20" value="65">65٪</meter>
</label>`,
    lifecycle: ['حدّد حدًا أدنى وأقصى وقيمة قياس متوافقة.', 'حدّث value عند تغير القياس؛ توضّح low وhigh وoptimum تفسير النطاق.', 'لا توجد دورة اكتمال مهمة أو متحكم. يمتلك التطبيق بيانات القياس.'],
    api: ['القياس الحالي ونطاقه العددي.', 'العتبات والمنطقة المفضلة ضمن النطاق.', 'تسمية القياس المطلوبة في React.'],
    accessibility: ['اشرح الوحدات والعتبات بالنص.', 'استخدم Progress لاكتمال عملية بدلًا من Meter.', 'لا تعبّر عن النطاق الآمن أو غير الآمن باللون وحده.'],
  }),
  'avatar-group': localized('avatar-group', {
    summary: 'عرض مجموعة أشخاص مسمّاة مع عدد مختصر للأعضاء الإضافيين عند تقييد العناصر المرئية.',
    usage: `<div class="nq-avatar-group" role="group" aria-label="فريق المراجعة">
  <span class="nq-avatar" role="img" aria-label="نورة أحمد">ن أ</span>
  <span class="nq-avatar" role="img" aria-label="أمل صالح">أ ص</span>
  <span class="nq-avatar" role="img" aria-label="عضوان إضافيان">+2</span>
</div>`,
    lifecycle: ['وفّر أعضاء مسمّين بهويات ثابتة واختر حدًا مرئيًا يلائم المساحة.', 'يحسب React العدد المتبقي؛ ترجم تسميته القابلة للوصول. تأتي تغيرات العضوية من بيانات التطبيق.', 'لا يوجد متحكم لاختيار الأشخاص أو جلب ملفاتهم؛ تظل روابط الصور ملكًا للتطبيق.'],
    api: ['أسماء الأعضاء وصورهم أو أحرفهم الاختيارية في React.', 'اسم المجموعة المطلوب في React.', 'أقصى عدد مرئي من الصور المسمّاة؛ الافتراضي خمسة.', 'منسّق التسمية المترجمة لعدد الأعضاء الإضافيين في React.'],
    accessibility: ['سمِّ المجموعة وكل صورة تؤدي معنى.', 'لا يغني العدد الإضافي عن قائمة أعضاء كاملة قابلة للوصول عندما تكون مطلوبة.', 'لا توحِ بأن الصورة تفتح ملفًا إلا إذا كانت رابطًا أو زرًا فعليًا.'],
  }),
  'data-table': localized('data-table', {
    summary: 'إضافة فرز ثابت ومراعي للغة إلى جدول دلالي، مع الحفاظ على الرؤوس والصفوف الأصلية دون ادعاء سلوك ورقة حساب قابلة للتحرير.',
    usage: `<div class="nq-table-wrap">
  <table class="nq-table nq-data-table" data-nq="data-table" data-nq-locale="ar-SA">
    <caption>الطلبات</caption>
    <thead><tr><th data-nq-key="name"><button type="button" data-nq-sort="name">الخدمة</button></th><th data-nq-key="days" data-nq-type="number"><button type="button" data-nq-sort="days">الأيام</button></th></tr></thead>
    <tbody><tr><td>الرخصة</td><td>3</td></tr><tr><td>الشهادة</td><td>1</td></tr></tbody>
  </table>
</div>`,
    lifecycle: ['هيّئ الجدول المركب بمفاتيح واضحة للرؤوس القابلة للفرز ومعلومات نوع القيم.', 'يبدّل تفعيل رأس الفرز الترتيب التصاعدي والتنازلي وaria-sort. تُفرز الأعداد رقميًا والنصوص وفق اللغة.', 'الفرز ثابت، وتبقى القيم المفقودة أخيرًا. يعيد React نسخة مرتبة دون تعديل صفوف المستدعي.', 'يعيد destroy في النسخة المباشرة ترتيب tbody وصفات الرؤوس الأصلية. أنه المتحكم قبل استبدال هيكل الصفوف أو الرؤوس.'],
    api: ['مفتاحان متطابقان يربطان زر الفرز بعموده.', 'استخدم number للأعمدة الرقمية؛ تُفرز القيم المعروضة كنصوص خلاف ذلك.', 'قيمة آلية للفرز بدل النص الظاهر عند الحاجة.', 'حالة الفرز الحالية أو الابتدائية في React بصيغة {key,direction}.'],
    accessibility: ['استخدم caption وخلايا th الأصلية وزرًا حقيقيًا داخل كل رأس قابل للفرز.', 'ضع aria-sort على الرأس النشط وترجم تسمية الإجراء.', 'أبقِ التمرير الأفقي قابلًا للاستخدام على الشاشات الضيقة مع حفظ علاقات الرؤوس بالخلايا.'],
    frameworkNotes: 'تستخدم أعمدة DataTable في React المفاتيح key وlabel وsortable وrender وrowHeader، مع rows وخيارات rowKey وlocale وemptyMessage وgetSortLabel. يستخدم Table شكلًا مختلفًا بأسماء header وcell؛ لا تخلط العقدين.',
    limitations: ['لا يوفّر تحرير الخلايا أو العرض الافتراضي أو تحديد عدة صفوف أو جلب البيانات عن بُعد أو نموذج مفاتيح ورقة الحساب.'],
  }),
};
