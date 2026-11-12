import {buttonGroupMarkup} from './button-group-demo';
import {contentNavigationDemoMarkup} from './content-navigation-demo';
import {ratingDemoMarkup,ratingDisplayMarkup} from './rating-demo';
import {carouselDemoMarkup} from './carousel-demo';
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
  "Controller options": "خيارات المتحكم",
  "Text inputs": "مدخلات نصية",
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
  'content-navigation': localized('content-navigation', {
    summary: 'شجرة تنقل داخل الصفحة تتابع القسم الحالي أثناء التمرير. يمرّر اختيار الوجهة إلى قسمها داخل الحاوية المحددة دون تغيير عنوان الصفحة.',
    usage: contentNavigationDemoMarkup('ar','nested','guide-content-nav'),
    lifecycle: ['اعرض أقسامًا بمعرّفات ثابتة وعناصر تنقل تقابلها. استخدم data-hw-section على روابط HTML وdata-hw-scroll-root لمعرّف حاوية تمرير محدودة عند الحاجة.', 'هيّئ المتحكّم بعد وجود التنقل والأقسام المستهدفة. تتولى الأطر عناصرها ومستمعات التمرير وتنظيف المراقبين.', 'يحدّث التمرير الرابط الحالي ومؤشر القسم الأب. يمرّر اختيار الوجهة المتاحة إلى قسمها مع بقاء المسار كما هو؛ ويصبح التمرير فوريًا عند تقليل الحركة.', 'حرّر متحكّم JavaScript قبل إزالة التنقل. يظل محتوى الأقسام والتوجيه وجلب البيانات من مسؤولية التطبيق.'],
    api: ['شجرة أصلية بعناصر {id,label,disabled?,children?}؛ يشير id إلى معرّف القسم وليس عنوان URL.', 'اسم منطقة التنقل يقدّمه التطبيق (مطلوب ما لم يُسمَّ التنقل في البنية) وعنوان مرئي اختياري؛ القيمة الافتراضية لـshowHeading هي true.', 'تفعيل اختياري للتثبيت sticky؛ يستخدم HTML الصفة data-sticky=true، ويدير التطبيق حاوية التمرير والمساحة الرأسية المتاحة.', 'مرجع عنصر في الأطر أو معرّف عنصر في HTML. عند إغفاله تُتابع النافذة؛ توفّر جميع أمثلة الدليل حاوية محلية مستقلة.', 'إزاحة من بداية المحور الرأسي لترويسة التطبيق الثابتة. تستخدم الأمثلة 0 داخل حاوياتها المحلية.', 'دالة في React أو حدث في Vue أو مخرج في Angular يعيد معرّف القسم الحالي.', 'علامة على رابط HTML تقابل معرّف قسم موجود؛ تعبّر القوائم المتداخلة عن التسلسل.', 'قراءة القسم الحالي، أو طلب التنقل، أو تحديث قياسات الأهداف، أو تنظيف المتحكّم. تعيد navigate ما إذا قُبل الهدف.', 'يعيد JavaScript معرّف القسم عند تغيّره، بما في ذلك القسم المكتشف ابتدائيًا.'],
    accessibility: ['استخدم منطقة nav باسم واضح يقدّمه التطبيق. تحتفظ الروابط بنصوص مفهومة وhref داخل الصفحة قبل التهيئة.', 'علّم الوجهة الحالية وحدها باستخدام aria-current=location، وأخفِ المؤشرات الزخرفية عن التقنيات المساعدة.', 'امنع تفعيل العناصر المعطلة. يتنقل Tab وEnter بين الروابط بصورة عادية؛ لا تستخدم أدوار tablist أو menu لتنقل المستند.', 'سمِّ حاوية التمرير المحدودة وأتح الوصول إليها بلوحة المفاتيح. اضبط offset حتى لا تحجب الترويسات الثابتة أو المثبتة الأقسام.'],
    variants: ['شجرة أقسام متداخلة', 'عنوان ظاهر أو مخفي مع تسمية مخصصة', 'تمرير النافذة أو حاوية محدودة', 'تثبيت التنقل sticky اختياريًا'],
    limitations: ['لا يتضمن المكوّن موجّه مسارات أو تحميلًا بعيدًا أو إنشاء أقسام تلقائيًا. يجب أن تكون المعرّفات فريدة في المستند، ويدير التطبيق المحتوى والتخطيط.', 'تمرّر أمثلة الدليل داخل مساحتها المحلية فقط، فلا تغيّر المسار أو موضع الدليل المحيط.'],
    frameworkNotes: 'يقبل React وVue الخصائص items وscrollRoot. يوفّر Angular المكوّن HwContentNavigationComponent بالشكل نفسه للعناصر ومدخل scrollRoot. تُعيد onCurrentChange في React و@current-change في Vue و(currentChange) في Angular المعرّف المتابَع. تملك الأطر عناصرها؛ وتظل تهيئة JavaScript مستقلة.',
  }),
  'input-group': localized('input-group', {
    summary: 'تجمع بادئة أو لاحقة أو إجراءً مساعدًا بجوار حقل أصلي، مع الحفاظ على تسمية الحقل وقيمته المستقلة.',
    usage: `<label class="hw-field"><span class="hw-label">نطاق الموقع</span>
  <span class="hw-input-group">
    <span class="hw-input-addon" aria-hidden="true">https://</span>
    <input class="hw-input" name="host" type="text" dir="ltr" aria-describedby="host-hint">
  </span>
</label>
<span class="hw-hint" id="host-hint">أدخل اسم النطاق؛ يضيف التطبيق بادئة HTTPS.</span>`,
    lifecycle: ['ضع الحقل المسمّى بين الإضافات الاختيارية.', 'اقرأ قيمة الحقل الفعلية؛ لا يدخل نص البادئة أو اللاحقة ضمن FormData تلقائيًا.', 'لا تحتاج المجموعة إلى تهيئة JavaScript. تظل الأزرار المساعدة مسؤولة عن سلوكها الأصلي، وينظّف التطبيق مستمعيها عند إزالة الواجهة.'],
    api: ['محتوى اختياري قبل الحقل وبعده في React.', 'صنف غلاف البادئة أو اللاحقة في HTML.', 'الحقل الحقيقي يحتفظ باسمه وقيمته ودوره داخل النموذج.'],
    accessibility: ['وفّر تسمية فعلية عبر Field أو عنصر label.', 'اربط الوحدات أو البوادئ المؤثرة بتعليمات ظاهرة باستخدام aria-describedby.', 'أخفِ الأيقونة الزخرفية عن قارئات الشاشة، وسمِّ الزر المساعد تسمية مستقلة.'],
  }),
  'password-field': localized('password-field', {
    summary: 'حقل كلمة مرور أصلي مع أيقونة عين مدمجة لإظهارها أو إخفائها. يتغير نوع العرض مع بقاء عنصر الإدخال نفسه وقيمته.',
    usage: `<div class="hw-field hw-password-field" data-hw="password-field">
  <label class="hw-label" for="account-password">كلمة المرور</label>
  <div class="hw-password-control">
    <input id="account-password" class="hw-input" type="password" name="password" autocomplete="current-password" data-hw-password-input>
    <button class="hw-button" type="button" data-hw-password-toggle data-hw-show-label="إظهار كلمة المرور" data-hw-hide-label="إخفاء كلمة المرور">إظهار كلمة المرور</button>
  </div>
</div>`,
    lifecycle: ['هيّئ الحقل وزر الرؤية بعد تركيب عناصرهما في الصفحة.', 'يبدّل الزر النوع بين password وtext، ويحدّث حالته وتسميته، ويصدر الحدث {visible}. لا يمكن كشف قيمة حقل معطّل عبر الزر.', 'تعيد إعادة ضبط النموذج الحقل في نسخة JavaScript المباشرة إلى وضع الإخفاء.', 'عند destroy تُستعاد صفات الحقل والزر ومحتواه الأصلي، وتُزال المراقبات والمستمعات.'],
    api: ['علامتان تربطان الحقل بزر التحكم في ظهوره.', 'تسميتا الإظهار والإخفاء لقارئات الشاشة، مطلوبتان ويقدّمهما التطبيق؛ تقرأ نسخة Vanilla تسمية الزر المكتوبة أو aria-label، ثم data-hw-show-label وdata-hw-hide-label، ثم الخيارات.', 'الأيقونة المدمجة هي الافتراضية. اختر text لعرض التسمية نصيًا؛ تدعم النسخة المباشرة data-hw-toggle-variant="text".', 'خصّص قناعي العين باستخدام url(...)، وحجمهما الافتراضي 1.5rem عند الحاجة.', 'تبديل الرؤية ثم إنهاء دورة حياة المتحكم.', 'تحكم في الرؤية أو قيمتها الابتدائية في React، بصورة مستقلة عن قيمة كلمة المرور.'],
    accessibility: ['اختر autocomplete=current-password أو new-password وفق الغرض.', 'للزر تسمية يقدّمها التطبيق وحالة ضغط تقرؤهما التقنيات المساعدة، والأيقونة زخرفية. يجب ألا يرسل الزر النموذج.', 'ضع تسمية الحقل الفعلية خارج غلاف الحقل والزر. اسمح باللصق والتكامل مع مدير كلمات المرور.', 'يمكن إظهار قيمة حقل للقراءة فقط، بينما يمنع التعطيل المباشر أو تعطيل fieldset المحيط تبديل الرؤية.'],
    limitations: ['لا يفرض المكوّن قواعد قوة كلمة المرور، ولا يصادق على المستخدم، ولا يخزّن بيانات الدخول.'],
  }),
  'search-field': localized('search-field', {
    summary: 'عبارة بحث قابلة للتحرير مع إجراء مسح مدمج واقتراحات محلية اختيارية. يدير التطبيق تنفيذ البحث ونتائجه والتنقل؛ ولا ينشئ اختيار اقتراح طلبًا بعيدًا تلقائيًا.',
    usage: expandedSample('search-field', 'guide-search', 'ar'),
    lifecycle: ['اعرض حقلًا مسمّى وقدّم قاموس نصوص محليًا عند الحاجة. تقبل نسخة JavaScript الاقتراحات في الخيارات أو كمصفوفة JSON نصية داخل data-hw-suggestions.', 'تصفّي الكتابة القاموس المحلي، وتُعرض الاقتراحات كنصوص حرفية. يدعم التطبيع العربي التشكيل وصور الألف الشائعة دون تغيير عبارة البحث المخزّنة.', 'تحدد الأسهم اقتراحًا، ويعتمده Enter دون إرسال النموذج المحيط، ويغلق Escape القائمة. تبقى الضغطة الثانية متاحة للحوار المحيط.', 'يمكن أن يعيد Enter العادي عبارة غير فارغة إلى معالج البحث مع إبقاء إرسال النموذج الأصلي. اختر معالج البحث أو معالج submit لتنفيذ الإجراء، حتى لا يُرسل الطلب مرتين.', 'يعيد المسح التركيز إلى الحقل. تمنع حالتا القراءة فقط والتعطيل التحرير وتفعيل الاقتراحات. حرّر المتحكّم قبل إزالة عناصره، وألغِ طلبات التطبيق ومستمعاته بصورة مستقلة.'],
    api: ['يستخدم React value/defaultValue، وVue v-model/defaultValue، وAngular value/valueChange أو النماذج. تظل القيمة نصًا حرًا ولا يلزم اختيارها من القاموس.', 'يعيد نص العبارة المحررة أو المختارة عبر واجهة إطار العمل.', 'قاموس محلي اختياري. يبقى الحقل بحثًا عاديًا عند إغفاله، وتُعرض السلاسل كنصوص لا كـHTML.', 'يحدّ عدد الاقتراحات الظاهرة.', 'إعلان عدد الاقتراحات المتاحة؛ مطلوب عند تمرير اقتراحات (في Vanilla: data-hw-results-message="{count} …").', 'تسميات الإجراءات الميسّرة يقدّمها التطبيق: clearLabel مطلوب دائمًا، وsearchLabel مطلوب عند تفعيل showSearchButton. يستخدم زر المسح في HTML تسمية aria-label المكتوبة، وإلا data-hw-clear-label.', 'إجراء بحث داخلي اختياري في كل المحوّلات، وافتراضيه false. أضف showSearchButton مع searchLabel حيث يلزم الزر المضمّن، واتركه عند تركيب زر إرسال خارجي.', 'يعيد عبارة غير فارغة بعد إزالة المسافات الطرفية عند Enter العادي أو الإجراء الداخلي. يغيّر اختيار الاقتراح القيمة فقط.', 'يحافظ على التركيز في حالة القراءة فقط، وحماية التعطيل، وربط رسالة خطأ التطبيق.', 'تجمع Dialog وSearchField وإجراء الإرسال وأزرار العبارات المقترحة والبحث المتقدم دون محرّك نتائج أو توجيه مدمج.'],
    accessibility: ['أبقِ تسمية الحقل ظاهرة، ووفّر اسمًا لزر البحث أو المسح ذي الأيقونة فقط.', 'يستخدم نمط الاقتراحات روابط combobox/listbox وaria-activedescendant مع بقاء التركيز في الحقل. لا تُلزم المستخدم باختيار قيمة من القاموس.', 'احترم تركيب النص IME واختصارات التحرير الأصلية. لا يُستهلك Escape إلا أثناء ظهور قائمة اقتراحات غير فارغة.', 'تركّز أمثلة الحوار حقل البحث عند الفتح وتعيد التركيز إلى زر الفتح عند الإغلاق. تملأ العبارات المقترحة القيمة وتعرض طلب بحث محليًا، ويعرض البحث المتقدم حالته دون تنقل.', 'أعلن نتائج التطبيق بعد الإرسال؛ عدد الاقتراحات مستقل عن نتائج البحث الفعلية.'],
    variants: ['نص حر قابل للمسح', 'اقتراحات محلية', 'قراءة فقط أو تعطيل أو خطأ', 'حوار بعبارات مقترحة وإجراء بحث متقدم'],
    limitations: ['لا يتضمن المكوّن تنزيل قاموس بعيد أو نقطة بحث أو توجيهًا أو سياسة تأخير أو محرّك نتائج. قاموس المثال محتوى محلي مكتوب.', 'لا تثبت المطابقة والعرض الآمن صلاحية العبارة للخادم؛ يظل عقد خدمة البحث من مسؤولية التطبيق.'],
    frameworkNotes: 'يوفّر React وVue حالة الحقل ومعالجات بحث اختيارية. يدعم Angular valueChange وControlValueAccessor. لا يظهر زر البحث الداخلي في أي محوّل إلا مع showSearchButton. يستخدم الدليل معالج submit وحده، فيشترك Enter وزر الأيقونة الخارجي في إجراء واحد. لا تعزّز عناصر الأطر بمتحكّم JavaScript.',
  }),
  'number-field': localized('number-field', {
    summary: 'حقل رقمي أصلي للكميات مع قيود الحد الأدنى والأقصى والخطوة. تبقى القيمة الفارغة فارغة ولا تتحول إلى صفر.',
    usage: `<label class="hw-field"><span class="hw-label">عدد الحضور</span>
  <input class="hw-input hw-number-field" type="number" name="attendees" min="1" max="50" step="1" required>
</label>`,
    lifecycle: ['حدّد نطاقًا وخطوة يناسبان الكمية المطلوبة.', 'اختر عمدًا بين النص value والعدد valueAsNumber؛ تكون الأخيرة NaN عندما يكون الحقل فارغًا أو غير صالح.', 'افصل الحسابات عن حالة التحرير. يحتفظ الحقل بالتحقق الأصلي وإعادة الضبط.'],
    api: ['نطاق الأعداد المسموح وخطوة الزيادة أو النقصان.', 'خصائص حقل React الأصلية؛ NumberField يبني على TextField مع النوع number.', 'تسمية الحقل والتعليمات ورسالة الخطأ المرتبطة به.'],
    accessibility: ['استخدم text أو tel للمعرّفات الرقمية التي قد تبدأ بصفر.', 'وضّح الوحدة بجوار الحقل.', 'اسمح بالكتابة إلى جانب زري الزيادة والنقصان في المتصفح.'],
  }),
  slider: localized('slider', {
    summary: 'اختيار قيمة رقمية واحدة عبر شريط نطاق أصلي مسمّى. يناسب الضبط النسبي أكثر من الإدخال الرقمي الدقيق.',
    usage: `<label class="hw-field"><span class="hw-label">مستوى الصوت</span>
  <input class="hw-slider" type="range" name="volume" min="0" max="100" step="5" value="40">
</label>`,
    lifecycle: ['اعرض شريطًا ذا حدود رقمية منتهية وقيمة ابتدائية.', 'يتولى المتصفح التفاعل بالمؤشر ولوحة المفاتيح. يعيد onValueChange في React عددًا؛ ويمكن الاستماع إلى input في HTML.', 'تعيد إعادة الضبط القيمة الابتدائية وتبلغ عنها إذا تغيّرت. لا يحتاج الشريط البسيط إلى متحكم إضافي.'],
    api: ['حدود النطاق ومقدار التغيير.', 'القيمة الرقمية الحالية أو الابتدائية ومعالج التغييرات في React.', 'تضيف showValue المخرج الظاهر output.hw-slider-value. تقدّم formatValue نصه وaria-valuetext للحقل، ولا تُكتب aria-valuetext إلا معها.', 'القيمة الابتدائية؛ وبدونها يبدأ الشريط من منتصف المسافة بين min وmax.'],
    accessibility: ['وفّر تسمية ظاهرة ونصًا يوضح الوحدة.', 'استخدم aria-valuetext عندما يحتاج العدد إلى تفسير قابل للقراءة.', 'وفّر NumberField إذا كان اختيار قيمة دقيقة على الشريط صعبًا.'],
  }),
  'range-slider': localized('range-slider', {
    summary: 'اختيار حد أدنى وحد أعلى عبر حقلي نطاق أصليين. يتوقف كل مقبض عند الآخر حتى تبقى القيمتان مرتبتين.',
    usage: `<fieldset class="hw-range-slider" data-hw="range-slider" data-hw-range-label="{lower} – {upper}">
  <legend>نطاق الميزانية</legend>
  <label>الحد الأدنى<input class="hw-slider" type="range" data-hw-lower name="minimum" min="0" max="100" value="20"></label>
  <label>الحد الأعلى<input class="hw-slider" type="range" data-hw-upper name="maximum" min="0" max="100" value="80"></label>
  <output data-hw-range-output></output>
</fieldset>`,
    lifecycle: ['هيّئ حقلي النطاق بعد تركيبهما بحدود متوافقة؛ تُضبط القيم الابتدائية داخل النطاق وبترتيب صحيح.', 'تصدر حركة المقبض hw:change بالقيمة {value:[lower,upper]}، وتبقى القيمتان الأصليتان جزءًا من بيانات النموذج.', 'تعيد إعادة الضبط النطاق الابتدائي وتصدر hw:change إذا تغيّرت القيمة. يمنع وضع القراءة فقط التعديل دون افتراض أن range يدعم readonly أصلًا.', 'يستعيد destroy القيم والصفات ونص المخرج الأصلي.'],
    api: ['علامتان لحقلي النطاق المسمّيين.', 'حدود مشتركة منتهية ومعالج يستقبل زوج القيم.', 'النطاق المرتب الحالي؛ قراءة فقط من المتحكم.', 'النص الظاهر لمخرج النطاق؛ ولا يُعرض مخرج بدونه (في Vanilla: مطلوب عند وجود [data-hw-range-output]).', 'تكتب formatValue قيمة aria-valuetext لكل مقبض، ولا تحمل الحقول هذه السمة بدونها. وتنسّق locale الاختيارية في Vanilla أعداد نص النطاق عند غياب formatValue.', 'تسميتان مستقلتان مطلوبتان للمقبضين (في Vanilla: التسميتان المكتوبتان في البنية).', 'الزوج الابتدائي؛ وبدونه يبدأ المقبضان عند [min, max].'],
    accessibility: ['سمِّ كل حد على حدة؛ لا تكفي تسمية المجموعة وحدها.', 'حافظ على التعديل بالأسهم وميّز القيمتين بالنص.', 'لا تعتمد على اللون وحده لتحديد المقبض النشط.'],
    frameworkNotes: 'يقبل React زوجًا في value أو defaultValue ومعالج onValueChange. يرسل lowerName وupperName القيمتين باسمين، أو يرسل name مكررًا. تضبط min وmax وstep الحقلين الأصليين.',
  }),
  rating: localized('rating', {
    summary: 'اجمع درجة صحيحة عبر Rating أو اعرض متوسطًا مثل 3.5 باستخدام RatingDisplay غير التفاعلي. تمتلئ النجوم حتى الدرجة المختارة، ويعاين مرور المؤشر النطاق دون تغيير القيمة المرسلة.',
    usage: `${ratingDemoMarkup('ar','selected','rating-usage')}\n\n${ratingDisplayMarkup('ar',3.5)}`,
    lifecycle: ['اعرض مجموعة خيارات مسمّاة تشترك في name ثابت. يحمي متحكم Vanilla حالة القراءة فقط ويتيح إدارة الاختيار؛ وتملك محوّلات أطر العمل عناصرها.', 'يُرسل الاختيار عددًا صحيحًا عبر onValueChange في React أو v-model في Vue أو valueChange/CVA في Angular. تُحصر قيمة الإدخال وتُقرب لأسفل؛ والصفر يعني عدم الاختيار. يحتفظ العرض بالجزء الكسري.', 'تعيد إعادة ضبط النموذج الاختيار الابتدائي غير المتحكم فيه؛ ويعيد التطبيق حالته المتحكم فيها بنفسه. RatingDisplay للعرض فقط دون تركيز أو إدخال أو قيمة نموذج أو حدث اختيار.', 'يكون max في المحوّلات عددًا صحيحًا من 1 إلى 20؛ يُقرّب لأسفل ويُحصر، وتصبح القيمة القصوى غير المحدودة 5. تصبح قيمة التقييم غير المحدودة صفرًا. في Vanilla تُكتب خيارات radio الصحيحة مباشرة.'],
    api: ['حالة الاختيار الصحيحة؛ ويدعم Angular أيضًا ControlValueAccessor.', 'الافتراضي 5؛ حد صحيح من 1 إلى 20 مشترك بين الإدخال والعرض في المحوّلات.', 'مطلوبة في React وVue وAngular؛ تتلقى (value, max) وتعيد الاسم الميسّر الكامل لكل خيار.', 'التحقق والمشاركة في النموذج عبر خيارات radio؛ استخدم اسمًا واحدًا لكل مجموعة. يتيح React وVue الربط بنموذج خارجي؛ ويستخدم Angular النموذج الحاوي أو CVA.', 'تمنع القراءة فقط تغيير الاختيار مع الاحتفاظ بالتركيز وقيمة النموذج؛ ويستبعد التعطيل القيمة من الإرسال.', 'صورة تقييم مسمّاة غير تفاعلية. تُحصر القيمة بين 0 وmax وتمتلئ الكسور من بداية الاتجاه.', 'getValueLabel(value, max) مطلوبة وتعيد النص البديل الكامل لعرض التقييم، ما لم يُسمَّ الجذر بـaria-label أو aria-labelledby؛ ويظهر الرقم افتراضيًا ويمكن إخفاؤه عبر showValue.'],
    accessibility: ['استخدم legend لسؤال الإدخال وتسمية مفهومة لكل درجة.', 'تُخفى النجوم الزخرفية عن قارئات الشاشة. يعرض RatingDisplay اسم صورة واحدًا يتضمن الدرجة، وليس مجموعة radio.', 'حافظ على سلوك الأسهم والمسافة الأصلي والتركيز المرئي وتقليل الحركة وحدود وضع الألوان القسرية. تبقى القراءة فقط قابلة للتركيز؛ وتُستبعد الخيارات المعطلة من الإرسال.'],
  }),
  'pin-input': localized('pin-input', {
    summary: 'إدخال رمز تحقق رقمي بطول محدد في حقل واحد قابل للوصول، مع دعم لصق الأرقام العربية والهندية الشرقية وتحويلها إلى أرقام ASCII.',
    usage: `<div class="hw-pin-input" data-hw="pin-input">
  <label class="hw-field"><span class="hw-label">رمز التحقق</span>
    <input class="hw-input" data-hw-pin-input name="code" maxlength="6" autocomplete="one-time-code" inputmode="numeric" required>
  </label>
</div>`,
    lifecycle: ['هيّئ الحقل الواحد؛ يُؤخذ الطول من maxlength المكتوبة أو يُستخدم ستة افتراضيًا. يضيف المتحكم صفات الرمز الرقمي ويستبدل maxlength بالنمط pattern="[0-9]{length}"، فيُطبَّع الرمز الملصق مع فواصله قبل تطبيق الطول.', 'تُوحّد الأرقام وتُحذف المحارف غير الرقمية عند الإدخال واللصق دون توزيع الرمز على نقاط تركيز متعددة. ينتظر التطبيع اكتمال تركيب المحارف.', 'تعيد إعادة الضبط الرمز الابتدائي وتصدر hw:change إذا تغيّر، ويستعيد destroy الصفات والقيمة ومحتوى الخانات الزخرفية الأصلي.'],
    api: ['عدد صحيح موجب لطول الرمز؛ الافتراضي ستة.', 'يعيد الرمز كنص موحّد الأرقام؛ تبقى الأصفار في بدايته ذات معنى.', 'خانات مرئية زخرفية اختيارية في React مع بقاء حقل إدخال حقيقي واحد.', 'خانات زخرفية اختيارية في HTML تُحدّث وتُخفى عن قارئات الشاشة.'],
    accessibility: ['استخدم حقلًا واحدًا مسمّى مع autocomplete=one-time-code.', 'لا تستخدم type=number؛ الرمز نص وقد يبدأ بصفر.', 'وضّح انتهاء صلاحية الرمز وأخطاء التحقق دون مسح ما أدخله المستخدم بصمت.'],
    limitations: ['لا يرسل المكوّن الرموز، ولا يتحقق منها، ولا يوفّر المصادقة أو تقييد المحاولات.'],
  }),
  'tag-input': localized('tag-input', {
    summary: 'إنشاء مجموعة وسوم نصية مميزة مع إضافة وحذف صريحين، وإرسال كل وسم كقيمة أصلية مكررة في النموذج.',
    usage: `<div class="hw-field">
  <label class="hw-label" for="topics-input">أضف موضوعًا</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-name="topics" data-hw-value='["التصميم"]' data-hw-remove-label="إزالة {tag}">
    <ul data-hw-tags></ul>
    <input id="topics-input" class="hw-input" data-hw-tag-input>
  </div>
</div>`,
    lifecycle: ['هيّئ العناصر المركبة؛ تُهذّب الوسوم الابتدائية وتُزال المكررات، ثم تُعرض كشرائح قابلة للحذف.', 'يثبت Enter أو الفاصلة وسمًا فريدًا غير فارغ. يحذف Backspace آخر وسم عندما يكون الحقل فارغًا؛ ويمكن للصق إضافة وسوم مفصولة بفواصل أو أسطر.', 'ينشئ كل وسم مثبت حقلًا مخفيًا مسمّى. النص الجاري تحريره لا يُرسل كوسم، ويُفحص required على الوسوم المثبتة.', 'يعيد destroy محتوى الحاوية وصفات الحقل وقيمته وصلاحية الإدخال الأصلية. تعيد إعادة ضبط النموذج مجموعة الوسوم الابتدائية وتفرغ النص الجاري تحريره وتصدر hw:change إذا تغيّرت الوسوم. بعد محاولة إرسال فاشلة يحمل الحقل aria-invalid="true" حتى تصبح القيمة صالحة أو يُعاد ضبط النموذج.'],
    api: ['مصفوفة الوسوم الابتدائية؛ JSON في الصفة أو مصفوفة في خيارات المتحكم.', 'اسم حقل النموذج المكرر للقيم المثبتة.', 'إضافة الوسوم وحذفها وإنهاء دورة حياة المتحكم.', 'getRemoveLabel(tag) تسمّي كل زر حذف وهي مطلوبة (data-hw-remove-label="… {tag}")؛ وrequiredMessage مطلوبة عند ضبط required (data-hw-required-message).'],
    accessibility: ['اشرح مفاتيح تثبيت الوسم بجوار الحقل. لا يثبت Enter الفارغ وسمًا، ولا تعترض اختصارات Control/Alt/Meta أو تركيب النص.', 'يحتاج كل زر حذف إلى تسمية تتضمن الوسم المقصود. بعد الحذف ينتقل التركيز إلى زر الحذف التالي، وإلا السابق، وإلا حقل النص.', 'طبّق التعطيل والقراءة فقط على الكتابة والحذف معًا.'],
    frameworkNotes: 'يستخدم React مصفوفات نصية في value أو defaultValue مع onValueChange. عند التحكم الخارجي، طبّق التغييرات الواردة في المعالج. تعيد النماذج غير المتحكم بها القيم الافتراضية عند إعادة الضبط.',
  }),
  'multi-select': localized('multi-select', {
    summary: 'تصفية قائمة مربعات اختيار أصلية مع الحفاظ على جميع الخيارات المحددة، بما فيها المخفية مؤقتًا بنتيجة البحث.',
    usage: `<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-required="true"
  data-hw-required-message="اختر خيارًا واحدًا على الأقل." data-hw-results-message="{count} خيارات">
  <legend>الخدمات التي تهمك (اختر خدمة واحدة على الأقل)</legend>
  <label>تصفية الخيارات<input class="hw-input" type="search" data-hw-multiselect-search></label>
  <div data-hw-option><label><input class="hw-checkbox" type="checkbox" name="interest" value="business"> الأعمال</label></div>
  <div data-hw-option><label><input class="hw-checkbox" type="checkbox" name="interest" value="education"> التعليم</label></div>
</fieldset>`,
    lifecycle: ['هيّئ القائمة القابلة للبحث؛ تحدد حالات checked القيم المختارة أولًا.', 'يخفي البحث التسميات غير المطابقة بعد تطبيع النص، لكنه لا يلغي اختيار عنصر مخفي.', 'تصدر تغييرات المربعات {value:string[]} وتُرسل القيم المكررة في النموذج. تعيد إعادة الضبط الاختيارات الأصلية وتفرغ نص التصفية وتصدر hw:change إذا تغيّر الاختيار.', 'يُعلن عدد الخيارات المطابقة في منطقة حالة تُنشأ إذا لم يُكتب [data-hw-status]، ولا يُعلن إلا بعد أن يصفّي القارئ القائمة.', 'يعيد destroy حالة التصفية ونص الحالة ويزيل المستمعات. أنهِ المتحكم وأعد تركيبه قبل استبدال عناصر الخيارات في HTML.'],
    api: ['غلاف يحتوي مربع اختيار أصليًا واحدًا مع تسميته.', 'معالج الاختيار وإعلان عدد الخيارات المطابقة، وهو مطلوب في كل المحوّلات (في Vanilla: data-hw-results-message="{count} …").', 'نص اختياري بعدد الخيارات المختارة (في Vanilla: عنصر [data-hw-selected-status] مكتوب، مع قالب في data-hw-selected-message يستخدم {count}).', 'التسمية الظاهرة لحقل التصفية في React وVue وAngular؛ ويكتب تطبيق Vanilla التسمية في البنية.', 'قيم الخيارات المحددة والمتاحة؛ لا تُرسل الخيارات المعطّلة.', 'اختيار قيمة متاحة واحدة على الأقل؛ requiredMessage مطلوبة عند ضبط required، وبالاسم نفسه في كل المحوّلات.', 'استخدم data-hw-required="true" مع data-hw-required-message أو خيارات createMultiSelect(root, { required: true, requiredMessage }). تتقدم الخيارات الصريحة على الصفات.'],
    accessibility: ['استخدم legend للمجموعة وتسمية مستقلة لحقل البحث.', 'يتحقق الاختيار الإلزامي عبر custom validity وaria-required على حقل البحث القابل للتركيز؛ لا تجعل نص البحث أو كل مربع اختيار إلزاميًا.', 'تمنع القراءة فقط تغيير الاختيار مع إبقاء البحث متاحًا: تبقى المربعات مفعّلة مع aria-disabled="true" وتحتفظ بقيمها؛ لا تُرسل المجموعة المعطّلة قيمًا ولا تمنع إرسال النموذج.', 'وضّح حالات عدم وجود نتائج والتحقق؛ تظل الاختيارات المخفية جزءًا من النموذج.'],
    limitations: ['قائمة محلية بمربعات اختيار، دون تحميل خيارات عن بُعد أو عرض افتراضي للقوائم الضخمة.'],
  }),
  calendar: localized('calendar', {
    summary: 'شبكة شهر قابلة للتنقل بلوحة المفاتيح، تعرض الميلادي أو أم القرى مع حفظ اليوم المختار بصيغة ISO الميلادية YYYY-MM-DD.',
    usage: `<div class="hw-calendar" data-hw="calendar" data-hw-value="2026-10-28"
  data-hw-month="2026-10-01" data-hw-min="2026-01-01" data-hw-max="2027-12-31"
  data-hw-calendar="islamic-umalqura" data-hw-locale="ar-SA" data-hw-name="appointment"
  aria-label="اختر تاريخ الموعد" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي"
  data-hw-range-label="التواريخ الهجرية المدعومة"
  data-hw-unsupported-message="يدعم تقويم أم القرى التواريخ من 1924-08-01 إلى 2077-11-16. تبقى القيمة الميلادية بصيغة ISO دون تغيير."></div>`,
    lifecycle: ['هيّئ العنصر المركب؛ ينشئ المتحكم شريط التنقل وأسماء الأيام وشبكة التواريخ. لا يعرض Calendar المستقل مبدّل الميلادي والهجري: استدعِ setCalendar(system) من عنصر التحكم الخاص بك، أو استخدم DatePicker الذي يملك المبدّل.', 'يغيّر التنقل الشهر المعروض، ويحدّث اختيار يوم متاح قيمة ISO. يحافظ تغيير تقويم العرض على اليوم الميلادي نفسه. عند غياب القيمة تكون محطة التركيز يوم اليوم إذا كان ظاهرًا ومتاحًا.', 'يدعم المرجع الهجري الفترة الميلادية من 1924-08-01 إلى 2077-11-16. يلتزم التنقل بهذه الحدود ولا يستبدل المرجع بخوارزمية حسابية عامة بصمت.', 'يزيل destroy العناصر المولدة ويُبقي المحتوى الأصلي. حدّد شهرًا أو قيمة ابتدائية ثابتة إذا أردت عرضًا متطابقًا عند التصيير على الخادم.'],
    api: ['الاختيار ومرساة الشهر المرئي وحدود التطبيق كلها تواريخ ISO ميلادية.', 'نظام العرض مستقل عن اللغة واتجاه الكتابة.', 'لغة BCP 47 مطلوبة لنصوص الأشهر والأيام والتواريخ التي يولدها Intl، وبداية الأسبوع، وقاعدة التطبيق للتواريخ غير المتاحة.', 'مطلوبتان ما دام التقويم islamic-umalqura: اسم معلومات النطاق المدعوم، والحالة التي تُعلن عندما لا يمكن عرض القيمة بتقويم أم القرى.', 'تُبلغ select عن التغيير، وتزامن setValue القيمة بصمت، وتتحكم بقية الدوال في العرض والتنظيف.'],
    accessibility: ['تتنقل الأسهم بالأيام والأسابيع، ويتبع الاتجاه الأفقي RTL أو LTR. ينتقل Home وEnd داخل الأسبوع.', 'ينتقل PageUp وPageDown بين الأشهر المعروضة، ويضيف Shift التنقل بالسنوات. لا يمكن اختيار يوم معطّل.', 'وفّر تسميات واضحة للأيام وشرحًا ظاهرًا للنطاق غير المتاح.'],
    limitations: ['المرجع المنشور المثبت بيانات تقويم مدني ذات نطاق محدد؛ ليس مزامنة حية مع خدمة رسمية أو إعلانًا لرؤية الهلال.', 'لا يوفر الحقل المخفي الاختياري في Calendar تحقق required الأصلي للتاريخ؛ استخدم DatePicker لهذا الغرض.'],
    frameworkNotes: 'يتيح React التحكم عبر value/defaultValue/onValueChange والشهر عبر month/defaultMonth/onMonthChange ومعالجات نظام التقويم. تحافظ بقية المحوّلات على عقد قيمة ISO نفسه. locale مطلوبة في كل المحوّلات ولا تنسّق إلا التواريخ؛ وكل تسمية مدخل مطلوب يقدّمه التطبيق بالاسم نفسه في كل محوّل. يمكن تخصيص تسمية كل زر عند الحاجة.',
  }),
  'date-picker': localized('date-picker', {
    summary: 'حقل نصي قابل لتحرير ISO مع تقويم هوية الميلادي أو الهجري بأم القرى؛ لا تظهر نافذة التاريخ الأصلية للمتصفح. تبقى القيمة المرسلة ميلادية بصيغة ISO مهما كان تقويم العرض.',
    usage: expandedSample('date-picker', 'guide-date-picker', 'ar'),
    lifecycle: ['هيّئ المكوّن بعد تركيب الحقل والزر والحوار وحاوية التقويم الداخلية. لا تهيّئ الحاوية الداخلية كمكوّن Calendar مستقل.', 'يفتح التقويم على شهر التاريخ المختار. يحدّث تأكيد اليوم الحقل الأصلي مرة واحدة، ويغلق الحوار، ويعيد التركيز إلى زر الفتح.', 'يبقي تبديل الميلادي والهجري، عبر المبدّل الذي يعرضه المنتقي قبل التقويم داخل حواره، الحوار مفتوحًا ويحافظ على قيمة ISO. يصف مخرج حي تحت الحقل التاريخ بنظام العرض المختار حتى بعد الإغلاق.', 'تُحفظ القيم الواقعة خارج النطاق الهجري وتُعلَّم بأنها غير صالحة مع شرح النطاق. يزيل الرجوع للميلادي خطأ النطاق الهجري دون إلغاء min وmax.', 'تزامن تواريخ ISO وإعادة الضبط التقويم والمخرج؛ تبقى المسودات الخاطئة ظاهرة وغير صالحة دون تغيير القيمة المعتمدة. تظهر رسالة التحقق في عنصر [data-hw-error] مكتوب، وإلا في عنصر p.hw-error بالدور alert يُنشأ بعد التلميح؛ ويعرض المخرج المنسّق التاريخ كاملًا مع اسم اليوم. يحرر destroy التقويم والحوار والمخرج المولد.'],
    api: ['نظام العرض الابتدائي، واللغة المطلوبة التي تنسّق التواريخ.', 'يمتلك الحقل النصي المرئي التحقق، ويحمل حقل مخفي الاسم وقيمة ISO المعتمدة فقط. يعرض الحقل التاريخ بالتقويم النشط، ويكشف مسودة ISO عند التركيز للتحرير.', 'التحكم في فتح الحوار وإغلاقه ونظام العرض، مع تنظيف صريح.', 'أسماء مطلوبة لمبدّل نظام التقويم الذي يعرضه المنتقي ولمعلومات النطاق المدعوم.', 'موضع رسالة التحقق؛ وبدونه يُنشأ العنصر p.hw-error[role=alert].', 'تختلف أحداث تغيير قيمة ISO عن تغيير تقويم العرض. يتولى Calendar الداخلي تأكيد اليوم.'],
    accessibility: ['اكتب YYYY-MM-DD ميلاديًا أو افتح تقويم هوية بالزر أو ArrowDown. يحرّر النقر النص ويبقى Enter لإرسال النموذج.', 'يحتاج الحوار إلى عنوان وزر إغلاق، ويوفر Calendar تفاعل شبكة الأيام بلوحة المفاتيح. تعرض أيقونة المعلومات الرمادية بجوار الشهر الهجري النطاق عند المرور أو التركيز، ويغلق Escape التلميح وحده.', 'قدّم unsupportedMessage، ومع isDateDisabled قدّم unavailableMessage، ولا تمسح تاريخًا قائمًا خارج النطاق بصمت.'],
    limitations: ['نطاق أم القرى: 1924-08-01–2077-11-16. تتبع المعاملات الرسمية سياسة الجهة المسؤولة عن التاريخ.'],
    frameworkNotes: 'يقبل DatePicker في React قيمة value/defaultValue/onValueChange ونظام calendar/defaultCalendar/onCalendarChange، مع تسميات المحدد والزر والحوار المطلوبة. invalidMessage مطلوبة وهي نص التحقق كاملًا. تدخل isDateDisabled أيضًا ضمن صلاحية الحقل الأصلي في React.',
  }),
  'file-dropzone': localized('file-dropzone', {
    summary: 'إضافة سحب الملفات وإفلاتها إلى حقل ملفات حقيقي، مع فحص الأنواع المقبولة والإبقاء على اختيار الملف متاحًا للجميع.',
    usage: `<div class="hw-field hw-file-dropzone" data-hw="file-dropzone" data-hw-max-size="5242880"
  data-hw-selected-message="عدد الملفات المختارة {count}" data-hw-rejected-message="اختر ملفات توافق النوع والحجم المسموح."
  data-hw-unsupported-drop-message="استخدم اختيار الملفات لإرفاق المستندات.">
  <label class="hw-label" for="documents">اختر المستندات أو أفلتها هنا</label><span>PDF أو PNG، حتى 5 ميبيبايت للملف</span>
  <input id="documents" type="file" data-hw-file-input name="documents" accept=".pdf,.png" multiple>
  <span data-hw-file-status role="status"></span>
</div>`,
    lifecycle: ['هيّئ غلاف حقل الملفات؛ يبقى الحقل الأصلي قابلًا للاستخدام دون السحب والإفلات.', 'لا تُقبل فوق المنطقة إلا عمليات سحب الملفات، وتحمل المنطقة data-state="dragging" أثناءها. ينقل الإفلات الصحيح ملفات المستخدم إلى FileList الحقيقي ويصدر change. يمنع التعطيل أو وضع القراءة فقط تغيير الاختيار.', 'إذا خالف أي ملف في الدفعة الأنواع المقبولة أو حد الحجم أو، في منطقة الملف الواحد، العدد المسموح، يُمسح الاختيار كله، ويتلقى onReject الملفات المرفوضة، وتظهر رسالة الرفض في [data-hw-error] وإلا في عنصر p.hw-error بالدور alert يُنشأ لذلك. تمسح إعادة الضبط رسالة الحالة وتبلغ عن الاختيار الفارغ إذا كانت هناك ملفات مختارة.', 'يزيل destroy مستمعي السحب والتغيير ويستعيد صفات الغلاف والحالة. ينظّف التطبيق طلبات الرفع وروابط object URL الخاصة به.'],
    api: ['أنواع الملفات وعددها وإتاحة الحقل وفق الصفات الأصلية.', 'حد اختياري بالبايت لكل ملف في المتحكم المباشر.', 'يعيد File[]. تكون getRejectedMessage(rejected) مطلوبة عند ضبط accept أو حد أقصى للحجم، وgetSelectedMessage(files) مطلوبة مع [data-hw-file-status]، وunsupportedDropMessage اختيارية. توفّر سمات القوالب {count}.', 'يتلقى onReject الملفات المرفوضة وحدها. العنصر [data-hw-error] المكتوب الذي يحمل نصًا هو خطأ التطبيق ويتقدم على رسالة الرفض، أما الفارغ فيتلقى نص الرفض.', 'يعيد الملفات في React، وتحد maxSize حجم كل ملف بالبايت. getRejectedMessage(rejected) مطلوبة عند ضبط accept أو maxSize كما في Vue وAngular. مرّر FileUploadList عنصرًا ابنًا لعرض قائمة الملفات المختارة.'],
    accessibility: ['أبقِ زر اختيار الملفات متاحًا للوحة المفاتيح واللمس.', 'وضّح قواعد النوع والحجم قبل الاختيار.', 'تُبقي منطقة القراءة فقط الحقل قابلًا للتركيز ومُرسلًا مع aria-disabled="true"؛ استخدم disabled لاستبعاد الملفات.', 'لا تعرض اختيار ملف محلي على أنه اكتمال رفع إلى الخادم.'],
    limitations: ['لا يتضمن المكوّن نقل الملفات أو تخزينها أو فحص محتواها أو التحقق على الخادم. عند غياب DataTransfer يبقى الاختيار الأصلي متاحًا.'],
  }),
  'toggle-group': localized('toggle-group', {
    summary: 'اختيار وضع واحد حصري أو عدة خيارات مستقلة. يستخدم الوضع المفرد أزرار radio، والمتعدد أزرارًا ذات حالة ضغط.',
    usage: `<fieldset class="hw-toggle-group" data-hw="toggle-group" data-variant="segmented">
  <legend>طريقة العرض</legend>
  <label><input type="radio" name="view" value="list" checked> قائمة</label>
  <label><input type="radio" name="view" value="grid"> شبكة</label>
</fieldset>`,
    lifecycle: ['اختر نموذج التحديد المفرد أو المتعدد وهيّئ المجموعة بعد تركيبها.', 'يعيد الوضع المفرد قيمة نصية من radio. يبدّل المتعدد aria-pressed ويعيد مصفوفة قيم نصية.', 'يحدد التطبيق أثر كل اختيار. تعيد إعادة الضبط الاختيار الابتدائي وتصدر hw:change إذا تغيّر.', 'أنه المتحكم قبل استبدال عناصر المجموعة ونظّف الآثار الجانبية التي يملكها التطبيق.'],
    api: ['فعّل الوضع المتعدد؛ استخدم خيارات radio الأصلية في الوضع الآخر.', 'معرّف ثابت على زر الوضع المتعدد.', 'طريقة العرض في جميع المحولات؛ يستخدم HTML الخاصية data-variant.', 'يتبع شكل القيمة الوضع المفرد أو المتعدد في React.', 'يبقى الاختيار للقراءة فقط قابلًا للتركيز ويرسل قيم الخيارات المتاحة.', 'لا ترسل المجموعة المعطلة أو خياراتها المعطلة قيمًا.'],
    accessibility: ['وفّر legend، أو سمِّ المجموعة عبر aria-label أو aria-labelledby، وعندها يصبح المدخل label اختياريًا.', 'تحتاج الأزرار المضغوطة تسمية ثابتة وaria-pressed، بينما يحتفظ radio بسلوك الأسهم الأصلي.', 'استخدم Tabs إذا كانت الخيارات تتحكم في لوحات تبويب مرتبطة.'],
    variants: ['مقاطع متجاورة: segmented', 'حدود خارجية: outline', 'اختيار مفرد أو متعدد'],
  }),
  popover: localized('popover', {
    summary: 'إظهار معلومات أو أدوات سياقية قرب الإجراء دون حجب بقية الصفحة. يبقى التنقل بين العناصر وفق ترتيب التركيز العادي.',
    usage: `<div class="hw-popover" data-hw="popover">
  <button class="hw-button" type="button" data-hw-trigger>معلومات الخدمة</button>
  <div class="hw-popover-panel" data-hw-panel role="region" aria-label="معلومات الخدمة" hidden>
    <p>راجع قائمة المستندات المطلوبة قبل التقديم.</p>
    <button type="button" data-hw-close>إغلاق</button>
  </div>
</div>`,
    lifecycle: ['هيّئ زر الفتح واللوحة المسمّاة؛ تُزامن aria-controls وaria-expanded تلقائيًا.', 'يبدّل الزر ظهور اللوحة، ويستخدم Tab ترتيب التركيز العادي. ينقل الخيار focusOnOpen التركيز إلى الداخل عند تفعيله.', 'يعيد Escape أو زر الإغلاق التركيز إلى زر الفتح. يغلق الضغط الخارجي أو خروج التركيز اللوحة دون احتجاز التركيز.', 'يعيد destroy الصفات ويزيل مستمعي المستند، ويستعيد التركيز إذا أزيلت لوحة مفتوحة كان التركيز داخلها.'],
    api: ['علامات زر الفتح واللوحة وزر الإغلاق الاختياري.', 'إشعار تغير الحالة وخيار نقل التركيز أول الفتح.', 'دوال إظهار اللوحة وإغلاقها وإنهاء المتحكم.', 'حالة ظهور متحكم بها أو ابتدائية ومعالجها في React.', 'الاسم الميسّر للوحة في كل المحوّلات (كانت title في React)؛ لا يُضمَّن عنوان، فضع عنوانًا ظاهرًا في المحتوى واربطه عبر aria-labelledby.', 'مظهر زر الفتح المضمّن في Angular؛ مرّر primary للمظهر السابق.'],
    accessibility: ['سمِّ اللوحة عندما تكون منطقة region.', 'ضع المحتوى التفاعلي هنا أو في Dialog، وليس داخل Tooltip.', 'استخدم Dialog للمهام المشروطة كي يكون تعطيل الخلفية واحتواء التركيز واضحين.'],
    limitations: ['هذا نمط إظهار سياقي؛ لا يتضمن محرك تموضع عائم يتجنب حدود الشاشة تلقائيًا.'],
  }),
  menu: localized('menu', {
    summary: 'قائمة إجراءات مختصرة بتنقل لوحة مفاتيح يتجاوز العناصر المعطّلة ويدعم البحث بالكتابة. تختلف عن روابط تنقل الموقع العادية.',
    usage: `<div class="hw-menu" data-hw="menu">
  <button class="hw-button" type="button" data-hw-trigger>إجراءات الطلب</button>
  <div class="hw-menu-content" data-hw-panel role="menu" aria-label="إجراءات الطلب" hidden>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="edit">تعديل</button>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="archive">أرشفة</button>
  </div>
</div>`,
    lifecycle: ['هيّئ الزر واللوحة وقائمة عناصر menuitem المركبة والثابتة.', 'يركز الفتح على عنصر متاح. تتنقل الأسهم الرأسية وHome وEnd، وتبحث الكتابة عن التسميات المطابقة.', 'ينفذ Enter أو المسافة أو النقر الإجراء، ويصدر قيمته، ويغلق القائمة، ويعيد التركيز. يتولى التطبيق العملية الفعلية.', 'يغلق Escape ويعيد التركيز؛ يغلق Tab ويواصل التنقل. يزيل destroy المستمعات ومؤقت البحث بالكتابة.'],
    api: ['معرّف الإجراء الذي يتلقاه التطبيق.', 'معالج الإجراء onAction في المتحكم المباشر؛ يصعد hw:change بالقيمة أيضًا.', 'التحكم في ظهور القائمة ودورة حياتها.', 'عناصر بالشكل {value,label,disabled?,href?}؛ قد يضيف عنصر React المعالج onSelect. يصدر Vue الحدث action ويصدر Angular المخرج (action) بالقيمة.', 'تسمّي label القائمة، وtriggerLabel نص زر الفتح الذي يعرضه محوّلا Vue وAngular.', 'مظهر زر الفتح المضمّن في Angular؛ مرّر primary للمظهر السابق.'],
    accessibility: ['استخدم button للإجراءات وa للتنقل الحقيقي.', 'سمِّ القائمة وزرها، ولا تسمح بتنفيذ العناصر المعطلة.', 'استخدم روابط nav العادية لتنقل الموقع دون فرض أدوار menu بلا حاجة.'],
    limitations: ['لا توجد قوائم فرعية متداخلة أو سحب وإفلات أو تنفيذ إجراءات عن بُعد.'],
  }),
  drawer: localized('drawer', {
    summary: 'لوحة حوار مشروطة من الجانب أو الأسفل تستخدم دورة Dialog الأصلية، وتناسب المرشحات أو المهام المساندة المركّزة.',
    usage: `<button class="hw-button" type="button" data-hw-dialog-open="filters">فتح المرشحات</button>
<dialog id="filters" class="hw-dialog hw-drawer" data-hw="drawer" data-side="end" aria-labelledby="filters-title">
  <h2 id="filters-title">مرشحات الطلبات</h2>
  <label>الحالة<select class="hw-select" name="status"><option value="all">الكل</option><option value="review">قيد المراجعة</option></select></label>
  <button type="button" class="hw-button" data-hw-dialog-close autofocus>تم</button>
</dialog>`,
    lifecycle: ['هيّئ dialog بعد تركيبه، واربط زر فتح خارجيًا بمعرّفه.', 'يوفر showModal الطبقة العليا وتعطيل الخلفية واحتواء التركيز. يتبع الجانب المنطقي اتجاه الصفحة.', 'يعيد الإغلاق أو Escape التركيز إلى زر الفتح المتصل. يحدد التطبيق سياسة تطبيق المرشحات أو تجاهلها.', 'يستخدم destroy تنظيف Dialog دون إضافة مصيدة تركيز أو مدير حوارات آخر.'],
    api: ['موضع منطقي مستقل عن اللغة.', 'دورة حياة الحوار الأصلي نفسها في المتحكم المباشر.', 'يرث Drawer خصائص Dialog في React ويضيف جانب الظهور.'],
    accessibility: ['وفّر عنوانًا واضحًا وزر إغلاق.', 'اختر موضع التركيز الأول داخل المهمة، لا على عنصر dialog نفسه.', 'لا تستخدم حوارًا مشروطًا للتنقل الجانبي الدائم.'],
    variants: ['بداية السطر: start', 'نهاية السطر: end', 'أسفل الصفحة: bottom'],
  }),
  'toast-region': localized('toast-region', {
    summary: 'تعرض منطقة الإشعارات خمس حالات مع أولوية إعلان مستقلة. يحدد التطبيق الرسائل التي تبقى ظاهرة ووقت إغلاقها.',
    usage: `<section class="hw-toast-region" data-hw="toast-region" data-variant="banner" data-position="inline" aria-label="إشعارات الخدمة">
  <div data-hw-live="polite" role="status">
    <article class="hw-toast" data-hw-toast="saved" data-tone="success">
      <span class="hw-toast-icon" aria-hidden="true"></span>
      <div class="hw-toast-content"><strong>تم حفظ المسودة</strong><p>يمكنك العودة إلى طلبك لاحقًا.</p></div>
      <button type="button" class="hw-button hw-toast-dismiss" data-variant="ghost" data-hw-dismiss aria-label="إغلاق إشعار حفظ المسودة"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </article>
  </div>
  <div data-hw-live="assertive" role="alert"></div>
</section>`,
    lifecycle: ['أنشئ منطقتي الإعلان العادي والعاجل قبل إضافة الرسائل استجابةً لأحداث التطبيق.', 'يخفي المتحكم المباشر الإشعار ويصدر معرّفه الثابت. في أطر العمل يحذف التطبيق المعرّف من مجموعة الرسائل.', 'عند حذف إشعار يحتوي على التركيز، ينتقل التركيز إلى زر الإغلاق التالي المتاح ثم السابق ثم المنطقة. تحافظ التحديثات الأخرى على موضع التركيز.', 'تحرر destroy المتحكم وتستعيد الصفات الأصلية. يبقى الإشعار ظاهرًا إلى أن يغلقه المستخدم أو يزيله التطبيق.'],
    api: ['اختر banner لعرض شريط الإشعار. يتوفر أيضًا النمطان default وinline.', 'اختر inline للعرض داخل المحتوى أو أحد المواضع الثابتة top-start وtop-end وbottom-start وbottom-end.', 'حدّد معرّف الإشعار وزر إغلاقه. تحمي data-hw-dismissible="false" الإشعار من الإغلاق.', 'استخدم حاويتين مستقلتين للرسائل العادية polite والعاجلة assertive.', 'حدّد أولوية الإعلان بشكل مستقل عن الحالة اللونية. استخدم dismissible=false للإشعار الدائم.', 'حدّث مجموعة الرسائل عند استدعاء onDismiss في React أو حدث dismiss في Vue أو مخرج dismissed في Angular.', 'أغلق إشعارًا قابلًا للإغلاق أو حرّر المتحكم.'],
    accessibility: ['قدّم اسم المنطقة واسمًا لكل زر إغلاق يعرّف الإشعار: aria-label المكتوب على الزر، أو getDismissLabel(toast) (في Vanilla: data-hw-dismiss-label="… {title}").', 'اختر إعلانًا عاديًا للنتائج المعتادة وعاجلًا للمقاطعات الضرورية.', 'أبقِ التعليمات المهمة وأخطاء التحقق متاحة في موضع استخدامها.'],
    variants: ['محايد', 'معلومات', 'نجاح', 'تحذير', 'خطر', 'شريط داخل المحتوى أو في موضع ثابت', 'إعلان عادي أو عاجل', 'قابل للإغلاق أو محمي'],
  }),
  collapsible: localized('collapsible', {
    summary: 'قسم قابل للطي مبني على details الأصلي للمحتوى المساند الاختياري، مع دعم لوحة المفاتيح دون تهيئة JavaScript.',
    usage: `<details class="hw-collapsible">
  <summary>قبل أن تبدأ</summary>
  <p>جهّز بيانات المنشأة والمستندات الداعمة.</p>
</details>`,
    lifecycle: ['اعرض details مع summary يصف محتواه، وحدد open اختياريًا.', 'يغيّر تفعيل summary الحالة ويصدر toggle. يمكن في React التحكم في open أو تعيين defaultOpen.', 'لا يُركب متحكم مباشر. تزول الحالة مع الواجهة ما لم يحفظها التطبيق.'],
    api: ['حالة التوسيع الأصلية.', 'النص الذي يعرضه summary في React (كان title).', 'الحالة المتحكم بها أو الابتدائية وطلبات تغييرها في React.', 'يمنع التفعيل داخل محوّل React؛ لا توجد صفة disabled أصلية على details.'],
    accessibility: ['اجعل عنوان summary موجزًا وواضحًا.', 'لا تضع أدوات تفاعلية غير مرتبطة داخل summary.', 'أبقِ التعليمات الضرورية ظاهرة بدل اشتراط اكتشاف قسم مطوي.'],
  }),
  'tree-view': localized('tree-view', {
    summary: 'التنقل في مجموعة هرمية بتحديد واحد وحالة توسع، مع نقطة تركيز متحركة واحدة بين العقد المرئية.',
    usage: `<ul class="hw-tree-view" data-hw="tree-view" role="tree" aria-label="المستندات" data-hw-expand-label="توسيع {label}" data-hw-collapse-label="طي {label}">
  <li role="treeitem" data-hw-value="business" aria-expanded="true">
    <button class="hw-tree-toggle" type="button" data-hw-tree-toggle tabindex="-1"><span class="hw-icon" data-icon="arrow-down-01" data-size="sm" aria-hidden="true"></span></button>
    <span data-hw-tree-label>المنشأة</span>
    <ul role="group"><li role="treeitem" data-hw-value="license"><span data-hw-tree-label>الرخصة</span></li></ul>
  </li>
</ul>`,
    lifecycle: ['هيّئ الهيكل الثابت بمعرّفات فريدة وعقد أم قابلة للتوسيع محددة صراحةً.', 'تتنقل الأسهم الرأسية بين العقد المرئية، وتوسّع الأسهم الأفقية أو تطوي وتنتقل للأب أو الابن بحسب RTL أو LTR.', 'يختار Enter أو المسافة عقدة متاحة ويبلغ بقيمتها؛ لا يؤدي الاختيار وحده إلى تنقل أو جلب مستند.', 'أنه المتحكم قبل استبدال الهيكل لاستعادة صفات التركيز وARIA وإزالة المستمعات.'],
    api: ['هوية ثابتة للعقدة المستخدمة في التحديد.', 'حالة الأب ومجموعة أبنائه لبناء هيكل صريح.', 'بيانات العقد وخصائص التحديد في React؛ تتضمن العقدة id وlabel وdisabled وchildren.', 'معرّفات العقد الموسعة، كحالة متحكم بها أو ابتدائية؛ يستخدم Vanilla الخيار expanded وcontroller.expanded وhw:change detail.expanded، ويستخدم Angular [(expanded)].', 'أسماء مطلوبة لزر التوسيع button.hw-tree-toggle في كل المحوّلات (في Vanilla: data-hw-expand-label="… {label}" وdata-hw-collapse-label="… {label}" على الجذر).'],
    accessibility: ['استخدم tree عندما يفيد نموذج لوحة المفاتيح الهرمي؛ قد تكون قائمة تنقل متداخلة أبسط.', 'سمِّ الشجرة وكل عقدة بتسمية مقروءة.', 'امنع التفاعل مع العقد المعطلة وحافظ على تركيز مرئي بعد الطي.'],
    limitations: ['لا يدعم التحديد المتعدد أو العرض الافتراضي أو السحب والإفلات أو تحميل العقد عن بُعد.'],
  }),
  carousel: localized('carousel', {
    summary: 'عرض شريحة واحدة عبر مسار متحرك، مع سهمي السابق والتالي ومؤشرات اختيار اختيارية وإعلان الموضع. لا ينتقل تلقائيًا.',
    usage: carouselDemoMarkup('ar'),
    lifecycle: ['هيّئ عناصر HTML المكتوبة أو ركّب المكوّن الأصلي. يحتفظ المسار بعقد الشرائح؛ تصبح الشرائح غير النشطة inert وتُستبعد من شجرة الإتاحة.', 'يغيّر التنقل الفهرس النشط الذي يبدأ من الصفر ويعلن موضعه. يستغرق انتقال نمط DGA المستند للمصدر 600ms، ويُلغى عند تفضيل الحركة المخفّضة.', 'تحمل الأسهم aria-disabled="true" عند الأطراف في النمط المحدود وتبقى قابلة للتركيز، ولا تُكتب disabled إلا عندما يكون العرض كله غير متاح. الالتفاف صريح في React وAngular وHTML؛ تحتفظ Vue بافتراضي wrap السابق، لذا مرّر wrap=false للتنقل المحدود.', 'يستعيد destroy صفات HTML وأنماطه وحالات أزراره. أنه المتحكم قبل استبدال شرائحه؛ تحدّث الأطر عقدها الأصلية من الخصائص.'],
    api: ['علامات الشرائح والأسهم وأزرار المؤشرات ذات الفهرس الذي يبدأ من الصفر في HTML.', 'المسار ونافذة القص يتيحان الانتقال دون نقل عقد المستدعي إلى أب جديد.', 'فهرس متحكم به أو ابتدائي يبدأ من الصفر في React.', 'فهرس متحكم به أو ابتدائي يبدأ من الصفر في Vue؛ يربط v-model حدث التغيير.', 'الفهرس النشط الذي يبدأ من الصفر في Angular، مع دعم الربط [(current)].', 'تقبل Angular قالب TemplateRef<{$implicit: HwSlide; index: number}> عبر slideTemplate؛ يعرض let-item بيانات الشريحة ويعرض let-index="index" موضعها الذي يبدأ من الصفر. تستخدم Vue فتحات باسم معرّف الشريحة وتقبل React محتوى قابلًا للعرض. يمتلك كل إطار عقد محتواه.', 'تستخدم React وAngular وHTML خيار loop وافتراضيه false، وتستخدم Vue خيار wrap وافتراضيه true. تتعطل الأسهم مع صفر شرائح أو شريحة واحدة.', 'إظهار أزرار الاختيار المباشر وتسميتها للإتاحة. يكتب تطبيق HTML مجموعة المؤشرات أو يحذفها.', 'أسماء مطلوبة للأزرار والحالة الفارغة وكل موضع (indicatorsLabel عند عرض المؤشرات). تستقبل getSlideLabel(position, total) موضعًا يبدأ من 1 في كل المحوّلات.'],
    accessibility: ['سمِّ المنطقة والأسهم ومجموعة المؤشرات بأسماء مفهومة يقدّمها التطبيق. تدعم الأزرار Enter والمسافة بالسلوك الأصلي.', 'يصبح المحتوى غير النشط inert فورًا، فلا يستقبل التركيز أثناء اكتمال الحركة المرئية للشريحة السابقة.', 'تستخدم المؤشرات aria-current، وتقع النقاط المرئية داخل أهداف أكبر مع تركيز لوحة مفاتيح ظاهر.', 'فضّل قائمة بسيطة عندما يحتاج المستخدم إلى مقارنة كل العناصر معًا.'],
    variants: ['تنقل محدود', 'التفاف', 'دون مؤشرات', 'قائمة فارغة', 'شريحة واحدة'],
    limitations: ['لا يوجد تشغيل تلقائي أو محرك إيماءات أو نافذة متجاوبة لعدة عناصر أو تحميل افتراضي؛ لا يثبت ملف NIC المورّد هذه السلوكيات.', 'تظهر نقاط المصدر بحجم 12px داخل أهداف أكبر، مع تكييفات للتركيز والحركة المخفّضة.'],
  }),
  link: localized('link', {
    summary: 'التنقل إلى وجهة فعلية بعنصر رابط أصلي، مع الحفاظ على سجل المتصفح والقائمة السياقية وسلوك لوحة المفاتيح.',
    usage: `<a class="hw-link" href="./services">استكشف الخدمات</a>
<a class="hw-link" href="https://example.org" target="_blank" rel="noopener noreferrer">إرشادات خارجية — تفتح في تبويب جديد</a>`,
    lifecycle: ['وفّر href فعليًا ونصًا يصف الوجهة.', 'دع المتصفح يتنقل أو اربط العنصر بموجّه التطبيق مع الحفاظ على دلالات الرابط الأصلية.', 'لا يحتاج الرابط إلى متحكم مباشر؛ يدير الموجّه مستمعيه ودورة حياته.'],
    api: ['عنوان الوجهة الفعلية.', 'استخدم external في React وVue وموجّه Angular hwLink (<a hwLink>)؛ وضّح فتح نافذة جديدة. تُضاف noopener وnoreferrer إلى rel المكتوبة.', 'افتراضي أو محايد neutral مع الاسم المتوافق subtle أو مستقل standalone.', 'يحذف الرابط المعطل href ويمنع التنشيط؛ في HTML احذف href واستخدم role=link وaria-disabled=true وtabindex=-1.'],
    accessibility: ['اكتب نصًا مفهومًا للرابط حتى خارج سياقه.', 'وضّح فتح تبويب جديد عندما يؤثر ذلك على المستخدم.', 'استخدم button للإجراءات التي لا تنتقل إلى وجهة.'],
    variants: ['افتراضي', 'محايد: neutral', 'هادئ: subtle', 'مستقل: standalone', 'معطل', 'رابط خارجي'],
  }),
  'icon-button': localized('icon-button', {
    summary: 'زر إجراء مختصر بأيقونة زخرفية وتسمية قابلة للوصول تصف العملية.',
    usage: `<button class="hw-button hw-icon-button" type="button" data-variant="ghost" data-shape="circle" aria-label="إغلاق الحوار">
  <span class="hw-icon" data-icon="cancel-01" aria-hidden="true"></span>
</button>`,
    lifecycle: ['اعرض الزر الأصلي باسم صريح للعملية.', 'عالج النقر كأي زر آخر، بما في ذلك الانشغال أو التعطيل عند الحاجة.', 'لا يحتاج إلى متحكم مباشر؛ تتبع مستمعات إجراء التطبيق دورة حياة الواجهة.'],
    api: ['اسم الإجراء على الزر الأصلي في كل محول.', 'شكل مربع أو دائري؛ يستخدم HTML الخاصية data-shape.', 'المظهر والحجم وحالة التحميل؛ يعطل التحميل الزر ويضيف aria-busy. يحدد HTML الحالتين صراحة.', 'حجم الرسم مستقل عن مساحة الضغط التي تحددها الكثافة.', 'خصائص الزر الأصلية؛ ينقل Angular القيم إلى الزر الداخلي.', 'مدخلات Angular لعلاقات ARIA؛ تستخدم بقية المحولات خصائص aria-* الأصلية.', 'دالة التركيز في Vue وAngular؛ يستخدم React وHTML مرجع الزر الأصلي.'],
    variants: ['مربع أو دائري', 'مساحات ضغط صغيرة ومتوسطة وكبيرة', 'محدد أو معطل أو جارٍ التحميل', 'أيقونات زخرفية بخلفية'],
    accessibility: ['لا تعتمد على title أو شكل الأيقونة بوصفه الاسم الوحيد.', 'أخفِ الأيقونة عن قارئات الشاشة وأبقِ مساحة النقر مناسبة.', 'يمكن للتلميح أن يكمّل التسمية، لكنه لا يحل محلها.'],
  }),
  'button-group': localized('button-group', {
    summary: 'تجميع بصري ودلالي لإجراءات مستقلة مترابطة، دون إضافة حالة اختيار أو اختصارات شريط أدوات.',
    usage: buttonGroupMarkup('ar', { pretty: true }),
    lifecycle: ['اعرض مجموعة مسمّاة تحتوي أزرار إجراءات أصلية.', 'ينفذ كل زر إجراءه ويظل محطة Tab عادية.', 'لا يوجد متحكم للمجموعة أو إدارة ضمنية لحالات الضغط.'],
    api: ['اسم مجموعة الإجراءات في جميع المحولات.', 'أزرار أصلية مستقلة داخل المجموعة.', 'دلالات المجموعة في HTML دون ادعاء سلوك toolbar.', 'عرض عادي أو متصل؛ يستخدم HTML الخاصية data-variant.', 'اتجاه أفقي أو رأسي؛ يستخدم HTML الخاصية data-orientation.'],
    accessibility: ['سمِّ المجموعة بإيجاز إذا لم تكن العلاقة واضحة من السياق.', 'لا تضف دور toolbar دون تطبيق نموذج لوحة مفاتيحه.', 'استخدم ToggleGroup للأوضاع القابلة للاختيار.'],
  }),
  chip: localized('chip', {
    summary: 'وسم مختصر أو اختيار قابل للإزالة، مع زر حذف اختياري منفصل عن نصه.',
    usage: `<span class="hw-chip" data-tone="info">الأعمال
  <button type="button" aria-label="إزالة مرشح الأعمال"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
</span>`,
    lifecycle: ['اعرض النص وزر حذف مسمّى عندما يكون الوسم قابلًا للإزالة.', 'يحذف التطبيق القيمة المختارة عند تفعيل الزر؛ لا تحتوي شريحة HTML وحدها متحكمًا تلقائيًا.', 'يبلغ onRemove في React عن الإجراء دون تعديل مصفوفات المستدعي. بعد إزالة شريحة مركّزة أعد التركيز إلى عنصر مجاور مفيد.'],
    api: ['نبرة مرئية للفئة أو الحالة في React.', 'معالج الإزالة الاختياري؛ يظهر زر الإزالة ما دام معالج مربوطًا (onRemove في React و@remove في Vue و(removed) في Angular)، وعندها يكون removeLabel، اسمه الميسّر، مطلوبًا.', 'يمنع إجراء الإزالة في React.', 'مظهر اختياري بحدود خارجية في HTML.'],
    accessibility: ['اجعل تسمية الحذف محددة بالوسم.', 'لا تجعل وسوم الحالة غير التفاعلية محطات تركيز.', 'استخدم TagInput لدورة كاملة لتحرير الوسوم وإرسال قيمها.'],
    variants: ['نبرة لونية', 'حدود خارجية', 'قابل للإزالة'],
  }),
  stat: localized('stat', {
    summary: 'عرض مؤشر رقمي مسمّى مع شرح أو اتجاه تغير اختياري. يتولى التطبيق تنسيق القيمة وتفسير التغير.',
    usage: `<div class="hw-stat">
  <span class="hw-stat-label">الطلبات المكتملة</span>
  <strong class="hw-stat-value">1٬284</strong>
  <span class="hw-stat-trend" data-tone="success">أكثر بنسبة 12٪ من الشهر الماضي</span>
</div>`,
    lifecycle: ['نسّق القيمة للغة المختارة واعرض اسم المؤشر وفترته الزمنية.', 'حدّثه من بيانات فعلية ووضّح هل الارتفاع أو الانخفاض إيجابي أم سلبي أم محايد في هذا السياق.', 'لا يجلب المكوّن البيانات أو يستطلعها؛ ألغِ اشتراكات التطبيق عند إزالة الواجهة.'],
    api: ['اسم المؤشر والقيمة المنسّقة لدى المستدعي، وهما مطلوبان في React.', 'سياق اختياري ومعلومات المقارنة في React.'],
    accessibility: ['اذكر الوحدات وفترة المقارنة.', 'لا تعتمد على سهم أو لون أخضر أو أحمر لتفسير الاتجاه.', 'تجنب تحويل المؤشرات السريعة إلى مناطق حيّة كثيرة الإعلانات.'],
  }),
  timeline: localized('timeline', {
    summary: 'عرض أحداث أو سجل إجراءات بترتيب مفهوم، مع تواريخ وأوصاف وحالة حالية أو مكتملة عند الحاجة.',
    usage: `<ol class="hw-timeline" aria-label="سجل الطلب">
  <li class="hw-timeline-item" data-state="complete"><h3>استلام الطلب</h3><time datetime="2026-10-27">27 أكتوبر 2026</time></li>
  <li class="hw-timeline-item" data-state="current" aria-current="step"><h3>المراجعة جارية</h3><p>يجري فحص المستندات الداعمة.</p></li>
</ol>`,
    lifecycle: ['اعرض أحداثًا ثابتة الهوية بترتيب زمني أو إجرائي مقصود.', 'أضف الأحداث أو حدّثها من بيانات التطبيق المعتمدة؛ لا يتابع المكوّن طلبًا عن بُعد بمفرده.', 'أزل العرض مع الواجهة ونظّف استطلاع التطبيق للبيانات بصورة مستقلة.'],
    api: ['سجلات أحداث ثابتة؛ والتواريخ الظاهرة نصوص يقدّمها التطبيق.', 'حالة كل حدث ضمن التسلسل في كل المحوّلات؛ يكتب Vanilla السمة data-state على العنصر.', 'محتوى نصي سطري يُعرض في p بعد العنوان h3 والوقت.', 'الاسم القابل للوصول للسجل.'],
    accessibility: ['استخدم قائمة مرتبة وعنصر time بصفة datetime عند وجود تاريخ.', 'عبّر عن الحالة الحالية والمكتملة بالنص إلى جانب المظهر.', 'ميّز الأحداث المسجلة عن التقديرات المستقبلية.'],
  }),
  meter: localized('meter', {
    summary: 'عرض قياس عددي ضمن نطاق معلوم باستخدام meter الأصلي، مثل استخدام التخزين أو درجة تقييم.',
    usage: `<label>استخدام التخزين — 65٪
  <meter class="hw-meter" min="0" max="100" low="25" high="85" optimum="20" value="65">65٪</meter>
</label>`,
    lifecycle: ['حدّد حدًا أدنى وأقصى وقيمة قياس متوافقة.', 'حدّث value عند تغير القياس؛ توضّح low وhigh وoptimum تفسير النطاق.', 'لا توجد دورة اكتمال مهمة أو متحكم. يمتلك التطبيق بيانات القياس.'],
    api: ['القياس الحالي ونطاقه العددي.', 'العتبات والمنطقة المفضلة ضمن النطاق؛ لا يكتبها أي محوّل ما لم تُمرَّر.', 'النطاق في كل المحوّلات؛ مرّر max={1} لقيمة كسرية.', 'الاسم الميسّر للقياس. لا تعرض المحوّلات تسمية ظاهرة: اكتبها بنفسك واربطها عبر aria-labelledby حيث تلزم.'],
    accessibility: ['اشرح الوحدات والعتبات بالنص.', 'استخدم Progress لاكتمال عملية بدلًا من Meter.', 'لا تعبّر عن النطاق الآمن أو غير الآمن باللون وحده.'],
  }),
  'avatar-group': localized('avatar-group', {
    summary: 'عرض مجموعة أشخاص مسمّاة مع عدد مختصر للأعضاء الإضافيين عند تقييد العناصر المرئية.',
    usage: `<div class="hw-avatar-group" role="group" aria-label="فريق المراجعة">
  <span class="hw-avatar" role="img" aria-label="نورة أحمد">ن أ</span>
  <span class="hw-avatar" role="img" aria-label="أمل صالح">أ ص</span>
  <span class="hw-avatar" role="img" aria-label="عضوان إضافيان">+2</span>
</div>`,
    lifecycle: ['وفّر أعضاء مسمّين بهويات ثابتة واختر حدًا مرئيًا يلائم المساحة.', 'يحسب React العدد المتبقي؛ وتقدّم getOverflowLabel(count) تسميته القابلة للوصول. تأتي تغيرات العضوية من بيانات التطبيق.', 'لا يوجد متحكم لاختيار الأشخاص أو جلب ملفاتهم؛ تظل روابط الصور ملكًا للتطبيق.'],
    api: ['أسماء الأعضاء وصورهم أو أحرفهم الاختيارية ([items] في Angular، وكانت [avatars]).', 'اسم المجموعة المطلوب في React.', 'أقصى عدد مرئي من الصور المسمّاة؛ الافتراضي خمسة.', 'تسمية مطلوبة لعدد الأعضاء الإضافيين.'],
    accessibility: ['سمِّ المجموعة وكل صورة تؤدي معنى.', 'لا يغني العدد الإضافي عن قائمة أعضاء كاملة قابلة للوصول عندما تكون مطلوبة.', 'لا توحِ بأن الصورة تفتح ملفًا إلا إذا كانت رابطًا أو زرًا فعليًا.'],
  }),
  'data-table': localized('data-table', {
    summary: 'يضيف فرزًا ثابتًا ومراعيًا للغة إلى جدول دلالي، ويشارك Table أنماطه وأحجامه وغلافه المسمّى القابل للتمرير بلوحة المفاتيح. يستخدم نمط DGA خلايا افتراضية بحد أدنى للارتفاع 48 بكسل وحشوة 8/16 بكسل ونصف قطر خارجي 8 بكسل؛ الصغير 40 والكبير 56 تكييفان من هوية.',
    usage: `<div class="hw-table-wrap" tabindex="0" role="region" aria-label="الطلبات">
  <table class="hw-table hw-data-table" data-hw="data-table" data-hw-locale="ar-SA" data-variant="default" data-size="md">
    <caption>الطلبات</caption>
    <thead><tr><th scope="col" data-hw-key="name"><button type="button" data-hw-sort="name">الخدمة<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th><th scope="col" data-hw-key="days" data-hw-type="number"><button type="button" data-hw-sort="days">الأيام<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th></tr></thead>
    <tbody><tr><th scope="row">الرخصة</th><td>3</td></tr><tr><th scope="row">الشهادة</th><td>1</td></tr></tbody>
  </table>
</div>`,
    lifecycle: ['هيّئ الجدول المركب بمفاتيح واضحة للرؤوس القابلة للفرز ومعلومات نوع القيم.', 'يبدّل تفعيل رأس الفرز الترتيب التصاعدي والتنازلي وaria-sort. تُفرز الأعداد رقميًا والنصوص وفق اللغة المطلوبة locale (data-hw-locale في Vanilla).', 'الفرز ثابت، وتبقى القيم المفقودة أخيرًا. ترتّب محولات الأطر الصفوف دون تعديل بيانات المستدعي.', 'يعيد destroy في النسخة المباشرة ترتيب tbody وصفات الرؤوس الأصلية. أنه المتحكم قبل استبدال هيكل الصفوف أو الرؤوس.'],
    api: ['مفتاحان متطابقان يربطان زر الفرز بعموده.', 'استخدم number للأعمدة الرقمية؛ تُفرز القيم المعروضة كنصوص خلاف ذلك.', 'قيمة آلية للفرز بدل النص الظاهر عند الحاجة.', 'حالتان، كل منهما متحكم بها أو ابتدائية: sortKey/defaultSortKey/onSortKeyChange وsortDirection/defaultSortDirection/onSortDirectionChange في React، وv-model:sort-key وv-model:sort-direction في Vue، و[(sortKey)] و[(sortDirection)] في Angular. يبلغ Vanilla عبر onSortKeyChange وonSortDirectionChange وhw:change بالتفاصيل {sortKey, sortDirection}.', 'استخدم variant في الأطر أو data-variant على جدول Vanilla؛ يحتفظ React وVue بدعم سمة البيانات. النمطان striped وbordered امتدادان مستمران من هوية.', 'الحد الأدنى لارتفاع md في نمط DGA هو 48 بكسل؛ الحد الأدنى لـsm وهو 40 ولـlg وهو 56 تكييفان. تتمدد الخلايا مع التفاف المحتوى.', 'نص مطلوب للصف الفارغ الذي يمتد عبر جميع الأعمدة المحددة. يكتب مستخدم Vanilla الصف الفارغ.', 'يعرض معرّف الصف بعنصر th أصلي يحمل scope=row في محولات الأطر الثلاثة.', 'يخصّص React وVue غلاف التمرير المسمّى القابل للتركيز. يشتق Angular الاسم من caption.'],
    accessibility: ['استخدم caption وخلايا th أصلية مع scope وزرًا حقيقيًا داخل كل رأس قابل للفرز.', 'يوضّح aria-sort حالة الفرز؛ يمكن أن توفّر getSortLabel تسمية الإجراء.', 'أبقِ التمرير الأفقي متاحًا بلوحة المفاتيح على الشاشات الضيقة دون فقد علاقات الرؤوس بالخلايا.'],
    variants: ['افتراضي: default', 'صفوف متناوبة: striped', 'حدود الأعمدة: bordered', 'الأحجام sm / md / lg', 'بيانات فارغة'],
    frameworkNotes: 'تستخدم أعمدة DataTable وTable الحقول key/label/rowHeader في كل محول، مع sortable في DataTable؛ يمرّر React الدالة cell(row, index) ويوفر Vue فتحات cell-<key> بالقيم {row, index, column}. حالة الفرز هي sortKey وsortDirection في كل المحوّلات. يعرض React وVue الغلاف div.hw-table-wrap.hw-data-table حول الجدول.',
    limitations: ['لا يوفّر تحرير الخلايا أو العرض الافتراضي أو تحديد عدة صفوف أو جلب البيانات عن بُعد أو نموذج مفاتيح ورقة الحساب.'],
  }),
};
