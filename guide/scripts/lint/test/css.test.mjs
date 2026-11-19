// Unit tests of the CSS rules L-CSS-1 to L-CSS-9 with exact rule ids and lines.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lintCss, lintCssSource } from '../css.mjs';
import { findColours } from '../colours.mjs';

const allowlist = JSON.parse(readFileSync(new URL('../allowlist.json', import.meta.url), 'utf8'));
const lint = (text, file = 'src/app/page.css') => lintCssSource(file, text, allowlist).map((item) => [item.rule, item.line]);
const repoPath = (...segments) => segments.join('/');

describe('L-CSS-1 package classes', () => {
  it('rejects a selector on an hw- class and accepts guide classes', () => {
    expect(lint('.guide-list .hw-button {\n  display: block;\n}\n')).toEqual([['L-CSS-1', 1]]);
    expect(lint('.guide-list .guide-item {\n  display: block;\n}\n')).toEqual([]);
  });

  it('reports the line of a selector in a list', () => {
    expect(lint('.guide-a,\n.hw-card {\n  display: block;\n}\n')).toEqual([['L-CSS-1', 2]]);
  });
});

describe('L-CSS-2 package elements and attributes', () => {
  it('rejects hw- elements, hw class attributes and data-hw attributes', () => {
    expect(lint('hw-card {\n  display: block;\n}\n')).toEqual([['L-CSS-2', 1]]);
    expect(lint("[class*='hw-'] {\n  display: block;\n}\n")).toEqual([['L-CSS-2', 1]]);
    expect(lint('[data-hw] {\n  display: block;\n}\n')).toEqual([['L-CSS-2', 1]]);
    expect(lint("[data-hw-mode='dark'] .guide-brand {\n  display: block;\n}\n")).toEqual([['L-CSS-2', 1]]);
  });

  it('accepts mode, theme and density under :root or :host-context()', () => {
    expect(lint(":root[data-hw-mode='dark'] .guide-brand {\n  display: block;\n}\n")).toEqual([]);
    expect(lint(":host-context([data-hw-density='compact']) {\n  display: block;\n}\n")).toEqual([]);
    expect(lint(":root[data-hw-tabs] {\n  display: block;\n}\n")).toEqual([['L-CSS-2', 1]]);
  });
});

describe('L-CSS-3 raw colours', () => {
  it('rejects hex, colour functions and named colours', () => {
    expect(lint('.a {\n  color: #1b8354;\n}\n')).toEqual([['L-CSS-3', 2]]);
    expect(lint('.a {\n  color: rgb(0 0 0);\n}\n')).toEqual([['L-CSS-3', 2]]);
    expect(lint('.a {\n  color: oklch(0.5 0.1 120);\n}\n')).toEqual([['L-CSS-3', 2]]);
    expect(lint('.a {\n  color: color-mix(in srgb, var(--hw-color-text), transparent);\n}\n')).toEqual([['L-CSS-3', 2]]);
    expect(lint('.a {\n  border: 1px solid red;\n}\n')).toEqual([['L-CSS-3', 2]]);
    expect(lint('.a {\n  --guide-accent: #fff;\n}\n')).toEqual([['L-CSS-3', 2]]);
  });

  it('accepts tokens and the colour keywords', () => {
    expect(lint('.a {\n  color: var(--hw-color-text);\n  background-color: transparent;\n  border-color: currentColor;\n  outline-color: inherit;\n}\n')).toEqual([]);
    expect(lint('.a {\n  color: var(--hw-color-red-500);\n}\n')).toEqual([]);
  });

  it('accepts system colours only inside @media (forced-colors: active)', () => {
    expect(lint('.a {\n  outline-color: CanvasText;\n}\n')).toEqual([['L-CSS-3', 2]]);
    expect(lint('@media (forced-colors: active) {\n  .a {\n    outline-color: CanvasText;\n  }\n}\n')).toEqual([]);
  });

  it('the colour detector finds each kind', () => {
    expect(findColours('#abc rgba(0,0,0,0) navy Highlight var(--hw-color-navy)').map((item) => item.kind)).toEqual(['hex', 'function', 'named', 'system']);
  });
});

describe('L-CSS-4 physical properties and values', () => {
  it('rejects physical properties', () => {
    expect(lint('.a {\n  margin-left: 1rem;\n}\n')).toEqual([['L-CSS-4', 2]]);
    expect(lint('.a {\n  width: 10rem;\n}\n')).toEqual([['L-CSS-4', 2]]);
    expect(lint('.a {\n  top: 0;\n  border-top-left-radius: 2px;\n  overflow-x: auto;\n}\n')).toEqual([['L-CSS-4', 2], ['L-CSS-4', 3], ['L-CSS-4', 4]]);
  });

  it('rejects physical values', () => {
    expect(lint('.a {\n  text-align: left;\n}\n')).toEqual([['L-CSS-4', 2]]);
    expect(lint('.a {\n  float: right;\n}\n')).toEqual([['L-CSS-4', 2]]);
    expect(lint('.a {\n  resize: vertical;\n}\n')).toEqual([['L-CSS-4', 2]]);
    expect(lint('.a {\n  inset: 0 auto;\n}\n')).toEqual([['L-CSS-4', 2]]);
  });

  it('accepts logical properties and width in media conditions', () => {
    expect(lint('@media (min-width: 48rem) {\n  .a {\n    inline-size: 10rem;\n    margin-inline-start: 1rem;\n    text-align: start;\n    inset: 0;\n  }\n}\n')).toEqual([]);
  });
});

