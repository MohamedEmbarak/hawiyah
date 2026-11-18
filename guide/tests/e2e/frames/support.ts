import type { Frame, Page, Route } from '@playwright/test';
// @ts-expect-error: plain ES module of the build scripts, without type declarations.
import { classicBundle } from '../../../scripts/examples/classic.mjs';
import { expect, hydrated } from '../support/fixtures';

export type FrameFramework = 'vanilla' | 'react' | 'vue';
export const FRAME_FRAMEWORKS: readonly FrameFramework[] = ['vanilla', 'react', 'vue'];
export const FRAMEWORK_NAMES = { vanilla: 'JavaScript', react: 'React', vue: 'Vue', angular: 'Angular' } as const;
export const FRAMEWORK_PACKAGES = { vanilla: '@hawiyah/vanilla', react: '@hawiyah/react', vue: '@hawiyah/vue' } as const;

/** The brief page of the Button pilot: one example block (group 'primary'). */
export const briefPath = (lang: 'ar' | 'en') => `${lang}/components/button/`;
export const PILOT_GROUP = 'primary';

export interface Compiled {
  host: string;
  entry: 'main.js';
  modules: Record<string, string>;
  classic: string;
  imports: string[];
}

/**
 * Requests that reach the network from the page and every frame of its context,
 * recorded through context routing (which also sees a sandboxed frame running in
 * its own process). A request the frame's policy blocks never gets here.
 * Routes a test registers on the page take precedence and are not recorded.
 */
export async function recordRequests(page: Page): Promise<string[]> {
  const urls: string[] = [];
  await page.context().route(/.*/, (route) => {
    urls.push(route.request().url());
    return route.fallback();
  });
  return urls;
}

/** Requests outside the guide's own origin (data: and about: documents are not requests to a host). */
export function outside(urls: readonly string[], origin: string): string[] {
  return urls.filter((url) => !url.startsWith(`${origin}/`) && !url.startsWith('data:') && !url.startsWith('about:'));
}

/**
 * URLs the frame document loaded, from its resource timing entries. A sandboxed
 * frame with an opaque origin may run in its own process, where page request events
 * can start late; the frame's own list is complete.
 */
export async function frameResources(frame: Frame): Promise<string[]> {
  return frame.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name));
}

export function originOf(page: Page): string {
  return new URL(page.url()).origin;
}

/** Opens a page, waits for hydration and selects a framework tab of the first example block. */
export async function selectFramework(page: Page, path: string, framework: FrameFramework | 'angular'): Promise<void> {
  await page.goto(path);
  await hydrated(page);
  const block = page.locator('guide-example-block').first();
  await block.getByRole('tab', { name: FRAMEWORK_NAMES[framework], exact: true }).click();
}

export function statusOf(page: Page) {
  return page.locator('guide-example-block p.status').first();
}

export function frameElement(page: Page) {
  return page.locator('guide-example-block').first().locator('guide-frame-result iframe');
}

/** The frame of the first example block once it reported ready. */
export async function readyFrame(page: Page, framework: FrameFramework, lang: 'ar' | 'en' = 'en', bundled = false): Promise<Frame> {
  const pkg = FRAMEWORK_PACKAGES[framework];
  const sentence = lang === 'en' ? `Rendered with ${pkg} 0.3.0 from npm${bundled ? ' Bundled runtime.' : ''}` : `معروض باستخدام ${pkg} 0.3.0 من npm${bundled ? ' بالحزمة المجمّعة.' : ''}`;
  await expect(statusOf(page)).toHaveText(sentence, { timeout: 30_000 });
  const handle = await frameElement(page).elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error('no frame');
  return frame;
}

/** Text of the frame mount with whitespace collapsed (result comparison). */
export async function mountMarkup(frame: Frame): Promise<string> {
  return frame.evaluate(() => {
    const mount = document.getElementById('hawiyah-preview-root');
    const clone = mount?.cloneNode(true) as HTMLElement | undefined;
    // React and Vue generate ids per render; compare structure, roles and text.
    clone?.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    clone?.querySelectorAll('[aria-controls],[aria-labelledby]').forEach((node) => {
      node.removeAttribute('aria-controls');
      node.removeAttribute('aria-labelledby');
    });
    return (clone?.outerHTML ?? '').replace(/\s+/g, ' ');
  });
}

