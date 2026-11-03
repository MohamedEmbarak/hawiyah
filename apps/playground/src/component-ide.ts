import { basicSetup, EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { html as htmlLanguage } from '@codemirror/lang-html';
import { css as cssLanguage } from '@codemirror/lang-css';
import { javascript as javascriptLanguage } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { escape as escapeHTML, type Locale } from './data';
import { previewRuntime, previewStyles, previewAssets } from './generated/preview-runtime';
import './component-ide.css';
import { frameworkIcon } from './framework-icons';

type FileName = 'html' | 'css' | 'js';
export type IDEFiles = Record<FileName, string>;
export type IDEProject = { framework: string; names: Record<FileName,string>; initial: IDEFiles; compile(files:IDEFiles):Promise<{html:string;css:string;js:string;runtime:string;angular?:boolean}> };
type IDEOptions = { project?: IDEProject; html: string; locale: Locale; title: string; draft?: IDEFiles; onDraftChange?: (draft: IDEFiles) => void };
type PreviewEnvironment = { mode: 'light' | 'dark'; theme: string; density: string; direction: 'rtl' | 'ltr'; tokens: [string, string][] };
type PreviewMessage = { channel: string; token: string; run: number; type: string; text?: string; height?: number; level?: string };
const defaultFiles: { id: FileName; label: string; language: () => ReturnType<typeof htmlLanguage> }[] = [
  { id: 'html', label: 'index.html', language: htmlLanguage },
  { id: 'css', label: 'style.css', language: cssLanguage },
  { id: 'js', label: 'script.js', language: javascriptLanguage },
];
const copy = {
  ar: {
    project: 'مساحة التجربة', files: 'ملفات المثال', editor: 'محرر ملف', run: 'تشغيل', reset: 'استعادة المثال', copy: 'نسخ الملف',
    auto: 'معاينة تلقائية', preview: 'النتيجة المباشرة', width: 'عرض المعاينة', desktop: 'عرض كامل', mobile: 'هاتف',
    ready: 'المعاينة جاهزة', running: 'جارٍ تشغيل المثال…', edited: 'تغييرات لم تُشغَّل بعد', error: 'راجع الخطأ في السجل',
    console: 'السجل', copied: 'نُسخ الملف', copyFailed: 'تعذّر النسخ؛ حدّد الشيفرة وانسخها من المحرر.',
    help: 'عدّل HTML وCSS وJavaScript وشاهد النتيجة. المعاينة معزولة؛ الاستيراد الخارجي غير مدعوم.',
    shortcut: 'Ctrl / ⌘ + Enter للتشغيل', blocked: 'حُظر مورد خارجي في المعاينة:', navigation: 'التنقل خارج المثال غير متاح في المعاينة.',
    submitted: 'أُرسل نموذج المثال محليًا؛ لا تُرسل بيانات إلى خادم.', unsupported: 'تعذّر تهيئة المثال.',
    cssComment: 'أضف تنسيقاتك هنا. رموز نسق ومكوّناته محمّلة مسبقًا.',
    jsComment: 'المكوّن مهيّأ بالفعل. اربط إجراءات التطبيق هنا؛ لا تهيّئ العنصر مرتين.',
    jsEvent: 'مثال: root.addEventListener("nq:change", event => console.log(event.detail));',
  },
  en: {
    project: 'Component workspace', files: 'Example files', editor: 'File editor', run: 'Run', reset: 'Reset example', copy: 'Copy file',
    auto: 'Auto preview', preview: 'Live result', width: 'Preview width', desktop: 'Full width', mobile: 'Phone',
    ready: 'Preview ready', running: 'Running example…', edited: 'Changes waiting to run', error: 'Check the console error',
    console: 'Console', copied: 'File copied', copyFailed: 'Copy was unavailable; select and copy the code in the editor.',
    help: 'Edit HTML, CSS, and JavaScript to see the result. Isolated preview; external imports are unsupported.',
    shortcut: 'Ctrl / ⌘ + Enter to run', blocked: 'An external preview resource was blocked:', navigation: 'Navigation outside this example is unavailable in the preview.',
    submitted: 'Example form submitted locally; no data is sent to a server.', unsupported: 'The example could not be initialized.',
    cssComment: 'Add your styles here. Nasaq tokens and component styles are already loaded.',
    jsComment: 'The component is already enhanced. Add application behavior here; do not enhance it twice.',
    jsEvent: 'Example: root.addEventListener("nq:change", event => console.log(event.detail));',
  },
} as const;

const editorTheme = EditorView.theme({
  '&': { backgroundColor: '#142D30', color: '#E1EEEA', fontSize: '13px' },
  '.cm-content': { caretColor: '#C8E7DD', padding: '14px 0' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', lineHeight: '1.75' },
  '.cm-gutters': { backgroundColor: '#142D30', color: '#91B1AB', border: 'none' },
  '.cm-activeLineGutter': { backgroundColor: '#203D40', color: '#D8EAE4' },
  '.cm-activeLine': { backgroundColor: '#203D4055' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: '#32635E' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#C8E7DD' },
  '.cm-matchingBracket': { backgroundColor: '#32635E', outline: '1px solid #8DC5B7' },
}, { dark: true });
const codeColors = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: '#E5BCFA' },
  { tag: [tags.string, tags.attributeValue], color: '#C3E7A9' },
  { tag: [tags.number, tags.bool, tags.null], color: '#FFD28F' },
  { tag: [tags.tagName, tags.typeName, tags.className], color: '#8DE4D1' },
  { tag: tags.attributeName, color: '#A7D8FA' },
  { tag: [tags.variableName, tags.propertyName], color: '#E1EEEA' },
  { tag: [tags.operator, tags.punctuation], color: '#C4D9D4' },
  { tag: tags.comment, color: '#98B8B2', fontStyle: 'italic' },
  { tag: tags.invalid, color: '#FFB6AD', textDecoration: 'underline' },
]));
const arabicEditorPhrases = EditorState.phrases.of({
  Find: 'بحث', Replace: 'استبدال', next: 'التالي', previous: 'السابق', all: 'الكل',
  'match case': 'مطابقة حالة الأحرف', regexp: 'تعبير نمطي', 'by word': 'كلمة كاملة',
  replace: 'استبدال', 'replace all': 'استبدال الكل', close: 'إغلاق',
  'Go to line': 'الانتقال إلى السطر', go: 'انتقل', 'current match': 'النتيجة الحالية',
  'on line': 'في السطر', 'replaced $ matches': 'تم استبدال $ نتائج',
  'replaced match on line $': 'تم استبدال النتيجة في السطر $',
  'Fold line': 'طي السطر', 'Unfold line': 'توسيع السطر', 'folded code': 'شفرة مطوية',
  unfold: 'توسيع', to: 'إلى', Completions: 'اقتراحات الإكمال',
  Diagnostics: 'التشخيصات', 'No diagnostics': 'لا توجد تشخيصات',
  'Control character': 'محرف تحكم', 'Selection deleted': 'حُذف التحديد',
});

