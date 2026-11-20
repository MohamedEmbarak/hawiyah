import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LocaleService } from '../core/locale';
import { PageExamples } from '../examples/page-examples';
import { BlocksContent } from './blocks';
import { CodeBlockIds, trimTrailingLines } from './code-block';
import { inlineText } from './inline';
import type { Block } from './model';

@Component({ selector: 'guide-test-native', template: `<button type="button">Native</button>` })
class TestNative {}

@Component({
  selector: 'guide-test-host',
  imports: [BlocksContent],
  providers: [PageExamples, CodeBlockIds],
  template: `<article class="hw-prose"><guide-blocks [blocks]="blocks()" /></article>`,
})
class TestHost {
  readonly blocks = input.required<readonly Block[]>();
}

const BLOCKS: readonly Block[] = [
  { type: 'heading', level: 3, id: 'screen-readers', children: [{ type: 'text', value: 'Screen readers' }] },
  { type: 'heading', level: 4, id: 'announcements', children: [{ type: 'text', value: 'Announcements' }] },
  {
    type: 'paragraph',
    children: [
      { type: 'text', value: 'Plain <b>not markup</b> ' },
      { type: 'emphasis', children: [{ type: 'text', value: 'once' }] },
      { type: 'strong', children: [{ type: 'text', value: 'button' }] },
      { type: 'inlineCode', value: 'hwButton' },
      { type: 'break' },
      { type: 'link', href: 'en/components/button/reference/#api', internal: true, external: false, children: [{ type: 'text', value: 'API' }] },
      { type: 'link', href: 'https://github.com/MohamedEmbarak/hawiyah', internal: false, external: true, children: [{ type: 'text', value: 'GitHub' }] },
    ],
  },
  { type: 'list', ordered: true, start: 3, items: [[{ type: 'paragraph', children: [{ type: 'text', value: 'Third' }] }]] },
  { type: 'list', ordered: false, start: null, items: [[{ type: 'paragraph', children: [{ type: 'text', value: 'Item' }] }]] },
  { type: 'blockquote', blocks: [{ type: 'paragraph', children: [{ type: 'text', value: 'Quoted' }] }] },
  { type: 'alert', kind: 'warning', blocks: [{ type: 'paragraph', children: [{ type: 'text', value: 'Careful' }] }] },
  {
    type: 'table',
    caption: 'Keyboard',
    columns: [
      { key: 'c0', label: [{ type: 'text', value: 'Key' }], align: 'start' },
      { key: 'c1', label: [{ type: 'text', value: 'Action' }], align: 'end' },
    ],
    rows: [{ c0: [{ type: 'inlineCode', value: 'Enter' }], c1: [{ type: 'text', value: 'Activates' }] }],
  },
  {
    type: 'table',
    caption: 'Keyboard interaction of Tabs',
    keyboard: true,
    columns: [
      { key: 'c0', label: [{ type: 'text', value: 'Key' }], align: null },
      { key: 'c1', label: [{ type: 'text', value: 'Action' }], align: null },
    ],
    rows: [
      {
        c0: [{ type: 'kbd', value: 'Shift', latin: true }, { type: 'text', value: ' + ' }, { type: 'kbd', value: 'Tab', latin: true }],
        c1: [{ type: 'text', value: 'Moves focus back.' }],
      },
      { c0: [{ type: 'kbd', value: 'السهم الأيسر', latin: false }], c1: [{ type: 'text', value: 'ينقل التركيز.' }] },
    ],
  },
  { type: 'code', lang: 'ts', title: 'setup.ts', text: 'const a = 1;\n', lines: [[{ t: 'const', r: 'keyword' }, { t: ' a ' }, { t: '=', r: 'punctuation' }, { t: ' 1;' }], []] },
  { type: 'code', lang: null, title: null, text: 'plain', lines: [[{ t: 'plain' }]] },
  {
    type: 'code',
    lang: 'tsx',
    title: 'Tabs.tsx',
    text: "['حساب', 'طلب']\n",
    lines: [[{ t: '[', r: 'punctuation' }, { t: "'حساب'", r: 'string' }, { t: ',', r: 'punctuation' }, { t: ' ' }, { t: "'طلب'", r: 'string' }, { t: ']', r: 'punctuation' }], [{ t: '<' }, { t: 'متابعة' }]],
  },
  { type: 'live', example: 'primary' },
  { type: 'thematicBreak' },
];

