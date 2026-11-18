import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileVue, parseTscOutput, scopeId } from '../compile-vue.mjs';
import { wrapVue } from '../wrap.mjs';
import { guideDir, workRoot } from './helpers.mjs';

describe('parseTscOutput', () => {
  it('reads tsc and ngc diagnostics and skips code frames', () => {
    const output = [
      'a/Example.vue(3,5): error TS2322: Type A',
      '  is not B.',
      '',
      '\u001b[96msrc/x/example.component.ts\u001b[0m:\u001b[93m9\u001b[0m:\u001b[93m8\u001b[0m - \u001b[91merror\u001b[0m\u001b[90m NG8008: \u001b[0mRequired input',
      '',
      '9       <hw-tab value="one">One</hw-tab>',
      '         ~~~~~~',
    ].join('\n');
    expect(parseTscOutput(output)).toEqual([
      { path: 'a/Example.vue', line: 3, message: 'TS2322: Type A is not B.' },
      { path: 'src/x/example.component.ts', line: 9, message: 'NG8008: Required input' },
    ]);
  });
});

describe('compileVue', () => {
  it('compiles clean SFCs and reports vue-tsc errors per example (HWC-U1)', async () => {
    const good = wrapVue('<Button variant="primary">Go</Button>', guideDir);
    const bad = wrapVue('<Button size="huge">Go</Button>', guideDir);
    const results = await compileVue([
      { key: 'v/en/good', dir: 'v/en/good', source: good.source },
      { key: 'v/en/bad', dir: 'v/en/bad', source: bad.source },
    ], { workDir: join(workRoot, 'vue'), fromDir: guideDir });

    const ok = results.get('v/en/good');
    expect(ok.diagnostics).toEqual([]);
    expect(ok.compiled.modules['main.js']).toBe('import { createApp } from "vue";\nimport Example from "hawiyah-project/Example.js";\ncreateApp(Example).mount("#app");\n');
    expect(ok.compiled.modules['Example.js']).toContain('from "@hawiyah/vue"');
    expect(ok.compiled.modules['Example.js']).not.toContain(': string');

    const failed = results.get('v/en/bad');
    expect(failed.compiled).toBeNull();
    expect(failed.diagnostics.map((d) => d.file)).toEqual(['Example.vue']);
    expect(failed.diagnostics[0].line - bad.lineOffset).toBe(1);
  });

  it('derives a stable scope id from the group key', () => {
    expect(scopeId('button/en/primary')).toMatch(/^[0-9a-f]{8}$/);
    expect(scopeId('button/en/primary')).toBe(scopeId('button/en/primary'));
    expect(scopeId('button/ar/primary')).not.toBe(scopeId('button/en/primary'));
  });
});
