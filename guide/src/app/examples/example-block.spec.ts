import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CodeBlockIds } from '../content/code-block';
import { ARABIC_SCRIPT } from '../i18n/text';
import { DEFAULT_FRAMEWORK, EDITOR_AVAILABLE, ExampleBlock, editorHref, isFramework } from './example-block';
import type { ExampleSources } from './example-loader';
import { exampleTexts } from './i18n';
import { PageExamples, type ExampleGroup } from './page-examples';
import { EXAMPLE_FRAME_RESULT } from './tokens';

@Component({ selector: 'guide-test-native', template: `<button type="button">Continue</button>` })
class TestNative {}

@Component({ selector: 'guide-test-frame', template: `<p class="frame">{{ framework() }}</p>` })
class TestFrame {
  readonly id = input<string>();
  readonly lang = input<string>();
  readonly example = input<string>();
  readonly framework = input<string>();
  readonly report = input<unknown>();
}

const listing = (fileName: string) => ({ fileName, text: `// ${fileName}\n`, lines: [[{ t: `// ${fileName}`, r: 'comment' as const }]] });
const SOURCES: ExampleSources = {
  vanilla: [listing('index.html'), listing('main.js')],
  react: [listing('Example.tsx')],
  vue: [listing('Example.vue')],
  angular: [listing('example.component.ts')],
};

@Component({
  selector: 'guide-test-host',
  imports: [ExampleBlock],
  providers: [PageExamples, CodeBlockIds],
  template: `<h2 id="example">Example</h2><guide-example-block example="primary" />`,
})
class TestHost {}

async function render(lang: 'ar' | 'en', frame = false) {
  TestBed.configureTestingModule({ providers: frame ? [{ provide: EXAMPLE_FRAME_RESULT, useValue: TestFrame }] : [] });
  const fixture = TestBed.createComponent(TestHost);
  const group: ExampleGroup = { id: 'button', lang, example: 'primary', headingId: 'example', native: TestNative, sources: SOURCES };
  fixture.debugElement.injector.get(PageExamples).set([group]);
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('ExampleBlock', () => {
  it('names the section by its heading and the result area', async () => {
    const { root } = await render('en');
    const section = root.querySelector('section.example');
    expect(section?.getAttribute('aria-labelledby')).toBe('example');
    const result = section?.querySelector('.result');
    expect(result?.getAttribute('role')).toBe('group');
    expect(result?.getAttribute('aria-label')).toBe('Result');
    expect(result?.querySelector('guide-native-result guide-test-native button')?.textContent).toBe('Continue');
    const stage = result?.querySelector('.stage');
    expect(stage?.getAttribute('lang')).toBe('en');
    expect(stage?.getAttribute('dir')).toBe('ltr');
    expect(stage?.getAttribute('data-hw-theme')).toBe('dga');
    expect(stage?.getAttribute('data-hw-mode')).toBe('light');
  });

  it('lists the frameworks in the order JavaScript, React, Vue, Angular, with Angular selected', async () => {
    const { root } = await render('en');
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual(['JavaScript', 'React', 'Vue', 'Angular']);
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false', 'true']);
    expect(DEFAULT_FRAMEWORK).toBe('angular');
    expect(root.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe('Framework');
  });

  it('shows the primary files, main.js for JavaScript, and a download link for each framework', async () => {
    const { root } = await render('en');
    const titles = Array.from(root.querySelectorAll('.hw-code-block-title')).map((title) => title.textContent);
    expect(titles).toEqual(['index.html', 'main.js', 'Example.tsx', 'Example.vue', 'example.component.ts']);
    const downloads = Array.from(root.querySelectorAll('a[download]'));
    expect(downloads.map((link) => link.getAttribute('href'))).toEqual([
      'examples/button/en/primary/vanilla/index.html',
      'examples/button/en/primary/react/Example.tsx',
      'examples/button/en/primary/vue/Example.vue',
      'examples/button/en/primary/angular/example.component.ts',
    ]);
    expect(downloads[0]?.querySelector('.hw-icon')?.getAttribute('data-icon')).toBe('download-01');
  });

  it('writes the status with the package and version left to right', async () => {
    for (const [lang, text] of [
      ['en', 'Rendered with @hawiyah/angular 0.3.0 from npm'],
      ['ar', 'معروض باستخدام @hawiyah/angular 0.3.0 من npm'],
    ] as const) {
      TestBed.resetTestingModule();
      const { root } = await render(lang);
      const status = root.querySelector('p.status');
      expect(status?.getAttribute('role')).toBe('status');
      expect(status?.textContent).toBe(text);
      expect(status?.querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
      expect(status?.querySelector('bdi')?.textContent).toBe('@hawiyah/angular 0.3.0');
    }
  });

  it('has no editor link while the editor feature is absent', async () => {
    const { root } = await render('en');
    expect(EDITOR_AVAILABLE).toBe(false);
    expect(root.querySelector('a[href*="editor"]')).toBeNull();
    expect(editorHref('ar', 'button', 'primary', 'react')).toBe('ar/editor/?example=button%2Fprimary&framework=react');
  });

  it('keeps the Angular result for every tab without a frame provider, and uses the frame with one', async () => {
    const { fixture, root } = await render('en');
    (root.querySelectorAll('[role="tab"]')[1] as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('guide-native-result')).not.toBeNull();
    expect(root.querySelector('p.status')?.textContent).toContain('@hawiyah/angular');

    TestBed.resetTestingModule();
    const framed = await render('en', true);
    (framed.root.querySelectorAll('[role="tab"]')[1] as HTMLElement).click();
    framed.fixture.detectChanges();
    await framed.fixture.whenStable();
    expect(framed.root.querySelector('guide-native-result')).toBeNull();
    expect(framed.root.querySelector('.frame')?.textContent).toBe('react');
    expect(framed.root.querySelector('p.status')?.textContent).toBe('Loading the React result');
  });
});

describe('example helpers and texts', () => {
  it('recognises frameworks', () => {
    expect(isFramework('vue')).toBe(true);
    expect(isFramework('svelte')).toBe(false);
  });

  it('have the same keys in both languages and Arabic text in Arabic', () => {
    expect(Object.keys(exampleTexts.ar).sort()).toEqual(Object.keys(exampleTexts.en).sort());
    for (const key of ['result', 'frameworks', 'download', 'openInEditor', 'bundledRuntime'] as const) {
      expect(ARABIC_SCRIPT.test(exampleTexts.ar[key]), key).toBe(true);
      expect(exampleTexts.en[key].trim()).not.toBe('');
    }
    expect(ARABIC_SCRIPT.test(exampleTexts.ar.loading('React'))).toBe(true);
    expect(ARABIC_SCRIPT.test(exampleTexts.ar.failed('Vue', 'x'))).toBe(true);
    // Framework names stay in Latin script in both languages (allowlisted).
    expect(exampleTexts.ar.frameworkNames).toEqual(exampleTexts.en.frameworkNames);
  });
});
