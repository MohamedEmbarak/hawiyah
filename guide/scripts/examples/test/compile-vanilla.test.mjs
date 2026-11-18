import { describe, expect, it } from 'vitest';
import { compileVanilla } from '../compile-vanilla.mjs';
import { guideDir } from './helpers.mjs';

describe('compileVanilla', () => {
  it('compiles a valid fragment into the app host and the enhance entry', () => {
    const html = '<div class="hw-inline"><button class="hw-button" type="button" data-variant="primary">Go</button></div>';
    const { findings, compiled } = compileVanilla(html, guideDir);
    expect(findings).toEqual([]);
    expect(compiled.host).toBe(`<div id="app">${html}</div>`);
    expect(compiled.entry).toBe('main.js');
    expect(compiled.modules['main.js']).toBe("import { enhance } from '@hawiyah/vanilla';\nenhance(document.getElementById('app'));\n");
  });

  it('reports parse errors (HWC-V1)', () => {
    const { findings, compiled } = compileVanilla('<p class="hw-type">x</p>\n<button class="hw-button" type="button" type="submit">Go</button>', guideDir);
    expect(compiled).toBeNull();
    expect(findings.map((f) => f.code)).toEqual(['HWC-V1']);
    expect(findings[0].line).toBe(2);
  });

  it('reports hw- classes missing from the installed stylesheet (HWC-V2)', () => {
    const { findings } = compileVanilla('<p class="hw-type hw-typo">x</p>', guideDir);
    expect(findings).toEqual([{ code: 'HWC-V2', line: 1, message: 'class hw-typo is not defined in @hawiyah/styles/dist/styles.css' }]);
  });

  it('reports data-hw values that enhance() does not select (HWC-V3)', () => {
    const ok = compileVanilla('<div class="hw-tabs" data-hw="tabs"></div>', guideDir);
    expect(ok.findings).toEqual([]);
    const { findings } = compileVanilla('<div class="hw-tabs" data-hw="tab-set"></div>', guideDir);
    expect(findings.map((f) => f.code)).toEqual(['HWC-V3']);
  });
});
