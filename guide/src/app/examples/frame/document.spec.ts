import { describe, expect, it } from 'vitest';
import bootstrapSource from './bootstrap.frame.js' with { loader: 'text' };
import startBundledSource from './start-bundled.frame.js' with { loader: 'text' };
import startModulesSource from './start-modules.frame.js' with { loader: 'text' };
import {
  FRAME_REFERRER_POLICY,
  FRAME_SANDBOX,
  MOUNT_ID,
  bundledDocument,
  embedJson,
  escapeEmbedded,
  frameImportMap,
  framePolicies,
  moduleDataUrl,
  modulesDocument,
  type FrameDocumentInput,
} from './document';
import { frameTexts } from './i18n';
import { ARABIC_SCRIPT } from '../../i18n/text';

const RT = 'http://127.0.0.1:5640/hawiyah/runtime/';
const NONCE = '0123456789abcdef0123456789abcdef';

const base: FrameDocumentInput = {
  framework: 'react',
  lang: 'ar',
  dir: 'rtl',
  mode: 'dark',
  title: frameTexts.ar.frameTitle('React'),
  compiled: {
    host: '<div id="app"></div>',
    entry: 'main.js',
    modules: { 'main.js': "import Example from 'hawiyah-project/Example.js';", 'Example.js': 'export default 1;' },
    classic: '(() => { globalThis.done = true; })();',
  },
  runtimeBase: RT,
  stylesheets: ['npm/@hawiyah/styles@0.3.0/dist/reset.css', 'npm/@hawiyah/styles@0.3.0/dist/styles.css', 'npm/@hawiyah/styles@0.3.0/dist/fonts.css'],
  nonce: NONCE,
  token: 'feedfacefeedfacefeedfacefeedface',
  run: 3,
};

const imports = { vue: `${RT}npm/vue@3.5.44/dist/vue.runtime.esm-browser.prod.js`, '@hawiyah/react': `${RT}npm/@hawiyah/react@0.3.0/dist/index.js`, react: `${RT}bundled/react@19.3.1/react.js` };

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

function policies(doc: Document): string[] {
  return Array.from(doc.querySelectorAll('meta[http-equiv="Content-Security-Policy"]'), (meta) => meta.getAttribute('content') ?? '');
}

describe('frame sandbox', () => {
  it('allows scripts and forms only, with no referrer', () => {
    expect(FRAME_SANDBOX).toBe('allow-scripts allow-forms');
    expect(FRAME_SANDBOX).not.toContain('allow-same-origin');
    expect(FRAME_SANDBOX).not.toContain('allow-popups');
    expect(FRAME_SANDBOX).not.toContain('allow-top-navigation');
    expect(FRAME_REFERRER_POLICY).toBe('no-referrer');
  });
});

describe('Content-Security-Policy', () => {
  it('builds P1 and P2 of a modules run', () => {
    const [p1, p2] = framePolicies({ runtimeBase: RT, nonce: NONCE });
    expect(p1).toBe(
      `default-src 'none'; script-src 'nonce-${NONCE}' ${RT} data:; style-src 'unsafe-inline' ${RT}; img-src data: blob: ${RT}; font-src ${RT}; ` +
        "connect-src 'none'; media-src 'none'; frame-src 'none'; child-src 'none'; worker-src 'none'; object-src 'none'; manifest-src 'none'; base-uri 'none'; form-action 'none'",
    );
    expect(p2).toBe(`script-src 'unsafe-inline' ${RT} data:`);
  });

  it("adds 'unsafe-eval' only for JIT runs and drops data: for the bundled runtime", () => {
    expect(framePolicies({ runtimeBase: RT, nonce: NONCE, jit: true })[0]).toContain(`script-src 'nonce-${NONCE}' ${RT} data: 'unsafe-eval';`);
    expect(framePolicies({ runtimeBase: RT, nonce: NONCE })[0]).not.toContain('unsafe-eval');
    const [p1, p2] = framePolicies({ runtimeBase: RT, nonce: NONCE, bundled: true });
    expect(p1).toContain(`script-src 'nonce-${NONCE}' ${RT};`);
    expect(p2).toBe(`script-src 'unsafe-inline' ${RT}`);
  });

  it('places both policies in the document head before every script', () => {
    const html = modulesDocument({ ...base, imports });
    const doc = parse(html);
    expect(policies(doc)).toEqual(framePolicies({ runtimeBase: RT, nonce: NONCE }));
    const first = html.indexOf('<script');
    expect(html.lastIndexOf('Content-Security-Policy', first)).toBeGreaterThan(0);
    expect(doc.querySelector('meta[name="referrer"]')?.getAttribute('content')).toBe('no-referrer');
  });
});

