import { describe, expect, it } from 'vitest';
import { angularImports } from '../angular-imports.mjs';
import { angularDeclarations } from '../exports.mjs';
import { guideDir } from './helpers.mjs';

describe('angularDeclarations', () => {
  it('reads selectors and required inputs from the installed declarations', () => {
    const declarations = angularDeclarations(guideDir);
    const button = declarations.find((d) => d.className === 'HwButtonDirective');
    expect(button).toMatchObject({ kind: 'directive', selector: 'button[hwButton],a[hwButton]' });
    const tab = declarations.find((d) => d.className === 'HwTabComponent');
    expect(tab).toMatchObject({ kind: 'component', selector: 'hw-tab' });
    expect(tab.requiredInputs.sort()).toEqual(['label', 'value']);
  });
});

describe('angularImports', () => {
  it('matches components, attribute directives and nested control flow', () => {
    const result = angularImports('<hw-tabs label="S">\n  <hw-tab value="a" label="A">x</hw-tab>\n</hw-tabs>\n@if (true) {\n  <a hwLink href="#a">l</a>\n}\n<button hwButton>Go</button>', guideDir);
    expect(result.classes).toEqual(['HwButtonDirective', 'HwLinkDirective', 'HwTabComponent', 'HwTabsComponent']);
    expect(result.unknown).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it('does not import a directive whose element does not match', () => {
    expect(angularImports('<span hwButton>x</span>', guideDir).classes).toEqual([]);
  });

  it('reports hw- elements that match no component and template errors', () => {
    const result = angularImports('<p>\n<hw-nope></hw-nope></p>', guideDir);
    expect(result.unknown).toEqual([{ tag: 'hw-nope', line: 2 }]);
    const broken = angularImports('<p>x</p>\n</span>', guideDir);
    expect(broken.errors.map((e) => e.line)).toEqual([2]);
  });
});