function embeddedJSON(value: unknown): string {
  // A user can type closing script tags. They must remain data in the parent-generated document.
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
function inlineScript(value: string): string {
  return value.replace(/<\/script/gi, '<\\/script');
}

/** The bootstrap is serialized into a unique-origin sandbox, never executed in the guide window. */
function previewBootstrap(payload: {
  token: string; run: number; nonce: string; html: string; css: string; js: string;
  native?: boolean; assets: Record<string, string>; tokens: [string, string][]; blocked: string; navigation: string; submitted: string; unsupported: string;
}): void {
  for (const [name, value] of payload.tokens) document.documentElement.style.setProperty(name, value);
  const bridge = (type: string, extra: Record<string, unknown> = {}) => {
    parent.postMessage({ channel: 'nasaq-component-preview', token: payload.token, run: payload.run, type, ...extra }, '*');
  };
  const format = (value: unknown): string => {
    try {
      if (typeof value === 'string') return value.slice(0, 4000);
      if (value instanceof Error) return `${value.name}: ${value.message}`.slice(0, 4000);
      return (JSON.stringify(value) ?? String(value)).slice(0, 4000);
    } catch { return String(value).slice(0, 4000); }
  };
  let errorSeen = false;
  let disposed = false;
  let cleanup: (() => void) | undefined;
  const reportError = (text: string) => {
    errorSeen = true;
    bridge('error', { text: text.slice(0, 4000) });
  };
  window.addEventListener('error', event => {
    reportError(`${event.message}${event.lineno ? ` (${event.lineno}:${event.colno})` : ''}`);
  });
  window.addEventListener('unhandledrejection', event => reportError(format(event.reason)));
  document.addEventListener('securitypolicyviolation', event => {
    reportError(`${payload.blocked} ${event.violatedDirective}`);
  });
  for (const level of ['log', 'info', 'warn', 'error'] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      bridge('console', { level, text: args.map(format).join(' ').slice(0, 4000) });
      original(...args);
    };
  }
  const root = document.getElementById('nasaq-preview-root')!;
  // Markup is deliberately editable. Navigation-capable document elements and
  // HTML scripts are excluded; executable code belongs in the JavaScript file.
  const template = document.createElement('template');
  template.innerHTML = payload.html;
  template.content.querySelectorAll('script, base, meta, iframe, object, embed, link').forEach(node => node.remove());
  template.content.querySelectorAll<HTMLImageElement>('img[src]').forEach(img => {
    const original = img.getAttribute('src') ?? '';
    const filename = original.split(/[?#]/)[0]?.split('/').at(-1) ?? '';
    if (payload.assets[filename]) img.src = payload.assets[filename];
  });
  root.append(template.content);
  const customStyles = document.createElement('style');
  customStyles.textContent = payload.css;
  document.head.append(customStyles);
  document.addEventListener('click', event => {
    const anchor = (event.target as Element | null)?.closest?.('a[href]');
    if (!anchor) return;
    event.preventDefault();
    const href = anchor.getAttribute('href') ?? '';
    if (href.startsWith('#')) {
      const target = document.getElementById(href.slice(1));
      if (target) { target.scrollIntoView({ block: 'nearest' }); return; }
    }
    bridge('console', { level: 'info', text: payload.navigation });
  }, true);
  document.addEventListener('auxclick', event => {
    if ((event.target as Element | null)?.closest?.('a[href]')) event.preventDefault();
  }, true);
  document.addEventListener('submit', event => {
    if ((event.target as HTMLFormElement).method === 'dialog') return;
    event.preventDefault();
    bridge('console', { level: 'info', text: payload.submitted });
  }, true);
  let resizeFrame = 0;
  let lastHeight = 0;
  const reportHeight = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (disposed) return;
      const height = Math.ceil(root.getBoundingClientRect().height + 40);
      if (height !== lastHeight) { lastHeight = height; bridge('height', { height }); }
    });
  };
  const observer = new ResizeObserver(reportHeight);
  observer.observe(root);
  window.addEventListener('pagehide', () => {
    disposed = true; observer.disconnect(); cancelAnimationFrame(resizeFrame);
    try { cleanup?.(); } catch { /* The document is being discarded. */ }
  }, { once: true });
  try {
    const runtime = (window as typeof window & { NasaqVanilla?: { enhance(root: ParentNode): () => void } }).NasaqVanilla;
    if (!payload.native) { if (!runtime?.enhance) throw new Error(payload.unsupported); cleanup = runtime.enhance(root); }
    const script = document.createElement('script');
    script.nonce = payload.nonce;
    script.textContent = `${payload.js}\n//# sourceURL=nasaq-playground.js`;
    document.body.append(script);
    if (!errorSeen) bridge('ready');
  } catch (error) { reportError(format(error)); }
  reportHeight();
}

