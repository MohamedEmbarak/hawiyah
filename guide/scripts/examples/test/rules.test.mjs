import { describe, expect, it } from 'vitest';
import { angularRules, htmlRules, reactRules, unknownFindings, vueRules } from '../rules.mjs';
import { wrapAngular, wrapReact, wrapVue } from '../wrap.mjs';
import { guideDir } from './helpers.mjs';

const codes = (findings) => findings.map((f) => f.code);

describe('HTML rules', () => {
  it('accepts hw- classes and plain attributes', () => {
    expect(htmlRules('<div class="hw-inline"><button class="hw-button" type="button" aria-label="Add">Add</button></div>')).toEqual([]);
  });

  it('refuses script, style, inline handlers, style attributes, foreign classes and raw colours', () => {
    const findings = htmlRules([
      '<script>alert(1)</script>',
      '<style>p{}</style>',
      '<button class="hw-button" onclick="go()">Go</button>',
      '<p style="margin: 0">x</p>',
      '<p class="hw-type lead">x</p>',
      '<svg><rect fill="#ff0000"></rect><circle stroke="red"></circle></svg>',
    ].join('\n'));
    expect(codes(findings)).toEqual(['HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6']);
    expect(findings.map((f) => f.line)).toEqual([1, 2, 3, 4, 5, 6, 6]);
    expect(findings[4].message).toContain('"lead"');
  });

  it('does not read text or references as colours', () => {
    expect(htmlRules('<a class="hw-link" href="#add" aria-label="Red team">Gold</a>')).toEqual([]);
  });

  // The props of a layout primitive are custom properties on the element, which the
  // React, Vue and Angular adapters write into a style attribute.
  it('accepts a style attribute whose declarations all set custom properties named --hw-*', () => {
    expect(htmlRules('<div class="hw-stack" style="--hw-layout-gap: var(--hw-space-2, 0.5rem)"><p>x</p></div>')).toEqual([]);
    expect(htmlRules('<div class="hw-stack" style="--hw-layout-align:center ; --hw-layout-justify: space-between;"><p>x</p></div>')).toEqual([]);
  });

  it('refuses any other declaration, a comment, a declaration list it cannot read, an empty attribute and a raw colour in a custom property', () => {
    const cases = [
      ['--hw-layout-gap: 1rem; margin: 0', 'style attribute declares margin; in the html block a style attribute only sets custom properties named --hw-* (the props of a layout primitive), otherwise use hw- classes and documented variants'],
      ['--gap: 1rem', 'style attribute declares --gap; in the html block a style attribute only sets custom properties named --hw-* (the props of a layout primitive), otherwise use hw- classes and documented variants'],
      ['--HW-gap: 1rem', 'style attribute declares --HW-gap; in the html block a style attribute only sets custom properties named --hw-* (the props of a layout primitive), otherwise use hw- classes and documented variants'],
      ['/* note */ --hw-layout-gap: 1rem', 'style attribute holds a comment, not a declaration; in the html block a style attribute only sets custom properties named --hw-* (the props of a layout primitive), otherwise use hw- classes and documented variants'],
      ['--hw-layout-gap: 1rem} p {color: red', 'style attribute is not a list of declarations; in the html block a style attribute only sets custom properties named --hw-* (the props of a layout primitive), otherwise use hw- classes and documented variants'],
      ['', 'style attribute declares nothing; in the html block a style attribute only sets custom properties named --hw-* (the props of a layout primitive), otherwise use hw- classes and documented variants'],
      ['--hw-layout-gap: 1rem; --hw-tint: #b54708', 'raw colour #b54708 in --hw-tint; use the documented variants'],
      ['--hw-tint: red', 'raw colour red in --hw-tint; use the documented variants'],
    ];
    for (const [value, message] of cases) {
      expect(htmlRules(`<div class="hw-stack"\n  style="${value}"><p>x</p></div>`), value).toEqual([{ code: 'HWC-LIVE6', line: 2, message }]);
    }
  });

  it('keeps refusing a style attribute with custom properties in the React, Vue and Angular blocks', () => {
    const react = wrapReact('<div className="hw-stack" style={{ "--hw-layout-gap": "1rem" }}>x</div>', guideDir).source;
    expect(codes(reactRules(react, 'fragment'))).toEqual(['HWC-LIVE6']);
    const vue = wrapVue('<div class="hw-stack" style="--hw-layout-gap: 1rem">x</div>', guideDir).source;
    expect(codes(vueRules(vue, 'fragment'))).toEqual(['HWC-LIVE6']);
    const angular = wrapAngular('template: `<div class="hw-stack" style="--hw-layout-gap: 1rem">x</div>`', guideDir).source;
    expect(codes(angularRules(angular, 'fragment'))).toEqual(['HWC-LIVE6']);
  });
});

