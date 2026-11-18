import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { classicBundle, runtimeShim } from '../classic.mjs';

describe('classicBundle', () => {
  it('bundles project modules and reads bare imports from HawiyahRuntime.modules', async () => {
    const compiled = {
      entry: 'main.js',
      modules: {
        'main.js': "import { render } from 'fake-lib';\nimport label, { suffix } from 'hawiyah-project/Example.js';\nrender(label + suffix);\n",
        'Example.js': "import def from 'fake-default';\nexport const suffix = '!';\nexport default def;\n",
      },
    };
    const code = await classicBundle(compiled);
    expect(code).not.toMatch(/\bimport\b/);
    const calls = [];
    const globalThis = {
      HawiyahRuntime: {
        modules: {
          'fake-lib': Object.freeze({ render: (value) => calls.push(value) }),
          'fake-default': Object.freeze({ default: 'Go' }),
        },
      },
    };
    globalThis.globalThis = globalThis;
    runInNewContext(code, globalThis);
    expect(calls).toEqual(['Go!']);
  });

  it('fails clearly when the runtime lacks a module', async () => {
    const code = await classicBundle({ entry: 'main.js', modules: { 'main.js': "import { x } from 'missing';\nx();\n" } });
    const context = { HawiyahRuntime: { modules: {} } };
    context.globalThis = context;
    expect(() => runInNewContext(code, context)).toThrow('HawiyahRuntime has no module missing');
  });

  it('refuses a project module that is not in the payload', async () => {
    await expect(classicBundle({ entry: 'main.js', modules: { 'main.js': "import 'hawiyah-project/Other.js';\n" } })).rejects.toThrow(/Other\.js is not in the payload/);
  });

  it('names the specifier in the shim', () => {
    expect(runtimeShim('@hawiyah/vue')).toContain('runtime.modules["@hawiyah/vue"]');
  });
});
