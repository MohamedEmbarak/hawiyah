import { describe, expect, it } from 'vitest';
import {
  FRAME_SELECTOR, detectForm, nativeClassName, wrapAngular, wrapReact, wrapVanilla, wrapVue,
} from '../wrap.mjs';
import { guideDir } from './helpers.mjs';

describe('detectForm', () => {
  it('recognises module forms per framework', () => {
    expect(detectForm('react', '<Button>Go</Button>')).toBe('fragment');
    expect(detectForm('react', 'export default function Example() { return null; }')).toBe('module');
    expect(detectForm('vue', '<Button>Go</Button>')).toBe('fragment');
    expect(detectForm('vue', '<Tabs>\n  <template #one>x</template>\n</Tabs>')).toBe('fragment');
    expect(detectForm('vue', '<script setup lang="ts"></script>\n<template>\n  <p>x</p>\n</template>')).toBe('module');
    expect(detectForm('angular', 'template: `<p>x</p>`')).toBe('fragment');
    expect(detectForm('angular', "@Component({ template: '' })\nexport class A {}")).toBe('module');
    expect(detectForm('vanilla', '<template><p></p></template>')).toBe('fragment');
  });
});

describe('wrapVanilla', () => {
  it('keeps the fragment as index.html and adds the enhance entry', () => {
    const wrapped = wrapVanilla('\n<p class="hw-type">Text</p>\n');
    expect(wrapped.primaryFile).toBe('index.html');
    expect(Object.keys(wrapped.files)).toEqual(['index.html', 'main.js']);
    expect(wrapped.files['index.html']).toBe('<p class="hw-type">Text</p>\n');
    expect(wrapped.files['main.js']).toContain("enhance(document.getElementById('app'))");
    expect(wrapped.lineOffset).toBe(-1);
  });
});

describe('wrapReact', () => {
  it('wraps a fragment with exactly the components it uses', () => {
    const wrapped = wrapReact('<Inline>\n  <Button variant="primary">Go</Button>\n</Inline>', guideDir);
    expect(wrapped.form).toBe('fragment');
    expect(wrapped.imports).toEqual(['Button', 'Inline']);
    expect(wrapped.source).toMatch(/^import \{ Button, Inline \} from '@hawiyah\/react';\n\nexport default function Example\(\) \{\n  return \(\n    <>\n      <Inline>/);
    const lines = wrapped.source.split('\n');
    expect(lines[1 + wrapped.lineOffset]).toContain('<Button variant="primary">');
  });

  it('reports a capitalised tag that the package does not export', () => {
    const wrapped = wrapReact('<Inline>\n  <Buton>Go</Buton>\n</Inline>', guideDir);
    expect(wrapped.unknown).toEqual([{ name: 'Buton', line: 2 }]);
    expect(wrapped.imports).toEqual(['Inline']);
  });

  it('uses a module form as written', () => {
    const code = "import { Button } from '@hawiyah/react';\n\nexport default function Example() {\n  return <Button>Go</Button>;\n}";
    const wrapped = wrapReact(code, guideDir);
    expect(wrapped.form).toBe('module');
    expect(wrapped.source).toBe(`${code}\n`);
    expect(wrapped.lineOffset).toBe(0);
  });
});

describe('wrapVue', () => {
  it('wraps a fragment in a script setup SFC with automatic imports', () => {
    const wrapped = wrapVue('<Button variant="primary">Go</Button>', guideDir);
    expect(wrapped.source).toBe("<script setup lang=\"ts\">\nimport { Button } from '@hawiyah/vue';\n</script>\n\n<template>\n  <Button variant=\"primary\">Go</Button>\n</template>\n");
    expect(wrapped.source.split('\n')[wrapped.lineOffset]).toContain('<Button');
  });

  it('reports an unknown component with its block line', () => {
    const wrapped = wrapVue('<Inline>\n  <Buton>Go</Buton>\n</Inline>', guideDir);
    expect(wrapped.unknown).toEqual([{ name: 'Buton', line: 2 }]);
  });
});

describe('wrapAngular', () => {
  it('imports exactly the matched standalone classes of a fragment', () => {
    const wrapped = wrapAngular('template: `\n  <hw-inline>\n    <button hwButton variant="primary">Go</button>\n  </hw-inline>\n`', guideDir);
    expect(wrapped.form).toBe('fragment');
    expect(wrapped.imports).toEqual(['HwButtonDirective', 'HwInlineComponent']);
    expect(wrapped.source).toContain(`selector: '${FRAME_SELECTOR}'`);
    expect(wrapped.source).toContain('imports: [HwButtonDirective, HwInlineComponent],');
    expect(wrapped.source).toMatch(/export class Example \{\}\n$/);
    expect(wrapped.source.split('\n')[2 + wrapped.lineOffset]).toContain('<button hwButton');
  });

  it('names a native component after the page, example and language', () => {
    expect(nativeClassName('button', 'disabled-tab', 'ar')).toBe('ButtonDisabledTabAr');
    const wrapped = wrapAngular('template: `<button hwButton>Go</button>`', guideDir, { className: 'ButtonPrimaryEn', selector: 'guide-example-button-primary' });
    expect(wrapped.source).toContain('export class ButtonPrimaryEn {}');
    expect(wrapped.source).toContain("selector: 'guide-example-button-primary'");
  });

  it('rewrites the class name and selector of a module form', () => {
    const code = "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-x',\n  template: `<p>x</p>`,\n})\nexport class Mine {\n  static create() { return new Mine(); }\n}";
    const wrapped = wrapAngular(code, guideDir);
    expect(wrapped.form).toBe('module');
    expect(wrapped.source).toContain("selector: 'guide-example'");
    expect(wrapped.source).toContain('export class Example {');
    expect(wrapped.source).toContain('return new Example();');
    expect(wrapped.lineOffset).toBe(0);
  });

  it('adds a selector to a module form without one', () => {
    const wrapped = wrapAngular("import { Component } from '@angular/core';\n@Component({ template: `<p>x</p>` })\nexport class Mine {}", guideDir);
    expect(wrapped.source).toContain("selector: 'guide-example',");
  });

  it('reports an Angular fragment that is not one template property', () => {
    const wrapped = wrapAngular('selector: `x`', guideDir);
    expect(wrapped.source).toBeNull();
    expect(wrapped.errors[0].message).toMatch(/exactly one property/);
  });

  it('reports an hw- element that matches no component', () => {
    const wrapped = wrapAngular('template: `\n<hw-buton>Go</hw-buton>`', guideDir);
    expect(wrapped.unknown).toEqual([{ name: 'hw-buton', line: 2 }]);
  });
});