function previewDocument(options: IDEOptions, content: Record<FileName, string>, token: string, run: number, environment: PreviewEnvironment, project?: {runtime:string;angular?:boolean}): string {
  const labels = copy[options.locale];
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const policy = `default-src 'none'; script-src 'nonce-${nonce}' ${project?.angular ? "'unsafe-eval'" : ''}; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'`;
  // Both policies apply. The first requires a nonce; the second forbids external
  // script URLs even if user code reads and reuses that nonce inside its sandbox.
  const scriptPolicy = "script-src 'unsafe-inline'" + (project?.angular ? " 'unsafe-eval'" : "");
  const payload = {
    ...content, native: !!project, html: content.html, token, run, nonce, assets: previewAssets, tokens: environment.tokens,
    blocked: labels.blocked, navigation: labels.navigation, submitted: labels.submitted, unsupported: labels.unsupported,
  };
  return `<!doctype html><html lang="${options.locale}" dir="${environment.direction}" data-nq-theme="${escapeHTML(environment.theme)}" data-nq-mode="${environment.mode}" data-nq-density="${escapeHTML(environment.density)}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${escapeHTML(policy)}"><meta http-equiv="Content-Security-Policy" content="${escapeHTML(scriptPolicy)}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${previewStyles.replace(/<\/style/gi, '<\\/style')}
html{color-scheme:${environment.mode};background:var(--nq-color-surface,#fff)}body{margin:0;padding:20px;color:var(--nq-color-text,#142d30);font-family:var(--nq-font-sans,system-ui,sans-serif);font-size:16px;line-height:1.65}*,*::before,*::after{box-sizing:border-box}#nasaq-preview-root{display:flow-root;min-inline-size:0}img{max-inline-size:100%}button,input,select,textarea{font:inherit}dialog{max-inline-size:calc(100vw - 24px)}.nq-app-shell{min-block-size:24rem}
</style><title>${escapeHTML(options.title)}</title></head><body><div id="nasaq-preview-root"></div><script nonce="${nonce}">${inlineScript(project?.runtime ?? previewRuntime)}</script><script nonce="${nonce}">(${previewBootstrap.toString()})(${embeddedJSON(payload)});</script></body></html>`;
}