describe('React rules', () => {
  it('refuses the style prop, foreign class names and <style>', () => {
    const { source } = wrapReact('<>\n  <p style={{ margin: 0 }}>x</p>\n  <p className="hw-type lead">x</p>\n  <style>{"p{}"}</style>\n</>', guideDir);
    expect(codes(reactRules(source, 'fragment'))).toEqual(['HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6']);
  });

  it('allows the adapter, core and react imports and refuses others', () => {
    const code = "import { useState } from 'react';\nimport { Button } from '@hawiyah/react';\nimport { formatCalendarDate } from '@hawiyah/core';\nimport chunk from 'lodash/chunk';\n\nexport default function Example() {\n  return <Button>{String(useState(0)[0])}</Button>;\n}";
    const findings = reactRules(wrapReact(code, guideDir).source, 'module');
    expect(codes(findings)).toEqual(['HWC-LIVE5']);
    expect(findings[0].line).toBe(4);
    expect(findings[0].message).toContain("'lodash/chunk'");
  });

  it('refuses raw colours in strings', () => {
    const code = "import { Button } from '@hawiyah/react';\nconst tint = 'rgb(1 2 3)';\nexport default function Example() { return <Button aria-label={tint}>x</Button>; }";
    expect(codes(reactRules(code, 'module'))).toEqual(['HWC-LIVE6']);
  });
});

describe('Vue rules', () => {
  it('refuses :style, style, foreign classes and <style> blocks', () => {
    const { source } = wrapVue('<p :style="{ margin: 0 }">x</p>\n<p style="margin: 0">x</p>\n<p class="lead">x</p>', guideDir);
    expect(codes(vueRules(source, 'fragment'))).toEqual(['HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6']);
    const module = "<script setup lang=\"ts\">\nimport { Button } from '@hawiyah/vue';\nimport { ref } from 'vue';\nimport { computed } from '@vue/reactivity';\n</script>\n\n<template>\n  <Button>x</Button>\n</template>\n\n<style>\np { margin: 0; }\n</style>\n";
    expect(codes(vueRules(module, 'module')).sort()).toEqual(['HWC-LIVE5', 'HWC-LIVE6']);
  });
});

describe('Angular rules', () => {
  it('refuses styles metadata, style bindings and foreign classes', () => {
    const code = "import { Component } from '@angular/core';\nimport { map } from 'rxjs';\n\n@Component({\n  selector: 'x',\n  styles: ['p { margin: 0 }'],\n  template: `\n    <p [style.margin]=\"0\">x</p>\n    <p [class.lead]=\"true\" class=\"hw-type extra\">x</p>\n  `,\n})\nexport class X {}\n";
    const findings = angularRules(wrapAngular(code, guideDir).source, 'module');
    expect(codes(findings).sort()).toEqual(['HWC-LIVE5', 'HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6', 'HWC-LIVE6']);
    const margin = findings.find((f) => f.message.includes('style.margin'));
    expect(margin.line).toBe(8);
  });

  it('accepts a clean fragment', () => {
    const { source } = wrapAngular('template: `<button hwButton variant="primary" class="hw-extra-unused">Go</button>`', guideDir);
    expect(angularRules(source, 'fragment')).toEqual([]);
  });
});

describe('unknownFindings', () => {
  it('reports HWC-LIVE4 with the block line', () => {
    expect(unknownFindings('vue', [{ name: 'Buton', line: 3 }])).toEqual([{ code: 'HWC-LIVE4', line: 3, message: '<Buton> is not an export of @hawiyah/vue' }]);
  });
});
