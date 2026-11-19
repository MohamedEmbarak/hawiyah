// Fixed tables of the content pipeline (contentPipeline in the milestone 4
// specification): languages, the h2 set, API table headers, alert kinds,
// caption prefixes, live info-string keys and code listing titles.

export const LANGS = /** @type {const} */ (['ar', 'en']);

export const DIRECTION = { ar: 'rtl', en: 'ltr' };

export const GITHUB_BLOB = 'https://github.com/MohamedEmbarak/hawiyah/blob/main/';
export const GITHUB_TREE = 'https://github.com/MohamedEmbarak/hawiyah/tree/main/';

/** The six h2 sections in their fixed order. */
export const H2 = [
  { id: 'example', en: 'Example', ar: 'مثال', required: true },
  { id: 'variants-and-states', en: 'Variants and states', ar: 'الأشكال والحالات', required: false },
  { id: 'api', en: 'API', ar: 'الواجهة البرمجية', required: true },
  { id: 'accessibility', en: 'Accessibility', ar: 'إمكانية الوصول', required: true },
  { id: 'rtl-and-localisation', en: 'RTL and localisation', ar: 'الاتجاه والتوطين', required: true },
  { id: 'platforms-code-reference', en: 'Platforms Code reference', ar: 'مرجع كود المنصات', required: true },
];

/** Sections whose h3 and h4 headings are free text. */
export const FREE_TEXT_SECTIONS = new Set(['variants-and-states', 'accessibility', 'rtl-and-localisation', 'platforms-code-reference']);

/** The four h3 of the API section, the same text in both languages. */
export const API_H3 = [
  { id: 'javascript', text: 'JavaScript', framework: 'vanilla' },
  { id: 'react', text: 'React', framework: 'react' },
  { id: 'vue', text: 'Vue', framework: 'vue' },
  { id: 'angular', text: 'Angular', framework: 'angular' },
];

/** Header rows of the API tables, per language and h3 id. */
export const API_HEADERS = {
  en: {
    javascript: ['Option', 'Type', 'Required', 'Default'],
    react: ['Prop', 'Type', 'Required', 'Default'],
    vue: ['Name', 'Kind', 'Type', 'Required', 'Default'],
    angular: ['Name', 'Kind', 'Type', 'Required', 'Default'],
  },
  ar: {
    javascript: ['الخيار', 'النوع', 'مطلوب', 'القيمة الافتراضية'],
    react: ['الخاصية', 'النوع', 'مطلوب', 'القيمة الافتراضية'],
    vue: ['الاسم', 'الصنف', 'النوع', 'مطلوب', 'القيمة الافتراضية'],
    angular: ['الاسم', 'الصنف', 'النوع', 'مطلوب', 'القيمة الافتراضية'],
  },
};

/** Column roles of the API tables (the same positions in both languages). */
export const API_COLUMNS = {
  javascript: ['name', 'type', 'required', 'default'],
  react: ['name', 'type', 'required', 'default'],
  vue: ['name', 'kind', 'type', 'required', 'default'],
  angular: ['name', 'kind', 'type', 'required', 'default'],
};

export const API_KINDS = {
  vue: ['prop', 'event', 'slot'],
  angular: ['input', 'output', 'content'],
};

export const EM_DASH = '—';

export const CAPTION_PREFIX = { en: 'Table: ', ar: 'جدول: ' };

/** GitHub alert kinds and the tone the renderer gives them. */
export const ALERTS = {
  note: { marker: 'NOTE', tone: 'info' },
  tip: { marker: 'TIP', tone: 'success' },
  important: { marker: 'IMPORTANT', tone: 'info' },
  warning: { marker: 'WARNING', tone: 'warning' },
  caution: { marker: 'CAUTION', tone: 'danger' },
};

/** Live blocks: info-string language to framework, in group order. */
export const FRAMEWORKS = ['vanilla', 'react', 'vue', 'angular'];
export const LIVE_LANGS = { html: 'vanilla', tsx: 'react', jsx: 'react', vue: 'vue', ts: null };
export const LIVE_KEYS = ['example', 'framework', 'check', 'differences'];
export const LIVE_NAME = /^[a-z][a-z0-9-]{0,39}$/;

/** Visible titles of code listings by info-string language. */
export const LANGUAGE_NAMES = {
  html: 'HTML',
  tsx: 'TSX',
  jsx: 'JSX',
  vue: 'Vue',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  mjs: 'JavaScript',
  css: 'CSS',
  shell: 'Shell',
  sh: 'Shell',
  bash: 'Shell',
  json: 'JSON',
};

/** Failure codes of step 20, in the order of the specification. */
export const CODES = [
  'HWC-FILE', 'HWC-FM1', 'HWC-FM2', 'HWC-H1', 'HWC-SUM', 'HWC-H2', 'HWC-API', 'HWC-H5', 'HWC-TAB1', 'HWC-LINK', 'HWC-MD',
  'HWC-LIVE1', 'HWC-LIVE2', 'HWC-LIVE3',
  'HWC-PAR1', 'HWC-PAR2', 'HWC-PAR3', 'HWC-PAR4', 'HWC-PAR5', 'HWC-PAR6', 'HWC-PAR7', 'HWC-PAR8', 'HWC-STALE',
];

/** A finding: printed as '<code> <file>:<line>: <message>'. */
export function finding(code, file, line, message) {
  return { code, file, line: line ?? 1, message };
}

export function formatFinding(item) {
  return `${item.code} ${item.file}:${item.line}: ${item.message}`;
}