/** Mount one independent HTML/CSS/JS workbench. Cleanup is mandatory on route teardown. */
export function mountComponentIDE(host: HTMLElement, options: IDEOptions): () => void {
  const labels = copy[options.locale];
  const files = defaultFiles.map(file => options.project ? {...file,label:options.project.names[file.id],language: () => file.id==='css' ? cssLanguage() : /\.(tsx?|jsx?)$/.test(options.project!.names[file.id]) ? javascriptLanguage({typescript:/\.tsx?$/.test(options.project!.names[file.id]),jsx:/\.[jt]sx$/.test(options.project!.names[file.id])}) : htmlLanguage()} : file);
  const instance = crypto.randomUUID();
  const token = crypto.randomUUID();
  const initial: Record<FileName, string> = options.project?.initial ?? {
    html: options.html,
    css: `/* ${labels.cssComment} */\n\n`,
    js: `// ${labels.jsComment}\nconst root = document.querySelector('#nasaq-preview-root');\n\n// ${labels.jsEvent}\n`,
  };
  const draft = options.draft ?? initial;
  const root = document.createElement('section');
  root.className = 'nq-ide';
  root.dataset.locale = options.locale;
  root.dir = options.locale === 'ar' ? 'rtl' : 'ltr';
  root.setAttribute('aria-label', `${labels.project}: ${options.title}`);
  root.innerHTML = `<div class="nq-ide-toolbar"><div class="nq-ide-project"><span class="nq-ide-project-icon" aria-hidden="true">${options.project ? frameworkIcon(options.project.framework) : '⌘'}</span><div><strong>${escapeHTML(labels.project)}</strong><small>${escapeHTML(options.title)}</small></div></div><div class="nq-ide-actions"><label class="nq-ide-auto"><input type="checkbox" data-ide-auto checked>${escapeHTML(labels.auto)}</label><button class="nq-ide-button" type="button" data-ide-copy>${escapeHTML(labels.copy)}</button><button class="nq-ide-button" type="button" data-ide-reset>${escapeHTML(labels.reset)}</button><button class="nq-ide-button" type="button" data-primary data-ide-run><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7Z"/></svg> ${escapeHTML(labels.run)}</button></div></div>
    <div class="nq-ide-workspace"><div class="nq-ide-editor-panel"><div class="nq-ide-tabs" role="tablist" aria-label="${escapeHTML(labels.files)}" dir="ltr">${files.map((file, i) => `<button class="nq-ide-tab" type="button" role="tab" id="${instance}-${file.id}-tab" aria-controls="${instance}-${file.id}-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-ide-file="${file.id}"><span class="nq-ide-file-icon" data-language="${file.id}" aria-hidden="true">${/\.tsx?$/.test(file.label) ? frameworkIcon('typescript') : /\.jsx?$/.test(file.label) ? frameworkIcon('javascript') : file.label.endsWith('.vue') ? frameworkIcon('vue') : file.id === 'html' ? '〈〉' : '#'}</span>${file.label}</button>`).join('')}</div><div class="nq-ide-editors">${files.map((file, i) => `<div class="nq-ide-editor" role="tabpanel" id="${instance}-${file.id}-panel" aria-labelledby="${instance}-${file.id}-tab" data-ide-editor="${file.id}" ${i ? 'hidden' : ''}></div>`).join('')}</div></div>
    <div class="nq-ide-preview-panel"><div class="nq-ide-preview-bar"><strong>${escapeHTML(labels.preview)}</strong><label><span class="nq-sr-only">${escapeHTML(labels.width)}</span><select class="nq-ide-preview-size" data-ide-size><option value="desktop">${escapeHTML(labels.desktop)}</option><option value="mobile">${escapeHTML(labels.mobile)}</option></select></label></div><div class="nq-ide-preview-stage" data-size="desktop"></div></div></div>
    <div class="nq-ide-footer"><span class="nq-ide-status" role="status" aria-live="polite" data-state="running">${escapeHTML(labels.running)}</span><button class="nq-ide-console-toggle" type="button" aria-expanded="false" aria-controls="${instance}-console" hidden>${escapeHTML(labels.console)}</button><span class="nq-ide-shortcut">${escapeHTML(labels.shortcut)}</span></div><pre class="nq-ide-console" id="${instance}-console" dir="ltr" tabindex="0" aria-label="${escapeHTML(labels.console)}" hidden></pre><p class="nq-ide-help">${escapeHTML(options.project ? (options.locale==='ar' ? 'ملفات مشروع فعلية. تُجمّع الشفرة محليًا وتعمل في معاينة معزولة؛ لا تُرسل البيانات أو تستورد مكتبات خارجية.' : 'Real project files, compiled locally in an isolated preview. No data is sent and external libraries cannot be imported.') : labels.help)}</p>`;
  host.replaceChildren(root);
  const abort = new AbortController();
  const listen = (target: EventTarget, type: string, listener: EventListener) => target.addEventListener(type, listener, { signal: abort.signal });
  const status = root.querySelector<HTMLElement>('.nq-ide-status')!;
  const auto = root.querySelector<HTMLInputElement>('[data-ide-auto]')!;
  const stage = root.querySelector<HTMLElement>('.nq-ide-preview-stage')!;
  const consoleOutput = root.querySelector<HTMLPreElement>('.nq-ide-console')!;
  const consoleToggle = root.querySelector<HTMLButtonElement>('.nq-ide-console-toggle')!;
  const frame = document.createElement('iframe');
  frame.className = 'nq-ide-frame';
  frame.title = `${labels.preview}: ${options.title}`;
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.referrerPolicy = 'no-referrer';
  const views = new Map<FileName, EditorView>();
  let active: FileName = 'html';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let readyTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let suppressChanges = false;
  let run = 0;
  let runFailed = false;
  let messages: string[] = [];
  const readFiles = (): IDEFiles => Object.fromEntries(files.map(file => [file.id, views.get(file.id)!.state.doc.toString()])) as IDEFiles;
  const setStatus = (state: string, text: string) => { status.dataset.state = state; status.textContent = text; };
  const showConsole = (show: boolean) => { consoleOutput.hidden = !show; consoleToggle.setAttribute('aria-expanded', String(show)); };
  const appendMessage = (level: string, text: string) => {
    messages.push(`[${level}] ${text.slice(0, 4000)}`);
    messages = messages.slice(-40);
    consoleOutput.textContent = messages.join('\n');
    consoleToggle.hidden = false;
    consoleToggle.textContent = `${labels.console} (${messages.length})`;
    if (level === 'error') { runFailed = true; setStatus('error', labels.error); showConsole(true); }
  };
  const runPreview = async () => {
    if (disposed) return;
    clearTimeout(timer); clearTimeout(readyTimer);
    run++;
    const currentRun = run;
    runFailed = false;
    messages = [];
    consoleOutput.textContent = '';
    consoleToggle.hidden = true;
    showConsole(false);
    setStatus('running', labels.running);
    const content = readFiles();
    frame.style.height = '360px';
    const environment: PreviewEnvironment = {
      mode: host.closest('[data-nq-mode]')?.getAttribute('data-nq-mode') === 'dark' ? 'dark' : 'light',
      theme: host.closest('[data-nq-theme]')?.getAttribute('data-nq-theme') || 'nasaq',
      density: host.closest('[data-nq-density]')?.getAttribute('data-nq-density') || 'comfortable',
      direction: document.documentElement.dir === 'rtl' ? 'rtl' : document.documentElement.dir === 'ltr' ? 'ltr' : options.locale === 'ar' ? 'rtl' : 'ltr',
      tokens: Array.from(document.documentElement.style).filter(name => name.startsWith('--nq-')).map(name => [name, document.documentElement.style.getPropertyValue(name)]),
    };
    root.dataset.mode = environment.mode;
    let compiled: Awaited<ReturnType<IDEProject['compile']>> | undefined;
    if(options.project) {
      try { compiled=await options.project.compile(content); }
      catch(error) { if(currentRun===run && !disposed) appendMessage('error',String(error)); return; }
      if(disposed || currentRun!==run)return;
    }
    frame.srcdoc = previewDocument(options, compiled ?? content, token, run, environment, compiled);
    if (!frame.isConnected) stage.append(frame);
    readyTimer = setTimeout(() => {
      if (!disposed && status.dataset.state === 'running') appendMessage('error', labels.unsupported);
    }, 4000);
  };
  const onEdit = () => {
    if (suppressChanges || disposed) return;
    options.onDraftChange?.(readFiles());
    clearTimeout(timer);
    setStatus('edited', labels.edited);
    if (auto.checked) timer = setTimeout(runPreview, 650);
  };
  for (const file of files) {
    const parent = root.querySelector<HTMLElement>(`[data-ide-editor="${file.id}"]`)!;
    views.set(file.id, new EditorView({
      parent, doc: draft[file.id],
      extensions: [basicSetup, file.language(), editorTheme, codeColors, EditorView.lineWrapping,
        options.locale === 'ar' ? arabicEditorPhrases : [],
        EditorView.editorAttributes.of({ lang: options.locale }),
        EditorView.contentAttributes.of({ 'aria-label': `${labels.editor}: ${file.label}`, dir: 'ltr', lang: 'en', spellcheck: 'false' }),
        EditorView.updateListener.of(update => { if (update.docChanged) onEdit(); }),
      ],
    }));
  }
  const activate = (id: FileName, focus = false) => {
    active = id;
    for (const file of files) {
      const tab = root.querySelector<HTMLButtonElement>(`[data-ide-file="${file.id}"]`)!;
      tab.setAttribute('aria-selected', String(file.id === id));
      tab.tabIndex = file.id === id ? 0 : -1;
      root.querySelector<HTMLElement>(`[data-ide-editor="${file.id}"]`)!.hidden = file.id !== id;
      if (focus && file.id === id) tab.focus();
    }
    views.get(id)!.requestMeasure();
  };
  listen(root.querySelector('.nq-ide-tabs')!, 'click', event => {
    const tab = (event.target as Element).closest<HTMLElement>('[data-ide-file]');
    if (tab) activate(tab.dataset.ideFile as FileName);
  });
  listen(root.querySelector('.nq-ide-tabs')!, 'keydown', event => {
    const key = event as KeyboardEvent;
    const index = files.findIndex(file => file.id === active);
    let next = index;
    if (key.key === 'ArrowRight') next = (index + 1) % files.length;
    else if (key.key === 'ArrowLeft') next = (index + files.length - 1) % files.length;
    else if (key.key === 'Home') next = 0;
    else if (key.key === 'End') next = files.length - 1;
    else return;
    event.preventDefault(); activate(files[next]!.id, true);
  });
  listen(root.querySelector('[data-ide-run]')!, 'click', runPreview);
  listen(root.querySelector('[data-ide-reset]')!, 'click', () => {
    suppressChanges = true;
    for (const file of files) {
      const view = views.get(file.id)!;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: initial[file.id] } });
    }
    suppressChanges = false;
    options.onDraftChange?.(readFiles());
    activate('html'); runPreview();
  });
  listen(auto, 'change', () => {
    clearTimeout(timer);
    if (auto.checked) runPreview();
  });
  listen(root.querySelector('[data-ide-copy]')!, 'click', () => {
    navigator.clipboard?.writeText(views.get(active)!.state.doc.toString()).then(() => {
      if (!disposed) setStatus('ready', labels.copied);
    }).catch(() => { if (!disposed) appendMessage('info', labels.copyFailed); });
    if (!navigator.clipboard) appendMessage('info', labels.copyFailed);
  });
  listen(root.querySelector('[data-ide-size]')!, 'change', event => {
    stage.dataset.size = (event.target as HTMLSelectElement).value;
  });
  listen(consoleToggle, 'click', () => showConsole(!!consoleOutput.hidden));
  listen(root, 'keydown', event => {
    const key = event as KeyboardEvent;
    if ((key.ctrlKey || key.metaKey) && key.key === 'Enter') { key.preventDefault(); runPreview(); }
  });
  listen(window, 'message', event => {
    const message = event as MessageEvent<PreviewMessage>;
    if (disposed || message.source !== frame.contentWindow) return;
    const data = message.data;
    if (!data || typeof data !== 'object' || data.channel !== 'nasaq-component-preview' || data.token !== token || data.run !== run) return;
    if (data.type === 'ready') {
      clearTimeout(readyTimer);
      if (!runFailed) setStatus('ready', labels.ready);
    } else if (data.type === 'height' && typeof data.height === 'number' && Number.isFinite(data.height)) {
      frame.style.height = `${Math.max(320, Math.min(1000, data.height))}px`;
    } else if (data.type === 'error' && typeof data.text === 'string') {
      clearTimeout(readyTimer); appendMessage('error', data.text);
    } else if (data.type === 'console' && typeof data.text === 'string') {
      const level = ['log', 'info', 'warn', 'error'].includes(data.level ?? '') ? data.level! : 'log';
      appendMessage(level, data.text);
    }
  });
  runPreview();
  return () => {
    if (disposed) return;
    disposed = true;
    clearTimeout(timer); clearTimeout(readyTimer);
    abort.abort();
    for (const view of views.values()) view.destroy();
    views.clear();
    frame.remove();
    root.remove();
  };
}