describe('BlocksContent', () => {
  let root: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    TestBed.inject(LocaleService).lang.set('en');
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentRef.setInput('blocks', BLOCKS);
    const examples = fixture.debugElement.injector.get(PageExamples);
    examples.set([{ id: 'button', lang: 'en', example: 'primary', headingId: 'example', native: TestNative, sources: null }]);
    fixture.detectChanges();
    await fixture.whenStable();
    root = fixture.nativeElement as HTMLElement;
  });

  it('renders h3 and h4 with their ids and tabindex -1, without a class', () => {
    for (const [selector, id] of [['h3', 'screen-readers'], ['h4', 'announcements']] as const) {
      const heading = root.querySelector(selector);
      expect(heading?.id).toBe(id);
      expect(heading?.getAttribute('tabindex')).toBe('-1');
      expect(heading?.hasAttribute('class')).toBe(false);
    }
  });

  it('renders inline nodes as elements and text as text, never as markup', () => {
    const paragraph = root.querySelector('p');
    expect(paragraph?.querySelector('b')).toBeNull();
    expect(paragraph?.textContent).toContain('Plain <b>not markup</b>');
    expect(paragraph?.querySelector('em')?.textContent).toBe('once');
    expect(paragraph?.querySelector('strong')?.textContent).toBe('button');
    expect(paragraph?.querySelector('code.hw-code')?.textContent).toBe('hwButton');
    // Inline code is the published chip alone (no guide class), a left-to-right isolate through dir.
    expect(paragraph?.querySelector('code.hw-code')?.className).toBe('hw-code');
    expect(paragraph?.querySelector('code.hw-code')?.getAttribute('dir')).toBe('ltr');
    expect(paragraph?.querySelector('br')).not.toBeNull();
    const [internal, external] = Array.from(paragraph?.querySelectorAll('a') ?? []);
    expect(internal?.getAttribute('href')).toBe('en/components/button/reference/#api');
    expect(internal?.hasAttribute('target')).toBe(false);
    expect(external?.getAttribute('target')).toBe('_blank');
    expect(external?.getAttribute('rel')).toContain('noopener');
    expect(external?.querySelector('.hw-sr-only')?.textContent).toContain('opens in a new tab');
  });

  it('renders lists, quotations and rules as class-less prose elements', () => {
    expect(root.querySelector('ol')?.getAttribute('start')).toBe('3');
    expect(root.querySelector('ul li p')?.textContent).toBe('Item');
    expect(root.querySelector('blockquote p')?.textContent).toBe('Quoted');
    expect(root.querySelector('hr')).not.toBeNull();
  });

  it('renders an alert as hw-alert with role note, its tone and its title', () => {
    const alert = root.querySelector('hw-alert');
    expect(alert?.getAttribute('role')).toBe('note');
    expect(alert?.getAttribute('data-tone') ?? alert?.className).toMatch(/warning/);
    expect(alert?.textContent).toContain('Warning');
    expect(alert?.textContent).toContain('Careful');
  });

  it('renders a table with its caption and inline cells', () => {
    const table = root.querySelector('table');
    expect(table?.querySelector('caption')?.textContent?.trim()).toBe('Keyboard');
    expect(Array.from(table?.querySelectorAll('th') ?? []).map((th) => th.textContent?.trim())).toEqual(['Key', 'Action']);
    expect(table?.querySelector('td code.hw-code')?.textContent).toBe('Enter');
    expect(table?.querySelector('td code.hw-code')?.className).toBe('hw-code');
    expect(table?.querySelector('td .align-end')?.textContent).toBe('Activates');
  });

  it('renders a key element as kbd with exactly the package class hw-kbd, a Latin key name left to right and untranslated (5a.7)', () => {
    const keys = Array.from(root.querySelectorAll('kbd'));
    expect(keys.map((kbd) => kbd.textContent)).toEqual(['Shift', 'Tab', 'السهم الأيسر']);
    expect(keys.map((kbd) => kbd.className)).toEqual(['hw-kbd', 'hw-kbd', 'hw-kbd']);
    expect(keys.map((kbd) => [kbd.getAttribute('dir'), kbd.getAttribute('translate')])).toEqual([['ltr', 'no'], ['ltr', 'no'], [null, null]]);
    // Nothing of the guide's own styling: no other attribute, no wrapper.
    expect(keys.map((kbd) => kbd.getAttributeNames().filter((name) => !name.startsWith('_ng')).sort())).toEqual([['class', 'dir', 'translate'], ['class', 'dir', 'translate'], ['class']]);
    expect(keys[0]?.parentElement?.localName).toBe('guide-inline');
    expect(keys[0]?.closest('td')?.textContent).toBe('Shift + Tab');
  });

  it('gives every inline code element exactly the class hw-code (the published chip, no guide class)', () => {
    const inline = Array.from(root.querySelectorAll('code')).filter((code) => !code.closest('pre'));
    expect(inline.length).toBeGreaterThanOrEqual(2);
    expect(inline.map((code) => code.className)).toEqual(inline.map(() => 'hw-code'));
  });

  it('renders every code block as a named, focusable group with a class; no class-less pre', () => {
    const pres = Array.from(root.querySelectorAll('pre'));
    expect(pres.length).toBeGreaterThanOrEqual(2);
    for (const pre of pres) {
      expect(pre.className).toContain('hw-code-block-content');
      expect(pre.getAttribute('tabindex')).toBe('0');
      expect(pre.getAttribute('role')).toBe('group');
      const title = root.querySelector(`#${pre.getAttribute('aria-labelledby') ?? 'missing'}`);
      expect(title?.textContent?.trim()).not.toBe('');
    }
    expect(root.querySelectorAll('pre:not([class])')).toHaveLength(0);
    const titles = Array.from(root.querySelectorAll('.hw-code-block-title')).map((title) => title.textContent);
    expect(titles).toContain('setup.ts');
    expect(titles).toContain('Code listing');
    const ids = Array.from(root.querySelectorAll('.hw-code-block-title')).map((title) => title.id);
    expect(new Set(ids).size).toBe(ids.length);
    const first = pres[0];
    expect(first?.querySelector('.hw-code-token-keyword')?.textContent).toBe('const');
    expect(first?.textContent).toBe('const a = 1;\n');
  });

  it('wraps every run that is not white space in a span: a package token span or a guide span of the class run', () => {
    const pre = Array.from(root.querySelectorAll('pre')).find((item) => item.textContent?.includes('حساب'));
    expect(pre?.getAttribute('dir')).toBe('ltr');
    const runs = Array.from(pre?.querySelectorAll('code > span') ?? []);
    expect(runs.map((span) => span.textContent)).toEqual(['[', "'حساب'", ',', "'طلب'", ']', '<', 'متابعة']);
    // A token span carries exactly its package class (the package isolates it); a plain
    // run carries exactly the guide class run (code-block.css isolates it).
    expect(runs.map((span) => span.className)).toEqual([
      'hw-code-token-punctuation',
      'hw-code-token-string',
      'hw-code-token-punctuation',
      'hw-code-token-string',
      'hw-code-token-punctuation',
      'run',
      'run',
    ]);
    expect(pre?.textContent).toBe("['حساب', 'طلب']\n<متابعة\n");
  });

  it('renders a live block as the page block of its group', () => {
    const block = root.querySelector('guide-example-block section.example');
    expect(block?.getAttribute('aria-labelledby')).toBe('example');
    expect(block?.querySelector('guide-test-native button')?.textContent).toBe('Native');
  });
});

describe('content helpers', () => {
  it('inlineText flattens inline content', () => {
    expect(inlineText([{ type: 'text', value: 'A ' }, { type: 'strong', children: [{ type: 'inlineCode', value: 'b' }] }, { type: 'break' }])).toBe('A b ');
    expect(inlineText([{ type: 'kbd', value: 'Shift', latin: true }, { type: 'text', value: ' + ' }, { type: 'kbd', value: 'Tab', latin: true }])).toBe('Shift + Tab');
  });

  it('trimTrailingLines drops empty lines at the end only', () => {
    expect(trimTrailingLines([[{ t: 'a' }], [], [{ t: 'b' }], [], []])).toEqual([[{ t: 'a' }], [], [{ t: 'b' }]]);
  });
});
