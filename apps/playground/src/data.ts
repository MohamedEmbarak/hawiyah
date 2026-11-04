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
    id: "NQ-1042",
    name: ["Commercial registration", "سجل تجاري"],
    date: "2026-10-24",
    status: "review",
    step: 2,
  },
  {
    id: "NQ-1038",
    name: ["Event permit", "تصريح فعالية"],
    date: "2026-10-22",
    status: "action",
    step: 1,
  },
  {
    id: "NQ-1031",
    name: ["Digital certificate", "شهادة رقمية"],
    date: "2026-10-20",
    status: "completed",
    step: 3,
  },
  {
    id: "NQ-1024",
    name: ["License renewal", "تجديد رخصة"],
    date: "2026-10-18",
    status: "completed",
    step: 3,
  },
  {
    id: "NQ-1019",
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
export const paths: Record<string, string> = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  layers: "m12 3 10 6-10 6L2 9l10-6z M2 14l10 6 10-6 M2 19l10 6 10-6",
  palette:
    "M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4z M7 8h.01 M5 12h.01 M10 6h.01 M15 6h.01",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  "arrow-back": "M19 12H5 M11 6l-6 6 6 6",
  search: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  check: "m5 12 4 4L19 6",
  chevron: "m9 5 7 7-7 7",
  copy: "M9 9h11v12H9z M5 15H3V3h12v2",
  sun: "M12 3V1 M12 23v-2 M3 12H1 M23 12h-2 M4 4l2 2 M18 18l2 2 M20 4l-2 2 M6 18l-2 2 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  moon: "M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13z",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18",
  book: "M12 6C8 3 5 3 2 4v15c4-1 6-1 10 2 4-3 6-3 10-2V4c-3-1-6-1-10 2z M12 6v15",
  code: "m8 5-7 7 7 7 M16 5l7 7-7 7 M14 3l-4 18",
  building:
    "M4 21V3h12v18 M16 9h4v12 M8 7h4 M8 11h4 M8 15h4 M9 21v-3h2v3 M2 21h20",
  home: "m2 11 10-9 10 9 M5 9v12h14V9 M9 21v-7h6v7",
  file: "M5 2h10l5 5v15H5z M14 2v6h6 M9 13h7 M9 17h5",
  badge: "M16 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M8 12l-2 9 6-3 6 3-2-9",
  pin: "M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 1 1 14 0 M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  calendar: "M3 5h18v17H3z M7 2v6 M17 2v6 M3 11h18 M7 15h2 M15 15h2",
  briefcase: "M3 7h18v14H3z M8 7V3h8v4 M3 12c5 4 13 4 18 0 M12 12v4",
  message: "M3 3h18v14H9l-6 4z M7 7h10 M7 11h7",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v6l4 2",
  close: "M6 6l12 12 M18 6 6 18",
  upload: "M12 16V3 M7 8l5-5 5 5 M4 15v6h16v-6",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  download: "M12 3v13 M7 11l5 5 5-5 M4 17v4h16v-4",
  spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
  filter: "M3 5h18 M6 12h12 M9 19h6",
  shield: "m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z m-5 10 3 3 6-6",
};
export function icon(name: string, size = 20) {
  const directional = name === "arrow" || name === "arrow-back" || name === "chevron";
  return `<svg class="pg-icon${directional ? " pg-icon-directional" : ""}" data-icon="${escape(name)}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.grid}"/></svg>`;
}
