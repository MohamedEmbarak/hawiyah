import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileAngular } from '../compile-angular.mjs';
import { wrapAngular } from '../wrap.mjs';
import { guideDir, workRoot } from './helpers.mjs';

describe('compileAngular', () => {
  it('compiles frame modules with ngc and reports a missing required input as NG8008 (HWC-A1)', async () => {
    const good = wrapAngular('template: `<button hwButton variant="primary">Go</button>`', guideDir);
    const bad = wrapAngular('template: `\n  <hw-tabs label="S">\n    <hw-tab value="a">A</hw-tab>\n  </hw-tabs>\n`', guideDir);
    const results = await compileAngular([
      { key: 'a/en/good', dir: 'a/en/good', source: good.source },
      { key: 'a/en/bad', dir: 'a/en/bad', source: bad.source },
    ], { workDir: join(workRoot, 'angular'), fromDir: guideDir });

    const ok = results.get('a/en/good');
    expect(ok.diagnostics).toEqual([]);
    expect(ok.compiled.host).toBe('<guide-example></guide-example>');
    expect(Object.keys(ok.compiled.modules)).toEqual(['main.js', 'example.component.js']);
    expect(ok.compiled.modules['main.js']).toContain("from 'hawiyah-project/example.component.js'");
    expect(ok.compiled.modules['main.js']).toContain('bootstrapApplication(Example)');
    expect(ok.compiled.modules['example.component.js']).toContain('ɵɵdefineComponent');
    expect(ok.compiled.modules['example.component.js']).not.toContain('ɵɵngDeclare');

    const failed = results.get('a/en/bad');
    expect(failed.compiled).toBeNull();
    expect(failed.diagnostics).toHaveLength(1);
    expect(failed.diagnostics[0].message).toMatch(/^NG8008: Required input 'label'/);
    expect(failed.diagnostics[0].line - bad.lineOffset).toBe(3);
  });
});
