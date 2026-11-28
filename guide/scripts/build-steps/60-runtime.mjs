// Writes <out>/browser/runtime/ (editor.runtimeFiles): the published, linked and
// bundled files the example frames load, runtime/import-map.json,
// runtime/manifest.json and the fallback bundles. Runs after the registry check
// (step 05) has verified node_modules; step 90 compares the result with the
// verified packages (HWREG-R8).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { format } from '../registry-check/messages.mjs';
import { checkMetafile } from '../registry-check/resolved.mjs';
import { buildRuntime } from '../runtime/build-runtime.mjs';

export default {
  id: '60-runtime',
  configurations: ['production', 'development'],
  generate: false,
  preview: true,
  async run(ctx) {
    const browserDir = join(ctx.guideDir, ctx.browserDir);
    if (!existsSync(browserDir)) throw new Error(`${ctx.browserDir} does not exist; build step 40-angular writes it`);
    const result = await buildRuntime({ guideDir: ctx.guideDir, runtimeDir: join(browserDir, 'runtime') });
    // What each esbuild run read (HWREG-R6): @hawiyah inputs only from the verified packages.
    const findings = result.metafiles.flatMap((item) => checkMetafile(item.metafile, { ...item, guideDir: ctx.guideDir }));
    if (findings.length > 0) throw new Error(findings.map(([key, params]) => format(key, params).message).join('\n'));
    const counts = { published: 0, linked: 0, bundled: 0 };
    for (const entry of result.entries) counts[entry.source] += 1;
    ctx.log(
      `runtime: ${result.entries.length} files (${counts.published} published, ${counts.linked} linked, ${counts.bundled} bundled), ` +
        `${Object.keys(result.importMap.imports).length} import map entries, ${(result.bytes / 1024 / 1024).toFixed(1)} MB in ${ctx.browserDir}/runtime/`,
    );
  },
};