describe('L-CSS-5 package custom properties', () => {
  it('rejects declaring --hw- properties except the allowlist', () => {
    expect(lint(':root {\n  --hw-color-primary: var(--hw-color-text);\n}\n')).toEqual([['L-CSS-5', 2]]);
    expect(lint(':host {\n  --hw-side-navigation-top: 4rem;\n  --hw-side-navigation-bottom-reserve: 2rem;\n}\n')).toEqual([]);
  });
});

describe('L-CSS-6 imports', () => {
  it('rejects @import outside src/styles.css', () => {
    expect(lint("@import '@hawiyah/styles/styles.css';\n")).toEqual([['L-CSS-6', 1]]);
  });

  it('accepts the three package stylesheets in order in src/styles.css only', () => {
    const good = "@import '@hawiyah/styles/reset.css';\n@import '@hawiyah/styles/styles.css';\n@import '@hawiyah/styles/fonts.css';\n";
    expect(lint(good, 'src/styles.css')).toEqual([]);
    expect(lint("@import '@hawiyah/styles/fonts.css';\n@import '@hawiyah/styles/styles.css';\n", 'src/styles.css')).toEqual([['L-CSS-6', 2]]);
    const repository = repoPath('..', '..', 'packages', 'styles', 'src', 'styles.css');
    expect(lint(`@import '${repository}';\n`, 'src/styles.css')).toEqual([['L-CSS-6', 1]]);
  });

  it('rejects every node of src/styles.css other than the imports and comments', () => {
    const imports = "/* package bundle */\n@import '@hawiyah/styles/reset.css';\n@import '@hawiyah/styles/styles.css';\n@import '@hawiyah/styles/fonts.css';\n";
    expect(lint(`${imports}td code {\n  display: inline-block;\n}\n`, 'src/styles.css')).toEqual([['L-CSS-6', 5]]);
    expect(lint(`${imports}@media print {\n  main {\n    display: block;\n  }\n}\n`, 'src/styles.css')).toEqual([['L-CSS-6', 5]]);
    expect(lint(`${imports}@layer guide;\n`, 'src/styles.css')).toEqual([['L-CSS-6', 5]]);
    expect(lint('td code {\n  display: inline-block;\n}\n', 'src/guide.css')).toEqual([]);
  });
});

describe('L-CSS-7 fonts and url()', () => {
  it('rejects @font-face and url()', () => {
    expect(lint("@font-face {\n  font-family: 'Guide';\n}\n")).toEqual([['L-CSS-7', 1]]);
    expect(lint(".a {\n  background-image: url('x.png');\n}\n")).toEqual([['L-CSS-7', 2]]);
  });
});

describe('L-CSS-8 piercing selectors', () => {
  it('rejects ::ng-deep, /deep/ and >>>', () => {
    expect(lint(':host ::ng-deep .a {\n  display: block;\n}\n')).toEqual([['L-CSS-8', 1]]);
    expect(lint(':host /deep/ .a {\n  display: block;\n}\n')).toEqual([['L-CSS-8', 1]]);
    expect(lint(':host >>> .a {\n  display: block;\n}\n')).toEqual([['L-CSS-8', 1]]);
  });
});

describe('L-CSS-9 motion', () => {
  it('rejects motion outside the reduced-motion query', () => {
    expect(lint('.a {\n  transition: opacity var(--hw-duration-fast) var(--hw-ease-standard);\n}\n')).toEqual([['L-CSS-9', 2]]);
  });

  it('rejects raw durations and timing functions inside the query', () => {
    const text = '@media (prefers-reduced-motion: no-preference) {\n  .a {\n    transition: opacity 300ms ease;\n    animation-timing-function: cubic-bezier(0, 0, 1, 1);\n  }\n}\n';
    expect(lint(text)).toEqual([['L-CSS-9', 3], ['L-CSS-9', 4]]);
  });

  it('accepts token durations and easings, and calc() of them, inside the query', () => {
    const text = '@media (prefers-reduced-motion: no-preference) {\n  .a {\n    transition: opacity var(--hw-duration-fast) var(--hw-ease-standard);\n    animation-duration: calc(var(--hw-duration-slow) * 2);\n    animation-name: guide-settle;\n  }\n}\n';
    expect(lint(text)).toEqual([]);
  });
});

describe('lintCss over a tree', () => {
  it('lints the good CSS fixture without findings', () => {
    const root = new URL('./fixtures/good/css/', import.meta.url).pathname;
    const result = lintCss(root, allowlist);
    expect(result.files).toBe(3);
    expect(result.findings).toEqual([]);
  });
});
