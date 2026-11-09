import type {GuideInput} from './component-guide-types';
import {siteVerificationMarkup} from './site-verification-demo';

export const verificationGuides:Record<string,GuideInput>={'site-verification':{
  summary:'A disclosure above the site header for domain, HTTPS and platform-registration information. Each deployment supplies its own approved claim and certificate link.',
  usage:siteVerificationMarkup('en'),
  api:[
    {name:'locale / label / detailsLabel',type:'string',description:'Arabic defaults; locale="en" provides English copy. label defaults to Website information, never a certification claim.'},
    {name:'domain / domainLabel / domainDescription',type:'string',description:'Configured site domain and explanatory text. The domain section is omitted when no domain is supplied.'},
    {name:'httpsLabel / httpsDescription',type:'string',description:'Guidance for checking HTTPS; the component does not inspect or certify the connection.'},
    {name:'registrationHref / registrationNumber / registrationLabel',type:'string',description:'Application-owned certificate URL and optional displayed number. The registration row is absent without a URL.'},
    {name:'registrationExternal / externalLabel',type:'boolean / string',description:'Opens the certificate in a new window by default, matching the source, with safe rel attributes and a localized accessible suffix. Set false for same-window links.'},
    {name:'open / onOpenChange / v-model:open / [(open)]',type:'boolean / callback',description:'Native disclosure state; React/Vue also accept defaultOpen. Vanilla uses the details open attribute and toggle event.'},
    {name:'mark / #mark / [hwVerificationMark]',type:'content',description:'Optional authorized flag or identity artwork. No official logo or stamp is bundled. Additional content uses children/default projection.'},
    {name:'hw-portal-masthead / --hw-portal-gutter',type:'composition / CSS variable',description:'Wrap the banner and PortalHeader together; shared horizontal gutters align them. Optional data-variant="sticky" sticks the complete masthead.'},
  ],
  lifecycle:['Render immediately before PortalHeader inside hw-portal-masthead. Native details works before JavaScript and needs no vanilla controller.','Use Enter, Space or pointer activation on the summary. Listen to the native toggle event or framework state callback when needed.','Supply verified site-specific wording and registration data; omit absent information rather than inventing a certificate.'],
  accessibility:['Native summary exposes expanded/collapsed state without duplicate ARIA roles.','Hidden disclosure links are not in the tab sequence. Keyboard focus remains visibly outlined.','Domain and registration numbers use isolated LTR text within Arabic. Supply meaningful artwork alternatives or mark decorative artwork aria-hidden.'],
  variants:['Collapsed','Expanded','With or without a certificate link','Composed above a responsive header'],
  related:['portal-header','portal-layout','portal-footer'],source:'packages/react/src/site-verification.tsx',
  limitations:['The example uses example.test and a local demonstration link. It is not a government website or a certification.','The source script establishes structure and disclosure behavior. Hawiyah uses semantic tokens and accessible native details; exact stamp CSS and official artwork redistribution are not claimed.'],
}};
export const arabicVerificationGuides:Record<string,GuideInput>={'site-verification':{
  summary:'شريط قابل للتوسيع أعلى الترويسة لعرض النطاق وHTTPS ورابط تسجيل المنصة. يزوّد التطبيق النص المعتمد ورابط شهادته الفعلية.',usage:siteVerificationMarkup('ar'),
  api:[
    {name:'locale / label / detailsLabel',type:'string',description:'العربية افتراضيًا، وlocale="en" للإنجليزية. النص الافتراضي «معلومات الموقع» لا يدّعي الاعتماد.'},
    {name:'domain / domainLabel / domainDescription',type:'string',description:'نطاق الموقع والنص التوضيحي؛ يُحذف القسم عند عدم توفير النطاق.'},
    {name:'httpsLabel / httpsDescription',type:'string',description:'إرشادات للتحقق من HTTPS؛ لا يفحص المكوّن الاتصال ولا يصدر شهادة.'},
    {name:'registrationHref / registrationNumber / registrationLabel',type:'string',description:'رابط الشهادة الفعلية ورقمها الاختياري؛ يُحذف السطر عند غياب الرابط.'},
    {name:'registrationExternal / externalLabel',type:'boolean / string',description:'يفتح رابط التسجيل في نافذة جديدة افتراضيًا كما في المصدر، مع rel آمن وتنبيه ميسّر مترجم. استخدم false للفتح في النافذة نفسها.'},
    {name:'open / onOpenChange / v-model:open / [(open)]',type:'boolean / callback',description:'حالة التوسيع؛ يقبل React وVue أيضًا defaultOpen. يستخدم Vanilla سمة open وحدث toggle الأصليين.'},
    {name:'mark / #mark / [hwVerificationMark]',type:'content',description:'علم أو هوية مصرح بها اختياريًا. لا تتضمن الحزمة أصول الختم الرسمية. للمحتوى الإضافي استخدم children أو الإسقاط الافتراضي.'},
    {name:'hw-portal-masthead / --hw-portal-gutter',type:'تركيب / متغير CSS',description:'يجمع الشريط والترويسة بهوامش متطابقة. استخدم data-variant="sticky" لتثبيت المجموعة كاملةً.'},
  ],
  lifecycle:['ضعه مباشرة قبل PortalHeader داخل hw-portal-masthead؛ يعمل details الأصلي دون متحكّم Vanilla.','تُفتح التفاصيل بالنقر أو Enter أو Space. يمكن متابعة الحالة بحدث toggle أو ربط الإطار.','زوّد النص والبيانات الصحيحة الخاصة بالموقع. لا تضع أرقام تسجيل توضيحية مكان البيانات الفعلية.'],
  accessibility:['يعرض summary الأصلي حالة التوسيع دون أدوار ARIA مكررة.','لا تدخل الروابط المخفية في ترتيب Tab، ويظهر التركيز بوضوح.','يُعزل اتجاه النطاق وأرقام التسجيل من اليسار لليمين. وفّر وصفًا مناسبًا للهوية أو أخفِ الزخارف عن التقنيات المساعدة.'],
  variants:['مطوي','موسّع','مع رابط التسجيل أو بدونه','فوق الترويسة المتجاوبة'],related:['portal-header','portal-layout','portal-footer'],source:'packages/react/src/site-verification.tsx',
  limitations:['المثال يستخدم example.test ورابطًا محليًا توضيحيًا ولا يدّعي أنه موقع حكومي أو معتمد.','يثبت السكربت المرجعي البنية وسلوك التوسيع. تستخدم هوية رموزها وdetails الميسّر؛ لا ندّعي التطابق البصري الكامل أو حقوق إعادة توزيع أصول الختم.'],
}};
