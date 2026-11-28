import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileReact } from '../compile-react.mjs';
import { wrapReact } from '../wrap.mjs';
import { guideDir, workRoot } from './helpers.mjs';

describe('compileReact', () => {
  it('type-checks all examples in one program and transforms the clean ones', async () => {
    const good = wrapReact('<Button variant="primary">Go</Button>', guideDir);
    const bad = wrapReact('<Button variant="huge">Go</Button>', guideDir);
    const results = await compileReact([
      { key: 'r/en/good', dir: 'r/en/good', source: good.source },
      { key: 'r/en/bad', dir: 'r/en/bad', source: bad.source },
    ], { workDir: join(workRoot, 'react') });

    const ok = results.get('r/en/good');
    expect(ok.diagnostics).toEqual([]);
    expect(ok.compiled.host).toBe('<div id="app"></div>');
    expect(Object.keys(ok.compiled.modules)).toEqual(['main.js', 'Example.js']);
    expect(ok.compiled.modules['main.js']).toContain('from "hawiyah-project/Example.js"');
    expect(ok.compiled.modules['main.js']).toContain('from "react-dom/client"');
    expect(ok.compiled.modules['Example.js']).toContain('from "react/jsx-runtime"');
    expect(ok.compiled.modules['Example.js']).toContain('from "@hawiyah/react"');

    const failed = results.get('r/en/bad');
    expect(failed.compiled).toBeNull();
    expect(failed.diagnostics).toHaveLength(1);
    expect(failed.diagnostics[0].file).toBe('Example.tsx');
    expect(failed.diagnostics[0].message).toMatch(/^TS2322: /);
    expect(failed.diagnostics[0].line - bad.lineOffset).toBe(1);
  });
});
