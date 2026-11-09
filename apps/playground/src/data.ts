import { guideIcons } from './guide-icons';
import {escape} from './guide-html';
import { expansionCatalog } from "./expansion-catalog";
export type Locale = "en" | "ar";
export const services = [
  {
    id: "commercial",
    icon: "building",
    category: "business",
    title: ["Start a business", "بدء نشاط تجاري"],
    description: [
      "Your next chapter starts here. Set up a commercial activity with a clear path forward.",
      "ابدأ فصلك القادم. أسّس نشاطك التجاري بخطوات واضحة.",
    ],
    fee: 200,
    days: 3,
    popular: true,
  },
  {
    id: "license",
    icon: "file",
    category: "business",
    title: ["Renew a commercial license", "تجديد رخصة تجارية"],
    description: [
      "Keep your business moving with a straightforward renewal.",
      "واصل أعمالك بإجراءات تجديد مبسّطة.",
    ],
    fee: 150,
    days: 1,
  },
  {
    id: "permit",
    icon: "home",
    category: "municipal",
    title: ["Request a building permit", "طلب رخصة بناء"],
    description: [
      "Plan your next project and submit your documents in one place.",
      "خطّط لمشروعك القادم وقدّم مستنداتك في مكان واحد.",
    ],
    fee: 500,
    days: 5,
  },
  {
    id: "certificate",
    icon: "badge",
    category: "personal",
    title: ["Issue a digital certificate", "إصدار شهادة رقمية"],
    description: [
      "A verified record, ready when you need it.",
      "سجل موثّق، جاهز عندما تحتاجه.",
    ],
    fee: 0,
    days: 1,
  },
  {
    id: "address",
    icon: "pin",
    category: "personal",
    title: ["Update national address", "تحديث العنوان الوطني"],
    description: [
      "Keep your address details accurate and up to date.",
      "حافظ على دقة معلومات عنوانك وتحديثها.",
    ],
    fee: 0,
    days: 1,
  },
  {
    id: "event",
    icon: "calendar",
    category: "municipal",
    title: ["Apply for an event permit", "طلب تصريح فعالية"],
    description: [
      "Bring people together. We will guide you through the details.",
      "اجمع الناس على فكرة. نرشدك خلال التفاصيل.",
    ],
    fee: 300,
    days: 4,
  },
  {
    id: "work",
    icon: "briefcase",
    category: "business",
    title: ["Manage workplace records", "إدارة سجلات العمل"],
    description: [
      "One clear view of your organization’s essential information.",
      "صورة واضحة للمعلومات الأساسية لمنشأتك.",
    ],
    fee: 0,
    days: 2,
  },
  {
    id: "feedback",
    icon: "message",
    category: "personal",
    title: ["Share a suggestion", "مشاركة اقتراح"],
    description: [
      "Help shape services that work better for everyone.",
      "ساهم في تطوير خدمات أفضل للجميع.",
    ],
    fee: 0,
    days: 2,
  },
] as const;
export type Service = (typeof services)[number];
export const requests = [
  {
    id: "HW-1042",
    name: ["Commercial registration", "سجل تجاري"],
    date: "2026-10-24",
    status: "review",
    step: 2,
  },
  {
    id: "HW-1038",
    name: ["Event permit", "تصريح فعالية"],
    date: "2026-10-22",
    status: "action",
    step: 1,
  },
  {
    id: "HW-1031",
    name: ["Digital certificate", "شهادة رقمية"],
    date: "2026-10-20",
    status: "completed",
    step: 3,
  },
  {
    id: "HW-1024",
    name: ["License renewal", "تجديد رخصة"],
    date: "2026-10-18",
    status: "completed",
    step: 3,
  },
  {
    id: "HW-1019",
    name: ["Building permit", "رخصة بناء"],
    date: "2026-10-16",
    status: "draft",
    step: 0,
  },
] as const;
export const catalog = [
  ["button", "Button", "زر", "Actions"],
  ["field", "Field", "حقل", "Forms"],
  ["text-field", "Text field", "حقل نصي", "Forms"],
  ["textarea", "Textarea", "مساحة نص", "Forms"],
  ["select", "Select", "قائمة اختيار", "Forms"],
  ["checkbox", "Checkbox", "مربع اختيار", "Forms"],
  ["radio", "Radio", "اختيار مفرد", "Forms"],
  ["switch", "Switch", "مفتاح تبديل", "Forms"],
  ["combobox", "Combobox", "بحث واختيار", "Forms"],
  ["upload", "File upload", "رفع ملف", "Forms"],
  ["tabs", "Tabs", "تبويبات", "Navigation"],
  ["breadcrumb", "Breadcrumb", "مسار التنقل", "Navigation"],
  ["pagination", "Pagination", "ترقيم الصفحات", "Navigation"],
  ["stepper", "Stepper", "الخطوات", "Navigation"],
  ["dialog", "Dialog", "نافذة حوار", "Feedback"],
  ["alert", "Alert", "تنبيه", "Feedback"],
  ["tooltip", "Tooltip", "تلميح", "Feedback"],
  ["progress", "Progress", "التقدم", "Feedback"],
  ["spinner", "Spinner", "مؤشر تحميل", "Feedback"],
  ["skeleton", "Skeleton", "هيكل تحميل", "Feedback"],
  ["empty", "Empty state", "حالة فارغة", "Feedback"],
  ["card", "Card", "بطاقة", "Content"],
  ["badge", "Badge", "شارة", "Content"],
  ["avatar", "Avatar", "صورة رمزية", "Content"],
  ["divider", "Divider", "فاصل", "Content"],
  ["accordion", "Accordion", "قسم قابل للتوسيع", "Content"],
  ["table", "Table", "جدول", "Content"],
  ...expansionCatalog,
] as const;
export type ComponentId = (typeof catalog)[number][0];
export {escape};
/** Guide icons are DGA Platforms Code icons (Hugeicons Stroke Rounded); see guide-icons.ts. */
export const iconNames = Object.keys(guideIcons);
export function icon(name: string, size = 20) {
  const directional = name === "arrow" || name === "arrow-back" || name === "chevron";
  const glyph = guideIcons[name] ?? guideIcons.grid!;
  return `<svg class="pg-icon${directional ? " pg-icon-directional" : ""}" data-icon="${escape(name)}" data-dga-icon="${glyph.source}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">${glyph.markup}</svg>`;
}
