// Unit tests of the template rules L-TPL-1 to L-TPL-6 with exact rule ids and lines.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lintTemplates, lintTemplateSource } from '../templates.mjs';

const allowlist = JSON.parse(readFileSync(new URL('../allowlist.json', import.meta.url), 'utf8'));
const lint = (text, file = 'src/app/page.html') => lintTemplateSource(file, text, allowlist).map((item) => [item.rule, item.line]);
const component = (template, extra = '') => `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'guide-page',\n  template: \`${template}\`,\n${extra}})\nexport class Page {}\n`;

describe('L-TPL-1 package classes', () => {
  it('rejects hw- classes outside the allowlist in attributes and bindings', () => {
    expect(lint('<div class="hw-button">x</div>\n')).toEqual([['L-TPL-1', 1]]);
    expect(lint('<p>\n  <span [class.hw-card]="on">x</span>\n</p>\n')).toEqual([['L-TPL-1', 2]]);
    expect(lint('<span [ngClass]="{ \'hw-badge\': on }">x</span>\n')).toEqual([['L-TPL-1', 1]]);
    expect(lint('<span [class]="on ? \'hw-tag\' : \'\'">x</span>\n')).toEqual([['L-TPL-1', 1]]);
  });

  it('accepts the allowlisted classes', () => {
    expect(lint('<article class="hw-prose guide-page"><pre class="hw-code-block"><code class="hw-code"><span class="hw-code-token-string">x</span></code></pre><span class="hw-sr-only">x</span></article>\n')).toEqual([]);
  });

  it('maps lines of an inline template to the file', () => {
    expect(lint(component('\n    <p class="hw-card">x</p>\n  '), 'src/app/page.ts')).toEqual([['L-TPL-1', 6]]);
  });
});

describe('L-TPL-2 styles', () => {
  it('rejects style attributes and style bindings', () => {
    expect(lint('<p style="color: var(--hw-color-text)">x</p>\n')).toEqual([['L-TPL-2', 1]]);
    expect(lint('<p [style.inline-size.px]="size">x</p>\n')).toEqual([['L-TPL-2', 1]]);
    expect(lint('<p [ngStyle]="styles">x</p>\n')).toEqual([['L-TPL-2', 1]]);
    expect(lint('<p [style]="styles">x</p>\n')).toEqual([['L-TPL-2', 1]]);
  });
});

describe('L-TPL-3 vanilla hooks', () => {
  it('rejects data-hw attributes except theme, mode and density', () => {
    expect(lint('<div data-hw="tabs"></div>\n')).toEqual([['L-TPL-3', 1]]);
    expect(lint('<div [attr.data-hw-tabs]="x"></div>\n')).toEqual([['L-TPL-3', 1]]);
    expect(lint('<div data-hw-theme="dga" data-hw-mode="light" data-hw-density="comfortable"></div>\n')).toEqual([]);
  });
});

describe('L-TPL-4 HTML bindings', () => {
  it('rejects innerHTML, outerHTML and srcdoc bindings', () => {
    expect(lint('<div [innerHTML]="html"></div>\n')).toEqual([['L-TPL-4', 1]]);
    expect(lint('<div [outerHTML]="html"></div>\n')).toEqual([['L-TPL-4', 1]]);
    expect(lint('<iframe [srcdoc]="html" title="x"></iframe>\n')).toEqual([['L-TPL-4', 1]]);
  });

  it('accepts srcdoc in the preview frame only', () => {
    expect(lint(component('<iframe [srcdoc]="html" title="x"></iframe>'), 'src/app/examples/frame/preview-frame.ts')).toEqual([]);
  });
});

describe('L-TPL-5 hydration opt-out', () => {
  it('rejects ngSkipHydration attributes and host bindings', () => {
    expect(lint('<section ngSkipHydration></section>\n')).toEqual([['L-TPL-5', 1]]);
    expect(lint(component('<p>x</p>', "  host: { ngSkipHydration: 'true' },\n"), 'src/app/page.ts')).toEqual([['L-TPL-5', 6]]);
  });
});

describe('L-TPL-6 scripts and event attributes', () => {
  it('rejects <script> and on* attributes', () => {
    expect(lint('<button type="button" onclick="go()">x</button>\n<script>go();</script>\n')).toEqual([['L-TPL-6', 1], ['L-TPL-6', 2]]);
  });

  it('accepts Angular event bindings', () => {
    expect(lint('<button type="button" (click)="go()">x</button>\n')).toEqual([]);
  });
});

describe('control flow and trees', () => {
  it('checks nodes inside @if, @for and @switch blocks', () => {
    const text = '@if (a) {\n  <p class="hw-card">x</p>\n} @else {\n  @for (item of items; track item) {\n    <i style="x"></i>\n  }\n}\n';
    expect(lint(text)).toEqual([['L-TPL-1', 2], ['L-TPL-2', 5]]);
  });

  it('lints the good template fixture without findings', () => {
    const root = new URL('./fixtures/good/templates/', import.meta.url).pathname;
    const result = lintTemplates(root, allowlist);
    expect(result.files).toBe(2);
    expect(result.findings).toEqual([]);
  });
});