/** Builds a payload with a classic form, as step 25 does, from compiled modules. */
export async function payload(framework: FrameFramework | 'angular', lang: 'ar' | 'en', compiled: Omit<Compiled, 'classic'>): Promise<Record<string, unknown>> {
  const classic = (await classicBundle({ entry: compiled.entry, modules: compiled.modules })) as string;
  return {
    id: 'button',
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    example: PILOT_GROUP,
    framework,
    files: { fixture: '' },
    primaryFile: 'fixture',
    compiled: { ...compiled, classic },
    toolchain: { typescript: '', esbuild: '', vue: '', angular: '' },
  };
}

/** Serves `body` instead of the pilot payload of a framework. */
export async function routePayload(page: Page, lang: 'ar' | 'en', framework: FrameFramework, body: Record<string, unknown>): Promise<void> {
  await page.route(`**/examples/button/${lang}/${PILOT_GROUP}/${framework}.json`, (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(body) }),
  );
}

const TABS_TEXT = {
  en: { label: 'Application sections', one: 'Summary', two: 'Documents', p1: 'The summary of the application.', p2: 'The documents of the application.' },
  ar: { label: 'أقسام الطلب', one: 'الملخص', two: 'المستندات', p1: 'ملخص الطلب.', p2: 'مستندات الطلب.' },
};

/**
 * A Tabs group compiled by hand for the three frame frameworks: the first live
 * group with behaviour in a frame. Behaviour is checked by selecting the second tab.
 */
export async function tabsFixture(framework: FrameFramework, lang: 'ar' | 'en'): Promise<Record<string, unknown>> {
  const t = TABS_TEXT[lang];
  const items = JSON.stringify([
    { value: 'summary', label: t.one, content: t.p1 },
    { value: 'documents', label: t.two, content: t.p2 },
  ]);
  if (framework === 'vanilla') {
    return payload('vanilla', lang, {
      host:
        `<div id="app"><div class="hw-tabs"><div role="tablist" aria-label="${t.label}">` +
        `<button type="button" role="tab" id="fx-tab-1" aria-controls="fx-panel-1" aria-selected="true">${t.one}</button>` +
        `<button type="button" role="tab" id="fx-tab-2" aria-controls="fx-panel-2" aria-selected="false">${t.two}</button></div>` +
        `<div id="fx-panel-1">${t.p1}</div><div id="fx-panel-2" hidden>${t.p2}</div></div></div>`,
      entry: 'main.js',
      modules: { 'main.js': "import { createTabs } from '@hawiyah/vanilla';\ncreateTabs(document.querySelector('.hw-tabs'), { overflow: 'scroll' });\n" },
      imports: ['@hawiyah/vanilla'],
    });
  }
  if (framework === 'react') {
    return payload('react', lang, {
      host: '<div id="app"></div>',
      entry: 'main.js',
      modules: {
        'main.js':
          "import { jsx } from 'react/jsx-runtime';\nimport { createRoot } from 'react-dom/client';\nimport Example from 'hawiyah-project/Example.js';\n" +
          "createRoot(document.getElementById('app')).render(jsx(Example, {}));\n",
        'Example.js':
          "import { jsx } from 'react/jsx-runtime';\nimport { Tabs } from '@hawiyah/react';\n" +
          `export default function Example() { return jsx(Tabs, { label: ${JSON.stringify(t.label)}, overflow: 'scroll', items: ${items} }); }\n`,
      },
      imports: ['@hawiyah/react', 'react-dom/client', 'react/jsx-runtime'],
    });
  }
  return payload('vue', lang, {
    host: '<div id="app"></div>',
    entry: 'main.js',
    modules: {
      'main.js': "import { createApp } from 'vue';\nimport Example from 'hawiyah-project/Example.js';\ncreateApp(Example).mount('#app');\n",
      'Example.js':
        "import { defineComponent, h } from 'vue';\nimport { Tabs } from '@hawiyah/vue';\n" +
        `export default defineComponent({ setup() { return () => h(Tabs, { label: ${JSON.stringify(t.label)}, overflow: 'scroll', items: ${items} }); } });\n`,
    },
    imports: ['@hawiyah/vue', 'vue'],
  });
}

export const tabsText = TABS_TEXT;