describe('modulesDocument', () => {
  it('writes the frame title text in the page language into the document title (leadAmendments A10)', () => {
    expect(parse(modulesDocument({ ...base, imports })).title).toBe('النتيجة في React');
    expect(parse(bundledDocument({ ...base, lang: 'en', dir: 'ltr', title: frameTexts.en.frameTitle('Vue') })).title).toBe('Result in Vue');
    const hostile = modulesDocument({ ...base, imports, title: '</title><script>x</script>' });
    expect(parse(hostile).title).toBe('</title><script>x</script>');
    expect(parse(hostile).querySelectorAll('head > title')).toHaveLength(1);
  });

  it('sets language, direction, theme, mode and density on html', () => {
    const doc = parse(modulesDocument({ ...base, imports }));
    const root = doc.documentElement;
    expect([root.lang, root.dir, root.dataset['hwTheme'], root.dataset['hwMode'], root.dataset['hwDensity']]).toEqual(['ar', 'rtl', 'dga', 'dark', 'comfortable']);
    const mount = doc.getElementById('hawiyah-preview-root');
    expect(mount?.children.length).toBe(1);
    expect(mount?.firstElementChild?.id).toBe('app');
    expect(doc.querySelector('style')?.textContent).toContain('color-scheme:dark');
  });

  it('writes the import map in order: runtime entries sorted, then project modules as data: URLs', () => {
    const map = frameImportMap(imports, base.compiled.modules);
    expect(Object.keys(map.imports)).toEqual(['@hawiyah/react', 'react', 'vue', 'hawiyah-project/Example.js', 'hawiyah-project/main.js']);
    expect(map.imports['hawiyah-project/Example.js']).toBe(moduleDataUrl('export default 1;'));
    const doc = parse(modulesDocument({ ...base, imports }));
    const script = doc.querySelector('script[type="importmap"]');
    expect(script?.getAttribute('nonce')).toBe(NONCE);
    expect(JSON.parse(script?.textContent ?? '{}')).toEqual(map);
  });

  it('links the three stylesheets from the runtime and gives every script the nonce', () => {
    const doc = parse(modulesDocument({ ...base, imports }));
    expect(Array.from(doc.querySelectorAll('link[rel="stylesheet"]'), (link) => link.getAttribute('href'))).toEqual(base.stylesheets.map((path) => RT + path));
    const scripts = Array.from(doc.querySelectorAll('script'));
    expect(scripts.length).toBe(2);
    for (const script of scripts) expect(script.getAttribute('nonce')).toBe(NONCE);
  });

  it('sets ngDevMode false for precompiled Angular runs only', () => {
    const angular = modulesDocument({ ...base, framework: 'angular', imports });
    expect(angular).toContain(`<script nonce="${NONCE}">globalThis.ngDevMode=false;</script>`);
    expect(modulesDocument({ ...base, framework: 'angular', jit: true, imports })).not.toContain('ngDevMode');
    expect(modulesDocument({ ...base, imports })).not.toContain('ngDevMode');
  });

  it('calls the bootstrap with the run configuration and the modules start', () => {
    const doc = parse(modulesDocument({ ...base, imports }));
    const text = doc.querySelectorAll('script')[1]?.textContent ?? '';
    expect(text.startsWith('(function hawiyahFrameBootstrap(')).toBe(true);
    expect(text).toContain('"channel":"hawiyah-guide-frame","version":1,"token":"feedfacefeedfacefeedfacefeedface","run":3,"entry":"hawiyah-project/main.js"');
    expect(text).toContain('function hawiyahStartModules(');
    expect(() => new Function(text)).not.toThrow();
  });
});

describe('escaping of user code', () => {
  it('escapes </script, </style, U+2028 and U+2029 in embedded JSON', () => {
    const value = { code: '</script><script>alert(1)</script></style>\u2028\u2029' };
    const text = embedJson(value);
    expect(text).not.toMatch(/<\/script/i);
    expect(text).not.toMatch(/<\/style/i);
    expect(text).not.toContain('\u2028');
    expect(text).not.toContain('\u2029');
    expect(JSON.parse(text)).toEqual(value);
    expect(escapeEmbedded('a</SCRIPT>')).toBe('a\\u003c/SCRIPT>');
  });

  it('keeps hostile module code and classic code inside their script elements', () => {
    const hostile = { ...base.compiled, modules: { 'main.js': 'const s = "</script><p id=injected>";' }, classic: 'const s = "</script><p id=injected2>";' };
    const modules = parse(modulesDocument({ ...base, compiled: hostile, imports }));
    expect(modules.getElementById('injected')).toBeNull();
    expect(modules.querySelectorAll('script').length).toBe(2);
    const bundled = parse(bundledDocument({ ...base, compiled: hostile }));
    expect(bundled.getElementById('injected2')).toBeNull();
    const call = bundled.querySelectorAll('script')[1]?.textContent ?? '';
    expect(call).toContain('\\u003c/script>\\u003cp id=injected2>');
    expect(() => new Function(call)).not.toThrow();
  });

  it('contains no closing script tag in the in-frame sources', () => {
    for (const source of [bootstrapSource, startModulesSource, startBundledSource]) {
      expect(source).not.toMatch(/<\/script|<!--/i);
      expect(() => new Function(`return (${source.trim()});`)).not.toThrow();
    }
  });
});

describe('bundledDocument', () => {
  it('loads the framework bundle with the nonce, then the bootstrap with the classic code, and no import map', () => {
    const doc = parse(bundledDocument({ ...base, framework: 'vue' }));
    expect(doc.querySelector('script[type="importmap"]')).toBeNull();
    const scripts = Array.from(doc.querySelectorAll('script'));
    expect(scripts[0]?.getAttribute('src')).toBe(`${RT}bundles/vue.js`);
    expect(scripts[0]?.getAttribute('nonce')).toBe(NONCE);
    const call = scripts[1]?.textContent ?? '';
    expect(call).toContain('function hawiyahStartBundled(');
    expect(call).toContain('"classic":"(() => { globalThis.done = true; })();"');
    expect(policies(doc)[0]).toContain(`script-src 'nonce-${NONCE}' ${RT};`);
  });
});

describe('frame texts', () => {
  it('have the same keys in both languages and Arabic text in Arabic', () => {
    expect(Object.keys(frameTexts.ar).sort()).toEqual(Object.keys(frameTexts.en).sort());
    expect(frameTexts.en.frameTitle('React')).toBe('Result in React');
    expect(frameTexts.ar.frameTitle('React')).toBe('النتيجة في React');
    for (const key of ['timeout', 'payloadFailed', 'submitBlocked', 'bundledRuntime'] as const) {
      expect(ARABIC_SCRIPT.test(frameTexts.ar[key]), key).toBe(true);
    }
    expect(ARABIC_SCRIPT.test(frameTexts.ar.navigationBlocked.before + frameTexts.ar.navigationBlocked.after)).toBe(true);
  });
});

// The style block the guide writes into a result frame is the frame's document setup,
// never a rule for a package element (README.md, "The styling rule"). Each selector
// and property is written out here with its reason; anything else fails.
const FRAME_STYLE: Record<string, Record<string, string>> = {
  html: {
    'color-scheme': 'the colour mode of the page, so that form controls and scroll bars follow it',
    'background-color': 'the document canvas, as on a page',
    color: 'the document text colour, as on a page (the native result stage sets the same)',
    'font-family': 'the document font family, as on a page (the native result stage sets the same)',
  },
  body: {
    margin: 'the document body without the browser margin',
    padding: 'the space between the frame edge and the result',
  },
  [`#${MOUNT_ID}`]: {
    display: 'the mount root contains the margins of the result (a new block formatting context)',
    'min-inline-size': 'the mount root may shrink below the width of its content',
  },
};

/** Every selector, property and rule of the frame's style block that FRAME_STYLE does not list. */
function frameStyleFindings(html: string): string[] {
  const doc = parse(html);
  const findings: string[] = [];
  const styles = Array.from(doc.querySelectorAll('style'));
  if (styles.length !== 1) findings.push(`${styles.length} style elements`);
  if (doc.querySelector('[style]')) findings.push('a style attribute');
  const seen = new Set<string>();
  for (const style of styles) {
    // A parsed document has no style sheets in jsdom: the text is read through an
    // element of the test document.
    const probe = document.createElement('style');
    probe.textContent = style.textContent;
    document.head.append(probe);
    const rules = Array.from(probe.sheet?.cssRules ?? []);
    probe.remove();
    if (rules.length === 0) findings.push('a style element without rules');
    for (const rule of rules) {
      if (!(rule instanceof CSSStyleRule)) {
        findings.push(`a rule that is not a style rule: ${rule.cssText}`);
        continue;
      }
      const selector = rule.selectorText;
      const listed = FRAME_STYLE[selector];
      if (!listed) {
        findings.push(`selector ${selector}`);
        continue;
      }
      seen.add(selector);
      for (let i = 0; i < rule.style.length; i += 1) {
        // jsdom expands margin into its four sides; they count as the listed shorthand.
        const property = rule.style[i]!.replace(/^(margin|padding)-(top|right|bottom|left)$/, '$1');
        if (!(property in listed)) findings.push(`${selector} { ${property} }`);
      }
    }
  }
  for (const selector of Object.keys(FRAME_STYLE)) if (!seen.has(selector)) findings.push(`no rule for ${selector}`);
  return findings;
}

describe('the style block of a result frame', () => {
  it('styles only the document, the body and the mount root, with the listed properties', () => {
    expect(frameStyleFindings(modulesDocument({ ...base, imports }))).toEqual([]);
    expect(frameStyleFindings(bundledDocument({ ...base, mode: 'light', lang: 'en', dir: 'ltr', title: frameTexts.en.frameTitle('Vue') }))).toEqual([]);
  });

  it('reports a rule for another element, an unlisted property and a media block', () => {
    const html = modulesDocument({ ...base, imports });
    expect(frameStyleFindings(html.replace('</style>', 'button{font-style:italic}</style>'))).toEqual(['selector button']);
    expect(frameStyleFindings(html.replace('body{margin:0;', 'body{margin:0;letter-spacing:1px;'))).toEqual(['body { letter-spacing }']);
    expect(frameStyleFindings(html.replace('</style>', '@media print{html{color:red}}</style>'))).toHaveLength(1);
  });
});
